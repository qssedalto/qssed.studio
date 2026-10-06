/**
 * 【初学者导读】
 * 文件：studio/registration-check-api.js
 * 服务端 API 模块：校验请求后执行对应业务读写并返回结构化响应。
 * 阅读顺序：先确定谁调用本模块，再查看入口 handler；随后依次检查权限、输入归一化、数据操作和错误返回。
 * 数据一致性：涉及多人协作、版本或存储时，要特别注意重复请求、并发更新和“旧客户端仍在使用旧字段”的情况。
 * 修改注意：公开 API 和路由应尽量向后兼容，改变规则时同时更新自动检查。
 * 调试方法：记录请求标识、用户/资源 ID 和关键分支结果，但不要把令牌、Cookie、私密内容写入日志。
 */
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

  let response;
  try {
    response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/check_registration_username`, {
      method: "POST",
      headers: {
        ...serviceHeaders(secret),
        "content-type": "application/json;charset=UTF-8"
      },
      body: JSON.stringify({ p_username: username })
    });
  } catch (error) {
    workerLog("warn", "registration.username_check.upstream_error", { error_type: error?.name || "Error" });
    return json({ error: "Username check is temporarily unavailable." }, 503);
  }
  if (!response.ok) {
    workerLog("warn", "registration.username_check.failed", { upstream_status: response.status });
    return json({ error: "Username check is temporarily unavailable." }, 502);
  }

  let payload;
  try { payload = await response.json(); } catch { payload = null; }
  if (!payload || typeof payload !== "object") return json({ error: "Username check returned an invalid response." }, 502);
  return json({ available: Boolean(payload.available), reason: payload.reason || "" });
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
