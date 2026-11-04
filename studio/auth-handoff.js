import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { html, json } from "./routing.js";
import { baseHead, supabaseScript } from "./ui-page.js";
import { injectBrandLogoRuntime } from "./brand-logo.js";
import { studioSessionCookies, withStudioSessionCookies } from "./session-gate.js";
import { isServiceHost, rootDomainForHost, serviceOrigin } from "./domain-family.js";
import { localeDirection, localeFromPath, normalizeSupportedLocale } from "./locale.js";

// 跨产品会话交接必须核对来源并验证 Supabase 用户及账号状态，避免将一个来源不明的令牌直接种到目标主机。
export async function handleAuthHandoff(request, env, locale) {
  const requestUrl = new URL(request.url);
  const hostname = requestUrl.hostname.toLowerCase();
  const root = rootDomainForHost(hostname) || "qsseda.com";
  const authOrigin = serviceOrigin(root, "auth");
  const mainOrigin = serviceOrigin(root);
  const workTarget = isServiceHost(hostname, "work");
  const gptTarget = isServiceHost(hostname, "gpt");
  const cashTarget = isServiceHost(hostname, "cash");
  // aw.* 和 Work/GPT/Cash 一样是独立产品会话边界。识别为 watchTarget 后，
  // Origin/Referer、next 路径和错误重试都会按 Watch 专用规则收紧。
  const watchTarget = isServiceHost(hostname, "aw");
  const isolatedTarget = workTarget || gptTarget || cashTarget || watchTarget;
  const origin = request.headers.get("Origin") || "";
  const referer = request.headers.get("Referer") || "";
  const fetchSite = (request.headers.get("Sec-Fetch-Site") || "").toLowerCase();
  const fetchMode = (request.headers.get("Sec-Fetch-Mode") || "").toLowerCase();
  const fetchDest = (request.headers.get("Sec-Fetch-Dest") || "").toLowerCase();
  const previewAllowed = env?.AUTH_PREVIEW_ALLOW_WORKERS_DEV === "1";
  const trustedOrigins = isolatedTarget ? new Set([authOrigin, mainOrigin]) : new Set([authOrigin]);
  let refererOrigin = "";
  try { refererOrigin = referer ? new URL(referer).origin : ""; } catch {}
  const missingOrigin = origin === "" || origin === "null";
  const trustedRefererFallback = missingOrigin && trustedOrigins.has(refererOrigin);
  const trustedSameSiteNavigation = missingOrigin && (fetchSite === "same-site" || fetchSite === "same-origin") && (fetchMode === "navigate" || fetchMode === "") && (fetchDest === "document" || fetchDest === "");
  const trustedProductionHandoff = trustedOrigins.has(origin) || trustedRefererFallback || trustedSameSiteNavigation;
  if (!trustedProductionHandoff && !previewAllowed) {
    return json({ error: "Invalid authentication origin" }, 403);
  }

  let form;
  try { form = await request.formData(); } catch { return json({ error: "Invalid handoff request" }, 400); }
  const accessToken = typeof form.get("access_token") === "string" ? form.get("access_token") : "";
  const refreshToken = typeof form.get("refresh_token") === "string" ? form.get("refresh_token") : "";
  const next = normalizeHandoffNext(form.get("next"), locale, workTarget, gptTarget, cashTarget, watchTarget);
  const retryNext = authRetryPath(next, locale, workTarget, gptTarget, cashTarget, watchTarget);
  if (!accessToken || !refreshToken) return json({ error: "Missing session" }, 400);

  let userResponse;
  try {
    userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}` } });
  } catch {
    return json({ error: "Authentication service unavailable" }, 503);
  }
  if (!userResponse.ok) return json({ error: "Session is invalid or expired" }, 401);
  const authUser = await userResponse.json();

  let profileResponse;
  try {
    profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=status&id=eq.${encodeURIComponent(authUser.id)}&limit=1`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}` } });
  } catch {
    return json({ error: "Account service unavailable" }, 503);
  }
  if (!profileResponse.ok) return json({ error: "Account service unavailable" }, 503);
  const profiles = await profileResponse.json();
  if (!Array.isArray(profiles) || profiles[0]?.status !== "active") return json({ error: "Account is not active" }, 403);

  const response = authHandoffHtml(accessToken, refreshToken, next, workTarget, gptTarget, cashTarget, watchTarget, authOrigin, retryNext);
  return withStudioSessionCookies(response, studioSessionCookies(accessToken, refreshToken, undefined, request));
}

// 规范登录成功后的站内落点。不同产品允许的深链范围不同；Watch 当前只允许语言根页。
// Work、Intelligence、Cash、Watch 的目标路径需要各自规范化；先确认服务域与 locale，再生成站内安全落点。
export function normalizeHandoffNext(value, locale, workTarget = false, gptTarget = false, cashTarget = false, watchTarget = false) {
  const candidate = typeof value === "string" ? value.trim() : "";
  const baseLocale = normalizeSupportedLocale(locale) || (locale === "zh" ? "zh-cn" : "en-us");
  const candidateLocale = localeFromPath(candidate) || baseLocale;
  const prefix = "/" + candidateLocale;

  if (workTarget) {
    const parts = candidate.split("/").filter(Boolean);
    const hasLocale = Boolean(localeFromPath(candidate));
    const rest = hasLocale ? parts.slice(1) : parts;
    if (rest[0] === "d") {
      const exempt = rest[1] === "huawei-exempt";
      const id = exempt ? rest[2] : rest[1];
      if (/^[0-9a-f-]{36}$/i.test(id || "")) return prefix + "/d/" + (exempt ? "huawei-exempt/" : "") + id;
    }
    return prefix + "/tex";
  }

  if (gptTarget) {
    const parts = candidate.split("/").filter(Boolean);
    const hasLocale = Boolean(localeFromPath(candidate));
    const rest = hasLocale ? parts.slice(1) : parts;
    if (rest[0] === "c") {
      const exempt = rest[1] === "huawei-exempt";
      const id = exempt ? rest[2] : rest[1];
      if (/^[0-9a-f-]{36}$/i.test(id || "")) return prefix + "/c/" + (exempt ? "huawei-exempt/" : "") + id;
    }
    return prefix;
  }

  // Cash/Watch 暂不接受任意深层 next：即便表单里传了别的路径，也只回 /<locale>。
  if (cashTarget || watchTarget) return prefix;

  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\u0000")) return prefix;
  if (localeFromPath(candidate)) return candidate;
  return candidate === "/" ? prefix : prefix + candidate;
}

// 会话校验失败时回到主站对应产品 handoff，而不是直接把用户丢回产品子域造成登录循环。
export function authRetryPath(next, locale, workTarget = false, gptTarget = false, cashTarget = false, watchTarget = false) {
  const code = normalizeSupportedLocale(locale) || (locale === "zh" ? "zh-cn" : "en-us");
  const prefix = "/" + code;
  if (workTarget) return `${prefix}/work/handoff?next=${encodeURIComponent(next)}`;
  if (gptTarget) return `${prefix}/gpt/handoff?next=${encodeURIComponent(next)}`;
  if (cashTarget) return `${prefix}/cash/handoff?next=${encodeURIComponent(next)}`;
  if (watchTarget) return `${prefix}/aw/handoff?next=${encodeURIComponent(next)}`;
  return next;
}

export function scriptLiteral(value) {
  return JSON.stringify(String(value || "")).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

// 最终页面只负责把已验证会话写入产品域并显示短暂过渡状态；Watch 会使用独立产品名和本地化文案。
export function authHandoffHtml(accessToken, refreshToken, next, workTarget = false, gptTarget = false, cashTarget = false, watchTarget = false, authOrigin = "https://auth.qsseda.com", retryNext = next) {
  const product = workTarget ? "AERTEX Work" : gptTarget ? "AERTEX Intelligence" : cashTarget ? "AERTEX Cash" : watchTarget ? "AERTEX Watch" : "AERTEX";
  const locale = localeFromPath(next) || "en-us";
  const copy = {
    "zh-cn":"正在完成登录…", "zh-tw":"正在完成登入…",
    "ja-jp":"サインインを完了しています…", "ko-kr":"로그인을 완료하는 중…",
    "fr-fr":"Finalisation de la connexion…", "es-es":"Finalizando el inicio de sesión…",
    "el-gr":"Ολοκλήρωση σύνδεσης…", "ar-sa":"جارٍ إكمال تسجيل الدخول…"
  }[locale] || "Finishing sign-in…";
  const page = `<!DOCTYPE html><html lang="${locale}" dir="${localeDirection(locale)}"><head>${baseHead(product)}</head><body><main style="min-height:100vh;display:grid;place-items:center;padding:24px"><section style="text-align:center"><h1 style="font-size:24px;margin:0 0 8px">${product}</h1><p id="handoff-status" style="color:var(--muted,#8e8e93)">${copy}</p></section></main>${supabaseScript()}<script>(async()=>{let result=null;try{result=await supabaseClient.auth.setSession({access_token:${scriptLiteral(accessToken)},refresh_token:${scriptLiteral(refreshToken)}})}catch{}if(result?.error){try{aertexAuthStorage.removeItem(AERTEX_SUPABASE_STORAGE_KEY)}catch{}try{result=await supabaseClient.auth.setSession({access_token:${scriptLiteral(accessToken)},refresh_token:${scriptLiteral(refreshToken)}})}catch{}}if(result?.error){console.warn("Browser auth persistence failed; continuing with validated server session",result.error)}location.replace(${scriptLiteral(next)})})().catch(()=>{location.replace(${scriptLiteral(next)})})</script></body></html>`;
  return new Response(injectBrandLogoRuntime(page), { status: 200, headers: { "content-type": "text/html;charset=UTF-8", "cache-control": "no-store", "referrer-policy": "no-referrer", "x-content-type-options": "nosniff" } });
}
