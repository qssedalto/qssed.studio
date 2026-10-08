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
const objects = new Map();
const storage = {
  list: async options => {
    storagePrefixes.push(options.prefix);
    return { objects: [...objects].filter(([key]) => key.startsWith(options.prefix)).map(([key,value]) => ({
      key,customMetadata:value.metadata || {},uploaded:new Date(),size:value.value.length
    })), truncated: false };
  },
  get: async key => objects.has(key) ? { text: async () => objects.get(key).value } : null,
  put: async (key,value,options = {}) => { objects.set(key,{value:String(value),metadata:options.customMetadata||{}}); },
  head: async key => objects.has(key) ? {key} : null,
  delete: async key => { objects.delete(key); }
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
async function call(worker, url, method = "GET", bearer = token, values = undefined) {
  const headers = { "user-agent": "AERTEX/2.2.0 (iOS)", Accept: "application/json" };
  if (bearer) headers.Authorization = `Bearer ${bearer}`;
  if (values !== undefined) headers["content-type"]="application/json";
  const response = await worker.fetch(new Request(url, { method, headers, ...(values === undefined ? {} : {body:JSON.stringify(values)}) }), env);
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

  // Real mobile Studio mutations must reuse owner-prefixed R2 project/task engines.
  const projectURL = "https://qsseda.com/api/native/studio/projects";
  const taskURL = "https://qsseda.com/api/native/studio/tasks";
  response = await call(studioWorker, projectURL, "POST", token, {name:"iOS native project",status:"active",priority:"normal"});
  assert(response.status === 201 && response.body.project?.owner_id === userId, "Native project creation must be scoped");
  const createdProjectId = response.body.project.id;
  response = await call(studioWorker, taskURL, "POST", token, {
    title:"Native task",project_id:createdProjectId,status:"todo",priority:"normal"
  });
  assert(response.status === 201 && response.body.task?.owner_id === userId, "Native task creation must be scoped");
  const createdTaskId = response.body.task.id;
  response = await call(studioWorker, taskURL + "?id=" + createdTaskId, "PUT", token, {
    title:"Native task",project_id:createdProjectId,status:"done",priority:"normal"
  });
  assert(response.status === 200 && response.body.task?.status === "done", "Native task update must persist");
  response = await call(studioWorker, taskURL);
  assert(response.status === 200 && response.body.tasks?.length === 1, "Native task list should reflect saved tasks");
  response = await call(studioWorker, projectURL+"?id=aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee");
  assert(response.status === 404, "Other-user project IDs cannot escape scoped R2 prefix");
  assert([...objects.keys()].every(key => key.includes("/"+userId+"/")), "Studio must never write another user's storage prefix");

  response = await call(intelligenceWorker, intelligence);
  assert(response.status === 200 && response.body[0].id === conversationId, "Intelligence history must load");
  response = await call(intelligenceWorker, intelligence + "/" + conversationId);
  assert(response.status === 200 && response.body.messages[0].content === "你好", "Intelligence messages must load");
  assert(queryIds.every(id => id === `eq.${userId}`), "AI queries must enforce verified user filter");
  response = await call(intelligenceWorker, intelligence + "/not-a-uuid");
  assert(response.status === 404, "Unknown native Intelligence routes must not proxy");

  response = await call(watchWorker, watch);
  assert(response.status === 200 && Object.keys(response.body.buckets).length === 0, "Watch status should show empty sync sources");
  response = await call(watchWorker, "https://awd.qsseda.com/api/native/watch/status");
  assert(response.status === 404, "Watch upload host must never reveal private data");

  const bucketId = "aw-watcher-window_test";
  const moment = new Date(Date.now()-60000).toISOString();
  const utcDay = moment.slice(0,10);
  const bucketKey = "watch/v1/users/"+userId+"/buckets/index.json";
  const eventKey = "watch/v1/users/"+userId+"/buckets/"+bucketId+"/days/"+utcDay+".json";
  objects.set(bucketKey,{value:JSON.stringify({[bucketId]:{id:bucketId,hostname:"Test Computer",type:"currentwindow"}})});
  objects.set(eventKey,{value:JSON.stringify([{id:1,timestamp:moment,duration:20,data:{app:"Test App",title:"Test Window"}}])});
  response = await call(watchWorker,"https://aw.qsseda.com/api/native/watch/buckets");
  assert(response.status===200 && response.body[bucketId]?.hostname==="Test Computer", "Native Watch bucket read must use authenticated account");
  response = await call(watchWorker,"https://aw.qsseda.com/api/native/watch/buckets/"+bucketId+"/events?limit=5");
  assert(response.status===200 && response.body[0]?.data?.app==="Test App", "Native Watch event query must reuse bounded R2 day slices");
  response = await call(watchWorker,"https://awd.qsseda.com/api/native/watch/buckets");
  assert(response.status===404, "Watch data host must not expose native read APIs");

  active = false;
  for (const [worker, url] of [[studioWorker, studio], [intelligenceWorker, intelligence], [watchWorker, watch]]) {
    response = await call(worker, url);
    assert(response.status === 403, "Suspended account must be denied by native gate");
  }
  console.log("Studio, Intelligence and Watch native bearer API tests passed.");
} finally {
  globalThis.fetch = originalFetch;
}
