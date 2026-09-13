import fs from "node:fs";

const shellPath = "studio/ui-shell.js";
const profilePath = "studio/ui-profile.js";
const adminPath = "studio/ui-admin.js";
const settingsPath = "studio/ui-settings.js";

let shell = fs.readFileSync(shellPath, "utf8");
let profile = fs.readFileSync(profilePath, "utf8");
let admin = fs.readFileSync(adminPath, "utf8");
let settings = fs.readFileSync(settingsPath, "utf8");

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

function extractBetween(source, startMarker, endMarker, label) {
  const start = requireIndex(source, startMarker, label + " start");
  const end = requireIndex(source, endMarker, label + " end", start);
  return {
    block: source.slice(start, end).trimEnd(),
    source: source.slice(0, start) + source.slice(end + 2)
  };
}

// Move the three product-specific Hubs while keeping osHubGrid shell-owned.
let extracted = extractBetween(shell, "export function profileHubContent(zh) {", "\n\nexport function adminHubContent(zh) {", "Profile Hub");
let profileHub = extracted.block.replace("export function profileHubContent(zh) {", "export function profileHubContent(zh, osHubGrid) {");
shell = extracted.source;

extracted = extractBetween(shell, "export function adminHubContent(zh) {", "\n\nexport function settingsHubContent(zh) {", "Admin Hub");
let adminHub = extracted.block.replace("export function adminHubContent(zh) {", "export function adminHubContent(zh, osHubGrid) {");
shell = extracted.source;

extracted = extractBetween(shell, "export function settingsHubContent(zh) {", "\n\nexport function adminContent(path, zh) {", "Settings Hub");
let settingsHub = extracted.block.replace("export function settingsHubContent(zh) {", "export function settingsHubContent(zh, osHubGrid) {");
shell = extracted.source;

// Move the remaining Settings fallback grid into the Settings module.
const settingsStart = requireIndex(shell, "export function settingsContent(path, zh) {", "settingsContent");
const fallbackMarker = '  const prefix = zh ? "/zh-cn" : "/en";';
const fallbackStart = requireIndex(shell, fallbackMarker, "Settings fallback", settingsStart);
const trimmed = shell.trimEnd();
const settingsClose = trimmed.lastIndexOf("\n}");
if (settingsClose < fallbackStart) throw new Error("Could not locate settingsContent closing brace");
const fallbackBody = shell.slice(fallbackStart, settingsClose).trimEnd();
const settingsFallback = `export function settingsFallbackContent(zh) {\n${fallbackBody}\n}`;
shell = shell.slice(0, fallbackStart) + "  return settingsFallbackContent(zh);" + shell.slice(settingsClose);

// Rewire imports so shell remains the composition point but product rendering lives in owning modules.
shell = replaceOnce(
  shell,
  'import { profileClientScript, profileContent } from "./ui-profile.js";',
  'import { profileClientScript, profileContent, profileHubContent } from "./ui-profile.js";',
  "Profile Hub import"
);
shell = replaceOnce(
  shell,
  'import { adminClientScript, adminLogsContent, adminOverviewContent, adminRolesContent, adminSystemContent, adminUsersContent } from "./ui-admin.js";',
  'import { adminClientScript, adminHubContent, adminLogsContent, adminOverviewContent, adminRolesContent, adminSystemContent, adminUsersContent } from "./ui-admin.js";',
  "Admin Hub import"
);
shell = replaceOnce(
  shell,
  'import { appearanceSettingsContent, languageSettingsContent, securityAuditContent, settingsGeneralContent } from "./ui-settings.js";',
  'import { appearanceSettingsContent, languageSettingsContent, securityAuditContent, settingsFallbackContent, settingsGeneralContent, settingsHubContent } from "./ui-settings.js";',
  "Settings Hub import"
);

shell = replaceOnce(shell, 'if (path === "/profile") return profileHubContent(zh);', 'if (path === "/profile") return profileHubContent(zh, osHubGrid);', "Profile Hub dispatch");
shell = replaceOnce(shell, 'if (path === "/admin") return adminHubContent(zh);', 'if (path === "/admin") return adminHubContent(zh, osHubGrid);', "Admin Hub dispatch");
shell = replaceOnce(shell, 'if (path === "/settings") return settingsHubContent(zh);', 'if (path === "/settings") return settingsHubContent(zh, osHubGrid);', "Settings Hub dispatch");

// Append product-owned renderers without introducing shell imports in product modules.
profile = profile.trimEnd() + "\n\n" + profileHub + "\n";
admin = admin.trimEnd() + "\n\n" + adminHub + "\n";
settings = settings.trimEnd() + "\n\n" + settingsHub + "\n\n" + settingsFallback + "\n";

for (const marker of [
  "export function osPage",
  "export function buildOsCopy",
  "export function buildOsPages",
  "export function renderOsNav",
  "export function renderOsContent",
  "export function statusContent",
  "export function osHubIcon",
  "export function osHubCard",
  "export function osHubGrid",
  "async function restoreWarmAdminSnapshot()",
  'supabaseClient.rpc("is_admin")',
  "async function hydrateOsUser()"
]) {
  if (!shell.includes(marker)) throw new Error("Shell-owned marker lost: " + marker);
}
for (const marker of ["export function profileHubContent", "export function adminHubContent", "export function settingsHubContent"]) {
  if (shell.includes(marker)) throw new Error("Product Hub remained in shell: " + marker);
}
if (!shell.includes("return settingsFallbackContent(zh);")) throw new Error("Settings fallback is not delegated");
for (const productSource of [profile, admin, settings]) {
  if (productSource.includes('from "./ui-shell.js"')) throw new Error("Product module imports ui-shell.js");
}

fs.writeFileSync(shellPath, shell);
fs.writeFileSync(profilePath, profile);
fs.writeFileSync(adminPath, admin);
fs.writeFileSync(settingsPath, settings);
console.log("Moved remaining product Hub/fallback rendering out of ui-shell.js.");
