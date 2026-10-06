# AERTEX Watch Cloud Sync

AERTEX Watch keeps ActivityWatch collection local while securely copying ActivityWatch events into the authenticated AERTEX cloud service.

## Production Windows client

Ordinary Windows users install AERTEX Watch Sync with the per-user installer:

`https://aw.qsseda.com/AERTEX-Watch-Sync-Setup.exe`

The installer:

- requires no administrator privileges;
- installs the client under `%LOCALAPPDATA%\AERTEX\Watch Sync`;
- stops any existing AERTEX Watch Sync process before replacement;
- deletes the entire previous AERTEX Watch Sync install/state/log directory before copying the new build;
- deletes the previous `AERTEX/WatchSync/DeviceToken` credential from Windows Credential Manager, so a fresh device token must be generated after reinstall;
- registers `AERTEX Watch Sync` in `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`;
- creates a Start-menu shortcut and an uninstall entry;
- uses the current AERTEX Watch product icon for both the installed application and the installer.

The installed client:

- discovers ActivityWatch only on `127.0.0.1`, including non-default ports in the range 5000–6000;
- stores the new AERTEX device token in Windows Credential Manager, never in JSON or the registry;
- syncs the most recent 30 days on first use, then resumes incrementally with a two-second overlap;
- uploads at most 2,000 events per request to `https://awd.qsseda.com/api/sync`;
- runs in the Windows notification area and checks every ten minutes;
- requires neither Node.js, PowerShell, Python, .NET, nor a terminal window.

Local state is stored at `%LOCALAPPDATA%\AERTEX\Watch Sync\state.json`. Rotating logs are stored in the adjacent `logs` directory. Reinstalling intentionally clears both together with the old device credential.

## Packaging

The Rust GUI executable is an implementation detail of the installer and is not published as the ordinary-user download.

CI:

1. renders `AW-Sync/native/assets/aertex-watch.svg` into a Windows `.ico`;
2. embeds that icon and version metadata into `AERTEX-Watch-Sync.exe`;
3. runs formatting, Clippy, tests, and Watch cloud integration checks;
4. builds the x86-64 MSVC release executable;
5. packages it with Inno Setup as `AERTEX-Watch-Sync-Setup.exe`;
6. uploads only the installer as the GitHub Actions artifact;
7. on `main`, publishes only the installer to R2 at `watch/releases/windows/AERTEX-Watch-Sync-Setup.exe` and removes the legacy portable object.

The public Watch Worker exposes the installer at the fixed URL above. Requests to the legacy `/AERTEX-Watch-Sync.exe` path redirect to the installer.

## 初学者代码阅读地图

如果目的是理解“电脑上的 ActivityWatch 数据怎样一路显示到手机网页”，建议按下面顺序：

1. `native/src/model.rs`：先认识 Bucket、Event、同步断点和 30 天 / 2 秒 / 2000 条这些基础常量。
2. `native/src/activitywatch.rs`：看客户端怎样只在 localhost 自动发现 ActivityWatch，并读取 `/api/0/buckets/` 与 events。
3. `native/src/sync.rs`：看“读取断点 -> 拉事件 -> 分批上传 -> 全部成功后推进断点”的事务边界。
4. `native/src/runtime.rs`：理解为什么网络和端口扫描不会卡住 Win32 界面。
5. `../../watch-worker.js`：看 Device Token 校验、R2 日分片、heartbeat 去重和浏览器读 API。
6. `../../watch-web/app.js`：最后看 AFK、flood、多设备去重、应用/窗口/网站聚合以及 KPI 渲染。
7. `../../scripts/watch-cloud-check.mjs`：这里把关键假设写成回归检查，改算法时先确认这些断言仍成立。

仓库同时保留两份旧 Node.js 同步脚本：`native/aw-sync.mjs` 是审计源，
`watch-web/aw-sync.mjs` 是公开静态资产。CI 要求两份 **byte-for-byte 完全一致**，
这样修复兼容脚本时不会只改到其中一份。

## Development

From `AW-Sync/native`:

```text
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test
cargo build --release
```

On Windows, the release workflow creates `assets/aertex-watch.ico` from the committed SVG before compiling so the GUI executable receives the production Watch icon.

## Legacy/debug implementation

`AW-Sync/native/aw-sync.mjs` remains available for protocol debugging and compatibility investigations. It is not the production Windows client and is not referenced by the ordinary-user setup page.

The cloud upload protocol remains compatible with the legacy implementation:

```json
{
  "bucket": { "id": "...", "type": "...", "client": "...", "hostname": "...", "name": "..." },
  "events": []
}
```

ActivityWatch remains a separate project. AERTEX Watch uses its local REST API and does not expose the local ActivityWatch server to the internet.
