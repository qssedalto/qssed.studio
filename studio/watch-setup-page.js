/**
 * 【初学者导读】
 * 文件：studio/watch-setup-page.js
 * AERTEX Watch 主站交接/教程模块：负责 Watch 入口、设置说明或子域跳转。
 * 阅读顺序：先确认这个模块从哪里被导入，再看入口函数接收什么状态/Request；随后追踪 API、DOM、缓存或重定向副作用。
 * 初学者重点：Work/Watch 等独立产品虽然共享登录和品牌，但域名、路由和部署边界是分开的，不能把一个产品的假设直接复制到另一个。
 * 修改注意：保持已有 URL、查询参数、DOM 标识和登录交接兼容；如果产品边界变化，必须同步修改对应 CI 检查。
 * 调试方法：先确认 host/path 命中了哪个入口，再检查会话和内部状态，最后看具体 UI 或 API 结果。
 */
import { FAVICON_LINKS } from "./favicon.js";
import { awOriginForRequest, mainOriginForRequest } from "./domain-family.js";
import { localeDirection, localeFromPath, normalizeSupportedLocale } from "./locale.js";
import { injectPublicSeo } from "./public-indexing.js";

export function isWatchSetupPath(pathname) {
  const locale = localeFromPath(pathname);
  if (!locale) return false;
  const parts = String(pathname || "").split("/").filter(Boolean);
  return parts.length === 3 && parts[1] === "aw" && parts[2] === "setup";
}

