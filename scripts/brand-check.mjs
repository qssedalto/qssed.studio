/**
 * 【初学者导读】
 * 文件：scripts/brand-check.mjs
 * 这是 CI 回归检查脚本，主题是：brand。
 * 作用：把产品架构、关键字符串、公开路由或行为假设写成自动断言；当源码被未来改动破坏时，让 Pull Request 在合并前失败。
 * 阅读方法：从 read()/加载的源码开始，再逐条看 assert；每个 assert 都应能翻译成一句“这个产品必须继续满足什么规则”。
 * 修改原则：如果 CI 失败，先判断源码是否真的违反产品规则；不要为了“变绿”直接删除断言。只有产品规则明确改变时，才应同时修改实现和检查。
 * 测试设计：优先检查用户可感知行为、安全边界和跨模块契约，避免只验证某一行代码长得是否完全一样。
 * 调试方法：先看失败断言的消息，再去对应源码确认实际值；必要时增加更小的针对性样例，而不是扩大整套测试的复杂度。
 */
import fs from "node:fs";

const read = path => fs.readFileSync(path, "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const shell = read("studio/ui-shell.js");
const admin = read("admin/ui.js");
const gpt = read("studio/gpt-ui.js");
const gptI18n = read("studio/gpt-i18n.js");
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
const portal = read("AUTH_PORTAL.md");

assert(shell.includes("<strong>AERTEX</strong>"), "Main brand must be AERTEX");
assert(shell.includes('platform: "个人工作空间"'), "Chinese main subtitle must be 个人工作空间");
assert(shell.includes('platform: "Personal Workspace"'), "English main subtitle must be Personal Workspace");
assert(shell.includes('["AERTEX Knowledge"'), "Knowledge product must be AERTEX Knowledge");
assert(shell.includes('["AERTEX Drive"'), "Storage product must be AERTEX Drive");
assert(!shell.includes("AERTEX Console"), "Main product shell must not expose the administrator product.");
assert(admin.includes("<title>AERTEX 管理控制台</title>"), "Admin control plane title must preserve AERTEX branding in the localized console.");
assert(admin.includes("AERTEX ADMIN"), "Admin control plane visible brand must be AERTEX ADMIN");

assert(auth.includes("<strong>AERTEX ID</strong><span>AERTEX Account</span>"), "Auth brand must be AERTEX ID / AERTEX Account");
assert(auth.includes('"AERTEX User"'), "Auth fallback user must be AERTEX User");
assert(oauth.includes("<title>连接到 AERTEX</title>"), "OAuth title must use AERTEX");
assert(oauth.includes("<h1>登录 AERTEX</h1>"), "OAuth login must use AERTEX");
assert(oauth.includes("AERTEX 不会向此应用提供你的密码。"), "OAuth security note must use AERTEX");
assert(sso.includes("<title>AERTEX ID</title>"), "SSO must be branded AERTEX ID");

assert(work.includes("<title>AERTEX Work</title>"), "Work product must be AERTEX Work");
assert(workUi.includes("AERTEX Work"), "Work UI must use AERTEX Work");
assert(shell.includes('title:"AERTEX Cash"') && shell.includes('id: "cash", label: "AERTEX Cash"'), "Cash product must be AERTEX Cash.");
assert(shell.includes('title:"AERTEX Watch"') && shell.includes('id: "activitywatch", label: "AERTEX Watch"'), "Activity tracking product must be branded AERTEX Watch.");
assert(!shell.includes('title:"ActivityWatch"') && !shell.includes('label: "ActivityWatch"'), "Legacy ActivityWatch must not remain as a rendered product name.");

assert(gpt.includes("<title>AERTEX Intelligence</title>") && gptI18n.includes('title:"AERTEX Intelligence"'), "GPT product must be AERTEX Intelligence");
assert(gptI18n.includes('subtitle:"Cloud Intelligence"'), "GPT subtitle must be Cloud Intelligence");
assert(gptHandoff.includes("<title>AERTEX Intelligence</title>"), "GPT handoff must use AERTEX Intelligence");
assert(authHandoff.includes('gptTarget ? "AERTEX Intelligence"'), "Auth handoff must use AERTEX Intelligence");
assert(!gpt.includes("AERTEX AI"), "AERTEX AI must not replace the approved Intelligence product name");

assert(knowledge.includes("AERTEX Knowledge"), "Knowledge UI must use AERTEX Knowledge");
assert(tools.includes('"AERTEX Tools"'), "Lab tools must use AERTEX Tools");
assert(favicon.includes('aria-label="AERTEX"'), "Favicon accessible brand must be AERTEX");
assert(workApi.includes('filename="AERTEX-Bridge.exe"'), "Bridge download filename must be AERTEX-Bridge.exe");
assert(native.includes('appName          = "AERTEX Bridge"'), "Native bridge visible name must be AERTEX Bridge");
assert(native.includes('bridgeService    = "qsseda-local-bridge"'), "Bridge service ID must remain qsseda-local-bridge");

for (const technical of ["__Host-qsseda-access","__Host-qsseda-refresh"]) {
  const combined = [auth, oauth].join("\n");
  assert(combined.includes(technical), `Stable technical identifier changed unexpectedly: ${technical}`);
}
assert(portal.includes("client_id: qsseda-git-desktop"), "OAuth client_id must remain qsseda-git-desktop");

console.log("AERTEX product naming contract matches the approved table.");
