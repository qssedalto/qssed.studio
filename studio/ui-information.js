import { statusContent } from "./ui-primitives.js";
import { knowledgeContent } from "./ui-knowledge.js";
import { curatedLinksContent } from "./curated-links.js";
import { curatedLinksFavoritesEnhancer } from "./curated-links-favorites.js";

export function linksContent(zh) {
  return curatedLinksContent(zh) + curatedLinksFavoritesEnhancer(zh);
}

export function notesContent(zh) {
  return `<section class="os-card is-large"><h2>${zh ? "笔记存储尚未接入" : "Note storage is not connected yet"}</h2><p>${zh ? "当前没有 notes 数据表或保存接口，因此这里不再显示一个看似可编辑但无法持久化的 Markdown 编辑器。" : "There is no notes table or save API, so this page no longer presents an editor that looks functional but cannot persist changes."}</p></section>`;
}

export function summariesContent(zh) {
  return statusContent(zh, "摘要数据尚未接入", "当前没有用于保存 B 站、YouTube、网页或 PDF 摘要的数据源。", "Summary data is not connected yet", "There is no persistent data source for Bilibili, YouTube, webpage, or PDF summaries yet.");
}

export function searchContent(zh) {
  return `<section class="os-card is-large"><h2>${zh ? "全局搜索尚未接入" : "Global search is not connected yet"}</h2><p>${zh ? "当前没有笔记、链接、项目或聊天记录的数据索引，因此不展示无实际搜索行为的输入框。" : "There is no index for notes, links, projects, or chat records yet, so this page does not show a search box with no real search behavior."}</p></section>`;
}

export function informationContent(path, zh) {
  if (path === "/info") return statusContent(zh, "信息中心", "知识库和对话精选链接库已经可以直接使用；研究笔记、摘要和全局搜索仍等待持久化数据源。", "Information Center", "The Knowledge Base and curated conversation link library are ready to use; research notes, summaries, and global search still await persistent data sources.");
  if (path === "/info/knowledge" || path.startsWith("/info/knowledge/")) return knowledgeContent(path, zh);
  if (path === "/info/links") return linksContent(zh);
  if (path === "/info/notes") return notesContent(zh);
  if (path === "/info/summaries") return summariesContent(zh);
  if (path === "/info/search") return searchContent(zh);
  throw new Error("Unhandled OS path: " + path);
}
