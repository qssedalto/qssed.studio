import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { html, json } from "./routing.js";
import { baseHead, supabaseScript } from "./ui-page.js";
import { injectBrandLogoRuntime } from "./brand-logo.js";
import { studioSessionCookies, withStudioSessionCookies } from "./session-gate.js";
import { isServiceHost, rootDomainForHost, serviceOrigin } from "./domain-family.js";

export async function handleAuthHandoff(request, env, locale) {
  const requestUrl = new URL(request.url);
  const hostname = requestUrl.hostname.toLowerCase();
  const root = rootDomainForHost(hostname) || "qsseda.com";
  const authOrigin = serviceOrigin(root, "auth");
  const mainOrigin = serviceOrigin(root);
  const workTarget = isServiceHost(hostname, "work");
  const gptTarget = isServiceHost(hostname, "gpt");
  const isolatedTarget = workTarget || gptTarget;
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
  const next = normalizeHandoffNext(form.get("next"), locale, workTarget, gptTarget);
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

  const response = authHandoffHtml(accessToken, refreshToken, next, workTarget, gptTarget);
  return withStudioSessionCookies(response, studioSessionCookies(accessToken, refreshToken, undefined, request));
}

export function normalizeHandoffNext(value, locale, workTarget = false, gptTarget = false) {
  const candidate = typeof value === "string" ? value.trim() : "";
  if (workTarget) {
    const candidateLocale = candidate === "/en" || candidate.startsWith("/en/") ? "en" : candidate === "/zh-cn" || candidate.startsWith("/zh-cn/") ? "zh" : locale;
    return candidateLocale === "zh" ? "/zh-cn/tex" : "/en/tex";
  }
  if (gptTarget) {
    const candidateLocale = candidate === "/en" || candidate.startsWith("/en/") ? "en" : candidate === "/zh-cn" || candidate.startsWith("/zh-cn/") ? "zh" : locale;
    const exemptConversation = candidate.match(/^\/(?:zh-cn|en)\/c\/huawei-exempt\/([0-9a-f-]{36})$/i);
    if (exemptConversation) return (candidateLocale === "zh" ? "/zh-cn/c/huawei-exempt/" : "/en/c/huawei-exempt/") + exemptConversation[1];
    const conversation = candidate.match(/^\/(?:zh-cn|en)\/c\/([0-9a-f-]{36})$/i);
    if (conversation) return (candidateLocale === "zh" ? "/zh-cn/c/" : "/en/c/") + conversation[1];
    return candidateLocale === "zh" ? "/zh-cn" : "/en";
  }
  const fallback = locale === "zh" ? "/zh-cn" : "/en";
  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\u0000")) return fallback;
  if (candidate === "/zh-cn" || candidate === "/en" || candidate.startsWith("/zh-cn/") || candidate.startsWith("/en/")) return candidate;
  const prefix = locale === "zh" ? "/zh-cn" : "/en";
  return candidate === "/" ? prefix : `${prefix}${candidate}`;
}

export function scriptLiteral(value) {
  return JSON.stringify(String(value || "")).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

export function authHandoffHtml(accessToken, refreshToken, next, workTarget = false, gptTarget = false) {
  const product = workTarget ? "AERTEX Work" : gptTarget ? "AERTEX Intelligence" : "AERTEX";
  const page = `<!DOCTYPE html><html><head>${baseHead(product)}</head><body><main style="min-height:100vh;display:grid;place-items:center;padding:24px"><section style="text-align:center"><h1 style="font-size:24px;margin:0 0 8px">${product}</h1><p id="handoff-status" style="color:var(--muted,#8e8e93)">正在同步登录状态…</p></section></main>${supabaseScript()}<script>(async()=>{const status=document.getElementById("handoff-status");const result=await supabaseClient.auth.setSession({access_token:${scriptLiteral(accessToken)},refresh_token:${scriptLiteral(refreshToken)}});if(result.error){status.textContent="登录状态同步失败，请返回认证中心重试。";return}location.replace(${scriptLiteral(next)})})().catch(()=>{document.getElementById("handoff-status").textContent="登录状态同步失败，请返回认证中心重试。"})</script></body></html>`;
  return new Response(injectBrandLogoRuntime(page), { status: 200, headers: { "content-type": "text/html;charset=UTF-8", "cache-control": "no-store", "referrer-policy": "no-referrer", "x-content-type-options": "nosniff" } });
}
