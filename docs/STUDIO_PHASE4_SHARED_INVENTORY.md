# Studio Phase 4 — shared-layer inventory and sequence

This document freezes the initial Phase 4 shared-layer cleanup plan after Phase 3 product ownership became stable. Phase 4 removes mixed shared responsibilities and unnecessary dependency edges; it is not permission for a rewrite, framework migration, visual redesign, or behavior change.

## Implementation status

- **Phase 4A — complete:** the shared account/device/audit browser runtime lives in `ui-audit.js` with rendered output preserved.
- **Phase 4B — complete:** neutral shared page infrastructure lives in `ui-page.js`; the former `ui-core.js` ownership name is gone.
- **Phase 4C — complete:** shared status/Hub render primitives live in `ui-primitives.js`, removing Shell-owned function injection into product modules.
- **Phase 4D — complete:** only clearly bounded product CSS was extracted verbatim: Profile → `ui-style-profile.js`, Admin polish → `ui-style-admin.js`, Dashboard → `ui-style-dashboard.js`. Remaining Settings/Storage/Audit/Shell/Hub CSS stays aggregated because responsive/accessibility blocks intentionally cross ownership boundaries. Global CSS custom properties remain owned by `ui-page.js`.
- **Phase 4E — in progress:** dead compatibility imports/helpers, historical snapshots and naming/directory leftovers are audited one evidence-backed item at a time.

## Starting point

Phase 3 completed product-domain ownership:

- `ui-profile.js` — Profile rendering, Hub and Profile client application;
- `ui-settings.js` — Settings rendering, Hub and fallback overview;
- `ui-storage.js` — private Storage UI/client runtime;
- `ui-admin.js` — Admin rendering, Hub and Admin client application;
- `ui-dashboard.js` — Dashboard;
- `ui-information.js` — Information;
- `ui-workspace.js` — Workspace;
- `ui-shell.js` — shell composition/navigation/dispatch/session/authorization plus shared Hub/status primitives;
- `ui-core.js` — shared page primitives plus the cross-page account/device/audit browser runtime.

The Phase 4 audit found that the remaining mixed responsibilities now have stable consumers and can be cleaned up one boundary at a time.

## Current import graph relevant to Phase 4

```text
auth-handoff.js
└── ui-core.js
    ├── baseHead
    └── supabaseScript

auth-pages.js
└── ui-core.js
    ├── baseHead
    ├── supabaseScript
    ├── auditClientScript
    ├── topControls
    └── themeScript

ui-shell.js
└── ui-core.js
    ├── baseHead
    ├── supabaseScript
    ├── auditClientScript
    ├── topControls
    └── themeScript
```

`ui-core.js` currently exports:

```text
baseHead
supabaseScript
auditClientScript
themeToggle
languageToggle
topControls
themeScript
```

`themeToggle` and `languageToggle` are internal building blocks used by `topControls`; the externally stable page consumers are the three files above.

## Shared browser audit runtime

`auditClientScript(ipInfo)` is a single contiguous browser-runtime renderer. It has two stable page consumers:

- `auth-pages.js`
- `ui-shell.js`

It is self-contained at the ES-module level: it does not call other `ui-core.js` module functions. Its generated browser code assumes that `supabaseScript()` has already created the global `supabaseClient`, which is an existing page-order contract and must remain unchanged.

### Browser globals/contracts produced by the audit runtime

The rendered script provides functions consumed outside its own body, including:

- `getAuditDeviceId()`
- `updateCurrentDevice(user)`
- `clearProfileUiCaches()`
- `hydrateProfileSummary(user)`
- `hydrateProfileAudit(user)`

Other rendering/device/audit helpers are currently implementation details inside the same generated script.

### Auth-page dependency

The login page directly relies on the audit runtime:

- sends `getAuditDeviceId()` as `device_id` to `/api/auth/login`;
- calls `clearProfileUiCaches()` after a successful session is installed;
- awaits `updateCurrentDevice(authData.user)` before redirecting to Dashboard.

The signup page currently emits the same audit runtime as part of its existing page output even though its signup flow does not directly call the Profile hydration functions. Phase 4 structural extraction must preserve the complete rendered page output unless a separate behavior change later removes unnecessary runtime intentionally.

### Studio-shell dependency

The authenticated Studio shell relies on:

- `updateCurrentDevice(user)`;
- `clearProfileUiCaches()` during sign-out/session failure;
- `hydrateProfileSummary(user)`;
- `hydrateProfileAudit(user)`.

Profile Account and Settings Security also continue to share the same audit data/cache lifecycle.

