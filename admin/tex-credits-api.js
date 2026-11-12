import { SUPABASE_URL, SUPABASE_KEY } from "../studio/config.js";
import { workerLog } from "../studio/server-runtime.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function answer(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {"content-type":"application/json;charset=UTF-8","cache-control":"private, no-store","x-content-type-options":"nosniff"}
  });
}
function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try { return new URL(origin).origin === new URL(request.url).origin; }
    catch { return false; }
  }
  return request.headers.get("sec-fetch-site") === "same-origin";
}

async function rpc(session, procedure, body) {
  const result = await fetch(SUPABASE_URL + "/rest/v1/rpc/" + procedure, {
    // Workers implement only "manual" and "follow". "error" throws a TypeError
    // before any Supabase request is sent, leaving quotas unavailable.
    // Never follow redirects carrying the administrator's bearer token.
    method: "POST", redirect: "manual",
    headers: {
      apikey: SUPABASE_KEY, authorization: "Bearer " + session.accessToken,
      "content-type": "application/json;charset=UTF-8", accept: "application/json"
    },
    body: JSON.stringify(body)
  });
  if (result.status >= 300 && result.status < 400) {
    return {error: true, status: 503, body: {error: "Quota service redirect was blocked."}};
  }
  const raw = await result.text();
  let data = {};
  try { data = raw ? JSON.parse(raw) : {}; } catch {}
  if (!result.ok) {
    const status = result.status === 401 || result.status === 403 ? 403 :
      result.status === 400 || result.status === 409 ? 409 : 503;
    return { error: true, status, body: {error: status === 403 ?
      "Administrator access required." : status === 409 ?
      "Quota record changed or operation is not allowed." : "Quota service is unavailable."} };
  }
  return { error: false, body: data };
}

// admin-worker.js verifies an independent administrator session before calling.
export async function handleAdminTexCredits(request, _env, session) {
  if (!session?.ok || !session.accessToken || !UUID.test(String(session.user?.id || ""))) {
    return answer({error:"Administrator required."},403);
  }
  if (!["GET","POST"].includes(request.method)) return answer({error:"Method not allowed."},405);
  if (request.method === "POST" && !sameOrigin(request)) return answer({error:"Invalid origin."},403);
  try {
    if (request.method === "GET") {
      const result = await rpc(session, "admin_tex_github_quota_list", {});
      return answer(result.body,result.error ? result.status : 200);
    }
    if (Number(request.headers.get("content-length")) > 2048) return answer({error:"Payload too large."},413);
    const raw = await request.text();
    if (raw.length > 2048) return answer({error:"Payload too large."},413);
    let input;
    try { input = JSON.parse(raw); } catch { return answer({error:"Invalid JSON."},400); }
    const userId = String(input?.user_id || "");
    const action = String(input?.action || "");
    const credits = Number(input?.credits);
    if (!UUID.test(userId) || !["approve","reject","set-total","grant"].includes(action) ||
        (action !== "reject" && (!Number.isInteger(credits) || credits < 1 || credits > 100))) {
      return answer({error:"Invalid quota operation."},400);
    }
    const result = await rpc(session, "admin_tex_github_quota_update", {
      p_user_id: userId, p_action: action, p_credits: action === "reject" ? null : credits
    });
    if (!result.error) workerLog("info","admin.tex_github.quota_changed",{
      actor_id: session.user.id,target_id:userId,action
    });
    return answer(result.body,result.error ? result.status : 200);
  } catch(error) {
    workerLog("warn","admin.tex_github.request_failed",{
      event:"rpc_unavailable",error_name:String(error?.name||"error").slice(0,50)
    });
    return answer({error:"Quota administration is currently unavailable."},503);
  }
}
