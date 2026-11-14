import { verifyStudioPageSession, withStudioSessionCookies } from "./session-gate.js";
import { authOriginForRequest, gptOriginForRequest, mainOriginForRequest } from "./domain-family.js";
import { FAVICON_LINKS } from "./favicon.js";
import { injectBrandLogoRuntime } from "./brand-logo.js";
import { localeDirection, localeFromPath as sharedLocaleFromPath, normalizeSupportedLocale, preferredLocaleFromRequest, SUPPORTED_LOCALES } from "./locale.js";


export function isMainGptHandoffPath(pathname) {
  const path = typeof pathname === "string" ? pathname.replace(/\/+$/, "") || "/" : "/";
  if (path === "/gpt/handoff") return true;
  const locale = sharedLocaleFromPath(path);
  if (!locale) return false;
  const parts = path.split("/").filter(Boolean);
  return parts.length === 3 && parts[1] === "gpt" && parts[2] === "handoff";
}

export function gptSessionRedirect(request, next = "/") {
  const locale = localeFromPath(next) || preferredLocaleFromRequest(request);
  const safeNext = canonicalGptPath(next, locale);
  const target = new URL("/gpt/handoff", mainOriginForRequest(request));
  target.searchParams.set("next", safeNext);
  return redirect(target.toString());
}

// 从主站进入 Intelligence 时，先确认请求方法和当前站内会话，再构建目标产品的登录交接，不能跳过用户校验。
export async function handleMainGptHandoff(request) {
  if (request.method !== "GET") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" }
    });
  }

  const requestUrl = new URL(request.url);
  const requestedNext = safeGptPath(requestUrl.searchParams.get("next"));
  const locale = localeFromPath(requestedNext) || preferredLocale(request, requestUrl.pathname);
  const next = canonicalGptPath(requestedNext, locale);
  const gate = await verifyStudioPageSession(request);


  if (!gate.ok || !gate.accessToken) {
    const returnPath = `/${locale}/gpt/handoff?next=${encodeURIComponent(next)}`;
    const authUrl = new URL("/continue", authOriginForRequest(request));
    authUrl.searchParams.set("next", returnPath);
    return withStudioSessionCookies(redirect(authUrl.toString()), gate.cookies || []);
  }

  const gptOrigin = gptOriginForRequest(request);
  const handoffText = {"zh-cn":"正在进入 AERTEX Intelligence…","zh-tw":"正在進入 AERTEX Intelligence…","ja-jp":"AERTEX Intelligence に移動しています…","ko-kr":"AERTEX Intelligence로 이동 중…","fr-fr":"Ouverture d’AERTEX Intelligence…","es-es":"Entrando en AERTEX Intelligence…","el-gr":"Μετάβαση στο AERTEX Intelligence…","ar-sa":"جارٍ الدخول إلى AERTEX Intelligence…"}[locale] || "Entering AERTEX Intelligence…";
  const page = `<!doctype html><html lang="${locale}" dir="${localeDirection(locale)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AERTEX Intelligence</title>${FAVICON_LINKS}</head><body><main style="min-height:100vh;display:grid;place-items:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"><p>${handoffText}</p></main><form id="handoff" method="post" action="${gptOrigin}/auth/handoff"><input type="hidden" name="access_token" value="${escapeHtml(gate.accessToken)}"><input type="hidden" name="next" value="${escapeHtml(next)}"></form><script>document.getElementById("handoff").submit()</script></body></html>`;

  const headers = new Headers({
    "content-type": "text/html;charset=UTF-8",
    "cache-control": "no-store",
    "referrer-policy": "origin",
    "x-content-type-options": "nosniff",
    "content-security-policy": `default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; form-action ${gptOrigin}; base-uri 'none'; frame-ancestors 'none'`
  });

  return withStudioSessionCookies(new Response(injectBrandLogoRuntime(page), { status: 200, headers }), gate.cookies || []);
}

function preferredLocale(request, pathname) {
  return sharedLocaleFromPath(pathname) || preferredLocaleFromRequest(request);
}

function localeFromPath(pathname) {
  return sharedLocaleFromPath(pathname);
}

// 登录后的目标地址只接受单斜杠开头的本地路径，双斜杠和 NUL 一律回退根路径，减少开放重定向风险。
function safeGptPath(value) {
  const path = typeof value === "string" ? value.trim() : "";
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\u0000")) return "/";
  return path;
}

function canonicalGptPath(path, locale) {
  const normalizedLocale = normalizeSupportedLocale(locale) || "en-us";
  const candidate = safeGptPath(path);
  const parts = candidate.split("/").filter(Boolean);
  const candidateLocale = normalizeSupportedLocale(parts[0]);
  const rest = candidateLocale ? parts.slice(1) : parts;
  if (rest[0] === "c" && rest[1] === "huawei-exempt" && /^[0-9a-f-]{36}$/i.test(rest[2] || "")) {
    return `/${normalizedLocale}/c/huawei-exempt/${rest[2]}`;
  }
  if (rest[0] === "c" && /^[0-9a-f-]{36}$/i.test(rest[1] || "")) {
    return `/${normalizedLocale}/c/${rest[1]}`;
  }
  return `/${normalizedLocale}`;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[character]));
}

function redirect(location) {
  return new Response(null, {
    status: 302,
    headers: {
      location,
      "cache-control": "no-store",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff"
    }
  });
}
