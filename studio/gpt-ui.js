import { FAVICON_LINKS } from "./favicon.js";
import { accountMenuClientScript, accountMenuMarkup, accountMenuStyles } from "./account-menu.js";

export function renderGptApp(locale, bootstrap = {}) {
  const zh = locale === "zh-cn";
  const bootstrapJson = JSON.stringify({
    config: bootstrap?.config || null,
    conversations: Array.isArray(bootstrap?.conversations) ? bootstrap.conversations : [],
    current: bootstrap?.current || null,
    isAdmin: bootstrap?.isAdmin === true
  }).replace(/</g, "\\u003c");
  const t = zh ? {
    title:"AERTEX Intelligence", subtitle:"Cloud Intelligence", online:"Intelligence 在线", offline:"Intelligence 不可用",
    offlineTitle:"AERTEX Intelligence 暂不可用", offlineText:"当前账号尚未获得 AI 使用权限，或管理员尚未完成 API 配置。",
    checking:"正在加载 Intelligence…", retry:"重新检测", signedOut:"当前账号尚未获得 Intelligence 权限",
    connectHint:"请联系管理员为此账号分配 API Provider、模型和使用额度。",
    connect:"连接 ChatGPT / Codex", connecting:"正在连接…", openLogin:"打开 OpenAI 登录页",
    codeLabel:"设备代码", codeHint:"在 OpenAI 页面输入设备代码完成授权。完成后这里会自动识别登录状态。",
    newChat:"新对话", conversations:"对话", rename:"重命名", delete:"删除", share:"分享", shareCopied:"分享链接已复制", shareFailed:"无法创建分享链接", confirmDelete:"删除这个对话？", untitled:"未命名对话", send:"发送", placeholder:"给 AERTEX Intelligence 发消息…", loadingModels:"正在读取模型…",
    noModels:"没有读取到可用模型", regionBlocked:"当前网络区域不可用", noAvailableRegion:"当前网络区域没有可用的已授权模型", rateLimited:"当前 Provider 返回速率限制，请稍后重试", rateRetry:"建议等待", reasoning:"推理", thinking:"Intelligence 正在思考…",
    empty:"开始一个新的对话", emptyHint:"选择模型后直接开始聊天",
    error:"发生错误",
    bridgeAuth:"本机 Bridge 的安全凭据配置不一致",
    adminConsole:"管理"
  } : {
    title:"AERTEX Intelligence", subtitle:"Cloud Intelligence", online:"Intelligence online", offline:"Intelligence unavailable",
    offlineTitle:"AERTEX Intelligence is unavailable", offlineText:"AI access has not been enabled for this account, or the administrator has not completed API configuration.",
    checking:"Loading Intelligence…", retry:"Check again", signedOut:"Intelligence access is not enabled for this account",
    connectHint:"Ask an administrator to assign an API provider, models, and usage quota to this account.",
    connect:"Connect ChatGPT / Codex", connecting:"Connecting…", openLogin:"Open OpenAI sign-in",
    codeLabel:"Device code", codeHint:"Enter the device code on the OpenAI page. This page will detect completion automatically.",
    newChat:"New chat", conversations:"Chats", rename:"Rename", delete:"Delete", share:"Share", shareCopied:"Share link copied", shareFailed:"Unable to create share link", confirmDelete:"Delete this conversation?", untitled:"Untitled chat", send:"Send", placeholder:"Message AERTEX Intelligence…", loadingModels:"Loading models…",
    noModels:"No available models were returned", regionBlocked:"Unavailable on current network", noAvailableRegion:"No authorized model is available on the current network", rateLimited:"The provider is rate-limiting requests right now. Try again shortly.", rateRetry:"Retry after", reasoning:"Reasoning", thinking:"Intelligence is thinking…",
    empty:"Start a new conversation", emptyHint:"Choose a model and start chatting",
    error:"Error",
    bridgeAuth:"The local Bridge security credentials do not match",
    adminConsole:"Admin"
  };

  return `<!doctype html>
<html lang="${zh ? "zh-CN" : "en"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<title>AERTEX Intelligence</title>
${FAVICON_LINKS}
<style>
:root{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;--bg:#f7f7f5;--panel:#fff;--panel2:#f0f0ee;--text:#171717;--muted:#777;--line:rgba(0,0,0,.09);--accent:#111;--accentText:#fff;--danger:#b42318;--success:#18864b}
@media(prefers-color-scheme:dark){:root{--bg:#101010;--panel:#181818;--panel2:#202020;--text:#f4f4f4;--muted:#9b9b9b;--line:rgba(255,255,255,.09);--accent:#f4f4f4;--accentText:#111;--danger:#ff766d;--success:#52c986}}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text)}button,select,textarea{font:inherit}
.app{min-height:100vh;display:grid;grid-template-columns:270px minmax(0,1fr)}
.sidebar{border-right:1px solid var(--line);padding:18px;background:var(--panel2);display:flex;flex-direction:column;gap:14px}
.brand{font-weight:760;letter-spacing:-.03em;font-size:20px;padding:8px 6px}.brand small{display:block;color:var(--muted);font-size:12px;font-weight:500;letter-spacing:0;margin-top:4px}
.sideButton,.quietButton{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:12px;padding:10px 12px;cursor:pointer}.sideButton{text-align:left}.quietButton{font-size:12px}
.statusRow{display:flex;align-items:center;gap:9px;font-size:13px}.dot{width:9px;height:9px;border-radius:50%;background:var(--muted)}.dot.online{background:var(--success);box-shadow:0 0 0 5px color-mix(in srgb,var(--success) 15%,transparent)}.dot.offline{background:var(--danger);box-shadow:0 0 0 5px color-mix(in srgb,var(--danger) 12%,transparent)}
.sideSectionTitle{padding:8px 6px 2px;color:var(--muted);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em}.chatList{min-height:0;overflow:auto;display:grid;gap:4px}.chatItem{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:4px;border-radius:10px}.chatItem.active{background:var(--panel)}.chatLink{min-width:0;padding:9px 8px;color:var(--text);text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}.chatActions{display:flex;gap:2px;padding-right:4px;opacity:.1}.chatItem:hover .chatActions,.chatItem.active .chatActions{opacity:1}.chatAction{border:0;background:transparent;color:var(--muted);cursor:pointer;padding:5px;border-radius:7px;font-size:12px}.chatAction:hover{background:var(--panel2);color:var(--text)}
.main{min-width:0;height:100vh;display:flex;flex-direction:column}.topbar{height:62px;display:flex;align-items:center;gap:10px;padding:0 18px;border-bottom:1px solid var(--line)}
select{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:10px;padding:8px 10px}.model{min-width:190px;max-width:340px}.account{margin-left:auto;color:var(--muted);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:360px}
.content{flex:1;min-height:0;overflow:auto}.messages{width:min(820px,calc(100% - 32px));margin:0 auto;padding:42px 0 160px}.empty{min-height:58vh;display:grid;place-items:center;text-align:center}.empty h1{font-size:30px;letter-spacing:-.04em;margin:0 0 8px}.empty p{max-width:600px;margin:0;color:var(--muted);line-height:1.7}
.msg{margin:0 0 28px}.msg.user{display:flex;justify-content:flex-end}.msg.user .bubble{max-width:78%;padding:11px 15px;background:var(--panel2);border-radius:18px;white-space:pre-wrap;line-height:1.55}.msg.assistant .bubble{white-space:pre-wrap;line-height:1.72}.status{color:var(--muted);font-size:13px;margin-top:8px}
.composerWrap{position:fixed;left:270px;right:0;bottom:0;padding:18px;background:linear-gradient(to top,var(--bg) 72%,transparent)}.composer{width:min(820px,calc(100% - 32px));margin:0 auto;border:1px solid var(--line);background:var(--panel);border-radius:20px;padding:12px;box-shadow:0 12px 42px rgba(0,0,0,.08)}
textarea{display:block;width:100%;min-height:48px;max-height:180px;resize:none;border:0;outline:0;background:transparent;color:var(--text);padding:4px 6px;line-height:1.5}.composerFoot{display:flex;align-items:center;justify-content:flex-end;margin-top:8px}
.primary{border:0;background:var(--accent);color:var(--accentText);border-radius:11px;padding:8px 14px;cursor:pointer;font-weight:650;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}.primary:disabled{opacity:.45;cursor:not-allowed}
.gate{width:min(650px,calc(100% - 36px));margin:80px auto;padding:28px;border:1px solid var(--line);background:var(--panel);border-radius:22px}.gate h2{margin:0 0 8px;font-size:23px}.gate p{color:var(--muted);line-height:1.65}.gateActions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.adminButton{border:1px solid var(--line);background:var(--accent);color:var(--accentText);border-radius:12px;padding:10px 13px;text-decoration:none;font-weight:700;display:inline-flex;align-items:center;gap:.42em}.adminButton .aertex-wordmark-token{width:5.18687em;height:1em}.code{font:700 28px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;margin:18px 0 8px}.hidden{display:none!important}.error{color:var(--danger)}
@media(max-width:760px){.app{grid-template-columns:1fr}.sidebar{display:none}.composerWrap{left:0}.topbar{padding:0 10px}.model{min-width:0;flex:1}.account{display:none}.messages{padding-top:28px}}
</style>\n<style>${accountMenuStyles()}</style>
</head>
<body>
<div class="app">
<aside class="sidebar">
  <div class="brand">${t.title}<small>${t.subtitle}</small></div>
  <button class="sideButton" id="newChat">${t.newChat}</button>
  <div class="statusRow"><span class="dot" id="sideDot"></span><span id="sideStatus">${t.checking}</span></div>
  <div class="sideSectionTitle">${t.conversations}</div>
  <nav class="chatList" id="conversationList" aria-label="${t.conversations}"></nav>
</aside>
<main class="main">
<header class="topbar">
  <select class="model" id="modelSelect" disabled><option>${t.loadingModels}</option></select>
  <select id="effortSelect" aria-label="${t.reasoning}" disabled><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option><option value="xhigh">Extra High</option></select>
  <div class="account" id="accountLabel">${t.checking}</div>
  <a class="adminButton${bootstrap?.isAdmin === true ? "" : " hidden"}" id="adminConsole" href="/${zh ? "zh-cn" : "en"}/admin">${t.adminConsole}</a>
  ${accountMenuMarkup(zh ? "zh-cn" : "en")}
</header>
<section class="content" id="content">
  <div class="gate" id="gate">
    <h2 id="gateTitle">${t.checking}</h2>
    <p id="gateText">${t.offlineText}</p>
    <div class="gateActions">
      <button class="primary hidden" id="startLogin">${t.connect}</button>
      <button class="quietButton" id="retry">${t.retry}</button>
    </div>
    <div id="devicePanel" class="hidden">
      <div class="code" id="deviceCode"></div><div class="status">${t.codeLabel}</div>
      <div class="gateActions"><a class="primary" id="deviceLink" target="_blank" rel="noopener noreferrer">${t.openLogin}</a></div>
      <p>${t.codeHint}</p>
    </div>
  </div>
  <div class="messages hidden" id="messages"><div class="empty" id="emptyState"><div><h1>${t.empty}</h1><p>${t.emptyHint}</p></div></div></div>
</section>
<div class="composerWrap hidden" id="composerWrap"><div class="composer"><textarea id="composer" placeholder="${t.placeholder}" rows="1"></textarea><div class="composerFoot"><button class="primary" id="sendButton">${t.send}</button></div></div></div>
</main>
</div>
<script>
(() => {
  const text=${JSON.stringify(t)}, boot=${bootstrapJson}, $=id=>document.getElementById(id);
  const localeBase=location.pathname.startsWith("/en")?"/en":"/zh-cn";
  const state={
    config:boot.config||null,
    conversations:Array.isArray(boot.conversations)?boot.conversations:[],
    current:boot.current||null,
    conversationId:boot.current?.conversation?.id||"",
    busy:false,
    isAdmin:boot.isAdmin===true
  };

  async function req(path,opt={}){
    const r=await fetch("/api/ai"+path,{...opt,credentials:"same-origin",cache:"no-store",headers:{Accept:"application/json",...(opt.headers||{})}});
    const type=r.headers.get("content-type")||"";
    const d=type.includes("application/json")?await r.json():null;
    if(r.status===401){location.reload();throw new Error("Authentication required")}
    if(!r.ok)throw new Error(d?.error||("HTTP "+r.status));
    return d;
  }
  function routeFor(id){return localeBase+"/c/"+id}
  function setStatus(ok,label){$("sideDot").className="dot "+(ok?"online":"offline");$("sideStatus").textContent=label;$("accountLabel").textContent=label}
  function gate(title,message){$("gate").classList.remove("hidden");$("messages").classList.add("hidden");$("composerWrap").classList.add("hidden");$("gateTitle").textContent=title;$("gateText").textContent=message;$("startLogin").classList.add("hidden");$("devicePanel").classList.add("hidden")}
  function showChat(){$("gate").classList.add("hidden");$("messages").classList.remove("hidden");$("composerWrap").classList.remove("hidden")}
  function append(role,content,scroll=true){
    $("emptyState").classList.add("hidden");
    const root=document.createElement("div");root.className="msg "+role;
    const bubble=document.createElement("div");bubble.className="bubble";bubble.textContent=content;
    root.appendChild(bubble);$("messages").appendChild(root);
    if(scroll)$("content").scrollTop=$("content").scrollHeight;
    return bubble;
  }
  function renderCurrent(){
    $("messages").querySelectorAll(".msg").forEach(node=>node.remove());
    const items=Array.isArray(state.current?.messages)?state.current.messages:[];
    if(!items.length){$("emptyState").classList.remove("hidden");return}
    $("emptyState").classList.add("hidden");
    for(const item of items)append(item.role==="user"?"user":"assistant",item.content||"",false);
    $("content").scrollTop=$("content").scrollHeight;
  }
  function renderConversationList(){
    const root=$("conversationList");root.replaceChildren();
    for(const item of state.conversations){
      const row=document.createElement("div");row.className="chatItem"+(item.id===state.conversationId?" active":"");
      const link=document.createElement("a");link.className="chatLink";link.href=routeFor(item.id);link.textContent=item.title||text.untitled;link.title=item.title||text.untitled;
      const actions=document.createElement("div");actions.className="chatActions";
      const rename=document.createElement("button");rename.className="chatAction";rename.type="button";rename.dataset.action="rename";rename.dataset.id=item.id;rename.textContent="✎";rename.title=text.rename;
      const share=document.createElement("button");share.className="chatAction";share.type="button";share.dataset.action="share";share.dataset.id=item.id;share.textContent="↗";share.title=text.share;
      const del=document.createElement("button");del.className="chatAction";del.type="button";del.dataset.action="delete";del.dataset.id=item.id;del.textContent="×";del.title=text.delete;
      actions.append(rename,share,del);row.append(link,actions);root.append(row);
    }
  }
  async function loadConversations(){
    try{
      const data=await req("/conversations");
      state.conversations=Array.isArray(data)?data:[];
      renderConversationList();
    }catch{}
  }
  function hydrateConfig(cfg){
    state.config=cfg;
    const select=$("modelSelect");select.textContent="";
    const models=Array.isArray(cfg?.models)?cfg.models:[];
    const providers=Array.isArray(cfg?.providers)?cfg.providers:[];
    for(const provider of providers){
      const group=document.createElement("optgroup");
      group.label=(provider.provider==="zhipu"?"智谱 GLM · ":provider.provider==="bailian"?"阿里云百炼 · ":"OpenAI · ")+(provider.name||"");
      for(const item of models.filter(model=>model.provider_id===provider.id)){
        const option=document.createElement("option");
        option.value=item.model;option.dataset.providerId=item.provider_id;option.disabled=item.available===false;
        option.textContent=item.model+(item.available===false?" · "+text.regionBlocked:"");
        const current=state.current?.conversation;
        if(current&&item.provider_id===current.provider_id&&item.model===current.model&&item.available!==false)option.selected=true;
        else if(!current&&item.provider_id===cfg.default_provider_id&&item.model===cfg.default_model&&item.available!==false)option.selected=true;
        group.appendChild(option);
      }
      if(group.children.length)select.appendChild(group);
    }
    const available=models.filter(item=>item.available!==false);
    if(!select.options.length){const option=document.createElement("option");option.textContent=text.noModels;option.disabled=true;select.appendChild(option)}
    if(available.length&&!select.selectedOptions.length){const first=[...select.options].find(option=>!option.disabled);if(first)first.selected=true}
    select.disabled=false;$("sendButton").disabled=!available.length;$("effortSelect").classList.add("hidden");
    if(available.length){
      setStatus(true,text.online);
      const activeProviders=providers.filter(provider=>provider.available!==false).map(provider=>provider.name).filter(Boolean);
      $("accountLabel").textContent=activeProviders.join(" · ")||text.online;
    }else{
      setStatus(false,text.noAvailableRegion);$("accountLabel").textContent=text.noAvailableRegion;
    }
    showChat();renderCurrent();
  }
  async function checkStatus(force=false){
    try{
      const cfg=!force&&state.config?state.config:await req("/config");
      hydrateConfig(cfg);return true;
    }catch(e){
      setStatus(false,text.offline);gate(text.signedOut,e.message||text.connectHint);return false;
    }
  }
  async function send(){
    const message=$("composer").value.trim();if(!message||state.busy)return;
    state.busy=true;$("sendButton").disabled=true;$("composer").value="";
    append("user",message);
    const assistant=append("assistant",""),status=document.createElement("div");
    status.className="status";status.textContent=text.thinking;assistant.parentElement.appendChild(status);
    let createdNow=false;
    try{
      const selected=$("modelSelect").selectedOptions[0];
      if(!selected||selected.disabled)throw new Error(text.noAvailableRegion);
      const r=await fetch("/api/ai/chat",{method:"POST",credentials:"same-origin",cache:"no-store",headers:{"Content-Type":"application/json",Accept:"text/event-stream"},body:JSON.stringify({conversation_id:state.conversationId||null,message,model:selected.value,provider_id:selected.dataset.providerId||null})});
      if(r.status===401){location.reload();return}
      if(!r.ok||!r.body){
        const d=await r.json().catch(()=>null);
        if(d?.code==="REGION_UNSUPPORTED"&&d?.provider_id){
          [...$("modelSelect").options].forEach(option=>{if(option.dataset.providerId===d.provider_id){option.disabled=true;option.textContent=option.value+" · "+text.regionBlocked}});
          $("sendButton").disabled=![...$("modelSelect").options].some(option=>!option.disabled);
        }
        if(d?.code==="RATE_LIMITED"){const wait=Number(d?.diagnostic?.retry_after_seconds);throw new Error(text.rateLimited+(Number.isFinite(wait)&&wait>0?" "+text.rateRetry+" "+wait+"s":""))}
        throw new Error(d?.error||("HTTP "+r.status));
      }
      const reader=r.body.getReader(),decoder=new TextDecoder();let buffer="",streamed="";
      while(true){
        const x=await reader.read();if(x.done)break;buffer+=decoder.decode(x.value,{stream:true});
        let i;
        while((i=buffer.indexOf("\\n\\n"))>=0){
          const block=buffer.slice(0,i);buffer=buffer.slice(i+2);let event="message",payload=null;
          for(const line of block.split("\\n")){
            if(line.startsWith("event:"))event=line.slice(6).trim();
            if(line.startsWith("data:")){try{payload=JSON.parse(line.slice(5).trim())}catch{}}
          }
          if(event==="meta"&&payload?.conversation_id){
            if(!state.conversationId)createdNow=true;
            state.conversationId=payload.conversation_id;
            history.replaceState({conversationId:state.conversationId},"",routeFor(state.conversationId));
          }
          if(event==="delta"&&payload?.delta){streamed+=payload.delta;assistant.textContent=streamed;$("content").scrollTop=$("content").scrollHeight}
          if(event==="done")status.textContent="";
          if(event==="error")throw new Error(payload?.error||text.error);
        }
      }
      if(!assistant.textContent)assistant.textContent="—";
      if(createdNow)state.current={conversation:{id:state.conversationId,title:message.slice(0,80),model:selected.value,provider_id:selected.dataset.providerId||null},messages:[]};
      void loadConversations();
    }catch(e){
      assistant.textContent=e.message||text.error;assistant.classList.add("error");status.textContent="";
    }finally{
      state.busy=false;$("sendButton").disabled=false;$("composer").focus();
    }
  }
  $("conversationList").addEventListener("click",async event=>{
    const button=event.target.closest("[data-action]");if(!button)return;
    event.preventDefault();event.stopPropagation();
    const id=button.dataset.id,action=button.dataset.action;
    const item=state.conversations.find(value=>value.id===id);if(!item)return;
    if(action==="rename"){
      const title=window.prompt(text.rename,item.title||text.untitled);if(!title?.trim())return;
      try{await req("/conversations/"+id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:title.trim()})});await loadConversations()}catch{}
    }
    if(action==="delete"){
      if(!window.confirm(text.confirmDelete))return;
      try{await req("/conversations/"+id,{method:"DELETE"});if(id===state.conversationId){state.conversationId="";state.current=null;history.replaceState({},"",localeBase);$("messages").querySelectorAll(".msg").forEach(n=>n.remove());$("emptyState").classList.remove("hidden")}await loadConversations()}catch{}
    }
    if(action==="share"){
      try{
        const result=await req("/conversations/"+id+"/share",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});
        const url=location.origin+(result.share_path||("/share/"+result.share_token));
        try{await navigator.clipboard.writeText(url);window.alert(text.shareCopied)}catch{window.prompt(text.share,url)}
      }catch{window.alert(text.shareFailed)}
    }
  });
  $("retry").addEventListener("click",()=>void checkStatus(true));
  $("newChat").addEventListener("click",()=>{
    state.conversationId="";state.current=null;history.pushState({},"",localeBase);
    $("messages").querySelectorAll(".msg").forEach(n=>n.remove());$("emptyState").classList.remove("hidden");renderConversationList();$("composer").focus();
  });
  $("sendButton").addEventListener("click",send);
  $("composer").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();void send()}});
  $("composer").addEventListener("input",e=>{e.currentTarget.style.height="auto";e.currentTarget.style.height=Math.min(e.currentTarget.scrollHeight,180)+"px"});
  renderConversationList();
  if(state.config)hydrateConfig(state.config);else void checkStatus();
})();
</script>
${accountMenuClientScript({ locale: zh ? "zh-cn" : "en" })}
</body></html>`;
}


