import fs from "node:fs";
import { globalSearchMatchScore } from "../studio/global-search-api.js";
import { globalSearchContent } from "../studio/ui-global-search.js";

const worker = fs.readFileSync(new URL("../worker.js", import.meta.url), "utf8");
const entry = fs.readFileSync(new URL("../studio/entry.js", import.meta.url), "utf8");
const edge = fs.readFileSync(new URL("../studio/edge-protection.js", import.meta.url), "utf8");

assert(globalSearchMatchScore("OpenAI", "OpenAI") === 0, "Exact title match should rank first");
assert(globalSearchMatchScore("Open", "OpenAI API") < globalSearchMatchScore("Open", "Reference", "Use Open here"), "Title prefix must outrank body matches");
assert(globalSearchMatchScore("完全不存在", "OpenAI", "Documentation") === null, "Unmatched records must be excluded");

for (const zh of [true, false]) {
  const markup = globalSearchContent(zh);
  assert(markup.includes("/api/search/global"), "Global search UI must call the Worker search endpoint");
  assert(markup.includes("credentials:'same-origin'"), "Global search UI must use the HttpOnly same-origin session");
  assert(!markup.includes("Authorization"), "Global search UI must not read or send bearer tokens");
  assert(markup.includes("data-search-filter=\"knowledge\""), "Knowledge filter is missing");
  assert(markup.includes("data-search-filter=\"community_link\""), "Community filter is missing");
  assert(markup.includes("data-search-filter=\"curated_link\""), "Curated filter is missing");

  const scripts = [...markup.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  assert(scripts.length > 0, "Global search UI must include its client runtime");
  for (const code of scripts) new Function(code);
}

assert(worker.includes('pathname === "/api/search/global"'), "Worker is missing the global search API route");
assert(worker.includes("handleGlobalSearch(request, env)"), "Worker does not dispatch global search through its API boundary");
assert(entry.includes('pathname === "/info/search"'), "Studio entry does not mount the global search workspace");
assert(entry.includes("globalSearchContent(zh)"), "Global search workspace renderer is not mounted");
assert(edge.includes('"/api/search/global"'), "Global search must remain behind the expensive-endpoint limiter");

console.log("Global search checks passed.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
