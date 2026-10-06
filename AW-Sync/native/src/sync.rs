use crate::activitywatch::{ActivityWatchClient, LocalApiErrorKind};
use crate::model::{
    ActivityEvent, ActivityWatchEndpoint, BucketMetadata, BucketProgress, CLOUD_ORIGIN,
    PersistedState, UploadBucket, UploadPayload, batch_ranges, first_sync_start, incremental_start,
};
use crate::state;
use chrono::{DateTime, Utc};
use reqwest::blocking::Client;
use reqwest::header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE};
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::time::Duration;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SyncErrorKind {
    ActivityWatchUnavailable,
    Unauthorized,
    Network,
    Cloud,
    State,
}

#[derive(Debug, Clone)]
pub struct SyncError {
    pub kind: SyncErrorKind,
    pub message: String,
}

impl std::fmt::Display for SyncError {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        formatter.write_str(&self.message)
    }
}

impl std::error::Error for SyncError {}

#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct SyncSummary {
    pub discovered_buckets: usize,
    pub uploaded_events: usize,
    pub successful_buckets: usize,
    pub failed_buckets: usize,
}

pub trait CloudUploader: Send + Sync {
    fn upload(
        &self,
        token: &str,
        bucket_id: &str,
        bucket: &BucketMetadata,
        events: &[ActivityEvent],
    ) -> Result<(), SyncError>;
}

#[derive(Clone)]
pub struct HttpCloudUploader {
    client: Client,
    origin: String,
}

impl HttpCloudUploader {
    pub fn new() -> Result<Self, reqwest::Error> {
        Ok(Self {
            client: Client::builder()
                .connect_timeout(Duration::from_secs(10))
                .timeout(Duration::from_secs(60))
                .build()?,
            origin: CLOUD_ORIGIN.to_string(),
        })
    }

    #[cfg(test)]
    fn with_origin(origin: String) -> Result<Self, reqwest::Error> {
        Ok(Self {
            client: Client::builder()
                .timeout(Duration::from_secs(2))
                .no_proxy()
                .build()?,
            origin,
        })
    }
}

impl CloudUploader for HttpCloudUploader {
    fn upload(
        &self,
        token: &str,
        bucket_id: &str,
        bucket: &BucketMetadata,
        events: &[ActivityEvent],
    ) -> Result<(), SyncError> {
        let payload = UploadPayload {
            bucket: UploadBucket {
                id: bucket_id,
                bucket_type: &bucket.bucket_type,
                client: &bucket.client,
                hostname: &bucket.hostname,
                name: &bucket.name,
            },
            events,
        };
        let response = self
            .client
            .post(format!("{}/api/sync", self.origin))
            .header(AUTHORIZATION, format!("Bearer {token}"))
            .header(CONTENT_TYPE, "application/json")
            .header(ACCEPT, "application/json")
            .json(&payload)
            .send()
            .map_err(|error| SyncError {
                kind: SyncErrorKind::Network,
                message: format!("Cloud upload failed: {error}"),
            })?;

        match response.status().as_u16() {
            200..=299 => Ok(()),
            401 | 403 => Err(SyncError {
                kind: SyncErrorKind::Unauthorized,
                message: "The device token is invalid or expired.".to_string(),
            }),
            status => Err(SyncError {
                kind: SyncErrorKind::Cloud,
                message: format!("Cloud upload returned HTTP {status}."),
            }),
        }
    }
}

pub struct SyncEngine<U: CloudUploader> {
    activitywatch: ActivityWatchClient,
    uploader: U,
    state_path: PathBuf,
    state: Arc<Mutex<PersistedState>>,
}

impl<U: CloudUploader> SyncEngine<U> {
    pub fn new(
        activitywatch: ActivityWatchClient,
        uploader: U,
        state_path: PathBuf,
        state: Arc<Mutex<PersistedState>>,
    ) -> Self {
        Self {
            activitywatch,
            uploader,
            state_path,
            state,
        }
    }

    pub fn run_once(
        &self,
        token: &str,
        endpoint: &ActivityWatchEndpoint,
    ) -> Result<SyncSummary, SyncError> {
        let buckets = self
            .activitywatch
            .buckets(endpoint)
            .map_err(|error| SyncError {
                kind: match error.kind {
                    LocalApiErrorKind::Unavailable | LocalApiErrorKind::InvalidResponse => {
                        SyncErrorKind::ActivityWatchUnavailable
                    }
                },
                message: error.message,
            })?;
        let mut summary = SyncSummary {
            discovered_buckets: buckets.len(),
            ..SyncSummary::default()
        };
        let mut first_failure = None;

        for (bucket_id, bucket) in buckets {
            match self.sync_bucket(token, endpoint, &bucket_id, &bucket) {
                Ok(uploaded) => {
                    summary.uploaded_events += uploaded;
                    summary.successful_buckets += 1;
                }
                Err(error) if error.kind == SyncErrorKind::Unauthorized => return Err(error),
                Err(error) => {
                    summary.failed_buckets += 1;
                    first_failure.get_or_insert(error);
                }
            }
        }

        if summary.failed_buckets > 0 {
            return Err(SyncError {
                kind: first_failure
                    .as_ref()
                    .map(|error| error.kind.clone())
                    .unwrap_or(SyncErrorKind::Network),
                message: first_failure.map(|error| error.message).unwrap_or_else(|| {
                    format!(
                        "{} ActivityWatch bucket(s) will retry later.",
                        summary.failed_buckets
                    )
                }),
            });
        }
        Ok(summary)
    }

