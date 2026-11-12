// Site-wide normal-weight Chinese font. English, bold and light text retain their prior computed families.
// Upstream: https://github.com/max32002/swei-halfmoon (SIL Open Font License 1.1).
export const SWEI_FONT_CSS_PATH = "/_aertex/swei-han.css";
export const SWEI_FONT_JS_PATH = "/_aertex/swei-han.js";
export const SWEI_FONT_CSS = "/* Swei Half Moon © max32002 and Source Han Sans authors, SIL OFL 1.1.\n   https://github.com/max32002/swei-halfmoon\n   Only Han ideographs / Chinese punctuation use this face. Latin, kana and Hangul\n   have no glyph coverage in this @font-face and retain their existing fonts. */\n@font-face {\n  font-family: \"AERTEX Swei Han SC\";\n  src: url(\"https://cdn.jsdelivr.net/gh/max32002/swei-halfmoon@2.125/WebFont/CJK%20SC/SweiHalfMoonCJKsc-Regular.woff2\") format(\"woff2\");\n  font-style: normal;\n  font-weight: 400 500;\n  font-display: swap;\n  unicode-range: U+2E80-2FFF, U+3000-303F, U+31C0-31EF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FE10-FE4F, U+FF01-FF60, U+20000-2FA1F;\n}\n@font-face {\n  font-family: \"AERTEX Swei Han TC\";\n  src: url(\"https://cdn.jsdelivr.net/gh/max32002/swei-halfmoon@2.125/WebFont/CJK%20TC/SweiHalfMoonCJKtc-Regular.woff2\") format(\"woff2\");\n  font-style: normal;\n  font-weight: 400 500;\n  font-display: swap;\n  unicode-range: U+2E80-2FFF, U+3000-303F, U+31C0-31EF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FE10-FE4F, U+FF01-FF60, U+20000-2FA1F;\n}";
export const SWEI_FONT_JS = "(() => {\n  if (window.__aertexSweiHanReady) return;\n  window.__aertexSweiHanReady = true;\n\n  const han = /[\\u2e80-\\u2fff\\u3000-\\u303f\\u31c0-\\u31ef\\u3400-\\u4dbf\\u4e00-\\u9fff\\uf900-\\ufaff\\ufe10-\\ufe4f\\uff01-\\uff60\\u{20000}-\\u{2fa1f}]/u;\n  const locale = String(document.documentElement.lang || '').toLowerCase();\n  const face = /^zh-(?:tw|hk|mo|hant)/.test(locale)\n    ? '\"AERTEX Swei Han TC\"'\n    : '\"AERTEX Swei Han SC\"';\n  const handled = new WeakSet();\n  const excluded = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'CANVAS', 'LINK', 'META']);\n  const fields = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'OPTION']);\n  const pending = new Set();\n  let scheduled = false;\n\n  const originalFamily = family =>\n    String(family || 'sans-serif')\n      .replace(/^[\"']?AERTEX Swei Han (?:SC|TC)[\"']?\\s*,\\s*/i, '')\n      .trim() || 'sans-serif';\n\n  function hasChineseText(element) {\n    if (fields.has(element.tagName)) {\n      if (element.tagName === 'INPUT' && /^(?:hidden|checkbox|radio|range|color|file)$/i.test(element.type || '')) return false;\n      return true;\n    }\n    if (element.isContentEditable) return true;\n    for (const child of element.childNodes) {\n      if (child.nodeType === 3 && han.test(child.nodeValue || '')) return true;\n    }\n    return false;\n  }\n\n  function collect(root) {\n    if (!root || (root.nodeType !== 1 && root.nodeType !== 9)) return [];\n    const nodes = root.nodeType === 9\n      ? document.querySelectorAll('body, body *')\n      : [root, ...root.querySelectorAll('*')];\n    const changes = [];\n    for (const element of nodes) {\n      if (!(element instanceof HTMLElement) || excluded.has(element.tagName) ||\n          handled.has(element) || element.closest('[data-aertex-swei-ignore]') ||\n          !hasChineseText(element)) continue;\n\n      const computed = getComputedStyle(element);\n      const weight = Number.parseFloat(computed.fontWeight);\n      const regular = computed.fontStyle === 'normal' &&\n        Number.isFinite(weight) && weight >= 400 && weight <= 500;\n      changes.push({\n        element,\n        family: originalFamily(computed.fontFamily),\n        regular\n      });\n    }\n    return changes;\n  }\n\n  function update(root) {\n    // Snapshot the pre-modification font stacks before styling ancestors. A\n    // descendant <strong> then keeps its original face, while English glyphs\n    // continue to resolve from the exact stack previously used by the page.\n    const changes = collect(root);\n    for (const { element, family, regular } of changes) {\n      if (handled.has(element) || !element.isConnected) continue;\n      handled.add(element);\n      element.style.setProperty('font-family', regular ? face + ', ' + family : family, 'important');\n    }\n  }\n\n  function flush() {\n    scheduled = false;\n    const roots = [...pending];\n    pending.clear();\n    for (const root of roots) update(root);\n  }\n\n  function schedule(root) {\n    if (!root) return;\n    pending.add(root);\n    if (scheduled) return;\n    scheduled = true;\n    window.requestAnimationFrame(flush);\n  }\n\n  function init() {\n    if (!document.body) return;\n    update(document);\n    const observer = new MutationObserver(records => {\n      for (const record of records) {\n        if (record.type === 'characterData') {\n          schedule(record.target.parentElement);\n        } else {\n          for (const added of record.addedNodes) {\n            if (added.nodeType === 1) schedule(added);\n            else if (added.nodeType === 3) schedule(added.parentElement);\n          }\n        }\n      }\n    });\n    observer.observe(document.body, { childList: true, characterData: true, subtree: true });\n    window.addEventListener('pagehide', () => observer.disconnect(), { once: true });\n  }\n\n  if (document.readyState === 'loading') {\n    document.addEventListener('DOMContentLoaded', init, { once: true });\n  } else {\n    init();\n  }\n})();";

