import { verifyStudioPageSession, withStudioSessionCookies } from "./session-gate.js";
import { adminOriginForRequest, authOriginForRequest, mainOriginForRequest } from "./domain-family.js";

const REFRESH_COOKIE = "__Host-qsseda-studio-refresh";
const ADMIN_PATHS = new Set(["/", "/overview", "/users", "/roles", "/logs", "/system", "/access", "/intelligence"]);

export function isMainAdminHandoffPath(pathname) {
  return pathname === "/control/handoff" || pathname === "/zh-cn/control/handoff" || pathname === "/en/control/handoff";
}

export function adminSessionRedirect(request, next = "/") {
  const safeNext = canonicalAdminPath(next);
  const target = new URL("/control/handoff", mainOriginForRequest(request));
  target.searchParams.set("next", safeNext);
  return redirect(target.toString());
}

export async function handleMainAdminHandoff(request) {
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

export function canonicalAdminPath(value) {
  const path = typeof value === "string" ? value.trim() : "";
  if (ADMIN_PATHS.has(path)) return path;
  return "/";
}

function preferredLocale(request, pathname) {
  if (pathname.startsWith("/en/") || pathname === "/en") return "en";
  if (pathname.startsWith("/zh-cn/") || pathname === "/zh-cn") return "zh-cn";
  const language = (request.headers.get("Accept-Language") || "").toLowerCase();
  return language.includes("zh") ? "zh-cn" : "en";
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
