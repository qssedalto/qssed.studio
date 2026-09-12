# QssedA Auth Portal

`auth.qsseda.studio` is a standalone authentication portal for QssedA services and future desktop/mobile clients.

## V1 scope

- `/` checks the current authentication session automatically.
- `/login` signs in with the existing Supabase project.
- `/account` shows the current authenticated account and supports sign-out.
- `/authorize` provides the first authorization UI shell for future desktop/mobile clients.
- `/api/login` exchanges email/password for a Supabase session.
- `/api/session` validates the current session and refreshes it when needed.
- `/api/logout` attempts upstream Supabase sign-out and always clears local auth cookies.
- `/health` is a simple health endpoint.
- Chinese/English UI follows the browser `Accept-Language` preference.
- The session response distinguishes `authenticated` from `authorized`: suspended or banned accounts can be identified but must not be authorized for applications.

## Session model

The auth portal keeps the Supabase access and refresh tokens in host-only `__Host-` cookies with `HttpOnly`, `Secure`, `Path=/`, and `SameSite=Lax`.

The page itself does not read or store access/refresh tokens in JavaScript or `localStorage`. The browser calls `/api/session`, and the Worker validates the access token with Supabase. If the access token has expired, the Worker rotates the session with the refresh token and updates both cookies.

This gives `auth.qsseda.studio` a canonical server-readable authentication state without exposing bearer credentials to page JavaScript.

V1 deliberately does **not** share auth cookies with every `*.qsseda.studio` subdomain. Future applications should use an authorization-code + PKCE flow through `auth.qsseda.studio` rather than receiving the browser session cookie directly.

## Existing qsseda.studio session

The current `qsseda.studio` site uses its own Supabase browser session. Because browser storage is origin-isolated, `auth.qsseda.studio` cannot directly read `qsseda.studio` localStorage.

A later migration should make Auth the canonical sign-in entry point, or add a short-lived, verified session handoff from the main site. Raw refresh tokens must never be placed in a URL.

## Account status

`/api/session` returns both:

- `authenticated`: Supabase identity is valid.
- `authorized`: the `profiles.status` value is `active`.

The UI visibly distinguishes active, suspended, and banned accounts. Application authorization must fail closed for non-active accounts when the authorization backend is enabled.

The profile lookup intentionally uses fields that exist in the current `profiles` schema: `username`, `display_name`, `avatar_url`, `role`, and `status`. Registration-only name details continue to fall back to Supabase user metadata.

## Authorization status

The `/authorize` screen is currently interface-only. It shows the authenticated account and requested `client_id`, but the Allow button is disabled until all of the following exist:

1. application/client registry;
2. strict redirect URI allow-listing;
3. authorization-code issuance;
4. PKCE (`S256`) verification;
5. short code expiry and single-use enforcement;
6. explicit scopes and consent;
7. active-account enforcement.

Desktop applications should be treated as public OAuth clients and must not embed a reusable client secret in the executable.

## Deploy

This portal uses a separate Wrangler config so the existing `qsseda.studio` Worker is not changed:

```powershell
npx wrangler deploy -c wrangler.auth.jsonc
```

`wrangler.auth.jsonc` declares `auth.qsseda.studio` as a Cloudflare Worker Custom Domain.

## Files

- `auth-worker.js` — auth UI, session APIs, account-status checks, Supabase integration
- `wrangler.auth.jsonc` — dedicated Cloudflare Worker configuration

## Security notes

- No Supabase service-role key is embedded in the Auth Worker.
- Passwords are forwarded directly to Supabase Auth and are not stored by the Worker.
- Session cookies are host-only `__Host-` cookies and unavailable to page JavaScript.
- State-changing API requests require the exact same `Origin`.
- Logout attempts to revoke the active Supabase session before clearing browser cookies.
- The portal sends CSP, frame, referrer, MIME, permissions, HSTS, and no-store headers.
- RLS remains responsible for profile visibility in Supabase.
- The current authorization UI does not issue credentials yet; it is intentionally non-functional until PKCE/client validation is implemented.
