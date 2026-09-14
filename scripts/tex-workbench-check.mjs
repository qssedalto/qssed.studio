import fs from "node:fs";
import { texWorkbenchContent } from "../studio/ui-tex-workbench.js";
import { enhanceTexWorkbenchLocal } from "../studio/ui-tex-local.js";
import { polishTexWorkbenchApp } from "../studio/ui-tex-app.js";
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

  const workMarkup = polishTexWorkbenchApp(enhanceTexWorkbenchLocal(markup, zh), zh);
  assert(workMarkup.includes("tex-work-app"), "Work TeX route must render the dedicated app surface");
  assert(workMarkup.includes("tex-live-preview-switch"), "Live preview must use the custom switch instead of a native checkbox UI");
  assert(!workMarkup.includes('class="tex-live-switch"'), "Live preview switch class must match its CSS selector");
  assert(workMarkup.includes("data-tex-start-template=\"blank\""), "Work TeX start surface must expose quick templates");
  assert(workMarkup.includes(".tex-start-surface>.tex-start-grid"), "Start grid must override the legacy placeholder direct-child sizing rule");
  assert(workMarkup.includes("width:min(100%,650px)!important"), "Start grid must retain a usable responsive width");
  assert(workMarkup.includes(".tex-start-surface>.tex-start-copy"), "Start copy must escape the legacy 52px placeholder box");
  assert(workMarkup.includes("focus-within"), "TeX search focus styling must be explicitly controlled");
  assert(workMarkup.includes("appearance:none!important"), "TeX selectors must use the controlled arrow treatment");
  const appScripts = [...workMarkup.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  for (const code of appScripts) new Function(code);
}

const texTool = LAB_TOOLS.find(tool => tool.id === "tex-workbench");
assert(texTool?.status === "ready", "TeX Workbench must remain live in the tool registry");
assert(texTool?.href === "/work/tex", "TeX Workbench registry must point at the Work route");

assert(config.includes('"/work/tex"'), "Work TeX route is missing from protected OS routes");
assert(config.includes('["/workspace/experiments/tex", "/work/tex"]'), "Legacy TeX route must redirect to Work TeX");
assert(entry.includes('pathname === "/work/tex"'), "Studio entry does not mount the Work TeX app");
assert(entry.includes("polishTexWorkbenchApp(enhanceTexWorkbenchLocal(texWorkbenchContent(zh), zh), zh)"), "Work TeX app renderer is not wired");
assert(entry.includes('pathname === "/work/tex" ? { allowLoopback: true }') || entry.includes('pathname === "/work/tex" || pathname === "/workspace/experiments/tex"'), "Work TeX must keep scoped loopback CSP access");
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
