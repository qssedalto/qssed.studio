// 初学者导读：知识库的方法论/说明内容数据；属于声明式知识内容，不负责搜索或权限。
export const METHODOLOGY_KNOWLEDGE = {
  "coding-standards": {
    zh: {
      summary: "代码规范的目标不是追求形式统一，而是让修改范围可预测、错误更容易定位、审查和回滚。",
      sections: [
        { title: "基本原则", bullets: ["一个函数尽量只承担一个明确责任。", "变量名表达含义，不用无上下文的 a/b/x1。", "共享逻辑放中立模块，不让产品域互相借函数。", "错误路径要明确处理，不能只写 happy path。", "安全检查不能因为 UI 重构而弱化。"] },
        { title: "JavaScript", bullets: ["优先 const，需要重新赋值时才用 let。", "异步代码使用 async/await 时保留 try/catch 边界。", "DOM 查询结果可能为空时用可选链或显式判空。", "生成 HTML 时区分可信静态片段与需要 escape 的用户数据。"] },
        { title: "SQL", bullets: ["显式 public.schema。", "迁移保证可审查，不在已执行历史上静默改写。", "RLS policy 与 grant 一起审查。", "SECURITY DEFINER 函数固定 search_path。"] },
        { title: "提交前", code: "node --check <changed-js>\ngit diff --check\ngit diff --stat\n# Worker 项目再加 Wrangler dry-run" }
      ]
    },
    en: { summary: "Coding standards make changes predictable, reviewable, and reversible rather than merely stylistically uniform.", sections: [
      { title: "Principles", bullets: ["One clear responsibility per function.", "Meaningful names.", "Neutral shared helpers instead of cross-product imports.", "Handle failure paths.", "Never weaken security during UI refactors."] },
      { title: "Before commit", code: "node --check <files>\ngit diff --check\ngit diff --stat" }
    ] }
  },
  "git-workflow": {
    zh: {
      summary: "Git 工作流强调小分支、小 PR、明确验证和可回滚性。结构性修改不直接压到 main。",
      sections: [
        { title: "标准流程", code: "main\n→ feature/fix branch\n→ focused commits\n→ PR\n→ CI + Preview\n→ review diff\n→ squash merge\n→ production checks" },
        { title: "分支命名", bullets: ["feature/<name>：功能。", "fix/<name>：Bug。", "refactor/<name>：不改变行为的结构调整。", "docs/<name>：纯文档。"] },
        { title: "提交规范", bullets: ["feat(scope): ...", "fix(scope): ...", "refactor(scope): ...", "docs(scope): ...", "ci(scope): ..."] },
        { title: "回滚意识", bullets: ["提交越聚焦，越容易 revert。", "不要把重构、视觉改版、数据库迁移和协议变化塞一个 PR。", "合并前确认 final head 的检查对应最后一次提交。"] }
      ]
    },
    en: { summary: "Use small branches and focused PRs with explicit validation and rollback paths.", sections: [
      { title: "Flow", code: "main → branch → commits → PR → CI/Preview → squash merge → production checks" },
      { title: "Naming", bullets: ["feature/", "fix/", "refactor/", "docs/"] },
      { title: "Rollback", bullets: ["Keep commits single-purpose.", "Do not mix structural, visual, database, and protocol changes in one PR."] }
    ] }
  },
  "project-checklist": {
    zh: {
      summary: "项目 Checklist 用来在动手前和收尾时确认范围、依赖、风险、验证和文档，而不是项目完成后的形式化补录。",
      sections: [
        { title: "开始前", bullets: ["目标是什么，非目标是什么。", "现有实现在哪里。", "涉及哪些用户、路由、表、绑定或 secret。", "失败后怎么回滚。", "是否需要迁移或兼容旧数据。"] },
        { title: "实现中", bullets: ["每次只解决一个边界清晰的问题。", "先保持现有行为，再做额外优化。", "关键假设用代码或测试验证，不凭感觉。", "安全相关改动写出威胁模型。"] },
        { title: "完成前", bullets: ["语法/类型/单测/构建检查。", "真实设备或真实服务 smoke test。", "README/架构文档是否过时。", "临时脚本、测试文件、Workflow 是否清理。", "生产部署和监控是否成功。"] }
      ]
    },
    en: { summary: "A project checklist captures scope, dependencies, risk, verification, and cleanup before work is considered complete.", sections: [
      { title: "Before", bullets: ["Goal and non-goals.", "Existing implementation and dependencies.", "Rollback and migration strategy."] },
      { title: "During", bullets: ["Keep slices focused.", "Validate assumptions.", "Preserve behavior before optimizing."] },
      { title: "Finish", bullets: ["Run checks.", "Smoke-test real paths.", "Update docs.", "Remove temporary artifacts."] }
    ] }
  },
  "pre-deploy": {
    zh: {
      summary: "部署前检查关注“代码能跑”之外的内容：配置、secret、数据库兼容、路由、权限、缓存和回滚都必须明确。",
      sections: [
        { title: "代码", bullets: ["node --check / lint / test。", "Wrangler dry-run 或对应构建命令。", "git diff --check 无空白错误。", "最终 diff 中没有临时文件和敏感值。"] },
        { title: "配置", bullets: ["入口文件是否正确。", "环境变量和 binding 名称是否存在。", "paths filter 是否能触发部署。", "Custom Domain 与 Preview 是否指向预期 Worker。"] },
        { title: "数据库与权限", bullets: ["Migration 是否先于依赖它的新代码应用。", "RLS/GRANT/RPC 权限是否符合调用方。", "是否需要兼容旧行、旧 token 或旧缓存。"] },
        { title: "发布后", bullets: ["生产 Workflow 全绿。", "关键路由 smoke test。", "检查错误日志。", "如果 UI 有变化，用至少一个移动设备复查。"] }
      ]
    },
    en: { summary: "Pre-deploy checks cover code, configuration, database compatibility, permissions, routes, and rollback—not just whether a local build succeeds.", sections: [
      { title: "Code", bullets: ["Syntax/tests/build.", "No whitespace errors or temporary artifacts."] },
      { title: "Config", bullets: ["Correct entrypoint, bindings, secrets, path filters, and domains."] },
      { title: "After deploy", bullets: ["All workflow stages green.", "Smoke-test key routes and inspect logs."] }
    ] }
  },
  debugging: {
    zh: {
      summary: "Debug 流程先缩小问题层级，再验证假设。不要一看到现象就直接改 CSS、网络或数据库。",
      sections: [
        { title: "六步法", bullets: ["1. 精确复现：设备、路由、账号、时间、输入。", "2. 确定层级：UI / 浏览器脚本 / Worker / Supabase / R2 / CI。", "3. 找第一处异常证据：console、network、server log、SQL error。", "4. 提出最小假设。", "5. 做能证伪假设的最小改动或检查。", "6. 修根因并补回归防线。"] },
        { title: "UI 问题", bullets: ["先看 DOM 结构。", "再看 computed style 和 selector specificity。", "检查 media query / safe area / viewport。", "最后才考虑位置补丁。"] },
        { title: "API 问题", bullets: ["确认 URL、method、content-type 和请求体。", "区分 401、403、404、500。", "检查服务端实际收到的 headers，不根据客户端猜。"] },
        { title: "数据库问题", bullets: ["直接验证 RPC/table 调用。", "检查 RLS 和 grant。", "检查 schema 与函数签名。", "必要时把问题缩成最小 SQL。"] }
      ]
    },
    en: { summary: "Debug by narrowing the failing layer and testing hypotheses instead of patching the visible symptom.", sections: [
      { title: "Six steps", bullets: ["Reproduce precisely.", "Identify the layer.", "Find the first abnormal evidence.", "Form a minimal hypothesis.", "Try to falsify it.", "Fix the root cause and add a guard."] },
      { title: "UI", bullets: ["DOM → computed styles → media queries → only then positional fixes."] },
      { title: "API", bullets: ["Verify URL, method, content type, body, status, and server-observed headers."] }
    ] }
  },
  naming: {
    zh: {
      summary: "命名要让文件或符号的所有权一眼可见。名字如果只能靠打开文件才能理解，就应该改进。",
      sections: [
        { title: "文件", bullets: ["ui-*.js：页面/渲染。", "ui-style-*.js：明确产品域样式。", "*-api.js：服务端 API 业务。", "*-runtime.js：跨域运行时。", "knowledge-*.js：知识库内容或路由数据。"] },
        { title: "函数", bullets: ["render/build/create/get/update 前缀表达动作。", "返回 HTML 的函数名用 Content/Page/Styles 明确结果。", "布尔值用 is/has/can/should。"] },
        { title: "路由", bullets: ["名词优先，层级稳定。", "URL slug 使用小写 kebab-case。", "避免同一概念出现三种拼写。"] },
        { title: "避免", bullets: ["temp2/final-final/new2。", "utils.js 里无限塞无关函数。", "core.js 作为无法说明职责的万能文件名。"] }
      ]
    },
    en: { summary: "Names should reveal ownership and purpose without opening the file.", sections: [
      { title: "Files", bullets: ["ui-* for rendering.", "*-api for server business APIs.", "*-runtime for shared runtime.", "knowledge-* for knowledge content/schema."] },
      { title: "Routes", bullets: ["Use stable noun-based lower-case kebab-case slugs."] },
      { title: "Avoid", bullets: ["temp2/final-final naming.", "Catch-all utils/core files with mixed ownership."] }
    ] }
  },
  "ui-design": {
    zh: {
      summary: "AERTEX 的 UI 原则是清晰层级、普通语言、真实内容、渐进披露和移动端可用性。Apple 风格只借鉴交互原则，不做品牌模仿。",
      sections: [
        { title: "层级", bullets: ["一页一个主要任务。", "标题先说用户要做什么，不先讲协议名。", "主要动作只有一个明显高优先级。", "高级/技术信息放 details 或次级层。"] },
        { title: "视觉", bullets: ["系统字体优先。", "用间距、字号、字重建立层级，少靠装饰。", "透明材质克制使用，确保 reduced transparency 下仍可读。", "颜色遵循语义变量，不在组件里到处硬编码。"] },
        { title: "交互", bullets: ["触摸目标足够大。", ":active 提供即时反馈。", "支持 prefers-reduced-motion / prefers-contrast。", "导航名称具体，避免“更多”“继续”等失去上下文的词。"] },
        { title: "真实性", bullets: ["没有数据源就明确说未接入。", "不制造假统计、假历史或假状态。", "用户看到的“成功”必须对应真实服务端结果。"] }
      ]
    },
    en: { summary: "AERTEX UI favors clear hierarchy, plain language, real data, progressive disclosure, and mobile usability. Apple-inspired principles are used without brand imitation.", sections: [
      { title: "Hierarchy", bullets: ["One primary task per page.", "Plain-language titles.", "One obvious primary action.", "Hide technical detail one level deeper."] },
      { title: "Accessibility", bullets: ["Large touch targets.", "Reduced motion/contrast/transparency support.", "System fonts and semantic colors."] },
      { title: "Truthfulness", bullets: ["Do not fabricate metrics, activity, or persistence."] }
    ] }
  },
  "work-habits": {
    zh: {
      summary: "长期工作习惯应该减少重新思考同一件事的成本，并让项目在疲劳、换设备或隔一段时间后仍然能继续。",
      sections: [
        { title: "开始工作", bullets: ["先看当前状态和最近一次成功版本。", "复杂改动先建分支。", "先确认现有架构边界，避免重复造模块。"] },
        { title: "进行中", bullets: ["每完成一小刀就验证。", "遇到意外先记录现象和证据，不立刻扩大改动。", "终端命令尽量可复制、可回滚。"] },
        { title: "收尾", bullets: ["确认 PR final head 的 CI/Preview。", "合并后继续看生产，而不是看到 merge 就结束。", "把关键设计/坑写入知识库。"] },
        { title: "精力管理", bullets: ["疲劳时优先做可验证的小任务，不做高风险大迁移。", "停下时留下明确的下一步和当前 commit/PR 状态，降低第二天恢复成本。"] }
      ]
    },
    en: { summary: "Durable work habits reduce the cost of resuming a project after fatigue, device changes, or time away.", sections: [
      { title: "Start", bullets: ["Inspect current state and last known-good version.", "Branch before complex changes."] },
      { title: "During", bullets: ["Validate after each small slice.", "Record evidence before expanding a fix."] },
      { title: "Finish", bullets: ["Check final-head CI/Preview and post-merge production.", "Capture important decisions and pitfalls in the knowledge base."] }
    ] }
  }
};
