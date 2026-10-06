// 初学者导读：华为/鸿蒙特定拦截与豁免路由规则；顺序和重复标记有明确语义，修改前要同时核对 404/豁免组合约束。
import { authOriginForRequest, isServiceHost, rootDomainForHost } from "./domain-family.js";
import { SUPABASE_URL, SUPABASE_KEY, TEXT } from "./config.js";
import { buildLinks, getRouteInfo, html } from "./routing.js";
import { notFoundPage } from "./auth-pages.js";
import { verifyStudioPageSession, withStudioSessionCookies } from "./session-gate.js";
import { localeFromPath, preferredLocaleFromRequest } from "./locale.js";

const DETECTION_RE = /(HarmonyOS|OpenHarmony|HuaweiBrowser|HUAWEI)/i;
const DEVICE_ROUTE_MARKER = "huawei-exempt";
const PREVIEW_ROUTE = "/hw";
const ROUTE_EXEMPTION_COOKIE = "__Secure-aertex-huawei-route-exempt";
const ROUTE_EXEMPTION_COOKIE_VALUE = "v2";
const ROUTE_EXEMPTION_MAX_AGE = 60 * 60 * 24 * 30;
const EXEMPTION_CODE = "AERTEX-HW-7K9Q-26";
const ACCOUNT_MARKER_COOKIE = "__Secure-qsseda-account-id";

// 设备兼容 Gate 在各产品 Worker 的最前面运行（包括 AERTEX Watch UI）。
// 它只决定“这个请求是否需要兼容拦截/豁免页”，不读取或修改 Watch 的 ActivityWatch/R2 数据。
export async function huaweiHarmonyGate(request) {
  const invalidRoute = invalidHuaweiRouteResponse(request);
  if (invalidRoute) return invalidRoute;
  if (hasDeviceRouteMarker(request)) return handleHuaweiExemptionRoute(request);
  if (isExplicitPreviewRequest(request)) return renderHuaweiUnsupportedPage(request);
  if (isExemptionVerificationTransport(request)) return null;

  if (hasHuaweiRouteExemptionCookie(request)) {
    if (shouldAutoApplyExemptionRoute(request)) return redirectToHuaweiExemptionRoute(request);
    return null;
  }

  if (!isHuaweiOrHarmonyRequest(request)) return null;

  const accountExemption = await huaweiAccountExemption(request);
  if (accountExemption.authorized) {
    const refreshedSession = authorizedAccountSessionRefreshResponse(request, accountExemption.cookies);
    return refreshedSession || null;
  }

  if (!accountExemption.signedIn && hasDomainAccountMarker(request)) {
    return redirectToAccountVerification(request);
  }

  const blocked = renderHuaweiUnsupportedPage(request, {
    signedIn: accountExemption.signedIn,
    authorized: false
  });
  return withStudioSessionCookies(blocked, accountExemption.cookies);
}

// 先验证 /hw 与 /huawei-exempt 标记的位置和次数，避免构造奇怪路径绕过普通路由规则。
function invalidHuaweiRouteResponse(request) {
  try {
    const url = new URL(request.url);
    const segments = url.pathname.split("/").filter(Boolean).map(normalizeRouteSegment);
    const previewMarker = PREVIEW_ROUTE.slice(1).toLowerCase();
    const exemptionCount = segments.filter(segment => segment === DEVICE_ROUTE_MARKER).length;
    const previewCount = segments.filter(segment => segment === previewMarker).length;

    // Route-marker invariants:
    // - /hw is the explicit Huawei interception preview and is valid only once, at the end.
    // - /huawei-exempt is valid only once, directly before the final resource segment.
    // - the preview and exemption markers are mutually exclusive in every ordering.
    if (exemptionCount >= 2 || previewCount >= 2) return brandedNotFound(request);
    if (exemptionCount === 1 && previewCount === 1) return brandedNotFound(request);

    if (previewCount === 1) {
      const previewIndex = segments.lastIndexOf(previewMarker);
      if (previewIndex !== segments.length - 1) return brandedNotFound(request);
    }

    if (exemptionCount === 1) {
      const markerIndex = segments.lastIndexOf(DEVICE_ROUTE_MARKER);
      if (markerIndex !== segments.length - 2) return brandedNotFound(request);
    }

    return null;
  } catch {
    return null;
  }
}

