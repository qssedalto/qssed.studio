import assert from "node:assert/strict";
import { WORK_TEX_EXPLORER_TREE } from "../studio/ui-work-tex-explorer-tree.js";
import { enhanceWorkTexCodeMirror } from "../studio/ui-work-tex-codemirror.js";
import { readFileSync } from "node:fs";
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
  assert(html.includes("rename.querySelector('svg')?.cloneNode(true)"),
    "Project Rename must clone the exact File Rename SVG outer frame and I-beam");
  assert(html.includes("const letter=svg.querySelector('.tex-fluent-accent-line')"),
    "Project Rename may change only the A letter path");
  assert(html.includes("letter.setAttribute('d','M8.85 9.6H5.2L8.05 12 5.2 14.4H8.85')"),
    "Sigma must fit exactly inside the original A glyph bounds");
  assert(html.includes("letter.classList.add('tex-project-rename-sigma')") &&
    html.includes("svg.classList.add('tex-project-rename-icon')"),
    "Sigma retains its accented marker without altering neutral geometry");
  assert(!html.includes('class="tex-project-rename-frame"') &&
    !html.includes('class="tex-project-rename-ibeam"'),
    "Do not draw a second, wider frame around the Sigma");
  assert(!html.includes('<text class="tex-action-symbol" x="7.25"'),
    "Sigma must remain an SVG vector path, not a font glyph");
  assert(!WORK_TEX_EXPLORER_STYLE.includes("svg.tex-project-rename-icon{"),
    "Sigma must inherit the exact same 28px dimensions as the A icon");
  assert(!WORK_TEX_EXPLORER_STYLE.includes("tex-project-rename-sigma{"),
    "Sigma must inherit the same Fluent accent stroke, not a heavier special stroke");
  assert(html.includes("const renameProject=make('rename-project',t.renameProject,sigmaSvg)"),
    "Project Rename must still invoke the existing action and preserve permissions");

  assert(html.includes("fileOperation('rename',asset.name,name)"), "Supplementary file rename must call the authorized file API");
  assert(html.includes("projectQuestion"), "Project deletion must warn about all related data");
  assert(html.includes("sourceMode") || html.includes("data-mode="), "Inline code/preview tabs must exist");
  assert(WORK_TEX_EXPLORER_STYLE.includes("#tex-document-list>.tex-document-item"),
    "Project list must be compact, not oversized cards");
  assert(WORK_TEX_EXPLORER_STYLE.includes(".tex-tree-folder-children"),
    "Nested directories must have separate collapsible content");

  assert(WORK_TEX_EXPLORER_TREE.includes("function isFilenameClipped(row)") &&
    WORK_TEX_EXPLORER_TREE.includes("range.selectNodeContents(label)") &&
    WORK_TEX_EXPLORER_TREE.includes("!isFilenameClipped(row)"),
    "Tooltip must detect ellipsis even when flexbox reports inaccurate scrollWidth");
  assert(WORK_TEX_EXPLORER_TREE.includes("row.title=name") &&
    WORK_TEX_EXPLORER_TREE.includes("row.addEventListener('mouseenter'") &&
    WORK_TEX_EXPLORER_TREE.includes("row.addEventListener('mouseleave'"),
    "Every project file must have a native tooltip fallback and robust row hover");
  assert(WORK_TEX_EXPLORER_TREE.includes("attachFilenameTooltip(row,asset.name)") &&
    WORK_TEX_EXPLORER_TREE.includes("attachFilenameTooltip(row,prefix)"),
    "All nested file and folder rows must register their full original names");
  assert(WORK_TEX_EXPLORER_TREE.includes("filenameTooltip.textContent=name") &&
    WORK_TEX_EXPLORER_TREE.includes("setAttribute('role','tooltip')") &&
    WORK_TEX_EXPLORER_TREE.includes("row.setAttribute('aria-describedby',filenameTooltip.id)"),
    "Full filenames must be shown safely and accessibly");
  assert(WORK_TEX_EXPLORER_TREE.includes("list.addEventListener('pointerover'") &&
    WORK_TEX_EXPLORER_TREE.includes("list.addEventListener('focusin'") &&
    WORK_TEX_EXPLORER_TREE.includes("list.addEventListener('scroll',hideFilenameTooltip"),
    "Dynamic tree rows must support pointer, keyboard, and scrolling");
  assert(WORK_TEX_EXPLORER_STYLE.includes(".tex-tree-name-tooltip") &&
    WORK_TEX_EXPLORER_STYLE.includes("position:fixed;") &&
    WORK_TEX_EXPLORER_STYLE.includes("pointer-events:none;"),
    "Full-name tooltip should appear above the clipped sidebar without intercepting clicks");

  // Supplementary text/PDF/image files must occupy the SAME editor viewport.
  // A second inline card above an unhidden CodeMirror was showing both files at once.
  assert(WORK_TEX_EXPLORER_STYLE.includes("#tex-editor.is-asset-mode > .tex-codemirror-host"),
    "Selecting any non-main file must hide the actual CodeMirror host, not only a direct .cm-editor");
  assert(/#tex-editor\.is-asset-mode\s*>\s*\.tex-codemirror-host[\s\S]*?display:none!important/.test(WORK_TEX_EXPLORER_STYLE),
    "The main editor must be invisible while a supplementary asset occupies the editor");
  assert(WORK_TEX_EXPLORER_STYLE.includes("#tex-editor.is-asset-mode > .tex-inline-file-viewer") &&
    WORK_TEX_EXPLORER_STYLE.includes("grid-row:3;grid-column:1") &&
    WORK_TEX_EXPLORER_STYLE.includes("width:100%;height:100%"),
    "The selected file must fill the existing editor row without a floating second card");
  assert(WORK_TEX_EXPLORER_STYLE.includes("margin:0;border:0;border-radius:0"),
    "The selected file must not look like a separate popup window");
  assert(WORK_TEX_EXPLORER_STYLE.includes("#tex-editor.is-asset-mode.is-codemirror-asset > .tex-codemirror-host") &&
    WORK_TEX_EXPLORER_STYLE.includes("display:block!important;grid-row:3;grid-column:1"),
    "Supplementary UTF-8 files must reuse the existing CodeMirror viewport");
  assert(WORK_TEX_EXPLORER_TREE.includes("bridge?.openAssetEditor?.(asset)") &&
    WORK_TEX_EXPLORER_TREE.includes("bridge?.closeAssetEditor?.()") &&
    WORK_TEX_EXPLORER_TREE.includes("viewer.hidden=enhanced"),
    "Project files must switch the same CodeMirror view without overlaying a second textarea");
  assert(WORK_TEX_EXPLORER_TREE.includes("aertex:tex-code-asset-updated") &&
    WORK_TEX_EXPLORER_TREE.includes("const documentId=activeId(),name=selected.name,content=activeTextValue()"),
    "Supplementary file edits must persist through their own file API");
  assert(WORK_TEX_EXPLORER_TREE.includes("viewer.hidden=true;editor.classList.remove('is-asset-mode','is-codemirror-asset')") &&
    WORK_TEX_EXPLORER_TREE.includes("editor.classList.add('is-asset-mode');viewer.hidden=false") &&
    WORK_TEX_EXPLORER_TREE.includes("editor.classList.toggle('is-codemirror-asset',enhanced)"),
    "Switching between main.tex and supplementary assets must restore exactly one visible editor");

  assert(WORK_TEX_EXPLORER_STYLE.includes("box-shadow:none!important;filter:none!important"),
    "Dark PDF borders must not emit a white shadow");
  assert(!html.includes("__ZH__"), "Locale placeholders must be resolved");
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 3, "Explorer now includes the fixed editor mode and archive runtime");
  for (const [, code] of scripts) new Function(code);
}
const cmRuntime=enhanceWorkTexCodeMirror("<main class=\"tex-work-app\"></main>",true);
assert(cmRuntime.includes("function openAssetEditor(asset)") &&
  cmRuntime.includes("function closeAssetEditor()") &&
  cmRuntime.includes("if (!view || syncingToSource || currentAsset) return;") &&
  cmRuntime.includes("view.setState(EditorStateClass.create("),
  "Project file editor must preserve main.tex and reuse one CodeMirror instance");
assert(cmRuntime.includes("if (currentAsset) {") &&
  cmRuntime.includes("aertex:tex-code-asset-updated"),
  "Supplementary edits must not dispatch main.tex input events");
assert(readFileSync(new URL("../tex-vendor/src/codemirror.js",import.meta.url),"utf8")
  .includes('export { EditorState } from "@codemirror/state";'),
  "The vendor bundle must export EditorState to isolate per-file undo history");
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
assert(WORK_TEX_EXPLORER_COMMANDS.includes("central.length>500"),
  "Project ZIP download must accept up to 500 files.");
assert(WORK_TEX_EXPLORER_TREE.includes("tree_refresh=") &&
  WORK_TEX_EXPLORER_TREE.includes("Always verify the latest R2 tree on expansion.") &&
  WORK_TEX_EXPLORER_TREE.includes("showAsset(selectedAsset,fresh)"),
  "Exploring or switching projects must revalidate their files instead of displaying indefinite stale snapshots.");
console.log("Work TeX Explorer, project actions, inline Markdown reading and ZIP structure validated.");
