import fs from "node:fs";
import { renderGptApp } from "../studio/gpt-ui.js";

const bridge = fs.readFileSync(new URL("../local-bridge/codex-server.mjs", import.meta.url), "utf8");
const worker = fs.readFileSync(new URL("../gpt-worker.js", import.meta.url), "utf8");
const installer = fs.readFileSync(new URL("../local-bridge/install-codex-windows.ps1", import.meta.url), "utf8");
const launcher = fs.readFileSync(new URL("../local-bridge/start-codex-windows.ps1", import.meta.url), "utf8");
const zh = renderGptApp("zh-cn");
const en = renderGptApp("en");

for (const required of [
  'const HOST = "127.0.0.1"',
  'const PORT = 32146',
  '"https://gpt.qsseda.studio"',
  'spawn(CODEX_COMMAND, ["app-server"]',
  'shell: false',
  'CODEX_HOME',
  '"account/read"',
  '"account/login/start"',
  'type: "chatgptDeviceCode"',
  '"model/list"',
  '"account/rateLimits/read"',
  '"thread/start"',
  '"turn/start"',
  '"item/agentMessage/delta"',
  'approvalPolicy: "never"',
  'sandbox: "readOnly"',
  'type: "readOnly"',
  'readableRoots: [CHAT_ROOT]',
  'access-control-allow-private-network'
]) assert(bridge.includes(required), `Codex bridge is missing required invariant: ${required}`);

assert(!bridge.includes('["app-server", "--listen"'), "QssedA must not expose Codex experimental WebSocket transport");
assert(!bridge.includes("shell: true"), "Codex bridge must never spawn through a shell");
assert(!bridge.includes("chatgptAuthTokens"), "QssedA must not manage raw ChatGPT auth tokens");
assert(!bridge.includes("command/exec"), "Browser bridge must not expose Codex command execution");
assert(!bridge.includes("process/spawn"), "Browser bridge must not expose generic process spawning");

for (const markup of [zh, en]) {
  assert(markup.includes("http://127.0.0.1:32146"), "GPT UI must use the fixed loopback Codex endpoint");
  assert(markup.includes('targetAddressSpace:"loopback"'), "GPT UI should identify the loopback target address space");
  assert(markup.includes('credentials:"omit"'), "GPT UI must not send QssedA browser credentials to localhost");
  assert(markup.includes("/codex/login/device"), "GPT UI is missing ChatGPT device login");
  assert(markup.includes("/codex/models"), "GPT UI is missing model discovery");
  assert(markup.includes("/codex/thread"), "GPT UI is missing thread creation");
  assert(markup.includes("/codex/turn"), "GPT UI is missing streamed turns");
  assert(!markup.includes("access_token"), "GPT UI must never handle ChatGPT access tokens");
}

const scripts = [...zh.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
assert(scripts.length === 1, "GPT UI should contain one application script");
for (const script of scripts) new Function(script);

assert(worker.includes('import { renderGptApp } from "./studio/gpt-ui.js"'), "GPT worker must render the dedicated GPT app");
assert(worker.includes("connect-src http://127.0.0.1:32146 http://localhost:32146"), "GPT CSP must allow only the fixed local Codex endpoints");

for (const required of [
  "LOCALAPPDATA",
  "QssedA\\CodexBridge",
  "Get-Command codex",
  "CurrentVersion\\Run",
  "start-codex-windows.ps1"
]) assert(installer.includes(required), `Codex installer is missing: ${required}`);
assert(installer.includes("HKCU:"), "Codex installer must use per-user autostart");
assert(!installer.includes("HKLM:"), "Codex installer must not require machine-wide persistence");
assert(launcher.includes("WindowStyle Hidden"), "Codex bridge launcher should run in the background");
assert(launcher.includes("QSSEDA_CODEX_BRIDGE_HOME"), "Codex bridge launcher must isolate its Codex home");

console.log("Codex local provider checks passed.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
