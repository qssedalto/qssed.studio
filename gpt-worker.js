/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 *
 * AERTEX history note:
 * This comment came from the project's original monolithic Cloudflare Worker
 * and is intentionally preserved across the workers that were later split from it.
 */

import { huaweiHarmonyGate } from "./studio/huawei-harmony-gate.js";
import { injectSweiFontMarkup, sweiFontAssetResponse } from "./studio/swei-font.js";
import { handleStudioSessionLogout, verifyStudioPageSession, withStudioSessionCookies } from "./studio/session-gate.js";
import { handleAuthHandoff } from "./studio/auth-handoff.js";
import { gptSessionRedirect } from "./studio/gpt-subdomain.js";
import { renderGptApp, renderSharedConversation, renderIntelligenceNotFound } from "./studio/gpt-ui.js";
import { handleAiApi, handleAiAdminApi } from "./studio/ai-gateway.js";
import { verifyNativeAppSession, nativeJson, nativeApiResponse } from "./studio/native-mobile-auth.js";
import { handleAccountSecurity } from "./studio/account-security-api.js";
import { gptOriginForRequest, mainOriginForRequest } from "./studio/domain-family.js";
import { FAVICON_PATHS, faviconResponse } from "./studio/favicon.js";
import { injectBrandLogoRuntime, LOGO_PATHS, logoResponse } from "./studio/brand-logo.js";
import { accountMenuClientScript, accountMenuMarkup, accountMenuStyles, injectAccountMenuRuntime } from "./studio/account-menu.js";
import { SUPABASE_URL, SUPABASE_KEY } from "./studio/config.js";
import { intelligenceThemeAttr, intelligenceThemeBootScript, intelligenceThemeFromRequest } from "./studio/intelligence-theme.js";
import { localeFromPath, preferredLocaleFromRequest } from "./studio/locale.js";


