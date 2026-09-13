const SUPABASE_URL = "https://xunbsoxijasekzadckob.supabase.co";
const SUPABASE_KEY = "sb_publishable_1ScwEvseisteYNgc5xM1pQ_NNekUmF1";
const ACCESS_COOKIE = "__Host-qsseda-access";
const ISSUER = "https://auth.qsseda.studio";
const DEFAULT_SCOPE = "profile.read session.read";
const CODE_CHALLENGE_PATTERN = /^[A-Za-z0-9_-]{43,128}$/;
const STATE_PATTERN = /^[\x21-\x7E]{16,512}$/;

export async function handleOAuthRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";

  if (pathname === "/.well-known/oauth-authorization-server") {
    if (request.method !== "GET") return oauthError("invalid_request", "Method not allowed", 405);
    return metadataResponse(url.origin);
  }

  if (pathname === "/authorize") {
    if (request.method !== "GET") return oauthError("invalid_request", "Method not allowed", 405);
    return handleAuthorizePage(request);
  }

  if (pathname === "/api/oauth/authorize") {
    if (request.method !== "POST") return oauthError("invalid_request", "Method not allowed", 405);
    if (!sameOrigin(request, url)) return oauthError("invalid_request", "Invalid origin", 403);
    return handleAuthorizeDecision(request);
  }

  if (pathname === "/oauth/token") {
    if (request.method !== "POST") return oauthError("invalid_request", "Method not allowed", 405);
    return handleToken(request);
  }

  if (pathname === "/oauth/revoke") {
    if (request.method !== "POST") return oauthError("invalid_request", "Method not allowed", 405);
    return handleRevoke(request);
  }

  if (pathname === "/oauth/introspect") {
    if (request.method !== "POST") return oauthError("invalid_request", "Method not allowed", 405);
    return handleIntrospect(request);
  }

  return oauthError("invalid_request", "OAuth endpoint not found", 404);
}

async function handleAuthorizePage(request) {
  const url = new URL(request.url);
  const params = readAuthorizationParams(url.searchParams);
  const validation = validateAuthorizationParams(params);
  if (!validation.ok) return html(errorPage(validation.error, validation.description), 400);

  const client = await validateClient(params.client_id, params.redirect_uri, params.scope);
  if (!client) return html(errorPage("invalid_request", "Unknown client, redirect URI, or scope."), 400);

  return html(authorizePage({ ...params, client }), 200);
}

async function handleAuthorizeDecision(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return oauthError("invalid_request", "Invalid JSON body", 400);
  }

  const params = {
    response_type: clean(body?.response_type, 32),
    client_id: clean(body?.client_id, 160),
    redirect_uri: clean(body?.redirect_uri, 1000),
    scope: normalizeScope(clean(body?.scope, 500) || DEFAULT_SCOPE),
    state: clean(body?.state, 512),
    code_challenge: clean(body?.code_challenge, 160),
    code_challenge_method: clean(body?.code_challenge_method, 16),
    decision: clean(body?.decision, 16)
  };

  const validation = validateAuthorizationParams(params);
  if (!validation.ok) return oauthError(validation.error, validation.description, 400);

  const client = await validateClient(params.client_id, params.redirect_uri, params.scope);
  if (!client) return oauthError("invalid_request", "Unknown client, redirect URI, or scope", 400);

  if (params.decision === "deny") {
    return json({ redirect_to: callbackUrl(params.redirect_uri, { error: "access_denied", state: params.state }) });
  }
  if (params.decision !== "allow") return oauthError("invalid_request", "Invalid decision", 400);

  const cookies = parseCookies(request.headers.get("Cookie") || "");
  const accessToken = cookies[ACCESS_COOKIE] || "";
  if (!accessToken) return oauthError("login_required", "Sign in before authorizing this application", 401);

  const issued = await rpc("oauth_issue_authorization_code", {
    p_client_id: params.client_id,
    p_redirect_uri: params.redirect_uri,
    p_scope: params.scope,
    p_code_challenge: params.code_challenge
  }, accessToken);

  const row = firstRow(issued);
  if (!row?.authorization_code) {
    return oauthError("server_error", "Unable to issue authorization code", 500);
  }

  return json({
    redirect_to: callbackUrl(params.redirect_uri, {
      code: row.authorization_code,
      state: params.state
    }),
    expires_in: Number(row.expires_in) || 300
  });
}

