import fs from 'node:fs';

const stylesPath = 'studio/ui-styles.js';
let source = fs.readFileSync(stylesPath, 'utf8');
const startMarker = '    /* ADMIN_UI_POLISH_V1 */';
const endMarker = '    /* OS_APPLE_HUBS_V1 */';
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);
if (start < 0 || end < 0) throw new Error('Admin style block markers not found');
const block = source.slice(start, end);
if (block.includes('${') || block.includes('`')) throw new Error('Admin CSS block is not safe for direct template extraction');
fs.writeFileSync('studio/ui-style-admin.js', `export function adminStyles() {\n  return \`${block}\`;\n}\n`);
source = source.slice(0, start) + '${adminStyles()}' + source.slice(end);
source = 'import { adminStyles } from "./ui-style-admin.js";\n' + source;
fs.writeFileSync(stylesPath, source);
console.log(`Extracted ${block.split('\n').length} Admin style lines into studio/ui-style-admin.js.`);
