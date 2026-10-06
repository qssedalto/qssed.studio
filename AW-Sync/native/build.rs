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
