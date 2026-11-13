import assert from "node:assert/strict";
import fs from "node:fs";
import { enhanceWorkTexCollaboration } from "../studio/ui-work-tex-collaboration-instant.js";
import { mapTexPositionThroughYDelta, mapTexPositionThroughTextChange } from "../studio/ui-work-tex-realtime.js";
import { TexCollaborationRoom, safeCollaborationAccent } from "../studio/tex-collaboration-room.js";
import { IPHONE_THEME_PALETTE } from "../studio/iphone-theme-palette.js";
import { texWorkbenchContent } from "../studio/ui-tex-workbench.js";
import { enhanceTexWorkbenchLocal } from "../studio/ui-tex-local.js";
import { polishTexWorkbenchApp } from "../studio/ui-tex-app.js";
import { html } from "../studio/routing.js";

const load = name => fs.readFileSync(new URL("../studio/" + name, import.meta.url), "utf8");
const room = load("tex-collaboration-room.js");
const realtime = load("ui-work-tex-realtime.js");
const codeMirror = load("ui-work-tex-codemirror.js");
const live = load("ui-work-tex-live-controls.js");

const collaborationApi = load("tex-collaboration-api.js");
const validatorsStart=collaborationApi.indexOf("function cleanUsername(value) {");
const validatorsEnd=collaborationApi.indexOf("function cleanText(", validatorsStart);
assert(validatorsStart>0 && validatorsEnd>validatorsStart,"Collaborator request validators must exist");
const {cleanUsername,cleanSearchQuery}=new Function(
  collaborationApi.slice(validatorsStart,validatorsEnd) +
  "\nreturn {cleanUsername,cleanSearchQuery};"
)();
assert.equal(cleanSearchQuery("210713206@qq.com"),"210713206@qq.com",
  "Email-style handles must reach the server's directory RPC, not be silently rejected");
assert.equal(cleanSearchQuery("梦"),"梦",
  "Single-character Chinese searches must be passed to the server");
assert.equal(cleanSearchQuery("张梦怡"),"张梦怡",
  "Chinese display names must be searchable");
assert.equal(cleanUsername("210713206@qq.com"),"210713206@qq.com",
  "Inviting a selected email-style username must pass POST validation");
assert.equal(cleanUsername("@210713206@qq.com"),"210713206@qq.com",
  "A leading @ mention must normalize while keeping the email @");
assert.equal(cleanUsername("梦"),"",
  "A display-name fragment must not be submitted as an exact username");
assert.equal(cleanSearchQuery("John Smith"),"John Smith",
  "Display name searches may contain spaces");
for (const rejected of ["<script>","\n", "a".repeat(81)]) {
  assert.equal(cleanSearchQuery(rejected),"","Invalid search input must be rejected");
}
assert(collaborationApi.includes("tex_search_collaborators") &&
  collaborationApi.includes("tex_resolve_collaborator"),
  "Search and add must use authenticated directory RPCs");
const perfSource=load("ui-work-tex-collaboration-performance.js");
assert(perfSource.includes("userSearchCache.delete(key)") &&
  perfSource.includes("if (results.length &&"),
  "Negative or eight-row prefix caches must never conceal newly discoverable accounts");


assert.match(room, /client_id:\s*crypto\.randomUUID\(\)/, "Each socket needs an independent identity.");
assert.match(room, /client_id:\s*participant\.client_id/, "Broadcasts and sync must expose socket identity.");
assert.match(room, /safeRelativePosition\(payload\.anchor_rel\)/, "Server must validate remote anchor position.");
assert.match(room, /safeRelativePosition\(payload\.head_rel\)/, "Server must validate remote caret position.");
assert.match(room, /participant\.caret_position/, "Directional caret position must be preserved.");
assert.match(realtime, /person\?\.client_id === current\.clientId/, "Self must be identified by connection, not by cursor coordinates.");
// A cursor is colored using the remote USER's current AERTEX accent, not the
// local viewer's theme or a hash of the other user's name.
const accents=new Map(IPHONE_THEME_PALETTE.map(color=>[color.id,color]));
for(const themeId of ["iphone-faf6f2","iphone-4d1821","iphone-9aadf6"]){
  assert(accents.has(themeId),"Expected test accents must belong to the canonical AERTEX palette");
  assert.equal(safeCollaborationAccent(themeId),themeId,
    "The presence server must preserve a user's exact palette identity");
}
for(const invalid of ["#ff0000","red","iphone-123456;position:absolute","iphone-abcdef",null,{}, ""]){
  assert.equal(safeCollaborationAccent(invalid),"",
    "The presence server must not broadcast untrusted CSS or unknown palette IDs");
}
assert.match(room,/accent_id:\s*safeCollaborationAccent\(participant\.accent_id\)/,
  "WebSocket presence must rebroadcast the sender's validated accent");
