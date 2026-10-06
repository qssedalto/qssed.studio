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

import { protectEdgeRequest, applyEdgeProtectionHeaders } from "./studio/edge-protection.js";
import { FAVICON_PATHS, faviconResponse } from "./studio/favicon.js";
import { LOGO_PATHS, logoResponse } from "./studio/brand-logo.js";
import { adminOriginForRequest, mainOriginForRequest } from "./studio/domain-family.js";
import { adminSessionRedirect } from "./studio/admin-subdomain.js";
import { handleAuthorizedAccessAuditAdmin, recordAccessAudit } from "./studio/access-audit.js";
import { handleAdminAccess, handleAdminAction } from "./admin/admin-api.js";
import { handleAdminContent } from "./admin/content-api.js";
import {
  adminHeaders,
  adminSessionLogoutResponse,
  handleAdminHandoff,
  verifyAdminSession,
  withAdminSessionCookies
} from "./admin/session.js";
import { adminHtml, hiddenAdminNotFound, renderAdminConsole } from "./admin/ui.js";
import { adminCanonicalPath, adminLocaleFromPath, localizeAdminHtml, preferredAdminLocale } from "./admin/i18n.js";

const PAGE_PATHS = new Set(["/", "/overview", "/users", "/roles", "/access", "/content", "/storage", "/billing", "/student-verification", "/intelligence", "/logs", "/system"]);

export default {
  async fetch(request, env, ctx) {
    const blocked = await protectEdgeRequest(request, env);
    if (blocked) return applyEdgeProtectionHeaders(request, blocked);

    const startedAt = Date.now();
    let response;
    try {
      response = await routeAdminRequest(request, env);
    } catch (error) {
      scheduleAudit(ctx, request, new Response(null, { status: 500 }), env, startedAt);
      throw error;
    }

    scheduleAudit(ctx, request, response, env, startedAt);
    return applyEdgeProtectionHeaders(request, response);
  }
};

async function routeAdminRequest(request, env) {
  const url = new URL(request.url);
  const pathname = normalizePath(url.pathname);

  if (FAVICON_PATHS.has(pathname)) return faviconResponse(request);
  if (LOGO_PATHS.has(pathname)) return logoResponse(request);

  if (pathname === "/health") {
    return json({
      service: "qsseda-admin",
      status: "ok",
      origin: adminOriginForRequest(request),
      time: new Date().toISOString()
    });
  }

  if (pathname === "/robots.txt") {
    return new Response("User-agent: *\nDisallow: /\n", {
      status: 200,
      headers: adminHeaders("text/plain;charset=UTF-8")
    });
  }

  if (pathname === "/auth/handoff") {
    return handleAdminHandoff(request);
  }

  if (pathname === "/api/auth/logout") {
    if (request.method !== "POST" || !sameOrigin(request)) return hiddenAdminNotFound();
    return adminSessionLogoutResponse();
  }

  if (pathname.startsWith("/api/admin/") || pathname === "/api/admin/access") {
    const session = await verifyAdminSession(request);
    if (!session.ok) return withAdminSessionCookies(hiddenAdminNotFound(), session.cookies || []);

    let response;
    if (pathname === "/api/admin/access") {
      if (request.method !== "GET") return hiddenAdminNotFound();
      response = await handleAdminAccess(request);
    } else if (pathname === "/api/admin/access-audit") {
      response = await handleAuthorizedAccessAuditAdmin(request, env);
    } else if (pathname === "/api/admin/content/summaries") {
      response = await handleAdminContent(request, env, session, "summaries");
    } else if (pathname === "/api/admin/content/links") {
      response = await handleAdminContent(request, env, session, "links");
    } else if (pathname === "/api/admin/content/link") {
      response = await handleAdminContent(request, env, session, "link");
    } else if (pathname === "/api/admin/storage/files") {
      response = await handleAdminContent(request, env, session, "storage-files");
    } else if (pathname === "/api/admin/storage/object") {
      response = await handleAdminContent(request, env, session, "storage-object");
    } else if (pathname.startsWith("/api/admin/ai/")) {
      response = await proxyAiAdmin(request, env, session, pathname);
    } else {
      const action = pathname.slice("/api/admin/".length);
      response = await handleAdminAction(request, env, action);
    }
    return withAdminSessionCookies(response, session.cookies || []);
  }

  if (request.method !== "GET" && request.method !== "HEAD") return hiddenAdminNotFound();

  const page = adminLocaleFromPath(pathname);
  if (!page.path) return hiddenAdminNotFound();

  if (!page.locale) {
    const targetPath = page.path === "/overview" ? "/" : page.path;
    return redirect(adminCanonicalPath(preferredAdminLocale(request), targetPath));
  }
  if (page.path === "/overview") return redirect(adminCanonicalPath(page.locale, "/"));

  const session = await verifyAdminSession(request);
  if (!session.ok) {
    return withAdminSessionCookies(
      adminSessionRedirect(request, adminCanonicalPath(page.locale, page.path)),
      session.cookies || []
    );
  }

  const identity = String(
    session.user?.email ||
    session.user?.user_metadata?.username ||
    session.user?.id ||
    "Administrator"
  ).slice(0, 180);

  const markup = renderAdminConsole(page.path, {
    identity,
    root: adminOriginForRequest(request).replace(/^https:\/\//, ""),
    mainHref: `${mainOriginForRequest(request)}/${page.locale}`,
    build: "control-plane-v1"
  });
  const response = adminHtml(localizeAdminHtml(markup, page.locale, page.path));

  return request.method === "HEAD"
    ? new Response(null, { status: response.status, headers: response.headers })
    : response;
}

async function proxyAiAdmin(request, env, session, pathname) {
  if (!env?.GPT_CONTROL || !env?.ADMIN_BRIDGE_SECRET) {
    return json({ error: "Intelligence administration bridge is unavailable." }, 503);
  }

  const sourceUrl = new URL(request.url);
  const targetUrl = new URL("https://gpt.qsseda.com/_internal/admin-ai/" + pathname.slice("/api/admin/ai/".length));
  targetUrl.search = sourceUrl.search;

  const headers = new Headers();
  headers.set("X-AERTEX-Control-Secret", String(env.ADMIN_BRIDGE_SECRET));
  headers.set("X-AERTEX-User-Token", String(session.accessToken || ""));
  headers.set("Accept", request.headers.get("Accept") || "application/json");
  const contentType = request.headers.get("Content-Type");
  if (contentType) headers.set("Content-Type", contentType);

  const upstream = await env.GPT_CONTROL.fetch(new Request(targetUrl.toString(), {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual"
  }));

  const responseHeaders = new Headers({
    "content-type": upstream.headers.get("content-type") || "application/json;charset=UTF-8",
    "cache-control": "private, no-store",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    "x-robots-tag": "noindex, nofollow, noarchive, nosnippet"
  });
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders
  });
}

function scheduleAudit(ctx, request, response, env, startedAt) {
  const promise = recordAccessAudit(request, response, env, startedAt, "admin")
    .catch(error => console.error("Admin access audit write failed", error));
  if (ctx?.waitUntil) ctx.waitUntil(promise);
}

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function sameOrigin(request) {
  const url = new URL(request.url);
  return (request.headers.get("Origin") || "") === url.origin;
}

function redirect(location) {
  return new Response(null, {
    status: 302,
    headers: {
      location,
      "cache-control": "private, no-store",
      "referrer-policy": "no-referrer",
      "x-robots-tag": "noindex, nofollow, noarchive, nosnippet"
    }
  });
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: adminHeaders("application/json;charset=UTF-8")
  });
}
