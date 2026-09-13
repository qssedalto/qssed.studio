# Studio Phase 3B — Settings + Storage UI inventory

This document freezes the ownership boundary for the second Phase 3 extraction slice. It follows the repository-wide staged modularization plan and intentionally leaves shared shell/audit primitives in place.

## Audited top-level boundaries

The pre-extraction `ui-shell.js` layout on main is:

```text
769  settingsHubContent
793  settingsGeneralContent
824  securityAuditContent
845  workspaceContent
...
957  storageSettingsContent
1096 storageClientScript
1658 settingsContent
1692 appearanceSettingsContent
1724 languageSettingsContent
```

`ui-core.js` keeps the shared account/security audit runtime. In particular, `hydrateProfileAudit()` renders both Profile Account and Settings Security targets, and `renderSecurityAudit()` owns the `audit-current-device`, `audit-device-list`, `audit-login-timeline`, and `audit-risk-alerts` elements.

## Settings-owned routes

- `/settings` — Settings hub
- `/settings/general`
- `/settings/appearance`
- `/settings/language`
- `/settings/security`
- `/settings/notifications`
- `/settings/ai`
- `/settings/integrations`
- `/settings/storage`

Localized `/zh-cn/*` and `/en/*` prefixes remain an existing routing concern and are unchanged.

## Phase 3B ownership decision

### Move to `ui-settings.js`

- `settingsGeneralContent`
- `securityAuditContent`
- `appearanceSettingsContent`
- `languageSettingsContent`

`settingsGeneralContent` currently calls the shared `osHubIcon()` primitive. Phase 3B must **not** move or duplicate that shared Hub primitive. Instead the shell supplies the icon renderer to the Settings renderer as a dependency, preserving output while avoiding a circular import.

### Move to `ui-storage.js`

- `storageSettingsContent`
- `storageClientScript`
- the `MAX_STORAGE_FILE_BYTES` UI/runtime dependency moves with the Storage client module

Storage UI is a natural child boundary of Settings because it has a dedicated route, dedicated client runtime, and a stable backend contract in `storage-api.js`.

### Keep in `ui-shell.js`

- `settingsHubContent`
- shared `osHubIcon` / `osHubCard` / `osHubGrid`
- `settingsContent(path, zh)` route dispatch
- shared `statusContent()` used by multiple product domains
- shell script ordering and session bootstrap

The `/settings` Hub remains in the shell because its card renderer is shared with Profile and Admin. `settingsContent()` remains composition/dispatch logic, which is an appropriate long-term shell responsibility.

### Keep in `ui-core.js`

- `auditClientScript`
- `hydrateProfileAudit`
- `renderSecurityAudit`
- device/login-history loading and shared audit cache behavior

Although `securityAuditContent()` markup belongs to Settings, the data runtime is cross-domain: Profile Account and Settings Security share login/device/audit data. Moving the runtime into Settings would create a new inverse dependency and violate the Phase 3 product boundary.

## Expected dependency direction after Phase 3B

```text
ui-shell
├── ui-profile
├── ui-settings
│   └── receives shared Hub icon renderer from shell at render time
├── ui-storage
├── ui-core (shared audit/admin/runtime remains for later slices)
└── ui-styles

ui-storage ──> config.js (MAX_STORAGE_FILE_BYTES)
```

No `ui-settings -> ui-shell` import is allowed.

## Behavior contracts to preserve

### Settings rendering

For both Chinese and English, these route outputs must be byte-identical to main before extraction:

```text
/settings
/settings/general
/settings/appearance
/settings/language
/settings/security
/settings/notifications
/settings/ai
/settings/integrations
/settings/storage
```

The `/settings` hub stays in the shell and is included in the differential test to prove the shared Hub path was not disturbed.

### Storage client runtime

For both languages and a fixed login URL:

```text
pre-extraction storageClientScript(zh, loginUrl)
== post-extraction ui-storage.storageClientScript(zh, loginUrl)
```

The rendered browser script, not just raw source, is the comparison target.

### Security audit runtime

`ui-core.js` is not modified in this slice. Therefore the shared Profile Account / Settings Security client runtime must remain byte-identical by construction.

## Phase 3B must not

- move shared Hub primitives;
- move or rewrite `auditClientScript`;
- change Profile Account behavior;
- change Storage API routes or R2 isolation;
- change `MAX_STORAGE_FILE_BYTES` value;
- change Settings copy, routes, UI, or persistence claims;
- create placeholder persistence for Notifications/AI/Integrations;
- redesign appearance/language controls;
- reorganize CSS merely to make files smaller;
- touch Admin extraction;
- perform Phase 4 shared-runtime cleanup.

## Verification before merge

1. capture all Settings route render outputs from pre-extraction main;
2. capture Chinese and English Storage client script output from pre-extraction main;
3. apply guarded source extraction;
4. validate every Studio JavaScript file with `node --check`;
5. prove all Settings route outputs remain byte-identical;
6. prove Storage rendered browser script remains byte-identical;
7. assert Settings/Storage definitions no longer remain in `ui-shell.js` except `settingsHubContent` and `settingsContent` dispatch;
8. assert `ui-core.js` is untouched by the extraction;
9. Wrangler Studio dry-run bundle must succeed;
10. Cloudflare branch Preview and standard Studio Worker Check must succeed;
11. production deployment must succeed after merge.
