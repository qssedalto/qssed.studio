import { verifyStudioPageSession, withStudioSessionCookies } from "./session-gate.js";
import { authOriginForRequest, isServiceHost, mainOriginForRequest, workOriginForRequest } from "./domain-family.js";

const REFRESH_COOKIE = "__Host-qsseda-studio-refresh";

export function isWorkSubdomainRequest(request) {
  try { return isServiceHost(new URL(request.url).hostname, "work"); }
  catch { return false; }
}

export function isMainWorkHandoffPath(pathname) {
  return pathname === "/work/handoff" || pathname === "/zh-cn/work/handoff" || pathname === "/en/work/handoff";
}

export function mainWorkRedirect(request, pathname) {
  const clean = normalizePath(pathname);
  const workOrigin = workOriginForRequest(request);

  if (clean === "/zh-cn/work/tex" || clean === "/zh-cn/workspace/experiments/tex") {
    return `${workOrigin}/zh-cn/tex`;
  }
  if (clean === "/en/work/tex" || clean === "/en/workspace/experiments/tex") {
    return `${workOrigin}/en/tex`;
  }
  if (clean === "/work/tex" || clean === "/workspace/experiments/tex") {
    return `${workOrigin}/tex`;
  }

  return "";
}

export function rewriteWorkSubdomainRequest(request) {
  const url = new URL(request.url);
  const pathname = normalizePath(url.pathname);
  const workOrigin = workOriginForRequest(request);
  const mainOrigin = mainOriginForRequest(request);

  if (pathname.startsWith("/api/") || pathname === "/auth/handoff" || pathname === "/robots.txt") {
    return { request, pageNext: "", redirect: "", canonical: "" };
  }

  const locale = preferredLocale(request, pathname);
  const canonicalPath = `/${locale}/tex`;

  if (pathname === "/zh-cn/tex" || pathname === "/en/tex") {
    const internalUrl = new URL(url.toString());
    internalUrl.pathname = pathname.startsWith("/en/") ? "/en/work/tex" : "/zh-cn/work/tex";
    return {
      request: new Request(internalUrl.toString(), request),
      pageNext: pathname,
      redirect: "",
      canonical: ""
    };
  }

  if ([
    "/", "/tex", "/local",
    "/zh-cn", "/en",
    "/zh-cn/local", "/en/local",
    "/zh-cn/work", "/en/work",
    "/zh-cn/work/local", "/en/work/local",
    "/zh-cn/work/tex", "/en/work/tex"
  ].includes(pathname)) {
    return {
      request,
      pageNext: "",
      redirect: "",
      canonical: `${workOrigin}${canonicalPath}${url.search}`
    };
  }

  return { request, pageNext: "", redirect: `${mainOrigin}${url.pathname}${url.search}`, canonical: "" };
}

export function workSessionRedirect(request, next = "/tex") {
  const safeNext = canonicalWorkPath(next, localeFromPath(next));
  const target = new URL("/work/handoff", mainOriginForRequest(request));
  target.searchParams.set("next", safeNext);
  return redirect(target.toString());
}

export async function handleMainWorkHandoff(request) {
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
  const page = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>QssedA Work</title></head><body><main style="min-height:100vh;display:grid;place-items:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"><p>正在进入 QssedA Work…</p></main><form id="handoff" method="post" action="${workOrigin}/auth/handoff"><input type="hidden" name="access_token" value="${escapeHtml(gate.accessToken)}">${refreshField}<input type="hidden" name="next" value="${escapeHtml(next)}"></form><script>document.getElementById("handoff").submit()</script></body></html>`;
  const headers = new Headers({
    "content-type": "text/html;charset=UTF-8",
    "cache-control": "no-store",
    "referrer-policy": "origin",
    "x-content-type-options": "nosniff",
    "content-security-policy": `default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; form-action ${workOrigin}; base-uri 'none'; frame-ancestors 'none'`
  });
  return withStudioSessionCookies(new Response(page, { status: 200, headers }), gate.cookies || []);
}

function preferredLocale(request, pathname) {
  if (pathname.startsWith("/en/") || pathname === "/en") return "en";
  if (pathname.startsWith("/zh-cn/") || pathname === "/zh-cn") return "zh-cn";
  const language = (request.headers.get("Accept-Language") || "").toLowerCase();
  return language.includes("zh") ? "zh-cn" : "en";
}

function localeFromPath(pathname) {
  const path = typeof pathname === "string" ? pathname.trim() : "";
  if (path === "/en" || path.startsWith("/en/")) return "en";
  if (path === "/zh-cn" || path.startsWith("/zh-cn/")) return "zh-cn";
  return "";
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

function canonicalWorkPath(_path, locale) {
  const normalizedLocale = locale === "en" ? "en" : "zh-cn";
  return `/${normalizedLocale}/tex`;
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
