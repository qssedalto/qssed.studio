/**
 * 【初学者导读】
 * 文件：studio/knowledge-references.js
 * 知识库内容数据模块：保存归档/参考资料，主要风险是内容标识和引用关系被破坏。
 * 阅读顺序：先确认本文件导出的数据/函数被谁使用，再看数据键、转换规则和失败/回退逻辑；数据型文件也要理解“谁消费它”。
 * 修改注意：保持数据结构、公开函数和已有调用者兼容。
 * 调试方法：优先验证输入 key/ID/locale/host 是否正确，再检查转换后的结构，不要一开始就改最终展示。
 */
export const REFERENCE_KNOWLEDGE = {
  "github-projects": {
    zh: {
      summary: "GitHub 优秀项目页用于保存真正值得反复参考的仓库，并记录“为什么值得看、应该看哪里、能学到什么”，而不是只堆链接。",
      sections: [
        { title: "收录标准", bullets: ["维护活跃或历史价值明确。", "README/文档完整，能解释设计。", "代码结构能代表某种工程实践。", "License 清楚。", "记录具体参考点，而不是只有 star 数。"] },
        { title: "建议记录字段", code: "项目名 / 仓库\n用途\n值得看的目录或文件\n核心技术\n可借鉴点\n不适合直接照搬的地方\n最后检查日期" },
        { title: "适合 AERTEX 的类别", bullets: ["Cloudflare Worker 工程模板。", "OAuth/PKCE 公共客户端实现。", "Git GUI / libgit2 / dulwich 相关项目。", "TeX 编辑器和编译管理器。", "Apple 风格但重视可访问性的 Web UI。", "知识库、Markdown、全文检索与双向链接项目。"] }
      ]
    },
    en: { summary: "Curate repositories with notes about why they matter, where to look, and what should or should not be copied.", sections: [
      { title: "Criteria", bullets: ["Clear maintenance or historical value.", "Good documentation.", "Representative engineering structure.", "Clear license."] },
      { title: "Record", code: "repo / purpose / files to inspect / lessons / caveats / last reviewed" }
    ] }
  },
  websites: {
    zh: {
      summary: "常用网站页保存开发、学习、设计和排错时经常访问的站点，并按用途分组，避免浏览器书签越堆越乱。",
      sections: [
        { title: "开发", bullets: ["GitHub：源码、Issue、PR、Actions。", "Cloudflare Dashboard：Workers、R2、日志、域名。", "Supabase Dashboard：Auth、Table Editor、SQL、Logs。", "MDN：浏览器标准与 Web API。"] },
        { title: "学习", bullets: ["学校课程平台与教材配套资源。", "统计/数学可视化工具。", "Python 官方教程与常用包文档。"] },
        { title: "保存规则", bullets: ["能用官方文档替代营销博客时优先官方。", "记录用途和关键页面，不只存首页。", "定期删除失效链接和重复入口。"] }
      ]
    },
    en: { summary: "Organize frequently used development, learning, design, and debugging sites by purpose rather than accumulating unstructured bookmarks.", sections: [
      { title: "Development", bullets: ["GitHub", "Cloudflare Dashboard", "Supabase Dashboard", "MDN"] },
      { title: "Rules", bullets: ["Prefer primary sources.", "Save the useful subpage and its purpose.", "Prune dead and duplicate links."] }
    ] }
  },
  "official-docs": {
    zh: {
      summary: "官方文档是涉及协议、API 行为、安全和版本兼容时的第一参考来源。知识库应记录具体章节与项目结论。",
      sections: [
        { title: "优先级", bullets: ["标准/RFC。", "产品官方文档。", "官方 SDK/API reference。", "官方 GitHub 示例。", "社区文章用于补充经验，不代替规范。"] },
        { title: "AERTEX 常用文档域", bullets: ["Cloudflare Workers / Wrangler / R2。", "Supabase Auth / Database / RLS / PostgREST。", "GitHub Actions / REST API。", "OAuth 2.0 / PKCE / native app best practices。", "Python / Qt / Git / TeX 官方资料。"] },
        { title: "记录方式", paragraphs: ["不要大段复制官方文档。记录链接、版本/日期、关键结论、AERTEX 采用的做法和与当前代码关联的文件。这样升级版本时能快速重新验证。"] }
      ]
    },
    en: { summary: "Standards and official documentation are the first source for protocol, API, security, and compatibility questions.", sections: [
      { title: "Priority", bullets: ["Standards/RFCs", "Official product docs", "SDK/API references", "Official examples", "Community experience as secondary evidence"] },
      { title: "Record", paragraphs: ["Store the link, version/date, project conclusion, and related AERTEX files rather than copying entire documents."] }
    ] }
  },
  papers: {
    zh: {
      summary: "论文页用于保存真正影响学习、算法选择或产品设计的论文，并把阅读结果压缩成可复用结论。",
      sections: [
        { title: "论文卡片", code: "标题 / 作者 / 年份\n问题是什么\n方法是什么\n数据与实验\n关键结论\n局限性\n和当前学习/项目的关系\n是否需要复现" },
        { title: "阅读顺序", bullets: ["先摘要和结论，判断是否值得深入。", "再看图表和实验设计。", "需要复现时再精读方法与附录。", "区分作者结论和自己的推断。"] },
        { title: "统计学特别注意", bullets: ["样本量与抽样方式。", "评价指标是否合适。", "显著性与实际效应大小。", "多重比较、选择偏差和数据泄漏。"] }
      ]
    },
    en: { summary: "Keep papers that materially affect study, algorithm choices, or product design, summarized into reusable conclusions.", sections: [
      { title: "Paper card", code: "title / authors / year / question / method / data / results / limits / relevance / reproduce?" },
      { title: "Reading", bullets: ["Abstract and conclusion first.", "Then figures and experiment design.", "Read methods deeply when reproduction matters."] }
    ] }
  },
  tutorials: {
    zh: {
      summary: "教程页保存经过验证、确实能完成任务的教程，并补上教程没有说清的前提、版本和坑。",
      sections: [
        { title: "收录条件", bullets: ["自己实际跑通过或至少验证关键步骤。", "写明适用版本和平台。", "区分必需步骤与作者个人偏好。", "关键命令可以复制，但 secret 用占位符。"] },
        { title: "教程模板", code: "目标\n前置条件\n步骤\n验证方式\n常见错误\n回滚/卸载\n来源与最后验证日期" },
        { title: "不要保存", bullets: ["无法验证来源的“万能优化”。", "要求关闭安全机制但不解释风险的教程。", "过度依赖已废弃 UI 截图、没有版本信息的步骤。"] }
      ]
    },
    en: { summary: "Keep tutorials that are verified to work, with prerequisites, versions, caveats, validation, and rollback notes.", sections: [
      { title: "Template", code: "goal / prerequisites / steps / validation / common errors / rollback / source / last verified" },
      { title: "Avoid", bullets: ["Unverifiable optimization recipes.", "Instructions that disable security without explaining risk.", "Versionless UI-only guides."] }
    ] }
  },
  tools: {
    zh: {
      summary: "工具说明页记录工具解决什么问题、如何安装、核心配置、常用命令、数据位置和卸载/迁移方式。",
      sections: [
        { title: "开发工具", bullets: ["Git：版本控制和回滚。", "Wrangler：Cloudflare Worker 本地/远程部署。", "Supabase CLI/SQL Editor：数据库迁移与检查。", "Codex/ChatGPT：代码理解、修改、审查与自动化。", "TeX 工具链：文档编译。"] },
        { title: "记录模板", code: "工具名\n用途\n安装方式\n配置目录\n常用命令\n凭据保存位置\n升级注意\n卸载/迁移" },
        { title: "安全", bullets: ["不要把 token 放进截图、示例命令历史或仓库。", "确认第三方工具是否会上传项目内容。", "需要管理员权限的步骤写明原因。"] }
      ]
    },
    en: { summary: "Document what each tool solves, installation, configuration, common commands, credential locations, upgrades, and migration/uninstall paths.", sections: [
      { title: "Template", code: "tool / purpose / install / config / commands / credentials / upgrade / uninstall" },
      { title: "Security", bullets: ["Do not store tokens in screenshots or repositories.", "Understand whether a tool uploads project content."] }
    ] }
  },
  prompts: {
    zh: {
      summary: "Prompt 库保存可以稳定复用的任务描述模板。重点是输入边界、输出标准和验证方式，而不是追求神秘关键词。",
      sections: [
        { title: "代码修改 Prompt", code: "读取当前项目相关文件 → 说明现有行为 → 只修改指定范围 → 不改变未要求的协议/安全语义 → 运行语法/构建/测试 → 给出 diff 摘要和风险。" },
        { title: "学习讲解 Prompt", code: "按题目原条件讲解；先解释为什么使用该公式，再逐步计算；指出最容易错的步骤；最后给一个同类变式题。" },
        { title: "资料整理 Prompt", code: "提取事实 → 按主题分组 → 区分已验证/推断/待确认 → 保留来源 → 生成短摘要和详细版。" },
        { title: "评估规则", bullets: ["同一 Prompt 在不同输入下是否仍稳定。", "是否明确禁止猜测缺失信息。", "是否能验证结果。", "能用普通明确语言时不堆“专家级/深度思考”等装饰词。"] }
      ]
    },
    en: { summary: "A prompt library stores repeatable task specifications with clear inputs, output standards, constraints, and validation—not magic keywords.", sections: [
      { title: "Code change", code: "inspect current implementation → preserve unspecified behavior/security → make focused change → run checks → summarize diff and risk" },
      { title: "Learning", code: "explain why the method applies → solve step by step → point out traps → provide a variant" },
      { title: "Quality", bullets: ["Stable across inputs.", "Explicit about missing information.", "Results can be verified."] }
    ] }
  },
  skills: {
    zh: {
      summary: "Skill 使用说明页记录某个 Skill 的触发场景、输入、依赖、不能做的事和验证方式。Skill 是工作流说明，不应该被当成自动拥有所有外部权限。",
      sections: [
        { title: "记录字段", code: "Skill 名称\n用途\n什么时候触发\n需要的工具/环境\n输入格式\n执行步骤\n输出\n限制\n失败时怎么处理" },
        { title: "使用原则", bullets: ["先确认 Skill 是否真的安装/可调用，不把 GitHub 上读过的 SKILL.md 说成已安装 Skill。", "Skill 要求的工具不可用时明确说明限制。", "涉及代码执行时遵循 Skill 指定的执行环境。", "外部仓库 Skill 可以作为参考，但要区分“阅读并采用原则”和“系统 Skill 已安装”。"] },
        { title: "AERTEX 例子", paragraphs: ["Apple Design Skills 曾作为外部 GitHub 设计指南被读取，用来改进 AERTEX Auth UI 的普通语言、渐进披露、触摸目标和 reduced-motion 支持；它不是当时系统中已安装的 Skill。"] }
      ]
    },
    en: { summary: "Document a skill's trigger, inputs, dependencies, workflow, outputs, limitations, and verification. Reading a SKILL.md from GitHub is not the same as having an installed system skill.", sections: [
      { title: "Fields", code: "name / purpose / trigger / tools / input / steps / output / limits / failure handling" },
      { title: "Rules", bullets: ["Verify availability before claiming a skill is installed.", "Respect its required execution environment.", "Distinguish external guidance from installed capabilities."] }
    ] }
  }
};
