import assert from "node:assert/strict";
import { WORK_TEX_EXPLORER_TREE } from "../studio/ui-work-tex-explorer-tree.js";
import { WORK_TEX_EXPLORER_COMMANDS } from "../studio/ui-work-tex-explorer-commands.js";
import { enhanceWorkTexExplorer } from "../studio/ui-work-tex-explorer.js";
import { WORK_TEX_EXPLORER_STYLE } from "../studio/ui-work-tex-explorer-style.js";

for (const zh of [true, false]) {
  const html = enhanceWorkTexExplorer("<main class='tex-work-app'></main>", zh);
  assert(html.includes('id="aertex-work-tex-explorer-tree"'), "Missing Explorer runtime");
  assert(html.includes('id="aertex-work-tex-explorer-commands"'), "Missing extended command runtime");
  assert(html.includes('data-tex-action') && html.includes("copy-all"), "Copy All must be installed");
  assert(html.includes("rename-project") && html.includes("delete-project") && html.includes("save-project-zip"),
    "File and project commands must remain distinct");
  assert(html.includes("fileOperation('rename',asset.name,name)"), "Supplementary file rename must call the authorized file API");
  assert(html.includes("projectQuestion"), "Project deletion must warn about all related data");
  assert(html.includes("sourceMode") || html.includes("data-mode="), "Inline code/preview tabs must exist");
  assert(WORK_TEX_EXPLORER_STYLE.includes("#tex-document-list>.tex-document-item"),
    "Project list must be compact, not oversized cards");
  assert(WORK_TEX_EXPLORER_STYLE.includes(".tex-tree-folder-children"),
    "Nested directories must have separate collapsible content");
  assert(WORK_TEX_EXPLORER_STYLE.includes("box-shadow:none!important;filter:none!important"),
    "Dark PDF borders must not emit a white shadow");
  assert(!html.includes("__ZH__"), "Locale placeholders must be resolved");
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 2);
  for (const [, code] of scripts) new Function(code);
}
const source = WORK_TEX_EXPLORER_COMMANDS;
const start = source.indexOf("function crc32(bytes)");
const end = source.indexOf("zipButton.addEventListener(", start);
assert(start >= 0 && end > start, "ZIP encoder must be installed");
const makeZip = new Function("TextEncoder", "Blob", "atob", "t",
  source.slice(start, end) + "\nreturn makeZip;")(
    TextEncoder, Blob, atob, { error: "ZIP failure" }
  );
const zip = makeZip([
  { name: "main.tex", encoding: "utf8", content: "\\documentclass{article}\n" },
  { name: "refs/a.bib", encoding: "utf8", content: "@article{a}" },
  { name: "figures/diagram.png", encoding: "base64",
    content: Buffer.from([137,80,78,71,13,10,26,10]).toString("base64") }
]);
const bytes = new Uint8Array(await zip.arrayBuffer());
const view = new DataView(bytes.buffer);
assert.equal(view.getUint32(0, true), 0x04034b50, "ZIP must start with a local file header");
const eocd = bytes.length - 22;
assert.equal(view.getUint32(eocd, true), 0x06054b50, "ZIP needs a valid end-of-central-directory record");
assert.equal(view.getUint16(eocd + 10, true), 3, "ZIP must contain main and nested supporting files");
assert.equal(view.getUint32(eocd + 16, true) > 0, true, "ZIP must link to its central directory");
assert(bytes.length > 150, "ZIP must retain encoded file contents");
console.log("Work TeX Explorer, project actions, inline Markdown reading and ZIP structure validated.");
