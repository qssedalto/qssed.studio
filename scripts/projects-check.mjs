/**
 * 【初学者导读】
 * 文件：scripts/projects-check.mjs
 * CI 回归检查主题：projects。
 * 作用：把当前产品必须保持的路由、数据、界面或架构规则写成自动断言，让未来改动在合并前就暴露问题。
 * 阅读顺序：先看加载了哪些源文件，再逐条读 assert；每条 assert 都可以理解为一条最小产品规格。
 * 修改原则：先判断失败来自实现错误还是规格变化；只有规格确实调整时，才同时更新实现与检查。
 * 初学者提示：字符串检查适合固定结构，算法应使用小型输入/输出样例验证，二者各有用途。
 */
import fs from "node:fs";
import { projectsWorkspaceContent } from "../studio/ui-projects.js";

const worker = fs.readFileSync(new URL("../worker.js", import.meta.url), "utf8");
const entry = fs.readFileSync(new URL("../studio/entry.js", import.meta.url), "utf8");
const edge = fs.readFileSync(new URL("../studio/edge-protection.js", import.meta.url), "utf8");
const api = fs.readFileSync(new URL("../studio/projects-api.js", import.meta.url), "utf8");

for (const zh of [true, false]) {
  const markup = projectsWorkspaceContent(zh);
  assert(markup.includes("/api/projects"), "Project workspace must use the Worker project API");
  assert(markup.includes("credentials:'same-origin'"), "Project workspace must use the HttpOnly same-origin session");
  assert(!markup.includes("Authorization"), "Project browser runtime must not read or send bearer tokens");
  assert(markup.includes("method:editingId?'PUT':'POST'"), "Project create/update behavior is missing");
  assert(markup.includes("method:'DELETE'"), "Project delete behavior is missing");
  assert(markup.includes('data-project-status="active"'), "Project status filters are missing");
  assert(markup.includes('id="project-repository"'), "Project repository field is missing");
  assert(markup.includes('id="project-next"'), "Project next-action field is missing");

  const scripts = [...markup.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  assert(scripts.length > 0, "Project workspace must include a client runtime");
  for (const code of scripts) new Function(code);
}

assert(worker.includes('pathname === "/api/projects"'), "Worker is missing the project API route");
assert(worker.includes("handleProjects(request, env)"), "Worker does not dispatch projects through its API boundary");
assert(entry.includes('pathname === "/workspace/projects"'), "Studio entry does not mount the project workspace");
assert(entry.includes("projectsWorkspaceContent(zh, fullLocale)"), "Project workspace renderer must receive the full locale");
assert(edge.includes('"/api/projects"'), "Project listing must remain behind the expensive-endpoint limiter");

for (const [locale, expected] of [["zh-tw","專案管理"],["ja-jp","プロジェクト管理"],["ko-kr","프로젝트 관리"],["fr-fr","Gestion des projets"],["es-es","Gestión de proyectos"],["el-gr","Διαχείριση έργων"],["ar-sa","إدارة المشاريع"]]) {
  const markup = projectsWorkspaceContent(false, locale);
  assert(markup.includes(expected), "Project translation missing for " + locale);
  assert(markup.includes("/api/projects"), "Project API behavior must remain intact for " + locale);
  const scripts = [...markup.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  for (const code of scripts) new Function(code);
}

assert(api.includes('const PROJECT_ROOT = "_system/projects/"'), "Projects must use the hidden R2 project namespace");
assert(api.includes("projectPrefix(userId)"), "Project storage must be scoped by user ID");
assert(api.includes('scope: "own"'), "Project listing must advertise own-account scope");
assert(!api.includes("auth.isAdmin"), "Projects must not silently broaden access for administrators");
assert(api.includes("owner_id: userId"), "Project records must bind ownership server-side");
assert(api.includes("MAX_PROJECTS = 200"), "Project count ceiling is missing");

console.log("Project workspace checks passed.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
