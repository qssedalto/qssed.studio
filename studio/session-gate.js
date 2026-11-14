import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { html, json } from "./routing.js";
import { baseHead, supabaseScript } from "./ui-page.js";
import { workerLog } from "./server-runtime.js";
import { authOriginForRequest, isServiceHost, rootDomainForHost } from "./domain-family.js";
import { readJsonBounded } from "./request-json-bounded.js";
import { refreshBrowserAuthSession } from "../auth-browser-refresh.js";

// AERTEX 的浏览器会话分成两层：
// 1. __Host-* access/refresh Cookie 只属于当前 host，防止一个子域伪造另一个子域的会话；
// 2. __Secure-qsseda-account-id 是整个根域共享的“当前账号标记”，用于确认独立产品子域上的 host 会话仍属于同一账号。
//
// AERTEX Watch 的 aw.* 和 Work/GPT/Cash 一样属于独立产品 host，因此也必须同时满足这两层身份检查。
const ACCESS_COOKIE = "__Host-qsseda-studio-access";
const REFRESH_COOKIE = "__Host-qsseda-studio-refresh";
const ACCOUNT_COOKIE = "__Secure-qsseda-account-id";
const SSO_COOKIE = "__Host-qsseda-studio-sso";
const ACCOUNT_SIGNED_OUT = "signed-out";
const ACCESS_MAX_AGE = 60 * 60;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

/// 生成服务端会话 Cookie。
/// access/refresh 使用 __Host- 前缀（不能设置 Domain），account marker 则显式共享到当前 qsseda 根域。
export function studioSessionCookies(accessToken, refreshToken, expiresIn = ACCESS_MAX_AGE, requestOrHost = "qsseda.com") {
  const accessAge = Math.max(60, Math.min(Number(expiresIn) || ACCESS_MAX_AGE, ACCESS_MAX_AGE));
  const cookieDomain = sessionRoot(requestOrHost);
  const cookies = [];
  if (accessToken) cookies.push(cookie(ACCESS_COOKIE, accessToken, accessAge));
  if (refreshToken) {
    cookies.push(cookie(REFRESH_COOKIE, refreshToken, REFRESH_MAX_AGE));
    cookies.push(cookie(SSO_COOKIE, "", 0));
  } else {
    // Only Auth keeps a rotating refresh token. Remove any copied legacy token.
    cookies.push(cookie(REFRESH_COOKIE, "", 0));
    cookies.push(cookie(SSO_COOKIE, "1", REFRESH_MAX_AGE));
  }
  const userId = jwtSubject(accessToken);
  if (userId) cookies.push(accountCookie(userId, REFRESH_MAX_AGE, cookieDomain));
  return cookies;
}

export function clearStudioSessionCookies() {
  return [cookie(ACCESS_COOKIE, "", 0), cookie(REFRESH_COOKIE, "", 0), cookie(SSO_COOKIE, "", 0)];
}

function globalLogoutCookies(requestOrHost) {
  return [...clearStudioSessionCookies(), accountCookie(ACCOUNT_SIGNED_OUT, REFRESH_MAX_AGE, sessionRoot(requestOrHost))];
}

