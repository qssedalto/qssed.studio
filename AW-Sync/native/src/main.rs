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

fn main() {
    if let Err(error) = run() {
        logging::error(format!("Fatal startup error: {error}"));
        show_fatal(&format!("AERTEX Watch Sync 无法启动。\n\n{error}"));
    }
}

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
