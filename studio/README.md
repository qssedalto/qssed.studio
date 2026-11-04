# Studio Worker modules

The Studio Worker was extracted from the former monolithic `worker.js` in staged refactors. Production `wrangler.jsonc` uses `studio/worker-audit.js` as its audited entrypoint, wrapping `worker.js` for security/routing and then `studio/entry.js` for Studio pages. See the [Chinese beginner code guide](../docs/BEGINNER_CODE_GUIDE_CN.md) for a source-verified reading sequence.

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
- `ui-dashboard.js` — Dashboard rendering, Dashboard icons and its visit-time/date/theme browser behavior.
- `ui-information.js` — Information route composition and route-owned Links/Notes/Summaries/Search rendering; delegates the Knowledge Base route tree to `ui-knowledge.js`.
- `ui-knowledge.js` — Knowledge Base root/category/article composition for 54 bilingual routes.
- `knowledge-search.js` — hybrid literal search across built-in knowledge and the current user’s Supabase `knowledge_documents`; supports phrases and single CJK characters.
- `ui-navigation.js` — deterministic compact/mobile back targets with safe Knowledge Base history preservation.
- `knowledge-routes.js` — six-category, 47-topic Knowledge Base route schema shared by routing and rendering.
- `knowledge-projects.js`, `knowledge-technology.js`, `knowledge-study.js`, `knowledge-methodology.js`, `knowledge-references.js`, `knowledge-archive.js` — detailed bilingual long-term knowledge content by category.
- `ui-style-knowledge.js` — responsive and accessible Knowledge Base UI styles.
- `ui-workspace.js` — Workspace route rendering.
- `ui-styles.js` — Studio OS style aggregator and remaining shared/product CSS in original output order.
- `ui-style-profile.js` — Phase 4D Profile-owned CSS fragment extracted verbatim from `ui-styles.js` and reinserted at the original output position.
- `ui-style-dashboard.js` — Phase 4D Dashboard-owned CSS fragment extracted verbatim from the final `DASHBOARD_APPLE_V2` section of `ui-styles.js` and reinserted at the original output position.
- `auth-pages.js` — Studio sign-up, login and not-found pages.

Phase 3 product ownership was explicit for the historical monolith. Administrator rendering has since moved out of Studio into the dedicated `admin/` control-plane application.

Phase 4A isolates the previously mixed audit runtime without changing its page order or browser API. Auth login still uses `getAuditDeviceId()`, `clearProfileUiCaches()` and `updateCurrentDevice()`, while the Studio shell still consumes `updateCurrentDevice()`, `hydrateProfileSummary()` and `hydrateProfileAudit()` from the rendered audit script.

Phase 4B renames the remaining neutral `ui-core.js` page infrastructure to `ui-page.js` without changing generated HTML. This removes the misleading `ui-core` ownership name and makes the shared dependency used by `auth-handoff.js`, `auth-pages.js` and `ui-shell.js` explicit.

Phase 4C moves `statusContent()`, `osHubIcon()`, `osHubCard()` and `osHubGrid()` out of `ui-shell.js` into `ui-primitives.js`. Profile, Settings, Information and Workspace consume those neutral render primitives directly; no product module depends on `ui-shell.js` merely to receive shared primitives.

Phase 4D originally extracted clearly bounded product CSS. After the administrator control-plane split, Studio retains the Profile `PROFILE_HOME_V3` block in `ui-style-profile.js` and the Dashboard `DASHBOARD_APPLE_V2` block in `ui-style-dashboard.js`; administrator styling is owned exclusively by `admin/ui.js`.

Phase 4E is complete. It removed the unused `json` routing import and non-runtime historical/browser-saved snapshots while retaining the top-level Supabase baseline SQL because the incremental migration chain still assumes those baseline objects exist. Phase 4 is now closed; future structural work should start from a concrete requirement rather than file size alone.

Administrator authorization is no longer shell-owned. Studio contains no administrator page routes or administrator client runtime; `admin.qsseda.com` establishes a separate short-lived host-only control-plane session only after the server verifies the current database role/status and a live matching Supabase Auth session. Privileged database implementations live in the non-exposed `aertex_private` schema while public administrator RPC names are thin `SECURITY INVOKER` wrappers.

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
