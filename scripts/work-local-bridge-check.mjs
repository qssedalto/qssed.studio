import fs from "node:fs";
import { workHubContent, workLocalBridgeContent } from "../studio/ui-work.js";

const config = fs.readFileSync(new URL("../studio/config.js", import.meta.url), "utf8");
const entry = fs.readFileSync(new URL("../studio/entry.js", import.meta.url), "utf8");
const routing = fs.readFileSync(new URL("../studio/routing.js", import.meta.url), "utf8");
const bridge = fs.readFileSync(new URL("../local-bridge/server.mjs", import.meta.url), "utf8");
const zhHub = workHubContent(true);
const zhLocal = workLocalBridgeContent(true);
const enLocal = workLocalBridgeContent(false);

for (const route of ["/work", "/work/local"]) {
  assert(config.includes(`"${route}"`), `${route} is missing from protected Studio routes`);
  assert(entry.includes(`pathname === "${route}"`), `${route} is not mounted in Studio entry`);
}

assert(entry.includes("decorateWorkNavigation"), "Studio shell does not inject the Work navigation group");
assert(zhHub.includes("/zh-cn/work/local"), "Chinese Work hub is missing the local bridge entry");
assert(zhLocal.includes("http://127.0.0.1:32145"), "Local bridge page must use the fixed loopback endpoint");
assert(zhLocal.includes("targetAddressSpace: \"loopback\""), "Local bridge request should identify the loopback target address space");
assert(zhLocal.includes("credentials: \"omit\""), "Local bridge requests must not send browser credentials");
assert(!zhLocal.includes("Authorization"), "Local bridge page must not send a bearer Authorization header");
assert(enLocal.includes("/tex/status"), "Local bridge page is missing the TeX status probe");

const scripts = [...zhLocal.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
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

console.log("Work localhost bridge checks passed.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
