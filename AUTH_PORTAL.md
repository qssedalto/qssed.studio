# QssedA Auth Portal

`auth.qsseda.studio` is a standalone authentication portal for QssedA services and future desktop/mobile clients.

## V1 scope

- `/` checks the current authentication session automatically.
- `/login` signs in with the existing Supabase project.
- `/account` shows the current authenticated account and supports sign-out.
- `/authorize` provides the first authorization UI shell for future desktop/mobile clients.
- `/api/login` exchanges email/password for a Supabase session.
- `/api/session` validates the current session and refreshes it when needed.
- `/api/logout` clears the auth cookies.
- `/health` is a simple health endpoint.

## Session model

The auth portal keeps the Supabase access and refresh tokens in `HttpOnly`, `Secure`, `SameSite=Lax` cookies scoped to `auth.qsseda.studio`. The page itself does not read or store tokens in JavaScript/localStorage.

This means the auth portal can directly determine whether the browser is currently authenticated by calling `/api/session`.

V1 deliberately does **not** share these cookies with every `*.qsseda.studio` subdomain. Future applications should use an authorization-code/PKCE flow through `auth.qsseda.studio` rather than receiving the browser session cookie directly.

## Authorization status

The `/authorize` screen is currently interface-only. It shows the authenticated account and requested `client_id`, but the Allow button is disabled until the authorization-code/PKCE backend and client registry are implemented.

## Deploy

This portal uses a separate Wrangler config so the existing `qsseda.studio` Worker is not changed:

```powershell
npx wrangler deploy -c wrangler.auth.jsonc
```

`wrangler.auth.jsonc` declares `auth.qsseda.studio` as a Cloudflare Worker Custom Domain.

## Files

- `auth-worker.js` — auth UI, session APIs, Supabase integration
- `wrangler.auth.jsonc` — dedicated Cloudflare Worker configuration

## Security notes

- No Supabase service-role key is embedded in the auth Worker.
- Passwords are forwarded directly to Supabase Auth and are not stored by the Worker.
- Session cookies are `HttpOnly` and unavailable to page JavaScript.
- State-changing API requests reject a mismatched `Origin` header.
- The portal sends restrictive CSP, frame, referrer, MIME and permissions headers.
