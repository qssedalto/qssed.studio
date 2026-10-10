import workWorker from "../worker.js";
import cashWorker from "../cash-worker.js";

const userId = "11111111-2222-4333-8444-555555555555";
const bearer = "aertex-native-test-token";
const sourceFetch = globalThis.fetch;
const dataStore = new Map();
let accountActive = true;
let revision = 0;
const json = (value, status = 200) => new Response(JSON.stringify(value), {
  status, headers: { "content-type": "application/json" }
});
const assert = (truth, text) => { if (!truth) throw new Error(text); };

const STORAGE = {
  get: async key => {
    const item = dataStore.get(key);
    return item ? {
      etag: item.etag, uploaded: new Date(), text: async () => item.body,
      customMetadata: item.customMetadata
    } : null;
  },
  list: async options => ({
    objects: [...dataStore]
      .filter(([key]) => key.startsWith(options.prefix))
      .map(([key,v]) => ({ key, customMetadata: v.customMetadata })),
    truncated: false
  }),
  put: async (key, body, options = {}) => {
    const previous = dataStore.get(key);
    if (options.onlyIf?.etagMatches && previous?.etag !== options.onlyIf.etagMatches) return null;
    if (options.onlyIf?.etagDoesNotMatch === "*" && previous) return null;
    const etag = "revision-" + ++revision;
    dataStore.set(key, { body, etag, customMetadata: options.customMetadata || {} });
    return { etag };
  },
  head: async key => dataStore.has(key) ? { key } : null,
  delete: async key => dataStore.delete(key)
};
const env = { STORAGE, SUPABASE_SECRET_KEY: "test-only" };
globalThis.fetch = async (input, opts = {}) => {
  const u = new URL(String(input));
  const auth = new Headers(opts.headers).get("Authorization");
  if (u.pathname === "/auth/v1/user") {
    return auth === "Bearer " + bearer
      ? json({ id: userId, email: "person@example.invalid", user_metadata: {} })
      : json({ error: "invalid_token" }, 401);
  }
  if (u.pathname === "/rest/v1/profiles") {
    return json([{ id: userId, status: accountActive ? "active" : "suspended" }]);
  }
  throw new Error("Unexpected external request: " + u);
};

async function request(worker, url, method = "GET", body, token = bearer, extra = {}) {
  const headers = { Accept: "application/json", ...extra };
  if (token) headers.Authorization = "Bearer " + token;
  if (body) headers["Content-Type"] = "application/json";
  const result = await worker.fetch(new Request(url, {
    method, headers, ...(body ? { body: JSON.stringify(body) } : {})
  }), env);
  assert(!result.headers.has("set-cookie"), "Native endpoints may not emit cookies");
  assert(result.headers.get("cache-control")?.includes("no-store"), "Native data may not be cached");
  return { status: result.status, body: await result.json() };
}

try {
  const work = "https://qsseda.com/api/native/work/documents";
  const cash = "https://cash.qsseda.com/api/native/cash/data";
  const cashTx = "https://cash.qsseda.com/api/native/cash/transactions";
  for (const [worker,path] of [[workWorker,work],[cashWorker,cash]]) {
    assert((await request(worker,path,"GET",null,"")).status === 401, "Missing bearer must fail");
    assert((await request(worker,path,"GET",null,"fake")).status === 401, "Invalid bearer must fail");
  }

  let result = await request(workWorker, work);
  assert(result.status === 200 && result.body.documents.length === 0, "Work starts with empty personal list");
  const draft = { title:"原生 Work", engine:"xelatex", source:"\\documentclass{article}\\begin{document}Hello\\end{document}" };
  result = await request(workWorker, work, "POST", draft);
  assert(result.status === 201 && result.body.document.owner_id === userId, "Work new doc owner must be verified");
  const id = result.body.document.id;
  const etag = result.body.etag;
  assert((await request(workWorker,work+"?id="+id)).body.document.source === draft.source, "Native TeX must load cloud source");
  result = await request(workWorker,work+"?id="+id,"PUT",{...draft,source:"Updated source"},bearer,{"If-Match":etag});
  assert(result.status === 200 && result.body.document.source === "Updated source", "Work edit should persist");
  assert((await request(workWorker,work+"?id="+id,"PUT",draft,bearer,{"If-Match":etag})).status === 409,
    "Stale document version must not overwrite other editors");
  assert((await request(workWorker,work+"?id=aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee")).status === 404,
    "Work cannot access arbitrary identifiers");
  assert((await request(workWorker,work,"POST",{...draft,engine:"unsafe"})).status === 400,
    "Work engine must be allowlisted");

  result = await request(cashWorker,cash);
  assert(result.status === 200 && result.body.initialized === false, "Cash empty account read must be safe");
  const tx = { date:"2026-10-10",type:"expense",amount:12.50,category:"food",note:"lunch" };
  result = await request(cashWorker,cashTx,"POST",tx);
  assert(result.status === 201 && result.body.transaction.amount === 12.5, "Cash real transaction must be saved");
  result = await request(cashWorker,cash);
  assert(result.status === 200 && result.body.data.transactions.length === 1, "Cash ledger must persist");
  const cashKey = "cash/users/" + userId + "/data.json";
  const stored = JSON.parse(dataStore.get(cashKey).body);
  stored.plannedEvents = [{ id:"plan-1",amount:100,type:"expense",date:"2026-10-11" }];
  dataStore.get(cashKey).body = JSON.stringify(stored);
  assert((await request(cashWorker,cashTx,"POST",{...tx,type:"income",category:"salary"})).status === 201,
    "Cash income records must be added");
  assert(JSON.parse(dataStore.get(cashKey).body).plannedEvents.length === 1,
    "Native transactions must preserve existing plans");
  assert((await request(cashWorker,cashTx,"POST",{...tx,amount:-5})).status === 400,
    "Negative Cash amount must be rejected");
  assert((await request(cashWorker,cashTx,"POST",{...tx,date:"2031-01-01"})).status === 400,
    "Cash future/out-of-range transactions must be rejected");

  accountActive = false;
  for (const [worker,path] of [[workWorker,work],[cashWorker,cash]]) {
    assert((await request(worker,path)).status === 403, "Suspended AERTEX account must fail closed");
  }
  assert([...dataStore.keys()].every(key => key.includes(userId)),
    "Native Work/Cash must never write outside account-scoped storage");
  console.log("Native Work/Cash read/write, concurrency and authorization checks passed.");
} finally {
  globalThis.fetch = sourceFetch;
}
