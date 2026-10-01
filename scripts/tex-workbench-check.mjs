import fs from "node:fs";
import { texWorkbenchContent } from "../studio/ui-tex-workbench.js";
import { enhanceTexWorkbenchLocal } from "../studio/ui-tex-local.js";
import { polishTexWorkbenchApp } from "../studio/ui-tex-app.js";
import { enhanceWorkTexCollapsiblePanels } from "../studio/ui-work-tex-panels.js";
import { LAB_TOOLS } from "../studio/lab-tools.js";

const worker = fs.readFileSync(new URL("../worker.js", import.meta.url), "utf8");
const entry = fs.readFileSync(new URL("../studio/entry.js", import.meta.url), "utf8");
const config = fs.readFileSync(new URL("../studio/config.js", import.meta.url), "utf8");
const edge = fs.readFileSync(new URL("../studio/edge-protection.js", import.meta.url), "utf8");
const api = fs.readFileSync(new URL("../studio/tex-api-core.js", import.meta.url), "utf8");
const apiWrapper = fs.readFileSync(new URL("../studio/tex-api.js", import.meta.url), "utf8");
const versionApi = fs.readFileSync(new URL("../studio/tex-version-api.js", import.meta.url), "utf8");

for (const zh of [true, false]) {
  const markup = texWorkbenchContent(zh);
  for (const endpoint of ["/api/tex/status", "/api/tex/documents", "/api/tex/runs", "/api/tex/compile"]) assert(markup.includes(endpoint), `TeX Workbench is missing ${endpoint}`);
  assert(markup.includes("credentials:'same-origin'"), "TeX browser runtime must use the HttpOnly same-origin session");
  assert(!markup.includes("Authorization"), "TeX browser runtime must not read or send bearer tokens");
  assert(markup.includes("id=\"tex-template\""), "TeX template selector is missing");
  assert(markup.includes("id=\"tex-engine\""), "TeX engine selector is missing");
  assert(markup.includes("id=\"tex-download\""), "TeX source download is missing");
  assert(markup.includes("id=\"tex-compile\""), "TeX compile control is missing");
  const scripts = [...markup.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  assert(scripts.length > 0, "TeX Workbench must include a client runtime");
  for (const code of scripts) new Function(code);

  const workMarkup = enhanceWorkTexCollapsiblePanels(polishTexWorkbenchApp(enhanceTexWorkbenchLocal(markup, zh), zh), zh);
  assert(workMarkup.includes("tex-work-app"), "Work TeX route must render the dedicated app surface");
  assert(workMarkup.includes("tex-live-preview-switch"), "Live preview must use the custom switch instead of a native checkbox UI");
  assert(!workMarkup.includes('class="tex-live-switch"'), "Live preview switch class must match its CSS selector");
  assert(workMarkup.includes("data-tex-start-template=\"blank\""), "Work TeX start surface must expose quick templates");
  assert(workMarkup.includes(".tex-start-surface>.tex-start-grid"), "Start grid must override the legacy placeholder direct-child sizing rule");
  assert(workMarkup.includes("width:min(100%,650px)!important"), "Start grid must retain a usable responsive width");
  assert(workMarkup.includes(".tex-start-surface>.tex-start-copy"), "Start copy must escape the legacy 52px placeholder box");
  assert(workMarkup.includes("focus-within"), "TeX search focus styling must be explicitly controlled");
  assert(workMarkup.includes("appearance:none!important"), "TeX selectors must use the controlled arrow treatment");
  assert(workMarkup.includes('class="tex-panel-title"'), "Document count must sit beside the Documents label");
  assert(workMarkup.includes('id="tex-left-panel-toggle"'), "Work TeX must expose a left-panel collapse control");
  assert(workMarkup.includes('id="tex-right-panel-toggle"'), "Work TeX must expose a right-panel collapse control");
  assert(workMarkup.includes("is-left-collapsed") && workMarkup.includes("is-right-collapsed"), "Work TeX must implement independent panel states");
  assert(workMarkup.includes("qsseda.work.tex.panel-layout.v1"), "Work TeX panel state must persist across reloads");
  assert(workMarkup.includes('id="qsseda-work-tex-mobile-ui"'), "Work TeX must include the dedicated mobile layout");
  assert(workMarkup.includes("tex-mobile-tabs"), "Mobile Work TeX must expose Documents, Edit, and PDF tabs");
  assert(workMarkup.includes('data-mobile-pane="documents"') && workMarkup.includes('data-mobile-pane="editor"') && workMarkup.includes('data-mobile-pane="preview"'), "Mobile Work TeX must expose all three workspace panes");
  assert(workMarkup.includes("--tex-mobile-vh"), "Mobile Work TeX must track the visual viewport for keyboard-safe sizing");
  assert(workMarkup.includes("visualViewport"), "Mobile Work TeX must respond to the on-screen keyboard viewport");
  assert(workMarkup.includes("qsseda.work.tex.mobile-pane.v1"), "Mobile Work TeX must preserve the active pane within the session");
  assert(workMarkup.includes("pointer:coarse"), "Phone landscape layouts must use the mobile workspace on touch devices");
  assert(workMarkup.includes('id="qsseda-work-tex-mobile-tools"'), "Mobile Work TeX must include the quick-input toolbar styles");
  assert(workMarkup.includes("tex-mobile-inputbar"), "Mobile Work TeX must expose the TeX quick-input toolbar");
assert(workMarkup.includes(".cm-content:focus-visible") && workMarkup.includes("box-shadow:none!important"), "CodeMirror mobile focus must not inherit the global accent halo.");
assert(workMarkup.includes("viewportTop + viewportHeight"), "Mobile Work TeX must size to the actual iOS visual viewport bottom while the keyboard is open.");
assert(workMarkup.includes("height:calc(var(--tex-mobile-vh,100dvh) - 12px)"), "Mobile collaboration drawer must have a definite viewport-constrained height.");
assert(workMarkup.includes("touch-action:pan-y!important"), "Mobile collaboration pages must retain vertical touch scrolling.");
  assert(workMarkup.includes("setRangeText"), "Mobile TeX quick input must insert at the current selection");
  assert(workMarkup.includes("pointerdown") && workMarkup.includes("preventDefault"), "Mobile TeX quick input must preserve textarea focus while tapping toolbar buttons");
  assert(workMarkup.includes('id="qsseda-work-tex-version-history-runtime"'), "Work TeX must install cloud source version history");
  assert(workMarkup.includes("/api/tex/versions?action=snapshot"), "Manual local compile must snapshot its cloud source version first");
  assert(workMarkup.includes("/api/tex/versions?action=restore"), "Version history must support cloud rollback");
  assert(workMarkup.includes("Download PDF") || workMarkup.includes("下载 PDF"), "Historical versions must support on-demand local PDF download");
  const appScripts = [...workMarkup.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  for (const code of appScripts) new Function(code);
}

const texTool = LAB_TOOLS.find(tool => tool.id === "tex-workbench");
assert(texTool?.status === "ready", "TeX Workbench must remain live in the tool registry");
assert(texTool?.href === "/work/tex", "TeX Workbench registry must point at the Work route");
assert(config.includes('"/work/tex"'), "Work TeX route is missing from protected OS routes");
assert(config.includes('["/workspace/experiments/tex", "/work/tex"]'), "Legacy TeX route must redirect to Work TeX");
assert(entry.includes('pathname === "/work/tex"'), "Studio entry does not mount the Work TeX app");
assert(entry.includes("enhanceWorkTexCollapsiblePanels(polishTexWorkbenchApp(enhanceTexWorkbenchLocal(texWorkbenchContent(zh), zh), zh), zh)"), "Work TeX collapsible panel renderer is not wired");
assert(entry.includes("polishTexWorkbenchApp(enhanceTexWorkbenchLocal(texWorkbenchContent(zh), zh), zh)"), "Work TeX app renderer is not wired");
assert(worker.includes('pathname.startsWith("/api/tex/")'), "Worker is missing the TeX API boundary");
assert(worker.includes("handleTexApi(request, env"), "Worker does not dispatch TeX requests through the server boundary");
for (const endpoint of ["/api/tex/documents", "/api/tex/runs", "/api/tex/compile", "/api/tex/result"]) assert(edge.includes(`"${endpoint}"`), `${endpoint} must remain behind expensive-endpoint protection`);

assert(api.includes('const DOCUMENT_ROOT = "_system/tex-documents/"'), "TeX documents must use a hidden account-scoped R2 namespace");
assert(api.includes('const RUN_ROOT = "_system/tex-runs/"'), "Legacy TeX run metadata must remain readable during migration");
assert(api.includes('const RESULT_ROOT = "_system/tex-results/"'), "Legacy TeX PDF results must remain addressable for cleanup");
assert(api.includes("owner_id: userId"), "TeX document ownership must be bound server-side");
assert(api.includes('new Set(["xelatex", "lualatex", "pdflatex"])'), "TeX engines must be allowlisted");
assert(api.includes("TEX_COMPILER_URL") && api.includes("TEX_COMPILER_TOKEN"), "Legacy compiler bridge must remain server-only");
assert(api.includes('redirect: "error"'), "Compiler bridge must reject redirects");
assert(api.includes("shell_escape: false"), "Compiler contract must disable shell escape");
assert(api.includes("network: false"), "Compiler contract must request network isolation");
assert(api.includes("isSameOriginMutation(request)"), "TeX writes must enforce same-origin requests");
assert(!/child_process|\bexecSync\b|\bexec\s*\(|\bspawn\s*\(/.test(api), "TeX Worker code must not expose local process execution");

assert(apiWrapper.includes('action === "versions"'), "TeX API wrapper must route version history requests");
assert(apiWrapper.includes("snapshotDocumentVersion"), "Document mutations must feed the smart version store");
assert(versionApi.includes('const VERSION_ROOT = "_system/tex-versions/"'), "TeX versions must use a hidden source-only R2 namespace");
assert(versionApi.includes("AUTOSAVE_WINDOW_MS"), "Version storage must coalesce rapid autosaves");
assert(versionApi.includes("pruneSmartVersions"), "Version storage must thin older autosave snapshots");
assert(versionApi.includes('action === "restore"'), "Version API must support rollback");
assert(versionApi.includes("purgeLegacyPdfResults"), "Version history must remove legacy persistent PDFs");
assert(!versionApi.includes('Content-Type", "application/pdf"'), "Version API must never persist PDF data");

console.log("TeX Workbench checks passed.");
function assert(condition, message) { if (!condition) throw new Error(message); }
