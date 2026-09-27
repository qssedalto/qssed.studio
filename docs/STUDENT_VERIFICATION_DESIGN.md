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
5. Submit a verification request in AERTEX. The first version does not collect the CHSI report code in AERTEX.
6. AERTEX shows Pending Review.
7. An administrator verifies the report using the official CHSI verification channel outside AERTEX and records only the minimum result in AERTEX.
8. The user becomes student-eligible until the report validity date.
9. When the validity date passes, student pricing eligibility expires automatically.

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

Do not persist the user's CHSI password, authentication cookies, ID-card data, or face data.

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
- open the official CHSI verification site
- mark Verified and record the report validity date
- mark Rejected with a short review note

The admin action must be audited.

## Privacy and security

- No CHSI password collection.
- No automated login to CHSI.
- No scraping of private CHSI account pages.
- No browser storage of report evidence.
- Store only the eligibility result and minimum metadata required for expiry/review.
- Student pricing is disabled immediately after eligibility expiry.
- Existing paid-plan entitlements are not removed merely because student eligibility expires; only future student-price eligibility changes.

## Rollout

Phase 1: schema + state model + user status UI + manual admin review.
Phase 2: student-specific billing prices.
Phase 3: payment checkout uses eligibility-qualified prices.
Phase 4: only if CHSI offers an authorized integration to AERTEX, replace manual review with official API/OAuth-style verification.
