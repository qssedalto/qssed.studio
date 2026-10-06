// 初学者导读：服务端运行时工具层：封装 Worker 环境中常用的请求上下文/响应能力，让上层模块少依赖平台细节。
// 这里只放“服务端 Worker 运行时”辅助函数。任何返回给浏览器的模块都不应调用 getSupabaseSecret，
// 更不能把 service-role secret 拼进 Watch/Cash/GPT 的 HTML 或静态 JS。
export function getSupabaseSecret(env) {
  return env?.SUPABASE_SECRET_KEY || env?.SUPABASE_SERVICE_ROLE_KEY || "";
}

/// 输出结构化 JSON 日志，便于 Cloudflare 日志按 event 字段过滤。
/// details 应只放诊断元数据，不要写 access token、Device Token、窗口标题等用户敏感内容。
export function workerLog(level, event, details = {}) {
  const payload = JSON.stringify({
    source: "qsseda-worker",
    event,
    ...details
  });
  const method = level === "error" ? "error" : level === "warn" ? "warn" : "info";
  console[method](payload);
}
