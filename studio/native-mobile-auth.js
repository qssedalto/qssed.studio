import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";

/**
 * Native AERTEX iOS bearer session gate (distinct from host-only browser cookies
 * and from AERTEX Watch Device Tokens). Never accepts a user id from the caller.
 */
export async function verifyNativeAppSession(request) {
  const header = request.headers.get("Authorization") || "";
  const match = /^Bearer ([^\s]+)$/i.exec(header);
  const accessToken = match?.[1] || "";
  if (!accessToken || accessToken.length > 12000) {
    return { ok: false, response: nativeJson({ error: "Bearer token required.", code: "missing_token" }, 401) };
  }
  const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}` };
  let user;
  try {
    const identity = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers });
    if (!identity.ok) {
      return { ok: false, response: nativeJson({ error: "Session invalid.", code: "invalid_token" }, 401) };
    }
    user = await identity.json();
  } catch {
    return { ok: false, response: nativeJson({ error: "Identity service unavailable.", code: "identity_unavailable" }, 503) };
  }
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(String(user?.id || ""))) {
    return { ok: false, response: nativeJson({ error: "Invalid account.", code: "invalid_user" }, 401) };
  }
  let profile;
  try {
    const profileURL = new URL(`${SUPABASE_URL}/rest/v1/profiles`);
    profileURL.searchParams.set("select", "id,status");
    profileURL.searchParams.set("id", `eq.${user.id}`);
    profileURL.searchParams.set("limit", "1");
    const record = await fetch(profileURL, { headers });
    if (!record.ok) {
      return { ok: false, response: nativeJson({ error: "Profile unavailable.", code: "profile_unavailable" }, 503) };
    }
    const rows = await record.json();
    profile = Array.isArray(rows) && rows.length === 1 ? rows[0] : null;
  } catch {
    return { ok: false, response: nativeJson({ error: "Profile unavailable.", code: "profile_unavailable" }, 503) };
  }
  if (!profile || profile.id !== user.id || profile.status !== "active") {
    return { ok: false, response: nativeJson({ error: "Account is not active.", code: "account_inactive" }, 403) };
  }
  return { ok: true, user, accessToken, cookies: [] };
}

export function nativeJson(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff"
    }
  });
}

/** Protect existing internal service responses from ever returning session cookies. */
export function nativeApiResponse(response) {
  const headers = new Headers(response.headers);
  headers.delete("set-cookie");
  headers.set("cache-control", "private, no-store");
  headers.set("x-content-type-options", "nosniff");
  return new Response(response.body, { status: response.status, headers });
}
