import { SUPABASE_URL } from "./config.js";
import { registrationUsernameRule } from "./account-api.js";
import { json } from "./routing.js";
import { getSupabaseSecret, workerLog } from "./server-runtime.js";

export async function handleRegistrationUsernameCheck(request, env) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!sameOrigin(request)) return json({ error: "Invalid origin" }, 403);

  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request body" }, 400); }
  const username = String(body?.username || "").trim().slice(0, 80);
  const rule = registrationUsernameRule(username);
  if (rule) return json({ available: false, reason: rule });

  const secret = getSupabaseSecret(env);
  if (!secret) return json({ error: "Registration service is temporarily unavailable." }, 503);

  const url = new URL(`${SUPABASE_URL}/rest/v1/profiles`);
  url.searchParams.set("select", "id");
  url.searchParams.set("username", `eq.${username}`);
  url.searchParams.set("limit", "1");

  let response;
  try {
    response = await fetch(url.toString(), { headers: serviceHeaders(secret) });
  } catch (error) {
    workerLog("warn", "registration.username_check.upstream_error", { error_type: error?.name || "Error" });
    return json({ error: "Username check is temporarily unavailable." }, 503);
  }
  if (!response.ok) {
    workerLog("warn", "registration.username_check.failed", { upstream_status: response.status });
    return json({ error: "Username check is temporarily unavailable." }, 502);
  }

  let rows;
  try { rows = await response.json(); } catch { rows = null; }
  if (!Array.isArray(rows)) return json({ error: "Username check returned an invalid response." }, 502);
  return json({ available: rows.length === 0, reason: rows.length ? "taken" : "" });
}

function serviceHeaders(secret) {
  return {
    apikey: secret,
    ...(secret.split(".").length === 3 ? { Authorization: `Bearer ${secret}` } : {}),
    Accept: "application/json"
  };
}

function sameOrigin(request) {
  const url = new URL(request.url);
  return (request.headers.get("Origin") || "") === url.origin;
}
