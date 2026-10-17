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

## AERTEX iOS 2.2.0 native interaction expansion (2026-10-08)

### Intelligence (gpt.qsseda.com)

- `GET /api/native/intelligence/config`: same authorized account model/provider configuration as the browser, including region/availability and usage limits. No encrypted provider keys.
- `POST /api/native/intelligence/chat`: takes the existing browser JSON contract `{message, conversation_id, provider_id, model}` and returns **real server-sent events** `meta`, `delta`, `done`, or `error`, preserving the main gateway's quota, model permissions, RLS, persistence and provider settings.
- `PATCH /api/native/intelligence/conversations/:uuid` (title, pin/archive) and `DELETE /api/native/intelligence/conversations/:uuid`: run through the same owner-filtered browser gateway; arbitrary user ids cannot be passed.
- Browser cookie routes still require the same-origin anti-CSRF check. Native POST/PATCH/DELETE are allowed only when **both** `verifyNativeAppSession()` has validated the Bearer subject and `session.native === true`. The native client never uses the browser cookies.
- Per-user billing/quota is **not bypassed** by this adapter. Server errors must be surfaced instead of being interpreted as a completed response. An SSE `done` is the success marker.

### Studio (qsseda.com)

- `GET/POST/PUT/DELETE /api/native/studio/projects`
- `GET/POST/PUT/DELETE /api/native/studio/tasks`

These routes reuse the production `handleProjects` / `handleTasks` engines and their existing owner-prefixed R2 IDs, field validators, resource limits and project-reference checks. `PUT/DELETE` require a query `id`. The mobile UI initially exposes **project creation, task creation and task completion toggles**; it does not silently delete user data.

### Watch (aw.qsseda.com only)

- `GET /api/native/watch/buckets`: authenticated account's ActivityWatch bucket index.
- `GET /api/native/watch/buckets/:bucketId/events?start=<ISO>&end=<ISO>&limit=800`: real bounded, date-sharded R2 events using the existing Watch query handler; `awd.*` device-upload hosts deny access.

The 2.2 native chart intentionally shows **single-bucket raw event duration** instead of pretending to reproduce the website's multi-device de-duplication, AFK filtering and effective-focus algorithms. This is clearly disclosed in the UI.

### Renderer parity and rollout

The SwiftUI iOS app bundles a copied snapshot of the existing `studio/gpt-rich-renderer.js` source in `Resources/AERTEXRichMessage.js` and uses a **sandboxed, nonpersistent, non-scrolling WKWebView solely as a message text renderer**. AERTEX app navigation, composer, conversation list, chat model selection and chat bubbles remain native SwiftUI. The message renderer uses exactly the website's KaTeX 0.16.11 and highlight.js CDN assets, and therefore enhanced LaTeX typography may require CDN availability; the source has website-equivalent math fallbacks.

Do not merge the iOS 2.2 PR until iOS SDK compilation and iPhone verification pass. Back-end production should be merged and validated before distributing the app. If deployment, quota, or model choice is unavailable, the UI must show an explicit error.


## Cash planning / native iOS 27

Host: `https://cash.qsseda.com`.

`GET /api/native/cash/planning` reads the authenticated account's existing
`cash/users/<verified user id>/data.json` from R2. It returns the original
`plannedEvents`, `expectedEvents`, `recurringExpenses`, `budgetRules`,
`settings`, `initialized` and `updated_at` fields without transaction
history. It does not change any plan. `POST`, `PUT`, `DELETE` and methods
other than `GET` return 405. Missing/forged Bearer tokens and suspended
accounts are rejected by `verifyNativeAppSession`. All native responses
remain `private, no-store` and contain no session cookies.

The iOS view shows dated plans, expected monthly items and recurring expenses
without claiming to reproduce the website's computed balance forecast. The
full forecast uses the canonical `cash-web/model.js` and must not be
approximated by a different client-side formula. Native changes to plans
must wait for explicitly validated, atomic, conflict-aware mutation APIs.
The website still handles advanced forecast charts and mutations until then.

Rollout order: deploy the Cash Worker and verify authenticated API behavior
before shipping an iOS build that expects the new native planning endpoint.
The iOS view may otherwise show an error with a link to the existing website.


