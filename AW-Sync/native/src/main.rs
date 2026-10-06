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

// GUI 程序入口尽量保持很薄：初始化失败统一交给 run() 返回，再用 MessageBox 告诉用户。
fn main() {
    if let Err(error) = run() {
        logging::error(format!("Fatal startup error: {error}"));
        show_fatal(&format!("AERTEX Watch Sync 无法启动。\n\n{error}"));
    }
}

/// 启动顺序：日志 -> 单实例 -> 本地状态 -> 后台 Runtime -> Win32 UI。
/// Runtime 负责发现 ActivityWatch 与同步，UI 主要展示状态并发出控制信号。
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

/// Release 版是 windows_subsystem=windows，没有控制台，所以致命启动错误必须弹窗可见。
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
