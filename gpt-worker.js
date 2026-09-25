import { huaweiHarmonyGate } from "./studio/huawei-harmony-gate.js";
import { handleStudioSessionLogout, verifyStudioPageSession, withStudioSessionCookies } from "./studio/session-gate.js";
import { handleAuthHandoff } from "./studio/auth-handoff.js";
import { gptSessionRedirect } from "./studio/gpt-subdomain.js";
import { renderGptApp, renderSharedConversation, renderIntelligenceNotFound } from "./studio/gpt-ui.js";
import { handleAiApi, handleAiAdminApi } from "./studio/ai-gateway.js";
import { handleAccountSecurity } from "./studio/account-security-api.js";
import { gptOriginForRequest } from "./studio/domain-family.js";
import { FAVICON_PATHS, faviconResponse } from "./studio/favicon.js";
import { injectBrandLogoRuntime } from "./studio/brand-logo.js";
import { accountMenuClientScript, accountMenuMarkup, accountMenuStyles, injectAccountMenuRuntime } from "./studio/account-menu.js";
import { SUPABASE_URL, SUPABASE_KEY } from "./studio/config.js";
import { intelligenceThemeAttr, intelligenceThemeBootScript, intelligenceThemeFromRequest } from "./studio/intelligence-theme.js";


export default {
  async fetch(request, env) {
    const deviceGate = await huaweiHarmonyGate(request);
    if (deviceGate) return deviceGate;

    const url = new URL(request.url);
    const pathname = normalizeHuaweiExemptPath(normalizePath(url.pathname));
    const intelligenceTheme = intelligenceThemeFromRequest(request);

    if (FAVICON_PATHS.has(pathname)) return faviconResponse(request);

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
      const locale = preferredLocale(request) === "en" ? "en" : "zh-cn";
      const payload = await loadSharedConversation(sharedMatch[1]);
      if (!payload?.conversation) return html(renderIntelligenceNotFound(locale, { kind: "shared", theme: intelligenceTheme }), 404);
      return html(renderSharedConversation(locale, payload, intelligenceTheme));
    }

    if (pathname === "/auth/handoff") {
      if (request.method !== "POST") return text("Method not allowed", 405);
      const locale = preferredLocale(request) === "en" ? "en" : "zh";
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

    if (
      pathname === "/admin" ||
      pathname.startsWith("/admin/") ||
      pathname === "/zh-cn/admin" ||
      pathname.startsWith("/zh-cn/admin/") ||
      pathname === "/en/admin" ||
      pathname.startsWith("/en/admin/")
    ) {
      return html(renderIntelligenceNotFound(preferredLocale(request), { kind: "page", theme: intelligenceTheme }), 404);
    }

    const conversationRoute = pathname.match(/^\/(zh-cn|en)\/c\/(?:huawei-exempt\/)?([0-9a-f-]{36})$/i);
    if (pathname === "/zh-cn" || pathname === "/en" || conversationRoute) {
      const locale = pathname.startsWith("/en") ? "en" : "zh-cn";
      const gate = await verifyStudioPageSession(request);
      if (!gate.ok) {
        return withStudioSessionCookies(gptSessionRedirect(request, pathname), gate.cookies || []);
      }
      const conversationId = conversationRoute?.[2] || "";
      const bootstrap = await loadGptBootstrap(request, env, gate, conversationId);
      if (conversationId && !bootstrap.current) {
        const missing = withStudioSessionCookies(html(renderIntelligenceNotFound(locale, { kind: "conversation", theme: intelligenceTheme }), 404), gate.cookies || []);
        return request.method === "HEAD" ? new Response(null,{status:missing.status,headers:missing.headers}) : missing;
      }
      const response = withStudioSessionCookies(html(renderShell(locale, { ...bootstrap, theme: intelligenceTheme })), gate.cookies || []);
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
  const language = (request.headers.get("Accept-Language") || "").toLowerCase();
  return language.includes("zh") ? "zh-cn" : "en";
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
    "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"
  });
}

function html(markup, status = 200) {
  return new Response(
    injectBrandLogoRuntime(injectAccountMenuRuntime(markup)),
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