## Work TeX version history / native iOS 27

Host: `https://qsseda.com`.

`GET /api/native/work/documents?id=<owned UUID>&view=versions` verifies the
device Bearer session, reads the document under the verified user's R2 prefix
and refuses unknown or cross-owner identifiers. It lists existing website
version metadata from `_system/tex-versions/<user>/<document>/`, validates
every object's owner, document, kind and version UUID, sorts newest-first and
returns a maximum of 80 summaries including title, timestamp, preview,
reason, engine and source character count. Source bytes, PDFs and result
artifacts are **not** returned.

Other methods remain governed by the existing Work document API, with no
native route capable of restoring historic source; browser collaboration,
conflict-aware version restore and TeX compilation remain on Work until
separately tested native contracts are implemented. The client shows cached
read-only version summaries while refreshing behind the scenes.

The native Work version endpoint and Cash planning endpoint must be deployed
in the main Studio and Cash Workers, respectively, before shipping the
corresponding iOS client.


## Canonical Cash forecast / native iOS 27

`GET https://cash.qsseda.com/api/native/cash/forecast` uses exactly the
website's original `cash-web/model.js` via the Cash Worker. It requires a
validated native Bearer session and reads only the verified account's Cash R2
document. The response is a read-only projection with `as_of`,
`period_start`, `period_end`, `actual_cash`, `disposable_cash`,
`projected_end_balance`, `components`, `daily` and `monthly`.
Full transactions and mutable account data are not returned.

The returned end balance **includes** undated/reserved recurring expenses,
weekly social transport budget and expected net cash flows from the canonical
model. The daily path excludes non-dated reserves; iOS explicitly distinguishes
that line from the final projected balance. All calculations remain server-side
and share the exact website normalization / parity-tested implementation.
For uninitialized accounts the response is `{ initialized:false,
forecast:null, updated_at:null }`; the app must not display that as a fake
zero forecast.

All mutations return 405. The endpoint has no session cookies or public
caching, and does not expose private transactions. It must be deployed to
the Cash Worker before the iOS forecast tab is distributed.


## Native Cash plan editor (iOS 27)

The Cash Worker adds `POST /api/native/cash/plans?kind=dated|expected|recurring`,
`PUT /api/native/cash/plans?kind=<kind>&id=<plan id>` and
`DELETE /api/native/cash/plans?kind=<kind>&id=<plan id>`.

These are **authenticated, account-scoped mutations**. Every call passes the
same `verifyNativeAppSession` bearer check as other native APIs. The verified
user ID, not caller-controlled input, determines the R2 key. Mutations require
`If-Match` equal to the exact current R2 `etag` (newly exposed in
`GET /api/native/cash/planning`). No wildcard or blind overwrites are
allowed. Conditional R2 writes return HTTP 409 on concurrent edits.
Missing precondition returns 428.

Payload allowlists cover date/month, type, amount, free-form category, note
and enabled flag; recurring plans support name, day of month and reserve flag.
Unrelated fields, oversized/invalid amounts and impossible dates are rejected.
Existing website-defined fields (such as a plan's origin) and unrelated
transactions/rules are preserved. On successful writes, iOS refreshes the plan
list and invalidates encrypted forecast and ledger snapshots.

For an account without an initialized Cash ledger, the server returns 409
instead of creating a document with fabricated settings. Clients should first
initialize their existing Cash account. The full website still offers its
other advanced budgeting controls; this API does not mutate those fields.

## Work historic source reader (native iOS)

`GET /api/native/work/documents?id=<document UUID>&view=versions&version=<version UUID>`
reads one archived TeX version. The document must already exist under the
verified Bearer user's personal R2 prefix, and the archived source object
must independently confirm matching `owner_id`, `document_id` and `id`.
The route rejects invalid identifiers and missing or cross-user versions.
The response is JSON
`{ readonly:true, version:{id,document_id,title,engine,source,reason,created_at} }`.
No write method, PDF export or restore action is introduced here.

Native iOS uses an encrypted account-specific device snapshot to display
the last successfully fetched source immediately and updates it in the
background. The native screen supports text selection and ShareLink, but
cannot overwrite the Work document; safe version restore remains on the
website until a dedicated ETag-conditional restore API is tested.
