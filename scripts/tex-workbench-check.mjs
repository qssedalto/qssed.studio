import fs from "node:fs";
import { texWorkbenchContent } from "../studio/ui-tex-workbench.js";
import { enhanceTexWorkbenchLocal } from "../studio/ui-tex-local.js";
import { polishTexWorkbenchApp } from "../studio/ui-tex-app.js";
import { enhanceWorkTexCollapsiblePanels } from "../studio/ui-work-tex-panels.js";
import { enhanceWorkTexDesktopTypography } from "../studio/ui-work-tex-desktop-type.js";
import { injectWorkTexHomeLinks } from "../studio/ui-work-tex.js";
import { polishWorkTexViewportEdges } from "../studio/ui-work-tex-viewport-edges.js";
import { polishWorkTexWelcome, selectWorkTexGreeting } from "../studio/ui-work-tex-welcome.js";
import { enhanceWorkTexComposer } from "../studio/ui-work-tex-composer.js";
import { polishWorkTexPdfControls } from "../studio/ui-work-tex-pdf-controls.js";
import { LAB_TOOLS } from "../studio/lab-tools.js";
import { prepareWorkTexDocumentShell } from "../studio/ui-work-tex-persistent-cache.js";
import { workLocalBridgeContent } from "../studio/ui-work.js";
import { enhanceWorkLocalBridgeNative } from "../studio/ui-work-native.js";

const controlStyles = enhanceWorkTexDesktopTypography("");
const toolbarControls = controlStyles.match(/<style id="qsseda-work-tex-toolbar-control-heights">([\s\S]*?)<\/style>/)?.[1] || "";
assert(toolbarControls.includes("@media (min-width:761px)"), "Desktop height contract must remain scoped to desktop");
for (const selector of [">label select", ">#tex-collaboration-open", ">.tex-panel-home-link"]) {
  assert(toolbarControls.includes(selector), "Toolbar height contract missing " + selector);
}
const desktopHeights = toolbarControls.split("@media (max-width:760px)")[0];
for (const key of ["height", "min-height", "max-height"]) {
  assert(desktopHeights.includes(key + ":38px!important"), "Desktop controls should match the original 38px XeLaTeX select");
  assert(!desktopHeights.includes(key + ":64px!important"), "Toolbar controls must not be stretched to the old 64px height");
}

const workNavUi = fs.readFileSync(new URL("../studio/ui-work-tex.js", import.meta.url), "utf8");
assert(workNavUi.includes('one slim row') && workNavUi.includes('rail.prepend(card)'),"Local TeX status must be a compact first-row strip");
const worker = fs.readFileSync(new URL("../worker.js", import.meta.url), "utf8");
const entry = fs.readFileSync(new URL("../studio/entry.js", import.meta.url), "utf8");
const config = fs.readFileSync(new URL("../studio/config.js", import.meta.url), "utf8");
const edge = fs.readFileSync(new URL("../studio/edge-protection.js", import.meta.url), "utf8");
const api = fs.readFileSync(new URL("../studio/tex-api-core.js", import.meta.url), "utf8");
const apiWrapper = fs.readFileSync(new URL("../studio/tex-api.js", import.meta.url), "utf8");
const versionApi = fs.readFileSync(new URL("../studio/tex-version-api.js", import.meta.url), "utf8");
const workNavigationUi = fs.readFileSync(new URL("../studio/ui-work-tex.js", import.meta.url), "utf8");

const localCompileClient = fs.readFileSync(new URL("../studio/ui-tex-local.js", import.meta.url), "utf8");
const historyCompileClient = fs.readFileSync(new URL("../studio/ui-work-tex-version-history.js", import.meta.url), "utf8");
const bridgeCompiler = fs.readFileSync(new URL("../local-bridge/original-engine/main_windows.go", import.meta.url), "utf8");
assert(localCompileClient.includes("loadProjectAssets") &&
       localCompileClient.includes("window.__aertexLoadTexCompileFiles"),
  "Local preview must resolve authenticated project dependencies");
assert(localCompileClient.includes("files })") &&
       localCompileClient.includes("tex.project-files"),
  "Native compile requests must include dependency files and demand a capable Bridge");
assert(historyCompileClient.includes("await projectFiles(version.document_id)") &&
       historyCompileClient.includes("source: version.source, title: version.title, files"),
  "Version-history PDF download must compile project files, not only main.tex");
assert(historyCompileClient.includes("showCompiledPreview(pdf)"),
  "Completed history compiles must appear in the main preview pane");
assert(bridgeCompiler.includes("func safeProjectAssetName") &&
       bridgeCompiler.includes("func writeProjectAssets") &&
       bridgeCompiler.includes("writeProjectAssets(workDir, payload.Files)"),
  "Native Bridge must sandbox nested TeX assets and forbid path traversal");
assert(bridgeCompiler.includes('"tex.project-files"'),
  "Bridge must advertise multi-file support before the browser sends project assets");


