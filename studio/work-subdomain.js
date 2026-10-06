/**
 * 【初学者导读】
 * 文件：studio/work-subdomain.js
 * 子域路由模块：把独立产品域名请求安全地交接到正确页面/登录流程。
 * 阅读顺序：先确认这个模块从哪里被导入，再看入口函数接收什么状态/Request；随后追踪 API、DOM、缓存或重定向副作用。
 * 初学者重点：Work/Watch 等独立产品虽然共享登录和品牌，但域名、路由和部署边界是分开的，不能把一个产品的假设直接复制到另一个。
 * 修改注意：保持已有 URL、查询参数、DOM 标识和登录交接兼容；如果产品边界变化，必须同步修改对应 CI 检查。
 * 调试方法：先确认 host/path 命中了哪个入口，再检查会话和内部状态，最后看具体 UI 或 API 结果。
 */
import { verifyStudioPageSession, withStudioSessionCookies } from "./session-gate.js";
import { authOriginForRequest, isServiceHost, mainOriginForRequest, workOriginForRequest } from "./domain-family.js";
import { FAVICON_LINKS } from "./favicon.js";
import { TEXT } from "./config.js";
import { buildLinks, getRouteInfo, html } from "./routing.js";
import { notFoundPage } from "./auth-pages.js";
import { injectBrandLogoRuntime } from "./brand-logo.js";
import { localeDirection, localeFromPath as sharedLocaleFromPath, normalizeSupportedLocale, preferredLocaleFromRequest } from "./locale.js";

const REFRESH_COOKIE = "__Host-qsseda-studio-refresh";
const WORK_DOCUMENT_ID_RE = /^[0-9a-f-]{36}$/i;

export function isWorkSubdomainRequest(request) {
  try { return isServiceHost(new URL(request.url).hostname, "work"); }
  catch { return false; }
}

export function isMainWorkHandoffPath(pathname) {
  const clean = normalizePath(pathname);
  if (clean === "/work/handoff") return true;
  const locale = sharedLocaleFromPath(clean);
  if (!locale) return false;
  const parts = clean.split("/").filter(Boolean);
  return parts.length === 3 && parts[1] === "work" && parts[2] === "handoff";
}

export function mainWorkRedirect(request, pathname) {
  const clean = normalizePath(pathname);
  const workOrigin = workOriginForRequest(request);
  const routeLocale = sharedLocaleFromPath(clean);
  const parts = clean.split("/").filter(Boolean);
  const rest = routeLocale ? parts.slice(1) : parts;

  if (rest[0] === "work" && rest[1] === "d") {
    const exempt = rest[2] === "huawei-exempt";
    const id = exempt ? rest[3] : rest[2];
    if (WORK_DOCUMENT_ID_RE.test(id || "")) {
      const prefix = routeLocale ? "/" + routeLocale : "";
      return `${workOrigin}${prefix}/d/${exempt ? "huawei-exempt/" : ""}${id}`;
    }
  }

  const isTex = rest.join("/") === "work/tex" || rest.join("/") === "workspace/experiments/tex";
  if (isTex) return routeLocale ? `${workOrigin}/${routeLocale}/tex` : `${workOrigin}/tex`;

  return "";
}

