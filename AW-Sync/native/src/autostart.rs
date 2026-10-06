// 【初学者导读】
// 文件：AW-Sync/native/src/autostart.rs
// Windows 开机自启动封装：维护当前用户 Run 注册表项，避免 UI/runtime 直接操作注册表细节。
// 建议阅读链路：main.rs → runtime.rs → activitywatch.rs / sync.rs → state.rs / credentials.rs → ui.rs。
// 数据流：ActivityWatch 本地 REST API → Rust 结构体 → 去重/游标/批处理 → AERTEX Watch Data API → 本地状态更新。
// 错误处理：网络不可用、JSON 结构变化、重复事件和 ActivityWatch 未启动都应是可恢复错误，不能直接让后台线程崩溃。
// 安全原则：设备令牌只存 Windows Credential Manager；日志和 state.json 不应包含完整令牌。
// 修改后至少运行 cargo fmt --check、cargo clippy、cargo test，并通过 scripts/watch-cloud-check.mjs。
use crate::model::APP_NAME;
use std::io;
use std::path::Path;
use windows_sys::Win32::System::Registry::{
    HKEY, HKEY_CURRENT_USER, KEY_QUERY_VALUE, KEY_SET_VALUE, REG_OPTION_NON_VOLATILE, REG_SZ,
    RegCloseKey, RegCreateKeyExW, RegDeleteValueW, RegOpenKeyExW, RegQueryValueExW, RegSetValueExW,
};

const RUN_KEY: &str = "Software\\Microsoft\\Windows\\CurrentVersion\\Run";

pub fn command_for(executable: &Path) -> String {
    format!("\"{}\" --background", executable.display())
}

pub fn set_enabled(executable: &Path, enabled: bool) -> io::Result<()> {
    let mut key: HKEY = std::ptr::null_mut();
    let run_key = wide(RUN_KEY);
    let status = unsafe {
        RegCreateKeyExW(
            HKEY_CURRENT_USER,
            run_key.as_ptr(),
            0,
            std::ptr::null_mut(),
            REG_OPTION_NON_VOLATILE,
            KEY_SET_VALUE,
            std::ptr::null(),
            &mut key,
            std::ptr::null_mut(),
        )
    };
    if status != 0 {
        return Err(io::Error::from_raw_os_error(status as i32));
    }
    let name = wide(APP_NAME);
    let result = if enabled {
        let value = wide(&command_for(executable));
        unsafe {
            RegSetValueExW(
                key,
                name.as_ptr(),
                0,
                REG_SZ,
                value.as_ptr().cast(),
                u32::try_from(value.len() * 2).unwrap_or(u32::MAX),
            )
        }
    } else {
        unsafe { RegDeleteValueW(key, name.as_ptr()) }
    };
    unsafe { RegCloseKey(key) };
    if result == 0 || (!enabled && result == 2) {
        Ok(())
    } else {
        Err(io::Error::from_raw_os_error(result as i32))
    }
}

pub fn is_enabled() -> bool {
    let mut key: HKEY = std::ptr::null_mut();
    let run_key = wide(RUN_KEY);
    let opened = unsafe {
        RegOpenKeyExW(
            HKEY_CURRENT_USER,
            run_key.as_ptr(),
            0,
            KEY_QUERY_VALUE,
            &mut key,
        )
    };
    if opened != 0 {
        return false;
    }
    let name = wide(APP_NAME);
    let status = unsafe {
        RegQueryValueExW(
            key,
            name.as_ptr(),
            std::ptr::null_mut(),
            std::ptr::null_mut(),
            std::ptr::null_mut(),
            std::ptr::null_mut(),
        )
    };
    unsafe { RegCloseKey(key) };
    status == 0
}

fn wide(value: &str) -> Vec<u16> {
    value.encode_utf16().chain(Some(0)).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn autostart_value_quotes_installed_path_and_uses_background_mode() {
        let path =
            Path::new(r"C:\Users\Example\AppData\Local\AERTEX\Watch Sync\AERTEX-Watch-Sync.exe");
        assert_eq!(
            command_for(path),
            r#""C:\Users\Example\AppData\Local\AERTEX\Watch Sync\AERTEX-Watch-Sync.exe" --background"#
        );
    }
}
