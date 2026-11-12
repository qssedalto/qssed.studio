import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(await readFile(resolve(root, "tex-vendor/package.json"), "utf8"));
const wrangler = await readFile(resolve(root, "wrangler.work.jsonc"), "utf8");
assert.match(wrangler, /"assets"\s*:\s*\{\s*"directory"\s*:\s*"\.\/tex-vendor\/dist"/, "Work Worker must serve browser vendor assets.");
assert.equal(pkg.private, true, "Vendor modules must not be accidentally published as an npm package.");

for (const [name, symbols] of [
  ["codemirror", ["EditorView", "basicSetup", "StreamLanguage", "stex"]],
  ["yjs", ["Doc", "applyUpdate", "encodeStateAsUpdate", "createRelativePositionFromTypeIndex"]]
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
assert(editor.includes("import('/assets/tex/codemirror.js')") ||
  editor.includes("timedModule('/assets/tex/codemirror.js'"),
  "CodeMirror must load exclusively from the Work origin");
assert(realtime.includes("import('/assets/tex/yjs.js')"),
  "Yjs must load exclusively from the Work origin");
assert(!/(?:cdn\.jsdelivr\.net|esm\.sh)/.test(editor+realtime),
  "Runtime must not import either TeX module from a CDN.");
console.log("TeX self-hosted asset bundling and same-origin runtime checks passed.");