function normalizeRouteSegment(segment) {
  const value = String(segment || "");
  try {
    return decodeURIComponent(value).toLowerCase();
  } catch {
    return value.toLowerCase();
  }
}

function brandedNotFound(request) {
  const { pathname, locale, fullLocale } = getRouteInfo(request);
  const t = TEXT[locale];
  let host = "qsseda.com";
  try { host = new URL(request.url).hostname.toLowerCase(); } catch {}
  return html(notFoundPage(t, buildLinks(locale, pathname, fullLocale), {
    locale: fullLocale,
    host,
    requestedPath: pathname,
    returnHref: "/"
  }), 404);
}

// 已登录用户的豁免来自账户侧 device_access_exemptions；会话验证仍复用 session-gate，
 // 因而 aw.* Watch 也遵守同一个账号身份边界。
async function huaweiAccountExemption(request) {
  let session;
  try {
    session = await verifyStudioPageSession(request);
  } catch {
    return { authorized: false, signedIn: false, cookies: [] };
  }

  const cookies = Array.isArray(session?.cookies) ? session.cookies : [];
  if (!session?.ok || !session?.user?.id || !session?.accessToken) {
    return { authorized: false, signedIn: false, cookies };
  }

  try {
    const url = new URL(SUPABASE_URL + "/rest/v1/device_access_exemptions");
    url.searchParams.set("select", "enabled,expires_at");
    url.searchParams.set("user_id", "eq." + session.user.id);
    url.searchParams.set("policy", "eq.huawei_device");
    url.searchParams.set("limit", "1");

    const response = await fetch(url.toString(), {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: "Bearer " + session.accessToken,
        Accept: "application/json"
      }
    });
    if (!response.ok) return { authorized: false, signedIn: true, cookies };

    const rows = await response.json().catch(() => []);
    const row = Array.isArray(rows) ? rows[0] : null;
    const active = row?.enabled === true
      && (!row?.expires_at || Date.parse(row.expires_at) > Date.now());

    return { authorized: active, signedIn: true, cookies };
  } catch {
    return { authorized: false, signedIn: true, cookies };
  }
}

function hasDomainAccountMarker(request) {
  const header = request?.headers?.get("Cookie") || "";
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index <= 0) continue;
    if (part.slice(0, index).trim() !== ACCOUNT_MARKER_COOKIE) continue;
    const value = part.slice(index + 1).trim();
    return Boolean(value && value !== "signed-out");
  }
  return false;
}

function redirectToAccountVerification(request) {
  return new Response(null, {
    status: 302,
    headers: {
      location: exemptionVerificationUrl(request, false),
      "cache-control": "no-store",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff"
    }
  });
}

function authorizedAccountSessionRefreshResponse(request, sessionCookies = []) {
  if (!Array.isArray(sessionCookies) || !sessionCookies.length) return null;

  let location = "/";
  try {
    const url = new URL(request.url);
    location = url.pathname + url.search;
  } catch {}

  const headers = new Headers({
    location,
    "cache-control": "no-store",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff"
  });
  for (const value of sessionCookies) headers.append("set-cookie", value);
  return new Response(null, { status: 302, headers });
}

