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
  const syncScriptUrl = "https://aw.qsseda.com/aw-sync.mjs";

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
    step2Eyebrow: "第 2 步 · 电脑",
    step2Title: "确认本机已经有使用记录",
    step2Body: "在电脑浏览器打开下面的本机地址。能看到 ActivityWatch 页面，并且 Activity 页面里已经有应用和窗口记录，再继续下一步。",
    step2Tip: "如果打不开，先确认 ActivityWatch 是否正在运行。AERTEX Watch 通过本机接口读取记录，不会直接修改 ActivityWatch 的数据库文件。",
    step3Eyebrow: "第 3 步 · 手机或电脑",
    step3Title: "生成设备令牌",
    step3Body: "回到 AERTEX Watch 首页，在“连接电脑”里点击“生成设备令牌”。令牌只显示一次，把它复制到需要同步的那台电脑。",
    tokenButton: "去生成设备令牌",
    tokenTip: "设备令牌只应该保存在你自己的电脑上，不要放进截图、聊天记录或公开仓库。",
    step4Eyebrow: "第 4 步 · Windows",
    step4Title: "启动 AERTEX Watch Sync",
    step4Body: "当前同步工具是预览版，需要 Node.js 18 或更新版本。建议使用 PowerShell 7。",
    nodeCheck: "先检查 Node.js：",
    nodeDownload: "没有 Node.js？打开 Node.js 下载页 ↗",
    scriptDownload: "下载同步脚本：",
    scriptDownloadChina: "中国大陆下载：",
    scriptDownloadChinaAction: "从 iCloud 下载 AERTEX Watch Sync",
    scriptDownloadChinaHint: "下载后将同步脚本保存为 AERTEX-Watch-Sync.mjs，建议放在“下载”文件夹。",
    tokenRun: "把刚才生成的设备令牌放进环境变量，然后启动同步：",
    syncNote: "第一次默认同步最近 30 天的数据。之后每 10 分钟检查一次新增记录，只上传新增部分。",
    previewTitle: "当前预览版需要保持 PowerShell 窗口运行",
    previewBody: "关掉窗口后同步会停止，但 ActivityWatch 仍会继续在电脑本机记录。下次重新运行同步命令后，会从上次进度继续。",
    step5Eyebrow: "第 5 步 · 手机",
    step5Title: "回到 Watch 检查是否同步成功",
    step5Body: "成功后首页会从“等待电脑连接”变成“同步正常”，并显示最近同步时间、ActivityWatch 数据源和今天的应用使用记录。",
    openWatch: "打开 AERTEX Watch",
    faq: "常见问题",
    faqTitle: "遇到问题时先看这里",
    q1: "手机一直显示“等待电脑连接”",
    a1: "先确认电脑上的同步命令仍在运行，再检查 PowerShell 里有没有网络错误、认证错误，或无法连接 127.0.0.1:5600 的提示。",
    q2: "ActivityWatch 有记录，但 Watch 页面没有",
    a2: "先在电脑打开 127.0.0.1:5600 确认数据存在，再重新运行同步命令。首次同步的数据较多时需要一些时间。",
    q3: "关机后还会同步吗？",
    a3: "不会。电脑关机或 ActivityWatch 没有运行时不会产生新的电脑使用记录。重新开机并启动 ActivityWatch 和同步工具后会继续。",
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
    step2Eyebrow: "Step 2 · Computer",
    step2Title: "Confirm local activity is being recorded",
    step2Body: "Open the local address below in your computer browser. Continue when ActivityWatch shows app and window activity.",
    step2Tip: "If it does not open, check that ActivityWatch is running. AERTEX Watch reads through the local API and does not directly modify the ActivityWatch database.",
    step3Eyebrow: "Step 3 · Phone or computer",
    step3Title: "Create a device token",
    step3Body: "Return to AERTEX Watch and create a device token in Connect computer. It is shown once, so copy it to the computer you want to sync.",
    tokenButton: "Create a device token",
    tokenTip: "Keep the device token on your own computer. Do not put it in screenshots, messages, or public repositories.",
    step4Eyebrow: "Step 4 · Windows",
    step4Title: "Start AERTEX Watch Sync",
    step4Body: "The current sync tool is a preview and requires Node.js 18 or newer. PowerShell 7 is recommended.",
    nodeCheck: "Check Node.js first:",
    nodeDownload: "Need Node.js? Open the download page ↗",
    scriptDownload: "Download the sync script:",
    scriptDownloadChina: "Mainland China download:",
    scriptDownloadChinaAction: "Download AERTEX Watch Sync from iCloud",
    scriptDownloadChinaHint: "After downloading, save the script as AERTEX-Watch-Sync.mjs, preferably in your Downloads folder.",
    tokenRun: "Set the device token and start syncing:",
    syncNote: "The first run syncs the most recent 30 days by default. After that, it checks for new records every 10 minutes.",
    previewTitle: "Keep the PowerShell window open in the current preview",
    previewBody: "Closing it stops syncing, but ActivityWatch keeps recording locally. Starting the sync command again resumes from the saved position.",
    step5Eyebrow: "Step 5 · Phone",
    step5Title: "Check the result in Watch",
    step5Body: "When syncing succeeds, the home page changes from Waiting for a computer to Sync active and shows the latest sync time, ActivityWatch data sources, and today's app usage.",
    openWatch: "Open AERTEX Watch",
    faq: "FAQ",
    faqTitle: "If something is not working",
    q1: "My phone still says Waiting for a computer",
    a1: "Confirm that the sync command is still running, then check PowerShell for network, authentication, or 127.0.0.1:5600 connection errors.",
    q2: "ActivityWatch has data, but Watch does not",
    a2: "Open 127.0.0.1:5600 on the computer to confirm the data exists, then run the sync command again. The first sync can take some time.",
    q3: "Does it sync while the computer is off?",
    a3: "No. The computer must be on and ActivityWatch must be running to create new activity records.",
    q4: "Does it upload screenshots?",
    a4: "It does not actively capture or upload screenshots. The current sync sends ActivityWatch event data such as app names, window activity, and durations.",
    q5: "Can I connect more than one of my computers?",
    a5: "Yes. Create a separate device token for each computer and run the sync tool on each one."
  };

  const activityWatchDownloadUrl = mainlandChina ? activityWatchChinaUrl : activityWatchOfficialUrl;
  const activityWatchDownloadLabel = mainlandChina ? copy.downloadAwChina : copy.downloadAw;
  const syncDownloadMarkup = `<p>${escapeHtml(copy.scriptDownload)}</p><div class="code"><code>Invoke-WebRequest "${syncScriptUrl}" -OutFile "$env:USERPROFILE\\Downloads\\AERTEX-Watch-Sync.mjs"</code></div>`;

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
${step(1,copy.step1Eyebrow,copy.step1Title,copy.step1Body,`<a class="action" href="${activityWatchDownloadUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(activityWatchDownloadLabel)}</a>`)}
${step(2,copy.step2Eyebrow,copy.step2Title,copy.step2Body,`<div class="code"><code>http://127.0.0.1:5600</code></div><div class="tip"><p>${escapeHtml(copy.step2Tip)}</p></div>`)}
${step(3,copy.step3Eyebrow,copy.step3Title,copy.step3Body,`<a class="action" href="${watchHome}">${escapeHtml(copy.tokenButton)}</a><div class="tip"><p>${escapeHtml(copy.tokenTip)}</p></div>`)}
${step(4,copy.step4Eyebrow,copy.step4Title,copy.step4Body,`<p>${escapeHtml(copy.nodeCheck)}</p><div class="code"><code>node --version</code></div><a class="action" href="https://nodejs.org/en/download" target="_blank" rel="noopener noreferrer">${escapeHtml(copy.nodeDownload)}</a>${syncDownloadMarkup}<p>${escapeHtml(copy.tokenRun)}</p><div class="code"><code>$env:AERTEX_WATCH_TOKEN = "&lt;YOUR_DEVICE_TOKEN&gt;"\nnode "$env:USERPROFILE\\Downloads\\AERTEX-Watch-Sync.mjs" --watch</code></div><p>${escapeHtml(copy.syncNote)}</p><div class="tip"><strong>${escapeHtml(copy.previewTitle)}</strong><p>${escapeHtml(copy.previewBody)}</p></div>`)}
${step(5,copy.step5Eyebrow,copy.step5Title,copy.step5Body,`<a class="action primary" href="${watchHome}">${escapeHtml(copy.openWatch)}</a>`)}
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
