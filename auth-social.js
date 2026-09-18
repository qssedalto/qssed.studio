const SUPABASE_URL = "https://xunbsoxijasekzadckob.supabase.co";
const SUPABASE_KEY = "sb_publishable_1ScwEvseisteYNgc5xM1pQ_NNekUmF1";
const AUTH_ORIGIN = "https://auth.qsseda.studio";

const ACCESS_COOKIE = "__Host-qsseda-access";
const REFRESH_COOKIE = "__Host-qsseda-refresh";
const GOOGLE_VERIFIER_COOKIE = "__Host-qsseda-google-verifier";
const GOOGLE_NEXT_COOKIE = "__Host-qsseda-google-next";
const ACCESS_MAX_AGE = 60 * 60;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;
const FLOW_MAX_AGE = 10 * 60;

export const SOCIAL_AUTH_PATHS = new Set([
  "/api/providers",
  "/oauth/google",
  "/oauth/google/callback"
]);

export async function handleSocialAuthRequest(request) {
  const url = new URL(request.url);
  const pathname = normalizePath(url.pathname);

  if (pathname === "/api/providers") {
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
    return providerStatus();
  }

  if (pathname === "/oauth/google") {
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
    return beginGoogleSignIn(request);
  }

  if (pathname === "/oauth/google/callback") {
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
    return finishGoogleSignIn(request);
  }

  return json({ error: "Not found" }, 404);
}

async function providerStatus() {
  const status = await readProviderStatus();
  return json({
    google: status.google,
    available: status.reachable
  }, 200);
}

async function beginGoogleSignIn(request) {
  const status = await readProviderStatus();
  if (!status.reachable || !status.google) {
    return redirect("/login?social_error=google_unavailable");
  }

  const requestUrl = new URL(request.url);
  const next = safeNextPath(requestUrl.searchParams.get("next")) || "/dashboard";
  const verifier = randomBase64Url(48);
  const challenge = await sha256Base64Url(verifier);

  const callback = `${AUTH_ORIGIN}/oauth/google/callback`;
  const authorize = new URL(`${SUPABASE_URL}/auth/v1/authorize`);
  authorize.searchParams.set("provider", "google");
  authorize.searchParams.set("redirect_to", callback);
  authorize.searchParams.set("scopes", "openid email profile");
  authorize.searchParams.set("code_challenge", challenge);
  authorize.searchParams.set("code_challenge_method", "s256");

  return redirect(authorize.toString(), [
    cookie(GOOGLE_VERIFIER_COOKIE, verifier, FLOW_MAX_AGE),
    cookie(GOOGLE_NEXT_COOKIE, next, FLOW_MAX_AGE)
  ]);
}

async function finishGoogleSignIn(request) {
  const url = new URL(request.url);
  const cookies = parseCookies(request.headers.get("Cookie") || "");
  const verifier = cookies[GOOGLE_VERIFIER_COOKIE] || "";
  const next = safeNextPath(cookies[GOOGLE_NEXT_COOKIE]) || "/dashboard";
  const providerError = cleanText(url.searchParams.get("error"), 120);
  const code = cleanText(url.searchParams.get("code"), 2048);

  if (providerError) {
    return redirect("/login?social_error=google_cancelled", clearFlowCookies());
  }

  if (!code || !verifier) {
    return redirect("/login?social_error=google_flow_expired", clearFlowCookies());
  }

  let upstream;
  try {
    upstream = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=pkce`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        auth_code: code,
        code_verifier: verifier
      })
    });
  } catch {
    return redirect("/login?social_error=google_exchange_failed", clearFlowCookies());
  }

  let payload;
  try {
    payload = await upstream.json();
  } catch {
    return redirect("/login?social_error=google_exchange_failed", clearFlowCookies());
  }

  if (!upstream.ok || !payload?.access_token || !payload?.refresh_token || !payload?.user) {
    return redirect("/login?social_error=google_exchange_failed", clearFlowCookies());
  }

  return redirect(`/continue?next=${encodeURIComponent(next)}`, [
    ...sessionCookies(payload),
    ...clearFlowCookies()
  ]);
}

async function readProviderStatus() {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: {
        apikey: SUPABASE_KEY,
        accept: "application/json"
      }
    });
    if (!response.ok) return { reachable: false, google: false };
    const payload = await response.json();
    return {
      reachable: true,
      google: payload?.external?.google === true
    };
  } catch {
    return { reachable: false, google: false };
  }
}

function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function safeNextPath(value) {
  const path = cleanText(value, 500);
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\u0000")) return "";
  return path;
}

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function randomBase64Url(byteLength) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

async function sha256Base64Url(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return base64Url(new Uint8Array(digest));
}

function base64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function sessionCookies(payload) {
  const expiresIn = Math.max(60, Math.min(Number(payload?.expires_in) || ACCESS_MAX_AGE, ACCESS_MAX_AGE));
  return [
    cookie(ACCESS_COOKIE, payload.access_token, expiresIn),
    cookie(REFRESH_COOKIE, payload.refresh_token, REFRESH_MAX_AGE)
  ];
}

function clearFlowCookies() {
  return [
    cookie(GOOGLE_VERIFIER_COOKIE, "", 0),
    cookie(GOOGLE_NEXT_COOKIE, "", 0)
  ];
}

function cookie(name, value, maxAge) {
  return `${name}=${encodeURIComponent(value || "")}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

function parseCookies(header) {
  const result = {};
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index <= 0) continue;
    const key = part.slice(0, index).trim();
    const raw = part.slice(index + 1).trim();
    try {
      result[key] = decodeURIComponent(raw);
    } catch {
      result[key] = raw;
    }
  }
  return result;
}

function redirect(location, cookies = []) {
  const headers = new Headers({
    location,
    "cache-control": "no-store",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff"
  });
  for (const value of cookies) headers.append("set-cookie", value);
  return new Response(null, { status: 302, headers });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer"
    }
  });
}
