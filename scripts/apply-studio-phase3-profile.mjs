import fs from 'node:fs';

function replaceOnce(text, needle, replacement, label) {
  const count = text.split(needle).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one match, found ${count}`);
  return text.replace(needle, replacement);
}

function takeSection(text, startMarker, endMarker, label) {
  const start = text.indexOf(startMarker);
  if (start < 0) throw new Error(`${label}: start marker not found`);
  const end = text.indexOf(endMarker, start + startMarker.length);
  if (end < 0) throw new Error(`${label}: end marker not found`);
  return { before: text.slice(0, start), section: text.slice(start, end), after: text.slice(end) };
}

const shellPath = 'studio/ui-shell.js';
const corePath = 'studio/ui-core.js';
const profilePath = 'studio/ui-profile.js';

let shell = fs.readFileSync(shellPath, 'utf8');
let core = fs.readFileSync(corePath, 'utf8');
if (fs.existsSync(profilePath)) throw new Error(`${profilePath} already exists`);

const profileRender = takeSection(
  shell,
  'export function profileContent(path, zh) {',
  'export function securityAuditContent(zh) {',
  'Profile render section'
);

let profileRenderSection = profileRender.section;
profileRenderSection = replaceOnce(
  profileRenderSection,
  '  if (path === "/profile") return profileHubContent(zh);\n',
  '',
  'Profile hub delegation removal'
);

if (!profileRenderSection.includes('export function accountAuditContent(zh) {')) {
  throw new Error('Profile render section does not include accountAuditContent');
}

shell = profileRender.before + profileRender.after;

const profileRuntime = takeSection(
  core,
  '      /* PROFILE_HOME_V3 */',
  '      async function hydrateProfileAudit(user) {',
  'Profile client runtime'
);

if (!profileRuntime.section.includes('async function hydrateProfileHome(user) {')) {
  throw new Error('Profile runtime does not include hydrateProfileHome');
}
if (!profileRuntime.section.includes('PROFILE_HOME_CACHE_PREFIX')) {
  throw new Error('Profile runtime does not include Profile cache state');
}

core = profileRuntime.before + profileRuntime.after;

shell = replaceOnce(
  shell,
  'import { escapeHtmlText } from "./html-utils.js";\n',
  'import { escapeHtmlText } from "./html-utils.js";\nimport { profileClientScript, profileContent } from "./ui-profile.js";\n',
  'Profile module import'
);

shell = replaceOnce(
  shell,
  '  if (path.startsWith("/profile")) return profileContent(path, zh);',
  '  if (path === "/profile") return profileHubContent(zh);\n  if (path.startsWith("/profile/")) return profileContent(path, zh);',
  'Profile route delegation'
);

shell = replaceOnce(
  shell,
  '  ${auditClientScript(ipInfo)}\n  ${adminClientScript(ipInfo)}',
  '  ${auditClientScript(ipInfo)}\n  ${profileClientScript()}\n  ${adminClientScript(ipInfo)}',
  'Profile runtime script order'
);

const profileModule = `${profileRenderSection.trimEnd()}\n\nconst PROFILE_CLIENT_BODY = ${JSON.stringify(profileRuntime.section)};\n\nexport function profileClientScript() {\n  return "<script>\\n" + PROFILE_CLIENT_BODY + "\\n    </script>";\n}\n`;

if (/profileHome(State|Cache|IsZh|Status|Escape)|hydrateProfileHome|PROFILE_HOME_CACHE_PREFIX/.test(core)) {
  throw new Error('Profile-home runtime residue remains in ui-core.js');
}
if (/export function (profileContent|accountAuditContent)/.test(shell)) {
  throw new Error('Profile render residue remains in ui-shell.js');
}
if (!shell.includes('if (path === "/profile") return profileHubContent(zh);')) {
  throw new Error('Profile hub no longer remains in the shell');
}

fs.writeFileSync(shellPath, shell);
fs.writeFileSync(corePath, core);
fs.writeFileSync(profilePath, profileModule);
console.log('Phase 3A Profile extraction applied without shared Hub/audit refactors.');
