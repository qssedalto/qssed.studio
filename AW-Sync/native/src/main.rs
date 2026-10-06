// 【初学者导读】
// 文件：AW-Sync/native/src/main.rs
// Windows 客户端入口：初始化单实例、日志、状态、UI 和后台同步运行时。
// 建议阅读链路：main.rs → runtime.rs → activitywatch.rs / sync.rs → state.rs / credentials.rs → ui.rs。
// 数据流：ActivityWatch 本地 REST API → Rust 结构体 → 去重/游标/批处理 → AERTEX Watch Data API → 本地状态更新。
// 错误处理：网络不可用、JSON 结构变化、重复事件和 ActivityWatch 未启动都应是可恢复错误，不能直接让后台线程崩溃。
// 安全原则：设备令牌只存 Windows Credential Manager；日志和 state.json 不应包含完整令牌。
// 修改后至少运行 cargo fmt --check、cargo clippy、cargo test，并通过 scripts/watch-cloud-check.mjs。
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod activitywatch;
mod autostart;
mod credentials;
mod logging;
mod model;
mod runtime;
mod single_instance;
mod state;
mod sync;
mod ui;

use crate::single_instance::InstanceOutcome;
use std::sync::{Arc, Mutex};

// Windows GUI 进程入口：捕获顶层错误并用原生消息框提示，防止无控制台模式下发生致命错误却完全无反馈。
fn main() {
    if let Err(error) = run() {
        logging::error(format!("Fatal startup error: {error}"));
        show_fatal(&format!("AERTEX Watch Sync 无法启动。\n\n{error}"));
    }
}

// 应用初始化顺序：单实例 → 日志/状态 → Runtime → UI。顺序很重要：如果多个实例同时启动，不能在抢锁前先开始同步或覆盖状态。
fn run() -> Result<(), Box<dyn std::error::Error>> {
    logging::initialize()?;
    logging::info("AERTEX Watch Sync starting");

    let _guard = match single_instance::acquire()? {
        InstanceOutcome::Primary(guard) => guard,
        InstanceOutcome::ExistingNotified => return Ok(()),
    };

    let state_path = state::state_path()?;
    let persisted = Arc::new(Mutex::new(state::load(&state_path)));
    let runtime = runtime::Runtime::new(persisted, state_path, ui::runtime_callback());
    let executable = std::env::current_exe()?;
    let background = std::env::args().any(|argument| argument == "--background");
    let has_token = credentials::load_token().ok().flatten().is_some();
    ui::run(runtime, executable, !background || !has_token)?;
    Ok(())
}

fn show_fatal(message: &str) {
    use windows_sys::Win32::UI::WindowsAndMessaging::{MB_ICONERROR, MB_OK, MessageBoxW};
    let message = message.encode_utf16().chain(Some(0)).collect::<Vec<_>>();
    let title = model::APP_NAME
        .encode_utf16()
        .chain(Some(0))
        .collect::<Vec<_>>();
    unsafe {
        MessageBoxW(
            std::ptr::null_mut(),
            message.as_ptr(),
            title.as_ptr(),
            MB_OK | MB_ICONERROR,
        );
    }
}
