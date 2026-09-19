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
  'const GPT_ORIGIN = "https://gpt.qsseda.studio"',
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
assert(session.includes('const GPT_HOST = "gpt.qsseda.studio"'), "Session gate must recognize GPT as an isolated host");
assert(session.includes("isolatedAppHost && !accountId"), "Isolated GPT session must require the domain-wide account marker");
assert(authHandoff.includes('const GPT_HOST = "gpt.qsseda.studio"'), "Auth handoff must recognize the GPT host");
assert(authHandoff.includes('gptTarget ? "QssedA GPT"'), "Auth handoff must render the GPT product handoff");
assert(authHandoff.includes('return candidateLocale === "zh" ? "/zh-cn" : "/en"'), "GPT handoff must constrain return paths to GPT locale roots");

console.log("GPT authentication handoff looks valid.");
