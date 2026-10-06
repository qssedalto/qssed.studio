/**
 * 【初学者导读】
 * 文件：studio/public-home.js
 * 公开页面/索引模块：生成无需登录也能访问或被搜索引擎理解的页面与元数据。
 * 阅读顺序：先看对外导出和路由入口，再看参数归一化、权限/语言处理，最后追踪存储或模板渲染。
 * 初学者重点：区分“数据来源”“业务规则”“展示格式”三层，不要把一个显示问题直接当成数据库问题。
 * 修改注意：尽量保持现有路径、字段和返回结构兼容；规则改变时补充对应回归检查。
 * 调试方法：先确认实际命中的路由和 locale，再检查 handler 输入，最后验证最终 Response。
 */
import { FAVICON_LINKS } from "./favicon.js";
import { SUPPORTED_LOCALES, localeDirection, normalizeSupportedLocale } from "./locale.js";

const COPY = {
  "zh-cn": {
    title: "AERTEX — Work、Cash、Watch、Intelligence 与个人工具",
    description: "AERTEX 把 Work、Cash、Watch、Intelligence 和个人工具放在一个账号里。登录后继续使用你的工作区、现金流工具、AI 对话、电脑使用记录和其他服务。",
    eyebrow: "AERTEX",
    heading: "一个账号，打开你的 AERTEX。",
    lead: "Work、Cash、Watch、Intelligence 和个人工具都在这里。登录后继续使用；第一次来，可以先创建账号。",
    signIn: "登录",
    signUp: "创建账号",
    products: "产品",
    work: "Work",
    workText: "文档、项目与工作区。",
    intelligence: "Intelligence",
    intelligenceText: "你的 AI 对话与工具。",
    watch: "Watch",
    watchText: "查看已同步的 ActivityWatch 使用记录。",
    cash: "Cash",
    cashText: "个人现金流、预算与预测。",
    questions: "问题与解答",
    questionsText: "查看 AERTEX 的官方事实、产品边界与常见问题。",
    account: "Account",
    accountText: "一个账号连接所有 AERTEX 服务."
  },
  "zh-tw": {
    title: "AERTEX — Work、Cash、Watch、Intelligence 與個人工具",
    description: "AERTEX 將 Work、Cash、Watch、Intelligence 與個人工具放在同一個帳號中。登入後繼續使用你的工作區、現金流工具、AI 對話、電腦使用記錄與其他服務。",
    eyebrow: "AERTEX",
    heading: "一個帳號，打開你的 AERTEX。",
    lead: "Work、Cash、Watch、Intelligence 與個人工具都在這裡。登入後繼續使用；第一次來，可以先建立帳號。",
    signIn: "登入",
    signUp: "建立帳號",
    products: "產品",
    work: "Work",
    workText: "文件、專案與工作區。",
    intelligence: "Intelligence",
    intelligenceText: "你的 AI 對話與工具。",
    watch: "Watch",
    watchText: "查看已同步的 ActivityWatch 使用記錄。",
    cash: "Cash",
    cashText: "個人現金流、預算與預測。",
    questions: "問題與解答",
    questionsText: "查看 AERTEX 的官方事實、產品邊界與常見問題。",
    account: "Account",
    accountText: "一個帳號連接所有 AERTEX 服務。"
  },
  "en-us": {
    title: "AERTEX — Work, Cash, Watch, Intelligence and personal tools",
    description: "AERTEX brings Work, Cash, Watch, Intelligence, and personal tools together under one account. Sign in to continue to your workspace, cash-flow tools, AI conversations, synced computer activity, and more.",
    eyebrow: "AERTEX",
    heading: "One account for your AERTEX.",
    lead: "Work, Cash, Watch, Intelligence, and personal tools live here. Sign in to continue, or create an account if you are new.",
    signIn: "Sign in",
    signUp: "Create account",
    products: "Products",
    work: "Work",
    workText: "Documents, projects, and workspaces.",
    intelligence: "Intelligence",
    intelligenceText: "Your AI conversations and tools.",
    watch: "Watch",
    watchText: "View synced ActivityWatch records from your computer.",
    cash: "Cash",
    cashText: "Personal cash flow, budgets, and forecasts.",
    questions: "Questions",
    questionsText: "Official AERTEX facts, product boundaries, and common questions.",
    account: "Account",
    accountText: "One account across AERTEX services."
  }
};

for (const locale of ["en-gb", "en-au", "ja-jp", "ko-kr", "fr-fr", "es-es", "el-gr", "ar-sa"]) {
  COPY[locale] = COPY["en-us"];
}

