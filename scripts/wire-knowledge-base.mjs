import fs from "node:fs";

function replaceOnce(text, from, to, label) {
  const first = text.indexOf(from);
  if (first < 0) throw new Error(`Missing ${label}`);
  if (text.indexOf(from, first + from.length) >= 0) throw new Error(`Ambiguous ${label}`);
  return text.slice(0, first) + to + text.slice(first + from.length);
}

const shellPath = "studio/ui-shell.js";
let shell = fs.readFileSync(shellPath, "utf8");
shell = replaceOnce(
  shell,
  'import { informationContent } from "./ui-information.js";\n',
  'import { informationContent } from "./ui-information.js";\nimport { knowledgePageMeta } from "./ui-knowledge.js";\n',
  "ui-shell knowledge import"
);
shell = replaceOnce(
  shell,
  '  const page = copy.pages[path] || copy.pages["/dashboard"];',
  '  const page = copy.pages[path] || knowledgePageMeta(path, zh) || copy.pages["/dashboard"];',
  "ui-shell page metadata fallback"
);
fs.writeFileSync(shellPath, shell);

const stylesPath = "studio/ui-styles.js";
let styles = fs.readFileSync(stylesPath, "utf8");
styles = replaceOnce(
  styles,
  'import { profileStyles } from "./ui-style-profile.js";\n',
  'import { profileStyles } from "./ui-style-profile.js";\nimport { knowledgeStyles } from "./ui-style-knowledge.js";\n',
  "ui-styles knowledge import"
);
styles = replaceOnce(
  styles,
  '${dashboardStyles()}</style>`;',
  '${dashboardStyles()}${knowledgeStyles()}</style>`;',
  "ui-styles knowledge interpolation"
);
fs.writeFileSync(stylesPath, styles);

const readmePath = "studio/README.md";
let readme = fs.readFileSync(readmePath, "utf8");
readme = replaceOnce(
  readme,
  '- `ui-information.js` — Information route composition and route-owned Links/Notes/Summaries/Search rendering.\n',
  '- `ui-information.js` — Information route composition and route-owned Links/Notes/Summaries/Search rendering; delegates the Knowledge Base route tree to `ui-knowledge.js`.\n- `ui-knowledge.js` — Knowledge Base root/category/article composition for 54 bilingual routes.\n- `knowledge-routes.js` — six-category, 47-topic Knowledge Base route schema shared by routing and rendering.\n- `knowledge-projects.js`, `knowledge-technology.js`, `knowledge-study.js`, `knowledge-methodology.js`, `knowledge-references.js`, `knowledge-archive.js` — detailed bilingual long-term knowledge content by category.\n- `ui-style-knowledge.js` — responsive and accessible Knowledge Base UI styles.\n',
  "Studio README knowledge modules"
);
fs.writeFileSync(readmePath, readme);
