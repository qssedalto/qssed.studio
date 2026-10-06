use crate::state;
use chrono::Local;
use std::fs::{self, OpenOptions};
use std::io::{self, Write};
use std::path::PathBuf;
use std::sync::{Mutex, OnceLock};

// 日志是本机故障排查用：单文件 1 MiB、最多 3 份轮转，避免后台常驻后无限占用磁盘。
const MAX_LOG_BYTES: u64 = 1024 * 1024;
const ROTATED_FILES: usize = 3;

static LOGGER: OnceLock<Logger> = OnceLock::new();

pub struct Logger {
    path: PathBuf,
    lock: Mutex<()>,
}

/// 创建日志目录并安装全局 Logger。后续 info/error 都通过同一把锁串行写入。
pub fn initialize() -> io::Result<()> {
    let directory = state::app_dir()?.join("logs");
    fs::create_dir_all(&directory)?;
    let _ = LOGGER.set(Logger {
        path: directory.join("sync.log"),
        lock: Mutex::new(()),
    });
    Ok(())
}

pub fn info(message: impl AsRef<str>) {
    if let Some(logger) = LOGGER.get() {
        let _ = logger.write("INFO", message.as_ref());
    }
}

pub fn error(message: impl AsRef<str>) {
    if let Some(logger) = LOGGER.get() {
        let _ = logger.write("ERROR", message.as_ref());
    }
}

impl Logger {
    /// 每次写入前先检查轮转，并把 CR/LF 清洗掉，保证一条调用只形成一行日志。
    fn write(&self, level: &str, message: &str) -> io::Result<()> {
        let _guard = self
            .lock
            .lock()
            .map_err(|_| io::Error::other("log lock poisoned"))?;
        self.rotate_if_needed()?;
        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.path)?;
        writeln!(
            file,
            "{} {level} {}",
            Local::now().format("%Y-%m-%d %H:%M:%S"),
            sanitize(message)
        )
    }

    /// 超过阈值后按 sync.log.1/.2/.3 向后轮转，最旧的一份被淘汰。
    fn rotate_if_needed(&self) -> io::Result<()> {
        if fs::metadata(&self.path)
            .map(|value| value.len())
            .unwrap_or(0)
            < MAX_LOG_BYTES
        {
            return Ok(());
        }
        for index in (1..=ROTATED_FILES).rev() {
            let destination = self.path.with_extension(format!("log.{index}"));
            let source = if index == 1 {
                self.path.clone()
            } else {
                self.path.with_extension(format!("log.{}", index - 1))
            };
            if destination.exists() {
                let _ = fs::remove_file(&destination);
            }
            if source.exists() {
                let _ = fs::rename(source, destination);
            }
        }
        Ok(())
    }
}

/// 把换行替换为空格，避免外部错误文本伪造成多条日志记录。
fn sanitize(message: &str) -> String {
    message
        .replace(['\r', '\n'], " ")
        .chars()
        .take(2_000)
        .collect()
}
