import fs from "node:fs";

const corePath = "studio/ui-core.js";
const pagePath = "studio/ui-page.js";
const consumers = [
  "studio/auth-handoff.js",
  "studio/auth-pages.js",
  "studio/ui-shell.js"
];

if (!fs.existsSync(corePath)) throw new Error("studio/ui-core.js is missing");
if (fs.existsSync(pagePath)) throw new Error("studio/ui-page.js already exists");

const core = fs.readFileSync(corePath, "utf8");
for (const marker of [
  "export function baseHead(title)",
  "export function supabaseScript()",
  "export function themeToggle()",
  "export function languageToggle(links, t)",
  "export function topControls(links, t)",
  "export function themeScript()"
]) {
  if (!core.includes(marker)) throw new Error("Expected page primitive missing before rename: " + marker);
}
if (core.includes("auditClientScript")) throw new Error("Phase 4B input still contains auditClientScript");

fs.writeFileSync(pagePath, core);
fs.unlinkSync(corePath);

for (const path of consumers) {
  let source = fs.readFileSync(path, "utf8");
  const before = source;
  source = source.replaceAll('from "./ui-core.js"', 'from "./ui-page.js"');
  if (source === before) throw new Error(path + " did not import ui-core.js as expected");
  if (source.includes('from "./ui-core.js"')) throw new Error(path + " still imports ui-core.js");
  fs.writeFileSync(path, source);
}

for (const path of fs.readdirSync("studio").filter(name => name.endsWith(".js"))) {
  const source = fs.readFileSync("studio/" + path, "utf8");
  if (source.includes('from "./ui-core.js"')) throw new Error("Remaining ui-core.js import in studio/" + path);
}

console.log("Renamed the remaining neutral ui-core.js page infrastructure to ui-page.js and rewired its three consumers.");
