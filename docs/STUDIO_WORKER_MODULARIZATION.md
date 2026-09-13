# QssedA Studio Worker modularization plan

> Status: **frozen sequencing guide**. Structural changes to the Studio Worker should follow this document unless the plan is explicitly revised first.

## Why this document exists

The original Studio Worker grew into a single `worker.js` of 7,544 lines / 388,760 bytes. PR #23 completed the first structural extraction into ES modules while preserving behavior.

A prior Codex discussion used a staged approach rather than a big-bang rewrite. The exact transient chat plan was not persisted in this repository, so this document records the **recovered plan based on the existing refactor history, current dependency graph, and the safety constraints already used by the project**. It is intentionally conservative: do not skip forward because a file is large.

## Current dependency graph

After Phase 2:

```text
worker.js
└── studio/entry.js
    ├── config.js
    ├── routing.js ────────────────> config.js
    ├── account-api.js ────────────> config.js, routing.js, server-runtime.js
    ├── storage-api.js ────────────> config.js, routing.js, server-runtime.js
    ├── auth-handoff.js ───────────> config.js, routing.js, ui-core.js
    ├── auth-pages.js ─────────────> config.js, routing.js, ui-core.js
    └── ui-shell.js ───────────────> config.js, html-utils.js, routing.js,
                                     ui-core.js, ui-styles.js

ui-core.js ────────────────────────> config.js, routing.js
ui-styles.js ──────────────────────> routing.js
server-runtime.js ─────────────────> no Studio-module dependency
html-utils.js ─────────────────────> no Studio-module dependency
```

Phase 2 removed the inappropriate generic-utility edges from Storage/UI into the Account domain:

```text
storage-api.js  -X-> account-api.js
ui-shell.js     -X-> account-api.js
```

`auth-handoff.js -> ui-core.js` remains intentionally: the handoff endpoint returns a browser page and currently consumes shared page primitives. Moving those primitives would begin shared UI/runtime restructuring, so that edge was reviewed but deliberately left for a later phase rather than forcing it into the backend cleanup.

`ui-core.js` and `ui-shell.js` are still coarse UI aggregation modules. Their size is now a Phase 3 concern, but they must be split by product/data-flow ownership rather than by line count.

## Phase status

| Phase | Goal | Status |
|---|---|---|
| 1 | Boundary extraction without business redesign | ✅ Complete — PR #23 |
| 2 | Backend/shared-server dependency separation | ✅ Complete — PR #25 |
| 3 | Frontend product-domain separation | ⏭️ Next |
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

Completed in PR #25:

- moved `getSupabaseSecret` and `workerLog` out of `account-api.js` into `server-runtime.js`;
- moved generic `escapeHtmlText` out of the Account domain into `html-utils.js`;
- changed `storage-api.js` to consume the shared server runtime instead of importing Account helpers;
- changed `ui-shell.js` to consume the neutral HTML helper instead of importing the Account API;
- reviewed `auth-handoff.js -> ui-core.js` and intentionally kept it because separating shared page primitives belongs to later UI/runtime work;
- preserved all public routes, the Auth/OAuth/PKCE protocol, the `STORAGE` R2 binding, UI output contracts and data model.

### Phase 2 verification

- exact-match guarded extraction was used so the moved helper implementations were not silently rewritten;
- all Studio JavaScript syntax checks passed;
- dependency-direction assertions passed;
- Wrangler Studio dry-run bundle passed;
- Cloudflare branch Preview deployment passed;
- production `Deploy QssedA Production #9` passed validation, Studio deployment and Auth deployment.

### Phase 2 rule

The backend/shared dependency cleanup is closed. Do not reopen it merely to perform opportunistic UI cleanup during Phase 3. If a new backend coupling bug is discovered, fix it as a focused prerequisite rather than mixing it into a product-domain extraction.

---

## Phase 3 — Frontend product-domain separation

**Goal:** split large UI aggregation modules by actual product ownership, now that server dependencies are clean.

### Discovery snapshot

The current `ui-shell.js` mixes several distinct responsibilities:

- shell composition, sidebar/navigation and compact-navigation state;
- authenticated-user bootstrap/sign-out behavior;
- route/page metadata and bilingual copy;
- Dashboard/Information/Workspace content;
- Profile page markup and editors;
- Settings content;
- Storage UI markup/client bootstrap;
- Admin shell authorization/bootstrap.

The current `ui-core.js` contains both genuinely shared primitives (`baseHead`, `supabaseScript`, `themeScript`, top controls) and product-specific client applications such as `auditClientScript` and `adminClientScript`.

That means Phase 3 must extract **one product domain at a time** while leaving shared shell/runtime primitives stable until their consumers are understood.

### Planned extraction order

The order below is a safety sequence, not a final naming mandate:

1. **Profile domain**
   - first candidate because its markup/editors and hydration behavior form a clear product boundary;
   - preserve profile/sessionStorage first-paint behavior and current Supabase contracts.
2. **Settings + Storage UI domain boundary**
   - separate Settings page rendering from the shell;
   - keep `storage-api.js` backend unchanged and preserve the existing Storage UI/API contract.
3. **Admin domain**
   - extract admin-specific rendering/client logic only after lower-risk domains prove the pattern;
   - preserve `is_admin`, warm snapshots, audit behavior and authorization gates exactly.
4. **Information + Workspace + Dashboard content**
   - move simple route-owned content out of shell composition without inventing persistence for unimplemented features.
5. **Shell/navigation composition**
   - only after product content has moved, reduce `ui-shell.js` to shell composition, navigation, route dispatch and session/bootstrap responsibilities.

`ui-core.js` shared primitives should not be broadly reorganized just to make files smaller. Product-specific code may move with its owning Phase 3 domain; genuinely shared runtime cleanup belongs to Phase 4.

### Expected direction

```text
ui-shell (composition/navigation/bootstrap)
├── profile domain
├── settings domain
│   └── storage UI
├── admin domain
├── information/workspace domain
└── dashboard domain

ui-core
├── shared page/runtime primitives
└── product-specific client code gradually moves to its domain
```

### Phase 3 rules

- move one product domain at a time;
- use a separate PR for each meaningful extraction slice, even though they all belong to Phase 3;
- preserve the current first-paint/sessionStorage behavior unless a separate feature change is requested;
- preserve compact-navigation behavior;
- preserve bilingual routing/copy behavior;
- keep Admin authorization checks intact;
- keep Storage UI/API contract intact;
- do not redesign user-facing UI during structural extraction;
- verify each extracted domain before extracting the next one.

### Exit criteria

- `ui-shell.js` becomes primarily composition/navigation/bootstrap rather than a container for every product page;
- `ui-core.js` no longer contains large product-specific client applications such as Admin code unless there is a documented reason;
- each product domain has a clear owner/boundary;
- bundle, route and browser smoke tests pass for every extraction slice;
- production deployment succeeds after the final Phase 3 slice.

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
- archive or relocate historical snapshots that are not part of runtime;
- reconsider small remaining edges such as shared handoff/page primitives only when the stable consumers are known.

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
9. Do not mix a later phase into the active phase; during Phase 3, move one product domain at a time.
10. If a change needs behavior changes to make extraction possible, split the behavior change into a separate PR first.

## How Codex / ChatGPT should continue

Before making a structural Studio change:

1. Read this document.
2. Identify the active phase.
3. Show which dependency edge is being removed or which product domain is being extracted.
4. Refuse to opportunistically perform later-phase cleanup in the same PR.
5. Run the phase exit checks before merge.
6. Update the phase status here only after the phase has actually passed verification and production deployment.

## Next concrete task

The next structural PR should be the **first Phase 3 slice: Profile domain extraction**.

Before changing code, inventory all Profile-owned markup, client functions, cache keys and Supabase/storage interactions across `ui-shell.js`, `ui-core.js` and styles. Then move only the Profile-owned logic while preserving the shell/bootstrap contract.

Do not combine Settings, Admin, Storage, shared theme/runtime cleanup, or visual redesign with that PR.
