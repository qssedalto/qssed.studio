import fs from "node:fs";
import vm from "node:vm";
import { enhanceWorkTexPreviewSession } from "../studio/ui-work-tex-preview-session.js";
import { enhanceWorkTexDesktopTypography } from "../studio/ui-work-tex-desktop-type.js";
import { workHubContent, workLocalBridgeContent } from "../studio/ui-work.js";
import { enhanceWorkLocalBridgeNative } from "../studio/ui-work-native.js";
import { texWorkbenchContent } from "../studio/ui-tex-workbench.js";
import { enhanceTexWorkbenchLocal } from "../studio/ui-tex-local.js";

const config = fs.readFileSync(new URL("../studio/config.js", import.meta.url), "utf8");
const entry = fs.readFileSync(new URL("../studio/entry.js", import.meta.url), "utf8");
const routing = fs.readFileSync(new URL("../studio/routing.js", import.meta.url), "utf8");
const worker = fs.readFileSync(new URL("../worker.js", import.meta.url), "utf8");
const workApi = fs.readFileSync(new URL("../studio/work-api.js", import.meta.url), "utf8");
const bridge = fs.readFileSync(new URL("../local-bridge/server.mjs", import.meta.url), "utf8");
const nativeBridge = fs.readFileSync(new URL("../local-bridge/original-engine/main_windows.go", import.meta.url), "utf8");
const installer = fs.readFileSync(new URL("../local-bridge/installer/AERTEX-Bridge.iss", import.meta.url), "utf8");
const nativeWorkflow = fs.readFileSync(new URL("../.github/workflows/local-bridge-native.yml", import.meta.url), "utf8");
const windowsInstall = fs.readFileSync(new URL("../local-bridge/install-windows.ps1", import.meta.url), "utf8");
const windowsStart = fs.readFileSync(new URL("../local-bridge/start-windows.ps1", import.meta.url), "utf8");
const windowsUninstall = fs.readFileSync(new URL("../local-bridge/uninstall-windows.ps1", import.meta.url), "utf8");
const windowsCmd = fs.readFileSync(new URL("../local-bridge/install-windows.cmd", import.meta.url), "utf8");
const zhHub = workHubContent(true);
const zhLocal = workLocalBridgeContent(true);
const enLocal = workLocalBridgeContent(false);
const zhNativeLocal = enhanceWorkLocalBridgeNative(zhLocal, true);
const enNativeLocal = enhanceWorkLocalBridgeNative(enLocal, false);
const zhTexLocal = enhanceTexWorkbenchLocal(texWorkbenchContent(true), true);

for (const route of ["/work", "/work/local", "/work/tex"]) {
  assert(config.includes(`"${route}"`), `${route} is missing from protected main-site routes`);
  assert(entry.includes(`pathname === "${route}"`), `${route} is not mounted in the main-site entry`);
}

