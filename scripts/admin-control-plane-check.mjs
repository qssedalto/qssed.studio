import fs from "node:fs";
import vm from "node:vm";
import { renderAdminConsole } from "../admin/ui.js";
import { dashboardContent } from "../studio/ui-dashboard.js";
import { renderOsNav } from "../studio/ui-shell.js";

const read = path => fs.readFileSync(path, "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const assertContains = (source, needle, message) => assert(source.includes(needle), message);
const assertAbsent = (source, needle, message) => assert(!source.includes(needle), message);

const adminWorker = read("admin-worker.js");
const adminSession = read("admin/session.js");
const adminApi = read("admin/admin-api.js");
const adminContentApi = read("admin/content-api.js");
const adminUi = read("admin/ui.js");
const adminHandoff = read("studio/admin-subdomain.js");
const mainWorker = read("worker.js");
const gptWorker = read("gpt-worker.js");
const shell = read("studio/ui-shell.js");
const config = read("studio/config.js");
const summaryApi = read("studio/summary-api.js");
const userLinksApi = read("studio/user-links-api.js");
const storageApi = read("studio/storage-api.js");
const storageUi = read("studio/ui-storage.js");
const informationUi = read("studio/ui-information.js");
const globalSearchApi = read("studio/global-search-api.js");
const texApi = read("studio/tex-api-core.js");
const migration = read("supabase/migrations/20260925172204_admin_rpc_private_guard.sql");
const billingMigration = read("supabase/migrations/202609271530_billing_subscriptions_foundation.sql");
const entry = read("studio/entry.js");
const aiGateway = read("studio/ai-gateway.js");
const accessAudit = read("studio/access-audit.js");
const workflow = read(".github/workflows/deploy-production.yml");
const wrangler = JSON.parse(read("wrangler.admin.jsonc").replace(/^\s*\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, ""));

assertContains(adminWorker, "mainOriginForRequest", "Administration Worker must derive AERTEX Home from the active domain family.");
assertContains(adminWorker, 'mainHref: `${mainOriginForRequest(request)}/${page.locale}`', "Administration must preserve locale when returning to AERTEX Home.");
assertContains(adminUi, 'class="admin-main-link"', "Administration sidebar must expose an explicit AERTEX Home entry.");
assertContains(adminUi, 'class="brand" href="${mainHref}"', "Administration brand must also return to AERTEX Home.");

for (const required of [
  "handleAdminHandoff(request)",
  "verifyAdminSession(request)",
  "handleAdminAccess(request)",
  "handleAdminAction(request, env, action)",
  "handleAuthorizedAccessAuditAdmin(request, env)",
  "proxyAiAdmin(request, env, session, pathname)",
  "GPT_CONTROL",
  "ADMIN_BRIDGE_SECRET",
  'service: "qsseda-admin"',
  'pathname === "/robots.txt"'
]) {
  assertContains(adminWorker, required, "Admin Worker missing control-plane invariant: " + required);
}

for (const required of [
  'const ACCESS_COOKIE = "__Host-aertex-admin-access"',
  "SameSite=Strict",
  "verifyAdminDatabaseSession(accessToken)",
  "/rest/v1/rpc/verify_admin_session",
  "handleAdminHandoff(request)",
  "clearAdminSessionCookies()"
]) {
  assertContains(adminSession, required, "Admin session isolation missing: " + required);
}
assertAbsent(adminSession, "refresh_token", "Admin host session must not retain a Supabase refresh token.");
assertAbsent(adminSession, "/rest/v1/rpc/is_admin", "Admin session verification must not depend on the legacy public is_admin RPC.");
assertAbsent(adminApi, '"is_admin"', "Admin API must not redundantly call the legacy public is_admin RPC.");
assertContains(entry, "/rest/v1/rpc/verify_admin_session", "Dashboard admin shortcut must use a live session-backed administrator check.");
assertContains(aiGateway, '"verify_admin_session"', "Intelligence administrator routes must use live session-backed administrator checks.");
assertContains(accessAudit, "/rest/v1/rpc/verify_admin_session", "Legacy access-audit verification must use the live administrator session check.");
assertAbsent(adminHandoff, 'name="refresh_token"', "Main-to-admin handoff must not transfer a refresh token.");
assertContains(adminHandoff, 'name="access_token"', "Main-to-admin handoff must transfer the short-lived access token.");
assertContains(adminHandoff, 'new URL("/control/handoff"', "Admin session redirect must use the main-site control handoff.");

for (const [host, zone] of [
  ["admin.qsseda.com", "qsseda.com"],
  ["admin.qsseda.studio", "qsseda.studio"]
]) {
  assert(wrangler.routes?.some(route => route.pattern === `${host}/*` && route.zone_name === zone), host + " Worker route is missing");
  assert(wrangler.routes?.some(route => route.pattern === host && route.custom_domain === true), host + " custom domain is missing");
}

for (const forbidden of [
  'handleAdminAccess(request)',
  'handleAdminAction(request'
]) {
  assertAbsent(mainWorker, forbidden, "Main Worker still exposes admin routing: " + forbidden);
}
assertContains(mainWorker, "isLegacyAdminSurface(pathname)", "Main Worker must explicitly hide historical admin routes.");
assertContains(mainWorker, 'pathname.startsWith("/api/admin/")', "Main Worker must include legacy admin API paths only in its 404 surface detector.");
assertContains(mainWorker, "handleMainAdminHandoff(request)", "Main Worker must retain only the secure admin session handoff.");

for (const forbidden of [
  "renderAiAdmin",
  "renderAdminDenied",
  'href="/zh-cn/admin"',
  'href="/en/admin"'
]) {
  assertAbsent(gptWorker, forbidden, "GPT Worker still carries legacy admin surface: " + forbidden);
}
assertContains(gptWorker, 'pathname.startsWith("/api/ai/admin/")', "GPT Worker must explicitly 404 legacy admin APIs.");
assertContains(gptWorker, 'pathname.startsWith("/_internal/admin-ai/")', "GPT Worker must expose only the private control-plane AI bridge.");
assertContains(gptWorker, 'X-AERTEX-Control-Secret', "GPT control bridge must require the server-side bridge secret.");
assertContains(gptWorker, 'X-AERTEX-User-Token', "GPT control bridge must carry the verified administrator identity.");

for (const forbidden of [
  'id: "admin"',
  "${prefix}/admin",
  "/api/admin/",
  "adminClientScript",
  "admin-lock",
  "isAdminPath"
]) {
  assertAbsent(shell, forbidden, "Main product shell still contains administrator UI: " + forbidden);
}
for (const forbidden of [
  '"/admin"',
  '"/admin/general"',
  '"/admin/users"',
  '"/admin/roles"',
  '"/admin/logs"',
  '"/admin/system"'
]) {
  assertAbsent(config, forbidden, "Main product route registry still contains administrator page: " + forbidden);
}

const normalDashboard = dashboardContent(true, {
  gptHref: "https://gpt.qsseda.com/zh-cn",
  adminHref: ""
});
assertContains(normalDashboard, "AERTEX Intelligence", "Every user dashboard must show the GPT entry.");
assertContains(normalDashboard, "https://gpt.qsseda.com/zh-cn", "Every user dashboard must link to GPT.");
assertAbsent(normalDashboard, "admin.qsseda.com", "Non-admin dashboard must not reveal the admin domain.");
assertAbsent(normalDashboard, "管理员控制台", "Non-admin dashboard must not show the administrator shortcut.");

const adminDashboard = dashboardContent(true, {
  gptHref: "https://gpt.qsseda.com/zh-cn",
  adminHref: "https://admin.qsseda.com/"
});
assertContains(adminDashboard, "AERTEX Intelligence", "Administrator dashboard must keep the GPT entry.");
assertContains(adminDashboard, "管理员控制台", "Administrator dashboard must expose the explicit admin-domain shortcut.");
assertContains(adminDashboard, "https://admin.qsseda.com/", "Administrator shortcut must target the admin prefix domain.");

const normalNav = renderOsNav({ platform: "个人工作空间", nav: [] }, "", "", {
  gptHref: "https://gpt.qsseda.com/zh-cn",
  adminHref: ""
});
assertContains(normalNav, 'data-product-link="intelligence"', "Every authenticated user menu must expose the GPT entry.");
assertContains(normalNav, "https://gpt.qsseda.com/zh-cn", "User menu GPT entry must target the GPT prefix domain.");
assertAbsent(normalNav, 'data-product-link="admin-console"', "Non-admin menu must not expose the admin shortcut.");
assertAbsent(normalNav, "admin.qsseda.com", "Non-admin menu must not reveal the admin domain.");

const adminNav = renderOsNav({ platform: "个人工作空间", nav: [] }, "", "", {
  gptHref: "https://gpt.qsseda.com/zh-cn",
  adminHref: "https://admin.qsseda.com/"
});
assertContains(adminNav, 'data-product-link="intelligence"', "Administrator menu must keep the GPT entry.");
assertContains(adminNav, 'data-product-link="admin-console"', "Administrator menu must expose the admin shortcut.");
assertContains(adminNav, "管理员控制台", "Administrator menu must label the control-plane shortcut.");
assertContains(adminNav, "https://admin.qsseda.com/", "Administrator menu must target the admin prefix domain.");

const html = renderAdminConsole("/", { identity: "admin@example.test", root: "admin.qsseda.com", mainHref: "https://qsseda.com/zh-cn" });
for (const required of [
  "AERTEX ADMIN",
  "https://qsseda.com/zh-cn",
  "AERTEX 主站",
  "管理控制面",
  "生产环境",
  'href="/users"',
  'href="/access"',
  'href="/content"',
  'href="/storage"',
  'href="/billing"',
  'href="/intelligence"',
  'id="logout"',
  "/api/admin/overview",
  "/api/admin/access-audit",
  "/api/admin/content/summaries",
  "/api/admin/content/links",
  "/api/admin/storage/files",
  "/api/admin/billing",
  "/api/admin/ai/state"
]) {
  assertContains(html, required, "Admin UI missing operational console element: " + required);
}
assertAbsent(html, "Personal Workspace", "Admin UI must not imitate the main Personal Workspace shell.");
assertAbsent(html, 'class="os-shell"', "Admin UI must not reuse the main product shell.");

for (const required of [
  "openUserProvidersDialog",
  "openUserModelsDialog",
  "editProviderDialog",
  "editCheckKey",
  "clear_admin_key",
  "official_month_usd",
  "startRetryCooldown",
  "provider_access:providerAccess",
  "userProviderAccessSelections",
  "normalizedUserAccess"
]) {
  assertContains(html, required, "Admin Intelligence workspace lost migrated capability: " + required);
}

for (const [index, source] of [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]).entries()) {
  new vm.Script(source, { filename: `admin-control-plane-inline-${index}.js` });
}

