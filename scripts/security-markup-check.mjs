/**
 * 【初学者导读】
 * 文件：scripts/security-markup-check.mjs
 * CI 回归检查主题：security markup。
 * 作用：把关键行为转成自动断言，让功能重构、UI 调整或部署配置变化在进入主分支前得到验证。
 * 阅读顺序：先看脚本读取哪些源码/配置，再按 assert 的失败提示理解该模块必须继续满足的规则。
 * 修改原则：测试失败时先定位真实原因；如果是实现偏离既有规则，应修实现；如果产品规则改变，则同时更新实现、测试和说明。
 * 初学者提示：越接近路由、数据同步和本机桥接的检查，越应把“输入、边界条件、失败行为”写清楚。
 */
import { TEXT } from "../studio/config.js";
import { buildLinks } from "../studio/routing.js";
import { signUpPage } from "../studio/auth-pages.js";
import { osPage } from "../studio/ui-shell.js";
import { storageSettingsContent, storageClientScript } from "../studio/ui-storage.js";
import { researchNotesContent } from "../studio/ui-notes.js";
import { summariesContent } from "../studio/ui-information.js";
import { privateLinksPageContent } from "../studio/ui-links-workspace.js";
import { curatedLinksAccountContent } from "../studio/curated-links-account.js";
import { curatedLinksUserEnhancer } from "../studio/curated-links-user.js";
import { hardenBrowserMarkup } from "../studio/browser-security.js";
import { hardenLegacyApiBrowserMarkup } from "../studio/legacy-api-browser-security.js";

const ipInfo = { ip: "203.0.113.10", country: "CN", region: "Test", city: "Test" };
const harden = source => hardenLegacyApiBrowserMarkup(hardenBrowserMarkup(source));

const signupLinks = buildLinks("zh", "/sign-up");
const signup = harden(signUpPage(TEXT.zh, signupLinks, ipInfo));
assertContains(signup, "/api/auth/username-check", "Sign-up page must use the Worker username endpoint");
assertAbsent(signup, "check_registration_username", "Sign-up page leaked the registration RPC name");

const profileLinks = buildLinks("zh", "/profile/details");
const profile = harden(osPage(TEXT.zh, profileLinks, "/profile/details", ipInfo, "Test User"));
for (const endpoint of [
  "/api/account/summary",
  "/api/account/audit",
  "/api/account/device",
  "/api/profile/home",
  "/api/profile/personalization",
  "/api/profile/link",
  "/api/profile/media"
]) {
  assertContains(profile, endpoint, `Profile page must use ${endpoint}`);
}
assertBrowserInternalsHidden(profile, "Profile");

const dashboardLinks = buildLinks("zh", "/dashboard");
const dashboard = harden(osPage(TEXT.zh, dashboardLinks, "/dashboard", ipInfo, "Test User"));
assertContains(dashboard, "/api/account/device", "Dashboard must use the Worker device endpoint from the shared runtime");
assertBrowserInternalsHidden(dashboard, "Dashboard");
assertAbsent(dashboard, "/api/admin/", "Dashboard must not expose administrator API routes");
assertAbsent(dashboard, "/zh-cn/admin", "Dashboard must not expose legacy administrator pages");

const cookieClients = [
  ["Storage", harden(storageSettingsContent(true) + storageClientScript(true, "/zh-cn/login")), ["/api/storage/files", "/api/storage/upload", "/api/storage/object"]],
  ["Notes", harden(researchNotesContent(true)), ["/api/notes"]],
  ["Summaries", harden(summariesContent(true)), ["/api/summaries"]],
  ["Private links", harden(privateLinksPageContent(true)), ["/api/user-links"]],
  ["Account links", harden(curatedLinksAccountContent(true)), ["/api/user-links"]],
  ["Curated user links", harden(curatedLinksUserEnhancer(true)), ["/api/user-links"]]
];
for (const [label, source, endpoints] of cookieClients) {
  for (const endpoint of endpoints) assertContains(source, endpoint, `${label} must retain ${endpoint}`);
  assertAbsent(source, "headers.set('Authorization'", `${label} still sets an Authorization header`);
  assertAbsent(source, 'headers.set("Authorization"', `${label} still sets an Authorization header`);
  assertAbsent(source, "'Authorization':'Bearer '", `${label} still contains a bearer Authorization helper`);
  assertAbsent(source, "Authorization: 'Bearer ' + session.access_token", `${label} still contains a bearer Authorization helper`);
  assertAbsent(source, "const access = await token()", `${label} still reads a token for API authentication`);
  assertContains(source, "same-origin", `${label} must explicitly use same-origin credentials after hardening`);
}

for (const [locale, expected] of [["zh-tw","研究工作區"],["ja-jp","研究ワークスペース"],["ko-kr","연구 작업 공간"],["fr-fr","Espace de recherche"],["es-es","Espacio de investigación"],["el-gr","Χώρος έρευνας"],["ar-sa","مساحة البحث"]]) {
  const notesMarkup = researchNotesContent(false, locale);
  assertContains(notesMarkup, expected, "Notes translation missing for " + locale);
  assertContains(notesMarkup, "/api/notes", "Notes API behavior must remain intact for " + locale);
}

const storageMarkup = storageSettingsContent(true) + storageClientScript(true, "/zh-cn/login");
assertAbsent(storageMarkup, 'id="storage-login-link"', "Storage must not render a redundant re-login button.");
assertAbsent(storageMarkup, "supabaseClient.auth.getSession()", "Storage must not classify a valid server session as signed out because browser auth storage is missing.");
assertContains(storageMarkup, 'credentials: "same-origin"', "Storage must use the validated server cookie session.");

console.log("Browser security markup checks passed.");

function assertBrowserInternalsHidden(source, label) {
  for (const forbidden of [
    'from("profiles")',
    "login_events",
    "user_devices",
    "profile_personalization",
    "profile_links",
    "supabaseClient.storage.from(",
    "supabaseClient.rpc(",
    "get_admin_overview",
    "get_admin_users",
    "get_role_permissions",
    "get_audit_logs",
    "update_user_role",
    "update_user_status",
    "update_role_permissions",
    "adminAccessToken"
  ]) {
    assertAbsent(source, forbidden, `${label} page leaked browser/database detail: ${forbidden}`);
  }
}

function assertContains(source, needle, message) {
  if (!source.includes(needle)) throw new Error(message);
}

function assertAbsent(source, needle, message) {
  if (source.includes(needle)) throw new Error(message);
}
