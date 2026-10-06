// 【初学者导读】
// 文件：AW-Sync/native/src/runtime.rs
// 后台运行时：协调 ActivityWatch 探测、云端连接、定时同步、重试与 UI 状态更新。
// 建议阅读链路：main.rs → runtime.rs → activitywatch.rs / sync.rs → state.rs / credentials.rs → ui.rs。
// 数据流：ActivityWatch 本地 REST API → Rust 结构体 → 去重/游标/批处理 → AERTEX Watch Data API → 本地状态更新。
// 错误处理：网络不可用、JSON 结构变化、重复事件和 ActivityWatch 未启动都应是可恢复错误，不能直接让后台线程崩溃。
// 安全原则：设备令牌只存 Windows Credential Manager；日志和 state.json 不应包含完整令牌。
// 修改后至少运行 cargo fmt --check、cargo clippy、cargo test，并通过 scripts/watch-cloud-check.mjs。
use crate::activitywatch::ActivityWatchClient;
use crate::credentials;
use crate::logging;
use crate::model::{ActivityWatchEndpoint, PersistedState, SYNC_INTERVAL_SECONDS};
use crate::state;
use crate::sync::{HttpCloudUploader, SyncEngine, SyncErrorKind};
use chrono::Local;
use std::path::PathBuf;
use std::sync::{Arc, Condvar, Mutex};
use std::thread;
use std::time::Duration;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RuntimeStatus {
    Starting,
    Detecting,
    ActivityWatchFound,
    NeedsToken,
    Syncing,
    Normal,
    WaitingForActivityWatch,
    OtherServiceOnDefaultPort,
    NetworkError,
    AuthenticationError,
}

#[derive(Debug, Clone)]
pub struct RuntimeSnapshot {
    pub status: RuntimeStatus,
    pub detail: String,
    pub endpoint: Option<ActivityWatchEndpoint>,
    pub last_sync: Option<String>,
    pub uploaded_events: usize,
}

impl Default for RuntimeSnapshot {
    fn default() -> Self {
        Self {
            status: RuntimeStatus::Starting,
            detail: "正在启动…".to_string(),
            endpoint: None,
            last_sync: None,
            uploaded_events: 0,
        }
    }
}

#[derive(Default)]
struct Control {
    sync_now: bool,
    redetect: bool,
    shutdown: bool,
}

pub struct Runtime {
    snapshot: Mutex<RuntimeSnapshot>,
    control: Mutex<Control>,
    wake: Condvar,
    persisted: Arc<Mutex<PersistedState>>,
    state_path: PathBuf,
    on_change: Arc<dyn Fn() + Send + Sync>,
}

impl Runtime {
    pub fn new(
        persisted: Arc<Mutex<PersistedState>>,
        state_path: PathBuf,
        on_change: Arc<dyn Fn() + Send + Sync>,
    ) -> Arc<Self> {
        Arc::new(Self {
            snapshot: Mutex::new(RuntimeSnapshot::default()),
            control: Mutex::new(Control::default()),
            wake: Condvar::new(),
            persisted,
            state_path,
            on_change,
        })
    }

    // 启动后台同步线程：Runtime 本身放在 Arc 中供 UI/托盘共享状态；这里只启动一次主循环，不在 UI 线程做网络阻塞操作。
    pub fn start(self: &Arc<Self>) {
        let runtime = Arc::clone(self);
        thread::spawn(move || runtime.run());
    }

    pub fn snapshot(&self) -> RuntimeSnapshot {
        self.snapshot
            .lock()
            .map(|value| value.clone())
            .unwrap_or_default()
    }

    // 用户主动“立即同步”：设置唤醒信号，让后台循环尽快执行一次，不直接在按钮回调里调用网络请求。
    pub fn request_sync(&self) {
        if let Ok(mut control) = self.control.lock() {
            control.sync_now = true;
            self.wake.notify_one();
        }
    }

    // 请求重新探测 ActivityWatch：清除当前端点信任并唤醒后台线程，适用于端口变化或 ActivityWatch 重启。
    pub fn request_redetect(&self) {
        if let Ok(mut control) = self.control.lock() {
            control.redetect = true;
            self.wake.notify_one();
        }
    }

    pub fn shutdown(&self) {
        if let Ok(mut control) = self.control.lock() {
            control.shutdown = true;
            self.wake.notify_one();
        }
    }