for (const required of [
  "wrangler.admin.jsonc",
  "admin-worker.js",
  "Deploy AERTEX Administration",
  "Verify Admin custom domain",
  "Configure Admin bridge secret",
  "scripts/admin-control-plane-check.mjs"
]) {
  assertContains(workflow, required, "Production workflow missing admin deployment invariant: " + required);
}

assertContains(adminApi, '"device-exemption"', "Admin control API must own Huawei ID exemption changes.");
assertContains(adminApi, '"subscription-grant"', "Admin control API must own manual subscription grants.");
assertContains(adminApi, '"subscription-reset"', "Admin control API must own subscription reset.");
assertAbsent(adminApi, "verifyStudioApiSession", "Admin API must not reuse the ordinary product session verifier.");

for (const required of [
  'resource === "summaries"',
  'resource === "links"',
  'resource === "storage-files"',
  'resource === "storage-object"',
  "attachOwners(rows, session.accessToken)"
]) {
  assertContains(adminContentApi, required, "Admin content API missing control-plane capability: " + required);
}

for (const [name, source, forbidden] of [
  ["product summaries", summaryApi, ["auth.isAdmin", "is_admin", "scope=all", "listAllSummaries"]],
  ["product private links", userLinksApi, ["auth.isAdmin", "is_admin", "MAX_ADMIN_LINKS"]],
  ["product storage", storageApi, ["auth.isAdmin", "is_admin", "account_is_admin", "all-user-files", "storage.admin."]],
  ["product storage UI", storageUi, ["isAdminView", "adminDescription", "data?.is_admin"]],
  ["product summary UI", informationUi, ["summary-admin", "scope=all", "data?.is_admin", "renderAdmin("]],
  ["product global search", globalSearchApi, ["auth.isAdmin", "is_admin", 'scope: "admin"']],
  ["product TeX API", texApi, ["metadata.is_admin", "const isAdmin"]]
]) {
  for (const needle of forbidden) assertAbsent(source, needle, name + " still contains administrator behavior: " + needle);
}
assertContains(storageApi, 'usage_scope: "own-user-files"', "Product storage must stay current-account scoped.");
assertContains(userLinksApi, 'scope: scope === "community" ? "community" : "own"', "Private product links must stay current-account scoped.");
assertContains(summaryApi, 'scope: "own"', "Product summaries must stay current-account scoped.");

