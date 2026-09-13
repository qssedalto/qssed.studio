import fs from "node:fs";

const shellPath = "studio/ui-shell.js";
const dashboardPath = "studio/ui-dashboard.js";
const informationPath = "studio/ui-information.js";
const workspacePath = "studio/ui-workspace.js";

let shell = fs.readFileSync(shellPath, "utf8");
for (const path of [dashboardPath, informationPath, workspacePath]) {
  if (fs.existsSync(path)) throw new Error(path + " already exists");
}

function requireIndex(source, marker, label, from = 0) {
  const index = source.indexOf(marker, from);
  if (index < 0) throw new Error(label + " marker not found: " + marker);
  return index;
}

function replaceOnce(source, needle, replacement, label) {
  const first = source.indexOf(needle);
  if (first < 0) throw new Error(label + " target not found");
  if (source.indexOf(needle, first + needle.length) >= 0) throw new Error(label + " target is not unique");
  return source.slice(0, first) + replacement + source.slice(first + needle.length);
}

// Dashboard: move icon + page renderer as one exact block.
const dashboardStart = requireIndex(shell, "export function dashboardIcon(name) {", "Dashboard start");
const dashboardEnd = requireIndex(shell, "\nexport function linksContent(zh) {", "Dashboard end", dashboardStart);
const dashboardBlock = shell.slice(dashboardStart, dashboardEnd).trimEnd();
shell = shell.slice(0, dashboardStart) + shell.slice(dashboardEnd + 1);
if (!dashboardBlock.includes("export function dashboardContent(zh)")) throw new Error("dashboardContent missing from extracted Dashboard block");

// Information: move route-owned renderers; inject the existing shared statusContent helper only where required.
const infoStart = requireIndex(shell, "export function linksContent(zh) {", "Information start");
const infoEnd = requireIndex(shell, "\n\nexport function osHubIcon(name) {", "Information end", infoStart);
let infoBlock = shell.slice(infoStart, infoEnd).trimEnd();
shell = shell.slice(0, infoStart) + shell.slice(infoEnd + 2);
infoBlock = replaceOnce(infoBlock, "export function summariesContent(zh) {", "export function summariesContent(zh, statusContent) {", "summariesContent dependency injection");
const informationDispatcher = `export function informationContent(path, zh, statusContent) {\n  if (path === \"/info\") return statusContent(zh, \"信息中心尚未接入\", \"收藏链接、笔记、摘要和 AI 对话目前没有持久化数据源。\", \"Information Center is not connected yet\", \"Saved links, notes, summaries, and AI conversations do not have persistent data sources yet.\");\n  if (path === \"/info/knowledge\") return statusContent(zh, \"知识库\", \"用于整理值得长期保留的知识内容，让信息更容易积累、查找和回顾。\", \"Knowledge Base\", \"Organize knowledge worth keeping so it remains easy to build on, find, and revisit.\");\n  if (path === \"/info/links\") return linksContent(zh);\n  if (path === \"/info/notes\") return notesContent(zh);\n  if (path === \"/info/summaries\") return summariesContent(zh, statusContent);\n  if (path === \"/info/search\") return searchContent(zh);\n  throw new Error(\"Unhandled OS path: \" + path);\n}`;
const informationSource = `${infoBlock}\n\n${informationDispatcher}\n`;

// Workspace: move the renderer but keep statusContent shell-owned through dependency injection.
const workspaceStart = requireIndex(shell, "export function workspaceContent(path, zh) {", "Workspace start");
const workspaceEnd = requireIndex(shell, "\n\nexport function adminContent(path, zh) {", "Workspace end", workspaceStart);
let workspaceBlock = shell.slice(workspaceStart, workspaceEnd).trimEnd();
shell = shell.slice(0, workspaceStart) + shell.slice(workspaceEnd + 2);
workspaceBlock = replaceOnce(workspaceBlock, "export function workspaceContent(path, zh) {", "export function workspaceContent(path, zh, statusContent) {", "workspaceContent dependency injection");

// Rewire shell imports.
const adminImport = 'import { adminClientScript, adminLogsContent, adminOverviewContent, adminRolesContent, adminSystemContent, adminUsersContent } from "./ui-admin.js";';
shell = replaceOnce(
  shell,
  adminImport,
  adminImport + '\nimport { dashboardContent } from "./ui-dashboard.js";\nimport { informationContent } from "./ui-information.js";\nimport { workspaceContent } from "./ui-workspace.js";',
  "content module imports"
);

// Collapse Information routing into its owning domain while preserving top-level route order.
const oldInfoDispatch = `  if (path === "/dashboard") return dashboardContent(zh);\n  if (path === "/info") return statusContent(zh, "信息中心尚未接入", "收藏链接、笔记、摘要和 AI 对话目前没有持久化数据源。", "Information Center is not connected yet", "Saved links, notes, summaries, and AI conversations do not have persistent data sources yet.");\n  if (path === "/info/knowledge") return statusContent(zh, "知识库", "用于整理值得长期保留的知识内容，让信息更容易积累、查找和回顾。", "Knowledge Base", "Organize knowledge worth keeping so it remains easy to build on, find, and revisit.");\n  if (path === "/info/links") return linksContent(zh);\n  if (path === "/info/notes") return notesContent(zh);\n  if (path === "/info/summaries") return summariesContent(zh);\n  if (path === "/info/search") return searchContent(zh);`;
const newInfoDispatch = `  if (path === "/dashboard") return dashboardContent(zh);\n  if (path.startsWith("/info")) return informationContent(path, zh, statusContent);`;
shell = replaceOnce(shell, oldInfoDispatch, newInfoDispatch, "Information route dispatch");
shell = replaceOnce(
  shell,
  '  if (path.startsWith("/workspace")) return workspaceContent(path, zh);',
  '  if (path.startsWith("/workspace")) return workspaceContent(path, zh, statusContent);',
  "Workspace route dispatch"
);

for (const marker of ["export function statusContent", "export function osHubIcon", "export function profileHubContent", "export function adminHubContent", "export function settingsHubContent", "async function hydrateOsUser()", "applyCompactViewMode"] ) {
  if (!shell.includes(marker)) throw new Error("Shell-owned marker lost: " + marker);
}
for (const removed of ["export function dashboardIcon", "export function dashboardContent", "export function linksContent", "export function notesContent", "export function summariesContent", "export function searchContent", "export function workspaceContent"]) {
  if (shell.includes(removed)) throw new Error("Domain function remained in shell: " + removed);
}

fs.writeFileSync(dashboardPath, dashboardBlock + "\n");
fs.writeFileSync(informationPath, informationSource);
fs.writeFileSync(workspacePath, workspaceBlock + "\n");
fs.writeFileSync(shellPath, shell);

console.log("Extracted Dashboard, Information and Workspace content domains.");
