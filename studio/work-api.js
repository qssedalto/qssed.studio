/**
 * 【初学者导读】
 * 文件：studio/work-api.js
 * AERTEX Work 服务端 API：处理工作台相关请求、数据与响应。
 * 阅读顺序：先确认这个模块从哪里被导入，再看入口函数接收什么状态/Request；随后追踪 API、DOM、缓存或重定向副作用。
 * 初学者重点：Work/Watch 等独立产品虽然共享登录和品牌，但域名、路由和部署边界是分开的，不能把一个产品的假设直接复制到另一个。
 * 修改注意：保持已有 URL、查询参数、DOM 标识和登录交接兼容；如果产品边界变化，必须同步修改对应 CI 检查。
 * 调试方法：先确认 host/path 命中了哪个入口，再检查会话和内部状态，最后看具体 UI 或 API 结果。
 */
import { json } from "./routing.js";
import { verifyStudioApiSession, withStudioSessionCookies } from "./session-gate.js";

const WINDOWS_BRIDGE_KEY = "_system/releases/local-bridge/windows-amd64/QssedA-Local-Bridge.exe";

// Work API 单一入口：action 决定具体文档/工作区操作。阅读时先看 action 分支，再追到对应数据读写；新增 action 时要同时考虑身份、资源归属和冲突处理。\nexport async function handleWorkApi(request, env, action) {
  const session = await verifyStudioApiSession(request);
  if (!session.ok) {
    return withStudioSessionCookies(json({ error: "Authentication required." }, 401), session.cookies);
  }

  if (action !== "bridge/windows") {
    return withStudioSessionCookies(json({ error: "Unknown Work API route." }, 404), session.cookies);
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    return withStudioSessionCookies(json({ error: "Method not allowed." }, 405), session.cookies);
  }
  if (!env?.STORAGE?.get) {
    return withStudioSessionCookies(json({ error: "Bridge distribution storage is unavailable." }, 503), session.cookies);
  }

  const object = await env.STORAGE.get(WINDOWS_BRIDGE_KEY);
  if (!object) {
    return withStudioSessionCookies(json({ error: "Windows Bridge build is not published yet." }, 503), session.cookies);
  }

  const headers = new Headers();
  headers.set("content-type", "application/vnd.microsoft.portable-executable");
  headers.set("content-disposition", 'attachment; filename="AERTEX-Bridge.exe"');
  headers.set("cache-control", "private, no-store");
  headers.set("x-content-type-options", "nosniff");
  if (Number.isFinite(object.size)) headers.set("content-length", String(object.size));
  if (object.httpEtag) headers.set("etag", object.httpEtag);
  headers.set("x-qsseda-bridge-runtime", "native-windows");

  const response = new Response(request.method === "HEAD" ? null : object.body, { status: 200, headers });
  return withStudioSessionCookies(response, session.cookies);
}
