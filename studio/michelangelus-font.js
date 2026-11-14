// Self-hosted, Latin ASCII WOFF2 subsets of the two fonts provided by the site owner.
// Original font copyright: © 2024 Gusto IDS. All rights reserved.
// Publication and web-embedding rights must be ensured by the site owner.
// No binary font is inserted in a download response or in user-facing messages.
import { MICHELANGELUS_ITALIC_BASE64, MICHELANGELUS_BOLDITALIC_BASE64 } from "./michelangelus-font-data.js";

export const MICHELANGELUS_ITALIC_PATH = "/_aertex/fonts/michelangelus-italic-v1.woff2";
export const MICHELANGELUS_BOLDITALIC_PATH = "/_aertex/fonts/michelangelus-bolditalic-v1.woff2";
const entries = new Map([
  [MICHELANGELUS_ITALIC_PATH, MICHELANGELUS_ITALIC_BASE64],
  [MICHELANGELUS_BOLDITALIC_PATH, MICHELANGELUS_BOLDITALIC_BASE64]
]);
const cached = new Map();

function decodeBase64(value) {
  const raw = atob(value);
  const result = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) result[i] = raw.charCodeAt(i);
  return result;
}

export function michelangelusFontAssetResponse(path, method = "GET") {
  if (!entries.has(path)) return null;
  if (method !== "GET" && method !== "HEAD") {
    return new Response("Method not allowed", { status: 405, headers: { allow: "GET, HEAD" } });
  }
  let buffer = null;
  if (method !== "HEAD") {
    if (!cached.has(path)) cached.set(path, decodeBase64(entries.get(path)));
    buffer = cached.get(path);
  }
  return new Response(buffer, {
    headers: {
      "content-type": "font/woff2",
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
      "access-control-allow-origin": "*"
    }
  });
}
