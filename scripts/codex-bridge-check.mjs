import fs from "node:fs";
import { renderGptApp } from "../studio/gpt-ui.js";

const localBridge = fs.readFileSync(new URL("../local-bridge/codex-server.mjs", import.meta.url), "utf8");
const cloudServer = fs.readFileSync(new URL("../cloud-codex/server.mjs", import.meta.url), "utf8");
const cloudController = fs.readFileSync(new URL("../studio/gpt-cloud.js", import.meta.url), "utf8");
const worker = fs.readFileSync(new URL("../gpt-worker.js", import.meta.url), "utf8");
const dockerfile = fs.readFileSync(new URL("../cloud-codex/Dockerfile", import.meta.url), "utf8");
const wranglerText = fs.readFileSync(new URL("../wrangler.gpt.jsonc", import.meta.url), "utf8");
const wrangler = JSON.parse(wranglerText.replace(/^\s*\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, ""));
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
  '"thread/start"',
  '"turn/start"',
  '"item/agentMessage/delta"',
  'approvalPolicy: "never"',
  'type: "readOnly"',
  'readableRoots: [CHAT_ROOT]'
]) assert(localBridge.includes(required), `Local Codex bridge is missing invariant: ${required}`);

assert(!localBridge.includes("chatgptAuthTokens"), "Local bridge must not manage ChatGPT auth tokens directly");
assert(!localBridge.includes("shell: true"), "Local bridge must never spawn Codex through a shell");

for (const required of [
  'const HOST = "0.0.0.0"',
  'spawn(CODEX_COMMAND, ["app-server"]',
  'shell: false',
  'cli_auth_credentials_store = "file"',
  '"/internal/auth/restore"',
  '"/internal/auth/export"',
  '"account/read"',
  'refreshToken: true',
  'type: "chatgptDeviceCode"',
  '"model/list"',
  '"account/rateLimits/read"',
  '"thread/start"',
  '"turn/start"',
  '"item/agentMessage/delta"',
  'approvalPolicy: "never"',
  'type: "readOnly"',
  'readableRoots: [CHAT_ROOT]'
]) assert(cloudServer.includes(required), `Cloud Codex server is missing invariant: ${required}`);

assert(!cloudServer.includes("chatgptAuthTokens"), "Cloud Codex must leave ChatGPT OAuth lifecycle to Codex");
assert(!cloudServer.includes("shell: true"), "Cloud Codex must never spawn through a shell");
assert(!cloudServer.includes("command/exec"), "Cloud Codex HTTP gateway must not expose command execution");
assert(!cloudServer.includes("process/spawn"), "Cloud Codex HTTP gateway must not expose generic process spawning");

for (const required of [
  'extends DurableObject',
  'const AUTH_KEY = "codex_auth_json"',
  'this.ctx.storage.put(AUTH_KEY',
  'this.ctx.storage.setAlarm',
  'this.ctx.container.start',
  'enableInternet: true',
  'getTcpPort(CONTAINER_PORT)',
  'env.GPT_CODEX.idFromName(INSTANCE_NAME)',
  'env.GPT_CODEX.get(id)',
  '"x-qsseda-user-id"',
  '"provider_owner_mismatch"'
]) assert(cloudController.includes(required), `Cloud Codex controller is missing invariant: ${required}`);

assert(!cloudController.includes("access_token"), "Cloud controller must not surface ChatGPT access tokens");
assert(!cloudController.includes("refresh_token"), "Cloud controller must not surface ChatGPT refresh tokens");

for (const markup of [zh, en]) {
  assert(markup.includes('fetch("/api/gpt" + path'), "GPT UI must use same-origin Cloud Codex API");
  assert(markup.includes('fetch("/api/gpt/turn"'), "GPT UI must stream turns through the GPT Worker");
  assert(markup.includes("/login/device"), "GPT UI is missing ChatGPT device login");
  assert(markup.includes("/models"), "GPT UI is missing model discovery");
  assert(markup.includes("/thread"), "GPT UI is missing thread creation");
  assert(!markup.includes("127.0.0.1:32146"), "Cloud Codex must be the default GPT provider");
  assert(!markup.includes("targetAddressSpace"), "Cloud GPT UI must not require loopback networking");
  assert(!markup.includes("access_token"), "GPT UI must never handle ChatGPT access tokens");
}

const scripts = [...zh.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
assert(scripts.length === 1, "GPT UI should contain one application script");
for (const script of scripts) new Function(script);

assert(worker.includes('handleCloudCodexApi'), "GPT worker must route the Cloud Codex API");
assert(worker.includes('verifyStudioPageSession(request)'), "Cloud Codex API must remain behind the QssedA session gate");
assert(worker.includes('export { CodexCloudContainer }'), "GPT worker must export the container-backed Durable Object class");
assert(worker.includes("connect-src 'self'"), "GPT CSP must limit chat networking to the authenticated GPT origin");

assert(wrangler.containers?.some(item =>
  item.class_name === "CodexCloudContainer" &&
  item.image === "./cloud-codex/Dockerfile" &&
  item.max_instances === 1
), "GPT Wrangler config must define one Cloud Codex container");
assert(wrangler.durable_objects?.bindings?.some(item =>
  item.name === "GPT_CODEX" && item.class_name === "CodexCloudContainer"
), "GPT Wrangler config must bind the Cloud Codex Durable Object");
assert(wrangler.migrations?.some(item =>
  Array.isArray(item.new_sqlite_classes) && item.new_sqlite_classes.includes("CodexCloudContainer")
), "GPT Wrangler config must migrate Cloud Codex with SQLite storage");

assert(dockerfile.includes("FROM node:22-bookworm-slim"), "Cloud Codex image must use the pinned Node base");
assert(dockerfile.includes("CODEX_VERSION=0.154.0"), "Cloud Codex image must pin the Codex package version");
assert(dockerfile.includes("USER node"), "Cloud Codex container must run as a non-root user");

for (const required of [
  "LOCALAPPDATA",
  "QssedA\\CodexBridge",
  "Get-Command codex",
  "CurrentVersion\\Run",
  "start-codex-windows.ps1"
]) assert(installer.includes(required), `Local Codex installer is missing: ${required}`);
assert(installer.includes("HKCU:"), "Local Codex installer must use per-user autostart");
assert(!installer.includes("HKLM:"), "Local Codex installer must not require machine-wide persistence");
assert(launcher.includes("WindowStyle Hidden"), "Local Codex launcher should run in the background");

console.log("Cloud and local Codex provider checks passed.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
