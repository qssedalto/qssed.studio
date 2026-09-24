import { huaweiHarmonyGate } from "./studio/huawei-harmony-gate.js";
import { verifyStudioPageSession, withStudioSessionCookies } from "./studio/session-gate.js";
import { handleAuthHandoff } from "./studio/auth-handoff.js";
import { gptSessionRedirect } from "./studio/gpt-subdomain.js";
import { renderGptApp } from "./studio/gpt-ui.js";
import { handleAiApi, handleAiAdminApi } from "./studio/ai-gateway.js";
import { renderAiAdmin } from "./studio/ai-admin-ui.js";
import { gptOriginForRequest } from "./studio/domain-family.js";
import { FAVICON_PATHS, faviconResponse } from "./studio/favicon.js";
import { injectBrandLogoRuntime } from "./studio/brand-logo.js";
import { TEXT } from "./studio/config.js";
import { topControls, themeScript } from "./studio/ui-page.js";


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
        origin: gptOriginForRequest(request)
      });
    }

    if (pathname === "/robots.txt") {
      return text("User-agent: *\nDisallow: /\n", 200, "text/plain;charset=UTF-8");
    }

    if (pathname === "/auth/handoff") {
      if (request.method !== "POST") return text("Method not allowed", 405);
      const locale = preferredLocale(request) === "en" ? "en" : "zh";
      return handleAuthHandoff(request, env, locale);
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
      const probe = await handleAiAdminApi(new Request(new URL("/api/ai/admin/state", request.url), { headers: request.headers }), env, gate);
      if (probe.status === 403) {
        const denied = withStudioSessionCookies(html(renderAdminDenied(locale), 403), gate.cookies || []);
        return request.method === "HEAD" ? new Response(null,{status:denied.status,headers:denied.headers}) : denied;
      }
      const response = withStudioSessionCookies(html(renderAiAdmin(locale)), gate.cookies || []);
      return request.method === "HEAD" ? new Response(null,{status:response.status,headers:response.headers}) : response;
    }

    if (pathname === "/zh-cn" || pathname === "/en") {
      const locale = pathname === "/en" ? "en" : "zh-cn";
      const gate = await verifyStudioPageSession(request);
      if (!gate.ok) {
        return withStudioSessionCookies(gptSessionRedirect(request, pathname), gate.cookies || []);
      }
      const response = withStudioSessionCookies(html(renderShell(locale)), gate.cookies || []);
      return request.method === "HEAD"
        ? new Response(null, { status: response.status, headers: response.headers })
        : response;
    }

    return text("Not found", 404);
  }
};

function renderShell(locale) {
  return renderGptApp(locale);
}