function shouldAutoApplyExemptionRoute(request) {
  try {
    const method = String(request?.method || "GET").toUpperCase();
    if (method !== "GET" && method !== "HEAD") return false;

    const url = new URL(request.url);
    if (hasDeviceRouteMarker(request)) return false;

    const pathname = url.pathname || "/";
    if (pathname === "/") return false;
    if (
      pathname === "/health" ||
      pathname === "/robots.txt" ||
      pathname === "/auth/handoff" ||
      isExemptionVerificationTransport(request) ||
      pathname.startsWith("/api/") ||
      pathname.startsWith("/.well-known/") ||
      pathname.startsWith("/favicon") ||
      pathname === "/icon.svg" ||
      pathname === "/logo.svg"
    ) return false;

    const fetchDest = String(request.headers.get("Sec-Fetch-Dest") || "").toLowerCase();
    if (fetchDest && fetchDest !== "document") return false;

    const accept = String(request.headers.get("Accept") || "").toLowerCase();
    if (!fetchDest && accept && !accept.includes("text/html") && !accept.includes("*/*")) return false;

    return true;
  } catch {
    return false;
  }
}

function redirectToHuaweiExemptionRoute(request) {
  try {
    const url = new URL(request.url);
    const segments = url.pathname.split("/").filter(Boolean);
    if (!segments.length) return null;

    segments.splice(Math.max(0, segments.length - 1), 0, DEVICE_ROUTE_MARKER);
    url.pathname = "/" + segments.join("/");

    return new Response(null, {
      status: 302,
      headers: {
        location: url.pathname + url.search,
        "cache-control": "no-store",
        "referrer-policy": "no-referrer",
        "x-content-type-options": "nosniff"
      }
    });
  } catch {
    return null;
  }
}

function hasDeviceRouteMarker(request) {
  try {
    const segments = new URL(request.url).pathname.split("/").filter(Boolean);
    return segments.length >= 2 && String(segments[segments.length - 2] || "").toLowerCase() === DEVICE_ROUTE_MARKER;
  } catch {
    return false;
  }
}

async function handleHuaweiExemptionRoute(request) {
  if (hasHuaweiRouteExemptionCookie(request)) return null;

  const method = String(request?.method || "GET").toUpperCase();
  if (method === "GET" || method === "HEAD") {
    return renderHuaweiExemptionChallenge(request);
  }

  if (method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: {
        "content-type": "text/plain;charset=UTF-8",
        "cache-control": "no-store",
        "allow": "GET, HEAD, POST",
        "x-content-type-options": "nosniff"
      }
    });
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return renderHuaweiExemptionChallenge(request, {
      error: "无法读取验证信息，请重新输入授权码。",
      showCode: true,
      status: 400
    });
  }

  const confirmed = String(form.get("device_confirm") || "").trim().toLowerCase();
  const code = String(form.get("authorization_code") || "").trim().toUpperCase();

  if (confirmed !== "yes") {
    return renderHuaweiExemptionChallenge(request, {
      error: "请先明确确认你正在使用华为或 HarmonyOS 设备。",
      showCode: false,
      status: 400
    });
  }

  if (code !== EXEMPTION_CODE) {
    return renderHuaweiExemptionChallenge(request, {
      error: "授权码无效。请确认代码后重试。",
      showCode: true,
      status: 403
    });
  }

  let url;
  try {
    url = new URL(request.url);
  } catch {
    url = new URL("https://qsseda.com/");
  }

  const headers = new Headers({
    location: url.pathname + url.search,
    "cache-control": "no-store",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff"
  });
  headers.append("set-cookie", huaweiRouteExemptionCookie(request));
  return new Response(null, { status: 303, headers });
}

function hasHuaweiRouteExemptionCookie(request) {
  const cookieHeader = request?.headers?.get("Cookie") || "";
  for (const part of cookieHeader.split(";")) {
    const index = part.indexOf("=");
    if (index <= 0) continue;
    const name = part.slice(0, index).trim();
    if (name !== ROUTE_EXEMPTION_COOKIE) continue;
    const value = part.slice(index + 1).trim();
    return value === ROUTE_EXEMPTION_COOKIE_VALUE;
  }
  return false;
}

function huaweiRouteExemptionCookie(request) {
  let domain = "";
  try {
    domain = rootDomainForHost(new URL(request.url).hostname);
  } catch {}
  const domainAttr = domain ? `; Domain=.${domain}` : "";
  return `${ROUTE_EXEMPTION_COOKIE}=${ROUTE_EXEMPTION_COOKIE_VALUE}; Path=/; Max-Age=${ROUTE_EXEMPTION_MAX_AGE}; Secure; HttpOnly; SameSite=Lax${domainAttr}`;
}