assert(entry.includes("decorateWorkNavigation"), "Main-site shell does not inject the Work navigation group");
assert(entry.includes("enhanceWorkLocalBridgeNative"), "Native Bridge installer experience is not mounted");
assert(entry.includes("enhanceTexWorkbenchLocal"), "TeX Workbench is not enhanced with local compilation");
assert(entry.includes('pathname === "/work/tex"') && entry.includes("allowLoopback"), "Work TeX must enable scoped loopback CSP access");
assert(zhHub.includes("/zh-cn/work/local"), "Chinese Work hub is missing the local bridge entry");
assert(zhLocal.includes("http://127.0.0.1:32145"), "Local bridge page must use the fixed loopback endpoint");
assert(zhLocal.includes("targetAddressSpace: \"loopback\""), "Local bridge request should identify the loopback target address space");
assert(zhLocal.includes("credentials: \"omit\""), "Local bridge requests must not send browser credentials");
assert(!zhLocal.includes("Authorization"), "Local bridge page must not send a bearer Authorization header");
assert(enLocal.includes("/tex/status"), "Local bridge page is missing the TeX status probe");
assert(zhNativeLocal.includes("/api/work/bridge/windows"), "Native Windows Bridge download is missing from the Work page");
const texliveUrl = "https://1drv.ms/u/c/45a22b56b9646fc7/IQDExSUns1FzR6M3luj0QRQaAZ8Pc6frUc6zaYEr-Qnexvo?e=w9mHFn";
for (const markup of [zhNativeLocal, enNativeLocal]) {
  assert(markup.includes(`id="work-native-texlive-download" href="${texliveUrl}"`), "TeX Live ISO button must link to the configured OneDrive location");
  assert(markup.includes('target="_blank" rel="noopener noreferrer"'), "TeX Live ISO must open in a secure new tab");
  assert(markup.includes("window.confirm(warning)") && markup.includes("event.preventDefault()"), "TeX Live ISO download must require confirmation and permit cancel");
  assert(markup.indexOf('id="work-native-texlive-download"') > markup.indexOf('id="work-native-bridge-download"'), "TeX Live ISO button must be placed next to the Windows installer");
  assert(markup.includes('id="work-native-texlive-group"') && markup.includes('class="work-texlive-prerequisite"'), "TeX Live prerequisite note must be under its ISO button");
  assert(markup.includes('id="work-native-texlive-guide" href="https://qsseda.com/'), "TeX Live help link must open the main-site FAQ.");
  assert(markup.includes('/q/ac429c78-7e82-4cea-9b12-90188b0c0c60"'), "TeX Live help link must target the newly published question.");
  assert(markup.indexOf('id="work-native-texlive-guide"') > markup.indexOf('id="work-native-texlive-download"'), "TeX Live help link must be adjacent to the ISO button.");
  assert(markup.includes("work-texlive-action-row") && markup.includes("color:#007aff"), "Help link must remain blue beside the button.");
  assert(markup.includes("font-size:11px") && markup.includes("work-texlive-download-group[hidden]"), "Prerequisite note must remain small and hide with the Windows-only control");
  assert(markup.includes("texliveGroup.hidden = !isWindows"), "Prerequisite note must not remain visible outside Windows");
}
assert(zhNativeLocal.includes("下载 TeX Live（ISO）") && zhNativeLocal.includes("额外的网络环境"), "Chinese TeX Live button and network warning are missing");
assert(enNativeLocal.includes("Download TeX Live (ISO)") && enNativeLocal.includes("additional network access"), "English TeX Live button and network warning are missing");
assert(zhNativeLocal.includes("此为 Windows 连接组件使用的前置条件，请先安装完此内容再打开 Windows 连接组件。"), "Chinese TeX Live prerequisite caption is missing");
assert(enNativeLocal.includes("This is a prerequisite for the Windows connection component."), "English TeX Live prerequisite caption is missing");
assert(zhNativeLocal.includes('id="work-native-texlive-guide" href="https://qsseda.com/zh-cn/q/ac429c78-7e82-4cea-9b12-90188b0c0c60"'), "Chinese setup guide must use the Chinese FAQ route.");
assert(enNativeLocal.includes('id="work-native-texlive-guide" href="https://qsseda.com/en-us/q/ac429c78-7e82-4cea-9b12-90188b0c0c60"'), "English setup guide must use the English FAQ route.");
assert(!zhNativeLocal.includes('class="work-panel"') && !enNativeLocal.includes('class="work-panel"'), "Native Bridge must not render the deleted capabilities/privacy cards");
assert(zhNativeLocal.includes("安装前必读：组件使用指南") && zhNativeLocal.includes('id="work-bridge-upgrade-note"'), "Windows setup FAQ and obsolete-version warning must remain available after cards are removed");
assert(zhNativeLocal.includes("window.setTimeout(() => void probe(), 260)"), "Work page should probe localhost automatically on load");
assert(zhNativeLocal.includes('id="work-mobile-local-note"') &&
  zhNativeLocal.includes("work-native-mobile-copy-script") &&
  zhNativeLocal.includes("work.qsseda.com/"),
  "Mobile visitors to Work/local need a useful TeX redirect rather than a dead Bridge dashboard.");
