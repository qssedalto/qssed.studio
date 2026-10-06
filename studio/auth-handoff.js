/**
 * 【初学者导读】
 * 文件：studio/auth-handoff.js
 * 认证/安全模块：负责登录态、来源、Cookie、边缘保护或授权边界。
 * 阅读顺序：先看 export/入口函数，再看它调用的辅助函数；遇到 API 路径、存储键或域名判断时，向上追到 Worker 路由，向下追到具体数据源。
 * 数据流：建议始终回答四个问题——输入从哪里来？在哪里校验？修改了什么状态/存储？最后返回/渲染了什么？
 * 修改注意：这是安全敏感区域；不要省略来源校验、权限判断、Cookie/redirect 限制或失败分支。
 * 调试方法：先使用最小请求复现，再逐步检查分支条件和中间状态，避免只根据最终 UI 猜原因。
 */
import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { html, json } from "./routing.js";
import { baseHead, supabaseScript } from "./ui-page.js";
import { injectBrandLogoRuntime } from "./brand-logo.js";
import { studioSessionCookies, withStudioSessionCookies } from "./session-gate.js";
import { isServiceHost, rootDomainForHost, serviceOrigin } from "./domain-family.js";
import { localeDirection, localeFromPath, normalizeSupportedLocale } from "./locale.js";

// 认证交接入口：验证请求来源/Fetch Metadata，再解析目标产品 next，最后把认证站产生的 token 安全交给受信任子域。\nexport async function handleAuthHandoff(request, env, locale) {
  const requestUrl = new URL(request.url);
  const hostname = requestUrl.hostname.toLowerCase();
  const root = rootDomainForHost(hostname) || "qsseda.com";
  const authOrigin = serviceOrigin(root, "auth");
  const mainOrigin = serviceOrigin(root);
  const workTarget = isServiceHost(hostname, "work");
  const gptTarget = isServiceHost(hostname, "gpt");
  const cashTarget = isServiceHost(hostname, "cash");
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

// 交接 next 规范化：根据目标产品只允许其站内路径，拒绝任意绝对 URL 和跨产品逃逸路径。\nexport function normalizeHandoffNext(value, locale, workTarget = false, gptTarget = false, cashTarget = false, watchTarget = false) {
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

  if (cashTarget || watchTarget) return prefix;

  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\u0000")) return prefix;
  if (localeFromPath(candidate)) return candidate;
  return candidate === "/" ? prefix : prefix + candidate;
}

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

// 交接 HTML：页面只做一次受控 postMessage/fetch/跳转，把 token 传给指定 AERTEX 产品并尽快离开；不要在 DOM 可见文本或 URL 查询串中暴露 token。\nexport function authHandoffHtml(accessToken, refreshToken, next, workTarget = false, gptTarget = false, cashTarget = false, watchTarget = false, authOrigin = "https://auth.qsseda.com", retryNext = next) {
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
