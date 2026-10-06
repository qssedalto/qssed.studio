use crate::model::{ActivityEvent, ActivityWatchEndpoint, BucketMetadata};
use reqwest::blocking::Client;
use serde_json::Value;
use std::collections::{BTreeMap, HashSet, VecDeque};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex, mpsc};
use std::thread;
use std::time::Duration;

pub const DEFAULT_PORT: u16 = 5600;
pub const PRIORITY_PORTS: [u16; 2] = [5666, 5667];
pub const PORT_RANGE: std::ops::RangeInclusive<u16> = 5000..=6000;
pub const SCAN_CONCURRENCY: usize = 32;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ActivityWatchInfo {
    pub version: String,
    pub hostname: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ProbeResult {
    ActivityWatch(ActivityWatchInfo),
    OtherHttpService,
    Closed,
    Timeout,
    Error,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DiscoveryResult {
    pub endpoint: Option<ActivityWatchEndpoint>,
    pub default_port_was_other_service: bool,
    pub scanned_all_ports: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LocalApiErrorKind {
    Unavailable,
    InvalidResponse,
}

#[derive(Debug)]
pub struct LocalApiError {
    pub kind: LocalApiErrorKind,
    pub message: String,
}

impl std::fmt::Display for LocalApiError {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        formatter.write_str(&self.message)
    }
}

impl std::error::Error for LocalApiError {}

#[derive(Clone)]
pub struct ActivityWatchClient {
    http: Client,
    probe_http: Client,
}

impl ActivityWatchClient {
    pub fn new() -> Result<Self, reqwest::Error> {
        Ok(Self {
            http: Client::builder()
                .connect_timeout(Duration::from_secs(2))
                .timeout(Duration::from_secs(20))
                .no_proxy()
                .build()?,
            probe_http: Client::builder()
                .connect_timeout(Duration::from_millis(300))
                .timeout(Duration::from_millis(500))
                .no_proxy()
                .build()?,
        })
    }

    pub fn probe_port(&self, port: u16) -> ProbeResult {
        probe_port_with_client(&self.probe_http, port)
    }

    pub fn discover_with_progress(
        &self,
        last_port: Option<u16>,
        cancelled: Arc<AtomicBool>,
        on_default_port_occupied: Arc<dyn Fn() + Send + Sync>,
    ) -> DiscoveryResult {
        let client = self.clone();
        discover_with_probe_progress(
            last_port,
            cancelled,
            Arc::new(move |port| client.probe_port(port)),
            Some(on_default_port_occupied),
        )
    }

    pub fn buckets(
        &self,
        endpoint: &ActivityWatchEndpoint,
    ) -> Result<BTreeMap<String, BucketMetadata>, LocalApiError> {
        let url = format!("{}/api/0/buckets/", endpoint.origin());
        let response = self.http.get(url).send().map_err(local_transport_error)?;
        if !response.status().is_success() {
            return Err(LocalApiError {
                kind: LocalApiErrorKind::Unavailable,
                message: format!("ActivityWatch returned HTTP {}", response.status()),
            });
        }
        let body = response.text().map_err(local_transport_error)?;
        let mut buckets: BTreeMap<String, BucketMetadata> =
            serde_json::from_str(&body).map_err(|error| LocalApiError {
                kind: LocalApiErrorKind::InvalidResponse,
                message: format!("ActivityWatch returned invalid bucket data: {error}"),
            })?;
        for (id, bucket) in &mut buckets {
            bucket.id.clone_from(id);
        }
        Ok(buckets)
    }

    pub fn events(
        &self,
        endpoint: &ActivityWatchEndpoint,
        bucket_id: &str,
        start: &str,
    ) -> Result<Vec<ActivityEvent>, LocalApiError> {
        let encoded: String = url::form_urlencoded::byte_serialize(bucket_id.as_bytes()).collect();
        let url = format!("{}/api/0/buckets/{encoded}/events", endpoint.origin());
        let response = self
            .http
            .get(url)
            .query(&[("start", start), ("limit", "-1")])
            .send()
            .map_err(local_transport_error)?;
        if !response.status().is_success() {
            return Err(LocalApiError {
                kind: LocalApiErrorKind::Unavailable,
                message: format!("ActivityWatch returned HTTP {}", response.status()),
            });
        }
        let body = response.text().map_err(local_transport_error)?;
        serde_json::from_str(&body).map_err(|error| LocalApiError {
            kind: LocalApiErrorKind::InvalidResponse,
            message: format!("ActivityWatch returned invalid event data: {error}"),
        })
    }
}

fn local_transport_error(error: reqwest::Error) -> LocalApiError {
    LocalApiError {
        kind: LocalApiErrorKind::Unavailable,
        message: format!("ActivityWatch is unavailable: {error}"),
    }
}

fn probe_port_with_client(client: &Client, port: u16) -> ProbeResult {
    let origin = format!("http://127.0.0.1:{port}");
    let info_response = match client.get(format!("{origin}/api/0/info")).send() {
        Ok(response) => response,
        Err(error) if error.is_timeout() => return ProbeResult::Timeout,
        Err(error) if error.is_connect() => return ProbeResult::Closed,
        Err(_) => return ProbeResult::Error,
    };
    if !info_response.status().is_success() {
        return ProbeResult::OtherHttpService;
    }
    let info: Value = match info_response.json() {
        Ok(value) => value,
        Err(_) => return ProbeResult::OtherHttpService,
    };
    let Some(info) = activitywatch_info(&info) else {
        return ProbeResult::OtherHttpService;
    };

    let buckets_response = match client.get(format!("{origin}/api/0/buckets/")).send() {
        Ok(response) => response,
        Err(error) if error.is_timeout() => return ProbeResult::Timeout,
        Err(error) if error.is_connect() => return ProbeResult::Closed,
        Err(_) => return ProbeResult::Error,
    };
    if !buckets_response.status().is_success() {
        return ProbeResult::OtherHttpService;
    }
    match buckets_response.json::<Value>() {
        Ok(Value::Object(_)) => ProbeResult::ActivityWatch(info),
        _ => ProbeResult::OtherHttpService,
    }
}

fn activitywatch_info(value: &Value) -> Option<ActivityWatchInfo> {
    let object = value.as_object()?;
    let version = object.get("version")?.as_str()?.trim();
    let hostname = object
        .get("hostname")
        .and_then(Value::as_str)
        .unwrap_or("")
        .trim();
    let has_identity_marker = object.get("testing").is_some()
        || object.get("device_id").is_some()
        || object
            .get("server")
            .and_then(Value::as_str)
            .is_some_and(|server| server.to_ascii_lowercase().contains("activitywatch"));
    if version.is_empty() || (hostname.is_empty() && !has_identity_marker) {
        return None;
    }
    Some(ActivityWatchInfo {
        version: version.to_string(),
        hostname: hostname.to_string(),
    })
}

#[cfg(test)]
pub fn discover_with_probe(
    last_port: Option<u16>,
    cancelled: Arc<AtomicBool>,
    probe: Arc<dyn Fn(u16) -> ProbeResult + Send + Sync>,
) -> DiscoveryResult {
    discover_with_probe_progress(last_port, cancelled, probe, None)
}

fn discover_with_probe_progress(
    last_port: Option<u16>,
    cancelled: Arc<AtomicBool>,
    probe: Arc<dyn Fn(u16) -> ProbeResult + Send + Sync>,
    on_default_port_occupied: Option<Arc<dyn Fn() + Send + Sync>>,
) -> DiscoveryResult {
    let mut tried = HashSet::new();
    let mut default_port_was_other_service = false;
    let mut priority = Vec::new();
    if let Some(port) = last_port.filter(|port| PORT_RANGE.contains(port)) {
        priority.push(port);
    }
    priority.push(DEFAULT_PORT);
    priority.extend(PRIORITY_PORTS);

    for port in priority {
        if cancelled.load(Ordering::Relaxed) || !tried.insert(port) {
            continue;
        }
        match probe(port) {
            ProbeResult::ActivityWatch(_) => {
                return DiscoveryResult {
                    endpoint: Some(ActivityWatchEndpoint::localhost(port)),
                    default_port_was_other_service,
                    scanned_all_ports: false,
                };
            }
            ProbeResult::OtherHttpService if port == DEFAULT_PORT => {
                default_port_was_other_service = true;
                if let Some(callback) = &on_default_port_occupied {
                    callback();
                }
            }
            _ => {}
        }
    }

    let remaining = PORT_RANGE
        .filter(|port| !tried.contains(port))
        .collect::<Vec<_>>();
    let endpoint = scan_ports_with_probe(&remaining, SCAN_CONCURRENCY, cancelled, probe);
    DiscoveryResult {
        endpoint,
        default_port_was_other_service,
        scanned_all_ports: true,
    }
}

fn scan_ports_with_probe(
    ports: &[u16],
    concurrency: usize,
    cancelled: Arc<AtomicBool>,
    probe: Arc<dyn Fn(u16) -> ProbeResult + Send + Sync>,
) -> Option<ActivityWatchEndpoint> {
    if ports.is_empty() || cancelled.load(Ordering::Relaxed) {
        return None;
    }
    let queue = Arc::new(Mutex::new(VecDeque::from(ports.to_vec())));
    let found = Arc::new(AtomicBool::new(false));
    let (sender, receiver) = mpsc::channel();
    let worker_count = usize::min(concurrency.max(1), ports.len());
    let mut workers = Vec::with_capacity(worker_count);

    for _ in 0..worker_count {
        let queue = Arc::clone(&queue);
        let found = Arc::clone(&found);
        let cancelled = Arc::clone(&cancelled);
        let probe = Arc::clone(&probe);
        let sender = sender.clone();
        workers.push(thread::spawn(move || {
            loop {
                if found.load(Ordering::Acquire) || cancelled.load(Ordering::Relaxed) {
                    break;
                }
                let port = queue.lock().ok().and_then(|mut queue| queue.pop_front());
                let Some(port) = port else { break };
                if matches!(probe(port), ProbeResult::ActivityWatch(_)) {
                    if !found.swap(true, Ordering::AcqRel) {
                        let _ = sender.send(port);
                    }
                    break;
                }
            }
        }));
    }
    drop(sender);
    let result = receiver.recv().ok().map(ActivityWatchEndpoint::localhost);
    found.store(true, Ordering::Release);
    for worker in workers {
        let _ = worker.join();
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicUsize, Ordering};

    fn synthetic_probe(
        found_port: Option<u16>,
        other_http: Option<u16>,
        visited: Arc<Mutex<Vec<u16>>>,
    ) -> Arc<dyn Fn(u16) -> ProbeResult + Send + Sync> {
        Arc::new(move |port| {
            visited.lock().unwrap().push(port);
            if Some(port) == found_port {
                ProbeResult::ActivityWatch(ActivityWatchInfo {
                    version: "0.13.2".to_string(),
                    hostname: "test".to_string(),
                })
            } else if Some(port) == other_http {
                ProbeResult::OtherHttpService
            } else {
                ProbeResult::Closed
            }
        })
    }

    #[test]
    fn default_port_is_used_without_full_scan() {
        let visited = Arc::new(Mutex::new(Vec::new()));
        let result = discover_with_probe(
            None,
            Arc::new(AtomicBool::new(false)),
            synthetic_probe(Some(5600), None, Arc::clone(&visited)),
        );
        assert_eq!(result.endpoint.unwrap().port, 5600);
        assert!(!result.scanned_all_ports);
        assert_eq!(*visited.lock().unwrap(), vec![5600]);
    }

    #[test]
    fn closed_default_falls_back_to_priority_port() {
        for expected in [5666, 5667] {
            let visited = Arc::new(Mutex::new(Vec::new()));
            let result = discover_with_probe(
                None,
                Arc::new(AtomicBool::new(false)),
                synthetic_probe(Some(expected), None, Arc::clone(&visited)),
            );
            assert_eq!(result.endpoint.unwrap().port, expected);
        }
    }

    #[test]
    fn other_http_service_is_not_misidentified() {
        let visited = Arc::new(Mutex::new(Vec::new()));
        let result = discover_with_probe(
            None,
            Arc::new(AtomicBool::new(false)),
            synthetic_probe(Some(5783), Some(5600), visited),
        );
        assert_eq!(result.endpoint.unwrap().port, 5783);
        assert!(result.default_port_was_other_service);
        assert!(result.scanned_all_ports);
    }

    #[test]
    fn previous_port_is_checked_first() {
        let visited = Arc::new(Mutex::new(Vec::new()));
        let result = discover_with_probe(
            Some(5783),
            Arc::new(AtomicBool::new(false)),
            synthetic_probe(Some(5783), None, Arc::clone(&visited)),
        );
        assert_eq!(result.endpoint.unwrap().port, 5783);
        assert_eq!(*visited.lock().unwrap(), vec![5783]);
    }

    #[test]
    fn stale_previous_port_falls_back_to_default() {
        let visited = Arc::new(Mutex::new(Vec::new()));
        let result = discover_with_probe(
            Some(5783),
            Arc::new(AtomicBool::new(false)),
            synthetic_probe(Some(5600), None, Arc::clone(&visited)),
        );
        assert_eq!(result.endpoint.unwrap().port, 5600);
        assert_eq!(*visited.lock().unwrap(), vec![5783, 5600]);
    }

    #[test]
    fn reports_not_found_after_complete_local_range() {
        let visited = Arc::new(Mutex::new(Vec::new()));
        let result = discover_with_probe(
            None,
            Arc::new(AtomicBool::new(false)),
            synthetic_probe(None, None, Arc::clone(&visited)),
        );
        assert!(result.endpoint.is_none());
        assert!(result.scanned_all_ports);
        let values = visited.lock().unwrap();
        assert!(values.iter().all(|port| PORT_RANGE.contains(port)));
        assert_eq!(values.iter().copied().collect::<HashSet<_>>().len(), 1_001);
    }

    #[test]
    fn arbitrary_json_is_not_activitywatch_identity() {
        assert!(activitywatch_info(&serde_json::json!({"status":"ok","version":"1"})).is_none());
        assert!(
            activitywatch_info(
                &serde_json::json!({"version":"0.13.2","hostname":"pc","testing":false})
            )
            .is_some()
        );
    }

    #[test]
    fn scan_respects_concurrency_limit_and_stops_early() {
        let active = Arc::new(AtomicUsize::new(0));
        let maximum = Arc::new(AtomicUsize::new(0));
        let calls = Arc::new(AtomicUsize::new(0));
        let probe: Arc<dyn Fn(u16) -> ProbeResult + Send + Sync> = {
            let active = Arc::clone(&active);
            let maximum = Arc::clone(&maximum);
            let calls = Arc::clone(&calls);
            Arc::new(move |port| {
                let now = active.fetch_add(1, Ordering::SeqCst) + 1;
                maximum.fetch_max(now, Ordering::SeqCst);
                calls.fetch_add(1, Ordering::SeqCst);
                thread::sleep(Duration::from_millis(2));
                active.fetch_sub(1, Ordering::SeqCst);
                if port == 5035 {
                    ProbeResult::ActivityWatch(ActivityWatchInfo {
                        version: "1".into(),
                        hostname: "test".into(),
                    })
                } else {
                    ProbeResult::Closed
                }
            })
        };
        let ports = (5000..=6000).collect::<Vec<_>>();
        let result = scan_ports_with_probe(&ports, 16, Arc::new(AtomicBool::new(false)), probe);
        assert_eq!(result.unwrap().port, 5035);
        assert!(maximum.load(Ordering::SeqCst) <= 16);
        assert!(calls.load(Ordering::SeqCst) < ports.len());
    }
}
