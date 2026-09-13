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
  return {
    before: text.slice(0, start),
    section: text.slice(start, end),
    after: text.slice(end)
  };
}

const shellPath = 'studio/ui-shell.js';
const settingsPath = 'studio/ui-settings.js';
const storagePath = 'studio/ui-storage.js';

let shell = fs.readFileSync(shellPath, 'utf8');
if (fs.existsSync(settingsPath) || fs.existsSync(storagePath)) {
  throw new Error('Phase 3B target module already exists');
}

// Settings General + Security markup are contiguous before Workspace.
const settingsPrimary = takeSection(
  shell,
  'export function settingsGeneralContent(zh) {',
  'export function workspaceContent(path, zh) {',
  'Settings General/Security section'
);
let settingsPrimarySource = settingsPrimary.section;
settingsPrimarySource = replaceOnce(
  settingsPrimarySource,
  'export function settingsGeneralContent(zh) {',
  'export function settingsGeneralContent(zh, osHubIcon) {',
  'Settings General shared icon dependency'
);
shell = settingsPrimary.before + settingsPrimary.after;

// Storage markup + client runtime form a dedicated, contiguous Settings child-domain.
const storageSection = takeSection(
  shell,
  'export function storageSettingsContent(zh) {',
  'export function settingsContent(path, zh) {',
  'Storage UI/runtime section'
);
const storageSource = storageSection.section;
shell = storageSection.before + storageSection.after;

// Appearance + Language are the final two top-level renderers in ui-shell.js.
const appearanceStartMarker = 'export function appearanceSettingsContent(zh) {';
const appearanceStart = shell.indexOf(appearanceStartMarker);
if (appearanceStart < 0) throw new Error('Appearance/Language section start not found');
const appearanceLanguageSource = shell.slice(appearanceStart);
if (!appearanceLanguageSource.includes('export function languageSettingsContent(zh) {')) {
  throw new Error('Language renderer is not inside final Settings section');
}
if (appearanceLanguageSource.match(/^export function /gm)?.length !== 2) {
  throw new Error('Unexpected exported functions after appearanceSettingsContent');
}
shell = shell.slice(0, appearanceStart).trimEnd() + '\n';

shell = replaceOnce(
  shell,
  'import { MAX_STORAGE_FILE_BYTES, TEXT } from "./config.js";',
  'import { TEXT } from "./config.js";',
  'Remove Storage size dependency from shell'
);

shell = replaceOnce(
  shell,
  'import { profileClientScript, profileContent } from "./ui-profile.js";\n',
  'import { profileClientScript, profileContent } from "./ui-profile.js";\nimport { appearanceSettingsContent, languageSettingsContent, securityAuditContent, settingsGeneralContent } from "./ui-settings.js";\nimport { storageClientScript, storageSettingsContent } from "./ui-storage.js";\n',
  'Settings/Storage module imports'
);

shell = replaceOnce(
  shell,
  'if (path.endsWith("/general")) return settingsGeneralContent(zh);',
  'if (path.endsWith("/general")) return settingsGeneralContent(zh, osHubIcon);',
  'Settings General shared icon injection'
);

const settingsModule = `${settingsPrimarySource.trimEnd()}\n\n${appearanceLanguageSource.trim()}\n`;
const storageModule = `import { MAX_STORAGE_FILE_BYTES } from "./config.js";\n\n${storageSource.trim()}\n`;

const forbiddenShellDefinitions = [
  'export function settingsGeneralContent',
  'export function securityAuditContent',
  'export function storageSettingsContent',
  'export function storageClientScript',
  'export function appearanceSettingsContent',
  'export function languageSettingsContent'
];
for (const marker of forbiddenShellDefinitions) {
  if (shell.includes(marker)) throw new Error(`Extracted definition remains in shell: ${marker}`);
}
if (!shell.includes('export function settingsHubContent(zh) {')) throw new Error('Settings Hub was accidentally moved');
if (!shell.includes('export function settingsContent(path, zh) {')) throw new Error('Settings route dispatch was accidentally moved');
if (!shell.includes('export function osHubIcon(name) {')) throw new Error('Shared Hub icon primitive was accidentally moved');

fs.writeFileSync(shellPath, shell);
fs.writeFileSync(settingsPath, settingsModule);
fs.writeFileSync(storagePath, storageModule);
console.log('Phase 3B Settings + Storage UI extraction applied with shared shell/audit boundaries preserved.');
