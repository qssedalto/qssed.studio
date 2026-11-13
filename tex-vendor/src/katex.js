import katex from "katex";

// MathML-only output uses the browser's native math layout. It needs no KaTeX
// stylesheet or remote font assets, and it keeps TeX source on the client.
export function renderTexMath(source, displayMode = false) {
  return katex.renderToString(String(source ?? ""), {
    output: "mathml",
    displayMode: Boolean(displayMode),
    throwOnError: false,
    trust: false,
    strict: "ignore",
    maxExpand: 800,
    maxSize: 18,
  });
}
