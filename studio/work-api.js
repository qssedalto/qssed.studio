import { json } from "./routing.js";

// The macOS objects are intentionally not published by the build workflow.
// A HEAD/GET request returns 503 until a verified, signed release is uploaded.
const BRIDGE_RELEASES = Object.freeze({
  "bridge/windows": {
    key: "_system/releases/local-bridge/windows-amd64/QssedA-Local-Bridge.exe",
    filename: "AERTEX-Bridge-Setup.exe",
    mime: "application/vnd.microsoft.portable-executable",
    packageType: "windows-installer",
    runtime: "native-windows",
    missing: "Windows Bridge build is not published yet."
  },
  "bridge/macos": {
    key: "_system/releases/local-bridge/macos-universal/AERTEX-Bridge-macOS-universal.pkg",
    filename: "AERTEX-Bridge-macOS-universal.pkg",
    mime: "application/octet-stream",
    packageType: "macos-pkg",
    runtime: "native-macos",
    missing: "macOS Bridge PKG has not been verified and published yet."
  },
  "bridge/macos/dmg": {
    key: "_system/releases/local-bridge/macos-universal/AERTEX-Bridge-macOS-universal.dmg",
    filename: "AERTEX-Bridge-macOS-universal.dmg",
    mime: "application/x-apple-diskimage",
    packageType: "macos-dmg",
    runtime: "native-macos",
    missing: "macOS Bridge DMG has not been verified and published yet."
  }
});

export async function handleWorkApi(request, env, action) {
  const release = Object.hasOwn(BRIDGE_RELEASES, action) ? BRIDGE_RELEASES[action] : null;
  if (!release) return json({ error: "Unknown Work API route." }, 404);
  if (request.method !== "GET" && request.method !== "HEAD") {
    return json({ error: "Method not allowed." }, 405);
  }
  if (!env?.STORAGE?.get) {
    return json({ error: "Bridge distribution storage is unavailable." }, 503);
  }
  const object = await env.STORAGE.get(release.key);
  if (!object) return json({ error: release.missing }, 503);

  const headers = new Headers();
  headers.set("content-type", release.mime);
  headers.set("content-disposition", `attachment; filename="${release.filename}"`);
  headers.set("x-qsseda-bridge-package", release.packageType);
  headers.set("x-qsseda-bridge-runtime", release.runtime);
  headers.set("cache-control", "public, max-age=300");
  headers.set("x-content-type-options", "nosniff");
  if (Number.isFinite(object.size)) headers.set("content-length", String(object.size));
  if (object.httpEtag) headers.set("etag", object.httpEtag);
  return new Response(request.method === "HEAD" ? null : object.body, { status: 200, headers });
}
