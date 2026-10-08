import intelligence from "../gpt-worker.js";

const origin = "https://gpt.qsseda.com";
const id = "11111111-2222-4333-8444-555555555555";
const conversationId = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const token = "native-intelligence-test-token";
let profileActive = true;
let ownerFilters = [];
const originalFetch = globalThis.fetch;
const output = (value, status = 200) => new Response(JSON.stringify(value), {
  status, headers: { "content-type": "application/json" }
});
const user = { id, email: "native-tests@example.invalid" };

globalThis.fetch = async (input, init = {}) => {
  const url = new URL(String(input));
  const auth = new Headers(init.headers).get("authorization");
  if (auth !== "Bearer " + token) return output({error:"unauthorized"},401);
  if (url.pathname === "/auth/v1/user") return output(user);
  if (url.pathname === "/rest/v1/profiles") return output([{id,status:profileActive ? "active":"suspended"}]);
  if (url.pathname === "/rest/v1/rpc/get_ai_runtime_config") {
    return output({
      access:{ daily_limit_usd:10, monthly_limit_usd:100, requests_per_minute:20 },
      usage:{today_usd:0,month_usd:0,today_tokens:0,month_tokens:0,minute_requests:0},
      providers:[{id:"eeeeeeee-2222-4333-8444-555555555555",name:"Test model",provider:"bailian",allowed_models:["qwen3.7-plus"],default_model:"qwen3.7-plus"}]
    });
  }
  if (url.pathname === "/rest/v1/ai_conversations") {
    ownerFilters.push(url.searchParams.get("user_id"));
    if (url.searchParams.get("id")) return output([{id:conversationId,title:"Existing"}]);
    return output([{id:conversationId,title:"Existing"}]);
  }
  if (url.pathname === "/rest/v1/ai_messages") {
    ownerFilters.push(url.searchParams.get("user_id"));
    return output([{id:"bbbbbbbb-2222-4333-8444-555555555555",role:"assistant",content:"$E=mc^2$"}]);
  }
  throw new Error("Unexpected upstream: " + url.pathname);
};

function check(value, message) { if (!value) throw new Error(message); }
async function call(path, method = "GET", bearer = token, body = undefined) {
  const headers = { accept:"application/json", "user-agent":"AERTEX/2.2.0 (iOS)" };
  if (bearer) headers.Authorization = "Bearer " + bearer;
  if (body !== undefined) headers["content-type"] = "application/json";
  const r = await intelligence.fetch(new Request(origin + path, {
    method,headers,...(body === undefined ? {}:{body: JSON.stringify(body)})
  }),{AI_CREDENTIAL_KEY:"dummy-test-key"});
  check(!r.headers.has("set-cookie"),"No browser session cookies in native API");
  check((r.headers.get("cache-control") || "").includes("no-store"), "No cached private data");
  const data = await r.json();
  return {status:r.status, data};
}

try {
  const base="/api/native/intelligence";
  const config=await call(base + "/config");
  check(config.status===200 && config.data.models?.[0]?.model==="qwen3.7-plus","Native model configuration not served");
  const list=await call(base+"/conversations");
  check(list.status===200 && list.data.length===1,"Native conversation listing failed");
  const detail=await call(base+"/conversations/"+conversationId);
  check(detail.status===200 && detail.data.messages[0].content==="$E=mc^2$","Message/LaTeX payload changed");
  check(ownerFilters.every(v=>v==="eq."+id),"Conversation and messages must remain owner-scoped");
  check((await call(base+"/config","GET","")).status===401,"No token must fail");
  check((await call(base+"/config","GET","forged")).status===401,"Forged bearer must fail");
  check((await call(base+"/conversations","POST")).status===405,"Cannot create conversations via arbitrary route");
  check((await call(base+"/chat","GET")).status===405,"Chat must require POST");
  check((await call(base+"/chat","POST",token,{})).status===400,"Native POST must reach chat payload validation");
  check((await call(base+"/conversations/"+conversationId,"PATCH",token,{})).status===400,"Native PATCH must reach filtered conversation validation");
  check((await call(base+"/conversations/not-a-uuid")).status===404,"Invalid ID must not reach gateway");
  check((await call("/api/ai/chat","POST",token,{})).status===401,"Browser chat must reject token-only cross-origin bypass");
  profileActive=false;
  check((await call(base+"/config")).status===403,"Suspended account must not access models");
  check((await call(base+"/chat","POST",token,{})).status===403,"Suspended account must not spend AI credits");
  console.log("AERTEX native Intelligence authenticated config/chat/ownership contracts pass.");
} finally {
  globalThis.fetch=originalFetch;
}
