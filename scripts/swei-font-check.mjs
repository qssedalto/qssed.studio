import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {
  SWEI_FONT_CSS, SWEI_FONT_JS, SWEI_FONT_CSS_PATH, SWEI_FONT_JS_PATH,
  injectSweiFontMarkup, injectSweiFontResponse, sweiFontAssetResponse
} from "../studio/swei-font.js";

assert(SWEI_FONT_CSS.includes("SweiHalfMoonCJKsc-Regular.woff2"), "Simplified face is missing");
assert(SWEI_FONT_CSS.includes("SweiHalfMoonCJKtc-Regular.woff2"), "Traditional face is missing");
assert(SWEI_FONT_CSS.includes("@2.125"), "Pin the font version");
assert(SWEI_FONT_CSS.includes("font-weight: 400 500"), "Only normal/medium weights should be eligible");
assert(SWEI_FONT_CSS.includes("unicode-range: U+2E80-2FFF"), "Font face must be restricted to CJK");
assert(!/unicode-range:[^;]*U\+0000/i.test(SWEI_FONT_CSS), "Latin glyphs may not be intercepted");
assert(SWEI_FONT_JS.includes("computed.fontFamily"), "Runtime must preserve the original Latin font stack");
new Function(SWEI_FONT_JS);

const html = '<!doctype html><html lang="zh-cn"><head><title>Font test</title></head><body><p>中文 English</p></body></html>';
const transformed = injectSweiFontMarkup(html);
assert(transformed.includes('href="/_aertex/swei-han.css?v=1"'));
assert(transformed.includes('src="/_aertex/swei-han.js?v=1"'));
assert.equal(injectSweiFontMarkup(transformed), transformed, "Font assets must be injected once");
assert.equal(injectSweiFontMarkup("not html"), "not html");

const csp = "default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self' data:; frame-ancestors 'none'";
const response = await injectSweiFontResponse(new Response(html, {
  headers: { "content-type": "text/html;charset=UTF-8", "content-security-policy": csp }
}));
const text = await response.text();
assert(text.includes('id="aertex-swei-css"'));
assert.match(response.headers.get("content-security-policy"), /font-src 'self' data: https:\/\/cdn\.jsdelivr\.net/);
assert(response.headers.get("content-security-policy").includes("frame-ancestors 'none'"));
assert((await injectSweiFontResponse(new Response(html, {
  headers: { "content-type": "text/html", "content-security-policy": "default-src 'self'; script-src 'self'" }
}))).headers.get("content-security-policy").includes("font-src 'self' https://cdn.jsdelivr.net"));
assert.equal((await injectSweiFontResponse(new Response('{"ok":true}', {
  headers: { "content-type": "application/json" }
}))).headers.get("content-type"), "application/json");

for (const path of [SWEI_FONT_CSS_PATH, SWEI_FONT_JS_PATH]) {
  const asset = sweiFontAssetResponse(path);
  assert.equal(asset.status, 200);
  assert.equal(asset.headers.get("x-content-type-options"), "nosniff");
  assert((await asset.text()).length > 500);
  assert.equal((await sweiFontAssetResponse(path, "HEAD").text()), "");
}
assert.equal(sweiFontAssetResponse("/unrelated.css"), null);
assert.equal(sweiFontAssetResponse(SWEI_FONT_JS_PATH, "POST").status, 405);

class FakeElement {
  constructor(tag, value, weight = 400, family = 'Inter, "Segoe UI", sans-serif') {
    this.nodeType = 1;
    this.tagName = tag;
    this.type = tag === "INPUT" ? "text" : undefined;
    this.text = value;
    this.weight = weight;
    this.family = family;
    this.styleType = "normal";
    this.isConnected = true;
    this.isContentEditable = false;
    this.children = [];
    this.childNodes = value == null ? [] : [{ nodeType: 3, nodeValue: value, parentElement: this }];
    this.properties = new Map();
    this.style = { setProperty: (name, value, priority) => {
      assert.equal(priority, "important");
      this.properties.set(name, value);
    } };
  }
  append(child) { this.children.push(child); return child; }
  querySelectorAll() { return this.children.flatMap(c => [c, ...c.querySelectorAll("*")]); }
  closest() { return null; }
}

