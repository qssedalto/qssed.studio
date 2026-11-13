// Minimal self-hosted Markdown StreamParser for CodeMirror 6.
// @codemirror/legacy-modes never shipped mode/markdown; importing that
// nonexistent module aborts the entire Work editor vendor bundle.
// A separate CodeMirror @lang-markdown extension would require a compatible
// dependency/lockfile update; keep lightweight Markdown highlighting in the
// StreamLanguage API used for every non-TeX project asset.
export const markdown = {
  startState() { return { fence: "" }; },
  copyState(state) { return { fence: state.fence }; },
  token(stream, state) {
    if (stream.sol()) {
      if (state.fence) {
        const close = state.fence === "`" ? /^ {0,3}`{3,}\s*$/ : /^ {0,3}~{3,}\s*$/;
        if (stream.match(close)) { state.fence = ""; return "meta"; }
        stream.skipToEnd(); return "string";
      }
      const open = stream.match(/^ {0,3}(`{3,}|~{3,})[^\n]*/);
      if (open) { state.fence = open[1][0]; return "meta"; }
      if (stream.match(/^ {0,3}#{1,6}(?=\s|$)/)) {
        stream.skipToEnd(); return "header";
      }
      if (stream.match(/^\s*> ?/)) return "quote";
      if (stream.match(/^\s*(?:[-+*]|\d+[.)])(?=\s)/)) return "variable-2";
      if (stream.match(/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/)) return "hr";
    }
    if (stream.match(/^`[^`\n]+`/)) return "string";
    if (stream.match(/^(?:\*\*|__)(?=\S)[\s\S]*?(?:\*\*|__)/)) return "strong";
    if (stream.match(/^\*[^*\n]+\*|^_[^_\n]+_/)) return "emphasis";
    if (stream.match(/^~~[^~\n]+~~/)) return "strikethrough";
    if (stream.match(/^!?\[[^\]\n]+\]\([^\)\n]+\)/)) return "link";
    if (stream.match(/^<https?:\/\/[^\s>]+>/)) return "link";
    stream.next(); return null;
  }
};