export default {
  async fetch(request, env) {
    const deviceGate = await huaweiHarmonyGate(request);
    if (deviceGate) return deviceGate;

    const url = new URL(request.url);
    const pathname = normalizeHuaweiExemptPath(normalizePath(url.pathname));
    const intelligenceTheme = intelligenceThemeFromRequest(request);

    if (FAVICON_PATHS.has(pathname)) return faviconResponse(request);
    if (LOGO_PATHS.has(pathname)) return logoResponse(request);
    const sweiAsset = sweiFontAssetResponse(pathname, request.method);
    if (sweiAsset) return sweiAsset;

    if (pathname === "/health") {
      return json({
        service: "qsseda-gpt",
        status: "ok",
        origin: gptOriginForRequest(request),
        ingress_colo: request.cf?.colo || null
      });
    }

    if (pathname === "/robots.txt") {
      return text("User-agent: *\nDisallow: /\n", 200, "text/plain;charset=UTF-8");
    }

    const sharedMatch = pathname.match(/^\/share\/([0-9a-f-]{36})$/i);
    if (sharedMatch) {
      const locale = preferredLocale(request);
      const payload = await loadSharedConversation(sharedMatch[1]);
      if (!payload?.conversation) return html(renderIntelligenceNotFound(locale, { kind: "shared", theme: intelligenceTheme }), 404);
      return html(renderSharedConversation(locale, payload, intelligenceTheme));
    }

    if (pathname === "/auth/handoff") {
      if (request.method !== "POST") return text("Method not allowed", 405);
      const locale = preferredLocale(request);
      return handleAuthHandoff(request, env, locale);
    }

    if (pathname === "/api/auth/logout") {
      if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
      return handleStudioSessionLogout(request);
    }

    if (pathname === "/api/account/security/summary") {
      return handleAccountSecurity(request, "summary");
    }

    if (pathname.startsWith("/_internal/admin-ai/")) {
      return handleInternalAdminAi(request, env, pathname);
    }

    if (pathname.startsWith("/api/ai/admin/")) {
      return json({ error: "Not found." }, 404);
    }

    // Native AERTEX Intelligence uses the same audited AI gateway as the web,
    // but its identity is an independently verified Bearer session, never cookies.
    if (pathname.startsWith("/api/native/intelligence/")) {
      const prefix = "/api/native/intelligence";
      const tail = pathname.slice(prefix.length);
      const conversationId = tail.startsWith("/conversations/") ? tail.slice("/conversations/".length) : "";
      const conversation = /^[0-9a-f-]{36}$/i.test(conversationId);
      const allowed = tail === "/config" ? ["GET"]
        : tail === "/chat" ? ["POST"]
        : tail === "/conversations" ? ["GET"]
        : conversation ? ["GET", "PATCH", "DELETE"] : null;
      if (!allowed) return nativeJson({ error: "Native intelligence route not found." }, 404);
      if (!allowed.includes(request.method)) return nativeJson({ error: "Method not allowed." }, 405);

      const gate = await verifyNativeAppSession(request);
      if (!gate.ok) return gate.response;
      const nativeSession = { ...gate, native: true };
      const target = new URL(request.url);
      target.pathname = "/api/ai" + tail;
      target.search = "";
      const internalRequest = new Request(target, request);
      return nativeApiResponse(await handleAiApi(internalRequest, env, nativeSession));
    }

    if (pathname.startsWith("/api/ai/")) {
      const gate = await verifyStudioPageSession(request);
      if (!gate.ok) {
        return withStudioSessionCookies(json({ error: "Authentication required." }, 401), gate.cookies || []);
      }
      const response = await handleAiApi(request, env, gate);
      return withStudioSessionCookies(response, gate.cookies || []);
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return text("Method not allowed", 405);
    }

    if (pathname === "/") {
      const locale = preferredLocale(request);
      return redirect(`${gptOriginForRequest(request)}/${locale}`);
    }

    const routeLocale = localeFromPath(pathname);
    const routeParts = pathname.split("/").filter(Boolean);
    const localizedRest = routeLocale ? routeParts.slice(1) : routeParts;

    if (localizedRest[0] === "admin") {
      return html(renderIntelligenceNotFound(routeLocale || preferredLocale(request), { kind: "page", theme: intelligenceTheme }), 404);
    }

    let conversationId = "";
    if (routeLocale && localizedRest[0] === "c") {
      const exempt = localizedRest[1] === "huawei-exempt";
      const id = exempt ? localizedRest[2] : localizedRest[1];
      const expectedLength = exempt ? 3 : 2;
      if (localizedRest.length === expectedLength && /^[0-9a-f-]{36}$/i.test(id || "")) conversationId = id;
    }

    if (routeLocale && (localizedRest.length === 0 || conversationId)) {
      const locale = routeLocale;
      const gate = await verifyStudioPageSession(request);
      if (!gate.ok) {
        return withStudioSessionCookies(gptSessionRedirect(request, pathname), gate.cookies || []);
      }
      const bootstrap = await loadGptBootstrap(request, env, gate, conversationId);
      if (conversationId && !bootstrap.current) {
        const missing = withStudioSessionCookies(html(renderIntelligenceNotFound(locale, { kind: "conversation", theme: intelligenceTheme }), 404), gate.cookies || []);
        return request.method === "HEAD" ? new Response(null,{status:missing.status,headers:missing.headers}) : missing;
      }
      const response = withStudioSessionCookies(html(renderShell(locale, { ...bootstrap, theme: intelligenceTheme, mainOrigin: mainOriginForRequest(request) })), gate.cookies || []);
      return request.method === "HEAD"
        ? new Response(null, { status: response.status, headers: response.headers })
        : response;
    }

    const notFoundLocale = preferredLocale(request);
    return html(renderIntelligenceNotFound(notFoundLocale, { kind: "page", theme: intelligenceTheme }), 404);
  }
};

