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
  const title = zh ? "你不是管理员，无法使用这个连接" : "Administrator access required";
  const detail = zh
    ? "此页面仅允许 AERTEX 管理员访问。你的身份已经完成验证，但当前账号没有管理员权限。"
    : "This page is restricted to AERTEX administrators. Your identity was verified, but this account does not have administrator privileges.";
  const back = zh ? "返回 Intelligence" : "Back to Intelligence";
  const backHref = zh ? "/zh-cn" : "/en";
  return `<!doctype html><html lang="${zh ? "zh-CN" : "en"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><title>${title}</title><style>
  :root{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color-scheme:light dark;--bg:#f7f7f5;--panel:#fff;--text:#171717;--muted:#777;--line:rgba(0,0,0,.1)}
  @media(prefers-color-scheme:dark){:root{--bg:#101010;--panel:#181818;--text:#f4f4f4;--muted:#999;--line:rgba(255,255,255,.12)}}
  *{box-sizing:border-box}body{margin:0;min-height:100vh;background:var(--bg);color:var(--text);display:grid;place-items:center;padding:24px}
  .card{width:min(620px,100%);background:var(--panel);border:1px solid var(--line);border-radius:24px;padding:30px}
  h1{font-size:28px;line-height:1.25;letter-spacing:-.035em;margin:0 0 12px}p{color:var(--muted);line-height:1.7;margin:0 0 22px}
  a{display:inline-flex;align-items:center;text-decoration:none;background:var(--text);color:var(--bg);padding:10px 14px;border-radius:11px;font-weight:700}
  </style></head><body><main class="card"><h1>${title}</h1><p>${detail}</p><a href="${backHref}">${back}</a></main></body></html>`;
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


