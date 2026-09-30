import { FAVICON_LINKS } from "./favicon.js";
import { accountMenuClientScript, accountMenuMarkup, accountMenuStyles } from "./account-menu.js";
import { intelligenceThemeAttr, intelligenceThemeBootScript } from "./intelligence-theme.js";
import { richMessageClientScript, richMessageStyles } from "./gpt-rich-renderer.js";
import { intelligenceWatchClientScript, intelligenceWatchMarkup, intelligenceWatchPortalMarkup, intelligenceWatchStyles } from "./gpt-watch-ui.js";

export function renderGptApp(locale, bootstrap = {}) {
  const zh = locale === "zh-cn";
  const themeAttr = intelligenceThemeAttr(bootstrap?.theme);
  const themeBoot = intelligenceThemeBootScript();
  const bootstrapJson = JSON.stringify({
    config: bootstrap?.config || null,
    conversations: Array.isArray(bootstrap?.conversations) ? bootstrap.conversations : [],
    current: bootstrap?.current || null
  }).replace(/</g, "\\u003c");
  const t = zh ? {
    title:"AERTEX Intelligence", subtitle:"Cloud Intelligence", online:"Intelligence 在线", offline:"Intelligence 不可用",
    offlineTitle:"AERTEX Intelligence 暂不可用", offlineText:"当前账号尚未获得 AI 使用权限，或管理员尚未完成 API 配置。",
    checking:"正在加载 Intelligence…", retry:"重新检测", signedOut:"当前账号尚未获得 Intelligence 权限",
    connectHint:"请联系管理员为此账号分配 API Provider、模型和使用额度。",
    connect:"连接 ChatGPT / Codex", connecting:"正在连接…", openLogin:"打开 OpenAI 登录页",
    codeLabel:"设备代码", codeHint:"在 OpenAI 页面输入设备代码完成授权。完成后这里会自动识别登录状态。",
    newChat:"新对话", conversations:"对话", toggleSidebar:"切换侧栏", closeSidebar:"关闭侧栏", rename:"重命名", delete:"删除", share:"分享", shareCopied:"分享链接已复制", shareFailed:"无法创建分享链接", shareIdentityTitle:"共享这个对话", shareIdentityText:"是否在公开共享页面显示你的姓名？你可以匿名共享，也可以明确选择显示姓名。", shareAnonymous:"匿名共享", shareWithName:"显示姓名并共享", shareCancel:"取消", confirmDelete:"删除这个对话？", untitled:"未命名对话", send:"发送", placeholder:"给 AERTEX Intelligence 发消息…", loadingModels:"正在读取模型…",
    noModels:"没有读取到可用模型", regionBlocked:"当前网络区域不可用", noAvailableRegion:"当前网络区域没有可用的已授权模型", rateLimited:"当前 Provider 返回速率限制，请稍后重试", rateRetry:"建议等待", reasoning:"推理", thinking:"Intelligence 正在思考…",
    empty:"开始一个新的对话", emptyHint:"选择模型后直接开始聊天", copyCode:"复制", copiedCode:"已复制", codeBlock:"代码",
    error:"发生错误",
    bridgeAuth:"本机 Bridge 的安全凭据配置不一致"
  } : {
    title:"AERTEX Intelligence", subtitle:"Cloud Intelligence", online:"Intelligence online", offline:"Intelligence unavailable",
    offlineTitle:"AERTEX Intelligence is unavailable", offlineText:"AI access has not been enabled for this account, or the administrator has not completed API configuration.",
    checking:"Loading Intelligence…", retry:"Check again", signedOut:"Intelligence access is not enabled for this account",
    connectHint:"Ask an administrator to assign an API provider, models, and usage quota to this account.",
    connect:"Connect ChatGPT / Codex", connecting:"Connecting…", openLogin:"Open OpenAI sign-in",
    codeLabel:"Device code", codeHint:"Enter the device code on the OpenAI page. This page will detect completion automatically.",
    newChat:"New chat", conversations:"Chats", toggleSidebar:"Toggle sidebar", closeSidebar:"Close sidebar", rename:"Rename", delete:"Delete", share:"Share", shareCopied:"Share link copied", shareFailed:"Unable to create share link", shareIdentityTitle:"Share this conversation", shareIdentityText:"Choose whether your name appears on the public share page. You can share anonymously or explicitly include your name.", shareAnonymous:"Share anonymously", shareWithName:"Share with my name", shareCancel:"Cancel", confirmDelete:"Delete this conversation?", untitled:"Untitled chat", send:"Send", placeholder:"Message AERTEX Intelligence…", loadingModels:"Loading models…",
    noModels:"No available models were returned", regionBlocked:"Unavailable on current network", noAvailableRegion:"No authorized model is available on the current network", rateLimited:"The provider is rate-limiting requests right now. Try again shortly.", rateRetry:"Retry after", reasoning:"Reasoning", thinking:"Intelligence is thinking…",
    empty:"Start a new conversation", emptyHint:"Choose a model and start chatting", copyCode:"Copy", copiedCode:"Copied", codeBlock:"Code",
    error:"Error",
    bridgeAuth:"The local Bridge security credentials do not match"
  };

  return `<!doctype html>
<html lang="${zh ? "zh-CN" : "en"}"${themeAttr}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<title>AERTEX Intelligence</title>
${FAVICON_LINKS}
${themeBoot}
<style>
:root{color-scheme:light;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;--bg:#f7f7f5;--panel:#fff;--panel2:#f0f0ee;--text:#171717;--muted:#777;--line:rgba(0,0,0,.09);--accent:#111;--accentText:#fff;--danger:#b42318;--success:#18864b}
@media(prefers-color-scheme:dark){:root:not([data-theme]){color-scheme:dark;--bg:#101010;--panel:#181818;--panel2:#202020;--text:#f4f4f4;--muted:#9b9b9b;--line:rgba(255,255,255,.09);--accent:#f4f4f4;--accentText:#111;--danger:#ff766d;--success:#52c986}}
:root[data-theme="dark"]{color-scheme:dark;--bg:#101010;--panel:#181818;--panel2:#202020;--text:#f4f4f4;--muted:#9b9b9b;--line:rgba(255,255,255,.09);--accent:#f4f4f4;--accentText:#111;--danger:#ff766d;--success:#52c986}
:root[data-theme="light"]{color-scheme:light;--bg:#f7f7f5;--panel:#fff;--panel2:#f0f0ee;--text:#171717;--muted:#777;--line:rgba(0,0,0,.09);--accent:#111;--accentText:#fff;--danger:#b42318;--success:#18864b}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text)}button,select,textarea{font:inherit}
.app{min-height:100vh;display:grid;grid-template-columns:270px minmax(0,1fr);transition:grid-template-columns .22s cubic-bezier(.2,.8,.2,1)}
.app.sidebar-collapsed{grid-template-columns:0 minmax(0,1fr)}
.sidebar{width:270px;min-width:270px;border-right:1px solid var(--line);padding:14px;background:var(--panel2);display:flex;flex-direction:column;gap:12px;overflow:hidden;transition:transform .22s cubic-bezier(.2,.8,.2,1),opacity .18s ease}
.app.sidebar-collapsed .sidebar{transform:translateX(-100%);opacity:0;pointer-events:none}
.sidebarHead{display:flex;align-items:center;gap:8px;min-width:0}
.brand{min-width:0;flex:1;font-weight:760;letter-spacing:-.03em;font-size:20px;padding:8px 6px}.brand small{display:block;color:var(--muted);font-size:12px;font-weight:500;letter-spacing:0;margin-top:4px}
.iconButton,.quietButton{border:1px solid var(--line);background:var(--panel);color:var(--text);cursor:pointer}
.iconButton{width:48px;height:48px;min-width:48px;min-height:48px;padding:0;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;line-height:0;border:1px solid color-mix(in srgb,var(--text) 15%,transparent);background:color-mix(in srgb,var(--panel) 96%,transparent);color:var(--text);box-shadow:0 1px 0 rgba(255,255,255,.30) inset;transition:background .12s ease,transform .1s ease,border-color .12s ease}
.iconButton:hover{background:color-mix(in srgb,var(--panel) 82%,var(--panel2));border-color:color-mix(in srgb,var(--text) 22%,transparent)}
.iconButton:active{transform:scale(.94)}
.iconButton svg{display:block;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;overflow:visible}
.sidebarToggleGlyph{width:25px!important;height:25px!important;stroke-width:2.65!important}
.composeGlyph{width:25px!important;height:25px!important;stroke-width:2.35!important}
.sidebarNewChat{flex:0 0 auto}
.quietButton{border-radius:12px;padding:10px 12px;font-size:12px}
.sidebarBackdrop{display:none}
.statusRow{display:flex;align-items:center;gap:9px;font-size:13px}.dot{width:9px;height:9px;border-radius:50%;background:var(--muted)}.dot.online{background:var(--success);box-shadow:0 0 0 5px color-mix(in srgb,var(--success) 15%,transparent)}.dot.offline{background:var(--danger);box-shadow:0 0 0 5px color-mix(in srgb,var(--danger) 12%,transparent)}
.sideSectionTitle{padding:8px 6px 2px;color:var(--muted);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em}.chatList{min-height:0;overflow:auto;display:grid;gap:4px}.chatItem{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:4px;border-radius:10px}.chatItem.active{background:var(--panel)}.chatLink{min-width:0;padding:9px 8px;color:var(--text);text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}.chatActions{display:flex;gap:2px;padding-right:4px;opacity:.1}.chatItem:hover .chatActions,.chatItem.active .chatActions{opacity:1}.chatAction{border:0;background:transparent;color:var(--muted);cursor:pointer;padding:5px;border-radius:7px;font-size:12px}.chatAction:hover{background:var(--panel2);color:var(--text)}
.main{min-width:0;height:100vh;display:flex;flex-direction:column}.topbar{height:62px;display:flex;align-items:center;gap:10px;padding:0 14px;border-bottom:1px solid var(--line);background:color-mix(in srgb,var(--bg) 86%,transparent);-webkit-backdrop-filter:blur(18px) saturate(150%);backdrop-filter:blur(18px) saturate(150%)}.topbarToggle{flex:0 0 auto}.topbarNewChat{flex:0 0 auto}.topbarSpacer{flex:1;min-width:0}
select{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:10px;padding:8px 10px}.model{min-width:190px;max-width:340px}.account{margin-left:auto;color:var(--muted);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:360px}
.content{flex:1;min-height:0;overflow:auto}.messages{width:min(820px,calc(100% - 32px));margin:0 auto;padding:42px 0 160px}.empty{min-height:58vh;display:grid;place-items:center;text-align:center}.empty h1{font-size:30px;letter-spacing:-.04em;margin:0 0 8px}.empty p{max-width:600px;margin:0;color:var(--muted);line-height:1.7}
.msg{margin:0 0 28px}.msg.user{display:flex;justify-content:flex-end}.msg.user .bubble{max-width:78%;padding:11px 15px;background:var(--panel2);border-radius:18px;white-space:pre-wrap;line-height:1.55}.msg.assistant .bubble{white-space:normal;line-height:1.72;min-width:0}.status{color:var(--muted);font-size:13px;margin-top:8px}
.composerWrap{position:fixed;left:270px;right:0;bottom:0;padding:18px;background:linear-gradient(to top,var(--bg) 72%,transparent);transition:left .22s cubic-bezier(.2,.8,.2,1)}.app.sidebar-collapsed .composerWrap{left:0}.composer{width:min(820px,calc(100% - 32px));margin:0 auto;border:1px solid var(--line);background:var(--panel);border-radius:20px;padding:12px;box-shadow:0 12px 42px rgba(0,0,0,.08)}
textarea{display:block;width:100%;min-height:48px;max-height:180px;resize:none;border:0;outline:0;background:transparent;color:var(--text);padding:4px 6px;line-height:1.5}.composerFoot{display:flex;align-items:center;justify-content:flex-end;margin-top:8px}
.primary{border:0;background:var(--accent);color:var(--accentText);border-radius:11px;padding:8px 14px;cursor:pointer;font-weight:650;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}.primary:disabled{opacity:.45;cursor:not-allowed}
.gate{width:min(650px,calc(100% - 36px));margin:80px auto;padding:28px;border:1px solid var(--line);background:var(--panel);border-radius:22px}.gate h2{margin:0 0 8px;font-size:23px}.gate p{color:var(--muted);line-height:1.65}.gateActions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.code{font:700 28px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;margin:18px 0 8px}.hidden{display:none!important}.error{color:var(--danger)}.shareChoice{position:fixed;z-index:400;inset:0;display:grid;place-items:center;padding:20px}.shareChoice[hidden]{display:none!important}.shareChoiceBackdrop{position:absolute;inset:0;background:rgba(0,0,0,.28);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}.shareChoiceCard{position:relative;width:min(440px,calc(100vw - 32px));padding:22px;border:1px solid var(--line);border-radius:22px;background:var(--panel);box-shadow:0 28px 90px rgba(0,0,0,.22)}.shareChoiceCard h2{margin:0;font-size:21px}.shareChoiceCard p{margin:8px 0 18px;color:var(--muted);font-size:14px;line-height:1.55}.shareChoiceActions{display:grid;gap:8px}.shareChoiceAction{min-height:44px;border:1px solid var(--line);border-radius:12px;background:var(--panel2);color:var(--text);font:inherit;font-weight:650;cursor:pointer}.shareChoiceAction.primaryChoice{border-color:var(--accent);background:var(--accent);color:var(--accentText)}.shareChoiceAction.cancelChoice{background:transparent;color:var(--muted)}
@media(max-width:760px){
  .app,.app.sidebar-collapsed{display:block}
  .sidebar{position:fixed;z-index:210;inset:0 auto 0 0;width:min(84vw,320px);min-width:0;padding:max(14px,env(safe-area-inset-top)) 14px max(14px,env(safe-area-inset-bottom));border-right:1px solid var(--line);box-shadow:20px 0 60px rgba(0,0,0,.18);transform:translateX(-105%);opacity:1;pointer-events:none}
  .app.sidebar-open .sidebar{transform:translateX(0);pointer-events:auto}
  .sidebarBackdrop{display:block;position:fixed;z-index:200;inset:0;width:100%;height:100%;margin:0;padding:0;border:0;background:rgba(0,0,0,.18);opacity:0;pointer-events:none;transition:opacity .18s ease;-webkit-backdrop-filter:blur(1px);backdrop-filter:blur(1px)}
  .app.sidebar-open .sidebarBackdrop{opacity:1;pointer-events:auto}
  .composerWrap,.app.sidebar-collapsed .composerWrap{left:0;padding:12px max(12px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left))}
  .topbar{height:60px;padding:0 10px;gap:8px;position:relative;z-index:50}
  .iconButton{width:48px;height:48px;min-width:48px;min-height:48px}
  .model{min-width:0;max-width:none;flex:1}
  .account{display:none}
  .messages{padding-top:28px}
  .aertex-account-root{flex:0 0 auto}
}
@media(max-width:430px){
  .topbar{gap:6px;padding-left:8px;padding-right:8px}
  .topbar .iconButton{width:46px;height:46px;min-width:46px;min-height:46px}
  .topbar .sidebarToggleGlyph{width:24px!important;height:24px!important}
  .topbar .composeGlyph{width:24px!important;height:24px!important}
  .model{font-size:13px;padding-left:8px;padding-right:8px}
  .aertex-account-button{width:40px!important;height:40px!important;min-width:40px!important;min-height:40px!important}
}
@media(prefers-reduced-motion:reduce){.app,.sidebar,.composerWrap,.sidebarBackdrop,.iconButton{transition:none!important}}
</style>\n<style>${richMessageStyles()}</style>\n<style>${accountMenuStyles()}</style>\n<style>${intelligenceWatchStyles()}</style>
</head>
<body>
<div class="app">
<aside class="sidebar" id="gptSidebar" aria-label="${t.conversations}">
  <div class="sidebarHead">
    <div class="brand">${t.title}<small>${t.subtitle}</small></div>
    <button class="iconButton sidebarNewChat" id="newChat" type="button" aria-label="${t.newChat}" title="${t.newChat}">
      <svg class="composeGlyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M13 4.5H7.25A2.75 2.75 0 0 0 4.5 7.25v9.5a2.75 2.75 0 0 0 2.75 2.75h9.5a2.75 2.75 0 0 0 2.75-2.75V11"/><path d="M9 15l1.15-4.1 6.95-6.95a2.15 2.15 0 0 1 3.05 3.05l-6.95 6.95L9 15Z"/><path d="m16.2 4.85 3 3"/></svg>
    </button>
  </div>
  <div class="statusRow"><span class="dot" id="sideDot"></span><span id="sideStatus">${t.checking}</span></div>
  <div class="sideSectionTitle">${t.conversations}</div>
  <nav class="chatList" id="conversationList" aria-label="${t.conversations}"></nav>
</aside>
<button class="sidebarBackdrop" id="sidebarBackdrop" type="button" aria-label="${t.closeSidebar}" tabindex="-1"></button>
<main class="main">
<header class="topbar">
  <button class="iconButton topbarToggle" id="sidebarToggle" type="button" aria-label="${t.toggleSidebar}" title="${t.toggleSidebar}" aria-controls="gptSidebar" aria-expanded="true">
    <svg class="sidebarToggleGlyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5.25 8.25h13.5"/><path d="M5.25 15.75h9"/></svg>
  </button>
  <select class="model" id="modelSelect" disabled><option>${t.loadingModels}</option></select>
  ${intelligenceWatchMarkup()}
  <select id="effortSelect" aria-label="${t.reasoning}" disabled><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option><option value="xhigh">Extra High</option></select>
  <div class="topbarSpacer"></div>
  <div class="account" id="accountLabel">${t.checking}</div>
  <button class="iconButton topbarNewChat" id="topNewChat" type="button" aria-label="${t.newChat}" title="${t.newChat}">
    <svg class="composeGlyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M13 4.5H7.25A2.75 2.75 0 0 0 4.5 7.25v9.5a2.75 2.75 0 0 0 2.75 2.75h9.5a2.75 2.75 0 0 0 2.75-2.75V11"/><path d="M9 15l1.15-4.1 6.95-6.95a2.15 2.15 0 0 1 3.05 3.05l-6.95 6.95L9 15Z"/><path d="m16.2 4.85 3 3"/></svg>
  </button>
  ${accountMenuMarkup(zh ? "zh-cn" : "en")}
</header>
<section class="content" id="content">
  <div class="gate" id="gate">
    <h2 id="gateTitle">${t.checking}</h2>
    <p id="gateText">${t.offlineText}</p>
    <div class="gateActions">
      <button class="primary hidden" id="startLogin">${t.connect}</button>
      <button class="quietButton" id="retry">${t.retry}</button>
    </div>
    <div id="devicePanel" class="hidden">
      <div class="code" id="deviceCode"></div><div class="status">${t.codeLabel}</div>
      <div class="gateActions"><a class="primary" id="deviceLink" target="_blank" rel="noopener noreferrer">${t.openLogin}</a></div>
      <p>${t.codeHint}</p>
    </div>
  </div>
  <div class="messages hidden" id="messages"><div class="empty" id="emptyState"><div><h1>${t.empty}</h1><p>${t.emptyHint}</p></div></div></div>
</section>
<div class="composerWrap hidden" id="composerWrap"><div class="composer"><textarea id="composer" placeholder="${t.placeholder}" rows="1"></textarea><form class="watchComposerForm" id="watchComposerForm" autocomplete="off"><input class="watchComposerInput" id="watchComposerInput" type="text" placeholder="${t.placeholder}" enterkeyhint="send" autocapitalize="sentences" autocomplete="off" spellcheck="true" aria-label="${t.placeholder}"></form><div class="composerFoot"><button class="primary" id="sendButton" aria-label="${t.send}"><span class="sendLabel">${t.send}</span><svg class="sendGlyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 19V5"/><path d="m6.5 10.5 5.5-5.5 5.5 5.5"/></svg></button></div></div></div>
</main>
</div>
${intelligenceWatchPortalMarkup(zh)}
<div class="shareChoice" id="shareChoice" role="dialog" aria-modal="true" aria-labelledby="shareChoiceTitle" hidden><div class="shareChoiceBackdrop" id="shareChoiceBackdrop"></div><section class="shareChoiceCard"><h2 id="shareChoiceTitle">${t.shareIdentityTitle}</h2><p>${t.shareIdentityText}</p><div class="shareChoiceActions"><button class="shareChoiceAction primaryChoice" id="shareWithName" type="button">${t.shareWithName}</button><button class="shareChoiceAction" id="shareAnonymous" type="button">${t.shareAnonymous}</button><button class="shareChoiceAction cancelChoice" id="shareCancel" type="button">${t.shareCancel}</button></div></section></div>
${richMessageClientScript({ copy: t.copyCode, copied: t.copiedCode, code: t.codeBlock })}
<script>
(() => {
  const text=${JSON.stringify(t)}, boot=${bootstrapJson}, $=id=>document.getElementById(id);
  const localeBase=location.pathname.startsWith("/en")?"/en":"/zh-cn";
  const state={
    config:boot.config||null,
    conversations:Array.isArray(boot.conversations)?boot.conversations:[],
    current:boot.current||null,
    conversationId:boot.current?.conversation?.id||"",
    busy:false
  };
  const app=document.querySelector(".app");
  const mobileSidebar=window.matchMedia("(max-width:760px)");
  const sidebarStorageKey="aertex-intelligence-sidebar-v1";
  const modelPreferenceKey="aertex-ai-default-model-v1";
  function readModelPreference(){
    try{
      const prefix=modelPreferenceKey+"=";
      const raw=document.cookie.split(";").map(part=>part.trim()).find(part=>part.startsWith(prefix));
      if(raw)return JSON.parse(decodeURIComponent(raw.slice(prefix.length)));
    }catch{}
    try{return JSON.parse(localStorage.getItem(modelPreferenceKey)||"null")}catch{return null}
  }
  function saveModelPreference(providerId,model){
    const value=JSON.stringify({provider_id:providerId,model});
    try{localStorage.setItem(modelPreferenceKey,value)}catch{}
    try{
      const host=String(location.hostname||"").toLowerCase();
      const domain=["qsseda.com","qsseda.online","qsseda.studio"].find(item=>host===item||host.endsWith("."+item))||"";
      document.cookie=modelPreferenceKey+"="+encodeURIComponent(value)+"; Path=/; Max-Age=31536000; SameSite=Lax; Secure"+(domain?"; Domain="+domain:"");
    }catch{}
  }

  function updateSidebarA11y(){
    const open=mobileSidebar.matches?app.classList.contains("sidebar-open"):!app.classList.contains("sidebar-collapsed");
    $("sidebarToggle")?.setAttribute("aria-expanded",open?"true":"false");
  }
  function applySidebarMode(){
    if(mobileSidebar.matches){
      app.classList.remove("sidebar-collapsed");
      app.classList.remove("sidebar-open");
    }else{
      let collapsed=false;
      try{collapsed=localStorage.getItem(sidebarStorageKey)==="collapsed"}catch{}
      app.classList.toggle("sidebar-collapsed",collapsed);
      app.classList.remove("sidebar-open");
    }
    updateSidebarA11y();
  }
  function toggleSidebar(){
    if(mobileSidebar.matches){
      app.classList.toggle("sidebar-open");
    }else{
      const collapsed=app.classList.toggle("sidebar-collapsed");
      try{localStorage.setItem(sidebarStorageKey,collapsed?"collapsed":"open")}catch{}
    }
    updateSidebarA11y();
  }
  function closeMobileSidebar(){
    if(!mobileSidebar.matches)return;
    app.classList.remove("sidebar-open");
    updateSidebarA11y();
  }

  function chooseShareIdentity(){
    return new Promise(resolve=>{
      const modal=$("shareChoice"),named=$("shareWithName"),anonymous=$("shareAnonymous"),cancel=$("shareCancel"),backdrop=$("shareChoiceBackdrop");
      if(!modal||!named||!anonymous||!cancel||!backdrop){resolve(false);return}
      modal.hidden=false;
      const cleanup=()=>{named.removeEventListener("click",onNamed);anonymous.removeEventListener("click",onAnon);cancel.removeEventListener("click",onCancel);backdrop.removeEventListener("click",onCancel);document.removeEventListener("keydown",onKey)};
      const finish=value=>{cleanup();modal.hidden=true;resolve(value)};
      const onNamed=()=>finish(true),onAnon=()=>finish(false),onCancel=()=>finish(null),onKey=e=>{if(e.key==="Escape")onCancel()};
      named.addEventListener("click",onNamed);anonymous.addEventListener("click",onAnon);cancel.addEventListener("click",onCancel);backdrop.addEventListener("click",onCancel);document.addEventListener("keydown",onKey);named.focus();
    });
  }

  async function req(path,opt={}){
    const r=await fetch("/api/ai"+path,{...opt,credentials:"same-origin",cache:"no-store",headers:{Accept:"application/json",...(opt.headers||{})}});
    const type=r.headers.get("content-type")||"";
    const d=type.includes("application/json")?await r.json():null;
    if(r.status===401){location.reload();throw new Error("Authentication required")}
    if(!r.ok)throw new Error(d?.error||("HTTP "+r.status));
    return d;
  }
  function routeFor(id){return localeBase+"/c/"+id}
  function setStatus(ok,label){$("sideDot").className="dot "+(ok?"online":"offline");$("sideStatus").textContent=label;$("accountLabel").textContent=label}
  function gate(title,message){$("gate").classList.remove("hidden");$("messages").classList.add("hidden");$("composerWrap").classList.add("hidden");$("gateTitle").textContent=title;$("gateText").textContent=message;$("startLogin").classList.add("hidden");$("devicePanel").classList.add("hidden")}
  function showChat(){$("gate").classList.add("hidden");$("messages").classList.remove("hidden");$("composerWrap").classList.remove("hidden")}
  function append(role,content,scroll=true){
    $("emptyState").classList.add("hidden");
    const root=document.createElement("div");root.className="msg "+role;
    const bubble=document.createElement("div");bubble.className="bubble";
    if(role==="assistant"&&window.AERTEXRich)window.AERTEXRich.render(bubble,content,{final:true});else bubble.textContent=content;
    root.appendChild(bubble);$("messages").appendChild(root);
    if(scroll)$("content").scrollTop=$("content").scrollHeight;
    return bubble;
  }
  function renderCurrent(){
    $("messages").querySelectorAll(".msg").forEach(node=>node.remove());
    const items=Array.isArray(state.current?.messages)?state.current.messages:[];
    if(!items.length){$("emptyState").classList.remove("hidden");return}
    $("emptyState").classList.add("hidden");
    for(const item of items)append(item.role==="user"?"user":"assistant",item.content||"",false);
    $("content").scrollTop=$("content").scrollHeight;
  }
  function renderConversationList(){
    const root=$("conversationList");root.replaceChildren();
    for(const item of state.conversations){
      const row=document.createElement("div");row.className="chatItem"+(item.id===state.conversationId?" active":"");
      const link=document.createElement("a");link.className="chatLink";link.href=routeFor(item.id);link.textContent=item.title||text.untitled;link.title=item.title||text.untitled;
      const actions=document.createElement("div");actions.className="chatActions";
      const rename=document.createElement("button");rename.className="chatAction";rename.type="button";rename.dataset.action="rename";rename.dataset.id=item.id;rename.textContent="✎";rename.title=text.rename;
      const share=document.createElement("button");share.className="chatAction";share.type="button";share.dataset.action="share";share.dataset.id=item.id;share.textContent="↗";share.title=text.share;
      const del=document.createElement("button");del.className="chatAction";del.type="button";del.dataset.action="delete";del.dataset.id=item.id;del.textContent="×";del.title=text.delete;
      actions.append(rename,share,del);row.append(link,actions);root.append(row);
    }
  }
  async function loadConversations(){
    try{
      const data=await req("/conversations");
      state.conversations=Array.isArray(data)?data:[];
      renderConversationList();
    }catch{}
  }
${intelligenceWatchClientScript()}
  function hydrateConfig(cfg){
    state.config=cfg;
    const select=$("modelSelect");select.textContent="";
    const models=Array.isArray(cfg?.models)?cfg.models:[];
    const providers=Array.isArray(cfg?.providers)?cfg.providers:[];
    const savedPreference=readModelPreference();
    const savedAvailable=models.find(item=>item.available!==false&&item.provider_id===savedPreference?.provider_id&&item.model===savedPreference?.model);
    const preferredProviderId=savedAvailable?.provider_id||cfg.default_provider_id;
    const preferredModel=savedAvailable?.model||cfg.default_model;
    for(const provider of providers){
      const group=document.createElement("optgroup");
      group.label=(provider.provider==="zhipu"?"智谱 GLM · ":provider.provider==="bailian"?"阿里云百炼 · ":"OpenAI · ")+(provider.name||"");
      for(const item of models.filter(model=>model.provider_id===provider.id)){
        const option=document.createElement("option");
        option.value=item.model;option.dataset.providerId=item.provider_id;option.disabled=item.available===false;
        option.textContent=item.model+(item.available===false?" · "+text.regionBlocked:"");
        const current=state.current?.conversation;
        if(current&&item.provider_id===current.provider_id&&item.model===current.model&&item.available!==false)option.selected=true;
        else if(!current&&item.provider_id===preferredProviderId&&item.model===preferredModel&&item.available!==false)option.selected=true;
        group.appendChild(option);
      }
      if(group.children.length)select.appendChild(group);
    }
    const available=models.filter(item=>item.available!==false);
    if(!select.options.length){const option=document.createElement("option");option.textContent=text.noModels;option.disabled=true;select.appendChild(option)}
    if(available.length&&!select.selectedOptions.length){const first=[...select.options].find(option=>!option.disabled);if(first)first.selected=true}
    select.disabled=false;$("sendButton").disabled=!available.length;$("effortSelect").classList.add("hidden");
    if(available.length){
      setStatus(true,text.online);
      const activeProviders=providers.filter(provider=>provider.available!==false).map(provider=>provider.name).filter(Boolean);
      $("accountLabel").textContent=activeProviders.join(" · ")||text.online;
    }else{
      setStatus(false,text.noAvailableRegion);$("accountLabel").textContent=text.noAvailableRegion;
    }
    showChat();renderCurrent();syncWatchModelButton();restoreComposerDraft();syncWatchViewport();
  }
  async function checkStatus(force=false){
    try{
      const cfg=!force&&state.config?state.config:await req("/config");
      hydrateConfig(cfg);return true;
    }catch(e){
      setStatus(false,text.offline);gate(text.signedOut,e.message||text.connectHint);return false;
    }
  }
  async function send(){
    const message=$("composer").value.trim();if(!message||state.busy)return;
    persistComposerDraft(message);state.busy=true;$("sendButton").disabled=true;$("composer").value="";resizeComposerInput();
    if(isTinyWatch()&&$("watchComposerInput"))$("watchComposerInput").value="";
    append("user",message);
    const assistant=append("assistant",""),status=document.createElement("div");
    status.className="status";status.textContent=text.thinking;assistant.parentElement.appendChild(status);
    let createdNow=false;
    try{
      const selected=$("modelSelect").selectedOptions[0];
      if(!selected||selected.disabled)throw new Error(text.noAvailableRegion);
      const r=await fetch("/api/ai/chat",{method:"POST",credentials:"same-origin",cache:"no-store",headers:{"Content-Type":"application/json",Accept:"text/event-stream"},body:JSON.stringify({conversation_id:state.conversationId||null,message,model:selected.value,provider_id:selected.dataset.providerId||null})});
      if(r.status===401){location.reload();return}
      if(!r.ok||!r.body){
        const d=await r.json().catch(()=>null);
        if(d?.code==="REGION_UNSUPPORTED"&&d?.provider_id){
          [...$("modelSelect").options].forEach(option=>{if(option.dataset.providerId===d.provider_id){option.disabled=true;option.textContent=option.value+" · "+text.regionBlocked}});
          $("sendButton").disabled=![...$("modelSelect").options].some(option=>!option.disabled);
        }
        if(d?.code==="RATE_LIMITED"){const wait=Number(d?.diagnostic?.retry_after_seconds);throw new Error(text.rateLimited+(Number.isFinite(wait)&&wait>0?" "+text.rateRetry+" "+wait+"s":""))}
        throw new Error(d?.error||("HTTP "+r.status));
      }
      $("composer").value="";clearComposerDraft();resizeComposerInput();
      const reader=r.body.getReader(),decoder=new TextDecoder();let buffer="",streamed="";
      while(true){
        const x=await reader.read();if(x.done)break;buffer+=decoder.decode(x.value,{stream:true});
        let i;
        while((i=buffer.indexOf("\\n\\n"))>=0){
          const block=buffer.slice(0,i);buffer=buffer.slice(i+2);let event="message",payload=null;
          for(const line of block.split("\\n")){
            if(line.startsWith("event:"))event=line.slice(6).trim();
            if(line.startsWith("data:")){try{payload=JSON.parse(line.slice(5).trim())}catch{}}
          }
          if(event==="meta"&&payload?.conversation_id){
            if(!state.conversationId)createdNow=true;
            state.conversationId=payload.conversation_id;
            history.replaceState({conversationId:state.conversationId},"",routeFor(state.conversationId));
          }
          if(event==="delta"&&payload?.delta){streamed+=payload.delta;if(window.AERTEXRich)window.AERTEXRich.stream(assistant,streamed);else assistant.textContent=streamed;$("content").scrollTop=$("content").scrollHeight}
          if(event==="done")status.textContent="";
          if(event==="error")throw new Error(payload?.error||text.error);
        }
      }
      if(!streamed.trim())streamed="—";
      if(window.AERTEXRich)window.AERTEXRich.finalize(assistant,streamed);else assistant.textContent=streamed;
      if(createdNow)state.current={conversation:{id:state.conversationId,title:message.slice(0,80),model:selected.value,provider_id:selected.dataset.providerId||null},messages:[]};
      void loadConversations();
    }catch(e){
      assistant.textContent=e.message||text.error;assistant.classList.add("error");status.textContent="";
      if(!$("composer").value.trim())$("composer").value=message;persistComposerDraft(message);resizeComposerInput();syncWatchComposerInput();
    }finally{
      state.busy=false;$("sendButton").disabled=false;syncWatchViewport();
      if(!isTinyWatch())$("composer").focus();
    }
  }
  $("conversationList").addEventListener("click",async event=>{
    const button=event.target.closest("[data-action]");if(!button)return;
    event.preventDefault();event.stopPropagation();
    const id=button.dataset.id,action=button.dataset.action;
    const item=state.conversations.find(value=>value.id===id);if(!item)return;
    if(action==="rename"){
      const title=window.prompt(text.rename,item.title||text.untitled);if(!title?.trim())return;
      try{await req("/conversations/"+id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:title.trim()})});await loadConversations()}catch{}
    }
    if(action==="delete"){
      if(!window.confirm(text.confirmDelete))return;
      try{await req("/conversations/"+id,{method:"DELETE"});if(id===state.conversationId){state.conversationId="";state.current=null;history.replaceState({},"",localeBase);$("messages").querySelectorAll(".msg").forEach(n=>n.remove());$("emptyState").classList.remove("hidden")}await loadConversations()}catch{}
    }
    if(action==="share"){
      const shareAuthorName=await chooseShareIdentity();
      if(shareAuthorName===null)return;
      try{
        const result=await req("/conversations/"+id+"/share",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({share_author_name:shareAuthorName})});
        const url=location.origin+(result.share_path||("/share/"+result.share_token));
        try{await navigator.clipboard.writeText(url);window.alert(text.shareCopied)}catch{window.prompt(text.share,url)}
      }catch{window.alert(text.shareFailed)}
    }
  });
  $("retry").addEventListener("click",()=>void checkStatus(true));
  function startNewChat(){
    persistComposerDraft();state.conversationId="";state.current=null;history.pushState({},"",localeBase);
    $("messages").querySelectorAll(".msg").forEach(n=>n.remove());$("emptyState").classList.remove("hidden");renderConversationList();closeMobileSidebar();restoreComposerDraft();syncWatchModelButton();syncWatchViewport();$("composer").focus();
  }
  $("newChat").addEventListener("click",startNewChat);
  $("topNewChat").addEventListener("click",startNewChat);
  $("sidebarToggle").addEventListener("click",toggleSidebar);
  $("sidebarBackdrop").addEventListener("click",closeMobileSidebar);
  $("conversationList").addEventListener("click",event=>{if(event.target.closest(".chatLink"))closeMobileSidebar()});
  if(typeof mobileSidebar.addEventListener==="function")mobileSidebar.addEventListener("change",applySidebarMode);
  else if(typeof mobileSidebar.addListener==="function")mobileSidebar.addListener(applySidebarMode);
  applySidebarMode();
  $("modelSelect").addEventListener("change",()=>{
    syncWatchModelButton();
    if(state.conversationId)return;
    const selected=$("modelSelect").selectedOptions[0];
    if(selected&&!selected.disabled)saveModelPreference(selected.dataset.providerId||"",selected.value||"");
  });
  $("sendButton").addEventListener("click",send);
  $("composer").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();void send()}});
  $("composer").addEventListener("input",()=>{persistComposerDraft();resizeComposerInput();syncWatchViewport()});
  renderConversationList();restoreComposerDraft();syncWatchViewport();syncWatchModelButton();
  if(state.config)hydrateConfig(state.config);else void checkStatus();
})();
</script>
${accountMenuClientScript({ locale: zh ? "zh-cn" : "en" })}
</body></html>`;
}