assert.match(room,/participant\.accent_id = safeCollaborationAccent\(payload\.accent_id\)/,
  "WebSocket must validate the theme ID before preserving it");
assert.match(realtime,/accent_id: accentId/,
  "Each client's presence must announce its own selected accent");
assert.match(realtime,/window\.AERTEXTheme\?\.getAccent\?\.\(\)/,
  "The sent color must be sourced from account appearance settings");
assert.match(realtime,/aertex-themechange.*sendPresence\(true\)/,
  "Changing accent while connected must rebroadcast immediately");
assert.match(codeMirror,/const palette = collaboratorColor\(person\)/,
  "Remote selection, label and caret must share the collaborator's palette");
assert.match(codeMirror,/label\.style\.setProperty\('--tex-remote-label-ink', palette\.ink\)/,
  "Pale theme colors must render a readable dark text label");
const paletteStart=codeMirror.indexOf("        function colorFor(person) {");
const paletteEnd=codeMirror.indexOf("        function inferSelf(participants)",paletteStart);
assert(paletteStart>0&&paletteEnd>paletteStart,"A deterministic legacy fallback and palette resolver are required");
const remoteTheme=new Function("window",
  codeMirror.slice(paletteStart,paletteEnd)+"\nreturn collaboratorColor;")({
    AERTEXTheme:{colors:Object.fromEntries(IPHONE_THEME_PALETTE.map(color=>[color.id,color]))}
  });
assert.equal(remoteTheme({id:"user-A",accent_id:"iphone-faf6f2"}).caret,"#FAF6F2");
assert.equal(remoteTheme({id:"user-A",accent_id:"iphone-faf6f2"}).ink,"#111111",
  "Pastel labels must use the palette's readable ink, not forced white");
assert.equal(remoteTheme({id:"user-B",accent_id:"iphone-4d1821"}).caret,"#4D1821");
assert.notEqual(remoteTheme({id:"user-A",accent_id:"iphone-faf6f2"}).caret,
  remoteTheme({id:"user-B",accent_id:"iphone-4d1821"}).caret,
  "Two users with different themes must not inherit the viewer's own color");
