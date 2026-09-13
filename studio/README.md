# Studio Worker modules

The Studio Worker was extracted from the former monolithic `worker.js` in staged refactors. `worker.js` remains a compatibility facade that exports `studio/entry.js`.

Structural sequencing is frozen in [`../docs/STUDIO_WORKER_MODULARIZATION.md`](../docs/STUDIO_WORKER_MODULARIZATION.md). Phase 4 shared-layer sequencing is recorded in [`../docs/STUDIO_PHASE4_SHARED_INVENTORY.md`](../docs/STUDIO_PHASE4_SHARED_INVENTORY.md). Do not split modules by file size alone.

## Server and routing modules

- `config.js` — shared constants, locale text, route sets and limits.
- `entry.js` — request routing and public Studio Worker entrypoint.
- `auth-handoff.js` — Auth → Studio browser session handoff.
- `routing.js` — locale/path normalization and shared HTTP response helpers.
- `server-runtime.js` — neutral protected server helpers and structured Worker logging.
- `html-utils.js` — neutral HTML escaping helpers.
- `storage-api.js` — R2 storage authorization, listing, upload, download and delete.
- `account-api.js` — registration, password login and account/login auditing behavior.

## UI modules

- `ui-page.js` — Phase 4B neutral shared page infrastructure: page head, Supabase bootstrap, top controls and theme/language runtime. It is consumed by Auth handoff, Auth pages and the authenticated Studio shell.
- `ui-audit.js` — Phase 4A shared account/device/audit browser runtime used by Auth pages and the authenticated Studio shell. It preserves the existing browser globals, cache keys and Supabase audit/device contracts.
- `ui-primitives.js` — Phase 4C neutral shared render primitives for status cards and Hub icon/card/grid rendering. Product modules import these directly instead of receiving Shell-owned functions as parameters.
- `ui-shell.js` — stable Studio OS composition layer: shell HTML, navigation/page metadata, top-level route dispatch, authorization/session bootstrap and client-runtime ordering.
- `ui-profile.js` — Profile detail/account/preferences rendering, Profile Hub, and Profile-home personalization/link/media client runtime.
- `ui-settings.js` — Settings Hub, General/Appearance/Language/Account & Security rendering, and the Settings fallback overview.
- `ui-storage.js` — private Storage page rendering and browser client runtime; consumes the shared storage-size limit from `config.js`.
- `ui-admin.js` — Admin Hub, General/Users/Roles/Logs/System rendering, and the Admin browser client application.
- `ui-dashboard.js` — Dashboard rendering, Dashboard icons and its visit-time/date/theme browser behavior.
- `ui-information.js` — Information route composition and route-owned Links/Notes/Summaries/Search rendering.
- `ui-workspace.js` — Workspace route rendering.
- `ui-styles.js` — Studio OS style aggregator and remaining shared/product CSS in original output order.
- `ui-style-profile.js` — Phase 4D Profile-owned CSS fragment extracted verbatim from `ui-styles.js` and reinserted at the original output position.
- `ui-style-admin.js` — Phase 4D Admin-owned polish CSS fragment extracted verbatim from `ui-styles.js` and reinserted at the original output position.
- `ui-style-dashboard.js` — Phase 4D Dashboard-owned CSS fragment extracted verbatim from the final `DASHBOARD_APPLE_V2` section of `ui-styles.js` and reinserted at the original output position.
- `auth-pages.js` — Studio sign-up, login and not-found pages.

Phase 3 product ownership is explicit. Product Hub renderers live with Profile/Admin/Settings.

Phase 4A isolates the previously mixed audit runtime without changing its page order or browser API. Auth login still uses `getAuditDeviceId()`, `clearProfileUiCaches()` and `updateCurrentDevice()`, while the Studio shell still consumes `updateCurrentDevice()`, `hydrateProfileSummary()` and `hydrateProfileAudit()` from the rendered audit script.

Phase 4B renames the remaining neutral `ui-core.js` page infrastructure to `ui-page.js` without changing generated HTML. This removes the misleading `ui-core` ownership name and makes the shared dependency used by `auth-handoff.js`, `auth-pages.js` and `ui-shell.js` explicit.

Phase 4C moves `statusContent()`, `osHubIcon()`, `osHubCard()` and `osHubGrid()` out of `ui-shell.js` into `ui-primitives.js`. Profile, Admin, Settings, Information and Workspace now consume those neutral render primitives directly; no product module depends on `ui-shell.js`.

Phase 4D extracts only clearly bounded product CSS while preserving emitted CSS byte-for-byte. The Profile `PROFILE_HOME_V3` block lives in `ui-style-profile.js`, the `ADMIN_UI_POLISH_V1` block lives in `ui-style-admin.js`, and the final `DASHBOARD_APPLE_V2` block lives in `ui-style-dashboard.js`. Global CSS custom properties remain owned by `ui-page.js`; they are not duplicated into product style modules.

Phase 4E removes only evidence-backed dead/history artifacts. The unused `json` routing import has been removed from `ui-shell.js`; the historical `qsseda-worker-pre-repair-2026-09-08.js` monolith and the browser-saved `Qssed_A's Studio.html` plus its local asset folder are removed from the current tree because they are not Wrangler entrypoints or runtime/workflow dependencies. Their contents remain recoverable from Git history.

Admin authorization remains shell-owned: `is_admin`, the Admin lock, warm snapshot restore and authenticated bootstrap are intentionally not part of `ui-admin.js`.

Detailed boundaries:

- [`../docs/STUDIO_PHASE3_PROFILE_INVENTORY.md`](../docs/STUDIO_PHASE3_PROFILE_INVENTORY.md)
- [`../docs/STUDIO_PHASE3_SETTINGS_STORAGE_INVENTORY.md`](../docs/STUDIO_PHASE3_SETTINGS_STORAGE_INVENTORY.md)
- [`../docs/STUDIO_PHASE3_ADMIN_INVENTORY.md`](../docs/STUDIO_PHASE3_ADMIN_INVENTORY.md)
- [`../docs/STUDIO_PHASE3_CONTENT_INVENTORY.md`](../docs/STUDIO_PHASE3_CONTENT_INVENTORY.md)
- [`../docs/STUDIO_PHASE3_SHELL_INVENTORY.md`](../docs/STUDIO_PHASE3_SHELL_INVENTORY.md)
- [`../docs/STUDIO_PHASE4_SHARED_INVENTORY.md`](../docs/STUDIO_PHASE4_SHARED_INVENTORY.md)

## Original monolith

- 7544 lines
- 388760 bytes