function ordinaryRouteUrl(request) {
  try {
    const url = new URL(request.url);
    const segments = url.pathname.split("/").filter(Boolean);
    const markerIndex = segments.length - 2;
    if (markerIndex >= 0 && String(segments[markerIndex] || "").toLowerCase() === DEVICE_ROUTE_MARKER) {
      segments.splice(markerIndex, 1);
      url.pathname = "/" + segments.join("/");
    }
    return url.pathname + url.search;
  } catch {
    return "/";
  }
}

function renderHuaweiExemptionChallenge(request, options = {}) {
  const error = String(options.error || "");
  const showCode = Boolean(options.showCode);
  const status = Number(options.status) || 200;
  const ordinaryHref = escapeHtml(ordinaryRouteUrl(request));
  const errorMarkup = error ? `<div class="error" role="alert">${escapeHtml(error)}</div>` : "";
  const codeClass = showCode ? "code-panel visible" : "code-panel";

  const markup = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<title>华为设备访问豁免验证</title>
<style>
  :root{
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",Arial,sans-serif;
    color-scheme:light dark;
    --bg:#f6f7f9;
    --surface:#fff;
    --text:#15171a;
    --muted:#60656d;
    --line:#dfe3e8;
    --danger:#b42318;
    --danger-soft:#fff1f0;
    --danger-line:#f1b7b2;
    --button:#15171a;
    --button-text:#fff;
    --secondary:#f1f3f5;
  }
  *{box-sizing:border-box}
  html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text)}
  body{display:flex;justify-content:center}
  main{width:min(100%,720px);min-height:100vh;padding:clamp(34px,7vw,72px) clamp(22px,6vw,48px) 56px;background:var(--surface)}
  .eyebrow{display:inline-flex;align-items:center;gap:8px;margin:0 0 24px;padding:8px 12px;border:1px solid var(--danger-line);border-radius:999px;background:var(--danger-soft);color:var(--danger);font-size:14px;font-weight:750}
  .dot{width:8px;height:8px;border-radius:50%;background:currentColor}
  h1{margin:0 0 18px;font-size:clamp(34px,7vw,52px);line-height:1.14;letter-spacing:-.035em}
  .lead{margin:0 0 28px;font-size:clamp(18px,4vw,24px);line-height:1.75;color:var(--muted)}
  .warning{margin:0 0 30px;padding:20px 22px;border:1px solid var(--danger-line);border-radius:22px;background:var(--danger-soft)}
  .warning strong{display:block;margin-bottom:8px;color:var(--danger);font-size:18px}
  .warning p{margin:0;color:var(--text);line-height:1.7}
  .question{margin:0 0 14px;font-size:22px;font-weight:780;line-height:1.4}
  .hint{margin:0 0 22px;color:var(--muted);line-height:1.7}
  .actions{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:26px}
  button,a.button{appearance:none;border:0;border-radius:16px;min-height:56px;padding:14px 18px;font:inherit;font-weight:730;cursor:pointer;text-decoration:none;display:flex;align-items:center;justify-content:center;text-align:center}
  .primary{background:var(--button);color:var(--button-text)}
  .secondary{background:var(--secondary);color:var(--text);border:1px solid var(--line)!important}
  .code-panel{display:none;margin-top:8px;padding:24px;border:1px solid var(--line);border-radius:22px;background:rgba(127,127,127,.035)}
  .code-panel.visible{display:block}
  .code-panel h2{margin:0 0 8px;font-size:23px}
  .code-panel p{margin:0 0 18px;color:var(--muted);line-height:1.65}
  label{display:block;margin-bottom:8px;font-size:14px;font-weight:700}
  input{width:100%;height:56px;border:1px solid var(--line);border-radius:14px;padding:0 16px;background:var(--surface);color:var(--text);font:inherit;font-size:17px;letter-spacing:.02em;outline:none}
  input:focus{border-color:var(--text);box-shadow:0 0 0 3px color-mix(in srgb,var(--text) 12%,transparent)}
  .submit{width:100%;margin-top:14px}
  .error{margin:0 0 18px;padding:14px 16px;border-radius:14px;background:var(--danger-soft);border:1px solid var(--danger-line);color:var(--danger);font-weight:700;line-height:1.55}
  .foot{margin:26px 0 0;padding-top:22px;border-top:1px solid var(--line);color:var(--muted);font-size:14px;line-height:1.7}
  @media(max-width:560px){.actions{grid-template-columns:1fr}}
  @media(prefers-color-scheme:dark){
    :root{
      --bg:#090c10;
      --surface:#0f1318;
      --text:#f4f6f8;
      --muted:#aeb6c0;
      --line:#303740;
      --danger:#ff8a80;
      --danger-soft:#271516;
      --danger-line:#6b3434;
      --button:#f4f6f8;
      --button-text:#11151a;
      --secondary:#181e25;
    }
  }
