# AERTEX Access Audit

AERTEX Access Audit records edge access events for the main AERTEX site, the Work custom domain, and the Auth custom domain.

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

The private viewer is available at:

```text
https://qsseda.com/zh-cn/admin/access-audit
https://qsseda.com/en/admin/access-audit
```

Both the page and its API require a valid AERTEX session plus the existing Supabase `is_admin` check. Non-admin access to the page returns a generic 404.

The API endpoint is:

```text
POST /api/admin/access-audit
```

Supported actions:

- `list` — list summaries with date and filters;
- `detail` — read one full audit JSON object;
- `summary` — aggregate one UTC day.

## Retention

The default retention period is 30 days. The main AERTEX Worker registers a daily cron at `03:17 UTC` and deletes older audit objects. The retention constant is `ACCESS_AUDIT_RETENTION_DAYS` in `studio/access-audit.js`.

Because raw IP addresses are personal data in many jurisdictions, retention should remain proportionate to the security/operations purpose and the site's privacy notice should accurately describe this logging.

## Cloudflare built-in logs

Wrangler Observability remains enabled at 100% head sampling for AERTEX, Work, and ID. Access Audit is an application-owned searchable archive in addition to Cloudflare's own invocation logs; it does not replace Cloudflare observability.
