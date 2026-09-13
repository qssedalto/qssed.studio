# QssedA Studio Worker modularization plan

> Status: **completed sequencing record**. Phases 1–4 are production-verified. This document now records the constraints and results of the structural modularization rather than an active extraction queue.

## Why this document exists

The original Studio Worker grew into a single `worker.js` of 7,544 lines / 388,760 bytes. The project deliberately used staged, behavior-preserving extraction instead of a framework rewrite or big-bang split.

## Current architecture after Phase 4

`worker.js` remains the Wrangler compatibility facade and exports `studio/entry.js`. The Studio implementation is divided by responsibility:

- server/routing: `config.js`, `entry.js`, `routing.js`, `server-runtime.js`, `html-utils.js`, `account-api.js`, `storage-api.js`, `auth-handoff.js`;
- shared page/runtime: `ui-page.js`, `ui-audit.js`, `ui-primitives.js`, `ui-shell.js`, `ui-styles.js`;
- product domains: `ui-profile.js`, `ui-settings.js`, `ui-storage.js`, `ui-admin.js`, `ui-dashboard.js`, `ui-information.js`, `ui-workspace.js`;
- clearly owned product CSS: `ui-style-profile.js`, `ui-style-admin.js`, `ui-style-dashboard.js`;
- Studio public auth UI: `auth-pages.js`.

No product module depends on `ui-shell.js` merely to receive Hub/status render functions; those neutral primitives live in `ui-primitives.js`. The shared account/device/audit browser runtime lives in `ui-audit.js`, while common page head/Supabase/top-controls/theme infrastructure lives in `ui-page.js`.

## Phase status

| Phase | Goal | Status |
|---|---|---|
| 1 | Boundary extraction without business redesign | ✅ Complete — PR #23 |
| 2 | Backend/shared-server dependency separation | ✅ Complete — PR #25 |
| 3 | Frontend product-domain separation | ✅ Complete — PRs #27–#31 |
| 4 | Shared UI/runtime cleanup and final consolidation | ✅ Complete |

## Phase 1 — boundary extraction

- retained `worker.js` as the Wrangler compatibility facade;
- moved routing and coarse responsibility blocks into `studio/`;
- connected Studio modules to syntax/bundle CI and production deployment;
- preserved public behavior through route smoke tests.

## Phase 2 — backend/shared-server dependency separation

- moved protected server helpers to `server-runtime.js`;
- moved neutral HTML escaping to `html-utils.js`;
- removed inappropriate Storage/UI → Account helper dependencies;
- kept browser-page dependencies for later UI/runtime phases rather than forcing unrelated changes.

## Phase 3 — frontend product-domain separation

Completed in five production-verified slices:

- **3A / PR #27 — Profile:** Profile rendering and personalization/link/media runtime → `ui-profile.js`;
- **3B / PR #28 — Settings + Storage:** Settings → `ui-settings.js`, Storage UI/runtime → `ui-storage.js`;
- **3C / PR #29 — Admin:** Admin rendering/client application → `ui-admin.js`, while shell authorization remained shell-owned;
- **3D / PR #30 — Dashboard + Information + Workspace:** route-owned content → its product modules;
- **3E / PR #31 — Shell boundary:** remaining product Hubs/fallback rendering moved to product owners, leaving `ui-shell.js` focused on composition/navigation/dispatch/session/authorization.

## Phase 4 — shared-layer cleanup and final consolidation

Phase 4 was executed as narrow, production-gated slices:

- **4A:** moved the cross-page account/device/audit browser runtime to `ui-audit.js`;
- **4B:** renamed the remaining neutral `ui-core.js` page infrastructure to `ui-page.js`;
- **4C:** moved `statusContent()`, `osHubIcon()`, `osHubCard()`, and `osHubGrid()` to `ui-primitives.js`;
- **4D:** extracted only the clearly bounded Profile, Admin-polish, and Dashboard CSS fragments. Mixed Settings/Storage/Audit/Shell/Hub responsive and accessibility CSS intentionally remains aggregated in `ui-styles.js`;
- **4E:** removed a confirmed dead routing import and non-runtime historical/browser-saved snapshots from the active tree while retaining recovery through Git history.

The final 4E audit intentionally retained `supabase_admin_tables.sql` and `supabase_audit_tables.sql`: current migrations contain hardening/ALTER operations that assume those baseline objects already exist. They should be removed only after a complete baseline migration is created and clean-database reconstruction is verified.

Detailed Phase 4 evidence and invariants remain in [`STUDIO_PHASE4_SHARED_INVENTORY.md`](./STUDIO_PHASE4_SHARED_INVENTORY.md).

## Structural invariants

These remain non-negotiable unless a separate reviewed behavior/architecture change explicitly modifies them:

1. `worker.js` remains the Studio Wrangler compatibility entrypoint until the deployment contract is intentionally changed.
2. Public route semantics remain stable during behavior-neutral refactors.
3. `auth.qsseda.studio` remains an independent Auth service.
4. OAuth/PKCE security behavior must not be weakened by Studio changes.
5. R2 user isolation and the `STORAGE` binding remain intact.
6. Supabase secrets remain in protected runtime configuration, never source control.
7. Structural runtime changes require JavaScript syntax checks and Wrangler bundle validation.
8. Material structural changes use branch/PR review rather than direct production edits.
9. Byte-for-byte rendered-output comparison is preferred when structural equivalence is expected.
10. Behavior changes discovered during cleanup are separate focused changes, not hidden inside refactors.

## After Phase 4

There is no automatic Phase 5 extraction queue. Future work should begin from a concrete product, reliability, security, performance, or maintainability requirement. Do not reopen modularization solely because a remaining file is large.
