
const ROOT = "/wallpapers/proled-xdr";
const PREFIX = "public/wallpapers/proled-xdr/v4/";
const FILES = Object.freeze({
  light: { slug: "light.png", filename: "PROLED_XDR_Light_Repaired_3456x2234.png", type: "image/png", size: 7626593, sha256: "67a80506a1c23d88c35728a5cea7c07bad8c32ce9f7fddc0e36fd30e97bad8a3" },
  dark:  { slug: "dark.png",  filename: "PROLED_XDR_Dark_Original_3456x2234.png", type: "image/png", size: 10347362, sha256: "bffb416bdf505e86c726a0b9f44af7b7d43613c11b78cc64883e8890fcafc6a0" },
  zip:   { slug: "v4.zip",    filename: "PROLED_XDR_REPAIRED_V4_3456x2234.zip", type: "application/zip", size: 19513877, sha256: "e86023ab6989ef16ac598c74ebd04aa467840aa99f4ebc5a47d1778da9b374ba" }
});
const SECURITY = { "x-content-type-options": "nosniff", "referrer-policy": "no-referrer", "x-robots-tag": "noindex, nofollow" };
const FILE_BY_PATH = Object.fromEntries(Object.entries(FILES).map(([key,file]) => [ROOT + "/" + file.slug, key]));

function fail(message, status = 404) {
  return new Response(message, { status, headers: { ...SECURITY, "content-type": "text/plain;charset=UTF-8", "cache-control": "no-store" } });
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...SECURITY, "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" } });
}
function parseRange(value, size) {
  if (!value) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(value.trim());
  if (!m || (!m[1] && !m[2])) return false;
  if (!m[1]) {
    const suffix = Number(m[2]);
    if (!Number.isSafeInteger(suffix) || suffix < 1) return false;
    const length = Math.min(suffix, size);
    return { offset: size - length, length };
  }
  const start = Number(m[1]), end = m[2] ? Number(m[2]) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || end < start) return false;
  return { offset: start, length: Math.min(end, size - 1) - start + 1 };
}

// 这是只读 R2 文件分发：先核对对象元数据与预期哈希，再处理 HEAD/Range，任何下载请求都不应执行 put。
async function download(request, env, file) {
  if (request.method !== "GET" && request.method !== "HEAD") return fail("Method not allowed", 405);
  if (!env?.STORAGE?.head || !env?.STORAGE?.get) return fail("Storage unavailable", 503);
  try {
    const key = PREFIX + file.filename;
    const head = await env.STORAGE.head(key);
    if (!head) return fail("Wallpaper not yet published", 404);
    if (head.size !== file.size || (head.customMetadata?.integritySha256 && head.customMetadata.integritySha256 !== file.sha256))
      return fail("Wallpaper integrity metadata mismatch", 503);
    const preview = file.type === "image/png" && new URL(request.url).searchParams.get("preview") === "1";
    const headers = new Headers(SECURITY);
    headers.set("content-type", file.type);
    headers.set("content-disposition", (preview ? "inline" : "attachment") + '; filename="' + file.filename + '"');
    headers.set("cache-control", "public, max-age=3600");
    headers.set("accept-ranges", "bytes");
    if (head.httpEtag) headers.set("etag", head.httpEtag);
    const range = parseRange(request.headers.get("range"), head.size);
    if (range === false) {
      headers.set("content-range", "bytes */" + head.size);
      return new Response(null, { status: 416, headers });
    }
    const status = range ? 206 : 200;
    headers.set("content-length", String(range?.length ?? head.size));
    if (range) headers.set("content-range", "bytes " + range.offset + "-" + (range.offset + range.length - 1) + "/" + head.size);
    if (request.method === "HEAD") return new Response(null, { status, headers });
    const object = await env.STORAGE.get(key, range ? { range } : undefined);
    if (!object?.body) return fail("Wallpaper temporarily unavailable", 503);
    return new Response(object.body, { status, headers });
  } catch (error) {
    console.error("proled-xdr-download", String(error));
    return fail("Storage request failed", 503);
  }
}

