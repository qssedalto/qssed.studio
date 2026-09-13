import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const profilePath = 'studio/ui-profile.js';
let source = fs.readFileSync(profilePath, 'utf8');

// Use the actual pre-Phase-3 source on main as the source of truth. This matters
// because the block originally lived inside a template literal, so raw source and
// rendered browser JavaScript are not interchangeable when escape sequences exist.
const baselineCore = execFileSync('git', ['show', 'origin/main:studio/ui-core.js'], { encoding: 'utf8' });
const runtimeStartMarker = '      /* PROFILE_HOME_V3 */';
const runtimeEndMarker = '      async function hydrateProfileAudit(user) {';
const runtimeStart = baselineCore.indexOf(runtimeStartMarker);
const runtimeEnd = baselineCore.indexOf(runtimeEndMarker, runtimeStart + runtimeStartMarker.length);
if (runtimeStart < 0 || runtimeEnd < 0) throw new Error('Could not locate pre-extraction Profile runtime on main');
const rawRuntimeSource = baselineCore.slice(runtimeStart, runtimeEnd);

const encodedMarker = 'const PROFILE_CLIENT_BODY = ';
const encodedStart = source.indexOf(encodedMarker);
if (encodedStart < 0) throw new Error('Encoded PROFILE_CLIENT_BODY marker not found');
const functionMarker = '\n\nexport function profileClientScript() {';
const functionStart = source.indexOf(functionMarker, encodedStart);
if (functionStart < 0) throw new Error('profileClientScript marker not found');
const functionEndMarker = '\n}\n';
const functionEnd = source.indexOf(functionEndMarker, functionStart + functionMarker.length);
if (functionEnd < 0) throw new Error('profileClientScript end not found');
const afterFunction = functionEnd + functionEndMarker.length;

// Put the exact raw source back into the same kind of template-literal context it
// had before extraction. This keeps the file readable while preserving template
// escape semantics from the monolithic ui-core implementation.
const readable = `export function profileClientScript() {\n  return \`<script>\n${rawRuntimeSource}\n    </script>\`;\n}\n`;
source = source.slice(0, encodedStart) + readable + source.slice(afterFunction);

fs.writeFileSync(profilePath, source);
console.log('Rebuilt readable Profile runtime from the pre-extraction main source.');
