export const LAB_TOOL_CATEGORIES = {
  core: { zh: "Studio 工具", en: "Studio Tools" },
  tex: { zh: "TeX 与文档", en: "TeX & Documents" },
  ai: { zh: "AI 工具", en: "AI Tools" },
  media: { zh: "媒体处理", en: "Media Processing" },
  engineering: { zh: "工程工具", en: "Engineering" }
};

export const LAB_TOOLS = [
  {
    id: "global-search",
    category: "core",
    status: "ready",
    href: "/info/search",
    title: { zh: "全局搜索", en: "Global Search" },
    description: { zh: "统一搜索知识库、笔记、摘要和链接。", en: "Search Knowledge, notes, summaries, and links in one place." },
    capabilities: { zh: ["账号范围", "跨模块", "中文搜索"], en: ["Account scoped", "Cross-module", "CJK search"] }
  },
  {
    id: "knowledge",
    category: "core",
    status: "ready",
    href: "/info/knowledge",
    title: { zh: "知识库", en: "Knowledge Base" },
    description: { zh: "整理、保存并检索长期知识内容。", en: "Organize, preserve, and search long-term knowledge." },
    capabilities: { zh: ["持久化", "搜索", "分类"], en: ["Persistent", "Search", "Categories"] }
  },
  {
    id: "notes",
    category: "core",
    status: "ready",
    href: "/info/notes",
    title: { zh: "研究笔记", en: "Research Notes" },
    description: { zh: "记录研究过程、结论与下一步。", en: "Capture research process, conclusions, and next steps." },
    capabilities: { zh: ["账号笔记", "持续编辑", "研究结构"], en: ["Account notes", "Ongoing editing", "Research structure"] }
  },
  {
    id: "summaries",
    category: "core",
    status: "ready",
    href: "/info/summaries",
    title: { zh: "内容摘要", en: "Summaries" },
    description: { zh: "把长材料整理成可回顾的结构化摘要。", en: "Turn long material into structured summaries worth revisiting." },
    capabilities: { zh: ["结构化", "自动保存", "全局搜索"], en: ["Structured", "Autosave", "Global search"] }
  },
  {
    id: "tex-workbench",
    category: "tex",
    status: "ready",
    href: "/work/tex",
    title: { zh: "TeX 工作台", en: "TeX Workbench" },
    description: { zh: "账号级 TeX 源码编辑、模板、自动保存与安全编译桥接。", en: "Account-scoped TeX editing, templates, autosave, and a protected compiler bridge." },
    capabilities: { zh: ["源码编辑", "自动保存", "编译桥接"], en: ["Source editor", "Autosave", "Compiler bridge"] }
  },
  {
    id: "document-pipeline",
    category: "tex",
    status: "planned",
    href: "",
    title: { zh: "文档处理管线", en: "Document Pipeline" },
    description: { zh: "把 Markdown、TeX、PDF 和结构化内容串成可重复工作流。", en: "Connect Markdown, TeX, PDF, and structured content into repeatable workflows." },
    capabilities: { zh: ["Markdown", "PDF", "转换"], en: ["Markdown", "PDF", "Conversion"] }
  },
  {
    id: "ai-extract",
    category: "ai",
    status: "planned",
    href: "",
    title: { zh: "AI 信息提取", en: "AI Extraction" },
    description: { zh: "从文档或长文本提取结构、结论、实体与待办。", en: "Extract structure, conclusions, entities, and actions from documents or long text." },
    capabilities: { zh: ["提取", "结构化", "自动归档"], en: ["Extraction", "Structuring", "Auto filing"] }
  },
  {
    id: "ai-rewrite",
    category: "ai",
    status: "planned",
    href: "",
    title: { zh: "AI 改写与整理", en: "AI Rewrite & Organize" },
    description: { zh: "把草稿改写为摘要、笔记、说明或其他目标格式。", en: "Transform drafts into summaries, notes, explanations, or other target formats." },
    capabilities: { zh: ["改写", "格式转换", "账号内容"], en: ["Rewrite", "Format conversion", "Account content"] }
  },
  {
    id: "media-enhance",
    category: "media",
    status: "planned",
    href: "",
    title: { zh: "媒体增强", en: "Media Enhancement" },
    description: { zh: "为后续图像、视频增强和转码工作流预留统一入口。", en: "A future home for image/video enhancement and transcoding workflows." },
    capabilities: { zh: ["图像", "视频", "转码"], en: ["Image", "Video", "Transcode"] }
  },
  {
    id: "repo-helper",
    category: "engineering",
    status: "planned",
    href: "",
    title: { zh: "工程辅助工具", en: "Engineering Helper" },
    description: { zh: "为仓库检查、构建、发布和工程自动化保留可扩展位置。", en: "An extensible home for repository checks, builds, deployment, and engineering automation." },
    capabilities: { zh: ["Git", "构建", "自动化"], en: ["Git", "Build", "Automation"] }
  }
];