async function handleInternalAdminAi(request, env, pathname) {
  const expectedSecret = String(env?.ADMIN_BRIDGE_SECRET || "");
  const suppliedSecret = String(request.headers.get("X-AERTEX-Control-Secret") || "");
  if (!expectedSecret || !suppliedSecret || suppliedSecret !== expectedSecret) {
    return json({ error: "Not found." }, 404);
  }

  const accessToken = String(request.headers.get("X-AERTEX-User-Token") || "").trim();
  if (!accessToken || accessToken.length > 16000) return json({ error: "Not found." }, 404);

  let userResponse;
  try {
    userResponse = await fetch(SUPABASE_URL + "/auth/v1/user", {
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + accessToken }
    });
  } catch {
    return json({ error: "Control bridge unavailable." }, 503);
  }
  if (!userResponse.ok) return json({ error: "Not found." }, 404);
  const user = await userResponse.json();

  const url = new URL(request.url);
  url.pathname = pathname.replace(/^\/_internal\/admin-ai\//, "/api/ai/admin/");
  const headers = new Headers(request.headers);
  headers.delete("X-AERTEX-Control-Secret");
  headers.delete("X-AERTEX-User-Token");
  headers.set("Origin", url.origin);
  headers.set("Authorization", "Bearer " + accessToken);

  const proxied = new Request(url.toString(), {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual"
  });
  return handleAiAdminApi(proxied, env, { ok: true, user, accessToken, cookies: [] });
}

function renderShell(locale, bootstrap = {}) {
  return renderGptApp(locale, bootstrap);
}

// 页面启动时通过内部请求加载账号配置和对话列表，指定会话时再追加其详情；返回数据仍须遵循当前登录态权限。
async function loadGptBootstrap(request, env, gate, conversationId = "") {
  const tasks = [
    handleAiApi(internalRequest(request, "/api/ai/config"), env, gate),
    handleAiApi(internalRequest(request, "/api/ai/conversations"), env, gate)
  ];
  if (conversationId) tasks.push(handleAiApi(internalRequest(request, "/api/ai/conversations/" + conversationId), env, gate));
  const responses = await Promise.all(tasks);
  const [configResponse, conversationsResponse, conversationResponse] = responses;
  return {
    config: configResponse?.ok ? await configResponse.json().catch(() => null) : null,
    conversations: conversationsResponse?.ok ? await conversationsResponse.json().catch(() => []) : [],
    current: conversationId && conversationResponse?.ok ? await conversationResponse.json().catch(() => null) : null
  };
}

function internalRequest(request, path) {
  const url = new URL(path, request.url);
  const headers = new Headers(request.headers);
  if (request.cf?.country) headers.set("CF-IPCountry", request.cf.country);
  return new Request(url.toString(), { method: "GET", headers });
}

async function loadSharedConversation(token) {
  try {
    const response = await fetch(SUPABASE_URL + "/rest/v1/rpc/get_shared_ai_conversation", {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        "content-type": "application/json;charset=UTF-8",
        Accept: "application/json"
      },
      body: JSON.stringify({ p_share_token: token })
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function preferredLocale(request) {
  return preferredLocaleFromRequest(request);
}

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function normalizeHuaweiExemptPath(pathname) {
  const segments = String(pathname || "/").split("/").filter(Boolean);
  if (segments.length < 2) return pathname || "/";

  const markerIndex = segments.length - 2;
  if (String(segments[markerIndex] || "").toLowerCase() !== "huawei-exempt") return pathname || "/";

  segments.splice(markerIndex, 1);
  return "/" + segments.join("/");
}

function securityHeaders(contentType) {
  return new Headers({
    "content-type": contentType,
    "cache-control": "no-store",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "strict-transport-security": "max-age=31536000; includeSubDomains",
    "content-security-policy": "default-src 'none'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; font-src https://cdn.jsdelivr.net data:; img-src 'self' data: https:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"
  });
}

function html(markup, status = 200) {
  return new Response(
    injectSweiFontMarkup(injectBrandLogoRuntime(injectAccountMenuRuntime(markup))),
    { status, headers: securityHeaders("text/html;charset=UTF-8") }
  );
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: securityHeaders("application/json;charset=UTF-8") });
}

function text(body, status = 200, contentType = "text/plain;charset=UTF-8") {
  return new Response(body, { status, headers: securityHeaders(contentType) });
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


