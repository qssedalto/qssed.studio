# AERTEX Student Verification Design

## Goal

Add a student-eligibility layer to AERTEX Billing without making student status a subscription plan. Student verification only controls eligibility for future student prices; Drive and other product entitlements continue to come from the selected billing plan.

## Verification source

Use the official CHSI Online Verification Report of Student Record as the evidence source.

AERTEX must not request or store:
- CHSI account passwords
- CHSI login cookies
- identity-card numbers
- face images
- raw student-record documents unless a later legal/privacy review explicitly approves that workflow

Until AERTEX has an official machine-to-machine CHSI integration, verification remains a manual administrator review against the official CHSI verification service.

## User flow

1. Open Settings -> Subscription & Entitlements.
2. Open Student Eligibility.
3. Read the explanation and privacy notice.
4. Open the official CHSI instructions to obtain an Online Verification Report of Student Record.
5. Upload or photograph only the QR-code area from the official CHSI verification report. Do not upload the full report.
6. Before upload, AERTEX displays a privacy warning telling the user not to submit identity-card numbers, student numbers, names, portrait photos, account credentials, or any unrelated personal information.
7. AERTEX crops/decodes the QR evidence and creates a Pending Review request. Raw image evidence should be transient and deleted after the verification target has been extracted or the review is completed.
8. An administrator opens the official verification target derived from the QR code, verifies the report through the official CHSI verification channel, and records only the minimum eligibility result in AERTEX.
9. The user becomes student-eligible until the report validity date.
10. When the validity date passes, student pricing eligibility expires automatically.

## State machine

- not_submitted
- pending
- verified
- rejected
- expired

A verified record is eligible only while report_expires_at is in the future.

## Minimum persisted fields

student_verifications:
- id
- user_id
- provider = chsi
- method = manual_official_report_review
- status
- school_name (optional)
- education_level (optional)
- report_expires_at
- verified_at
- verified_by
- review_note
- submitted_at
- reviewed_at
- created_at
- updated_at

Do not persist the user's CHSI password, authentication cookies, ID-card data, face data, or a full copy of the verification report.

QR evidence should be handled as short-lived verification material. Prefer decoding the QR code immediately, validating that it points to an allowed official CHSI verification destination, retaining only the minimum derived verification reference needed for review, and deleting the uploaded image.

## Billing integration

Student status is an eligibility attribute, not a plan:

Account
  -> Subscription
  -> Plan
  -> Entitlements

Account
  -> Eligibility
  -> student = true/false

Prices can optionally declare:
- eligibility_key = null for normal prices
- eligibility_key = student for student prices

The entitlement set for AERTEX Plus or Pro stays the same regardless of whether the user pays a normal or student price.

## Admin design

AERTEX Administration gets a Student Verification workspace showing:
- user
- request status
- submitted time
- optional school and education level
- report validity date
- reviewer and review time

For a pending request the administrator can:
- open the official CHSI verification destination derived from the submitted QR code
- verify the report through the official CHSI service
- mark Verified and record the report validity date
- mark Rejected with a short review note

The admin action must be audited.

## QR submission UX

The student-verification card should offer:

- Upload QR image
- Use camera to capture QR code
- Re-crop before submission
- Cancel without retaining the image

The page must show this warning before the picker/camera control:

> Only submit the QR-code area from your official CHSI verification report. Do not upload the full report or any image containing your ID-card number, student number, name, portrait, account credentials, or other unrelated personal information.

A secondary note should state that QR codes can contain verification information and should only be submitted for the AERTEX student-verification request.

The server should reject files that are not images, enforce a small upload limit, strip metadata where applicable, decode only one QR payload, and reject payloads that do not resolve to an allow-listed official CHSI verification destination.

## Privacy and security

- No CHSI password collection.
- No automated login to CHSI.
- No scraping of private CHSI account pages.
- No browser storage of report evidence.
- Do not retain a full verification-report image.
- Treat the uploaded QR crop as transient evidence and delete it after extraction/review.
- Store only the eligibility result and minimum metadata required for expiry/review.
- Allow-list official CHSI verification destinations before an administrator can open a decoded QR target.
- Never render a decoded QR target as raw HTML or execute data from the QR payload.
- Student pricing is disabled immediately after eligibility expiry.
- Existing paid-plan entitlements are not removed merely because student eligibility expires; only future student-price eligibility changes.

## Rollout

Phase 1: schema + state model + user status UI + manual admin review.
Phase 2: student-specific billing prices.
Phase 3: payment checkout uses eligibility-qualified prices.
Phase 4: only if CHSI offers an authorized integration to AERTEX, replace manual review with official API/OAuth-style verification.