export function renderSharedConversation(locale, payload, theme = "") {
  const zh = locale === "zh-cn";
  const themeAttr = intelligenceThemeAttr(theme);
  const themeBoot = intelligenceThemeBootScript();
  const conversation = payload?.conversation || {};
  const messages = Array.isArray(payload?.messages) ? payload.messages : [];
  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const title = esc(conversation.title || (zh ? "共享对话" : "Shared conversation"));
  const authorName = esc(conversation.author_name || "");
  const sharedMeta = authorName ? (zh ? ("由 " + authorName + " 分享 · AERTEX Intelligence 共享对话 · 只读") : ("Shared by " + authorName + " · AERTEX Intelligence shared conversation · Read only")) : (zh ? "AERTEX Intelligence 共享对话 · 只读" : "AERTEX Intelligence shared conversation · Read only");
  const richStyles = richMessageStyles();
  const richScript = richMessageClientScript({ copy: zh ? "复制" : "Copy", copied: zh ? "已复制" : "Copied", code: zh ? "代码" : "Code" });
  const body = messages.map(item => {
    const role = item?.role === "user" ? (zh ? "用户" : "User") : "AERTEX";
    return '<article class="msg '+(item?.role === "user" ? "user" : "assistant")+'"><div class="role">'+role+'</div><div class="bubble"'+(item?.role === "user" ? "" : ' data-rich-message="true"')+'>'+esc(item?.content || "")+'</div></article>';
  }).join("");
  return '<!doctype html><html lang="'+(zh ? "zh-CN" : "en")+'"'+themeAttr+'> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><title>'+title+' · AERTEX Intelligence</title>'+FAVICON_LINKS+themeBoot+'<style>:root{color-scheme:light;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;--bg:#f7f7f5;--panel:#fff;--panel2:#f0f0ee;--text:#171717;--muted:#777;--line:rgba(0,0,0,.09)}@media(prefers-color-scheme:dark){:root:not([data-theme]){color-scheme:dark;--bg:#101010;--panel:#181818;--panel2:#202020;--text:#f4f4f4;--muted:#9b9b9b;--line:rgba(255,255,255,.09)}}:root[data-theme="dark"]{color-scheme:dark;--bg:#101010;--panel:#181818;--panel2:#202020;--text:#f4f4f4;--muted:#9b9b9b;--line:rgba(255,255,255,.09)}:root[data-theme="light"]{color-scheme:light;--bg:#f7f7f5;--panel:#fff;--panel2:#f0f0ee;--text:#171717;--muted:#777;--line:rgba(0,0,0,.09)}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text)}main{width:min(860px,calc(100% - 32px));margin:0 auto;padding:38px 0 80px}header{padding-bottom:24px;border-bottom:1px solid var(--line)}h1{margin:0;font-size:30px;letter-spacing:-.04em}.meta{margin-top:8px;color:var(--muted);font-size:13px}.msg{padding:24px 0;border-bottom:1px solid var(--line)}.role{font-size:12px;font-weight:700;color:var(--muted);margin-bottom:8px}.bubble{white-space:pre-wrap;line-height:1.72}.user .bubble{display:inline-block;background:var(--panel2);padding:10px 14px;border-radius:16px}.footer{margin-top:28px;color:var(--muted);font-size:12px}</style><style>'+richStyles+'</style></head><body><main><header><h1>'+title+'</h1><div class="meta">'+sharedMeta+'</div></header>'+body+'<div class="footer">'+(zh ? "此链接由对话所有者主动分享" : "This link was explicitly shared by the conversation owner")+'</div></main>'+richScript+'<script>window.AERTEXRich&&window.AERTEXRich.enhance(document)</script></body></html>';
}