export function withStudioSessionCookies(response, cookies = []) {
  if (!cookies.length) return response;
  const headers = new Headers(response.headers);
  for (const value of cookies) headers.append("set-cookie", value);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

/// 验证页面/API 共用的 AERTEX 会话。
/// 对独立产品子域（Work / Intelligence / Cash / Watch）除了验证 JWT，还要求域级 account marker 与 JWT subject 一致。
// 主站与独立子域分别维护主机级会话。这里同时考虑 Cookie、账号标记以及必要时的刷新，不能仅凭跨域标记授权。
export async function verifyStudioPageSession(request) {
  const url = new URL(request.url);
  const hostname = url.hostname.toLowerCase();
  const workHost = isServiceHost(hostname, "work");
  const gptHost = isServiceHost(hostname, "gpt");
  const cashHost = isServiceHost(hostname, "cash");
  const watchHost = isServiceHost(hostname, "aw");
  const isolatedAppHost = workHost || gptHost || cashHost || watchHost;
  const cookies = parseCookies(request.headers.get("Cookie") || "");
  const accessToken = cookies[ACCESS_COOKIE] || "";
  const ssoManaged = cookies[SSO_COOKIE] === "1";
  const refreshToken = ssoManaged ? "" : (cookies[REFRESH_COOKIE] || "");
  const accountMarker = String(cookies[ACCOUNT_COOKIE] || "").trim();
  const accountId = isUuid(accountMarker) ? accountMarker : "";
  const markerBlocksSession = Boolean(accountMarker && !accountId);

  const identityMatches = userId => {
    if (!isUuid(userId) || markerBlocksSession) return false;
    if (accountId && accountId !== userId) return false;
    // 独立产品 host 不能只信任自己本地残留的 __Host 会话。
    // 用户可能已经在同一 qsseda 根域的另一个产品切换账号；account marker 是防止旧会话“复活”的第二道校验。
    if (isolatedAppHost && !accountId) return false;
    return true;
  };

  let temporarilyUnavailable = false;
  let refreshRecoveryCookies = [];
  if (accessToken) {
    const verified = await verifyAccessToken(accessToken);
    if (verified.ok && identityMatches(verified.user.id)) {
      const migrationCookies = !accountId && !isolatedAppHost
        ? [accountCookie(verified.user.id, REFRESH_MAX_AGE, rootDomainForHost(hostname) || "qsseda.com")]
        : [];
      return { ok: true, user: verified.user, accessToken, cookies: migrationCookies };
    }
    if (verified.temporary) temporarilyUnavailable = true;
  }

  // Legacy sessions created by direct Studio sign-in can recover locally.
  // Auth handoffs never receive a reusable refresh token, so these branches
  // cannot accidentally consume Auth's rotating credential.
  if (refreshToken) {
    const result = await refreshBrowserAuthSession(refreshToken);
    if (result.kind === "unavailable") temporarilyUnavailable = true;
    if (result.kind === "ok") {
      const refreshed = result.payload;
      refreshRecoveryCookies = studioSessionCookies(refreshed.access_token, refreshed.refresh_token, refreshed.expires_in, request);
      const verified = await verifyAccessToken(refreshed.access_token);
      if (verified.ok && identityMatches(verified.user.id)) {
        return {
          ok: true,
          user: verified.user,
          accessToken: refreshed.access_token,
          cookies: refreshRecoveryCookies
        };
      }
      if (verified.temporary) temporarilyUnavailable = true;
    }
  }

  // Temporary network, 429 or upstream 5xx must not silently erase a valid
  // session cookie. A retry can recover; only definitive invalidity clears it.
  if (temporarilyUnavailable) {
    workerLog("warn", "session_gate.temporarily_unavailable", { host: hostname });
    return { ok: false, temporary: true, accessToken: "", cookies: refreshRecoveryCookies };
  }
  return {
    ok: false,
    accessToken: "",
    cookies: accessToken || refreshToken ? clearStudioSessionCookies() : []
  };
}

export async function verifyStudioApiSession(request) {
  return verifyStudioPageSession(request);
}

/// 把浏览器 Supabase session 同步进 HttpOnly 服务端 Cookie。
/// 该接口要求 same-origin POST；独立产品若有更严格的账号切换规则，应在写 Cookie 前做 identity marker 校验。
export async function handleStudioSessionBootstrap(request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const url = new URL(request.url);
  const origin = request.headers.get("Origin") || "";
  if (origin !== url.origin) return json({ error: "Invalid origin" }, 403);

  let body;
  try {
    body = await readJsonBounded(request, 32768);
  } catch (error) {
    return json({ error: "Invalid or oversized request body" }, error?.status || 400);
  }

  const accessToken = cleanToken(body?.access_token, 12000);
  // Ignore incoming refresh_token even from old JS clients. Bootstrap
  // establishes an Auth-brokered *access-only* browser session.
  if (!accessToken) return json({ error: "Missing session" }, 400);

  const verified = await verifyAccessToken(accessToken);
  if (!verified.ok) return studioSessionFailure({ temporary: verified.temporary, cookies: verified.temporary ? [] : clearStudioSessionCookies() });
  const bootstrapCookies = parseCookies(request.headers.get("Cookie") || "");
  if (bootstrapCookies[ACCOUNT_COOKIE] === ACCOUNT_SIGNED_OUT) {
    return studioSessionFailure({ cookies: clearStudioSessionCookies() });
  }

  // A Work-local Supabase session can itself be stale after an account switch on
  // another qsseda.com host. Do not let it recreate the old Work HttpOnly
  // session unless the domain-wide account marker says it is the same user.
  if (["work", "gpt", "cash", "aw"].some(service => isServiceHost(url.hostname.toLowerCase(), service))) {
    const cookies = parseCookies(request.headers.get("Cookie") || "");
    const accountId = String(cookies[ACCOUNT_COOKIE] || "").trim();
    if (!isUuid(accountId) || accountId !== verified.user.id) {
      workerLog("warn", "session_gate.work_identity_mismatch", {
        work_user_id: verified.user.id,
        marker_present: Boolean(accountId)
      });
      return withStudioSessionCookies(
        json({ error: "Work session does not match the active AERTEX account." }, 409),
        clearStudioSessionCookies()
      );
    }
  }

  const response = json({ ok: true, user_id: verified.user.id });
  return withStudioSessionCookies(response, studioSessionCookies(accessToken, null, undefined, request));
}

/// 登出不仅清当前 host 的 __Host Cookie，还把域级 account marker 写成 signed-out，通知其他产品拒绝旧会话。
export function handleStudioSessionLogout(request) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin") || "";
  if (origin && origin !== url.origin) return json({ error: "Invalid origin" }, 403);
  return withStudioSessionCookies(json({ ok: true }), globalLogoutCookies(request));
}

