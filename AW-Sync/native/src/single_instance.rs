use std::io;
use std::thread;
use std::time::Duration;
use windows_sys::Win32::Foundation::{CloseHandle, ERROR_ALREADY_EXISTS, GetLastError, HANDLE};
use windows_sys::Win32::System::Threading::CreateMutexW;
use windows_sys::Win32::UI::WindowsAndMessaging::{FindWindowW, PostMessageW};

pub const MUTEX_NAME: &str = "Local\\AERTEXWatchSync";
pub const WINDOW_CLASS: &str = "AERTEXWatchSyncWindow";
pub const SHOW_MESSAGE: u32 = 0x8000 + 41;

/// 持有命名 Mutex 的 RAII 守卫。主实例退出时 Drop 自动释放句柄。
pub struct InstanceGuard(HANDLE);

unsafe impl Send for InstanceGuard {}

impl Drop for InstanceGuard {
    fn drop(&mut self) {
        if !self.0.is_null() {
            unsafe { CloseHandle(self.0) };
        }
    }
}

/// acquire() 要么成为主实例，要么发现已有实例并通知它把窗口显示出来。
pub enum InstanceOutcome {
    Primary(InstanceGuard),
    ExistingNotified,
}

/// 用当前 Windows 会话范围内的命名 Mutex 保证单实例。
/// 不使用 Global\\ 前缀，因此不同登录会话不会互相阻止。
pub fn acquire() -> io::Result<InstanceOutcome> {
    let name = wide(MUTEX_NAME);
    let handle = unsafe { CreateMutexW(std::ptr::null(), 0, name.as_ptr()) };
    if handle.is_null() {
        return Err(io::Error::last_os_error());
    }
    if unsafe { GetLastError() } == ERROR_ALREADY_EXISTS {
        unsafe { CloseHandle(handle) };
        notify_existing();
        Ok(InstanceOutcome::ExistingNotified)
    } else {
        Ok(InstanceOutcome::Primary(InstanceGuard(handle)))
    }
}

/// 如果已有实例，向它的隐藏/主窗口投递约定消息，让用户看到现有窗口，而不是静默失败。
fn notify_existing() {
    let class = wide(WINDOW_CLASS);
    for _ in 0..20 {
        let window = unsafe { FindWindowW(class.as_ptr(), std::ptr::null()) };
        if !window.is_null() {
            unsafe { PostMessageW(window, SHOW_MESSAGE, 0, 0) };
            break;
        }
        thread::sleep(Duration::from_millis(100));
    }
}

fn wide(value: &str) -> Vec<u16> {
    value.encode_utf16().chain(Some(0)).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn mutex_is_scoped_to_the_current_windows_session() {
        assert!(MUTEX_NAME.starts_with("Local\\"));
        assert!(!MUTEX_NAME.contains(' '));
    }
}
