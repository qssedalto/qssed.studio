# QssedA Studio

QssedA Studio is a Cloudflare Workers + Supabase application with a separate identity service at `auth.qsseda.studio`.

## Runtime architecture

```text
qsseda.studio
  worker.js                    compatibility entrypoint
    -> studio/entry.js         Studio router
       -> auth-handoff.js      Auth -> Studio browser-session handoff
       -> account-api.js       registration, password login, login auditing
       -> storage-api.js       authenticated R2 file operations
       -> server-runtime.js    shared protected server helpers/logging
       -> html-utils.js        neutral HTML helpers
       -> routing.js           locale/path/HTTP helpers
       -> ui-core.js           shared HTML head + client/runtime scripts
       -> ui-shell.js          Studio OS shell + product UI composition
       -> ui-styles.js         Studio OS styles
       -> auth-pages.js        Studio login/sign-up/not-found pages
       -> config.js            shared constants, copy and route tables

auth.qsseda.studio
  auth-entry.js
    -> auth-worker.js          browser Auth/session/handoff
    -> auth-oauth.js           OAuth 2.0 Authorization Code + PKCE
    -> auth-pkce-test.js       browser PKCE self-test

Supabase PostgreSQL
  profiles / login_events / audit_logs
  OAuth client, code and token tables

Cloudflare R2
  qsseda-studio-storage -> env.STORAGE
```

## Studio Worker

`worker.js` is intentionally tiny and remains the Wrangler entrypoint for compatibility. The implementation lives in `studio/` and is split by responsibility rather than by arbitrary file size.

Public Studio server routes currently include:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /auth/handoff`
- `GET /api/storage/files`
- `POST /api/storage/upload`
- `GET|DELETE /api/storage/object`
- localized Studio UI routes under `/zh-cn/*` and `/en/*`

The Studio Worker uses the `STORAGE` R2 binding and may use the protected Supabase server secret bindings already configured in production.

## Modularization roadmap

Studio modularization is intentionally staged. PR #23 completed **Phase 1 (boundary extraction)** and PR #25 completed **Phase 2 (backend/shared-server dependency separation)**. Neither phase treats the current coarse UI files as a final module layout.

The frozen sequencing guide, current dependency graph and Phase 3 safety order are documented in [`docs/STUDIO_WORKER_MODULARIZATION.md`](./docs/STUDIO_WORKER_MODULARIZATION.md).

Current order:

1. ✅ Phase 1 — boundary extraction
2. ✅ Phase 2 — backend/shared-server dependency separation
3. ⏭️ Phase 3 — frontend product-domain separation
4. ⛔ Phase 4 — shared-layer cleanup and consolidation

Phase 3 moves one product domain at a time. The first planned slice is **Profile**; Settings/Storage, Admin and shell/shared-runtime cleanup must not be folded into the same PR.

## Auth service

See [`AUTH_PORTAL.md`](./AUTH_PORTAL.md) for browser sessions, Studio handoff, OAuth 2.0 + PKCE, token rotation/revocation and resource-server token introspection.

## CI/CD

- `Studio Worker Check` syntax-checks every `studio/*.js` module and runs a Wrangler dry-run bundle.
- `Auth Worker Check` validates and bundles the independent Auth Worker.
- `Deploy QssedA Production` deploys Studio and Auth from `main` after relevant files change.
- `Deploy QssedA Auth` remains available as a manual Auth-only production deployment.

Production deployment is intentionally keyed to both `worker.js` and `studio/**`, so changing an implementation module cannot bypass deployment automation.

## Development safety

Before merging structural Worker changes:

1. JavaScript syntax must pass.
2. Wrangler must successfully bundle the Worker.
3. Route behavior should be smoke-tested against the previous implementation when doing a structural refactor.
4. Secrets must remain in Cloudflare/GitHub secret storage rather than source control.
5. Structural work must follow the active phase in the modularization roadmap; do not mix later-phase cleanup into the same PR.
6. During Phase 3, extract one product domain at a time and preserve its existing route, cache and authorization behavior.

Git history remains the recovery mechanism for previous versions; large historical snapshots in the repository are not part of the active runtime architecture.
