import { huaweiHarmonyGate } from "./studio/huawei-harmony-gate.js";
import { handleStudioSessionLogout, verifyStudioPageSession, withStudioSessionCookies } from "./studio/session-gate.js";
import { handleAuthHandoff } from "./studio/auth-handoff.js";
import { gptSessionRedirect } from "./studio/gpt-subdomain.js";
import { renderGptApp, renderSharedConversation } from "./studio/gpt-ui.js";
import { handleAiApi, handleAiAdminApi } from "./studio/ai-gateway.js";
import { handleAccountSecurity } from "./studio/account-security-api.js";
import { renderAiAdmin } from "./studio/ai-admin-ui.js";
import { gptOriginForRequest } from "./studio/domain-family.js";
import { FAVICON_PATHS, faviconResponse } from "./studio/favicon.js";
import { injectBrandLogoRuntime } from "./studio/brand-logo.js";
import { accountMenuClientScript, accountMenuMarkup, accountMenuStyles, injectAccountMenuRuntime } from "./studio/account-menu.js";
import { SUPABASE_URL, SUPABASE_KEY } from "./studio/config.js";


export default {
  async fetch(request, env) {
    const deviceGate = huaweiHarmonyGate(request);
    if (deviceGate) return deviceGate;

    const url = new URL(request.url);
    const pathname = normalizePath(url.pathname);

    if (FAVICON_PATHS.has(pathname)) return faviconResponse(request);

    if (pathname === "/health") {
      return json({
        service: "qsseda-gpt",
        status: "ok",
        origin: gptOriginForRequest(request),
        ingress_colo: request.cf?.colo || null
      });
    }

    if (pathname === "/robots.txt") {
      return text("User-agent: *\nDisallow: /\n", 200, "text/plain;charset=UTF-8");
    }

    const sharedMatch = pathname.match(/^\/share\/([0-9a-f-]{36})$/i);
    if (sharedMatch) {
      const locale = preferredLocale(request) === "en" ? "en" : "zh-cn";
      const payload = await loadSharedConversation(sharedMatch[1]);
      if (!payload?.conversation) return html("<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>404 · AERTEX Intelligence</title></head><body><main style=\"font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;padding:40px\"><h1>404</h1><p>"+(locale==="en"?"This shared conversation is unavailable.":"这个共享对话不可用")+"</p></main></body></html>",404);
      return html(renderSharedConversation(locale, payload));
    }

    if (pathname === "/auth/handoff") {
      if (request.method !== "POST") return text("Method not allowed", 405);
      const locale = preferredLocale(request) === "en" ? "en" : "zh";
      return handleAuthHandoff(request, env, locale);
    }

    if (pathname === "/api/auth/logout") {
      if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
      return handleStudioSessionLogout(request);
    }

    if (pathname === "/api/account/security/summary") {
      return handleAccountSecurity(request, "summary");
    }

    if (pathname.startsWith("/api/ai/")) {
      const gate = await verifyStudioPageSession(request);
      if (!gate.ok) {
        return withStudioSessionCookies(json({ error: "Authentication required." }, 401), gate.cookies || []);
      }
      const response = pathname.startsWith("/api/ai/admin/")
        ? await handleAiAdminApi(request, env, gate)
        : await handleAiApi(request, env, gate);
      return withStudioSessionCookies(response, gate.cookies || []);
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return text("Method not allowed", 405);
    }

    if (pathname === "/") {
      const locale = preferredLocale(request);
      return redirect(`${gptOriginForRequest(request)}/${locale}`);
    }

    if (pathname === "/admin" || pathname === "/zh-cn/admin" || pathname === "/en/admin") {
      const locale = pathname.startsWith("/en") ? "en" : "zh-cn";
      const gate = await verifyStudioPageSession(request);
      if (!gate.ok) return withStudioSessionCookies(gptSessionRedirect(request, pathname), gate.cookies || []);
      const probe = await handleAiAdminApi(internalRequest(request, "/api/ai/admin/state?fast=1"), env, gate);
      if (probe.status === 403) {
        const identity = await loadDeniedIdentity(gate);
        const denied = withStudioSessionCookies(html(renderAdminDenied(locale, identity), 403), gate.cookies || []);
        return request.method === "HEAD" ? new Response(null,{status:denied.status,headers:denied.headers}) : denied;
      }
      const adminState = probe.ok ? await probe.json().catch(()=>({providers:[],users:[]})) : {providers:[],users:[]};
      const response = withStudioSessionCookies(html(renderAiAdmin(locale, { state: adminState })), gate.cookies || []);
      return request.method === "HEAD" ? new Response(null,{status:response.status,headers:response.headers}) : response;
    }

    const conversationRoute = pathname.match(/^\/(zh-cn|en)\/c\/([0-9a-f-]{36})$/i);
    if (pathname === "/zh-cn" || pathname === "/en" || conversationRoute) {
      const locale = pathname.startsWith("/en") ? "en" : "zh-cn";
      const gate = await verifyStudioPageSession(request);
      if (!gate.ok) {
        return withStudioSessionCookies(gptSessionRedirect(request, pathname), gate.cookies || []);
      }
      const conversationId = conversationRoute?.[2] || "";
      const bootstrap = await loadGptBootstrap(request, env, gate, conversationId);
      if (conversationId && !bootstrap.current) {
        const missing = withStudioSessionCookies(html("<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>404 · AERTEX Intelligence</title></head><body><main style=\"font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;padding:40px\"><h1>404</h1><p>"+(locale==="en"?"Conversation not found.":"找不到这个对话")+"</p><a href=\"/"+locale+"\">"+(locale==="en"?"Back to Intelligence":"返回 Intelligence")+"</a></main></body></html>",404), gate.cookies || []);
        return request.method === "HEAD" ? new Response(null,{status:missing.status,headers:missing.headers}) : missing;
      }
      const response = withStudioSessionCookies(html(renderShell(locale, bootstrap)), gate.cookies || []);
      return request.method === "HEAD"
        ? new Response(null, { status: response.status, headers: response.headers })
        : response;
    }

    const notFoundLocale = preferredLocale(request);
    return html(`<!doctype html><html lang="${notFoundLocale === "en" ? "en" : "zh-CN"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>404 · AERTEX Intelligence</title><style>html,body{margin:0;min-height:100%;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#101010;color:#f4f4f4}main{min-height:100vh;display:grid;place-items:center;padding:24px;text-align:center}h1{font-size:64px;margin:0 0 8px}p{color:#999}a{color:inherit}</style></head><body><main><div><h1>404</h1><p>${notFoundLocale === "en" ? "Intelligence page not found." : "找不到这个 Intelligence 页面。"}</p><a href="/${notFoundLocale === "en" ? "en" : "zh-cn"}">${notFoundLocale === "en" ? "Back to Intelligence" : "返回 Intelligence"}</a></div></main></body></html>`, 404);
  }
};

