# Studio Phase 3E — Shell composition boundary

This inventory freezes the final Phase 3 extraction slice. Product page implementations have already moved to their owning modules in Phase 3A–3D. Phase 3E removes the remaining product-specific Hub/fallback rendering from `ui-shell.js` while deliberately keeping genuine shell composition and shared UI primitives in place.

## Move to owning product modules

### Profile

Move `profileHubContent(zh)` to `ui-profile.js`.

The Hub continues to use the existing shared `osHubGrid()` implementation supplied by the shell. Phase 3E does not move or duplicate shared Hub primitives.

### Admin

Move `adminHubContent(zh)` to `ui-admin.js`.

`adminContent(path, zh)` remains a shell-owned route dispatcher because Admin authorization/render orchestration remains shell-owned. The dispatcher calls the Admin module renderers and receives the shared Hub renderer from the shell.

### Settings

Move `settingsHubContent(zh)` to `ui-settings.js`.

Also move the remaining generic Settings fallback/overview grid out of `settingsContent()` into a Settings-owned renderer. `settingsContent()` remains shell-owned as route composition and continues to inject shared helpers (`osHubGrid`, `osHubIcon`, `statusContent`) where needed.

## Keep in `ui-shell.js`

These are the intended stable Phase 3 shell responsibilities:

- `osPage(...)` full Studio shell composition;
- navigation/page metadata (`buildOsCopy`, `buildOsPages`);
- `renderOsNav(...)`;
- top-level `renderOsContent(...)` route dispatch;
- shared `statusContent(...)`;
- shared Hub primitives (`osHubIcon`, `osHubCard`, `osHubGrid`);
- Profile/Admin/Settings route composition calls;
- compact-navigation state and first-paint handling;
- sign-out/session bootstrap;
- Admin authorization gate, lock and warm snapshot restore;
- ordering/injection of shared and product client runtimes.

Keeping the shared Hub/status helpers in this file is intentional. Deciding whether those primitives belong in a new shared module is Phase 4 work after product ownership has stabilized.

## Invariants

Phase 3E must not:

- alter any public route or localized copy;
- alter Hub cards, order, links, icons, featured/tone metadata or markup;
- alter Settings fallback output;
- alter shell HTML or browser bootstrap behavior;
- alter compact navigation, sign-out or session behavior;
- alter Admin authorization/warm snapshot behavior;
- alter client script ordering;
- move shared Hub/status primitives to a new module;
- alter Profile, Settings, Storage, Admin, Information, Workspace or Dashboard behavior;
- begin Phase 4 cleanup or deduplication.

## Verification before merge

1. capture `renderOsContent()` output for every registered Studio OS route in Chinese and English before extraction;
2. compare every corresponding output byte-for-byte after extraction;
3. capture representative complete `osPage()` output across Dashboard/Profile/Admin/Settings and compare byte-for-byte;
4. verify the three Hub renderers no longer live in `ui-shell.js` and live in their owning modules;
5. verify the Settings fallback renderer no longer lives inline in `settingsContent()`;
6. verify `statusContent`, `osHubIcon`, `osHubCard`, `osHubGrid`, navigation metadata and all session/Admin authorization markers remain in `ui-shell.js`;
7. verify product modules do not import `ui-shell.js`;
8. run `node --check` for every Studio JavaScript file;
9. run Wrangler Studio dry-run bundle;
10. require standard Studio Worker Check + Cloudflare branch Preview on the final PR head;
11. require production validation + Studio + Auth deployment after merge.

After this slice is deployed, Phase 3 can be marked complete. Any further movement of shared Hub/status/runtime primitives belongs to Phase 4.
