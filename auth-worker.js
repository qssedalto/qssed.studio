import { handleOAuthRequest } from "./auth-oauth.js";
import { mainOriginForRequest } from "./studio/domain-family.js";

const SUPABASE_URL = "https://xunbsoxijasekzadckob.supabase.co";
const SUPABASE_KEY = "sb_publishable_1ScwEvseisteYNgc5xM1pQ_NNekUmF1";

const ACCESS_COOKIE = "__Host-qsseda-access";
const REFRESH_COOKIE = "__Host-qsseda-refresh";
const ACCESS_MAX_AGE = 60 * 60;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;
const ACTIVE_STATUS = "active";
const OAUTH_PATHS = new Set([
  "/authorize",
  "/api/oauth/authorize",
  "/oauth/token",
  "/oauth/revoke",
  "/oauth/introspect",
  "/.well-known/oauth-authorization-server"
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = normalizePath(url.pathname);

    if (OAUTH_PATHS.has(pathname)) return handleOAuthRequest(request);

    if (pathname === "/api/login") {
      if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
      if (!sameOrigin(request, url)) return json({ error: "Invalid origin" }, 403);
      return handleLogin(request);
    }

    if (pathname === "/api/session") {
      if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
      return handleSession(request);
    }

    if (pathname === "/api/logout") {
      if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
      if (!sameOrigin(request, url)) return json({ error: "Invalid origin" }, 403);
      return handleLogout(request);
    }

    if (pathname === "/continue") {
      if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
      return handleContinue(request, env);
    }

    if (pathname === "/health") {
      return json({ ok: true, service: "qsseda-auth", time: new Date().toISOString() });
    }

    if (["/", "/login", "/account", "/authorize"].includes(pathname)) {
      return html(authPage(pathname, request));
    }

    return html(notFoundPage(), 404);
  }
};

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function sameOrigin(request, url) {
  const origin = request.headers.get("Origin") || "";
  return origin === url.origin;
}

async function handleLogin(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const email = cleanText(body?.email, 180);
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password) {
    return json({ error: "Email and password are required" }, 400);
  }

  let upstream;
  try {
    upstream = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({ email, password })
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
      error: friendlyAuthError(payload),
      code: payload?.error_code || payload?.code || "invalid_credentials"
    }, upstream.status === 400 ? 401 : upstream.status);
  }

  const profile = await fetchProfile(payload.access_token, payload.user.id);
  const user = publicUser(payload.user, profile);
  return json(sessionPayload(user), 200, sessionCookies(payload));
}

async function handleSession(request) {
  const cookies = parseCookies(request.headers.get("Cookie") || "");
  const accessToken = cookies[ACCESS_COOKIE] || "";
  const refreshToken = cookies[REFRESH_COOKIE] || "";

  if (accessToken) {
    const authUser = await fetchUser(accessToken);
    if (authUser) {
      const profile = await fetchProfile(accessToken, authUser.id);
      return json(sessionPayload(publicUser(authUser, profile)));
    }
  }

  if (!refreshToken) {
    return json({ authenticated: false, authorized: false }, 200, accessToken ? clearSessionCookies() : []);
  }

  const refreshed = await refreshSession(refreshToken);
  if (!refreshed) {
    return json({ authenticated: false, authorized: false }, 200, clearSessionCookies());
  }

  const profile = await fetchProfile(refreshed.access_token, refreshed.user.id);
  const user = publicUser(refreshed.user, profile);
  return json(sessionPayload(user), 200, sessionCookies(refreshed));
}

