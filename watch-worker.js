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
import { handleStudioSessionLogout, verifyStudioPageSession, withStudioSessionCookies } from "./studio/session-gate.js";
import { handleAuthHandoff } from "./studio/auth-handoff.js";
import { watchSessionRedirect } from "./studio/watch-subdomain.js";
import { awOriginForRequest } from "./studio/domain-family.js";
import { localeFromPath, preferredLocaleFromRequest } from "./studio/locale.js";
import { appearanceClientRuntime } from "./studio/appearance.js";
import { FAVICON_PATHS, faviconResponse } from "./studio/favicon.js";
import { LOGO_PATHS, logoResponse } from "./studio/brand-logo.js";

const ASSET_PATHS = new Set(["/styles.css", "/app.js", "/aw-sync.mjs"]);
const MAX_SYNC_BYTES = 8 * 1024 * 1024;
const MAX_SYNC_EVENTS = 5000;
const MAX_QUERY_DAYS = 400;
const MAX_EVENT_DURATION_SECONDS = 86400 * 7;
const TOKEN_PREFIX = "awd1";
const WATCH_PREFIX = "watch/v1";
const WINDOWS_SYNC_PATH = "/AERTEX-Watch-Sync-Setup.exe";
const LEGACY_WINDOWS_SYNC_PATH = "/AERTEX-Watch-Sync.exe";
const WINDOWS_SYNC_KEY = "watch/releases/windows/AERTEX-Watch-Sync-Setup.exe";

export default {
  async fetch(request, env) {
    const deviceGate = await huaweiHarmonyGate(request);
    if (deviceGate) return deviceGate;

    const url = new URL(request.url);
    const pathname = normalizePath(url.pathname);
    const dataHost = isWatchDataHost(url.hostname);

    if (!dataHost && FAVICON_PATHS.has(pathname)) return faviconResponse(request);
    if (!dataHost && LOGO_PATHS.has(pathname)) return logoResponse(request);

    if (pathname === "/health") {
      return json({
        service: "qsseda-watch",
        status: "ok",
        origin: awOriginForRequest(request),
        role: dataHost ? "data" : "ui",
        storage: Boolean(env && env.STORAGE)
      });
    }

    if (pathname === "/robots.txt") return text("User-agent: *\nDisallow: /\n", 200, "text/plain;charset=UTF-8");

    if (url.hostname.toLowerCase() === "aw.qsseda.com" && pathname === LEGACY_WINDOWS_SYNC_PATH) {
      return redirect(url.origin + WINDOWS_SYNC_PATH);
    }

    if (pathname === WINDOWS_SYNC_PATH && url.hostname.toLowerCase() === "aw.qsseda.com") {
      return handleWindowsSyncDownload(request, env);
    }

    if (pathname === "/appearance.js") {
      if (dataHost) return text("Not found", 404);
      if (request.method !== "GET" && request.method !== "HEAD") return text("Method not allowed", 405);
      return text(request.method === "HEAD" ? "" : appearanceClientRuntime(), 200, "text/javascript;charset=UTF-8");
    }

    if (pathname === "/auth/handoff") {
      if (dataHost) return text("Not found", 404);
      if (request.method !== "POST") return text("Method not allowed", 405);
      return handleAuthHandoff(request, env, preferredLocaleFromRequest(request));
    }

    if (pathname === "/api/auth/logout") {
      if (dataHost || request.method !== "POST") return json({ error: "Method not allowed." }, 405);
      return handleStudioSessionLogout(request);
    }

    if (pathname === "/api/sync") return handleDeviceSync(request, env);

    if (pathname === "/api/watch/tokens") {
      if (dataHost) return json({ error: "Use aw.* to manage device tokens." }, 404);
      return withSession(request, async gate => handleTokenCreate(request, env, gate.user && gate.user.id || ""));
    }

    if (pathname === "/api/watch/status") {
      if (dataHost) return json({ error: "Not found." }, 404);
      return withSession(request, async gate => handleStatus(env, gate.user && gate.user.id || ""));
    }

    if (pathname === "/api/0/buckets/" || pathname === "/api/0/buckets") {
      if (dataHost) return json({ error: "Browser bucket access is available on aw.*." }, 404);
      return withSession(request, async gate => handleBucketList(env, gate.user && gate.user.id || ""));
    }

    const eventsMatch = pathname.match(/^\/api\/0\/buckets\/([^/]+)\/events$/);
    if (eventsMatch) {
      if (dataHost) return json({ error: "Browser event access is available on aw.*." }, 404);
      return withSession(request, async gate => handleEventQuery(request, env, gate.user && gate.user.id || "", decodeURIComponent(eventsMatch[1])));
    }

    if (dataHost) {
      if (pathname === "/" && (request.method === "GET" || request.method === "HEAD")) {
        return json({
          service: "AERTEX Watch Data",
          short_host: url.hostname.startsWith("awd."),
          semantic_alias: url.hostname.startsWith("aw.data."),
          api: "/api/sync"
        });
      }
      return text("Not found", 404);
    }

    if (ASSET_PATHS.has(pathname)) {
      if (request.method !== "GET" && request.method !== "HEAD") return text("Method not allowed", 405);
      return serveAsset(request, env, pathname);
    }

    if (request.method !== "GET" && request.method !== "HEAD") return text("Method not allowed", 405);

    if (pathname === "/") return redirect(awOriginForRequest(request) + "/" + preferredLocaleFromRequest(request));

    const locale = localeFromPath(pathname);
    const parts = pathname.split("/").filter(Boolean);
    if (!locale || parts.length !== 1) return text("Not found", 404);

    const gate = await verifyStudioPageSession(request);
    if (!gate.ok) return withStudioSessionCookies(watchSessionRedirect(request, pathname), gate.cookies || []);

    const response = await serveAsset(request, env, "/index.html", {
      "cache-control": "private, no-store",
      "content-language": locale
    });
    return withStudioSessionCookies(response, gate.cookies || []);
  }
};

