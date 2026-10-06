/**
 * 【初学者导读】
 * 文件：studio/student-verification-api.js
 * 服务端 API 模块：校验请求后执行对应业务读写并返回结构化响应。
 * 阅读顺序：先确定谁调用本模块，再查看入口 handler；随后依次检查权限、输入归一化、数据操作和错误返回。
 * 数据一致性：涉及多人协作、版本或存储时，要特别注意重复请求、并发更新和“旧客户端仍在使用旧字段”的情况。
 * 修改注意：这里存在权限/并发/隐私边界，任何放宽校验或覆盖写入都应有明确理由和测试。
 * 调试方法：记录请求标识、用户/资源 ID 和关键分支结果，但不要把令牌、Cookie、私密内容写入日志。
 */
import { SUPABASE_KEY, SUPABASE_URL } from "./config.js";
import { json } from "./routing.js";

const ALLOWED_HOSTS = new Set(["chsi.com.cn", "www.chsi.com.cn"]);
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
