use std::path::Path;

// Cargo 构建脚本只负责 Windows 资源元数据，不参与同步逻辑。
//
// CI 会先把 SVG 转成 aertex-watch.ico；如果本地开发没有生成 ico，这里发 warning 而不是让非 Windows/普通检查失败。
fn main() {
    println!("cargo:rerun-if-changed=assets/aertex-watch.ico");

    // macOS/Linux 上仍允许 cargo check/test 读取项目，但不尝试调用 Windows Resource 编译器。
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

    // 这些字段会出现在 Windows 文件属性和资源管理器中；安装器图标与 exe 内嵌图标使用同一份 ico。
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
