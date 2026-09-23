import fs from "node:fs";

const read = path => fs.readFileSync(path, "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const shell = read("studio/ui-shell.js");
const gpt = read("studio/gpt-ui.js");
const gptHandoff = read("studio/gpt-subdomain.js");
const authHandoff = read("studio/auth-handoff.js");
const auth = read("auth-worker.js");
const oauth = read("auth-oauth.js");
const sso = read("auth-sso.js");
const work = read("studio/work-subdomain.js");
const workUi = read("studio/ui-work.js");
const knowledge = read("studio/ui-knowledge.js");
const tools = read("studio/lab-tools.js");
const favicon = read("studio/favicon.js");
const workApi = read("studio/work-api.js");
const native = read("local-bridge/native/main_windows.go");

assert(shell.includes("<strong>AERTEX</strong>"), "Main brand must be AERTEX");
assert(shell.includes('platform: "个人工作空间"'), "Chinese main subtitle must be 个人工作空间");
assert(shell.includes('platform: "Personal Workspace"'), "English main subtitle must be Personal Workspace");
assert(shell.includes('["AERTEX Knowledge"'), "Knowledge product must be AERTEX Knowledge");
assert(shell.includes('["AERTEX Drive"'), "Storage product must be AERTEX Drive");
assert(shell.includes('admin: ["AERTEX Console"'), "Admin product must be AERTEX Console");

assert(auth.includes("<strong>AERTEX ID</strong><span>AERTEX Account</span>"), "Auth brand must be AERTEX ID / AERTEX Account");
assert(auth.includes('"AERTEX User"'), "Auth fallback user must be AERTEX User");
assert(oauth.includes("<title>连接到 AERTEX</title>"), "OAuth title must use AERTEX");
assert(oauth.includes("<h1>登录 AERTEX</h1>"), "OAuth login must use AERTEX");
assert(oauth.includes("AERTEX 不会向此应用提供你的密码。"), "OAuth security note must use AERTEX");
assert(sso.includes("<title>AERTEX ID</title>"), "SSO must be branded AERTEX ID");

assert(work.includes("<title>AERTEX Work</title>"), "Work product must be AERTEX Work");
assert(workUi.includes("AERTEX Work"), "Work UI must use AERTEX Work");

assert(gpt.includes('title:"AERTEX Intelligence"'), "GPT product must be AERTEX Intelligence");
assert(gpt.includes('subtitle:"Local Intelligence"'), "GPT subtitle must be Local Intelligence");
assert(gptHandoff.includes("<title>AERTEX Intelligence</title>"), "GPT handoff must use AERTEX Intelligence");
assert(authHandoff.includes('gptTarget ? "AERTEX Intelligence"'), "Auth handoff must use AERTEX Intelligence");
assert(!gpt.includes("AERTEX AI"), "AERTEX AI must not replace the approved Intelligence product name");

assert(knowledge.includes("AERTEX Knowledge"), "Knowledge UI must use AERTEX Knowledge");
assert(tools.includes('"AERTEX Tools"'), "Lab tools must use AERTEX Tools");
assert(favicon.includes('aria-label="AERTEX"'), "Favicon accessible brand must be AERTEX");
assert(workApi.includes('filename="AERTEX-Bridge.exe"'), "Bridge download filename must be AERTEX-Bridge.exe");
assert(native.includes('appName          = "AERTEX Bridge"'), "Native bridge visible name must be AERTEX Bridge");
assert(native.includes('bridgeService    = "qsseda-local-bridge"'), "Bridge service ID must remain qsseda-local-bridge");

for (const technical of [
  "__Host-qsseda-access",
  "__Host-qsseda-refresh",
  "qsseda-git-desktop"
]) {
  const combined = [auth, oauth].join("\n");
  assert(combined.includes(technical), `Stable technical identifier changed unexpectedly: ${technical}`);
}

console.log("AERTEX product naming contract matches the approved table.");
