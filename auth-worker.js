const SUPABASE_URL = "https://xunbsoxijasekzadckob.supabase.co";
const SUPABASE_KEY = "sb_publishable_1ScwEvseisteYNgc5xM1pQ_NNekUmF1";

const ACCESS_COOKIE = "qsseda_auth_access";
const REFRESH_COOKIE = "qsseda_auth_refresh";
const ACCESS_MAX_AGE = 60 * 60;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = normalizePath(url.pathname);

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
      return json({ success: true }, 200, clearSessionCookies());
    }

    if (pathname === "/health") {
      return json({ ok: true, service: "qsseda-auth", time: new Date().toISOString() });
    }

    if (["/", "/login", "/account", "/authorize"].includes(pathname)) {
      return html(authPage(pathname));
    }

    return html(notFoundPage(), 404);
  }
};

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function sameOrigin(request, url) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  return origin === url.origin;
}

async function handleLogin(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const email = typeof body?.email === "string" ? body.email.trim() : "";
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
  return json({ authenticated: true, user }, 200, sessionCookies(payload));
}

async function handleSession(request) {
  const cookies = parseCookies(request.headers.get("Cookie") || "");
  const accessToken = cookies[ACCESS_COOKIE] || "";
  const refreshToken = cookies[REFRESH_COOKIE] || "";

  if (accessToken) {
    const user = await fetchUser(accessToken);
    if (user) {
      const profile = await fetchProfile(accessToken, user.id);
      return json({ authenticated: true, user: publicUser(user, profile) });
    }
  }

  if (!refreshToken) {
    return json({ authenticated: false }, 200, accessToken ? clearSessionCookies() : []);
  }

  const refreshed = await refreshSession(refreshToken);
  if (!refreshed) {
    return json({ authenticated: false }, 200, clearSessionCookies());
  }

  const profile = await fetchProfile(refreshed.access_token, refreshed.user.id);
  return json({ authenticated: true, user: publicUser(refreshed.user, profile) }, 200, sessionCookies(refreshed));
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
    url.searchParams.set("select", "username,first_name,last_name,display_name,avatar_url,status");
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

function publicUser(user, profile) {
  const metadata = user?.user_metadata || {};
  const firstName = cleanText(profile?.first_name || metadata.first_name || metadata.firstName, 80);
  const lastName = cleanText(profile?.last_name || metadata.last_name || metadata.lastName, 80);
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
    status: cleanText(profile?.status, 32) || "authenticated"
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

function authPage(pathname) {
  const page = pathname === "/" ? "home" : pathname.slice(1);
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#0b0b0d" media="(prefers-color-scheme: dark)">
  <meta name="theme-color" content="#f5f5f7" media="(prefers-color-scheme: light)">
  <title>QssedA Auth</title>
  <style>
    :root{
      color-scheme:dark light;
      --bg:#07080a;
      --panel:rgba(27,28,32,.78);
      --panel-strong:#1d1f24;
      --surface:rgba(118,118,128,.16);
      --surface-hover:rgba(118,118,128,.23);
      --text:#f5f5f7;
      --muted:#a1a1a6;
      --quiet:#73737a;
      --line:rgba(255,255,255,.10);
      --line-strong:rgba(255,255,255,.17);
      --accent:#0a84ff;
      --accent-hover:#3198ff;
      --danger:#ff453a;
      --success:#30d158;
      --shadow:0 28px 80px rgba(0,0,0,.46);
      --radius:22px;
      --control:14px;
    }
    @media (prefers-color-scheme:light){
      :root{
        --bg:#f3f4f7;
        --panel:rgba(255,255,255,.84);
        --panel-strong:#fff;
        --surface:rgba(116,116,128,.10);
        --surface-hover:rgba(116,116,128,.16);
        --text:#111114;
        --muted:#62626a;
        --quiet:#85858d;
        --line:rgba(20,20,30,.09);
        --line-strong:rgba(20,20,30,.15);
        --accent:#0071e3;
        --accent-hover:#0077ed;
        --danger:#d70015;
        --success:#248a3d;
        --shadow:0 28px 70px rgba(38,44,60,.14);
      }
    }
    *{box-sizing:border-box}
    html,body{min-height:100%;margin:0}
    body{
      min-height:100vh;
      min-height:100dvh;
      display:grid;
      place-items:center;
      padding:max(22px,env(safe-area-inset-top)) max(18px,env(safe-area-inset-right)) max(22px,env(safe-area-inset-bottom)) max(18px,env(safe-area-inset-left));
      font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif;
      background:
        radial-gradient(circle at 18% 12%,rgba(10,132,255,.16),transparent 34%),
        radial-gradient(circle at 82% 78%,rgba(94,92,230,.12),transparent 31%),
        var(--bg);
      color:var(--text);
    }
    .shell{width:min(100%,460px)}
    .brand{display:flex;align-items:center;gap:12px;margin:0 0 18px 4px}
    .mark{
      width:42px;height:42px;border-radius:13px;display:grid;place-items:center;
      background:linear-gradient(145deg,#2997ff,#0067d8);color:#fff;font-weight:800;letter-spacing:-.04em;
      box-shadow:0 10px 28px rgba(0,113,227,.24)
    }
    .brand-copy strong{display:block;font-size:15px;letter-spacing:-.01em}
    .brand-copy span{display:block;margin-top:2px;color:var(--muted);font-size:12px}
    .card{
      position:relative;overflow:hidden;
      border:1px solid var(--line);border-radius:var(--radius);
      background:var(--panel);backdrop-filter:blur(30px) saturate(150%);
      -webkit-backdrop-filter:blur(30px) saturate(150%);
      box-shadow:var(--shadow);padding:30px;
    }
    .card:before{content:"";position:absolute;inset:0 0 auto;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.42),transparent);opacity:.65}
    h1{margin:0;font-size:31px;line-height:1.08;letter-spacing:-.04em;font-weight:760}
    .lead{margin:10px 0 24px;color:var(--muted);font-size:14px;line-height:1.55}
    .hidden{display:none!important}
    .loading{display:flex;align-items:center;gap:12px;color:var(--muted);padding:8px 0}
    .spinner{width:18px;height:18px;border:2px solid var(--line-strong);border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    label{display:block;margin:0 0 8px;color:var(--muted);font-size:13px;font-weight:600}
    .field{margin-top:16px}
    input{
      width:100%;height:50px;border-radius:var(--control);border:1px solid var(--line);
      padding:0 14px;background:var(--surface);color:var(--text);font:inherit;font-size:15px;outline:none;
      transition:.18s ease border-color,.18s ease box-shadow,.18s ease background
    }
    input:focus{border-color:color-mix(in srgb,var(--accent) 72%,transparent);box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 15%,transparent);background:var(--panel-strong)}
    button,.button{
      width:100%;min-height:50px;margin-top:18px;border:0;border-radius:var(--control);padding:0 16px;
      display:inline-flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;
      background:var(--accent);color:white;font:inherit;font-size:15px;font-weight:700;cursor:pointer;
      transition:.16s ease transform,.16s ease background,.16s ease opacity
    }
    button:hover,.button:hover{background:var(--accent-hover)}
    button:active,.button:active{transform:scale(.985)}
    button:disabled{opacity:.48;cursor:not-allowed}
    .secondary{background:var(--surface);color:var(--text);border:1px solid var(--line)}
    .secondary:hover{background:var(--surface-hover)}
    .text-button{background:transparent;color:var(--muted);border:0;min-height:42px;margin-top:8px}
    .text-button:hover{background:var(--surface);color:var(--text)}
    .message{min-height:20px;margin:13px 0 0;color:var(--muted);font-size:13px;line-height:1.45}
    .message.error{color:var(--danger)}
    .account{display:flex;align-items:center;gap:14px;padding:16px;border-radius:17px;background:var(--surface);border:1px solid var(--line)}
    .avatar{width:48px;height:48px;flex:0 0 48px;border-radius:50%;display:grid;place-items:center;overflow:hidden;background:linear-gradient(145deg,#5e5ce6,#0a84ff);color:#fff;font-weight:800;font-size:17px}
    .avatar img{width:100%;height:100%;object-fit:cover}
    .identity{min-width:0;flex:1}
    .identity strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:15px}
    .identity span{display:block;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--muted);font-size:12px}
    .badge{display:inline-flex;align-items:center;gap:6px;margin-top:9px;color:var(--muted);font-size:12px}
    .dot{width:7px;height:7px;border-radius:50%;background:var(--success);box-shadow:0 0 0 4px color-mix(in srgb,var(--success) 12%,transparent)}
    .divider{height:1px;background:var(--line);margin:22px 0}
    .app-box{padding:16px;border:1px solid var(--line);border-radius:17px;background:var(--surface)}
    .app-name{font-weight:700;font-size:15px}
    .app-id{margin-top:5px;color:var(--quiet);font:12px ui-monospace,SFMono-Regular,Menlo,monospace;overflow-wrap:anywhere}
    .permissions{margin:16px 0 0;padding:0;list-style:none}
    .permissions li{display:flex;gap:10px;padding:9px 0;color:var(--muted);font-size:13px;border-bottom:1px solid var(--line)}
    .permissions li:last-child{border-bottom:0}
    .tick{color:var(--accent);font-weight:900}
    .foot{margin:16px 2px 0;text-align:center;color:var(--quiet);font-size:11px;line-height:1.5}
    @media(max-width:520px){.card{padding:24px 20px;border-radius:20px}h1{font-size:28px}.brand{margin-left:2px}}
    @media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.001ms!important;transition-duration:.001ms!important}}
  </style>
