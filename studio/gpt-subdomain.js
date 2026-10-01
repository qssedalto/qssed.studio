import { verifyStudioPageSession, withStudioSessionCookies } from "./session-gate.js";
import { authOriginForRequest, gptOriginForRequest, mainOriginForRequest } from "./domain-family.js";
import { FAVICON_LINKS } from "./favicon.js";
import { injectBrandLogoRuntime } from "./brand-logo.js";
import { localeFromPath as sharedLocaleFromPath, normalizeSupportedLocale, preferredLocaleFromRequest, SUPPORTED_LOCALES } from "./locale.js";

const REFRESH_COOKIE = "__Host-qsseda-studio-refresh";

export function isMainGptHandoffPath(pathname) {
  return pathname === "/gpt/handoff" || pathname === "/zh-cn/gpt/handoff" || pathname === "/en/gpt/handoff";
}

export function gptSessionRedirect(request, next = "/zh-cn") {
  const safeNext = canonicalGptPath(next, localeFromPath(next));
  const target = new URL("/gpt/handoff", mainOriginForRequest(request));
  target.searchParams.set("next", safeNext);
  return redirect(target.toString());
}

export async function handleMainGptHandoff(request) {
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
  const page = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AERTEX Intelligence</title>${FAVICON_LINKS}</head><body><main style="min-height:100vh;display:grid;place-items:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"><p>正在进入 AERTEX Intelligence…</p></main><form id="handoff" method="post" action="${gptOrigin}/auth/handoff"><input type="hidden" name="access_token" value="${escapeHtml(gate.accessToken)}">${refreshField}<input type="hidden" name="next" value="${escapeHtml(next)}"></form><script>document.getElementById("handoff").submit()</script></body></html>`;

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

function safeGptPath(value) {
  const path = typeof value === "string" ? value.trim() : "";
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\u0000")) return "/zh-cn";
  return path;
}

function canonicalGptPath(path, locale) {
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
