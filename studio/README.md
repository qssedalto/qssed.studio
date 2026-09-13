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
- `ui-shell.js` — stable Studio OS composition layer: shell HTML, navigation/page metadata, top-level route dispatch, shared status/Hub primitives, authorization/session bootstrap and client-runtime ordering.
- `ui-profile.js` — Profile detail/account/preferences rendering, Profile Hub, and Profile-home personalization/link/media client runtime.
- `ui-settings.js` — Settings Hub, General/Appearance/Language/Account & Security rendering, and the Settings fallback overview.
- `ui-storage.js` — private Storage page rendering and browser client runtime; consumes the shared storage-size limit from `config.js`.
- `ui-admin.js` — Admin Hub, General/Users/Roles/Logs/System rendering, and the Admin browser client application.
- `ui-dashboard.js` — Dashboard rendering, Dashboard icons and its visit-time/date/theme browser behavior.
- `ui-information.js` — Information route composition and route-owned Links/Notes/Summaries/Search rendering.
- `ui-workspace.js` — Workspace route rendering.
- `ui-styles.js` — Studio OS CSS; product-specific styles remain here until a later safe extraction requires moving them.
- `auth-pages.js` — Studio sign-up, login and not-found pages.

Phase 3 product ownership is explicit. Product Hub renderers live with Profile/Admin/Settings, while the reusable Hub primitives (`osHubIcon`, `osHubCard`, `osHubGrid`) remain shell-owned. Likewise, `statusContent()` remains a shared shell primitive passed into Information/Workspace/Settings composition where required.

Phase 4A isolates the previously mixed audit runtime without changing its page order or browser API. Auth login still uses `getAuditDeviceId()`, `clearProfileUiCaches()` and `updateCurrentDevice()`, while the Studio shell still consumes `updateCurrentDevice()`, `hydrateProfileSummary()` and `hydrateProfileAudit()` from the rendered audit script.

Phase 4B renames the remaining neutral `ui-core.js` page infrastructure to `ui-page.js` without changing generated HTML. This removes the misleading `ui-core` ownership name and makes the shared dependency used by `auth-handoff.js`, `auth-pages.js` and `ui-shell.js` explicit.

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