export function watchSetupPage(request) {
  const url = new URL(request.url);
  const locale = normalizeSupportedLocale(localeFromPath(url.pathname)) || "en-us";
  const zh = locale.startsWith("zh");
  const watchOrigin = awOriginForRequest(request);
  const mainOrigin = mainOriginForRequest(request);
  const watchHome = watchOrigin + "/" + locale;
  const country = String(request.cf?.country || request.headers.get("CF-IPCountry") || "").toUpperCase();
  const mainlandChina = country === "CN" || locale === "zh-cn";
  const activityWatchOfficialUrl = "https://activitywatch.net/downloads/";
  const activityWatchChinaUrl = "https://www.icloud.com.cn/iclouddrive/0f1o93e_H_OyQJtlbDfArEeUQ";
  const windowsSyncUrl = "https://aw.qsseda.com/AERTEX-Watch-Sync-Setup.exe";

  const copy = zh ? {
    title: "把电脑的使用记录同步到手机",
    intro: "电脑继续使用 ActivityWatch 记录应用和窗口活动，AERTEX Watch 负责把这些记录同步到你的账户。设置完成后，手机、平板和其他电脑都可以查看。",
    noteTitle: "这里同步的是 ActivityWatch 记录",
    noteBody: "AERTEX Watch 不读取 Windows 自带的“屏幕使用时间”。电脑上需要先安装并运行 ActivityWatch。",
    back: "返回 AERTEX Watch",
    step1Eyebrow: "第 1 步 · 电脑",
    step1Title: "安装并启动 ActivityWatch",
    step1Body: "如果电脑还没有 ActivityWatch，先下载安装并启动。安装完成后，确认任务栏通知区域里 ActivityWatch 正在运行。",
    downloadAw: "打开 ActivityWatch 下载页 ↗",
    downloadAwChina: "从 iCloud 下载 ActivityWatch",
    step1Tip: "AERTEX Watch Sync 会自动寻找本机正在运行的 ActivityWatch，不会直接读取或修改 ActivityWatch 数据库。",
    step2Eyebrow: "第 2 步 · 手机或电脑",
    step2Title: "生成设备令牌",
    step2Body: "回到 AERTEX Watch 首页，在“连接电脑”里点击“生成设备令牌”。令牌只显示一次，把它复制到需要同步的那台电脑。",
    tokenButton: "去生成设备令牌",
    tokenTip: "设备令牌只应该保存在你自己的电脑上，不要放进截图、聊天记录或公开仓库。",
    step3Eyebrow: "第 3 步 · Windows",
    step3Title: "安装 AERTEX Watch Sync",
    step3Body: "下载并运行 AERTEX Watch Sync 安装程序。安装时会先停止旧版客户端、清空旧安装目录并删除旧设备令牌；安装完成后请重新生成设备令牌并连接。",
    downloadWindows: "下载 Windows 版",
    syncNote: "安装完成后客户端会自动启动。重新生成并粘贴设备令牌后，第一次默认同步最近 30 天的数据，之后每 10 分钟自动检查新增记录。",
    step4Eyebrow: "第 4 步 · 手机",
    step4Title: "回到 Watch 检查同步结果",
    step4Body: "成功后首页会从“等待电脑连接”变成“同步正常”，并显示最近同步时间、ActivityWatch 数据源和今天的应用使用记录。",
    openWatch: "打开 AERTEX Watch",
    faq: "常见问题",
    faqTitle: "遇到问题时先看这里",
    q1: "手机一直显示“等待电脑连接”",
    a1: "打开 Windows 通知区域中的 AERTEX Watch Sync，检查同步状态；如果令牌失效，重新生成并粘贴设备令牌。",
    q2: "ActivityWatch 有记录，但 Watch 页面没有",
    a2: "确认 ActivityWatch 正在运行，然后在 AERTEX Watch Sync 托盘菜单中选择“立即同步”或“重新检测”。首次同步的数据较多时需要一些时间。",
    q3: "关机后还会同步吗？",
    a3: "电脑关闭时不会产生新的使用记录。重新登录 Windows 后，AERTEX Watch Sync 会自动启动，并从上次进度继续同步。",
    q4: "会上传屏幕截图吗？",
    a4: "不会主动抓取或上传屏幕截图。当前同步的是 ActivityWatch 的事件数据，例如应用名、窗口活动和持续时间。",
    q5: "可以连接多台自己的电脑吗？",
    a5: "可以。每台电脑分别生成设备令牌并运行同步工具，Watch 会显示这些电脑同步过来的 ActivityWatch 数据源。"
  } : {
    title: "Sync your computer activity to your other devices",
    intro: "ActivityWatch keeps recording apps and windows on your computer. AERTEX Watch syncs those records to your account so you can view them on your phone, tablet, or another computer.",
    noteTitle: "This uses ActivityWatch data",
    noteBody: "AERTEX Watch does not read Windows Screen Time. ActivityWatch must be installed and running on the computer.",
    back: "Back to AERTEX Watch",
    step1Eyebrow: "Step 1 · Computer",
    step1Title: "Install and start ActivityWatch",
    step1Body: "Download ActivityWatch if it is not installed yet, then start it and confirm that it is running in the notification area.",
    downloadAw: "Open ActivityWatch downloads ↗",
    downloadAwChina: "Download ActivityWatch from iCloud",
    step1Tip: "AERTEX Watch Sync automatically finds ActivityWatch running on this computer and never reads or modifies its database directly.",
    step2Eyebrow: "Step 2 · Phone or computer",
    step2Title: "Create a device token",
    step2Body: "Return to AERTEX Watch and create a device token in Connect computer. It is shown once, so copy it to the computer you want to sync.",
    tokenButton: "Create a device token",
    tokenTip: "Keep the device token on your own computer. Do not put it in screenshots, messages, or public repositories.",
    step3Eyebrow: "Step 3 · Windows",
    step3Title: "Install AERTEX Watch Sync",
    step3Body: "Download and run the AERTEX Watch Sync installer. Setup stops the old client, clears the previous install directory, and removes the old device token. Create a new device token after installation and connect again.",
    downloadWindows: "Download for Windows",
    syncNote: "The client starts automatically after installation. After you create and paste a new device token, the first sync covers the most recent 30 days and then checks every 10 minutes.",
    step4Eyebrow: "Step 4 · Phone",
    step4Title: "Check the result in Watch",
    step4Body: "When syncing succeeds, the home page changes from Waiting for a computer to Sync active and shows the latest sync time, ActivityWatch data sources, and today's app usage.",
    openWatch: "Open AERTEX Watch",
    faq: "FAQ",
    faqTitle: "If something is not working",
    q1: "My phone still says Waiting for a computer",
    a1: "Open AERTEX Watch Sync from the Windows notification area and check its status. If the token expired, create and paste a new device token.",
    q2: "ActivityWatch has data, but Watch does not",
    a2: "Confirm that ActivityWatch is running, then choose Sync now or Detect again from AERTEX Watch Sync. The first sync can take some time.",
    q3: "Does it sync while the computer is off?",
    a3: "The computer does not create new records while it is off. After you sign in to Windows again, AERTEX Watch Sync starts automatically and resumes from its saved progress.",
    q4: "Does it upload screenshots?",
    a4: "It does not actively capture or upload screenshots. The current sync sends ActivityWatch event data such as app names, window activity, and durations.",
    q5: "Can I connect more than one of my computers?",
    a5: "Yes. Create a separate device token for each computer and run the sync tool on each one."
  };

  const activityWatchDownloadUrl = mainlandChina ? activityWatchChinaUrl : activityWatchOfficialUrl;
  const activityWatchDownloadLabel = mainlandChina ? copy.downloadAwChina : copy.downloadAw;
  const page = `<!doctype html>
<html lang="${locale}" dir="${localeDirection(locale)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<title>${escapeHtml(copy.title)} · AERTEX Watch</title>
${FAVICON_LINKS}
<style>
:root{color-scheme:light dark;--bg:#f5f5f7;--panel:rgba(255,255,255,.82);--text:#111114;--muted:#6e6e73;--line:rgba(0,0,0,.09);--accent:#007aff;--shadow:0 18px 60px rgba(0,0,0,.08)}
@media(prefers-color-scheme:dark){:root{--bg:#09090b;--panel:rgba(25,25,28,.86);--text:#f5f5f7;--muted:#98989d;--line:rgba(255,255,255,.1);--accent:#0a84ff;--shadow:0 24px 80px rgba(0,0,0,.34)}}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif}body{background-image:radial-gradient(circle at 8% -5%,rgba(10,132,255,.12),transparent 32%)}a{color:inherit}.topbar{height:58px;display:flex;align-items:center;gap:12px;padding:0 20px;position:sticky;top:0;z-index:10;background:color-mix(in srgb,var(--bg) 82%,transparent);backdrop-filter:blur(24px);border-bottom:1px solid var(--line)}.brand{font-weight:760;text-decoration:none}.product{color:var(--muted)}.spacer{flex:1}.back{font-size:14px;color:var(--muted);text-decoration:none}.back:hover{color:var(--text)}
main{max-width:960px;margin:0 auto;padding:52px 22px 90px}.eyebrow{margin:0 0 9px;color:var(--accent);font-size:12px;font-weight:760;letter-spacing:.09em;text-transform:uppercase}.hero h1{max-width:820px;margin:0;font-size:clamp(38px,7vw,66px);line-height:1;letter-spacing:-.055em}.lead{max-width:780px;margin:20px 0 0;color:var(--muted);font-size:19px;line-height:1.6}.note{margin-top:24px;padding:18px 20px;border:1px solid var(--line);border-radius:18px;background:var(--panel);box-shadow:var(--shadow)}.note strong{display:block}.note p{margin:7px 0 0;color:var(--muted);line-height:1.6}
.steps{display:grid;gap:14px;margin-top:30px}.step{display:grid;grid-template-columns:48px 1fr;gap:18px;padding:24px;border:1px solid var(--line);border-radius:24px;background:var(--panel);box-shadow:var(--shadow)}.num{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:color-mix(in srgb,var(--accent) 12%,transparent);color:var(--accent);font-weight:800}.step h2,.faq h2{margin:0;font-size:25px;letter-spacing:-.035em}.step p{color:var(--muted);line-height:1.65}.action{display:inline-flex;align-items:center;justify-content:center;margin-top:4px;padding:10px 14px;border-radius:12px;border:1px solid var(--line);text-decoration:none;font-weight:650}.action.primary{border-color:transparent;background:var(--accent);color:white}.code{margin:10px 0;padding:14px;border-radius:14px;background:color-mix(in srgb,var(--text) 6%,transparent);border:1px solid var(--line);overflow:auto}.code code{white-space:pre-wrap;word-break:break-word;font-family:"SFMono-Regular",Consolas,monospace;font-size:13px}.tip{margin-top:14px;padding:14px 16px;border-radius:14px;background:color-mix(in srgb,var(--accent) 7%,transparent);border:1px solid color-mix(in srgb,var(--accent) 20%,var(--line))}.tip strong{display:block}.tip p{margin:5px 0 0}
.faq{margin-top:42px}.faq h2{margin-bottom:14px}.faq details{border-top:1px solid var(--line);padding:16px 2px}.faq summary{cursor:pointer;font-weight:680}.faq details p{color:var(--muted);line-height:1.65;margin:10px 0 2px}
@media(max-width:640px){main{padding:34px 14px 70px}.topbar{padding:0 14px}.hero h1{font-size:42px}.step{grid-template-columns:1fr;padding:19px}.num{width:36px;height:36px}.lead{font-size:17px}}
</style>
</head>
<body>
<header class="topbar"><a class="brand" href="${mainOrigin}">AERTEX</a><div class="product">Watch</div><div class="spacer"></div><a class="back" href="${watchHome}">${escapeHtml(copy.back)}</a></header>
<main>
<section class="hero">
<p class="eyebrow">AERTEX Watch · Setup</p>
<h1>${escapeHtml(copy.title)}</h1>
<p class="lead">${escapeHtml(copy.intro)}</p>
<div class="note"><strong>${escapeHtml(copy.noteTitle)}</strong><p>${escapeHtml(copy.noteBody)}</p></div>
</section>
<section class="steps">
${step(1,copy.step1Eyebrow,copy.step1Title,copy.step1Body,`<a class="action" href="${activityWatchDownloadUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(activityWatchDownloadLabel)}</a><div class="tip"><p>${escapeHtml(copy.step1Tip)}</p></div>`)}
${step(2,copy.step2Eyebrow,copy.step2Title,copy.step2Body,`<a class="action" href="${watchHome}">${escapeHtml(copy.tokenButton)}</a><div class="tip"><p>${escapeHtml(copy.tokenTip)}</p></div>`)}
${step(3,copy.step3Eyebrow,copy.step3Title,copy.step3Body,`<a class="action primary" href="${windowsSyncUrl}" download="AERTEX-Watch-Sync-Setup.exe">${escapeHtml(copy.downloadWindows)}</a><div class="tip"><p>${escapeHtml(copy.syncNote)}</p></div>`)}
${step(4,copy.step4Eyebrow,copy.step4Title,copy.step4Body,`<a class="action primary" href="${watchHome}">${escapeHtml(copy.openWatch)}</a>`)}
</section>
<section class="faq"><p class="eyebrow">${escapeHtml(copy.faq)}</p><h2>${escapeHtml(copy.faqTitle)}</h2>
${faq(copy.q1,copy.a1)}${faq(copy.q2,copy.a2)}${faq(copy.q3,copy.a3)}${faq(copy.q4,copy.a4)}${faq(copy.q5,copy.a5)}
</section>
</main>
</body>
</html>`;

  const canonicalHost = url.hostname.toLowerCase() === "qsseda.com";
  const indexedPage = injectPublicSeo(page, locale, "/aw/setup", copy.intro);

  return new Response(indexedPage, {
    status: 200,
    headers: {
      "content-type": "text/html;charset=UTF-8",
      "cache-control": "private, no-store",
      "content-language": locale,
      "referrer-policy": "same-origin",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
      "x-robots-tag": canonicalHost
        ? "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        : "noindex, nofollow, noarchive, nosnippet",
      "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; frame-ancestors 'none'; form-action 'none'; connect-src 'none'"
    }
  });
}

function step(number, eyebrow, title, body, extra) {
  return `<article class="step"><div class="num">${number}</div><div><p class="eyebrow">${escapeHtml(eyebrow)}</p><h2>${escapeHtml(title)}</h2><p>${escapeHtml(body)}</p>${extra}</div></article>`;
}

function faq(question, answer) {
  return `<details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[character]));
}