    fn update(
        &self,
        status: RuntimeStatus,
        detail: impl Into<String>,
        endpoint: Option<ActivityWatchEndpoint>,
        uploaded_events: Option<usize>,
    ) {
        if let Ok(mut snapshot) = self.snapshot.lock() {
            snapshot.status = status;
            snapshot.detail = detail.into();
            snapshot.endpoint = endpoint;
            if let Some(uploaded) = uploaded_events {
                snapshot.uploaded_events = uploaded;
            }
        }
        (self.on_change)();
    }

    // Runtime 主循环：加载凭据/端点 → 探测 ActivityWatch → 执行云端同步 → 根据结果更新 UI 状态和重试等待。错误应被分类并进入重试，而不是终止线程。
    fn run(self: Arc<Self>) {
        let activitywatch = match ActivityWatchClient::new() {
            Ok(client) => client,
            Err(error) => {
                self.update(
                    RuntimeStatus::WaitingForActivityWatch,
                    format!("无法初始化本机连接：{error}"),
                    None,
                    None,
                );
                return;
            }
        };
        let uploader = match HttpCloudUploader::new() {
            Ok(value) => value,
            Err(error) => {
                self.update(
                    RuntimeStatus::NetworkError,
                    format!("无法初始化云端连接：{error}"),
                    None,
                    None,
                );
                return;
            }
        };
        let engine = SyncEngine::new(
            activitywatch.clone(),
            uploader,
            self.state_path.clone(),
            Arc::clone(&self.persisted),
        );
        let mut endpoint: Option<ActivityWatchEndpoint> = None;
        let mut consecutive_local_failures = 0_u8;
        let mut force_discovery = true;

        loop {
            if self.is_shutdown() {
                break;
            }

            if force_discovery || endpoint.is_none() {
                self.update(
                    RuntimeStatus::Detecting,
                    "正在连接 ActivityWatch…",
                    endpoint.clone(),
                    None,
                );
                let previous_port =
                    self.persisted.lock().ok().and_then(|value| {
                        value.activitywatch.as_ref().map(|endpoint| endpoint.port)
                    });
                let progress_runtime = Arc::clone(&self);
                let progress_endpoint = endpoint.clone();
                let result = activitywatch.discover_with_progress(
                    previous_port,
                    Arc::new(std::sync::atomic::AtomicBool::new(false)),
                    Arc::new(move || {
                        progress_runtime.update(
                            RuntimeStatus::OtherServiceOnDefaultPort,
                            "5600 端口被其他应用占用，正在本机寻找 ActivityWatch…",
                            progress_endpoint.clone(),
                            None,
                        );
                    }),
                );
                endpoint = result.endpoint;
                if let Some(found) = endpoint.clone() {
                    logging::info(format!("ActivityWatch found on 127.0.0.1:{}", found.port));
                    if let Ok(mut persisted) = self.persisted.lock() {
                        persisted.activitywatch = Some(found.clone());
                        if let Err(error) = state::save_atomic(&self.state_path, &persisted) {
                            logging::error(format!(
                                "Unable to save discovered ActivityWatch port: {error}"
                            ));
                        }
                    }
                    self.update(
                        RuntimeStatus::ActivityWatchFound,
                        format!("ActivityWatch 已找到 · 127.0.0.1:{}", found.port),
                        Some(found),
                        None,
                    );
                } else {
                    let (status, detail) = if result.default_port_was_other_service {
                        (
                            RuntimeStatus::OtherServiceOnDefaultPort,
                            "5600 端口被其他应用占用；已检查本机端口 5000–6000，但没有找到 ActivityWatch。",
                        )
                    } else {
                        (
                            RuntimeStatus::WaitingForActivityWatch,
                            "没有检测到 ActivityWatch。已检查本机端口 5000–6000。",
                        )
                    };
                    self.update(status, detail, None, None);
                }
                force_discovery = false;
            }

            let token = credentials::load_token().ok().flatten();
            let Some(token) = token else {
                let detail = endpoint
                    .as_ref()
                    .map(|value| {
                        format!(
                            "ActivityWatch 已找到 · 127.0.0.1:{}。请粘贴设备令牌。",
                            value.port
                        )
                    })
                    .unwrap_or_else(|| "请启动 ActivityWatch 并粘贴设备令牌。".to_string());
                self.update(RuntimeStatus::NeedsToken, detail, endpoint.clone(), None);
                match self.wait() {
                    WaitAction::Shutdown => break,
                    WaitAction::Redetect => force_discovery = true,
                    WaitAction::Sync | WaitAction::Timeout => {}
                }
                continue;
            };

            let Some(current_endpoint) = endpoint.clone() else {
                match self.wait() {
                    WaitAction::Shutdown => break,
                    WaitAction::Redetect | WaitAction::Sync | WaitAction::Timeout => {
                        force_discovery = true
                    }
                }
                continue;
            };

            self.update(
                RuntimeStatus::Syncing,
                "正在同步 ActivityWatch 数据…",
                Some(current_endpoint.clone()),
                None,
            );
            match engine.run_once(&token, &current_endpoint) {
                Ok(summary) => {
                    consecutive_local_failures = 0;
                    let time = Local::now().format("%Y-%m-%d %H:%M").to_string();
                    if let Ok(mut snapshot) = self.snapshot.lock() {
                        snapshot.last_sync = Some(time.clone());
                    }
                    logging::info(format!(
                        "Sync successful: {} buckets, {} events",
                        summary.discovered_buckets, summary.uploaded_events
                    ));
                    self.update(
                        RuntimeStatus::Normal,
                        format!(
                            "同步正常 · {} 个数据源 · {} 个事件",
                            summary.discovered_buckets, summary.uploaded_events
                        ),
                        Some(current_endpoint),
                        Some(summary.uploaded_events),
                    );
                }
                Err(error) if error.kind == SyncErrorKind::Unauthorized => {
                    logging::error("Cloud rejected the stored device token");
                    self.update(
                        RuntimeStatus::AuthenticationError,
                        "设备令牌无效或已失效。请在设置中更换令牌。",
                        Some(current_endpoint),
                        None,
                    );
                }
                Err(error) if error.kind == SyncErrorKind::ActivityWatchUnavailable => {
                    consecutive_local_failures = consecutive_local_failures.saturating_add(1);
                    logging::error(format!("ActivityWatch sync failed: {}", error.message));
                    self.update(
                        RuntimeStatus::WaitingForActivityWatch,
                        "ActivityWatch 暂时无法连接，稍后会自动重试。",
                        Some(current_endpoint),
                        None,
                    );
                    if consecutive_local_failures >= 3 {
                        endpoint = None;
                        force_discovery = true;
                        consecutive_local_failures = 0;
                    }
                }
                Err(error) => {
                    logging::error(format!("Cloud sync failed: {}", error.message));
                    self.update(
                        RuntimeStatus::NetworkError,
                        "网络或云端暂时不可用，将在下次同步时重试。",
                        Some(current_endpoint),
                        None,
                    );
                }
            }

            match self.wait() {
                WaitAction::Shutdown => break,
                WaitAction::Redetect => {
                    endpoint = None;
                    force_discovery = true;
                }
                WaitAction::Sync | WaitAction::Timeout => {}
            }
        }
        logging::info("Background sync stopped");
    }

    fn is_shutdown(&self) -> bool {
        self.control
            .lock()
            .map(|value| value.shutdown)
            .unwrap_or(true)
    }

    // 可中断等待：后台线程休眠期间仍能响应“立即同步、重新探测、退出”等控制信号，避免 UI 操作必须等完整重试周期。
    fn wait(&self) -> WaitAction {
        let control = match self.control.lock() {
            Ok(value) => value,
            Err(_) => return WaitAction::Shutdown,
        };
        let (mut control, _) = match self.wake.wait_timeout_while(
            control,
            Duration::from_secs(SYNC_INTERVAL_SECONDS),
            |value| !value.shutdown && !value.sync_now && !value.redetect,
        ) {
            Ok(value) => value,
            Err(_) => return WaitAction::Shutdown,
        };
        if control.shutdown {
            WaitAction::Shutdown
        } else if std::mem::take(&mut control.redetect) {
            WaitAction::Redetect
        } else if std::mem::take(&mut control.sync_now) {
            WaitAction::Sync
        } else {
            WaitAction::Timeout
        }
    }
}

enum WaitAction {
    Sync,
    Redetect,
    Shutdown,
    Timeout,
}
