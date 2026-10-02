import { verifyStudioPageSession, withStudioSessionCookies } from "./session-gate.js";
import { authOriginForRequest, mainOriginForRequest, awOriginForRequest } from "./domain-family.js";
import { FAVICON_LINKS } from "./favicon.js";
import { injectBrandLogoRuntime } from "./brand-logo.js";
import { localeDirection, localeFromPath as sharedLocaleFromPath, normalizeSupportedLocale, preferredLocaleFromRequest } from "./locale.js";

const REFRESH_COOKIE = "__Host-qsseda-studio-refresh";

export function isMainWatchHandoffPath(pathname) {
  const path = typeof pathname === "string" ? pathname.replace(/\/+$/, "") || "/" : "/";
  if (path === "/aw/handoff") return true;
  const locale = sharedLocaleFromPath(path);
  if (!locale) return false;
  const parts = path.split("/").filter(Boolean);
  return parts.length === 3 && parts[1] === "aw" && parts[2] === "handoff";
}

export function watchSessionRedirect(request, next = "/") {
  const locale = sharedLocaleFromPath(next) || preferredLocaleFromRequest(request);
  const safeNext = canonicalWatchPath(next, locale);
  const target = new URL("/aw/handoff", mainOriginForRequest(request));
  target.searchParams.set("next", safeNext);
  return redirect(target.toString());
}

export async function handleMainWatchHandoff(request) {
  if (request.method !== "GET") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" }
    });
  }

  const requestUrl = new URL(request.url);
  const requestedNext = safeWatchPath(requestUrl.searchParams.get("next"));
  const locale = sharedLocaleFromPath(requestedNext) || sharedLocaleFromPath(requestUrl.pathname) || preferredLocaleFromRequest(request);
  const next = canonicalWatchPath(requestedNext, locale);
  const gate = await verifyStudioPageSession(request);

  let refreshToken = requestCookie(request, REFRESH_COOKIE);
  const rotatedRefresh = cookieValueFromSetCookies(gate.cookies || [], REFRESH_COOKIE);
  if (rotatedRefresh) refreshToken = rotatedRefresh;

  if (!gate.ok || !gate.accessToken) {
    const returnPath = "/" + locale + "/aw/handoff?next=" + encodeURIComponent(next);
    const authUrl = new URL("/continue", authOriginForRequest(request));
    authUrl.searchParams.set("next", returnPath);
    return withStudioSessionCookies(redirect(authUrl.toString()), gate.cookies || []);
  }

  const watchOrigin = awOriginForRequest(request);
  const refreshField = refreshToken
    ? '<input type="hidden" name="refresh_token" value="' + escapeHtml(refreshToken) + '">'
    : "";
  const handoffText = {
    "zh-cn":"正在进入 AERTEX Watch…",
    "zh-tw":"正在進入 AERTEX Watch…",
    "ja-jp":"AERTEX Watch に移動しています…",
    "ko-kr":"AERTEX Watch로 이동 중…",
    "fr-fr":"Ouverture d’AERTEX Watch…",
    "es-es":"Entrando en AERTEX Watch…",
    "el-gr":"Μετάβαση στο AERTEX Watch…",
    "ar-sa":"جارٍ الدخول إلى AERTEX Watch…"
  }[locale] || "Entering AERTEX Watch…";

  const page = '<!doctype html><html lang="' + locale + '" dir="' + localeDirection(locale) + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AERTEX Watch</title>' + FAVICON_LINKS + '</head><body><main style="min-height:100vh;display:grid;place-items:center;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif"><p>' + handoffText + '</p></main><form id="handoff" method="post" action="' + watchOrigin + '/auth/handoff"><input type="hidden" name="access_token" value="' + escapeHtml(gate.accessToken) + '">' + refreshField + '<input type="hidden" name="next" value="' + escapeHtml(next) + '"></form><script>document.getElementById("handoff").submit()</script></body></html>';

  const headers = new Headers({
    "content-type": "text/html;charset=UTF-8",
    "cache-control": "no-store",
    "referrer-policy": "origin",
    "x-content-type-options": "nosniff",
    "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; form-action " + watchOrigin + "; base-uri 'none'; frame-ancestors 'none'"
  });

  return withStudioSessionCookies(new Response(injectBrandLogoRuntime(page), { status: 200, headers }), gate.cookies || []);
}

function safeWatchPath(value) {
  const path = typeof value === "string" ? value.trim() : "";
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\u0000")) return "/";
  return path;
}

function canonicalWatchPath(path, locale) {
  const normalizedLocale = normalizeSupportedLocale(locale) || "en-us";
  const candidate = safeWatchPath(path);
  const parts = candidate.split("/").filter(Boolean);
  const candidateLocale = normalizeSupportedLocale(parts[0]);
  return candidateLocale ? "/" + candidateLocale : "/" + normalizedLocale;
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
  return String(value || "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[character]));
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
