/**
 * 【初学者导读】
 * 文件：studio/knowledge-projects.js
 * 知识库模块：组织知识内容、主题路由、检索或学习资料，是 Knowledge 功能的数据/内容层。
 * 阅读顺序：先看对外导出和路由入口，再看参数归一化、权限/语言处理，最后追踪存储或模板渲染。
 * 初学者重点：区分“数据来源”“业务规则”“展示格式”三层，不要把一个显示问题直接当成数据库问题。
 * 修改注意：尽量保持现有路径、字段和返回结构兼容；规则改变时补充对应回归检查。
 * 调试方法：先确认实际命中的路由和 locale，再检查 handler 输入，最后验证最终 Response。
 */
export const PROJECT_KNOWLEDGE = {
  background: {
    zh: {
      summary: "QssedA Studio 是围绕个人资料、知识、工作区、私人存储与统一身份构建的个人工作平台。当前主站运行在 Cloudflare Workers，身份服务独立运行在 auth.qsseda.studio，Supabase 提供认证与 PostgreSQL 数据，Cloudflare R2 提供私人文件存储，GitHub Actions 负责持续检查和生产部署。",
      sections: [
        { title: "项目目标", paragraphs: ["项目的重点不是堆叠演示数据，而是只展示真实可用的能力，并逐步把个人资料、知识、项目、文件和身份统一到同一套平台中。", "Studio 负责日常工作界面；Auth 负责浏览器会话、统一登录和 OAuth 2.0 + PKCE；未来桌面客户端可以复用同一身份体系，而不需要在每个应用里重新保存账号密码。"], bullets: ["真实数据优先：没有数据源的页面明确标注未接入。", "统一身份：Web、桌面和未来移动客户端使用同一账号体系。", "模块边界清楚：后端、产品 UI、共享运行时和样式按职责拆分。", "默认安全：敏感凭据不进入浏览器源码和公共客户端。"] },
        { title: "当前核心组成", bullets: ["qsseda.studio：主 Studio Worker 和个人工作界面。", "auth.qsseda.studio：独立 Auth Worker、浏览器会话和 OAuth/PKCE。", "Supabase：Auth、profiles、审计、角色权限和 OAuth 状态。", "Cloudflare R2：按账号隔离的私人文件对象。", "GitHub：代码仓库、PR、CI/CD 和可追溯历史。"] },
        { title: "长期方向", paragraphs: ["知识库、项目管理、任务、草稿和实验室会逐步从静态入口升级为可持久化的数据产品。当前知识库 v1 先把长期知识的路由与内容结构固定下来，后续再接编辑、全文检索、标签、反向链接和 AI 检索。"] }
      ]
    },
    en: {
      summary: "QssedA Studio is a personal work platform for profile data, knowledge, workspace tools, private storage, and unified identity. The main site runs on Cloudflare Workers, authentication is isolated at auth.qsseda.studio, Supabase provides Auth and PostgreSQL, R2 stores private files, and GitHub Actions handles validation and deployment.",
      sections: [
        { title: "Goals", paragraphs: ["The product favors real capabilities over fabricated dashboard data and grows toward one place for personal knowledge, projects, files, and identity."], bullets: ["Show real data or explicitly say when a source is not connected.", "Reuse one account system across web and desktop clients.", "Keep backend, product UI, shared runtime, and styles separated by responsibility.", "Keep secrets out of browser code and public clients."] },
        { title: "Core components", bullets: ["qsseda.studio — Studio Worker and application UI.", "auth.qsseda.studio — browser sessions and OAuth/PKCE.", "Supabase — Auth, profiles, auditing, RBAC, and OAuth state.", "Cloudflare R2 — private per-user object storage.", "GitHub — source, PRs, CI/CD, and history."] },
        { title: "Direction", paragraphs: ["Knowledge, projects, tasks, drafts, and experiments can later gain persistence, search, tags, backlinks, and AI retrieval without changing the route hierarchy introduced by Knowledge Base v1."] }
      ]
    }
  },
  architecture: {
    zh: {
      summary: "当前架构采用两个独立 Worker：Studio 处理主站与业务 UI，Auth 处理身份和授权。Studio 的 worker.js 只作为兼容入口，实际实现位于 studio/ 模块；Auth 通过 auth-entry.js 分派浏览器 Auth 与 PKCE 自测。",
      sections: [
        { title: "请求链路", code: "浏览器\n  ├─ qsseda.studio → worker.js → studio/entry.js\n  │    ├─ Account API\n  │    ├─ Storage API → R2\n  │    └─ Studio UI → Supabase browser session\n  └─ auth.qsseda.studio → auth-entry.js\n       ├─ auth-worker.js\n       ├─ auth-oauth.js\n       └─ auth-pkce-test.js" },
        { title: "Studio 分层", bullets: ["entry.js：顶层请求路由。", "account-api.js / storage-api.js：服务端业务 API。", "server-runtime.js / routing.js / html-utils.js：中立共享能力。", "ui-shell.js：导航、会话、授权 bootstrap 和页面组合。", "ui-profile/ui-settings/ui-storage/ui-admin/ui-dashboard/ui-information/ui-workspace：产品域 UI。", "ui-page/ui-audit/ui-primitives：共享页面与浏览器运行时。", "ui-styles + 产品样式片段：CSS 聚合与明确归属。"] },
        { title: "架构约束", bullets: ["Studio 和 Auth 独立部署，避免身份逻辑与主站 UI 互相绑死。", "worker.js 保持极薄，减少部署入口变化。", "产品模块不能反向依赖 ui-shell.js。", "结构重构优先做字节级输出比较，避免无意改变行为。"] }
      ]
    },
    en: {
      summary: "The system uses two independent Workers: Studio owns the application UI and business endpoints, while Auth owns identity and authorization. worker.js is a compatibility facade into studio/entry.js; auth-entry.js dispatches Auth and PKCE self-test traffic.",
      sections: [
        { title: "Request flow", code: "Browser\n  ├─ qsseda.studio → worker.js → studio/entry.js\n  │    ├─ Account API\n  │    ├─ Storage API → R2\n  │    └─ Studio UI → Supabase browser session\n  └─ auth.qsseda.studio → auth-entry.js\n       ├─ auth-worker.js\n       ├─ auth-oauth.js\n       └─ auth-pkce-test.js" },
        { title: "Studio layers", bullets: ["entry.js for top-level request routing.", "account-api.js and storage-api.js for server business APIs.", "server-runtime.js, routing.js, and html-utils.js for neutral helpers.", "ui-shell.js for navigation, session bootstrap, authorization, and composition.", "Product UI modules for Profile, Settings, Storage, Admin, Dashboard, Information, and Workspace.", "ui-page.js, ui-audit.js, and ui-primitives.js for shared UI runtime."] },
        { title: "Constraints", bullets: ["Studio and Auth deploy independently.", "worker.js remains intentionally thin.", "Product modules do not depend back on ui-shell.js.", "Structural refactors use byte-equivalence where practical."] }
      ]
    }
  },
  "module-map": {
    zh: {
      summary: "模块关系的核心原则是单向依赖：入口依赖业务模块，产品模块依赖共享原语，但共享层不反向依赖产品层。这样修改某个功能时可以把影响范围限制在对应文件。",
      sections: [
        { title: "Studio 模块图", code: "worker.js\n└─ studio/entry.js\n   ├─ config.js / routing.js\n   ├─ account-api.js → server-runtime.js\n   ├─ storage-api.js → server-runtime.js\n   ├─ auth-handoff.js → ui-page.js\n   └─ ui-shell.js\n      ├─ ui-page.js / ui-audit.js / ui-primitives.js\n      ├─ ui-dashboard.js\n      ├─ ui-information.js → ui-knowledge.js\n      ├─ ui-profile.js\n      ├─ ui-workspace.js\n      ├─ ui-admin.js\n      ├─ ui-settings.js / ui-storage.js\n      └─ ui-styles.js" },
        { title: "修改时怎么找文件", bullets: ["首页：ui-dashboard.js + ui-style-dashboard.js。", "个人资料：ui-profile.js + ui-style-profile.js。", "管理后台：ui-admin.js + ui-style-admin.js。", "知识库：ui-information.js / ui-knowledge.js / knowledge-*.js / ui-style-knowledge.js。", "登录注册页：auth-pages.js；独立 Auth 站点：auth-worker.js / auth-oauth.js。", "R2 文件：storage-api.js + ui-storage.js。"] },
        { title: "禁止的依赖方向", bullets: ["Storage 不应为了通用日志去依赖 Account 域。", "产品模块不应为了 Hub 组件反向 import Shell。", "配置层不应依赖具体页面实现。", "桌面公共客户端不能依赖服务端 secret。"] }
      ]
    },
    en: {
      summary: "Dependencies are intentionally directional: entries depend on business modules, product modules depend on neutral primitives, and shared layers do not depend back on product code.",
      sections: [
        { title: "Studio module map", code: "worker.js\n└─ studio/entry.js\n   ├─ config.js / routing.js\n   ├─ account-api.js → server-runtime.js\n   ├─ storage-api.js → server-runtime.js\n   ├─ auth-handoff.js → ui-page.js\n   └─ ui-shell.js → product UI + shared UI runtime" },
        { title: "Where to edit", bullets: ["Dashboard: ui-dashboard.js + ui-style-dashboard.js.", "Profile: ui-profile.js + ui-style-profile.js.", "Admin: ui-admin.js + ui-style-admin.js.", "Knowledge: ui-information.js, ui-knowledge.js, knowledge modules, ui-style-knowledge.js.", "R2: storage-api.js + ui-storage.js."] },
        { title: "Avoid", bullets: ["Do not make Storage depend on Account for generic helpers.", "Do not make product modules depend on Shell for shared components.", "Do not put server secrets into public clients."] }
      ]
    }
  },
  api: {
    zh: {
      summary: "QssedA 目前同时存在 Studio 业务 API、Auth 浏览器会话 API 和 OAuth 协议端点。调用前要先确认端点属于哪个 origin，以及它需要浏览器 Cookie、Supabase token、OAuth access token 还是资源服务器凭据。",
      sections: [
        { title: "Studio API", code: "POST /api/auth/signup\nPOST /api/auth/login\nPOST /auth/handoff\nGET  /api/storage/files\nPOST /api/storage/upload\nGET  /api/storage/object\nDELETE /api/storage/object" },
        { title: "Auth API", code: "POST /api/login\nGET  /api/session\nPOST /api/logout\nGET  /health\nGET  /authorize\nPOST /api/oauth/authorize\nPOST /oauth/token\nPOST /oauth/revoke\nPOST /oauth/introspect\nGET  /.well-known/oauth-authorization-server" },
        { title: "使用原则", bullets: ["OAuth token/revoke/introspect 使用 application/x-www-form-urlencoded 等协议约定，不随意改 JSON。", "授权码与 token 响应必须 no-store。", "桌面端用系统浏览器完成授权，不用嵌入式 WebView。", "Storage API 必须通过已认证用户身份计算对象前缀，不能允许客户端自由指定其他用户目录。"] }
      ]
    },
    en: {
      summary: "QssedA exposes Studio business APIs, browser Auth session APIs, and OAuth protocol endpoints. Before calling one, identify its origin and whether it expects cookies, Supabase identity, OAuth access tokens, or resource-server credentials.",
      sections: [
        { title: "Studio API", code: "POST /api/auth/signup\nPOST /api/auth/login\nPOST /auth/handoff\nGET  /api/storage/files\nPOST /api/storage/upload\nGET|DELETE /api/storage/object" },
        { title: "Auth / OAuth API", code: "POST /api/login\nGET /api/session\nPOST /api/logout\nGET /authorize\nPOST /api/oauth/authorize\nPOST /oauth/token\nPOST /oauth/revoke\nPOST /oauth/introspect" },
        { title: "Rules", bullets: ["Respect OAuth form-encoding and no-store semantics.", "Desktop authorization uses the system browser.", "R2 object access must remain scoped to the authenticated user."] }
      ]
    }
  },
  database: {
    zh: {
      summary: "数据库由 Supabase PostgreSQL 承担。当前仓库里的两个顶层 SQL 文件仍然是基础 bootstrap，而 supabase/migrations/ 是后续增量迁移；在建立完整 baseline migration 前不能随意删除顶层 SQL。",
      sections: [
        { title: "身份与权限", bullets: ["profiles：用户公开/业务资料、role、status。", "roles / permissions / role_permissions：RBAC 定义。", "admin_users：与管理员约束相关的辅助数据。", "login_events：登录审计。", "user_devices：设备与最后使用信息。", "audit_logs：操作审计。"] },
        { title: "OAuth", bullets: ["oauth_clients：客户端注册、redirect URI 与 scope allow-list。", "oauth_authorization_codes：一次性授权码的哈希、PKCE challenge 和绑定信息。", "oauth_access_tokens：opaque access token 的哈希、scope 和有效期。", "oauth_refresh_tokens：refresh token 哈希、轮换与撤销状态。", "oauth_resource_servers：服务端 introspection 调用者及 secret hash。"] },
        { title: "安全原则", bullets: ["敏感 token/授权码数据库只保存哈希。", "关键表启用 RLS，浏览器角色只获得必要权限。", "SECURITY DEFINER RPC 必须固定 search_path 并严格控制 execute grant。", "迁移只做向前演进；生产已应用的迁移不要在原文件里静默改历史。"] }
      ]
    },
    en: {
      summary: "Supabase PostgreSQL stores application state. The two top-level SQL files are still baseline bootstrap inputs while supabase/migrations contains incremental migrations, so the baseline files must stay until a complete bootstrap migration exists.",
      sections: [
        { title: "Identity and RBAC", bullets: ["profiles", "roles / permissions / role_permissions", "login_events", "user_devices", "audit_logs"] },
        { title: "OAuth", bullets: ["oauth_clients", "oauth_authorization_codes", "oauth_access_tokens", "oauth_refresh_tokens", "oauth_resource_servers"] },
        { title: "Security", bullets: ["Store hashes rather than raw OAuth secrets/tokens where applicable.", "Use RLS and narrow grants.", "Pin search_path on privileged RPCs.", "Treat applied migrations as immutable history."] }
      ]
    }
  },
  deployment: {
    zh: {
      summary: "生产发布由 GitHub main 分支触发 GitHub Actions，先做语法和 Wrangler dry-run 校验，再分别部署 Studio 与 Auth。Cloudflare 分支 Preview 用于 PR 上的真实 Worker 预览，Supabase schema 变化则通过 migration 单独执行。",
      sections: [
        { title: "正常发布链", code: "feature branch\n→ Pull Request\n→ Studio/Auth Worker Check\n→ Cloudflare Preview\n→ squash merge main\n→ Deploy QssedA Production\n   1. Validate Workers\n   2. Deploy Studio\n   3. Deploy Auth" },
        { title: "Supabase", bullets: ["数据库变化先写 migration，并在测试/生产项目执行。", "不要把 service-role key、数据库密码或 Cloudflare token 写入仓库。", "OAuth 客户端或资源服务器 secret 属于服务端配置，不进入桌面应用。"] },
        { title: "部署后确认", bullets: ["GitHub Actions 三段全部 success。", "检查关键路由实际返回。", "涉及 UI 时在 iPhone/Safari 和桌面至少各检查一次。", "涉及 Auth 时验证登录、授权、刷新、撤销和回跳路径。"] }
      ]
    },
    en: {
      summary: "Production ships from GitHub main through Actions. Syntax and Wrangler dry-run checks run first, then Studio and Auth deploy separately. Pull requests also receive a Cloudflare Worker preview; Supabase schema changes are applied as migrations.",
      sections: [
        { title: "Release chain", code: "feature branch → PR → checks + preview → squash merge → production validate → Studio → Auth" },
        { title: "Secrets", bullets: ["Keep Cloudflare and database credentials in secret storage.", "Apply database changes through migrations.", "Never embed resource-server secrets in desktop clients."] },
        { title: "Post-deploy", bullets: ["Confirm all workflow stages are green.", "Smoke-test changed routes.", "For Auth changes, test authorization, refresh, revocation, and handoff."] }
      ]
    }
  },
  decisions: {
    zh: {
      summary: "重要设计决策应该记录“为什么”，而不是只记最后代码。QssedA 当前最关键的决策包括双 Worker、PKCE 公共客户端、opaque token、受保护 introspection、按用户隔离 R2，以及分阶段模块化。",
      sections: [
        { title: "身份独立成 Auth Worker", paragraphs: ["把 auth.qsseda.studio 独立出来，可以让网页和桌面应用共享同一身份基础设施，同时避免主站 UI 重构直接影响 OAuth 协议。"] },
        { title: "桌面客户端使用 Authorization Code + PKCE", paragraphs: ["桌面 App 属于 public client，无法安全保管可复用 client_secret，因此使用 S256 PKCE、state、短期一次性 code 和系统浏览器。"] },
        { title: "Token 采用 opaque + 服务端 introspection", paragraphs: ["资源服务器通过受认证的 /oauth/introspect 检查 access token。桌面客户端看不到资源服务器 secret，数据库只存 token hash。"] },
        { title: "模块化不做大爆炸重写", paragraphs: ["原 7,544 行 worker.js 按 Phase 1–4 渐进拆分，每一刀优先证明输出不变。这个策略降低了在只有手机或远程操作时误伤生产的风险。"] }
      ]
    },
    en: {
      summary: "Architecture decisions capture why the system is shaped this way: separate Workers, PKCE for public clients, opaque tokens with protected introspection, per-user R2 isolation, and staged modularization.",
      sections: [
        { title: "Separate Auth Worker", paragraphs: ["Identity remains reusable across web and desktop without coupling OAuth protocol behavior to Studio UI changes."] },
        { title: "PKCE public client", paragraphs: ["Desktop applications cannot safely keep a reusable client secret, so they use system-browser Authorization Code + S256 PKCE and state."] },
        { title: "Opaque tokens", paragraphs: ["Protected resource servers introspect opaque tokens; raw token values are not stored in the database."] },
        { title: "Staged modularization", paragraphs: ["The 7,544-line monolith was decomposed incrementally with equivalence checks rather than rewritten in one step."] }
      ]
    }
  },
  pitfalls: {
    zh: {
      summary: "踩坑记录的价值在于保留触发条件、错误判断和最终证据。遇到类似问题时先匹配现象，再复用定位方法，而不是只复制最后一行修复代码。",
      sections: [
        { title: "CSS 选择器误伤", paragraphs: ["Dashboard 时钟图标曾经因为 .dashboard-today-card span 的选择器覆盖 .dashboard-icon 的 display:grid，导致 SVG 贴到左上角。修复不是给 SVG 加偏移，而是缩窄文字 span 的选择器作用域。"] },
        { title: "只做 node --check 不够", paragraphs: ["模板字符串/Worker 打包问题可能通过 JavaScript 语法检查，却在 Wrangler bundle 阶段失败。因此结构和部署改动至少同时跑 node --check 与 wrangler deploy --dry-run。"] },
        { title: "GitHub Actions bot push 不触发下游 workflow", paragraphs: ["由 GITHUB_TOKEN 在 workflow 内产生的 push 通常不会再次触发另一个 push workflow。需要正常用户提交、workflow_dispatch 或明确设计的链路。"] },
        { title: "看见大文件不等于应该继续拆", paragraphs: ["剩余 CSS 存在跨 Settings/Storage/Audit/Shell 的响应式规则，强行按名字拆会增加耦合。拆分必须基于所有权和稳定消费者，而不是行数。"] }
      ]
    },
    en: {
      summary: "Pitfall notes preserve symptoms, false assumptions, and evidence so future debugging can reuse the reasoning rather than blindly copying a final patch.",
      sections: [
        { title: "Selector collisions", paragraphs: ["A generic .dashboard-today-card span rule overrode the clock icon wrapper's display:grid. The correct fix narrowed the text selector instead of offsetting the SVG."] },
        { title: "Syntax check is not bundling", paragraphs: ["node --check can pass while Wrangler bundling fails. Both gates are required."] },
        { title: "Workflow-token pushes", paragraphs: ["Pushes made by a workflow token may not trigger downstream push workflows; deployment chains must account for that."] },
        { title: "Do not split by line count", paragraphs: ["Shared responsive CSS is safer aggregated when ownership genuinely crosses product boundaries."] }
      ]
    }
  },
  "bug-fixes": {
    zh: {
      summary: "已解决 Bug 页面记录典型故障的“现象 → 根因 → 修复 → 防回归”。它不是完整 issue 列表，而是优先保存未来最可能再次遇到的故障模式。",
      sections: [
        { title: "Dashboard 时钟图标偏左上", bullets: ["现象：蓝色图标方块位置正常，但钟 SVG 靠左上。", "根因：.dashboard-today-card span 的 display:block 覆盖了图标 span 的 display:grid。", "修复：把文字规则改为 .dashboard-today-card > div > ...，恢复图标 place-items:center。", "防回归：避免对容器内所有 span 写展示模式；优先选择语义明确的直接子级。"] },
        { title: "OAuth introspection 有实现但路由不可达", bullets: ["现象：auth-oauth.js 已实现 /oauth/introspect，但外层 Auth route set 未登记。", "修复：把 /oauth/introspect 加入 auth-worker.js 的 OAuth 路由分派，同时保留资源服务器认证。"] },
        { title: "Auth 模板字符串能过语法但 Wrangler 失败", bullets: ["现象：node --check 成功，实际 Worker bundle 报模板字符串相关错误。", "修复：重新校正转义，并把 Wrangler dry-run 纳入永久 Auth Check。"] },
        { title: "移动端 Auth handoff 兼容", bullets: ["现象：不同浏览器对 Origin/Referer/Fetch Metadata 的发送方式并不完全一致。", "修复方向：只接受可信生产 origin、受控 Referer fallback 或可信 same-site 顶层导航，再继续验证 Supabase token 与 active profile；不能为了兼容直接取消来源校验。"] }
      ]
    },
    en: {
      summary: "Resolved bug notes capture symptom → root cause → fix → regression guard for failure modes likely to return.",
      sections: [
        { title: "Dashboard clock alignment", bullets: ["A broad span selector overrode display:grid on the icon wrapper.", "Narrowing the text selector restored place-items:center without positional hacks."] },
        { title: "Unreachable introspection route", bullets: ["The endpoint existed in auth-oauth.js but was missing from the outer Auth route set.", "Registering the route completed the chain without weakening resource-server authentication."] },
        { title: "Bundle-only Auth failure", bullets: ["Syntax validation passed while Wrangler bundling failed on template escaping.", "Permanent dry-run bundling was added to CI."] },
        { title: "Mobile handoff compatibility", bullets: ["Origin, Referer, and Fetch Metadata vary across browsers; compatibility fallbacks must remain constrained to trusted navigation and still validate the Supabase session and active profile."] }
      ]
    }
  }
};
