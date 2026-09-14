import fs from "node:fs";

const entry = fs.readFileSync(new URL("../studio/entry.js", import.meta.url), "utf8");
const worker = fs.readFileSync(new URL("../worker.js", import.meta.url), "utf8");

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
  'pathname === "/api/admin/access"',
  'pathname.startsWith("/api/admin/")',
  "isLegacyCookieApiPath(pathname)",
  "handleLegacyCookieApi(request, env, pathname)",
  "hardenGlobalBrowserResponse(response)"
]) {
  assertContains(worker, required, `worker.js is missing the routing/security boundary: ${required}`);
}

console.log("Studio API routing architecture check passed.");

function assertContains(source, needle, message) {
  if (!source.includes(needle)) throw new Error(message);
}

function assertAbsent(source, needle, message) {
  if (source.includes(needle)) throw new Error(message);
}
