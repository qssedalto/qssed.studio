# Studio Worker modules

Generated from the former monolithic `worker.js` without changing public routes. `worker.js` is retained as a compatibility facade that exports `studio/entry.js`.

## Modules

- `config.js` — shared constants, locale text, route sets and limits.
- `entry.js` — request routing and public Studio Worker entrypoint.
- `auth-handoff.js` — Auth → Studio browser session handoff.
- `routing.js` — locale/path normalization and shared HTTP response helpers.
- `storage-api.js` — R2 storage authorization, listing, upload, download and delete.
- `account-api.js` — registration, password login, server audit/logging helpers.
- `ui-core.js` — shared HTML head and client-side admin/audit/theme scripts.
- `ui-shell.js` — Studio OS shell, navigation, content panels and storage/settings UI.
- `ui-styles.js` — Studio OS CSS.
- `auth-pages.js` — Studio sign-up, login and not-found pages.

## Original monolith

- 7544 lines
- 388760 bytes
