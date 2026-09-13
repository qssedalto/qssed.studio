# QssedA Studio Worker modularization plan

> Status: **frozen sequencing guide**. Structural changes to the Studio Worker should follow this document unless the plan is explicitly revised first.

## Why this document exists

The original Studio Worker grew into a single `worker.js` of 7,544 lines / 388,760 bytes. PR #23 completed the first structural extraction into ES modules while preserving behavior.

A prior Codex discussion used a staged approach rather than a big-bang rewrite. The exact transient chat plan was not persisted in this repository, so this document records the **recovered plan based on the existing refactor history, current dependency graph, and the safety constraints already used by the project**. It is intentionally conservative: do not skip forward because a file is large.

## Current dependency graph

```text
worker.js
└── studio/entry.js
    ├── config.js
    ├── routing.js ────────────────> config.js
    ├── account-api.js ────────────> config.js, routing.js
    ├── storage-api.js ────────────> config.js, routing.js, account-api.js
    ├── auth-handoff.js ───────────> config.js, routing.js, ui-core.js
    ├── auth-pages.js ─────────────> config.js, routing.js, ui-core.js
    └── ui-shell.js ───────────────> config.js, routing.js, account-api.js,
                                     ui-core.js, ui-styles.js

ui-core.js ────────────────────────> config.js, routing.js
ui-styles.js ──────────────────────> no Studio-module dependency
```

The graph is deliberately recorded because it shows that Phase 1 is an extraction, not the final architecture. In particular:

- `storage-api.js` currently imports server helpers from `account-api.js`.
- `ui-shell.js` currently imports `escapeHtmlText` from `account-api.js`.
- `auth-handoff.js` mixes handoff/server behavior with a small HTML response dependency on `ui-core.js`.
- `ui-core.js` and `ui-shell.js` remain the two large UI aggregation modules.

Those dependencies are **not** a reason to jump directly into UI splitting. They define the work for the next phase.

## Phase status

| Phase | Goal | Status |
|---|---|---|
| 1 | Boundary extraction without business redesign | ✅ Complete — PR #23 |
| 2 | Backend/shared-server dependency separation | ⏭️ Next |
| 3 | Frontend product-domain separation | ⛔ Blocked until Phase 2 is complete |
| 4 | Shared UI/runtime cleanup and final consolidation | ⛔ Blocked until Phase 3 is stable |

---

## Phase 1 — Boundary extraction

**Goal:** make the monolith navigable without changing public behavior.

Completed in PR #23:

- `worker.js` retained as the Wrangler compatibility facade.
- request routing moved to `studio/entry.js`.
- account, storage, Auth handoff, routing, configuration and UI blocks moved into responsibility-based files.
- `studio/**` was connected to syntax/bundle CI and production deployment.
- old and new Worker behavior was compared across 12 smoke-test routes before merge.

### Phase 1 rule

Files created in this phase are **coarse boundaries**, not promises that each file is a permanent final module.

---

## Phase 2 — Backend/shared-server dependency separation

**Goal:** remove inappropriate cross-domain dependencies in server-side code before touching the large UI domains.

### Required work

1. Extract shared Supabase/server access helpers from `account-api.js`.
   - `getSupabaseSecret`
   - authenticated server REST/RPC helpers where appropriate
   - shared active-profile/session verification where it is genuinely common

2. Extract Worker/server logging helpers from `account-api.js`.
   - `workerLog`
   - shared structured audit/logging helpers that are not account-specific

3. Move generic escaping/helper code out of `account-api.js`.
   - `escapeHtmlText` belongs in a neutral HTML/shared utility module, not the account domain.

4. Make `storage-api.js` depend on shared server utilities rather than the account domain.

5. Make `ui-shell.js` stop depending on `account-api.js` for generic rendering helpers.

6. Review `auth-handoff.js` boundaries.
   - preserve the existing handoff protocol and iOS compatibility behavior.
   - only separate response rendering from handoff verification if it reduces coupling without changing behavior.

### Suggested target dependency direction

```text
entry
├── account-api
├── storage-api
├── auth-handoff
├── auth-pages
└── ui-shell

account-api ─┐
storage-api ─┼──> server/supabase + server/logging + shared/html + config/routing
auth-handoff ┘

UI modules must not import account/storage API modules merely to obtain generic utilities.
```

The exact filenames may differ; the **dependency direction** is the requirement.

