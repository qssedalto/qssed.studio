/**
 * 【初学者导读】
 * 文件：auth-login-identifier.js
 * AERTEX ID/认证模块：处理登录标识、OAuth/PKCE、SSO、边缘保护或认证入口，属于高风险安全代码。
 * 阅读顺序：从最外层入口开始，先看域名/path/method 判断，再看登录或令牌校验，最后追到具体 handler/模块；不要从某个深层函数孤立地理解整条请求链。
 * 请求链思维：浏览器/客户端 → Worker → 会话/安全门禁 → 路由 → API/页面 → 数据源 → Response。
 * 修改注意：这是认证/会话敏感区域；redirect、Cookie、PKCE/state、来源校验和权限判断必须保持最小权限原则。
 * 调试方法：先记录“实际 host + pathname + method + 是否有会话”，通常可以快速判断请求为什么走错分支。
 */
const SUPABASE_URL = "https://xunbsoxijasekzadckob.supabase.co";
const SUPABASE_KEY = "sb_publishable_1ScwEvseisteYNgc5xM1pQ_NNekUmF1";
const ACCESS_COOKIE = "__Host-qsseda-access";
const REFRESH_COOKIE = "__Host-qsseda-refresh";
const ACCESS_MAX_AGE = 60 * 60;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;
const ACTIVE_STATUS = "active";

// Auth 子域 identifier 登录：接受用户名或邮箱，解析成实际 Auth 账号并完成密码登录；失败提示保持模糊，避免枚举账户。
export async function handleIdentifierLogin(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const identifier = cleanText(body?.identifier || body?.email, 180);
  const password = typeof body?.password === "string" ? body.password : "";
  if (!identifier || !password) {
    return json({ error: "Username/email and password are required" }, 400);
  }

  let upstream;
  try {
    upstream = await fetch(`${SUPABASE_URL}/functions/v1/login-identifier`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({ identifier, password })
    });
  } catch {
    return json({ error: "Authentication service unavailable" }, 503);
  }

  let payload;
  try {
    payload = await upstream.json();
  } catch {
    return json({ error: "Authentication service returned an invalid response" }, 502);
  }

  if (!upstream.ok || !payload?.access_token || !payload?.refresh_token || !payload?.user) {
    return json({
      error: upstream.status === 401 ? "用户名、邮箱或密码不正确" : friendlyAuthError(payload),
      code: payload?.error_code || payload?.code || "invalid_credentials"
    }, upstream.status === 400 ? 401 : upstream.status);
  }

  const profile = await fetchProfile(payload.access_token, payload.user.id);
  const user = publicUser(payload.user, profile);
  return json(sessionPayload(user), 200, sessionCookies(payload));
}

export function rewriteIdentifierLoginPage(markup) {
  return String(markup || "")
    .replace(/type="email"/g, 'type="text" autocapitalize="none" spellcheck="false"')
    .replace(/placeholder="邮箱"/g, 'placeholder="用户名或邮箱"')
    .replace(/placeholder="Email"/g, 'placeholder="Username or email"')
    .replace(/邮箱或密码不正确/g, "用户名、邮箱或密码不正确")
    .replace(/Email or password is incorrect/g, "Username, email, or password is incorrect");
}

async function fetchProfile(accessToken, userId) {
  if (!userId) return null;
  try {
    const url = new URL(`${SUPABASE_URL}/rest/v1/profiles`);
    url.searchParams.set("select", "username,display_name,avatar_url,role,status");
    url.searchParams.set("id", `eq.${userId}`);
    url.searchParams.set("limit", "1");
    const response = await fetch(url.toString(), {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${accessToken}`
      }
    });
    if (!response.ok) return null;
    const rows = await response.json();
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  } catch {
    return null;
  }
}

function sessionPayload(user) {
  return {
    authenticated: true,
    authorized: user.status === ACTIVE_STATUS,
    user
  };
}

function publicUser(user, profile) {
  const metadata = user?.user_metadata || {};
  const firstName = cleanText(metadata.first_name || metadata.firstName, 80);
  const lastName = cleanText(metadata.last_name || metadata.lastName, 80);
  const displayName = cleanText(
    profile?.display_name || metadata.display_name || metadata.full_name || [firstName, lastName].filter(Boolean).join(" "),
    120
  );
  const username = cleanText(profile?.username || metadata.username, 80);

  return {
    id: String(user?.id || ""),
    email: cleanText(user?.email, 180),
    displayName: displayName || username || cleanText(user?.email, 180) || "AERTEX User",
    username,
    avatarUrl: safeAvatarUrl(profile?.avatar_url || metadata.avatar_url || metadata.picture),
    role: cleanText(profile?.role, 32) || "user",
    status: cleanText(profile?.status, 32) || ACTIVE_STATUS
  };
}

function safeAvatarUrl(value) {
  const text = cleanText(value, 1000);
  if (!text) return "";
  try {
    const url = new URL(text);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function friendlyAuthError(payload) {
  const message = String(payload?.msg || payload?.message || payload?.error_description || payload?.error || "").toLowerCase();
  if (message.includes("invalid login") || message.includes("invalid credentials")) return "用户名、邮箱或密码不正确";
  if (message.includes("email not confirmed")) return "邮箱尚未验证";
  if (message.includes("too many")) return "尝试次数过多，请稍后再试";
  return "无法登录，请检查账号信息后重试";
}

function sessionCookies(payload) {
  const expiresIn = Math.max(60, Math.min(Number(payload?.expires_in) || ACCESS_MAX_AGE, ACCESS_MAX_AGE));
  return [
    cookie(ACCESS_COOKIE, payload.access_token, expiresIn),
    cookie(REFRESH_COOKIE, payload.refresh_token, REFRESH_MAX_AGE)
  ];
}

function cookie(name, value, maxAge) {
  return `${name}=${encodeURIComponent(value || "")}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

function baseHeaders(contentType) {
  return {
    "content-type": contentType,
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "x-frame-options": "DENY",
    "strict-transport-security": "max-age=31536000"
  };
}

function json(data, status = 200, cookies = []) {
  const headers = new Headers(baseHeaders("application/json;charset=UTF-8"));
  for (const value of cookies) headers.append("set-cookie", value);
  return new Response(JSON.stringify(data), { status, headers });
}
