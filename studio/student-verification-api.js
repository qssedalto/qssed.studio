import { SUPABASE_KEY, SUPABASE_URL } from "./config.js";
import { json } from "./routing.js";

const ALLOWED_HOST = /(^|\.)chsi\.com\.cn$/i;
const ALLOWED_PATH = /^\/xlcx\//i;

export async function handleStudentVerification(request) {
  if (request.method === "GET") {
    return callRpc(request, "get_my_student_verification", {});
  }

  if (request.method === "POST") {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid request body." }, 400);
    }

    const target = normalizeOfficialTarget(body?.target_url);
    if (!target) {
      return json({ error: "Unsupported student verification QR target." }, 400);
    }

    return callRpc(request, "submit_student_verification_target", {
      p_target_url: target
    });
  }

  if (request.method === "DELETE") {
    return callRpc(request, "cancel_my_student_verification", {});
  }

  return json({ error: "Method not allowed" }, 405);
}

function normalizeOfficialTarget(value) {
  const raw = String(value || "").trim();
  if (!raw || raw.length > 1200) return "";

  let url;
  try {
    url = new URL(raw);
  } catch {
    return "";
  }

  if (url.protocol !== "https:") return "";
  if (url.username || url.password || url.port) return "";
  if (!ALLOWED_HOSTS.has(url.hostname.toLowerCase())) return "";
  if (!ALLOWED_PATH.test(url.pathname)) return "";

  url.hash = "";
  return url.toString();
}

async function callRpc(request, rpc, params) {
  const authorization = request.headers.get("Authorization") || "";
  if (!/^Bearer\s+\S+$/i.test(authorization)) {
    return json({ error: "Authentication required." }, 401);
  }

  let response;
  try {
    response = await fetch(SUPABASE_URL + "/rest/v1/rpc/" + rpc, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: authorization,
        "content-type": "application/json;charset=UTF-8",
        Accept: "application/json"
      },
      body: JSON.stringify(params || {})
    });
  } catch {
    return json({ error: "Student verification service is temporarily unavailable." }, 503);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const upstreamCode = String(payload?.code || "");
    const message = String(payload?.message || payload?.error || "Student verification request failed.")
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .trim()
      .slice(0, 240);

    const status = upstreamCode === "23505" ? 409
      : upstreamCode === "22023" ? 400
      : upstreamCode === "57014" ? 429
      : response.status === 401 ? 401
      : response.status === 403 ? 403
      : 502;
    return json({ error: message }, status);
  }

  return json(payload);
}
