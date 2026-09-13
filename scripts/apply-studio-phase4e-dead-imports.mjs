import fs from 'node:fs';

const shellPath = 'studio/ui-shell.js';
let shell = fs.readFileSync(shellPath, 'utf8');
const oldImport = 'import { html, json } from "./routing.js";';
const newImport = 'import { html } from "./routing.js";';
const importCount = shell.split(oldImport).length - 1;
if (importCount !== 1) throw new Error(`Expected exactly one obsolete routing import, found ${importCount}`);
shell = shell.replace(oldImport, newImport);
fs.writeFileSync(shellPath, shell);

const docPath = 'docs/STUDIO_PHASE4_SHARED_INVENTORY.md';
let doc = fs.readFileSync(docPath, 'utf8');
const statusHeading = '## Implementation status';
if (!doc.includes(statusHeading)) {
  const intro = 'This document freezes the initial Phase 4 shared-layer cleanup plan after Phase 3 product ownership became stable. Phase 4 removes mixed shared responsibilities and unnecessary dependency edges; it is not permission for a rewrite, framework migration, visual redesign, or behavior change.\n';
  if (!doc.includes(intro)) throw new Error('Phase 4 document intro anchor not found');
  const status = `\n## Implementation status\n\n- **Phase 4A — complete:** the shared account/device/audit browser runtime lives in \`ui-audit.js\` with rendered output preserved.\n- **Phase 4B — complete:** neutral shared page infrastructure lives in \`ui-page.js\`; the former \`ui-core.js\` ownership name is gone.\n- **Phase 4C — complete:** shared status/Hub render primitives live in \`ui-primitives.js\`, removing Shell-owned function injection into product modules.\n- **Phase 4D — complete:** only clearly bounded product CSS was extracted verbatim: Profile → \`ui-style-profile.js\`, Admin polish → \`ui-style-admin.js\`, Dashboard → \`ui-style-dashboard.js\`. Remaining Settings/Storage/Audit/Shell/Hub CSS stays aggregated because responsive/accessibility blocks intentionally cross ownership boundaries. Global CSS custom properties remain owned by \`ui-page.js\`.\n- **Phase 4E — in progress:** dead compatibility imports/helpers, historical snapshots and naming/directory leftovers are audited one evidence-backed item at a time.\n`;
  doc = doc.replace(intro, intro + status);
}

const nextTask = `## Next concrete task\n\nContinue **Phase 4E** with evidence-backed cleanup only. The first confirmed dead item is the unused \`json\` import in \`ui-shell.js\`; after removing it, audit historical snapshots, obsolete compatibility helpers and naming/directory leftovers one item at a time. Every runtime-affecting slice must retain the Phase 4 byte-equivalence and deployment gates.\n`;
if (!/## Next concrete task[\s\S]*$/.test(doc)) throw new Error('Phase 4 next-task section not found');
doc = doc.replace(/## Next concrete task[\s\S]*$/, nextTask);
fs.writeFileSync(docPath, doc);

console.log('Removed unused routing json import and updated Phase 4 implementation status.');
