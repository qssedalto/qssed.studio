# AERTEX Watch Cloud Sync

AERTEX Watch keeps ActivityWatch collection local while securely copying ActivityWatch events into the authenticated AERTEX cloud service.

## Production Windows client

`AERTEX-Watch-Sync.exe` is the supported client for ordinary Windows users. Download it from:

`https://aw.qsseda.com/AERTEX-Watch-Sync.exe`

The client:

- installs itself for the current user under `%LOCALAPPDATA%\AERTEX\Watch Sync`;
- discovers ActivityWatch only on `127.0.0.1`, including non-default ports in the range 5000–6000;
- stores the AERTEX device token in Windows Credential Manager, never in JSON or the registry;
- syncs the most recent 30 days on first use, then resumes incrementally with a two-second overlap;
- uploads at most 2,000 events per request to `https://awd.qsseda.com/api/sync`;
- runs in the Windows notification area and checks every ten minutes;
- registers per-user startup through `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`;
- requires neither administrator privileges nor Node.js, PowerShell, Python, .NET, or a terminal window.

Local state is stored at `%LOCALAPPDATA%\AERTEX\Watch Sync\state.json`. It contains only the discovered ActivityWatch endpoint and per-bucket progress. Rotating logs are stored in the adjacent `logs` directory.

## Development

```text
cd AW-Sync/native
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test
cargo build --release
```

The release executable is generated at:

`AW-Sync/native/target/release/AERTEX-Watch-Sync.exe`

CI publishes the executable as a GitHub Actions artifact. On `main`, the publish job uploads it to the existing private R2 bucket at the fixed object key `watch/releases/windows/AERTEX-Watch-Sync.exe`; the Watch Worker exposes only that object through the public download route.

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
