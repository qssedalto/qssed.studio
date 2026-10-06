use crate::model::EXE_NAME;
use crate::single_instance::WINDOW_CLASS;
use crate::state;
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::thread;
use std::time::Duration;
use windows_sys::Win32::UI::WindowsAndMessaging::{FindWindowW, PostMessageW, WM_COMMAND};

const EXIT_COMMAND_ID: usize = 205;
const UPDATE_RETRY_ATTEMPTS: usize = 50;
const UPDATE_RETRY_DELAY: Duration = Duration::from_millis(100);

pub fn installed_executable() -> io::Result<PathBuf> {
    Ok(state::app_dir()?.join(EXE_NAME))
}

pub fn is_installed_location(current: &Path, installed: &Path) -> bool {
    normalize(current) == normalize(installed)
}

pub fn ensure_installed_and_relaunch() -> io::Result<bool> {
    let current = std::env::current_exe()?;
    let installed = installed_executable()?;
    if is_installed_location(&current, &installed) {
        return Ok(false);
    }
    if let Some(parent) = installed.parent() {
        fs::create_dir_all(parent)?;
    }
    replace_installed_executable(&current, &installed)?;
    let mut command = Command::new(&installed);
    command.args(std::env::args_os().skip(1));
    command.spawn()?;
    Ok(true)
}

fn replace_installed_executable(current: &Path, installed: &Path) -> io::Result<()> {
    if installed.exists() {
        request_existing_instance_exit();
    }

    let mut last_error = None;
    for _ in 0..UPDATE_RETRY_ATTEMPTS {
        match fs::copy(current, installed) {
            Ok(_) => return Ok(()),
            Err(error) => last_error = Some(error),
        }
        thread::sleep(UPDATE_RETRY_DELAY);
    }

    let error =
        last_error.unwrap_or_else(|| io::Error::other("Unable to update installed executable"));
    Err(io::Error::new(
        error.kind(),
        format!(
            "Unable to replace {}. Exit AERTEX Watch Sync and try again: {error}",
            installed.display()
        ),
    ))
}

fn request_existing_instance_exit() {
    let class = wide(WINDOW_CLASS);
    let window = unsafe { FindWindowW(class.as_ptr(), std::ptr::null()) };
    if !window.is_null() {
        unsafe {
            PostMessageW(window, WM_COMMAND, EXIT_COMMAND_ID, 0);
        }
    }
}

fn wide(value: &str) -> Vec<u16> {
    value.encode_utf16().chain(Some(0)).collect()
}

fn normalize(path: &Path) -> String {
    path.to_string_lossy()
        .replace('/', "\\")
        .trim_end_matches('\\')
        .to_lowercase()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn installed_path_comparison_is_windows_case_insensitive() {
        assert!(is_installed_location(
            Path::new(r"C:\Users\Test\AppData\Local\AERTEX\Watch Sync\AERTEX-Watch-Sync.exe"),
            Path::new(r"c:\users\test\appdata\local\aertex\watch sync\aertex-watch-sync.exe")
        ));
    }
}
