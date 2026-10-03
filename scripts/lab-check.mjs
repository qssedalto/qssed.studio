import fs from "node:fs";
import { LAB_TOOL_CATEGORIES, LAB_TOOLS, LAB_TOOL_LOCALIZATIONS } from "../studio/lab-tools.js";
import { labContent } from "../studio/ui-lab.js";

const entry = fs.readFileSync(new URL("../studio/entry.js", import.meta.url), "utf8");
const registrySource = fs.readFileSync(new URL("../studio/lab-tools.js", import.meta.url), "utf8");

assert(LAB_TOOLS.length >= 8, "Lab registry should provide a meaningful initial tool catalog");
const ids = new Set();
for (const tool of LAB_TOOLS) {
  assert(typeof tool.id === "string" && tool.id.length > 0, "Each Lab tool needs an id");
  assert(!ids.has(tool.id), `Duplicate Lab tool id: ${tool.id}`);
  ids.add(tool.id);
  assert(Boolean(LAB_TOOL_CATEGORIES[tool.category]), `Unknown Lab category for ${tool.id}`);
  assert(tool.status === "ready" || tool.status === "planned", `Invalid Lab status for ${tool.id}`);
  assert(Boolean(tool.title?.zh && tool.title?.en), `Missing bilingual title for ${tool.id}`);
  assert(Boolean(tool.description?.zh && tool.description?.en), `Missing bilingual description for ${tool.id}`);
  assert(Array.isArray(tool.capabilities?.zh) && tool.capabilities.zh.length > 0, `Missing Chinese capabilities for ${tool.id}`);
  assert(Array.isArray(tool.capabilities?.en) && tool.capabilities.en.length > 0, `Missing English capabilities for ${tool.id}`);
  if (tool.status === "ready") {
    assert(typeof tool.href === "string" && tool.href.startsWith("/"), `Ready Lab tool needs a local href: ${tool.id}`);
    assert(!tool.href.startsWith("//"), `Ready Lab tool href must remain same-origin: ${tool.id}`);
  } else {
    assert(!tool.href, `Planned Lab tool must not expose a fake clickable href: ${tool.id}`);
  }
}

assert(LAB_TOOLS.some(tool => tool.id === "tex-workbench" && tool.status === "ready"), "Lab registry must expose the live TeX Workbench");
assert(LAB_TOOLS.some(tool => tool.category === "tex" && tool.status === "planned"), "Lab registry should retain a TeX/document expansion slot");
assert(LAB_TOOLS.some(tool => tool.category === "ai" && tool.status === "planned"), "Lab registry needs an AI expansion slot");
assert(LAB_TOOLS.some(tool => tool.category === "media" && tool.status === "planned"), "Lab registry needs a media expansion slot");
assert(LAB_TOOLS.filter(tool => tool.status === "ready").length >= 5, "Lab should expose the existing live Studio tools and TeX Workbench");
assert(!registrySource.includes("api_key"), "Lab registry must not contain API keys");
assert(!registrySource.includes("secret"), "Lab registry must not contain secrets");

for (const locale of ["zh-tw","ja-jp","ko-kr","fr-fr","es-es","el-gr","ar-sa"]) {
  const registry = LAB_TOOL_LOCALIZATIONS[locale];
  assert(Boolean(registry), "Missing Lab localization registry for " + locale);
  for (const tool of LAB_TOOLS) {
    const localized = registry.tools?.[tool.id];
    assert(Array.isArray(localized) && localized.length === 3, "Missing localized Lab tool for " + locale + ": " + tool.id);
    assert(localized[0] && localized[1] && Array.isArray(localized[2]) && localized[2].length > 0, "Incomplete localized Lab tool for " + locale + ": " + tool.id);
  }
}

for (const [locale, expected] of [["zh-tw","實驗室"],["ja-jp","ラボ"],["ko-kr","랩"],["fr-fr","Registre des outils"],["es-es","Registro de herramientas"],["el-gr","Μητρώο εργαλείων"],["ar-sa","سجل الأدوات"]]) {
  const markup = labContent(false, locale);
  assert(markup.includes(expected), "Lab translation missing for " + locale);
  assert(markup.includes('const prefix="' + "/" + locale + '";'), "Lab must preserve locale prefix for " + locale);
  const scripts = [...markup.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  for (const code of scripts) new Function(code);
}

for (const zh of [true, false]) {
  const markup = labContent(zh);
  assert(markup.includes("data-lab-root"), "Lab root is missing");
  assert(markup.includes("data-lab-status=\"ready\""), "Lab ready filter is missing");
  assert(markup.includes("data-lab-status=\"planned\""), "Lab planned filter is missing");
  assert(markup.includes("data-lab-category"), "Lab category filters are missing");
  assert(markup.includes("data-lab-search"), "Lab searchable registry data is missing");
  assert(!markup.includes("fetch("), "Lab registry page must not introduce an unnecessary backend API");
  const scripts = [...markup.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  assert(scripts.length > 0, "Lab must include a filter/search runtime");
  for (const code of scripts) new Function(code);
}

assert(entry.includes('pathname === "/workspace/experiments"'), "Studio entry does not mount Lab");
assert(entry.includes("labContent(zh, fullLocale)"), "Lab renderer must receive the full locale");

console.log("Lab registry checks passed.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