// Work 子域请求重写：把 work.qsseda.com 的公开路径映射到主 Worker 内部路由，同时保留必要 method/body/header。\nexport function rewriteWorkSubdomainRequest(request) {
  const url = new URL(request.url);
  const pathname = normalizePath(url.pathname);
  const workOrigin = workOriginForRequest(request);
  const mainOrigin = mainOriginForRequest(request);

  // Backward compatibility for old Simplified Chinese Work links generated with
  // the legacy bilingual locale token "/zh". Keep them on the Work hostname.
  if (pathname === "/zh" || pathname.startsWith("/zh/")) {
    const legacyRest = pathname.slice(3);
    const normalizedPath = "/zh-cn" + (legacyRest || "/tex");
    return {
      request,
      pageNext: "",
      redirect: "",
      canonical: `${workOrigin}${normalizedPath}${url.search}`,
      documentId: "",
      notFound: false
    };
  }

  if (pathname.startsWith("/api/") || pathname === "/auth/handoff" || pathname === "/robots.txt") {
    return { request, pageNext: "", redirect: "", canonical: "" };
  }

  const locale = preferredLocale(request, pathname);
  const routeLocale = localeFromPath(pathname);
  const canonicalPath = `/${locale}/tex`;
  const localizedDocument = parseWorkDocumentPath(pathname);
  if (localizedDocument?.localized) {
    const internalUrl = new URL(url.toString());
    internalUrl.pathname = `/${localizedDocument.locale}/work/tex`;
    internalUrl.searchParams.set("document", localizedDocument.id);
    return {
      request: new Request(internalUrl.toString(), request),
      pageNext: pathname,
      redirect: "",
      canonical: "",
      documentId: localizedDocument.id
    };
  }

  const shortDocument = parseShortWorkDocumentPath(pathname);
  if (shortDocument) {
    const exempt = shortDocument.exempt ? "huawei-exempt/" : "";
    return {
      request,
      pageNext: "",
      redirect: "",
      canonical: `${workOrigin}/${locale}/d/${exempt}${shortDocument.id}${url.search}`,
      documentId: "",
      notFound: false
    };
  }

  const parts = pathname.split("/").filter(Boolean);
  const rest = routeLocale ? parts.slice(1) : parts;
  if (rest[0] === "d") {
    return { request, pageNext: "", redirect: "", canonical: "", documentId: "", notFound: true };
  }

  if (routeLocale && rest.length === 1 && rest[0] === "tex") {
    const internalUrl = new URL(url.toString());
    internalUrl.pathname = `/${routeLocale}/work/tex`;
    return {
      request: new Request(internalUrl.toString(), request),
      pageNext: pathname,
      redirect: "",
      canonical: "",
      documentId: ""
    };
  }

  const routeKey = rest.join("/");
  const canonicalAliases = new Set(["", "tex", "local", "work", "work/local", "work/tex"]);
  if (canonicalAliases.has(routeKey)) {
    return {
      request,
      pageNext: "",
      redirect: "",
      canonical: `${workOrigin}${canonicalPath}${url.search}`,
      documentId: ""
    };
  }

  return { request, pageNext: "", redirect: `${mainOrigin}${url.pathname}${url.search}`, canonical: "", documentId: "" };
}

export function workSessionRedirect(request, next = "/tex") {
  const locale = localeFromPath(next) || preferredLocaleFromRequest(request);
  const safeNext = canonicalWorkPath(next, locale);
  const target = new URL("/work/handoff", mainOriginForRequest(request));
  target.searchParams.set("next", safeNext);
  return redirect(target.toString());
}

// 主站 → Work 会话交接：只有安全的 Work 内部路径可以作为 next；主站 token 通过受控交接建立子域会话。\nexport async function handleMainWorkHandoff(request) {
  if (request.method !== "GET") return new Response("Method not allowed", { status: 405, headers: { "cache-control": "no-store" } });

  const requestUrl = new URL(request.url);
  const requestedNext = safeWorkPath(requestUrl.searchParams.get("next"));
  const locale = localeFromPath(requestedNext) || preferredLocale(request, requestUrl.pathname);
  const next = canonicalWorkPath(requestedNext, locale);
  const gate = await verifyStudioPageSession(request);
  let refreshToken = requestCookie(request, REFRESH_COOKIE);
  const rotatedRefresh = cookieValueFromSetCookies(gate.cookies || [], REFRESH_COOKIE);
  if (rotatedRefresh) refreshToken = rotatedRefresh;

  if (!gate.ok || !gate.accessToken) {
    const returnPath = `/${locale}/work/handoff?next=${encodeURIComponent(next)}`;
    const authUrl = new URL("/continue", authOriginForRequest(request));
    authUrl.searchParams.set("next", returnPath);
    return withStudioSessionCookies(redirect(authUrl.toString()), gate.cookies || []);
  }

  const workOrigin = workOriginForRequest(request);
  const refreshField = refreshToken
    ? `<input type="hidden" name="refresh_token" value="${escapeHtml(refreshToken)}">`
    : "";
  const handoffText = {"zh-cn":"正在进入 AERTEX Work…","zh-tw":"正在進入 AERTEX Work…","ja-jp":"AERTEX Work に移動しています…","ko-kr":"AERTEX Work로 이동 중…","fr-fr":"Ouverture d’AERTEX Work…","es-es":"Entrando en AERTEX Work…","el-gr":"Μετάβαση στο AERTEX Work…","ar-sa":"جارٍ الدخول إلى AERTEX Work…"}[locale] || "Entering AERTEX Work…";
  const page = `<!doctype html><html lang="${locale}" dir="${localeDirection(locale)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AERTEX Work</title>${FAVICON_LINKS}</head><body><main style="min-height:100vh;display:grid;place-items:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"><p>${handoffText}</p></main><form id="handoff" method="post" action="${workOrigin}/auth/handoff"><input type="hidden" name="access_token" value="${escapeHtml(gate.accessToken)}">${refreshField}<input type="hidden" name="next" value="${escapeHtml(next)}"></form><script>document.getElementById("handoff").submit()</script></body></html>`;
  const headers = new Headers({
    "content-type": "text/html;charset=UTF-8",
    "cache-control": "no-store",
    "referrer-policy": "origin",
    "x-content-type-options": "nosniff",
    "content-security-policy": `default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; form-action ${workOrigin}; base-uri 'none'; frame-ancestors 'none'`
  });
  return withStudioSessionCookies(new Response(injectBrandLogoRuntime(page), { status: 200, headers }), gate.cookies || []);
}

