/**
 * 【初学者导读】
 * 文件：studio/feature-availability-copy.js
 * 共享展示模块：统一站点图标、主题或功能可用性文案，避免各页面重复实现。
 * 阅读顺序：先找 export/主入口，再沿事件、路由或 API 调用向下；看到共享 helper 时先确认它是否被多个产品复用。
 * 数据流：输入通常来自 Request、会话或前端状态；重点跟踪校验、状态转换、存储读写以及最终 Response/DOM 输出。
 * 修改注意：保持公开 API、DOM 标识和共享数据结构稳定；产品规则变化时同步更新自动检查。
 * 调试方法：先锁定调用链，再打印/检查最小必要状态，不要从最终页面表现反推所有中间步骤。
 */
export function normalizeFeatureAvailabilityCopy(markup) {
  let output = String(markup || "");
  const replacements = [
    ["知识模块尚未建立持久化数据表；当前仅保留清晰的模块入口。","知识库、收藏链接、研究笔记、内容摘要和全局搜索均已接入账号数据与权限边界。"],
    ["Persistent knowledge tables are not implemented yet; this area currently provides module entry points.","Knowledge, saved links, research notes, summaries, and global search are connected to account data and existing permission boundaries."],
    ["尚未接入收藏链接数据表。","管理私人、社区与精选链接，并在对应可见范围内快速查找。"],
    ["No saved-links table is connected yet.","Manage private, community, and curated links and find them within their existing visibility scopes."],
    ["尚未接入笔记存储与 Markdown 保存接口。","研究笔记与当前账号关联保存，并支持持续编辑与检索。"],
    ["Note storage and Markdown persistence are not connected yet.","Research notes are saved to the current account and support ongoing editing and search."],
    ["尚未接入摘要数据源。","内容摘要与当前账号关联保存，并可通过全局搜索继续查找。"],
    ["No summary data source is connected yet.","Summaries are saved to the current account and can be found again through global search."],
    ["尚未接入跨模块搜索索引。","统一搜索知识库、研究笔记、内容摘要、账号链接、社区链接和精选链接。"],
    ["No cross-module search index is connected yet.","Search Knowledge, research notes, summaries, account links, community links, and curated links from one place."],
    ["尚未接入项目数据表。","项目与当前账号关联保存，可管理状态、优先级、链接、标签和下一步行动。"],
    ["No projects table is connected yet.","Projects are saved to the current account with status, priority, links, tags, and next actions."],
    ["尚未接入任务数据表。","任务与当前账号关联保存，可关联项目并管理状态、优先级与截止时间。"],
    ["No tasks table is connected yet.","Tasks are saved to the current account and can be linked to projects with status, priority, and due dates."],
    ["尚未接入草稿数据表。","草稿与当前账号关联保存，支持项目关联、自动保存、最近编辑和正文搜索。"],
    ["No drafts table is connected yet.","Drafts are saved to the current account with project links, autosave, recent editing, and body search."],
    ["知识库、收藏链接和账号摘要可以使用；笔记与全局搜索还在接入。","知识库、收藏链接、研究笔记、内容摘要和全局搜索均已可用，并继续沿用各模块原有的内容可见范围。"],
    ["Knowledge, saved links, and account summaries are available. Notes and global search are still being connected.","Knowledge, saved links, research notes, summaries, and global search are available and retain each module's existing visibility rules."],
    ["笔记尚未开放","研究笔记"],["Notes aren’t available yet","Research notes"],["笔记保存接口还没接入。","研究笔记已与当前账号关联保存。"],["Note storage is not connected yet.","Research notes are saved with the current account."],
    ["全局搜索尚未开放","全局搜索"],["Global search isn’t available yet","Global search"],["跨模块搜索索引还没接入。","可跨知识库、研究笔记、摘要和不同链接范围进行统一搜索。"],["The cross-module search index is not connected yet.","Search across Knowledge, research notes, summaries, and the available link scopes."],
    ["项目尚未开放","项目管理"],["Projects aren’t available yet","Project Management"],["项目数据表还没接入。","项目已与当前账号关联保存。"],["Project data is not connected yet.","Projects are saved with the current account."],
    ["任务尚未开放","任务中心"],["Tasks aren’t available yet","Task Center"],["任务数据表还没接入。","任务已与当前账号关联保存，并可直接关联项目。"],["Task data is not connected yet.","Tasks are saved with the current account and can attach directly to projects."],
    ["草稿尚未开放","草稿箱"],["Drafts aren’t available yet","Drafts"],["草稿保存接口还没接入。","草稿已与当前账号关联，并在编辑时自动保存。"],["Draft storage is not connected yet.","Drafts are linked to the current account and autosave while editing."],
    ["工作台尚未开放","工作台"],["Workbench isn’t available yet","Workbench"],["工作台数据模型还没接入。","工作台会聚合进行中的项目、今天与逾期任务、最近草稿和最近研究笔记，不单独复制数据。"],["Workbench data is not connected yet.","Workbench aggregates active projects, today's and overdue tasks, recent drafts, and recent research notes without duplicating data."],
    ["实验室尚未开放","实验室"],["Lab isn’t available yet","Lab"],["实验数据和工具接口还没接入。","实验室已作为工具注册中心开放；现有工具可直接使用，TeX、AI、媒体与工程工具可按注册表逐步接入。"],["Experiment data and tool APIs are not connected yet.","Lab is available as a tool registry: existing tools open now, while TeX, AI, media, and engineering tools can be connected progressively."]
  ];
  for (const [before, after] of replacements) output = output.replaceAll(before, after);
  return output;
}
