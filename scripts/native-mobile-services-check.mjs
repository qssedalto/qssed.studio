import studioWorker from "../worker.js";
import intelligenceWorker from "../gpt-worker.js";
import watchWorker from "../watch-worker.js";

const userId = "11111111-2222-4333-8444-555555555555";
const conversationId = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const token = "native-test-token";
let active = true;
let queryIds = [];
let storagePrefixes = [];
const originalFetch = globalThis.fetch;

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { "content-type": "application/json" }
});
const storage = {
  list: async options => {
    storagePrefixes.push(options.prefix);
    return { objects: [], truncated: false };
  },
  get: async key => key === `watch/v1/users/${userId}/buckets.json` ? null : null,
  put: async () => {},
  head: async () => null,
  delete: async () => {}
};
const env = { STORAGE: storage, SUPABASE_SECRET_KEY: "test-only-service-secret" };
globalThis.fetch = async (input, options = {}) => {
  const url = new URL(String(input));
  const auth = new Headers(options.headers).get("Authorization") || "";
  if (url.pathname === "/auth/v1/user") {
    if (auth !== `Bearer ${token}`) return json({ error: "unauthorized" }, 401);
    return json({ id: userId, email: "native@example.invalid", user_metadata: {} });
  }
  if (url.pathname === "/rest/v1/profiles") {
    const id = url.searchParams.get("id");
    if (id && id !== `eq.${userId}`) throw new Error("Profile query not scoped to verified user");
    if (url.searchParams.get("select") === "id,status") return json([{ id: userId, status: active ? "active" : "suspended" }]);
    return json([{ status: active ? "active" : "suspended" }]);
  }
  if (url.pathname === "/rest/v1/ai_conversations") {
    const owner = url.searchParams.get("user_id");
    queryIds.push(owner);
    if (owner !== `eq.${userId}`) throw new Error("Intelligence query has wrong user filter");
    if (url.searchParams.get("id")) return json([{ id: conversationId, title: "测试会话", model: "model", is_pinned: false }]);
    return json([{ id: conversationId, title: "测试会话", model: "model", is_pinned: false }]);
  }
  if (url.pathname === "/rest/v1/ai_messages") {
    queryIds.push(url.searchParams.get("user_id"));
    if (url.searchParams.get("conversation_id") !== `eq.${conversationId}`) throw new Error("Wrong conversation");
    return json([{ id: "bbbbbbbb-cccc-4ddd-8eee-ffffffffffff", role: "user", content: "你好" }]);
  }
  throw new Error(`Unexpected network operation: ${url}`);
};

function assert(condition, description) {
  if (!condition) throw new Error(description);
}
async function call(worker, url, method = "GET", bearer = token) {
  const headers = { "user-agent": "AERTEX/2.1.0 (iOS)", Accept: "application/json" };
  if (bearer) headers.Authorization = `Bearer ${bearer}`;
  const response = await worker.fetch(new Request(url, { method, headers }), env);
  assert(!response.headers.has("set-cookie"), "Native endpoints must not emit session cookies");
  assert(response.headers.get("cache-control")?.includes("no-store"), "Native data must not be cached");
  return { status: response.status, body: await response.json() };
}

try {
  const studio = "https://qsseda.com/api/native/studio/overview";
  const intelligence = "https://gpt.qsseda.com/api/native/intelligence/conversations";
  const watch = "https://aw.qsseda.com/api/native/watch/status";

  for (const [worker, url] of [[studioWorker, studio], [intelligenceWorker, intelligence], [watchWorker, watch]]) {
    let response = await call(worker, url, "GET", "");
    assert(response.status === 401, "Missing Bearer must be 401");
    response = await call(worker, url, "GET", "forged-token");
    assert(response.status === 401, "Forged Bearer must be rejected");
    response = await call(worker, url, "POST");
    assert(response.status === 405, "Native read endpoints must reject mutations");
  }

  let response = await call(studioWorker, studio);
  assert(response.status === 200 && response.body.scope === "own", "Studio workbench must return personal overview");
  assert(response.body.counts.open_tasks === 0, "Studio counts mismatch");
  assert(storagePrefixes.every(prefix => prefix.includes(userId)), "Studio storage keys must be user-scoped");

  response = await call(intelligenceWorker, intelligence);
  assert(response.status === 200 && response.body[0].id === conversationId, "Intelligence history must load");
  response = await call(intelligenceWorker, intelligence + "/" + conversationId);
  assert(response.status === 200 && response.body.messages[0].content === "你好", "Intelligence messages must load");
  assert(queryIds.every(id => id === `eq.${userId}`), "AI queries must enforce verified user filter");
  response = await call(intelligenceWorker, intelligence + "/../../admin");
  assert(response.status === 404, "Unknown native Intelligence routes must not proxy");

  response = await call(watchWorker, watch);
  assert(response.status === 200 && Object.keys(response.body.buckets).length === 0, "Watch status should show empty sync sources");
  response = await call(watchWorker, "https://awd.qsseda.com/api/native/watch/status");
  assert(response.status === 404, "Watch upload host must never reveal private data");

  active = false;
  for (const [worker, url] of [[studioWorker, studio], [intelligenceWorker, intelligence], [watchWorker, watch]]) {
    response = await call(worker, url);
    assert(response.status === 403, "Suspended account must be denied by native gate");
  }
  console.log("Studio, Intelligence and Watch native bearer API tests passed.");
} finally {
  globalThis.fetch = originalFetch;
}
