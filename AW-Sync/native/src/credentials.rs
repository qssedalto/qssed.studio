// 【初学者导读】
// 文件：AW-Sync/native/src/credentials.rs
// Windows Credential Manager 封装：安全保存/读取/删除 AERTEX 设备令牌，不把令牌写入明文 JSON。
// 建议阅读链路：main.rs → runtime.rs → activitywatch.rs / sync.rs → state.rs / credentials.rs → ui.rs。
// 数据流：ActivityWatch 本地 REST API → Rust 结构体 → 去重/游标/批处理 → AERTEX Watch Data API → 本地状态更新。
// 错误处理：网络不可用、JSON 结构变化、重复事件和 ActivityWatch 未启动都应是可恢复错误，不能直接让后台线程崩溃。
// 安全原则：设备令牌只存 Windows Credential Manager；日志和 state.json 不应包含完整令牌。
// 修改后至少运行 cargo fmt --check、cargo clippy、cargo test，并通过 scripts/watch-cloud-check.mjs。
use std::io;
use windows_sys::Win32::Security::Credentials::{
    CRED_PERSIST_LOCAL_MACHINE, CRED_TYPE_GENERIC, CREDENTIALW, CredDeleteW, CredFree, CredReadW,
    CredWriteW,
};

const TARGET: &str = "AERTEX/WatchSync/DeviceToken";

// 保存设备令牌到 Windows Credential Manager：令牌不会写入 state.json/注册表明文，凭据目标名固定为 AERTEX Watch Sync 专用条目。
pub fn save_token(token: &str) -> io::Result<()> {
    let target = wide(TARGET);
    let mut blob = token.as_bytes().to_vec();
    let mut credential: CREDENTIALW = unsafe { std::mem::zeroed() };
    credential.Type = CRED_TYPE_GENERIC;
    credential.TargetName = target.as_ptr() as *mut u16;
    credential.CredentialBlobSize = u32::try_from(blob.len())
        .map_err(|_| io::Error::new(io::ErrorKind::InvalidInput, "Device token is too long"))?;
    credential.CredentialBlob = blob.as_mut_ptr();
    credential.Persist = CRED_PERSIST_LOCAL_MACHINE;
    let result = unsafe { CredWriteW(&credential, 0) };
    blob.fill(0);
    if result == 0 {
        Err(io::Error::last_os_error())
    } else {
        Ok(())
    }
}

// 读取设备令牌：Credential 不存在属于正常“尚未配置”状态；其他 Windows API 错误才向上返回。
pub fn load_token() -> io::Result<Option<String>> {
    let target = wide(TARGET);
    let mut pointer = std::ptr::null_mut();
    let result = unsafe { CredReadW(target.as_ptr(), CRED_TYPE_GENERIC, 0, &mut pointer) };
    if result == 0 {
        let error = io::Error::last_os_error();
        if error.raw_os_error() == Some(1168) {
            return Ok(None);
        }
        return Err(error);
    }
    if pointer.is_null() {
        return Ok(None);
    }
    let credential = unsafe { &*pointer };
    let bytes = unsafe {
        std::slice::from_raw_parts(
            credential.CredentialBlob,
            credential.CredentialBlobSize as usize,
        )
    };
    let value = String::from_utf8(bytes.to_vec())
        .map_err(|_| io::Error::new(io::ErrorKind::InvalidData, "Stored device token is invalid"));
    unsafe { CredFree(pointer.cast()) };
    value.map(Some)
}

#[allow(dead_code)]
// 删除旧设备令牌：安装器重装/用户重新配对时调用；不存在时应视为已删除而不是报致命错误。
pub fn delete_token() -> io::Result<()> {
    let target = wide(TARGET);
    let result = unsafe { CredDeleteW(target.as_ptr(), CRED_TYPE_GENERIC, 0) };
    if result == 0 {
        Err(io::Error::last_os_error())
    } else {
        Ok(())
    }
}

fn wide(value: &str) -> Vec<u16> {
    value.encode_utf16().chain(Some(0)).collect()
}