async function handleWindowsSyncDownload(request, env) {
  if (request.method !== "GET" && request.method !== "HEAD") return text("Method not allowed", 405);
  if (!env || !env.STORAGE) return text("Watch download is unavailable.", 503);

  try {
    const object = request.method === "HEAD"
      ? await env.STORAGE.head(WINDOWS_SYNC_KEY)
      : await env.STORAGE.get(WINDOWS_SYNC_KEY);
    if (!object) return text("Not found", 404);
    const headers = new Headers({
      "content-type": "application/vnd.microsoft.portable-executable",
      "content-disposition": 'attachment; filename="AERTEX-Watch-Sync-Setup.exe"',
      "cache-control": "no-store, max-age=0",
      "x-content-type-options": "nosniff"
    });
    if (Number.isFinite(Number(object.size))) headers.set("content-length", String(object.size));
    if (object.httpEtag) headers.set("etag", object.httpEtag);
    return new Response(request.method === "HEAD" ? null : object.body, { status: 200, headers });
  } catch {
    return text("Watch download is unavailable.", 503);
  }
}

async function withSession(request, handler) {
  const gate = await verifyStudioPageSession(request);
  if (!gate.ok) return withStudioSessionCookies(json({ error: "Authentication required." }, 401), gate.cookies || []);
  const response = await handler(gate);
  return withStudioSessionCookies(response, gate.cookies || []);
}