export function renderIntelligenceNotFound(locale, options = {}) {
  const zh = locale === "zh-cn";
  const themeAttr = intelligenceThemeAttr(options.theme || "");
  const themeBoot = intelligenceThemeBootScript();
  const kind = options.kind || "page";
  const copy = zh ? {
    conversation: { title: "找不到这个对话", detail: "这个对话可能已被删除，或者当前账号没有访问权限", action: "返回 Intelligence" },
    shared: { title: "共享对话不可用", detail: "分享链接可能已失效，或者对话所有者已停止分享", action: "返回 Intelligence" },
    page: { title: "找不到这个页面", detail: "你访问的 Intelligence 页面不存在或已经移动", action: "返回 Intelligence" }
  } : {
    conversation: { title: "Conversation not found", detail: "This chat may have been deleted, or this account does not have access to it", action: "Back to Intelligence" },
    shared: { title: "Shared conversation unavailable", detail: "This share link may have expired, or the owner stopped sharing the conversation", action: "Back to Intelligence" },
    page: { title: "Page not found", detail: "This Intelligence page does not exist or has moved", action: "Back to Intelligence" }
  };
  const text = copy[kind] || copy.page;
  const href = "/" + (zh ? "zh-cn" : "en");
  return `<!doctype html><html lang="${zh ? "zh-CN" : "en"}"${themeAttr}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="color-scheme" content="light dark"><meta name="robots" content="noindex,nofollow,noarchive"><title>${text.title} · AERTEX Intelligence</title>${FAVICON_LINKS}${themeBoot}<style>
:root{color-scheme:light;--bg:#f5f5f7;--fg:#1d1d1f;--muted:#6e6e73;--quiet:#8e8e93;--line:#424245;--icon-fill:#fff;--icon-soft:#e8e8ed;--shadow:rgba(0,0,0,.16);--chip:#fff;--chip-line:rgba(60,60,67,.14);font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Segoe UI",system-ui,sans-serif}
@media(prefers-color-scheme:dark){:root:not([data-theme]){color-scheme:dark;--bg:#101010;--fg:#f5f5f7;--muted:#a1a1a6;--quiet:#747477;--line:#d2d2d7;--icon-fill:#1c1c1e;--icon-soft:#2c2c2e;--shadow:rgba(0,0,0,.45);--chip:#181818;--chip-line:rgba(255,255,255,.1)}}
:root[data-theme="dark"]{color-scheme:dark;--bg:#101010;--fg:#f5f5f7;--muted:#a1a1a6;--quiet:#747477;--line:#d2d2d7;--icon-fill:#1c1c1e;--icon-soft:#2c2c2e;--shadow:rgba(0,0,0,.45);--chip:#181818;--chip-line:rgba(255,255,255,.1)}
:root[data-theme="light"]{color-scheme:light;--bg:#f5f5f7;--fg:#1d1d1f;--muted:#6e6e73;--quiet:#8e8e93;--line:#424245;--icon-fill:#fff;--icon-soft:#e8e8ed;--shadow:rgba(0,0,0,.16);--chip:#fff;--chip-line:rgba(60,60,67,.14)}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:var(--bg);color:var(--fg)}body{min-height:100svh}.nf-page{min-height:100svh;display:flex;flex-direction:column;align-items:center;padding:max(28px,5svh) 24px max(26px,env(safe-area-inset-bottom));text-align:center}.nf-brand{display:flex;align-items:center;justify-content:center;gap:12px;min-height:36px;color:var(--fg);font-size:18px;font-weight:700}.nf-brand .aertex-wordmark-token{width:118px;height:auto}.nf-intel{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border:1px solid var(--chip-line);border-radius:999px;background:var(--chip);font-size:12px;font-weight:650;color:var(--muted)}.nf-intel svg{width:14px;height:14px;fill:currentColor}.nf-main{width:min(100%,760px);display:flex;flex:1;flex-direction:column;align-items:center;justify-content:center;padding:22px 0 52px}.nf-art{width:clamp(166px,30vw,230px);height:auto;display:block;margin:0 0 clamp(30px,4vw,46px);overflow:visible}.nf-title{margin:0;color:var(--fg);font-size:clamp(36px,6vw,60px);font-weight:560;line-height:1.08;letter-spacing:-.045em;text-wrap:balance}.nf-detail{max-width:560px;margin:16px 0 0;color:var(--muted);font-size:clamp(15px,2vw,18px);line-height:1.65}.nf-link{display:inline-flex;align-items:center;gap:7px;margin-top:32px;padding:11px 16px;border:1px solid var(--chip-line);border-radius:13px;background:var(--chip);color:var(--fg);font-size:15px;font-weight:650;text-decoration:none;transition:transform .12s ease,background .12s ease}.nf-link:hover{background:var(--icon-soft)}.nf-link:active{transform:scale(.98)}.nf-arrow{font-size:18px;line-height:1}.nf-footer{color:var(--quiet);font-size:12px;padding-bottom:4px}@media(max-width:520px){.nf-page{padding-left:18px;padding-right:18px}.nf-brand{gap:9px}.nf-brand .aertex-wordmark-token{width:105px}.nf-main{justify-content:flex-start;padding-top:11svh}.nf-art{width:min(52vw,198px)}}
</style></head><body><main class="nf-page"><header class="nf-brand"><span>AERTEX</span><span class="nf-intel"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.4l1.55 4.55L18.1 8.5l-4.55 1.55L12 14.6l-1.55-4.55L5.9 8.5l4.55-1.55L12 2.4Zm6.1 10.4.95 2.8 2.8.95-2.8.95-.95 2.8-.95-2.8-2.8-.95 2.8-.95.95-2.8ZM5.4 14.3l.75 2.2 2.2.75-2.2.75-.75 2.2-.75-2.2-2.2-.75 2.2-.75.75-2.2Z"/></svg>Intelligence</span></header><section class="nf-main"><svg class="nf-art" viewBox="0 0 260 170" role="img" aria-label="${text.title}"><defs><filter id="nf-shadow" x="-25%" y="-25%" width="160%" height="170%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="var(--shadow)"/></filter></defs><g filter="url(#nf-shadow)"><rect x="39" y="34" width="154" height="104" rx="28" fill="var(--icon-fill)"/><path d="M39 65h154" fill="none" stroke="var(--icon-soft)" stroke-width="4"/><circle cx="61" cy="50" r="4" fill="var(--line)" opacity=".72"/><circle cx="76" cy="50" r="4" fill="var(--line)" opacity=".42"/><path d="M72 93h54M72 111h36" fill="none" stroke="var(--line)" stroke-width="7" stroke-linecap="round" opacity=".68"/><circle cx="173" cy="91" r="40" fill="var(--icon-fill)" stroke="var(--line)" stroke-width="5"/><path d="M202 120l25 28" fill="none" stroke="var(--line)" stroke-width="11" stroke-linecap="round"/><path d="M161 77l24 28M185 77l-24 28" fill="none" stroke="var(--line)" stroke-width="6" stroke-linecap="round"/></g></svg><h1 class="nf-title">${text.title}</h1><p class="nf-detail">${text.detail}</p><a class="nf-link" href="${href}"><span>${text.action}</span><span class="nf-arrow" aria-hidden="true">→</span></a></section><footer class="nf-footer">AERTEX Intelligence</footer></main></body></html>`;
}
