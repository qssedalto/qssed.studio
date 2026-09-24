import fs from "node:fs";
import { shouldRecordAccessAudit, ACCESS_AUDIT_RETENTION_DAYS } from "../studio/access-audit.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function audit(path, status, method = "GET", source = "studio") {
  return shouldRecordAccessAudit(
    new Request("https://qsseda.com" + path, { method }),
    new Response(null, { status }),
    source
  );
}

assert(ACCESS_AUDIT_RETENTION_DAYS === 14, "Access Audit retention must remain 14 days.");
assert(audit("/", 200) === false, "Routine successful GET traffic must not create R2 audit objects.");
assert(audit("/.env", 404) === false, "Anonymous scanner-style 404 traffic must not create R2 audit objects.");
assert(audit("/missing", 404) === false, "Routine 404 traffic must not create R2 audit objects.");
assert(audit("/api/admin/users", 200) === true, "Administrator routes must remain audited.");
assert(audit("/api/storage/object?id=x", 200) === true, "Storage access routes must remain audited.");
assert(audit("/anything", 401) === true, "401 responses must remain audited.");
assert(audit("/anything", 403) === true, "403 responses must remain audited.");
assert(audit("/anything", 429) === true, "429 responses must remain audited.");
assert(audit("/anything", 500) === true, "5xx responses must remain audited.");
assert(audit("/api/tasks", 200, "POST") === true, "Write requests must remain audited.");
assert(audit("/callback", 200, "GET", "auth") === true, "Auth callback routes must remain audited.");

const storageApi = fs.readFileSync(new URL("../studio/storage-api.js", import.meta.url), "utf8");
assert(!storageApi.includes("readBucketUsage"), "Storage page must not scan the entire R2 bucket for usage.");
assert(storageApi.includes("used_bytes: visibleUsedBytes"), "Storage API must report user-file usage as used_bytes.");
assert(storageApi.includes('usage_scope: auth.isAdmin ? "all-user-files" : "own-user-files"'), "Storage API must identify the user-file usage scope.");

const storageUi = fs.readFileSync(new URL("../studio/ui-storage.js", import.meta.url), "utf8");
assert(storageUi.includes("visible_used_bytes ?? data?.used_bytes"), "Storage cache fingerprint must prefer visible user-file bytes.");
assert(storageUi.includes("visible_used_bytes ?? data.used_bytes"), "Storage UI must render visible user-file bytes.");
assert(storageUi.includes("系统日志、发布文件和内部对象不计入这里的用户文件空间"), "Administrator storage copy must explain excluded system objects.");


console.log("R2 storage and access-audit optimization checks passed.");
