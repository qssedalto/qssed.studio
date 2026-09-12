import fs from 'node:fs';

function replaceOnce(text, needle, replacement, label) {
  const count = text.split(needle).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one match, found ${count}`);
  return text.replace(needle, replacement);
}

function insertAfter(text, needle, addition, label) {
  return replaceOnce(text, needle, needle + addition, label);
}

let auth = fs.readFileSync('auth-worker.js', 'utf8');
let main = fs.readFileSync('worker.js', 'utf8');

// Auth Worker: make the portal the source session and hand off a validated session to Studio by POST.
auth = replaceOnce(auth, '  async fetch(request) {', '  async fetch(request, env) {', 'auth fetch env');

auth = insertAfter(
  auth,
  '    if (pathname === "/api/logout") {\n      if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);\n      if (!sameOrigin(request, url)) return json({ error: "Invalid origin" }, 403);\n      return handleLogout(request);\n    }\n',
  '\n    if (pathname === "/continue") {\n      if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);\n      return handleContinue(request, env);\n    }\n',
  'auth continue route'
);

const authContinueFunctions = [
  '',
  'async function handleContinue(request, env) {',
  '  const cookies = parseCookies(request.headers.get("Cookie") || "");',
  '  let accessToken = cookies[ACCESS_COOKIE] || "";',
  '  let refreshToken = cookies[REFRESH_COOKIE] || "";',
  '  let authUser = accessToken ? await fetchUser(accessToken) : null;',
  '  let rotated = null;',
  '',
  '  if (!authUser && refreshToken) {',
  '    rotated = await refreshSession(refreshToken);',
  '    if (rotated) {',
  '      accessToken = rotated.access_token;',
  '      refreshToken = rotated.refresh_token;',
  '      authUser = rotated.user;',
  '    }',
  '  }',
  '',
  '  if (!authUser || !accessToken || !refreshToken) {',
  '    return redirectResponse("/login");',
  '  }',
  '',
  '  const profile = await fetchProfile(accessToken, authUser.id);',
  '  const user = publicUser(authUser, profile);',
  '  if (user.status !== ACTIVE_STATUS) {',
  '    return redirectResponse("/account");',
  '  }',
  '',
  '  const requestUrl = new URL(request.url);',
  '  const next = safeNextPath(requestUrl.searchParams.get("next"));',
  '  const mainSite = safeHttpsOrigin(env?.MAIN_SITE_URL) || "https://qsseda.studio";',
  '  const headers = new Headers(baseHeaders("text/html;charset=UTF-8"));',
  '  headers.set("referrer-policy", "no-referrer");',
  '  headers.set("content-security-policy", `default-src \'none\'; style-src \'unsafe-inline\'; script-src \'unsafe-inline\'; form-action ${mainSite}; base-uri \'none\'; frame-ancestors \'none\'`);',
  '  if (rotated) for (const value of sessionCookies(rotated)) headers.append("set-cookie", value);',
  '',
  '  return new Response(handoffPage(mainSite, accessToken, refreshToken, next), { status: 200, headers });',
  '}',
  '',
  'function safeNextPath(value) {',
  '  const path = cleanText(value, 500);',
  '  return path.startsWith("/") && !path.startsWith("//") ? path : "/dashboard";',
  '}',
  '',
  'function safeHttpsOrigin(value) {',
  '  const text = cleanText(value, 500);',
  '  if (!text) return "";',
  '  try {',
  '    const url = new URL(text);',
  '    return url.protocol === "https:" ? url.origin : "";',
  '  } catch {',
  '    return "";',
  '  }',
  '}',
  '',
  'function redirectResponse(path) {',
  '  return new Response(null, { status: 302, headers: { location: path, "cache-control": "no-store" } });',
  '}',
  '',
  'function htmlEscape(value) {',
  '  return String(value || "").replace(/[&<>"\']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\\\"": "&quot;", "\\\'": "&#39;" }[character]));',
  '}',
  '',
  'function handoffPage(mainSite, accessToken, refreshToken, next) {',
  '  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>QssedA Auth</title><style>html,body{height:100%;margin:0}body{display:grid;place-items:center;background:#0b0b0d;color:#f5f5f7;font:15px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.box{text-align:center}.spin{width:22px;height:22px;margin:0 auto 14px;border:2px solid #3a3a3c;border-top-color:#0a84ff;border-radius:50%;animation:s .8s linear infinite}@keyframes s{to{transform:rotate(360deg)}}p{color:#a1a1a6}</style></head><body><div class="box"><div class="spin"></div><strong>正在进入 QssedA Studio</strong><p>正在安全同步登录状态…</p></div><form id="handoff" method="post" action="${htmlEscape(mainSite)}/auth/handoff"><input type="hidden" name="access_token" value="${htmlEscape(accessToken)}"><input type="hidden" name="refresh_token" value="${htmlEscape(refreshToken)}"><input type="hidden" name="next" value="${htmlEscape(next)}"></form><script>document.getElementById("handoff").submit()</script></body></html>`;',
  '}',
  ''
].join('\n');

