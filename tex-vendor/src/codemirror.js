// Keep one CodeMirror 6 dependency graph, including every language parser.
// Served from the Work origin; no CDN ESM and no duplicated @codemirror/state.
export { EditorView, basicSetup } from "codemirror";
export { EditorState } from "@codemirror/state";
export { StreamLanguage } from "@codemirror/language";
export { stex } from "@codemirror/legacy-modes/mode/stex";

import { python } from "@codemirror/legacy-modes/mode/python";
import { javascript, json, typescript } from "@codemirror/legacy-modes/mode/javascript";
import { yaml } from "@codemirror/legacy-modes/mode/yaml";
import { css, sCSS, less } from "@codemirror/legacy-modes/mode/css";
import { xml, html } from "@codemirror/legacy-modes/mode/xml";
import { markdown } from "@codemirror/legacy-modes/mode/markdown";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { powerShell } from "@codemirror/legacy-modes/mode/powershell";
import { c, cpp, java, csharp, kotlin } from "@codemirror/legacy-modes/mode/clike";
import { r } from "@codemirror/legacy-modes/mode/r";
import { standardSQL } from "@codemirror/legacy-modes/mode/sql";
import { go } from "@codemirror/legacy-modes/mode/go";
import { rust } from "@codemirror/legacy-modes/mode/rust";
import { swift } from "@codemirror/legacy-modes/mode/swift";
import { ruby } from "@codemirror/legacy-modes/mode/ruby";
import { lua } from "@codemirror/legacy-modes/mode/lua";
import { toml } from "@codemirror/legacy-modes/mode/toml";
import { dockerFile } from "@codemirror/legacy-modes/mode/dockerfile";
import { diff } from "@codemirror/legacy-modes/mode/diff";

const languagesByExtension = Object.freeze({
  py:python, pyw:python, pyi:python, ipynb:json,
  js:javascript, jsx:javascript, mjs:javascript, cjs:javascript,
  ts:typescript, tsx:typescript, mts:typescript, cts:typescript,
  json, jsonc:json, geojson:json, jsonl:json,
  yaml, yml:yaml,
  css, scss:sCSS, less,
  html, htm:html, xml, svg:xml, xhtml:html,
  md:markdown, markdown, mdx:markdown,
  sh:shell, bash:shell, zsh:shell, fish:shell, ps1:powerShell, psm1:powerShell,
  c, h:c, cpp, cxx:cpp, cc:cpp, hpp:cpp, hh:cpp, hxx:cpp,
  java, cs:csharp, kt:kotlin, kts:kotlin,
  r, rmd:r, sql:standardSQL, go, rs:rust, swift,
  rb:ruby, rake:ruby, lua, toml, dockerfile:dockerFile,
  patch:diff, diff
});

export function parserForFilename(filename) {
  const name = String(filename || "").split("/").pop().toLowerCase();
  if (!name) return null;
  if (name === "dockerfile" || name.startsWith("dockerfile.")) return dockerFile;
  if (name === ".bashrc" || name === ".zshrc" || name === ".profile") return shell;
  const extension = name.includes(".") ? name.split(".").pop() : "";
  return languagesByExtension[extension] || null;
}
