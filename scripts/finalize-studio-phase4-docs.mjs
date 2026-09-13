import fs from 'node:fs';

const rootReadme = `# QssedA Studio

QssedA Studio is a Cloudflare Workers + Supabase application with a separate identity service at \`auth.qsseda.studio\`.

## Runtime architecture

\`worker.js\` remains the Studio Wrangler compatibility entrypoint and exports the implementation from \`studio/entry.js\`.

\`studio/\` is responsibility-based:

- server/routing: \`entry.js\`, \`routing.js\`, \`server-runtime.js\`, \`html-utils.js\`, \`account-api.js\`, \`storage-api.js\`, \`auth-handoff.js\`, \`config.js\`;
- shared UI/runtime: \`ui-page.js\`, \`ui-audit.js\`, \`ui-primitives.js\`, \`ui-shell.js\`, \`ui-styles.js\`;
- product UI: \`ui-profile.js\`, \`ui-settings.js\`, \`ui-storage.js\`, \`ui-admin.js\`, \`ui-dashboard.js\`, \`ui-information.js\`, \`ui-workspace.js\`;
- product-owned style fragments: \`ui-style-profile.js\`, \`ui-style-admin.js\`, \`ui-style-dashboard.js\`;
- public Studio login/sign-up/not-found UI: \`auth-pages.js\`.

The independent Auth service uses:

- \`auth-entry.js\` — Auth entrypoint and PKCE self-test dispatch;
- \`auth-worker.js\` — browser Auth/session/account/Studio handoff;
- \`auth-oauth.js\` — OAuth 2.0 Authorization Code + PKCE and protected introspection;
- \`auth-pkce-test.js\` — browser PKCE self-test.

Cloudflare R2 storage is bound as \`STORAGE\` to \`qsseda-studio-storage\`.

## Studio routes and contracts

Public Studio server routes include:

- \`POST /api/auth/signup\`
- \`POST /api/auth/login\`
- \`POST /auth/handoff\`
- \`GET /api/storage/files\`
- \`POST /api/storage/upload\`
- \`GET|DELETE /api/storage/object\`
- localized Studio UI routes under \`/zh-cn/*\` and \`/en/*\`

Auth/OAuth/PKCE, Supabase RLS, R2 isolation, browser cache keys and Admin authorization are separate behavioral contracts; structural module cleanup must not silently change them.

## Supabase schema history

The current repository has two layers of SQL history:

1. \`supabase_admin_tables.sql\` and \`supabase_audit_tables.sql\` are the existing bootstrap/baseline SQL that create foundational Studio tables, functions and policies such as \`profiles\`, RBAC/admin objects, \`login_events\` and \`user_devices\`.
2. \`supabase/migrations/\` contains later incremental hardening, registration/profile and OAuth migrations. Some of those migrations use \`ALTER\` statements against baseline objects, so they are not a complete empty-database bootstrap by themselves.

Do **not** remove the two baseline SQL files until their definitions have been converted into a complete ordered migration baseline and a clean database can be rebuilt from that chain.

## Studio modularization status

The staged structural modularization is complete:

1. ✅ Phase 1 — boundary extraction (PR #23)
2. ✅ Phase 2 — backend/shared-server dependency separation (PR #25)
3. ✅ Phase 3 — frontend product-domain separation (PRs #27–#31)
4. ✅ Phase 4 — shared-layer cleanup and final consolidation (PRs #34 onward)

Phase 4 produced neutral shared page/audit/render modules, extracted only clearly owned product CSS, removed a confirmed dead import, and removed non-runtime historical/browser-saved snapshots from the current tree. Remaining mixed responsive/accessibility CSS stays aggregated where ownership genuinely crosses products.

Detailed sequencing and invariants are recorded in:

- [\`docs/STUDIO_WORKER_MODULARIZATION.md\`](./docs/STUDIO_WORKER_MODULARIZATION.md)
- [\`docs/STUDIO_PHASE4_SHARED_INVENTORY.md\`](./docs/STUDIO_PHASE4_SHARED_INVENTORY.md)
- [\`studio/README.md\`](./studio/README.md)

## Auth service

See [\`AUTH_PORTAL.md\`](./AUTH_PORTAL.md) for browser sessions, Studio handoff, OAuth 2.0 + PKCE, token rotation/revocation and resource-server token introspection.

## CI/CD

- \`Studio Worker Check\` syntax-checks every \`studio/*.js\` module and runs a Wrangler dry-run bundle.
- \`Auth Worker Check\` validates and bundles the independent Auth Worker.
- \`Deploy QssedA Production\` validates and deploys Studio and Auth from \`main\` after relevant runtime files change.
- Cloudflare branch previews are required for structural Studio PRs before merge.

## Development safety

For structural/runtime changes:

1. keep secrets in Cloudflare/GitHub protected configuration, never source control;
2. preserve public route and authorization contracts unless a separate behavior change explicitly changes them;
3. run JavaScript syntax checks and Wrangler dry-run bundling;
4. use focused branch/PR slices for material structural work;
5. compare rendered output byte-for-byte when a refactor is expected to be behavior-neutral;
6. require production validation plus Studio/Auth deployment after merge.

Git history is the recovery mechanism for previous implementations and historical snapshots; large obsolete snapshots should not be kept in the active repository tree solely as backups.
`;
fs.writeFileSync('ReadMe.md', rootReadme);