function emulate(locale) {
  const body = new FakeElement("BODY", null);
  const line = body.append(new FakeElement("P", "正文 Chinese English"));
  const bold = line.append(new FakeElement("STRONG", "加粗正文", 700));
  const light = body.append(new FakeElement("SPAN", "细体", 300));
  const medium = body.append(new FakeElement("SPAN", "中等字重", 500));
  const latin = body.append(new FakeElement("SPAN", "English-only 12345"));
  const editor = body.append(new FakeElement("TEXTAREA", "", 400, "ui-monospace, Menlo, monospace"));
  const codeMirror = body.append(new FakeElement("SPAN", "\\section{中文} English", 400, "ui-monospace, Menlo, monospace"));
  const important = body.append(new FakeElement("SPAN", "中文", 400, '"AERTEX Swei Han SC", ui-monospace, Consolas, monospace'));
  const all = [body, ...body.querySelectorAll("*")];
  let observer = null;
  const document = {
    readyState: "complete",
    body,
    documentElement: { lang: locale },
    querySelectorAll: () => all,
    addEventListener: () => {}
  };
  const window = { requestAnimationFrame: cb => cb(), addEventListener: () => {} };
  class Observer {
    constructor(callback) { this.callback = callback; observer = this; }
    observe() {}
    disconnect() {}
  }
  vm.runInNewContext(SWEI_FONT_JS, {
    document, window, HTMLElement: FakeElement, MutationObserver: Observer,
    getComputedStyle: el => ({ fontFamily: el.family, fontWeight: String(el.weight), fontStyle: el.styleType })
  });
  const expectedFace = locale === "zh-tw" ? '"AERTEX Swei Han TC"' : '"AERTEX Swei Han SC"';
  assert(line.properties.get("font-family").startsWith(expectedFace));
  assert(line.properties.get("font-family").includes('Inter, "Segoe UI"'), "Latin fallback stack must be retained");
  assert.equal(bold.properties.get("font-family"), bold.family, "Bold Chinese must keep original font");
  assert.equal(light.properties.get("font-family"), light.family, "Light Chinese must keep original font");
  assert(medium.properties.get("font-family").startsWith(expectedFace), "500 weight is standard text");
  assert(!latin.properties.has("font-family"), "English-only text must not be touched");
  assert(editor.properties.get("font-family").includes("ui-monospace, Menlo"), "Editor Latin monospace must remain");
  assert(codeMirror.properties.get("font-family").includes("ui-monospace, Menlo"), "CodeMirror English monospace must remain");
  assert.equal((important.properties.get("font-family").match(/AERTEX Swei Han SC/g) || []).length, 1);
  const fresh = body.append(new FakeElement("SPAN", "动态插入中文 English"));
  observer.callback([{ type: "childList", addedNodes: [fresh] }]);
  assert(fresh.properties.get("font-family").startsWith(expectedFace), "New elements must be styled");
}
emulate("zh-cn");
emulate("zh-tw");

const roots = ["worker.js", "auth-entry.js", "gpt-worker.js", "cash-worker.js", "watch-worker.js", "admin-worker.js"];
for (const path of roots) {
  const content = fs.readFileSync(new URL("../" + path, import.meta.url), "utf8");
  assert(content.includes("sweiFontAssetResponse("), "Font assets not wired in " + path);
  assert(content.includes("injectSweiFont"), "HTML not wired in " + path);
}
console.log("Swei Halfmoon Chinese-only font checks passed (SC/TC, 400/500, English, bold, light, editor, dynamic DOM, CSP and hosts).");
