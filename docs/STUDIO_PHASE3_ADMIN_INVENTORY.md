# Studio Phase 3C — Admin domain inventory

This inventory freezes the ownership boundary for the third Phase 3 extraction slice. The goal is to move Admin-owned rendering and client application code without moving shell authorization, shared audit/runtime helpers, or shared Hub primitives.

## Admin-owned routes

- `/admin` — Admin hub, currently rendered with shared Hub-card primitives
- `/admin/general` — overview metrics, recent users/logs, risk signals
- `/admin/users` — user search/filter/list/detail and role/status administration UI
- `/admin/roles` — RBAC role cards and permission matrix
- `/admin/logs` — audit log filters, timeline and detail drawer
- `/admin/system` — current system-status placeholder

Localized `/zh-cn/*` and `/en/*` prefixes remain handled by the existing router and are not changed.

## Admin-owned server-rendered markup currently in `ui-shell.js`

### Move in Phase 3C

- `adminOverviewContent(zh)`
- `adminUsersContent(zh)`
- `adminRolesContent(zh)`
- `adminLogsContent(zh)`
- `/admin/system` detail markup

These belong to the Admin product domain and can move to `ui-admin.js` without moving shell authorization.

### Keep in `ui-shell.js`

- `adminHubContent(zh)`
- shared `osHubIcon` / `osHubCard` / `osHubGrid`
- `adminContent(path, zh)` route composition/dispatch
- `osPage(...)`
- `renderOsContent(...)`
- Admin path detection (`path.startsWith("/admin")`)
- Admin lock visibility
- `supabaseClient.rpc("is_admin")` authorization gate
- warm Admin snapshot restore
- shell/session bootstrap

`/admin` stays in the shell for this slice because its cards are built with the same shared Hub primitives used by Profile and Settings. Moving those primitives is shared-layer work and belongs to Phase 4, not the Admin extraction.

## Admin-owned client runtime currently in `ui-core.js`

Move the complete `adminClientScript(ipInfo)` renderer to `ui-admin.js` without rewriting its generated browser JavaScript.

It owns the Admin application state and behavior, including:

- `adminRequestContext`
- `adminState`
- Admin sessionStorage caches and fingerprints
- warm Admin view HTML cache writes
- overview/users/roles/logs hydration
- Admin localization of canonical role/status/action/severity/permission keys
- user search/filter/detail behavior
- role/status mutation flows
- RBAC permission editing/saving
- audit log filtering and drawer behavior
- Admin navigation bindings
- `hydrateAdminModule(user)`
- `clearAdminUiCaches()`

### Existing Admin cache contracts

Preserve exactly:

- `qssed-admin-overview-v1`
- `qssed-admin-users-v1`
- `qssed-admin-roles-v1`
- `qssed-admin-logs-v1`
- `qssed-admin-access-v1`
- `qssed-admin-view-v1:<pathname>`

## Shared runtime that must not move

Keep in `ui-core.js`:

- `baseHead`
- `supabaseScript`
- `auditClientScript`
- shared Profile/Settings security audit runtime
- `themeScript`
- top controls and shared theme/language primitives

Phase 3C must not use Admin extraction as an excuse to reorganize these shared primitives.

## Shell authorization contract that must remain unchanged

For an Admin route, the shell currently:

1. starts with Admin content hidden;
2. restores a cached Admin view only when the cached `qssed-admin-access-v1` user ID matches the current Supabase session;
3. obtains the current user and calls `supabaseClient.rpc("is_admin")`;
4. shows the Admin lock and hides content when authorization fails;
5. clears Admin UI caches on authorization failure;
6. stores `qssed-admin-access-v1` after authorization succeeds;
7. calls `hydrateAdminModule(data.user)`;
8. reveals Admin content;
9. updates current-device audit information.

Phase 3C must preserve this order and these global browser contracts.

## Script-order contract

The shell must continue to emit browser runtimes before its bootstrap script, preserving the existing dependency/order relationship:

```text
auditClientScript
profileClientScript
adminClientScript
shell bootstrap
```

Moving the JavaScript renderer between ES modules must not change the rendered `<script>` contents or execution order.

## Data/authorization invariants

Phase 3C must not change:

- `is_admin` authorization semantics;
- Admin RPC/table/storage contracts;
- canonical role/status/action/severity/permission keys;
- cache keys or warm-snapshot behavior;
- Admin route names or bilingual copy;
- Admin mutation behavior or audit logging;
- Profile/Settings audit behavior;
- Auth/OAuth/PKCE behavior;
- compact navigation;
- user-facing Admin visual design.

## Verification before merge

1. capture all six Admin route outputs for Chinese and English before extraction;
2. compare every corresponding route output byte-for-byte after extraction;
3. capture rendered `adminClientScript(ipInfo)` before extraction and compare byte-for-byte after moving it;
4. verify `ui-core.js` no longer owns `adminClientScript` and otherwise preserves its non-Admin rendered/runtime behavior;
5. verify `ui-shell.js` no longer owns the four Admin detail renderers, while keeping `adminHubContent` and authorization/bootstrap logic;
6. verify script order remains `audit -> profile -> admin -> bootstrap`;
7. run `node --check` for every Studio JavaScript file;
8. run Wrangler Studio dry-run bundle;
9. require the standard Studio Worker Check and Cloudflare branch Preview on the final PR head;
10. require production validation + Studio + Auth deployment after merge.
