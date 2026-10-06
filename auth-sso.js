// 初学者导读：SSO 登录/回跳页面与流程协调；负责在主站和产品域之间安全传递经过验证的会话状态。
import { SUPABASE_URL, SUPABASE_KEY } from "./studio/config.js";
import { QSS_DOMAIN_ROOTS, authOrigins, rootDomainForHost, serviceOrigin } from "./studio/domain-family.js";
import { FAVICON_LINKS } from "./studio/favicon.js";
import { injectBrandLogoRuntime } from "./studio/brand-logo.js";

const ACCESS_COOKIE = "__Host-qsseda-access";
const REFRESH_COOKIE = "__Host-qsseda-refresh";
const ACCESS_MAX_AGE = 60 * 60;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;
const SSO_PATHS = new Set(["/sso/start", "/sso/import", "/sso/complete"]);

export function isAuthSsoPath(pathname) {
  return SSO_PATHS.has(normalizePath(pathname));
}

export async function handleAuthSsoRequest(request) {
  const url = new URL(request.url);
  const pathname = normalizePath(url.pathname);

  if (pathname === "/sso/start") {
    if (request.method !== "GET") return text("Method not allowed", 405);
    return startSync(request);
  }

  if (pathname === "/sso/import") {
    if (request.method !== "POST") return text("Method not allowed", 405);
    return importSync(request);
  }

  if (pathname === "/sso/complete") {
    if (request.method !== "GET") return text("Method not allowed", 405);
    const next = safeNextPath(url.searchParams.get("next"));
    const target = new URL("/continue", url.origin);
    if (next) target.searchParams.set("next", next);
    return redirect(target.toString());
  }

  return text("Not found", 404);
}

async function startSync(request) {
  const url = new URL(request.url);
  const root = rootDomainForHost(url.hostname);
  if (!root || url.hostname !== `auth.${root}`) return text("Invalid Auth host", 400);

  const session = await currentSession(request);
  const next = safeNextPath(url.searchParams.get("next"));
  if (!session) {
    const login = new URL("/login", url.origin);
    if (next) login.searchParams.set("next", next);
    return redirect(login.toString());
  }

  // Keep the browser on the current domain family. Cross-root propagation made
  // one sign-in visibly bounce through multiple Auth hosts and is not required
  // for the active application handoff. Legacy /sso/import stays available for
  // explicit migrations, but ordinary sign-in finishes locally.
  return finishUrl(url.origin, next);
}

async function importSync(request) {
  const url = new URL(request.url);
  if (!trustedSyncSource(request)) return text("Invalid SSO origin", 403);

  let form;
  try { form = await request.formData(); }
  catch { return text("Invalid SSO request", 400); }

  const accessToken = cleanToken(form.get("access_token"));
  const refreshToken = cleanToken(form.get("refresh_token"));
  const remaining = parseRoots(form.get("remaining"));
  const returnTo = safeAuthReturn(form.get("return_to"));

  if (!accessToken || !refreshToken || !returnTo) return text("Invalid SSO payload", 400);

  const user = await fetchUser(accessToken);
  if (!user) return text("Session is invalid or expired", 401);

  const profile = await fetchProfile(accessToken, user.id);
  if (profile?.status !== "active") return text("Account is not active", 403);

  const currentRoot = rootDomainForHost(url.hostname);
  const pending = remaining.filter(root => root !== currentRoot);
  let response;

  if (pending.length) {
    response = syncForm(
      serviceOrigin(pending[0], "auth"),
      accessToken,
      refreshToken,
      pending.slice(1),
      returnTo
    );
  } else {
    response = redirect(returnTo);
  }

  return withCookies(response, sessionCookies(accessToken, refreshToken));
}

async function currentSession(request) {
  const cookies = parseCookies(request.headers.get("Cookie") || "");
  const accessToken = cookies[ACCESS_COOKIE] || "";
  const refreshToken = cookies[REFRESH_COOKIE] || "";
  if (!accessToken || !refreshToken) return null;
  const user = await fetchUser(accessToken);
  if (!user) return null;
  const profile = await fetchProfile(accessToken, user.id);
  if (profile?.status !== "active") return null;
  return { accessToken, refreshToken, user };
}

