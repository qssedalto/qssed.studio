# AERTEX Student Verification

## Product model

Student status is an eligibility signal, not a subscription plan.

- Subscription selects the product plan: Free, Plus, Pro.
- Entitlements come from the selected plan.
- Student eligibility only controls access to future student-priced billing prices.

This avoids separate Student Plus / Student Pro product trees and lets pricing change without changing product entitlements.

## Evidence source

AERTEX uses the QR code from the official CHSI Online Verification Report of Student Record as the review entry point.

AERTEX does not ask the user to sign in to CHSI. The user selects only the QR-code crop from the official report.

## Privacy-first QR flow

1. The user opens Settings -> Subscription & Entitlements -> Student eligibility.
2. The page shows a privacy warning before the file picker is enabled.
3. The user confirms that the selected image contains only the QR code.
4. PNG, JPEG and WebP files up to 5 MB are accepted by the browser UI.
5. Where BarcodeDetector is available, the QR code is decoded locally in the browser.
6. The selected image is never submitted to AERTEX.
7. If local QR decoding is unavailable, the user can scan with the device camera and paste the official verification URL.
8. Client and server independently validate HTTPS, host and path.
9. Only chsi.com.cn or www.chsi.com.cn under /xlcx/ are accepted.
10. The server stores a SHA-256 target hash in the public verification record.
11. The full official target URL is held only in aertex_private for the pending review window.
12. After review, cancellation, or expiry, the temporary target is deleted.
13. The administrator must explicitly open the official verification target and make a review decision.
14. A verified student remains eligible only until report_expires_at.

## Security controls

- Existing authenticated session gate.
- Same-origin enforcement for write requests.
- Existing global API write rate limiter.
- Database ten-minute resubmission cooldown.
- One pending verification per account.
- Unique active target hash to reduce replay across accounts.
- Exact official-host allow-list at the client, user API, database and admin UI.
- HTTPS only; no URL credentials or custom ports.
- Official verification path restricted to /xlcx/.
- No automatic navigation to QR targets.
- Admin link uses target=_blank with noopener/noreferrer.
- Admin approval uses a row lock and only pending records can transition.
- Admin writes are audited with administrator identity, IP and user agent.
- Temporary official targets expire and are purged.
- Rejected, canceled and expired requests do not grant eligibility.
- Existing paid entitlements are not revoked when student eligibility expires.

## Data minimization

Long-lived record:

- verification id
- account id
- provider/method
- status
- target hash and official host
- optional school name
- optional education level
- report expiry
- reviewer/time
- short review note
- timestamps

The QR image itself is not uploaded. The temporary official target is isolated from ordinary authenticated users and is removed after the review lifecycle ends.

## State model

not_submitted -> pending -> verified
                       -> rejected
                       -> expired
                       -> canceled (represented as a non-eligible terminal review result)

verified -> expired when the official report validity ends.

## Billing integration

billing_prices.eligibility_key can be:

- null: ordinary price
- student: price requires active student eligibility

A checkout implementation must resolve eligibility server-side immediately before creating the order. Client UI visibility is not sufficient authorization.

## Future official integration

If CHSI later provides AERTEX with an authorized API or OAuth-style verification product, replace the manual-review step only. Keep the eligibility, pricing, audit and expiry model unchanged.
