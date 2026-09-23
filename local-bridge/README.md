# AERTEX Bridge

This is the first read-only localhost bridge for AERTEX Work.

## Scope

The pilot binds only to `127.0.0.1:32145` and exposes two read-only routes:

- `GET /health` — bridge version and capability discovery.
- `GET /tex/status` — fixed XeLaTeX availability/version probe.

There is no generic command endpoint, no web-controlled executable name, and no TeX source upload in this phase.

The default browser origins are `https://qsseda.com` and `https://www.qsseda.com`. Additional development origins can be supplied explicitly through `QSSEDA_BRIDGE_ORIGINS`.

## Recommended Windows setup: install once, start automatically

For the current pilot, Windows users should install the bridge once instead of starting it manually for every browser session.

From a current checkout of this repository, double-click:

```text
local-bridge\install-windows.cmd
```

The installer:

- requires Node.js 18 or newer;
- automatically discovers XeLaTeX from `PATH` or common TeX Live roots such as `D:\texlive\<year>\bin\windows\xelatex.exe`;
- copies the bridge into `%LOCALAPPDATA%\QssedA\LocalBridge`;
- stores only local executable paths in `%LOCALAPPDATA%\QssedA\LocalBridge\config.json`;
- registers a per-user `HKCU\Software\Microsoft\Windows\CurrentVersion\Run` entry;
- launches the bridge hidden in the background;
- does not require administrator rights.

After that, the bridge starts automatically when the Windows account signs in. AERTEX Work also probes localhost automatically when the local-collaboration page opens, so normal use should not require a terminal or a manual Connect click.

To remove autostart later, run the installed `uninstall-windows.ps1` or the repository copy with PowerShell. It removes only the per-user Run entry and stops the installed bridge process when it can safely identify it.

## Manual run for development

Node.js 18 or newer is sufficient; there are no npm dependencies.

```powershell
node local-bridge/server.mjs
```

If XeLaTeX is not on `PATH`, point the bridge at the exact local executable before starting it. Example for PowerShell:

```powershell
$env:QSSEDA_XELATEX='D:\texlive\2026\bin\windows\xelatex.exe'; node local-bridge/server.mjs
```

Then sign in to AERTEX and open `/zh-cn/work/local` or `/en/work/local`. The browser may request loopback/local-network permission before the page can reach the bridge.

## Security boundary

- Loopback-only TCP binding.
- Host-header allowlist to reduce DNS-rebinding exposure.
- Exact web-origin allowlist.
- CORS and private-network preflight support.
- Credential-free browser requests.
- Read-only routes only.
- XeLaTeX probing uses a fixed `--version` argument and `shell: false`.
- Windows autostart is per-user and points only to the installed fixed launcher; it does not grant elevated privileges.

Future compile, Git, or filesystem capabilities must add device pairing, signed requests, explicit per-action authorization, sandboxing, and capability-specific allowlists before they are enabled.


## AERTEX Bridge

The GPT subdomain uses a separate localhost service on `127.0.0.1:32146`. It is intentionally independent from the Work/TeX bridge on port `32145`.

The Codex bridge launches the official `codex app-server` using its default stdio JSONL transport. AERTEX does not expose Codex's experimental WebSocket transport to the browser.

### Windows installation

Prerequisites:

- Node.js 18 or newer.
- OpenAI Codex CLI installed and available as `codex`.
- Install Codex CLI with `npm install -g @openai/codex` if needed.

From a repository checkout, double-click:

```text
local-bridge\install-codex-windows.cmd
```

The installer copies only the Codex bridge files into `%LOCALAPPDATA%\QssedA\CodexBridge`, records the detected Node/Codex executable paths, creates a per-user HKCU Run entry, and starts the bridge hidden in the background.

Then open `https://gpt.qsseda.com`. The page connects only to `http://127.0.0.1:32146`.

### Authentication

The browser never receives a ChatGPT access token. The bridge asks Codex App Server to start the official `chatgptDeviceCode` flow. Codex owns token persistence and refresh inside a dedicated `CODEX_HOME` under the bridge install directory.

The web UI receives only:

- account email and plan type returned by `account/read`;
- the device-login verification URL and short user code;
- available models and reasoning efforts;
- rate-limit metadata;
- thread identifiers and streamed assistant text.

### Chat safety boundary

AERTEX AI starts threads with `approvalPolicy: "never"` and the legacy `readOnly` sandbox. Every chat turn further applies a restricted read-only sandbox rooted at an empty bridge-owned chat workspace. The browser has no generic command, filesystem, MCP, or process endpoint.

The bridge:

- binds only to loopback;
- enforces exact Host headers;
- accepts browser CORS only from `https://gpt.qsseda.com`;
- supports private-network preflight;
- spawns `codex app-server` with `shell: false`;
- uses a dedicated `CODEX_HOME`, so it does not inherit the user's normal Codex project configuration, plugins, skills, or MCP setup;
- sanitizes all data before returning it to the browser;
- never returns raw authentication tokens.

This is an experimental AERTEX integration built on the documented Codex App Server interface. The public WebSocket transport remains deliberately unused because OpenAI currently marks it experimental.



### Cross-device GPT tunnel

The Codex Bridge remains bound to `127.0.0.1:32146`; it is never changed into a public listening socket. Cross-device access is provided by a remotely-managed Cloudflare Tunnel running on the same Windows account.

Configure the Tunnel public hostname to forward to:

```text
http://127.0.0.1:32146
```

The Windows Codex installer can store both the Tunnel token and the independent AERTEX Bridge bearer token using the current Windows user's DPAPI protection. At login, `start-codex-windows.ps1` starts the Bridge and, when configured, `cloudflared` in the background.

The GPT Worker must receive the matching HTTPS Tunnel hostname as `GPT_CODEX_BRIDGE_URL` and matching bearer token as `GPT_CODEX_BRIDGE_TOKEN`.

If the host is shut down, sleeping, the Bridge exits, or the Tunnel disconnects, the Worker maps the unreachable-origin response to `gpt_offline`. The GPT page polls the status endpoint every five seconds and automatically switches between online and offline states.

Tunnel traffic must carry the shared bearer token. A forged `Origin: https://gpt.qsseda.com` header is not sufficient to bypass it because the browser-origin exception applies only when the request also uses the literal localhost Host header.
