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

// AERTEX Watch Cloud Worker 入口。
//
// 请求面分三类：
// 1. aw.*：浏览器 UI、会话、读 API、令牌管理；
// 2. awd.* / aw.data.*：设备上传数据面；
// 3. aw.qsseda.com/AERTEX-Watch-Sync-Setup.exe：公开安装器下载。
//
// 关键安全原则：浏览器数据读取必须走 AERTEX Session；电脑上传只认 Device Token；
// 两种身份绝不能互相替代。R2 中所有 Watch 对象都放在 watch/v1/ 命名空间。
import { huaweiHarmonyGate } from "./studio/huawei-harmony-gate.js";
import { handleStudioSessionLogout, verifyStudioPageSession, withStudioSessionCookies } from "./studio/session-gate.js";
import { handleAuthHandoff } from "./studio/auth-handoff.js";
import { verifyNativeAppSession, nativeJson, nativeApiResponse } from "./studio/native-mobile-auth.js";
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
  // 路由顺序本身就是安全边界：先设备兼容 Gate，再区分 dataHost，最后才允许静态资产/私有页面。
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

    // /api/sync 是唯一允许数据域直接写入的业务接口，它不使用浏览器 Session，而在函数内部验证 Bearer Device Token。
    if (pathname === "/api/sync") return handleDeviceSync(request, env);

    if (pathname === "/api/watch/tokens") {
      if (dataHost) return json({ error: "Use aw.* to manage device tokens." }, 404);
      return withSession(request, async gate => handleTokenCreate(request, env, gate.user && gate.user.id || ""));
    }

    // Native read API: AERTEX ID/Supabase Bearer token, not a Watch Device Token
    // or the browser's host-only cookie session.
    if (pathname === "/api/native/watch/status") {
      if (dataHost) return nativeJson({ error: "Not found." }, 404);
      if (request.method !== "GET") return nativeJson({ error: "Method not allowed." }, 405);
      const session = await verifyNativeAppSession(request);
      if (!session.ok) return session.response;
      return nativeApiResponse(await handleStatus(env, session.user.id));
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

    // 数据域不提供仪表盘、Session 页面或浏览器读 API；根路径只暴露无敏感信息的服务自描述。
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

    // 真正返回 index.html 前再次验证服务端会话；仅仅能下载 app.js/styles.css 不等于能读取任何用户活动数据。
    const gate = await verifyStudioPageSession(request);
    if (!gate.ok) return withStudioSessionCookies(watchSessionRedirect(request, pathname), gate.cookies || []);

    const response = await serveAsset(request, env, "/index.html", {
      "cache-control": "private, no-store",
      "content-language": locale
    });
    return withStudioSessionCookies(response, gate.cookies || []);
  }
};

// Windows 安装包从受控存储读取并透传，HEAD 只返回元数据，GET 才返回文件体。
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

// 浏览器侧 API 必须先经过主站会话验证；设备同步 API 则走独立 Device Token，不混用两套身份。
async function withSession(request, handler) {
  const gate = await verifyStudioPageSession(request);
  if (!gate.ok) return withStudioSessionCookies(json({ error: "Authentication required." }, 401), gate.cookies || []);
  const response = await handler(gate);
  return withStudioSessionCookies(response, gate.cookies || []);
}

// 创建设备令牌：浏览器只收到一次明文 token；云端持久化的是 SHA-256 哈希和绑定用户信息。
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

// 设备上传入口：先限制请求大小/事件数，再校验 token、规范化 Bucket/事件，最后按 UTC 日期分片写入 R2。
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

// 状态接口只读 Bucket 索引，不扫描全部日分片，因此首页可以低成本显示数据源数和最近同步时间。
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

// ActivityWatch 兼容的 Bucket 列表接口。前端先拿元数据，再按需请求具体 Bucket 的事件。
async function handleBucketList(env, userId) {
  if (!env || !env.STORAGE || !userId) return json({ error: "Watch storage is unavailable." }, 503);
  try { return json(await readJson(env.STORAGE, bucketIndexKey(userId), {})); }
  catch { return json({ error: "Unable to read buckets." }, 503); }
}

// ActivityWatch 风格事件查询：按 start/end 读取可能相关的日分片，并保留“开始在范围外、但持续时间跨入范围”的事件。
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

  // 事件按“开始时间所在 UTC 日期”分片。查询 start 之前还要额外回看最多 7 天，
  // 因为一个长事件可能开始在前一分片，却持续进入当前查询范围；否则跨午夜/跨边界事件会丢失。
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

// 设备鉴权只比较 token 哈希；服务端不需要也不会保存可还原的 token 原文。
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

// Bucket 元数据做长度/类型清洗后再落盘，避免异常 watcher 把任意大字符串写入索引。
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

// 事件规范化同时限制 duration 最大 7 天；data 只允许简单 JSON 标量，避免深层对象无限膨胀。
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

// watcher 的 data 字段是开放结构，这里保留前 100 个简单字段，并限制 key/value 长度。
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

