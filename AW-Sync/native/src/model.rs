use chrono::{DateTime, Utc};
use serde::{Deserialize, Deserializer, Serialize};
use std::collections::BTreeMap;

// 这一组常量决定同步客户端的“协议口径”。初学者可以先记住四个最重要的数：
// 1. 第一次只回溯 30 天，避免首次同步无限读取历史；
// 2. 增量同步向前重叠 2 秒，专门兜住 ActivityWatch 心跳更新边界；
// 3. 每批最多 2000 条，避免一次请求过大；
// 4. 后台默认每 10 分钟再同步一次。
pub const APP_NAME: &str = "AERTEX Watch Sync";
pub const CLOUD_ORIGIN: &str = "https://awd.qsseda.com";
pub const WATCH_ORIGIN: &str = "https://aw.qsseda.com";
pub const ACTIVITYWATCH_DOWNLOAD: &str = "https://activitywatch.net/downloads/";
pub const INITIAL_DAYS: i64 = 30;
pub const OVERLAP_SECONDS: i64 = 2;
pub const BATCH_SIZE: usize = 2_000;
pub const SYNC_INTERVAL_SECONDS: u64 = 10 * 60;

/// 本机 ActivityWatch 的连接位置。
/// 注意：虽然状态文件里保留了 host 字段，但真正访问时 origin() 固定使用 127.0.0.1，
/// 这样不会因为状态文件被篡改而把请求误发到远端主机。
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ActivityWatchEndpoint {
    pub host: String,
    pub port: u16,
}

impl ActivityWatchEndpoint {
    pub fn localhost(port: u16) -> Self {
        Self {
            host: "127.0.0.1".to_string(),
            port,
        }
    }

    pub fn origin(&self) -> String {
        format!("http://127.0.0.1:{}", self.port)
    }
}

/// 每个 Bucket 的增量同步进度。
/// timestamp 是“已经成功上传到云端的最后事件时间”，不是“最后尝试时间”。
#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq, Eq)]
pub struct BucketProgress {
    #[serde(default)]
    pub timestamp: String,
    #[serde(default)]
    pub synced_at: String,
}

/// 写入本地 state.json 的非敏感状态。
/// 设备令牌不会放在这里，而是由 Windows Credential Manager 单独保存。
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct PersistedState {
    #[serde(default = "state_version")]
    pub version: u32,
    #[serde(default)]
    pub activitywatch: Option<ActivityWatchEndpoint>,
    #[serde(default)]
    pub buckets: BTreeMap<String, BucketProgress>,
}

const fn state_version() -> u32 {
    1
}

impl Default for PersistedState {
    fn default() -> Self {
        Self {
            version: state_version(),
            activitywatch: None,
            buckets: BTreeMap::new(),
        }
    }
}

/// ActivityWatch /api/0/buckets/ 返回的 Bucket 元数据。
/// 某些第三方 watcher 会把可选字段返回为 null，所以这里统一把 null 兼容成空字符串。
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct BucketMetadata {
    #[serde(default, deserialize_with = "deserialize_nullable_string")]
    pub id: String,
    #[serde(
        default,
        rename = "type",
        deserialize_with = "deserialize_nullable_string"
    )]
    pub bucket_type: String,
    #[serde(default, deserialize_with = "deserialize_nullable_string")]
    pub client: String,
    #[serde(default, deserialize_with = "deserialize_nullable_string")]
    pub hostname: String,
    #[serde(default, deserialize_with = "deserialize_nullable_string")]
    pub name: String,
}

fn deserialize_nullable_string<'de, D>(deserializer: D) -> Result<String, D::Error>
where
    D: Deserializer<'de>,
{
    Ok(Option::<String>::deserialize(deserializer)?.unwrap_or_default())
}

/// ActivityWatch 的原始事件。data 保持开放 Map，是因为不同 watcher 的字段完全不同：
/// 窗口 watcher 常见 app/title，浏览器 watcher 常见 url/title，其他 watcher 还会带自己的字段。
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ActivityEvent {
    #[serde(default)]
    pub id: Option<i64>,
    pub timestamp: String,
    #[serde(default)]
    pub duration: f64,
    #[serde(default)]
    pub data: serde_json::Map<String, serde_json::Value>,
}

#[derive(Debug, Serialize)]
pub struct UploadBucket<'a> {
    pub id: &'a str,
    #[serde(rename = "type")]
    pub bucket_type: &'a str,
    pub client: &'a str,
    pub hostname: &'a str,
    pub name: &'a str,
}

#[derive(Debug, Serialize)]
pub struct UploadPayload<'a> {
    pub bucket: UploadBucket<'a>,
    pub events: &'a [ActivityEvent],
}

/// 首次同步从“现在往前 30 天”开始。
pub fn first_sync_start(now: DateTime<Utc>) -> DateTime<Utc> {
    now - chrono::Duration::days(INITIAL_DAYS)
}

/// 增量同步故意向前重叠 2 秒。
/// ActivityWatch 的 heartbeat 会在同一个事件上不断延长 duration；重叠读取后由云端去重，
/// 比严格从 last+ε 开始更不容易漏掉刚好跨边界更新的事件。
pub fn incremental_start(last: DateTime<Utc>) -> DateTime<Utc> {
    last - chrono::Duration::seconds(OVERLAP_SECONDS)
}

/// 把长事件数组切成固定大小的上传批次，返回的是切片范围而不是复制数据。
pub fn batch_ranges(length: usize) -> Vec<std::ops::Range<usize>> {
    (0..length)
        .step_by(BATCH_SIZE)
        .map(|start| start..usize::min(start + BATCH_SIZE, length))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;

    #[test]
    fn first_sync_starts_thirty_days_earlier() {
        let now = Utc.with_ymd_and_hms(2026, 10, 6, 12, 0, 0).unwrap();
        assert_eq!(
            first_sync_start(now),
            Utc.with_ymd_and_hms(2026, 9, 6, 12, 0, 0).unwrap()
        );
    }

    #[test]
    fn incremental_sync_overlaps_two_seconds() {
        let last = Utc.with_ymd_and_hms(2026, 10, 6, 12, 0, 0).unwrap();
        assert_eq!(
            incremental_start(last),
            Utc.with_ymd_and_hms(2026, 10, 6, 11, 59, 58).unwrap()
        );
    }

    #[test]
    fn events_are_split_into_two_thousand_event_batches() {
        assert_eq!(batch_ranges(0), Vec::<std::ops::Range<usize>>::new());
        assert_eq!(
            batch_ranges(4_001),
            vec![0..2_000, 2_000..4_000, 4_000..4_001]
        );
    }

    #[test]
    fn persisted_state_has_no_token_field() {
        let json = serde_json::to_string(&PersistedState::default()).unwrap();
        assert!(!json.to_ascii_lowercase().contains("token"));
        assert_eq!(
            serde_json::from_str::<PersistedState>(&json).unwrap(),
            PersistedState::default()
        );
    }

    #[test]
    fn bucket_metadata_accepts_null_optional_strings() {
        let bucket: BucketMetadata = serde_json::from_value(serde_json::json!({
            "id": null,
            "type": "currentwindow",
            "client": null,
            "hostname": "pc",
            "name": null
        }))
        .unwrap();

        assert_eq!(bucket.id, "");
        assert_eq!(bucket.bucket_type, "currentwindow");
        assert_eq!(bucket.client, "");
        assert_eq!(bucket.hostname, "pc");
        assert_eq!(bucket.name, "");
    }
}