</style>
</head>
<body>
<main>
  <div class="eyebrow"><span class="dot"></span>受限设备访问通道</div>
  <h1>确认你的设备</h1>
  <p class="lead">你正在进入华为 / HarmonyOS 设备专用的访问豁免路由。此入口不是普通访问地址。</p>

  <section class="warning" aria-label="重要警告">
    <strong>⚠️ 重要警告</strong>
    <p>继续操作代表你明确知道当前页面属于设备访问豁免。豁免只允许绕过设备拦截，不代表本站已经完成华为设备或 HarmonyOS 的兼容适配；后续页面仍可能出现显示、交互或功能异常。</p>
  </section>

  <p class="question">你现在是否正在使用华为 / HarmonyOS 设备？</p>
  <p class="hint">请选择真实情况。非华为设备没有必要使用此特殊入口。</p>

  ${errorMarkup}

  <div class="actions">
    <button class="primary" id="confirmHuawei" type="button">是，我正在使用华为设备</button>
    <a class="button secondary" href="${ordinaryHref}">否，返回普通入口</a>
  </div>

  <form method="post" class="${codeClass}" id="codePanel">
    <input type="hidden" name="device_confirm" value="yes">
    <h2>输入设备访问授权码</h2>
    <p>此路由需要额外授权。只有获得站点管理员提供的授权码后才可继续。</p>
    <label for="authorizationCode">授权码</label>
    <input id="authorizationCode" name="authorization_code" type="text" inputmode="text" autocomplete="one-time-code" autocapitalize="characters" spellcheck="false" required>
    <button class="primary submit" type="submit">验证授权码并继续</button>
  </form>

  <p class="foot">验证成功后，此浏览器在当前 AERTEX 域名体系下 30 天内不会再次显示本确认页。清除 Cookie、切换域名体系或授权失效后需要重新验证。</p>
