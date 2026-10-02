import { SUPABASE_URL } from "./config.js";
import { localeContentLanguage, localeFromPath, localePrefix, preferredLocaleFromRequest, SUPPORTED_LOCALES } from "./locale.js";
import { injectBrandLogoRuntime } from "./brand-logo.js";

const SUPABASE_ORIGIN = new URL(SUPABASE_URL).origin;
const SUPABASE_WS_ORIGIN = SUPABASE_ORIGIN.replace(/^https:/, "wss:");

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
    dashboard: prefix,
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

export function html(content, status = 200, options = {}) {
  return new Response(injectBrandLogoRuntime(content), {
    status,
    headers: htmlSecurityHeaders(options)
  });
}

export function json(data, status = 200) {
  const headers = securityHeaders("application/json;charset=UTF-8");
  headers.set("cache-control", "no-store");
  return new Response(JSON.stringify(data), {
    status,
    headers
  });
}
