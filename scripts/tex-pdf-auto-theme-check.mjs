import assert from "node:assert/strict";
import fs from "node:fs";
import { enhanceWorkTexPdfAutoTheme } from "../studio/ui-work-tex-pdf-auto-theme.js";

const original = "<!doctype html><html><head></head><body>" +
  '<section class="tex-work-app"><iframe id="tex-live-preview-frame"></iframe></section></body></html>';
const html = enhanceWorkTexPdfAutoTheme(original);
assert.equal(enhanceWorkTexPdfAutoTheme(html), html, "PDF viewer must only be injected once");
assert.equal(enhanceWorkTexPdfAutoTheme("bad input"), "bad input");

const style = html.match(/<style id="aertex-work-pdf-auto-theme">([\s\S]*?)<\/style>/)?.[1];
const script = html.match(/<script id="aertex-work-pdf-auto-theme-runtime">([\s\S]*?)<\/script>/)?.[1];
assert(style && script, "Themed viewer needs both pre-paint CSS and a client controller");
assert(html.indexOf('id="aertex-work-pdf-auto-theme"') < html.indexOf("</head>"),
  "Theme CSS must arrive before first paint to avoid a white flash");
new Function(script);
assert(style.includes(".aertex-pdf-reader.aertex-pdf-native object.aertex-pdf-native-object"),
  "iPadOS must use a full-height native PDF object, not the known blank iframe.");
assert(style.includes(".aertex-pdf-native-open") && style.includes("display:none!important"),
  "Browser-native PDF fallback must not add buttons on desktop.");
assert(script.includes("const iosNativePdf = /iPad|iPhone|iPod/"),
  "iOS PDF rendering must not rely on layout width or an unstable Safari UA alone.");
assert(script.includes("navigator.platform === 'MacIntel' && Number(navigator.maxTouchPoints) > 1"),
  "iPadOS desktop user-agent detection missing.");
assert(script.includes("if (iosNativePdf) {") && script.includes("showIosNativePdf(blob, nativeHttpUrl);") &&
  script.includes("return;"),
  "iOS must bypass PDF.js rendering entirely.");
assert(script.includes("nativeObject.data = safeHttp || url;") && script.includes("blob.slice(0, blob.size, 'application/pdf')"),
  "iOS must render verified original PDF bytes with correct MIME, not an empty canvas.");
assert(script.includes("document.createElement('object')") &&
  !script.includes("document.createElement('iframe')"),
  "The embedded native iPad PDF must not use a blob iframe.");
assert(script.includes("const nativeHttp = /^[1-9][0-9]*$/.test") &&
  script.includes("'/api/tex/github/pdf?run=' + encodeURIComponent(String(runId))"),
  "Successful Github PDFs must use their authenticated inline HTTP URL.");
assert(script.includes("nativeObject.type = 'application/pdf'") &&
  script.includes("fallback.textContent = zh ? '无法内嵌显示？在 Safari 中打开完整 PDF ↗'"),
  "Mobile native preview needs correct MIME and a visible PDFKit fallback.");
assert(script.includes("if (iosNativeObjectUrl) disposeIosNativePdf();"),
  "Native PDF URLs must be released on close and navigation.");
assert(script.includes("const pdfjs = await loadLibrary();"),
  "Desktop PDF.js renderer must remain available unchanged.");

assert(script.includes("const faithfulTouch = window.matchMedia("),
  "Small touch screens must bypass the destructive split-mask renderer");
assert(script.includes("if (paintTheme === 'dark' && !faithfulTouch)"),
  "Desktop dark PDF stays unchanged while touch uses exact PDF painting");
assert(script.includes("task = cell.page.render({canvasContext:ctx,viewport:vp,background:'#fff'})"),
  "Mobile rendering must preserve all original PDF text, image, and vector operations");
assert(style.includes("Faithful PDF paint on iPad/iPhone"),
  "Touch-only PDF paper must use source colors, while viewer chrome stays dark");

