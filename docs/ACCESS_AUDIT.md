# AERTEX Access Audit

AERTEX Access Audit records security-relevant edge events for the main AERTEX site, Work, Auth, and the isolated Administration control plane.

It intentionally does **not** archive every request. Routine successful GET/HEAD traffic and low-value anonymous 404 noise are left to Cloudflare observability instead of creating one R2 object per request.

## Storage

Audit objects are written to the existing private R2 binding under the reserved prefix:

```text
__system/access-audit/YYYY/MM/DD/<reverse-timestamp>-<request-id>.json
```

The normal Storage API only exposes `users/<user-id>/<object-id>` and never lists or resolves `__system/`, so audit objects are not reachable through user file APIs.

## Captured fields

Each record contains:

- exact UTC timestamp and millisecond timestamp;
- visitor timezone and a timezone-local timestamp when Cloudflare supplies a timezone;
- raw `CF-Connecting-IP`;
- request host, method, path, sanitized query parameters, and sanitized Referer;
- response status, content type, cache policy, and request duration;
- country, region, city, Cloudflare colo, ASN, AS organization, HTTP protocol, TLS version/cipher, and TCP RTT when available;
- raw User-Agent;
- inferred device type, broad device name, operating system, browser, and in-app browser (`WeChat`, `WeCom`, `ChatGPT`, etc.);
- Client Hints when the client voluntarily supplies them;
- Cloudflare verified-bot and bot-score fields when available;
- booleans indicating whether Cookie or Authorization headers were present, without storing their values.

## Never captured

The audit writer must not persist:

- Cookie values;
- Authorization or bearer-token values;
- request bodies;
- form values;
- passwords;
- OAuth/session/token query values;
- sensitive query values matching token/code/secret/password/session/auth/key/signature/credential/cookie/JWT/state/email/phone patterns.

Sensitive query values are replaced with `[REDACTED]` before persistence.

## Administrator access

The viewer is part of the isolated control plane:

```text
https://admin.qsseda.com/access
```

The page is never served by the main product domain. The Administration Worker requires a valid short-lived administrator session and revalidates it against the live account role/status and the matching Supabase Auth `session_id`. Revoked or expired Auth sessions therefore lose administrator access without waiting for stale role claims to age out. Non-admin and unknown administrator routes return a generic 404.

The control-plane API endpoint is:

```text
POST https://admin.qsseda.com/api/admin/access-audit
```

Equivalent `admin.qsseda.online` and `admin.qsseda.studio` family hosts use their matching root domain.

Supported actions:

- `list` — list summaries with date and filters;
- `detail` — read one full audit JSON object;
- `summary` — aggregate one UTC day.

## Retention

The default application retention period is 14 days. The main AERTEX Worker registers a daily cron at `03:17 UTC` as a fallback cleanup path, and the production R2 bucket also carries a prefix-scoped lifecycle rule for `__system/access-audit/`. The retention constant is `ACCESS_AUDIT_RETENTION_DAYS` in `studio/access-audit.js`.

The application keeps:
- non-GET/HEAD requests;
- authentication/administrator/storage-sensitive routes;
- HTTP 401, 403, and 429 responses;
- HTTP 5xx responses.

Routine GET/HEAD success responses and ordinary 404 scanner noise are not persisted as individual R2 JSON objects.

Because raw IP addresses are personal data in many jurisdictions, retention should remain proportionate to the security/operations purpose and the site's privacy notice should accurately describe this logging.

## Cloudflare built-in logs

Wrangler Observability remains enabled for AERTEX, Work, ID, Intelligence, and Administration. Access Audit is an application-owned searchable archive in addition to Cloudflare's own invocation logs; it does not replace Cloudflare observability.
