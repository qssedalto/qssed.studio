# Studio Worker modules

The Studio Worker was extracted from the former monolithic `worker.js` in staged refactors. `worker.js` remains a compatibility facade that exports `studio/entry.js`.

Structural sequencing is frozen in [`../docs/STUDIO_WORKER_MODULARIZATION.md`](../docs/STUDIO_WORKER_MODULARIZATION.md). Do not split modules by file size alone.

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

- `ui-core.js` — shared HTML/runtime primitives plus cross-domain account/security audit runtime; product-specific Profile and Admin client applications live in their owning modules.
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

Phase 3 product ownership is now explicit. Product Hub renderers live with Profile/Admin/Settings, while the reusable Hub primitives (`osHubIcon`, `osHubCard`, `osHubGrid`) remain shell-owned. Likewise, `statusContent()` remains a shared shell primitive passed into Information/Workspace/Settings composition where required. Moving or normalizing those shared primitives is Phase 4 work, not Phase 3.

Admin authorization remains shell-owned: `is_admin`, the Admin lock, warm snapshot restore and authenticated bootstrap are intentionally not part of `ui-admin.js`. Shared account/security audit client code remains in `ui-core.js` because Profile Account and Settings Security consume the same login/device/audit runtime.

Detailed extraction boundaries:

- [`../docs/STUDIO_PHASE3_PROFILE_INVENTORY.md`](../docs/STUDIO_PHASE3_PROFILE_INVENTORY.md)
- [`../docs/STUDIO_PHASE3_SETTINGS_STORAGE_INVENTORY.md`](../docs/STUDIO_PHASE3_SETTINGS_STORAGE_INVENTORY.md)
- [`../docs/STUDIO_PHASE3_ADMIN_INVENTORY.md`](../docs/STUDIO_PHASE3_ADMIN_INVENTORY.md)
- [`../docs/STUDIO_PHASE3_CONTENT_INVENTORY.md`](../docs/STUDIO_PHASE3_CONTENT_INVENTORY.md)
- [`../docs/STUDIO_PHASE3_SHELL_INVENTORY.md`](../docs/STUDIO_PHASE3_SHELL_INVENTORY.md)

## Original monolith

- 7544 lines
- 388760 bytes
