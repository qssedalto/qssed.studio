# AERTEX ID Portal

`auth.qsseda.com` is the standalone identity and application-authorization service for AERTEX web, desktop, and future mobile clients.

## Core routes

- `/` checks the current browser authentication session automatically.
- `/login` signs in with the existing Supabase project.
- `/account` shows the current authenticated account and supports sign-out.
- `/continue` performs the verified browser-session handoff into `qsseda.com`.
- `/api/login`, `/api/session`, `/api/logout` manage the browser Auth session.
- `/health` is the service health endpoint.

## OAuth 2.0 + PKCE

Desktop applications are public OAuth clients. They do not receive or embed a reusable `client_secret`.

AERTEX ID implements the Authorization Code flow with PKCE and requires `S256`:

- `GET /authorize` — validates the client, redirect URI, requested scopes, `state`, and PKCE challenge, then shows the account/consent UI.
- `POST /api/oauth/authorize` — issues a short-lived one-time authorization code after explicit approval.
- `POST /oauth/token` — exchanges an authorization code + `code_verifier`, or rotates a refresh token.
- `POST /oauth/revoke` — revokes a AERTEX access or refresh token.
- `POST /oauth/introspect` — allows an authenticated AERTEX resource server to validate an opaque access token.
- `GET /.well-known/oauth-authorization-server` — publishes OAuth server metadata.

Authorization codes expire after **5 minutes** and are single-use. Access tokens expire after **30 minutes**. Refresh tokens expire after **30 days** and rotate every time they are used.

AERTEX application tokens are opaque random values. Only SHA-256 hashes of authorization codes, access tokens, and refresh tokens are persisted in PostgreSQL.

### Initial desktop client

The first registered public client is:

```text
client_id: qsseda-git-desktop
name: AERTEX Git
scopes: profile.read session.read
```

Allowed callbacks:

```text
qsseda-git://auth/callback
http://127.0.0.1:<ephemeral-port>/callback
```

For the loopback flow, the registry stores `http://127.0.0.1/callback` and Auth accepts the same callback with an ephemeral TCP port. This allows a Windows desktop application to start a temporary loopback listener without reserving a fixed port.

### Desktop flow

The desktop client generates a high-entropy `code_verifier`, computes:

```text
code_challenge = BASE64URL(SHA256(code_verifier))
```

and opens the system browser at a URL equivalent to:

```text
https://auth.qsseda.com/authorize
  ?response_type=code
  &client_id=qsseda-git-desktop
  &redirect_uri=qsseda-git%3A%2F%2Fauth%2Fcallback
  &scope=profile.read%20session.read
  &state=<random state>
  &code_challenge=<S256 challenge>
  &code_challenge_method=S256
```

After approval, Auth redirects to the registered callback with `code` and the original `state`. The desktop client must verify `state`, then exchange the code using `application/x-www-form-urlencoded`:

```text
POST /oauth/token

grant_type=authorization_code
client_id=qsseda-git-desktop
code=<authorization code>
redirect_uri=<the exact redirect URI used above>
code_verifier=<original verifier>
```

Refreshing uses the same endpoint with `grant_type=refresh_token`. A successful refresh returns a replacement refresh token; the previous refresh token is immediately revoked.

## Native application JSON API

AERTEX ID also exposes a first-party JSON session API for trusted native AERTEX clients that render their own login UI instead of opening the browser authorization page.

- `POST /api/app/login` — accepts `email` and `password`, verifies the credentials through Supabase Auth, requires an existing profile whose `status` is `active`, and returns an access token, rotating refresh token, expiry, and public account profile.
- `POST /api/app/refresh` — accepts `refresh_token`, rotates the Supabase session, re-checks the AERTEX profile and returns replacement tokens.
- `GET /api/app/session` — accepts `Authorization: Bearer <access-token>` and returns the current authenticated/authorized profile.
- `POST /api/app/logout` — accepts the current bearer token and revokes the local upstream session.

Native clients must never persist the user's password. On Apple platforms the refresh token belongs in Keychain; access tokens should remain in process memory when practical. These endpoints intentionally do not use the browser `__Host-qsseda-*` cookies and do not require same-origin browser headers.

The browser cookie API (`/api/login`, `/api/session`, `/api/logout`) remains separate and unchanged.

## Client registry and database model

OAuth state is stored in Supabase PostgreSQL:

- `oauth_clients`
- `oauth_authorization_codes`
- `oauth_access_tokens`
- `oauth_refresh_tokens`

The registry enforces an allow-list of redirect URIs and scopes. Authorization-code issuance additionally requires a valid Supabase user and `profiles.status = 'active'`.

The OAuth tables have RLS enabled and are not directly readable/writable by browser API roles. Protocol operations are performed through narrowly scoped database functions. Internal hashing/redirect helper functions are not executable by `anon` or `authenticated` roles, and authorization-code issuance is available only in an authenticated Supabase context.

## Resource-server token validation

AERTEX application access tokens are opaque, so API/resource servers validate them through `POST /oauth/introspect`. This endpoint is not a public-client API: the caller must authenticate with HTTP Basic credentials for a registered resource server.

Resource-server credentials are represented by `oauth_resource_servers`. Only a SHA-256 hash of the resource-server secret is persisted, and a resource server can be restricted to tokens issued for specific OAuth client IDs. Invalid server credentials fail with `401 invalid_client`; a valid server querying an invalid, expired, revoked, inactive-account, or disallowed-client token receives `{ "active": false }`.

The raw database introspection RPC is not executable by `anon` or `authenticated`; browser and desktop public clients therefore cannot use it as a token oracle.

## Browser session model

The Auth portal keeps the Supabase access and refresh tokens in host-only `__Host-` cookies with `HttpOnly`, `Secure`, `Path=/`, and `SameSite=Lax`.

Page JavaScript does not read or store those tokens in `localStorage`. The browser calls `/api/session`; the Worker validates the access token with Supabase and rotates the Supabase refresh token when needed.

The session response distinguishes:

- `authenticated`: the Supabase identity is valid.
- `authorized`: the account is active and may authorize applications.

Suspended or banned accounts remain identifiable but fail closed for application authorization.

## qsseda.com web handoff

The main `qsseda.com` site has its own Supabase browser session. Browser storage is origin-isolated, so Auth does not read the main site's `localStorage` directly.

`/continue` instead performs a verified POST handoff to `qsseda.com/auth/handoff`. The receiving Worker validates the Supabase session and active account before establishing the main-site browser session. Raw credentials are never placed in the URL.

This web handoff is separate from the OAuth/PKCE flow used by desktop applications.

## Deployment

Auth has a dedicated Wrangler configuration:

```powershell
npx wrangler deploy -c wrangler.auth.jsonc
```

`wrangler.auth.jsonc` declares `auth.qsseda.com` as a Cloudflare Worker Custom Domain.

Production deployment validates and deploys the complete Auth entry graph: `auth-entry.js`, `auth-worker.js`, `auth-oauth.js`, and `auth-pkce-test.js`.

## Files

- `auth-entry.js` — Auth Worker entrypoint and PKCE self-test dispatch
- `auth-worker.js` — browser Auth UI, sessions, account status, Studio handoff, OAuth route dispatch
- `auth-oauth.js` — OAuth metadata, authorization/consent, token exchange, refresh, revocation and protected introspection
- `auth-pkce-test.js` — browser PKCE self-test
- `wrangler.auth.jsonc` — Auth Cloudflare Worker configuration
- `supabase/migrations/202609130955_oauth_pkce_v1.sql` — OAuth schema, RPCs and initial public client
- `supabase/migrations/202609131005_oauth_pkce_privilege_hardening.sql` — OAuth RPC privilege hardening
- `supabase/migrations/202609131150_oauth_resource_server_introspection_v1.sql` — authenticated resource-server introspection

## Security notes

- No Supabase service-role key is embedded in the Auth Worker.
- Passwords are forwarded directly to Supabase Auth and are not stored by the Worker.
- Browser session cookies are host-only `__Host-` cookies and unavailable to page JavaScript.
- Desktop clients use PKCE `S256`; `plain` PKCE is rejected.
- Redirect URIs and scopes are checked against the server-side client registry.
- Authorization codes are short-lived, single-use, and bound to client, redirect URI, scopes, and PKCE challenge.
- Desktop applications do not contain a client secret.
- OAuth access and refresh tokens are opaque, random, and persisted only as hashes.
- Refresh-token rotation limits reuse of stolen stale refresh tokens.
- State-changing browser Auth requests enforce same-origin checks.
- The portal sends CSP, frame, referrer, MIME, permissions, HSTS, and no-store headers.
