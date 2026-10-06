// 初学者导读：知识库 API：读取/搜索当前可见知识内容并返回统一结构。数据访问范围仍需经过会话与资源边界。
import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { json } from "./routing.js";
import { verifyStudioApiSession, withStudioSessionCookies } from "./session-gate.js";
import { workerLog } from "./server-runtime.js";

export async function handleKnowledgeSearch(request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const session = await verifyStudioApiSession(request);
  if (!session.ok) {
    return withStudioSessionCookies(json({ error: "Authentication required." }, 401), session.cookies);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return withStudioSessionCookies(json({ error: "Invalid request body." }, 400), session.cookies);
  }

  const query = cleanSearchQuery(body?.query);
  if (!query) return withStudioSessionCookies(json({ data: [] }), session.cookies);

  const requestedLimit = Number(body?.limit);
  const limit = Number.isFinite(requestedLimit)
    ? Math.max(1, Math.min(Math.trunc(requestedLimit), 40))
    : 40;

  let upstream;
  try {
    upstream = await fetch(`${SUPABASE_URL}/rest/v1/rpc/search_knowledge_documents`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${session.accessToken}`,
        "content-type": "application/json;charset=UTF-8",
        Accept: "application/json"
      },
      body: JSON.stringify({ p_query: query, p_limit: limit })
    });
  } catch (error) {
    workerLog("warn", "knowledge.search.upstream_error", {
      user_id: session.user.id,
      error_type: error?.name || "Error"
    });
    return withStudioSessionCookies(json({ error: "Knowledge search is temporarily unavailable." }, 503), session.cookies);
  }

  if (!upstream.ok) {
    workerLog("warn", "knowledge.search.failed", {
      user_id: session.user.id,
      upstream_status: upstream.status
    });
    return withStudioSessionCookies(json({ error: "Knowledge search is temporarily unavailable." }, 502), session.cookies);
  }

  let data;
  try {
    data = await upstream.json();
  } catch {
    return withStudioSessionCookies(json({ error: "Knowledge search returned an invalid response." }, 502), session.cookies);
  }

  return withStudioSessionCookies(json({ data: Array.isArray(data) ? data : [] }), session.cookies);
}

function cleanSearchQuery(value) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
}