// 公共首页生成器：根据 locale 输出无需登录即可访问的产品介绍/入口；这里不能读取或内嵌私人账户数据。\nexport function publicHomeMarkup(locale, request) {
  const code = normalizeSupportedLocale(locale) || "en-us";
  const text = COPY[code] || COPY["en-us"];
  const url = new URL(request.url);
  const localizedPath = url.pathname === "/" ? "/" : "/" + code;
  const canonical = "https://qsseda.com" + localizedPath;
  const prefix = "/" + code;
  const alternates = SUPPORTED_LOCALES.map(item =>
    '<link rel="alternate" hreflang="' + item + '" href="https://qsseda.com/' + item + '">'
  ).join("");
  const rtl = localeDirection(code);

  return `<!doctype html>
<html lang="${code}" dir="${rtl}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<title>${escapeHtml(text.title)}</title>
<meta name="description" content="${escapeHtml(text.description)}">
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1">
<link rel="canonical" href="${canonical}">
${alternates}
<link rel="alternate" hreflang="x-default" href="https://qsseda.com/">
${FAVICON_LINKS}
<style>
:root{color-scheme:light dark;--bg:#f5f5f7;--panel:rgba(255,255,255,.82);--solid:#fff;--text:#111114;--muted:#6e6e73;--line:rgba(0,0,0,.09);--accent:#007aff;--shadow:0 24px 80px rgba(0,0,0,.08)}
@media(prefers-color-scheme:dark){:root{--bg:#09090b;--panel:rgba(25,25,28,.86);--solid:#1c1c1e;--text:#f5f5f7;--muted:#98989d;--line:rgba(255,255,255,.1);--accent:#0a84ff;--shadow:0 26px 90px rgba(0,0,0,.34)}}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Segoe UI",sans-serif}
body{background-image:radial-gradient(circle at 8% -8%,rgba(10,132,255,.13),transparent 34%),radial-gradient(circle at 92% 0%,rgba(175,82,222,.08),transparent 30%)}
a{color:inherit}.topbar{height:62px;display:flex;align-items:center;gap:12px;max-width:1120px;margin:0 auto;padding:0 22px}.brand{font-weight:800;letter-spacing:-.025em;text-decoration:none}.spacer{flex:1}.toplink{font-size:14px;text-decoration:none;color:var(--muted)}.toplink:hover{color:var(--text)}
main{max-width:1120px;margin:0 auto;padding:64px 22px 88px}.eyebrow{margin:0 0 12px;color:var(--accent);font-size:12px;font-weight:780;letter-spacing:.12em;text-transform:uppercase}.hero h1{max-width:880px;margin:0;font-size:clamp(44px,8vw,78px);line-height:.96;letter-spacing:-.06em}.lead{max-width:760px;margin:22px 0 0;color:var(--muted);font-size:19px;line-height:1.62}
.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:28px}.button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 17px;border-radius:13px;text-decoration:none;font-weight:700;border:1px solid var(--line);background:var(--panel)}.button.primary{background:var(--text);color:var(--bg);border-color:transparent}
.products{margin-top:72px}.products h2{margin:0 0 16px;font-size:14px;color:var(--muted);font-weight:680}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px}.card{padding:20px;border:1px solid var(--line);border-radius:20px;background:var(--panel);box-shadow:var(--shadow)}.card strong{display:block;font-size:18px;letter-spacing:-.025em}.card p{margin:8px 0 0;color:var(--muted);font-size:14px;line-height:1.55}
footer{max-width:1120px;margin:0 auto;padding:0 22px 28px;color:var(--muted);font-size:12px}
@media(max-width:760px){.topbar{padding:0 16px}main{padding:44px 16px 64px}.hero h1{font-size:48px}.lead{font-size:17px}.grid{grid-template-columns:1fr}.products{margin-top:52px}}
</style>
</head>
<body>
<header class="topbar"><a class="brand" href="${prefix}">AERTEX</a><div class="spacer"></div><a class="toplink" href="${prefix}/q">${escapeHtml(text.questions)}</a><a class="toplink" href="${prefix}/login">${escapeHtml(text.signIn)}</a></header>
<main>
<section class="hero">
<p class="eyebrow">${escapeHtml(text.eyebrow)}</p>
<h1>${escapeHtml(text.heading)}</h1>
<p class="lead">${escapeHtml(text.lead)}</p>
<div class="actions"><a class="button primary" href="${prefix}/login">${escapeHtml(text.signIn)}</a><a class="button" href="${prefix}/sign-up">${escapeHtml(text.signUp)}</a></div>
</section>
<section class="products">
<h2>${escapeHtml(text.products)}</h2>
<div class="grid">
<div class="card"><strong>${escapeHtml(text.work)}</strong><p>${escapeHtml(text.workText)}</p></div>
<div class="card"><strong>${escapeHtml(text.intelligence)}</strong><p>${escapeHtml(text.intelligenceText)}</p></div>
<div class="card"><strong>${escapeHtml(text.watch)}</strong><p>${escapeHtml(text.watchText)}</p></div>
<div class="card"><strong>${escapeHtml(text.cash)}</strong><p>${escapeHtml(text.cashText)}</p></div>
<a class="card" href="${prefix}/q" style="text-decoration:none"><strong>${escapeHtml(text.questions)}</strong><p>${escapeHtml(text.questionsText)}</p></a>
<div class="card"><strong>${escapeHtml(text.account)}</strong><p>${escapeHtml(text.accountText)}</p></div>
</div>
</section>
</main>
<footer>© AERTEX</footer>
</body>
</html>`;
}

// 公共页文本转义：即使内容来自配置/请求参数，也按纯文本输出，避免公开首页成为 HTML 注入入口。\nfunction escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[character]));
}
