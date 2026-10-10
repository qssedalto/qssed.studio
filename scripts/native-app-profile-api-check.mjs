import authWorker from "../auth-worker.js";

const origin = "https://auth.qsseda.com";
const userId = "11111111-2222-4333-8444-555555555555";
const accessToken = "test-native-bearer";
const authUser = {
  id: userId,
  email: "profile-test@example.invalid",
  user_metadata: { aertex_accent: "iphone-9aadf6" }
};
let profile = {
  username: "native_test",
  display_name: "Original Name",
  avatar_url: "",
  role: "user",
  status: "active"
};
let mutations = 0;
const realFetch = globalThis.fetch;

function upstream(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" }
  });
}

globalThis.fetch = async (input, options = {}) => {
  const url = new URL(String(input));
  const headers = new Headers(options.headers || {});
  if (headers.get("authorization") !== `Bearer ${accessToken}`) {
    return upstream({ error: "invalid_token" }, 401);
  }
  if (url.pathname === "/auth/v1/user") {
    if (options.method === "PUT") {
      const body = JSON.parse(options.body);
      assert(Object.keys(body).join(",") === "data", "Only Supabase user_metadata can be updated");
      assert(Object.keys(body.data).join(",") === "aertex_accent", "Only accent metadata can change");
      authUser.user_metadata.aertex_accent = body.data.aertex_accent;
      mutations += 1;
    }
    return upstream(authUser);
  }
  if (url.pathname === "/rest/v1/profiles") {
    assert(url.searchParams.get("id") === `eq.${userId}`, "Profile query must target verified subject");
    if (options.method === "PATCH") {
      const payload = JSON.parse(options.body);
      assert(Object.keys(payload).join(",") === "display_name", "Server must only PATCH display_name");
      assert(headers.get("prefer") === "return=representation", "Mutation must verify affected row");
      assert(headers.get("apikey"), "Missing Supabase publishable key");
      mutations += 1;
      profile = { ...profile, display_name: payload.display_name };
      return upstream([{ id: userId, display_name: profile.display_name }]);
    }
    return upstream([profile]);
  }
  throw new Error(`Unexpected upstream request: ${url}`);
};

function request(method = "GET", token = accessToken, body) {
  return new Request(`${origin}/api/app/profile`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body === undefined ? {} : { "content-type": "application/json" })
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
}
async function call(method, token, body) {
  const response = await authWorker.fetch(request(method, token, body), {});
  const json = await response.json();
  assert(response.headers.get("cache-control") === "no-store", "Native API must not cache profile data");
  assert(!response.headers.has("set-cookie"), "Native profile API must not set browser cookies");
  return { response, json };
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  let result = await call("GET", "");
  assert(result.response.status === 401 && result.json.code === "missing_token", "Missing token must fail closed");

  result = await call("GET", "fake-token");
  assert(result.response.status === 401, "Unknown bearer token must be rejected");

  result = await call("GET", accessToken);
  assert(result.response.status === 200 && result.json.authorized === true, "Active account must be accessible");
  assert(result.json.user.displayName === "Original Name", "GET should return live profile");

  result = await call("PATCH", accessToken, { displayName: "新显示名" });
  assert(result.response.status === 200 && result.json.user.displayName === "新显示名", "Native profile update should succeed");
  assert(mutations === 1, "Expected one narrow profile mutation");
  result = await call("PATCH", accessToken, { accentId: "iphone-f77e2d" });
  assert(result.response.status === 200 &&
    result.json.user.accentId === "iphone-f77e2d", "Native accent must round-trip through AERTEX ID");
  assert(mutations === 2, "Expected one color metadata mutation");


  for (const bad of [
    {}, { role: "admin" }, { status: "active" },
    { id: "other", displayName: "Forger" },
    { displayName: "", role: "admin" },
    { displayName: "" }, { displayName: " ".repeat(10) },
    { displayName: "x".repeat(121) },
    { displayName: "hello\nworld" },
    { accentId: "#000000" }, { accentId: "iphone-not-in-palette" },
    { accentId: "iphone-9aadf6", role: "admin" }
  ]) {
    result = await call("PATCH", accessToken, bad);
    assert(result.response.status === 400, "Invalid profile payload must be rejected");
  }
  assert(mutations === 2, "Rejected fields may not reach Supabase");

  profile.status = "suspended";
  result = await call("GET", accessToken);
  assert(result.response.status === 403, "Suspended account must fail closed");
  result = await call("PATCH", accessToken, { displayName: "Bypass" });
  assert(result.response.status === 403 && mutations === 2, "Suspended user cannot mutate profile");

  result = await call("DELETE", accessToken);
  assert(result.response.status === 405, "Unsupported HTTP method must be rejected");

  console.log("Native AERTEX profile API contract tests passed.");
} finally {
  globalThis.fetch = realFetch;
}
