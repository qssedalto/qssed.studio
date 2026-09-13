import fs from "node:fs";

const shellPath = "studio/ui-shell.js";
const corePath = "studio/ui-core.js";
const adminPath = "studio/ui-admin.js";

let shell = fs.readFileSync(shellPath, "utf8");
let core = fs.readFileSync(corePath, "utf8");

if (fs.existsSync(adminPath)) throw new Error("ui-admin.js already exists");

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

// Move the four Admin detail renderers as one exact source block.
const renderStartMarker = "export function adminOverviewContent(zh) {";
const renderEndMarker = "\n\nexport function settingsContent(path, zh) {";
const renderStart = requireIndex(shell, renderStartMarker, "Admin renderer start");
const renderEnd = requireIndex(shell, renderEndMarker, "Admin renderer end", renderStart);
const renderBlock = shell.slice(renderStart, renderEnd).trimEnd();
shell = shell.slice(0, renderStart) + shell.slice(renderEnd + 2);

for (const name of ["adminOverviewContent", "adminUsersContent", "adminRolesContent", "adminLogsContent"]) {
  if (!renderBlock.includes(`export function ${name}`)) throw new Error(`Missing ${name} in extracted renderer block`);
  if (shell.includes(`export function ${name}`)) throw new Error(`${name} remained in ui-shell.js`);
}

// Turn the existing inline Admin system placeholder into an Admin-owned renderer without changing its template expression.
const shellLines = shell.split("\n");
const systemLineIndex = shellLines.findIndex(line => line.includes('if (path.endsWith("/system")) return `'));
if (systemLineIndex < 0) throw new Error("Admin system inline renderer not found");
const systemLine = shellLines[systemLineIndex];
const returnAt = systemLine.indexOf("return ");
if (returnAt < 0 || !systemLine.trimEnd().endsWith(";")) throw new Error("Unexpected Admin system renderer shape");
const systemExpression = systemLine.slice(returnAt + "return ".length).trim().replace(/;$/, "");
shellLines[systemLineIndex] = '  if (path.endsWith("/system")) return adminSystemContent(zh);';
shell = shellLines.join("\n");
const systemFunction = `export function adminSystemContent(zh) {\n  return ${systemExpression};\n}`;

// Move the complete Admin browser application renderer out of ui-core.js byte-for-byte.
const clientStartMarker = "export function adminClientScript(ipInfo) {";
const clientEndMarker = "\n\nexport function themeToggle";
const clientStart = requireIndex(core, clientStartMarker, "Admin client start");
const clientEnd = requireIndex(core, clientEndMarker, "Admin client end", clientStart);
const clientBlock = core.slice(clientStart, clientEnd).trimEnd();
core = core.slice(0, clientStart) + core.slice(clientEnd + 2);
if (!clientBlock.includes("hydrateAdminModule")) throw new Error("Admin client extraction lost hydrateAdminModule");
if (!clientBlock.includes("clearAdminUiCaches")) throw new Error("Admin client extraction lost clearAdminUiCaches");
if (core.includes("export function adminClientScript")) throw new Error("adminClientScript remained in ui-core.js");

// Rewire the shell to consume the Admin domain while preserving script execution order and shell authorization.
const profileImport = 'import { profileClientScript, profileContent } from "./ui-profile.js";';
shell = replaceOnce(
  shell,
  profileImport,
  profileImport + '\nimport { adminClientScript, adminLogsContent, adminOverviewContent, adminRolesContent, adminSystemContent, adminUsersContent } from "./ui-admin.js";',
  "Admin module import"
);
const oldCoreImport = 'import { adminClientScript, auditClientScript, baseHead, supabaseScript, themeScript, topControls } from "./ui-core.js";';
const newCoreImport = 'import { auditClientScript, baseHead, supabaseScript, themeScript, topControls } from "./ui-core.js";';
shell = replaceOnce(shell, oldCoreImport, newCoreImport, "ui-core Admin import removal");

for (const marker of [
  'const adminPath = path.startsWith("/admin")',
  'supabaseClient.rpc("is_admin")',
  'async function restoreWarmAdminSnapshot()',
  'sessionStorage.setItem("qssed-admin-access-v1"',
  'await hydrateAdminModule(data.user)',
  'clearAdminUiCaches()'
]) {
  if (!shell.includes(marker)) throw new Error("Shell authorization/bootstrap marker lost: " + marker);
}

const auditPos = shell.indexOf("${auditClientScript(ipInfo)}");
const profilePos = shell.indexOf("${profileClientScript()}");
const adminPos = shell.indexOf("${adminClientScript(ipInfo)}");
const bootstrapPos = shell.indexOf("<script>\n    const loginUrl", adminPos);
if (!(auditPos >= 0 && auditPos < profilePos && profilePos < adminPos && adminPos < bootstrapPos)) {
  throw new Error("Browser script order changed");
}

const adminSource = `${renderBlock}\n\n${systemFunction}\n\n${clientBlock}\n`;
fs.writeFileSync(adminPath, adminSource);
fs.writeFileSync(shellPath, shell);
fs.writeFileSync(corePath, core);

console.log("Extracted Admin detail rendering and Admin client runtime into studio/ui-admin.js.");
