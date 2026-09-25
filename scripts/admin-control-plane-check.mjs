import fs from "node:fs";
import vm from "node:vm";
import { renderAdminConsole } from "../admin/ui.js";
import { dashboardContent } from "../studio/ui-dashboard.js";

const read = path => fs.readFileSync(path, "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const assertContains = (source, needle, message) => assert(source.includes(needle), message);
const assertAbsent = (source, needle, message) => assert(!source.includes(needle), message);

const adminWorker = read("admin-worker.js");
const adminSession = read("admin/session.js");
const adminApi = read("admin/admin-api.js");
const adminUi = read("admin/ui.js");
const adminHandoff = read("studio/admin-subdomain.js");
const mainWorker = read("worker.js");
const gptWorker = read("gpt-worker.js");
const shell = read("studio/ui-shell.js");
const config = read("studio/config.js");
const workflow = read(".github/workflows/deploy-production.yml");
const wrangler = JSON.parse(read("wrangler.admin.jsonc").replace(/^\s*\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, ""));

for (const required of [
  "handleAdminHandoff(request)",
  "verifyAdminSession(request)",
  "handleAdminAccess(request)",
  "handleAdminAction(request, env, action)",
  "handleAuthorizedAccessAuditAdmin(request, env)",
  "handleAiAdminApi(internal, env, session)",
  'service: "qsseda-admin"',
  'pathname === "/robots.txt"'
]) {
  assertContains(adminWorker, required, "Admin Worker missing control-plane invariant: " + required);
}

for (const required of [
  'const ACCESS_COOKIE = "__Host-aertex-admin-access"',
  "SameSite=Strict",
  "adminCheck(accessToken)",
  "activeProfile(accessToken",
  "handleAdminHandoff(request)",
  "clearAdminSessionCookies()"
]) {
  assertContains(adminSession, required, "Admin session isolation missing: " + required);
}
assertAbsent(adminSession, "refresh_token", "Admin host session must not retain a Supabase refresh token.");
assertAbsent(adminHandoff, 'name="refresh_token"', "Main-to-admin handoff must not transfer a refresh token.");
assertContains(adminHandoff, 'name="access_token"', "Main-to-admin handoff must transfer the short-lived access token.");
assertContains(adminHandoff, 'new URL("/control/handoff"', "Admin session redirect must use the main-site control handoff.");

for (const [host, zone] of [
  ["admin.qsseda.com", "qsseda.com"],
  ["admin.qsseda.online", "qsseda.online"],
  ["admin.qsseda.studio", "qsseda.studio"]
]) {
  assert(wrangler.routes?.some(route => route.pattern === `${host}/*` && route.zone_name === zone), host + " Worker route is missing");
  assert(wrangler.routes?.some(route => route.pattern === host && route.custom_domain === true), host + " custom domain is missing");
}

for (const forbidden of [
  'pathname === "/api/admin/access"',
  'pathname.startsWith("/api/admin/")',
  'handleAdminAccess(request)',
  'handleAdminAction(request'
]) {
  assertAbsent(mainWorker, forbidden, "Main Worker still exposes admin routing: " + forbidden);
}
assertContains(mainWorker, "isLegacyAdminSurface(pathname)", "Main Worker must explicitly hide historical admin routes.");
assertContains(mainWorker, "handleMainAdminHandoff(request)", "Main Worker must retain only the secure admin session handoff.");

for (const forbidden of [
  "renderAiAdmin",
  "handleAiAdminApi(request",
  "renderAdminDenied",
  'href="/zh-cn/admin"',
  'href="/en/admin"'
]) {
  assertAbsent(gptWorker, forbidden, "GPT Worker still carries legacy admin surface: " + forbidden);
}
assertContains(gptWorker, 'pathname.startsWith("/api/ai/admin/")', "GPT Worker must explicitly 404 legacy admin APIs.");

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

const html = renderAdminConsole("/", { identity: "admin@example.test", root: "admin.qsseda.com" });
for (const required of [
  "AERTEX ADMIN",
  "CONTROL PLANE",
  "PRODUCTION",
  'href="/users"',
  'href="/access"',
  'href="/intelligence"',
  'id="logout"',
  "/api/admin/overview",
  "/api/admin/access-audit",
  "/api/admin/ai/state?fast=1"
]) {
  assertContains(html, required, "Admin UI missing operational console element: " + required);
}
assertAbsent(html, "Personal Workspace", "Admin UI must not imitate the main Personal Workspace shell.");
assertAbsent(html, 'class="os-shell"', "Admin UI must not reuse the main product shell.");
for (const [index, source] of [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]).entries()) {
  new vm.Script(source, { filename: `admin-control-plane-inline-${index}.js` });
}

for (const required of [
  "wrangler.admin.jsonc",
  "admin-worker.js",
  "Deploy AERTEX Administration",
  "Verify Admin custom domain",
  "scripts/admin-control-plane-check.mjs"
]) {
  assertContains(workflow, required, "Production workflow missing admin deployment invariant: " + required);
}

assertContains(adminApi, '"device-exemption"', "Admin control API must own Huawei ID exemption changes.");
assertAbsent(adminApi, "verifyStudioApiSession", "Admin API must not reuse the ordinary product session verifier.");

console.log("AERTEX isolated admin control plane checks passed.");
