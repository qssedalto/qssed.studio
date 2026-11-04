// Validate only durable, useful beginner-documentation contracts. This intentionally
// does NOT require every source file to contain a superficial comment marker.
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const guidePath = path.join(root, "docs/BEGINNER_CODE_GUIDE_CN.md");
const guide = readFileSync(guidePath, "utf8");
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const sections = ["仓库中的几个系统", "主站请求", "认证与安全边界", "Supabase 与 R2", "AERTEX Watch", "调试", "安全修改", "推荐第一次阅读"];
for (const section of sections) assert(guide.includes(section), "Missing beginner guide section: " + section);
assert(guide.includes("不能保证从全空数据库复原整站"), "The guide must preserve the Supabase bootstrap caveat");
assert(guide.includes("没有浏览器上传 API"), "Do not document the retired PROLED XDR upload feature as available");
assert(!guide.includes("qsseda.online"), "Retired domain must not be described as active");

const referenced = new Set();
for (const match of guide.matchAll(/\x60([^\x60\n]+)\x60/g)) {
  const value = match[1];
  if (/[\*<>\s]/.test(value) || !/\.(?:js|mjs|rs|go|md|sql|jsonc|yml|yaml)$/.test(value)) continue;
  if (!/^(?:[\w.-]+\/)*[\w.-]+$/.test(value)) continue;
  referenced.add(value);
}
for (const file of referenced) {
  const absolute = path.resolve(root, file);
  assert(absolute.startsWith(root + path.sep) && existsSync(absolute), "Missing source file mentioned by beginner guide: " + file);
}
for (const match of guide.matchAll(/\]\(([^)]+)\)/g)) {
  const target = match[1].split("#")[0];
  if (!target || /^(?:https?:|mailto:)/.test(target)) continue;
  assert(existsSync(path.resolve(path.dirname(guidePath), target)), "Broken guide link: " + target);
}
const mainWrangler = readFileSync(path.join(root, "wrangler.jsonc"), "utf8");
const authWrangler = readFileSync(path.join(root, "wrangler.auth.jsonc"), "utf8");
const mainWorker = readFileSync(path.join(root, "worker.js"), "utf8");
assert(mainWrangler.includes('"main": "studio/worker-audit.js"'), "Studio entrypoint moved; update the guide");
assert(authWrangler.includes('"main": "studio/auth-audit-entry.js"'), "Auth entrypoint moved; update the guide");
assert(mainWorker.includes('import studio from "./studio/entry.js"'), "Studio routing boundary changed; update the guide");
assert(referenced.size >= 18, "Beginner guide must reference enough actual code paths");
console.log("Beginner Chinese guide verified:", referenced.size, "source paths and relative documentation links");
