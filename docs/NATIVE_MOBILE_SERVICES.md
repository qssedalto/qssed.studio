# AERTEX native mobile services API (iOS 2.1)

The AERTEX iOS app uses **native SwiftUI views and HTTPS JSON**; it must not ship
WebView wrappers of Studio, Intelligence or Watch. Native sessions are Supabase
access tokens obtained through `auth.qsseda.com/api/app/login` and rotated through
`/api/app/refresh`. Tokens belong in process memory; refresh tokens in Keychain.
No service-role or Worker secret may be bundled in the iOS client.

## GET /api/native/studio/overview

Host: `https://qsseda.com`

Reads the **same** personal, R2-backed workbench overview as the website:
`counts`, `projects`, `tasks`, `drafts`, and `notes`.
The R2 prefixes are constructed from the authenticated user ID.
This is a read-only endpoint; it does not create projects or tasks.

## GET /api/native/intelligence/conversations

Host: `https://gpt.qsseda.com`

Returns a JSON array with up to 100 non-archived conversations for the current
user, sorted using the existing `ai-gateway.js` implementation, including its
legacy-schema fallback.

## GET /api/native/intelligence/conversations/:conversationId

Host: `https://gpt.qsseda.com`

Returns `{ conversation, messages }` for **one** owned UUID conversation.
Reads and enforces `user_id=eq.<verified user>` on the conversation and message
queries, reusing the existing Intelligence gateway. It does not expose AI provider
configuration, encrypted keys or admin routes. Streaming chat generation is **not**
implemented by this read-only native API.

## GET /api/native/watch/status

Host: `https://aw.qsseda.com` (not `awd.*`).

Returns existing Watch R2 data-source status:
`{ buckets, last_sync, last_host }`, scoped to the authenticated user.
The Watch data/upload host refuses this endpoint. This is ActivityWatch
**computer** sync metadata only, **not** Apple Health or Apple Watch metrics.

## Security and compatibility

- All endpoints require `Authorization: Bearer <Supabase access token>`.
- `studio/native-mobile-auth.js` verifies each access token with
  Supabase `/auth/v1/user`, then looks up exactly that account's profile and
  requires `status = active`.
- Browser host-only cookies, OAuth client secrets, Watch Device Tokens and
  user-provided `user_id` values are **not** trusted as native identities.
- Each route allows **GET only**; no state-changing operations in this phase.
- Native responses force `private, no-store` and strip `Set-Cookie`.
- Studio retains the existing Workbench storage authorization check; Intelligence
  retains its existing PostgREST account filters and RLS; Watch retains its
  owner-prefixed R2 index.
- `scripts/native-mobile-services-check.mjs` tests missing/forged bearer,
  inactive users, method restrictions, owner scoping and data-host isolation.
- Native iOS 2.1 should be deployed **only after** these backend routes are
  live. Existing web/browser endpoints remain intact.

## Deploy and validate

Run the Auth and Studio GitHub Checks and the native contract tests first.
Production deployment uses the existing `deploy-production.yml` workflow for
all relevant Workers. Verify responses to unauthenticated GET requests return
401 without leaking private data. Real-account integration tests must use test
accounts and must not print bearer tokens.

Outstanding work: native Intelligence message creation/streaming, native
Studio project/task mutations, and Watch event-analytics algorithms in Swift.
Keep those features labeled as unimplemented until their contracts and tests
exist; do not silently use WebView.
