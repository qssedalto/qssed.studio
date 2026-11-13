import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { json } from "./routing.js";
import { verifyStudioApiSession, withStudioSessionCookies, studioSessionFailure } from "./session-gate.js";
import { workerLog } from "./server-runtime.js";

const PROFILE_COVERS = new Set(["aurora", "sky", "sunset", "grape", "graphite", "mint"]);
const PROFILE_STATUSES = new Set(["online", "focus", "busy", "away", "offline"]);
const LINK_CATEGORIES = new Set(["social", "developer", "site", "contact", "other"]);
const IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"]
]);

export async function handleProfileApi(request, action) {
  const methods = {
    home: new Set(["GET"]),
    personalization: new Set(["PUT"]),
    link: new Set(["POST", "PUT", "DELETE"]),
    media: new Set(["POST"])
  };
  if (!methods[action]) return json({ error: "Unknown profile action." }, 404);
  if (!methods[action].has(request.method)) return json({ error: "Method not allowed" }, 405);

  const session = await verifyStudioApiSession(request);
  if (!session.ok) return studioSessionFailure(session);
  if (request.method !== "GET" && !sameOrigin(request)) {
    return withStudioSessionCookies(json({ error: "Invalid origin." }, 403), session.cookies);
  }

  let response;
  if (action === "home") response = await getProfileHome(session);
  else if (action === "personalization") response = await savePersonalization(request, session);
  else if (action === "link") response = await mutateLink(request, session);
  else response = await uploadProfileMedia(request, session);
  return withStudioSessionCookies(response, session.cookies);
}

async function getProfileHome(session) {
  const personalizationUrl = new URL(`${SUPABASE_URL}/rest/v1/profile_personalization`);
  personalizationUrl.searchParams.set("select", "user_id,signature,bio,location,status_kind,status_text,status_emoji,interests,cover_style,background_url");
  personalizationUrl.searchParams.set("user_id", `eq.${session.user.id}`);
  personalizationUrl.searchParams.set("limit", "1");

  const linksUrl = new URL(`${SUPABASE_URL}/rest/v1/profile_links`);
  linksUrl.searchParams.set("select", "id,title,url,category,note,pinned,sort_order,created_at");
  linksUrl.searchParams.set("user_id", `eq.${session.user.id}`);
  linksUrl.searchParams.set("order", "pinned.desc,sort_order.asc,created_at.asc");

  const [personalizationResult, linksResult] = await Promise.all([
    fetchJson(personalizationUrl.toString(), { headers: userHeaders(session.accessToken) }),
    fetchJson(linksUrl.toString(), { headers: userHeaders(session.accessToken) })
  ]);
  if (!personalizationResult.ok || !linksResult.ok) {
    workerLog("warn", "profile.home.failed", {
      user_id: session.user.id,
      personalization_status: personalizationResult.status,
      links_status: linksResult.status
    });
    return json({ error: "Profile service is temporarily unavailable." }, normalizeStatus(personalizationResult.ok ? linksResult.status : personalizationResult.status));
  }

  return json({
    personalization: Array.isArray(personalizationResult.data) && personalizationResult.data.length ? personalizationResult.data[0] : null,
    links: Array.isArray(linksResult.data) ? linksResult.data : []
  });
}

async function savePersonalization(request, session) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request body." }, 400); }
  const payload = cleanPersonalization(body, session.user.id);
  if (!payload.ok) return json({ error: payload.error }, 400);

  const url = new URL(`${SUPABASE_URL}/rest/v1/profile_personalization`);
  url.searchParams.set("on_conflict", "user_id");
  const result = await fetchJson(url.toString(), {
    method: "POST",
    headers: {
      ...userHeaders(session.accessToken),
      "content-type": "application/json;charset=UTF-8",
      Prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify(payload.value)
  });
  if (!result.ok) return profileFailure(session, "profile.personalization.write_failed", result.status);
  const row = Array.isArray(result.data) && result.data.length ? result.data[0] : null;
  return json({ personalization: row });
}

