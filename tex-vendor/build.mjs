import { build } from "esbuild";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const base = dirname(fileURLToPath(import.meta.url));
const outdir = resolve(base, "dist/assets/tex");
await rm(resolve(base, "dist"), { force: true, recursive: true });
await mkdir(outdir, { recursive: true });

const builds = [
  ["codemirror", "src/codemirror.js"],
  ["yjs", "src/yjs.js"],
  ["katex", "src/katex.js"],
  ["markdown-visual", "src/markdown-visual.js"]
];
for (const [name, entry] of builds) {
  const result = await build({
    entryPoints: [resolve(base, entry)],
    outfile: join(outdir, name + ".js"),
    bundle: true,
    write: false,
    platform: "browser",
    format: "esm",
    splitting: false,
    target: ["safari15", "chrome100"],
    minify: true,
    treeShaking: true,
    charset: "utf8",
    legalComments: "eof",
    logLevel: "error"
  });
  if (result.outputFiles.length !== 1) throw new Error("Expected a single self-contained browser ESM asset: " + name);
  const code = result.outputFiles[0].text;
  if (/(?:\bimport\s*(?:\(|\{|\*|["'])|\bfrom\s*["'])\s*["']?(?:https?:|\/\/)/.test(code)) {
    throw new Error("Unexpected external module reference in " + name);
  }
  const sha = createHash("sha256").update(code).digest("hex");
  await writeFile(join(outdir, name + ".js"), code);
  console.log("Self-hosted " + name + ".js: " + code.length + " bytes; sha256=" + sha);
}

console.log("Browser assets generated under tex-vendor/dist/assets/tex/.");