for (const zh of [true, false]) {
  const markup = texWorkbenchContent(zh);
  for (const endpoint of ["/api/tex/status", "/api/tex/documents", "/api/tex/runs", "/api/tex/compile"]) assert(markup.includes(endpoint), `TeX Workbench is missing ${endpoint}`);
  assert(markup.includes("credentials:'same-origin'"), "TeX browser runtime must use the HttpOnly same-origin session");
  assert(!markup.includes("Authorization"), "TeX browser runtime must not read or send bearer tokens");
  assert(markup.includes("id=\"tex-template\""), "TeX template selector is missing");
  assert(markup.includes("id=\"tex-engine\""), "TeX engine selector is missing");
  assert(markup.includes("id=\"tex-download\""), "TeX source download is missing");
  assert(markup.includes("id=\"tex-compile\""), "TeX compile control is missing");
  const scripts = [...markup.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  assert(scripts.length > 0, "TeX Workbench must include a client runtime");
  for (const code of scripts) new Function(code);

  const workMarkup = enhanceWorkTexCollapsiblePanels(polishTexWorkbenchApp(enhanceTexWorkbenchLocal(markup, zh), zh), zh);
  // The generated document handler must await the custom modal before invoking
  // the original authenticated DELETE route. A Promise alone is always truthy.
  assert(workMarkup.includes("!await window.__qssedaTexConfirmDelete?.("), "Delete flow must await the custom confirmation result.");
  assert(!workMarkup.includes("window.confirm(copy.deleteConfirm)"), "Legacy browser confirm must be replaced in Work TeX.");
  assert(workMarkup.includes("deleteFileName.textContent"), "Delete dialog must show the active TeX filename.");
  // Regression: the last stylesheet in the generated page used to silently
  // override our 38px desktop controls with 64px, despite older CSS checks passing.
  const finalToolbar = workMarkup.match(/<style id="qsseda-work-tex-toolbar-final-height">([\s\S]*?)<\/style>/)?.[1];
  assert(finalToolbar, "Final Work TeX toolbar height stylesheet must exist");
  const finalDesktop = finalToolbar.split("@media (max-width:760px)")[0];
  for (const selector of [">label>#tex-engine", ">#tex-collaboration-open", ">.tex-panel-home-link"]) {
    assert(finalDesktop.includes(selector), "Final toolbar rule must cover " + selector);
  }
  for (const property of ["height", "min-height", "max-height"]) {
    assert(finalDesktop.includes(property + ":38px!important"), "FINAL desktop toolbar controls must really be 38px");
    assert(!finalDesktop.includes(property + ":64px!important"), "FINAL toolbar must not override compact controls with 64px");
    assert(finalToolbar.includes(property + ":42px!important"), "Mobile controls should retain 42px touch sizing");
  }
  assert(workMarkup.lastIndexOf('id="qsseda-work-tex-toolbar-final-height"') >
    workMarkup.indexOf('id="qsseda-work-tex-toolbar-control-heights"'),
    "The late-arriving toolbar CSS must be covered by the compact-height check");
  const workPageMarkup = polishWorkTexPdfControls(polishWorkTexWelcome(polishWorkTexViewportEdges(injectWorkTexHomeLinks(
    `<!doctype html><html><head></head><body>${workMarkup}</body></html>`,
    zh ? "zh-cn" : "en-us",
    "https://qsseda.com"
  ))));

  const fullWork = prepareWorkTexDocumentShell(workPageMarkup, {
    userId: "123e4567-e89b-12d3-a456-426614174000",
    documentId: "5c5d5a4d-32aa-43fb-a7f8-aabcde0ab123",
    zh
  });
  assert(fullWork.includes('data-tex-cache-user="123e4567-e89b-12d3-a456-426614174000"'), "Document cache must bind to the server-authenticated account");
  assert(fullWork.includes('id="tex-editor-placeholder" class="tex-editor-placeholder" hidden'), "Deep-link first paint must not show the welcome page");
  assert(fullWork.includes('id="tex-document-restore"'), "Deep link needs a loading state if no cached copy exists");
  assert(fullWork.includes("#tex-editor-placeholder[hidden]{display:none!important}"), "Welcome CSS must not override the first-paint hidden state");
  assert(fullWork.includes("restorePreviouslyOpenedDocument()"), "Deep link must retain an explicit first-paint restore guard");
  assert(!fullWork.includes("activeDocument=cached"), "Old IndexedDB snapshots must never paint deleted or replaced main.tex before server validation");
  assert(fullWork.includes("openDocument(requested,'replace',true)"), "Fresh document data must refresh the cached snapshot");
  assert(!fullWork.includes("editor.inert=true"), "The editor must remain hidden, rather than showing a stale cached source as read-only");
  assert(fullWork.includes("editor.inert=false"), "Freshly verified documents must become interactive");
  assert(fullWork.includes("indexedDB.open(databaseName, 1)"), "Previously opened source files must be cached persistently");
  assert(fullWork.includes("url.pathname === '/api/tex/collaboration/shared'"), "Shared documents must also enter the local cache");
  assert(fullWork.includes("url.pathname === '/api/auth/logout'"), "Logging out must delete this account's cached sources");
  const cacheScript = fullWork.match(/<script id="qsseda-work-tex-document-cache">([\s\S]*?)<\/script>/)?.[1];
  assert(cacheScript, "Work cache runtime should be injected exactly once");
  new Function(cacheScript);
  const publicWork = prepareWorkTexDocumentShell(workPageMarkup, { userId: "123e4567-e89b-12d3-a456-426614174000", zh });
  assert(!publicWork.includes('id="tex-document-restore"'), "The normal Work start must still show templates");
  assert(!publicWork.includes('id="tex-editor-placeholder" class="tex-editor-placeholder" hidden'), "The normal start page must not hide its welcome view");
  assert(prepareWorkTexDocumentShell(workPageMarkup, { userId: "unverified", documentId: "5c5d5a4d-32aa-43fb-a7f8-aabcde0ab123", zh }) === workPageMarkup, "Unauthenticated markup must not expose a cache");
  const local = enhanceWorkLocalBridgeNative(workLocalBridgeContent(zh, "zh-cn"));
  assert(!local.includes('class="work-panel"'), "Redundant bridge information cards must be removed");
  assert(!local.includes('id="work-local-capabilities"'), "Remove the capabilities card from local bridge UI");
  assert(local.includes('id="work-local-log"') && local.includes('id="work-local-status-card"'), "Connection status must remain functional");
  assert(local.includes('id="work-bridge-upgrade-note"'), "Bridge outdated-version warning must be preserved");

  assert(workPageMarkup.includes('id="qsseda-work-tex-home-links"'), "Work TeX must install shared main-site exit styling");
  for (const selector of [
    ".tex-documents-panel .tex-panel-head",
    ".tex-editor-panel .tex-editor-toolbar",
    ".tex-editor-panel .tex-editor-placeholder",
    ".tex-runs-panel .tex-runs-head"
  ]) assert(workPageMarkup.includes(selector), "Work TeX home navigation is missing panel target: " + selector);
  assert(workPageMarkup.includes("https://qsseda.com/") && workPageMarkup.includes("AERTEX"), "Every Work TeX pane must receive an AERTEX Home destination");
  // The desktop document rail shrinks to 44px, so its Home action must hide
  // rather than compete with the only expand/collapse button in that rail.
  const collapsedHomeSelector = ".tex-shell.is-left-collapsed .tex-documents-panel>.tex-panel-head .tex-panel-home-link{";
  assert(workMarkup.includes(collapsedHomeSelector + "\n          display:none!important;"), "Collapsed Work TeX document rail must hide its Home action.");
  assert(!workMarkup.includes(collapsedHomeSelector + "\n          order:2!important;"), "Collapsed Home link must not retain its legacy second-button styling.");
  assert(workPageMarkup.includes(".tex-work-app .tex-panel-home-link{"), "Expanded and mobile TeX panels must retain the normal Home link styles.");

  assert(workPageMarkup.includes(".tex-panel-home-link>svg{width:14px;height:14px"), "Work TeX must size only the direct Home icon, not every nested brand SVG.");
  assert(workPageMarkup.includes(".tex-panel-home-link .aertex-wordmark-token{"), "Work TeX must explicitly size the AERTEX wordmark.");
  assert(workPageMarkup.includes("width:70px!important") && workPageMarkup.includes("height:13.5px!important"), "Work TeX AERTEX wordmark must remain visibly legible.");
  assert(!workPageMarkup.includes(".tex-panel-home-link svg{width:13px;height:13px"), "Work TeX must not collapse the AERTEX wordmark into the Home icon dimensions.");

  assert(workPageMarkup.includes('id="qsseda-work-tex-viewport-edges"'), "Work must apply the final flush-edge layout layer.");
  assert(workPageMarkup.includes("scrollbar-width:none!important"), "Right PDF panel must hide visible scrollbars without disabling scrolling.");
  assert(workPageMarkup.includes("scrollbar-gutter:auto!important"), "Right PDF panel must not reserve a blank stable scrollbar gutter.");
  assert(workPageMarkup.includes("calc(100% - 10px)!important"), "PDF card must occupy the right column without the extra 24px gutter.");
  assert(workPageMarkup.includes("margin:8px 2px 8px 8px!important"), "PDF card must not reserve a visible right edge strip.");
  assert(workPageMarkup.includes("left:50%!important") && workPageMarkup.includes("translateX(-50%)"), "Right collapsed plus button must be horizontally centered.");
  assert(workPageMarkup.includes('id="qsseda-work-tex-right-preview-rewrite"'), "Right PDF panel must render from the dedicated rebuilt stylesheet.");
  assert(workPageMarkup.includes('id="qsseda-work-tex-right-preview-runtime"'), "Right PDF controls must use one dedicated runtime.");
  assert(workPageMarkup.includes('grid-template-rows:52px 33px minmax(0,1fr) 34px!important'), "Right PDF preview must have a predictable header, status, flexible viewer, and footer.");
  assert(workPageMarkup.includes('flex:0 0 100%!important') && workPageMarkup.includes('height:100%!important'), "Preview card must occupy its right pane without nested empty space.");
  assert(workPageMarkup.includes('rail.classList.add(\'qtex-right-panel\')'), "Only the right PDF panel may receive the rebuilt component styles.");
  assert(workPageMarkup.includes('header.prepend(maximize)'), "Maximize control must be the first element of the right PDF header.");
  assert(workPageMarkup.includes('actions.append(collapse)'), "Collapse control must align inside the right header action row.");
  assert(workPageMarkup.includes('rail.prepend(collapse)'), "Collapsed right rail must retain the same toggle.");
  assert(workPageMarkup.includes('.tex-shell.is-right-collapsed > .tex-runs-panel.qtex-right-panel'), "Collapsed rail must have its own 44px layout.");
  assert(workPageMarkup.includes('background:var(--work-panel-soft)!important'), "Right PDF panel should mirror the left documents background.");
  const rebuiltSource = fs.readFileSync(new URL("../studio/ui-work-tex-pdf-controls.js", import.meta.url), "utf8");
  assert(!rebuiltSource.includes("create('fit'") && !rebuiltSource.includes('create("fit"'), "Remove the redundant custom PDF fit button.");
  assert(!rebuiltSource.includes("level=125") && !rebuiltSource.includes("targetFragment="), "Remove the redundant numeric-zoom toolbar implementation.");
  assert(!rebuiltSource.includes("previewFrame.setAttribute('src'") && !rebuiltSource.includes("frame.setAttribute('src'"), "Right panel must not interfere with the native PDF viewer URL.");
  const runtimeMatch = workPageMarkup.match(/<script id="qsseda-work-tex-right-preview-runtime">([\s\S]*?)<\/script>/);
  assert(runtimeMatch && runtimeMatch[1], "Right panel runtime must be mounted exactly once.");
  new Function(runtimeMatch[1]);

  assert(workPageMarkup.includes('id="qsseda-work-tex-welcome-clean"'), "Welcome page must use a single isolated stylesheet.");
  const composerMarkup = enhanceWorkTexComposer(workPageMarkup, zh);
  assert(composerMarkup.includes('id="qtex-composer"') && composerMarkup.includes('id="qtex-composer-input"'), "Welcome must mount actual composer controls.");
  for (const action of ["file", "library", "image", "web"]) {
    assert(composerMarkup.includes('data-action="'+action+'"'), "Composer must expose "+action+" action.");
  }
  assert(composerMarkup.includes('id="qtex-composer-target"') && composerMarkup.includes('id="qtex-composer-target-menu"'), "Project/chat selector must be present.");
  assert(composerMarkup.includes('aria-label="'+(zh?"添加文件等内容":"Add files and more")+'"'), "Plus SVG button needs a localized label.");
  assert(!composerMarkup.includes('data-action="at"'), "Legacy @-context control must not be added.");
  assert(composerMarkup.includes('background:var(--primary,#4875df)'), "Send button must use the active theme color.");
  assert(composerMarkup.includes('qtex-composer-menu[hidden]'), "Menus should stay hidden by default.");
  const composerRuntime = composerMarkup.match(/<script id="qtex-composer-runtime">([\s\S]*?)<\/script>/)?.[1];
  assert(composerRuntime, "Composer runtime must be embedded.");
  new Function(composerRuntime);
  assert(composerRuntime.includes("__aertexTexFileOpenDialog") && composerRuntime.includes("tex-file-tab-import"),
    "Attachments and library must reuse the actual TeX file modal.");
  assert(composerRuntime.includes("chat.qsseda.com") && composerRuntime.includes("tex-command-chat-shortcut"),
    "Chat/project choices must reuse existing authenticated flows.");
  assert(composerRuntime.includes("SpeechRecognition") && composerRuntime.includes("navigator.clipboard.writeText"),
    "Voice and draft handoff must use explicit browser APIs.");

  assert(workMarkup.includes('id="qtex-welcome-greeting"'), "Welcome must expose a stable accessible greeting heading.");
  const greetingSource = workPageMarkup.match(/<script id="qsseda-work-tex-greeting-runtime">([\s\S]*?)<\/script>/)?.[1];
  assert(greetingSource, "Personalized greeting script must be embedded in the TeX welcome.");
  new Function(greetingSource);
  assert(greetingSource.includes("new Date().getHours()") && greetingSource.includes("sessionStorage"),
    "Greeting must use device-local time and avoid repeats across refreshes.");
  assert(workPageMarkup.includes("qtex-welcome-hero") && workPageMarkup.includes("place-items:center"),
    "Greeting should use the centered ChatGPT-inspired layout.");

  assert(workMarkup.includes('class="qtex-welcome"') && workMarkup.includes('class="qtex-welcome-hero"'), "Welcome page must render the editorial layout.");
  assert(workMarkup.includes('id="qtex-recent-list"') && workMarkup.includes('class="qtex-recent"'), "Welcome must show a recent-project workspace section.");
  assert(workPageMarkup.includes("container:qtex / inline-size"), "Welcome must adapt to the actual editor column, not just viewport width.");
  assert(workPageMarkup.includes("grid-template-columns:repeat(3,minmax(0,1fr))"), "Templates must use equal columns in a sufficiently wide editor.");
  assert(workPageMarkup.includes("qtex-template-icon") && !workPageMarkup.includes("--qtex-accent:#c9b2ff"), "Templates must use understated line icons and the active theme color.");
  assert(workPageMarkup.includes("@container qtex (max-width:700px)"), "Narrow editor columns must switch to compact single-column tiles.");
  assert((workMarkup.match(/<button[^>]*data-tex-start-template="/g) || []).length === 3, "Welcome must expose exactly three template buttons.");
  assert(!workMarkup.includes('class="tex-start-card"') && !workMarkup.includes('.tex-start-card::before'), "Previous duplicate-icon template treatment must be removed.");
  assert(!workPageMarkup.includes(".tex-start-kicker") && !workPageMarkup.includes("radial-gradient(closest-side at"), "Buggy vertical kicker and heavy background glow must be eliminated.");
  assert(workMarkup.includes('id="tex-editor-placeholder"'), "Existing editor open/close behavior must retain its placeholder ID.");
  if (zh) assert(workMarkup.includes("欢迎回来") && workMarkup.includes("最近使用"), "Chinese workspace dashboard must render.");
  else assert(workMarkup.includes("Welcome back") && workMarkup.includes("Recent projects"), "English workspace dashboard must render.");

  assert(workPageMarkup.includes(".tex-documents-panel > .tex-panel-head"), "Document header must share the full-width sidebar background.");
  assert(workMarkup.includes("openingDocument(id)") && workMarkup.includes("fastDocument(id)"), "Document selection must show immediate feedback and reuse prefetches.");
  assert(workMarkup.includes("void loadRuns();"), "Document detail must appear before run history fetch finishes.");
  assert(workMarkup.includes("window.addEventListener('qsseda:tex-local-recheck'"), "Local TeX must support in-place connection recovery.");
  assert(workMarkup.includes("setPreviewStatus('idle', localCopy.previewNever)"), "No document selected must retain the neutral no-preview state, not an unsupported engine warning.");
  assert(workNavigationUi.includes("detail: { host: local.host, engines: local.engines }"), "Bridge connection checker must share the verified local endpoint with preview.");
  assert(workMarkup.includes("localEngines = engines") && workMarkup.includes("localBase = base"), "Preview adapter must accept the verified Bridge engines without a redundant failing probe.");

  assert(workMarkup.includes("tex-work-app"), "Work TeX route must render the dedicated app surface");
  assert(workMarkup.includes("tex-live-preview-switch"), "Live preview must use the custom switch instead of a native checkbox UI");
  assert(!workMarkup.includes('class="tex-live-switch"'), "Live preview switch class must match its CSS selector");
  assert(workMarkup.includes("data-tex-start-template=\"blank\""), "Work TeX start surface must expose quick templates");
  assert(workPageMarkup.includes(".tex-editor-placeholder:has(.qtex-welcome)"), "Welcome must override the legacy placeholder layout.");
  assert(!workNavigationUi.includes(".tex-start-card::before"), "Old Work theme must not add pseudo-icon duplicates.");
  assert(workMarkup.includes("focus-within"), "TeX search focus styling must be explicitly controlled");
  assert(workMarkup.includes("appearance:none!important"), "TeX selectors must use the controlled arrow treatment");
  assert(workMarkup.includes('class="tex-panel-title"'), "Document count must sit beside the Documents label");
  assert(workMarkup.includes('id="tex-left-panel-toggle"'), "Work TeX must expose a left-panel collapse control");
  assert(workMarkup.includes('id="tex-right-panel-toggle"'), "Work TeX must expose a right-panel collapse control");
  assert(workMarkup.includes("is-left-collapsed") && workMarkup.includes("is-right-collapsed"), "Work TeX must implement independent panel states");
  assert(workMarkup.includes("qsseda.work.tex.panel-layout.v1"), "Work TeX panel state must persist across reloads");
  assert(workMarkup.includes('id="qsseda-work-tex-mobile-ui"'), "Work TeX must include the dedicated mobile layout");
  assert(workMarkup.includes("tex-mobile-tabs"), "Mobile Work TeX must expose Documents, Edit, and PDF tabs");
  assert(workMarkup.includes('data-mobile-pane="documents"') && workMarkup.includes('data-mobile-pane="editor"') && workMarkup.includes('data-mobile-pane="preview"'), "Mobile Work TeX must expose all three workspace panes");
  assert(workMarkup.includes("--tex-mobile-vh"), "Mobile Work TeX must track the visual viewport for keyboard-safe sizing");
  assert(workMarkup.includes("visualViewport"), "Mobile Work TeX must respond to the on-screen keyboard viewport");
  assert(workMarkup.includes("qsseda.work.tex.mobile-pane.v1"), "Mobile Work TeX must preserve the active pane within the session");
  assert(workMarkup.includes("pointer:coarse"), "Phone landscape layouts must use the mobile workspace on touch devices");
  assert(workMarkup.includes('id="qsseda-work-tex-mobile-tools"'), "Mobile Work TeX must include the quick-input toolbar styles");
  assert(workMarkup.includes("tex-mobile-inputbar"), "Mobile Work TeX must expose the TeX quick-input toolbar");
assert(workMarkup.includes(".cm-content:focus-visible") && workMarkup.includes("box-shadow:none!important"), "CodeMirror mobile focus must not inherit the global accent halo.");
assert(workMarkup.includes("viewportTop + viewportHeight"), "Mobile Work TeX must size to the actual iOS visual viewport bottom while the keyboard is open.");
assert(workMarkup.includes("height:calc(var(--tex-mobile-vh,100dvh) - 12px)"), "Mobile collaboration drawer must have a definite viewport-constrained height.");
assert(workMarkup.includes("touch-action:pan-y!important"), "Mobile collaboration pages must retain vertical touch scrolling.");
  assert(workMarkup.includes("document.createElement('a')") && workMarkup.includes("documentRoute(item.id)"), "Work document cards must be real deep-link anchors.");
  assert(workMarkup.includes("routeDocumentId") && workMarkup.includes("/d/"), "Work runtime must restore a document from its deep-link route.");
  assert(workMarkup.includes("history[replace?'replaceState':'pushState']"), "Work document switches must keep browser history in sync.");
  assert(workMarkup.includes("window.addEventListener('popstate'"), "Browser back/forward must reopen the routed Work document.");
  assert(workMarkup.includes("function saveAsLocal()") && workMarkup.includes("a.download = safeFile"), "Save As must download the active file locally without creating a cloud document.");
  assert(workMarkup.includes("id=\"aertex-work-tex-explorer-tree\"") && workMarkup.includes("id=\"aertex-work-tex-explorer-commands\""), "Work TeX must load compact project Explorer and extended actions.");
  assert(workMarkup.includes("setRangeText"), "Mobile TeX quick input must insert at the current selection");
  assert(workMarkup.includes("pointerdown") && workMarkup.includes("preventDefault"), "Mobile TeX quick input must preserve textarea focus while tapping toolbar buttons");
  assert(workMarkup.includes('id="qsseda-work-tex-version-history-runtime"'), "Work TeX must install cloud source version history");
  assert(workMarkup.includes("/api/tex/versions?action=snapshot"), "Manual local compile must snapshot its cloud source version first");
  assert(workMarkup.includes("/api/tex/versions?action=restore"), "Version history must support cloud rollback");
  assert(workMarkup.includes("Download PDF") || workMarkup.includes("下载 PDF"), "Historical versions must support on-demand local PDF download");
  const appScripts = [...workMarkup.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  for (const code of appScripts) new Function(code);
}

// Deterministic local-time and username coverage independent of CI host time zone.
for (const [hour, expected] of [
  [5,"早上好，天国！"],[10,"早上好，天国！"],
  [11,"中午好，天国！"],[13,"中午好，天国！"],
  [14,"下午好，天国！"],[17,"下午好，天国！"],
  [18,"晚上好，天国！"],[23,"晚上好，天国！"],
  [0,"夜深了，天国。"]
]) {
  const actual=selectWorkTexGreeting({zh:true,username:"天国",localHour:hour,random:()=>.8});
  assert(actual.index===6, "Time greeting option must be chosen at index six");
  assert(actual.text===expected, "Hour "+hour+" must produce "+expected);
}
assert(selectWorkTexGreeting({zh:true,username:"普通用户",localHour:19,random:()=>.999}).text ===
  "今晚想做些什么，普通用户？", "Chinese greeting must remain fully localized.");
assert(selectWorkTexGreeting({zh:false,username:"qssedalto",localHour:19,random:()=>.999}).text ===
  "Good evening, qssedalto!", "English greeting must use the logged-in username.");
assert(selectWorkTexGreeting({zh:true,username:"天国",localHour:19,previousIndex:0,random:()=>0}).index !== 0,
  "Repeated refreshes must not reuse the immediately previous greeting.");
const malicious=polishWorkTexWelcome('<html><head></head><body><section class="qtex-welcome"></section></body></html>',
  {username:'</script><script>alert("x")</script>'});
assert(!malicious.includes('</script><script>alert('),"Account username must not break out of inline script.");
assert(malicious.includes("qsseda-work-tex-greeting-runtime"),"Escaped personalized greeting runtime must mount.");

const texTool = LAB_TOOLS.find(tool => tool.id === "tex-workbench");
assert(texTool?.status === "ready", "TeX Workbench must remain live in the tool registry");
assert(texTool?.href === "/work/tex", "TeX Workbench registry must point at the Work route");
assert(config.includes('"/work/tex"'), "Work TeX route is missing from protected OS routes");
assert(config.includes('["/workspace/experiments/tex", "/work/tex"]'), "Legacy TeX route must redirect to Work TeX");
assert(entry.includes('pathname === "/work/tex"'), "Studio entry does not mount the Work TeX app");
assert(entry.includes("polishWorkTexWelcome(polishWorkTexViewportEdges(markup), { username: workGreetingName })") && entry.includes('shellProductLinks.adminHref ? "天国"'), "Entry must mount authenticated greeting with verified admin override.");
assert(entry.includes("enhanceWorkTexComposer(markup, zh)"), "Entry must mount the new welcome composer.");
const workUi = workNavigationUi;
const sourceFocus = workUi.match(/body\.os-shell:has\(\.tex-work-app\) #tex-source:focus-visible\s*\{([^}]*)\}/)?.[1] || "";
assert(sourceFocus.includes("outline:none!important"), "Focused TeX source must not inherit the global outer focus outline.");
assert(sourceFocus.includes("outline-offset:0!important"), "Focused TeX source must not use an offset focus ring.");
assert(sourceFocus.includes("box-shadow:inset 0 0 0 1px var(--primary)!important"), "Focused TeX source should retain one inner blue border.");
assert(!sourceFocus.includes("0 0 0 3px"), "TeX source must not render an external blue glow.");
assert(workUi.includes("#tex-source:focus,"), "Both pointer and keyboard focus must use the same clean TeX source treatment.");
assert(!workUi.includes("window.location.reload()"), "Bridge connection check must not force-refresh the Work editor.");
assert(workUi.includes("qsseda:tex-local-recheck"), "Bridge connection check must dispatch the in-place re-probe signal.");
assert(entry.includes("enhanceWorkTexCollapsiblePanels(polishTexWorkbenchApp(enhanceTexWorkbenchLocal(texWorkbenchContent(zh), zh), zh), zh)"), "Work TeX collapsible panel renderer is not wired");
assert(entry.includes("polishTexWorkbenchApp(enhanceTexWorkbenchLocal(texWorkbenchContent(zh), zh), zh)"), "Work TeX app renderer is not wired");
assert(worker.includes('pathname.startsWith("/api/tex/")'), "Worker is missing the TeX API boundary");
assert(worker.includes("handleTexApi(request, env"), "Worker does not dispatch TeX requests through the server boundary");
for (const endpoint of ["/api/tex/documents", "/api/tex/runs", "/api/tex/compile", "/api/tex/result"]) assert(edge.includes(`"${endpoint}"`), `${endpoint} must remain behind expensive-endpoint protection`);

assert(api.includes('const DOCUMENT_ROOT = "_system/tex-documents/"'), "TeX documents must use a hidden account-scoped R2 namespace");
assert(api.includes('const RUN_ROOT = "_system/tex-runs/"'), "Legacy TeX run metadata must remain readable during migration");
assert(api.includes('const RESULT_ROOT = "_system/tex-results/"'), "Legacy TeX PDF results must remain addressable for cleanup");
assert(api.includes("owner_id: userId"), "TeX document ownership must be bound server-side");
assert(api.includes('new Set(["xelatex", "lualatex", "pdflatex"])'), "TeX engines must be allowlisted");
assert(api.includes("TEX_COMPILER_URL") && api.includes("TEX_COMPILER_TOKEN"), "Legacy compiler bridge must remain server-only");
assert(api.includes('redirect: "error"'), "Compiler bridge must reject redirects");
assert(api.includes("shell_escape: false"), "Compiler contract must disable shell escape");
assert(api.includes("network: false"), "Compiler contract must request network isolation");
assert(api.includes("isSameOriginMutation(request)"), "TeX writes must enforce same-origin requests");
assert(!/child_process|\bexecSync\b|\bexec\s*\(|\bspawn\s*\(/.test(api), "TeX Worker code must not expose local process execution");

assert(apiWrapper.includes('action === "versions"'), "TeX API wrapper must route version history requests");
assert(apiWrapper.includes("snapshotDocumentVersion"), "Document mutations must feed the smart version store");
assert(versionApi.includes('const VERSION_ROOT = "_system/tex-versions/"'), "TeX versions must use a hidden source-only R2 namespace");
assert(versionApi.includes("AUTOSAVE_WINDOW_MS"), "Version storage must coalesce rapid autosaves");
assert(versionApi.includes("pruneSmartVersions"), "Version storage must thin older autosave snapshots");
assert(versionApi.includes('action === "restore"'), "Version API must support rollback");
assert(versionApi.includes("purgeLegacyPdfResults"), "Version history must remove legacy persistent PDFs");
assert(!versionApi.includes('Content-Type", "application/pdf"'), "Version API must never persist PDF data");

// Touch-only iPad/Safari repair: the generated style and script must be
// isolated from fine-pointer desktop and work without HTML injection.
const { enhanceWorkTexMobileQa } = await import("../studio/ui-work-tex-mobile-qa.js");
const { WORK_TEX_EXPLORER_TREE } = await import("../studio/ui-work-tex-explorer-tree.js");
const responsive = enhanceWorkTexMobileQa("<main class='tex-work-app'></main>");
const css = responsive.split('<style id="aertex-tex-mobile-qa">')[1]?.split('</style>')[0] || "";
const script = responsive.split('<script id="aertex-tex-mobile-qa-runtime">')[1]?.split('</script>')[0] || "";
assert(css.includes("(max-width:1280px) and (pointer:coarse)"), "Layout changes must be touch only outside phone breakpoints.");
assert(css.includes("grid-template-columns:46px minmax(0,1fr) 46px"), "Collapsed tablet side rails must not overlap the editor.");
assert(css.includes("overflow-y:auto!important"), "Document tree must scroll independently.");
assert(css.includes(".tex-tree-file"), "Nested files must be aligned within their folders.");
assert(css.includes(".tex-editor-footer") && css.includes("display:none!important"), "Obsolete mobile footer must be hidden.");
assert(css.includes(".tex-editor-commandbar") && css.includes("overflow-x:auto!important"), "Toolbar must scroll horizontally instead of expanding the page.");
assert(css.includes("#tex-source:focus"), "Touch editor focus glow must be removed.");
assert(script.includes("__aertexMobileMarkdown"), "Mobile-only improved Markdown renderer missing.");
assert(!script.includes("toolbar.append(save)") && !script.includes("footer.prepend(save)"),
  "Touch resize must never move the live save status away from the project title");
new Function(script);
assert(!WORK_TEX_EXPLORER_TREE.includes("initialExpansionHandled") && WORK_TEX_EXPLORER_TREE.includes("if(openProjects.has(id))arrowNode.click();"), "All screen sizes start with closed folders except on explicit same-route reload.");
assert(WORK_TEX_EXPLORER_TREE.includes("sessionStorage") && WORK_TEX_EXPLORER_TREE.includes("wasReload"), "Reload must preserve opened projects and child folders.");
assert(WORK_TEX_EXPLORER_TREE.includes("sub.hidden=!openFolders.has(key)"), "Nested folders must remain closed unless a user explicitly expanded their folder.");
assert(WORK_TEX_EXPLORER_TREE.includes("pendingDocuments"), "First project expansion must reuse pending requests.");
assert(WORK_TEX_EXPLORER_TREE.includes("window.__aertexMobileMarkdown"), "Mobile Markdown preview must use the safe parser.");
assert(entry.includes("enhanceWorkTexMobileQa(enhanceTexProjectControls(markup, zh))"), "Only Work TeX pages should load the mobile repair.");
const fakeMedia = { matches: true, addEventListener(){} };
const fakeFooter = { prepend(n){n.parentElement=this;},insertBefore(n){n.parentElement=this;} };
const fakeSave = { parentElement: fakeFooter, nextSibling:null };
const fakeToolbar = { append(n){n.parentElement=this;} };
const fakeList = { addEventListener(){} };
const fakeRoot = { addEventListener(){}, querySelector(selector){return ({
  ".tex-editor-toolbar":fakeToolbar, ".tex-editor-footer":fakeFooter,
  ".tex-save-state":fakeSave, "#tex-document-list":fakeList
})[selector]||null;} };
const fakeWindow = { matchMedia:()=>fakeMedia };
const fakeDocument = { querySelector:s=>s===".tex-work-app"?fakeRoot:null };
const vm = await import("node:vm");
vm.runInNewContext(script,{window:fakeWindow,document:fakeDocument});
const markdown = fakeWindow.__aertexMobileMarkdown;
assert(typeof markdown==="function", "Markdown renderer must initialize on touch screens.");
const sampleMd = markdown(["# Title","","**bold** and "+String.fromCharCode(96)+"code"+String.fromCharCode(96),"","- item","- [x] done","","| key | value |","| --- | --- |","| a | b |","","```js","const x=1;","```"].join(String.fromCharCode(10)));
assert(sampleMd.includes("<h1>Title</h1>"), "Markdown headings should render.");
assert(sampleMd.includes("<strong>bold</strong>"), "Markdown emphasis should render.");
assert(sampleMd.includes("<table>") && sampleMd.includes("<td>b</td>"), "Markdown tables should render.");
assert(sampleMd.includes("<pre><code>const x=1;"), "Fenced code should render literally.");
assert(sampleMd.includes('type="checkbox"'), "Markdown task lists should render.");
assert(!markdown("<script>alert(1)</script>").includes("<script>"), "Markdown must escape raw HTML.");
const presenceSource = fs.readFileSync(new URL("../studio/ui-work-tex-realtime.js",import.meta.url),"utf8");
assert(presenceSource.includes("const people = new Map()") && presenceSource.includes("person?.id || person?.client_id"), "Online indicator must count unique accounts instead of connections.");

const { enhanceWorkTexMobileFollowup } = await import("../studio/ui-work-tex-mobile-followup.js");
const followup = enhanceWorkTexMobileFollowup("<main class='tex-work-app'></main>");
const touchCss = followup.split('<style id="aertex-tex-mobile-followup">')[1]?.split('</style>')[0] || "";
const touchScript = followup.split('<script id="aertex-tex-mobile-followup-runtime">')[1]?.split('</script>')[0] || "";
assert(touchCss.includes("span:not(.tex-project-chevron)"),"Folder label must not stretch its chevron.");
assert(touchCss.includes(".tex-shell.is-left-collapsed.is-right-collapsed"),"Two collapsed tablet rails need a 46px grid.");
assert(touchCss.includes("body.os-shell:has(.tex-work-app)"),"Touch-specific grid overrides must outrank old desktop rules.");
assert(touchCss.includes("tex-right-panel-restore-touch"),"Collapsed right sidebar must expose a reachable restore control.");
assert(touchCss.includes(".tex-work-app #tex-right-panel-restore-touch{display:none!important}"),
  "Never show a full-width recovery plus on portrait or desktop.");
assert(touchCss.includes("clamp(318px,32vw,390px)"),
  "Landscape preview must not be restricted to an unusable 208px width.");
assert(touchCss.includes(".aertex-pdf-toolbar"),
  "Landscape toolbar should scroll within PDF column rather than clipping editor.");
assert(touchScript.includes("event.stopImmediatePropagation()"),"Tapping project folder must not open main.tex.");
assert(touchScript.includes("window.__aertexAllowProjectActivation"),"Explicit cross-project file selection must remain possible.");
new Function(touchScript);
assert(WORK_TEX_EXPLORER_TREE.includes("window.__aertexAllowProjectActivation=true"),"Explicit file click must bypass folder-only mode.");
assert(entry.includes("enhanceWorkTexMobileFollowup(enhanceWorkTexMobileQa"),"Followup must only be injected on Work TeX.");
// First-compile onboarding must not mislead mobile users into installing Bridge.
const { enhanceWorkTexDeviceReadiness } = await import("../studio/ui-work-tex-device-readiness.js");
const deviceZh = enhanceWorkTexDeviceReadiness('<body><div class="tex-work-app"></div></body>', true);
const deviceEn = enhanceWorkTexDeviceReadiness('<body><div class="tex-work-app"></div></body>', false);
const deviceJs = deviceZh.split('<script id="tex-device-readiness-script">')[1]?.split('</script>')[0] || "";
assert(deviceZh.includes('id="tex-device-readiness-style"') &&
  deviceJs.includes("root.classList.add('is-tex-mobile')"),
  "Mobile workbench must suppress local compiler diagnostics.");
assert(deviceZh.includes("PDF 预览") &&
  deviceZh.includes("下载 TeX Live（ISO）") &&
  deviceZh.includes("安装 Windows 连接组件"),
  "Chinese mobile text and Windows installer actions missing.");
assert(deviceEn.includes("PDF Preview") &&
  deviceEn.includes("Download TeX Live (ISO)"),
  "English fallback must provide equivalent device guidance.");
assert(deviceJs.includes("qsseda:tex-compiler-probed") &&
  deviceJs.includes("panel.hidden=Boolean(data.localSupported)"),
  "Windows installer UI must respond to a completed probe and hide when ready.");
assert(deviceJs.includes("navigator.maxTouchPoints") &&
  deviceJs.includes("/Windows NT/i.test(ua)&&!mobile"),
  "iPadOS desktop user agents and Windows devices must be distinguished.");
assert(deviceJs.includes("https://qsseda.com/zh-cn/work/local") &&
  deviceJs.includes("https://qsseda.com/api/work/bridge/windows"),
  "Setup links must remain on the existing AERTEX main site.");
assert(deviceZh.includes(".tex-work-app.is-tex-mobile .tex-compiler-card") &&
  deviceZh.includes(".tex-live-preview-foot>span"),
  "Mobile redundant Bridge status and refresh-cadence copy must be hidden.");
new Function(deviceJs);
const localWorkSource = fs.readFileSync(new URL("../studio/ui-tex-local.js",import.meta.url),"utf8");
assert(localWorkSource.includes("mobileDevice ? Promise.resolve() : probeLocal()") &&
  localWorkSource.includes("probesReady = true;") &&
  localWorkSource.includes("window.__aertexTexCompilerProbe = result;"),
  "Mobile must skip impossible Bridge probing while Windows sees a settled readiness result.");
assert(localWorkSource.includes("const showTitleBuildResult = !previewOnly || previewUserEdited") &&
  localWorkSource.includes("if (showTitleBuildResult && snapshot === currentPreviewSnapshot())") &&
  localWorkSource.includes("if (event?.detail?.userInitiated === true) previewUserEdited = true") &&
  localWorkSource.includes("source.addEventListener('input', () => {") &&
  localWorkSource.includes("previewUserEdited = true;"),
  "Refreshing an untouched TeX project may preview in the background, but must not display a misleading title failure badge; edits must still report build status.");
assert(entry.includes("enhanceWorkTexDeviceReadiness(enhanceWorkTexMobileFollowup("),
  "Device guidance must be scoped to the Work TeX route.");
console.log("TeX Workbench checks passed.");
function assert(condition, message) { if (!condition) throw new Error(message); }
