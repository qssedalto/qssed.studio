import fs from 'node:fs';

const stylesPath = 'studio/ui-styles.js';
let source = fs.readFileSync(stylesPath, 'utf8');
const startMarker = '    /* DASHBOARD_APPLE_V2 */';
const endMarker = '</style>`;';
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);
if (start < 0 || end < 0) throw new Error('Dashboard style block markers not found');
const block = source.slice(start, end);
if (block.includes('${') || block.includes('`')) throw new Error('Dashboard CSS block is not safe for direct template extraction');
fs.writeFileSync('studio/ui-style-dashboard.js', `export function dashboardStyles() {\n  return \`${block}\`;\n}\n`);
source = source.slice(0, start) + '${dashboardStyles()}' + source.slice(end);
source = 'import { dashboardStyles } from "./ui-style-dashboard.js";\n' + source;
fs.writeFileSync(stylesPath, source);
console.log(`Extracted ${block.split('\n').length} Dashboard style lines into studio/ui-style-dashboard.js.`);
