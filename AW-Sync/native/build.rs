// 【初学者导读】
// 文件：AW-Sync/native/build.rs
// Rust 构建脚本：在 Windows 构建时把 AERTEX Watch 图标和版本资源嵌入 EXE。
// 建议阅读链路：main.rs → runtime.rs → activitywatch.rs / sync.rs → state.rs / credentials.rs → ui.rs。
// 数据流：ActivityWatch 本地 REST API → Rust 结构体 → 去重/游标/批处理 → AERTEX Watch Data API → 本地状态更新。
// 错误处理：网络不可用、JSON 结构变化、重复事件和 ActivityWatch 未启动都应是可恢复错误，不能直接让后台线程崩溃。
// 安全原则：设备令牌只存 Windows Credential Manager；日志和 state.json 不应包含完整令牌。
// 修改后至少运行 cargo fmt --check、cargo clippy、cargo test，并通过 scripts/watch-cloud-check.mjs。
use std::path::Path;

fn main() {
    println!("cargo:rerun-if-changed=assets/aertex-watch.ico");

    if std::env::var("CARGO_CFG_TARGET_OS").ok().as_deref() != Some("windows") {
        return;
    }

    let icon = Path::new("assets/aertex-watch.ico");
    if !icon.exists() {
        println!(
            "cargo:warning=assets/aertex-watch.ico is missing; the Windows executable will use the default icon"
        );
        return;
    }

    let mut resource = winres::WindowsResource::new();
    resource.set_icon(icon.to_string_lossy().as_ref());
    resource.set("ProductName", "AERTEX Watch Sync");
    resource.set("FileDescription", "AERTEX Watch Sync");
    resource.set("CompanyName", "AERTEX");
    resource.set("LegalCopyright", "AERTEX");
    resource
        .compile()
        .expect("failed to compile Windows resources");
}