auth = insertAfter(
  auth,
  '  return json({ success: true }, 200, clearSessionCookies());\n}\n',
  authContinueFunctions,
  'auth continue functions'
);

// Make account view materially different from the compact signed-in summary.
auth = replaceOnce(
  auth,
  '    accountLead: "这个页面直接读取 auth.qsseda.studio 的当前认证会话。",',
  '    accountLead: "查看当前账号、会话与授权状态。",\n    usernameLabel: "用户名",\n    roleLabel: "角色",\n    sessionLabel: "认证会话",\n    sessionProtected: "受 QssedA Auth 保护",\n    securityNote: "登录凭据保存在仅服务器可读取的安全 Cookie 中。其他 QssedA 应用通过授权或安全会话交接使用此身份。",\n    backAuth: "返回认证中心",',
  'auth zh account copy'
);

auth = replaceOnce(
  auth,
  '    accountLead: "This page reads the current auth.qsseda.studio session directly.",',
  '    accountLead: "Review the current account, session and authorization state.",\n    usernameLabel: "Username",\n    roleLabel: "Role",\n    sessionLabel: "Auth session",\n    sessionProtected: "Protected by QssedA Auth",\n    securityNote: "Credentials remain in secure server-only cookies. Other QssedA apps use authorization or a secure session handoff to consume this identity.",\n    backAuth: "Back to Auth",',
  'auth en account copy'
);

auth = replaceOnce(
  auth,
  '.dot.danger{background:var(--danger);box-shadow:none}.divider{height:1px;background:var(--line);margin:22px 0}',
  '.dot.danger{background:var(--danger);box-shadow:none}.details{margin-top:18px;border:1px solid var(--line);border-radius:17px;overflow:hidden;background:var(--surface)}.detail{display:flex;justify-content:space-between;gap:18px;padding:13px 15px;border-bottom:1px solid var(--line);font-size:13px}.detail:last-child{border-bottom:0}.detail span{color:var(--muted)}.detail strong{min-width:0;text-align:right;overflow-wrap:anywhere}.security-note{margin:14px 2px 0;color:var(--quiet);font-size:12px;line-height:1.55}.divider{height:1px;background:var(--line);margin:22px 0}',
  'auth account css'
);

auth = replaceOnce(
  auth,
  '        <div id="blockedMessage" class="message error hidden">${copy.unavailable}</div>\n        <div id="homeActions"><a id="studioButton" class="button" href="https://qsseda.studio/">${copy.openStudio}</a><a class="button secondary" href="/account">${copy.account}</a></div>\n        <div id="accountActions" class="hidden"><a class="button" href="https://qsseda.studio/">${copy.openStudio}</a><button id="logoutButton" class="secondary" type="button">${copy.signOut}</button></div>',
  '        <div id="blockedMessage" class="message error hidden">${copy.unavailable}</div>\n        <div id="accountDetails" class="hidden"><div class="details"><div class="detail"><span>${copy.usernameLabel}</span><strong id="usernameText">—</strong></div><div class="detail"><span>${copy.roleLabel}</span><strong id="roleText">—</strong></div><div class="detail"><span>${copy.sessionLabel}</span><strong>${copy.sessionProtected}</strong></div></div><p class="security-note">${copy.securityNote}</p></div>\n        <div id="homeActions"><a id="studioButton" class="button" href="/continue">${copy.openStudio}</a><a class="button secondary" href="/account">${copy.account}</a></div>\n        <div id="accountActions" class="hidden"><a id="accountStudioButton" class="button" href="/continue">${copy.openStudio}</a><a class="button secondary" href="/">${copy.backAuth}</a><button id="logoutButton" class="secondary" type="button">${copy.signOut}</button></div>',
  'auth account html'
);

auth = replaceOnce(
  auth,
  '    var blocked=!data.authorized;document.getElementById("blockedMessage").classList.toggle("hidden",!blocked);document.getElementById("studioButton").classList.toggle("hidden",blocked);',
  '    var blocked=!data.authorized;document.getElementById("blockedMessage").classList.toggle("hidden",!blocked);document.getElementById("studioButton").classList.toggle("hidden",blocked);document.getElementById("accountStudioButton").classList.toggle("hidden",blocked);document.getElementById("usernameText").textContent=user.username||"—";document.getElementById("roleText").textContent=user.role||"user";',
  'auth account js values'
);

auth = replaceOnce(
  auth,
  '    document.getElementById("homeActions").classList.toggle("hidden",page!=="home"&&page!=="login");document.getElementById("accountActions").classList.toggle("hidden",page!=="account");document.getElementById("authorizePanel").classList.toggle("hidden",page!=="authorize");',
  '    document.getElementById("homeActions").classList.toggle("hidden",page!=="home"&&page!=="login");document.getElementById("accountActions").classList.toggle("hidden",page!=="account");document.getElementById("accountDetails").classList.toggle("hidden",page!=="account");document.getElementById("authorizePanel").classList.toggle("hidden",page!=="authorize");',
  'auth account js visibility'
);

