/**
 * 【初学者导读】
 * 文件：studio/server-runtime.js
 * 服务端路由/运行时基础模块：帮助 Worker 统一匹配路径、构造响应或组织服务器执行环境。
 * 阅读顺序：先确定谁调用本模块，再查看入口 handler；随后依次检查权限、输入归一化、数据操作和错误返回。
 * 数据一致性：涉及多人协作、版本或存储时，要特别注意重复请求、并发更新和“旧客户端仍在使用旧字段”的情况。
 * 修改注意：公开 API 和路由应尽量向后兼容，改变规则时同时更新自动检查。
 * 调试方法：记录请求标识、用户/资源 ID 和关键分支结果，但不要把令牌、Cookie、私密内容写入日志。
 */
// 服务端密钥读取：只从 Worker env 获取，缺失时返回受控结果；任何 secret 都不能拼进页面 HTML 或客户端 JS。\nexport function getSupabaseSecret(env) {
  return env?.SUPABASE_SECRET_KEY || env?.SUPABASE_SERVICE_ROLE_KEY || "";
}

// Worker 结构化日志：记录事件名和必要上下文，便于生产排查；调用方应避免把 token、Cookie、密码或完整私密正文放进 details。\nexport function workerLog(level, event, details = {}) {
  const payload = JSON.stringify({
    source: "qsseda-worker",
    event,
    ...details
  });
  const method = level === "error" ? "error" : level === "warn" ? "warn" : "info";
  console[method](payload);
}
