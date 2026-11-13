// Central browser-token refresh policy for the AERTEX Auth Worker.
// Concurrent requests within one Worker isolate share one in-flight refresh.
// Never cache a completed refresh: logout/revocation must take effect promptly.
import { SUPABASE_URL, SUPABASE_KEY } from "./studio/config.js";

const inFlight = new Map();
const MAX_INFLIGHT = 256;

export async function refreshBrowserAuthSession(refreshToken, upstreamFetch = fetch) {
  if (typeof refreshToken !== "string" || !refreshToken || refreshToken.length > 12000) {
    return { kind: "invalid" };
  }
  // Do not retain raw refresh tokens as Map keys or log them.
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(refreshToken));
  const key = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, "0")).join("");
  if (inFlight.has(key)) return inFlight.get(key);
  if (inFlight.size >= MAX_INFLIGHT) return { kind: "unavailable" };

  const pending = (async () => {
    let response;
    try {
      response = await upstreamFetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, "content-type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
    } catch {
      return { kind: "unavailable" };
    }
    if (!response.ok) {
      // Invalid/revoked refresh tokens are not recoverable. Timeouts, rate
      // limits and upstream 5xx are transient and must not force sign-in.
      if ([400, 401, 403].includes(response.status)) return { kind: "invalid" };
      return { kind: "unavailable" };
    }
    try {
      const payload = await response.json();
      if (payload?.access_token && payload?.refresh_token && payload?.user?.id) {
        return { kind: "ok", payload };
      }
    } catch {}
    return { kind: "unavailable" };
  })();
  inFlight.set(key, pending);
  try { return await pending; }
  finally { if (inFlight.get(key) === pending) inFlight.delete(key); }
}

export function temporarilyUnavailableResponse() {
  return new Response("Authentication temporarily unavailable. Please retry; your session has not been cleared.", {
    status: 503,
    headers: {
      "content-type": "text/plain;charset=UTF-8",
      "cache-control": "no-store",
      "retry-after": "5",
      "x-content-type-options": "nosniff"
    }
  });
}
