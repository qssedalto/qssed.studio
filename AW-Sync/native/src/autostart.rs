use crate::model::APP_NAME;
use std::io;
use std::path::Path;
use windows_sys::Win32::System::Registry::{
    HKEY, HKEY_CURRENT_USER, KEY_QUERY_VALUE, KEY_SET_VALUE, REG_OPTION_NON_VOLATILE, REG_SZ,
    RegCloseKey, RegCreateKeyExW, RegDeleteValueW, RegOpenKeyExW, RegQueryValueExW, RegSetValueExW,
};

// 使用 HKCU 的 Run：不需要管理员权限，而且只影响当前 Windows 用户。
const RUN_KEY: &str = "Software\\Microsoft\\Windows\\CurrentVersion\\Run";

/// 登录自启命令始终给 exe 路径加引号，并带 --background，避免开机后弹出主窗口。
pub fn command_for(executable: &Path) -> String {
    format!("\"{}\" --background", executable.display())
}

/// 开关自启只增删 AERTEX Watch Sync 自己的注册表值，不会触碰其他软件的启动项。
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

/// 读取固定注册表值是否存在，供设置窗口刷新“开机启动”复选框。
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
