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
  assert(html.includes("tex-fluent-icon") && html.includes("tex-fluent-neutral") && html.includes("tex-fluent-accent"), "Toolbar must use official Fluent UI System Icon geometry.");
  assert(html.includes("svg.tex-fluent-icon{width:28px!important;height:28px!important"), "Fluent icon hit-area styling must remain crisp and legible.");
  assert(html.includes("tex-fluent-accent{fill:var(--primary)!important"), "Highlighted icon layers must use the user-selected theme.");
  assert(html.includes("tex-fluent-neutral{fill:currentColor!important"), "Neutral icon layers must adapt to light and dark themes.");
  assert(!html.includes("tex-pixel-traced-icon") && !html.includes("tex-smooth-icon"), "Deprecated hand-drawn and pixel-outline SVGs must not return.");
  assert(html.includes("Copyright (c) 2020 Microsoft Corporation"), "Attribution for Fluent UI System Icons must be retained.");
  assert(html.includes("M8.5 8.5H5.25") && html.includes("M5.75 3C4.23122"), "Copy and Save Edit must keep their original Microsoft vector geometry.");
  assert(html.includes("tex-icon-mirror") && html.includes("redo: undoSvg.replace("), "Redo must remain a mirror of Undo.");
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
