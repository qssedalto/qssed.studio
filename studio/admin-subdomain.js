/**
 * 【初学者导读】
 * 文件：studio/admin-subdomain.js
 * 域名/子域路由模块：决定不同 AERTEX 产品域名如何归一化、跳转和互相交接。
 * 阅读顺序：先看 export/入口函数，再看它调用的辅助函数；遇到 API 路径、存储键或域名判断时，向上追到 Worker 路由，向下追到具体数据源。
 * 数据流：建议始终回答四个问题——输入从哪里来？在哪里校验？修改了什么状态/存储？最后返回/渲染了什么？
 * 修改注意：先确认公开路由/API/数据结构的兼容性；规则改变时同步更新对应 scripts/*-check.mjs。
 * 调试方法：先使用最小请求复现，再逐步检查分支条件和中间状态，避免只根据最终 UI 猜原因。
 */
import { verifyStudioPageSession, withStudioSessionCookies } from "./session-gate.js";
import { adminOriginForRequest, authOriginForRequest, mainOriginForRequest } from "./domain-family.js";
import { adminCanonicalPath as localizedAdminPath, adminLocaleFromPath } from "../admin/i18n.js";
import { localeFromPath as sharedLocaleFromPath, normalizeSupportedLocale, preferredLocaleFromRequest, SUPPORTED_LOCALES } from "./locale.js";

const REFRESH_COOKIE = "__Host-qsseda-studio-refresh";
const ADMIN_PATHS = new Set(["/", "/overview", "/users", "/roles", "/logs", "/system", "/access", "/content", "/storage", "/intelligence"]);

export function isMainAdminHandoffPath(pathname) {
  return pathname === "/control/handoff" || pathname === "/zh-cn/control/handoff" || pathname === "/en/control/handoff";
}

export function adminSessionRedirect(request, next = "/") {
  const safeNext = canonicalAdminPath(next);
  const target = new URL("/control/handoff", mainOriginForRequest(request));
  target.searchParams.set("next", safeNext);
  return redirect(target.toString());
}

// 主站 → Admin 交接：除了有效登录态，还需要管理员权限；普通用户即使构造 admin URL 也不能建立管理会话。\nexport async function handleMainAdminHandoff(request) {
  if (request.method !== "GET") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" }
    });
  }

  const requestUrl = new URL(request.url);
  const next = canonicalAdminPath(requestUrl.searchParams.get("next"));
  const locale = preferredLocale(request, requestUrl.pathname);
  const gate = await verifyStudioPageSession(request);

  if (!gate.ok || !gate.accessToken) {
    const returnPath = `/${locale}/control/handoff?next=${encodeURIComponent(next)}`;
    const authUrl = new URL("/continue", authOriginForRequest(request));
    authUrl.searchParams.set("next", returnPath);
    return withStudioSessionCookies(redirect(authUrl.toString()), gate.cookies || []);
  }

  const adminOrigin = adminOriginForRequest(request);
  const page = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AERTEX Administration</title></head><body><main style="min-height:100vh;display:grid;place-items:center;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:#0a0d12;color:#e8edf5"><p>Establishing administrative session…</p></main><form id="handoff" method="post" action="${adminOrigin}/auth/handoff"><input type="hidden" name="access_token" value="${escapeHtml(gate.accessToken)}"><input type="hidden" name="next" value="${escapeHtml(next)}"></form><script>document.getElementById("handoff").submit()</script></body></html>`;

  const headers = new Headers({
    "content-type": "text/html;charset=UTF-8",
    "cache-control": "no-store",
    "referrer-policy": "origin",
    "x-content-type-options": "nosniff",
    "x-robots-tag": "noindex, nofollow, noarchive, nosnippet",
    "content-security-policy": `default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; form-action ${adminOrigin}; base-uri 'none'; frame-ancestors 'none'`
  });

  return withStudioSessionCookies(new Response(page, { status: 200, headers }), gate.cookies || []);
}

// Admin 路径规范化：只允许管理站内已知结构，并统一语言/默认入口，避免错误路径进入敏感 handler。\nexport function canonicalAdminPath(value) {
  const path = typeof value === "string" ? value.trim() : "";
  const parsed = adminLocaleFromPath(path);
  if (!parsed.path) return "/";
  if (parsed.locale) return localizedAdminPath(parsed.locale, parsed.path);
  return parsed.path;
}

function preferredLocale(request, pathname) {
  return sharedLocaleFromPath(pathname) || preferredLocaleFromRequest(request);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function redirect(location) {
  return new Response(null, {
    status: 302,
    headers: { location, "cache-control": "no-store", "referrer-policy": "no-referrer" }
  });
}