let auth = fs.readFileSync('AUTH_PORTAL.md', 'utf8');
const oldAuthDeploy = 'Production deployment validates and deploys both `auth-worker.js` and the OAuth module `auth-oauth.js`.';
const newAuthDeploy = 'Production deployment validates and deploys the complete Auth entry graph: `auth-entry.js`, `auth-worker.js`, `auth-oauth.js`, and `auth-pkce-test.js`.';
if (!auth.includes(oldAuthDeploy)) throw new Error('AUTH_PORTAL deployment anchor not found');
auth = auth.replace(oldAuthDeploy, newAuthDeploy);
fs.writeFileSync('AUTH_PORTAL.md', auth);

let phase4 = fs.readFileSync('docs/STUDIO_PHASE4_SHARED_INVENTORY.md', 'utf8');
phase4 = phase4.replace('- **Phase 4E — in progress:** dead compatibility imports/helpers, historical snapshots and naming/directory leftovers are audited one evidence-backed item at a time.', '- **Phase 4E — complete:** removed the confirmed dead `json` routing import and non-runtime historical/browser-saved snapshots, while retaining the top-level Supabase baseline SQL because the current migration chain still depends on pre-existing baseline objects.');
phase4 = phase4.replace('## Current import graph relevant to Phase 4', '## Starting import graph relevant to Phase 4');
phase4 = phase4.replace('`ui-core.js` currently exports:', '`ui-core.js` originally exported:');
phase4 = phase4.replace('These currently work through explicit function injection from `ui-shell.js`. This is structurally imperfect but safe and explicit. Because it does not create a bad product-to-product dependency, it is **not** the first Phase 4 target.', 'At the start of Phase 4 these worked through explicit function injection from `ui-shell.js`. Phase 4C moved them to `ui-primitives.js`, so product modules now consume the neutral primitives directly.');
phase4 = phase4.replace(/## Next concrete task[\s\S]*$/, `## Phase 4 completion\n\nPhase 4 is closed. 4A isolated the shared audit runtime, 4B established the neutral shared page module, 4C moved shared Hub/status primitives to a neutral owner, 4D extracted only clearly bounded product CSS, and 4E removed evidence-backed dead/history artifacts without deleting the still-required Supabase bootstrap SQL.\n\nFuture feature or behavior work should be scoped independently rather than reopening Phase 4 merely to make files smaller. If the database bootstrap is later consolidated, first create a complete ordered baseline migration and prove a clean Supabase database can be rebuilt from migrations alone before removing the top-level baseline SQL.\n`);
fs.writeFileSync('docs/STUDIO_PHASE4_SHARED_INVENTORY.md', phase4);

const modularization = `# QssedA Studio Worker modularization plan\n\n> Status: **completed sequencing record**. Phases 1–4 are production-verified. This document now records the constraints and results of the structural modularization rather than an active extraction queue.\n\n## Why this document exists\n\nThe original Studio Worker grew into a single \`worker.js\` of 7,544 lines / 388,760 bytes. The project deliberately used staged, behavior-preserving extraction instead of a framework rewrite or big-bang split.\n\n## Current architecture after Phase 4\n\n\`worker.js\` remains the Wrangler compatibility facade and exports \`studio/entry.js\`. The Studio implementation is divided by responsibility:\n\n- server/routing: \`config.js\`, \`entry.js\`, \`routing.js\`, \`server-runtime.js\`, \`html-utils.js\`, \`account-api.js\`, \`storage-api.js\`, \`auth-handoff.js\`;\n- shared page/runtime: \`ui-page.js\`, \`ui-audit.js\`, \`ui-primitives.js\`, \`ui-shell.js\`, \`ui-styles.js\`;\n- product domains: \`ui-profile.js\`, \`ui-settings.js\`, \`ui-storage.js\`, \`ui-admin.js\`, \`ui-dashboard.js\`, \`ui-information.js\`, \`ui-workspace.js\`;\n- clearly owned product CSS: \`ui-style-profile.js\`, \`ui-style-admin.js\`, \`ui-style-dashboard.js\`;\n- Studio public auth UI: \`auth-pages.js\`.\n\nNo product module depends on \`ui-shell.js\` merely to receive Hub/status render functions; those neutral primitives live in \`ui-primitives.js\`. The shared account/device/audit browser runtime lives in \`ui-audit.js\`, while common page head/Supabase/top-controls/theme infrastructure lives in \`ui-page.js\`.\n\n## Phase status\n\n| Phase | Goal | Status |\n|---|---|---|\n| 1 | Boundary extraction without business redesign | ✅ Complete — PR #23 |\n| 2 | Backend/shared-server dependency separation | ✅ Complete — PR #25 |\n| 3 | Frontend product-domain separation | ✅ Complete — PRs #27–#31 |\n| 4 | Shared UI/runtime cleanup and final consolidation | ✅ Complete |\n\n## Phase 1 — boundary extraction\n\n- retained \`worker.js\` as the Wrangler compatibility facade;\n- moved routing and coarse responsibility blocks into \`studio/\`;\n- connected Studio modules to syntax/bundle CI and production deployment;\n- preserved public behavior through route smoke tests.\n\n## Phase 2 — backend/shared-server dependency separation\n\n- moved protected server helpers to \`server-runtime.js\`;\n- moved neutral HTML escaping to \`html-utils.js\`;\n- removed inappropriate Storage/UI → Account helper dependencies;\n- kept browser-page dependencies for later UI/runtime phases rather than forcing unrelated changes.\n\n## Phase 3 — frontend product-domain separation\n\nCompleted in five production-verified slices:\n\n- **3A / PR #27 — Profile:** Profile rendering and personalization/link/media runtime → \`ui-profile.js\`;\n- **3B / PR #28 — Settings + Storage:** Settings → \`ui-settings.js\`, Storage UI/runtime → \`ui-storage.js\`;\n- **3C / PR #29 — Admin:** Admin rendering/client application → \`ui-admin.js\`, while shell authorization remained shell-owned;\n- **3D / PR #30 — Dashboard + Information + Workspace:** route-owned content → its product modules;\n- **3E / PR #31 — Shell boundary:** remaining product Hubs/fallback rendering moved to product owners, leaving \`ui-shell.js\` focused on composition/navigation/dispatch/session/authorization.\n\n## Phase 4 — shared-layer cleanup and final consolidation\n\nPhase 4 was executed as narrow, production-gated slices:\n\n- **4A:** moved the cross-page account/device/audit browser runtime to \`ui-audit.js\`;\n- **4B:** renamed the remaining neutral \`ui-core.js\` page infrastructure to \`ui-page.js\`;\n- **4C:** moved \`statusContent()\`, \`osHubIcon()\`, \`osHubCard()\`, and \`osHubGrid()\` to \`ui-primitives.js\`;\n- **4D:** extracted only the clearly bounded Profile, Admin-polish, and Dashboard CSS fragments. Mixed Settings/Storage/Audit/Shell/Hub responsive and accessibility CSS intentionally remains aggregated in \`ui-styles.js\`;\n- **4E:** removed a confirmed dead routing import and non-runtime historical/browser-saved snapshots from the active tree while retaining recovery through Git history.\n\nThe final 4E audit intentionally retained \`supabase_admin_tables.sql\` and \`supabase_audit_tables.sql\`: current migrations contain hardening/ALTER operations that assume those baseline objects already exist. They should be removed only after a complete baseline migration is created and clean-database reconstruction is verified.\n\nDetailed Phase 4 evidence and invariants remain in [\`STUDIO_PHASE4_SHARED_INVENTORY.md\`](./STUDIO_PHASE4_SHARED_INVENTORY.md).\n\n## Structural invariants\n\nThese remain non-negotiable unless a separate reviewed behavior/architecture change explicitly modifies them:\n\n1. \`worker.js\` remains the Studio Wrangler compatibility entrypoint until the deployment contract is intentionally changed.\n2. Public route semantics remain stable during behavior-neutral refactors.\n3. \`auth.qsseda.studio\` remains an independent Auth service.\n4. OAuth/PKCE security behavior must not be weakened by Studio changes.\n5. R2 user isolation and the \`STORAGE\` binding remain intact.\n6. Supabase secrets remain in protected runtime configuration, never source control.\n7. Structural runtime changes require JavaScript syntax checks and Wrangler bundle validation.\n8. Material structural changes use branch/PR review rather than direct production edits.\n9. Byte-for-byte rendered-output comparison is preferred when structural equivalence is expected.\n10. Behavior changes discovered during cleanup are separate focused changes, not hidden inside refactors.\n\n## After Phase 4\n\nThere is no automatic Phase 5 extraction queue. Future work should begin from a concrete product, reliability, security, performance, or maintainability requirement. Do not reopen modularization solely because a remaining file is large.\n`;
fs.writeFileSync('docs/STUDIO_WORKER_MODULARIZATION.md', modularization);

let studioReadme = fs.readFileSync('studio/README.md', 'utf8');
const phase4eSentence = /Phase 4E removes only evidence-backed dead\/history artifacts\.[^\n]*/;
if (!phase4eSentence.test(studioReadme)) throw new Error('studio README Phase 4E anchor not found');
studioReadme = studioReadme.replace(phase4eSentence, 'Phase 4E is complete. It removed the unused `json` routing import and non-runtime historical/browser-saved snapshots while retaining the top-level Supabase baseline SQL because the incremental migration chain still assumes those baseline objects exist. Phase 4 is now closed; future structural work should start from a concrete requirement rather than file size alone.');
fs.writeFileSync('studio/README.md', studioReadme);

console.log('Phase 4 completion documentation finalized.');
