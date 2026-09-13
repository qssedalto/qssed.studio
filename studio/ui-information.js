export function linksContent(zh) {
  return `<section class="os-card is-large"><h2>${zh ? "尚未接入收藏链接" : "Saved links are not connected yet"}</h2><p>${zh ? "当前数据库没有收藏链接表，因此这里不再展示固定示例链接或伪造收藏时间。" : "There is no saved-links table in the current database, so this page no longer shows fixed sample links or fabricated saved dates."}</p></section>`;
}

export function notesContent(zh) {
  return `<section class="os-card is-large"><h2>${zh ? "笔记存储尚未接入" : "Note storage is not connected yet"}</h2><p>${zh ? "当前没有 notes 数据表或保存接口，因此这里不再显示一个看似可编辑但无法持久化的 Markdown 编辑器。" : "There is no notes table or save API, so this page no longer presents an editor that looks functional but cannot persist changes."}</p></section>`;
}

export function summariesContent(zh, statusContent) {
  return statusContent(zh, "摘要数据尚未接入", "当前没有用于保存 B 站、YouTube、网页或 PDF 摘要的数据源。", "Summary data is not connected yet", "There is no persistent data source for Bilibili, YouTube, webpage, or PDF summaries yet.");
}

export function searchContent(zh) {
  return `<section class="os-card is-large"><h2>${zh ? "全局搜索尚未接入" : "Global search is not connected yet"}</h2><p>${zh ? "当前没有笔记、链接、项目或聊天记录的数据索引，因此不展示无实际搜索行为的输入框。" : "There is no index for notes, links, projects, or chat records yet, so this page does not show a search box with no real search behavior."}</p></section>`;
}

export function informationContent(path, zh, statusContent) {
  if (path === "/info") return statusContent(zh, "信息中心尚未接入", "收藏链接、笔记、摘要和 AI 对话目前没有持久化数据源。", "Information Center is not connected yet", "Saved links, notes, summaries, and AI conversations do not have persistent data sources yet.");
  if (path === "/info/knowledge") return statusContent(zh, "知识库", "用于整理值得长期保留的知识内容，让信息更容易积累、查找和回顾。", "Knowledge Base", "Organize knowledge worth keeping so it remains easy to build on, find, and revisit.");
  if (path === "/info/links") return linksContent(zh);
  if (path === "/info/notes") return notesContent(zh);
  if (path === "/info/summaries") return summariesContent(zh, statusContent);
  if (path === "/info/search") return searchContent(zh);
  throw new Error("Unhandled OS path: " + path);
}