async function handleToken(request) {
  const form = await readForm(request);
  if (!form) return tokenError("invalid_request", "Expected application/x-www-form-urlencoded body", 400);

  const grantType = clean(form.get("grant_type"), 64);
  const clientId = clean(form.get("client_id"), 160);
  if (!clientId) return tokenError("invalid_request", "client_id is required", 400);

  if (grantType === "authorization_code") {
    const code = clean(form.get("code"), 500);
    const redirectUri = clean(form.get("redirect_uri"), 1000);
    const verifier = clean(form.get("code_verifier"), 256);
    if (!code || !redirectUri || !verifier) {
      return tokenError("invalid_request", "code, redirect_uri and code_verifier are required", 400);
    }

    const exchanged = await rpc("oauth_exchange_authorization_code", {
      p_client_id: clientId,
      p_redirect_uri: redirectUri,
      p_code: code,
      p_code_verifier: verifier
    });
    const row = firstRow(exchanged);
    if (!row?.access_token || !row?.refresh_token) {
      return tokenError("invalid_grant", "Authorization code is invalid, expired, already used, or PKCE verification failed", 400);
    }
    return tokenSuccess(row);
  }

  if (grantType === "refresh_token") {
    const refreshToken = clean(form.get("refresh_token"), 1000);
    if (!refreshToken) return tokenError("invalid_request", "refresh_token is required", 400);

    const refreshed = await rpc("oauth_refresh_access_token", {
      p_client_id: clientId,
      p_refresh_token: refreshToken
    });
    const row = firstRow(refreshed);
    if (!row?.access_token || !row?.refresh_token) {
      return tokenError("invalid_grant", "Refresh token is invalid, expired or revoked", 400);
    }
    return tokenSuccess(row);
  }

  return tokenError("unsupported_grant_type", "Supported grant types are authorization_code and refresh_token", 400);
}

async function handleRevoke(request) {
  const form = await readForm(request);
  if (!form) return oauthError("invalid_request", "Expected application/x-www-form-urlencoded body", 400);
  const clientId = clean(form.get("client_id"), 160);
  const token = clean(form.get("token"), 1200);
  if (!clientId || !token) return oauthError("invalid_request", "client_id and token are required", 400);

  await rpc("oauth_revoke_token", { p_client_id: clientId, p_token: token });
  return new Response(null, { status: 200, headers: oauthHeaders("application/json;charset=UTF-8") });
}

async function handleIntrospect(request) {
  const form = await readForm(request);
  if (!form) return oauthError("invalid_request", "Expected application/x-www-form-urlencoded body", 400);
  const token = clean(form.get("token"), 1200);
  if (!token) return oauthError("invalid_request", "token is required", 400);

  const result = await rpc("oauth_introspect_access_token", { p_access_token: token });
  const row = firstRow(result);
  if (!row?.active) return json({ active: false });
  return json({
    active: true,
    client_id: row.client_id,
    sub: row.user_id,
    scope: row.scope || "",
    token_type: "Bearer",
    exp: row.expires_at ? Math.floor(new Date(row.expires_at).getTime() / 1000) : undefined
  });
}

function metadataResponse(origin) {
  const issuer = origin === ISSUER ? ISSUER : origin;
  return json({
    issuer,
    authorization_endpoint: `${issuer}/authorize`,
    token_endpoint: `${issuer}/oauth/token`,
    revocation_endpoint: `${issuer}/oauth/revoke`,
    introspection_endpoint: `${issuer}/oauth/introspect`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
    scopes_supported: ["profile.read", "session.read"]
  });
}

function readAuthorizationParams(searchParams) {
  return {
    response_type: clean(searchParams.get("response_type"), 32),
    client_id: clean(searchParams.get("client_id"), 160),
    redirect_uri: clean(searchParams.get("redirect_uri"), 1000),
    scope: normalizeScope(clean(searchParams.get("scope"), 500) || DEFAULT_SCOPE),
    state: clean(searchParams.get("state"), 512),
    code_challenge: clean(searchParams.get("code_challenge"), 160),
    code_challenge_method: clean(searchParams.get("code_challenge_method"), 16)
  };
}

