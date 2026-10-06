/**
 * 【初学者导读】
 * 文件：scripts/account-menu-check.mjs
 * 这是 CI 回归检查脚本，主题是：account menu。
 * 作用：把产品架构、关键字符串、公开路由或行为假设写成自动断言；当源码被未来改动破坏时，让 Pull Request 在合并前失败。
 * 阅读方法：从 read()/加载的源码开始，再逐条看 assert；每个 assert 都应能翻译成一句“这个产品必须继续满足什么规则”。
 * 修改原则：如果 CI 失败，先判断源码是否真的违反产品规则；不要为了“变绿”直接删除断言。只有产品规则明确改变时，才应同时修改实现和检查。
 * 测试设计：优先检查用户可感知行为、安全边界和跨模块契约，避免只验证某一行代码长得是否完全一样。
 * 调试方法：先看失败断言的消息，再去对应源码确认实际值；必要时增加更小的针对性样例，而不是扩大整套测试的复杂度。
 */
import fs from "node:fs";
import vm from "node:vm";
import { renderGptApp } from "../studio/gpt-ui.js";
import { accountMenuMarkup } from "../studio/account-menu.js";

const read = path => fs.readFileSync(path, "utf8");
const gptWorker = read("gpt-worker.js");
const authWorker = read("auth-worker.js");
const globalBrowser = read("studio/global-browser-security.js");
const accountMenu = read("studio/account-menu.js");
const accountSecurity = read("studio/account-security-api.js");

for (const required of [
  'pathname === "/api/auth/logout"',
  "handleStudioSessionLogout(request)",
  'pathname === "/api/account/security/summary"',
  'handleAccountSecurity(request, "summary")',
  "injectAccountMenuRuntime(markup)"
]) {
  assert(gptWorker.includes(required), "Intelligence account escape hatch is missing: " + required);
}

for (const required of [
  'pathname === "/logout"',
  "handleBrowserLogout(request)",
  'const ACCOUNT_COOKIE = "__Secure-qsseda-account-id"',
  'const ACCOUNT_SIGNED_OUT = "signed-out"',
  "globalAuthLogoutCookies(request)",
  "rootDomainForRequest(request)"
]) {
  assert(authWorker.includes(required), "AERTEX ID global logout invariant is missing: " + required);
}

assert(authWorker.includes('href="${mainOrigin}/${locale}"'), "AERTEX ID brand must return to the localized main site.");
assert(authWorker.includes('const homeLabel = locale === "zh-cn" ? "返回 AERTEX 主站" : "AERTEX Home";'), "AERTEX ID must label its main-site exit clearly.");
assert(globalBrowser.includes("injectAccountMenuRuntime("), "Main/Work browser HTML must receive the shared account menu fallback.");
assert(accountSecurity.includes("email: String(session.user.email ||"), "Account summary must expose the signed-in email to the server-rendered account menu.");
assert(accountMenu.includes('id="aertex-account-signout"'), "Shared account menu must expose sign out.");
assert(accountMenu.includes('id="aertex-account-switch"'), "Shared account menu must expose account switching.");
assert(!accountMenu.includes("切换账号 / 重新登录") && !accountMenu.includes("Switch account / sign in again"), "Shared account menu must not label account switching as re-login.");
assert(accountMenu.includes('new URL("/logout",authOrigin())'), "App account menu must route global sign-out through AERTEX ID.");
assert(accountMenu.includes(':root[data-theme="dark"] .aertex-account-root'), "Shared account menu must define an explicit dark-theme surface.");
assert(accountMenu.includes('--aertex-account-panel:var(--panel,var(--glass-heavy,var(--surface,#1c1c1e)))'), "Shared account menu must have a dark fallback when the host page does not define panel variables.");
assert(accountMenu.includes('background:var(--aertex-account-panel)'), "Shared account menu must render from the theme-safe account surface token.");

for (const locale of ["zh-cn", "en"]) {
  const html = renderGptApp(locale);
  assert(html.includes('id="aertex-account-root"'), "Intelligence must render the account avatar menu for " + locale);
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  assert(scripts.length >= 2, "Intelligence must retain app and account-menu scripts for " + locale);
  for (const [index, source] of scripts.entries()) {
    new vm.Script(source, { filename: `account-menu-Intelligence-${locale}-${index}.js` });
  }
}

for (const locale of ["zh-cn", "en"]) {
  const menu = accountMenuMarkup(locale);
  assert(menu.includes('id="aertex-account-button"'), "Avatar button missing for " + locale);
  assert(menu.includes('id="aertex-account-signout"'), "Sign-out action missing for " + locale);
  assert(menu.includes('id="aertex-account-switch"'), "Switch-account action missing for " + locale);
}

console.log("AERTEX shared account avatar/logout contract looks valid.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