async function mutateLink(request, session) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request body." }, 400); }

  if (request.method === "DELETE") {
    const id = cleanUuid(body?.id);
    if (!id) return json({ error: "Invalid link identifier." }, 400);
    const url = new URL(`${SUPABASE_URL}/rest/v1/profile_links`);
    url.searchParams.set("id", `eq.${id}`);
    url.searchParams.set("user_id", `eq.${session.user.id}`);
    const result = await fetchJson(url.toString(), {
      method: "DELETE",
      headers: { ...userHeaders(session.accessToken), Prefer: "return=minimal" }
    }, false);
    if (!result.ok) return profileFailure(session, "profile.link.delete_failed", result.status);
    return json({ ok: true });
  }

  const clean = cleanLink(body, session.user.id);
  if (!clean.ok) return json({ error: clean.error }, 400);
  let url = new URL(`${SUPABASE_URL}/rest/v1/profile_links`);
  let method = "POST";
  if (request.method === "PUT") {
    const id = cleanUuid(body?.id);
    if (!id) return json({ error: "Invalid link identifier." }, 400);
    url.searchParams.set("id", `eq.${id}`);
    url.searchParams.set("user_id", `eq.${session.user.id}`);
    method = "PATCH";
  }

  const result = await fetchJson(url.toString(), {
    method,
    headers: {
      ...userHeaders(session.accessToken),
      "content-type": "application/json;charset=UTF-8",
      Prefer: "return=representation"
    },
    body: JSON.stringify(clean.value)
  });
  if (!result.ok) return profileFailure(session, "profile.link.write_failed", result.status);
  const row = Array.isArray(result.data) && result.data.length ? result.data[0] : null;
  if (!row) return json({ error: "Profile link was not saved." }, 502);
  return json({ link: row });
}

