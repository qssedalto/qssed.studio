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
