import { WORK_TEX_EXPLORER_STYLE } from "./ui-work-tex-explorer-style.js";
import { WORK_TEX_EXPLORER_TREE } from "./ui-work-tex-explorer-tree.js";
import { WORK_TEX_EXPLORER_COMMANDS } from "./ui-work-tex-explorer-commands.js";

export function enhanceWorkTexExplorer(markup, zh = true) {
  const output = String(markup || "");
  const tree = WORK_TEX_EXPLORER_TREE.replace("__ZH__", zh ? "true" : "false");
  const commands = WORK_TEX_EXPLORER_COMMANDS.replace("__ZH__", zh ? "true" : "false");
  // Work TeX is often composed as an HTML fragment with no </body> tag.
  // Append after the existing editor/runtime scripts so commands exist first.
  return output +
    '<style id="aertex-work-tex-explorer-style">' + WORK_TEX_EXPLORER_STYLE + '</style>' +
    '<script id="aertex-work-tex-explorer-tree">' + tree + '</script>' +
    '<script id="aertex-work-tex-explorer-commands">' + commands + '</script>';
}
