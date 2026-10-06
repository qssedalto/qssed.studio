/**
 * 【初学者导读】
 * 文件：studio/session-gate.js
 * 会话门禁模块：决定请求是否拥有有效登录态以及未登录时如何跳转/返回，属于核心安全边界。
 * 阅读顺序：先确定谁调用本模块，再查看入口 handler；随后依次检查权限、输入归一化、数据操作和错误返回。
 * 数据一致性：涉及多人协作、版本或存储时，要特别注意重复请求、并发更新和“旧客户端仍在使用旧字段”的情况。
 * 修改注意：这里存在权限/并发/隐私边界，任何放宽校验或覆盖写入都应有明确理由和测试。
 * 调试方法：记录请求标识、用户/资源 ID 和关键分支结果，但不要把令牌、Cookie、私密内容写入日志。
 */
import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { html, json } from "./routing.js";
import { baseHead, supabaseScript } from "./ui-page.js";
import { workerLog } from "./server-runtime.js";
import { authOriginForRequest, isServiceHost, rootDomainForHost } from "./domain-family.js";

const ACCESS_COOKIE = "__Host-qsseda-studio-access";
const REFRESH_COOKIE = "__Host-qsseda-studio-refresh";
const ACCOUNT_COOKIE = "__Secure-qsseda-account-id";
const ACCOUNT_SIGNED_OUT = "signed-out";
const ACCESS_MAX_AGE = 60 * 60;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

export function studioSessionCookies(accessToken, refreshToken, expiresIn = ACCESS_MAX_AGE, requestOrHost = "qsseda.com") {
  const accessAge = Math.max(60, Math.min(Number(expiresIn) || ACCESS_MAX_AGE, ACCESS_MAX_AGE));
  const cookieDomain = sessionRoot(requestOrHost);
  const cookies = [];
  if (accessToken) cookies.push(cookie(ACCESS_COOKIE, accessToken, accessAge));
  if (refreshToken) cookies.push(cookie(REFRESH_COOKIE, refreshToken, REFRESH_MAX_AGE));
  const userId = jwtSubject(accessToken);
  if (userId) cookies.push(accountCookie(userId, REFRESH_MAX_AGE, cookieDomain));
  return cookies;
}

