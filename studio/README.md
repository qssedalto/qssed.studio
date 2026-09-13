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

- `ui-core.js` — shared HTML/runtime primitives plus cross-domain account/security audit runtime; product-specific Profile and Admin client applications have moved to their owning modules.
- `ui-shell.js` — Studio OS shell, navigation, top-level route dispatch, authorization/session bootstrap, shared status rendering and shared Hub composition.
- `ui-profile.js` — Phase 3A Profile-owned detail/account/preferences rendering and Profile-home personalization/link/media client runtime.
- `ui-settings.js` — Phase 3B Settings-owned General, Appearance, Language and Account & Security rendering.
- `ui-storage.js` — Phase 3B private Storage page rendering and browser client runtime; consumes the shared storage-size limit from `config.js`.
- `ui-admin.js` — Phase 3C Admin-owned General/Users/Roles/Logs/System rendering plus the Admin browser client application.
- `ui-dashboard.js` — Phase 3D Dashboard rendering, Dashboard icons and its visit-time/date/theme browser behavior.
- `ui-information.js` — Phase 3D Information route composition and route-owned Links/Notes/Summaries/Search rendering.
- `ui-workspace.js` — Phase 3D Workspace route rendering.
- `ui-styles.js` — Studio OS CSS; product-specific styles remain here until a later safe extraction requires moving them.
- `auth-pages.js` — Studio sign-up, login and not-found pages.

The `/profile`, `/settings`, and `/admin` Hubs remain in `ui-shell.js` because they use Hub-card primitives shared across product domains. Their route dispatchers also remain shell-owned composition points.

`statusContent()` remains shell-owned during Phase 3D. Information and Workspace receive it through their renderer calls instead of creating a new shared module; shared-layer normalization belongs to Phase 4.

Admin authorization remains shell-owned: `is_admin`, the Admin lock, warm snapshot restore and authenticated bootstrap are intentionally not part of `ui-admin.js`. Shared account/security audit client code also remains in `ui-core.js` because Profile Account and Settings Security consume the same login/device/audit runtime.

Detailed extraction boundaries:

- [`../docs/STUDIO_PHASE3_PROFILE_INVENTORY.md`](../docs/STUDIO_PHASE3_PROFILE_INVENTORY.md)
- [`../docs/STUDIO_PHASE3_SETTINGS_STORAGE_INVENTORY.md`](../docs/STUDIO_PHASE3_SETTINGS_STORAGE_INVENTORY.md)
- [`../docs/STUDIO_PHASE3_ADMIN_INVENTORY.md`](../docs/STUDIO_PHASE3_ADMIN_INVENTORY.md)
- [`../docs/STUDIO_PHASE3_CONTENT_INVENTORY.md`](../docs/STUDIO_PHASE3_CONTENT_INVENTORY.md)

## Original monolith

- 7544 lines
- 388760 bytes