assert(zhNativeLocal.includes("is-mobile-local #work-local-status-card") &&
  zhNativeLocal.includes("is-mobile-local #work-local-connect"),
  "Mobile Work/local must hide unavailable desktop connection diagnostics.");
assert(zhNativeLocal.includes('if (!(/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent') &&
  zhNativeLocal.includes("window.setTimeout(() => void probe(), 260)"),
  "Local Bridge should auto-probe on Windows, not ask iPadOS for an unavailable service.");


for (const required of [
  "http://127.0.0.1:32145",
  "'/tex/compile'",
  "credentials: 'omit'",
  "targetAddressSpace: 'loopback'",
  "tex.compile",
  "本机 TeX 已连接",
  "source: sourceText",
  "tex-live-preview-frame",
  "PDF 实时预览",
  "markPreviewDirty(1500)",
  "schedulePreview(delay = 1500)",
  "No polling or compilation during continuous typing.",
  "lastPreviewSnapshot",
  "当前源码编译失败，已保留上一版 PDF"
]) assert(zhTexLocal.includes(required), `Local TeX Workbench is missing: ${required}`);
assert(!zhTexLocal.includes("Authorization"), "Local TeX compilation must not send browser bearer credentials to localhost");
assert(zhTexLocal.includes("previewOnly") && zhTexLocal.includes("if (!previewOnly)"), "Automatic preview jobs must stay separate from manual compile history");
assert(zhTexLocal.includes("snapshot !== currentPreviewSnapshot()"), "Live preview must discard stale compile results");
assert(zhTexLocal.includes("URL.revokeObjectURL(previewUrl)"), "Live preview must release replaced PDF object URLs");