async function handleLogout(request) {
  const cookies = parseCookies(request.headers.get("Cookie") || "");
  const accessToken = cookies[ACCESS_COOKIE] || "";

  if (accessToken) {
    try {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${accessToken}`
        }
      });
    } catch {
      // Local cookies are still cleared even if upstream revocation is unavailable.
    }
  }

  return json({ success: true }, 200, clearSessionCookies());
}

async function handleContinue(request, env) {
  const cookies = parseCookies(request.headers.get("Cookie") || "");
  let accessToken = cookies[ACCESS_COOKIE] || "";
  let refreshToken = cookies[REFRESH_COOKIE] || "";
  let authUser = accessToken ? await fetchUser(accessToken) : null;
  let rotated = null;

  if (!authUser && refreshToken) {
    rotated = await refreshSession(refreshToken);
    if (rotated) {
      accessToken = rotated.access_token;
      refreshToken = rotated.refresh_token;
      authUser = rotated.user;
    }
  }

  if (!authUser || !accessToken || !refreshToken) {
    return redirectResponse("/login");
  }

  const profile = await fetchProfile(accessToken, authUser.id);
  const user = publicUser(authUser, profile);
  if (user.status !== ACTIVE_STATUS) {
    return redirectResponse("/account");
  }

  const requestUrl = new URL(request.url);
  const next = safeNextPath(requestUrl.searchParams.get("next"));
  const mainSite = mainOriginForRequest(request) || safeHttpsOrigin(env?.MAIN_SITE_URL) || "https://qsseda.com";
  const headers = new Headers(baseHeaders("text/html;charset=UTF-8"));
  headers.set("referrer-policy", "origin");
  headers.set("content-security-policy", `default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; form-action ${mainSite}; base-uri 'none'; frame-ancestors 'none'`);
  if (rotated) for (const value of sessionCookies(rotated)) headers.append("set-cookie", value);

  return new Response(handoffPage(mainSite, accessToken, refreshToken, next), { status: 200, headers });
}

function safeNextPath(value) {
  const path = cleanText(value, 500);
  return path.startsWith("/") && !path.startsWith("//") ? path : "/dashboard";
}

function safeHttpsOrigin(value) {
  const text = cleanText(value, 500);
  if (!text) return "";
  try {
    const url = new URL(text);
    return url.protocol === "https:" ? url.origin : "";
  } catch {
    return "";
  }
}

function redirectResponse(path) {
  return new Response(null, { status: 302, headers: { location: path, "cache-control": "no-store" } });
}

function htmlEscape(value) {
  return String(value || "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "\'": "&#39;" }[character]));
}

function handoffPage(mainSite, accessToken, refreshToken, next) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>QssedA Auth</title><style>html,body{height:100%;margin:0}body{display:grid;place-items:center;background:#0b0b0d;color:#f5f5f7;font:15px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.box{text-align:center}.spin{width:22px;height:22px;margin:0 auto 14px;border:2px solid #3a3a3c;border-top-color:#0a84ff;border-radius:50%;animation:s .8s linear infinite}@keyframes s{to{transform:rotate(360deg)}}p{color:#a1a1a6}</style></head><body><div class="box"><div class="spin"></div><strong>正在进入 QssedA</strong><p>正在安全同步登录状态…</p></div><form id="handoff" method="post" action="${htmlEscape(mainSite)}/auth/handoff"><input type="hidden" name="access_token" value="${htmlEscape(accessToken)}"><input type="hidden" name="refresh_token" value="${htmlEscape(refreshToken)}"><input type="hidden" name="next" value="${htmlEscape(next)}"></form><script>document.getElementById("handoff").submit()</script></body></html>`;
}

async function fetchUser(accessToken) {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${accessToken}`
      }
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
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

async function refreshSession(refreshToken) {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    if (!response.ok) return null;
    const payload = await response.json();
    if (!payload?.access_token || !payload?.refresh_token || !payload?.user) return null;
    return payload;
  } catch {
    return null;
  }
}

function sessionPayload(user) {
  const authorized = user.status === ACTIVE_STATUS;
  return {
    authenticated: true,
    authorized,
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
    displayName: displayName || username || cleanText(user?.email, 180) || "QssedA User",
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
  const message = String(payload?.msg || payload?.message || payload?.error_description || "").toLowerCase();
  if (message.includes("invalid login") || message.includes("invalid credentials")) return "邮箱或密码不正确";
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

function clearSessionCookies() {
  return [cookie(ACCESS_COOKIE, "", 0), cookie(REFRESH_COOKIE, "", 0)];
}

function cookie(name, value, maxAge) {
  return `${name}=${encodeURIComponent(value || "")}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

function parseCookies(header) {
  const result = {};
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index <= 0) continue;
    const key = part.slice(0, index).trim();
    const raw = part.slice(index + 1).trim();
    try {
      result[key] = decodeURIComponent(raw);
    } catch {
      result[key] = raw;
    }
  }
  return result;
}

function baseHeaders(contentType) {
  return {
    "content-type": contentType,
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "x-frame-options": "DENY",
    "strict-transport-security": "max-age=31536000",
    "content-security-policy": "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"
  };
}

function json(data, status = 200, cookies = []) {
  const headers = new Headers(baseHeaders("application/json;charset=UTF-8"));
  for (const value of cookies) headers.append("set-cookie", value);
  return new Response(JSON.stringify(data), { status, headers });
}

function html(content, status = 200) {
  return new Response(content, {
    status,
    headers: baseHeaders("text/html;charset=UTF-8")
  });
}

function authPage(pathname, request) {
  const page = pathname === "/" ? "home" : pathname.slice(1);
  const authHost = new URL(request.url).hostname;
  const mainOrigin = mainOriginForRequest(request);
  const language = preferredLanguage(request);
  const zh = language === "zh";
  const copy = zh ? {
    checking: "正在检查登录状态…",
    loginTitle: "登录 QssedA",
    loginLead: `使用你的 QssedA 账号继续。认证状态由 ${authHost} 独立维护。`,
    email: "邮箱",
    password: "密码",
    continue: "继续",
    create: "创建账号",
    signedTitle: "你已登录",
    signedLead: "QssedA Auth 已识别当前会话。",
    openStudio: "继续前往 QssedA",
    account: "账号状态",
    signOut: "退出登录",
    authorizeTitle: "授权应用",
    authorizeLead: "确认要使用哪个 QssedA 账号继续。",
    accountTitle: "账号状态",
    accountLead: "查看当前账号、会话与授权状态。",
    usernameLabel: "用户名",
    roleLabel: "角色",
    sessionLabel: "认证会话",
    sessionProtected: "受 QssedA Auth 保护",
    securityNote: "登录凭据保存在仅服务器可读取的安全 Cookie 中。其他 QssedA 应用通过授权或安全会话交接使用此身份。",
    backAuth: "返回认证中心",
    active: "账号已启用",
    suspended: "账号已暂停",
    banned: "账号已封禁",
    unavailable: "当前账号不可用于应用授权。",
    appRequest: "一个应用请求访问你的账号",
    p1: "读取基础账号身份",
    p2: "确认账号当前是否已登录",
    allowLater: "允许（下一阶段启用）",
    later: "当前版本先完成认证中心与会话识别；授权码与 PKCE 将在下一阶段接入。",
    signInFirst: "请先登录，再继续应用授权。",
    loggingIn: "正在登录…",
    connectError: "暂时无法连接认证服务，请稍后重试。"
  } : {
    checking: "Checking sign-in status…",
    loginTitle: "Sign in to QssedA",
    loginLead: `Continue with your QssedA account. Authentication is maintained by ${authHost}.`,
    email: "Email",
    password: "Password",
    continue: "Continue",
    create: "Create account",
    signedTitle: "You're signed in",
    signedLead: "QssedA Auth recognized your current session.",
    openStudio: "Continue to QssedA",
    account: "Account status",
    signOut: "Sign out",
    authorizeTitle: "Authorize application",
    authorizeLead: "Confirm which QssedA account you want to use.",
    accountTitle: "Account status",
    accountLead: "Review the current account, session and authorization state.",
    usernameLabel: "Username",
    roleLabel: "Role",
    sessionLabel: "Auth session",
    sessionProtected: "Protected by QssedA Auth",
    securityNote: "Credentials remain in secure server-only cookies. Other QssedA apps use authorization or a secure session handoff to consume this identity.",
    backAuth: "Back to Auth",
    active: "Account active",
    suspended: "Account suspended",
    banned: "Account banned",
    unavailable: "This account cannot authorize applications.",
    appRequest: "An application is requesting access to your account",
    p1: "Read basic account identity",
    p2: "Confirm current sign-in status",
    allowLater: "Allow (coming next)",
    later: "This version establishes the identity/session center. Authorization codes and PKCE come next.",
    signInFirst: "Sign in first to continue authorization.",
    loggingIn: "Signing in…",
    connectError: "Authentication service is temporarily unavailable. Please try again."
  };

  return `<!doctype html>
<html lang="${zh ? "zh-CN" : "en"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#0b0b0d" media="(prefers-color-scheme: dark)">
  <meta name="theme-color" content="#f5f5f7" media="(prefers-color-scheme: light)">
  <title>QssedA Auth</title>
  <style>
    :root{color-scheme:dark light;--bg:#07080a;--panel:rgba(27,28,32,.78);--panel-strong:#1d1f24;--surface:rgba(118,118,128,.16);--surface-hover:rgba(118,118,128,.23);--text:#f5f5f7;--muted:#a1a1a6;--quiet:#73737a;--line:rgba(255,255,255,.10);--line-strong:rgba(255,255,255,.17);--accent:#0a84ff;--accent-hover:#3198ff;--danger:#ff453a;--warning:#ffd60a;--success:#30d158;--shadow:0 28px 80px rgba(0,0,0,.46);--radius:22px;--control:14px}
    @media(prefers-color-scheme:light){:root{--bg:#f3f4f7;--panel:rgba(255,255,255,.84);--panel-strong:#fff;--surface:rgba(116,116,128,.10);--surface-hover:rgba(116,116,128,.16);--text:#111114;--muted:#62626a;--quiet:#85858d;--line:rgba(20,20,30,.09);--line-strong:rgba(20,20,30,.15);--accent:#0071e3;--accent-hover:#0077ed;--danger:#d70015;--warning:#a05a00;--success:#248a3d;--shadow:0 28px 70px rgba(38,44,60,.14)}}
    *{box-sizing:border-box}html,body{min-height:100%;margin:0}body{min-height:100vh;min-height:100dvh;display:grid;place-items:center;padding:max(22px,env(safe-area-inset-top)) max(18px,env(safe-area-inset-right)) max(22px,env(safe-area-inset-bottom)) max(18px,env(safe-area-inset-left));font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif;background:radial-gradient(circle at 18% 12%,rgba(10,132,255,.16),transparent 34%),radial-gradient(circle at 82% 78%,rgba(94,92,230,.12),transparent 31%),var(--bg);color:var(--text)}
    .shell{width:min(100%,460px)}.brand{display:flex;align-items:center;gap:12px;margin:0 0 18px 4px}.mark{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:linear-gradient(145deg,#2997ff,#0067d8);color:#fff;font-weight:800;letter-spacing:-.04em;box-shadow:0 10px 28px rgba(0,113,227,.24)}.brand-copy strong{display:block;font-size:15px}.brand-copy span{display:block;margin-top:2px;color:var(--muted);font-size:12px}
    .card{position:relative;overflow:hidden;border:1px solid var(--line);border-radius:var(--radius);background:var(--panel);backdrop-filter:blur(30px) saturate(150%);-webkit-backdrop-filter:blur(30px) saturate(150%);box-shadow:var(--shadow);padding:30px}.card:before{content:"";position:absolute;inset:0 0 auto;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.42),transparent);opacity:.65}h1{margin:0;font-size:31px;line-height:1.08;letter-spacing:-.04em;font-weight:760}.lead{margin:10px 0 24px;color:var(--muted);font-size:14px;line-height:1.55}.hidden{display:none!important}
    .loading{display:flex;align-items:center;gap:12px;color:var(--muted);padding:8px 0}.spinner{width:18px;height:18px;border:2px solid var(--line-strong);border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}label{display:block;margin:0 0 8px;color:var(--muted);font-size:13px;font-weight:600}.field{margin-top:16px}input{width:100%;height:50px;border-radius:var(--control);border:1px solid var(--line);padding:0 14px;background:var(--surface);color:var(--text);font:inherit;font-size:15px;outline:none;transition:.18s ease border-color,.18s ease box-shadow,.18s ease background}input:focus{border-color:var(--accent);box-shadow:0 0 0 4px rgba(10,132,255,.14);background:var(--panel-strong)}
    button,.button{width:100%;min-height:50px;margin-top:18px;border:0;border-radius:var(--control);padding:0 16px;display:inline-flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;background:var(--accent);color:white;font:inherit;font-size:15px;font-weight:700;cursor:pointer;transition:.16s ease transform,.16s ease background,.16s ease opacity}button:hover,.button:hover{background:var(--accent-hover)}button:active,.button:active{transform:scale(.985)}button:disabled{opacity:.48;cursor:not-allowed}.secondary{background:var(--surface);color:var(--text);border:1px solid var(--line)}.secondary:hover{background:var(--surface-hover)}.message{min-height:20px;margin:13px 0 0;color:var(--muted);font-size:13px;line-height:1.45}.message.error{color:var(--danger)}
    .account{display:flex;align-items:center;gap:14px;padding:16px;border-radius:17px;background:var(--surface);border:1px solid var(--line)}.avatar{width:48px;height:48px;flex:0 0 48px;border-radius:50%;display:grid;place-items:center;overflow:hidden;background:linear-gradient(145deg,#5e5ce6,#0a84ff);color:#fff;font-weight:800;font-size:17px}.avatar img{width:100%;height:100%;object-fit:cover}.identity{min-width:0;flex:1}.identity strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:15px}.identity span{display:block;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--muted);font-size:12px}.badge{display:inline-flex;align-items:center;gap:6px;margin-top:9px;color:var(--muted);font-size:12px}.dot{width:7px;height:7px;border-radius:50%;background:var(--success);box-shadow:0 0 0 4px rgba(48,209,88,.12)}.dot.warning{background:var(--warning);box-shadow:none}.dot.danger{background:var(--danger);box-shadow:none}.details{margin-top:18px;border:1px solid var(--line);border-radius:17px;overflow:hidden;background:var(--surface)}.detail{display:flex;justify-content:space-between;gap:18px;padding:13px 15px;border-bottom:1px solid var(--line);font-size:13px}.detail:last-child{border-bottom:0}.detail span{color:var(--muted)}.detail strong{min-width:0;text-align:right;overflow-wrap:anywhere}.security-note{margin:14px 2px 0;color:var(--quiet);font-size:12px;line-height:1.55}.divider{height:1px;background:var(--line);margin:22px 0}.app-box{padding:16px;border:1px solid var(--line);border-radius:17px;background:var(--surface)}.app-name{font-weight:700;font-size:15px}.app-id{margin-top:5px;color:var(--quiet);font:12px ui-monospace,SFMono-Regular,Menlo,monospace;overflow-wrap:anywhere}.permissions{margin:16px 0 0;padding:0;list-style:none}.permissions li{display:flex;gap:10px;padding:9px 0;color:var(--muted);font-size:13px;border-bottom:1px solid var(--line)}.permissions li:last-child{border-bottom:0}.tick{color:var(--accent);font-weight:900}.foot{margin:16px 2px 0;text-align:center;color:var(--quiet);font-size:11px;line-height:1.5}
    @media(max-width:520px){.card{padding:24px 20px;border-radius:20px}h1{font-size:28px}.brand{margin-left:2px}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.001ms!important;transition-duration:.001ms!important}}
  </style>
</head>
<body data-page="${page}">
  <main class="shell">
    <div class="brand"><div class="mark" aria-hidden="true">Q</div><div class="brand-copy"><strong>QssedA Auth</strong><span>QssedA Account</span></div></div>
    <section class="card">
      <div id="loading" class="loading"><span class="spinner"></span><span>${copy.checking}</span></div>
      <div id="signedOut" class="hidden">
        <h1>${copy.loginTitle}</h1><p id="signedOutLead" class="lead">${copy.loginLead}</p>
        <form id="loginForm" autocomplete="on">
          <div class="field"><label for="email">${copy.email}</label><input id="email" name="email" type="email" autocomplete="username" inputmode="email" required></div>
          <div class="field"><label for="password">${copy.password}</label><input id="password" name="password" type="password" autocomplete="current-password" required></div>
          <button id="loginButton" type="submit">${copy.continue}</button><div id="loginMessage" class="message" role="status" aria-live="polite"></div>
        </form>
        <a class="button secondary" href="${mainOrigin}/sign-up">${copy.create}</a>
      </div>
      <div id="signedIn" class="hidden">
        <h1 id="signedInTitle">${copy.signedTitle}</h1><p class="lead" id="signedInLead">${copy.signedLead}</p>
        <div class="account"><div id="avatar" class="avatar">Q</div><div class="identity"><strong id="displayName">QssedA User</strong><span id="emailText"></span><div class="badge"><span id="statusDot" class="dot"></span><span id="statusText">${copy.active}</span></div></div></div>
        <div id="blockedMessage" class="message error hidden">${copy.unavailable}</div>
        <div id="accountDetails" class="hidden"><div class="details"><div class="detail"><span>${copy.usernameLabel}</span><strong id="usernameText">—</strong></div><div class="detail"><span>${copy.roleLabel}</span><strong id="roleText">—</strong></div><div class="detail"><span>${copy.sessionLabel}</span><strong>${copy.sessionProtected}</strong></div></div><p class="security-note">${copy.securityNote}</p></div>
        <div id="homeActions"><a id="studioButton" class="button" href="/continue">${copy.openStudio}</a><a class="button secondary" href="/account">${copy.account}</a><button id="homeLogoutButton" class="secondary" type="button">${copy.signOut}</button></div>
        <div id="accountActions" class="hidden"><a id="accountStudioButton" class="button" href="/continue">${copy.openStudio}</a><a class="button secondary" href="/">${copy.backAuth}</a><button id="logoutButton" class="secondary" type="button">${copy.signOut}</button></div>
        <div id="authorizePanel" class="hidden"><div class="divider"></div><div class="app-box"><div class="app-name" id="clientName">${copy.appRequest}</div><div class="app-id" id="clientId"></div></div><ul class="permissions"><li><span class="tick">✓</span><span>${copy.p1}</span></li><li><span class="tick">✓</span><span>${copy.p2}</span></li></ul><button id="allowButton" type="button" disabled>${copy.allowLater}</button><p class="message">${copy.later}</p></div>
      </div>
    </section>
    <div class="foot">${authHost} · QssedA Identity</div>
  </main>
<script>
(function(){
  var page=document.body.dataset.page||"home";
  var loading=document.getElementById("loading"),signedOut=document.getElementById("signedOut"),signedIn=document.getElementById("signedIn"),loginForm=document.getElementById("loginForm"),loginButton=document.getElementById("loginButton"),loginMessage=document.getElementById("loginMessage"),logoutButton=document.getElementById("logoutButton"),homeLogoutButton=document.getElementById("homeLogoutButton");
  var copy=${JSON.stringify(copy)};
  function initials(name){var chars=Array.from(String(name||"Q").trim());return(chars.slice(0,2).join("")||"Q").toUpperCase()}
  function statusLabel(status){if(status==="active")return copy.active;if(status==="suspended")return copy.suspended;if(status==="banned")return copy.banned;return status||copy.active}
  function showLoggedOut(){loading.classList.add("hidden");signedIn.classList.add("hidden");signedOut.classList.remove("hidden");if(page==="authorize")document.getElementById("signedOutLead").textContent=copy.signInFirst}
  function showLoggedIn(data){
    var user=data.user||{};loading.classList.add("hidden");signedOut.classList.add("hidden");signedIn.classList.remove("hidden");document.getElementById("displayName").textContent=user.displayName||user.username||"QssedA User";document.getElementById("emailText").textContent=user.email||"";document.getElementById("statusText").textContent=statusLabel(user.status);
    var dot=document.getElementById("statusDot");dot.className="dot"+(user.status==="suspended"?" warning":user.status==="banned"?" danger":"");
    var blocked=!data.authorized;document.getElementById("blockedMessage").classList.toggle("hidden",!blocked);document.getElementById("studioButton").classList.toggle("hidden",blocked);document.getElementById("accountStudioButton").classList.toggle("hidden",blocked);document.getElementById("usernameText").textContent=user.username||"—";document.getElementById("roleText").textContent=user.role||"user";
    var avatar=document.getElementById("avatar");avatar.textContent=initials(user.displayName||user.username||user.email);if(user.avatarUrl){var img=document.createElement("img");img.alt="";img.src=user.avatarUrl;img.referrerPolicy="no-referrer";avatar.textContent="";avatar.appendChild(img)}
    document.getElementById("homeActions").classList.toggle("hidden",page!=="home"&&page!=="login");document.getElementById("accountActions").classList.toggle("hidden",page!=="account");document.getElementById("accountDetails").classList.toggle("hidden",page!=="account");document.getElementById("authorizePanel").classList.toggle("hidden",page!=="authorize");
    if(page==="account"){document.getElementById("signedInTitle").textContent=copy.accountTitle;document.getElementById("signedInLead").textContent=copy.accountLead}
    if(page==="authorize"){document.getElementById("signedInTitle").textContent=copy.authorizeTitle;document.getElementById("signedInLead").textContent=copy.authorizeLead;var params=new URLSearchParams(location.search);document.getElementById("clientId").textContent=params.get("client_id")||"client_id: —";document.getElementById("clientName").textContent=params.get("client_name")||copy.appRequest}
  }
  async function checkSession(){try{var response=await fetch("/api/session",{credentials:"same-origin",cache:"no-store"});var data=await response.json();if(response.ok&&data.authenticated&&data.user)showLoggedIn(data);else showLoggedOut()}catch(e){showLoggedOut();loginMessage.textContent=copy.connectError;loginMessage.classList.add("error")}}
  loginForm.addEventListener("submit",async function(event){event.preventDefault();loginMessage.textContent=copy.loggingIn;loginMessage.classList.remove("error");loginButton.disabled=true;try{var response=await fetch("/api/login",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({email:document.getElementById("email").value,password:document.getElementById("password").value})});var data=await response.json();if(!response.ok||!data.authenticated)throw new Error(data.error||"Login failed");document.getElementById("password").value="";var p=new URLSearchParams(location.search),n=p.get("next")||"";location.replace("/sso/start"+(n?"?next="+encodeURIComponent(n):""));return}catch(error){loginMessage.textContent=error&&error.message?error.message:"Login failed";loginMessage.classList.add("error")}finally{loginButton.disabled=false}});
  async function signOut(button){if(button)button.disabled=true;try{await fetch("/api/logout",{method:"POST",credentials:"same-origin"})}catch(e){}location.replace("/login")}
  if(logoutButton)logoutButton.addEventListener("click",function(){signOut(logoutButton)});
  if(homeLogoutButton)homeLogoutButton.addEventListener("click",function(){signOut(homeLogoutButton)});
  checkSession();
})();
</script>
</body>
</html>`;
}

function preferredLanguage(request) {
  const header = (request.headers.get("Accept-Language") || "").toLowerCase();
  return header.startsWith("zh") || header.includes(",zh") ? "zh" : "en";
}

function notFoundPage() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>404 · QssedA Auth</title></head><body style="font-family:system-ui;margin:40px"><h1>404</h1><p>Authentication page not found.</p><a href="/">QssedA Auth</a></body></html>`;
}
