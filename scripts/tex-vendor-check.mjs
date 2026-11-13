import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { enhanceWorkTexCodeMirror } from "../studio/ui-work-tex-codemirror.js";
import { WORK_TEX_CODE_PALETTES, WORK_TEX_CODE_CHOICES } from "../studio/tex-code-palettes.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(await readFile(resolve(root, "tex-vendor/package.json"), "utf8"));
const wrangler = await readFile(resolve(root, "wrangler.work.jsonc"), "utf8");
assert.match(wrangler, /"assets"\s*:\s*\{\s*"directory"\s*:\s*"\.\/tex-vendor\/dist"/, "Work Worker must serve browser vendor assets.");
assert.equal(pkg.private, true, "Vendor modules must not be accidentally published as an npm package.");

for (const [name, symbols] of [
  ["codemirror", ["EditorView", "basicSetup", "StreamLanguage", "stex", "Compartment", "HighlightStyle", "syntaxHighlighting", "tags"]],
  ["yjs", ["Doc", "applyUpdate", "encodeStateAsUpdate", "createRelativePositionFromTypeIndex"]],
  ["katex", ["renderTexMath"]]
]) {
  const pathname = resolve(root, "tex-vendor/dist/assets/tex/" + name + ".js");
  const info = await stat(pathname);
  assert(info.isFile() && info.size > 10000 && info.size < 1024 * 1024, "Missing or unexpectedly sized: " + name);
  const source = await readFile(pathname, "utf8");
  assert.match(source, /\bexport\b/, name + " must be a real ESM module");
  // ESM imports must be fully bundled. URLs in comment text or LICENSE notices are fine.
  assert(!/\b(?:import|from)\s*(?:\(|\{|\*|["'])?\s*["']https?:\/\//.test(source),
    name + " includes a remote import, violating same-origin policy");
  for (const symbol of symbols) assert(source.includes(symbol), "Missing " + symbol + " export in " + name);
  console.log(name + " " + info.size + " bytes " + createHash("sha256").update(source).digest("hex").slice(0,16));
}
const editor = await readFile(resolve(root, "studio/ui-work-tex-codemirror.js"), "utf8");
const realtime = await readFile(resolve(root, "studio/ui-work-tex-realtime.js"), "utf8");
const sourceModes = await readFile(resolve(root, "tex-vendor/src/codemirror.js"), "utf8");
assert(sourceModes.includes("export function parserForFilename(filename)") &&
  sourceModes.includes('"@codemirror/legacy-modes/mode/python"') &&
  sourceModes.includes('"@codemirror/legacy-modes/mode/javascript"') &&
  sourceModes.includes('"@codemirror/legacy-modes/mode/yaml"'),
  "Python, JS/TS, YAML and other source modes must remain bundled in the same CodeMirror instance");
assert(editor.includes("streamLanguageClass.define(parser)") &&
  editor.includes("languageParserForFilename(currentAsset.name)"),
  "Project files must receive matching CodeMirror syntax highlighting");

const visual = await readFile(resolve(root, "studio/ui-work-tex-organize-ui.js"), "utf8");
const markdownVisual = await readFile(resolve(root, "studio/ui-work-tex-markdown-visual.js"), "utf8");
assert(markdownVisual.includes("document.createElement('select')") &&
  markdownVisual.includes("viewSelect.id = 'tex-markdown-editor-mode'") &&
  markdownVisual.includes("engineLabel.parentElement.insertBefore(tabs,engineLabel)") &&
  markdownVisual.includes("viewSelect.addEventListener('change'"),
  "Markdown files must reuse the native TeX-style editor selector next to the engine, not a file-header segmented control");
assert(!markdownVisual.includes("sourceLabel.insertBefore(tabs") &&
  !markdownVisual.includes("sourceButton.addEventListener"),
  "No duplicate oversized Markdown buttons may clutter the file toolbar");

assert(editor.includes("import('/assets/tex/codemirror.js')") ||
  editor.includes("timedModule('/assets/tex/codemirror.js'"),
  "CodeMirror must load exclusively from the Work origin");
assert(realtime.includes("import('/assets/tex/yjs.js')"),
  "Yjs must load exclusively from the Work origin");
assert(visual.includes("import('/assets/tex/katex.js')"), "Visual math must use the self-hosted KaTeX bundle");
assert(!/(?:cdn\.jsdelivr\.net|esm\.sh)/.test(visual), "Visual mode must not use external math CDNs");
assert(!/(?:cdn\.jsdelivr\.net|esm\.sh)/.test(editor+realtime),
  "Runtime must not import either TeX module from a CDN.");

const colorPalettes = Object.entries(WORK_TEX_CODE_PALETTES);
assert(colorPalettes.length >= 8 && WORK_TEX_CODE_CHOICES.length >= 9,
  "Editor must offer at least seven distinct named syntax color schemes plus site-following mode");
assert(new Set(WORK_TEX_CODE_CHOICES.map(c => c[0])).size === WORK_TEX_CODE_CHOICES.length,
  "Duplicate editor palette names are not allowed");
assert(WORK_TEX_CODE_CHOICES.some(c => c[0] === "auto") &&
  WORK_TEX_CODE_PALETTES["auto-dark"] && WORK_TEX_CODE_PALETTES["auto-light"],
  "The default code palette must track the actual website appearance");
const luminance = hex => {
  assert(/^#[0-9a-f]{6}$/i.test(hex), "Theme colors must be six-digit verified hex values");
  const channels = hex.slice(1).match(/.{2}/g).map(x => parseInt(x, 16) / 255);
  const linear = channels.map(c => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
};
const contrast = (a,b) => {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
for (const [key,p] of colorPalettes) {
  for (const token of ["fg","comment","command","keyword","string","number","symbol","variable","link"]) {
    assert(contrast(p[token],p.bg) >= 4.5,
      key + " " + token + " fails the 4.5:1 minimum text contrast");
  }
  assert(contrast(p.gutterText,p.gutter) >= 4.5,
    key + " line numbers lack sufficient contrast");
}
const themedMarkup = enhanceWorkTexCodeMirror(
  '<section class="tex-work-app"><section id="tex-editor"><div class="tex-editor-toolbar"></div></section></section>', true);
const codeRuntime = themedMarkup.match(/<script id="qsseda-work-tex-codemirror-runtime">([\s\S]*?)<\/script>/)?.[1];
assert(codeRuntime, "Color selection must be bundled into the existing CodeMirror runtime");
new Function(codeRuntime);
const lightIds = colorPalettes.filter(([,p]) => !p.dark).map(([id]) => id);
const darkIds = colorPalettes.filter(([,p]) => p.dark).map(([id]) => id);
assert(lightIds.length >= 6 && darkIds.length >= 6,
  "Both light and dark mode require several accessible independent presets");
assert(codeRuntime.includes("pickerButton.id = 'tex-code-theme-toggle'") &&
  codeRuntime.includes("popover.id = 'tex-code-theme-popover'") &&
  codeRuntime.includes("select.id = 'tex-code-theme-' + mode") &&
  codeRuntime.includes("function showPreview(mode)"),
  "Color settings must show two independent light/dark choices with actual code previews");
assert(codeRuntime.includes("const colorKeys = {") &&
  codeRuntime.includes("light: 'aertex.work.code-color-scheme.light.v2'") &&
  codeRuntime.includes("dark: 'aertex.work.code-color-scheme.dark.v2'") &&
  codeRuntime.includes("localStorage.setItem(colorKeys[mode],value)") &&
  codeRuntime.includes("const legacy = safeId(localStorage.getItem(codeThemeStorageKey), mode)"),
  "Site light and dark code palettes must persist separately with safe v1 migration");
assert(codeRuntime.includes("attributeFilter:['data-theme']") &&
  codeRuntime.includes("const resolvedCodeThemeId = () => selectedCodeThemes[modeForSite()]") &&
  codeRuntime.includes("window.addEventListener('storage',event=>"),
  "Code colors must switch with global appearance and sync across tabs");
assert(codeRuntime.includes("codeThemeCompartment.reconfigure(makeCodeThemeExtension())") &&
  codeRuntime.includes("...paletteExtension()") &&
  codeRuntime.includes("syntaxHighlighting(highlight)") &&
  codeRuntime.includes("StreamLanguage.define(stex)"),
  "Switching colors must retain CodeMirror source, undo history and all other editor state");
assert(themedMarkup.includes("#tex-editor[data-code-theme]") &&
  themedMarkup.includes(".tex-code-theme-preview") &&
  !codeRuntime.includes("AERTEXTheme.setMode") &&
  !codeRuntime.includes("AERTEXTheme.setAccent"),
  "Independent code palettes must not change site or PDF appearance");
assert(themedMarkup.includes("appearance:menulist!important") &&
  themedMarkup.includes("-webkit-appearance:menulist!important") &&
  themedMarkup.includes('color-scheme:light!important') &&
  themedMarkup.includes('color-scheme:dark!important') &&
  themedMarkup.includes('select option{') &&
  themedMarkup.includes('background:#ffffff!important;color:#182432!important') &&
  themedMarkup.includes('background:#242a35!important;color:#f4f6fc!important'),
  "Palette dropdowns must use native OS controls with explicit readable light/dark options");
assert(codeRuntime.includes("const brandWordmark =") &&
  codeRuntime.includes("mark.innerHTML = brandWordmark;") &&
  codeRuntime.includes("nativeWrap.append(select,brandLabel)") &&
  codeRuntime.includes("el.textContent = zhPaletteUi ? option[1] : option[2]"),
  "Selected AERTEX brand must display the official SVG while native option rows remain safe and text-only");
assert(codeRuntime.includes("controls[mode].closest('.tex-code-theme-card').dataset.brandSelected") &&
  themedMarkup.includes('.tex-code-theme-native-wordmark>svg'),
  "AERTEX SVG selected label must update when a user changes palettes");
assert(themedMarkup.includes("grid-template-rows:36px") &&
  themedMarkup.includes("position:relative;inset:auto;grid-column:1;grid-row:1;z-index:1") &&
  themedMarkup.includes("grid-column:1;grid-row:1;") &&
  themedMarkup.includes(".tex-code-theme-native-wrap:focus-within .tex-code-theme-native-brand") &&
  !themedMarkup.includes("position:absolute;inset:1px 30px 1px 8px"),
  "Selected AERTEX wordmark must not float above its native dropdown or cover native focus text");
console.log("Native OS palette dropdown contrast and rendered AERTEX selected wordmark verified.");

console.log("Work TeX code theme picker, live syntax recoloring and 4.5:1 palette contrast verified.");

console.log("TeX self-hosted asset bundling and same-origin runtime checks passed.");
