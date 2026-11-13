import { json } from "./routing.js";

const WINDOWS_BRIDGE_KEY = "_system/releases/local-bridge/windows-amd64/QssedA-Local-Bridge.exe";

export async function handleWorkApi(request, env, action) {
  if (action !== "bridge/windows") {
    return json({ error: "Unknown Work API route." }, 404);
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    return json({ error: "Method not allowed." }, 405);
  }
  if (!env?.STORAGE?.get) {
    return json({ error: "Bridge distribution storage is unavailable." }, 503);
  }

  const object = await env.STORAGE.get(WINDOWS_BRIDGE_KEY);
  if (!object) {
    return json({ error: "Windows Bridge build is not published yet." }, 503);
  }

  const headers = new Headers();
  headers.set("content-type", "application/vnd.microsoft.portable-executable");
  headers.set("content-disposition", 'attachment; filename="AERTEX-Bridge-Setup.exe"');
  headers.set("x-qsseda-bridge-package", "windows-installer");
  headers.set("cache-control", "public, max-age=300");
  headers.set("x-content-type-options", "nosniff");
  if (Number.isFinite(object.size)) headers.set("content-length", String(object.size));
  if (object.httpEtag) headers.set("etag", object.httpEtag);
  headers.set("x-qsseda-bridge-runtime", "native-windows");

  const response = new Response(request.method === "HEAD" ? null : object.body, { status: 200, headers });
  return response;
}
