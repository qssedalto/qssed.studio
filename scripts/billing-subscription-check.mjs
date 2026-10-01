import fs from "node:fs";

const read = path => fs.readFileSync(path, "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const contains = (source, needle, message) => assert(source.includes(needle), message);

const migration = read("supabase/migrations/202609271530_billing_subscriptions_foundation.sql");
const studentMigration = read("supabase/migrations/202609271700_student_verification_qr_privacy.sql");
const studentReadonlyFix = read("supabase/migrations/202609272035_fix_admin_student_verification_readonly.sql");
const pricingMigration = read("supabase/migrations/202609272115_subscription_catalog_student_pricing.sql");
const billingApi = read("studio/billing-api.js");
const studentApi = read("studio/student-verification-api.js");
const billingUi = read("studio/ui-billing.js");
const storageApi = read("studio/storage-api.js");
const legacyApi = read("studio/legacy-cookie-api.js");
const shell = read("studio/ui-shell.js");
const settings = read("studio/ui-settings.js");
const adminApi = read("admin/admin-api.js");
const adminUi = read("admin/ui.js");
const adminWorker = read("admin-worker.js");

for (const required of [
  "create table if not exists public.billing_plans",
  "create table if not exists public.billing_plan_entitlements",
  "create table if not exists public.billing_prices",
  "create table if not exists public.billing_subscriptions",
  "create table if not exists public.billing_orders",
  "create table if not exists public.billing_events",
  "billing_subscriptions_one_effective_per_user",
  "alter table public.billing_subscriptions enable row level security",
  "revoke all on public.billing_orders from public, anon, authenticated",
  "create or replace function public.get_my_billing_state()",
  "create or replace function public.get_admin_billing_state()",
  "create or replace function public.admin_grant_subscription(",
  "create or replace function public.admin_reset_subscription(",
  "'aertex_free'",
  "'aertex_plus'",
  "'aertex_pro'",
  "'drive_storage_bytes'",
  "checkout_enabled"
]) contains(migration, required, "Billing migration missing invariant: " + required);

contains(billingApi, 'rpc/get_my_billing_state', "User billing state must come from the entitlement RPC.");
contains(billingApi, "fallbackBillingState", "Billing resolver must fail closed to Free entitlements.");
contains(studentMigration, "create table if not exists public.student_verifications", "Student eligibility schema is missing.");
contains(studentMigration, "create table if not exists aertex_private.student_verification_targets", "Transient verification targets must stay in the private schema.");
contains(studentMigration, "student_verifications_active_target_unique", "Active verification targets must be replay-protected.");
contains(studentMigration, "student_verifications_one_pending_per_user", "Accounts must have at most one pending student verification.");
contains(studentMigration, "purge_expired_student_verification_targets", "Expired verification targets must be purged.");
contains(studentMigration, "submit_student_verification_target", "Student verification target submission RPC is missing.");
contains(studentMigration, "cancel_my_student_verification", "Users must be able to cancel pending student verification.");
contains(studentMigration, "admin_review_student_verification", "Admin student review RPC is missing.");
contains(studentReadonlyFix, "alter function public.get_admin_student_verifications() volatile;", "Admin student verification getter must stay VOLATILE because it performs expiry cleanup writes.");
contains(studentMigration, "eligibility_key text", "Billing prices must support eligibility-qualified pricing.");
contains(pricingMigration, "'aertex_mini'", "Pricing catalog must include Mini.");
contains(pricingMigration, "'aertex_max'", "Pricing catalog must include Max.");
contains(pricingMigration, "'aertex_ultra'", "Pricing catalog must include Ultra.");
contains(pricingMigration, "'aertex_studio'", "Pricing catalog must include Studio.");
contains(pricingMigration, "'aertex_vault'", "Pricing catalog must include Vault.");
contains(pricingMigration, "10737418240", "Free plan must provide 10 GB.");
contains(pricingMigration, "'pro_cny_month', 'aertex_pro', 'CNY', 3490", "Pro monthly price must be ¥34.9.");
contains(pricingMigration, "'pro_student_cny_month', 'aertex_pro', 'CNY', 2590", "Pro student monthly price must be ¥25.9.");
contains(pricingMigration, "'vault_cny_month', 'aertex_vault', 'CNY', 179900", "Vault monthly price must be ¥1,799.");
contains(pricingMigration, "'vault_student_cny_month', 'aertex_vault', 'CNY', 139900", "Vault student monthly price must be ¥1,399.");
contains(billingUi, 'name:"Free",capacity:"10GB"', "Pricing UI must show Free 10GB.");
contains(billingUi, 'name:"Pro",capacity:"200GB",price:"¥34.9",student:"¥25.9"', "Pricing UI must show Pro ordinary and student prices.");
contains(billingUi, 'name:"Vault",capacity:"12TB",price:"¥1,799",student:"¥1,399"', "Pricing UI must show Vault ordinary and student prices.");
contains(studentApi, 'new Set(["chsi.com.cn", "www.chsi.com.cn"])', "Student verification API must use the exact CHSI host allow-list.");
contains(studentApi, 'url.protocol !== "https:"', "Student verification API must require HTTPS.");
contains(studentApi, '"submit_student_verification_target"', "Student verification API must submit validated official targets only.");
contains(studentApi, '"cancel_my_student_verification"', "Student verification API must support cancellation.");
contains(billingUi, 'id="student-region-step"', "Student verification must classify enrollment source before choosing a verification method.");
contains(billingUi, 'data-student-region="mainland_higher"', "Student verification must expose the CHSI-verifiable Mainland higher-education path.");
contains(billingUi, 'data-student-region="hmt"', "Student verification must distinguish Hong Kong, Macao, and Taiwan institutions.");
contains(billingUi, 'data-student-region="international"', "Student verification must expose institutions in other countries or regions.");
contains(billingUi, 'data-student-region="other"', "Student verification must provide an uncertainty/other fallback instead of forcing a wrong region.");
contains(billingUi, 'id="student-method-step"', "Student verification must choose a method only after enrollment-source classification.");
contains(billingUi, 'data-student-method="chsi"', "CHSI must remain the only currently actionable student-verification method.");
contains(billingUi, 'methodSchoolEmail:"学校官方邮箱"', "Future non-CHSI verification must identify official school email as a planned method.");
contains(billingUi, 'methodEnrollment:"官方在读证明"', "Future non-CHSI verification must identify official enrollment evidence as a planned method.");
contains(billingUi, 'studentRegion==="mainland_higher"&&studentMethod==="chsi"', "The CHSI form must remain gated to the CHSI-verifiable Mainland higher-education path.");
contains(billingUi, "BarcodeDetector", "Student verification UI must decode QR images locally where supported.");
contains(billingUi, "5*1024*1024", "Student verification UI must cap local QR image size.");
contains(billingUi, "图片只在你的浏览器本地解析", "Student verification UI must disclose local-only QR processing.");
contains(billingUi, 'id="student-tutorial"', "Student verification UI must show a tutorial before the upload flow.");
contains(billingUi, 'id="student-verification-form" hidden', "Student verification form must stay hidden until the tutorial is acknowledged.");
contains(billingUi, 'id="student-tutorial-ready"', "Student verification tutorial must require an explicit continue action.");
contains(billingUi, "tutorialStep4", "Tutorial must explain QR-only cropping and sensitive-data minimization.");
contains(billingUi, "studentTutorialAcknowledged", "Student verification controls must be gated on tutorial acknowledgement.");
contains(billingUi, '#student-verification [hidden]{display:none!important}', "Student verification hidden states must override generic form styles.");
contains(billingUi, 'id="student-pending-actions" hidden', "Pending student verification must show a dedicated pending state.");
contains(billingUi, 'studentPendingActions.hidden=!pending', "Pending-state actions must be toggled from server state.");
contains(billingUi, 'studentVerificationForm.style.display="none"', "Pending state must force-hide the verification form.");
contains(billingUi, '#student-consent{width:22px!important', "Student consent checkbox must remain touch-sized without inheriting oversized input styles.");
contains(billingUi, 'const isZh=', "Student verification browser script must receive an explicit locale flag.");
assert(!billingUi.includes('textContent=zh?') && !billingUi.includes('detail=zh?'), "Student verification browser script must not reference the server-only zh variable at runtime.");
contains(billingUi, 'studentQrFile.disabled=!canUseForm;', "QR file selection must unlock immediately after the tutorial step.");
contains(billingUi, 'studentTarget.disabled=!canUseForm;', "Official verification URL input must unlock immediately after the tutorial step.");
assert(!billingUi.includes('capture="environment"'), "Student QR picker must not force the rear camera; users need Photos/Files choices on mobile.");
contains(billingUi, 'id="student-file-picker"', "Student QR selection must use the custom centered picker UI.");
contains(billingUi, 'class="student-file-button"', "Student QR picker must expose a centered custom trigger.");
contains(billingUi, 'chooseQrHint:"可从照片图库、文件或系统相机选择"', "Student QR picker must explain the available mobile sources.");
contains(billingUi, '.student-file-picker{display:grid;place-items:center', "Student QR picker controls must be visually centered.");
contains(billingUi, 'id="student-file-preview"', "Student QR selection must show a local preview after choosing an image.");
contains(billingUi, 'URL.createObjectURL(file)', "Student QR preview must use a local object URL rather than uploading the image.");
contains(billingUi, 'URL.revokeObjectURL(studentPreviewUrl)', "Student QR preview object URLs must be released.");
contains(billingUi, 'jsqr@1.4.0/+esm', "Safari/iOS QR decoding must have a local-browser fallback when BarcodeDetector is unavailable.");
contains(billingUi, 'id="student-manual-wrap" hidden', "Manual verification URL entry should stay collapsed until explicitly requested or needed.");
contains(billingUi, '#student-target{font-size:16px!important', "Student verification URL input must avoid iOS Safari focus zoom.");
contains(billingUi, 'body.os-shell:has(#student-verification){height:auto!important', "Student verification mobile layout must avoid the nested fixed-height scroller that causes keyboard scroll jumps.");



contains(legacyApi, '"/api/student-verification"', "Student verification must use the hardened cookie API boundary.");
contains(adminApi, '"student-verification-review"', "Admin API must expose controlled student review.");
contains(adminUi, '"/student-verification"', "Admin UI must expose student verification.");
contains(adminUi, 'class="studentSummary"', "Student verification admin must use the compact responsive summary layout.");
contains(adminUi, 'class="studentInfo"', "Student verification admin must show a dedicated review-guidance panel.");
contains(adminUi, 'class="studentRequestCard"', "Student verification admin must render requests as responsive cards instead of the wide table.");
contains(adminUi, 'class="studentActions"', "Student verification admin must expose mobile-safe action layout.");
contains(adminUi, '.studentActions{display:grid;grid-template-columns:1fr 1fr', "Student verification action buttons must stay horizontally readable.");
contains(adminUi, '.studentActions .btn{height:44px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;white-space:nowrap}', "Student verification action labels must not wrap vertically.");

assert(!billingApi.includes("SUPABASE_SERVICE_ROLE_KEY"), "User billing API must not carry a service-role key.");

contains(legacyApi, '"/api/billing/state"', "Billing state must use the hardened cookie API boundary.");
contains(storageApi, "resolveBillingEntitlements(request)", "Drive must resolve quota from billing entitlements.");
contains(storageApi, "quota_bytes: quotaBytes", "Drive must expose the resolved quota.");
contains(storageApi, "max_file_bytes: maxFileBytes", "Drive must expose the resolved file-size entitlement.");
assert(!storageApi.includes('plan_name: "AERTEX Drive Free"'), "Drive plan identity must no longer be hard-coded.");

contains(shell, '"/settings/subscription"', "Subscription settings route must be registered in the shell.");
contains(settings, "订阅与权益", "Settings must expose subscription management.");

contains(adminApi, '"subscription-grant"', "Admin API must expose manual subscription grants.");
contains(adminApi, '"subscription-reset"', "Admin API must expose Free-plan reset.");
contains(adminUi, '"/billing"', "Admin navigation must expose Billing.");
contains(adminUi, '"/api/admin/billing"', "Admin Billing UI must load billing state.");
contains(adminUi, '"/api/admin/subscription-grant"', "Admin Billing UI must support test grants.");
contains(adminWorker, '"/billing"', "Admin Worker must allow the Billing page.");

console.log("Billing subscription and entitlement foundation checks passed.");
