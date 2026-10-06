/**
 * 【初学者导读】
 * 文件：scripts/global-search-check.mjs
 * 这是 CI 回归检查脚本，主题是：global search。
 * 作用：把产品架构、关键字符串、公开路由或行为假设写成自动断言；当源码被未来改动破坏时，让 Pull Request 在合并前失败。
 * 阅读方法：从 read()/加载的源码开始，再逐条看 assert；每个 assert 都应能翻译成一句“这个产品必须继续满足什么规则”。
 * 修改原则：如果 CI 失败，先判断源码是否真的违反产品规则；不要为了“变绿”直接删除断言。只有产品规则明确改变时，才应同时修改实现和检查。
 * 测试设计：优先检查用户可感知行为、安全边界和跨模块契约，避免只验证某一行代码长得是否完全一样。
 * 调试方法：先看失败断言的消息，再去对应源码确认实际值；必要时增加更小的针对性样例，而不是扩大整套测试的复杂度。
 */
import fs from "node:fs";
import { globalSearchMatchScore } from "../studio/global-search-api.js";
import { globalSearchContent } from "../studio/ui-global-search.js";
import { communityLinksPageContent, enhanceLinksHubWithCommunity } from "../studio/ui-links-community.js";

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
assert(entry.includes("globalSearchContent(zh, fullLocale)"), "Global search workspace renderer must receive the full locale");
assert(edge.includes('"/api/search/global"'), "Global search must remain behind the expensive-endpoint limiter");

for (const [locale, expectedText] of [["zh-tw","全域搜尋"],["ja-jp","グローバル検索"],["ko-kr","전체 검색"],["fr-fr","Recherche globale"],["es-es","Búsqueda global"],["el-gr","Καθολική αναζήτηση"],["ar-sa","البحث الشامل"]]) {
  const markup = globalSearchContent(false, locale);
  assert(markup.includes(expectedText), "Global search translation missing for " + locale);
  assert(markup.includes('const prefix="' + "/" + locale + '";'), "Global search must preserve locale prefix for " + locale);
  const scripts = [...markup.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  for (const code of scripts) new Function(code);
}

const jaCommunity = communityLinksPageContent(false, "ja-jp");
assert(jaCommunity.includes("コミュニティリンク"), "Community links Japanese translation missing");
assert(jaCommunity.includes('href="/ja-jp/info/links"'), "Community links back route must preserve Japanese locale");
for (const code of [...jaCommunity.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1])) new Function(code);

const arHub = enhanceLinksHubWithCommunity(
  '<button class="links-quick-submit" id="links-quick-submit" type="submit" disabled>إنشاء رابط</button><a class="links-route-card" href="/ar-sa/info/links/curated"></a><script>body:JSON.stringify({ title:inferTitle(url), url, category:\'tools\', description:\'\' })<\\/script>',
  false,
  "ar-sa"
);
assert(arHub.includes("/ar-sa/info/links/community"), "Community hub route must preserve Arabic locale");
assert(arHub.includes("النشر في المجتمع"), "Community hub Arabic translation missing");
assert(arHub.includes("community:Boolean"), "Community opt-in must still be included in the create request");

console.log("Global search checks passed.");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