function validateAuthorizationParams(params) {
  if (params.response_type !== "code") return invalid("unsupported_response_type", "response_type must be code");
  if (!params.client_id) return invalid("invalid_request", "client_id is required");
  if (!params.redirect_uri) return invalid("invalid_request", "redirect_uri is required");
  if (!STATE_PATTERN.test(params.state || "")) return invalid("invalid_request", "state must contain 16 to 512 printable ASCII characters");
  if (params.code_challenge_method !== "S256") return invalid("invalid_request", "Only PKCE S256 is supported");
  if (!CODE_CHALLENGE_PATTERN.test(params.code_challenge || "")) return invalid("invalid_request", "Invalid PKCE code_challenge");
  return { ok: true };
}

function invalid(error, description) {
  return { ok: false, error, description };
}

async function validateClient(clientId, redirectUri, scope) {
  const result = await rpc("oauth_validate_client", {
    p_client_id: clientId,
    p_redirect_uri: redirectUri,
    p_scope: scope
  });
  return firstRow(result) || null;
}

async function rpc(name, body, bearer = "") {
  const headers = {
    apikey: SUPABASE_KEY,
    "content-type": "application/json"
  };
  if (bearer) headers.Authorization = `Bearer ${bearer}`;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function firstRow(value) {
  if (Array.isArray(value)) return value[0] || null;
  if (value && typeof value === "object") return value;
  return null;
}

async function readForm(request) {
  const type = (request.headers.get("content-type") || "").toLowerCase();
  if (!type.includes("application/x-www-form-urlencoded")) return null;
  try {
    return new URLSearchParams(await request.text());
  } catch {
    return null;
  }
}

function tokenSuccess(row) {
  const headers = oauthHeaders("application/json;charset=UTF-8");
  headers.set("pragma", "no-cache");
  return new Response(JSON.stringify({
    access_token: row.access_token,
    token_type: "Bearer",
    expires_in: Number(row.expires_in) || 1800,
    refresh_token: row.refresh_token,
    scope: row.scope || DEFAULT_SCOPE
  }), { status: 200, headers });
}

function tokenError(error, description, status) {
  const headers = oauthHeaders("application/json;charset=UTF-8");
  headers.set("pragma", "no-cache");
  return new Response(JSON.stringify({ error, error_description: description }), { status, headers });
}

function oauthError(error, description, status) {
  return new Response(JSON.stringify({ error, error_description: description }), {
    status,
    headers: oauthHeaders("application/json;charset=UTF-8")
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: oauthHeaders("application/json;charset=UTF-8") });
}

function html(content, status = 200) {
  const headers = oauthHeaders("text/html;charset=UTF-8");
  headers.set("content-security-policy", "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
  return new Response(content, { status, headers });
}

function oauthHeaders(contentType) {
  return new Headers({
    "content-type": contentType,
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "x-frame-options": "DENY",
    "strict-transport-security": "max-age=31536000",
    "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=()"
  });
}

function sameOrigin(request, url) {
  return (request.headers.get("Origin") || "") === url.origin;
}

function callbackUrl(redirectUri, values) {
  const target = new URL(redirectUri);
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== null && value !== "") target.searchParams.set(key, String(value));
  }
  return target.toString();
}

function normalizeScope(value) {
  return String(value || "").trim().split(/\s+/).filter(Boolean).filter((scope, index, all) => all.indexOf(scope) === index).join(" ");
}

function clean(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
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

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
}

