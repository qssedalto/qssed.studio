# QssedA Studio

QssedA Studio is a Cloudflare Workers + Supabase application with a separate identity service at `auth.qsseda.studio`, a standalone Work surface at `work.qsseda.studio`, and an independent AI interface at `gpt.qsseda.studio`.

## Runtime architecture

`worker.js` remains the Studio Wrangler compatibility entrypoint and exports the implementation from `studio/entry.js`.

`studio/` is responsibility-based:

- server/routing: `entry.js`, `routing.js`, `server-runtime.js`, `html-utils.js`, `account-api.js`, `storage-api.js`, `auth-handoff.js`, `config.js`;
- shared UI/runtime: `ui-page.js`, `ui-audit.js`, `ui-primitives.js`, `ui-shell.js`, `ui-styles.js`;
- product UI: `ui-profile.js`, `ui-settings.js`, `ui-storage.js`, `ui-admin.js`, `ui-dashboard.js`, `ui-information.js`, `ui-workspace.js`;
- product-owned style fragments: `ui-style-profile.js`, `ui-style-admin.js`, `ui-style-dashboard.js`;
- public Studio login/sign-up/not-found UI: `auth-pages.js`.

The independent Auth service uses:

- `auth-entry.js` — Auth entrypoint and PKCE self-test dispatch;
- `auth-worker.js` — browser Auth/session/account/Studio handoff;
- `auth-oauth.js` — OAuth 2.0 Authorization Code + PKCE and protected introspection;
- `auth-pkce-test.js` — browser PKCE self-test.

Cloudflare R2 storage is bound as `STORAGE` to `qsseda-studio-storage`.

The independent GPT surface uses:

- `gpt-worker.js` — standalone AI interface entrypoint, localized shell, health endpoint and security headers;
- `wrangler.gpt.jsonc` — Cloudflare Worker configuration binding the custom domain `gpt.qsseda.studio`.

The GPT surface intentionally starts as an isolated interface boundary so chat, model selection, history and AI tools can evolve without coupling those concerns to the main Studio Worker.

## Studio routes and contracts

Public Studio server routes include:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /auth/handoff`
- `GET /api/storage/files`
- `POST /api/storage/upload`
- `GET|DELETE /api/storage/object`
- localized Studio UI routes under `/zh-cn/*` and `/en/*`

Auth/OAuth/PKCE, Supabase RLS, R2 isolation, browser cache keys and Admin authorization are separate behavioral contracts; structural module cleanup must not silently change them.

## Supabase schema history

The current repository has two layers of SQL history:

1. `supabase_admin_tables.sql` and `supabase_audit_tables.sql` are the existing bootstrap/baseline SQL that create foundational Studio tables, functions and policies such as `profiles`, RBAC/admin objects, `login_events` and `user_devices`.
2. `supabase/migrations/` contains later incremental hardening, registration/profile and OAuth migrations. Some of those migrations use `ALTER` statements against baseline objects, so they are not a complete empty-database bootstrap by themselves.

Do **not** remove the two baseline SQL files until their definitions have been converted into a complete ordered migration baseline and a clean database can be rebuilt from that chain.

## Studio modularization status

The staged structural modularization is complete:

1. ✅ Phase 1 — boundary extraction (PR #23)
2. ✅ Phase 2 — backend/shared-server dependency separation (PR #25)
3. ✅ Phase 3 — frontend product-domain separation (PRs #27–#31)
4. ✅ Phase 4 — shared-layer cleanup and final consolidation (PRs #34 onward)

Phase 4 produced neutral shared page/audit/render modules, extracted only clearly owned product CSS, removed a confirmed dead import, and removed non-runtime historical/browser-saved snapshots from the current tree. Remaining mixed responsive/accessibility CSS stays aggregated where ownership genuinely crosses products.

Detailed sequencing and invariants are recorded in:

- [`docs/STUDIO_WORKER_MODULARIZATION.md`](./docs/STUDIO_WORKER_MODULARIZATION.md)
- [`docs/STUDIO_PHASE4_SHARED_INVENTORY.md`](./docs/STUDIO_PHASE4_SHARED_INVENTORY.md)
- [`studio/README.md`](./studio/README.md)

## Auth service

See [`AUTH_PORTAL.md`](./AUTH_PORTAL.md) for browser sessions, Studio handoff, OAuth 2.0 + PKCE, token rotation/revocation and resource-server token introspection.

## CI/CD

- `Studio Worker Check` syntax-checks every `studio/*.js` module and runs a Wrangler dry-run bundle.
- `Auth Worker Check` validates and bundles the independent Auth Worker.
- `Deploy QssedA Production` validates and deploys Studio, Work, GPT and Auth from `main` after relevant runtime files change.
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


## GPT / Cloud Codex

`gpt.qsseda.studio` uses Cloud Codex as its default provider. The browser talks only to same-origin `/api/gpt/*` routes after the normal QssedA session gate. The GPT Worker forwards those authenticated requests to one Cloudflare Container managed by the `CodexCloudContainer` Durable Object.

The container runs the official `codex app-server` over stdio. ChatGPT is connected once through the official device-code login flow. The resulting Codex credential file is copied into Durable Object storage and restored whenever the ephemeral container restarts, so phones, tablets and arbitrary computers can reuse the backend login without receiving ChatGPT credentials.

The first authenticated QssedA account that starts the ChatGPT device-login flow becomes the Cloud Codex owner. Subsequent login, model, conversation and logout operations are restricted to that QssedA account.

The existing Windows localhost Codex Bridge remains available as an optional future provider for operations that intentionally need access to local files or projects; it is no longer the default chat backend.
