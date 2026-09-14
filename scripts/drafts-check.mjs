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
assert(entry.includes("draftsWorkspaceContent(zh)"), "Draft renderer is not mounted");
assert(edge.includes('"/api/drafts"'), "Draft listing/search must remain behind the expensive-endpoint limiter");

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