// Keep temporary upstream failures distinct from invalid credentials. Clients
// must not redirect to login or discard a draft on a retryable outage.
export function studioSessionFailure(session) {
  const temporary = session?.temporary === true;
  const response = json({ error: temporary ? "Authentication is temporarily unavailable. Retry without signing out." : "Authentication required.",
    code: temporary ? "authentication_unavailable" : "authentication_required" }, temporary ? 503 : 401);
  if (temporary) response.headers.set("retry-after", "5");
  return withStudioSessionCookies(response, session?.cookies || []);
}

export function studioSessionBootstrapPage(locale, request, temporarilyUnavailable = false) {
  const zh = String(locale || "").toLowerCase().startsWith("zh");
  const authOrigin = authOriginForRequest(request);
  const title = zh ? "正在验证登录状态…" : "Verifying your session…";
  const unavailable = zh ? "\u767b\u5f55\u670d\u52a1\u6682\u65f6\u4e0d\u53ef\u7528\uff0c\u672a\u6e05\u9664\u4f60\u7684\u767b\u5f55\u72b6\u6001\u3002\u8bf7\u7a0d\u540e\u5237\u65b0\u91cd\u8bd5\u3002" : "Sign-in verification is temporarily unavailable. Your session has been kept. Refresh to retry.";
  const failed = zh ? "正在重新同步 AERTEX 登录状态…" : "Resynchronizing your AERTEX sign-in state…";

  const page = `<!DOCTYPE html>
<html>
<head>
  ${baseHead("AERTEX")}
</head>
<body>
  <main style="min-height:100vh;display:grid;place-items:center;padding:24px">
    <section style="text-align:center;max-width:520px">
      <h1 style="font-size:24px;margin:0 0 8px">AERTEX</h1>
      <p id="studio-session-status">${title}</p>
    </section>
  </main>
  ${supabaseScript()}
  <script>
    (async () => {
      const status = document.getElementById("studio-session-status");
      const unavailable = () => { if (status) status.textContent = ${scriptLiteral(unavailable)}; };
      if (${temporarilyUnavailable ? "true" : "false"}) { unavailable(); return; }
      const goLogin = async () => {
        if (status) status.textContent = ${scriptLiteral(failed)};
        // A missing host-local browser session is not proof of logout: the
        // auth subdomain may still hold a valid session and can hand it off.
        const target = new URL("/continue", ${scriptLiteral(authOrigin)});
        target.searchParams.set("next", location.pathname + location.search);
        location.replace(target.toString());
      };

      try {
        const result = await supabaseClient.auth.getSession();
        const session = result?.data?.session || null;
        if (!session?.access_token || !session?.refresh_token) {
          await goLogin();
          return;
        }

        const response = await fetch("/api/auth/bootstrap", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ access_token: session.access_token, refresh_token: session.refresh_token }),
          cache: "no-store"
        });
        if (response.status === 429 || response.status >= 500) { unavailable(); return; }
        if (!response.ok) {
          await goLogin();
          return;
        }
        location.reload();
      } catch {
        unavailable();
      }
    })();
  </script>
</body>
</html>`;

  const response = html(page, temporarilyUnavailable ? 503 : 401);
  if (temporarilyUnavailable) response.headers.set("retry-after", "5");
  return response;
}

