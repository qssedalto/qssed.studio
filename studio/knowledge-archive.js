export const ARCHIVE_KNOWLEDGE = {
  "version-history": {
    zh: {
      summary: "项目版本历史页不追求记录每个 commit，而是保存会改变架构、数据模型、用户体验或部署方式的重要版本节点。",
      sections: [
        { title: "建议记录格式", code: "日期 / 版本或 PR\n做了什么\n为什么做\n迁移影响\n兼容性\n验证结果\n相关 commit / PR" },
        { title: "QssedA 关键阶段", bullets: ["Studio 从单体 worker.js 拆为模块化结构。", "Auth 独立为 auth.qsseda.studio。", "OAuth 2.0 + PKCE、refresh rotation、revoke 与 introspection 接入。", "Profile、Settings、Storage、Admin、Dashboard 等 UI 域独立。", "Phase 4 共享层清理完成，架构进入稳定 baseline。", "Knowledge Base v1 建立长期知识路由和静态内容体系。"] },
        { title: "什么时候写", bullets: ["一次迁移影响多个模块。", "数据库 schema 或安全边界改变。", "产品行为有明显新能力。", "部署方式或客户端协议改变。"] }
      ]
    },
    en: { summary: "Track architecture, data-model, UX, and deployment milestones rather than every commit.", sections: [
      { title: "Record", code: "date / version or PR / change / reason / migration impact / compatibility / verification / refs" },
      { title: "Milestones", bullets: ["Studio monolith modularized.", "Auth separated.", "OAuth/PKCE and introspection added.", "Product UI domains separated.", "Phase 4 shared-layer cleanup completed.", "Knowledge Base v1 introduced."] }
    ] }
  },
  "design-rationale": {
    zh: {
      summary: "“为什么当时这样设计”用于保存当时的约束和权衡，防止几年后只看到代码结果，却误以为某个复杂度是无意义的。",
      sections: [
        { title: "记录模板", code: "问题\n当时约束\n候选方案\n选择方案\n为什么\n付出的代价\n什么条件变化后可以重新评估" },
        { title: "典型例子", bullets: ["为什么 Auth 与 Studio 分离。", "为什么桌面端不用 client_secret。", "为什么 R2 对象按用户前缀隔离。", "为什么保留 worker.js 兼容 facade。", "为什么某些共享 CSS 没继续拆。"] },
        { title: "复查机制", paragraphs: ["设计决策不是永久真理。只要当时约束发生变化，就应该重新评估，而不是因为“以前就是这么做的”继续维持。"] }
      ]
    },
    en: { summary: "Capture constraints and trade-offs so future maintainers understand why complexity exists and when a decision may be revisited.", sections: [
      { title: "Template", code: "problem / constraints / options / choice / rationale / cost / revisit condition" },
      { title: "Examples", bullets: ["Separate Auth Worker.", "No desktop client secret.", "Per-user R2 prefixes.", "Thin worker.js facade.", "Keeping mixed shared CSS aggregated."] }
    ] }
  },
  deprecated: {
    zh: {
      summary: "已废弃方案页保存被替换的实现及废弃原因。重点不是保留旧代码全文，而是让未来知道“为什么不要再走回去”。",
      sections: [
        { title: "记录内容", bullets: ["旧方案解决什么问题。", "为什么最终失败或成本过高。", "替代方案是什么。", "是否还有数据/兼容包袱。", "什么情况下可以重新考虑。"] },
        { title: "QssedA 示例", bullets: ["单体 7,544 行 worker.js：难以维护，已分阶段模块化。", "把协议技术细节直接暴露给普通 Auth 用户：已改为普通语言并将技术信息折叠。", "伪造 Dashboard 统计/活动：改为只显示真实入口与真实数据。", "一次性自修改 Workflow 长期保留：迁移完成后删除，避免意外再次改代码。"] },
        { title: "与 Git 历史的关系", paragraphs: ["旧实现的完整源码由 Git 历史保留。知识库只保存废弃原因和迁移上下文，避免在当前树里长期堆大型快照。"] }
      ]
    },
    en: { summary: "Record replaced approaches and why they should not be revived blindly; Git history retains the full old source.", sections: [
      { title: "Record", bullets: ["Old goal.", "Why it failed or became expensive.", "Replacement.", "Compatibility burden.", "Conditions for reconsideration."] },
      { title: "Examples", bullets: ["7,544-line monolithic Worker.", "Protocol-heavy user-facing Auth copy.", "Fabricated dashboard metrics.", "Permanent one-off self-modifying workflows."] }
    ] }
  },
  migrations: {
    zh: {
      summary: "迁移记录用于描述从旧结构到新结构的过程，尤其是数据库、身份、路由、缓存和文件格式变化。迁移必须可验证，也要知道失败后如何恢复。",
      sections: [
        { title: "数据库迁移", bullets: ["新建 migration，不修改已执行历史。", "明确依赖的旧对象。", "先确认生产 schema 当前状态。", "迁移后验证表、函数、policy、grant 和索引。"] },
        { title: "代码迁移", bullets: ["先捕获旧输出或行为。", "搬迁后做字节级或语义级比较。", "一刀只移动一个清晰边界。", "生产稳定后再进入下一刀。"] },
        { title: "客户端/缓存迁移", bullets: ["版本化 localStorage/sessionStorage key。", "旧缓存可能存在时要 fail-safe。", "不要让缓存成为权限判断的唯一来源。"] },
        { title: "记录格式", code: "来源版本 → 目标版本\n前置条件\n操作步骤\n验证\n兼容期\n回滚\n最终删除旧路径的条件" }
      ]
    },
    en: { summary: "Migration notes cover database, identity, routes, caches, and file-format transitions with verification and rollback.", sections: [
      { title: "Database", bullets: ["Add new migrations; do not rewrite applied history.", "Verify functions, policies, grants, and indexes."] },
      { title: "Code", bullets: ["Capture old behavior.", "Move one boundary at a time.", "Compare output and deploy before the next slice."] },
      { title: "Record", code: "from → to / prerequisites / steps / validation / compatibility / rollback / removal condition" }
    ] }
  },
  "tech-comparisons": {
    zh: {
      summary: "技术选型对比页保存“为什么选 A 不选 B”的可重复评估框架。选型看约束，不追求绝对最好。",
      sections: [
        { title: "对比维度", bullets: ["部署环境与平台限制。", "安全模型。", "维护成本和生态。", "性能与资源占用。", "离线/本地能力。", "用户体验。", "迁移成本和锁定风险。"] },
        { title: "示例：Worker vs 传统服务器", bullets: ["Workers：部署轻、边缘、无需维护 VM；但运行模型和原生进程能力受限。", "传统服务器：系统控制更完整；但运维、补丁和扩缩容成本更高。", "QssedA Web API 目前更适合 Worker，桌面本地 Git/TeX 则必须在客户端执行。"] },
        { title: "示例：自定义 URI vs loopback", bullets: ["自定义 URI：回跳简单，但需要 OS scheme 注册并处理抢占风险。", "loopback：RFC 8252 推荐的 native app 模式之一，Windows 可临时监听动态端口。", "可以同时支持，按客户端安装方式选择。"] },
        { title: "结论格式", paragraphs: ["每次技术选型最后写：当前选择、关键理由、已知代价、重新评估触发条件。"] }
      ]
    },
    en: { summary: "Technology comparisons use constraints and trade-offs rather than searching for a universally best tool.", sections: [
      { title: "Dimensions", bullets: ["Runtime/platform limits", "Security", "Maintenance/ecosystem", "Performance", "Local/offline ability", "UX", "Migration/lock-in"] },
      { title: "Worker vs server", bullets: ["Workers reduce infrastructure operations but restrict traditional process capabilities.", "Desktop Git/TeX execution belongs on the client, not in a Worker."] },
      { title: "Decision", paragraphs: ["Always record the current choice, reasons, costs, and revisit triggers."] }
    ] }
  },
  "revisit-later": {
    zh: {
      summary: "以后可能重新启用的思路用于保存“现在不做，但值得保留”的方案，避免它们散落在聊天记录里。每条都要写清为什么现在不做。",
      sections: [
        { title: "候选方向", bullets: ["知识库持久化编辑、标签、全文检索和 AI RAG。", "QssedA Desktop 的 Git + TeX 一体化客户端。", "项目/任务/草稿统一数据模型。", "移动端轻入口或 App Clip 类体验。", "更完整的跨设备活动流。", "Resource server API 层和细粒度 OAuth scopes。"] },
        { title: "暂缓原因模板", code: "想法\n价值\n现在不做的原因\n依赖条件\n最小验证方式\n重新评估时间/触发事件" },
        { title: "原则", bullets: ["暂缓不等于否定。", "没有依赖条件和触发点的“以后做”通常会永久遗忘。", "当依赖成熟后重新从当前架构评估，不直接照旧方案实现。"] }
      ]
    },
    en: { summary: "Keep valuable ideas that are intentionally deferred, including why they are deferred and what should trigger reevaluation.", sections: [
      { title: "Candidates", bullets: ["Persistent searchable knowledge base and AI retrieval.", "Git + TeX desktop client.", "Unified projects/tasks/drafts model.", "Lightweight mobile entry points.", "Cross-device activity feed."] },
      { title: "Template", code: "idea / value / why not now / dependencies / smallest validation / revisit trigger" }
    ] }
  }
};