function renderAdminDenied(locale) {
  const zh = locale !== "en";
  const copy = zh ? {
    title: "此账号无权访问管理后台",
    eyebrow: "AERTEX Intelligence",
    detail: "此页面仅供 AERTEX Intelligence 管理员使用。我们已经验证了你的登录身份，但当前账号没有管理员权限，因此无法进入 Intelligence 管理后台。",
    secondary: "你仍然可以返回 Intelligence 使用当前账号已获授权的功能。如果你认为这是权限配置错误，请联系站点管理员检查你的账号角色。",
    back: "返回 Intelligence"
  } : {
    title: "This account cannot access the admin console",
    eyebrow: "AERTEX Intelligence",
    detail: "This page is reserved for AERTEX Intelligence administrators. Your signed-in identity has been verified, but this account does not have administrator privileges, so access to the Intelligence admin console is blocked.",
    secondary: "You can still return to Intelligence and use features already granted to this account. If you believe this is a permissions mistake, contact the site administrator to review your account role.",
    back: "Back to Intelligence"
  };
  const links = { zhCurrent: "/zh-cn/admin", enCurrent: "/en/admin" };
  const controls = topControls(links, zh ? TEXT.zh : TEXT.en);
  const backHref = zh ? "/zh-cn" : "/en";

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
    const savedTheme=localStorage.getItem("qssed-theme");
    const prefersLight=window.matchMedia("(prefers-color-scheme: light)").matches;
    document.documentElement.dataset.theme=savedTheme||(prefersLight?"light":"dark");
  }catch{
    document.documentElement.dataset.theme="dark";
  }
})();
</script>
<style>
:root{
  color-scheme:dark;
  --bg:#000;
  --surface:#1c1c1e;
  --surface-strong:#2c2c2e;
  --text:#f5f5f7;
  --muted:#a1a1a6;
  --border:rgba(255,255,255,.10);
  --primary:#0a84ff;
  --primary-ink:#fff;
  --glass-heavy:rgba(22,22,24,.88);
  --shadow:0 28px 70px rgba(0,0,0,.34);
}
:root[data-theme="light"]{
  color-scheme:light;
  --bg:#f5f5f7;
  --surface:#fff;
  --surface-strong:#f2f2f7;
  --text:#1d1d1f;
  --muted:#6e6e73;
  --border:rgba(60,60,67,.13);
  --primary:#007aff;
  --primary-ink:#fff;
  --glass-heavy:rgba(247,247,249,.90);
  --shadow:0 28px 70px rgba(0,0,0,.12);
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html{background:var(--bg)}
body{
  margin:0;
  min-height:100vh;
  padding:88px 20px 28px;
  background:
    radial-gradient(900px 520px at 14% -10%,color-mix(in srgb,var(--primary) 8%,transparent),transparent 68%),
    var(--bg);
  color:var(--text);
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display","Segoe UI",system-ui,sans-serif;
}
.shell{width:min(760px,100%);margin:0 auto}
.brand{display:flex;align-items:center;gap:10px;margin:0 0 34px;font-size:21px;font-weight:730;letter-spacing:-.025em;color:var(--text)}
.brand .aertex-wordmark-token{width:5.18687em;height:1em}
.card{
  border:1px solid var(--border);
  border-radius:28px;
  background:color-mix(in srgb,var(--surface) 88%,transparent);
  box-shadow:var(--shadow);
  padding:clamp(26px,5vw,44px);
  -webkit-backdrop-filter:blur(28px) saturate(170%);
  backdrop-filter:blur(28px) saturate(170%);
}
.kicker{font-size:13px;font-weight:680;color:var(--primary);margin:0 0 12px}
h1{margin:0;font-size:clamp(32px,6vw,52px);line-height:1.05;letter-spacing:-.045em;font-weight:730;text-wrap:balance}
.lead{margin:20px 0 0;color:var(--muted);font-size:16px;line-height:1.72}
.secondaryCopy{margin:12px 0 0;color:var(--muted);font-size:14px;line-height:1.7}
.back{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-height:48px;
  margin-top:26px;
  padding:0 16px;
  border-radius:13px;
  background:var(--primary);
  color:var(--primary-ink);
  text-decoration:none;
  font-weight:650;
}
.theme-toggle,.language-toggle{
  width:44px;height:44px;min-width:44px;min-height:44px;margin:0;padding:0;
  border:1px solid var(--border);border-radius:50%;background:var(--glass-heavy);color:var(--text);
  -webkit-backdrop-filter:blur(20px) saturate(170%);backdrop-filter:blur(20px) saturate(170%);
  box-shadow:0 8px 24px rgba(0,0,0,.10),inset 0 1px 0 color-mix(in srgb,#fff 20%,transparent);
  text-decoration:none;font-size:11px;font-weight:680;line-height:1;
}
.language-toggle{display:inline-flex;align-items:center;justify-content:center;flex:0 0 44px;white-space:nowrap;overflow:hidden}
.theme-toggle .theme-sun,:root[data-theme="light"] .theme-toggle .theme-moon{display:none}
:root[data-theme="light"] .theme-toggle .theme-sun{display:inline}
.top-controls-zone{position:fixed;top:0;right:0;width:132px;height:72px;z-index:80;pointer-events:none}
.top-controls{position:absolute;top:14px;right:14px;display:flex;align-items:center;gap:8px;pointer-events:auto}
.top-controls .language-toggle,.top-controls .theme-toggle{position:static!important}
:root.theme-switching body,:root.theme-switching .card{transition:background .20s ease,color .20s ease,border-color .20s ease}
@media(max-width:560px){body{padding:82px 16px 20px}.card{border-radius:24px}.brand{margin-bottom:24px}.top-controls{top:12px;right:12px}}
</style>
</head>
<body>
${controls}
<main class="shell">
  <div class="brand">${copy.eyebrow}</div>
  <section class="card">
    <div class="kicker">${zh ? "管理员权限验证" : "Administrator verification"}</div>
    <h1>${copy.title}</h1>
    <p class="lead">${copy.detail}</p>
    <p class="secondaryCopy">${copy.secondary}</p>
    <a class="back" href="${backHref}">${copy.back}</a>
  </section>
</main>
${themeScript()}
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
    "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"
  });
}

function html(markup, status = 200) {
  return new Response(injectBrandLogoRuntime(markup), { status, headers: securityHeaders("text/html;charset=UTF-8") });
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


