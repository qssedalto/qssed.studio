/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 *
 * AERTEX history note:
 * This comment came from the project's original monolithic Cloudflare Worker
 * and is intentionally preserved across the workers that were later split from it.
 */

import { huaweiHarmonyGate } from "./studio/huawei-harmony-gate.js";
import { handleStudioSessionLogout, verifyStudioPageSession, withStudioSessionCookies } from "./studio/session-gate.js";
import { handleAuthHandoff } from "./studio/auth-handoff.js";
import { cashSessionRedirect } from "./studio/cash-subdomain.js";
import { cashOriginForRequest } from "./studio/domain-family.js";
import { localeFromPath, preferredLocaleFromRequest } from "./studio/locale.js";
import { appearanceClientRuntime } from "./studio/appearance.js";
import { FAVICON_PATHS, faviconResponse } from "./studio/favicon.js";
import { LOGO_PATHS, logoResponse } from "./studio/brand-logo.js";
import { verifyNativeAppSession, nativeJson } from "./studio/native-mobile-auth.js";
// Use the exact canonical website model; never recalculate forecasts differently on iOS.
import "./cash-web/model.js";

const MAX_DATA_BYTES = 2 * 1024 * 1024;
const ASSET_PATHS = new Set(["/styles.css", "/model.js", "/app.js"]);

export default {
  async fetch(request, env) {
    const deviceGate = await huaweiHarmonyGate(request);
    if (deviceGate) return deviceGate;

    const url = new URL(request.url);
    const pathname = normalizePath(url.pathname);

    if (FAVICON_PATHS.has(pathname)) return faviconResponse(request);
    if (LOGO_PATHS.has(pathname)) return logoResponse(request);

    if (pathname === "/health") {
      return json({
        service: "qsseda-cash",
        status: "ok",
        origin: cashOriginForRequest(request),
        storage: Boolean(env?.STORAGE)
      });
    }

    if (pathname === "/robots.txt") {
      return text("User-agent: *\nDisallow: /\n", 200, "text/plain;charset=UTF-8");
    }

    if (pathname === "/appearance.js") {
      if (request.method !== "GET" && request.method !== "HEAD") return text("Method not allowed", 405);
      return text(request.method === "HEAD" ? "" : appearanceClientRuntime(), 200, "text/javascript;charset=UTF-8");
    }

    if (pathname === "/auth/handoff") {
      if (request.method !== "POST") return text("Method not allowed", 405);
      return handleAuthHandoff(request, env, preferredLocaleFromRequest(request));
    }

    if (pathname === "/api/auth/logout") {
      if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
      return handleStudioSessionLogout(request);
    }

    if (pathname === "/api/native/cash/data" || pathname === "/api/native/cash/transactions" || pathname === "/api/native/cash/planning" || pathname === "/api/native/cash/forecast") {
      const session = await verifyNativeAppSession(request);
      if (!session.ok) return session.response;
      return handleNativeCash(request, env, session.user.id, pathname);
    }

    if (pathname === "/api/cash/data") {
      const gate = await verifyStudioPageSession(request);
      if (!gate.ok) {
        return withStudioSessionCookies(json({ error: "Authentication required." }, 401), gate.cookies || []);
      }
      const response = await handleCashData(request, env, gate.user?.id || "");
      return withStudioSessionCookies(response, gate.cookies || []);
    }

    if (ASSET_PATHS.has(pathname)) {
      if (request.method !== "GET" && request.method !== "HEAD") return text("Method not allowed", 405);
      return serveAsset(request, env, pathname);
    }

    if (request.method !== "GET" && request.method !== "HEAD") return text("Method not allowed", 405);

    if (pathname === "/") {
      const locale = preferredLocaleFromRequest(request);
      return redirect(`${cashOriginForRequest(request)}/${locale}`);
    }

    const locale = localeFromPath(pathname);
    const parts = pathname.split("/").filter(Boolean);
    if (!locale || parts.length !== 1) return text("Not found", 404);

    const gate = await verifyStudioPageSession(request);
    if (!gate.ok) {
      return withStudioSessionCookies(cashSessionRedirect(request, pathname), gate.cookies || []);
    }

    const response = await serveAsset(request, env, "/index.html", {
      "cache-control": "private, no-store",
      "content-language": locale
    });
    return withStudioSessionCookies(response, gate.cookies || []);
  }
};

