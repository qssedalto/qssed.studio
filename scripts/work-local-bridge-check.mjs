import fs from "node:fs";
import { workHubContent, workLocalBridgeContent } from "../studio/ui-work.js";
import { enhanceWorkLocalBridgeNative } from "../studio/ui-work-native.js";

const config = fs.readFileSync(new URL("../studio/config.js", import.meta.url), "utf8");
const entry = fs.readFileSync(new URL("../studio/entry.js", import.meta.url), "utf8");
const routing = fs.readFileSync(new URL("../studio/routing.js", import.meta.url), "utf8");
const worker = fs.readFileSync(new URL("../worker.js", import.meta.url), "utf8");
const workApi = fs.readFileSync(new URL("../studio/work-api.js", import.meta.url), "utf8");
const bridge = fs.readFileSync(new URL("../local-bridge/server.mjs", import.meta.url), "utf8");
const nativeBridge = fs.readFileSync(new URL("../local-bridge/native/main_windows.go", import.meta.url), "utf8");
const nativeWorkflow = fs.readFileSync(new URL("../.github/workflows/local-bridge-native.yml", import.meta.url), "utf8");
const windowsInstall = fs.readFileSync(new URL("../local-bridge/install-windows.ps1", import.meta.url), "utf8");
const windowsStart = fs.readFileSync(new URL("../local-bridge/start-windows.ps1", import.meta.url), "utf8");
const windowsUninstall = fs.readFileSync(new URL("../local-bridge/uninstall-windows.ps1", import.meta.url), "utf8");
const windowsCmd = fs.readFileSync(new URL("../local-bridge/install-windows.cmd", import.meta.url), "utf8");
const zhHub = workHubContent(true);
const zhLocal = workLocalBridgeContent(true);
const enLocal = workLocalBridgeContent(false);
const zhNativeLocal = enhanceWorkLocalBridgeNative(zhLocal, true);

for (const route of ["/work", "/work/local"]) {
  assert(config.includes(`"${route}"`), `${route} is missing from protected Studio routes`);
  assert(entry.includes(`pathname === "${route}"`), `${route} is not mounted in Studio entry`);
}

assert(entry.includes("decorateWorkNavigation"), "Studio shell does not inject the Work navigation group");
assert(entry.includes("enhanceWorkLocalBridgeNative"), "Native Bridge installer experience is not mounted");
assert(zhHub.includes("/zh-cn/work/local"), "Chinese Work hub is missing the local bridge entry");
assert(zhLocal.includes("http://127.0.0.1:32145"), "Local bridge page must use the fixed loopback endpoint");
assert(zhLocal.includes("targetAddressSpace: \"loopback\""), "Local bridge request should identify the loopback target address space");
assert(zhLocal.includes("credentials: \"omit\""), "Local bridge requests must not send browser credentials");
assert(!zhLocal.includes("Authorization"), "Local bridge page must not send a bearer Authorization header");
assert(enLocal.includes("/tex/status"), "Local bridge page is missing the TeX status probe");
assert(zhNativeLocal.includes("/api/work/bridge/windows"), "Native Windows Bridge download is missing from the Work page");
assert(zhNativeLocal.includes("不要求安装 Node.js"), "Native Bridge UI must explain that Node.js is not required");
assert(zhNativeLocal.includes("window.setTimeout(() => void probe(), 260)"), "Work page should probe localhost automatically on load");

const scripts = [...zhNativeLocal.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
assert(scripts.length > 0, "Local bridge page must include its client script");
for (const script of scripts) new Function(script);

assert(routing.includes("allowLoopback"), "HTML security headers do not provide a scoped loopback mode");
assert(routing.includes("http://127.0.0.1:32145"), "Loopback CSP source is missing");
assert(routing.includes("http://localhost:32145"), "localhost CSP source is missing");
assert(routing.includes("upgrade-insecure-requests") && routing.includes("!allowLoopback"), "Loopback page must opt out of CSP HTTP auto-upgrade without weakening other pages");

for (const required of [
  'const HOST = "127.0.0.1"',
  'const PORT = 32145',
  '"qsseda-local-bridge"',
  '"/health"',
  '"/tex/status"',
  'shell: false',
  'access-control-allow-private-network'
]) assert(bridge.includes(required), `Local bridge server is missing required guard: ${required}`);

assert(!bridge.includes("request.body"), "Pilot bridge must not expose a request-body command channel");
assert(!bridge.includes("exec("), "Pilot bridge must not use generic exec()");
assert(!bridge.includes("shell: true"), "Pilot bridge must never spawn through a shell");

for (const required of [
  "%LOCALAPPDATA%",
  "CurrentVersion\\Run",
  "QssedA Local Bridge",
  "node.exe",
  "xelatex.exe",
  "start-windows.ps1"
]) assert(windowsInstall.includes(required.replace("%LOCALAPPDATA%", "LOCALAPPDATA")) || windowsInstall.includes(required), `Windows installer is missing: ${required}`);
assert(windowsInstall.includes("HKCU:"), "Windows installer must use per-user autostart instead of a machine-wide key");
assert(!windowsInstall.includes("HKLM:"), "Windows installer must not request machine-wide registry persistence");
assert(windowsStart.includes("WindowStyle Hidden"), "Windows launcher should keep the background bridge hidden");
assert(windowsStart.includes("http://127.0.0.1:32145/health"), "Windows launcher must check the fixed local bridge health endpoint");
assert(windowsStart.includes("Start-Process") && windowsStart.includes("server.mjs"), "Windows launcher must start the fixed bridge server");
assert(windowsUninstall.includes("Remove-ItemProperty") && windowsUninstall.includes("CurrentVersion\\Run"), "Windows uninstaller must remove only the per-user autostart registration");
assert(windowsCmd.includes("install-windows.ps1"), "Double-click installer must invoke the PowerShell installer");

for (const required of [
  'bridgeHost    = "127.0.0.1"',
  'bridgePort    = "32145"',
  '"https://qsseda.studio"',
  '"https://www.qsseda.studio"',
  'HandleFunc("/health"',
  'HandleFunc("/tex/status"',
  'exec.CommandContext(ctx, path, "--version")',
  'HideWindow: true',
  'CurrentVersion\\\\Run',
  '"--background"'
]) assert(nativeBridge.includes(required), `Native Windows bridge is missing required guard: ${required}`);
assert(!nativeBridge.includes("cmd.exe"), "Native Bridge must not invoke cmd.exe");
assert(!nativeBridge.includes("powershell.exe"), "Native Bridge must not depend on PowerShell");
assert(!nativeBridge.includes("node.exe"), "Native Bridge must not depend on Node.js");

assert(worker.includes('pathname.startsWith("/api/work/")'), "Worker is missing the Work API boundary");
assert(workApi.includes("verifyStudioApiSession"), "Bridge download must require a Studio session");
assert(workApi.includes("_system/releases/local-bridge/windows-amd64/QssedA-Local-Bridge.exe"), "Bridge download must read the fixed hidden R2 release key");
assert(workApi.includes("application/vnd.microsoft.portable-executable"), "Bridge download must use an executable content type");
assert(nativeWorkflow.includes("GOOS: windows") && nativeWorkflow.includes("GOARCH: amd64"), "Native Bridge workflow must target Windows amd64");
assert(nativeWorkflow.includes("-H=windowsgui"), "Native Bridge build should not open a console window for ordinary users");
assert(nativeWorkflow.includes("wrangler@4 r2 object put"), "Native Bridge workflow must publish the built EXE to R2");

console.log("Work localhost bridge checks passed.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
