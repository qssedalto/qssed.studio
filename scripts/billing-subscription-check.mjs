import fs from "node:fs";

const read = path => fs.readFileSync(path, "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const contains = (source, needle, message) => assert(source.includes(needle), message);

const migration = read("supabase/migrations/202609271530_billing_subscriptions_foundation.sql");
const billingApi = read("studio/billing-api.js");
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
