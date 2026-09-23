# AERTEX

AERTEX is a Cloudflare Workers + Supabase application with a separate identity service at `auth.qsseda.com`, a standalone Work surface at `work.qsseda.com`, and an independent AI interface at `gpt.qsseda.com`.

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
- `wrangler.gpt.jsonc` — Cloudflare Worker configuration binding the custom domain `gpt.qsseda.com`.

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
- `Deploy AERTEX Production` validates and deploys Studio, Work, GPT and Auth from `main` after relevant runtime files change.
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



## GPT / Remote Local Codex

`gpt.qsseda.com` is always served by the Cloudflare GPT Worker, but its AI backend intentionally follows the power state of the user's Windows Codex host.

The browser talks only to same-origin `/api/gpt/*` routes after the normal AERTEX session gate. The GPT Worker forwards those authenticated requests to a remotely-managed Cloudflare Tunnel whose origin is the loopback-only Codex Bridge on `127.0.0.1:32146`.

Runtime states:

- Windows host off/asleep, Bridge stopped, or Tunnel disconnected -> GPT reports offline.
- Host online with Bridge/Tunnel but Codex not signed in -> GPT reports online and offers ChatGPT/Codex device login.
- Host online and Codex signed in -> GPT chat, model discovery and streamed turns are enabled.

The Tunnel endpoint is not trusted by hostname alone. Worker-to-Bridge requests carry a separate shared bearer token. The Bridge accepts browser-origin requests without that token only when the HTTP Host is the literal local loopback endpoint. The Bridge continues to run Codex in a restricted read-only chat workspace with no generic process, filesystem or command API.

The GPT Worker expects two protected runtime values:

- `GPT_CODEX_BRIDGE_URL` — HTTPS hostname routed by Cloudflare Tunnel to `http://127.0.0.1:32146`.
- `GPT_CODEX_BRIDGE_TOKEN` — independent random bearer token shared with the local Bridge.

Neither value is embedded in the browser bundle.


## Branding and technical namespace

The user-facing product brand is **AERTEX**. Existing `qsseda` domains, Worker names, cookie names, storage keys, OAuth client IDs, and other protocol identifiers remain unchanged as the stable technical namespace. This avoids breaking sessions, redirects, storage objects, and deployed infrastructure while allowing the product UI to use the AERTEX family consistently.
