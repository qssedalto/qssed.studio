import fs from "node:fs";

const worker = fs.readFileSync(new URL("../worker.js", import.meta.url), "utf8");
const work = fs.readFileSync(new URL("../studio/work-subdomain.js", import.meta.url), "utf8");
const handoff = fs.readFileSync(new URL("../studio/auth-handoff.js", import.meta.url), "utf8");
const workTexUi = fs.readFileSync(new URL("../studio/ui-work-tex.js", import.meta.url), "utf8");
const bridge = fs.readFileSync(new URL("../local-bridge/server.mjs", import.meta.url), "utf8");
const nativeOrigin = fs.readFileSync(new URL("../local-bridge/native/origins_work_windows.go", import.meta.url), "utf8");
const workWranglerText = fs.readFileSync(new URL("../wrangler.work.jsonc", import.meta.url), "utf8");
const workWrangler = JSON.parse(workWranglerText.replace(/^\s*\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, ""));

assert(worker.includes("rewriteWorkSubdomainRequest"), "Worker must route the Work custom domain explicitly");
assert(worker.includes("handleMainWorkHandoff"), "Main Studio must expose the Work session handoff");
assert(worker.includes("workSessionRedirect"), "Unauthenticated Work pages must return through the main-site handoff");
assert(worker.includes("mapped.canonical"), "Work aliases must redirect to localized canonical URLs");

for (const required of [
  'const WORK_ORIGIN = "https://work.qsseda.studio"',
  'return `${WORK_ORIGIN}/zh-cn/tex`',
  'return `${WORK_ORIGIN}/en/tex`',
  'const canonicalPath = `/${locale}/tex`',
  'internalUrl.pathname = pathname.startsWith("/en/") ? "/en/work/tex" : "/zh-cn/work/tex"',
  '"/zh-cn/local", "/en/local"',
  'action="${WORK_ORIGIN}/auth/handoff"',
  'canonicalWorkPath',
  '__Host-qsseda-studio-refresh'
]) assert(work.includes(required), `Work subdomain module is missing: ${required}`);

assert(!work.includes('internalPath = `/${locale}/work/local`'), "Work must not expose the Local Bridge as a standalone product page");
assert(!work.includes('internalPath = `/${locale}/work`'), "Work must not expose a standalone Work Hub page");

assert(handoff.includes('const WORK_HOST = "work.qsseda.studio"'), "Auth handoff must identify the Work host");
assert(handoff.includes("new Set([AUTH_ORIGIN, MAIN_ORIGIN])"), "Work handoff must allow only Auth and the trusted main-site origin");
assert(handoff.includes('return candidateLocale === "zh" ? "/zh-cn/tex" : "/en/tex"'), "Every Work handoff must land on localized TeX");

assert(workTexUi.includes('id="qsseda-work-tex-only"'), "Work TeX must include the dedicated full-viewport shell override");
assert(workTexUi.includes('.tex-workbench .tex-hero{display:none!important}'), "Work must hide Studio/TeX product chrome above the workspace");
assert(workTexUi.includes('.os-sidebar'), "Work must remove the Studio sidebar from layout");
assert(workTexUi.includes('height:calc(100vh - 16px)!important'), "Work TeX must own the viewport");

assert(workWrangler.name === "qsseda-work", "Work Worker must use a dedicated script name");
assert(workWrangler.main === "worker.js", "Work Worker must reuse the hardened Studio facade");
assert(workWrangler.routes?.some(route => route.pattern === "work.qsseda.studio" && route.custom_domain === true), "work.qsseda.studio custom domain route is missing");
assert(workWrangler.r2_buckets?.some(bucket => bucket.binding === "STORAGE" && bucket.bucket_name === "qsseda-studio-storage"), "Work Worker must share the protected Studio storage binding");

assert(bridge.includes('"https://work.qsseda.studio"'), "Legacy Bridge must allow the Work origin");
assert(nativeOrigin.includes('allowedOrigins["https://work.qsseda.studio"] = true'), "Native Bridge must allow the Work origin");

console.log("Work TeX-only custom domain checks passed.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