for (const required of [
  "create schema if not exists aertex_private",
  "create or replace function aertex_private.verify_admin_session()",
  "from auth.sessions s",
  "create or replace function public.verify_admin_session()",
  "security invoker",
  "create or replace function aertex_private.admin_get_overview()",
  "create or replace function aertex_private.admin_get_users()",
  "create or replace function aertex_private.admin_get_role_permissions()",
  "create or replace function aertex_private.admin_get_audit_logs(",
  "create or replace function aertex_private.admin_update_user_role(",
  "create or replace function aertex_private.admin_update_user_status(",
  "create or replace function aertex_private.admin_update_role_permissions(",
  "create or replace function aertex_private.admin_get_ai_state()",
  "revoke execute on function public.is_admin() from public, anon, authenticated",
  "drop function if exists public.admin_assert()"
]) {
  assertContains(migration, required, "Admin RPC hardening migration missing invariant: " + required);
}
for (const required of [
  "create table if not exists public.billing_subscriptions",
  "create table if not exists public.billing_orders",
  "create or replace function public.get_admin_billing_state()",
  "create or replace function public.admin_grant_subscription(",
  "create or replace function public.admin_reset_subscription("
]) {
  assertContains(billingMigration, required, "Billing control-plane migration missing invariant: " + required);
}

