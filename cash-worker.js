import { huaweiHarmonyGate } from "./studio/huawei-harmony-gate.js";
import { handleStudioSessionLogout, verifyStudioPageSession, withStudioSessionCookies } from "./studio/session-gate.js";
import { handleAuthHandoff } from "./studio/auth-handoff.js";
import { cashSessionRedirect } from "./studio/cash-subdomain.js";
import { cashOriginForRequest } from "./studio/domain-family.js";
import { localeFromPath, preferredLocaleFromRequest } from "./studio/locale.js";

const MAX_DATA_BYTES = 2 * 1024 * 1024;
const ASSET_PATHS = new Set(["/styles.css", "/model.js", "/app.js", "/icon.svg"]);

export default {
  async fetch(request, env) {
    const deviceGate = await huaweiHarmonyGate(request);
    if (deviceGate) return deviceGate;

    const url = new URL(request.url);
    const pathname = normalizePath(url.pathname);

    if (pathname === "/health") {
      return json({
        service: "qsseda-cash",
        status: "ok",
        origin: cashOriginForRequest(request),
        storage: Boolean(env?.STORAGE)
      });
    }

    if (pathname === "/robots.txt") {
      return text("User-agent: *\nDisallow: /\n", 200, "text/plain;charset=UTF-8");
    }

    if (pathname === "/auth/handoff") {
      if (request.method !== "POST") return text("Method not allowed", 405);
      return handleAuthHandoff(request, env, preferredLocaleFromRequest(request));
    }

    if (pathname === "/api/auth/logout") {
      if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
      return handleStudioSessionLogout(request);
    }

    if (pathname === "/api/cash/data") {
      const gate = await verifyStudioPageSession(request);
      if (!gate.ok) {
        return withStudioSessionCookies(json({ error: "Authentication required." }, 401), gate.cookies || []);
      }
      const response = await handleCashData(request, env, gate.user?.id || "");
      return withStudioSessionCookies(response, gate.cookies || []);
    }

    if (ASSET_PATHS.has(pathname)) {
      if (request.method !== "GET" && request.method !== "HEAD") return text("Method not allowed", 405);
      return serveAsset(request, env, pathname);
    }

    if (request.method !== "GET" && request.method !== "HEAD") return text("Method not allowed", 405);

    if (pathname === "/") {
      const locale = preferredLocaleFromRequest(request);
      return redirect(`${cashOriginForRequest(request)}/${locale}`);
    }

    const locale = localeFromPath(pathname);
    const parts = pathname.split("/").filter(Boolean);
    if (!locale || parts.length !== 1) return text("Not found", 404);

    const gate = await verifyStudioPageSession(request);
    if (!gate.ok) {
      return withStudioSessionCookies(cashSessionRedirect(request, pathname), gate.cookies || []);
    }

    const response = await serveAsset(request, env, "/index.html", {
      "cache-control": "private, no-store",
      "content-language": locale
    });
    return withStudioSessionCookies(response, gate.cookies || []);
  }
};

async function handleCashData(request, env, userId) {
  if (!env?.STORAGE || !userId) return json({ error: "Cash storage is unavailable." }, 503);
  const key = `cash/users/${userId}/data.json`;

  if (request.method === "GET") {
    try {
      const object = await env.STORAGE.get(key);
      if (!object) return json({ error: "Cash data not found." }, 404);
      let data;
      try { data = JSON.parse(await object.text()); }
      catch { return json({ error: "Stored Cash data is invalid." }, 500); }
      return json({
        data,
        updated_at: object.uploaded?.toISOString?.() || null,
        etag: object.httpEtag || object.etag || null
      });
    } catch {
      return json({ error: "Unable to load Cash data." }, 503);
    }
  }

  if (request.method === "PUT") {
    const origin = request.headers.get("Origin") || "";
    const requestOrigin = new URL(request.url).origin;
    if (origin !== requestOrigin) return json({ error: "Invalid origin." }, 403);

    const declaredLength = Number(request.headers.get("Content-Length") || 0);
    if (declaredLength > MAX_DATA_BYTES) return json({ error: "Cash data is too large." }, 413);

    let textBody = "";
    try { textBody = await request.text(); }
    catch { return json({ error: "Unable to read Cash data." }, 400); }
    if (new TextEncoder().encode(textBody).byteLength > MAX_DATA_BYTES) {
      return json({ error: "Cash data is too large." }, 413);
    }

    let data;
    try { data = JSON.parse(textBody); }
    catch { return json({ error: "Cash data must be valid JSON." }, 400); }
    if (!validCashPayload(data)) return json({ error: "Cash data has an unsupported structure." }, 400);

    try {
      await env.STORAGE.put(key, JSON.stringify(data), {
        httpMetadata: { contentType: "application/json;charset=UTF-8" },
        customMetadata: { ownerId: userId, product: "aertex-cash", schemaVersion: String(data.version) }
      });
      return json({ ok: true, saved_at: new Date().toISOString() });
    } catch {
      return json({ error: "Unable to save Cash data." }, 503);
    }
  }

  if (request.method === "DELETE") {
    const origin = request.headers.get("Origin") || "";
    if (origin !== new URL(request.url).origin) return json({ error: "Invalid origin." }, 403);
    try {
      await env.STORAGE.delete(key);
      return json({ ok: true });
    } catch {
      return json({ error: "Unable to reset Cash data." }, 503);
    }
  }

  return json({ error: "Method not allowed." }, 405);
}

function validCashPayload(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  if (![2, 3, 4].includes(Number(data.version))) return false;
  if (data.settings != null && (typeof data.settings !== "object" || Array.isArray(data.settings))) return false;
  for (const key of ["transactions", "plannedEvents", "expectedEvents", "recurringExpenses"]) {
    if (data[key] != null && !Array.isArray(data[key])) return false;
    if (Array.isArray(data[key]) && data[key].length > 20000) return false;
  }
  return true;
}

async function serveAsset(request, env, assetPath, extraHeaders = {}) {
  if (!env?.ASSETS?.fetch) return text("Cash assets are unavailable.", 503);
  const source = new URL(request.url);
  source.pathname = assetPath;
  source.search = "";
  const assetRequest = new Request(source.toString(), {
    method: request.method === "HEAD" ? "HEAD" : "GET",
    headers: request.headers
  });
  const asset = await env.ASSETS.fetch(assetRequest);
  const headers = new Headers(asset.headers);
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "same-origin");
  headers.set("x-frame-options", "DENY");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  if (assetPath === "/index.html") {
    headers.set("content-security-policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
  }
  for (const [name, value] of Object.entries(extraHeaders)) headers.set(name, value);
  return new Response(request.method === "HEAD" ? null : asset.body, {
    status: asset.status,
    statusText: asset.statusText,
    headers
  });
}

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function redirect(location) {
  return new Response(null, {
    status: 302,
    headers: { location, "cache-control": "no-store", "referrer-policy": "no-referrer" }
  });
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });
}

function text(value, status = 200, contentType = "text/plain;charset=UTF-8") {
  return new Response(value, {
    status,
    headers: {
      "content-type": contentType,
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });
}