function renderShell(locale, bootstrap = {}) {
  return renderGptApp(locale, bootstrap);
}

async function loadGptBootstrap(request, env, gate, conversationId = "") {
  const tasks = [
    handleAiApi(internalRequest(request, "/api/ai/config"), env, gate),
    handleAiApi(internalRequest(request, "/api/ai/conversations"), env, gate),
    handleAiAdminApi(internalRequest(request, "/api/ai/admin/me"), env, gate)
  ];
  if (conversationId) tasks.push(handleAiApi(internalRequest(request, "/api/ai/conversations/" + conversationId), env, gate));
  const responses = await Promise.all(tasks);
  const [configResponse, conversationsResponse, adminResponse, conversationResponse] = responses;
  return {
    config: configResponse?.ok ? await configResponse.json().catch(() => null) : null,
    conversations: conversationsResponse?.ok ? await conversationsResponse.json().catch(() => []) : [],
    isAdmin: adminResponse?.ok === true,
    current: conversationId && conversationResponse?.ok ? await conversationResponse.json().catch(() => null) : null
  };
}

function internalRequest(request, path) {
  const url = new URL(path, request.url);
  const headers = new Headers(request.headers);
  if (request.cf?.country) headers.set("CF-IPCountry", request.cf.country);
  return new Request(url.toString(), { method: "GET", headers });
}

