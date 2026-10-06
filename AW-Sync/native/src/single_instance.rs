// 【初学者导读】
// 文件：AW-Sync/native/src/single_instance.rs
// 单实例保护：确保同一 Windows 用户不会同时运行多个 AERTEX Watch Sync 进程。
// 建议阅读链路：main.rs → runtime.rs → activitywatch.rs / sync.rs → state.rs / credentials.rs → ui.rs。
// 数据流：ActivityWatch 本地 REST API → Rust 结构体 → 去重/游标/批处理 → AERTEX Watch Data API → 本地状态更新。
// 错误处理：网络不可用、JSON 结构变化、重复事件和 ActivityWatch 未启动都应是可恢复错误，不能直接让后台线程崩溃。
// 安全原则：设备令牌只存 Windows Credential Manager；日志和 state.json 不应包含完整令牌。
// 修改后至少运行 cargo fmt --check、cargo clippy、cargo test，并通过 scripts/watch-cloud-check.mjs。
use std::io;
use std::thread;
use std::time::Duration;
use windows_sys::Win32::Foundation::{CloseHandle, ERROR_ALREADY_EXISTS, GetLastError, HANDLE};
use windows_sys::Win32::System::Threading::CreateMutexW;
use windows_sys::Win32::UI::WindowsAndMessaging::{FindWindowW, PostMessageW};

pub const MUTEX_NAME: &str = "Local\\AERTEXWatchSync";
pub const WINDOW_CLASS: &str = "AERTEXWatchSyncWindow";
pub const SHOW_MESSAGE: u32 = 0x8000 + 41;

pub struct InstanceGuard(HANDLE);

unsafe impl Send for InstanceGuard {}

impl Drop for InstanceGuard {
    fn drop(&mut self) {
        if !self.0.is_null() {
            unsafe { CloseHandle(self.0) };
        }
    }
}

pub enum InstanceOutcome {
    Primary(InstanceGuard),
    ExistingNotified,
}

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