assert.match(remoteTheme({id:"legacy-client"}).caret,/^hsl\(/,
  "Older clients without an accent must keep deterministic cursor colors");

// Regression: when A inserts one character before B's caret, B's caret
// must advance with the original text, not appear to move backward by one.
for (const [delta,position,bias,expected] of [
  [[{retain:3},{insert:"x"},{retain:2}],5,1,6],
  [[{retain:3},{insert:"x"}],2,1,2],
  [[{retain:3},{insert:"x"}],3,1,4],
  [[{retain:3},{insert:"x"}],3,-1,3],
  [[{retain:2},{insert:"🐱"}],5,1,7],
  [[{retain:2},{delete:1}],5,1,4],
  [[{retain:2},{delete:3}],4,1,2],
  [[{retain:2},{delete:2},{insert:"XYZ"}],6,1,7]
]) assert.equal(mapTexPositionThroughYDelta(delta,position,bias),expected,
  "Yjs remote edit must preserve a peer's logical caret position");
assert.equal(mapTexPositionThroughTextChange("abde","abcde",4),5);
assert.equal(mapTexPositionThroughTextChange("abcde","abde",5),4);
assert.match(realtime,/renderYState\(current, event\.delta\)/,
  "Yjs observer must send the actual per-transaction delta");
assert.match(codeMirror,/transaction\.changes = \{ from, to: oldEnd, insert: next\.slice\(from, nextEnd\) \}/,
  "Do not replace all CodeMirror content for a one-character edit");
const runtimeMarkup=enhanceWorkTexCollaboration(
  polishTexWorkbenchApp(enhanceTexWorkbenchLocal(texWorkbenchContent(true),true),true),true);
const syncRuntime=runtimeMarkup.match(/<script id="qsseda-work-tex-realtime-runtime">([\s\S]*?)<\/script>/)?.[1];
assert(syncRuntime,"Realtime script missing");
const begin=syncRuntime.indexOf("function renderYState(current, delta = null)");
const end=syncRuntime.indexOf("function applyPendingLocal(",begin);
assert(begin>0&&end>begin,"Actual browser Yjs->editor renderer missing");
const renderer=syncRuntime.slice(begin,end);
function simulateRemote(previous,next,anchor,head,delta){
  let notifications=0;
  const source={value:previous,selectionStart:Math.min(anchor,head),
    selectionEnd:Math.max(anchor,head),selectionDirection:anchor>head?'backward':'forward',
    setSelectionRange(start,end,direction){
      this.selectionStart=start;this.selectionEnd=end;this.selectionDirection=direction;
    },dispatchEvent(){notifications++;}};
  const selected={anchor,head};
  const ctx={source,
    activeElements:()=>({source,title:null,engine:null}),
    window:{__qssedaTexEditorBridge:{getActiveAsset:()=>null,getSelection:()=>selected}},
    dispatchSyntheticInput:element=>element.dispatchEvent(),
    mapTexPositionThroughYDelta,mapTexPositionThroughTextChange};
  const run=new Function("ctx",
    "const {activeElements,window,dispatchSyntheticInput,mapTexPositionThroughYDelta,mapTexPositionThroughTextChange}=ctx;"+
    renderer+"return renderYState;")(ctx);
  const state={ready:true,applyingRemote:false,ytext:{toString:()=>next},ymeta:{get:()=>''}};
  run(state,delta);
  assert.equal(state.applyingRemote,false);
  assert.equal(notifications,1);
  return source;
}
let peer=simulateRemote("abcdef","abXcdef",5,5,[{retain:2},{insert:"X"},{retain:4}]);
assert.equal(peer.value,"abXcdef");
assert.equal(peer.selectionStart,6,"A typing must not move B's caret backward");
peer=simulateRemote("abXcdef","abcdef",6,6,[{retain:2},{delete:1},{retain:4}]);
assert.equal(peer.selectionStart,5);
peer=simulateRemote("abcdef","abcXdef",5,2,[{retain:3},{insert:"X"},{retain:3}]);
assert.equal(peer.selectionStart,2);
assert.equal(peer.selectionEnd,6);
assert.equal(peer.selectionDirection,"backward");
console.log("Realtime CRDT caret offsets and browser selection mapping passed.");

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

  assert(markup.includes('class="tex-collaboration-presence-tooltip"') ||
    markup.includes("presenceTooltip.className = 'tex-collaboration-presence-tooltip'"),
    "The collaboration toolbar must provide a status tooltip");
  assert(markup.includes("openButton.addEventListener('mouseenter'") &&
    markup.includes("openButton.addEventListener('focus'") &&
    markup.includes("openButton.addEventListener('mouseleave'"),
    "Pointer hover and keyboard focus must expose, and pointer leave hide, member availability");
  assert(markup.includes("window.addEventListener('qsseda:tex-presence',updatePresenceTooltip)") &&
    markup.includes("window.addEventListener('qsseda:tex-realtime-status',updatePresenceTooltip)"),
    "The hover statuses must refresh from live WebSocket presence and connection state");
  assert(markup.includes("presenceTooltip.setAttribute('role', 'tooltip')") &&
    markup.includes("presenceTooltip.hidden = true") &&
    markup.includes("openButton.setAttribute('aria-describedby',presenceTooltip.id)"),
    "The member-status tooltip must be accessible and hidden by default");
  assert(!markup.includes("avatars.title = members.length"),
    "Old browser-native count tooltip must not cover the detailed presence list");
  const helperStart = collaboration.indexOf("        function presenceMemberState(");
  const helperEnd = collaboration.indexOf("        function paintPresenceTooltip()",helperStart);
  assert(helperStart>=0 && helperEnd>helperStart,
    "Availability helper must be present in the active collaboration runtime");
  const memberState = new Function(collaboration.slice(helperStart,helperEnd) +
    "\nreturn presenceMemberState;")();
  const activeDoc = "doc-a";
  const liveState = {document_id:activeDoc, connected:true};
  const onlineList = {document_id:activeDoc,participants:[
    {id:"user-1",client_id:"tab-a",display_name:"Same Name"},
    {id:"user-1",client_id:"tab-b",display_name:"Same Name"},
    {id:"user-4",display_name:"Same Name"}
  ]};
  assert.equal(memberState({id:"user-1"},activeDoc,liveState,onlineList),"online");
  assert.equal(memberState({id:"user-2",display_name:"Same Name"},activeDoc,liveState,onlineList),"offline",
    "Display name collisions must not spoof online identity");
  assert.equal(memberState({id:"user-4"},activeDoc,liveState,onlineList),"online",
    "Another online member must be recognized");
  assert.equal(memberState({id:"user-2"},activeDoc,{...liveState,connected:false},onlineList),"unknown",
    "Disconnected channel must not mark every member falsely offline");
  assert.equal(memberState({id:"user-1"},"doc-b",liveState,onlineList),"unknown",
    "Presence from another document must never leak into the active project");
  assert.equal(memberState({id:"user-1"},activeDoc,liveState,{document_id:"doc-b",participants:onlineList.participants}),"unknown",
    "Stale document snapshots must not be mistaken for live presence");
  assert.equal(memberState({username:"Same Name"},activeDoc,liveState,onlineList),"offline",
    "Only stable account IDs may prove somebody is online");
  assert(markup.includes(zh ? '"presenceOnline":"在线"' : '"presenceOnline":"Online"') &&
    markup.includes(zh ? '"presenceOffline":"离线"' : '"presenceOffline":"Offline"'),
    "Availability labels must appear in the emitted locale-specific runtime");

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
