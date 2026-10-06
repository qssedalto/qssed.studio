// 历史 Cookie API 的兼容入口。
//
// 这类路由存在是为了平滑旧客户端/页面迁移，不代表可以继续新增依赖；
// 所有读写都要限制为已知路径与安全 Cookie 语义，并尽量让新代码走当前 Session Gate/Account API。
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