async function uploadProfileMedia(request, session) {
  let form;
  try { form = await request.formData(); } catch { return json({ error: "Invalid media request." }, 400); }
  const kind = String(form.get("kind") || "");
  const value = form.get("file");
  const file = value && typeof value !== "string" && typeof value.arrayBuffer === "function" ? value : null;
  if (!file || !new Set(["avatar", "background"]).has(kind)) return json({ error: "Invalid media request." }, 400);

  const extension = IMAGE_TYPES.get(String(file.type || ""));
  const maximum = kind === "avatar" ? 5 * 1024 * 1024 : 8 * 1024 * 1024;
  if (!extension || !Number.isFinite(file.size) || file.size <= 0 || file.size > maximum) {
    return json({ error: "Unsupported image type or size." }, 400);
  }

  const bucket = kind === "avatar" ? "avatars" : "profile-media";
  const objectPath = `${session.user.id}/${kind}.${extension}`;
  const storageUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${encodePath(objectPath)}`;
  let uploadResponse;
  try {
    uploadResponse = await fetch(storageUrl, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${session.accessToken}`,
        "content-type": file.type,
        "x-upsert": "true",
        "cache-control": "3600"
      },
      body: file
    });
  } catch (error) {
    workerLog("warn", "profile.media.upload_error", { user_id: session.user.id, kind, error_type: error?.name || "Error" });
    return json({ error: "Image upload is temporarily unavailable." }, 503);
  }
  if (!uploadResponse.ok) {
    workerLog("warn", "profile.media.upload_failed", { user_id: session.user.id, kind, upstream_status: uploadResponse.status });
    return json({ error: "Image upload failed." }, normalizeStatus(uploadResponse.status));
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${encodePath(objectPath)}?v=${Date.now()}`;
  if (kind === "avatar") {
    const profileUrl = new URL(`${SUPABASE_URL}/rest/v1/profiles`);
    profileUrl.searchParams.set("id", `eq.${session.user.id}`);
    const update = await fetchJson(profileUrl.toString(), {
      method: "PATCH",
      headers: {
        ...userHeaders(session.accessToken),
        "content-type": "application/json;charset=UTF-8",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
    }, false);
    if (!update.ok) return profileFailure(session, "profile.avatar.update_failed", update.status);
  }

  return json({ url: publicUrl });
}

function cleanPersonalization(body, userId) {
  const statusKind = String(body?.status_kind || "online");
  const coverStyle = String(body?.cover_style || "aurora");
  if (!PROFILE_STATUSES.has(statusKind) || !PROFILE_COVERS.has(coverStyle)) return { ok: false, error: "Invalid profile settings." };
  const interests = Array.isArray(body?.interests)
    ? [...new Set(body.interests.map(value => cleanText(value, 40)).filter(Boolean))].slice(0, 12)
    : [];
  const backgroundUrl = String(body?.background_url || "").trim();
  if (backgroundUrl && !isOwnedBackgroundUrl(backgroundUrl, userId)) return { ok: false, error: "Invalid profile background." };
  return {
    ok: true,
    value: {
      user_id: userId,
      signature: cleanText(body?.signature, 80),
      bio: cleanText(body?.bio, 500),
      location: cleanText(body?.location, 80),
      status_kind: statusKind,
      status_text: cleanText(body?.status_text, 80),
      status_emoji: cleanText(body?.status_emoji, 8) || "✨",
      interests,
      cover_style: coverStyle,
      background_url: backgroundUrl
    }
  };
}

function cleanLink(body, userId) {
  const title = cleanText(body?.title, 50);
  const url = cleanHttpUrl(body?.url, 1024);
  const category = String(body?.category || "other");
  if (!title || !url || !LINK_CATEGORIES.has(category)) return { ok: false, error: "Invalid profile link." };
  const requestedSort = Number(body?.sort_order);
  return {
    ok: true,
    value: {
      user_id: userId,
      title,
      url,
      category,
      note: cleanText(body?.note, 140),
      pinned: Boolean(body?.pinned),
      sort_order: Number.isFinite(requestedSort) ? Math.max(0, Math.min(Math.trunc(requestedSort), 1000000)) : 0
    }
  };
}

function isOwnedBackgroundUrl(value, userId) {
  try {
    const url = new URL(value);
    const origin = new URL(SUPABASE_URL).origin;
    if (url.origin !== origin) return false;
    const prefix = `/storage/v1/object/public/profile-media/${userId}/background.`;
    return url.pathname.startsWith(prefix);
  } catch {
    return false;
  }
}

function cleanHttpUrl(value, maximum) {
  const text = String(value || "").trim();
  if (!text || text.length > maximum) return "";
  try {
    const url = new URL(text);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function cleanText(value, maximum) {
  return String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, maximum);
}

function cleanUuid(value) {
  const text = String(value || "").trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text) ? text : "";
}

function userHeaders(accessToken) {
  return { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}`, Accept: "application/json" };
}

async function fetchJson(url, init = {}, parseBody = true) {
  let response;
  try { response = await fetch(url, init); } catch (error) { return { ok: false, status: 503, data: null, error }; }
  if (!parseBody) return { ok: response.ok, status: response.status, data: null };
  let data = null;
  try { data = await response.json(); } catch {}
  return { ok: response.ok, status: response.status, data };
}

function profileFailure(session, event, upstreamStatus) {
  workerLog("warn", event, { user_id: session.user.id, upstream_status: upstreamStatus });
  return json({ error: "Profile service is temporarily unavailable." }, normalizeStatus(upstreamStatus));
}

function normalizeStatus(status) {
  if (status === 400) return 400;
  if (status === 401) return 401;
  if (status === 403) return 403;
  if (status === 404) return 404;
  if (status === 409) return 409;
  if (status === 413) return 413;
  if (status === 429) return 429;
  if (status === 503) return 503;
  return 502;
}

function encodePath(path) {
  return String(path || "").split("/").map(encodeURIComponent).join("/");
}

function sameOrigin(request) {
  const url = new URL(request.url);
  return (request.headers.get("Origin") || "") === url.origin;
}