</head>
<body data-page="${page}">
  <main class="shell">
    <div class="brand">
      <div class="mark" aria-hidden="true">Q</div>
      <div class="brand-copy"><strong>QssedA Auth</strong><span>QssedA Studio Account</span></div>
    </div>

    <section class="card">
      <div id="loading" class="loading"><span class="spinner"></span><span>正在检查登录状态…</span></div>

      <div id="signedOut" class="hidden">
        <h1>登录 QssedA</h1>
        <p class="lead">使用你的 QssedA Studio 账号继续。认证状态由 auth.qsseda.studio 独立维护。</p>
        <form id="loginForm" autocomplete="on">
          <div class="field"><label for="email">邮箱</label><input id="email" name="email" type="email" autocomplete="username" inputmode="email" required></div>
          <div class="field"><label for="password">密码</label><input id="password" name="password" type="password" autocomplete="current-password" required></div>
          <button id="loginButton" type="submit">继续</button>
          <div id="loginMessage" class="message" role="status" aria-live="polite"></div>
        </form>
        <a class="button secondary" href="https://qsseda.studio/sign-up">创建账号</a>
      </div>

      <div id="signedIn" class="hidden">
        <h1 id="signedInTitle">你已登录</h1>
        <p class="lead" id="signedInLead">QssedA Auth 已识别当前会话。</p>
        <div class="account">
          <div id="avatar" class="avatar">Q</div>
          <div class="identity"><strong id="displayName">QssedA User</strong><span id="emailText"></span><div class="badge"><span class="dot"></span><span id="statusText">已认证</span></div></div>
        </div>
        <div id="homeActions">
          <a class="button" href="https://qsseda.studio/">继续前往 QssedA Studio</a>
          <a class="button secondary" href="/account">账号状态</a>
        </div>
        <div id="accountActions" class="hidden">
          <a class="button" href="https://qsseda.studio/">打开 QssedA Studio</a>
          <button id="logoutButton" class="secondary" type="button">退出登录</button>
        </div>
        <div id="authorizePanel" class="hidden">
          <div class="divider"></div>
          <div class="app-box"><div class="app-name" id="clientName">应用请求访问你的账号</div><div class="app-id" id="clientId"></div></div>
          <ul class="permissions"><li><span class="tick">✓</span><span>读取基础账号身份</span></li><li><span class="tick">✓</span><span>确认账号当前是否已登录</span></li></ul>
          <button type="button" disabled>允许（下一阶段启用）</button>
          <p class="message">当前版本先完成认证中心与会话识别界面，尚未签发第三方应用授权码。</p>
        </div>
      </div>
    </section>
    <div class="foot">auth.qsseda.studio · QssedA Studio Identity</div>
  </main>

