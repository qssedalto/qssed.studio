import assert from "node:assert/strict";
import fs from "node:fs";
import { enhanceWorkTexCollaboration } from "../studio/ui-work-tex-collaboration-instant.js";
import { TexCollaborationRoom } from "../studio/tex-collaboration-room.js";

const load = name => fs.readFileSync(new URL("../studio/" + name, import.meta.url), "utf8");
const room = load("tex-collaboration-room.js");
const realtime = load("ui-work-tex-realtime.js");
const codeMirror = load("ui-work-tex-codemirror.js");
const live = load("ui-work-tex-live-controls.js");

assert.match(room, /client_id:\s*crypto\.randomUUID\(\)/, "Each socket needs an independent identity.");
assert.match(room, /client_id:\s*participant\.client_id/, "Broadcasts and sync must expose socket identity.");
assert.match(room, /safeRelativePosition\(payload\.anchor_rel\)/, "Server must validate remote anchor position.");
assert.match(room, /safeRelativePosition\(payload\.head_rel\)/, "Server must validate remote caret position.");
assert.match(room, /participant\.caret_position/, "Directional caret position must be preserved.");
assert.match(realtime, /person\?\.client_id === current\.clientId/, "Self must be identified by connection, not by cursor coordinates.");
assert.match(realtime, /createRelativePositionFromTypeIndex/, "Local selection must use Yjs relative positions.");
assert.match(realtime, /createAbsolutePositionFromRelativePosition/, "Remote selection must be decoded against current Yjs text.");
assert.match(realtime, /qsseda:tex-realtime-status/, "Connection state must reach collaboration controls.");
assert.match(realtime, /qsseda:tex-presence/, "Presence changes must reach CodeMirror and UI controls.");
assert.match(codeMirror, /scrollToRemote\(position\)/, "CodeMirror must support following without changing selection.");
assert.match(codeMirror, /EditorView\.scrollIntoView\(at/, "Following must use viewport effects.");
assert.doesNotMatch(codeMirror, /matches = items\.filter\(person => String\(person\?\.role/, "Position matching must never guess identity.");
assert.match(live, /stopOnManualScroll/, "Manual scrolling must stop following.");

for (const zh of [true,false]) {
  const markup = enhanceWorkTexCollaboration(
    '<div class="tex-work-app" data-tex-root><div class="tex-editor-toolbar"></div></div>', zh
  );
  assert.match(markup, /id="qsseda-tex-live-controls-runtime"/, "Live panel controller must mount.");
  assert.match(markup, /tex-live-follow-select/, "Follow selector must be styled.");
  assert.match(markup, /tex-live-switch/, "Remote cursor toggle must be styled.");
  assert.match(markup, /data-tex-show-remote-cursors="false"/, "Remote cursors can be disabled.");
  assert.match(markup, /id="qsseda-work-tex-codemirror-runtime"/, "CodeMirror must remain installed.");
  assert.match(markup, /id="qsseda-work-tex-realtime-runtime"/, "WebSocket Yjs sync must remain installed.");
  assert(!markup.includes("这一阶段先完成成员与权限基础"), "Outdated phase copy must be removed.");
  assert(!markup.includes("This phase establishes members and permissions first"), "English phase copy must be removed.");
  for (const scriptId of ["qsseda-work-tex-realtime-runtime", "qsseda-work-tex-codemirror-runtime", "qsseda-tex-live-controls-runtime"]) {
    const match = markup.match(new RegExp('<script id="' + scriptId + '">([\\s\\S]*?)<\\/script>'));
    assert(match, "Missing script " + scriptId);
    assert.doesNotThrow(() => new Function(match[1]), "Invalid browser script in " + scriptId);
  }
}

assert.equal(typeof TexCollaborationRoom, "function", "Durable Object export must remain available.");
console.log("TeX collaboration presence identity, Yjs positions, follow controls and rendered browser script syntax passed.");
