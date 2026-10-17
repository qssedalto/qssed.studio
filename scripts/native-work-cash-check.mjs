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
  const cashPlanning = "https://cash.qsseda.com/api/native/cash/planning";
  const cashPlans = "https://cash.qsseda.com/api/native/cash/plans";
  const cashForecast = "https://cash.qsseda.com/api/native/cash/forecast";
  for (const [worker,path] of [[workWorker,work],[cashWorker,cash],[cashWorker,cashPlanning],[cashWorker,cashForecast],[cashWorker,cashPlans]]) {
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
result = await request(workWorker, work+"?id="+id+"&view=versions");
  assert(result.status === 200 && result.body.document_id === id &&
    result.body.versions.length >= 1,
    "Native Work should return real version summaries for owned documents");
  assert(result.body.versions.every(v => v.document_id === id &&
    !("source" in v) && !("pdf" in v)),
    "Native Work versions cannot expose source or binary result blobs");
  assert((await request(workWorker,work+"?id=aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee&view=versions")).status === 404,
    "Work versions must not reveal another user's documents");
  assert((await request(workWorker,work+"?id="+id+"&view=versions","DELETE")).status === 405,
    "Version-history endpoint must remain read-only");
  assert((await request(workWorker,work+"?id=aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee")).status === 404,
    "Work cannot access arbitrary identifiers");
  assert((await request(workWorker,work,"POST",{...draft,engine:"unsafe"})).status === 400,
    "Work engine must be allowlisted");

  result = await request(cashWorker,cash);
  assert(result.status === 200 && result.body.initialized === false, "Cash empty account read must be safe");
  const tx = { date:"2026-10-10",type:"expense",amount:12.50,category:"food",note:"lunch" };
  result = await request(cashWorker,cashTx,"POST",tx);
  if (result.status !== 201) console.log("Cash create diagnostic:", JSON.stringify(result));
  assert(result.status === 201 && result.body.transaction.amount === 12.5, "Cash real transaction must be saved");
  result = await request(cashWorker,cash);
  assert(result.status === 200 && result.body.data.transactions.length === 1, "Cash ledger must persist");
  const cashKey = "cash/users/" + userId + "/data.json";
  const stored = JSON.parse(dataStore.get(cashKey).body);
  stored.plannedEvents = [{ id:"plan-1",amount:100,type:"expense",date:"2026-10-11" }];
  stored.expectedEvents = [{ id:"expected-1",type:"income",amount:500,expectedMonth:"2026-11",enabled:true }];
  stored.recurringExpenses = [{ id:"recurring-1",name:"云服务",amount:38,category:"otherExpense",frequency:"monthly",dayOfMonth:17,enabled:true }];
  dataStore.get(cashKey).body = JSON.stringify(stored);
  assert((await request(cashWorker,cashTx,"POST",{...tx,type:"income",category:"salary"})).status === 201,
    "Cash income records must be added");
  assert(JSON.parse(dataStore.get(cashKey).body).plannedEvents.length === 1,
    "Native transactions must preserve existing plans");
  result = await request(cashWorker, cashPlanning);
  assert(result.status === 200 && result.body.plannedEvents[0].amount === 100,
    "Native planning API must expose only the authenticated user's dated plans");
  assert(result.body.expectedEvents[0].amount === 500 &&
    result.body.recurringExpenses[0].name === "云服务",
    "Native planning must preserve undated and monthly plans");
  assert(!("transactions" in result.body), "Planning endpoint must not return unrelated full ledger");
  assert((await request(cashWorker,cashPlanning,"POST",{id:"bad"})).status === 405,
    "Planning API must reject writes");
  assert((await request(cashWorker,cashPlanning,"GET",null,"fake")).status === 401,
    "Planning API must reject forged bearer tokens");

  result = await request(cashWorker, cashForecast);
  const canonical = globalThis.CashflowModel.calculateFinancialModel(
    JSON.parse(dataStore.get(cashKey).body)
  );
  assert(result.status === 200 &&
    result.body.actual_cash === canonical.ledger.cashBalance &&
    result.body.projected_end_balance === canonical.forecast.endBalance,
    "Native forecast must EXACTLY match the live Cash website model");
  assert(result.body.components.expected_net === canonical.forecast.components.expectedNet &&
    result.body.components.fixed_reserve === canonical.forecast.components.fixedReserve,
    "Native forecast must match website reserve and undated expectations");
  assert(result.body.daily.length === canonical.forecast.daily.length &&
    result.body.monthly.length === canonical.monthly.length,
    "Native forecast must preserve website daily/monthly trajectories");
  assert(!("transactions" in result.body) && !("data" in result.body),
    "Native forecast response must omit the full private ledger");
  assert((await request(cashWorker,cashForecast,"POST",{foo:1})).status === 405,
    "Forecast endpoint must reject mutations");
  assert((await request(cashWorker,cashForecast,"GET",null,"fake")).status === 401,
    "Forecast endpoint must reject invalid bearer tokens");

  // Real native edit operations must preserve the website's complete ledger,
  // reject concurrent edits, and cannot mutate other account namespaces.
  const originalTxCount = JSON.parse(dataStore.get(cashKey).body).transactions.length;
  let planning = await request(cashWorker, cashPlanning);
  assert(typeof planning.body.etag === "string" && planning.body.etag.length > 0,
    "Cash planning must expose the exact R2 ETag for safe optimistic updates");
  const dated = {
    date:"2026-10-12",type:"expense",amount:23.45,
    category:"food",note:"iOS daily plan",enabled:true
  };
  assert((await request(cashWorker,cashPlans+"?kind=dated","POST",dated)).status === 428,
    "Plan create must require exact ETag");
  const created = await request(cashWorker,cashPlans+"?kind=dated","POST",dated,bearer,{"If-Match":planning.body.etag});
  assert(created.status === 201 && created.body.item.id.startsWith("native-"),
    "Native dated plan must be created");
  const nativePlanId = created.body.item.id;
  assert((await request(cashWorker,cashPlans+"?kind=dated","POST",dated,bearer,{"If-Match":planning.body.etag})).status === 409,
    "Stale plan create must not replace an updated ledger");
  assert((await request(cashWorker,cashPlans+"?kind=dated&id="+nativePlanId,"PUT",
    {...dated,amount:40},bearer,{"If-Match":created.body.etag})).status === 200,
    "Native plan update must preserve original source");
  planning = await request(cashWorker,cashPlanning);
  assert(planning.body.plannedEvents.some(item => item.id === nativePlanId && item.amount === 40),
    "Updated plan must appear in the same website source");
  const expected = {
    expectedMonth:"2026-11",type:"income",amount:330,
    category:"salary",note:"next month",enabled:true
  };
  let createdExpected = await request(cashWorker,cashPlans+"?kind=expected","POST",
    expected,bearer,{"If-Match":planning.body.etag});
  assert(createdExpected.status === 201 && createdExpected.body.item.expectedMonth === "2026-11",
    "Native expected-month plan create must succeed");
  const recurring = {
    name:"iCloud Plus",category:"installment",amount:6,
    dayOfMonth:12,reserveWhenUndated:true,enabled:true
  };
  let createdRecurring = await request(cashWorker,cashPlans+"?kind=recurring","POST",
    recurring,bearer,{"If-Match":createdExpected.body.etag});
  assert(createdRecurring.status === 201 && createdRecurring.body.item.frequency === "monthly",
    "Native recurring monthly plan must preserve website model schema");
  const modifiedRecurring = await request(cashWorker,cashPlans+"?kind=recurring&id="+createdRecurring.body.item.id,
    "PUT",{...recurring,enabled:false},bearer,{"If-Match":createdRecurring.body.etag});
  assert(modifiedRecurring.status === 200 && modifiedRecurring.body.item.enabled === false,
    "Native monthly plan must support disabling without rewriting transactions");
  const removed = await request(cashWorker,cashPlans+"?kind=dated&id="+nativePlanId,
    "DELETE",null,bearer,{"If-Match":modifiedRecurring.body.etag});
  assert(removed.status === 200,
    "Native dated plan removal must require a matching current ETag");
  assert((await request(cashWorker,cashPlans+"?kind=expected","POST",
    {...expected,amount:-3},bearer,{"If-Match":removed.body.etag})).status === 400,
    "Native plans must reject negative values");
  assert((await request(cashWorker,cashPlans+"?kind=expected","POST",
    {...expected,note:"bad", owner_id:"intruder"},bearer,{"If-Match":removed.body.etag})).status === 400,
    "Native plans must reject injected owner identity");
  assert((await request(cashWorker,cashPlans+"?kind=dated","POST",
    {...dated,date:"2026-02-30"},bearer,{"If-Match":removed.body.etag})).status === 400,
    "Native plans must reject invalid calendar dates");
  assert((await request(cashWorker,cashPlans+"?kind=recurring","POST",
    {...recurring,dayOfMonth:32},bearer,{"If-Match":removed.body.etag})).status === 400,
    "Native plans must reject impossible monthly payment dates");
  const updatedLedger = JSON.parse(dataStore.get(cashKey).body);
  assert(updatedLedger.transactions.length === originalTxCount &&
    updatedLedger.expectedEvents.some(item => item.id === createdExpected.body.item.id) &&
    updatedLedger.recurringExpenses.some(item => item.id === createdRecurring.body.item.id && !item.enabled),
    "Native edits must preserve actual transactions and unrelated financial lists");
  assert((await request(cashWorker,cashPlans+"?kind=dated","POST",dated,"fake",
    {"If-Match":removed.body.etag})).status === 401,
    "Plan write must reject forged Bearer tokens");
  assert((await request(cashWorker,cashPlans+"?kind=dated","GET")).status === 405,
    "Plan mutation route does not expose unguarded reads");
  assert((await request(cashWorker,cashTx,"POST",{...tx,amount:-5})).status === 400,
    "Negative Cash amount must be rejected");
  assert((await request(cashWorker,cashTx,"POST",{...tx,date:"2031-01-01"})).status === 400,
    "Cash future/out-of-range transactions must be rejected");

  accountActive = false;
  for (const [worker,path] of [[workWorker,work],[cashWorker,cash],[cashWorker,cashPlanning],[cashWorker,cashForecast],[cashWorker,cashPlans]]) {
    assert((await request(worker,path)).status === 403, "Suspended AERTEX account must fail closed");
  }
  assert([...dataStore.keys()].every(key => key.includes(userId)),
    "Native Work/Cash must never write outside account-scoped storage");
  console.log("Native Work/Cash read/write, concurrency and authorization checks passed.");
} finally {
  globalThis.fetch = sourceFetch;
}