async function loadSharedConversation(token) {
  try {
    const response = await fetch(SUPABASE_URL + "/rest/v1/rpc/get_shared_ai_conversation", {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        "content-type": "application/json;charset=UTF-8",
        Accept: "application/json"
      },
      body: JSON.stringify({ p_share_token: token })
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function loadDeniedIdentity(gate) {
  const email = String(gate?.user?.email || "").trim();
  let username = String(gate?.user?.user_metadata?.username || "").trim();
  if (gate?.user?.id && gate?.accessToken) {
    try {
      const response = await fetch(
        SUPABASE_URL + "/rest/v1/profiles?select=username&id=eq." + encodeURIComponent(gate.user.id) + "&limit=1",
        { headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + gate.accessToken, Accept: "application/json" } }
      );
      if (response.ok) {
        const rows = await response.json();
        const profileUsername = Array.isArray(rows) ? String(rows[0]?.username || "").trim() : "";
        if (profileUsername) username = profileUsername;
      }
    } catch {}
  }
  return {
    email: email || "Unknown",
    username: username || "Unknown",
    accessedAt: new Date().toISOString()
  };
}

function renderAdminDenied(locale, identity) {
  const zh = locale !== "en";
  const copy = zh ? {
    title: "此账号无权访问管理后台",
    detail: "此页面仅供 AERTEX Intelligence 管理员使用。我们已经验证了你的登录身份，但当前账号没有管理员权限，因此无法进入 Intelligence 管理后台。",
    secondaryBefore: "你仍然可以返回 Intelligence，继续使用当前账号已经获得授权的功能。如果你认为这里的权限判断有误，请",
    contact: "联系站点管理员",
    secondaryAfter: "，我们会协助检查你的账号角色与管理员授权状态。",
    mailSubject: "AERTEX Intelligence 管理员权限检查",
    mailBody: "你好，\n\n我在访问 AERTEX Intelligence 管理后台时收到“此账号无权访问管理后台”的提示。请协助检查我的账号角色与管理员权限配置。\n\n账号邮箱：" + identity.email + "\n用户名：" + identity.username + "\n访问时间：" + identity.accessedAt + " (UTC)\n问题描述：\n\n谢谢。",
    back: "返回 Intelligence",
    verify: "管理员权限验证",
    section: "Intelligence 管理后台"
  } : {
    title: "This account cannot access the admin console",
    detail: "This page is reserved for AERTEX Intelligence administrators. Your signed-in identity has been verified, but this account does not have administrator privileges, so access to the Intelligence admin console is blocked.",
    secondaryBefore: "You can still return to Intelligence and continue using features already granted to this account. If you believe this authorization result is incorrect, ",
    contact: "contact the site administrator",
    secondaryAfter: " and we will help review your account role and administrator access.",
    mailSubject: "AERTEX Intelligence administrator access review",
    mailBody: "Hello,\n\nI received the “This account cannot access the admin console” message while opening the AERTEX Intelligence admin console. Please help review my account role and administrator permissions.\n\nAccount email: " + identity.email + "\nUsername: " + identity.username + "\nTime of access: " + identity.accessedAt + " (UTC)\nIssue details:\n\nThank you.",
    back: "Back to Intelligence",
    verify: "Administrator verification",
    section: "Intelligence Admin"
  };
  const backHref = zh ? "/zh-cn" : "/en";
  const mailto = "mailto:71-weirs-cedars@icloud.com?subject=" + encodeURIComponent(copy.mailSubject) + "&body=" + encodeURIComponent(copy.mailBody);
  const secondaryHtml = copy.secondaryBefore + '<a class="contactLink" href="' + mailto + '">' + copy.contact + '</a>' + copy.secondaryAfter;
  const languageHref = zh ? "/en/admin" : "/zh-cn/admin";
  const languageLabel = zh ? "ZH" : "EN";
  const languageTitle = zh ? "Switch to English" : "切换到中文";

  return `<!doctype html>
<html lang="${zh ? "zh-CN" : "en"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<title>${copy.title}</title>
<script>
(function(){
  try{
    const saved=localStorage.getItem("qssed-gpt-theme");
    if(saved==="light"||saved==="dark") document.documentElement.dataset.theme=saved;
  }catch{}
})();
</script>
<style>
:root{
  font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  --bg:#f7f7f5;
  --panel:#fff;
  --panel2:#f0f0ee;
  --text:#171717;
  --muted:#777;
  --line:rgba(0,0,0,.09);
  --accent:#111;
  --accentText:#fff;
  --danger:#b42318;
}
@media(prefers-color-scheme:dark){
  :root:not([data-theme]){
    --bg:#101010;
    --panel:#181818;
    --panel2:#202020;
    --text:#f4f4f4;
    --muted:#9b9b9b;
    --line:rgba(255,255,255,.09);
    --accent:#f4f4f4;
    --accentText:#111;
    --danger:#ff766d;
  }
}
:root[data-theme="dark"]{
  color-scheme:dark;
  --bg:#101010;
  --panel:#181818;
  --panel2:#202020;
  --text:#f4f4f4;
  --muted:#9b9b9b;
  --line:rgba(255,255,255,.09);
  --accent:#f4f4f4;
  --accentText:#111;
  --danger:#ff766d;
}
:root[data-theme="light"]{
  color-scheme:light;
  --bg:#f7f7f5;
  --panel:#fff;
  --panel2:#f0f0ee;
  --text:#171717;
  --muted:#777;
  --line:rgba(0,0,0,.09);
  --accent:#111;
  --accentText:#fff;
  --danger:#b42318;
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text)}
button,a{font:inherit}
.app{min-height:100vh;display:grid;grid-template-columns:270px minmax(0,1fr)}
.sidebar{
  border-right:1px solid var(--line);
  padding:18px;
  background:var(--panel2);
  display:flex;
  flex-direction:column;
  gap:14px;
}
.brand{font-weight:760;letter-spacing:-.03em;font-size:20px;padding:8px 6px}
.brand .aertex-wordmark-token{width:5.18687em;height:1em}
.brand small{display:block;color:var(--muted);font-size:12px;font-weight:500;letter-spacing:0;margin-top:4px}
.sideMeta{margin-top:auto;color:var(--muted);font-size:11px;line-height:1.55;padding:6px}
.main{min-width:0;height:100vh;display:flex;flex-direction:column}
.topbar{
  height:62px;
  display:flex;
  align-items:center;
  gap:10px;
  padding:0 18px;
  border-bottom:1px solid var(--line);
}
.sectionTitle{font-size:14px;font-weight:650}
.controls{margin-left:auto;display:flex;align-items:center;gap:8px}
.control{
  height:36px;
  min-width:42px;
  padding:0 11px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  border:1px solid var(--line);
  background:var(--panel);
  color:var(--text);
  border-radius:10px;
  text-decoration:none;
  cursor:pointer;
  font-size:12px;
  font-weight:650;
}
.control:hover{background:var(--panel2)}
.content{flex:1;min-height:0;overflow:auto}
.gate{
  width:min(650px,calc(100% - 36px));
  margin:80px auto;
  padding:28px;
  border:1px solid var(--line);
  background:var(--panel);
  border-radius:22px;
}
.kicker{font-size:12px;color:var(--muted);font-weight:650;margin:0 0 10px}
.gate h1{margin:0 0 10px;font-size:28px;line-height:1.18;letter-spacing:-.035em}
.gate p{color:var(--muted);line-height:1.7;margin:0}
.gate p+p{margin-top:10px}
.contactLink{color:var(--text);font-weight:650;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px}
.contactLink:hover{opacity:.72}
.sideMeta .contactLink{color:inherit}
.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}
.primary{
  border:0;
  background:var(--accent);
  color:var(--accentText);
  border-radius:11px;
  padding:9px 14px;
  cursor:pointer;
  font-weight:650;
  text-decoration:none;
  display:inline-flex;
  align-items:center;
  justify-content:center;
}
.status{
  display:flex;
  align-items:center;
  gap:8px;
  color:var(--muted);
  font-size:12px;
  padding:8px 6px;
}
.statusDot{width:8px;height:8px;border-radius:50%;background:var(--danger)}
@media(max-width:760px){
  .app{grid-template-columns:1fr}
  .sidebar{display:none}
  .topbar{padding:0 10px}
  .gate{margin:54px auto}
}
${accountMenuStyles()}
</style>
</head>
<body>
<div class="app">
  <aside class="sidebar">
    <div class="brand">AERTEX Intelligence<small>Cloud Intelligence</small></div>
    <div class="status"><span class="statusDot"></span><span>${copy.verify}</span></div>
    <div class="sideMeta">${secondaryHtml}</div>
  </aside>
  <main class="main">
    <header class="topbar">
      <div class="sectionTitle">AERTEX Intelligence</div>
      <div class="controls">
        <a class="control" href="${languageHref}" aria-label="${languageTitle}" title="${languageTitle}">${languageLabel}</a>
        <button class="control" id="themeToggle" type="button" aria-label="${zh ? "切换深浅色" : "Toggle color mode"}" title="${zh ? "切换深浅色" : "Toggle color mode"}">◐</button>
        ${accountMenuMarkup(zh ? "zh-cn" : "en")}
      </div>
    </header>
    <section class="content">
      <div class="gate">
        <div class="kicker">${copy.verify}</div>
        <h1>${copy.title}</h1>
        <p>${copy.detail}</p>
        <p>${secondaryHtml}</p>
        <div class="actions"><a class="primary" href="${backHref}">${copy.back}</a></div>
      </div>
    </section>
  </main>
</div>
<script>
(function(){
  const button=document.getElementById("themeToggle");
  if(!button)return;
  function currentTheme(){
    const explicit=document.documentElement.dataset.theme;
    if(explicit==="light"||explicit==="dark")return explicit;
    return window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";
  }
  function updateIcon(){button.textContent=currentTheme()==="dark"?"◑":"◐"}
  button.addEventListener("click",()=>{
    const next=currentTheme()==="dark"?"light":"dark";
    document.documentElement.dataset.theme=next;
    try{localStorage.setItem("qssed-gpt-theme",next)}catch{}
    updateIcon();
  });
  updateIcon();
})();
</script>
${accountMenuClientScript({ locale: zh ? "zh-cn" : "en" })}
</body>
</html>`;
}

function preferredLocale(request) {
  const language = (request.headers.get("Accept-Language") || "").toLowerCase();
  return language.includes("zh") ? "zh-cn" : "en";
}

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function securityHeaders(contentType) {
  return new Headers({
    "content-type": contentType,
    "cache-control": "no-store",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "strict-transport-security": "max-age=31536000; includeSubDomains",
    "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"
  });
}

function html(markup, status = 200) {
  return new Response(
    injectBrandLogoRuntime(injectAccountMenuRuntime(markup)),
    { status, headers: securityHeaders("text/html;charset=UTF-8") }
  );
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: securityHeaders("application/json;charset=UTF-8") });
}

function text(body, status = 200, contentType = "text/plain;charset=UTF-8") {
  return new Response(body, { status, headers: securityHeaders(contentType) });
}

function redirect(location) {
  return new Response(null, {
    status: 302,
    headers: {
      location,
      "cache-control": "no-store",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff"
    }
  });
}