function preferredLocale(request, pathname) {
  return sharedLocaleFromPath(pathname) || preferredLocaleFromRequest(request);
}

function localeFromPath(pathname) {
  return sharedLocaleFromPath(pathname);
}

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function safeWorkPath(value) {
  const path = typeof value === "string" ? value.trim() : "";
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\u0000")) return "/tex";
  return path;
}

function canonicalWorkPath(path, locale) {
  const normalizedLocale = normalizeSupportedLocale(locale) || "en-us";
  const candidate = safeWorkPath(path);
  const parts = candidate.split("/").filter(Boolean);
  const candidateLocale = normalizeSupportedLocale(parts[0]);
  const rest = candidateLocale ? parts.slice(1) : parts;
  if (rest[0] === "d") {
    const exempt = rest[1] === "huawei-exempt";
    const id = exempt ? rest[2] : rest[1];
    if (WORK_DOCUMENT_ID_RE.test(id || "")) return `/${normalizedLocale}/d/${exempt ? "huawei-exempt/" : ""}${id}`;
  }
  return `/${normalizedLocale}/tex`;
}

// Work 文档 URL 解析：把公开短链/文档路径还原成 documentId 等结构。解析失败时应返回明确 404，而不是猜测资源。\nfunction parseWorkDocumentPath(pathname) {
  const path = String(pathname || "");
  const locale = sharedLocaleFromPath(path);
  if (!locale) return null;
  const parts = path.split("/").filter(Boolean).slice(1);
  if (parts[0] !== "d") return null;
  const exempt = parts[1] === "huawei-exempt";
  const id = exempt ? parts[2] : parts[1];
  if (!WORK_DOCUMENT_ID_RE.test(id || "") || parts.length !== (exempt ? 3 : 2)) return null;
  return { localized: true, locale, exempt, id };
}

function parseShortWorkDocumentPath(pathname) {
  const match = String(pathname || "").match(/^\/d\/(huawei-exempt\/)?([0-9a-f-]{36})$/i);
  if (!match || !WORK_DOCUMENT_ID_RE.test(match[2])) return null;
  return { exempt: Boolean(match[1]), id: match[2] };
}

export function workDocumentNotFound(request) {
  const { pathname, locale, fullLocale } = getRouteInfo(request);
  const t = TEXT[locale] || TEXT.en;
  let host = "work.qsseda.com";
  let requestedPath = pathname;
  let returnHref = `https://work.qsseda.com/${fullLocale}/tex`;
  try {
    const requestUrl = new URL(request.url);
    host = requestUrl.hostname.toLowerCase();
    requestedPath = requestUrl.pathname || pathname;
    returnHref = `${workOriginForRequest(request)}/${fullLocale}/tex`;
  } catch {}
  return html(notFoundPage(t, buildLinks(locale, pathname, fullLocale), {
    locale: fullLocale,
    host,
    requestedPath,
    returnHref
  }), 404);
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
  return new Response(null, { status: 302, headers: { location, "cache-control": "no-store", "referrer-policy": "no-referrer" } });
}
