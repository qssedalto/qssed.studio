import fs from 'node:fs';

function read(path) { return fs.readFileSync(path, 'utf8'); }
function write(path, value) { fs.writeFileSync(path, value); }
function replaceOnce(source, needle, replacement, label) {
  const count = source.split(needle).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one match, found ${count}`);
  return source.replace(needle, replacement);
}

const shellPath = 'studio/ui-shell.js';
let shell = read(shellPath);
const start = shell.indexOf('export function statusContent');
const end = shell.indexOf('export function adminContent', start);
if (start < 0 || end < 0) throw new Error('Shared primitive block not found in ui-shell.js');
const block = shell.slice(start, end).trimEnd() + '\n';
write('studio/ui-primitives.js', block);
shell = shell.slice(0, start) + shell.slice(end);

const routingImport = 'import { html, json } from "./routing.js";\n';
shell = replaceOnce(shell, routingImport, routingImport + 'import { statusContent } from "./ui-primitives.js";\n', 'shell primitive import');
shell = replaceOnce(shell, 'informationContent(path, zh, statusContent)', 'informationContent(path, zh)', 'information dispatch');
shell = replaceOnce(shell, 'profileHubContent(zh, osHubGrid)', 'profileHubContent(zh)', 'profile hub dispatch');
shell = replaceOnce(shell, 'workspaceContent(path, zh, statusContent)', 'workspaceContent(path, zh)', 'workspace dispatch');
shell = replaceOnce(shell, 'adminHubContent(zh, osHubGrid)', 'adminHubContent(zh)', 'admin hub dispatch');
shell = replaceOnce(shell, 'settingsHubContent(zh, osHubGrid)', 'settingsHubContent(zh)', 'settings hub dispatch');
shell = replaceOnce(shell, 'settingsGeneralContent(zh, osHubIcon)', 'settingsGeneralContent(zh)', 'settings general dispatch');
write(shellPath, shell);

let profile = read('studio/ui-profile.js');
profile = 'import { osHubGrid } from "./ui-primitives.js";\n\n' + profile;
profile = replaceOnce(profile, 'export function profileHubContent(zh, osHubGrid)', 'export function profileHubContent(zh)', 'profile hub signature');
write('studio/ui-profile.js', profile);

let admin = read('studio/ui-admin.js');
admin = 'import { osHubGrid } from "./ui-primitives.js";\n\n' + admin;
admin = replaceOnce(admin, 'export function adminHubContent(zh, osHubGrid)', 'export function adminHubContent(zh)', 'admin hub signature');
write('studio/ui-admin.js', admin);

let settings = read('studio/ui-settings.js');
settings = 'import { osHubGrid, osHubIcon } from "./ui-primitives.js";\n\n' + settings;
settings = replaceOnce(settings, 'export function settingsGeneralContent(zh, osHubIcon)', 'export function settingsGeneralContent(zh)', 'settings general signature');
settings = replaceOnce(settings, 'export function settingsHubContent(zh, osHubGrid)', 'export function settingsHubContent(zh)', 'settings hub signature');
write('studio/ui-settings.js', settings);

let information = read('studio/ui-information.js');
information = 'import { statusContent } from "./ui-primitives.js";\n\n' + information;
information = replaceOnce(information, 'export function summariesContent(zh, statusContent)', 'export function summariesContent(zh)', 'summaries signature');
information = replaceOnce(information, 'export function informationContent(path, zh, statusContent)', 'export function informationContent(path, zh)', 'information signature');
information = replaceOnce(information, 'summariesContent(zh, statusContent)', 'summariesContent(zh)', 'summaries dispatch');
write('studio/ui-information.js', information);

let workspace = read('studio/ui-workspace.js');
workspace = 'import { statusContent } from "./ui-primitives.js";\n\n' + workspace;
workspace = replaceOnce(workspace, 'export function workspaceContent(path, zh, statusContent)', 'export function workspaceContent(path, zh)', 'workspace signature');
write('studio/ui-workspace.js', workspace);

console.log('Extracted shell-owned status/Hub render primitives into studio/ui-primitives.js and rewired product consumers.');
