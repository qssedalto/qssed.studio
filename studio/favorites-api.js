/**
 * 【初学者导读】
 * 文件：studio/favorites-api.js
 * 服务端 API 模块：解析请求、校验身份与输入、读写业务数据并返回响应。
 * 阅读顺序：先找 export/主入口，再沿事件、路由或 API 调用向下；看到共享 helper 时先确认它是否被多个产品复用。
 * 数据流：输入通常来自 Request、会话或前端状态；重点跟踪校验、状态转换、存储读写以及最终 Response/DOM 输出。
 * 修改注意：保持公开 API、DOM 标识和共享数据结构稳定；产品规则变化时同步更新自动检查。
 * 调试方法：先锁定调用链，再打印/检查最小必要状态，不要从最终页面表现反推所有中间步骤。
 */
import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { json } from "./routing.js";
import { verifyStudioApiSession, withStudioSessionCookies } from "./session-gate.js";
import { workerLog } from "./server-runtime.js";

export async function handleCuratedFavorites(request) {
  if (!["GET", "POST", "PUT"].includes(request.method)) return json({ error: "Method not allowed" }, 405);

  const session = await verifyStudioApiSession(request);
  if (!session.ok) {
    return withStudioSessionCookies(json({ error: "Authentication required." }, 401), session.cookies);
  }

  if (request.method !== "GET" && !isSameOrigin(request)) {
    return withStudioSessionCookies(json({ error: "Invalid origin." }, 403), session.cookies);
  }

  if (request.method === "GET") return listFavorites(session);
  if (request.method === "PUT") return mergeFavorites(request, session);
  return toggleFavorite(request, session);
}

async function listFavorites(session) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/curated_link_favorites`);
  url.searchParams.set("select", "url");
  url.searchParams.set("user_id", `eq.${session.user.id}`);
  url.searchParams.set("order", "created_at.desc");

  let response;
  try {
    response = await fetch(url.toString(), { headers: userHeaders(session.accessToken) });
  } catch (error) {
    return unavailable(session, "favorites.list.upstream_error", error);
  }
  if (!response.ok) return upstreamFailure(session, "favorites.list.failed", response.status);

  let rows;
  try { rows = await response.json(); } catch { rows = []; }
  const urls = Array.isArray(rows) ? rows.map(row => cleanHttpsUrl(row?.url)).filter(Boolean) : [];
  return withStudioSessionCookies(json({ user_id: session.user.id, urls }), session.cookies);
}

async function mergeFavorites(request, session) {
  let body;
  try { body = await request.json(); } catch { return badRequest(session, "Invalid request body."); }
  const incoming = Array.isArray(body?.urls) ? body.urls : [];
  const urls = [...new Set(incoming.map(cleanHttpsUrl).filter(Boolean))].slice(0, 200);
  if (!urls.length) return withStudioSessionCookies(json({ ok: true, merged: 0 }), session.cookies);

  const rows = urls.map(url => ({ user_id: session.user.id, url }));
  let response;
  try {
    response = await fetch(`${SUPABASE_URL}/rest/v1/curated_link_favorites`, {
      method: "POST",
      headers: {
        ...userHeaders(session.accessToken),
        "content-type": "application/json;charset=UTF-8",
        Prefer: "resolution=ignore-duplicates,return=minimal"
      },
      body: JSON.stringify(rows)
    });
  } catch (error) {
    return unavailable(session, "favorites.merge.upstream_error", error);
  }
  if (!response.ok) return upstreamFailure(session, "favorites.merge.failed", response.status);
  return withStudioSessionCookies(json({ ok: true, merged: urls.length }), session.cookies);
}

async function toggleFavorite(request, session) {
  let body;
  try { body = await request.json(); } catch { return badRequest(session, "Invalid request body."); }
  const url = cleanHttpsUrl(body?.url);
  if (!url || typeof body?.favorite !== "boolean") return badRequest(session, "Invalid favorite request.");

  let response;
  try {
    if (body.favorite) {
      response = await fetch(`${SUPABASE_URL}/rest/v1/curated_link_favorites`, {
        method: "POST",
        headers: {
          ...userHeaders(session.accessToken),
          "content-type": "application/json;charset=UTF-8",
          Prefer: "resolution=ignore-duplicates,return=minimal"
        },
        body: JSON.stringify({ user_id: session.user.id, url })
      });
    } else {
      const endpoint = new URL(`${SUPABASE_URL}/rest/v1/curated_link_favorites`);
      endpoint.searchParams.set("user_id", `eq.${session.user.id}`);
      endpoint.searchParams.set("url", `eq.${url}`);
      response = await fetch(endpoint.toString(), {
        method: "DELETE",
        headers: { ...userHeaders(session.accessToken), Prefer: "return=minimal" }
      });
    }
  } catch (error) {
    return unavailable(session, "favorites.toggle.upstream_error", error);
  }

  if (!response.ok) return upstreamFailure(session, "favorites.toggle.failed", response.status);
  return withStudioSessionCookies(json({ ok: true, url, favorite: body.favorite }), session.cookies);
}

function userHeaders(accessToken) {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json"
  };
}

function cleanHttpsUrl(value) {
  const text = String(value || "").trim();
  if (!text || text.length > 1024) return "";
  try {
    const url = new URL(text);
    if (url.protocol !== "https:") return "";
    url.username = "";
    url.password = "";
    return url.toString();
  } catch {
    return "";
  }
}

function isSameOrigin(request) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin") || "";
  return origin === url.origin;
}

function badRequest(session, message) {
  return withStudioSessionCookies(json({ error: message }, 400), session.cookies);
}

function unavailable(session, event, error) {
  workerLog("warn", event, { user_id: session.user.id, error_type: error?.name || "Error" });
  return withStudioSessionCookies(json({ error: "Favorites service is temporarily unavailable." }, 503), session.cookies);
}

function upstreamFailure(session, event, status) {
  workerLog("warn", event, { user_id: session.user.id, upstream_status: status });
  const safeStatus = status === 400 ? 400 : status === 401 ? 401 : status === 403 ? 403 : 502;
  return withStudioSessionCookies(json({ error: "Favorites request failed." }, safeStatus), session.cookies);
}
