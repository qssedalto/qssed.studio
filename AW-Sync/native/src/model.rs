use chrono::{DateTime, Utc};
use serde::{Deserialize, Deserializer, Serialize};
use std::collections::BTreeMap;

pub const APP_NAME: &str = "AERTEX Watch Sync";
pub const EXE_NAME: &str = "AERTEX-Watch-Sync.exe";
pub const CLOUD_ORIGIN: &str = "https://awd.qsseda.com";
pub const WATCH_ORIGIN: &str = "https://aw.qsseda.com";
pub const ACTIVITYWATCH_DOWNLOAD: &str = "https://activitywatch.net/downloads/";
pub const INITIAL_DAYS: i64 = 30;
pub const OVERLAP_SECONDS: i64 = 2;
pub const BATCH_SIZE: usize = 2_000;
pub const SYNC_INTERVAL_SECONDS: u64 = 10 * 60;

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

#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq, Eq)]
pub struct BucketProgress {
    #[serde(default)]
    pub timestamp: String,
    #[serde(default)]
    pub synced_at: String,
}

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

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct BucketMetadata {
    #[serde(default, deserialize_with = "deserialize_nullable_string")]
    pub id: String,
    #[serde(default, rename = "type", deserialize_with = "deserialize_nullable_string")]
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

pub fn first_sync_start(now: DateTime<Utc>) -> DateTime<Utc> {
    now - chrono::Duration::days(INITIAL_DAYS)
}

pub fn incremental_start(last: DateTime<Utc>) -> DateTime<Utc> {
    last - chrono::Duration::seconds(OVERLAP_SECONDS)
}

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
