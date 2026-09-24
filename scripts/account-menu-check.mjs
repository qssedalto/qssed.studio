import fs from "node:fs";
import vm from "node:vm";
import { renderGptApp } from "../studio/gpt-ui.js";
import { renderAiAdmin } from "../studio/ai-admin-ui.js";
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
  "injectAccountMenuRuntime(markup)",
  "renderAdminDenied(locale, identity)"
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

assert(globalBrowser.includes("injectAccountMenuRuntime("), "Main/Work browser HTML must receive the shared account menu fallback.");
assert(accountSecurity.includes("email: String(session.user.email ||"), "Account summary must expose the signed-in email to the server-rendered account menu.");
assert(accountMenu.includes('id="aertex-account-signout"'), "Shared account menu must expose sign out.");
assert(accountMenu.includes('id="aertex-account-switch"'), "Shared account menu must expose switch/re-login.");
assert(accountMenu.includes('new URL("/logout",authOrigin())'), "App account menu must route global sign-out through AERTEX ID.");

for (const locale of ["zh-cn", "en"]) {
  const gpt = renderGptApp(locale);
  const admin = renderAiAdmin(locale);
  for (const [name, html] of [["Intelligence", gpt], ["Intelligence Admin", admin]]) {
    assert(html.includes('id="aertex-account-root"'), name + " must render the account avatar menu for " + locale);
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
    assert(scripts.length >= 2, name + " must retain app and account-menu scripts for " + locale);
    for (const [index, source] of scripts.entries()) {
      new vm.Script(source, { filename: `account-menu-${name.replace(/\s+/g,"-")}-${locale}-${index}.js` });
    }
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