### Phase 2 must NOT do

- do not split Dashboard/Profile/Admin/Settings/Storage UI into separate product modules yet.
- do not redesign the Auth/OAuth/PKCE protocol.
- do not change public route names.
- do not rename the `STORAGE` binding.
- do not redesign user-facing UI as part of the structural PR.
- do not combine unrelated feature work with the refactor.

### Exit criteria

Phase 2 is complete only when:

- backend domains no longer depend on another backend domain just for generic utilities;
- UI code no longer imports an API domain just for generic utilities;
- JavaScript syntax checks pass;
- Wrangler Studio dry-run bundle passes;
- representative route/API behavior is smoke-tested against the pre-refactor baseline;
- production route names and bindings remain unchanged.

---

## Phase 3 — Frontend product-domain separation

**Goal:** split large UI aggregation modules by actual product ownership, after server dependencies are clean.

Only begin after Phase 2 exits cleanly.

### Candidate product domains

- Dashboard
- Profile
- Admin
- Settings
- Storage UI
- Information / knowledge pages
- shell/navigation/compact-navigation runtime

The exact final files should be selected by inspecting functions and data flow at the start of Phase 3. Do **not** split by line count alone.

### Expected direction

```text
ui-shell (composition only)
├── dashboard
├── profile
├── admin
├── settings
├── storage
└── information

shared UI/runtime remains central only when it is truly shared.
```

### Phase 3 rules

- move one product domain at a time;
- preserve the current first-paint/sessionStorage behavior unless a separate feature change is requested;
- preserve compact-navigation behavior;
- preserve bilingual routing/copy behavior;
- keep Admin authorization checks intact;
- keep Storage UI/API contract intact;
- verify each extracted domain before extracting the next one.

### Exit criteria

- `ui-shell.js` becomes primarily composition/navigation rather than a container for every product page;
- `ui-core.js` no longer contains large product-specific client applications such as Admin code unless there is a documented reason;
- each product domain has a clear owner/boundary;
- bundle, route and browser smoke tests pass.

---

## Phase 4 — Shared-layer cleanup and final consolidation

**Goal:** remove duplication only after product boundaries are stable.

Potential work:

- shared UI components and rendering helpers;
- common client runtime/session/cache utilities;
- style tokens and genuinely shared style primitives;
- duplicated response/error helpers;
- naming/directory normalization;
- dead compatibility helpers discovered after domain extraction;
- archive or relocate historical snapshots that are not part of runtime.

### Phase 4 must NOT become a rewrite

The project should remain a Cloudflare Worker application with the existing public contracts unless a separate architecture decision explicitly changes that. Do not introduce a framework merely because the files have been modularized.

---

## Invariants for every phase

These are non-negotiable unless a separate reviewed change intentionally modifies them:

1. `worker.js` remains the Studio Wrangler compatibility entrypoint until there is a reason to change the deployment contract.
2. Existing public route semantics remain stable during structural refactors.
3. `auth.qsseda.studio` remains an independent Auth service.
4. OAuth/PKCE security behavior is not weakened by Studio modularization.
5. R2 user isolation and the `STORAGE` binding remain intact.
6. Supabase secrets stay in protected runtime configuration, never source control.
7. Structural changes require syntax + Wrangler bundle validation.
8. Large structural changes should use a branch/PR, not direct production edits.
9. One modularization phase per PR. Do not mix Phase 2 and Phase 3 work.
10. If a change needs behavior changes to make extraction possible, split the behavior change into a separate PR first.

## How Codex / ChatGPT should continue

Before making a structural Studio change:

1. Read this document.
2. Identify the active phase.
3. Show which dependency edge is being removed or which domain is being extracted.
4. Refuse to opportunistically perform later-phase cleanup in the same PR.
5. Run the phase exit checks before merge.
6. Update the phase status here only after the phase has actually passed verification and production deployment.

## Next concrete task

The next structural PR should be **Phase 2 only** and should start with the smallest high-value dependency cleanup:

```text
account-api.js
  ├── generic Supabase/server helpers  ──> shared server module
  ├── generic logging helpers          ──> shared logging module
  └── generic HTML escaping            ──> shared HTML utility

storage-api.js and ui-shell.js
  └── switch to the new shared modules
```

Do not split `ui-core.js` or `ui-shell.js` into Dashboard/Admin/Profile/etc. in that PR.