// Main Worker: accept the Auth handoff, validate it against Supabase, establish the normal Studio browser session, and redirect.
main = insertAfter(
  main,
  '    if (pathname === "/api/auth/login") {\n      if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);\n      return handlePasswordLogin(request, env, ipInfo);\n    }\n',
  '\n    if (pathname === "/auth/handoff") {\n      if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);\n      return handleAuthHandoff(request, env, locale);\n    }\n',
  'main handoff route'
);

const mainHandoffFunctions = [
  '',
  'async function handleAuthHandoff(request, env, locale) {',
  '  const origin = request.headers.get("Origin") || "";',
  '  const productionOrigin = "https://auth.qsseda.studio";',
  '  const previewAllowed = env?.AUTH_PREVIEW_ALLOW_WORKERS_DEV === "1" && /^https:\\/\\/qsseda-auth-preview\\.[a-z0-9-]+\\.workers\\.dev$/i.test(origin);',
  '  if (origin !== productionOrigin && !previewAllowed) {',
  '    return json({ error: "Invalid authentication origin" }, 403);',
  '  }',
  '',
  '  let form;',
  '  try { form = await request.formData(); } catch { return json({ error: "Invalid handoff request" }, 400); }',
  '  const accessToken = typeof form.get("access_token") === "string" ? form.get("access_token") : "";',
  '  const refreshToken = typeof form.get("refresh_token") === "string" ? form.get("refresh_token") : "";',
  '  const next = normalizeHandoffNext(form.get("next"), locale);',
  '  if (!accessToken || !refreshToken) return json({ error: "Missing session" }, 400);',
  '',
  '  let userResponse;',
  '  try {',
  '    userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}` } });',
  '  } catch {',
  '    return json({ error: "Authentication service unavailable" }, 503);',
  '  }',
  '  if (!userResponse.ok) return json({ error: "Session is invalid or expired" }, 401);',
  '  const authUser = await userResponse.json();',
  '',
  '  let profileResponse;',
  '  try {',
  '    profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=status&id=eq.${encodeURIComponent(authUser.id)}&limit=1`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}` } });',
  '  } catch {',
  '    return json({ error: "Account service unavailable" }, 503);',
  '  }',
  '  if (!profileResponse.ok) return json({ error: "Account service unavailable" }, 503);',
  '  const profiles = await profileResponse.json();',
  '  if (!Array.isArray(profiles) || profiles[0]?.status !== "active") return json({ error: "Account is not active" }, 403);',
  '',
  '  return authHandoffHtml(accessToken, refreshToken, next);',
  '}',
  '',
  'function normalizeHandoffNext(value, locale) {',
  '  const candidate = typeof value === "string" ? value.trim() : "";',
  '  const fallback = locale === "zh" ? "/zh-cn/dashboard" : "/en/dashboard";',
  '  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\u0000")) return fallback;',
  '  if (candidate.startsWith("/zh-cn/") || candidate.startsWith("/en/")) return candidate;',
  '  const prefix = locale === "zh" ? "/zh-cn" : "/en";',
  '  return `${prefix}${candidate === "/" ? "/dashboard" : candidate}`;',
  '}',
  '',
  'function scriptLiteral(value) {',
  '  return JSON.stringify(String(value || "")).replace(/</g, "\\\\u003c").replace(/\\u2028/g, "\\\\u2028").replace(/\\u2029/g, "\\\\u2029");',
  '}',
  '',
  'function authHandoffHtml(accessToken, refreshToken, next) {',
  '  const page = `<!DOCTYPE html><html><head>${baseHead("QssedA Studio")}</head><body><main style="min-height:100vh;display:grid;place-items:center;padding:24px"><section style="text-align:center"><h1 style="font-size:24px;margin:0 0 8px">QssedA Studio</h1><p id="handoff-status" style="color:var(--muted,#8e8e93)">正在同步登录状态…</p></section></main>${supabaseScript()}<script>(async()=>{const status=document.getElementById("handoff-status");const result=await supabaseClient.auth.setSession({access_token:${scriptLiteral(accessToken)},refresh_token:${scriptLiteral(refreshToken)}});if(result.error){status.textContent="登录状态同步失败，请返回认证中心重试。";return}location.replace(${scriptLiteral(next)})})().catch(()=>{document.getElementById("handoff-status").textContent="登录状态同步失败，请返回认证中心重试。"})</script></body></html>`;',
  '  return new Response(page, { status: 200, headers: { "content-type": "text/html;charset=UTF-8", "cache-control": "no-store", "referrer-policy": "no-referrer", "x-content-type-options": "nosniff" } });',
  '}',
  ''
].join('\n');

main = replaceOnce(main, '\nfunction getRouteInfo(request) {', mainHandoffFunctions + '\nfunction getRouteInfo(request) {', 'main handoff functions');

fs.writeFileSync('auth-worker.js', auth);
fs.writeFileSync('worker.js', main);
console.log('Applied Auth v2 account UI and secure Studio session handoff.');
