import { handleProledWallpaperRoute } from "../studio/public-wallpapers.js";
import { createHash } from "node:crypto";

const ROOT = "https://qsseda.com/wallpapers/proled-xdr";
const SIZE = 7626593;
const DIGEST = "67a80506a1c23d88c35728a5cea7c07bad8c32ce9f7fddc0e36fd30e97bad8a3";
const HEAD = { size: SIZE, httpEtag: '"wallpaper-etag"', customMetadata: { integritySha256: DIGEST } };
const calls = [];
const env = {
  STORAGE: {
    head: async key => { calls.push(["head", key]); return HEAD; },
    get: async (key, options) => {
      calls.push(["get", key, options]);
      return { body: new Response(new Uint8Array(options?.range?.length || 1)).body };
    },
    put: () => { throw Error("Wallpaper uploads must never write to R2"); }
  }
};
const assert = (condition, message) => { if (!condition) throw Error(message); };
const handle = (url, opts) => handleProledWallpaperRoute(new Request(url, opts), env);

const home = await handle(ROOT);
assert(home.status === 200, "The download landing page must remain available");
const markup = await home.text();
assert(markup.includes("PROLED XDR") && markup.includes("dark.png") && markup.includes("v4.zip"), "All three download links must survive");
assert(!markup.includes("验证并上传") && !markup.includes('id="publish"') && !markup.includes('type="file"'), "No upload UI may remain");

// The download page is the pilot for hash-based CSP: its one stylesheet and
// one script must be authorized by their exact content hashes, not unsafe-inline.
const csp = home.headers.get("content-security-policy") || "";
const trustedInlineBlock = tag => {
  const matches = [...markup.matchAll(tag === "script" ? /<script>([\s\S]*?)<\/script>/g : /<style>([\s\S]*?)<\/style>/g)];
  assert(matches.length === 1, "The download page must contain exactly one inline " + tag + " block");
  return "sha256-" + createHash("sha256").update(matches[0][1], "utf8").digest("base64");
};
assert(!csp.includes("'unsafe-inline'") && !csp.includes("'unsafe-eval'"), "Wallpaper CSP must not permit arbitrary inline execution");
assert(csp.includes("script-src '" + trustedInlineBlock("script") + "'"), "Wallpaper CSP script hash must match rendered JS");
assert(csp.includes("style-src '" + trustedInlineBlock("style") + "'"), "Wallpaper CSP style hash must match rendered CSS");
assert(csp.includes("object-src 'none'") && csp.includes("frame-ancestors 'none'"), "Wallpaper CSP must protect the page from embedding and plugins");
const headPage = await handle(ROOT, { method: "HEAD" });
assert(headPage.status === 200 && (await headPage.text()) === "", "HEAD must remain bodyless");
assert(headPage.headers.get("content-security-policy") === csp, "HEAD and GET must advertise identical CSP");


const removed = await handle(ROOT + "/upload", { method: "POST", body: new Uint8Array([1]) });
assert(removed.status === 404, "Retired upload route must return 404");
assert(!calls.length, "Retired upload must not touch R2");

const head = await handle(ROOT + "/light.png", { method: "HEAD" });
assert(head.status === 200 && head.headers.get("content-length") === String(SIZE), "Download HEAD metadata must remain available");
assert(head.headers.get("accept-ranges") === "bytes", "Range support must be advertised");

const ranged = await handle(ROOT + "/light.png", { headers: { Range: "bytes=10-19" } });
assert(ranged.status === 206 && ranged.headers.get("content-range") === "bytes 10-19/" + SIZE, "Range GET must return HTTP 206");
assert((await ranged.arrayBuffer()).byteLength === 10, "Range body size must match requested bytes");

const invalidRange = await handle(ROOT + "/light.png", { headers: { Range: "bytes=99999999-" } });
assert(invalidRange.status === 416, "Out-of-range requests must return HTTP 416");
assert(calls.every(([method]) => method !== "put"), "The read-only wallpaper route must never write R2 objects");

const missing = await handleProledWallpaperRoute(new Request(ROOT + "/dark.png"), {
  STORAGE: { head: async () => null, get: async () => { throw Error("Should not read absent wallpaper"); } }
});
assert(missing.status === 404, "Unpublished file must report 404");

const tampered = await handleProledWallpaperRoute(new Request(ROOT + "/light.png"), {
  STORAGE: { head: async () => ({ ...HEAD, customMetadata: { integritySha256: "bad" } }), get: async () => null }
});
assert(tampered.status === 503, "Integrity metadata mismatch must be rejected");

console.log("Wallpaper downloads, HTTP Range and removal of upload path verified.");