export function clearStudioSessionCookies() {
  return [cookie(ACCESS_COOKIE, "", 0), cookie(REFRESH_COOKIE, "", 0)];
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

// 页面会话门禁：先读取 Cookie 中的 access token；失效时尝试 refresh token，成功后把新 Cookie 附加到响应。页面请求与 API 请求的失败表现不同，因此不要把两个入口合并成同一种返回。
export async function verifyStudioPageSession(request) {
  const url = new URL(request.url);
  const hostname = url.hostname.toLowerCase();
  const workHost = isServiceHost(hostname, "work");
  const gptHost = isServiceHost(hostname, "gpt");
  const cashHost = isServiceHost(hostname, "cash");
  const isolatedAppHost = workHost || gptHost || cashHost;
  const cookies = parseCookies(request.headers.get("Cookie") || "");
  const accessToken = cookies[ACCESS_COOKIE] || "";
  const refreshToken = cookies[REFRESH_COOKIE] || "";
  const accountMarker = String(cookies[ACCOUNT_COOKIE] || "").trim();
  const accountId = isUuid(accountMarker) ? accountMarker : "";
  const markerBlocksSession = Boolean(accountMarker && !accountId);

  const identityMatches = userId => {
    if (!isUuid(userId) || markerBlocksSession) return false;
    if (accountId && accountId !== userId) return false;
    // Work is a separate host. It must never trust a legacy host-only session
    // unless a domain-wide identity marker confirms the same account.
    if (isolatedAppHost && !accountId) return false;
    return true;
  };

  if (accessToken) {
    const verified = await verifyAccessToken(accessToken);
    if (verified.ok && identityMatches(verified.user.id)) {
      const migrationCookies = !accountId && !isolatedAppHost
        ? [accountCookie(verified.user.id, REFRESH_MAX_AGE, rootDomainForHost(hostname) || "qsseda.com")]
        : [];
      return { ok: true, user: verified.user, accessToken, cookies: migrationCookies };
    }
  }

  if (refreshToken) {
    const refreshed = await refreshSession(refreshToken);
    if (refreshed?.access_token && refreshed?.refresh_token) {
      const verified = await verifyAccessToken(refreshed.access_token);
      if (verified.ok && identityMatches(verified.user.id)) {
        return {
          ok: true,
          user: verified.user,
          accessToken: refreshed.access_token,
          cookies: studioSessionCookies(refreshed.access_token, refreshed.refresh_token, refreshed.expires_in, request)
        };
      }
    }
  }

  return {
    ok: false,
    accessToken: "",
    cookies: accessToken || refreshToken ? clearStudioSessionCookies() : []
  };
}

// API 会话门禁：复用页面会话校验得到用户身份，但 API 调用者需要结构化的未登录错误，而不是 HTML 登录页。
export async function verifyStudioApiSession(request) {
  return verifyStudioPageSession(request);
}

export async function handleStudioSessionBootstrap(request) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin") || "";
  if (origin !== url.origin) return json({ error: "Invalid origin" }, 403);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const accessToken = cleanToken(body?.access_token, 12000);
  const refreshToken = cleanToken(body?.refresh_token, 12000);
  if (!accessToken || !refreshToken) return json({ error: "Missing session" }, 400);

  const verified = await verifyAccessToken(accessToken);
  if (!verified.ok) return withStudioSessionCookies(json({ error: "Session is invalid or expired" }, 401), clearStudioSessionCookies());

  // A Work-local Supabase session can itself be stale after an account switch on
  // another qsseda.com host. Do not let it recreate the old Work HttpOnly
  // session unless the domain-wide account marker says it is the same user.
  if (isServiceHost(url.hostname.toLowerCase(), "work")) {
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
  return withStudioSessionCookies(response, studioSessionCookies(accessToken, refreshToken, undefined, request));
}

export function handleStudioSessionLogout(request) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin") || "";
  if (origin && origin !== url.origin) return json({ error: "Invalid origin" }, 403);
  return withStudioSessionCookies(json({ ok: true }), globalLogoutCookies(request));
}

export function studioSessionBootstrapPage(locale, request) {
  const zh = String(locale || "").toLowerCase().startsWith("zh");
  const authOrigin = authOriginForRequest(request);
  const title = zh ? "正在验证登录状态…" : "Verifying your session…";
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
      const goLogin = async () => {
        if (status) status.textContent = ${scriptLiteral(failed)};
        try { await supabaseClient.auth.signOut({ scope: "local" }); } catch {}
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
        if (!response.ok) {
          await goLogin();
          return;
        }
        location.reload();
      } catch {
        await goLogin();
      }
    })();
  </script>
</body>
</html>`;

  return html(page, 401);
}

async function verifyAccessToken(accessToken) {
  let userResponse;
  try {
    userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}` }
    });
  } catch (error) {
    workerLog("warn", "session_gate.user_lookup_failed", { error_type: error?.name || "Error" });
    return { ok: false };
  }
  if (!userResponse.ok) return { ok: false };

  let user;
  try {
    user = await userResponse.json();
  } catch {
    return { ok: false };
  }
  if (!isUuid(user?.id)) return { ok: false };

  let profileResponse;
  try {
    profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=status&id=eq.${encodeURIComponent(user.id)}&limit=1`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}` }
    });
  } catch (error) {
    workerLog("warn", "session_gate.profile_lookup_failed", { user_id: user.id, error_type: error?.name || "Error" });
    return { ok: false };
  }
  if (!profileResponse.ok) return { ok: false };

  let profiles;
  try {
    profiles = await profileResponse.json();
  } catch {
    return { ok: false };
  }
  if (!Array.isArray(profiles) || profiles.length !== 1 || profiles[0]?.status !== "active") return { ok: false };

  return { ok: true, user };
}

// 刷新会话：refresh token 只发送给认证服务；新 access/refresh token 只进入安全 Cookie，不能回填到页面脚本或普通日志。
async function refreshSession(refreshToken) {
  let response;
  try {
    response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "content-type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
  } catch (error) {
    workerLog("warn", "session_gate.refresh_failed", { error_type: error?.name || "Error" });
    return null;
  }
  if (!response.ok) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
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