async function handleTokenCreate(request, env, userId) {
  if (!env || !env.STORAGE || !userId) return json({ error: "Watch storage is unavailable." }, 503);
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  if (!sameOrigin(request)) return json({ error: "Invalid origin." }, 403);

  let body = {};
  try { body = await request.json(); } catch {}
  const name = cleanText(body && body.name, 80) || "ActivityWatch device";
  const token = TOKEN_PREFIX + "." + randomToken(32);
  const hash = await sha256Hex(token);
  const record = {
    version: 1,
    user_id: userId,
    name,
    created_at: new Date().toISOString(),
    last_used_at: null
  };

  try {
    await env.STORAGE.put(WATCH_PREFIX + "/tokens/" + hash + ".json", JSON.stringify(record), {
      httpMetadata: { contentType: "application/json;charset=UTF-8" },
      customMetadata: { product: "aertex-watch", kind: "device-token" }
    });
  } catch {
    return json({ error: "Unable to create device token." }, 503);
  }
  return json({ token, name, created_at: record.created_at }, 201);
}

async function handleDeviceSync(request, env) {
  if (!env || !env.STORAGE) return json({ error: "Watch storage is unavailable." }, 503);
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const declared = Number(request.headers.get("Content-Length") || 0);
  if (declared > MAX_SYNC_BYTES) return json({ error: "Sync payload is too large." }, 413);

  const auth = await verifyDeviceToken(request, env);
  if (!auth.ok) return json({ error: "Invalid device token." }, 401);

  let bodyText = "";
  try { bodyText = await request.text(); }
  catch { return json({ error: "Unable to read sync payload." }, 400); }
  if (new TextEncoder().encode(bodyText).byteLength > MAX_SYNC_BYTES) return json({ error: "Sync payload is too large." }, 413);

  let payload;
  try { payload = JSON.parse(bodyText); }
  catch { return json({ error: "Sync payload must be valid JSON." }, 400); }

  const bucket = normalizeBucket(payload && payload.bucket);
  const rawEvents = payload && Array.isArray(payload.events) ? payload.events : [];
  const events = rawEvents.map(normalizeEvent).filter(Boolean);
  if (!bucket || !events.length) return json({ error: "A valid bucket and at least one event are required." }, 400);
  if (events.length > MAX_SYNC_EVENTS) return json({ error: "At most " + MAX_SYNC_EVENTS + " events can be uploaded per request." }, 413);

  const userId = auth.record.user_id;
  const now = new Date().toISOString();
  const groups = new Map();
  for (const event of events) {
    const day = dayKey(event.timestamp);
    if (!day) continue;
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day).push(event);
  }
  if (!groups.size) return json({ error: "No events contain a valid timestamp." }, 400);

  try {
    let stored = 0;
    for (const [day, incoming] of groups) {
      const key = dayObjectKey(userId, bucket.id, day);
      const current = await readJson(env.STORAGE, key, []);
      const merged = await mergeEvents(Array.isArray(current) ? current : [], incoming);
      await env.STORAGE.put(key, JSON.stringify(merged), {
        httpMetadata: { contentType: "application/json;charset=UTF-8" },
        customMetadata: { product: "aertex-watch", ownerId: userId, bucketId: bucket.id, day }
      });
      stored += incoming.length;
    }

    const indexKey = bucketIndexKey(userId);
    const index = await readJson(env.STORAGE, indexKey, {});
    index[bucket.id] = {
      ...bucket,
      id: bucket.id,
      last_sync: now,
      last_event: events.reduce((best, event) => event.timestamp > best ? event.timestamp : best, "")
    };
    await env.STORAGE.put(indexKey, JSON.stringify(index), {
      httpMetadata: { contentType: "application/json;charset=UTF-8" },
      customMetadata: { product: "aertex-watch", ownerId: userId, kind: "bucket-index" }
    });

    auth.record.last_used_at = now;
    await env.STORAGE.put(auth.key, JSON.stringify(auth.record), {
      httpMetadata: { contentType: "application/json;charset=UTF-8" },
      customMetadata: { product: "aertex-watch", kind: "device-token" }
    });

    return json({ ok: true, bucket: bucket.id, accepted: stored, synced_at: now });
  } catch {
    return json({ error: "Unable to store ActivityWatch events." }, 503);
  }
}

