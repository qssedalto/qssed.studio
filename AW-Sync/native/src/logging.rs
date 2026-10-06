use crate::state;
use chrono::Local;
use std::fs::{self, OpenOptions};
use std::io::{self, Write};
use std::path::PathBuf;
use std::sync::{Mutex, OnceLock};

const MAX_LOG_BYTES: u64 = 1024 * 1024;
const ROTATED_FILES: usize = 3;

static LOGGER: OnceLock<Logger> = OnceLock::new();

pub struct Logger {
    path: PathBuf,
    lock: Mutex<()>,
}

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

fn sanitize(message: &str) -> String {
    message
        .replace(['\r', '\n'], " ")
        .chars()
        .take(2_000)
        .collect()
}
