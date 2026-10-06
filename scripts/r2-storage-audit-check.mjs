/**
 * 【初学者导读】
 * 文件：scripts/r2-storage-audit-check.mjs
 * CI 回归检查主题：r2 storage audit。
 * 作用：把当前产品必须保持的路由、数据、界面或架构规则写成自动断言，让未来改动在合并前就暴露问题。
 * 阅读顺序：先看加载了哪些源文件，再逐条读 assert；每条 assert 都可以理解为一条最小产品规格。
 * 修改原则：先判断失败来自实现错误还是规格变化；只有规格确实调整时，才同时更新实现与检查。
 * 初学者提示：字符串检查适合固定结构，算法应使用小型输入/输出样例验证，二者各有用途。
 */
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
assert(storageApi.includes("used_bytes: usedBytes"), "Storage API must report complete current-user Drive usage as used_bytes.");
assert(storageApi.includes("resolveBillingEntitlements(request)"), "Storage API must resolve AERTEX Drive quota from subscription entitlements.");
assert(storageApi.includes("quota_bytes: quotaBytes"), "Storage API must report the resolved AERTEX Drive quota.");
assert(storageApi.includes("prefix = storagePrefix(ownerId)"), "Quota accounting must stay scoped to the current user prefix.");
assert(storageApi.includes('usage_scope: "own-user-files"'), "Product storage must identify current-account scope.");
assert(storageApi.includes("user_id: auth.user.id"), "Drive list response must identify the authenticated account for client cache scoping.");
assert(!storageApi.includes("auth.isAdmin"), "Product storage must never broaden file scope for administrators.");
assert(!storageApi.includes("account_is_admin"), "Product storage responses must not expose administrator state.");

const storageUi = fs.readFileSync(new URL("../studio/ui-storage.js", import.meta.url), "utf8");
assert(storageUi.includes("visible_used_bytes ?? data?.used_bytes"), "Storage cache fingerprint must prefer visible user-file bytes.");
assert(storageUi.includes("data.used_bytes ?? data.visible_used_bytes"), "Storage UI must render complete Drive usage when quota data is available.");
assert(storageUi.includes("data?.quota_bytes"), "Storage UI cache must include the account quota.");
assert(storageUi.includes('const responseUserId = String(data?.user_id || "");'), "Drive UI must scope cache writes to the authenticated Drive response.");
assert(!storageUi.includes('summaryResponse = await fetch("/api/account/security/summary"'), "Drive initialization must not misclassify account-summary failures as authentication failures.");
assert(!storageUi.includes("adminDescription"), "Product storage UI must not contain an administrator mode.");
assert(!storageUi.includes("isAdminView"), "Product storage UI must not switch into an administrator view.");


console.log("R2 storage and access-audit optimization checks passed.");
