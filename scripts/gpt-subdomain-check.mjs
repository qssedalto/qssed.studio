import fs from "node:fs";

const read = path => fs.readFileSync(path, "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const gpt = read("gpt-worker.js");
const main = read("worker.js");
const handoff = read("studio/gpt-subdomain.js");
const session = read("studio/session-gate.js");
const authHandoff = read("studio/auth-handoff.js");
const gptWrangler = JSON.parse(read("wrangler.gpt.jsonc").replace(/^\s*\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, ""));

for (const required of [
  'verifyStudioPageSession(request)',
  'gptSessionRedirect(pathname)',
  'pathname === "/auth/handoff"',
  'handleAuthHandoff(request, env, locale)'
]) {
  assert(gpt.includes(required), `GPT worker is missing authenticated routing invariant: ${required}`);
}

for (const required of [
  'isMainGptHandoffPath(pathname)',
  'handleMainGptHandoff(request)'
]) {
  assert(main.includes(required), `Main worker is missing GPT handoff invariant: ${required}`);
}

for (const required of [
  'const GPT_ORIGIN = "https://gpt.qsseda.com"',
  'new URL("/continue", AUTH_ORIGIN)',
  'action="${GPT_ORIGIN}/auth/handoff"',
  'name="access_token"',
  'name="refresh_token"',
  'verifyStudioPageSession(request)'
]) {
  assert(handoff.includes(required), `GPT handoff is missing secure transfer invariant: ${required}`);
}

assert(!handoff.includes("access_token="), "GPT handoff must not place access tokens in a URL");
assert(!handoff.includes("refresh_token="), "GPT handoff must not place refresh tokens in a URL");
assert(session.includes('const GPT_HOST = "gpt.qsseda.com"'), "Session gate must recognize GPT as an isolated host");
assert(session.includes("isolatedAppHost && !accountId"), "Isolated GPT session must require the domain-wide account marker");
assert(authHandoff.includes('const GPT_HOST = "gpt.qsseda.com"'), "Auth handoff must recognize the GPT host");
assert(authHandoff.includes('gptTarget ? "QssedA GPT"'), "Auth handoff must render the GPT product handoff");
assert(authHandoff.includes('return candidateLocale === "zh" ? "/zh-cn" : "/en"'), "GPT handoff must constrain return paths to GPT locale roots");
for (const [host, zone] of [["gpt.qsseda.com","qsseda.com"],["gpt.qsseda.online","qsseda.online"],["gpt.qsseda.studio","qsseda.studio"]]) {
  assert(gptWrangler.routes?.some(route => route.pattern === `${host}/*` && route.zone_name === zone), `${host} exact Worker route must outrank the main-site wildcard route`);
  assert(gptWrangler.routes?.some(route => route.pattern === host && route.custom_domain === true), `${host} custom domain route is missing`);
}
assert(gpt.includes('host !== "gpt.qsseda.online" && host !== "gpt.qsseda.studio"'), "GPT aliases must canonicalize to gpt.qsseda.com");

console.log("GPT authentication handoff looks valid.");