<script>
(function(){
  var page = document.body.dataset.page || "home";
  var loading = document.getElementById("loading");
  var signedOut = document.getElementById("signedOut");
  var signedIn = document.getElementById("signedIn");
  var loginForm = document.getElementById("loginForm");
  var loginButton = document.getElementById("loginButton");
  var loginMessage = document.getElementById("loginMessage");
  var logoutButton = document.getElementById("logoutButton");

  function initials(name){
    var chars = Array.from(String(name || "Q").trim());
    return (chars.slice(0,2).join("") || "Q").toUpperCase();
  }

  function showLoggedOut(){
    loading.classList.add("hidden");
    signedIn.classList.add("hidden");
    signedOut.classList.remove("hidden");
    if(page === "authorize"){
      document.querySelector("#signedOut .lead").textContent = "请先登录，再继续应用授权。";
    }
  }

  function showLoggedIn(user){
    loading.classList.add("hidden");
    signedOut.classList.add("hidden");
    signedIn.classList.remove("hidden");
    document.getElementById("displayName").textContent = user.displayName || user.username || "QssedA User";
    document.getElementById("emailText").textContent = user.email || "";
    document.getElementById("statusText").textContent = user.status === "active" ? "账号已启用" : (user.status || "已认证");
    var avatar = document.getElementById("avatar");
    avatar.textContent = initials(user.displayName || user.username || user.email);
    if(user.avatarUrl){
      var img = document.createElement("img");
      img.alt = "";
      img.src = user.avatarUrl;
      img.referrerPolicy = "no-referrer";
      avatar.textContent = "";
      avatar.appendChild(img);
    }

    document.getElementById("homeActions").classList.toggle("hidden", page !== "home" && page !== "login");
    document.getElementById("accountActions").classList.toggle("hidden", page !== "account");
    document.getElementById("authorizePanel").classList.toggle("hidden", page !== "authorize");

    if(page === "account"){
      document.getElementById("signedInTitle").textContent = "账号状态";
      document.getElementById("signedInLead").textContent = "这个页面直接读取 auth.qsseda.studio 的当前认证会话。";
    }
    if(page === "authorize"){
      document.getElementById("signedInTitle").textContent = "授权应用";
      document.getElementById("signedInLead").textContent = "确认要使用哪个 QssedA 账号继续。";
      var params = new URLSearchParams(location.search);
      var clientId = params.get("client_id") || "未指定 client_id";
      var clientName = params.get("client_name") || "一个应用请求访问你的账号";
      document.getElementById("clientId").textContent = clientId;
      document.getElementById("clientName").textContent = clientName;
    }
  }

  async function checkSession(){
    try{
      var response = await fetch("/api/session", { credentials:"same-origin", cache:"no-store" });
      var data = await response.json();
      if(response.ok && data.authenticated && data.user) showLoggedIn(data.user);
      else showLoggedOut();
    }catch(e){
      showLoggedOut();
      loginMessage.textContent = "暂时无法连接认证服务，请稍后重试。";
      loginMessage.classList.add("error");
    }
  }

  loginForm.addEventListener("submit", async function(event){
    event.preventDefault();
    loginMessage.textContent = "正在登录…";
    loginMessage.classList.remove("error");
    loginButton.disabled = true;
    try{
      var response = await fetch("/api/login", {
        method:"POST",
        credentials:"same-origin",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({email:document.getElementById("email").value,password:document.getElementById("password").value})
      });
      var data = await response.json();
      if(!response.ok || !data.authenticated){
        throw new Error(data.error || "登录失败");
      }
      document.getElementById("password").value = "";
      showLoggedIn(data.user);
    }catch(error){
      loginMessage.textContent = error && error.message ? error.message : "登录失败";
      loginMessage.classList.add("error");
    }finally{
      loginButton.disabled = false;
    }
  });

  if(logoutButton){
    logoutButton.addEventListener("click", async function(){
      logoutButton.disabled = true;
      try{ await fetch("/api/logout", {method:"POST",credentials:"same-origin"}); }catch(e){}
      location.replace("/login");
    });
  }

  checkSession();
})();
</script>
</body>
</html>`;
}

function notFoundPage() {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>404 · QssedA Auth</title></head><body style="font-family:system-ui;margin:40px"><h1>404</h1><p>认证页面不存在。</p><a href="/">返回 QssedA Auth</a></body></html>`;
}
