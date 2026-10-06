/**
 * 【初学者导读】
 * 文件：scripts/beginner-comments-check.mjs
 * 这是“中文初学者注释覆盖率”回归检查：自动扫描仓库里大多数可维护源码/配置文件，确认至少存在一段【初学者导读】。
 * 为什么需要它：本轮不是只给几个核心文件加说明，而是希望以后新增代码时也继续保持对初学者友好的注释习惯。
 * 有意排除：历史 Supabase migrations（已执行账本不应为了注释重写）、生成/锁文件、二进制与严格 JSON 数据文件。
 * 注意：这个检查只保证“存在模块级导读”，不能替代高质量的函数内注释；复杂算法仍应在关键分支旁解释为什么这样做。
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MARKER = "【初学者导读】";
const CODE_EXTENSIONS = new Set([
  ".js", ".mjs", ".ts", ".rs", ".go", ".ps1", ".iss",
  ".css", ".html", ".jsonc", ".yml", ".yaml", ".sql", ".toml",
]);
const EXCLUDED_DIRS = new Set([".git", "node_modules", ".wrangler-studio-check", ".wrangler-work-check", ".wrangler-gpt-check", ".wrangler-cash-check", ".wrangler-watch-check", ".wrangler-admin-check"]);

function shouldSkip(relativePath) {
  const normalized = relativePath.replaceAll("\\", "/");
  if (normalized.startsWith("supabase/migrations/")) return true;
  if (normalized.endsWith("/Cargo.lock") || normalized === "AW-Sync/native/Cargo.lock") return true;
  return false;
}

function walk(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && EXCLUDED_DIRS.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(ROOT, absolute);
    if (entry.isDirectory()) walk(absolute, files);
    else if (CODE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) && !shouldSkip(relative)) files.push(relative);
  }
  return files;
}

const files = walk(ROOT).sort();
const missing = [];
for (const relative of files) {
  const content = fs.readFileSync(path.join(ROOT, relative), "utf8");
  if (!content.includes(MARKER)) missing.push(relative.replaceAll("\\", "/"));
}

if (missing.length) {
  console.error("以下可维护源码/配置文件缺少中文初学者导读：");
  for (const file of missing) console.error(" - " + file);
  process.exit(1);
}

console.log(`Beginner Chinese comment coverage OK: ${files.length} files checked.`);
