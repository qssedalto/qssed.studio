import { SUPABASE_URL } from "./config.js";
import { localeContentLanguage, localeFromPath, localePrefix, preferredLocaleFromRequest, SUPPORTED_LOCALES } from "./locale.js";
import { injectBrandLogoRuntime } from "./brand-logo.js";

// routing.js 是主站/共享页面的 HTTP 外壳：安全响应头、locale 路由和统一 HTML/JSON Response 都在这里。
// Watch 私有 Worker大多自己做 API 响应，但登录 handoff 与 setup 页面仍会经过这些共享能力。
const SUPABASE_ORIGIN = new URL(SUPABASE_URL).origin;
const SUPABASE_WS_ORIGIN = SUPABASE_ORIGIN.replace(/^https:/, "wss:");

// 默认拒绝摄像头、麦克风、地理位置等高权限能力；需要额外能力的页面必须显式 opt-in，而不是全站开放。
function securityHeaders(contentType) {
  const headers = new Headers();
  headers.set("content-type", contentType);
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-frame-options", "DENY");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=(), browsing-topics=()");
  headers.set("strict-transport-security", "max-age=31536000");
  headers.set("x-dns-prefetch-control", "off");
  headers.set("x-permitted-cross-domain-policies", "none");
  headers.set("cross-origin-resource-policy", "same-origin");
  return headers;
}

// allowLoopback 只给确实需要本机桥接的页面；普通页面（包括 Watch setup/handoff）默认禁止本地网络连接。
function htmlSecurityHeaders(options = {}) {
  const headers = securityHeaders("text/html;charset=UTF-8");
  const allowLoopback = options?.allowLoopback === true;
  const connectSources = allowLoopback
    ? `'self' ${SUPABASE_ORIGIN} ${SUPABASE_WS_ORIGIN} http://127.0.0.1:32145 http://localhost:32145`
    : `'self' ${SUPABASE_ORIGIN} ${SUPABASE_WS_ORIGIN}`;
  const localNetworkPolicy = allowLoopback
    ? "local-network-access=(self), local-network=(self), loopback-network=(self)"
    : "local-network-access=(), local-network=(), loopback-network=()";
  const basePermissionsPolicy = headers.get("permissions-policy") || "";
  headers.set("permissions-policy", `${basePermissionsPolicy}, ${localNetworkPolicy}`);
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    `connect-src ${connectSources}`,
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'none'",
    allowLoopback ? "frame-src blob:" : "frame-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "manifest-src 'self'",
    "worker-src 'self' blob:"
  ];
  if (!allowLoopback) directives.push("upgrade-insecure-requests");
  headers.set("content-security-policy", directives.join("; "));
  headers.set(
    "x-robots-tag",
    options?.indexable === true
      ? "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
      : "noindex, nofollow, noarchive, nosnippet, noimageindex"
  );
  headers.set("cache-control", "no-store, no-cache, must-revalidate, max-age=0");
  headers.set("pragma", "no-cache");
  headers.set("expires", "0");
  return headers;
}

/// 把“完整地区 locale”与旧双语 renderer 的 zh/en 内容语言拆开。
/// 这样 /zh-tw、/ja-jp 等仍能保持正确 URL/方向，即使部分旧页面只维护中文/英文正文。
export function getRouteInfo(request) {
  const url = new URL(request.url);
  const ip = request.headers.get("CF-Connecting-IP") || "Unknown";
  const country = request.cf?.country || "Unknown";
  const region = request.cf?.region || request.cf?.regionCode || "";
  const city = request.cf?.city || "";
  const pathParts = url.pathname.split("/").filter(Boolean);
  const routeLocale = localeFromPath(url.pathname);
  let pathname = url.pathname;
  const fullLocale = routeLocale || preferredLocaleFromRequest(request);

  if (routeLocale) pathname = "/" + pathParts.slice(1).join("/");
  if (!pathname || pathname === "//") pathname = "/";

  // Legacy renderers are still bilingual. Keep their content-language contract
  // while exposing the complete regional locale to routing and language controls.
  const locale = localeContentLanguage(fullLocale);

  return {
    pathname,
    locale,
    fullLocale,
    ipInfo: { ip, country, region, city, locale: fullLocale }
  };
}

export function buildLinks(locale, pathname, fullLocale = "") {
  const activeLocale = fullLocale || (locale === "zh" ? "zh-cn" : "en-us");
  const prefix = localePrefix(activeLocale);
  const currentPath = pathname === "/" ? "" : pathname;
  const localeLinks = Object.fromEntries(SUPPORTED_LOCALES.map(code => [code, `${localePrefix(code)}${currentPath}`]));

  return {
    login: `${prefix}/login`,
    signUp: `${prefix}/sign-up`,
    menu: prefix,
    dashboard: `${prefix}/dashboard`,
    zhCurrent: localeLinks["zh-cn"],
    enCurrent: localeLinks["en-us"],
    localeLinks,
    activeLocale
  };
}

export function localizedRedirect(request, locale, pathname) {
  const url = new URL(request.url);
  const code = locale === "zh" ? "zh-cn" : locale === "en" ? "en-us" : locale;
  url.pathname = `${localePrefix(code)}${pathname}`;
  return Response.redirect(url.toString(), 302);
}

/// 统一 HTML Response：品牌 runtime + CSP/permissions/no-store 一次完成，减少页面模板漏安全头。
export function html(content, status = 200, options = {}) {
  return new Response(injectBrandLogoRuntime(content), {
    status,
    headers: htmlSecurityHeaders(options)
  });
}

/// JSON API 默认继承相同的基础硬化头，但不带 HTML 专用 CSP。
export function json(data, status = 200) {
  const headers = securityHeaders("application/json;charset=UTF-8");
  headers.set("cache-control", "no-store");
  return new Response(JSON.stringify(data), {
    status,
    headers
  });
}
