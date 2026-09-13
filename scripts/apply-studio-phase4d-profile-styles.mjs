import fs from 'node:fs';

const stylesPath = 'studio/ui-styles.js';
let source = fs.readFileSync(stylesPath, 'utf8');
const startMarker = '    /* PROFILE_HOME_V3 */';
const endMarker = '    /* SETTINGS_GENERAL_ROUTE_V1 */';
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);
if (start < 0 || end < 0) throw new Error('Profile style block markers not found');
const block = source.slice(start, end);
if (block.includes('${') || block.includes('`')) throw new Error('Profile CSS block is not safe for direct template extraction');
fs.writeFileSync('studio/ui-style-profile.js', `export function profileStyles() {\n  return \`${block}\`;\n}\n`);
source = source.slice(0, start) + '${profileStyles()}' + source.slice(end);
source = 'import { profileStyles } from "./ui-style-profile.js";\n' + source;
fs.writeFileSync(stylesPath, source);
console.log(`Extracted ${block.split('\n').length} Profile style lines into studio/ui-style-profile.js.`);