assert(style.includes(':root[data-theme="dark"]'), "Dark PDF must follow the existing resolved site theme");
assert(style.includes('background:#1b1c20!important'), "Dark reader background must be dark at first paint");
assert(style.includes('background:#202126!important'), "PDF page itself must have a dark background");
assert(style.includes('#tex-live-preview-frame') && style.includes('visibility:hidden!important'),
  "Native PDF viewer must be hidden to enforce the site theme without a manual override");
assert(style.includes('pointer-events:none!important'), "Users may not interact with native PDF dark-mode controls");
assert(style.includes('data-painted-theme="light"') && style.includes('visibility:hidden!important'),
  "Never reveal the old white canvas while dark PDF pages are being repainted");
assert(script.includes("window.addEventListener('aertex-themechange',updateTheme)"),
  "PDF must track the actual site-wide theme change event");
assert(script.includes("attributeFilter:['data-theme']"),
  "PDF must track resolved system theme changes");
assert(script.includes("document.documentElement.dataset.theme === 'dark'"),
  "PDF theme cannot use a separately persisted setting");
assert(script.includes("const imageOps = new Set([66,83,84,85,86,87,88,89,90])"),
  "Images must be excluded from recolored paint operations");
assert(script.includes("operationsFilter:index => masks.background[index] !== false"),
  "Colored raster images must be painted on their own unchanged layer");
assert(script.includes("operationsFilter:index => masks.foreground[index] !== false"),
  "Black glyphs must be isolated for white recoloring");
assert(script.includes("state.displayReadyCapability && state.operatorList?.lastChunk"), "Classify exactly the renderer's DISPLAY operator list");
assert(!script.includes("await cell.page.getOperatorList()"), "OPLIST indices differ from DISPLAY paint indices and can recolor images");
assert(script.includes("textCtx.globalCompositeOperation = 'source-in'"),
  "Only the glyph/vector canvas may be recolored");
