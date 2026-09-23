import { json } from "./routing.js";
import { verifyStudioApiSession, withStudioSessionCookies } from "./session-gate.js";

const WINDOWS_BRIDGE_KEY = "_system/releases/local-bridge/windows-amd64/QssedA-Local-Bridge.exe";

export async function handleWorkApi(request, env, action) {
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
