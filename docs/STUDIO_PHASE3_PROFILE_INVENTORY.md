# Studio Phase 3A — Profile domain inventory

This inventory is the prerequisite for the first Phase 3 extraction. It records ownership before code moves so the refactor follows product/data-flow boundaries rather than line count.

## Profile-owned routes

- `/profile` — Profile hub (currently built with shared Hub-card primitives)
- `/profile/details` — profile identity, personalization, links, media editors
- `/profile/account` — account/login/audit view
- `/profile/preferences` — Profile preference entry page

Localized `/zh-cn/*` and `/en/*` prefixes are applied by the existing router and are not changed by this refactor.

## Profile-owned server-rendered markup in `ui-shell.js`

### Clearly Profile-owned

- `profileContent(path, zh)`
  - `/profile/details`
  - `/profile/account`
  - `/profile/preferences`
- `accountAuditContent(zh)`

### Profile-related but intentionally left in the shell for this slice

- `profileHubContent(zh)`

`profileHubContent` is currently built on `osHubGrid` / `osHubCard` / `osHubIcon`, which are shared by Profile, Admin and Settings. Moving the shared Hub primitives now would be shared-layer restructuring rather than Profile extraction, so the `/profile` hub remains in `ui-shell.js` during Phase 3A.

The shell dispatcher will therefore own `/profile` itself while delegating `/profile/*` product pages to the Profile module.

## Profile-owned client runtime currently embedded in `ui-core.js`

The block marked `/* PROFILE_HOME_V3 */` is Profile-home-specific and can move as one unit without taking shared audit/security code with it.

It owns:

- `PROFILE_HOME_CACHE_PREFIX = "qssed-profile-home-v3:"`
- `profileHomeState`
- Profile personalization normalization/rendering
- link-library rendering/edit/add/delete behavior
- profile sheet open/close behavior
- personalization save behavior
- Profile media validation/upload behavior
- avatar update behavior
- custom background upload/clear behavior
- Profile control bindings
- `hydrateProfileHome(user)`

### Data touched by the Profile-home runtime

Supabase tables:

- `profile_personalization`
- `profile_links`
- `profiles` (avatar URL update)

Supabase Storage buckets:

- `avatars`
- `profile-media`

Browser cache:

- `sessionStorage["qssed-profile-home-v3:<user-id>"]`

## Shared audit/session runtime that must stay shared in Phase 3A

The surrounding `auditClientScript(ipInfo)` also owns behavior used outside Profile and must **not** move wholesale into the Profile domain.

Shared or cross-domain responsibilities include:

- device ID and user-agent parsing
- `updateCurrentDevice(user)`
- login/device audit reads
- account audit rendering
- Settings Security rendering
- `hydrateProfileAudit(user)` because it hydrates both Profile Account and Settings Security targets
- shared audit formatting/escaping

Existing cache keys that remain in the shared audit runtime:

- `qssed-profile-summary-v2`
- `qssed-profile-audit-v2`

`hydrateProfileSummary(user)` also remains in the shared audit/runtime script during this slice because it is adjacent to and currently coordinated with the existing Profile/audit cache lifecycle. Separating that cache layer safely can be considered in a later Profile-only slice or Phase 4 after consumers are clearer.

## Shell contract that must remain unchanged

The shell currently calls, for ordinary authenticated pages:

```text
updateCurrentDevice(user)
hydrateProfileSummary(user)
hydrateProfileHome(user)
hydrateProfileAudit(user)
```

Phase 3A must preserve those global function names and call order. `profileClientScript()` will therefore be emitted after `auditClientScript()` and before the shell bootstrap script, so the existing shell bootstrap does not need a behavior rewrite.

## Phase 3A extraction boundary

Move:

```text
ui-shell.js
  profileContent
  accountAuditContent
        ↓
  ui-profile.js

ui-core.js
  /* PROFILE_HOME_V3 */ ... hydrateProfileHome
        ↓
  ui-profile.js -> profileClientScript()
```

Keep:

```text
ui-shell.js
  profileHubContent
  shared Hub primitives
  route metadata/navigation
  shell/session bootstrap

ui-core.js
  auditClientScript shared audit/session code
  hydrateProfileSummary
  hydrateProfileAudit
  shared page/runtime primitives
```

## Invariants

Phase 3A must not:

- redesign Profile UI;
- change Profile copy or route names;
- rename cache keys;
- change Supabase table/bucket names;
- change RLS assumptions or authorization behavior;
- alter compact navigation;
- alter Admin or Settings behavior;
- change Auth/OAuth/PKCE behavior;
- reorganize shared Hub or style primitives merely to reduce file size.

## Verification

Before merge:

1. every Studio JavaScript file passes `node --check`;
2. Wrangler Studio dry-run bundle succeeds;
3. `ui-shell.js` no longer defines `profileContent` / `accountAuditContent`;
4. `ui-core.js` no longer contains the `PROFILE_HOME_V3` block;
5. `ui-profile.js` exports `profileContent` and `profileClientScript`;
6. shell script order remains `auditClientScript -> profileClientScript -> adminClientScript -> shell bootstrap`;
7. representative Profile/Account routes are compared against the pre-extraction output or smoke-tested in Preview;
8. production deployment succeeds after merge.
