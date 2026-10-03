import fs from "node:fs";
import { workbenchContent } from "../studio/ui-workbench.js";

const worker = fs.readFileSync(new URL("../worker.js", import.meta.url), "utf8");
const entry = fs.readFileSync(new URL("../studio/entry.js", import.meta.url), "utf8");
const edge = fs.readFileSync(new URL("../studio/edge-protection.js", import.meta.url), "utf8");
const api = fs.readFileSync(new URL("../studio/workbench-api.js", import.meta.url), "utf8");

for (const zh of [true, false]) {
  const markup = workbenchContent(zh);
  assert(markup.includes("/api/workbench/overview"), "Workbench must use its aggregation API");
  assert(markup.includes("credentials:'same-origin'"), "Workbench must use the HttpOnly same-origin session");
  assert(!markup.includes("Authorization"), "Workbench browser runtime must not read or send bearer tokens");
  assert(markup.includes("taskBucket(task)"), "Workbench must classify task due dates in browser-local time");
  assert(markup.includes("/workspace/projects"), "Workbench must link to projects");
  assert(markup.includes("/workspace/tasks"), "Workbench must link to tasks");
  assert(markup.includes("/workspace/drafts"), "Workbench must link to drafts");
  assert(markup.includes("/info/notes"), "Workbench must link to notes");
  const scripts = [...markup.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  assert(scripts.length > 0, "Workbench must include a client runtime");
  for (const code of scripts) new Function(code);
}

assert(worker.includes('pathname === "/api/workbench/overview"'), "Worker is missing the Workbench overview API route");
assert(worker.includes("handleWorkbenchOverview(request, env)"), "Worker does not dispatch Workbench through its API boundary");
assert(entry.includes('pathname === "/workspace/workbench"'), "Studio entry does not mount Workbench");
assert(entry.includes("workbenchContent(zh, fullLocale)"), "Workbench renderer must receive the full locale");
assert(edge.includes('"/api/workbench/overview"'), "Workbench aggregation must remain behind the expensive-endpoint limiter");

for (const [locale, expected] of [["zh-tw","工作台"],["ja-jp","ワークベンチ"],["ko-kr","워크벤치"],["fr-fr","Espace de travail · Workbench"],["es-es","Espacio de trabajo · Workbench"],["el-gr","Χώρος εργασίας · Workbench"],["ar-sa","منضدة العمل"]]) {
  const markup = workbenchContent(false, locale);
  assert(markup.includes(expected), "Workbench translation missing for " + locale);
  assert(markup.includes('const prefix="' + "/" + locale + '";'), "Workbench must preserve locale prefix for " + locale);
  assert(markup.includes("/api/workbench/overview"), "Workbench API must remain intact for " + locale);
  const scripts = [...markup.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  for (const code of scripts) new Function(code);
}

assert(api.includes('const PROJECT_ROOT = "_system/projects/"'), "Workbench must aggregate the project namespace");
assert(api.includes('const TASK_ROOT = "_system/tasks/"'), "Workbench must aggregate the task namespace");
assert(api.includes('const DRAFT_ROOT = "_system/drafts/"'), "Workbench must aggregate the draft namespace");
assert(api.includes('const NOTE_ROOT = "_system/notes/"'), "Workbench must aggregate the notes namespace");
assert(api.includes('scope: "own"'), "Workbench must advertise current-account scope");
assert(!api.includes("auth.isAdmin"), "Workbench must not silently broaden scope for administrators");
assert(!api.includes(".put("), "Workbench must remain read-only and must not write R2 objects");
assert(!api.includes(".delete("), "Workbench must remain read-only and must not delete R2 objects");
assert(api.includes('project.status === "active"'), "Workbench must select active projects");
assert(api.includes('task.status !== "done"'), "Workbench must return open tasks for local due-date classification");
assert(api.includes("include: [\"customMetadata\"]"), "Workbench should aggregate lightweight R2 metadata rather than full object bodies");

console.log("Workbench checks passed.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