</main>
<script>
(function(){
  var button=document.getElementById("confirmHuawei");
  var panel=document.getElementById("codePanel");
  var input=document.getElementById("authorizationCode");
  if(!button||!panel)return;
  button.addEventListener("click",function(){
    panel.classList.add("visible");
    button.setAttribute("aria-expanded","true");
    setTimeout(function(){if(input)input.focus()},80);
  });
  ${showCode ? 'setTimeout(function(){if(input)input.focus()},80);' : ''}
})();
</script>
</body>
</html>`;

  const headers = new Headers({
    "content-type": "text/html;charset=UTF-8",
    "cache-control": "no-store, no-cache, must-revalidate",
    "pragma": "no-cache",
    "expires": "0",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"
  });

  if (request?.method === "HEAD") return new Response(null, { status, headers });
  return new Response(markup, { status, headers });
}

function isExemptionVerificationTransport(request) {
  try {
    const url = new URL(request.url);
    if (isServiceHost(url.hostname, "auth")) return true;
    if (url.pathname === "/auth/handoff") return true;
    const locale = localeFromPath(url.pathname);
    const parts = url.pathname.split("/").filter(Boolean);
    const rest = locale ? parts.slice(1) : parts;
    return rest.length === 2 && rest[1] === "handoff" && (rest[0] === "gpt" || rest[0] === "work" || rest[0] === "control");
  } catch {
    return false;
  }
}

function isExplicitPreviewRequest(request) {
  try {
    if (request?.method && request.method !== "GET" && request.method !== "HEAD") return false;
    const url = new URL(request.url);
    const pathname = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;
    if (pathname === "/__test/huawei-device-gate") return true;

    const previewMarker = PREVIEW_ROUTE.slice(1).toLowerCase();
    const segments = pathname.split("/").filter(Boolean).map(normalizeRouteSegment);
    return segments.length > 0 && segments[segments.length - 1] === previewMarker;
  } catch {
    return false;
  }
}

/// 统一识别需要兼容处理的 Huawei/Harmony 请求特征，产品 Worker 不应各自复制一套 UA 判断。
export function isHuaweiOrHarmonyRequest(request) {
  const headers = request?.headers;
  if (!headers) return false;

  const fingerprint = [
    headers.get("user-agent") || "",
    headers.get("sec-ch-ua") || "",
    headers.get("sec-ch-ua-platform") || "",
    headers.get("sec-ch-ua-model") || ""
  ].join(" ");

  return DETECTION_RE.test(fingerprint);
}

function exemptionVerificationUrl(request, forceAccountSwitch = false) {
  try {
    const current = new URL(request.url);
    const currentPath = current.pathname + current.search;
    const locale = localeFromPath(current.pathname) || preferredLocaleFromRequest(request);

    let returnPath = currentPath;
    if (isServiceHost(current.hostname, "gpt")) {
      returnPath = `/${locale}/gpt/handoff?next=${encodeURIComponent(currentPath)}`;
    } else if (isServiceHost(current.hostname, "work")) {
      returnPath = `/${locale}/work/handoff?next=${encodeURIComponent(currentPath)}`;
    } else if (isServiceHost(current.hostname, "cash")) {
      returnPath = `/${locale}/cash/handoff?next=${encodeURIComponent(currentPath)}`;
    }

    const authOrigin = authOriginForRequest(request);
    if (forceAccountSwitch) {
      const logout = new URL("/logout", authOrigin);
      logout.searchParams.set("next", "/continue?next=" + encodeURIComponent(returnPath));
      return logout.toString();
    }

    const target = new URL("/continue", authOrigin);
    target.searchParams.set("next", returnPath);
    return target.toString();
  } catch {
    return "https://auth.qsseda.com/continue";
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderHuaweiUnsupportedPage(request, options = {}) {
  const signedIn = Boolean(options.signedIn);
  const verifyHref = escapeHtml(exemptionVerificationUrl(request, signedIn));
  const exemptionCopy = signedIn
    ? {
        title: "当前 AERTEX ID 未获得访问豁免",
        body: "你已经登录 AERTEX ID，但当前账号没有华为 / HarmonyOS 设备访问豁免。如需继续，请使用另一个已获授权的 AERTEX ID。",
        button: "使用其他 AERTEX ID 验证"
      }
    : {
        title: "拥有访问豁免？",
        body: "如果管理员已为您的 AERTEX ID 授予设备访问豁免，可验证身份后继续。",
        button: "使用 AERTEX ID 验证"
      };
  const markup = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<title>暂未适配华为设备</title>
<style>
  :root{
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",Arial,sans-serif;
    color-scheme:light dark;
    --page-bg:#f7f9fc;
    --surface:#ffffff;
    --text:#111827;
    --muted:#4b5563;
    --card-border:#dfe4ea;
    --card-top:#fbfcfd;
    --card-bottom:#f6f8fa;
    --button-bg:#111827;
    --button-text:#ffffff;
    --button-hover:#202938;
  }
  *{box-sizing:border-box}
  html,body{margin:0;min-height:100%;background:var(--page-bg);color:var(--text)}
  body{display:flex;justify-content:center}
  main{width:min(100%,760px);min-height:100vh;padding:clamp(40px,8vw,84px) clamp(24px,7vw,56px) 64px;background:var(--surface)}
  h1{margin:0 0 38px;font-size:clamp(34px,7vw,54px);line-height:1.18;letter-spacing:-.03em;font-weight:800}
  .lead{margin:0 0 58px;font-size:clamp(21px,4.4vw,31px);line-height:1.85;color:var(--muted)}
  .notice{margin:0 0 52px;font-size:clamp(22px,4.5vw,32px);line-height:1.8;font-weight:800;color:var(--text)}
  .exemption{margin:0 0 52px;padding:clamp(24px,5vw,34px);border:1px solid var(--card-border);border-radius:28px;background:var(--card-top)}
  .exemption h2{margin:0 0 12px;font-size:clamp(23px,4.6vw,31px);line-height:1.35}
  .exemption p{margin:0 0 22px;font-size:clamp(17px,3.7vw,22px);line-height:1.75;color:var(--muted)}
  .verify-button{display:flex;align-items:center;justify-content:center;min-height:58px;width:100%;padding:14px 20px;border-radius:18px;background:var(--button-bg);color:var(--button-text);font-size:clamp(17px,3.7vw,21px);font-weight:700;text-decoration:none;transition:background .18s ease,transform .18s ease}
  .verify-button:hover{background:var(--button-hover)}
  .verify-button:active{transform:scale(.985)}
  .verify-button:focus-visible{outline:3px solid currentColor;outline-offset:3px}
  .card{border:1px solid var(--card-border);border-radius:34px;padding:clamp(30px,6vw,48px);background:linear-gradient(180deg,var(--card-top) 0%,var(--card-bottom) 100%)}
  .card h2{margin:0 0 34px;font-size:clamp(27px,5vw,38px);line-height:1.35}
  .card p{margin:0 0 34px;font-size:clamp(19px,4vw,28px);line-height:1.9;color:var(--muted)}
  .card p:last-child{margin-bottom:0}
  @media (prefers-color-scheme:dark){
    :root{
      --page-bg:#090d12;
      --surface:#0d1218;
      --text:#f3f6fa;
      --muted:#b3bdc9;
      --card-border:#303943;
      --card-top:#151b22;
      --card-bottom:#11171e;
      --button-bg:#f3f6fa;
      --button-text:#10151c;
      --button-hover:#dfe5ec;
    }
  }
</style>
</head>
<body>
<main>
  <h1>检测到您使用华为手机</h1>
  <p class="lead">本站目前暂未适配华为手机、鸿蒙系统及相关运行环境。</p>
  <p class="notice">需要明确说明：本站没有适配华为设备的义务。</p>
  <section class="exemption" aria-labelledby="exemption-title">
    <h2 id="exemption-title">${escapeHtml(exemptionCopy.title)}</h2>
    <p>${escapeHtml(exemptionCopy.body)}</p>
    <a class="verify-button" href="${verifyHref}">${escapeHtml(exemptionCopy.button)}</a>
  </section>
  <section class="card" aria-labelledby="why">
    <h2 id="why">关于“为什么不适配”</h2>
    <p>是否兼容某一品牌、系统或设备，属于本站自行决定的技术范围。用户选择什么手机，是用户的自由；本站选择支持什么设备，同样属于本站自身的产品决策。</p>
    <p>华为设备并不会因为其品牌、用户规模或市场地位，自动获得本站的适配资格。本站也不存在必须为所有品牌、所有系统、所有终端环境逐一完成兼容工作的责任。</p>
  </section>
</main>
</body>
</html>`;

  const headers = new Headers({
    "content-type": "text/html;charset=UTF-8",
    "cache-control": "no-store, no-cache, must-revalidate",
    "pragma": "no-cache",
    "expires": "0",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"
  });

  if (request?.method === "HEAD") return new Response(null, { status: 200, headers });
  return new Response(markup, { status: 200, headers });
}
