# QssedA Local Bridge pilot

This is the first read-only localhost bridge for QssedA Work.

## Scope

The pilot binds only to `127.0.0.1:32145` and exposes two read-only routes:

- `GET /health` — bridge version and capability discovery.
- `GET /tex/status` — fixed XeLaTeX availability/version probe.

There is no generic command endpoint, no web-controlled executable name, and no TeX source upload in this phase.

The default browser origins are `https://qsseda.studio` and `https://www.qsseda.studio`. Additional development origins can be supplied explicitly through `QSSEDA_BRIDGE_ORIGINS`.

## Run

Node.js 18 or newer is sufficient; there are no npm dependencies.

```powershell
node local-bridge/server.mjs
```

If XeLaTeX is not on `PATH`, point the bridge at the exact local executable before starting it. Example for PowerShell:

```powershell
$env:QSSEDA_XELATEX='D:\texlive\2026\bin\windows\xelatex.exe'; node local-bridge/server.mjs
```

Then sign in to QssedA Studio and open `/zh-cn/work/local` or `/en/work/local`. The browser may request loopback/local-network permission before the page can reach the bridge.

## Security boundary

- Loopback-only TCP binding.
- Host-header allowlist to reduce DNS-rebinding exposure.
- Exact web-origin allowlist.
- CORS and private-network preflight support.
- Credential-free browser requests.
- Read-only routes only.
- XeLaTeX probing uses a fixed `--version` argument and `shell: false`.

Future compile, Git, or filesystem capabilities must add device pairing, signed requests, explicit per-action authorization, sandboxing, and capability-specific allowlists before they are enabled.
