import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { html, json } from "./routing.js";
import { baseHead, supabaseScript } from "./ui-page.js";

export async function handleAuthHandoff(request, env, locale) {
  const origin = request.headers.get("Origin") || "";
  const referer = request.headers.get("Referer") || "";
  const fetchSite = (request.headers.get("Sec-Fetch-Site") || "").toLowerCase();
  const fetchMode = (request.headers.get("Sec-Fetch-Mode") || "").toLowerCase();
  const fetchDest = (request.headers.get("Sec-Fetch-Dest") || "").toLowerCase();
  const productionOrigin = "https://auth.qsseda.studio";
  const previewAllowed = env?.AUTH_PREVIEW_ALLOW_WORKERS_DEV === "1";
  let refererOrigin = "";
  try { refererOrigin = referer ? new URL(referer).origin : ""; } catch {}
  const missingOrigin = origin === "" || origin === "null";
  const trustedRefererFallback = missingOrigin && refererOrigin === productionOrigin;
  const trustedSameSiteNavigation = missingOrigin && (fetchSite === "same-site" || fetchSite === "same-origin") && (fetchMode === "navigate" || fetchMode === "") && (fetchDest === "document" || fetchDest === "");
  const trustedProductionHandoff = origin === productionOrigin || trustedRefererFallback || trustedSameSiteNavigation;
  if (!trustedProductionHandoff && !previewAllowed) {
    return json({ error: "Invalid authentication origin" }, 403);
  }

  let form;
  try { form = await request.formData(); } catch { return json({ error: "Invalid handoff request" }, 400); }
  const accessToken = typeof form.get("access_token") === "string" ? form.get("access_token") : "";
  const refreshToken = typeof form.get("refresh_token") === "string" ? form.get("refresh_token") : "";
  const next = normalizeHandoffNext(form.get("next"), locale);
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

  return authHandoffHtml(accessToken, refreshToken, next);
}

export function normalizeHandoffNext(value, locale) {
  const candidate = typeof value === "string" ? value.trim() : "";
  const fallback = locale === "zh" ? "/zh-cn/dashboard" : "/en/dashboard";
  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\u0000")) return fallback;
  if (candidate.startsWith("/zh-cn/") || candidate.startsWith("/en/")) return candidate;
  const prefix = locale === "zh" ? "/zh-cn" : "/en";
  return `${prefix}${candidate === "/" ? "/dashboard" : candidate}`;
}

export function scriptLiteral(value) {
  return JSON.stringify(String(value || "")).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

export function authHandoffHtml(accessToken, refreshToken, next) {
  const page = `<!DOCTYPE html><html><head>${baseHead("QssedA Studio")}</head><body><main style="min-height:100vh;display:grid;place-items:center;padding:24px"><section style="text-align:center"><h1 style="font-size:24px;margin:0 0 8px">QssedA Studio</h1><p id="handoff-status" style="color:var(--muted,#8e8e93)">正在同步登录状态…</p></section></main>${supabaseScript()}<script>(async()=>{const status=document.getElementById("handoff-status");const result=await supabaseClient.auth.setSession({access_token:${scriptLiteral(accessToken)},refresh_token:${scriptLiteral(refreshToken)}});if(result.error){status.textContent="登录状态同步失败，请返回认证中心重试。";return}location.replace(${scriptLiteral(next)})})().catch(()=>{document.getElementById("handoff-status").textContent="登录状态同步失败，请返回认证中心重试。"})</script></body></html>`;
  return new Response(page, { status: 200, headers: { "content-type": "text/html;charset=UTF-8", "cache-control": "no-store", "referrer-policy": "no-referrer", "x-content-type-options": "nosniff" } });
}

