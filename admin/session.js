/**
 * 【初学者导读】
 * 文件：admin/session.js
 * AERTEX Admin 后端/基础模块：负责管理员会话、内容管理、国际化或管理 API。
 * 阅读顺序：从最外层入口开始，先看域名/path/method 判断，再看登录或令牌校验，最后追到具体 handler/模块；不要从某个深层函数孤立地理解整条请求链。
 * 请求链思维：浏览器/客户端 → Worker → 会话/安全门禁 → 路由 → API/页面 → 数据源 → Response。
 * 修改注意：这是认证/会话敏感区域；redirect、Cookie、PKCE/state、来源校验和权限判断必须保持最小权限原则。
 * 调试方法：先记录“实际 host + pathname + method + 是否有会话”，通常可以快速判断请求为什么走错分支。
 */
import { SUPABASE_URL, SUPABASE_KEY } from "../studio/config.js";
import { mainOriginForRequest, rootDomainForHost } from "../studio/domain-family.js";
import { adminCanonicalPath as localizedAdminPath, adminLocaleFromPath } from "./i18n.js";

const ACCESS_COOKIE = "__Host-aertex-admin-access";
const ACCESS_MAX_AGE = 55 * 60;

// Admin 会话交接：从主站/认证站建立 admin 子域会话前再次验证用户确实拥有管理员权限。普通登录态不能直接转成管理员会话。
export async function handleAdminHandoff(request) {
  if (request.method !== "POST") return text("Not found.", 404);

  const requestUrl = new URL(request.url);
  const root = rootDomainForHost(requestUrl.hostname) || "qsseda.com";
  const expectedOrigin = mainOriginForRequest(request);
  const origin = request.headers.get("Origin") || "";
  const referer = request.headers.get("Referer") || "";
  let refererOrigin = "";
  try { refererOrigin = referer ? new URL(referer).origin : ""; } catch {}
  if (origin !== expectedOrigin && refererOrigin !== expectedOrigin) return text("Not found.", 404);

  let form;
  try { form = await request.formData(); }
  catch { return text("Not found.", 404); }

  const accessToken = cleanToken(form.get("access_token"));
  const next = canonicalAdminPath(form.get("next"));
  if (!accessToken) return text("Not found.", 404);

  const verified = await verifyAccessToken(accessToken);
  if (!verified.ok) return text("Not found.", 404);

  const adminSession = await verifyAdminDatabaseSession(accessToken);
  if (!adminSession) return text("Not found.", 404);

  const maxAge = accessCookieAge(accessToken);
  const headers = new Headers({
    location: next,
    "cache-control": "private, no-store",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    "x-robots-tag": "noindex, nofollow, noarchive, nosnippet"
  });
  headers.append("set-cookie", cookie(ACCESS_COOKIE, accessToken, maxAge));
  headers.append("set-cookie", `__Host-aertex-admin-root=${encodeURIComponent(root)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`);
  return new Response(null, { status: 302, headers });
}

// Admin 页面会话验证：同时检查 access token 有效和数据库管理员授权；仅 token 有效但无 admin role 仍视为无权限。
export async function verifyAdminSession(request) {
  const cookies = parseCookies(request.headers.get("Cookie") || "");
  const accessToken = cookies[ACCESS_COOKIE] || "";
  if (!accessToken) return { ok: false, accessToken: "", user: null, cookies: [] };

  const verified = await verifyAccessToken(accessToken);
  if (!verified.ok) return { ok: false, accessToken: "", user: null, cookies: clearAdminSessionCookies() };

  const adminSession = await verifyAdminDatabaseSession(accessToken);
  if (!adminSession) return { ok: false, accessToken: "", user: null, cookies: clearAdminSessionCookies() };

  return { ok: true, accessToken, user: verified.user, cookies: [] };
}

export async function verifyAdminApiSession(request) {
  return verifyAdminSession(request);
}

export function adminSessionLogoutResponse() {
  return withAdminSessionCookies(
    new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: adminHeaders("application/json;charset=UTF-8")
    }),
    clearAdminSessionCookies()
  );
}

export function withAdminSessionCookies(response, cookies = []) {
  if (!cookies.length) return response;
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  for (const value of cookies) headers.append("set-cookie", value);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export function clearAdminSessionCookies() {
  return [
    cookie(ACCESS_COOKIE, "", 0),
    "__Host-aertex-admin-root=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax"
  ];
}

export function canonicalAdminPath(value) {
  const path = typeof value === "string" ? value.trim().slice(0, 300) : "";
  const parsed = adminLocaleFromPath(path);
  if (!parsed.path) return "/";
  if (parsed.locale) return localizedAdminPath(parsed.locale, parsed.path);
  return parsed.path;
}

export function adminHeaders(contentType = "text/plain;charset=UTF-8") {
  return new Headers({
    "content-type": contentType,
    "cache-control": "private, no-store",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "x-robots-tag": "noindex, nofollow, noarchive, nosnippet",
    "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  });
}

async function verifyAccessToken(accessToken) {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}` }
    });
    if (!response.ok) return { ok: false, user: null };
    return { ok: true, user: await response.json() };
  } catch {
    return { ok: false, user: null };
  }
}

async function verifyAdminDatabaseSession(accessToken) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/verify_admin_session`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${accessToken}`,
        "content-type": "application/json;charset=UTF-8",
        Accept: "application/json"
      },
      body: "{}"
    });
    if (!response.ok) return false;
    return (await response.json()) === true;
  } catch {
    return false;
  }
}

function accessCookieAge(accessToken) {
  try {
    const payload = accessToken.split(".")[1] || "";
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
    const json = JSON.parse(atob(padded));
    const remaining = Math.floor(Number(json?.exp || 0) - Date.now() / 1000);
    if (Number.isFinite(remaining) && remaining > 30) return Math.max(30, Math.min(remaining, ACCESS_MAX_AGE));
  } catch {}
  return ACCESS_MAX_AGE;
}

function cleanToken(value) {
  const text = typeof value === "string" ? value.trim() : "";
  return text && text.length <= 16000 ? text : "";
}

function parseCookies(header) {
  const result = {};
  for (const part of String(header || "").split(";")) {
    const index = part.indexOf("=");
    if (index <= 0) continue;
    result[part.slice(0, index).trim()] = part.slice(index + 1).trim();
  }
  return result;
}

function cookie(name, value, maxAge) {
  return `${name}=${value}; Path=/; Max-Age=${Math.max(0, Math.trunc(maxAge || 0))}; HttpOnly; Secure; SameSite=Strict`;
}

function text(body, status) {
  return new Response(body, { status, headers: adminHeaders() });
}
