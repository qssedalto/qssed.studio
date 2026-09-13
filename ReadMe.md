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
       -> routing.js           locale/path/HTTP helpers
       -> ui-core.js           shared HTML head and client scripts
       -> ui-shell.js          Studio OS pages and settings panels
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

Git history remains the recovery mechanism for previous versions; large historical snapshots in the repository are not part of the active runtime architecture.
