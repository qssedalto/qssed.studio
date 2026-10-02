# AERTEX Watch Cloud Sync

AERTEX Watch keeps ActivityWatch collection local while copying selected bucket events into the authenticated AERTEX cloud service.

## Domain model

- `aw.<root>` — AERTEX Watch web UI.
- `awd.<root>` — short cloud data/API hostname.
- `aw.data.<root>` — semantic alias of the same cloud data/API service.
- Supported roots: `qsseda.com`, `qsseda.online`, `qsseda.studio`.

The cloud service is not a publicly exposed ActivityWatch server. The local ActivityWatch server remains bound to localhost; the sync agent reads its REST API and uploads authenticated batches over HTTPS.

## First connection

1. Sign in to `aw.qsseda.com`.
2. Generate a device token.
3. On the ActivityWatch computer, set the token and run the agent with PowerShell 7:

```powershell
$env:AERTEX_WATCH_TOKEN = "<token>"
node .\AW-Sync\native\aw-sync.mjs --watch
```

Optional environment variables:

- `ACTIVITYWATCH_ORIGIN` defaults to `http://127.0.0.1:5600`.
- `AERTEX_WATCH_DATA_ORIGIN` defaults to `https://awd.qsseda.com`.
- `AERTEX_WATCH_INITIAL_DAYS` defaults to 30 for the first upload.
- `AERTEX_WATCH_STATE` overrides the local incremental-sync state path.

The agent deliberately overlaps the last two seconds of each bucket. The cloud worker deduplicates those events, so interrupted syncs can safely resume.
