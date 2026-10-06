use crate::model::EXE_NAME;
use crate::state;
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::process::Command;

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
    if let Err(copy_error) = fs::copy(&current, &installed)
        && !installed.exists()
    {
        return Err(copy_error);
    }
    let mut command = Command::new(&installed);
    command.args(std::env::args_os().skip(1));
    command.spawn()?;
    Ok(true)
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
