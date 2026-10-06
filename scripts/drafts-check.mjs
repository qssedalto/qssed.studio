/**
 * 【初学者导读】
 * 文件：scripts/drafts-check.mjs
 * 这是 CI 回归检查脚本，主题是：drafts。
 * 作用：把产品架构、关键字符串、公开路由或行为假设写成自动断言；当源码被未来改动破坏时，让 Pull Request 在合并前失败。
 * 阅读方法：从 read()/加载的源码开始，再逐条看 assert；每个 assert 都应能翻译成一句“这个产品必须继续满足什么规则”。
 * 修改原则：如果 CI 失败，先判断源码是否真的违反产品规则；不要为了“变绿”直接删除断言。只有产品规则明确改变时，才应同时修改实现和检查。
 * 测试设计：优先检查用户可感知行为、安全边界和跨模块契约，避免只验证某一行代码长得是否完全一样。
 * 调试方法：先看失败断言的消息，再去对应源码确认实际值；必要时增加更小的针对性样例，而不是扩大整套测试的复杂度。
 */
import fs from "node:fs";
import { draftsWorkspaceContent } from "../studio/ui-drafts.js";

const worker = fs.readFileSync(new URL("../worker.js", import.meta.url), "utf8");
const entry = fs.readFileSync(new URL("../studio/entry.js", import.meta.url), "utf8");
const edge = fs.readFileSync(new URL("../studio/edge-protection.js", import.meta.url), "utf8");
const api = fs.readFileSync(new URL("../studio/drafts-api.js", import.meta.url), "utf8");

for (const zh of [true, false]) {
  const markup = draftsWorkspaceContent(zh);
  assert(markup.includes("/api/drafts"), "Draft workspace must use the Worker draft API");
  assert(markup.includes("/api/projects"), "Draft workspace must load projects for association");
  assert(markup.includes("credentials:'same-origin'"), "Draft workspace must use the HttpOnly same-origin session");
  assert(!markup.includes("Authorization"), "Draft browser runtime must not read or send bearer tokens");
  assert(markup.includes("window.setTimeout(()=>void saveCurrent(false),650)"), "Draft autosave debounce is missing");
  assert(markup.includes("method:'PUT'"), "Draft autosave update behavior is missing");
  assert(markup.includes("method:'POST'"), "Draft creation behavior is missing");
  assert(markup.includes("method:'DELETE'"), "Draft deletion behavior is missing");
  assert(markup.includes("?q="), "Draft body-search request is missing");
  assert(markup.includes('id="draft-project"'), "Draft project selector is missing");
  assert(markup.includes('id="draft-body"'), "Draft editor body is missing");

  const scripts = [...markup.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  assert(scripts.length > 0, "Draft workspace must include a client runtime");
  for (const code of scripts) new Function(code);
}

assert(worker.includes('pathname === "/api/drafts"'), "Worker is missing the draft API route");
assert(worker.includes("handleDrafts(request, env)"), "Worker does not dispatch drafts through its API boundary");
assert(entry.includes('pathname === "/workspace/drafts"'), "Studio entry does not mount Drafts");
assert(entry.includes("draftsWorkspaceContent(zh, fullLocale)"), "Draft renderer must receive the full locale");
assert(edge.includes('"/api/drafts"'), "Draft listing/search must remain behind the expensive-endpoint limiter");

for (const [locale, expected] of [["zh-tw","草稿箱"],["ja-jp","下書き"],["ko-kr","초안"],["fr-fr","Brouillons"],["es-es","Borradores"],["el-gr","Προσχέδια"],["ar-sa","المسودات"]]) {
  const markup = draftsWorkspaceContent(false, locale);
  assert(markup.includes(expected), "Draft translation missing for " + locale);
  assert(markup.includes("/api/drafts") && markup.includes("/api/projects"), "Draft APIs must remain intact for " + locale);
  const scripts = [...markup.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  for (const code of scripts) new Function(code);
}

assert(api.includes('const DRAFT_ROOT = "_system/drafts/"'), "Drafts must use the hidden R2 namespace");
assert(api.includes("draftPrefix(userId)"), "Draft storage must be scoped by user ID");
assert(api.includes('scope: "own"'), "Draft listing must advertise own-account scope");
assert(!api.includes("auth.isAdmin"), "Drafts must not silently broaden access for administrators");
assert(api.includes("owner_id: userId"), "Draft ownership must be server-bound");
assert(api.includes("MAX_DRAFTS = 300"), "Draft count ceiling is missing");
assert(api.includes("MAX_PAYLOAD_BYTES = 128 * 1024"), "Draft payload ceiling is missing");
assert(api.includes("validateProjectReference(env, userId, draft.value.project_id)"), "Draft project references must be checked server-side");
assert(api.includes("projectKey(userId, projectId)"), "Draft project validation must remain account-scoped");
assert(api.includes("if (query) {\n          const draft = await readDraft"), "Draft full-object reads should be reserved for body search");
assert(api.includes("summaryFromMetadata(object.customMetadata"), "Default draft listing should prefer R2 metadata summaries");

console.log("Draft workspace checks passed.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
