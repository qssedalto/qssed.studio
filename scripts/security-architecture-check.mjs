// 初学者导读：整体安全架构回归检查；把会话门、API 分层和禁止绕过的关键关系写成可执行断言。
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
