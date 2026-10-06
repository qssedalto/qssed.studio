/**
 * 【初学者导读】
 * 文件：studio/legacy-cookie-api.js
 * 兼容层模块：保留旧 API/旧浏览器安全或 Cookie 行为，用来避免历史客户端/页面突然失效。
 * 阅读顺序：先看对外导出和路由入口，再看参数归一化、权限/语言处理，最后追踪存储或模板渲染。
 * 初学者重点：区分“数据来源”“业务规则”“展示格式”三层，不要把一个显示问题直接当成数据库问题。
 * 修改注意：此文件涉及兼容/身份/浏览器边界，改动前先确认旧调用者和安全假设。
 * 调试方法：先确认实际命中的路由和 locale，再检查 handler 输入，最后验证最终 Response。
 */
import { handleStorageFiles, handleStorageUpload, handleStorageObject } from "./storage-api.js";
import { handleBillingState } from "./billing-api.js";
import { handleStudentVerification } from "./student-verification-api.js";
import { handleSummaries } from "./summary-api.js";
import { handleNotes } from "./notes-api.js";
import { handleUserLinks } from "./user-links-api.js";
import { handleAiApi } from "./ai-gateway.js";
import { json } from "./routing.js";
import { verifyStudioApiSession, withStudioSessionCookies } from "./session-gate.js";

const ROUTES = new Map([
  ["/api/billing/state", { methods: new Set(["GET"]), handler: handleBillingState }],
  ["/api/student-verification", { methods: new Set(["GET", "POST", "DELETE"]), handler: handleStudentVerification }],
  ["/api/storage/files", { methods: new Set(["GET"]), handler: handleStorageFiles }],
  ["/api/storage/upload", { methods: new Set(["POST"]), handler: handleStorageUpload }],
  ["/api/storage/object", { methods: new Set(["GET", "DELETE"]), handler: handleStorageObject }],
  ["/api/summaries", { methods: new Set(["GET", "PUT", "DELETE"]), handler: handleSummaries }],
  ["/api/notes", { methods: new Set(["GET", "POST", "PUT", "DELETE"]), handler: handleNotes }],
  ["/api/user-links", { methods: new Set(["GET", "POST", "PUT", "DELETE"]), handler: handleUserLinks }],
  ["/api/ai/config", { methods: new Set(["GET"]), handler: (request, env, session) => handleAiApi(request, env, session) }]
]);

export function isLegacyCookieApiPath(pathname) {
  return ROUTES.has(String(pathname || ""));
}

export async function handleLegacyCookieApi(request, env, pathname) {
  const route = ROUTES.get(String(pathname || ""));
  if (!route) return json({ error: "Unknown API route." }, 404);
  if (!route.methods.has(request.method)) return json({ error: "Method not allowed" }, 405);

  const session = await verifyStudioApiSession(request);
  if (!session.ok) {
    return withStudioSessionCookies(json({ error: "Authentication required." }, 401), session.cookies);
  }

  if (isWriteMethod(request.method) && !sameOrigin(request)) {
    return withStudioSessionCookies(json({ error: "Invalid origin." }, 403), session.cookies);
  }

  const headers = new Headers(request.headers);
  headers.set("Authorization", `Bearer ${session.accessToken}`);
  const internalRequest = new Request(request, { headers });
  const response = await route.handler(internalRequest, env, session);
  return withStudioSessionCookies(response, session.cookies);
}

function isWriteMethod(method) {
  return method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";
}

function sameOrigin(request) {
  const url = new URL(request.url);
  return (request.headers.get("Origin") || "") === url.origin;
}
