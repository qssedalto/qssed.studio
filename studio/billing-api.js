import { DEFAULT_STORAGE_QUOTA_BYTES, MAX_STORAGE_FILE_BYTES, SUPABASE_KEY, SUPABASE_URL } from "./config.js";
import { json } from "./routing.js";
import { workerLog } from "./server-runtime.js";

const FREE_PLAN = Object.freeze({
  id: "aertex_free",
  display_name_zh: "AERTEX Free",
  display_name_en: "AERTEX Free",
  description_zh: "基础账户与 10 GB AERTEX Drive。",
  description_en: "Core account with 10 GB of AERTEX Drive.",
  checkout_enabled: false
});

export function fallbackBillingState() {
  return {
    plan: { ...FREE_PLAN },
    subscription: null,
    entitlements: {
      drive_storage_bytes: DEFAULT_STORAGE_QUOTA_BYTES,
      drive_max_file_bytes: MAX_STORAGE_FILE_BYTES
    },
    plans: [{ ...FREE_PLAN, entitlements: {
      drive_storage_bytes: DEFAULT_STORAGE_QUOTA_BYTES,
      drive_max_file_bytes: MAX_STORAGE_FILE_BYTES
    }}]
  };
}

export async function fetchMyBillingState(request) {
  const authorization = request.headers.get("Authorization") || "";
  if (!/^Bearer\s+\S+$/i.test(authorization)) {
    const error = new Error("Authentication required.");
    error.status = 401;
    throw error;
  }

  let response;
  try {
    response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_my_billing_state`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: authorization,
        "content-type": "application/json;charset=UTF-8",
        Accept: "application/json"
      },
      body: "{}"
    });
  } catch {
    const error = new Error("Subscription service is temporarily unavailable.");
    error.status = 503;
    throw error;
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const error = new Error(String(payload?.message || payload?.error || "Subscription service is temporarily unavailable."));
    error.status = response.status;
    throw error;
  }

  const state = await response.json().catch(() => null);
  if (!state || typeof state !== "object" || !state.plan || !state.entitlements) {
    const error = new Error("Subscription service returned an invalid response.");
    error.status = 502;
    throw error;
  }
  return state;
}

export async function resolveBillingEntitlements(request) {
  try {
    const state = await fetchMyBillingState(request);
    const quota = positiveInteger(state?.entitlements?.drive_storage_bytes, DEFAULT_STORAGE_QUOTA_BYTES);
    const maxFile = positiveInteger(state?.entitlements?.drive_max_file_bytes, MAX_STORAGE_FILE_BYTES);
    return {
      state,
      quotaBytes: quota,
      maxFileBytes: maxFile,
      planId: String(state?.plan?.id || "aertex_free"),
      planName: String(state?.plan?.display_name_en || state?.plan?.display_name_zh || "AERTEX Free")
    };
  } catch (error) {
    workerLog("warn", "billing.entitlements.fallback", {
      message: String(error?.message || error),
      status: Number(error?.status) || 0
    });
    const state = fallbackBillingState();
    return {
      state,
      quotaBytes: DEFAULT_STORAGE_QUOTA_BYTES,
      maxFileBytes: MAX_STORAGE_FILE_BYTES,
      planId: "aertex_free",
      planName: "AERTEX Free"
    };
  }
}

export async function handleBillingState(request) {
  if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
  try {
    return json(await fetchMyBillingState(request));
  } catch (error) {
    const status = [400, 401, 403, 404, 429, 503].includes(Number(error?.status)) ? Number(error.status) : 502;
    return json({ error: String(error?.message || "Subscription service is temporarily unavailable.") }, status);
  }
}

function positiveInteger(value, fallback) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : fallback;
}