for (const source of [adminWorker, adminSession, adminApi]) {
  assertAbsent(source, "SUPABASE_SERVICE_ROLE_KEY", "Admin control plane must not carry a Supabase service-role key.");
  assertAbsent(source, "SUPABASE_SECRET_KEY", "Admin control plane must not carry a Supabase secret key.");
}
assertAbsent(migration, "auth.jwt()->'app_metadata'->>'role'", "Administrator authority must not fall back to stale JWT role claims.");
assertAbsent(migration, "auth.jwt()->'app_metadata'->>'is_admin'", "Administrator authority must not fall back to stale JWT admin claims.");



// Regression: Cloudflare Workers rejects redirect:"error" *before* network I/O.
// Probe the real quota route using a stubbed upstream; never use a real token.
const quotaApi = read("admin/tex-credits-api.js");
assertContains(quotaApi, 'redirect: "manual"', "Quota RPC must use Workers-compatible no-follow redirect mode.");
assertAbsent(quotaApi, 'redirect: "error"', "Workers cannot construct redirect:error requests.");
assertContains(quotaApi, 'result.status >= 300 && result.status < 400', "Quota RPC must fail closed on redirects.");
const { handleAdminTexCredits } = await import("../admin/tex-credits-api.js");
const savedFetch = globalThis.fetch;
const fakeAdmin = {ok:true, accessToken:"test-jwt-not-a-real-token", user:{id:"11111111-1111-4111-8111-111111111111"}};
const quotaRequest = new Request("https://admin.qsseda.com/api/admin/tex-credits");
try {
  let capturedRedirect;
  globalThis.fetch = async (_url, options) => {
    capturedRedirect = options?.redirect;
    return new Response(JSON.stringify({entries:[],pending:0}),{
      status:200,headers:{"content-type":"application/json"}
    });
  };
  const ok = await handleAdminTexCredits(quotaRequest,{},fakeAdmin);
  assert(ok.status === 200 && capturedRedirect === "manual",
    "Admin quota list must reach Supabase with a Workers-compatible request.");
  const payload = await ok.json();
  assert(Array.isArray(payload.entries) && payload.entries.length === 0,
    "Admin quota GET must return the database's empty ledger.");
  globalThis.fetch = async () => new Response(null, {
    status:302, headers:{location:"https://example.invalid/capture"}
  });
  const redirected = await handleAdminTexCredits(quotaRequest,{},fakeAdmin);
  assert(redirected.status === 503, "Quota fetch must never follow an upstream redirect.");
  globalThis.fetch = async () => new Response(JSON.stringify({message:"not authorized"}), {status:403});
  const denied = await handleAdminTexCredits(quotaRequest,{},fakeAdmin);
  assert(denied.status === 403, "Quota API must not elevate denied admin privileges.");
} finally {
  globalThis.fetch = savedFetch;
}

console.log("AERTEX isolated admin control plane checks passed.");