export function sweiFontAssetResponse(path, method = "GET") {
  if (path !== SWEI_FONT_CSS_PATH && path !== SWEI_FONT_JS_PATH) return null;
  if (method !== "GET" && method !== "HEAD") return new Response("Method not allowed", { status: 405, headers: { allow: "GET, HEAD" } });
  const css = path === SWEI_FONT_CSS_PATH;
  return new Response(method === "HEAD" ? null : css ? SWEI_FONT_CSS : SWEI_FONT_JS, {
    headers: {
      "content-type": css ? "text/css;charset=UTF-8" : "text/javascript;charset=UTF-8",
      "cache-control": "public,max-age=31536000,immutable",
      "x-content-type-options": "nosniff"
    }
  });
}

export function injectSweiFontMarkup(markup) {
  const html = String(markup || "");
  if (!/<\/head\s*>/i.test(html) || html.includes('id="aertex-swei-css"')) return html;
  const assets = '<link id="aertex-swei-css" rel="stylesheet" href="/_aertex/swei-han.css?v=1">' +
    '<script id="aertex-swei-runtime" src="/_aertex/swei-han.js?v=1" defer></script>';
  return html.replace(/<\/head\s*>/i, assets + "</head>");
}

export async function injectSweiFontResponse(response, method = "GET") {
  if (!response || method === "HEAD" || !/text\/html/i.test(response.headers.get("content-type") || "")) return response;
  const source = await response.text();
  const markup = injectSweiFontMarkup(source);
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");
  if (source !== markup) {
    headers.delete("etag");
    const csp = headers.get("content-security-policy");
    if (csp && !/font-src\s+[^;]*https:\/\/cdn\.jsdelivr\.net/i.test(csp)) {
      const existing = /(^|;)\s*font-src\s+[^;]*/i;
      headers.set("content-security-policy", existing.test(csp)
        ? csp.replace(existing, matched => matched + " https://cdn.jsdelivr.net")
        : csp + "; font-src 'self' https://cdn.jsdelivr.net");
    }
  }
  return new Response(markup, { status: response.status, statusText: response.statusText, headers });
}
