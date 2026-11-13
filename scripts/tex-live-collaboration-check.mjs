import assert from "node:assert/strict";
import fs from "node:fs";
import { enhanceWorkTexCollaboration } from "../studio/ui-work-tex-collaboration-instant.js";
import { TexCollaborationRoom } from "../studio/tex-collaboration-room.js";
import { texWorkbenchContent } from "../studio/ui-tex-workbench.js";
import { enhanceTexWorkbenchLocal } from "../studio/ui-tex-local.js";
import { polishTexWorkbenchApp } from "../studio/ui-tex-app.js";
import { html } from "../studio/routing.js";

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
assert.match(codeMirror, /timedModule\('\/assets\/tex\/codemirror\.js'/, "CodeMirror must load the self-hosted bundle with a bounded timeout.");
assert.match(codeMirror, /announceEditor\('failed'/, "Failed initialization must be reported to the UI.");
assert.match(codeMirror, /announceEditor\('ready'/, "Successful initialization must be reported.");
assert.match(codeMirror, /qsseda:tex-editor-retry/, "Loading the editor must support a retry.");
assert.match(codeMirror, /baseExtensions/, "Syntax plugin failures must not prevent basic editor startup.");
assert.match(realtime, /import\('\/assets\/tex\/yjs\.js'\)/, "Yjs must be loaded from the same Work origin.");
assert.doesNotMatch(codeMirror + realtime, /cdn\.jsdelivr\.net|esm\.sh/, "Live TeX collaboration must have no browser CDN dependencies.");
assert.match(live, /toggle.disabled=!Boolean\(activeDocument\(\)\)/, "Cursor preference must remain operable while CodeMirror loads.");
assert.match(live, /qsseda:tex-editor-state/, "UI must subscribe to CodeMirror loading state.");
assert.match(live, /editorState==='failed'/, "UI must show an editor failure state.");
assert.match(live, /tex-live-retry/, "UI must provide a retry control.");

const defaultPolicy = html("<p>ok</p>").headers.get("content-security-policy") || "";
const texPolicy = html("<p>ok</p>", 200, { allowLoopback: true })
  .headers.get("content-security-policy") || "";
assert(!defaultPolicy.includes("https://esm.sh"), "Third-party fallback CSP must be absent.");
assert(!texPolicy.includes("https://esm.sh"), "TeX Work must not require fallback CDN CSP.");
assert(texPolicy.includes("script-src 'self'"), "Same-origin bundles must be allowed by CSP.");

for (const zh of [true,false]) {
  const markup = enhanceWorkTexCollaboration(
    polishTexWorkbenchApp(enhanceTexWorkbenchLocal(texWorkbenchContent(zh),zh),zh), zh
  );
  assert.match(markup, /id="qsseda-tex-live-controls-runtime"/, "Live panel controller must mount.");
  assert.match(markup, /tex-live-follow-select/, "Follow selector must be styled.");
  assert.match(markup, /tex-live-switch/, "Remote cursor toggle must be styled.");
  assert.match(markup, /data-tex-show-remote-cursors="false"/, "Remote cursors can be disabled.");
  assert.match(markup, /id="qsseda-work-tex-codemirror-runtime"/, "CodeMirror must remain installed.");
  assert.match(markup, /id="qsseda-work-tex-realtime-runtime"/, "WebSocket Yjs sync must remain installed.");
  assert(!markup.includes("这一阶段先完成成员与权限基础"), "Outdated phase copy must be removed.");
  assert(!markup.includes("This phase establishes members and permissions first"), "English phase copy must be removed.");
  const collaboration = markup.split('<script id="qsseda-work-tex-collaboration-runtime">')[1]?.split('</script>')[0];
  assert(collaboration, "The active collaboration dialog runtime must exist");
  assert.doesNotThrow(() => new Function(collaboration), "Collaboration runtime must be valid JavaScript");
  const submitAt = collaboration.indexOf("form.addEventListener('submit', async event => {");
  const saveAt = collaboration.indexOf("async function saveDraft()");
  assert(submitAt > 0 && saveAt > submitAt, "Invite submit handler must be defined before staged permission saving");
  const invite = collaboration.slice(submitAt,saveAt);
  assert(invite.includes("await api('/api/tex/collaboration', {") &&
    invite.includes("method: 'POST'") &&
    invite.includes("acceptCommittedSnapshot(data, id, previousDraft, previousServer)") &&
    !invite.includes("draftParticipants.push("),
    "Clicking Add must POST the invite immediately, not show a temporary unsaved avatar");
  assert(collaboration.includes("qsseda:tex-collaboration-committed") &&
    collaboration.includes("requestSequence += 1;") &&
    collaboration.includes("renderAvatars();"),
    "Confirmed participant snapshots must update avatars and invalidate stale pending reads");
  assert(markup.includes("const mutationEpoch = new Map();") &&
    markup.includes("window.addEventListener('qsseda:tex-collaboration-committed',onCommitted)") &&
    markup.includes("mutationEpoch.get(key) || 0) !== startedEpoch"),
    "Old prefetch GETs may not replace committed members or cache stale avatars");
  assert(markup.includes(zh ? "成员已添加并保存" : "Collaborator added and saved"),
    "The UI must only report invite success after the server confirms membership");
  assert(!markup.includes("userDirectoryStorageKey") &&
    !markup.includes("prefetchUserDirectory()") &&
    !markup.includes("directoryMatches(query)") &&
    !markup.includes("q=__directory__"),
    "Searching collaborators must not mistake a truncated eight-user directory cache for all registered accounts");
  assert(markup.includes("api('/api/tex/collaboration?action=search&document='") &&
    markup.includes("userSearchCacheAge"),
    "Names and email-like handles must reach authenticated per-query search with short-lived caching");

  // Execute the real Add handler with a fake authenticated API. An avatar
  // must never appear solely because a person was added to a local draft.
  const handlerAt = collaboration.indexOf("function acceptCommittedSnapshot(");
  const handlerEnd = collaboration.indexOf("async function saveDraft()", handlerAt);
  assert(handlerAt > 0 && handlerEnd > handlerAt, "Immediate invite handler must be present");
  const inviteHandler = collaboration.slice(handlerAt, handlerEnd);
  async function inviteScenario(failWrite = false) {
    const owner = { id:"owner-1", username:"owner", role:"owner", is_owner:true };
    const guest = { id:"guest-2", username:"guest", role:"editor", is_owner:false };
    const calls = [];
    const events = [];
    const notices = [];
    const ctx = {
      snapshot: {document_id:"document-3", can_manage:true, participants:[owner]},
      draftParticipants:[owner], calls, events, notices, submit:null,
      async api(url, options) {
        calls.push([url,options?.method||"GET"]);
        if (options?.method === "POST") {
          assert.equal(JSON.parse(options.body).username, "guest");
          if(failWrite)throw Error("server rejected invite");
          return { document_id:"document-3", can_manage:true,participants:[owner,guest] };
        }
        return {document_id:"document-3",can_manage:true,participants:[owner]};
      },
      async resolveDraftPerson(){return guest}
    };
    const body = [
      "let snapshot=ctx.snapshot,draftParticipants=ctx.draftParticipants;",
      "let saving=false,loading=false,requestSequence=0,snapshotDocumentId='',snapshotLoadedAt=0;",
      "let snapshotPromise=null,snapshotPromiseDocumentId='',selectedSearchPerson=null;",
      "const labels={error:'Failure',add:'Add',adding:'Adding',memberAdded:'Saved',alreadyMember:'Already',userNotFound:'Missing'};",
      "const form={addEventListener(type,fn){if(type==='submit')ctx.submit=fn;}};",
      "const username={value:'guest'}, role={value:'editor'},add={textContent:''};",
      "const cloneParticipants=items=>Array.isArray(items)?items.map(item=>({...item})):[];",
      "const activeDocumentId=()=> 'document-3';",
      "const isExistingMember=person=>draftParticipants.some(item=>item.id===person.id);",
      "const resolveDraftPerson=ctx.resolveDraftPerson;",
      "const api=ctx.api;",
      "const hideSearchResults=()=>{};",
      "const setBusy=value=>{loading=value};",
      "const renderParticipants=()=>{};",
      "const showMessage=(value,bad=false)=>ctx.notices.push({value,bad});",
      "const friendlyError=error=>error.message;",
      "const window={dispatchEvent:event=>ctx.events.push(event)};",
      "class CustomEvent{constructor(type,options){this.type=type;this.detail=options.detail}}",
      inviteHandler,
      "return { send:()=>ctx.submit({preventDefault(){}}),state:()=>({snapshot,draftParticipants,saving})};"
    ].join("\n");
    const runtime = new Function("ctx",body)(ctx);
    await runtime.send();
    return {ctx, ...runtime.state()};
  }
  const added = await inviteScenario();
  assert.equal(added.ctx.calls.filter(([,verb])=>verb==="POST").length,1,
    "A single Add click must grant membership on the server exactly once");
  assert(added.snapshot.participants.some(person=>person.id==="guest-2") &&
    added.draftParticipants.some(person=>person.id==="guest-2"),
    "Saved avatar must survive drawer closing and reopening");
  assert(added.ctx.events.some(event=>event.type==="qsseda:tex-collaboration-committed"),
    "A saved invite must invalidate cached membership snapshots");
  const rejected = await inviteScenario(true);
  assert(!rejected.snapshot.participants.some(person=>person.id==="guest-2") &&
    !rejected.draftParticipants.some(person=>person.id==="guest-2"),
    "Failed invitations may not show a transient collaborator avatar");
  assert(rejected.ctx.notices.some(item=>item.bad), "Failed invite must show an error instead of silently disappearing");

  for (const scriptId of ["qsseda-work-tex-realtime-runtime", "qsseda-work-tex-codemirror-runtime", "qsseda-tex-live-controls-runtime"]) {
    const match = markup.match(new RegExp('<script id="' + scriptId + '">([\\s\\S]*?)<\\/script>'));
    assert(match, "Missing script " + scriptId);
    assert.doesNotThrow(() => new Function(match[1]), "Invalid browser script in " + scriptId);
  }
}

assert.equal(typeof TexCollaborationRoom, "function", "Durable Object export must remain available.");
console.log("TeX collaboration presence identity, Yjs positions, follow controls and rendered browser script syntax passed.");