function errorPage(error, description) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>QssedA Auth</title><style>${pageCss()}</style></head><body><main class="shell"><div class="brand"><div class="mark">Q</div><div><strong>QssedA Auth</strong><span>OAuth 2.0 + PKCE</span></div></div><section class="card"><h1>无法授权</h1><p>${escapeHtml(description)}</p><div class="error-code">${escapeHtml(error)}</div><a class="button secondary" href="/">返回认证中心</a></section></main></body></html>`;
}

function authorizePage(data) {
  const payload = JSON.stringify({
    response_type: data.response_type,
    client_id: data.client_id,
    redirect_uri: data.redirect_uri,
    scope: data.scope,
    state: data.state,
    code_challenge: data.code_challenge,
    code_challenge_method: data.code_challenge_method
  }).replace(/</g, "\\u003c");
  const scopes = String(data.scope || "").split(/\s+/).filter(Boolean);
  const scopeText = scopes.map(scope => `<li><span class="tick">✓</span><span>${escapeHtml(scopeLabel(scope))}</span></li>`).join("");

  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#07080a"><title>授权应用 · QssedA Auth</title><style>${pageCss()}</style></head><body><main class="shell"><div class="brand"><div class="mark">Q</div><div><strong>QssedA Auth</strong><span>安全应用授权</span></div></div><section class="card"><div id="loading" class="loading"><span class="spinner"></span><span>正在检查登录状态…</span></div><div id="signedOut" class="hidden"><h1>登录以继续</h1><p>使用你的 QssedA Studio 账号授权此应用。</p><form id="loginForm"><label>邮箱<input id="email" type="email" autocomplete="username" required></label><label>密码<input id="password" type="password" autocomplete="current-password" required></label><button id="loginButton" type="submit">登录</button><div id="loginMessage" class="message"></div></form></div><div id="consent" class="hidden"><h1>授权应用</h1><p><strong>${escapeHtml(data.client.display_name || data.client_id)}</strong> 请求使用你的 QssedA 账号。</p><div class="account" id="accountBox"><div class="avatar" id="avatar">Q</div><div><strong id="displayName">QssedA User</strong><span id="emailText"></span></div></div><div class="app"><strong>${escapeHtml(data.client.display_name || data.client_id)}</strong><code>${escapeHtml(data.client_id)}</code><small>${escapeHtml(data.redirect_uri)}</small></div><ul>${scopeText}</ul><div class="buttons"><button id="allowButton" type="button">允许</button><button id="denyButton" class="secondary" type="button">取消</button></div><div id="decisionMessage" class="message"></div><p class="note">使用 OAuth 2.0 Authorization Code + PKCE (S256)。QssedA 不会向应用提供你的密码。</p></div></section><div class="foot">auth.qsseda.studio · QssedA Identity</div></main><script>(function(){const params=${payload};const loading=document.getElementById('loading'),signedOut=document.getElementById('signedOut'),consent=document.getElementById('consent'),loginForm=document.getElementById('loginForm'),loginButton=document.getElementById('loginButton'),loginMessage=document.getElementById('loginMessage'),decisionMessage=document.getElementById('decisionMessage');function initials(v){return Array.from(String(v||'Q').trim()).slice(0,2).join('').toUpperCase()||'Q'}function showUser(data){loading.classList.add('hidden');signedOut.classList.add('hidden');consent.classList.remove('hidden');const u=data.user||{};document.getElementById('displayName').textContent=u.displayName||u.username||'QssedA User';document.getElementById('emailText').textContent=u.email||'';document.getElementById('avatar').textContent=initials(u.displayName||u.username||u.email)}function showLogin(){loading.classList.add('hidden');consent.classList.add('hidden');signedOut.classList.remove('hidden')}async function session(){try{const r=await fetch('/api/session',{credentials:'same-origin',cache:'no-store'});const d=await r.json();if(r.ok&&d.authenticated&&d.authorized&&d.user)showUser(d);else showLogin()}catch{showLogin()}}loginForm.addEventListener('submit',async e=>{e.preventDefault();loginButton.disabled=true;loginMessage.textContent='正在登录…';try{const r=await fetch('/api/login',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({email:document.getElementById('email').value,password:document.getElementById('password').value})});const d=await r.json();if(!r.ok||!d.authenticated)throw new Error(d.error||'登录失败');document.getElementById('password').value='';showUser(d)}catch(err){loginMessage.textContent=err.message||'登录失败'}finally{loginButton.disabled=false}});async function decide(decision){document.getElementById('allowButton').disabled=true;document.getElementById('denyButton').disabled=true;decisionMessage.textContent=decision==='allow'?'正在授权…':'正在取消…';try{const r=await fetch('/api/oauth/authorize',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({...params,decision})});const d=await r.json();if(!r.ok||!d.redirect_to)throw new Error(d.error_description||d.error||'授权失败');location.href=d.redirect_to}catch(err){decisionMessage.textContent=err.message||'授权失败';document.getElementById('allowButton').disabled=false;document.getElementById('denyButton').disabled=false}}document.getElementById('allowButton').addEventListener('click',()=>decide('allow'));document.getElementById('denyButton').addEventListener('click',()=>decide('deny'));session()})();</script></body></html>`;
}