// 合并同一 Bucket 日分片里的 heartbeat。优先用 ActivityWatch event id；没有 id 时退化为 timestamp+data 指纹。
async function mergeEvents(existing, incoming) {
  const map = new Map();
  for (const event of [...existing, ...incoming]) {
    const normalized = normalizeEvent(event);
    if (!normalized) continue;
    // ActivityWatch heartbeat 会不断延长同一事件的 duration，而 timestamp/data 不变。
    // 所以 duration 绝不能进入去重 key；重复版本中保留 duration 更长的一份。
    const identity = normalized.id !== undefined
      ? "id:" + normalized.id
      : await sha256Hex(JSON.stringify([normalized.timestamp, normalized.data]));
    const previous = map.get(identity);
    if (!previous || normalized.duration >= previous.duration) map.set(identity, normalized);
  }
  return [...map.values()].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
}

// 用户级 Bucket 索引只存元数据/最近同步时间，不放事件正文；首页状态和数据源列表因此无需扫描全部日分片。
function bucketIndexKey(userId) {
  return WATCH_PREFIX + "/users/" + encodeKey(userId) + "/buckets/index.json";
}

// R2 结构：watch/v1/users/<user>/buckets/<bucket>/days/YYYY-MM-DD.json。
// 用户和 Bucket 都编码进路径，确保不同账户/数据源完全隔离。
function dayObjectKey(userId, bucketId, day) {
  return WATCH_PREFIX + "/users/" + encodeKey(userId) + "/buckets/" + encodeKey(bucketId) + "/days/" + day + ".json";
}

// R2 key 里的用户输入统一 percent-encode，避免 Bucket ID 中的斜杠/特殊字符改变对象层级。
function encodeKey(value) {
  return encodeURIComponent(String(value || "")).replace(/%/g, "_");
}

// Bucket ID 是外部 watcher 提供的，所以即使最终会 encode，仍先限制长度与控制字符，减少异常 key/日志污染。
function validBucketId(value) {
  return typeof value === "string" && value.length >= 1 && value.length <= 220 && !/[\u0000-\u001f]/.test(value);
}

// 把任意可解析时间归一成 UTC YYYY-MM-DD，必须和 dayObjectKey 的分片规则使用同一时区。
function dayKey(value) {
  const date = parseDate(value);
  return date ? date.toISOString().slice(0, 10) : "";
}

// 把查询区间展开成 UTC 日期分片；maxDays 是第二层保险，防止用户构造超大时间范围导致 R2 fan-out。
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

// URL 日期参数统一转成毫秒；非法/空值返回 NaN，让调用方显式决定默认值或 400。
function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// R2 读取失败时返回 fallback，让“某天尚无对象”和“索引未建立”都能按空数据处理；写路径仍会显式报错。
async function readJson(storage, key, fallback) {
  const object = await storage.get(key);
  if (!object) return fallback;
  try { return JSON.parse(await object.text()); }
  catch { return fallback; }
}

// 会修改账户状态的浏览器 POST 额外要求 Origin === 当前 origin，补上 Cookie 会话天然存在的 CSRF 风险。
function sameOrigin(request) {
  const origin = request.headers.get("Origin") || "";
  return origin === new URL(request.url).origin;
}

// 只按明确前缀识别数据面；aw.* 永远是 UI 面，防止路径相同但 host 不同的 API 被混淆。
function isWatchDataHost(hostname) {
  const host = String(hostname || "").toLowerCase();
  return host.startsWith("awd.") || host.startsWith("aw.data.");
}

// 使用 Web Crypto CSPRNG 生成 URL-safe base64，不依赖 Math.random；Device Token 明文只返回给创建它的浏览器一次。
function randomToken(bytes) {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);
  let binary = "";
  for (const byte of data) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

// R2 token 索引使用 SHA-256(token) 作为 key；即使对象列表泄露，也不能直接拿到可用 Bearer token。
async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(String(value));
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return [...digest].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

// 清理名称类自由文本：去控制字符、trim、限制长度。事件 data 有独立 sanitizeData，不走这个简化函数。
function cleanText(value, max) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f]/g, "").trim().slice(0, max) : "";
}

// 静态文件仍通过 Worker 转发，统一补 nosniff/cache 等头；index.html 由调用方覆盖成 private,no-store。
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

// 路由比较前折叠尾部斜杠，但保留根路径 /。
function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

// 内部跳转统一 no-store + no-referrer，避免登录/安装器迁移 URL 被不必要地缓存或带出 Referer。
function redirect(location) {
  return new Response(null, {
    status: 302,
    headers: { location, "cache-control": "no-store", "referrer-policy": "no-referrer" }
  });
}

// Watch API 全部 no-store；活动数据和令牌状态不应该被浏览器/CDN 公共缓存。
function jsonHeaders() {
  return {
    "content-type": "application/json;charset=UTF-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  };
}

// 小型 JSON helper 只负责序列化与安全头，业务函数自己决定状态码和错误语义。
function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: jsonHeaders() });
}

// 文本/脚本/错误响应同样默认 no-store；静态 assets 的缓存策略由 serveAsset 保留或覆盖。
function text(value, status = 200, contentType = "text/plain;charset=UTF-8") {
  return new Response(value, {
    status,
    headers: { "content-type": contentType, "cache-control": "no-store", "x-content-type-options": "nosniff" }
  });
}
