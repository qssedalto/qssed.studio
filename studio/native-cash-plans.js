import { nativeJson } from "./native-mobile-auth.js";

// Caller MUST have passed verifyNativeAppSession and supplied user.id from the
// verified Bearer session. No caller-supplied account identifier is honored.
// Only the selected item list is mutated; the R2 snapshot is protected by
// an If-Match ETag and conditional put to avoid silent concurrent overwrites.
const LISTS = Object.freeze({
  dated: "plannedEvents",
  expected: "expectedEvents",
  recurring: "recurringExpenses"
});
const MAX_BODY = 12 * 1024;
const MAX_ITEMS = 2000;

const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const isoDate = value => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + "T00:00:00.000Z");
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};
const isoMonth = value => typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
const money = value => typeof value === "number" && Number.isFinite(value) &&
  value > 0 && value <= 1e9 && Math.abs(Math.round(value * 100) - value * 100) < 0.000001;
const trimmed = (value, limit) => typeof value === "string" && value.trim().length > 0 &&
  value.length <= limit && !/[\u0000-\u001f\u007f]/.test(value);
const safeId = value => typeof value === "string" && /^[A-Za-z0-9_-]{3,120}$/.test(value);

const fields = Object.freeze({
  dated: ["date", "type", "amount", "category", "note", "enabled"],
  expected: ["expectedMonth", "type", "amount", "category", "note", "enabled"],
  recurring: ["name", "category", "amount", "dayOfMonth", "reserveWhenUndated", "enabled"]
});

function validate(kind, payload, settings) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload) ||
      Object.keys(payload).some(key => !fields[kind]?.includes(key)) ||
      fields[kind]?.some(key => !own(payload, key))) return null;
  const category = payload.category;
  if (!money(payload.amount) || !trimmed(category, 90) ||
      typeof payload.enabled !== "boolean") return null;
  if (kind === "recurring") {
    const day = payload.dayOfMonth;
    if (!trimmed(payload.name, 120) ||
        !(day === null || Number.isInteger(day) && day >= 1 && day <= 31) ||
        typeof payload.reserveWhenUndated !== "boolean") return null;
    return {
      name: payload.name.trim(), category: category.trim(), amount: payload.amount,
      frequency: "monthly", dayOfMonth: day,
      reserveWhenUndated: payload.reserveWhenUndated, enabled: payload.enabled
    };
  }
  if (!["expense", "income"].includes(payload.type) ||
      typeof payload.note !== "string" || payload.note.length > 300 ||
      /[\u0000-\u001f\u007f]/.test(payload.note)) return null;
  const start = String(settings?.periodStart || "");
  const end = String(settings?.periodEnd || "");
  if (!isoDate(start) || !isoDate(end)) return null;
  if (kind === "dated") {
    if (!isoDate(payload.date) || payload.date < start || payload.date > end) return null;
    return {
      date: payload.date, type: payload.type, amount: payload.amount,
      category: category.trim(), note: payload.note.trim(), enabled: payload.enabled
    };
  }
  if (!isoMonth(payload.expectedMonth) ||
      payload.expectedMonth < start.slice(0, 7) ||
      payload.expectedMonth > end.slice(0, 7)) return null;
  return {
    expectedMonth: payload.expectedMonth, type: payload.type, amount: payload.amount,
    category: category.trim(), note: payload.note.trim(), enabled: payload.enabled
  };
}

export async function handleNativeCashPlanMutation(request, env, userId) {
  if (!env?.STORAGE?.get || !env?.STORAGE?.put || !userId) {
    return nativeJson({ error: "Cash storage unavailable." }, 503);
  }
  const method = request.method;
  if (!["POST", "PUT", "DELETE"].includes(method)) {
    return nativeJson({ error: "Method not allowed." }, 405);
  }
  const url = new URL(request.url);
  const kind = url.searchParams.get("kind") || "";
  const list = LISTS[kind];
  if (!list) return nativeJson({ error: "Unknown Cash plan category." }, 400);
  const id = url.searchParams.get("id");
  if ((method === "POST" && id != null) ||
      (method !== "POST" && !safeId(id))) {
    return nativeJson({ error: "Invalid plan identifier." }, 400);
  }
  const match = request.headers.get("If-Match");
  // Never accept wildcard writes: every change must derive from the exact
  // last downloaded R2 version, including POST. This is cross-client safety.
  if (!match || match === "*" || match.length > 200) {
    return nativeJson({ error: "请先刷新 Cash 计划，再提交修改。", code: "etag_required" }, 428);
  }
  let body;
  if (method !== "DELETE") {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY) {
      return nativeJson({ error: "Plan payload too large." }, 413);
    }
    try { body = JSON.parse(raw); } catch {
      return nativeJson({ error: "Invalid JSON." }, 400);
    }
  }
  const key = `cash/users/${userId}/data.json`;
  try {
    const object = await env.STORAGE.get(key);
    if (!object) return nativeJson({ error: "请先创建 Cash 账本，再编辑计划。" }, 409);
    if (object.etag !== match) {
      return nativeJson({ error: "计划已在其他设备更新，请刷新后重试。", code: "conflict" }, 409);
    }
    const data = JSON.parse(await object.text());
    if (!data || ![2, 3, 4].includes(Number(data.version)) ||
        !data.settings || typeof data.settings !== "object" ||
        !Array.isArray(data[list]) || data[list].length > MAX_ITEMS) {
      return nativeJson({ error: "Existing Cash data schema is incompatible." }, 409);
    }
    const entries = data[list];
    const index = id == null ? -1 : entries.findIndex(entry => entry?.id === id);
    if (id && index < 0) return nativeJson({ error: "计划已不存在，请刷新。" }, 404);
    let result = null;
    if (method === "DELETE") {
      entries.splice(index, 1);
    } else {
      const validated = validate(kind, body, data.settings);
      if (!validated) return nativeJson({ error: "计划数据不合法，请检查日期、金额和分类。" }, 400);
      if (method === "POST") {
        if (entries.length >= MAX_ITEMS) return nativeJson({ error: "计划数量达到上限。" }, 409);
        result = {
          id: "native-" + crypto.randomUUID(), ...validated,
          ...(kind === "dated" ? { source: "manual", huabeiAmount: 0,
            linkedPlanId: null, linkedRecurringId: null, linkedRecurringMonth: null } : {})
        };
        entries.push(result);
      } else {
        // Preserve unrelated site-defined fields, such as a dated plan's
        // original 'source', and never rewrite any transactions.
        result = { ...entries[index], ...validated };
        entries[index] = result;
      }
    }
    const saved = await env.STORAGE.put(key, JSON.stringify(data), {
      onlyIf: { etagMatches: object.etag },
      httpMetadata: { contentType: "application/json;charset=UTF-8" },
      customMetadata: {
        ownerId: userId, product: "aertex-cash", schemaVersion: String(data.version)
      }
    });
    if (!saved) {
      return nativeJson({ error: "Cash 数据已被其他设备修改，请刷新重试。", code: "conflict" }, 409);
    }
    return nativeJson({ ok: true, item: result, etag: saved.etag }, method === "POST" ? 201 : 200);
  } catch {
    return nativeJson({ error: "无法保存 Cash 计划，请稍后重试。" }, 503);
  }
}
