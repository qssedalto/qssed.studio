import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { html, json } from "./routing.js";
import { baseHead, supabaseScript } from "./ui-page.js";
import { workerLog } from "./server-runtime.js";

const ACCESS_COOKIE = "__Host-qsseda-studio-access";
const REFRESH_COOKIE = "__Host-qsseda-studio-refresh";
const ACCESS_MAX_AGE = 60 * 60;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

export function studioSessionCookies(accessToken, refreshToken, expiresIn = ACCESS_MAX_AGE) {
  const accessAge = Math.max(60, Math.min(Number(expiresIn) || ACCESS_MAX_AGE, ACCESS_MAX_AGE));
  const cookies = [];
  if (accessToken) cookies.push(cookie(ACCESS_COOKIE, accessToken, accessAge));
  if (refreshToken) cookies.push(cookie(REFRESH_COOKIE, refreshToken, REFRESH_MAX_AGE));
  return cookies;
}

export function clearStudioSessionCookies() {
  return [cookie(ACCESS_COOKIE, "", 0), cookie(REFRESH_COOKIE, "", 0)];
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

export async function verifyStudioPageSession(request) {
  const cookies = parseCookies(request.headers.get("Cookie") || "");
  const accessToken = cookies[ACCESS_COOKIE] || "";
  const refreshToken = cookies[REFRESH_COOKIE] || "";

  if (accessToken) {
    const verified = await verifyAccessToken(accessToken);
    if (verified.ok) {
      return { ok: true, user: verified.user, cookies: [] };
    }
  }

  if (refreshToken) {
    const refreshed = await refreshSession(refreshToken);
    if (refreshed?.access_token && refreshed?.refresh_token) {
      const verified = await verifyAccessToken(refreshed.access_token);
      if (verified.ok) {
        return {
          ok: true,
          user: verified.user,
          cookies: studioSessionCookies(refreshed.access_token, refreshed.refresh_token, refreshed.expires_in)
        };
      }
    }
  }

  return {
    ok: false,
    cookies: accessToken || refreshToken ? clearStudioSessionCookies() : []
  };
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

  const response = json({ ok: true, user_id: verified.user.id });
  return withStudioSessionCookies(response, studioSessionCookies(accessToken, refreshToken));
}

export function handleStudioSessionLogout(request) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin") || "";
  if (origin && origin !== url.origin) return json({ error: "Invalid origin" }, 403);
  return withStudioSessionCookies(json({ ok: true }), clearStudioSessionCookies());
}

export function studioSessionBootstrapPage(locale) {
  const zh = locale === "zh";
  const loginUrl = locale === "zh" ? "/zh-cn/login" : "/en/login";
  const title = zh ? "正在验证登录状态…" : "Verifying your session…";
  const failed = zh ? "登录状态已失效，正在返回登录页…" : "Your session expired. Returning to sign in…";

  const page = `<!DOCTYPE html>
<html>
<head>
  ${baseHead("QssedA Studio")}
</head>
<body>
  <main style="min-height:100vh;display:grid;place-items:center;padding:24px">
    <section style="text-align:center;max-width:520px">
      <h1 style="font-size:24px;margin:0 0 8px">QssedA Studio</h1>
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
        location.replace(${scriptLiteral(loginUrl)});
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

function scriptLiteral(value) {
  return JSON.stringify(String(value || "")).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}