/// 通过 Supabase /auth/v1/user 校验 access token，而不是只在边缘端解码 JWT 后盲目信任 payload。
async function verifyAccessToken(accessToken) {
  let userResponse;
  try {
    userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8000)
    });
  } catch (error) {
    workerLog("warn", "session_gate.user_lookup_failed", { error_type: error?.name || "Error" });
    return { ok: false, temporary: true };
  }
  if (!userResponse.ok) return { ok: false, temporary: userResponse.status === 429 || userResponse.status >= 500 };

  let user;
  try {
    user = await userResponse.json();
  } catch {
    return { ok: false, temporary: true };
  }
  if (!isUuid(user?.id)) return { ok: false };

  let profileResponse;
  try {
    profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=status&id=eq.${encodeURIComponent(user.id)}&limit=1`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8000)
    });
  } catch (error) {
    workerLog("warn", "session_gate.profile_lookup_failed", { user_id: user.id, error_type: error?.name || "Error" });
    return { ok: false, temporary: true };
  }
  if (!profileResponse.ok) return { ok: false, temporary: profileResponse.status === 429 || profileResponse.status >= 500 };

  let profiles;
  try {
    profiles = await profileResponse.json();
  } catch {
    return { ok: false, temporary: true };
  }
  if (!Array.isArray(profiles) || profiles.length !== 1 || profiles[0]?.status !== "active") return { ok: false };

  return { ok: true, user };
}


function cookie(name, value, maxAge) {
  return `${name}=${encodeURIComponent(value || "")}; Path=/; Max-Age=${Math.max(0, Number(maxAge) || 0)}; HttpOnly; Secure; SameSite=Lax`;
}

function accountCookie(value, maxAge, domain) {
  return `${ACCOUNT_COOKIE}=${encodeURIComponent(value || "")}; Path=/; Domain=${domain}; Max-Age=${Math.max(0, Number(maxAge) || 0)}; HttpOnly; Secure; SameSite=Lax`;
}

function sessionRoot(requestOrHost) {
  if (typeof requestOrHost === "string") return rootDomainForHost(requestOrHost) || "qsseda.com";
  try { return rootDomainForHost(new URL(requestOrHost?.url || "").hostname) || "qsseda.com"; }
  catch { return "qsseda.com"; }
}

function parseCookies(header) {
  const result = {};
  for (const part of String(header || "").split(";")) {
    const index = part.indexOf("=");
    if (index <= 0) continue;
    const key = part.slice(0, index).trim();
    const raw = part.slice(index + 1).trim();
    try { result[key] = decodeURIComponent(raw); } catch { result[key] = raw; }
  }
  return result;
}

function cleanToken(value, maximum) {
  if (typeof value !== "string") return "";
  const token = value.trim();
  if (!token || token.length > maximum || /[\u0000-\u001f\u007f\s]/.test(token)) return "";
  return token;
}

function jwtSubject(token) {
  try {
    const parts = String(token || "").split(".");
    if (parts.length !== 3 || !parts[1]) return "";
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes));
    return isUuid(payload?.sub) ? payload.sub : "";
  } catch {
    return "";
  }
}

function scriptLiteral(value) {
  return JSON.stringify(String(value || "")).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}
