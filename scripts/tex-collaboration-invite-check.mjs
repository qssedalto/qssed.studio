import fs from "node:fs";
import { enhanceWorkTexCollaboration } from "../studio/ui-work-tex-collaboration-instant.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const base = fs.readFileSync(new URL("../studio/ui-work-tex-collaboration.js", import.meta.url), "utf8");
const stable = fs.readFileSync(new URL("../studio/ui-work-tex-shared-stable.js", import.meta.url), "utf8");

for (const zh of [true, false]) {
  const html = enhanceWorkTexCollaboration("<div class=\"tex-work-app\" data-tex-root><div class=\"tex-editor-toolbar\"></div></div>", zh);
  assert(html.includes('name="collaboration-member-lookup" type="search"'), "Invite must use a non-login search field");
  assert(html.includes('data-1p-ignore="true"') && html.includes('data-lpignore="true"'), "Invite should discourage password-manager autofill");
  assert(html.includes('id="tex-collaboration-invite" class="tex-collaboration-invite" autocomplete="off"'), "Invite form should disable autocomplete");
  assert(html.includes('id="tex-collaboration-add" type="submit" disabled'), "Add must be initially disabled");
  assert(html.includes("add.disabled = loading || saving || !activeDocumentId() || snapshot?.can_manage !== true || !handle;"), "Add must validate permissions and nonempty handle");
  assert(html.includes("username.addEventListener('input', updateSaveState)"), "Add state must update when typing");
  assert(html.includes("snapshot?.can_manage !== true) return;"), "Submit must enforce owner permission");
  assert(!html.includes("tex-collaboration-username"), "Old login-like field ID must not remain");
  assert(html.includes("height:46px!important") && html.includes(".tex-collaboration-invite>.tex-role-segment"), "Invite controls must align at 46px");
  assert(html.includes("#tex-collaboration-add:disabled"), "Disabled cursor styling must be present");
  assert(html.includes(zh ? "搜索成员" : "Search members"), "Search placeholder must match locale");
  // Windows Explorer-inspired source commands must remain large, themed and functional.
  assert(html.includes('id="qsseda-work-tex-editor-tools"'), "TeX editor commandbar styles must be installed");
  assert(html.includes("width:26px!important") && html.includes("width:39px!important"), "Editor command icons must remain large and easy to target");
  assert(html.includes(".tex-editor-command svg .tex-icon-accent{stroke:var(--primary)!important}"), "Icon highlights must follow the user-selected theme color");
  assert(html.includes("bar.append(cutButton, copyButton, pasteButton, renameButton, deleteButton"), "Windows-style edit and delete actions must be grouped first");
  assert(html.includes("redo: undoSvg.replace("), "Redo must be an exact mirror of Undo");
  assert(html.includes("tex-smooth-icon") && html.includes("tex-source-gray") && html.includes("tex-source-accent"), "Toolbar must use smooth two-tone outline SVGs.");
  assert(html.includes("svg.tex-smooth-icon{width:30px!important;height:30px!important"), "Outlined SVGs must remain large.");
  assert(html.includes("stroke-width:1.65!important") && html.includes("stroke-linecap:round!important") && html.includes("stroke-linejoin:round!important"), "Outline strokes must remain consistent, slender and rounded.");
  assert(html.includes("tex-source-accent{fill:none!important;stroke:var(--primary)!important}"), "Windows accent strokes must follow the selected theme.");
  assert(html.includes("tex-source-gray{fill:none!important;stroke:currentColor!important}"), "Neutral strokes must adapt to light and dark mode.");
  assert(!html.includes("tex-pixel-traced-icon") && !html.includes("fill-rule=\"evenodd\""), "Raster stair-step contours must not return.");
  assert(html.includes("M6.6 3.5 18.7 20.9") && html.includes("M18.1 13.2h9.3"), "Cut and Paste smooth contours must match the supplied Explorer references.");
  assert(html.includes("M4.6 4.5v10.4h10.2") && html.includes("m19 25.1 7.4-7.4"), "Undo and Save As must use refined smooth line-work.");
  assert(html.includes("button.dataset.texAction = action"), "Toolbar actions must be explicitly mapped to each button.");
  assert(html.includes("button.addEventListener('click', event => event.stopPropagation())"), "Toolbar clicks must be isolated from parent handlers.");
  assert(html.includes("saveAsForm.addEventListener('submit'") && html.includes("saveAsError.hidden = false"), "Save As must expose its own submit flow and visible errors.");
  assert(html.includes("icons.saveAs") && html.includes("icons.save"), "Both custom floppy SVG commands must be available");
  assert(html.includes("tex-delete-dialog-header") && html.includes("tex-delete-dialog-confirm") && html.includes("tex-delete-file-name"), "Delete dialog must have title, filename and confirm action");
  assert(html.includes("window.__qssedaTexConfirmDelete = filename =>"), "Delete confirmation must use the custom dialog");
  assert(html.includes("deleteButton.disabled = noDocument || readOnly"), "Delete must follow document and collaborator permissions");
  assert(html.includes("footerDelete.click()"), "Toolbar Delete must reuse the existing document delete action");
  assert(html.includes("cutButton.disabled = noDocument || readOnly || start === end"), "Cut must require selected editable source text");
  assert(html.includes("bridge?.getSelection?.()"), "Cut must read CodeMirror selections as well as textarea selections");
  assert(html.includes("if (!await writeClipboard(selectionText))"), "Failed clipboard writes must never delete text");
  assert(html.includes("title.focus();") && html.includes("title.select();"), "Rename action must focus and select the document title");
  assert(html.includes("work-tex-"), "Other Work UI remains composed");
  const scripts = [...html.matchAll(/<script(?:\\s+[^>]*)?>([\\s\\S]*?)<\\/script>/g)];
  for (const [, code] of scripts) new Function(code);
}

assert(stable.includes("if (add) add.disabled = locked ||"), "Access guard must retain empty-input disable");
console.log("Work TeX collaboration invitation checks passed.");
