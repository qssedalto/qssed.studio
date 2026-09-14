import fs from "node:fs";
import { texWorkbenchContent } from "../studio/ui-tex-workbench.js";
import { LAB_TOOLS } from "../studio/lab-tools.js";

const worker = fs.readFileSync(new URL("../worker.js", import.meta.url), "utf8");
const entry = fs.readFileSync(new URL("../studio/entry.js", import.meta.url), "utf8");
const config = fs.readFileSync(new URL("../studio/config.js", import.meta.url), "utf8");
const edge = fs.readFileSync(new URL("../studio/edge-protection.js", import.meta.url), "utf8");
const api = fs.readFileSync(new URL("../studio/tex-api.js", import.meta.url), "utf8");

for (const zh of [true, false]) {
  const markup = texWorkbenchContent(zh);
  for (const endpoint of ["/api/tex/status", "/api/tex/documents", "/api/tex/runs", "/api/tex/compile"]) {
    assert(markup.includes(endpoint), `TeX Workbench is missing ${endpoint}`);
  }
  assert(markup.includes("credentials:'same-origin'"), "TeX browser runtime must use the HttpOnly same-origin session");
  assert(!markup.includes("Authorization"), "TeX browser runtime must not read or send bearer tokens");
  assert(markup.includes("id=\"tex-template\""), "TeX template selector is missing");
  assert(markup.includes("id=\"tex-engine\""), "TeX engine selector is missing");
  assert(markup.includes("id=\"tex-download\""), "TeX source download is missing");
  assert(markup.includes("id=\"tex-compile\""), "TeX compile control is missing");
  const scripts = [...markup.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  assert(scripts.length > 0, "TeX Workbench must include a client runtime");
  for (const code of scripts) new Function(code);
}

const texTool = LAB_TOOLS.find(tool => tool.id === "tex-workbench");
assert(texTool?.status === "ready", "TeX Workbench must be live in the Lab registry");
assert(texTool?.href === "/workspace/experiments/tex", "TeX Workbench registry route is wrong");

assert(config.includes('"/workspace/experiments/tex"'), "TeX Workbench route is missing from protected OS routes");
assert(entry.includes('pathname === "/workspace/experiments/tex"'), "Studio entry does not mount the TeX Workbench");
assert(entry.includes("texWorkbenchContent(zh)"), "TeX Workbench renderer is not wired");
assert(entry.includes('labSubroute ? "/workspace/experiments"'), "TeX subroute must keep the Lab shell selected");
assert(worker.includes('pathname.startsWith("/api/tex/")'), "Worker is missing the TeX API boundary");
assert(worker.includes("handleTexApi(request, env"), "Worker does not dispatch TeX requests through the server boundary");

for (const endpoint of ["/api/tex/documents", "/api/tex/runs", "/api/tex/compile", "/api/tex/result"]) {
  assert(edge.includes(`"${endpoint}"`), `${endpoint} must remain behind expensive-endpoint protection`);
}

assert(api.includes('const DOCUMENT_ROOT = "_system/tex-documents/"'), "TeX documents must use a hidden account-scoped R2 namespace");
assert(api.includes('const RUN_ROOT = "_system/tex-runs/"'), "TeX runs must use a hidden account-scoped R2 namespace");
assert(api.includes('const RESULT_ROOT = "_system/tex-results/"'), "TeX PDF results must use a hidden account-scoped R2 namespace");
assert(api.includes("owner_id: userId"), "TeX document ownership must be bound server-side");
assert(api.includes('new Set(["xelatex", "lualatex", "pdflatex"])'), "TeX engines must be allowlisted");
assert(api.includes("TEX_COMPILER_URL") && api.includes("TEX_COMPILER_TOKEN"), "TeX compiler bridge must use server-only configuration");
assert(api.includes('redirect: "error"'), "Compiler bridge must reject redirects");
assert(api.includes("shell_escape: false"), "Compiler contract must disable shell escape");
assert(api.includes("network: false"), "Compiler contract must request network isolation");
assert(api.includes("isSameOriginMutation(request)"), "TeX writes must enforce same-origin requests");
assert(!/child_process|\bexecSync\b|\bexec\s*\(|\bspawn\s*\(/.test(api), "TeX Worker code must not expose local process execution");

console.log("TeX Workbench checks passed.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
