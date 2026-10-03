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
assert(favicon.includes("aertex-20261003-product-role-swap-2"), "Favicon cache key must use the current product-badge release.");
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
assert(favicon.includes('.aertex-product-main .product-main-glyph{fill:none;stroke:var(--ink);stroke-width:1.65'), "Enlarged product icons must keep the original 1.65 visual stroke weight instead of becoming heavier.");
assert(favicon.includes('.aertex-product-main .product-main-glyph *{vector-effect:non-scaling-stroke}'), "Enlarged product icons must preserve non-scaling strokes so geometry can grow without thickening the lines.");

for (const [product,label] of Object.entries(productIcons)) {
  const svg = faviconSvgForProduct(product);
  assert(svg.includes("aertex-product-main"), product + " favicon must promote the product glyph to the main icon.");
  assert(svg.includes('aria-label="' + label + '"'), product + " favicon must expose the correct product label.");
  assert(svg.includes('mask="url(#aertex-product-main-knockout)"'), product + " main glyph must clear space for the lower-right AERTEX badge.");
  assert(svg.includes('<mask id="aertex-product-main-knockout"'), product + " favicon must define the product-main knockout mask.");
  assert(svg.includes('class="brand-badge-cutout" cx="51.2" cy="51.2" r="13.5"'), product + " favicon must reserve transparent clearance around the lower-right AERTEX badge.");
  assert(svg.includes('class="brand-badge-disc" cx="51.2" cy="51.2" r="11.1"'), product + " favicon must draw one lower-right circle for the AERTEX brand badge.");
  assert(svg.includes('class="aertex-badge-mark"'), product + " favicon must place the AERTEX main-site mark inside the lower-right circle.");
  assert(svg.includes('class="product-main-glyph" transform="translate(28.8 29) scale('), product + " product glyph must be rendered as the large primary mark.");
  assert(!svg.includes('class="badge-glyph"'), product + " favicon must not keep the old small product-glyph badge.");
  assert(!svg.includes('class="badge-disc"'), product + " favicon must not keep the old circle around the promoted product glyph.");
  assert(!svg.includes('<image class="aertex-reference-mark"'), product + " favicon must not keep the full-size AERTEX mark as the primary icon.");
}
const workSvg = faviconSvgForProduct("work");
assert(workSvg.includes('scale(3.75)'), "Work edit glyph must use the large main-icon scale.");
assert(workSvg.includes('M-1.55 1.8-.85-.45 2.6-3.9'), "Work pencil must keep the shorter reference-matched geometry.");
assert(!workSvg.includes("work-window") && !workSvg.includes("#9bbcf5") && !workSvg.includes("#5f8fdf"), "Work must not reintroduce the old blue workspace panes.");
const intelligenceSvg = faviconSvgForProduct("intelligence");
assert((intelligenceSvg.match(/intelligence-star-(?:main|small)/g) || []).length === 2, "Intelligence main icon must contain exactly one main star and one small star.");
assert(intelligenceSvg.includes('class="intelligence-stars" transform="scale(1.16)"'), "Intelligence must preserve the approved two-star internal geometry.");
assert(intelligenceSvg.includes('scale(3.8)'), "Intelligence two-star composition must be promoted to the large main-icon scale.");
assert(intelligenceSvg.includes('class="filled intelligence-star-main"') && intelligenceSvg.includes('M-1-3.04-.10-.75 2.25.15'), "Intelligence main star path geometry must remain unchanged.");
assert(intelligenceSvg.includes('class="filled intelligence-star-small"') && intelligenceSvg.includes('M2.8-3.7 3.1-3 3.8-2.7'), "Intelligence small star must remain separated in the upper-right.");
assert(!faviconSvgForProduct("").includes('aertex-product-main') && !faviconSvgForProduct("").includes('aertex-brand-badge'), "Main-site favicon must remain the plain AERTEX square mark.");

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
assert(cashIndex.includes('href="/favicon.svg?v=aertex-20261003-product-role-swap-2"') && cashIndex.includes('src="/favicon.svg?v=aertex-20261003-product-role-swap-2"'), "Cash must use the current shared product-role-swap favicon cache reference.");
assert(watchIndex.includes('href="/favicon.svg?v=aertex-20261003-product-role-swap-2"'), "Watch must use the current shared product-role-swap favicon cache reference.");
assert(!cashWorker.includes('"/icon.svg"]') && !watchWorker.includes('"/icon.svg"'), "Cash and Watch must not serve legacy product-specific icon files.");

console.log("AERTEX shared square icon and wordmark integration checks passed.");
