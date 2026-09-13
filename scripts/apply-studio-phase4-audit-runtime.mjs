import fs from "node:fs";

const corePath = "studio/ui-core.js";
const auditPath = "studio/ui-audit.js";
const authPagesPath = "studio/auth-pages.js";
const shellPath = "studio/ui-shell.js";

let core = fs.readFileSync(corePath, "utf8");
let authPages = fs.readFileSync(authPagesPath, "utf8");
let shell = fs.readFileSync(shellPath, "utf8");

if (fs.existsSync(auditPath)) throw new Error("studio/ui-audit.js already exists");

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

const startMarker = "export function auditClientScript(ipInfo) {";
const endMarker = "\n\nexport function themeToggle";
const start = requireIndex(core, startMarker, "auditClientScript start");
const end = requireIndex(core, endMarker, "auditClientScript end", start);
const auditBlock = core.slice(start, end).trimEnd();

for (const marker of [
  "function getAuditDeviceId()",
  "async function updateCurrentDevice(user)",
  "function clearProfileUiCaches()",
  "async function hydrateProfileSummary(user)",
  "async function hydrateProfileAudit(user)",
  'const PROFILE_SUMMARY_CACHE_KEY = "qssed-profile-summary-v2"',
  'const PROFILE_AUDIT_CACHE_KEY = "qssed-profile-audit-v2"'
]) {
  if (!auditBlock.includes(marker)) throw new Error("Audit runtime contract missing before move: " + marker);
}

core = core.slice(0, start) + core.slice(end + 2);
if (core.includes("export function auditClientScript")) throw new Error("auditClientScript remained in ui-core.js");

const oldAuthImport = 'import { auditClientScript, baseHead, supabaseScript, themeScript, topControls } from "./ui-core.js";';
const newAuthImport = 'import { auditClientScript } from "./ui-audit.js";\nimport { baseHead, supabaseScript, themeScript, topControls } from "./ui-core.js";';
authPages = replaceOnce(authPages, oldAuthImport, newAuthImport, "auth-pages audit import");

const oldShellImport = 'import { auditClientScript, baseHead, supabaseScript, themeScript, topControls } from "./ui-core.js";';
const newShellImport = 'import { auditClientScript } from "./ui-audit.js";\nimport { baseHead, supabaseScript, themeScript, topControls } from "./ui-core.js";';
shell = replaceOnce(shell, oldShellImport, newShellImport, "ui-shell audit import");

for (const marker of [
  "${supabaseScript()}",
  "${auditClientScript(ipInfo)}"
]) {
  const authSupabase = authPages.indexOf("${supabaseScript()}");
  const authAudit = authPages.indexOf("${auditClientScript(ipInfo)}", authSupabase);
  if (!(authSupabase >= 0 && authAudit > authSupabase)) throw new Error("Auth page Supabase/audit script order changed");
  const shellSupabase = shell.indexOf("${supabaseScript()}");
  const shellAudit = shell.indexOf("${auditClientScript(ipInfo)}", shellSupabase);
  if (!(shellSupabase >= 0 && shellAudit > shellSupabase)) throw new Error("Shell Supabase/audit script order changed");
  break;
}

for (const marker of ["getAuditDeviceId()", "clearProfileUiCaches", "updateCurrentDevice(authData.user)"]) {
  if (!authPages.includes(marker)) throw new Error("Login audit consumer marker lost: " + marker);
}
for (const marker of ["updateCurrentDevice(data.user)", "hydrateProfileSummary(data.user)", "hydrateProfileAudit(data.user)", "clearProfileUiCaches"]) {
  if (!shell.includes(marker)) throw new Error("Shell audit consumer marker lost: " + marker);
}

fs.writeFileSync(auditPath, auditBlock + "\n");
fs.writeFileSync(corePath, core);
fs.writeFileSync(authPagesPath, authPages);
fs.writeFileSync(shellPath, shell);

console.log("Moved auditClientScript exactly from ui-core.js to ui-audit.js.");
