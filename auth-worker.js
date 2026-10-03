import { handleOAuthRequest } from "./auth-oauth.js";
import { localeDirection, localeFromPath, normalizeSupportedLocale, preferredLocaleFromRequest } from "./studio/locale.js";
import { awOriginForRequest, mainOriginForRequest, rootDomainForRequest, serviceOrigin } from "./studio/domain-family.js";
import { FAVICON_LINKS, FAVICON_PATHS, faviconResponse } from "./studio/favicon.js";
import { injectBrandLogoRuntime, LOGO_PATHS, logoResponse } from "./studio/brand-logo.js";
import { accountMenuClientScript, accountMenuMarkup, accountMenuStyles, injectAccountMenuRuntime } from "./studio/account-menu.js";
import { intelligenceThemeAttr, intelligenceThemeBootScript, intelligenceThemeFromRequest } from "./studio/intelligence-theme.js";

const SUPABASE_URL = "https://xunbsoxijasekzadckob.supabase.co";
const SUPABASE_KEY = "sb_publishable_1ScwEvseisteYNgc5xM1pQ_NNekUmF1";

const ACCESS_COOKIE = "__Host-qsseda-access";
const REFRESH_COOKIE = "__Host-qsseda-refresh";
const ACCESS_MAX_AGE = 60 * 60;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;
const ACTIVE_STATUS = "active";
const ACCOUNT_COOKIE = "__Secure-qsseda-account-id";
const ACCOUNT_SIGNED_OUT = "signed-out";
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

    if (FAVICON_PATHS.has(pathname)) return faviconResponse(request);
    if (LOGO_PATHS.has(pathname)) return logoResponse(request);

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

    if (pathname === "/logout") {
      if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
      return handleBrowserLogout(request);
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
      error: friendlyAuthError(payload, preferredAuthLocale(request)),
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

async function revokeCurrentSession(request) {
  const cookies = parseCookies(request.headers.get("Cookie") || "");
  const accessToken = cookies[ACCESS_COOKIE] || "";

  if (accessToken) {
    try {
      await fetch(`${SUPABASE_URL}/auth/v1/logout?scope=local`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${accessToken}`
        }
      });
    } catch {
      // Browser and domain-family cookies are still cleared if upstream revocation is unavailable.
    }
  }
}

function globalAuthLogoutCookies(request) {
  const root = rootDomainForRequest(request) || "qsseda.com";
  return [
    ...clearSessionCookies(),
    `${ACCOUNT_COOKIE}=${ACCOUNT_SIGNED_OUT}; Path=/; Domain=${root}; Max-Age=${REFRESH_MAX_AGE}; Secure; SameSite=Lax`
  ];
}

async function handleLogout(request) {
  await revokeCurrentSession(request);
  return json({ success: true }, 200, globalAuthLogoutCookies(request));
}

async function handleBrowserLogout(request) {
  await revokeCurrentSession(request);
  const url = new URL(request.url);
  const next = safeNextPath(url.searchParams.get("next"));
  const target = new URL("/login", url.origin);
  if (next) target.searchParams.set("next", next);
  const headers = new Headers({ location: target.toString(), "cache-control": "no-store", "referrer-policy": "no-referrer" });
  for (const value of globalAuthLogoutCookies(request)) headers.append("set-cookie", value);
  return new Response(null, { status: 302, headers });
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
  const handoff = resolveHandoffTarget(request, next, mainSite);
  const headers = new Headers(baseHeaders("text/html;charset=UTF-8"));
  headers.set("referrer-policy", "origin");
  headers.set("content-security-policy", `default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; form-action ${handoff.origin}; base-uri 'none'; frame-ancestors 'none'`);
  if (rotated) for (const value of sessionCookies(rotated)) headers.append("set-cookie", value);

  const handoffLocale = localeFromPath(handoff.next) || preferredAuthLocale(request);
  return new Response(injectBrandLogoRuntime(handoffPage(handoff.origin, accessToken, refreshToken, handoff.next, intelligenceThemeFromRequest(request), handoffLocale)), { status: 200, headers });
}

function validatedNextPath(value) {
  const path = cleanText(value, 500);
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("\u0000") ? path : "";
}

function safeNextPath(value) {
  return validatedNextPath(value) || "/dashboard";
}

function resolveHandoffTarget(request, next, mainSite) {
  const root = rootDomainForRequest(request) || "qsseda.com";
  try {
    const parsed = new URL(next, "https://handoff.invalid");
    const locale = localeFromPath(parsed.pathname);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const offset = locale ? 1 : 0;
    const service = parts[offset];
    const action = parts[offset + 1];
    const nested = service && action === "handoff" ? validatedNextPath(parsed.searchParams.get("next")) : "";
    if (service === "aw" && nested) {
      return { origin: awOriginForRequest(request), next: nested };
    }
    if ((service === "gpt" || service === "work" || service === "cash") && nested) {
      return { origin: serviceOrigin(root, service), next: nested };
    }
  } catch {}
  return { origin: mainSite, next };
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

function handoffPage(targetOrigin, accessToken, refreshToken, next, theme = "", locale = "en-us") {
  const themeAttr = intelligenceThemeAttr(theme);
  const themeBoot = intelligenceThemeBootScript();
  const handoffCopy = {
    "zh-cn":["正在进入 AERTEX","正在安全同步登录状态…"],
    "zh-tw":["正在進入 AERTEX","正在安全同步登入狀態…"],
    "ja-jp":["AERTEX に移動しています","サインイン状態を安全に同期しています…"],
    "ko-kr":["AERTEX로 이동 중","로그인 상태를 안전하게 동기화하는 중…"],
    "fr-fr":["Ouverture d’AERTEX","Synchronisation sécurisée de la connexion…"],
    "es-es":["Entrando en AERTEX","Sincronizando de forma segura el inicio de sesión…"],
    "el-gr":["Μετάβαση στο AERTEX","Ασφαλής συγχρονισμός της κατάστασης σύνδεσης…"],
    "ar-sa":["جارٍ الدخول إلى AERTEX","جارٍ مزامنة حالة تسجيل الدخول بأمان…"]
  }[locale] || ["Entering AERTEX","Securely syncing your sign-in state…"];
  return `<!doctype html><html lang="${locale}" dir="${localeDirection(locale)}"${themeAttr}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="color-scheme" content="light dark"><title>AERTEX ID</title>${FAVICON_LINKS}${themeBoot}<style>:root{color-scheme:dark;--bg:#0b0b0d;--text:#f5f5f7;--muted:#a1a1a6;--ring:#3a3a3c;--accent:#0a84ff}@media(prefers-color-scheme:light){:root:not([data-theme]){color-scheme:light;--bg:#f5f5f7;--text:#1d1d1f;--muted:#6e6e73;--ring:#d1d1d6;--accent:#007aff}}:root[data-theme="light"]{color-scheme:light;--bg:#f5f5f7;--text:#1d1d1f;--muted:#6e6e73;--ring:#d1d1d6;--accent:#007aff}html,body{height:100%;margin:0;background:var(--bg);color:var(--text)}body{display:grid;place-items:center;font:15px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.box{text-align:center}.spin{width:22px;height:22px;margin:0 auto 14px;border:2px solid var(--ring);border-top-color:var(--accent);border-radius:50%;animation:s .8s linear infinite}@keyframes s{to{transform:rotate(360deg)}}p{color:var(--muted)}</style></head><body><div class="box"><div class="spin"></div><strong>${handoffCopy[0]}</strong><p>${handoffCopy[1]}</p></div><form id="handoff" method="post" action="${htmlEscape(targetOrigin)}/auth/handoff"><input type="hidden" name="access_token" value="${htmlEscape(accessToken)}"><input type="hidden" name="refresh_token" value="${htmlEscape(refreshToken)}"><input type="hidden" name="next" value="${htmlEscape(next)}"></form><script>document.getElementById("handoff").submit()</script></body></html>`;
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

function friendlyAuthError(payload, locale = "en-us") {
  const message = String(payload?.msg || payload?.message || payload?.error_description || "").toLowerCase();
  const errors = {
    "zh-cn":["邮箱或密码不正确","邮箱尚未验证","尝试次数过多，请稍后再试","无法登录，请检查账号信息后重试"],
    "zh-tw":["電子郵件或密碼不正確","電子郵件尚未驗證","嘗試次數過多，請稍後再試","無法登入，請檢查帳號資訊後重試"],
    "ja-jp":["メールまたはパスワードが正しくありません","メールがまだ確認されていません","試行回数が多すぎます。しばらくしてから再試行してください","サインインできません。アカウント情報を確認して再試行してください"],
    "ko-kr":["이메일 또는 비밀번호가 올바르지 않습니다","이메일이 아직 확인되지 않았습니다","시도 횟수가 너무 많습니다. 잠시 후 다시 시도하세요","로그인할 수 없습니다. 계정 정보를 확인한 후 다시 시도하세요"],
    "fr-fr":["E-mail ou mot de passe incorrect","L’adresse e-mail n’est pas encore confirmée","Trop de tentatives. Réessayez plus tard","Connexion impossible. Vérifiez les informations du compte et réessayez"],
    "es-es":["El correo o la contraseña no son correctos","El correo electrónico aún no está verificado","Demasiados intentos. Inténtalo de nuevo más tarde","No se pudo iniciar sesión. Revisa los datos de la cuenta e inténtalo de nuevo"],
    "el-gr":["Το email ή ο κωδικός πρόσβασης δεν είναι σωστός","Το email δεν έχει ακόμη επιβεβαιωθεί","Πάρα πολλές προσπάθειες. Δοκιμάστε ξανά αργότερα","Δεν ήταν δυνατή η σύνδεση. Ελέγξτε τα στοιχεία του λογαριασμού και δοκιμάστε ξανά"],
    "ar-sa":["البريد الإلكتروني أو كلمة المرور غير صحيحة","لم يتم تأكيد البريد الإلكتروني بعد","عدد المحاولات كبير جدًا. حاول مرة أخرى لاحقًا","تعذر تسجيل الدخول. تحقق من معلومات الحساب وحاول مرة أخرى"]
  }[locale] || ["Email or password is incorrect","Email is not confirmed yet","Too many attempts. Please try again later","Unable to sign in. Check your account information and try again"];
  if (message.includes("invalid login") || message.includes("invalid credentials")) return errors[0];
  if (message.includes("email not confirmed")) return errors[1];
  if (message.includes("too many")) return errors[2];
  return errors[3];
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
  const withAccountMenu = injectAccountMenuRuntime(content, {
    summaryUrl: "/api/session",
    logoutUrl: "/api/logout",
    authMode: true
  });
  return new Response(injectBrandLogoRuntime(withAccountMenu), {
    status,
    headers: baseHeaders("text/html;charset=UTF-8")
  });
}

function authPage(pathname, request) {
  const page = pathname === "/" ? "home" : pathname.slice(1);
  const theme = intelligenceThemeFromRequest(request);
  const themeAttr = intelligenceThemeAttr(theme);
  const themeBoot = intelligenceThemeBootScript();
  const authHost = new URL(request.url).hostname;
  const mainOrigin = mainOriginForRequest(request);
  const locale = preferredAuthLocale(request);
  const zh = locale === "zh-cn";
  const homeLabel = locale === "zh-cn" ? "返回 AERTEX 主站" : "AERTEX Home";
  const copy = authCopy(locale, authHost);


  return `<!doctype html>
<html lang="${locale}" dir="${localeDirection(locale)}"${themeAttr}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#0b0b0d" media="(prefers-color-scheme: dark)">
  <meta name="theme-color" content="#f5f5f7" media="(prefers-color-scheme: light)">
  <title>AERTEX ID</title>
  ${FAVICON_LINKS}
  ${themeBoot}
  <style>
    :root{color-scheme:dark;--bg:#07080a;--panel:rgba(27,28,32,.78);--panel-strong:#1d1f24;--surface:rgba(118,118,128,.16);--surface-hover:rgba(118,118,128,.23);--text:#f5f5f7;--muted:#a1a1a6;--quiet:#73737a;--line:rgba(255,255,255,.10);--line-strong:rgba(255,255,255,.17);--accent:#0a84ff;--accent-hover:#3198ff;--accent-ink:#fff;--danger:#ff453a;--warning:#ffd60a;--success:#30d158;--shadow:0 28px 80px rgba(0,0,0,.46);--radius:22px;--control:14px}
    @media(prefers-color-scheme:light){:root:not([data-theme]){color-scheme:light;--bg:#f3f4f7;--panel:rgba(255,255,255,.84);--panel-strong:#fff;--surface:rgba(116,116,128,.10);--surface-hover:rgba(116,116,128,.16);--text:#111114;--muted:#62626a;--quiet:#85858d;--line:rgba(20,20,30,.09);--line-strong:rgba(20,20,30,.15);--accent:#0071e3;--accent-hover:#0077ed;--danger:#d70015;--warning:#a05a00;--success:#248a3d;--shadow:0 28px 70px rgba(38,44,60,.14)}}
    :root[data-theme="light"]{color-scheme:light;--bg:#f3f4f7;--panel:rgba(255,255,255,.84);--panel-strong:#fff;--surface:rgba(116,116,128,.10);--surface-hover:rgba(116,116,128,.16);--text:#111114;--muted:#62626a;--quiet:#85858d;--line:rgba(20,20,30,.09);--line-strong:rgba(20,20,30,.15);--accent:#0071e3;--accent-hover:#0077ed;--danger:#d70015;--warning:#a05a00;--success:#248a3d;--shadow:0 28px 70px rgba(38,44,60,.14)}
    :root[data-theme="dark"]{color-scheme:dark;--bg:#07080a;--panel:rgba(27,28,32,.78);--panel-strong:#1d1f24;--surface:rgba(118,118,128,.16);--surface-hover:rgba(118,118,128,.23);--text:#f5f5f7;--muted:#a1a1a6;--quiet:#73737a;--line:rgba(255,255,255,.10);--line-strong:rgba(255,255,255,.17);--danger:#ff453a;--warning:#ffd60a;--success:#30d158;--shadow:0 28px 80px rgba(0,0,0,.46)}
    :root[data-accent]{--accent:var(--aertex-accent);--accent-hover:color-mix(in srgb,var(--aertex-accent) 88%,white 12%);--accent-ink:var(--aertex-accent-ink)}
    *{box-sizing:border-box}html,body{min-height:100%;margin:0}body{min-height:100vh;min-height:100dvh;display:grid;place-items:center;padding:max(22px,env(safe-area-inset-top)) max(18px,env(safe-area-inset-right)) max(22px,env(safe-area-inset-bottom)) max(18px,env(safe-area-inset-left));font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif;background:radial-gradient(circle at 18% 12%,rgba(10,132,255,.16),transparent 34%),radial-gradient(circle at 82% 78%,rgba(94,92,230,.12),transparent 31%),var(--bg);color:var(--text)}
    .shell{width:min(100%,460px)}.brand{display:flex;align-items:center;gap:12px;width:max-content;max-width:100%;margin:0 0 18px 4px;padding:6px 8px 6px 6px;border-radius:14px;color:var(--text);text-decoration:none;transition:.16s ease background,.16s ease transform}.brand:hover,.brand:focus-visible{background:var(--surface);outline:0}.brand:active{transform:scale(.985)}.mark{width:42px;height:42px;display:block;object-fit:contain}.brand-copy strong{display:block;font-size:15px}.brand-copy span{display:block;margin-top:2px;color:var(--muted);font-size:12px}
    .card{position:relative;overflow:hidden;border:1px solid var(--line);border-radius:var(--radius);background:var(--panel);backdrop-filter:blur(30px) saturate(150%);-webkit-backdrop-filter:blur(30px) saturate(150%);box-shadow:var(--shadow);padding:30px}.card:before{content:"";position:absolute;inset:0 0 auto;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.42),transparent);opacity:.65}h1{margin:0;font-size:31px;line-height:1.08;letter-spacing:-.04em;font-weight:760}.lead{margin:10px 0 24px;color:var(--muted);font-size:14px;line-height:1.55}.hidden{display:none!important}
    .loading{display:flex;align-items:center;gap:12px;color:var(--muted);padding:8px 0}.spinner{width:18px;height:18px;border:2px solid var(--line-strong);border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}label{display:block;margin:0 0 8px;color:var(--muted);font-size:13px;font-weight:600}.field{margin-top:16px}input{width:100%;height:50px;border-radius:var(--control);border:1px solid var(--line);padding:0 14px;background:var(--surface);color:var(--text);font:inherit;font-size:15px;outline:none;transition:.18s ease border-color,.18s ease box-shadow,.18s ease background}input:focus{border-color:var(--accent);box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 18%,transparent);background:var(--panel-strong)}
    button,.button{width:100%;min-height:50px;margin-top:18px;border:0;border-radius:var(--control);padding:0 16px;display:inline-flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;background:var(--accent);color:var(--accent-ink);font:inherit;font-size:15px;font-weight:700;cursor:pointer;transition:.16s ease transform,.16s ease background,.16s ease opacity}button:hover,.button:hover{background:var(--accent-hover)}button:active,.button:active{transform:scale(.985)}button:disabled{opacity:.48;cursor:not-allowed}.secondary{background:var(--surface);color:var(--text);border:1px solid var(--line)}.secondary:hover{background:var(--surface-hover)}.message{min-height:20px;margin:13px 0 0;color:var(--muted);font-size:13px;line-height:1.45}.message.error{color:var(--danger)}
    .account{display:flex;align-items:center;gap:14px;padding:16px;border-radius:17px;background:var(--surface);border:1px solid var(--line)}.avatar{width:48px;height:48px;flex:0 0 48px;border-radius:50%;display:grid;place-items:center;overflow:hidden;background:linear-gradient(145deg,#5e5ce6,#0a84ff);color:#fff;font-weight:800;font-size:17px}.avatar img{width:100%;height:100%;object-fit:cover}.identity{min-width:0;flex:1}.identity strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:15px}.identity span{display:block;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--muted);font-size:12px}.badge{display:inline-flex;align-items:center;gap:6px;margin-top:9px;color:var(--muted);font-size:12px}.dot{width:7px;height:7px;border-radius:50%;background:var(--success);box-shadow:0 0 0 4px rgba(48,209,88,.12)}.dot.warning{background:var(--warning);box-shadow:none}.dot.danger{background:var(--danger);box-shadow:none}.details{margin-top:18px;border:1px solid var(--line);border-radius:17px;overflow:hidden;background:var(--surface)}.detail{display:flex;justify-content:space-between;gap:18px;padding:13px 15px;border-bottom:1px solid var(--line);font-size:13px}.detail:last-child{border-bottom:0}.detail span{color:var(--muted)}.detail strong{min-width:0;text-align:right;overflow-wrap:anywhere}.security-note{margin:14px 2px 0;color:var(--quiet);font-size:12px;line-height:1.55}.divider{height:1px;background:var(--line);margin:22px 0}.app-box{padding:16px;border:1px solid var(--line);border-radius:17px;background:var(--surface)}.app-name{font-weight:700;font-size:15px}.app-id{margin-top:5px;color:var(--quiet);font:12px ui-monospace,SFMono-Regular,Menlo,monospace;overflow-wrap:anywhere}.permissions{margin:16px 0 0;padding:0;list-style:none}.permissions li{display:flex;gap:10px;padding:9px 0;color:var(--muted);font-size:13px;border-bottom:1px solid var(--line)}.permissions li:last-child{border-bottom:0}.tick{color:var(--accent);font-weight:900}.foot{margin:16px 2px 0;text-align:center;color:var(--quiet);font-size:11px;line-height:1.5}
    @media(max-width:520px){.card{padding:24px 20px;border-radius:20px}h1{font-size:28px}.brand{margin-left:2px}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.001ms!important;transition-duration:.001ms!important}}
  </style>
  <style>
    ${accountMenuStyles()}
    .auth-account-zone{position:fixed;top:14px;right:14px;z-index:130}
    @media(max-width:560px){.auth-account-zone{top:12px;right:12px}}
  </style>
</head>
<body data-page="${page}">
  <div class="auth-account-zone">${accountMenuMarkup(locale)}</div>
  <main class="shell">
    <a class="brand" href="${mainOrigin}/${locale}" aria-label="${homeLabel}" title="${homeLabel}"><img class="mark" src="/favicon.svg?v=aertex-20261003-square-1" alt="" aria-hidden="true"><div class="brand-copy"><strong>AERTEX ID</strong><span>AERTEX Account</span></div></a>
    <section class="card">
      <div id="loading" class="loading"><span class="spinner"></span><span>${copy.checking}</span></div>
      <div id="signedOut" class="hidden">
        <h1>${copy.loginTitle}</h1><p id="signedOutLead" class="lead">${copy.loginLead}</p>
        <form id="loginForm" autocomplete="on">
          <div class="field"><label for="email">${copy.email}</label><input id="email" name="email" type="email" autocomplete="username" inputmode="email" required></div>
          <div class="field"><label for="password">${copy.password}</label><input id="password" name="password" type="password" autocomplete="current-password" required></div>
          <button id="loginButton" type="submit">${copy.continue}</button><div id="loginMessage" class="message" role="status" aria-live="polite"></div>
        </form>
        <a class="button secondary" href="${mainOrigin}/${locale}/sign-up">${copy.create}</a>
      </div>
      <div id="signedIn" class="hidden">
        <h1 id="signedInTitle">${copy.signedTitle}</h1><p class="lead" id="signedInLead">${copy.signedLead}</p>
        <div class="account"><div id="avatar" class="avatar">Q</div><div class="identity"><strong id="displayName">AERTEX User</strong><span id="emailText"></span><div class="badge"><span id="statusDot" class="dot"></span><span id="statusText">${copy.active}</span></div></div></div>
        <div id="blockedMessage" class="message error hidden">${copy.unavailable}</div>
        <div id="accountDetails" class="hidden"><div class="details"><div class="detail"><span>${copy.usernameLabel}</span><strong id="usernameText">—</strong></div><div class="detail"><span>${copy.roleLabel}</span><strong id="roleText">—</strong></div><div class="detail"><span>${copy.sessionLabel}</span><strong>${copy.sessionProtected}</strong></div></div><p class="security-note">${copy.securityNote}</p></div>
        <div id="homeActions"><a id="studioButton" class="button" href="/continue">${copy.openStudio}</a><a class="button secondary" href="/account?next=${encodeURIComponent("/"+locale)}">${copy.account}</a><button id="homeLogoutButton" class="secondary" type="button">${copy.signOut}</button></div>
        <div id="accountActions" class="hidden"><a id="accountStudioButton" class="button" href="/continue">${copy.openStudio}</a><a class="button secondary" href="/?next=${encodeURIComponent("/"+locale)}">${copy.backAuth}</a><button id="logoutButton" class="secondary" type="button">${copy.signOut}</button></div>
        <div id="authorizePanel" class="hidden"><div class="divider"></div><div class="app-box"><div class="app-name" id="clientName">${copy.appRequest}</div><div class="app-id" id="clientId"></div></div><ul class="permissions"><li><span class="tick">✓</span><span>${copy.p1}</span></li><li><span class="tick">✓</span><span>${copy.p2}</span></li></ul><button id="allowButton" type="button" disabled>${copy.allowLater}</button><p class="message">${copy.later}</p></div>
      </div>
    </section>
    <div class="foot">${authHost} · AERTEX ID</div>
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
    var user=data.user||{};loading.classList.add("hidden");signedOut.classList.add("hidden");signedIn.classList.remove("hidden");document.getElementById("displayName").textContent=user.displayName||user.username||"AERTEX User";document.getElementById("emailText").textContent=user.email||"";document.getElementById("statusText").textContent=statusLabel(user.status);
    var dot=document.getElementById("statusDot");dot.className="dot"+(user.status==="suspended"?" warning":user.status==="banned"?" danger":"");
    var blocked=!data.authorized;document.getElementById("blockedMessage").classList.toggle("hidden",!blocked);document.getElementById("studioButton").classList.toggle("hidden",blocked);document.getElementById("accountStudioButton").classList.toggle("hidden",blocked);document.getElementById("usernameText").textContent=user.username||"—";document.getElementById("roleText").textContent=user.role||"user";
    var avatar=document.getElementById("avatar");avatar.textContent=initials(user.displayName||user.username||user.email);if(user.avatarUrl){var img=document.createElement("img");img.alt="";img.src=user.avatarUrl;img.referrerPolicy="no-referrer";avatar.textContent="";avatar.appendChild(img)}
    document.getElementById("homeActions").classList.toggle("hidden",page!=="home"&&page!=="login");document.getElementById("accountActions").classList.toggle("hidden",page!=="account");document.getElementById("accountDetails").classList.toggle("hidden",page!=="account");document.getElementById("authorizePanel").classList.toggle("hidden",page!=="authorize");
    if(page==="account"){document.getElementById("signedInTitle").textContent=copy.accountTitle;document.getElementById("signedInLead").textContent=copy.accountLead}
    if(page==="authorize"){document.getElementById("signedInTitle").textContent=copy.authorizeTitle;document.getElementById("signedInLead").textContent=copy.authorizeLead;var params=new URLSearchParams(location.search);document.getElementById("clientId").textContent=params.get("client_id")||"client_id: —";document.getElementById("clientName").textContent=params.get("client_name")||copy.appRequest}
  }
  async function checkSession(){try{var response=await fetch("/api/session",{credentials:"same-origin",cache:"no-store"});var data=await response.json();if(response.ok&&data.authenticated&&data.user)showLoggedIn(data);else showLoggedOut()}catch(e){showLoggedOut();loginMessage.textContent=copy.connectError;loginMessage.classList.add("error")}}
  loginForm.addEventListener("submit",async function(event){event.preventDefault();loginMessage.textContent=copy.loggingIn;loginMessage.classList.remove("error");loginButton.disabled=true;try{var response=await fetch("/api/login",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({email:document.getElementById("email").value,password:document.getElementById("password").value})});var data=await response.json();if(!response.ok||!data.authenticated)throw new Error(data.error||"Login failed");document.getElementById("password").value="";var p=new URLSearchParams(location.search),n=p.get("next")||"";location.replace("/continue"+(n?"?next="+encodeURIComponent(n):""));return}catch(error){loginMessage.textContent=error&&error.message?error.message:"Login failed";loginMessage.classList.add("error")}finally{loginButton.disabled=false}});
  async function signOut(button){if(button)button.disabled=true;try{await fetch("/api/logout",{method:"POST",credentials:"same-origin"})}catch(e){}location.replace("/login")}
  if(logoutButton)logoutButton.addEventListener("click",function(){signOut(logoutButton)});
  if(homeLogoutButton)homeLogoutButton.addEventListener("click",function(){signOut(homeLogoutButton)});
  checkSession();
})();
</script>
${accountMenuClientScript({ summaryUrl: "/api/session", logoutUrl: "/api/logout", authMode: true, locale })}
</body>
</html>`;
}

function preferredAuthLocale(request) {
  try {
    const url = new URL(request.url);
    const next = validatedNextPath(url.searchParams.get("next"));
    const fromNext = localeFromPath(next);
    if (fromNext) return fromNext;
  } catch {}
  const sharedLocale = normalizeSupportedLocale(requestCookieValue(request, "qssed_locale"));
  if (sharedLocale) return sharedLocale;
  return preferredLocaleFromRequest(request);
}

function requestCookieValue(request, name) {
  const prefix = name + "=";
  const header = String(request?.headers?.get?.("Cookie") || "");
  for (const part of header.split(";")) {
    const item = part.trim();
    if (!item.startsWith(prefix)) continue;
    const raw = item.slice(prefix.length);
    try { return decodeURIComponent(raw); } catch { return raw; }
  }
  return "";
}

const AUTH_EN = {
  checking:"Checking sign-in status…", loginTitle:"Sign in to AERTEX", email:"Email", password:"Password", continue:"Continue", create:"Create account",
  signedTitle:"You're signed in", signedLead:"AERTEX ID recognized your current session.", openStudio:"Continue to AERTEX", account:"Account status", signOut:"Sign out",
  authorizeTitle:"Authorize application", authorizeLead:"Confirm which AERTEX account you want to use.", accountTitle:"Account status", accountLead:"Review the current account, session and authorization state.",
  usernameLabel:"Username", roleLabel:"Role", sessionLabel:"Auth session", sessionProtected:"Protected by AERTEX ID",
  securityNote:"Credentials remain in secure server-only cookies. Other AERTEX apps use authorization or a secure session handoff to consume this identity.",
  backAuth:"Back to Auth", active:"Account active", suspended:"Account suspended", banned:"Account banned", unavailable:"This account cannot authorize applications.",
  appRequest:"An application is requesting access to your account", p1:"Read basic account identity", p2:"Confirm current sign-in status", allowLater:"Allow (coming next)",
  later:"This version establishes the identity/session center. Authorization codes and PKCE come next.", signInFirst:"Sign in first to continue authorization.", loggingIn:"Signing in…",
  connectError:"Authentication service is temporarily unavailable. Please try again."
};

const AUTH_COPY = {
  "en-us": AUTH_EN, "en-gb": AUTH_EN, "en-au": AUTH_EN,
  "zh-cn": {...AUTH_EN,checking:"正在检查登录状态…",loginTitle:"登录 AERTEX",email:"邮箱",password:"密码",continue:"继续",create:"创建账号",signedTitle:"你已登录",signedLead:"AERTEX ID 已识别当前会话。",openStudio:"继续前往 AERTEX",account:"账号状态",signOut:"退出登录",authorizeTitle:"授权应用",authorizeLead:"确认要使用哪个 AERTEX 账号继续。",accountTitle:"账号状态",accountLead:"查看当前账号、会话与授权状态。",usernameLabel:"用户名",roleLabel:"角色",sessionLabel:"认证会话",sessionProtected:"受 AERTEX ID 保护",securityNote:"登录凭据保存在仅服务器可读取的安全 Cookie 中。其他 AERTEX 应用通过授权或安全会话交接使用此身份。",backAuth:"返回认证中心",active:"账号已启用",suspended:"账号已暂停",banned:"账号已封禁",unavailable:"当前账号不可用于应用授权。",appRequest:"一个应用请求访问你的账号",p1:"读取基础账号身份",p2:"确认账号当前是否已登录",allowLater:"允许（下一阶段启用）",later:"当前版本先完成认证中心与会话识别；授权码与 PKCE 将在下一阶段接入。",signInFirst:"请先登录，再继续应用授权。",loggingIn:"正在登录…",connectError:"暂时无法连接认证服务，请稍后重试。"},
  "zh-tw": {...AUTH_EN,checking:"正在檢查登入狀態…",loginTitle:"登入 AERTEX",email:"電子郵件",password:"密碼",continue:"繼續",create:"建立帳號",signedTitle:"你已登入",signedLead:"AERTEX ID 已識別目前工作階段。",openStudio:"繼續前往 AERTEX",account:"帳號狀態",signOut:"登出",authorizeTitle:"授權應用程式",authorizeLead:"確認要使用哪個 AERTEX 帳號繼續。",accountTitle:"帳號狀態",accountLead:"查看目前帳號、工作階段與授權狀態。",usernameLabel:"使用者名稱",roleLabel:"角色",sessionLabel:"驗證工作階段",sessionProtected:"受 AERTEX ID 保護",securityNote:"登入憑證保存在僅伺服器可讀取的安全 Cookie 中。其他 AERTEX 應用程式透過授權或安全工作階段交接使用此身分。",backAuth:"返回驗證中心",active:"帳號已啟用",suspended:"帳號已暫停",banned:"帳號已封鎖",unavailable:"目前帳號無法授權應用程式。",appRequest:"有應用程式要求存取你的帳號",p1:"讀取基本帳號身分",p2:"確認目前登入狀態",allowLater:"允許（即將推出）",later:"此版本先建立身分與工作階段中心；授權碼與 PKCE 將於下一階段加入。",signInFirst:"請先登入以繼續授權。",loggingIn:"正在登入…",connectError:"驗證服務暫時無法使用，請稍後再試。"},
  "ja-jp": {...AUTH_EN,checking:"サインイン状態を確認中…",loginTitle:"AERTEX にサインイン",email:"メール",password:"パスワード",continue:"続ける",create:"アカウントを作成",signedTitle:"サインイン済みです",signedLead:"AERTEX ID が現在のセッションを確認しました。",openStudio:"AERTEX に進む",account:"アカウントの状態",signOut:"サインアウト",authorizeTitle:"アプリを承認",authorizeLead:"使用する AERTEX アカウントを確認してください。",accountTitle:"アカウントの状態",accountLead:"現在のアカウント、セッション、承認状態を確認します。",usernameLabel:"ユーザー名",roleLabel:"ロール",sessionLabel:"認証セッション",sessionProtected:"AERTEX ID で保護",securityNote:"認証情報はサーバーのみが読み取れる安全な Cookie に保存されます。",backAuth:"認証センターに戻る",active:"アカウントは有効です",suspended:"アカウントは停止中です",banned:"アカウントはブロックされています",unavailable:"このアカウントではアプリを承認できません。",appRequest:"アプリがアカウントへのアクセスを要求しています",p1:"基本的なアカウント情報を読み取る",p2:"現在のサインイン状態を確認する",allowLater:"許可（近日対応）",later:"このバージョンでは ID とセッションセンターを構築します。認可コードと PKCE は次の段階で追加されます。",signInFirst:"承認を続けるには先にサインインしてください。",loggingIn:"サインイン中…",connectError:"認証サービスは一時的に利用できません。後でもう一度お試しください。"},
  "ko-kr": {...AUTH_EN,checking:"로그인 상태 확인 중…",loginTitle:"AERTEX에 로그인",email:"이메일",password:"비밀번호",continue:"계속",create:"계정 만들기",signedTitle:"로그인되어 있습니다",signedLead:"AERTEX ID가 현재 세션을 확인했습니다.",openStudio:"AERTEX로 계속",account:"계정 상태",signOut:"로그아웃",authorizeTitle:"앱 권한 승인",authorizeLead:"계속 사용할 AERTEX 계정을 확인하세요.",accountTitle:"계정 상태",accountLead:"현재 계정, 세션 및 권한 상태를 확인합니다.",usernameLabel:"사용자 이름",roleLabel:"역할",sessionLabel:"인증 세션",sessionProtected:"AERTEX ID로 보호됨",securityNote:"로그인 자격 증명은 서버만 읽을 수 있는 보안 Cookie에 저장됩니다.",backAuth:"인증 센터로 돌아가기",active:"계정 활성화됨",suspended:"계정 일시 중지됨",banned:"계정 차단됨",unavailable:"이 계정은 앱 권한을 승인할 수 없습니다.",appRequest:"앱이 계정 접근 권한을 요청하고 있습니다",p1:"기본 계정 정보 읽기",p2:"현재 로그인 상태 확인",allowLater:"허용(추후 제공)",later:"이 버전에서는 ID/세션 센터를 구축합니다. 인증 코드와 PKCE는 다음 단계에서 추가됩니다.",signInFirst:"권한 승인을 계속하려면 먼저 로그인하세요.",loggingIn:"로그인 중…",connectError:"인증 서비스를 일시적으로 사용할 수 없습니다. 나중에 다시 시도하세요."},
  "fr-fr": {...AUTH_EN,checking:"Vérification de la connexion…",loginTitle:"Se connecter à AERTEX",email:"E-mail",password:"Mot de passe",continue:"Continuer",create:"Créer un compte",signedTitle:"Vous êtes connecté",signedLead:"AERTEX ID a reconnu votre session actuelle.",openStudio:"Continuer vers AERTEX",account:"État du compte",signOut:"Se déconnecter",authorizeTitle:"Autoriser l’application",authorizeLead:"Confirmez le compte AERTEX à utiliser.",accountTitle:"État du compte",accountLead:"Consultez l’état du compte, de la session et des autorisations.",usernameLabel:"Nom d’utilisateur",roleLabel:"Rôle",sessionLabel:"Session d’authentification",sessionProtected:"Protégée par AERTEX ID",securityNote:"Les identifiants restent dans des cookies sécurisés lisibles uniquement par le serveur.",backAuth:"Retour à l’authentification",active:"Compte actif",suspended:"Compte suspendu",banned:"Compte bloqué",unavailable:"Ce compte ne peut pas autoriser d’applications.",appRequest:"Une application demande l’accès à votre compte",p1:"Lire l’identité de base du compte",p2:"Confirmer l’état de connexion actuel",allowLater:"Autoriser (bientôt)",later:"Cette version établit le centre d’identité et de session. Les codes d’autorisation et PKCE arrivent ensuite.",signInFirst:"Connectez-vous d’abord pour continuer l’autorisation.",loggingIn:"Connexion…",connectError:"Le service d’authentification est temporairement indisponible. Réessayez plus tard."},
  "es-es": {...AUTH_EN,checking:"Comprobando el inicio de sesión…",loginTitle:"Iniciar sesión en AERTEX",email:"Correo electrónico",password:"Contraseña",continue:"Continuar",create:"Crear cuenta",signedTitle:"Has iniciado sesión",signedLead:"AERTEX ID ha reconocido la sesión actual.",openStudio:"Continuar a AERTEX",account:"Estado de la cuenta",signOut:"Cerrar sesión",authorizeTitle:"Autorizar aplicación",authorizeLead:"Confirma qué cuenta AERTEX quieres usar.",accountTitle:"Estado de la cuenta",accountLead:"Revisa el estado de la cuenta, la sesión y las autorizaciones.",usernameLabel:"Usuario",roleLabel:"Rol",sessionLabel:"Sesión de autenticación",sessionProtected:"Protegida por AERTEX ID",securityNote:"Las credenciales permanecen en cookies seguras que solo puede leer el servidor.",backAuth:"Volver a autenticación",active:"Cuenta activa",suspended:"Cuenta suspendida",banned:"Cuenta bloqueada",unavailable:"Esta cuenta no puede autorizar aplicaciones.",appRequest:"Una aplicación solicita acceso a tu cuenta",p1:"Leer la identidad básica de la cuenta",p2:"Confirmar el estado de inicio de sesión",allowLater:"Permitir (próximamente)",later:"Esta versión establece el centro de identidad y sesión. Los códigos de autorización y PKCE llegarán después.",signInFirst:"Inicia sesión primero para continuar con la autorización.",loggingIn:"Iniciando sesión…",connectError:"El servicio de autenticación no está disponible temporalmente. Inténtalo de nuevo más tarde."},
  "el-gr": {...AUTH_EN,checking:"Έλεγχος κατάστασης σύνδεσης…",loginTitle:"Σύνδεση στο AERTEX",email:"Email",password:"Κωδικός πρόσβασης",continue:"Συνέχεια",create:"Δημιουργία λογαριασμού",signedTitle:"Έχετε συνδεθεί",signedLead:"Το AERTEX ID αναγνώρισε την τρέχουσα συνεδρία.",openStudio:"Συνέχεια στο AERTEX",account:"Κατάσταση λογαριασμού",signOut:"Αποσύνδεση",authorizeTitle:"Εξουσιοδότηση εφαρμογής",authorizeLead:"Επιβεβαιώστε ποιον λογαριασμό AERTEX θέλετε να χρησιμοποιήσετε.",accountTitle:"Κατάσταση λογαριασμού",accountLead:"Ελέγξτε την τρέχουσα κατάσταση λογαριασμού, συνεδρίας και εξουσιοδότησης.",usernameLabel:"Όνομα χρήστη",roleLabel:"Ρόλος",sessionLabel:"Συνεδρία ελέγχου ταυτότητας",sessionProtected:"Προστατεύεται από AERTEX ID",securityNote:"Τα διαπιστευτήρια παραμένουν σε ασφαλή cookie που διαβάζονται μόνο από τον διακομιστή.",backAuth:"Επιστροφή στο Auth",active:"Ο λογαριασμός είναι ενεργός",suspended:"Ο λογαριασμός έχει ανασταλεί",banned:"Ο λογαριασμός έχει αποκλειστεί",unavailable:"Αυτός ο λογαριασμός δεν μπορεί να εξουσιοδοτήσει εφαρμογές.",appRequest:"Μια εφαρμογή ζητά πρόσβαση στον λογαριασμό σας",p1:"Ανάγνωση βασικής ταυτότητας λογαριασμού",p2:"Επιβεβαίωση τρέχουσας κατάστασης σύνδεσης",allowLater:"Να επιτραπεί (προσεχώς)",later:"Αυτή η έκδοση δημιουργεί το κέντρο ταυτότητας και συνεδρίας. Οι κωδικοί εξουσιοδότησης και το PKCE ακολουθούν.",signInFirst:"Συνδεθείτε πρώτα για να συνεχίσετε την εξουσιοδότηση.",loggingIn:"Σύνδεση…",connectError:"Η υπηρεσία ελέγχου ταυτότητας δεν είναι προσωρινά διαθέσιμη. Δοκιμάστε ξανά αργότερα."},
  "ar-sa": {...AUTH_EN,checking:"جارٍ التحقق من حالة تسجيل الدخول…",loginTitle:"تسجيل الدخول إلى AERTEX",email:"البريد الإلكتروني",password:"كلمة المرور",continue:"متابعة",create:"إنشاء حساب",signedTitle:"تم تسجيل دخولك",signedLead:"تعرّف AERTEX ID على جلستك الحالية.",openStudio:"المتابعة إلى AERTEX",account:"حالة الحساب",signOut:"تسجيل الخروج",authorizeTitle:"تفويض التطبيق",authorizeLead:"أكد حساب AERTEX الذي تريد استخدامه.",accountTitle:"حالة الحساب",accountLead:"راجع حالة الحساب والجلسة والتفويض الحالية.",usernameLabel:"اسم المستخدم",roleLabel:"الدور",sessionLabel:"جلسة المصادقة",sessionProtected:"محمي بواسطة AERTEX ID",securityNote:"تبقى بيانات الاعتماد في ملفات Cookie آمنة لا يمكن قراءتها إلا من الخادم.",backAuth:"العودة إلى المصادقة",active:"الحساب نشط",suspended:"الحساب موقوف مؤقتًا",banned:"الحساب محظور",unavailable:"لا يمكن لهذا الحساب تفويض التطبيقات.",appRequest:"يطلب تطبيق الوصول إلى حسابك",p1:"قراءة هوية الحساب الأساسية",p2:"تأكيد حالة تسجيل الدخول الحالية",allowLater:"السماح (قريبًا)",later:"ينشئ هذا الإصدار مركز الهوية والجلسة. ستأتي رموز التفويض وPKCE في المرحلة التالية.",signInFirst:"سجّل الدخول أولاً لمتابعة التفويض.",loggingIn:"جارٍ تسجيل الدخول…",connectError:"خدمة المصادقة غير متاحة مؤقتًا. حاول مرة أخرى لاحقًا."}
};

function authCopy(locale, authHost) {
  const base = AUTH_COPY[locale] || AUTH_EN;
  const loginLead = locale==="zh-cn" ? `使用你的 AERTEX 账号继续。认证状态由 ${authHost} 独立维护。`
    : locale==="zh-tw" ? `使用你的 AERTEX 帳號繼續。驗證狀態由 ${authHost} 獨立維護。`
    : locale==="ja-jp" ? `AERTEX アカウントで続けます。認証状態は ${authHost} が独立して管理します。`
    : locale==="ko-kr" ? `AERTEX 계정으로 계속하세요. 인증 상태는 ${authHost}에서 독립적으로 관리합니다.`
    : locale==="fr-fr" ? `Continuez avec votre compte AERTEX. L’authentification est gérée séparément par ${authHost}.`
    : locale==="es-es" ? `Continúa con tu cuenta AERTEX. La autenticación se gestiona de forma independiente en ${authHost}.`
    : locale==="el-gr" ? `Συνεχίστε με τον λογαριασμό AERTEX. Η πιστοποίηση διατηρείται ανεξάρτητα από το ${authHost}.`
    : locale==="ar-sa" ? `تابع باستخدام حساب AERTEX. تتم إدارة حالة المصادقة بشكل مستقل بواسطة ${authHost}.`
    : `Continue with your AERTEX account. Authentication is maintained by ${authHost}.`;
  return { ...base, loginLead };
}

function notFoundPage() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>404 · AERTEX ID</title></head><body style="font-family:system-ui;margin:40px"><h1>404</h1><p>Authentication page not found.</p><a href="/">AERTEX ID</a></body></html>`;
}
