export function renderAiAdmin(locale) {
  const zh = locale === "zh-cn";
  const t = zh ? {
    title:"Intelligence 管理", intro:"集中管理 OpenAI 凭据、官方费用、用户权限与配额。",
    add:"添加 OpenAI Provider", name:"名称", key:"Project API Key", adminKey:"OpenAI Admin Key（可选，仅账单）",
    adminHint:"Admin Key 只用于读取 OpenAI Organization Costs，不参与用户聊天。",
    models:"允许模型", def:"默认模型", budget:"AERTEX 月预算（USD）",
    input:"自定义模型输入 $/百万 Token", output:"自定义模型输出 $/百万 Token",
    save:"验证并保存 Provider", saving:"正在验证…", providers:"API Providers", users:"用户授权",
    load:"正在加载…", enabled:"允许使用", provider:"Provider", allowed:"用户可用模型", daily:"日额度 $",
    monthly:"月额度 $", rpm:"RPM", apply:"保存授权", empty:"尚未配置 Provider",
    official:"OpenAI 官方本月费用", local:"AERTEX 本地估算", remaining:"预算剩余", requests:"本月请求",
    billingOn:"官方账单已连接", billingOff:"未配置 Admin Key", saved:"已保存", projectValidated:"Project Key 验证通过",
    noProvider:"请先添加 API Provider。", chooseModels:"选择允许模型", chooseDefault:"选择默认模型", chooseUserModels:"选择用户可用模型", selectedModels:"已选择", modelsUnit:"个模型", cancel:"取消", done:"完成", selectAtLeastOne:"请至少选择一个允许模型。", noAllowedModels:"请先选择允许模型。", checkKey:"检查 Key", checkingKey:"正在检查…", keyOk:"Key 正常", keyNotChecked:"尚未检查 Key", checkKeyFirst:"请先检查 Project API Key。", noModelsForKey:"这个 Project API Key 没有返回可用于对话的模型。"
  } : {
    title:"Intelligence Admin", intro:"Manage OpenAI credentials, official costs, user access, and quotas.",
    add:"Add OpenAI Provider", name:"Name", key:"Project API Key", adminKey:"OpenAI Admin Key (optional, billing only)",
    adminHint:"The Admin Key is used only for OpenAI Organization Costs and is never used for user inference.",
    models:"Allowed models", def:"Default model", budget:"AERTEX monthly budget (USD)",
    input:"Custom model input $ / 1M tokens", output:"Custom model output $ / 1M tokens",
    save:"Validate & save provider", saving:"Validating…", providers:"API Providers", users:"User access",
    load:"Loading…", enabled:"AI access", provider:"Provider", allowed:"User models", daily:"Daily quota $",
    monthly:"Monthly quota $", rpm:"RPM", apply:"Save access", empty:"No provider configured",
    official:"OpenAI official month cost", local:"AERTEX local estimate", remaining:"Budget remaining", requests:"Requests this month",
    billingOn:"Official billing connected", billingOff:"No Admin Key", saved:"Saved", projectValidated:"Project Key validated",
    noProvider:"Add an API provider first.", chooseModels:"Choose allowed models", chooseDefault:"Choose default model", chooseUserModels:"Choose user models", selectedModels:"Selected", modelsUnit:"models", cancel:"Cancel", done:"Done", selectAtLeastOne:"Select at least one allowed model.", noAllowedModels:"Choose allowed models first.", checkKey:"Check Key", checkingKey:"Checking…", keyOk:"Key valid", keyNotChecked:"Key not checked", checkKeyFirst:"Check the Project API Key first.", noModelsForKey:"This Project API Key returned no chat-capable models."
  };

  return `<!doctype html>
<html lang="${zh ? "zh-CN" : "en"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${t.title}</title>
<style>
:root{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;--bg:#f6f6f4;--panel:#fff;--text:#171717;--muted:#747474;--line:#dededb;--soft:#f0f0ed;--good:#18864b;--bad:#b42318}
@media(prefers-color-scheme:dark){:root{--bg:#101010;--panel:#181818;--text:#f4f4f4;--muted:#999;--line:#333;--soft:#202020;--good:#52c986;--bad:#ff766d}}
*{box-sizing:border-box}html,body{max-width:100%;overflow-x:hidden}body{margin:0;background:var(--bg);color:var(--text)}main{width:100%;max-width:1180px;min-width:0;margin:auto;padding:34px 18px 80px}
header{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:18px}h1{font-size:32px;letter-spacing:-.045em;margin:0 0 6px}h2{font-size:18px;margin:0}.intro,.hint{color:var(--muted);font-size:12px;line-height:1.6}.intro{font-size:13px;margin:0}
.card{width:100%;min-width:0;max-width:100%;overflow:hidden;background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:18px;margin:14px 0}.grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;min-width:0}.grid>div{min-width:0}
label{display:block;font-size:12px;color:var(--muted);margin:9px 0 5px}input,select{width:100%;min-width:0;max-width:100%;padding:10px 11px;border:1px solid var(--line);border-radius:10px;background:var(--panel);color:var(--text);outline:none}
input:focus,select:focus{border-color:var(--text)}button{border:0;border-radius:10px;padding:10px 14px;font-weight:650;cursor:pointer}.primary{background:var(--text);color:var(--bg)}button:disabled{opacity:.42;cursor:not-allowed}.keyRow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center}.checkKeyButton{white-space:nowrap;background:var(--soft);color:var(--text);border:1px solid var(--line)}.keyStatus{margin-top:6px;min-height:18px;font-size:12px;color:var(--muted)}.keyStatus.ok{color:var(--good)}.keyStatus.bad{color:var(--bad)}
.pickerButton{width:100%;min-width:0;max-width:100%;min-height:42px;padding:10px 11px;border:1px solid var(--line);border-radius:10px;background:var(--panel);color:var(--text);display:flex;align-items:center;justify-content:space-between;gap:10px;text-align:left;font-weight:500;overflow:hidden}.pickerButton:hover{background:var(--soft)}.pickerValue{display:block;flex:1 1 auto;min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pickerChevron{flex:0 0 auto;color:var(--muted);font-size:16px}
dialog{width:min(520px,calc(100vw - 28px));max-height:min(72vh,680px);padding:0;border:1px solid var(--line);border-radius:18px;background:var(--panel);color:var(--text);box-shadow:0 24px 80px rgba(0,0,0,.22)}dialog::backdrop{background:rgba(0,0,0,.36);backdrop-filter:blur(2px)}.dialogHead{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px;border-bottom:1px solid var(--line)}.dialogHead strong{font-size:17px}.dialogBody{padding:8px 18px 14px;overflow:auto;max-height:50vh}.dialogFoot{display:flex;justify-content:flex-end;gap:8px;padding:12px 18px 16px;border-top:1px solid var(--line)}.dialogFoot .secondaryBtn{background:var(--soft);color:var(--text)}.choice{display:flex;align-items:center;gap:11px;padding:12px 2px;border-bottom:1px solid var(--line);font-size:14px}.choice:last-child{border-bottom:0}.choice input{width:19px;height:19px;margin:0;accent-color:var(--text)}
.sectionHead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}.providerCard{border-top:1px solid var(--line);padding:16px 0}.providerTop{display:flex;align-items:start;justify-content:space-between;gap:14px}.providerName{font-weight:730}.bad{color:var(--bad)}.ok{color:var(--good)}
.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-top:12px}.metric{background:var(--soft);border-radius:12px;padding:11px}.metric span{display:block;color:var(--muted);font-size:11px;margin-bottom:5px}.metric strong{font-size:17px}
.user{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,.8fr) minmax(0,.9fr) minmax(0,1.1fr) minmax(0,.58fr) minmax(0,.58fr) minmax(0,.45fr) auto;gap:8px;align-items:end;border-top:1px solid var(--line);padding:12px 0;min-width:0}.user>*{min-width:0}.userName{align-self:center;min-width:0}.userName strong,.userName .hint{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.status{min-height:20px;margin:5px 0 12px}.pill{display:inline-block;padding:4px 8px;border-radius:999px;background:var(--soft);font-size:11px}
@media(max-width:900px){.metrics{grid-template-columns:1fr 1fr}.user{grid-template-columns:1fr 1fr}.grid{grid-template-columns:1fr}}
@media(max-width:560px){header{display:block}.metrics,.user{grid-template-columns:1fr}}
</style>
</head>
<body>
<main>
<header><div><h1>${t.title}</h1><p class="intro">${t.intro}</p></div><span class="pill">AERTEX Intelligence</span></header>
<div id="msg" class="status hint"></div>

<section class="card">
  <div class="sectionHead"><h2>${t.add}</h2></div>
  <div class="grid">
    <div><label>${t.name}</label><input id="name" value="OpenAI Primary"></div>
    <div><label>${t.key}</label><div class="keyRow"><input id="key" type="password" autocomplete="off" spellcheck="false"><button type="button" class="checkKeyButton" id="checkKey">${t.checkKey}</button></div><div class="keyStatus" id="keyStatus">${t.keyNotChecked}</div></div>
    <div><label>${t.adminKey}</label><input id="adminKey" type="password" autocomplete="off" spellcheck="false"><div class="hint">${t.adminHint}</div></div>
    <div><label>${t.models}</label><button type="button" class="pickerButton" id="modelsPicker" disabled><span class="pickerValue" id="modelsPickerValue"></span><span class="pickerChevron">›</span></button></div>
    <div><label>${t.def}</label><button type="button" class="pickerButton" id="defaultPicker" disabled><span class="pickerValue" id="defaultPickerValue"></span><span class="pickerChevron">›</span></button></div>
    <div><label>${t.budget}</label><input id="budget" type="number" min="0" step=".01"></div>
    <div><label>${t.input}</label><input id="input" type="number" min="0" step=".001" value="4"></div>
    <div><label>${t.output}</label><input id="output" type="number" min="0" step=".001" value="20"></div>
  </div>
  <p><button class="primary" id="saveProvider">${t.save}</button></p>
</section>

<section class="card">
  <div class="sectionHead"><h2>${t.providers}</h2><span class="hint" id="refreshed"></span></div>
  <div id="providers">${t.load}</div>
</section>

<section class="card">
  <div class="sectionHead"><h2>${t.users}</h2></div>
  <div id="users">${t.load}</div>
</section>
</main>

<dialog id="modelsDialog">
  <div class="dialogHead"><strong>${t.chooseModels}</strong></div>
  <div class="dialogBody" id="modelsDialogBody"></div>
  <div class="dialogFoot"><button type="button" class="secondaryBtn" id="modelsCancel">${t.cancel}</button><button type="button" class="primary" id="modelsDone">${t.done}</button></div>
</dialog>

<dialog id="defaultDialog">
  <div class="dialogHead"><strong>${t.chooseDefault}</strong></div>
  <div class="dialogBody" id="defaultDialogBody"></div>
  <div class="dialogFoot"><button type="button" class="secondaryBtn" id="defaultCancel">${t.cancel}</button><button type="button" class="primary" id="defaultDone">${t.done}</button></div>
</dialog>

<dialog id="userModelsDialog">
  <div class="dialogHead"><strong>${t.chooseUserModels}</strong></div>
  <div class="dialogBody" id="userModelsDialogBody"></div>
  <div class="dialogFoot"><button type="button" class="secondaryBtn" id="userModelsCancel">${t.cancel}</button><button type="button" class="primary" id="userModelsDone">${t.done}</button></div>
</dialog>

<script>
const $=id=>document.getElementById(id);
let state={providers:[],users:[]};
let availableProjectModels=[];
let selectedProviderModels=[];
let selectedDefaultModel="";
let projectKeyValidated=false;
const userModelSelections=new Map();
let activeUserModelPicker=null;
const esc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const money=value=>value==null?"—":"$"+Number(value||0).toFixed(4);

function updateProviderPickers(){
  $("modelsPicker").disabled=!projectKeyValidated;
  $("defaultPicker").disabled=!projectKeyValidated||!selectedProviderModels.length;
  $("modelsPickerValue").textContent=selectedProviderModels.length
    ? "${t.selectedModels} "+selectedProviderModels.length+" ${t.modelsUnit}"
    : (projectKeyValidated?"${t.chooseModels}":"${t.checkKeyFirst}");
  $("defaultPickerValue").textContent=selectedDefaultModel||(projectKeyValidated?"${t.chooseDefault}":"—");
}

function invalidateProjectKey(){
  projectKeyValidated=false;
  availableProjectModels=[];
  selectedProviderModels=[];
  selectedDefaultModel="";
  $("keyStatus").textContent="${t.keyNotChecked}";
  $("keyStatus").className="keyStatus";
  updateProviderPickers();
}

function renderModelsDialog(){
  $("modelsDialogBody").innerHTML=availableProjectModels.map(model=>'<label class="choice"><input type="checkbox" value="'+esc(model)+'" '+(selectedProviderModels.includes(model)?"checked":"")+'><span>'+esc(model)+'</span></label>').join("");
}

function renderDefaultDialog(){
  $("defaultDialogBody").innerHTML=selectedProviderModels.map(model=>'<label class="choice"><input type="radio" name="defaultModelChoice" value="'+esc(model)+'" '+(selectedDefaultModel===model?"checked":"")+'><span>'+esc(model)+'</span></label>').join("");
}

$("key").addEventListener("input",invalidateProjectKey);
$("checkKey").onclick=async()=>{
  const key=$("key").value.trim();
  if(!key){
    invalidateProjectKey();
    $("keyStatus").textContent="${t.checkKeyFirst}";
    $("keyStatus").className="keyStatus bad";
    return;
  }
  const button=$("checkKey");
  button.disabled=true;
  button.textContent="${t.checkingKey}";
  $("keyStatus").textContent="${t.checkingKey}";
  $("keyStatus").className="keyStatus";
  try{
    const result=await api("/validate-project-key",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({api_key:key})});
    availableProjectModels=Array.isArray(result.models)?result.models:[];
    if(!availableProjectModels.length)throw new Error("${t.noModelsForKey}");
    projectKeyValidated=true;
    const preferred=["gpt-5.6","gpt-5.6-sol","gpt-5.6-terra","gpt-5.6-luna"].filter(model=>availableProjectModels.includes(model));
    selectedProviderModels=preferred.length?preferred.slice(0,4):[availableProjectModels[0]];
    selectedDefaultModel=availableProjectModels.includes("gpt-5.6")?"gpt-5.6":selectedProviderModels[0];
    $("keyStatus").textContent="${t.keyOk} · "+availableProjectModels.length+" ${t.modelsUnit}";
    $("keyStatus").className="keyStatus ok";
    updateProviderPickers();
  }catch(error){
    invalidateProjectKey();
    $("keyStatus").textContent=error.message||"${t.checkKeyFirst}";
    $("keyStatus").className="keyStatus bad";
  }finally{
    button.disabled=false;
    button.textContent="${t.checkKey}";
  }
};

$("modelsPicker").onclick=()=>{if(!projectKeyValidated)return;renderModelsDialog();$("modelsDialog").showModal();};
$("modelsCancel").onclick=()=>$("modelsDialog").close();
$("modelsDone").onclick=()=>{
  const values=[...$("modelsDialogBody").querySelectorAll('input[type="checkbox"]:checked')].map(input=>input.value);
  if(!values.length){$("msg").textContent="${t.selectAtLeastOne}";$("msg").className="status bad";return;}
  selectedProviderModels=values;
  if(!selectedProviderModels.includes(selectedDefaultModel))selectedDefaultModel=selectedProviderModels[0];
  updateProviderPickers();
  $("modelsDialog").close();
};
$("defaultPicker").onclick=()=>{
  if(!projectKeyValidated||!selectedProviderModels.length){$("msg").textContent="${t.noAllowedModels}";$("msg").className="status bad";return;}
  renderDefaultDialog();$("defaultDialog").showModal();
};
$("defaultCancel").onclick=()=>$("defaultDialog").close();
$("defaultDone").onclick=()=>{
  const selected=$("defaultDialogBody").querySelector('input[name="defaultModelChoice"]:checked');
  if(selected)selectedDefaultModel=selected.value;
  updateProviderPickers();
  $("defaultDialog").close();
};

async function api(path,options={}){
  const response=await fetch("/api/ai/admin"+path,{...options,credentials:"same-origin",cache:"no-store",headers:{Accept:"application/json",...(options.headers||{})}});
  const data=await response.json().catch(()=>({}));
  if(response.status===401){location.reload();throw new Error("Authentication required");}
  if(!response.ok)throw new Error(data.error||("HTTP "+response.status));
  return data;
}

async function load(){
  try{
    state=await api("/state");
    render();
    $("refreshed").textContent=new Date().toLocaleTimeString();
  }catch(error){
    $("msg").textContent=error.message;
    $("msg").className="status bad";
  }
}

function userModelsSummary(models){
  const values=Array.isArray(models)?models:[];
  return "${t.selectedModels} "+values.length+" ${t.modelsUnit}";
}

function openUserModelsDialog(userId){
  const row=document.querySelector('.user[data-user="'+CSS.escape(userId)+'"]');
  if(!row)return;
  const providerId=row.querySelector(".providerSelect").value;
  const provider=(state.providers||[]).find(item=>item.id===providerId);
  const available=provider?.allowed_models||[];
  if(!available.length){
    $("msg").textContent="${t.noAllowedModels}";
    $("msg").className="status bad";
    return;
  }
  const selected=userModelSelections.get(userId)||[];
  activeUserModelPicker={userId,available:[...available]};
  $("userModelsDialogBody").innerHTML=available.map(model=>'<label class="choice"><input type="checkbox" value="'+esc(model)+'" '+(selected.includes(model)?"checked":"")+'><span>'+esc(model)+'</span></label>').join("");
  $("userModelsDialog").showModal();
}

$("userModelsCancel").onclick=()=>{activeUserModelPicker=null;$("userModelsDialog").close();};
$("userModelsDone").onclick=()=>{
  if(!activeUserModelPicker)return;
  const values=[...$("userModelsDialogBody").querySelectorAll('input[type="checkbox"]:checked')].map(input=>input.value);
  if(!values.length){
    $("msg").textContent="${t.selectAtLeastOne}";
    $("msg").className="status bad";
    return;
  }
  userModelSelections.set(activeUserModelPicker.userId,values);
  const row=document.querySelector('.user[data-user="'+CSS.escape(activeUserModelPicker.userId)+'"]');
  if(row)row.querySelector(".userModelsValue").textContent=userModelsSummary(values);
  activeUserModelPicker=null;
  $("userModelsDialog").close();
};

function providerOptions(selected){
  let html='<option value="">—</option>';
  for(const provider of state.providers||[]){
    html+='<option value="'+esc(provider.id)+'" '+(provider.id===selected?"selected":"")+'>'+esc(provider.name)+'</option>';
  }
  return html;
}

function render(){
  $("providers").innerHTML=(state.providers||[]).length
    ? state.providers.map(provider=>{
        const official=provider.billing?.available?Number(provider.billing.official_month_usd||0):null;
        const local=Number(provider.month_usage_usd||0);
        const spent=official==null?local:official;
        const budget=provider.monthly_budget_usd==null?null:Number(provider.monthly_budget_usd);
        const remaining=budget==null?null:Math.max(0,budget-spent);
        const billingLabel=provider.admin_key_configured
          ? (provider.billing?.available?"${t.billingOn}":"${t.billingOn} · "+esc(provider.billing?.error||""))
          : "${t.billingOff}";
        return '<div class="providerCard">'
          +'<div class="providerTop"><div><div class="providerName">'+esc(provider.name)+'</div>'
          +'<div class="hint">OpenAI · '+esc(provider.default_model)+' · API ****'+esc(provider.key_hint||"")+' · '+billingLabel+'</div></div>'
          +'<span class="pill">'+(provider.is_active?"● Active":"○ Disabled")+'</span></div>'
          +'<div class="metrics">'
          +'<div class="metric"><span>${t.official}</span><strong>'+money(official)+'</strong></div>'
          +'<div class="metric"><span>${t.local}</span><strong>'+money(local)+'</strong></div>'
          +'<div class="metric"><span>${t.remaining}</span><strong>'+money(remaining)+'</strong></div>'
          +'<div class="metric"><span>${t.requests}</span><strong>'+Number(provider.month_requests||0).toLocaleString()+'</strong></div>'
          +'</div></div>';
      }).join("")
    : "${t.empty}";

  $("users").innerHTML=(state.users||[]).map(user=>{
    const selectedProvider=(state.providers||[]).find(p=>p.id===user.provider_id);
    const providerModels=selectedProvider?.allowed_models||[];
    const defaultModels=(user.allowed_models||[]).length?user.allowed_models:providerModels;
    const safeModels=defaultModels.filter(model=>providerModels.includes(model));
    userModelSelections.set(user.user_id,safeModels.length?safeModels:[...providerModels]);
    return '<div class="user" data-user="'+esc(user.user_id)+'">'
      +'<div class="userName"><strong>'+esc(user.display_name||user.username||user.email)+'</strong><span class="hint">'+esc(user.email||"")+' · '+money(user.month_usage_usd||0)+'</span></div>'
      +'<div><label>${t.enabled}</label><select class="enabled"><option value="0">Off</option><option value="1" '+(user.enabled?"selected":"")+'>On</option></select></div>'
      +'<div><label>${t.provider}</label><select class="providerSelect">'+providerOptions(user.provider_id)+'</select></div>'
      +'<div><label>${t.allowed}</label><button type="button" class="pickerButton userModelsPicker"><span class="pickerValue userModelsValue">'+esc(userModelsSummary(userModelSelections.get(user.user_id)))+'</span><span class="pickerChevron">›</span></button></div>'
      +'<div><label>${t.daily}</label><input class="daily" type="number" min="0" step=".01" value="'+esc(user.daily_limit_usd??"")+'"></div>'
      +'<div><label>${t.monthly}</label><input class="monthly" type="number" min="0" step=".01" value="'+esc(user.monthly_limit_usd??"")+'"></div>'
      +'<div><label>${t.rpm}</label><input class="rpm" type="number" min="1" max="300" value="'+esc(user.requests_per_minute||20)+'"></div>'
      +'<button class="primary access">${t.apply}</button></div>';
  }).join("");

  document.querySelectorAll(".access").forEach(button=>button.onclick=saveAccess);
  document.querySelectorAll(".userModelsPicker").forEach(button=>button.onclick=event=>{
    const row=event.currentTarget.closest(".user");
    openUserModelsDialog(row.dataset.user);
  });
  document.querySelectorAll(".providerSelect").forEach(select=>select.onchange=event=>{
    const row=event.currentTarget.closest(".user");
    const provider=(state.providers||[]).find(item=>item.id===event.currentTarget.value);
    const values=provider?.allowed_models?[...provider.allowed_models]:[];
    userModelSelections.set(row.dataset.user,values);
    row.querySelector(".userModelsValue").textContent=userModelsSummary(values);
  });
}

$("saveProvider").onclick=async()=>{
  const button=$("saveProvider");
  button.disabled=true;
  button.textContent="${t.saving}";
  $("msg").textContent="";
  if(!projectKeyValidated){
    $("msg").textContent="${t.checkKeyFirst}";
    $("msg").className="status bad";
    button.disabled=false;
    button.textContent="${t.save}";
    return;
  }
  try{
    const result=await api("/provider",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      name:$("name").value,
      api_key:$("key").value,
      admin_key:$("adminKey").value,
      allowed_models:selectedProviderModels,
      default_model:selectedDefaultModel,
      monthly_budget_usd:$("budget").value,
      input_price_per_million:$("input").value,
      output_price_per_million:$("output").value
    })});
    $("key").value="";
    $("adminKey").value="";
    invalidateProjectKey();
    $("msg").textContent="${t.saved} · ${t.projectValidated}"+(result.validation?.billing_key?" · ${t.billingOn}":"");
    $("msg").className="status ok";
    await load();
  }catch(error){
    $("msg").textContent=error.message;
    $("msg").className="status bad";
  }finally{
    button.disabled=false;
    button.textContent="${t.save}";
  }
};

async function saveAccess(event){
  const row=event.currentTarget.closest(".user");
  const user=(state.users||[]).find(item=>item.user_id===row.dataset.user);
  const providerId=row.querySelector(".providerSelect").value;
  if(row.querySelector(".enabled").value==="1"&&!providerId){
    $("msg").textContent="${t.noProvider}";
    $("msg").className="status bad";
    return;
  }
  const allowedModels=userModelSelections.get(user.user_id)||[];
  if(row.querySelector(".enabled").value==="1"&&!allowedModels.length){
    $("msg").textContent="${t.selectAtLeastOne}";
    $("msg").className="status bad";
    return;
  }
  try{
    await api("/access",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      user_id:user.user_id,
      provider_id:providerId||null,
      enabled:row.querySelector(".enabled").value==="1",
      allowed_models:allowedModels,
      daily_limit_usd:row.querySelector(".daily").value,
      monthly_limit_usd:row.querySelector(".monthly").value,
      requests_per_minute:row.querySelector(".rpm").value
    })});
    $("msg").textContent="${t.saved}";
    $("msg").className="status ok";
    await load();
  }catch(error){
    $("msg").textContent=error.message;
    $("msg").className="status bad";
  }
}

updateProviderPickers();
load();
setInterval(load,60000);
</script>
</body>
</html>`;
}
