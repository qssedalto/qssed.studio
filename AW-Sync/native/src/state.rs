use crate::model::PersistedState;
use std::fs::{self, File};
use std::io::{self, Write};
use std::path::{Path, PathBuf};
use windows_sys::Win32::Storage::FileSystem::{
    MOVEFILE_REPLACE_EXISTING, MOVEFILE_WRITE_THROUGH, MoveFileExW,
};

/// 返回当前 Windows 用户的 AERTEX Watch Sync 数据目录。
/// 同步进度属于本机运行状态，因此放在 LOCALAPPDATA，而不是漫游目录。
pub fn app_dir() -> io::Result<PathBuf> {
    let local = std::env::var_os("LOCALAPPDATA")
        .ok_or_else(|| io::Error::new(io::ErrorKind::NotFound, "LOCALAPPDATA is unavailable"))?;
    Ok(PathBuf::from(local).join("AERTEX").join("Watch Sync"))
}

/// state.json 只保存 ActivityWatch 端口与各 Bucket 的同步进度；设备令牌不写进这里。
pub fn state_path() -> io::Result<PathBuf> {
    Ok(app_dir()?.join("state.json"))
}

/// 读取本地状态。文件不存在或 JSON 损坏时回退默认值，让程序可以自行重新发现并恢复。
pub fn load(path: &Path) -> PersistedState {
    fs::read_to_string(path)
        .ok()
        .and_then(|value| serde_json::from_str(&value).ok())
        .unwrap_or_default()
}

/// 原子保存：先完整写入临时文件并 sync，再替换正式 state.json。
/// 这样系统或程序在写盘中途退出时，不容易留下半截 JSON。
pub fn save_atomic(path: &Path, state: &PersistedState) -> io::Result<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    let temporary = path.with_extension("json.tmp");
    let bytes = serde_json::to_vec_pretty(state).map_err(io::Error::other)?;
    // 先写 .tmp，确认数据真正落盘后再切换文件名。
    let mut file = File::create(&temporary)?;
    file.write_all(&bytes)?;
    file.write_all(b"\n")?;
    file.sync_all()?;
    drop(file);

    let source = wide_path(&temporary);
    let destination = wide_path(path);
    // MoveFileExW + WRITE_THROUGH 在 Windows 上完成替换，并尽量把目录项更新也同步到磁盘。
    let moved = unsafe {
        MoveFileExW(
            source.as_ptr(),
            destination.as_ptr(),
            MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH,
        )
    };
    if moved == 0 {
        let error = io::Error::last_os_error();
        let _ = fs::remove_file(&temporary);
        return Err(error);
    }
    Ok(())
}

fn wide_path(path: &Path) -> Vec<u16> {
    use std::os::windows::ffi::OsStrExt;
    path.as_os_str().encode_wide().chain(Some(0)).collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::{ActivityWatchEndpoint, BucketProgress};
    use std::time::{SystemTime, UNIX_EPOCH};

    #[test]
    fn state_round_trips_through_atomic_save() {
        let unique = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let root = std::env::temp_dir().join(format!("aertex-watch-state-{unique}"));
        let path = root.join("state.json");
        let mut state = PersistedState {
            activitywatch: Some(ActivityWatchEndpoint::localhost(5667)),
            ..PersistedState::default()
        };
        state.buckets.insert(
            "aw-watcher-window_test".to_string(),
            BucketProgress {
                timestamp: "2026-10-06T10:00:00Z".to_string(),
                synced_at: "2026-10-06T10:00:01Z".to_string(),
            },
        );

        save_atomic(&path, &state).unwrap();
        assert_eq!(load(&path), state);
        assert!(!path.with_extension("json.tmp").exists());
        fs::remove_dir_all(root).unwrap();
    }
}
