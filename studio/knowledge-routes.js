export const KNOWLEDGE_ROOT = "/info/knowledge";

export const KNOWLEDGE_CATEGORIES = [
  {
    slug: "projects",
    zh: "项目知识",
    en: "Project Knowledge",
    zhDescription: "记录项目背景、架构、接口、数据库、部署、决策、踩坑与修复，让项目为什么这样设计始终可追溯。",
    enDescription: "Keep project context, architecture, APIs, database, deployment, decisions, pitfalls, and fixes traceable over time.",
    items: [
      ["background", "项目背景", "Project Background"],
      ["architecture", "架构说明", "Architecture"],
      ["module-map", "模块关系", "Module Map"],
      ["api", "API 说明", "API Reference"],
      ["database", "数据库表说明", "Database Reference"],
      ["deployment", "Cloudflare / Supabase / GitHub 部署流程", "Cloudflare / Supabase / GitHub Deployment"],
      ["decisions", "重要设计决策", "Architecture Decisions"],
      ["pitfalls", "踩坑记录", "Pitfalls"],
      ["bug-fixes", "已解决 Bug 的原因和修复方法", "Resolved Bugs & Fixes"]
    ]
  },
  {
    slug: "technology",
    zh: "技术知识",
    en: "Technology",
    zhDescription: "集中保存开发中反复使用的语言、平台、安全、自动化与客户端知识。",
    enDescription: "Reusable knowledge for languages, platforms, security, automation, and client development.",
    items: [
      ["languages", "Python / JavaScript / SQL / Git 常用语法", "Python / JavaScript / SQL / Git Syntax"],
      ["cloudflare-workers", "Cloudflare Workers 用法", "Cloudflare Workers"],
      ["supabase", "Supabase RLS、RPC、Auth", "Supabase RLS, RPC & Auth"],
      ["oauth-pkce", "OAuth / PKCE", "OAuth / PKCE"],
      ["github-actions", "GitHub Actions", "GitHub Actions"],
      ["tex-latex", "TeX / LaTeX", "TeX / LaTeX"],
      ["ios-windows", "iOS / Windows 开发相关知识", "iOS / Windows Development"],
      ["errors", "常见错误码和解决方法", "Common Errors & Solutions"]
    ]
  },
  {
    slug: "study",
    zh: "学习资料",
    en: "Study Materials",
    zhDescription: "把课程公式、概念、实验、错题与例题整理成可以复习和检索的长期资料。",
    enDescription: "Turn formulas, concepts, labs, mistakes, and worked examples into durable study references.",
    items: [
      ["statistics", "统计学公式", "Statistics Formulas"],
      ["probability", "概率论", "Probability"],
      ["calculus", "高数", "Calculus"],
      ["python-labs", "Python 上机知识点", "Python Lab Notes"],
      ["excel", "Excel 公式", "Excel Formulas"],
      ["course-summaries", "课程总结", "Course Summaries"],
      ["exam-mistakes", "考试易错点", "Exam Pitfalls"],
      ["worked-examples", "自己整理的例题", "Worked Examples"]
    ]
  },
  {
    slug: "methodology",
    zh: "个人方法论",
    en: "Personal Methodology",
    zhDescription: "沉淀稳定的工作流程、检查清单、调试方法、命名规范和设计原则。",
    enDescription: "Codify repeatable workflows, checklists, debugging habits, naming rules, and design principles.",
    items: [
      ["coding-standards", "写代码时的规范", "Coding Standards"],
      ["git-workflow", "Git 工作流", "Git Workflow"],
      ["project-checklist", "做项目的 Checklist", "Project Checklist"],
      ["pre-deploy", "部署前检查项", "Pre-deploy Checklist"],
      ["debugging", "Debug 流程", "Debugging Workflow"],
      ["naming", "文件命名规范", "Naming Conventions"],
      ["ui-design", "UI 设计原则", "UI Design Principles"],
      ["work-habits", "自己长期形成的工作习惯", "Long-term Work Habits"]
    ]
  },
  {
    slug: "references",
    zh: "参考资料",
    en: "References",
    zhDescription: "保存高质量项目、网站、官方文档、论文、教程、工具、Prompt 与 Skill 的入口和使用说明。",
    enDescription: "Curate high-quality projects, sites, official docs, papers, tutorials, tools, prompts, and skills.",
    items: [
      ["github-projects", "GitHub 优秀项目", "Notable GitHub Projects"],
      ["websites", "常用网站", "Useful Websites"],
      ["official-docs", "官方文档", "Official Documentation"],
      ["papers", "论文", "Papers"],
      ["tutorials", "教程", "Tutorials"],
      ["tools", "工具说明", "Tool Notes"],
      ["prompts", "常用 Prompt", "Prompt Library"],
      ["skills", "Skill 使用说明", "Skill Usage Notes"]
    ]
  },
  {
    slug: "archive",
    zh: "长期档案",
    en: "Long-term Archive",
    zhDescription: "保存项目历史、迁移、废弃方案和曾经做过的技术选择，避免重要上下文随着迭代丢失。",
    enDescription: "Preserve project history, migrations, deprecated approaches, and technical choices so context survives iteration.",
    items: [
      ["version-history", "项目版本历史", "Project Version History"],
      ["design-rationale", "为什么当时这样设计", "Design Rationale"],
      ["deprecated", "已废弃方案", "Deprecated Approaches"],
      ["migrations", "迁移记录", "Migration Records"],
      ["tech-comparisons", "技术选型对比", "Technology Comparisons"],
      ["revisit-later", "以后可能重新启用的思路", "Ideas to Revisit"]
    ]
  }
];

export const KNOWLEDGE_PATHS = [
  KNOWLEDGE_ROOT,
  ...KNOWLEDGE_CATEGORIES.flatMap(category => [
    `${KNOWLEDGE_ROOT}/${category.slug}`,
    ...category.items.map(item => `${KNOWLEDGE_ROOT}/${category.slug}/${item[0]}`)
  ])
];

export function getKnowledgeCategory(slug) {
  return KNOWLEDGE_CATEGORIES.find(category => category.slug === slug) || null;
}

export function getKnowledgeRoute(path) {
  if (path === KNOWLEDGE_ROOT) return { type: "root" };
  if (!path.startsWith(KNOWLEDGE_ROOT + "/")) return null;
  const parts = path.slice(KNOWLEDGE_ROOT.length + 1).split("/").filter(Boolean);
  const category = getKnowledgeCategory(parts[0]);
  if (!category) return null;
  if (parts.length === 1) return { type: "category", category };
  const item = category.items.find(entry => entry[0] === parts[1]);
  if (!item || parts.length !== 2) return null;
  return { type: "topic", category, item };
}