// Native Cash uses exactly the same R2 per-user document as cash.qsseda.com.
// POST adds ONE validated transaction server-side, preserving plans/settings,
// so the iOS client never round-trips or overwrites unknown Cash schema fields.
async function handleNativeCash(request, env, userId, path) {
  if (!env?.STORAGE || !userId) return nativeJson({ error: "Cash storage unavailable." }, 503);
  const key = `cash/users/${userId}/data.json`;
  // A device-safe, read-only projection of the same owner-scoped Cash R2
  // document used by cash.qsseda.com. Preserve source fields without
  // pretending to run the website's complete forecast model on the device.
  if (path === "/api/native/cash/forecast") {
    if (request.method !== "GET") return nativeJson({ error: "Method not allowed." }, 405);
    try {
      const source = await env.STORAGE.get(key);
      if (!source) return nativeJson({ initialized: false, forecast: null, updated_at: null });
      const data = JSON.parse(await source.text());
      if (!validCashPayload(data)) return nativeJson({ error: "Cash storage schema mismatch." }, 409);
      const canonicalModel = globalThis.CashflowModel;
      if (!canonicalModel?.calculateFinancialModel) {
        return nativeJson({ error: "Cash model temporarily unavailable." }, 503);
      }
      const result = canonicalModel.calculateFinancialModel(data);
      if (!Number.isFinite(result.forecast.endBalance) ||
          !Number.isFinite(result.ledger.cashBalance)) {
        return nativeJson({ error: "Cash model produced invalid output." }, 503);
      }
      return nativeJson({
        initialized: true,
        as_of: result.asOf,
        period_start: result.data.settings.periodStart,
        period_end: result.data.settings.periodEnd,
        updated_at: source.uploaded?.toISOString?.() || null,
        actual_cash: result.ledger.cashBalance,
        disposable_cash: result.disposableBalance,
        funded_reserve: result.reserve.amount,
        reserve_shortfall: result.reserve.shortfall,
        projected_end_balance: result.forecast.endBalance,
        components: {
          current_cash: result.forecast.components.currentCash,
          planned_income: result.forecast.components.plannedIncome,
          planned_expense: result.forecast.components.plannedExpense,
          recurring_expense: result.forecast.components.knownRecurringExpense,
          future_food_budget: result.forecast.components.futureFoodBudget,
          social_budget_reserve: result.forecast.components.socialBudgetReserve,
          fixed_reserve: result.forecast.components.fixedReserve,
          expected_net: result.forecast.components.expectedNet
        },
        monthly: result.monthly.map(item => ({
          month: item.month, actual_income: item.actualIncome,
          actual_expense: item.actualExpense,
          planned_income: item.plannedIncome, planned_expense: item.plannedExpense,
          food_forecast: item.foodForecast,
          social_remaining: item.socialRemaining,
          scheduled_recurring: item.scheduledRecurring,
          reserved: item.reserved, expected: item.expected
        })),
        daily: result.forecast.daily.map(item => ({
          date: item.key, projected_cash: item.projectedCashBeforeReserve,
          actual_cash: item.actualCashBalance,
          is_future: item.key > result.asOf
        }))
      });
    } catch {
      return nativeJson({ error: "Could not calculate Cash forecast." }, 503);
    }
  }
  if (path === "/api/native/cash/planning") {
    if (request.method !== "GET") return nativeJson({ error: "Method not allowed." }, 405);
    try {
      const object = await env.STORAGE.get(key);
      if (!object) return nativeJson({
        plannedEvents: [], expectedEvents: [], recurringExpenses: [],
        budgetRules: {}, settings: {}, updated_at: null, initialized: false
      });
      const data = JSON.parse(await object.text());
      if (!validCashPayload(data)) return nativeJson({ error: "Cash storage schema mismatch." }, 409);
      return nativeJson({
        plannedEvents: data.plannedEvents || [],
        expectedEvents: data.expectedEvents || [],
        recurringExpenses: data.recurringExpenses || [],
        budgetRules: data.budgetRules || {},
        settings: data.settings || {},
        updated_at: object.uploaded?.toISOString?.() || null,
        initialized: true
      });
    } catch {
      return nativeJson({ error: "Could not load Cash planning data." }, 503);
    }
  }
  if (path === "/api/native/cash/data") {
    if (request.method !== "GET") return nativeJson({ error: "Method not allowed." }, 405);
    try {
      const object = await env.STORAGE.get(key);
      if (!object) return nativeJson({
        data: { version: 4, settings: {}, transactions: [], plannedEvents: [],
          expectedEvents: [], recurringExpenses: [] },
        updated_at: null, initialized: false
      });
      return nativeJson({ data: JSON.parse(await object.text()),
        updated_at: object.uploaded?.toISOString?.() || null, initialized: true });
    } catch {
      return nativeJson({ error: "Could not load Cash data." }, 503);
    }
  }
  if (request.method !== "POST") return nativeJson({ error: "Method not allowed." }, 405);
  let tx;
  try { tx = await request.json(); } catch { return nativeJson({ error: "Invalid JSON." }, 400); }
  const type = tx?.type;
  const allowedCategories = type === "income"
    ? ["tutoringIncome", "familyRepayment", "salary", "otherIncome"]
    : ["food", "socialTransport", "tutoringTransport", "installment", "electronics",
      "electricity", "water", "phone", "chatgpt", "otherExpense"];
  const amount = tx?.amount;
  const note = tx?.note;
  const date = tx?.date;
  const dateValid = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
    && !Number.isNaN(Date.parse(date)) && new Date(date + "T00:00:00.000Z").toISOString().slice(0, 10) === date;
  if ((type !== "income" && type !== "expense") || !dateValid ||
      typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0 || amount > 1e9 ||
      Math.round(amount * 100) / 100 !== amount ||
      typeof tx?.category !== "string" || !allowedCategories.includes(tx.category) ||
      typeof note !== "string" || note.length > 300 ||
      Object.keys(tx || {}).some(k => !["type","amount","category","note","date"].includes(k))) {
    return nativeJson({ error: "Invalid Cash transaction." }, 400);
  }
  try {
    const object = await env.STORAGE.get(key);
    const data = object ? JSON.parse(await object.text()) : {
      version: 4, settings: {
        periodStart: "2026-10-01", periodEnd: "2027-01-13",
        manualEntryEnd: "2026-10-07", oddMondayAnchor: "2026-10-12",
        openingCash: 0, emergencyCredit: 0
      },
      transactions: [], plannedEvents: [], expectedEvents: [],
      recurringExpenses: [], budgetRules: {
        foodByDayType: { classDay: 0, oddMonday: 0, evenMonday: 0, saturday: 0, sunday: 0 },
        socialTransport: { weeklyVisits: 0, medianPerVisit: 0, minPerVisit: 0, maxPerVisit: 0 }
      }
    };
    if (!validCashPayload(data)) return nativeJson({ error: "Cash storage schema mismatch." }, 409);
    const today = new Date().toISOString().slice(0,10);
    const start = data.settings?.periodStart || "2026-10-01";
    const end = data.settings?.periodEnd || "2027-01-13";
    if (date < start || date > end || date > today) {
      return nativeJson({ error: "Transaction date outside allowed Cash period." }, 400);
    }
    if (data.transactions.length >= 20000) return nativeJson({ error: "Ledger limit reached." }, 409);
    data.transactions.push({
      id: "tx-" + crypto.randomUUID(), date, type, amount,
      huabeiAmount: 0, category: tx.category, note: note.trim(),
      linkedPlanId: null, linkedRecurringId: null, linkedRecurringMonth: null
    });
    const onlyIf = object
      ? { etagMatches: object.etag }
      : { etagDoesNotMatch: "*" };
    const saved = await env.STORAGE.put(key, JSON.stringify(data), {
      onlyIf, httpMetadata: { contentType: "application/json;charset=UTF-8" },
      customMetadata: { ownerId: userId, product: "aertex-cash", schemaVersion: String(data.version) }
    });
    if (!saved) return nativeJson({ error: "Cash changed on another device. Refresh and retry." }, 409);
    return nativeJson({ ok: true, transaction: data.transactions.at(-1) }, 201);
  } catch {
    return nativeJson({ error: "Could not save Cash transaction." }, 503);
  }
}

