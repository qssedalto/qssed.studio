export function normalizeFeatureAvailabilityCopy(markup) {
  let output = String(markup || "");
  const replacements = [
    [
      "知识模块尚未建立持久化数据表；当前仅保留清晰的模块入口。",
      "知识库、收藏链接、研究笔记、内容摘要和全局搜索均已接入账号数据与权限边界。"
    ],
    [
      "Persistent knowledge tables are not implemented yet; this area currently provides module entry points.",
      "Knowledge, saved links, research notes, summaries, and global search are connected to account data and existing permission boundaries."
    ],
    [
      "尚未接入收藏链接数据表。",
      "管理私人、社区与精选链接，并在对应可见范围内快速查找。"
    ],
    [
      "No saved-links table is connected yet.",
      "Manage private, community, and curated links and find them within their existing visibility scopes."
    ],
    [
      "尚未接入笔记存储与 Markdown 保存接口。",
      "研究笔记与当前账号关联保存，并支持持续编辑与检索。"
    ],
    [
      "Note storage and Markdown persistence are not connected yet.",
      "Research notes are saved to the current account and support ongoing editing and search."
    ],
    [
      "尚未接入摘要数据源。",
      "内容摘要与当前账号关联保存，并可通过全局搜索继续查找。"
    ],
    [
      "No summary data source is connected yet.",
      "Summaries are saved to the current account and can be found again through global search."
    ],
    [
      "尚未接入跨模块搜索索引。",
      "统一搜索知识库、研究笔记、内容摘要、账号链接、社区链接和精选链接。"
    ],
    [
      "No cross-module search index is connected yet.",
      "Search Knowledge, research notes, summaries, account links, community links, and curated links from one place."
    ],
    [
      "知识库、收藏链接和账号摘要可以使用；笔记与全局搜索还在接入。",
      "知识库、收藏链接、研究笔记、内容摘要和全局搜索均已可用，并继续沿用各模块原有的内容可见范围。"
    ],
    [
      "Knowledge, saved links, and account summaries are available. Notes and global search are still being connected.",
      "Knowledge, saved links, research notes, summaries, and global search are available and retain each module's existing visibility rules."
    ],
    [
      "笔记尚未开放",
      "研究笔记"
    ],
    [
      "Notes aren’t available yet",
      "Research notes"
    ],
    [
      "笔记保存接口还没接入。",
      "研究笔记已与当前账号关联保存。"
    ],
    [
      "Note storage is not connected yet.",
      "Research notes are saved with the current account."
    ],
    [
      "全局搜索尚未开放",
      "全局搜索"
    ],
    [
      "Global search isn’t available yet",
      "Global search"
    ],
    [
      "跨模块搜索索引还没接入。",
      "可跨知识库、研究笔记、摘要和不同链接范围进行统一搜索。"
    ],
    [
      "The cross-module search index is not connected yet.",
      "Search across Knowledge, research notes, summaries, and the available link scopes."
    ]
  ];

  for (const [before, after] of replacements) output = output.replaceAll(before, after);
  return output;
}
