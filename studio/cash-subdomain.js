/**
 * 【初学者导读】
 * 文件：studio/cash-subdomain.js
 * 域名/子域路由模块：决定不同 AERTEX 产品域名如何归一化、跳转和互相交接。
 * 阅读顺序：先看 export/入口函数，再看它调用的辅助函数；遇到 API 路径、存储键或域名判断时，向上追到 Worker 路由，向下追到具体数据源。
 * 数据流：建议始终回答四个问题——输入从哪里来？在哪里校验？修改了什么状态/存储？最后返回/渲染了什么？
 * 修改注意：先确认公开路由/API/数据结构的兼容性；规则改变时同步更新对应 scripts/*-check.mjs。
 * 调试方法：先使用最小请求复现，再逐步检查分支条件和中间状态，避免只根据最终 UI 猜原因。
 */
import { verifyStudioPageSession, withStudioSessionCookies } from "./session-gate.js";
import { authOriginForRequest, cashOriginForRequest, mainOriginForRequest } from "./domain-family.js";
import { FAVICON_LINKS } from "./favicon.js";
import { injectBrandLogoRuntime } from "./brand-logo.js";
import { localeDirection, localeFromPath as sharedLocaleFromPath, normalizeSupportedLocale, preferredLocaleFromRequest } from "./locale.js";

const REFRESH_COOKIE = "__Host-qsseda-studio-refresh";

export function isMainCashHandoffPath(pathname) {
  const path = typeof pathname === "string" ? pathname.replace(/\/+$/, "") || "/" : "/";
  if (path === "/cash/handoff") return true;
  const locale = sharedLocaleFromPath(path);
  if (!locale) return false;
  const parts = path.split("/").filter(Boolean);
  return parts.length === 3 && parts[1] === "cash" && parts[2] === "handoff";
}

export function cashSessionRedirect(request, next = "/") {
  const locale = sharedLocaleFromPath(next) || preferredLocaleFromRequest(request);
  const safeNext = canonicalCashPath(next, locale);
  const target = new URL("/cash/handoff", mainOriginForRequest(request));
  target.searchParams.set("next", safeNext);
  return redirect(target.toString());
}

export async function handleMainCashHandoff(request) {
  if (request.method !== "GET") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" }
    });
  }

  const requestUrl = new URL(request.url);
  const requestedNext = safeCashPath(requestUrl.searchParams.get("next"));
  const locale = sharedLocaleFromPath(requestedNext) || sharedLocaleFromPath(requestUrl.pathname) || preferredLocaleFromRequest(request);
  const next = canonicalCashPath(requestedNext, locale);
  const gate = await verifyStudioPageSession(request);

  let refreshToken = requestCookie(request, REFRESH_COOKIE);
  const rotatedRefresh = cookieValueFromSetCookies(gate.cookies || [], REFRESH_COOKIE);
  if (rotatedRefresh) refreshToken = rotatedRefresh;

  if (!gate.ok || !gate.accessToken) {
    const returnPath = `/${locale}/cash/handoff?next=${encodeURIComponent(next)}`;
    const authUrl = new URL("/continue", authOriginForRequest(request));
    authUrl.searchParams.set("next", returnPath);
    return withStudioSessionCookies(redirect(authUrl.toString()), gate.cookies || []);
  }

  const cashOrigin = cashOriginForRequest(request);
  const refreshField = refreshToken
    ? `<input type="hidden" name="refresh_token" value="${escapeHtml(refreshToken)}">`
    : "";
  const handoffText = {
    "zh-cn":"正在进入 AERTEX Cash…",
    "zh-tw":"正在進入 AERTEX Cash…",
    "ja-jp":"AERTEX Cash に移動しています…",
    "ko-kr":"AERTEX Cash로 이동 중…",
    "fr-fr":"Ouverture d’AERTEX Cash…",
    "es-es":"Entrando en AERTEX Cash…",
    "el-gr":"Μετάβαση στο AERTEX Cash…",
    "ar-sa":"جارٍ الدخول إلى AERTEX Cash…"
  }[locale] || "Entering AERTEX Cash…";
  const page = `<!doctype html><html lang="${locale}" dir="${localeDirection(locale)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AERTEX Cash</title>${FAVICON_LINKS}</head><body><main style="min-height:100vh;display:grid;place-items:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"><p>${handoffText}</p></main><form id="handoff" method="post" action="${cashOrigin}/auth/handoff"><input type="hidden" name="access_token" value="${escapeHtml(gate.accessToken)}">${refreshField}<input type="hidden" name="next" value="${escapeHtml(next)}"></form><script>document.getElementById("handoff").submit()</script></body></html>`;

  const headers = new Headers({
    "content-type": "text/html;charset=UTF-8",
    "cache-control": "no-store",
    "referrer-policy": "origin",
    "x-content-type-options": "nosniff",
    "content-security-policy": `default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; form-action ${cashOrigin}; base-uri 'none'; frame-ancestors 'none'`
  });

  return withStudioSessionCookies(new Response(injectBrandLogoRuntime(page), { status: 200, headers }), gate.cookies || []);
}

function safeCashPath(value) {
  const path = typeof value === "string" ? value.trim() : "";
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\u0000")) return "/";
  return path;
}

function canonicalCashPath(path, locale) {
  const normalizedLocale = normalizeSupportedLocale(locale) || "en-us";
  const candidate = safeCashPath(path);
  const parts = candidate.split("/").filter(Boolean);
  const candidateLocale = normalizeSupportedLocale(parts[0]);
  return candidateLocale ? `/${candidateLocale}` : `/${normalizedLocale}`;
}

function requestCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index <= 0 || part.slice(0, index).trim() !== name) continue;
    try { return decodeURIComponent(part.slice(index + 1).trim()); }
    catch { return part.slice(index + 1).trim(); }
  }
  return "";
}

function cookieValueFromSetCookies(cookies, name) {
  for (const line of cookies) {
    const first = String(line || "").split(";", 1)[0];
    const index = first.indexOf("=");
    if (index <= 0 || first.slice(0, index).trim() !== name) continue;
    try { return decodeURIComponent(first.slice(index + 1).trim()); }
    catch { return first.slice(index + 1).trim(); }
  }
  return "";
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[character]));
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