assert(script.includes('background:\'rgba(0,0,0,0)\''), "The ink layer must have a transparent background");
assert(!script.includes("pageColors:"), "PDF.js pageColors would also recolor images");
assert(!/filter\s*:\s*(?:invert|hue-rotate)\(/i.test(style), "Never invert PDF raster images");
assert(!script.includes("pdfThemeMode") && !script.includes("theme-switch"),
  "There cannot be a separate manual PDF theme selector");
assert(script.includes("originalLink.addEventListener('click',event=>"),
  "Opening the PDF must stay within the site-controlled viewer");
assert(script.includes("event.preventDefault();"), "Prevent opening a separate native viewer from the preview link");
assert(script.includes("URL.createObjectURL(pdfBlob)"), "PDF download must retain the untouched original data");

assert(script.includes("const paths = {"), "Native-style PDF icons must be SVG path drawings rather than text symbols");

assert(script.includes('pages:\'<path d="M8.2 5.2H21'), "The Contents glyph must be traced as the native three-line list");
assert(script.includes('rotate:\'<path d="M3.2 11.6A9'), "Rotation must use the native large circular arc");
assert(script.includes('<circle cx="12" cy="12" r="1.8"/>'), "Native rotate icon has a distinctive central ring");
assert(script.includes('expand:\'<path d="M4.2 9.8V20'), "The native diagonal expansion icon must be present");
assert(script.includes("pages:'<path") && script.includes("pages:'<path") && script.includes("pages:'<path"), "Contents must remain SVG artwork");
assert(script.includes("pages:'目录'") && script.includes("pages:'Contents'"), "PDF sidebar must be named 目录, not 页面");
assert(script.includes("entries=await loaded?.getOutline()"), "Contents sidebar must display actual PDF document bookmarks");
assert(script.includes("tool('expand',labels.expand,'expand')"), "Native expand control must be inside the PDF toolbar");
assert(script.includes("await reader.requestFullscreen({navigationUI:'hide'})"),
  "PDF expansion must use actual browser fullscreen, not a layout-only toggle");
assert(script.includes("document.fullscreenElement===reader") &&
       script.includes("document.addEventListener('fullscreenchange',updateFullscreenState)"),
  "Browser Fullscreen API state and native Esc exit must be tracked");
assert(script.includes("expandButton.disabled=fullscreen"), "Expanded PDF must not have a second click-to-exit toggle");
assert(!script.includes("document.getElementById('tex-preview-expand')?.click();"),
  "Old preview header full-window layout toggle must not remain wired");
assert(style.includes("#tex-preview-expand{display:none!important}"), "The old heading expand icon must be removed from view");
assert(style.includes("background:#f7f7f7!important") && style.includes("color:#252525!important"),
  "Light PDF toolbar must have a pale background and dark icons");
assert(style.includes(':root[data-theme="dark"] .tex-work-app .aertex-pdf-toolbar') &&
       style.includes("color:#f3f3f3!important"),
  "Dark PDF toolbar must retain dark background and pale icons");
assert(style.includes("button.aertex-pdf-tool") && style.includes("color:inherit!important"),
  "Toolbar icons must inherit the effective site theme rather than remain white");

for (const iconName of ["pages","previous","next","minus","plus","fit","rotate","search","print","save"]) {
  assert(script.includes(iconName + ":'<"), "Missing hand-drawn SVG icon for " + iconName);
}
assert(script.includes('class="aertex-pdf-icon" viewBox="0 0 24 24"'),
  "All toolbar SVG icons should use a consistent 24px drawing coordinate system");
assert(script.includes('class="aertex-pdf-section aertex-pdf-section-center"'),
  "The central page/zoom group should align independently of the side controls");
assert(script.includes('class="aertex-pdf-section aertex-pdf-section-right"'),
  "Search, print and save need the right-aligned native viewer grouping");
assert(!script.includes('data-pdf-action="pen"') &&
       !script.includes('data-pdf-action="highlight"'),
  "Do not show unavailable native PDF annotation or drawing buttons");
assert(script.includes("buttons.get('pages').addEventListener('click'"),
  "Sidebar icon must open a functioning page list");
assert(script.includes("buttons.get('rotate').addEventListener('click'"),
  "Rotation icon must rotate pages");
assert(script.includes("searchToggle.addEventListener('click'"),
  "Search icon must open a floating find popover");
assert(script.includes("searchInput.hidden=true"),
  "Escape should close the search field");
assert(style.includes("background:#3b3b3b!important"),
  "Toolbar background should match native Edge PDF charcoal (#3b3b3b)");
assert(style.includes("grid-template-columns:minmax(40px,1fr) max-content minmax(120px,1fr)"),
  "Toolbar should independently align left, middle and right sections");
assert(style.includes("height:44px!important"), "Toolbar should use a consistent compact 44px height");
assert(style.includes(".aertex-pdf-icon{") && style.includes("stroke-width:1.75"),
  "Native-style icons must use thin consistent stroke artwork");
assert(style.includes("input.aertex-pdf-search[hidden]"),
  "Search field must collapse until the user requests it");
assert(script.includes('id="aertex-pdf-find-popover"') &&
       script.includes('data-pdf-action="find-prev"') &&
       script.includes('data-pdf-action="find-next"') &&
       script.includes('data-pdf-action="find-close"'),
  "Floating PDF find palette must provide native-style previous, next and close buttons");
assert(script.includes("positionFindPopover()") &&
       script.includes("searchToggle.getBoundingClientRect()"),
  "Find palette must be anchored directly beneath the magnifier");
assert(!script.includes("buttons.get('search-toggle').addEventListener('click'"),
  "Legacy in-toolbar search control must be removed");
assert(style.includes(".aertex-pdf-find-popover[hidden]") &&
       style.includes("position:absolute!important;top:49px!important"),
  "Search should overlay the PDF instead of taking any toolbar width");
assert(style.includes(".aertex-pdf-reader:fullscreen") &&
       style.includes(":fullscreen .aertex-pdf-toolbar") &&
       style.includes(":fullscreen .aertex-pdf-pages") &&
       style.includes("grid-template-rows:minmax(0,1fr)!important"),
  "Native fullscreen must show only PDF pages, without a toolbar or any other site content");
assert(!script.includes("document.body.classList.contains('tex-preview-expanded')"),
  "Do not use website panel expansion state as a substitute for system fullscreen");
assert(style.includes(".aertex-pdf-outline[hidden]"),
  "Page sidebar must be hidden until explicitly opened");


// Build the same pure PDF.js operator masks as the browser runtime, without a DOM.
// Bitmap / image XObjects must remain in the background, text and black equation
// vector strokes must be white-ink-only; explicit white page rectangles disappear.
const begin = script.indexOf("const textOps = new Set(");
const end = script.indexOf("function updateControls()", begin);
assert(begin >= 0 && end > begin, "PDF operator classification must be present");
const buildMasks = new Function(script.slice(begin,end) + "\nreturn buildMasks;")();
const op = {
  save:10, restore:11, stroke:20, fill:22, beginText:31, endText:32,
  showText:44, setStrokeRGBColor:58, setFillRGBColor:59,
  image:85, inlineImage:86, path:91
};
const operations = [
  [op.setFillRGBColor, ["#ffffff"]],
  [op.path, [null]],
  [op.fill, []],
  [op.setFillRGBColor, ["#000000"]],
  [op.beginText, []],
  [op.showText, ["black text"]],
  [op.endText, []],
  [op.image, ["full-color-photo"]],
  [op.inlineImage, ["full-color-photo-inline"]],
  [op.setFillRGBColor, ["#006fee"]],
  [op.fill, []],
  [op.save, []],
  [op.setStrokeRGBColor, ["#000000"]],
  [op.stroke, []],
  [op.restore, []]
];
const masks = buildMasks({
  fnArray:operations.map(item=>item[0]),
  argsArray:operations.map(item=>item[1])
});
const folded = buildMasks({fnArray:[59,91,85],argsArray:[["#ffffff"],[22,[{}],{0:0,1:0,2:400,3:600}],["photo"]]});
assert.equal(folded.background[1], false, "PDF.js constructPath(OPS.fill) must suppress a white vector page background");
assert.equal(folded.foreground[1], false, "A white vector background may NOT enter the white text overlay");
assert.equal(folded.background[2], true, "Photo operators must remain in the color-preserving background layer");
assert.equal(folded.foreground[2], false, "Photo operators must never be recolored");
assert.equal(masks.background[2], false, "White page background must not render in dark mode");
assert.equal(masks.background[5], false, "Original black text must not remain on dark background");
assert.equal(masks.foreground[5], true, "Text must be isolated in the white ink layer");
assert.equal(masks.background[7], true, "Photo pixels must be drawn without recoloring");
assert.equal(masks.foreground[7], false, "Photo pixels must NEVER be in the inverted/recolored layer");
assert.equal(masks.background[8], true, "Inline images must preserve original colors");
assert.equal(masks.foreground[8], false, "Inline image pixels must remain untouched");
assert.equal(masks.background[10], true, "Colored diagrams must preserve their color");
assert.equal(masks.foreground[10], false, "Color diagrams must not become white");
assert.equal(masks.background[13], false, "Black math strokes should move to the white layer");
assert.equal(masks.foreground[13], true, "Black math strokes must be white in dark mode");

const wrapper = fs.readFileSync(new URL("../studio/ui-work-tex-pdf-controls.js",import.meta.url),"utf8");
assert(wrapper.includes("enhanceWorkTexPdfAutoTheme(source.replace("),
  "Work PDF wrapper must install the themed viewer after the original PDF controls");

console.log("Themed PDF: CSS-first, shared mode, no manual switch, no image inversion, PDF operator separation passed.");
