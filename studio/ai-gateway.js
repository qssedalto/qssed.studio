import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";

const enc = new TextEncoder(), dec = new TextDecoder();

export async function handleAiApi(request, env, session) {
  const url = new URL(request.url), path = url.pathname;
  if (path === "/api/ai/config" && request.method === "GET") return userConfig(session);
  if (path === "/api/ai/conversations" && request.method === "GET") return rest(session, "/ai_conversations?select=id,title,model,created_at,updated_at&order=updated_at.desc&limit=50");
  if (path === "/api/ai/chat" && request.method === "POST") return chat(request, env, session);
  return json({error:"AI route not found."},404);
}

export async function handleAiAdminApi(request, env, session) {
  const url = new URL(request.url), path = url.pathname;
  const admin = await rpc(session, "is_admin", {});
  if (!admin.ok || admin.data !== true) return json({error:"Administrator access required."},403);
  if (path === "/api/ai/admin/state" && request.method === "GET") {
    const state = await rpc(session,"get_ai_admin_state",{});
    return json(state.ok ? state.data : {error:"Unable to load AI administration."}, state.ok?200:502);
  }
  if (path === "/api/ai/admin/provider" && request.method === "POST") {
    if (!sameOrigin(request)) return json({error:"Invalid origin."},403);
    if (!env.AI_CREDENTIAL_KEY) return json({error:"AI_CREDENTIAL_KEY Worker secret is not configured."},503);
    const b=await body(request), key=clean(b.api_key,500);
    if(!key || !String(b.name||"").trim()) return json({error:"Provider name and API key are required."},400);
    const encrypted=await encrypt(key,env.AI_CREDENTIAL_KEY);
    const row={name:String(b.name).trim().slice(0,80),provider:"openai",base_url:"https://api.openai.com",encrypted_api_key:encrypted.cipher,api_key_iv:encrypted.iv,key_hint:key.slice(-4),default_model:cleanModel(b.default_model)||"gpt-5.6",allowed_models:models(b.allowed_models),monthly_budget_usd:numOrNull(b.monthly_budget_usd),input_price_per_million:numOrZero(b.input_price_per_million),output_price_per_million:numOrZero(b.output_price_per_million),is_active:b.is_active!==false,created_by:session.user.id};
    const r=await rest(session,"/ai_providers",{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify(row)});
    return r;
  }
  if (path === "/api/ai/admin/access" && request.method === "POST") {
    if (!sameOrigin(request)) return json({error:"Invalid origin."},403);
    const b=await body(request);
    if(!uuid(b.user_id) || (b.provider_id && !uuid(b.provider_id))) return json({error:"Invalid user or provider."},400);
    const row={user_id:b.user_id,provider_id:b.provider_id||null,enabled:Boolean(b.enabled),allowed_models:models(b.allowed_models),daily_limit_usd:numOrNull(b.daily_limit_usd),monthly_limit_usd:numOrNull(b.monthly_limit_usd),requests_per_minute:Math.max(1,Math.min(300,Number(b.requests_per_minute)||20)),updated_by:session.user.id,updated_at:new Date().toISOString()};
    return rest(session,"/ai_user_access?on_conflict=user_id",{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=representation"},body:JSON.stringify(row)});
  }
  return json({error:"AI administrator route not found."},404);
}

async function userConfig(session){
  const r=await rpc(session,"get_ai_runtime_config",{});
  if(!r.ok)return json({enabled:false,error:"AI access is not enabled."},403);
  const a=r.data.access,p=r.data.provider;
  return json({enabled:true,provider:{id:p.id,name:p.name},models:(a.allowed_models?.length?a.allowed_models:p.allowed_models)||[],default_model:p.default_model,usage:r.data.usage,limits:{daily:a.daily_limit_usd,monthly:a.monthly_limit_usd,rpm:a.requests_per_minute}});
}

async function chat(request,env,session){
  if(!sameOrigin(request))return json({error:"Invalid origin."},403);
  if(!env.AI_CREDENTIAL_KEY)return json({error:"AI service is not configured."},503);
  const b=await body(request), message=String(b.message||"").trim();
  if(!message || message.length>30000)return json({error:"Message is empty or too long."},400);
  const cfg=await rpc(session,"get_ai_runtime_config",{});
  if(!cfg.ok)return json({error:"AI access is not enabled for this account."},403);
  const a=cfg.data.access,p=cfg.data.provider,u=cfg.data.usage;
  if(a.daily_limit_usd!=null && Number(u.today_usd)>=Number(a.daily_limit_usd))return json({error:"Daily AI quota reached."},429);
  if(a.monthly_limit_usd!=null && Number(u.month_usd)>=Number(a.monthly_limit_usd))return json({error:"Monthly AI quota reached."},429);
  if(Number(u.minute_requests)>=Number(a.requests_per_minute||20))return json({error:"AI request rate limit reached."},429);
  const allowed=(a.allowed_models?.length?a.allowed_models:p.allowed_models)||[];
  const model=cleanModel(b.model)||p.default_model;
  if(!allowed.includes(model))return json({error:"This model is not enabled for your account."},403);
  let conversationId=uuid(b.conversation_id)?b.conversation_id:null;
  if(!conversationId){
    const created=await restData(session,"/ai_conversations",{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify({user_id:session.user.id,provider_id:p.id,model,title:message.slice(0,80)})});
    if(!created.ok||!created.data?.[0]?.id)return json({error:"Unable to create conversation."},502);
    conversationId=created.data[0].id;
  }
  const history=await restData(session,`/ai_messages?conversation_id=eq.${conversationId}&select=role,content&order=created_at.asc&limit=40`);
  if(!history.ok)return json({error:"Unable to load conversation."},502);
  await restData(session,"/ai_messages",{method:"POST",body:JSON.stringify({conversation_id:conversationId,user_id:session.user.id,role:"user",content:message})});
  let apiKey; try{apiKey=await decrypt(p.encrypted_api_key,p.api_key_iv,env.AI_CREDENTIAL_KEY)}catch{return json({error:"AI provider credential cannot be decrypted."},503)}
  const input=[...(history.data||[]).map(x=>({role:x.role,content:x.content})),{role:"user",content:message}];
  const upstream=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json",Accept:"text/event-stream"},body:JSON.stringify({model,input,stream:true})});
  if(!upstream.ok){const detail=await upstream.text();return json({error:"OpenAI request failed.",detail:detail.slice(0,300)},upstream.status===429?429:502)}
  const reader=upstream.body.getReader(), decoder=new TextDecoder(), encoder=new TextEncoder();
  let full="", buffer="", inputTokens=0, outputTokens=0, responseId="";
  const stream=new ReadableStream({async start(controller){
    const emit=(event,data)=>controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
    emit("meta",{conversation_id:conversationId,model});
    try{
      while(true){const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});let i;while((i=buffer.indexOf("\n\n"))>=0){const block=buffer.slice(0,i);buffer=buffer.slice(i+2);for(const line of block.split("\n")){if(!line.startsWith("data:"))continue;const raw=line.slice(5).trim();if(!raw||raw==="[DONE]")continue;let e;try{e=JSON.parse(raw)}catch{continue}
        if(e.type==="response.output_text.delta"&&e.delta){full+=e.delta;emit("delta",{delta:e.delta});}
        if(e.type==="response.completed"){responseId=e.response?.id||"";inputTokens=Number(e.response?.usage?.input_tokens)||0;outputTokens=Number(e.response?.usage?.output_tokens)||0;}
        if(e.type==="error")throw new Error(e.error?.message||"OpenAI stream error");
      }}}
      const cost=(inputTokens/1e6)*Number(p.input_price_per_million||0)+(outputTokens/1e6)*Number(p.output_price_per_million||0);
      if(full)await restData(session,"/ai_messages",{method:"POST",body:JSON.stringify({conversation_id:conversationId,user_id:session.user.id,role:"assistant",content:full,provider_response_id:responseId,input_tokens:inputTokens,output_tokens:outputTokens})});
      await restData(session,"/ai_usage",{method:"POST",body:JSON.stringify({user_id:session.user.id,provider_id:p.id,conversation_id:conversationId,model,input_tokens:inputTokens,output_tokens:outputTokens,estimated_cost_usd:cost,request_id:responseId})});
      await restData(session,`/ai_conversations?id=eq.${conversationId}`,{method:"PATCH",body:JSON.stringify({updated_at:new Date().toISOString()})});
      emit("done",{conversation_id:conversationId,input_tokens:inputTokens,output_tokens:outputTokens,estimated_cost_usd:cost});controller.close();
    }catch(e){emit("error",{error:String(e?.message||"Stream failed").slice(0,240)});controller.close();}
  }});
  return new Response(stream,{headers:{"content-type":"text/event-stream;charset=UTF-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
}

async function rpc(session,name,params){const r=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:"POST",headers:auth(session,{"Content-Type":"application/json"}),body:JSON.stringify(params)});let data=null;try{data=await r.json()}catch{}return{ok:r.ok,status:r.status,data};}
async function restData(session,path,opt={}){const r=await fetch(SUPABASE_URL+"/rest/v1"+path,{...opt,headers:auth(session,{"Content-Type":"application/json",Accept:"application/json",...(opt.headers||{})})});let data=null;try{data=await r.json()}catch{}return{ok:r.ok,status:r.status,data};}
async function rest(session,path,opt={}){const r=await restData(session,path,opt);return json(r.ok?r.data:{error:r.data?.message||"Database request failed."},r.ok?200:(r.status||502));}
function auth(session,extra={}){return{apikey:SUPABASE_KEY,Authorization:`Bearer ${session.accessToken}`,...extra};}
async function body(r){try{return await r.json()}catch{return{}}} function sameOrigin(r){const u=new URL(r.url);return(r.headers.get("Origin")||"")===u.origin}
function models(v){return[...new Set((Array.isArray(v)?v:String(v||"").split(",")).map(cleanModel).filter(Boolean))].slice(0,30)}
function cleanModel(v){const s=String(v||"").trim();return/^[a-zA-Z0-9._:-]{1,100}$/.test(s)?s:""} function clean(v,n){const s=String(v||"").trim();return s.length<=n?s:""}
function numOrNull(v){if(v===""||v==null)return null;const n=Number(v);return Number.isFinite(n)&&n>=0?n:null} function numOrZero(v){return numOrNull(v)||0}
function uuid(v){return/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v||""))}
function b64(bytes){let s="";for(const b of bytes)s+=String.fromCharCode(b);return btoa(s)} function unb64(s){const x=atob(s);return Uint8Array.from(x,c=>c.charCodeAt(0))}
async function cryptoKey(secret){return crypto.subtle.importKey("raw",await crypto.subtle.digest("SHA-256",enc.encode(secret)),{name:"AES-GCM"},false,["encrypt","decrypt"])}
async function encrypt(value,secret){const iv=crypto.getRandomValues(new Uint8Array(12)),key=await cryptoKey(secret),out=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,enc.encode(value));return{cipher:b64(new Uint8Array(out)),iv:b64(iv)}}
async function decrypt(cipher,iv,secret){const key=await cryptoKey(secret),out=await crypto.subtle.decrypt({name:"AES-GCM",iv:unb64(iv)},key,unb64(cipher));return dec.decode(out)}
function json(d,s=200){return new Response(JSON.stringify(d),{status:s,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store","x-content-type-options":"nosniff"}})}
