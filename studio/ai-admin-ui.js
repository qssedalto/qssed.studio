import { accountMenuClientScript, accountMenuMarkup, accountMenuStyles } from "./account-menu.js";
export function renderAiAdmin(locale) {
  const zh = locale === "zh-cn";
  const t = zh ? {
    title:"Intelligence 管理", intro:"集中管理 AI Provider、凭据、用户权限与配额。",
    add:"添加 AI Provider", name:"名称", type:"Provider 类型", typeOpenAI:"OpenAI", typeZhipu:"智谱 GLM", typeBailian:"阿里云百炼", key:"API Key", adminKey:"OpenAI Admin Key（可选，仅账单）",
    adminHint:"Admin Key 只用于读取 OpenAI Organization Costs，不参与用户聊天。",
    models:"允许模型", def:"默认模型", budget:"AERTEX 月预算（USD）",
    input:"自定义模型输入 $/百万 Token", output:"自定义模型输出 $/百万 Token",
    save:"验证并保存 Provider", saving:"正在验证…", providers:"API Providers", users:"用户授权",
    load:"正在加载…", enabled:"允许使用", provider:"Providers", allowed:"用户可用模型", daily:"日费用上限 $",
    monthly:"月费用上限 $", dailyTokens:"日 Token 上限", monthlyTokens:"月 Token 上限", rpm:"RPM", apply:"保存授权", empty:"尚未配置 Provider",
    official:"官方本月费用", local:"AERTEX 本地估算", remaining:"预算剩余", requests:"本月请求", compatibleApi:"兼容 API",
    billingOn:"官方账单已连接", billingOff:"未配置 Admin Key", saved:"已保存", projectValidated:"Project Key 验证通过",
    noProvider:"请至少为用户选择一个 Provider。", chooseModels:"选择允许模型", chooseDefault:"选择默认模型", chooseUserModels:"选择用户 Provider 与模型", selectedModels:"已选择", modelsUnit:"个模型", providersUnit:"个 Provider", cancel:"取消", done:"完成", selectAtLeastOne:"请至少选择一个允许模型。", noAllowedModels:"请先选择允许模型。", checkKey:"检查 Key", checkingKey:"正在检查…", keyOk:"Key 正常", keyNotChecked:"尚未检查 Key", checkKeyFirst:"请先检查 API Key。", noModelsForKey:"这个 API Key 没有返回可用于对话的模型。", accessSaving:"保存中…", accessSaved:"已保存 ✓", edit:"编辑", delete:"删除", editProvider:"编辑 Provider", replaceKey:"替换 Project API Key（留空则保留）", replaceAdminKey:"替换 Admin Key（留空则保留）", clearAdminKey:"清除现有 Admin Key", active:"启用 Provider", saveChanges:"保存修改", deleteConfirm:"确定删除这个 Provider？此操作不可撤销。", providerUpdated:"Provider 已更新", providerDeleted:"Provider 已删除", currentKey:"当前 Key", storedKeyOk:"当前已保存 Key 正常", checkReplacement:"检查新 Key", regionUnsupported:"当前网络或服务区域暂不支持 OpenAI API 检查。这里不是在判定 Key 无效；请在 OpenAI 官方支持的国家或地区使用需要连接 OpenAI 的功能。", rateLimited:"已确认上游 Provider 限流：AERTEX 收到真实 HTTP 429。这个结果不能判定 Key 无效。", authInvalid:"上游 Provider 明确拒绝了 API Key 身份验证。", quotaExhausted:"上游 Provider 报告当前账户额度不足。", permissionDenied:"上游 Provider 拒绝当前账户或模型的访问权限。", providerOverloaded:"上游 Provider 当前过载，请稍后重试。", retryAfter:"建议等待", seconds:"秒后重试", requestId:"请求 ID", providerCode:"Provider 错误码", checkedAt:"检查时间", noRetryHeader:"上游未返回 Retry-After；AERTEX 不会自动连续重试。", retryCountdown:"后重试", upstreamStatus:"上游状态"
  } : {
    title:"Intelligence Admin", intro:"Manage AI providers, credentials, user access, and quotas.",
    add:"Add AI Provider", name:"Name", type:"Provider type", typeOpenAI:"OpenAI", typeZhipu:"Zhipu GLM", typeBailian:"Alibaba Cloud Bailian", key:"API Key", adminKey:"OpenAI Admin Key (optional, billing only)",
    adminHint:"The Admin Key is used only for OpenAI Organization Costs and is never used for user inference.",
    models:"Allowed models", def:"Default model", budget:"AERTEX monthly budget (USD)",
    input:"Custom model input $ / 1M tokens", output:"Custom model output $ / 1M tokens",
    save:"Validate & save provider", saving:"Validating…", providers:"API Providers", users:"User access",
    load:"Loading…", enabled:"AI access", provider:"Provider", allowed:"User models", daily:"Daily cost limit $",
    monthly:"Monthly cost limit $", dailyTokens:"Daily token limit", monthlyTokens:"Monthly token limit", rpm:"RPM", apply:"Save access", empty:"No provider configured",
    official:"Official month cost", local:"AERTEX local estimate", remaining:"Budget remaining", requests:"Requests this month", compatibleApi:"Compatible API",
    billingOn:"Official billing connected", billingOff:"No Admin Key", saved:"Saved", projectValidated:"Project Key validated",
    noProvider:"Select at least one provider for this user.", chooseModels:"Choose allowed models", chooseDefault:"Choose default model", chooseUserModels:"Choose user providers and models", selectedModels:"Selected", modelsUnit:"models", providersUnit:"providers", cancel:"Cancel", done:"Done", selectAtLeastOne:"Select at least one allowed model.", noAllowedModels:"Choose allowed models first.", checkKey:"Check Key", checkingKey:"Checking…", keyOk:"Key valid", keyNotChecked:"Key not checked", checkKeyFirst:"Check the API Key first.", noModelsForKey:"This API Key returned no chat-capable models.", accessSaving:"Saving…", accessSaved:"Saved ✓", edit:"Edit", delete:"Delete", editProvider:"Edit Provider", replaceKey:"Replace Project API Key (leave blank to keep)", replaceAdminKey:"Replace Admin Key (leave blank to keep)", clearAdminKey:"Remove existing Admin Key", active:"Provider enabled", saveChanges:"Save changes", deleteConfirm:"Delete this provider? This action cannot be undone.", providerUpdated:"Provider updated", providerDeleted:"Provider deleted", currentKey:"Current key", storedKeyOk:"Stored key is valid", checkReplacement:"Check new key", regionUnsupported:"OpenAI API checks are unavailable from the current network or service region. This does not mean the key is invalid. Use OpenAI-connected features only from an officially supported country or territory.", rateLimited:"Confirmed upstream provider rate limit: AERTEX received a real HTTP 429. This does not mean the API key is invalid.", authInvalid:"The upstream provider explicitly rejected API-key authentication.", quotaExhausted:"The upstream provider reports insufficient account quota.", permissionDenied:"The upstream provider denied access for this account or model.", providerOverloaded:"The upstream provider is temporarily overloaded. Try again later.", retryAfter:"Retry after", seconds:"seconds", requestId:"Request ID", providerCode:"Provider error code", checkedAt:"Checked at", noRetryHeader:"The upstream provider did not return Retry-After; AERTEX will not auto-retry repeatedly.", retryCountdown:"retry", upstreamStatus:"Upstream status"
  };

  return `<!doctype html>
<html lang="${zh ? "zh-CN" : "en"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${t.title}</title>
<style>
:root{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;--bg:#f6f6f4;--panel:#fff;--text:#171717;--muted:#747474;--line:#dededb;--soft:#f0f0ed;--good:#18864b;--bad:#b42318;--warn:#9a6700}
@media(prefers-color-scheme:dark){:root{--bg:#101010;--panel:#181818;--text:#f4f4f4;--muted:#999;--line:#333;--soft:#202020;--good:#52c986;--bad:#ff766d;--warn:#ffd60a}}
*{box-sizing:border-box}.hidden{display:none!important}html,body{max-width:100%;overflow-x:hidden}body{margin:0;background:var(--bg);color:var(--text)}main{width:100%;max-width:1180px;min-width:0;margin:auto;padding:34px 18px 80px}
header{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:18px}h1{font-size:32px;letter-spacing:-.045em;margin:0 0 6px}h2{font-size:18px;margin:0}.intro,.hint{color:var(--muted);font-size:12px;line-height:1.6}.intro{font-size:13px;margin:0}
.card{width:100%;min-width:0;max-width:100%;overflow:hidden;background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:18px;margin:14px 0}.grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;min-width:0}.grid>div{min-width:0}
label{display:block;font-size:12px;color:var(--muted);margin:9px 0 5px}input,select{width:100%;min-width:0;max-width:100%;padding:10px 11px;border:1px solid var(--line);border-radius:10px;background:var(--panel);color:var(--text);outline:none}
input:focus,select:focus{border-color:var(--text)}button{border:0;border-radius:10px;padding:10px 14px;font-weight:650;cursor:pointer}.primary{background:var(--text);color:var(--bg)}button:disabled{opacity:.42;cursor:not-allowed}.keyRow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center}.checkKeyButton{white-space:nowrap;background:var(--soft);color:var(--text);border:1px solid var(--line)}.keyStatus{margin-top:6px;min-height:18px;font-size:12px;color:var(--muted)}.keyStatus.ok{color:var(--good)}.keyStatus.bad{color:var(--bad)}.keyStatus.warn{color:var(--warn)}
.pickerButton{width:100%;min-width:0;max-width:100%;min-height:42px;padding:10px 11px;border:1px solid var(--line);border-radius:10px;background:var(--panel);color:var(--text);display:flex;align-items:center;justify-content:space-between;gap:10px;text-align:left;font-weight:500;overflow:hidden}.pickerButton:hover{background:var(--soft)}.pickerValue{display:block;flex:1 1 auto;min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pickerChevron{flex:0 0 auto;color:var(--muted);font-size:16px}
dialog{width:min(520px,calc(100vw - 28px));max-height:min(72vh,680px);padding:0;border:1px solid var(--line);border-radius:18px;background:var(--panel);color:var(--text);box-shadow:0 24px 80px rgba(0,0,0,.22)}dialog::backdrop{background:rgba(0,0,0,.36);backdrop-filter:blur(2px)}.dialogHead{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px;border-bottom:1px solid var(--line)}.dialogHead strong{font-size:17px}.dialogBody{padding:8px 18px 14px;overflow:auto;max-height:50vh}.dialogFoot{display:flex;justify-content:flex-end;gap:8px;padding:12px 18px 16px;border-top:1px solid var(--line)}.dialogFoot .secondaryBtn{background:var(--soft);color:var(--text)}.choice{display:flex;align-items:center;gap:11px;padding:12px 2px;border-bottom:1px solid var(--line);font-size:14px}.choice:last-child{border-bottom:0}.choice input{width:19px;height:19px;margin:0;accent-color:var(--text)}
.sectionHead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}.providerCard{border-top:1px solid var(--line);padding:16px 0}.providerTop{display:flex;align-items:start;justify-content:space-between;gap:14px}.providerName{font-weight:730}.providerActions{display:flex;align-items:center;gap:7px;flex-wrap:wrap;justify-content:flex-end}.smallButton{padding:7px 10px;border:1px solid var(--line);background:var(--soft);color:var(--text);border-radius:9px;font-size:12px}.dangerButton{color:var(--bad)}.bad{color:var(--bad)}.ok{color:var(--good)}
.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:9px;margin-top:12px}.metric{background:var(--soft);border-radius:12px;padding:11px}.metric span{display:block;color:var(--muted);font-size:11px;margin-bottom:5px}.metric strong{font-size:17px}.statusPill{display:inline-flex;align-items:center;gap:7px}.statusDot{width:9px;height:9px;border-radius:50%;background:var(--muted);display:inline-block}.statusDot.active{background:var(--good)}
.user{display:grid;grid-template-columns:minmax(170px,1.35fr) repeat(4,minmax(110px,1fr));gap:8px;align-items:end;border-top:1px solid var(--line);padding:12px 0;min-width:0}.user>*{min-width:0}.accessCell{display:flex;flex-direction:column;align-items:stretch;gap:5px}.accessFeedback{min-height:16px;font-size:11px;color:var(--muted);line-height:1.35}.accessFeedback.ok{color:var(--good)}.accessFeedback.bad{color:var(--bad)}.access.isSaved{background:var(--good);color:#fff}.userName{align-self:center;min-width:0}.userName strong,.userName .hint{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.status{min-height:20px;margin:5px 0 12px}.pill{display:inline-block;padding:4px 8px;border-radius:999px;background:var(--soft);font-size:11px}
@media(max-width:900px){.metrics{grid-template-columns:1fr 1fr}.user{grid-template-columns:1fr 1fr}.grid{grid-template-columns:1fr}}
@media(max-width:560px){header{display:block}.metrics,.user{grid-template-columns:1fr}}
</style>\n<style>${accountMenuStyles()}</style>\n</head>
<body>
<main>
<header><div><h1>${t.title}</h1><p class="intro">${t.intro}</p></div><div style="display:flex;align-items:center;gap:10px"><span class="pill">AERTEX Intelligence</span>${accountMenuMarkup(zh ? "zh-cn" : "en")}</div></header>
<div id="msg" class="status hint"></div>

<section class="card">
  <div class="sectionHead"><h2>${t.add}</h2></div>
  <div class="grid">
    <div><label>${t.type}</label><select id="providerType"><option value="openai">${t.typeOpenAI}</option><option value="zhipu">${t.typeZhipu}</option><option value="bailian">${t.typeBailian}</option></select></div>
    <div><label>${t.name}</label><input id="name" value="OpenAI Primary"></div>
    <div><label>${t.key}</label><div class="keyRow"><input id="key" type="password" autocomplete="off" spellcheck="false"><button type="button" class="checkKeyButton" id="checkKey">${t.checkKey}</button></div><div class="keyStatus" id="keyStatus">${t.keyNotChecked}</div></div>
    <div id="adminKeyField"><label>${t.adminKey}</label><input id="adminKey" type="password" autocomplete="off" spellcheck="false"><div class="hint">${t.adminHint}</div></div>
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

<dialog id="editProviderDialog">
  <div class="dialogHead"><strong>${t.editProvider}</strong></div>
  <div class="dialogBody">
    <label>${t.type}</label><div class="pill" id="editProviderType"></div>
    <label>${t.name}</label><input id="editName">
    <label>${t.replaceKey}</label>
    <div class="keyRow"><input id="editKey" type="password" autocomplete="off" spellcheck="false"><button type="button" class="checkKeyButton" id="editCheckKey">${t.checkReplacement}</button></div>
    <div class="keyStatus" id="editKeyStatus"></div>
    <div id="editAdminKeyField"><label>${t.replaceAdminKey}</label><input id="editAdminKey" type="password" autocomplete="off" spellcheck="false">
    <label class="choice"><input id="editClearAdminKey" type="checkbox"><span>${t.clearAdminKey}</span></label></div>
    <label>${t.models}</label><button type="button" class="pickerButton" id="editModelsPicker"><span class="pickerValue" id="editModelsValue"></span><span class="pickerChevron">›</span></button>
    <label>${t.def}</label><button type="button" class="pickerButton" id="editDefaultPicker"><span class="pickerValue" id="editDefaultValue"></span><span class="pickerChevron">›</span></button>
    <label>${t.budget}</label><input id="editBudget" type="number" min="0" step=".01">
    <label>${t.input}</label><input id="editInput" type="number" min="0" step=".001">
    <label>${t.output}</label><input id="editOutput" type="number" min="0" step=".001">
    <label class="choice"><input id="editActive" type="checkbox"><span>${t.active}</span></label>
  </div>
  <div class="dialogFoot"><button type="button" class="secondaryBtn" id="editCancel">${t.cancel}</button><button type="button" class="primary" id="editSave">${t.saveChanges}</button></div>
</dialog>

<dialog id="editModelsDialog">
  <div class="dialogHead"><strong>${t.chooseModels}</strong></div>
  <div class="dialogBody" id="editModelsDialogBody"></div>
  <div class="dialogFoot"><button type="button" class="secondaryBtn" id="editModelsCancel">${t.cancel}</button><button type="button" class="primary" id="editModelsDone">${t.done}</button></div>
</dialog>

<dialog id="editDefaultDialog">
  <div class="dialogHead"><strong>${t.chooseDefault}</strong></div>
  <div class="dialogBody" id="editDefaultDialogBody"></div>
  <div class="dialogFoot"><button type="button" class="secondaryBtn" id="editDefaultCancel">${t.cancel}</button><button type="button" class="primary" id="editDefaultDone">${t.done}</button></div>
</dialog>

<script>
const $=id=>document.getElementById(id);
let state={providers:[],users:[]};
let availableProjectModels=[];
let selectedProviderModels=[];
let selectedDefaultModel="";
let projectKeyValidated=false;
const userProviderAccessSelections=new Map();
let activeUserModelPicker=null;
let editingProvider=null;
let editAvailableModels=[];
let editSelectedModels=[];
let editDefaultModel="";
let editReplacementKeyChecked=true;
const esc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const money=value=>value==null?"—":"$"+Number(value||0).toFixed(4);
const tokenCount=value=>Number(value||0).toLocaleString();
const normalizeApiKey=value=>String(value||"").replace(/[\\s\\u200B\\u200C\\u200D\\u2060\\uFEFF]+/g,"").trim();

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

function syncProviderType(){
  const kind=$("providerType").value;
  $("adminKeyField").classList.toggle("hidden",kind!=="openai");
  if(kind!=="openai")$("adminKey").value="";
  if(kind==="zhipu"&&($("name").value==="OpenAI Primary"||$("name").value==="Alibaba Cloud Bailian"))$("name").value="Zhipu GLM";
  if(kind==="bailian"&&($("name").value==="OpenAI Primary"||$("name").value==="Zhipu GLM"))$("name").value="Alibaba Cloud Bailian";
  if(kind==="openai"&&($("name").value==="Zhipu GLM"||$("name").value==="Alibaba Cloud Bailian"))$("name").value="OpenAI Primary";
  $("input").value=kind==="openai"?"4":"0";
  $("output").value=kind==="openai"?"20":"0";
}
$("providerType").addEventListener("change",()=>{invalidateProjectKey();syncProviderType();});
$("key").addEventListener("input",invalidateProjectKey);
$("checkKey").onclick=async()=>{
  const key=normalizeApiKey($("key").value);
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
    const result=await api("/validate-project-key",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({api_key:key,provider:$("providerType").value})});
    availableProjectModels=Array.isArray(result.models)?result.models:[];
    if(!availableProjectModels.length)throw new Error("${t.noModelsForKey}");
    projectKeyValidated=true;
    const preferred=($("providerType").value==="zhipu"
      ? ["glm-4.7-flash"]
      : $("providerType").value==="bailian"
        ? ["qwen3.7-plus","glm-5","qwen-max","qwen-plus-2025-07-28"]
        : ["gpt-5.6","gpt-5.6-sol","gpt-5.6-terra","gpt-5.6-luna"])
      .filter(model=>availableProjectModels.includes(model));
    selectedProviderModels=preferred.length?preferred.slice(0,4):[availableProjectModels[0]];
    selectedDefaultModel=selectedProviderModels[0];
    $("keyStatus").textContent="${t.keyOk} · "+availableProjectModels.length+" ${t.modelsUnit}";
    $("keyStatus").className="keyStatus ok";
    updateProviderPickers();
  }catch(error){
    invalidateProjectKey();
    $("keyStatus").textContent=friendlyError(error)||"${t.checkKeyFirst}";
    $("keyStatus").className=error?.code==="RATE_LIMITED"?"keyStatus warn":"keyStatus bad";
    if(error?.code==="RATE_LIMITED"){
      startRetryCooldown(button,"${t.checkKey}",error);
      return;
    }
  }finally{
    if(!button.disabled||button.textContent==="${t.checkingKey}"){
      button.disabled=false;
      button.textContent="${t.checkKey}";
    }
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
  if(response.status===401&&!data.code){location.reload();throw new Error("Authentication required");}
  if(!response.ok){
    const error=new Error(data.error||("HTTP "+response.status));
    error.code=data.code||null;
    error.diagnostic=data.diagnostic||null;
    error.httpStatus=response.status;
    throw error;
  }
  return data;
}
function diagnosticSuffix(error){
  const d=error?.diagnostic||{};
  const parts=[];
  if(d.upstream_status)parts.push("${t.upstreamStatus}: HTTP "+d.upstream_status);
  if(d.provider_code)parts.push("${t.providerCode}: "+d.provider_code);
  if(d.retry_after_seconds!=null&&Number.isFinite(Number(d.retry_after_seconds)))parts.push("${t.retryAfter} "+d.retry_after_seconds+" ${t.seconds}");
  else if(error?.code==="RATE_LIMITED")parts.push("${t.noRetryHeader}");
  if(d.request_id)parts.push("${t.requestId}: "+d.request_id);
  if(d.checked_at){
    const date=new Date(d.checked_at);
    if(!Number.isNaN(date.getTime()))parts.push("${t.checkedAt}: "+date.toLocaleTimeString());
  }
  return parts.length?" · "+parts.join(" · "):"";
}
function friendlyError(error){
  if(error?.code==="REGION_UNSUPPORTED")return "${t.regionUnsupported}";
  if(error?.code==="RATE_LIMITED")return "${t.rateLimited}"+diagnosticSuffix(error);
  if(error?.code==="PROVIDER_AUTH_INVALID")return "${t.authInvalid}"+diagnosticSuffix(error);
  if(error?.code==="PROVIDER_QUOTA_EXHAUSTED")return "${t.quotaExhausted}"+diagnosticSuffix(error);
  if(error?.code==="PROVIDER_PERMISSION_DENIED")return "${t.permissionDenied}"+diagnosticSuffix(error);
  if(error?.code==="PROVIDER_OVERLOADED")return "${t.providerOverloaded}"+diagnosticSuffix(error);
  return (error?.message||"Error")+diagnosticSuffix(error);
}
function startRetryCooldown(button,normalLabel,error){
  if(error?.code!=="RATE_LIMITED"){button.disabled=false;button.textContent=normalLabel;return;}
  const rawRetry=error?.diagnostic?.retry_after_seconds;
  const upstream=rawRetry==null?NaN:Number(rawRetry);
  let seconds=Number.isFinite(upstream)&&upstream>0?Math.min(120,Math.ceil(upstream)):15;
  button.disabled=true;
  const tick=()=>{
    button.textContent=seconds+"s ${t.retryCountdown}";
    if(seconds<=0){button.disabled=false;button.textContent=normalLabel;return;}
    seconds-=1;
    window.setTimeout(tick,1000);
  };
  tick();
}
async function load(){
  try{
    state=await api("/state");
    render();
    $("refreshed").textContent=new Date().toLocaleTimeString();
  }catch(error){
    $("msg").textContent=friendlyError(error);
    $("msg").className="status bad";
  }
}

function userProvidersSummary(access){
  const values=Array.isArray(access)?access:[];
  return "${t.selectedModels} "+values.length+" ${t.providersUnit}";
}
function userModelsSummary(access){
  const values=Array.isArray(access)?access:[];
  const count=values.reduce((sum,item)=>sum+(Array.isArray(item.allowed_models)?item.allowed_models.length:0),0);
  return "${t.selectedModels} "+count+" ${t.modelsUnit}";
}
function normalizedUserAccess(user){
  const raw=Array.isArray(user.provider_access)?user.provider_access.filter(item=>item&&item.enabled!==false):[];
  return raw.map(item=>{
    const provider=(state.providers||[]).find(p=>p.id===item.provider_id);
    if(!provider)return null;
    const available=Array.isArray(provider.allowed_models)?provider.allowed_models:[];
    const selected=(Array.isArray(item.allowed_models)&&item.allowed_models.length?item.allowed_models:available)
      .filter(model=>available.includes(model));
    return {provider_id:provider.id,allowed_models:selected.length?selected:[...available]};
  }).filter(Boolean);
}
function openUserModelsDialog(userId){
  const row=document.querySelector('.user[data-user="'+CSS.escape(userId)+'"]');
  if(!row)return;
  const current=userProviderAccessSelections.get(userId)||[];
  const selectedByProvider=new Map(current.map(item=>[item.provider_id,item.allowed_models||[]]));
  const providers=(state.providers||[]).filter(provider=>provider.is_active!==false);
  if(!providers.length){
    $("msg").textContent="${t.noProvider}";
    $("msg").className="status bad";
    return;
  }
  activeUserModelPicker={userId};
  $("userModelsDialogBody").innerHTML=providers.map(provider=>{
    const checked=selectedByProvider.has(provider.id);
    const selected=selectedByProvider.get(provider.id)||[];
    const models=provider.allowed_models||[];
    const providerTypeLabel=provider.provider==="zhipu"?"${t.typeZhipu}":provider.provider==="bailian"?"${t.typeBailian}":"${t.typeOpenAI}";
    return '<div class="providerCard userProviderGroup" data-provider="'+esc(provider.id)+'">'
      +'<label class="choice"><input class="userProviderToggle" type="checkbox" value="'+esc(provider.id)+'" '+(checked?"checked":"")+'><span><strong>'+esc(provider.name)+'</strong> · '+providerTypeLabel+'</span></label>'
      +'<div class="dialogBody providerModelChoices">'
      +models.map(model=>'<label class="choice"><input class="userProviderModel" data-provider="'+esc(provider.id)+'" type="checkbox" value="'+esc(model)+'" '+(selected.includes(model)?"checked":"")+' '+(checked?"":"disabled")+'><span>'+esc(model)+'</span></label>').join("")
      +'</div></div>';
  }).join("");
  $("userModelsDialogBody").querySelectorAll(".userProviderToggle").forEach(toggle=>toggle.onchange=event=>{
    const group=event.currentTarget.closest(".userProviderGroup");
    const modelInputs=[...group.querySelectorAll(".userProviderModel")];
    modelInputs.forEach(input=>input.disabled=!event.currentTarget.checked);
    if(event.currentTarget.checked&&!modelInputs.some(input=>input.checked)&&modelInputs[0])modelInputs[0].checked=true;
  });
  $("userModelsDialog").showModal();
}
$("userModelsCancel").onclick=()=>{activeUserModelPicker=null;$("userModelsDialog").close();};
$("userModelsDone").onclick=()=>{
  if(!activeUserModelPicker)return;
  const access=[];
  for(const toggle of $("userModelsDialogBody").querySelectorAll(".userProviderToggle:checked")){
    const providerId=toggle.value;
    const group=toggle.closest(".userProviderGroup");
    const values=[...group.querySelectorAll(".userProviderModel:checked")].map(input=>input.value);
    if(!values.length){
      $("msg").textContent="${t.selectAtLeastOne}";
      $("msg").className="status bad";
      return;
    }
    access.push({provider_id:providerId,allowed_models:values});
  }
  userProviderAccessSelections.set(activeUserModelPicker.userId,access);
  const row=document.querySelector('.user[data-user="'+CSS.escape(activeUserModelPicker.userId)+'"]');
  if(row){
    row.querySelector(".userProvidersValue").textContent=userProvidersSummary(access);
    row.querySelector(".userModelsValue").textContent=userModelsSummary(access);
  }
  activeUserModelPicker=null;
  $("userModelsDialog").close();
};

function updateEditPickers(){
  $("editModelsValue").textContent="${t.selectedModels} "+editSelectedModels.length+" ${t.modelsUnit}";
  $("editDefaultValue").textContent=editDefaultModel||"—";
  $("editDefaultPicker").disabled=!editSelectedModels.length;
}

async function openEditProvider(providerId){
  const provider=(state.providers||[]).find(item=>item.id===providerId);
  if(!provider)return;
  editingProvider=provider;
  $("editProviderType").textContent=provider.provider==="zhipu"?"${t.typeZhipu}":provider.provider==="bailian"?"${t.typeBailian}":"${t.typeOpenAI}";
  $("editAdminKeyField").classList.toggle("hidden",provider.provider!=="openai");
  $("editName").value=provider.name||"";
  $("editKey").value="";
  $("editAdminKey").value="";
  $("editClearAdminKey").checked=false;
  $("editBudget").value=provider.monthly_budget_usd??"";
  $("editInput").value=provider.input_price_per_million??0;
  $("editOutput").value=provider.output_price_per_million??0;
  $("editActive").checked=provider.is_active!==false;
  $("editKeyStatus").textContent="${t.currentKey} · ****"+(provider.key_hint||"");
  $("editKeyStatus").className="keyStatus ok";
  editReplacementKeyChecked=true;
  editAvailableModels=[...(provider.allowed_models||[])];
  editSelectedModels=[...(provider.allowed_models||[])];
  editDefaultModel=editSelectedModels.includes(provider.default_model)?provider.default_model:(editSelectedModels[0]||"");
  updateEditPickers();
  $("editProviderDialog").showModal();
}
$("editKey").addEventListener("input",()=>{
  editReplacementKeyChecked=!$("editKey").value.trim();
  $("editKeyStatus").textContent=editReplacementKeyChecked?"${t.currentKey} · ****"+(editingProvider?.key_hint||""):"${t.keyNotChecked}";
  $("editKeyStatus").className="keyStatus";
});

$("editCheckKey").onclick=async()=>{
  const key=normalizeApiKey($("editKey").value);
  if(!key){editReplacementKeyChecked=true;$("editKeyStatus").textContent="${t.currentKey} · ****"+(editingProvider?.key_hint||"");$("editKeyStatus").className="keyStatus ok";return;}
  const button=$("editCheckKey"); button.disabled=true; button.textContent="${t.checkingKey}";
  try{
    const result=await api("/validate-project-key",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({api_key:key,provider:editingProvider?.provider||"openai"})});
    editAvailableModels=Array.isArray(result.models)?result.models:[];
    if(!editAvailableModels.length)throw new Error("${t.noModelsForKey}");
    editSelectedModels=editSelectedModels.filter(model=>editAvailableModels.includes(model));
    if(!editSelectedModels.length)editSelectedModels=[editAvailableModels[0]];
    if(!editSelectedModels.includes(editDefaultModel))editDefaultModel=editSelectedModels[0];
    editReplacementKeyChecked=true;
    $("editKeyStatus").textContent="${t.keyOk} · "+editAvailableModels.length+" ${t.modelsUnit}";
    $("editKeyStatus").className="keyStatus ok";
    updateEditPickers();
  }catch(error){
    editReplacementKeyChecked=false;
    $("editKeyStatus").textContent=friendlyError(error)||"${t.keyNotChecked}";
    $("editKeyStatus").className=error?.code==="RATE_LIMITED"?"keyStatus warn":"keyStatus bad";
    if(error?.code==="RATE_LIMITED"){
      startRetryCooldown(button,"${t.checkReplacement}",error);
      return;
    }
  }finally{
    if(!button.disabled||button.textContent==="${t.checkingKey}"){
      button.disabled=false;
      button.textContent="${t.checkReplacement}";
    }
  }
};

$("editModelsPicker").onclick=()=>{
  $("editModelsDialogBody").innerHTML=editAvailableModels.map(model=>'<label class="choice"><input type="checkbox" value="'+esc(model)+'" '+(editSelectedModels.includes(model)?"checked":"")+'><span>'+esc(model)+'</span></label>').join("");
  $("editModelsDialog").showModal();
};
$("editModelsCancel").onclick=()=>$("editModelsDialog").close();
$("editModelsDone").onclick=()=>{
  const values=[...$("editModelsDialogBody").querySelectorAll('input[type="checkbox"]:checked')].map(input=>input.value);
  if(!values.length){$("msg").textContent="${t.selectAtLeastOne}";$("msg").className="status bad";return;}
  editSelectedModels=values;
  if(!editSelectedModels.includes(editDefaultModel))editDefaultModel=editSelectedModels[0];
  updateEditPickers(); $("editModelsDialog").close();
};

$("editDefaultPicker").onclick=()=>{
  $("editDefaultDialogBody").innerHTML=editSelectedModels.map(model=>'<label class="choice"><input type="radio" name="editDefaultChoice" value="'+esc(model)+'" '+(editDefaultModel===model?"checked":"")+'><span>'+esc(model)+'</span></label>').join("");
  $("editDefaultDialog").showModal();
};
$("editDefaultCancel").onclick=()=>$("editDefaultDialog").close();
$("editDefaultDone").onclick=()=>{
  const selected=$("editDefaultDialogBody").querySelector('input[name="editDefaultChoice"]:checked');
  if(selected)editDefaultModel=selected.value;
  updateEditPickers(); $("editDefaultDialog").close();
};
$("editCancel").onclick=()=>{$("editProviderDialog").close();editingProvider=null;};

$("editSave").onclick=async()=>{
  if(!editingProvider)return;
  if($("editKey").value.trim()&&!editReplacementKeyChecked){
    $("msg").textContent="${t.checkKeyFirst}";$("msg").className="status bad";return;
  }
  const button=$("editSave");button.disabled=true;
  try{
    await api("/provider/"+encodeURIComponent(editingProvider.id),{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      name:$("editName").value,
      api_key:normalizeApiKey($("editKey").value),
      admin_key:normalizeApiKey($("editAdminKey").value),
      clear_admin_key:$("editClearAdminKey").checked,
      allowed_models:editSelectedModels,
      default_model:editDefaultModel,
      monthly_budget_usd:$("editBudget").value,
      input_price_per_million:$("editInput").value,
      output_price_per_million:$("editOutput").value,
      is_active:$("editActive").checked
    })});
    $("editProviderDialog").close(); editingProvider=null;
    $("msg").textContent="${t.providerUpdated}";$("msg").className="status ok";
    await load();
  }catch(error){$("msg").textContent=friendlyError(error);$("msg").className="status bad";}
  finally{button.disabled=false;}
};

async function deleteProvider(providerId){
  if(!confirm("${t.deleteConfirm}"))return;
  try{
    await api("/provider/"+encodeURIComponent(providerId),{method:"DELETE",headers:{"Content-Type":"application/json"}});
    $("msg").textContent="${t.providerDeleted}";$("msg").className="status ok";
    await load();
  }catch(error){$("msg").textContent=friendlyError(error);$("msg").className="status bad";}
}

function render(){
  $("providers").innerHTML=(state.providers||[]).length
    ? state.providers.map(provider=>{
        const official=provider.billing?.available?Number(provider.billing.official_month_usd||0):null;
        const local=Number(provider.month_usage_usd||0);
        const spent=official==null?local:official;
        const budget=provider.monthly_budget_usd==null?null:Number(provider.monthly_budget_usd);
        const remaining=budget==null?null:Math.max(0,budget-spent);
        const providerLabel=provider.provider==="zhipu"?"${t.typeZhipu}":provider.provider==="bailian"?"${t.typeBailian}":"${t.typeOpenAI}";
        const billingLabel=provider.provider==="openai"
          ? (provider.admin_key_configured
              ? (provider.billing?.available?"${t.billingOn}":"${t.billingOn} · "+esc(provider.billing?.error||""))
              : "${t.billingOff}")
          : "${t.compatibleApi}";
        const metricItems = [];
        if(provider.provider==="openai"){
          metricItems.push('<div class="metric"><span>${t.official}</span><strong>'+money(official)+'</strong></div>');
        }
        metricItems.push('<div class="metric"><span>${t.local}</span><strong>'+money(local)+'</strong></div>');
        if(budget!=null){
          metricItems.push('<div class="metric"><span>${t.remaining}</span><strong>'+money(remaining)+'</strong></div>');
        }
        metricItems.push('<div class="metric"><span>${t.requests}</span><strong>'+Number(provider.month_requests||0).toLocaleString()+'</strong></div>');
        return '<div class="providerCard">'
          +'<div class="providerTop"><div><div class="providerName">'+esc(provider.name)+'</div>'
          +'<div class="hint">'+providerLabel+' · '+esc(provider.default_model)+' · API ****'+esc(provider.key_hint||"")+' · '+billingLabel+'</div></div>'
          +'<div class="providerActions"><span class="pill statusPill"><span class="statusDot '+(provider.is_active?"active":"")+'"></span>'+(provider.is_active?"Active":"Disabled")+'</span><button type="button" class="smallButton editProvider" data-provider="'+esc(provider.id)+'">${t.edit}</button><button type="button" class="smallButton dangerButton deleteProvider" data-provider="'+esc(provider.id)+'">${t.delete}</button></div></div>'
          +'<div class="metrics">'+metricItems.join("")+'</div></div>';
      }).join("")
    : "${t.empty}";

  $("users").innerHTML=(state.users||[]).map(user=>{
    const access=normalizedUserAccess(user);
    userProviderAccessSelections.set(user.user_id,access);
    return '<div class="user" data-user="'+esc(user.user_id)+'">'
      +'<div class="userName"><strong>'+esc(user.display_name||user.username||user.email)+'</strong><span class="hint">'+esc(user.email||"")+' · '+money(user.month_usage_usd||0)+' · '+tokenCount(user.month_usage_tokens||0)+' tokens</span></div>'
      +'<div><label>${t.enabled}</label><select class="enabled"><option value="0">Off</option><option value="1" '+(user.enabled?"selected":"")+'>On</option></select></div>'
      +'<div><label>${t.provider}</label><button type="button" class="pickerButton userProvidersPicker"><span class="pickerValue userProvidersValue">'+esc(userProvidersSummary(access))+'</span><span class="pickerChevron">›</span></button></div>'
      +'<div><label>${t.allowed}</label><button type="button" class="pickerButton userModelsPicker"><span class="pickerValue userModelsValue">'+esc(userModelsSummary(access))+'</span><span class="pickerChevron">›</span></button></div>'
      +'<div><label>${t.daily}</label><input class="daily" type="number" min="0" step=".01" value="'+esc(user.daily_limit_usd??"")+'"></div>'
      +'<div><label>${t.monthly}</label><input class="monthly" type="number" min="0" step=".01" value="'+esc(user.monthly_limit_usd??"")+'"></div>'
      +'<div><label>${t.dailyTokens}</label><input class="dailyTokens" type="number" min="0" step="1000" value="'+esc(user.daily_limit_tokens??"")+'"></div>'
      +'<div><label>${t.monthlyTokens}</label><input class="monthlyTokens" type="number" min="0" step="1000" value="'+esc(user.monthly_limit_tokens??"")+'"></div>'
      +'<div><label>${t.rpm}</label><input class="rpm" type="number" min="1" max="300" value="'+esc(user.requests_per_minute||20)+'"></div>'
      +'<div class="accessCell"><button class="primary access" type="button">${t.apply}</button><div class="accessFeedback" aria-live="polite"></div></div></div>';
  }).join("");

  document.querySelectorAll(".editProvider").forEach(button=>button.onclick=()=>openEditProvider(button.dataset.provider));
  document.querySelectorAll(".deleteProvider").forEach(button=>button.onclick=()=>deleteProvider(button.dataset.provider));
  document.querySelectorAll(".access").forEach(button=>button.onclick=saveAccess);
  document.querySelectorAll(".userModelsPicker,.userProvidersPicker").forEach(button=>button.onclick=event=>{
    const row=event.currentTarget.closest(".user");
    openUserModelsDialog(row.dataset.user);
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
      provider:$("providerType").value,
      api_key:normalizeApiKey($("key").value),
      admin_key:normalizeApiKey($("adminKey").value),
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
    $("msg").textContent=friendlyError(error);
    $("msg").className="status bad";
  }finally{
    button.disabled=false;
    button.textContent="${t.save}";
  }
};

async function saveAccess(event){
  const button=event.currentTarget;
  const row=button.closest(".user");
  const feedback=row.querySelector(".accessFeedback");
  const user=(state.users||[]).find(item=>item.user_id===row.dataset.user);
  if(!user)return;

  const providerAccess=userProviderAccessSelections.get(user.user_id)||[];
  const reset=()=>{
    button.disabled=false;
    button.classList.remove("isSaved");
    button.textContent="${t.apply}";
  };
  const fail=message=>{
    feedback.textContent=message;
    feedback.className="accessFeedback bad";
    reset();
  };

  if(row.querySelector(".enabled").value==="1"&&!providerAccess.length){
    fail("${t.noProvider}");
    return;
  }
  if(row.querySelector(".enabled").value==="1"&&providerAccess.some(item=>!item.allowed_models?.length)){
    fail("${t.selectAtLeastOne}");
    return;
  }

  button.disabled=true;
  button.classList.remove("isSaved");
  button.textContent="${t.accessSaving}";
  feedback.textContent="${t.accessSaving}";
  feedback.className="accessFeedback";
  $("msg").textContent="";

  try{
    await api("/access",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      user_id:user.user_id,
      enabled:row.querySelector(".enabled").value==="1",
      provider_access:providerAccess,
      daily_limit_usd:row.querySelector(".daily").value,
      monthly_limit_usd:row.querySelector(".monthly").value,
      daily_limit_tokens:row.querySelector(".dailyTokens").value,
      monthly_limit_tokens:row.querySelector(".monthlyTokens").value,
      requests_per_minute:row.querySelector(".rpm").value
    })});

    button.textContent="${t.accessSaved}";
    button.classList.add("isSaved");
    feedback.textContent="${t.accessSaved}";
    feedback.className="accessFeedback ok";
    $("msg").textContent="${t.saved}";
    $("msg").className="status ok";

    window.setTimeout(()=>{
      if(document.body.contains(button))reset();
    },1800);
    window.setTimeout(()=>{
      if(document.body.contains(feedback)){
        feedback.textContent="";
        feedback.className="accessFeedback";
      }
    },3500);
  }catch(error){
    const message=friendlyError(error);
    fail(message);
    $("msg").textContent=message;
    $("msg").className="status bad";
  }
}


syncProviderType();
updateProviderPickers();
load();
setInterval(load,60000);
</script>
${accountMenuClientScript({ locale: zh ? "zh-cn" : "en" })}
</body>
</html>`;
}
