/**
 * 【初学者导读】
 * 文件：studio/gpt-subdomain.js
 * 路由/入口模块：负责把请求按域名、路径和产品边界分发到真正的页面或 API。
 * 阅读顺序：先找 export/主入口，再沿事件、路由或 API 调用向下；看到共享 helper 时先确认它是否被多个产品复用。
 * 数据流：输入通常来自 Request、会话或前端状态；重点跟踪校验、状态转换、存储读写以及最终 Response/DOM 输出。
 * 修改注意：这是入口/安全敏感区域，域名、重定向、会话和设备判断都应保持最小权限原则。
 * 调试方法：先锁定调用链，再打印/检查最小必要状态，不要从最终页面表现反推所有中间步骤。
 */
import { verifyStudioPageSession, withStudioSessionCookies } from "./session-gate.js";
import { authOriginForRequest, gptOriginForRequest, mainOriginForRequest } from "./domain-family.js";
import { FAVICON_LINKS } from "./favicon.js";
import { injectBrandLogoRuntime } from "./brand-logo.js";
import { localeDirection, localeFromPath as sharedLocaleFromPath, normalizeSupportedLocale, preferredLocaleFromRequest, SUPPORTED_LOCALES } from "./locale.js";

const REFRESH_COOKIE = "__Host-qsseda-studio-refresh";

export function isMainGptHandoffPath(pathname) {
  const path = typeof pathname === "string" ? pathname.replace(/\/+$/, "") || "/" : "/";
  if (path === "/gpt/handoff") return true;
  const locale = sharedLocaleFromPath(path);
  if (!locale) return false;
  const parts = path.split("/").filter(Boolean);
  return parts.length === 3 && parts[1] === "gpt" && parts[2] === "handoff";
}

export function gptSessionRedirect(request, next = "/") {
  const locale = localeFromPath(next) || preferredLocaleFromRequest(request);
  const safeNext = canonicalGptPath(next, locale);
  const target = new URL("/gpt/handoff", mainOriginForRequest(request));
  target.searchParams.set("next", safeNext);
  return redirect(target.toString());
}

// 主站 → Intelligence 子域登录交接：读取主站会话并生成一次页面交接，目标路径必须先经过 safeGptPath/canonicalGptPath 清洗。\nexport async function handleMainGptHandoff(request) {
  if (request.method !== "GET") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" }
    });
  }

  const requestUrl = new URL(request.url);
  const requestedNext = safeGptPath(requestUrl.searchParams.get("next"));
  const locale = localeFromPath(requestedNext) || preferredLocale(request, requestUrl.pathname);
  const next = canonicalGptPath(requestedNext, locale);
  const gate = await verifyStudioPageSession(request);

  let refreshToken = requestCookie(request, REFRESH_COOKIE);
  const rotatedRefresh = cookieValueFromSetCookies(gate.cookies || [], REFRESH_COOKIE);
  if (rotatedRefresh) refreshToken = rotatedRefresh;

  if (!gate.ok || !gate.accessToken) {
    const returnPath = `/${locale}/gpt/handoff?next=${encodeURIComponent(next)}`;
    const authUrl = new URL("/continue", authOriginForRequest(request));
    authUrl.searchParams.set("next", returnPath);
    return withStudioSessionCookies(redirect(authUrl.toString()), gate.cookies || []);
  }

  const gptOrigin = gptOriginForRequest(request);
  const refreshField = refreshToken
    ? `<input type="hidden" name="refresh_token" value="${escapeHtml(refreshToken)}">`
    : "";
  const handoffText = {"zh-cn":"正在进入 AERTEX Intelligence…","zh-tw":"正在進入 AERTEX Intelligence…","ja-jp":"AERTEX Intelligence に移動しています…","ko-kr":"AERTEX Intelligence로 이동 중…","fr-fr":"Ouverture d’AERTEX Intelligence…","es-es":"Entrando en AERTEX Intelligence…","el-gr":"Μετάβαση στο AERTEX Intelligence…","ar-sa":"جارٍ الدخول إلى AERTEX Intelligence…"}[locale] || "Entering AERTEX Intelligence…";
  const page = `<!doctype html><html lang="${locale}" dir="${localeDirection(locale)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AERTEX Intelligence</title>${FAVICON_LINKS}</head><body><main style="min-height:100vh;display:grid;place-items:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"><p>${handoffText}</p></main><form id="handoff" method="post" action="${gptOrigin}/auth/handoff"><input type="hidden" name="access_token" value="${escapeHtml(gate.accessToken)}">${refreshField}<input type="hidden" name="next" value="${escapeHtml(next)}"></form><script>document.getElementById("handoff").submit()</script></body></html>`;

  const headers = new Headers({
    "content-type": "text/html;charset=UTF-8",
    "cache-control": "no-store",
    "referrer-policy": "origin",
    "x-content-type-options": "nosniff",
    "content-security-policy": `default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; form-action ${gptOrigin}; base-uri 'none'; frame-ancestors 'none'`
  });

  return withStudioSessionCookies(new Response(injectBrandLogoRuntime(page), { status: 200, headers }), gate.cookies || []);
}

function preferredLocale(request, pathname) {
  return sharedLocaleFromPath(pathname) || preferredLocaleFromRequest(request);
}

function localeFromPath(pathname) {
  return sharedLocaleFromPath(pathname);
}

// Intelligence next 路径清洗：只接受站内相对路径，防止登录交接被利用成开放重定向。\nfunction safeGptPath(value) {
  const path = typeof value === "string" ? value.trim() : "";
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\u0000")) return "/";
  return path;
}

// 规范 Intelligence 路径：统一 locale 前缀和默认入口，让不同来源的跳转最终落到同一 URL 结构。\nfunction canonicalGptPath(path, locale) {
  const normalizedLocale = normalizeSupportedLocale(locale) || "en-us";
  const candidate = safeGptPath(path);
  const parts = candidate.split("/").filter(Boolean);
  const candidateLocale = normalizeSupportedLocale(parts[0]);
  const rest = candidateLocale ? parts.slice(1) : parts;
  if (rest[0] === "c" && rest[1] === "huawei-exempt" && /^[0-9a-f-]{36}$/i.test(rest[2] || "")) {
    return `/${normalizedLocale}/c/huawei-exempt/${rest[2]}`;
  }
  if (rest[0] === "c" && /^[0-9a-f-]{36}$/i.test(rest[1] || "")) {
    return `/${normalizedLocale}/c/${rest[1]}`;
  }
  return `/${normalizedLocale}`;
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