const scripts = [...zhNativeLocal.matchAll(/<script>([\s\S]*?)<\/script>/g), ...enNativeLocal.matchAll(/<script>([\s\S]*?)<\/script>/g), ...zhTexLocal.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
assert(scripts.length > 1, "Work and TeX local bridge pages must include client scripts");
for (const script of scripts) new Function(script);

assert(routing.includes("allowLoopback"), "HTML security headers do not provide a scoped loopback mode");
assert(routing.includes("http://127.0.0.1:32145"), "Loopback CSP source is missing");
assert(routing.includes("http://localhost:32145"), "localhost CSP source is missing");
assert(routing.includes('allowLoopback ? "frame-src blob:" : "frame-src \'none\'"'), "Loopback pages must allow only blob PDF frames while ordinary pages keep frames disabled");
assert(routing.includes("upgrade-insecure-requests") && routing.includes("!allowLoopback"), "Loopback pages must opt out of CSP HTTP auto-upgrade without weakening other pages");

for (const required of [
  'const HOST = "127.0.0.1"',
  'const PORT = 32145',
  '"qsseda-local-bridge"',
  '"/health"',
  '"/tex/status"',
  'shell: false',
  'access-control-allow-private-network'
]) assert(bridge.includes(required), `Legacy local bridge server is missing required guard: ${required}`);
assert(!bridge.includes("request.body"), "Legacy pilot bridge must not expose a request-body command channel");
assert(!bridge.includes("exec("), "Legacy pilot bridge must not use generic exec()");
assert(!bridge.includes("shell: true"), "Legacy pilot bridge must never spawn through a shell");

for (const required of [
  "%LOCALAPPDATA%",
  "CurrentVersion\\Run",
  "AERTEX Bridge",
  "node.exe",
  "xelatex.exe",
  "start-windows.ps1"
]) assert(windowsInstall.includes(required.replace("%LOCALAPPDATA%", "LOCALAPPDATA")) || windowsInstall.includes(required), `Legacy Windows installer is missing: ${required}`);
assert(windowsInstall.includes("HKCU:"), "Legacy Windows installer must use per-user autostart instead of a machine-wide key");
assert(!windowsInstall.includes("HKLM:"), "Legacy Windows installer must not request machine-wide registry persistence");
assert(windowsStart.includes("WindowStyle Hidden"), "Legacy Windows launcher should keep the background bridge hidden");
assert(windowsStart.includes("http://127.0.0.1:32145/health"), "Legacy Windows launcher must check the fixed local bridge health endpoint");
assert(windowsStart.includes("Start-Process") && windowsStart.includes("server.mjs"), "Legacy Windows launcher must start the fixed bridge server");
assert(windowsUninstall.includes("Remove-ItemProperty") && windowsUninstall.includes("CurrentVersion\\Run"), "Legacy Windows uninstaller must remove only the per-user autostart registration");
assert(windowsCmd.includes("install-windows.ps1"), "Legacy double-click installer must invoke the PowerShell installer");

for (const required of [
  'bridgeHost       = "127.0.0.1"',
  'bridgePort       = "32145"',
  '"https://qsseda.com"',
  '"https://www.qsseda.com"',
  '"https://qsseda.studio"',
  '"https://www.qsseda.studio"',
  'HandleFunc("/health"',
  'HandleFunc("/tex/status"',
  'HandleFunc("/tex/compile"',
  '"tex.compile"',
  '"-no-shell-escape"',
  '"openin_any=p"',
  '"openout_any=p"',
  'http.MaxBytesReader',
  'os.MkdirTemp',
  'context.WithTimeout',
  'HideWindow: true',
  'CurrentVersion',
  '"--background"'
]) assert(nativeBridge.includes(required), `Native Windows bridge is missing required guard: ${required}`);
assert(nativeBridge.includes('if r.Method == http.MethodPost && origin == ""'), "Native action requests must require a browser Origin");
assert(nativeBridge.includes('"xelatex":  true') && nativeBridge.includes('"pdflatex": true'), "Native Bridge must use an explicit local TeX engine allowlist");
assert(!nativeBridge.includes('"lualatex": true'), "LuaLaTeX must stay disabled locally until a stronger native sandbox is added");
assert(!nativeBridge.includes("cmd.exe"), "Native Bridge must not invoke cmd.exe");
assert(!nativeBridge.includes("powershell.exe"), "Native Bridge must not depend on PowerShell");
assert(!nativeBridge.includes("node.exe"), "Native Bridge must not depend on Node.js");

assert(worker.includes('pathname.startsWith("/api/work/")'), "Worker is missing the Work API boundary");
assert(!workApi.includes("verifyStudioApiSession") && !workApi.includes("withStudioSessionCookies"), "Public Bridge installer must not require a login or issue session cookies");
assert(workApi.includes('if (action !== "bridge/windows")'), "Anonymous installer access must remain scoped to the fixed release route");
assert(workApi.includes("_system/releases/local-bridge/windows-amd64/QssedA-Local-Bridge.exe"), "Bridge download must read the fixed hidden R2 release key");
assert(workApi.includes("application/vnd.microsoft.portable-executable"), "Bridge download must use an executable content type");
assert(nativeWorkflow.includes("runs-on: windows-latest"), "Native Bridge installer must build and test on Windows.");
assert(nativeWorkflow.includes("AERTEX-Bridge-Setup.exe"), "Bridge release must be an actual Setup EXE, not a portable daemon.");
assert(nativeWorkflow.includes("smoke-windows:") && nativeWorkflow.includes("needs: [build-installer, smoke-windows]"),
  "Uploading to R2 must be gated on actual Windows installation and uninstall tests.");
assert(installer.includes("DefaultDirName={localappdata}\\QssedA\\LocalBridge"), "Installer must install to a fixed per-user directory.");
assert(installer.includes('ValueName: "AERTEX Bridge"') && installer.includes('ValueData: """{app}\\AERTEX-Bridge.exe"" --background"'),
  "Installer must register mandatory Windows user login autostart.");
assert(installer.includes("CreateUninstallRegKey=yes") && installer.includes("[UninstallRun]"),
  "Installer must register a Windows uninstaller that stops the background process.");
assert(nativeWorkflow.includes("-H=windowsgui"), "Native Bridge build should not open a console window for ordinary users");
assert(nativeWorkflow.includes("wrangler@4.136.3 r2 object put"), "Native Bridge workflow must publish the built EXE to R2 with the pinned Wrangler version");


const cachedPreviewMarkup = enhanceWorkTexPreviewSession("", true);
const previewScriptStart = '<script id="qsseda-work-tex-preview-session">';
const previewScriptOffset = cachedPreviewMarkup.indexOf(previewScriptStart);
const cachedPreviewRuntime = previewScriptOffset >= 0
  ? cachedPreviewMarkup.slice(previewScriptOffset + previewScriptStart.length,
    cachedPreviewMarkup.indexOf('</script>', previewScriptOffset))
  : "";
assert(cachedPreviewRuntime, "The preview refresh protection script must load");
assert(cachedPreviewRuntime.includes("clearPreviewCache();") &&
  !cachedPreviewRuntime.includes("if (mobilePreviewClient) void restoreImmediately();"),
  "No browser may resurrect an old PDF automatically before fresh compilation");
new vm.Script(cachedPreviewRuntime);
const perfMarkup = enhanceWorkTexDesktopTypography("<section class='tex-work-app'></section>");
const perfScript = perfMarkup.match(/<script id="qsseda-work-tex-runtime-performance">([\\s\\S]*?)<\\/script>/)?.[1] || "";
assert(perfScript && !perfScript.includes("cachedPdfResponse(") &&
  !perfScript.includes("restorePreview(root)") && !perfScript.includes("cachePdfResponse("),
  "Legacy browser PDF CacheStorage must not intercept Bridge compile or prepaint stale PDF");
new vm.Script(perfScript);

const oldPdf = new Blob(["%PDF-1.7\\n% previous preview may have missing CJK glyphs"], { type: "application/pdf" });
const cachedState = {
  __qssedaTexPreviewBlobV2: { version: 2, userId: "same-user", blob: oldPdf,
    documentId: "project-id", engine: "xelatex", sourceHash: "old-source" },
  someOtherHistoryState: "preserve"
};
let removedSession = false;
let restoredSrcCount = 0;
const staleFrame = { hidden: true, get src() { return ""; }, set src(_value) { restoredSrcCount++; } };
const fakeRoot = { dataset: { texCollaborationDocumentId: "project-id" } };
const fakeWindow = {
  history: { state: cachedState, replaceState(next) { this.state = next; } },
  sessionStorage: { removeItem(key) { if (key === "qsseda.tex.preview-session.v2") removedSession = true; } },
  addEventListener() {},
  setTimeout() {}
};
const fakeDocument = {
  title: "Work TeX",
  querySelector(selector) { return selector.includes("[data-tex-root]") ? fakeRoot : null; },
  getElementById(id) { return id === "tex-live-preview-frame" ? staleFrame : null; }
};
class FakeMutationObserver { observe() {} disconnect() {} }
vm.runInNewContext(cachedPreviewRuntime, {
  window: fakeWindow, document: fakeDocument, Blob,
  MutationObserver: FakeMutationObserver, URL,
});
assert(restoredSrcCount === 0 && staleFrame.hidden,
  "An unverified cached PDF must never flash on reload before full compilation");
assert(removedSession && fakeWindow.history.state.someOtherHistoryState === "preserve" &&
  !("__qssedaTexPreviewBlobV2" in fakeWindow.history.state),
  "The refresh must clear stale preview blobs without removing unrelated history state");

console.log("Work localhost bridge checks passed.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