function syncForm(targetOrigin, accessToken, refreshToken, remaining, returnTo) {
  const action = `${targetOrigin}/sso/import`;
  const body = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AERTEX ID</title>${FAVICON_LINKS}</head><body><main style="min-height:100vh;display:grid;place-items:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"><p>正在同步 AERTEX ID 登录状态…</p></main><form id="sso" method="post" action="${escapeHtml(action)}"><input type="hidden" name="access_token" value="${escapeHtml(accessToken)}"><input type="hidden" name="refresh_token" value="${escapeHtml(refreshToken)}"><input type="hidden" name="remaining" value="${escapeHtml(remaining.join(","))}"><input type="hidden" name="return_to" value="${escapeHtml(returnTo)}"></form><script>document.getElementById("sso").submit()</script></body></html>`;
  return new Response(injectBrandLogoRuntime(body), {
    status: 200,
    headers: {
      "content-type": "text/html;charset=UTF-8",
      "cache-control": "no-store",
      "referrer-policy": "origin",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
      "content-security-policy": `default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; form-action ${targetOrigin}; base-uri 'none'; frame-ancestors 'none'`
    }
  });
}

function trustedSyncSource(request) {
  const origin = request.headers.get("Origin") || "";
  if (authOrigins().includes(origin)) return true;
  const referer = request.headers.get("Referer") || "";
  try { return authOrigins().includes(new URL(referer).origin); }
  catch { return false; }
}

function safeAuthReturn(value) {
  const textValue = typeof value === "string" ? value.trim().slice(0, 1000) : "";
  if (!textValue) return "";
  try {
    const url = new URL(textValue);
    if (!authOrigins().includes(url.origin)) return "";
    if (normalizePath(url.pathname) !== "/sso/complete") return "";
    return url.toString();
  } catch {
    return "";
  }
}

function safeNextPath(value) {
  const path = typeof value === "string" ? value.trim().slice(0, 500) : "";
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\u0000")) return "";
  return path;
}

function parseRoots(value) {
  const raw = typeof value === "string" ? value : "";
  const allowed = new Set(QSS_DOMAIN_ROOTS);
  return [...new Set(raw.split(",").map(item => item.trim()).filter(item => allowed.has(item)))];
}

async function fetchUser(accessToken) {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}` }
    });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

async function fetchProfile(accessToken, userId) {
  try {
    const url = new URL(`${SUPABASE_URL}/rest/v1/profiles`);
    url.searchParams.set("select", "status");
    url.searchParams.set("id", `eq.${userId}`);
    url.searchParams.set("limit", "1");
    const response = await fetch(url.toString(), {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}` }
    });
    if (!response.ok) return null;
    const rows = await response.json();
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  } catch {
    return null;
  }
}

function sessionCookies(accessToken, refreshToken) {
  return [
    cookie(ACCESS_COOKIE, accessToken, ACCESS_MAX_AGE),
    cookie(REFRESH_COOKIE, refreshToken, REFRESH_MAX_AGE)
  ];
}

function withCookies(response, cookies) {
  const headers = new Headers(response.headers);
  for (const value of cookies) headers.append("set-cookie", value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function cookie(name, value, maxAge) {
  return `${name}=${encodeURIComponent(value || "")}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

function parseCookies(header) {
  const result = {};
  for (const part of String(header || "").split(";")) {
    const index = part.indexOf("=");
    if (index <= 0) continue;
    const key = part.slice(0, index).trim();
    const raw = part.slice(index + 1).trim();
    try { result[key] = decodeURIComponent(raw); }
    catch { result[key] = raw; }
  }
  return result;
}

function cleanToken(value) {
  if (typeof value !== "string") return "";
  const token = value.trim();
  if (!token || token.length > 12000 || /[\u0000-\u001f\u007f\s]/.test(token)) return "";
  return token;
}

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function finishUrl(origin, next) {
  const url = new URL("/sso/complete", origin);
  if (next) url.searchParams.set("next", next);
  return redirect(url.toString());
}

function redirect(location) {
  return new Response(null, { status: 302, headers: { location, "cache-control": "no-store", "referrer-policy": "no-referrer" } });
}

function text(body, status) {
  return new Response(body, { status, headers: { "content-type": "text/plain;charset=UTF-8", "cache-control": "no-store", "x-content-type-options": "nosniff" } });
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[character]));
}