async function handleStatus(env, userId) {
  if (!env || !env.STORAGE || !userId) return json({ error: "Watch storage is unavailable." }, 503);
  try {
    const buckets = await readJson(env.STORAGE, bucketIndexKey(userId), {});
    const values = Object.values(buckets || {});
    values.sort((a, b) => String(b.last_sync || "").localeCompare(String(a.last_sync || "")));
    const last = values[0] || null;
    return json({ buckets, last_sync: last && last.last_sync || null, last_host: last && last.hostname || null });
  } catch {
    return json({ error: "Unable to read Watch status." }, 503);
  }
}

async function handleBucketList(env, userId) {
  if (!env || !env.STORAGE || !userId) return json({ error: "Watch storage is unavailable." }, 503);
  try { return json(await readJson(env.STORAGE, bucketIndexKey(userId), {})); }
  catch { return json({ error: "Unable to read buckets." }, 503); }
}

async function handleEventQuery(request, env, userId, bucketId) {
  if (!env || !env.STORAGE || !userId) return json({ error: "Watch storage is unavailable." }, 503);
  if (request.method !== "GET" && request.method !== "HEAD") return json({ error: "Method not allowed." }, 405);
  if (!validBucketId(bucketId)) return json({ error: "Invalid bucket id." }, 400);

  const url = new URL(request.url);
  const end = parseDate(url.searchParams.get("end")) || new Date();
  const start = parseDate(url.searchParams.get("start")) || new Date(end.getTime() - 86400000);
  if (start > end) return json({ error: "start must be before end." }, 400);

  const requestedDays = enumerateDays(start, end, MAX_QUERY_DAYS + 1);
  if (requestedDays.length > MAX_QUERY_DAYS) return json({ error: "Queries are limited to " + MAX_QUERY_DAYS + " days." }, 400);

  // Events are stored by their start date. Read the maximum allowed event duration
  // before the requested start so events that cross midnight/range boundaries are not lost.
  const storageStart = new Date(start.getTime() - MAX_EVENT_DURATION_SECONDS * 1000);
  const days = enumerateDays(storageStart, end, MAX_QUERY_DAYS + 8);

  let events = [];
  try {
    for (const day of days) {
      const values = await readJson(env.STORAGE, dayObjectKey(userId, bucketId, day), []);
      if (Array.isArray(values)) events.push(...values);
    }
    events = await mergeEvents([], events);
  } catch {
    return json({ error: "Unable to read events." }, 503);
  }

  const startMs = start.getTime();
  const endMs = end.getTime();
  events = events.filter(event => {
    const eventStart = Date.parse(event.timestamp);
    if (!Number.isFinite(eventStart)) return false;
    const durationMs = Math.max(0, Number(event.duration || 0)) * 1000;
    if (durationMs === 0) return eventStart >= startMs && eventStart < endMs;
    const eventEnd = eventStart + durationMs;
    return eventStart < endMs && eventEnd > startMs;
  }).sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));

  const rawLimit = Number(url.searchParams.get("limit"));
  if (Number.isFinite(rawLimit) && rawLimit >= 0) events = events.slice(0, Math.min(rawLimit, 50000));
  return request.method === "HEAD" ? new Response(null, { status: 200, headers: jsonHeaders() }) : json(events);
}

async function verifyDeviceToken(request, env) {
  const header = request.headers.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token.startsWith(TOKEN_PREFIX + ".") || token.length < 24 || token.length > 200) return { ok: false };
  const hash = await sha256Hex(token);
  const key = WATCH_PREFIX + "/tokens/" + hash + ".json";
  try {
    const record = await readJson(env.STORAGE, key, null);
    if (!record || !record.user_id) return { ok: false };
    return { ok: true, key, record };
  } catch {
    return { ok: false };
  }
}

function normalizeBucket(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const id = cleanText(value.id, 220);
  if (!validBucketId(id)) return null;
  return {
    id,
    type: cleanText(value.type, 160),
    client: cleanText(value.client, 160),
    hostname: cleanText(value.hostname, 160),
    name: cleanText(value.name, 160)
  };
}

