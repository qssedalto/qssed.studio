import { statusContent } from "./ui-primitives.js";
import { knowledgeContent } from "./ui-knowledge.js";
import { curatedLinksContent } from "./curated-links.js";
import { curatedLinksFavoritesEnhancer } from "./curated-links-favorites.js";

export function linksContent(zh) {
  return curatedLinksContent(zh) + curatedLinksFavoritesEnhancer(zh);
}

export function notesContent(zh) {
  return statusContent(
    zh,
    "笔记尚未开放",
    "笔记保存接口还没接入。",
    "Notes aren’t available yet",
    "Note storage is not connected yet."
  );
}

export function summariesContent(zh) {
  return statusContent(
    zh,
    "摘要尚未开放",
    "摘要数据源还没接入。",
    "Summaries aren’t available yet",
    "Summary sources are not connected yet."
  );
}

export function searchContent(zh) {
  return statusContent(
    zh,
    "全局搜索尚未开放",
    "跨模块搜索索引还没接入。",
    "Global search isn’t available yet",
    "The cross-module search index is not connected yet."
  );
}

export function informationContent(path, zh) {
  if (path === "/info") {
    return statusContent(
      zh,
      "信息中心",
      "知识库和收藏链接可以使用；笔记、摘要和全局搜索还在接入。",
      "Information",
      "Knowledge and saved links are available. Notes, summaries, and global search are still being connected."
    );
  }
  if (path === "/info/knowledge" || path.startsWith("/info/knowledge/")) return knowledgeContent(path, zh);
  if (path === "/info/links") return linksContent(zh);
  if (path === "/info/notes") return notesContent(zh);
  if (path === "/info/summaries") return summariesContent(zh);
  if (path === "/info/search") return searchContent(zh);
  throw new Error("Unhandled OS path: " + path);
}
