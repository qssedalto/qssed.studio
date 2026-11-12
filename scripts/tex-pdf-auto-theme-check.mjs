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