    fn sync_bucket(
        &self,
        token: &str,
        endpoint: &ActivityWatchEndpoint,
        bucket_id: &str,
        bucket: &BucketMetadata,
    ) -> Result<usize, SyncError> {
        let last = self
            .state
            .lock()
            .map_err(lock_error)?
            .buckets
            .get(bucket_id)
            .map(|progress| progress.timestamp.clone())
            .unwrap_or_default();
        let start = sync_start(&last, Utc::now());
        let events = self
            .activitywatch
            .events(endpoint, bucket_id, &start.to_rfc3339())
            .map_err(|error| SyncError {
                kind: SyncErrorKind::ActivityWatchUnavailable,
                message: error.message,
            })?;
        if events.is_empty() {
            return Ok(0);
        }

        for range in batch_ranges(events.len()) {
            self.uploader
                .upload(token, bucket_id, bucket, &events[range])?;
        }

        let timestamp = max_timestamp(&events, &last);
        let mut current = self.state.lock().map_err(lock_error)?;
        current.buckets.insert(
            bucket_id.to_string(),
            BucketProgress {
                timestamp,
                synced_at: Utc::now().to_rfc3339(),
            },
        );
        state::save_atomic(&self.state_path, &current).map_err(|error| SyncError {
            kind: SyncErrorKind::State,
            message: format!("Unable to save sync progress: {error}"),
        })?;
        Ok(events.len())
    }
}

fn lock_error<T>(_: std::sync::PoisonError<T>) -> SyncError {
    SyncError {
        kind: SyncErrorKind::State,
        message: "Sync state lock was poisoned.".to_string(),
    }
}

pub fn sync_start(last: &str, now: DateTime<Utc>) -> DateTime<Utc> {
    DateTime::parse_from_rfc3339(last)
        .map(|value| incremental_start(value.with_timezone(&Utc)))
        .unwrap_or_else(|_| first_sync_start(now))
}

pub fn max_timestamp(events: &[ActivityEvent], fallback: &str) -> String {
    events.iter().fold(fallback.to_string(), |best, event| {
        if event.timestamp > best {
            event.timestamp.clone()
        } else {
            best
        }
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;
    use std::io::{Read, Write};
    use std::net::TcpListener;
    use std::thread;

    #[test]
    fn invalid_or_missing_timestamp_uses_thirty_day_window() {
        let now = Utc.with_ymd_and_hms(2026, 10, 6, 12, 0, 0).unwrap();
        assert_eq!(
            sync_start("", now),
            Utc.with_ymd_and_hms(2026, 9, 6, 12, 0, 0).unwrap()
        );
    }

    #[test]
    fn maximum_timestamp_preserves_newest_event() {
        let event = |timestamp: &str| ActivityEvent {
            id: None,
            timestamp: timestamp.to_string(),
            duration: 1.0,
            data: serde_json::Map::new(),
        };
        assert_eq!(
            max_timestamp(
                &[event("2026-10-06T10:00:00Z"), event("2026-10-06T11:00:00Z")],
                ""
            ),
            "2026-10-06T11:00:00Z"
        );
    }

    fn uploader_for_status(status: u16) -> HttpCloudUploader {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let address = listener.local_addr().unwrap();
        thread::spawn(move || {
            let (mut stream, _) = listener.accept().unwrap();
            let mut request = [0_u8; 8192];
            let _ = stream.read(&mut request);
            let reason = if status == 401 {
                "Unauthorized"
            } else {
                "Server Error"
            };
            let response = format!(
                "HTTP/1.1 {status} {reason}\r\nContent-Length: 2\r\nConnection: close\r\n\r\n{{}}"
            );
            stream.write_all(response.as_bytes()).unwrap();
        });
        HttpCloudUploader::with_origin(format!("http://{address}")).unwrap()
    }

    fn sample_bucket() -> BucketMetadata {
        BucketMetadata {
            id: "bucket".into(),
            bucket_type: "currentwindow".into(),
            client: "watcher".into(),
            hostname: "computer".into(),
            name: "Window".into(),
        }
    }

    fn sample_event() -> ActivityEvent {
        ActivityEvent {
            id: Some(1),
            timestamp: "2026-10-06T10:00:00Z".into(),
            duration: 1.0,
            data: serde_json::Map::new(),
        }
    }

    #[test]
    fn unauthorized_upload_is_classified_without_retrying() {
        let error = uploader_for_status(401)
            .upload(
                "awd1.test-device-token-value",
                "bucket",
                &sample_bucket(),
                &[sample_event()],
            )
            .unwrap_err();
        assert_eq!(error.kind, SyncErrorKind::Unauthorized);
    }

    #[test]
    fn network_failure_preserves_retryable_classification() {
        let uploader = HttpCloudUploader::with_origin("http://127.0.0.1:1".to_string()).unwrap();
        let error = uploader
            .upload(
                "awd1.test-device-token-value",
                "bucket",
                &sample_bucket(),
                &[sample_event()],
            )
            .unwrap_err();
        assert_eq!(error.kind, SyncErrorKind::Network);
    }
}
