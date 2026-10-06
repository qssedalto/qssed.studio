/**
 * 【初学者导读】
 * 文件：studio/knowledge-api.js
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
