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

- `ui-core.js` — shared HTML/runtime primitives plus cross-domain audit/security and Admin client runtime that has not yet been fully separated by product domain.
- `ui-shell.js` — Studio OS shell, navigation, route dispatch, bootstrap, shared Hub composition and remaining coarse product content.
- `ui-profile.js` — Phase 3A Profile-owned detail/account/preferences rendering and Profile-home personalization/link/media client runtime.
- `ui-settings.js` — Phase 3B Settings-owned General, Appearance, Language and Account & Security rendering.
- `ui-storage.js` — Phase 3B private Storage page rendering and browser client runtime; consumes the shared storage-size limit from `config.js`.
- `ui-styles.js` — Studio OS CSS; product-specific styles remain here until a later safe extraction requires moving them.
- `auth-pages.js` — Studio sign-up, login and not-found pages.

The `/profile` and `/settings` Hubs remain in `ui-shell.js` because they use Hub-card primitives shared across Profile, Admin and Settings. `settingsContent()` also remains in the shell as route composition/dispatch.

Shared account/security audit client code remains in `ui-core.js`: Profile Account and Settings Security consume the same login/device/audit runtime, so moving it into either product module would create the wrong ownership direction.

Detailed extraction boundaries:

- [`../docs/STUDIO_PHASE3_PROFILE_INVENTORY.md`](../docs/STUDIO_PHASE3_PROFILE_INVENTORY.md)
- [`../docs/STUDIO_PHASE3_SETTINGS_STORAGE_INVENTORY.md`](../docs/STUDIO_PHASE3_SETTINGS_STORAGE_INVENTORY.md)

## Original monolith

- 7544 lines
- 388760 bytes
