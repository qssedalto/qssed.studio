import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { verifyStudioPageSession, withStudioSessionCookies } from "./session-gate.js";

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

async function adminAllowed(token) {
  if (!token) return false;
  try {
    const res = await fetch(SUPABASE_URL + "/rest/v1/rpc/verify_admin_session", {
      method: "POST", headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + token, "content-type": "application/json", Accept: "application/json" },
      body: "{}"
    });
    return res.ok && (await res.json()) === true;
  } catch { return false; }
}

async function upload(request, env) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const url = new URL(request.url);
  if (request.headers.get("origin") !== url.origin) return json({ error: "Same-origin request required" }, 403);
  const file = FILES[url.searchParams.get("file")];
  if (!file) return json({ error: "Invalid file variant" }, 400);
  if (!env?.STORAGE?.put) return json({ error: "Storage unavailable" }, 503);
  const session = await verifyStudioPageSession(request);
  if (!session.ok) return json({ error: "Sign in to AERTEX first" }, 401);
  if (!(await adminAllowed(session.accessToken))) return json({ error: "Administrator required" }, 403);
  if (Number(request.headers.get("content-length")) > file.size) return json({ error: "Unexpected upload length" }, 413);
  let data;
  try { data = await request.arrayBuffer(); } catch { return json({ error: "Invalid body" }, 400); }
  if (data.byteLength !== file.size) return json({ error: "Wrong size; expected " + file.size }, 422);
  const sha256 = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", data)), byte => byte.toString(16).padStart(2, "0")).join("");
  if (sha256 !== file.sha256) return json({ error: "SHA-256 verification failed; use the original V4 file" }, 422);
  try {
    await env.STORAGE.put(PREFIX + file.filename, data, {
      httpMetadata: { contentType: file.type },
      customMetadata: { integritySha256: sha256, source: "verified-proled-xdr-v4" }
    });
    return withStudioSessionCookies(json({ ok: true, name: file.filename, bytes: file.size }), session.cookies);
  } catch (error) {
    console.error("proled-xdr-upload", String(error));
    return json({ error: "R2 upload failed" }, 503);
  }
}

function page() {
  const entries = [
    ["light", "Light · 修复版", "PNG · 3456 × 2234 · 7.63 MB"],
    ["dark", "Dark · 原图", "PNG · 3456 × 2234 · 10.35 MB"],
    ["zip", "完整修复包 · V4", "ZIP · 两张壁纸与修复对比图 · 19.51 MB"]
  ];
  const cards = entries.map(([key,title,desc]) => {
    const image = key === "zip" ? "" : '<div class="preview"><img alt="' + title + '" src="' + ROOT + "/" + FILES[key].slug + '?preview=1" loading="lazy"></div>';
    return '<article>' + image + '<div class="content"><h2>' + title + '</h2><p>' + desc + '</p><a id="a-' + key + '" class="button" href="' + ROOT + '/' + FILES[key].slug + '">下载' + (key === "zip" ? "完整包" : " PNG") + '</a><small id="status-' + key + '">检查文件状态中...</small></div></article>';
  }).join("");
  const inputs = entries.map(([key,title]) => '<label>' + title + '<input data-kind="' + key + '" type="file" accept="' + (key === "zip" ? ".zip" : ".png") + '"></label>').join("");
  return '<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>PROLED XDR · 壁纸下载</title>' +
    '<style>:root{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color-scheme:dark}*{box-sizing:border-box}body{margin:0;color:#eef4ff;background:radial-gradient(ellipse at top,#1b3456,#070b14 62%);min-height:100vh}main{max-width:1050px;margin:auto;padding:56px 22px 88px}h1{font-size:clamp(38px,6vw,66px);letter-spacing:-.05em;margin:4px 0 9px}h2{margin:0 0 10px;font-size:23px}p{color:#b5bfd2;line-height:1.7}.overline{color:#8cb6f5;letter-spacing:.2em;font-weight:700;font-size:12px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:36px}article{border:1px solid #ffffff22;border-radius:18px;background:#ffffff0b;overflow:hidden}.grid article:last-child{grid-column:1/-1}.content{padding:22px}.preview{aspect-ratio:3456/2234;background:#03070f}.preview img{width:100%;height:100%;object-fit:contain}.button{display:inline-block;color:#0b172e;background:#e1edff;font-weight:700;text-decoration:none;border:0;border-radius:12px;padding:12px 20px;cursor:pointer}.button[aria-disabled=true]{opacity:.4;pointer-events:none}small{display:block;color:#9eb2cc;margin-top:12px}details{margin-top:40px;border-top:1px solid #ffffff30;padding-top:20px}summary{cursor:pointer}label{display:block;margin:15px 0;color:#b6c8e0}input{display:block;margin-top:5px;color:#cdddf4;max-width:100%}@media(max-width:620px){.grid{grid-template-columns:1fr}.grid article:last-child{grid-column:auto}}</style></head><body><main>' +
    '<div class="overline">ORIGINAL RESOLUTION · 3456 × 2234</div><h1>PROLED XDR</h1><p>Apple 风格高清壁纸 · V4 修复版本。可单独下载浅色或深色 PNG，也可下载包含对比图的完整 ZIP。</p><div class="grid">' + cards + '</div>' +
    '<details><summary>网站管理员：首次发布壁纸文件到 R2</summary><p>仅管理员可上传已校验的 V4 文件；服务器验证文件大小与 SHA-256 后才发布。</p>' + inputs + '<button class="button" id="publish">验证并上传</button><p id="upload-result" aria-live="polite"></p></details></main>' +
    '<script>const root=' + JSON.stringify(ROOT) + ';const files=' + JSON.stringify(Object.fromEntries(Object.entries(FILES).map(([key,v]) => [key,v.slug]))) + ';async function refresh(){await Promise.all(Object.entries(files).map(async([key,name])=>{const a=document.getElementById("a-"+key),s=document.getElementById("status-"+key);try{const r=await fetch(root+"/"+name,{method:"HEAD",cache:"no-store"});if(!r.ok)throw Error("not ready");a.setAttribute("aria-disabled","false");s.textContent="文件已就绪，可以直接下载"}catch{a.setAttribute("aria-disabled","true");s.textContent="文件尚未发布到本站"}}))}document.getElementById("publish").addEventListener("click",async()=>{const out=document.getElementById("upload-result");const selected=[...document.querySelectorAll("input[data-kind]")].filter(el=>el.files.length);if(!selected.length){out.textContent="请先选择文件";return}for(const input of selected){out.textContent="正在上传并校验 "+input.files[0].name;try{const r=await fetch(root+"/upload?file="+encodeURIComponent(input.dataset.kind),{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/octet-stream"},body:input.files[0]});const j=await r.json();if(!r.ok)throw Error(j.error||"上传失败");input.value="";out.textContent="已发布："+j.name}catch(e){out.textContent="发布失败："+e.message;return}}await refresh()});refresh();</script></body></html>';
}

export async function handleProledWallpaperRoute(request, env) {
  const pathname = new URL(request.url).pathname.replace(/\/$/, "");
  if (pathname === ROOT) {
    if (request.method !== "GET" && request.method !== "HEAD") return fail("Method not allowed", 405);
    return new Response(request.method === "HEAD" ? null : page(), { headers: {
      ...SECURITY, "content-type": "text/html;charset=UTF-8", "cache-control": "no-store",
      "content-security-policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
    } });
  }
  if (pathname === ROOT + "/upload") return upload(request, env);
  const key = FILE_BY_PATH[pathname];
  return key ? download(request, env, FILES[key]) : fail("Wallpaper route not found");
}
