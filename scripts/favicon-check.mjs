import { faviconSvgForProduct } from "../studio/favicon.js";
import fs from "node:fs";

const read = path => fs.readFileSync(path, "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const favicon = read("studio/favicon.js");
const uiPage = read("studio/ui-page.js");
const gptUi = read("studio/gpt-ui.js");
const worker = read("worker.js");
const gptWorker = read("gpt-worker.js");
const authWorker = read("auth-worker.js");
const adminWorker = read("admin-worker.js");
const cashWorker = read("cash-worker.js");
const watchWorker = read("watch-worker.js");
const brandLogo = read("studio/brand-logo.js");
const cashIndex = read("cash-web/index.html");
const watchIndex = read("watch-web/index.html");
const workHandoff = read("studio/work-subdomain.js");
const gptHandoff = read("studio/gpt-subdomain.js");
const authSso = read("auth-sso.js");

assert(favicon.includes('viewBox="0 0 64 64"'), "Favicon must keep a 64x64 vector viewBox");
assert(favicon.includes('"/favicon.svg"') && favicon.includes('"/favicon.ico"') && favicon.includes('"/icon.svg"'), "Square brand routes must cover favicon.svg, favicon.ico, and icon.svg");
assert(favicon.includes('"content-type": "image/svg+xml;charset=UTF-8"'), "Favicon response must use the SVG content type");
assert(favicon.includes('"cache-control": "public, max-age=604800, immutable"'), "Favicon should be cacheable at the edge/browser");
assert(favicon.includes('--paper:#ffffff') && favicon.includes('--ink:#121417'), "Favicon must preserve the monochrome light/dark palette");
assert(favicon.includes("Broken angular orbit") && favicon.includes("Three-way core"), "Favicon must preserve the angular orbit and three-way core visual system");
assert(favicon.includes("aertex-20261003-product-badge-4"), "Favicon cache key must use the current product-badge release.");
assert(brandLogo.includes('new Set(["/logo.svg"])') && brandLogo.includes("logoResponse(request)"), "Official wordmark must be exposed at /logo.svg.");
assert(brandLogo.includes('viewBox="0 0 1027 198"'), "Official /logo.svg must use the AERTEX wordmark artwork.");

const productIcons = {
  work: "AERTEX Work",
  intelligence: "AERTEX Intelligence",
  cash: "AERTEX Cash",
  watch: "AERTEX Watch",
  auth: "AERTEX ID",
  admin: "AERTEX Administration"
};
for (const [product,label] of Object.entries(productIcons)) {
  const svg = faviconSvgForProduct(product);
  assert(svg.includes("aertex-product-badge"), product + " favicon must include a lower-right product badge.");
  assert(svg.includes('aria-label="' + label + '"'), product + " favicon must expose the correct product label.");
  if (product !== "work") assert(svg.includes('cx="51.2" cy="51.2" r="11.1"'), product + " favicon must keep the common circular badge geometry.");
}
const workSvg = faviconSvgForProduct("work");
assert(workSvg.includes("aertex-work-badge"), "Work must use the supplied edit-style branch logo.");
assert(workSvg.includes("work-edit-frame") && workSvg.includes("work-edit-pencil"), "Work branch logo must use the supplied square-and-pencil glyph.");
assert(!workSvg.includes("work-edit-backdrop"), "Work edit badge must not add a white or colored background panel.");
assert(workSvg.includes(".work-edit-pencil{fill:none;stroke:var(--ink)"), "Work pencil must stay transparent inside and use the shared monochrome stroke.");
assert(workSvg.includes(".badge-disc{fill:none;stroke:var(--edge)"), "All shared product badge discs must use transparent fill.");
assert(!workSvg.includes("work-window") && !workSvg.includes("#9bbcf5") && !workSvg.includes("#5f8fdf"), "Work branch logo must not reintroduce the old blue workspace panes.");
assert(!faviconSvgForProduct("").includes('aertex-product-badge'), "Main-site favicon must remain the plain AERTEX square mark.");

for (const [source, name] of [[uiPage,"Studio base head"],[gptUi,"GPT UI"],[authWorker,"Auth UI"],[workHandoff,"Work handoff"],[gptHandoff,"GPT handoff"],[authSso,"Auth SSO handoff"]]) {
  assert(source.includes("${FAVICON_LINKS}"), `${name} must include the favicon`);
}

assert(worker.includes("FAVICON_PATHS.has(pathname)") && worker.includes("faviconResponse(request)"), "Main/Work Worker must serve favicon routes");
assert(gptWorker.includes("FAVICON_PATHS.has(pathname)") && gptWorker.includes("faviconResponse(request)"), "GPT Worker must serve favicon routes");
assert(authWorker.includes("FAVICON_PATHS.has(pathname)") && authWorker.includes("faviconResponse(request)"), "Auth Worker must serve favicon routes");
for (const [source,name] of [[worker,"Main/Work"],[gptWorker,"Intelligence"],[authWorker,"AERTEX ID"],[adminWorker,"Administration"],[cashWorker,"Cash"],[watchWorker,"Watch"]]) {
  assert(source.includes("LOGO_PATHS") && source.includes("logoResponse(request)"), name + " Worker must serve /logo.svg from the shared wordmark source.");
  assert(source.includes("FAVICON_PATHS") && source.includes("faviconResponse(request)"), name + " Worker must serve the shared square icon routes.");
}
assert(cashIndex.includes('href="/favicon.svg?v=aertex-20261003-product-badge-4"') && cashIndex.includes('src="/favicon.svg?v=aertex-20261003-product-badge-4"'), "Cash must use the current square AERTEX logo in both favicon and visible brand UI.");
assert(watchIndex.includes('href="/favicon.svg?v=aertex-20261003-product-badge-4"'), "Watch must declare the current square AERTEX favicon.");
assert(!cashWorker.includes('"/icon.svg"]') && !watchWorker.includes('"/icon.svg"'), "Cash and Watch must not serve legacy product-specific icon files.");

console.log("AERTEX shared square icon and wordmark integration checks passed.");
