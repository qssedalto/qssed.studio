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
  const scripts = [...html.matchAll(/<script(?:\\s+[^>]*)?>([\\s\\S]*?)<\\/script>/g)];
  for (const [, code] of scripts) new Function(code);
}

assert(stable.includes("if (add) add.disabled = locked ||"), "Access guard must retain empty-input disable");
console.log("Work TeX collaboration invitation checks passed.");