function page() {
  const entries = [
    ["light", "Light · 修复版", "PNG · 3456 × 2234 · 7.63 MB"],
    ["dark", "Dark · 原图", "PNG · 3456 × 2234 · 10.35 MB"],
    ["zip", "完整修复包 · V4", "ZIP · 两张壁纸与修复对比图 · 19.51 MB"]
  ];
  const cards = entries.map(([key, title, desc]) => {
    const file = FILES[key];
    const preview = key === "zip" ? "" : `<div class="preview"><img alt="${title}" src="${ROOT}/${file.slug}?preview=1" loading="lazy"></div>`;
    return `<article>${preview}<div class="content"><h2>${title}</h2><p>${desc}</p><a id="a-${key}" class="button" href="${ROOT}/${file.slug}">下载${key === "zip" ? "完整包" : " PNG"}</a><small id="status-${key}">检查文件状态中...</small></div></article>`;
  }).join("");
  const fileNames = Object.fromEntries(Object.entries(FILES).map(([key, file]) => [key, file.slug]));
  const script = `const root=${JSON.stringify(ROOT)};const files=${JSON.stringify(fileNames)};async function refresh(){await Promise.all(Object.entries(files).map(async([key,name])=>{const a=document.getElementById("a-"+key),s=document.getElementById("status-"+key);try{const r=await fetch(root+"/"+name,{method:"HEAD",cache:"no-store"});if(!r.ok)throw Error("not ready");a.setAttribute("aria-disabled","false");s.textContent="文件已就绪，可以直接下载"}catch{a.setAttribute("aria-disabled","true");s.textContent="文件尚未发布到本站"}}))}refresh();`;
  return '<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>PROLED XDR · 壁纸下载</title>' +
    '<style>:root{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color-scheme:dark}*{box-sizing:border-box}body{margin:0;color:#eef4ff;background:radial-gradient(ellipse at top,#1b3456,#070b14 62%);min-height:100vh}main{max-width:1050px;margin:auto;padding:56px 22px 88px}h1{font-size:clamp(38px,6vw,66px);letter-spacing:-.05em;margin:4px 0 9px}h2{margin:0 0 10px;font-size:23px}p{color:#b5bfd2;line-height:1.7}.overline{color:#8cb6f5;letter-spacing:.2em;font-weight:700;font-size:12px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:36px}article{border:1px solid #ffffff22;border-radius:18px;background:#ffffff0b;overflow:hidden}.grid article:last-child{grid-column:1/-1}.content{padding:22px}.preview{aspect-ratio:3456/2234;background:#03070f}.preview img{width:100%;height:100%;object-fit:contain}.button{display:inline-block;color:#0b172e;background:#e1edff;font-weight:700;text-decoration:none;border:0;border-radius:12px;padding:12px 20px;cursor:pointer}.button[aria-disabled=true]{opacity:.4;pointer-events:none}small{display:block;color:#9eb2cc;margin-top:12px}@media(max-width:620px){.grid{grid-template-columns:1fr}.grid article:last-child{grid-column:auto}}</style></head><body><main>' +
    '<div class="overline">ORIGINAL RESOLUTION · 3456 × 2234</div><h1>PROLED XDR</h1><p>Apple 风格高清壁纸 · V4 修复版本。可单独下载浅色或深色 PNG，也可下载包含对比图的完整 ZIP。</p><div class="grid">' + cards + '</div></main>' +
    '<script>' + script + '</script></body></html>';
}

// This page contains only first-party, constant-derived HTML. Hash its single
// inline script and stylesheet so the browser can reject other inline code.
// Never reuse this helper on markup containing untrusted user content.
async function inlineBlockHash(markup, kind) {
  const matcher = kind === "script" ? /<script>([\s\S]*?)<\/script>/g : /<style>([\s\S]*?)<\/style>/g;
  const blocks = [...markup.matchAll(matcher)];
  if (blocks.length !== 1) throw new Error("Expected one trusted inline " + kind + " block");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(blocks[0][1]));
  return "sha256-" + btoa(String.fromCharCode(...new Uint8Array(digest)));
}

async function wallpaperCsp(markup) {
  const [scriptHash, styleHash] = await Promise.all([
    inlineBlockHash(markup, "script"),
    inlineBlockHash(markup, "style")
  ]);
  return "default-src 'none'; img-src 'self'; style-src '" + styleHash +
    "'; script-src '" + scriptHash +
    "'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
}

// 公共壁纸路径只允许下载页和已登记文件；旧的 /upload 路径不再存在，添加新路由时不要恢复浏览器上传。
export async function handleProledWallpaperRoute(request, env) {
  const pathname = new URL(request.url).pathname.replace(/\/$/, "");
  if (pathname === ROOT) {
    if (request.method !== "GET" && request.method !== "HEAD") return fail("Method not allowed", 405);
    const markup = page();
    return new Response(request.method === "HEAD" ? null : markup, { headers: {
      ...SECURITY, "content-type": "text/html;charset=UTF-8", "cache-control": "no-store",
      "content-security-policy": await wallpaperCsp(markup)
    } });
  }
  const key = FILE_BY_PATH[pathname];
  return key ? download(request, env, FILES[key]) : fail("Wallpaper route not found");
}
