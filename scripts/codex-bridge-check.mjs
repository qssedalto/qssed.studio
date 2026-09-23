import fs from "node:fs";
import { renderGptApp } from "../studio/gpt-ui.js";

const bridge = fs.readFileSync(new URL("../local-bridge/codex-server.mjs", import.meta.url), "utf8");
const worker = fs.readFileSync(new URL("../gpt-worker.js", import.meta.url), "utf8");
const proxy = fs.readFileSync(new URL("../studio/gpt-bridge.js", import.meta.url), "utf8");
const installer = fs.readFileSync(new URL("../local-bridge/install-codex-windows.ps1", import.meta.url), "utf8");
const launcher = fs.readFileSync(new URL("../local-bridge/start-codex-windows.ps1", import.meta.url), "utf8");
const wranglerText = fs.readFileSync(new URL("../wrangler.gpt.jsonc", import.meta.url), "utf8");
const wrangler = JSON.parse(wranglerText.replace(/^\s*\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, ""));
const zh = renderGptApp("zh-cn");
const en = renderGptApp("en");

for (const required of [
  'const HOST = "127.0.0.1"',
  'const PORT = 32146',
  '"https://gpt.qsseda.com"',
  '"https://gpt.qsseda.online"',
  '"https://gpt.qsseda.studio"',
  'QSSEDA_CODEX_BRIDGE_TOKEN',
  'spawn(CODEX_COMMAND, ["app-server"]',
  'shell: false',
  'CODEX_HOME',
  '"account/read"',
  '"account/login/start"',
  'chatgptDeviceCode',
  '"model/list"',
  '"account/rateLimits/read"',
  '"thread/start"',
  '"turn/start"',
  '"item/agentMessage/delta"',
  'approvalPolicy: "never"',
  'type: "readOnly"',
  'readableRoots: [CHAT_ROOT]',
  'ALLOWED_HOSTS.has(host)',
  'authorization',
  'Bearer'
]) assert(bridge.includes(required), "Codex bridge is missing invariant: " + required);

assert(!bridge.includes("chatgptAuthTokens"), "Bridge must not manage raw ChatGPT auth tokens");
assert(!bridge.includes("shell: true"), "Bridge must never spawn Codex through a shell");
assert(!bridge.includes("command/exec"), "Bridge must not expose command execution");
assert(!bridge.includes("process/spawn"), "Bridge must not expose generic process spawning");

for (const required of [
  'GPT_CODEX_BRIDGE_URL',
  'GPT_CODEX_BRIDGE_TOKEN',
  'authorization',
  'Bearer',
  '"/api/gpt/status"',
  '"gpt_offline"',
  'statusProbe ? 4500 : 120000',
  'url.protocol !== "https:"'
]) assert(proxy.includes(required), "Remote bridge proxy is missing invariant: " + required);

assert(!proxy.includes("127.0.0.1:32146"), "Worker proxy must never target browser loopback");
assert(!proxy.includes("access_token"), "Worker proxy must not handle ChatGPT access tokens");
assert(!proxy.includes("refresh_token"), "Worker proxy must not handle ChatGPT refresh tokens");

for (const markup of [zh, en]) {
  assert(markup.includes('raw("/status")'), "Intelligence UI must probe backend status");
  assert(markup.includes("Intelligence 离线") || markup.includes("Intelligence offline"), "Intelligence UI must expose offline state");
  assert(markup.includes("setInterval(checkStatus,5000)"), "Intelligence UI must refresh online state automatically");
  assert(markup.includes('fetch("/api/gpt/turn"'), "Intelligence UI must stream through the authenticated Worker");
  assert(markup.includes("/login/device"), "Intelligence UI is missing ChatGPT device login");
  assert(markup.includes("/models"), "Intelligence UI is missing model discovery");
  assert(!markup.includes("127.0.0.1:32146"), "Cross-device UI must not call loopback directly");
  assert(!markup.includes("targetAddressSpace"), "Cross-device UI must not use browser private-network access");
  assert(!markup.includes("access_token"), "Intelligence UI must never handle ChatGPT access tokens");
}

const scripts = [...zh.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
assert(scripts.length === 1, "Intelligence UI should contain one application script");
for (const script of scripts) new Function(script);

assert(worker.includes("handleRemoteCodexApi"), "Intelligence Worker must route through the remote local bridge proxy");
assert(worker.includes("verifyStudioPageSession(request)"), "GPT API must remain behind AERTEX authentication");
assert(!worker.includes("CodexCloudContainer"), "Intelligence Worker must not depend on Cloudflare Containers");
assert(worker.includes("connect-src 'self'"), "GPT page networking must remain same-origin");

assert(!wrangler.containers, "GPT Wrangler config must not require Cloudflare Containers");
assert(!wrangler.durable_objects, "GPT Wrangler config must not require Durable Objects");
assert(Array.isArray(wrangler.migrations) && wrangler.migrations.length === 2, "GPT Wrangler config must preserve the full Durable Object migration history");
assert(wrangler.migrations[0]?.tag === "gpt-cloud-v1" && wrangler.migrations[0]?.new_sqlite_classes?.includes("CodexCloudContainer"), "GPT migration history must retain the original CodexCloudContainer creation");
assert(wrangler.migrations[1]?.tag === "gpt-cloud-v2-remove-container" && wrangler.migrations[1]?.deleted_classes?.includes("CodexCloudContainer"), "GPT migration history must delete CodexCloudContainer after its original creation");

for (const required of [
  "LOCALAPPDATA",
  "QssedA\\CodexBridge",
  "Get-Command codex",
  "Get-Command cloudflared",
  "bridge-token.dpapi",
  "tunnel-token.dpapi",
  "ConvertFrom-SecureString",
  "CurrentVersion\\Run",
  "start-codex-windows.ps1"
]) assert(installer.includes(required), "Windows installer is missing: " + required);

assert(installer.includes("HKCU:"), "Installer must use per-user autostart");
assert(!installer.includes("HKLM:"), "Installer must not require machine-wide persistence");
assert(launcher.includes("TUNNEL_TOKEN"), "Launcher must pass the remotely-managed Tunnel token through the environment");
assert(launcher.includes("Start-Process -FilePath $cloudflaredPath"), "Launcher must start cloudflared");
assert(launcher.includes("WindowStyle Hidden"), "Bridge and Tunnel should run hidden after Windows login");

console.log("Remote local Codex provider checks passed.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