### Audit runtime persistent contracts

Do not change in the extraction:

Browser storage keys:

- `qssed-device-id`
- `qssed-profile-summary-v2`
- `qssed-profile-audit-v2`

Supabase data contracts include:

- `profiles`
- `login_events`
- `user_devices`

Generated function names, DOM IDs, device persistence behavior, query limits, ordering, rendering text and error behavior are part of the current behavior baseline for structural refactoring.

## Shell shared render primitives

The audit also confirmed a second stable shared boundary:

```text
statusContent
├── ui-information.js
├── ui-workspace.js
└── ui-shell.js / Settings composition

osHubIcon
├── ui-settings.js
└── ui-shell.js

osHubGrid
├── ui-profile.js
├── ui-admin.js
├── ui-settings.js
└── ui-shell.js
```

These currently work through explicit function injection from `ui-shell.js`. This is structurally imperfect but safe and explicit. Because it does not create a bad product-to-product dependency, it is **not** the first Phase 4 target.

## Phase 4 sequence

The sequence below is now frozen unless this document is explicitly revised before implementation.

### Phase 4A — isolate the shared audit runtime

Create `ui-audit.js` and move **exactly** `auditClientScript(ipInfo)` out of `ui-core.js`.

Update only the stable consumers:

```text
auth-pages.js ──> ui-audit.js
ui-shell.js    ──> ui-audit.js
```

Leave `auth-handoff.js` untouched in this slice.

Required invariants:

- rendered `auditClientScript(testIp)` is byte-identical before/after;
- login/signup page HTML is byte-identical in both languages;
- representative Studio shell pages are byte-identical;
- browser global function names remain unchanged;
- cache keys, Supabase tables and device/audit behavior remain unchanged;
- `ui-core.js` differs only by exact removal of the audit renderer.

### Phase 4B — neutral shared page primitives

After 4A is production-stable, inventory and extract the genuinely shared page infrastructure currently left in `ui-core.js`, likely including:

- `baseHead`;
- `supabaseScript`;
- `topControls` and its `themeToggle` / `languageToggle` helpers;
- `themeScript`.

The target should be a neutral shared page/runtime module rather than another product domain. This slice is the appropriate place to remove the long-postponed dependency:

```text
auth-handoff.js -X-> ui-core.js
```

Do not decide the final module name or exact grouping by file size; verify the actual consumers immediately before implementation.

### Phase 4C — shared Hub/status render primitives

Only after 4A/4B are stable, consider moving:

- `statusContent`;
- `osHubIcon`;
- `osHubCard`;
- `osHubGrid`.

The purpose would be to remove function injection from product modules and give these genuinely shared render components a neutral owner. Output must remain byte-identical.

### Phase 4D — style/shared-token cleanup

Review `ui-styles.js` only after shared render/runtime ownership is stable. Extract or normalize styles only when there is clear shared/product ownership benefit. Do not redesign visuals during cleanup.

### Phase 4E — final dead-code/history/naming consolidation

After all runtime boundaries are stable:

- identify dead compatibility helpers;
- normalize names/directories only where it materially improves ownership;
- archive/relocate historical snapshots that are not runtime inputs;
- remove obsolete temporary compatibility paths only with evidence that no consumer remains.

## Explicitly out of scope for Phase 4 structural PRs

- framework migration;
- visual redesign;
- route changes;
- Auth/OAuth/PKCE protocol changes;
- R2 contract or isolation changes;
- Supabase schema/RLS changes;
- replacing current browser caches;
- changing Admin authorization semantics;
- combining multiple Phase 4 slices because they happen to touch the same old file.

Behavior improvements discovered during cleanup should be filed as separate focused changes rather than hidden inside structural PRs.

## Verification policy

Every Phase 4 code slice must, at minimum:

1. capture the relevant rendered output before extraction;
2. compare it byte-for-byte after extraction when structural equivalence is expected;
3. prove unrelated source regions are unchanged when practical;
4. run `node --check` across all Studio JavaScript;
5. run Wrangler Studio dry-run bundle;
6. require the standard Studio Worker Check on the final PR head;
7. require Cloudflare branch Preview on the final PR head;
8. require production `Validate Workers`, Studio deployment and Auth deployment after merge.

## Next concrete task

Continue **Phase 4E** with evidence-backed cleanup only. The first confirmed dead item is the unused `json` import in `ui-shell.js`; after removing it, audit historical snapshots, obsolete compatibility helpers and naming/directory leftovers one item at a time. Every runtime-affecting slice must retain the Phase 4 byte-equivalence and deployment gates.
