// 初学者导读：账户安全 API：设备、会话、登录历史等敏感信息的服务端接口。返回数据应遵循最小披露原则。
import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { parseServerUserAgent } from "./account-api.js";
import { json } from "./routing.js";
import { verifyStudioApiSession, withStudioSessionCookies } from "./session-gate.js";
import { workerLog } from "./server-runtime.js";

export async function handleAccountSecurity(request, action) {
  if (!new Set(["summary", "audit", "device"]).has(action)) return json({ error: "Unknown account action." }, 404);
  const expectedMethod = action === "device" ? "POST" : "GET";
  if (request.method !== expectedMethod) return json({ error: "Method not allowed" }, 405);

  const session = await verifyStudioApiSession(request);
  if (!session.ok) return withStudioSessionCookies(json({ error: "Authentication required." }, 401), session.cookies);
  if (action === "device" && !sameOrigin(request)) return withStudioSessionCookies(json({ error: "Invalid origin." }, 403), session.cookies);

  if (action === "summary") return accountSummary(session);
  if (action === "audit") return accountAudit(session);
  return updateDevice(request, session);
}

async function accountSummary(session) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/profiles`);
  url.searchParams.set("select", "username,display_name,avatar_url,role,status,first_name,last_name,birth_date,gender,hide_gender_on_profile,created_at");
  url.searchParams.set("id", `eq.${session.user.id}`);
  url.searchParams.set("limit", "1");

  const result = await fetchJson(url.toString(), { headers: userHeaders(session.accessToken) });
  if (!result.ok) return failure(session, "account.summary.failed", result.status);
  const profile = Array.isArray(result.data) && result.data.length ? result.data[0] : null;
  return withStudioSessionCookies(json({
    profile,
    user: {
      id: session.user.id,
      email: String(session.user.email || ""),
      created_at: session.user.created_at || null,
      last_sign_in_at: session.user.last_sign_in_at || null
    }
  }), session.cookies);
}

async function accountAudit(session) {
  const eventsUrl = new URL(`${SUPABASE_URL}/rest/v1/login_events`);
  eventsUrl.searchParams.set("select", "id,event_type,success,provider,ip_address,country,region,city,browser,os,device_type,device_id,risk_level,created_at");
  eventsUrl.searchParams.set("user_id", `eq.${session.user.id}`);
  eventsUrl.searchParams.set("order", "created_at.desc");
  eventsUrl.searchParams.set("limit", "50");

  const devicesUrl = new URL(`${SUPABASE_URL}/rest/v1/user_devices`);
  devicesUrl.searchParams.set("select", "id,device_id,device_name,browser,os,device_type,last_ip,country,region,city,first_seen_at,last_seen_at,is_current,revoked_at");
  devicesUrl.searchParams.set("user_id", `eq.${session.user.id}`);
  devicesUrl.searchParams.set("order", "last_seen_at.desc");
  devicesUrl.searchParams.set("limit", "20");

  const [eventsResult, devicesResult] = await Promise.all([
    fetchJson(eventsUrl.toString(), { headers: userHeaders(session.accessToken) }),
    fetchJson(devicesUrl.toString(), { headers: userHeaders(session.accessToken) })
  ]);

  if (!eventsResult.ok || !devicesResult.ok) {
    workerLog("warn", "account.audit.failed", {
      user_id: session.user.id,
      events_status: eventsResult.status,
      devices_status: devicesResult.status
    });
  }

  return withStudioSessionCookies(json({
    user: {
      id: session.user.id,
      email: String(session.user.email || ""),
      created_at: session.user.created_at || null,
      last_sign_in_at: session.user.last_sign_in_at || null
    },
    events: eventsResult.ok && Array.isArray(eventsResult.data) ? eventsResult.data : [],
    devices: devicesResult.ok && Array.isArray(devicesResult.data) ? devicesResult.data : [],
    events_error: !eventsResult.ok,
    devices_error: !devicesResult.ok
  }), session.cookies);
}

async function updateDevice(request, session) {
  let body;
  try { body = await request.json(); } catch { return withStudioSessionCookies(json({ error: "Invalid request body." }, 400), session.cookies); }
  const deviceId = cleanDeviceId(body?.device_id);
  if (!deviceId) return withStudioSessionCookies(json({ error: "Invalid device identifier." }, 400), session.cookies);

  const userAgent = request.headers.get("User-Agent") || "";
  const parsed = parseServerUserAgent(userAgent);
  const browser = parsed.browser || "Unknown";
  const os = parsed.os || "Unknown";
  const deviceType = parsed.device_type || "desktop";
  const now = new Date().toISOString();
  const payload = {
    user_id: session.user.id,
    device_id: deviceId,
    device_name: `${browser} on ${os}`.slice(0, 160),
    browser,
    os,
    device_type: deviceType,
    last_ip: request.headers.get("CF-Connecting-IP") || "",
    country: request.cf?.country || "",
    region: request.cf?.region || request.cf?.regionCode || "",
    city: request.cf?.city || "",
    last_seen_at: now
  };

  const existingUrl = new URL(`${SUPABASE_URL}/rest/v1/user_devices`);
  existingUrl.searchParams.set("select", "id,first_seen_at");
  existingUrl.searchParams.set("user_id", `eq.${session.user.id}`);
  existingUrl.searchParams.set("device_id", `eq.${deviceId}`);
  existingUrl.searchParams.set("limit", "1");
  const existingResult = await fetchJson(existingUrl.toString(), { headers: userHeaders(session.accessToken) });
  if (!existingResult.ok) return failure(session, "account.device.lookup_failed", existingResult.status);
  const existing = Array.isArray(existingResult.data) && existingResult.data.length ? existingResult.data[0] : null;

  let writeResult;
  if (existing?.id) {
    const updateUrl = new URL(`${SUPABASE_URL}/rest/v1/user_devices`);
    updateUrl.searchParams.set("id", `eq.${existing.id}`);
    updateUrl.searchParams.set("user_id", `eq.${session.user.id}`);
    writeResult = await fetchJson(updateUrl.toString(), {
      method: "PATCH",
      headers: { ...userHeaders(session.accessToken), "content-type": "application/json;charset=UTF-8", Prefer: "return=minimal" },
      body: JSON.stringify(payload)
    }, false);
  } else {
    writeResult = await fetchJson(`${SUPABASE_URL}/rest/v1/user_devices`, {
      method: "POST",
      headers: { ...userHeaders(session.accessToken), "content-type": "application/json;charset=UTF-8", Prefer: "return=minimal" },
      body: JSON.stringify({ ...payload, first_seen_at: now })
    }, false);
  }

  if (!writeResult.ok) return failure(session, "account.device.write_failed", writeResult.status);
  return withStudioSessionCookies(json({
    device: {
      ...payload,
      id: existing?.id || null,
      first_seen_at: existing?.first_seen_at || now,
      revoked_at: null
    }
  }), session.cookies);
}

async function fetchJson(url, init = {}, parseBody = true) {
  let response;
  try { response = await fetch(url, init); } catch (error) {
    return { ok: false, status: 503, data: null, error };
  }
  if (!parseBody) return { ok: response.ok, status: response.status, data: null };
  let data = null;
  try { data = await response.json(); } catch {}
  return { ok: response.ok, status: response.status, data };
}

function failure(session, event, upstreamStatus) {
  workerLog("warn", event, { user_id: session.user.id, upstream_status: upstreamStatus });
  const status = upstreamStatus === 401 ? 401 : upstreamStatus === 403 ? 403 : 502;
  return withStudioSessionCookies(json({ error: "Account security service is temporarily unavailable." }, status), session.cookies);
}

function userHeaders(accessToken) {
  return { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}`, Accept: "application/json" };
}

function cleanDeviceId(value) {
  const text = String(value || "").trim();
  return /^[A-Za-z0-9._:-]{8,160}$/.test(text) ? text : "";
}

function sameOrigin(request) {
  const url = new URL(request.url);
  return (request.headers.get("Origin") || "") === url.origin;
}