async function handleCashData(request, env, userId) {
  if (!env?.STORAGE || !userId) return json({ error: "Cash storage is unavailable." }, 503);
  const key = `cash/users/${userId}/data.json`;

  if (request.method === "GET") {
    try {
      const object = await env.STORAGE.get(key);
      if (!object) return json({ error: "Cash data not found." }, 404);
      let data;
      try { data = JSON.parse(await object.text()); }
      catch { return json({ error: "Stored Cash data is invalid." }, 500); }
      return json({
        data,
        updated_at: object.uploaded?.toISOString?.() || null,
        etag: object.httpEtag || object.etag || null
      });
    } catch {
      return json({ error: "Unable to load Cash data." }, 503);
    }
  }

  if (request.method === "PUT") {
    const origin = request.headers.get("Origin") || "";
    const requestOrigin = new URL(request.url).origin;
    if (origin !== requestOrigin) return json({ error: "Invalid origin." }, 403);

    const declaredLength = Number(request.headers.get("Content-Length") || 0);
    if (declaredLength > MAX_DATA_BYTES) return json({ error: "Cash data is too large." }, 413);

    let textBody = "";
    try { textBody = await request.text(); }
    catch { return json({ error: "Unable to read Cash data." }, 400); }
    if (new TextEncoder().encode(textBody).byteLength > MAX_DATA_BYTES) {
      return json({ error: "Cash data is too large." }, 413);
    }

    let data;
    try { data = JSON.parse(textBody); }
    catch { return json({ error: "Cash data must be valid JSON." }, 400); }
    if (!validCashPayload(data)) return json({ error: "Cash data has an unsupported structure." }, 400);

    try {
      await env.STORAGE.put(key, JSON.stringify(data), {
        httpMetadata: { contentType: "application/json;charset=UTF-8" },
        customMetadata: { ownerId: userId, product: "aertex-cash", schemaVersion: String(data.version) }
      });
      return json({ ok: true, saved_at: new Date().toISOString() });
    } catch {
      return json({ error: "Unable to save Cash data." }, 503);
    }
  }

  if (request.method === "DELETE") {
    const origin = request.headers.get("Origin") || "";
    if (origin !== new URL(request.url).origin) return json({ error: "Invalid origin." }, 403);
    try {
      await env.STORAGE.delete(key);
      return json({ ok: true });
    } catch {
      return json({ error: "Unable to reset Cash data." }, 503);
    }
  }

  return json({ error: "Method not allowed." }, 405);
}

