export const TECHNOLOGY_KNOWLEDGE = {
  languages: {
    zh: {
      summary: "这一页保存项目里最常用的 Python、JavaScript、SQL 和 Git 语法与习惯，重点是可直接复用的写法，而不是完整语言手册。",
      sections: [
        { title: "Python", code: "# 条件 / 循环 / 推导式\nif condition:\n    pass\nfor item in items:\n    ...\nvalues = [x * 2 for x in xs if x > 0]\n\n# 安全读取\nvalue = mapping.get(\"key\", default)" },
        { title: "JavaScript", code: "const value = obj?.nested?.value ?? fallback;\nconst rows = items.map(item => ({ ...item, active: true }));\nconst response = await fetch(url, { method: \"POST\" });\nif (!response.ok) throw new Error(`HTTP ${response.status}`);" },
        { title: "SQL", code: "select id, display_name\nfrom public.profiles\nwhere status = 'active'\norder by updated_at desc\nlimit 50;\n\n-- 迁移中优先使用可重复执行的保护\ncreate index if not exists profiles_status_idx on public.profiles(status);" },
        { title: "Git", code: "git status --short\ngit diff --check\ngit diff --stat\ngit add <files>\ngit commit -m \"type(scope): message\"\ngit push -u origin <branch>" },
        { title: "使用习惯", bullets: ["能用清晰条件表达就不要制造多层嵌套。", "异步调用检查错误路径，不只写成功路径。", "SQL 迁移优先显式 schema，并考虑 RLS/权限。", "Git 提交保持单一目的，方便 review 和回滚。"] }
      ]
    },
    en: {
      summary: "A practical quick reference for Python, JavaScript, SQL, and Git patterns used repeatedly in the project.",
      sections: [
        { title: "Python", code: "value = mapping.get('key', default)\nvalues = [x * 2 for x in xs if x > 0]" },
        { title: "JavaScript", code: "const value = obj?.nested?.value ?? fallback;\nconst response = await fetch(url);\nif (!response.ok) throw new Error(`HTTP ${response.status}`);" },
        { title: "SQL", code: "select id, display_name from public.profiles where status = 'active';" },
        { title: "Git", code: "git status --short\ngit diff --check\ngit add <files>\ngit commit -m \"type(scope): message\"" }
      ]
    }
  },
  "cloudflare-workers": {
    zh: {
      summary: "Cloudflare Workers 是 AERTEX 的主要服务端运行环境。开发时需要同时理解 fetch handler、bindings、Wrangler 配置、Custom Domain、Preview 和边缘运行限制。",
      sections: [
        { title: "基本 Worker", code: "export default {\n  async fetch(request, env, ctx) {\n    const url = new URL(request.url);\n    return new Response('ok');\n  }\n};" },
        { title: "Bindings", bullets: ["R2、KV、D1、Durable Objects、环境变量都通过 env 获取。", "AERTEX Studio 的私人文件使用 env.STORAGE R2 binding。", "敏感值用 Worker secrets，不写 wrangler.jsonc 明文。"] },
        { title: "Wrangler", code: "npx wrangler deploy --dry-run -c wrangler.jsonc\nnpx wrangler deploy -c wrangler.jsonc\nnpx wrangler deploy --dry-run -c wrangler.auth.jsonc" },
        { title: "常见注意点", bullets: ["node --check 只能检查语法，Wrangler dry-run 才能覆盖打包。", "不同 Worker 使用独立配置时要确认 main 入口。", "Custom Domain 与 workers.dev Preview 是不同访问路径。", "生产日志不要打印 token、密码、Cookie 或完整敏感 payload。"] }
      ]
    },
    en: {
      summary: "Cloudflare Workers is AERTEX's main server runtime. Important concepts are fetch handlers, bindings, Wrangler, custom domains, previews, and edge-runtime constraints.",
      sections: [
        { title: "Worker", code: "export default { async fetch(request, env, ctx) { return new Response('ok'); } };" },
        { title: "Bindings", bullets: ["Access R2 and other bindings through env.", "Keep sensitive values in Worker secrets."] },
        { title: "Wrangler", code: "npx wrangler deploy --dry-run -c wrangler.jsonc" },
        { title: "Checks", bullets: ["Run syntax and bundle checks.", "Verify the configured main entry for each Worker.", "Never log secrets or tokens."] }
      ]
    }
  },
  supabase: {
    zh: {
      summary: "Supabase 在项目中同时承担 Auth、PostgreSQL、RLS 和 RPC。安全边界的关键不是“有 RLS 就安全”，而是表权限、policy、函数权限和 security definer search_path 必须一起正确。",
      sections: [
        { title: "RLS", bullets: ["启用：alter table ... enable row level security。", "Policy 分 select/insert/update/delete，不要假设一个 policy 自动覆盖全部动作。", "with check 控制写入后的新行是否合法；using 控制当前行是否可访问。", "需要 auth.uid() 的 policy 要考虑 null 和管理员路径。"] },
        { title: "RPC", bullets: ["SECURITY DEFINER 用于需要受控提升权限的操作。", "固定 set search_path，避免对象解析被劫持。", "默认 revoke execute，再只 grant 给真正需要的角色。", "RPC 内部仍要做业务级管理员/用户身份校验。"] },
        { title: "Auth", bullets: ["浏览器用 publishable/anon 能力 + RLS，不给 service role。", "服务端敏感操作使用受保护 runtime 配置。", "登录成功后不要仅信任前端 metadata；需要时回查 profile status/role。"] },
        { title: "排错", bullets: ["401/403 先区分 Auth 未登录、RLS 拒绝、RPC grant 不足还是业务状态不允许。", "遇到 infinite recursion 检查 policy 是否查询同一张受 RLS 约束表。", "遇到 function not found 检查参数签名、schema 与 PostgREST schema cache。"] }
      ]
    },
    en: {
      summary: "Supabase provides Auth, PostgreSQL, RLS, and RPC. Safe behavior depends on grants, policies, function privileges, and pinned search paths working together.",
      sections: [
        { title: "RLS", bullets: ["Use action-specific policies.", "using controls visible rows; with check controls written rows."] },
        { title: "RPC", bullets: ["Pin search_path for SECURITY DEFINER functions.", "Revoke broad execute rights and grant narrowly."] },
        { title: "Auth", bullets: ["Browser clients rely on publishable credentials plus RLS.", "Do not expose service-role credentials."] },
        { title: "Debugging", bullets: ["Distinguish authentication, RLS, function grants, and business account status."] }
      ]
    }
  },
  "oauth-pkce": {
    zh: {
      summary: "OAuth 2.0 Authorization Code + PKCE 用于让桌面公共客户端安全获得 AERTEX 应用 token，而不把可复用 client_secret 放进客户端。AERTEX 只接受 S256。",
      sections: [
        { title: "核心流程", code: "App 生成 code_verifier + state\n→ SHA-256 + Base64URL 得到 code_challenge\n→ 系统浏览器 GET /authorize\n→ 用户登录并允许\n→ callback?code=...&state=...\n→ App 校验 state\n→ POST /oauth/token + code_verifier\n→ access_token + refresh_token" },
        { title: "安全要求", bullets: ["state 防止请求被替换/混淆。", "authorization code 短期、一次性、绑定 client_id / redirect_uri / scope / challenge。", "access token 短期；refresh token 每次刷新都轮换并撤销旧值。", "数据库存哈希，不存 raw token。", "桌面端不内置 client_secret。"] },
        { title: "回调", bullets: ["支持 qsseda-git://auth/callback 自定义 scheme。", "支持 127.0.0.1 loopback + 动态端口，适合 Windows 临时本地监听。", "redirect_uri 必须按注册规则严格匹配，不能做任意前缀匹配。"] },
        { title: "资源服务器", paragraphs: ["API 服务拿到客户端 Bearer token 后，通过受 HTTP Basic 认证的 /oauth/introspect 检查 active、client_id、sub、scope、exp。这个 secret 只属于服务端。"] }
      ]
    },
    en: {
      summary: "Authorization Code + PKCE lets public desktop clients obtain AERTEX application tokens without embedding a reusable client secret. AERTEX requires S256.",
      sections: [
        { title: "Flow", code: "verifier + state → challenge → /authorize → code → validate state → /oauth/token → access + refresh" },
        { title: "Security", bullets: ["Short-lived single-use codes.", "Rotating refresh tokens.", "Hash persisted token material.", "No desktop client secret."] },
        { title: "Callbacks", bullets: ["Custom URI scheme.", "127.0.0.1 loopback with ephemeral ports.", "Strict redirect validation."] },
        { title: "Resource server", paragraphs: ["Protected servers introspect opaque access tokens using server-only credentials."] }
      ]
    }
  },
  "github-actions": {
    zh: {
      summary: "GitHub Actions 用于把检查、Preview 前的验证和生产发布自动化。核心原则是：PR head 必须跑最终代码的检查，合并后生产部署也必须再次验证。",
      sections: [
        { title: "Workflow 基本结构", code: "name: Check\non:\n  pull_request:\njobs:\n  check:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v7\n      - run: node --check worker.js" },
        { title: "AERTEX 永久检查", bullets: ["Studio Worker Check：检查 studio/*.js、Wrangler bundle、配置形状。", "Auth Worker Check：检查 Auth JS、Auth bundle 和 wrangler.auth.jsonc。", "Deploy AERTEX Production：main 变更后验证并依次部署 Studio/Auth。"] },
        { title: "一次性 Workflow", bullets: ["仅在远程无法运行脚本时用于安全迁移/验证。", "完成后必须从最终分支删除，不能把临时自动改代码 Workflow 留在 main。", "Bot push 可能不会触发后续 push workflow，需要显式设计。"] },
        { title: "安全", bullets: ["Secrets 通过 GitHub Secrets 注入。", "日志避免 echo secret。", "workflow 权限按需最小化。"] }
      ]
    },
    en: {
      summary: "GitHub Actions automates checks and production release. Final PR heads must be validated, and production validates again after merge.",
      sections: [
        { title: "Permanent workflows", bullets: ["Studio Worker Check.", "Auth Worker Check.", "Deploy AERTEX Production."] },
        { title: "One-off workflows", bullets: ["Use only for focused remote migration/validation.", "Remove them from the final branch.", "Do not assume bot pushes trigger downstream push workflows."] },
        { title: "Security", bullets: ["Use repository secrets and minimal permissions.", "Never print secret values."] }
      ]
    }
  },
  "tex-latex": {
    zh: {
      summary: "TeX/LaTeX 适合可重复编译的技术文档、数学公式、论文与报告。知识库主要保存最常用结构、排错方法和未来 AERTEX 桌面端的本地编译约定。",
      sections: [
        { title: "最小文档", code: "\\documentclass{article}\n\\usepackage{amsmath}\n\\begin{document}\n\\section{Example}\n$P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)}$\n\\end{document}" },
        { title: "常用包", bullets: ["amsmath/amssymb：数学。", "graphicx：图片。", "booktabs：高质量表格。", "hyperref：链接和 PDF metadata。", "ctex：中文文档。"] },
        { title: "编译思路", bullets: ["中文文档优先 XeLaTeX/LuaLaTeX。", "引用和目录可能需要多轮编译。", "桌面端如果集成本地 TeX，要把编译器路径、项目根目录、输出目录和错误日志独立管理。"] },
        { title: "排错", bullets: ["Undefined control sequence：命令拼错或缺包。", "File not found：路径/工作目录/资源文件问题。", "Missing $ inserted：数学模式边界错误。", "Overfull hbox：内容超出行宽，不一定阻止编译。"] }
      ]
    },
    en: {
      summary: "TeX/LaTeX is useful for reproducible technical documents, mathematics, papers, and reports.",
      sections: [
        { title: "Minimal document", code: "\\documentclass{article}\n\\usepackage{amsmath}\n\\begin{document}\n$P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)}$\n\\end{document}" },
        { title: "Packages", bullets: ["amsmath/amssymb", "graphicx", "booktabs", "hyperref", "ctex for Chinese"] },
        { title: "Build", bullets: ["Prefer XeLaTeX/LuaLaTeX for modern Unicode workflows.", "Keep compiler paths and logs explicit in desktop tooling."] }
      ]
    }
  },
  "ios-windows": {
    zh: {
      summary: "AERTEX 的桌面方向以 Windows 为首个完整客户端，iPhone/iPad 更适合轻入口、浏览器和系统能力集成。跨平台设计时要区分“系统浏览器授权”和“应用自身 UI”。",
      sections: [
        { title: "Windows", bullets: ["桌面 OAuth 使用系统默认浏览器 + loopback 或自定义 scheme 回调。", "本地 Git/TeX 需要明确可执行文件发现、工作目录、进程输出和取消机制。", "Token 存储应使用操作系统安全凭据能力，而不是明文配置文件。"] },
        { title: "iOS/iPadOS", bullets: ["系统限制使本地后台服务、任意进程和文件系统行为不同于 Windows。", "Web/轻应用适合账户、状态、项目控制和查看，不适合假装拥有完整桌面执行能力。", "认证仍优先使用系统浏览器会话，不把密码交给第三方 WebView。"] },
        { title: "响应式 Web", bullets: ["Safari 安全区、工具栏、动态 viewport、触摸目标和滚动容器需要真实设备检查。", "不要用桌面 hover 作为唯一交互反馈。"] }
      ]
    },
    en: {
      summary: "Windows is the primary full desktop target, while iPhone/iPad are better for lightweight access, browser workflows, and system integrations.",
      sections: [
        { title: "Windows", bullets: ["Use system-browser OAuth with loopback/custom callback.", "Manage Git/TeX processes, working directories, logs, and cancellation explicitly.", "Use OS-protected credential storage."] },
        { title: "iOS/iPadOS", bullets: ["Platform sandboxing differs fundamentally from Windows.", "Web/lightweight clients should not pretend to have unrestricted local process access."] },
        { title: "Responsive web", bullets: ["Test safe areas, dynamic viewport, touch targets, and scrolling on real Safari devices."] }
      ]
    }
  },
  errors: {
    zh: {
      summary: "错误码只告诉你结果，排错要结合请求层、认证层、权限层和业务层。先缩小故障层级，再看日志和响应体。",
      sections: [
        { title: "HTTP", bullets: ["400：参数/格式错误，检查 JSON、form-urlencoded、必填字段。", "401：身份未建立或服务端凭据错误。", "403：身份存在但权限/RLS/业务状态不允许。", "404：路由没注册、路径错误或对象不存在。", "409：冲突/重复状态。", "429：限流。", "500：服务端未处理异常。"] },
        { title: "OAuth", bullets: ["invalid_request：缺参数或格式错误。", "invalid_client：client/resource server 验证失败。", "invalid_grant：code/refresh token 失效、已用、被撤销或绑定信息不匹配。", "invalid_scope：请求 scope 不在 allow-list。"] },
        { title: "前端", bullets: ["布局异常先看 computed style 和选择器优先级。", "脚本不执行检查 CSP、控制台异常、DOM ID 与脚本顺序。", "移动端特有问题优先用真实 Safari/Chrome 复现，不根据桌面模拟器直接下结论。"] },
        { title: "部署", bullets: ["node --check 成功但发布失败：继续看 Wrangler bundle。", "GitHub workflow 没触发：检查 paths filter、事件类型和 bot push 限制。", "部署成功但页面旧：确认域名指向、缓存和实际 commit。"] }
      ]
    },
    en: {
      summary: "Error codes identify the outcome, not the root cause. Narrow the failing layer—request, authentication, authorization, business logic, or deployment—before changing code.",
      sections: [
        { title: "HTTP", bullets: ["400 bad input", "401 missing/invalid authentication", "403 authorization or policy denial", "404 route/object not found", "429 rate limit", "500 server exception"] },
        { title: "OAuth", bullets: ["invalid_request", "invalid_client", "invalid_grant", "invalid_scope"] },
        { title: "Frontend", bullets: ["Inspect computed styles for layout issues.", "Check CSP, console errors, DOM identifiers, and script ordering."] },
        { title: "Deployment", bullets: ["A syntax pass does not replace bundling.", "Check workflow path filters and bot-push behavior."] }
      ]
    }
  }
};
