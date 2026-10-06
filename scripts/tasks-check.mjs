/**
 * 【初学者导读】
 * 文件：scripts/tasks-check.mjs
 * CI 回归检查主题：tasks。
 * 作用：把关键行为转成自动断言，让功能重构、UI 调整或部署配置变化在进入主分支前得到验证。
 * 阅读顺序：先看脚本读取哪些源码/配置，再按 assert 的失败提示理解该模块必须继续满足的规则。
 * 修改原则：测试失败时先定位真实原因；如果是实现偏离既有规则，应修实现；如果产品规则改变，则同时更新实现、测试和说明。
 * 初学者提示：越接近路由、数据同步和本机桥接的检查，越应把“输入、边界条件、失败行为”写清楚。
 */
import fs from "node:fs";
import { tasksWorkspaceContent } from "../studio/ui-tasks.js";

const worker = fs.readFileSync(new URL("../worker.js", import.meta.url), "utf8");
const entry = fs.readFileSync(new URL("../studio/entry.js", import.meta.url), "utf8");
const edge = fs.readFileSync(new URL("../studio/edge-protection.js", import.meta.url), "utf8");
const api = fs.readFileSync(new URL("../studio/tasks-api.js", import.meta.url), "utf8");

for (const zh of [true, false]) {
  const markup = tasksWorkspaceContent(zh);
  assert(markup.includes("/api/tasks"), "Task Center must use the Worker task API");
  assert(markup.includes("/api/projects"), "Task Center must load account projects for project association");
  assert(markup.includes("credentials:'same-origin'"), "Task Center must use the HttpOnly same-origin session");
  assert(!markup.includes("Authorization"), "Task browser runtime must not read or send bearer tokens");
  assert(markup.includes("method:editingId?'PUT':'POST'"), "Task create/update behavior is missing");
  assert(markup.includes("method:'DELETE'"), "Task delete behavior is missing");
  assert(markup.includes("toggleDone(task)"), "Task quick-complete behavior is missing");
  assert(markup.includes('data-task-status="todo"'), "Todo status filter is missing");
  assert(markup.includes('data-task-status="in_progress"'), "In-progress status filter is missing");
  assert(markup.includes('id="tasks-project-filter"'), "Project filter is missing");
  assert(markup.includes('id="task-due"'), "Due-date field is missing");

  const scripts = [...markup.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  assert(scripts.length > 0, "Task Center must include a client runtime");
  for (const code of scripts) new Function(code);
}

assert(worker.includes('pathname === "/api/tasks"'), "Worker is missing the task API route");
assert(worker.includes("handleTasks(request, env)"), "Worker does not dispatch tasks through its API boundary");
assert(entry.includes('pathname === "/workspace/tasks"'), "Studio entry does not mount Task Center");
assert(entry.includes("tasksWorkspaceContent(zh, fullLocale)"), "Task Center renderer must receive the full locale");
assert(edge.includes('"/api/tasks"'), "Task listing must remain behind the expensive-endpoint limiter");

for (const [locale, expected] of [["zh-tw","任務中心"],["ja-jp","タスクセンター"],["ko-kr","작업 센터"],["fr-fr","Centre des tâches"],["es-es","Centro de tareas"],["el-gr","Κέντρο εργασιών"],["ar-sa","مركز المهام"]]) {
  const markup = tasksWorkspaceContent(false, locale);
  assert(markup.includes(expected), "Task translation missing for " + locale);
  assert(markup.includes("/api/tasks") && markup.includes("/api/projects"), "Task APIs must remain intact for " + locale);
  const scripts = [...markup.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  for (const code of scripts) new Function(code);
}

assert(api.includes('const TASK_ROOT = "_system/tasks/"'), "Tasks must use the hidden R2 task namespace");
assert(api.includes("taskPrefix(userId)"), "Task storage must be scoped by user ID");
assert(api.includes('scope: "own"'), "Task listing must advertise own-account scope");
assert(!api.includes("auth.isAdmin"), "Tasks must not silently broaden access for administrators");
assert(api.includes("owner_id: userId"), "Task records must bind ownership server-side");
assert(api.includes("MAX_TASKS = 500"), "Task count ceiling is missing");
assert(api.includes("validateProjectReference(env, userId, task.value.project_id)"), "Task project references must be checked server-side");
assert(api.includes("projectKey(userId, projectId)"), "Project validation must remain account-scoped");
assert(api.includes('STATUSES = new Set(["todo", "in_progress", "done"])'), "Task lifecycle is incomplete");
assert(api.includes("completed_at"), "Task completion timestamp is missing");

console.log("Task Center checks passed.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