function scopeLabel(scope) {
  if (scope === "profile.read") return "读取你的基础账号资料";
  if (scope === "session.read") return "确认你的账号与会话状态";
  return scope;
}

function pageCss() {
  return `:root{color-scheme:dark light;--bg:#07080a;--panel:rgba(27,28,32,.82);--surface:rgba(118,118,128,.16);--text:#f5f5f7;--muted:#a1a1a6;--line:rgba(255,255,255,.12);--accent:#0a84ff;--danger:#ff453a}@media(prefers-color-scheme:light){:root{--bg:#f3f4f7;--panel:rgba(255,255,255,.88);--surface:rgba(116,116,128,.10);--text:#111114;--muted:#62626a;--line:rgba(20,20,30,.11);--accent:#0071e3;--danger:#d70015}}*{box-sizing:border-box}html,body{min-height:100%;margin:0}body{min-height:100dvh;display:grid;place-items:center;padding:max(22px,env(safe-area-inset-top)) max(18px,env(safe-area-inset-right)) max(22px,env(safe-area-inset-bottom)) max(18px,env(safe-area-inset-left));font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif;background:radial-gradient(circle at 18% 12%,rgba(10,132,255,.16),transparent 34%),var(--bg);color:var(--text)}.shell{width:min(100%,460px)}.brand{display:flex;gap:12px;align-items:center;margin:0 0 18px 4px}.brand>div:last-child strong{display:block}.brand>div:last-child span{display:block;color:var(--muted);font-size:12px;margin-top:2px}.mark{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:linear-gradient(145deg,#2997ff,#0067d8);color:white;font-weight:800}.card{border:1px solid var(--line);border-radius:22px;background:var(--panel);backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);padding:28px;box-shadow:0 28px 80px rgba(0,0,0,.35)}h1{margin:0;font-size:30px;letter-spacing:-.04em}p{color:var(--muted);line-height:1.55}.hidden{display:none!important}.loading{display:flex;gap:12px;align-items:center;color:var(--muted)}.spinner{width:18px;height:18px;border:2px solid var(--line);border-top-color:var(--accent);border-radius:50%;animation:s .8s linear infinite}@keyframes s{to{transform:rotate(360deg)}}label{display:block;color:var(--muted);font-size:13px;margin-top:15px}input{display:block;width:100%;height:48px;margin-top:7px;padding:0 13px;border:1px solid var(--line);border-radius:13px;background:var(--surface);color:var(--text);font:inherit;outline:none}input:focus{border-color:var(--accent)}button,.button{width:100%;min-height:50px;margin-top:16px;border:0;border-radius:14px;background:var(--accent);color:white;font:inherit;font-weight:700;cursor:pointer}.secondary{background:var(--surface);color:var(--text);border:1px solid var(--line)}button:disabled{opacity:.5}.message{margin-top:12px;color:var(--danger);font-size:13px}.account{display:flex;align-items:center;gap:12px;padding:14px;border-radius:16px;background:var(--surface);border:1px solid var(--line)}.account .avatar{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,#5e5ce6,#0a84ff);color:white;font-weight:800}.account strong,.account span{display:block}.account span{color:var(--muted);font-size:12px;margin-top:3px}.app{margin-top:16px;padding:15px;border-radius:16px;background:var(--surface);border:1px solid var(--line)}.app strong,.app code,.app small{display:block}.app code{margin-top:6px;color:var(--muted);overflow-wrap:anywhere}.app small{margin-top:7px;color:var(--muted);overflow-wrap:anywhere}ul{list-style:none;padding:0;margin:15px 0}li{display:flex;gap:9px;padding:10px 0;border-bottom:1px solid var(--line);color:var(--muted);font-size:13px}.tick{color:var(--accent);font-weight:800}.buttons{display:grid;grid-template-columns:1fr 1fr;gap:10px}.note,.foot{font-size:11px}.foot{text-align:center;color:var(--muted);margin-top:15px}.error-code{font:12px ui-monospace,monospace;color:var(--danger);padding:12px;background:var(--surface);border-radius:12px}.button{display:flex;align-items:center;justify-content:center;text-decoration:none}`;
}
