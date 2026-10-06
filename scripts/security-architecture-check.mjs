/**
 * 【初学者导读】
 * 文件：scripts/security-architecture-check.mjs
 * CI 回归检查主题：security architecture。
 * 作用：把当前产品必须保持的路由、数据、界面或架构规则写成自动断言，让未来改动在合并前就暴露问题。
 * 阅读顺序：先看加载了哪些源文件，再逐条读 assert；每条 assert 都可以理解为一条最小产品规格。
 * 修改原则：先判断失败来自实现错误还是规格变化；只有规格确实调整时，才同时更新实现与检查。
 * 初学者提示：字符串检查适合固定结构，算法应使用小型输入/输出样例验证，二者各有用途。
 */
import fs from "node:fs";

const entry = fs.readFileSync(new URL("../studio/entry.js", import.meta.url), "utf8");
const worker = fs.readFileSync(new URL("../worker.js", import.meta.url), "utf8");
const edge = fs.readFileSync(new URL("../studio/edge-protection.js", import.meta.url), "utf8");
const wrangler = fs.readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8");

for (const forbidden of [
  "hardenAdminClientMarkup",
  'pathname === "/api/admin/access"',
  'pathname.startsWith("/api/admin/")',
  'pathname === "/api/storage/files"',
  'pathname === "/api/storage/upload"',
  'pathname === "/api/storage/object"',
  'pathname === "/api/summaries"',
  'pathname === "/api/notes"',
  'pathname === "/api/user-links"',
  'Authorization: "Bearer " + accessToken',
  "adminAccessToken"
]) {
  assertAbsent(entry, forbidden, `studio/entry.js regained a Worker-owned boundary: ${forbidden}`);
}

for (const required of [
  "isMainAdminHandoffPath(pathname)",
  "handleMainAdminHandoff(request)",
  "isLegacyAdminSurface(pathname)",
  "isLegacyCookieApiPath(pathname)",
  "handleLegacyCookieApi(request, env, pathname)",
  "hardenGlobalBrowserResponse(response)",
  'import { protectEdgeRequest, applyEdgeProtectionHeaders } from "./studio/edge-protection.js"',
  "await protectEdgeRequest(request, env)",
  "applyEdgeProtectionHeaders(request, response)"
]) {
  assertContains(worker, required, `worker.js is missing the routing/security boundary: ${required}`);
}

const protectionPosition = worker.indexOf("await protectEdgeRequest(request, env)");
const routingPosition = worker.indexOf("await routeStudioRequest(request, env, ctx)");
if (protectionPosition < 0 || routingPosition < 0 || protectionPosition >= routingPosition) {
  throw new Error("Edge protection must execute before Studio/API routing");
}

for (const required of [
  "EDGE_GLOBAL_RATE_LIMITER",
  "EDGE_ANON_RATE_LIMITER",
  "EDGE_SUSPECT_RATE_LIMITER",
  "EDGE_EXPENSIVE_RATE_LIMITER",
  "SCANNER_PATH",
  'pathname === "/robots.txt"',
  "x-robots-tag",
  "requestBodyLimit(pathname)"
]) {
  assertContains(edge, required, `edge-protection.js is missing required protection: ${required}`);
}

for (const binding of [
  "EDGE_GLOBAL_RATE_LIMITER",
  "EDGE_ANON_RATE_LIMITER",
  "EDGE_SUSPECT_RATE_LIMITER",
  "EDGE_EXPENSIVE_RATE_LIMITER"
]) {
  assertContains(wrangler, `\"name\": \"${binding}\"`, `wrangler.jsonc is missing edge limiter binding: ${binding}`);
}

assertAbsent(worker, 'handleAdminAccess(request)', "Main Worker must not serve administrator APIs.");
assertAbsent(worker, 'handleAdminAction(request', "Main Worker must not serve administrator actions.");
console.log("Studio API routing and edge protection architecture check passed.");

function assertContains(source, needle, message) {
  if (!source.includes(needle)) throw new Error(message);
}

function assertAbsent(source, needle, message) {
  if (source.includes(needle)) throw new Error(message);
}
