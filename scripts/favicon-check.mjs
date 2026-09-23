import fs from "node:fs";

const read = path => fs.readFileSync(path, "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const favicon = read("studio/favicon.js");
const uiPage = read("studio/ui-page.js");
const gptUi = read("studio/gpt-ui.js");
const worker = read("worker.js");
const gptWorker = read("gpt-worker.js");
const authWorker = read("auth-worker.js");
const workHandoff = read("studio/work-subdomain.js");
const gptHandoff = read("studio/gpt-subdomain.js");
const authSso = read("auth-sso.js");

assert(favicon.includes('viewBox="0 0 64 64"'), "Favicon must keep a 64x64 vector viewBox");
assert(favicon.includes('"/favicon.svg"') && favicon.includes('"/favicon.ico"'), "Favicon routes must cover SVG and ICO fallback requests");
assert(favicon.includes('"content-type": "image/svg+xml;charset=UTF-8"'), "Favicon response must use the SVG content type");
assert(favicon.includes('"cache-control": "public, max-age=604800, immutable"'), "Favicon should be cacheable at the edge/browser");
assert(favicon.includes('--paper:#ffffff') && favicon.includes('--ink:#121417'), "Favicon must preserve the monochrome light/dark palette");
assert(favicon.includes("Broken angular orbit") && favicon.includes("Three-way core"), "Favicon must preserve the angular orbit and three-way core visual system");

for (const [source, name] of [[uiPage,"Studio base head"],[gptUi,"GPT UI"],[authWorker,"Auth UI"],[workHandoff,"Work handoff"],[gptHandoff,"GPT handoff"],[authSso,"Auth SSO handoff"]]) {
  assert(source.includes("${FAVICON_LINKS}"), `${name} must include the favicon`);
}

assert(worker.includes("FAVICON_PATHS.has(pathname)") && worker.includes("faviconResponse(request)"), "Main/Work Worker must serve favicon routes");
assert(gptWorker.includes("FAVICON_PATHS.has(pathname)") && gptWorker.includes("faviconResponse(request)"), "GPT Worker must serve favicon routes");
assert(authWorker.includes("FAVICON_PATHS.has(pathname)") && authWorker.includes("faviconResponse(request)"), "Auth Worker must serve favicon routes");

console.log("AERTEX favicon integration checks passed.");