function normalizeEvent(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const date = parseDate(value.timestamp);
  if (!date) return null;
  const duration = Number(value.duration || 0);
  if (!Number.isFinite(duration) || duration < 0 || duration > MAX_EVENT_DURATION_SECONDS) return null;
  const rawId = Number(value.id);
  const id = Number.isSafeInteger(rawId) && rawId >= 0 ? rawId : null;
  const data = value.data && typeof value.data === "object" && !Array.isArray(value.data) ? sanitizeData(value.data) : {};
  return id === null
    ? { timestamp: date.toISOString(), duration, data }
    : { id, timestamp: date.toISOString(), duration, data };
}

function sanitizeData(value) {
  const result = {};
  let count = 0;
  for (const [key, raw] of Object.entries(value || {})) {
    if (++count > 100) break;
    const safeKey = cleanText(key, 120);
    if (!safeKey) continue;
    if (typeof raw === "string") result[safeKey] = raw.slice(0, 8000);
    else if (typeof raw === "number" && Number.isFinite(raw)) result[safeKey] = raw;
    else if (typeof raw === "boolean" || raw === null) result[safeKey] = raw;
  }
  return result;
}

async function mergeEvents(existing, incoming) {
  const map = new Map();
  for (const event of [...existing, ...incoming]) {
    const normalized = normalizeEvent(event);
    if (!normalized) continue;
    // ActivityWatch updates the duration of a heartbeat event without changing its
    // timestamp/data. Duration must therefore not be part of the deduplication key.
    const identity = await sha256Hex(JSON.stringify([normalized.timestamp, normalized.data]));
    const previous = map.get(identity);
    if (!previous || normalized.duration >= previous.duration) map.set(identity, normalized);
  }
  return [...map.values()].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
}

function bucketIndexKey(userId) {
  return WATCH_PREFIX + "/users/" + encodeKey(userId) + "/buckets/index.json";
}

function dayObjectKey(userId, bucketId, day) {
  return WATCH_PREFIX + "/users/" + encodeKey(userId) + "/buckets/" + encodeKey(bucketId) + "/days/" + day + ".json";
}

function encodeKey(value) {
  return encodeURIComponent(String(value || "")).replace(/%/g, "_");
}

function validBucketId(value) {
  return typeof value === "string" && value.length >= 1 && value.length <= 220 && !/[\u0000-\u001f]/.test(value);
}

function dayKey(value) {
  const date = parseDate(value);
  return date ? date.toISOString().slice(0, 10) : "";
}

function enumerateDays(start, end, maxDays = MAX_QUERY_DAYS + 1) {
  const result = [];
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  while (cursor <= last && result.length < maxDays) {
    result.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return result;
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function readJson(storage, key, fallback) {
  const object = await storage.get(key);
  if (!object) return fallback;
  try { return JSON.parse(await object.text()); }
  catch { return fallback; }
}

function sameOrigin(request) {
  const origin = request.headers.get("Origin") || "";
  return origin === new URL(request.url).origin;
}

function isWatchDataHost(hostname) {
  const host = String(hostname || "").toLowerCase();
  return host.startsWith("awd.") || host.startsWith("aw.data.");
}

function randomToken(bytes) {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);
  let binary = "";
  for (const byte of data) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(String(value));
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return [...digest].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function cleanText(value, max) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f]/g, "").trim().slice(0, max) : "";
}

async function serveAsset(request, env, assetPath, extraHeaders = {}) {
  if (!env || !env.ASSETS || !env.ASSETS.fetch) return text("Watch assets are unavailable.", 503);
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

function jsonHeaders() {
  return {
    "content-type": "application/json;charset=UTF-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  };
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: jsonHeaders() });
}

function text(value, status = 200, contentType = "text/plain;charset=UTF-8") {
  return new Response(value, {
    status,
    headers: { "content-type": contentType, "cache-control": "no-store", "x-content-type-options": "nosniff" }
  });
}