export function renderSharedConversation(locale, payload) {
  const zh = locale === "zh-cn";
  const conversation = payload?.conversation || {};
  const messages = Array.isArray(payload?.messages) ? payload.messages : [];
  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const title = esc(conversation.title || (zh ? "共享对话" : "Shared conversation"));
  const body = messages.map(item => {
    const role = item?.role === "user" ? (zh ? "用户" : "User") : "AERTEX";
    return '<article class="msg '+(item?.role === "user" ? "user" : "assistant")+'"><div class="role">'+role+'</div><div class="bubble">'+esc(item?.content || "")+'</div></article>';
  }).join("");
  return '<!doctype html><html lang="'+(zh ? "zh-CN" : "en")+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><title>'+title+' · AERTEX Intelligence</title>'+FAVICON_LINKS+'<style>:root{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;--bg:#f7f7f5;--panel:#fff;--panel2:#f0f0ee;--text:#171717;--muted:#777;--line:rgba(0,0,0,.09)}@media(prefers-color-scheme:dark){:root{--bg:#101010;--panel:#181818;--panel2:#202020;--text:#f4f4f4;--muted:#9b9b9b;--line:rgba(255,255,255,.09)}}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text)}main{width:min(860px,calc(100% - 32px));margin:0 auto;padding:38px 0 80px}header{padding-bottom:24px;border-bottom:1px solid var(--line)}h1{margin:0;font-size:30px;letter-spacing:-.04em}.meta{margin-top:8px;color:var(--muted);font-size:13px}.msg{padding:24px 0;border-bottom:1px solid var(--line)}.role{font-size:12px;font-weight:700;color:var(--muted);margin-bottom:8px}.bubble{white-space:pre-wrap;line-height:1.72}.user .bubble{display:inline-block;background:var(--panel2);padding:10px 14px;border-radius:16px}.footer{margin-top:28px;color:var(--muted);font-size:12px}</style></head><body><main><header><h1>'+title+'</h1><div class="meta">'+(zh ? "AERTEX Intelligence 共享对话 · 只读" : "AERTEX Intelligence shared conversation · Read only")+'</div></header>'+body+'<div class="footer">'+(zh ? "此链接由对话所有者主动分享" : "This link was explicitly shared by the conversation owner")+'</div></main></body></html>';
}