function validCashPayload(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  if (![2, 3, 4].includes(Number(data.version))) return false;
  if (data.settings != null && (typeof data.settings !== "object" || Array.isArray(data.settings))) return false;
  for (const key of ["transactions", "plannedEvents", "expectedEvents", "recurringExpenses"]) {
    if (data[key] != null && !Array.isArray(data[key])) return false;
    if (Array.isArray(data[key]) && data[key].length > 20000) return false;
  }
  return true;
}

async function serveAsset(request, env, assetPath, extraHeaders = {}) {
  if (!env?.ASSETS?.fetch) return text("Cash assets are unavailable.", 503);
  const source = new URL(request.url);
  source.pathname = assetPath;
  source.search = "";
  const assetRequest = new Request(source.toString(), {
    method: request.method === "HEAD" ? "HEAD" : "GET",
    headers: request.headers
  });
  const asset = await env.ASSETS.fetch(assetRequest);
  const headers = new Headers(asset.headers);
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "same-origin");
  headers.set("x-frame-options", "DENY");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  if (assetPath === "/index.html") {
    headers.set("content-security-policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
  }
  for (const [name, value] of Object.entries(extraHeaders)) headers.set(name, value);
  return new Response(request.method === "HEAD" ? null : asset.body, {
    status: asset.status,
    statusText: asset.statusText,
    headers
  });
}

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function redirect(location) {
  return new Response(null, {
    status: 302,
    headers: { location, "cache-control": "no-store", "referrer-policy": "no-referrer" }
  });
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });
}

function text(value, status = 200, contentType = "text/plain;charset=UTF-8") {
  return new Response(value, {
    status,
    headers: {
      "content-type": contentType,
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });
}
