import { FAVICON_LINKS } from "./favicon.js";

export function renderGptApp(locale) {
  const zh = locale === "zh-cn";
  const t = zh ? {
    title:"AERTEX Intelligence", subtitle:"Cloud Intelligence", online:"Intelligence 在线", offline:"Intelligence 不可用",
    offlineTitle:"AERTEX Intelligence 暂不可用", offlineText:"当前账号尚未获得 AI 使用权限，或管理员尚未完成 API 配置。",
    checking:"正在加载 Intelligence…", retry:"重新检测", signedOut:"当前账号尚未获得 Intelligence 权限",
    connectHint:"请联系管理员为此账号分配 API Provider、模型和使用额度。",
    connect:"连接 ChatGPT / Codex", connecting:"正在连接…", openLogin:"打开 OpenAI 登录页",
    codeLabel:"设备代码", codeHint:"在 OpenAI 页面输入设备代码完成授权。完成后这里会自动识别登录状态。",
    newChat:"新对话", send:"发送", placeholder:"给 AERTEX Intelligence 发消息…", loadingModels:"正在读取模型…",
    noModels:"没有读取到可用模型", reasoning:"推理", thinking:"Codex 正在思考…",
    empty:"开始一个新的对话", emptyHint:"消息由 AERTEX 服务端安全转发到管理员配置的 AI Provider，并以流式方式返回。",
    error:"发生错误", privateNote:"API 凭据只保存在服务端。你的浏览器不会接触管理员配置的 API Key。",
    bridgeAuth:"本机 Bridge 的安全凭据配置不一致。"
  } : {
    title:"AERTEX Intelligence", subtitle:"Cloud Intelligence", online:"Intelligence online", offline:"Intelligence unavailable",
    offlineTitle:"AERTEX Intelligence is unavailable", offlineText:"AI access has not been enabled for this account, or the administrator has not completed API configuration.",
    checking:"Loading Intelligence…", retry:"Check again", signedOut:"Intelligence access is not enabled for this account",
    connectHint:"Ask an administrator to assign an API provider, models, and usage quota to this account.",
    connect:"Connect ChatGPT / Codex", connecting:"Connecting…", openLogin:"Open OpenAI sign-in",
    codeLabel:"Device code", codeHint:"Enter the device code on the OpenAI page. This page will detect completion automatically.",
    newChat:"New chat", send:"Send", placeholder:"Message AERTEX Intelligence…", loadingModels:"Loading models…",
    noModels:"No available models were returned", reasoning:"Reasoning", thinking:"Codex is thinking…",
    empty:"Start a new conversation", emptyHint:"Messages are securely proxied by AERTEX to the administrator-configured AI provider and streamed back here.",
    error:"Error", privateNote:"API credentials remain server-side. Your browser never receives the administrator API key.",
    bridgeAuth:"The local Bridge security credentials do not match."
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
.meta{margin-top:auto;color:var(--muted);font-size:11px;line-height:1.55;padding:6px}.statusRow{display:flex;align-items:center;gap:9px;font-size:13px}.dot{width:9px;height:9px;border-radius:50%;background:var(--muted)}.dot.online{background:var(--success);box-shadow:0 0 0 5px color-mix(in srgb,var(--success) 15%,transparent)}.dot.offline{background:var(--danger);box-shadow:0 0 0 5px color-mix(in srgb,var(--danger) 12%,transparent)}
.main{min-width:0;height:100vh;display:flex;flex-direction:column}.topbar{height:62px;display:flex;align-items:center;gap:10px;padding:0 18px;border-bottom:1px solid var(--line)}
select{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:10px;padding:8px 10px}.model{min-width:190px;max-width:340px}.account{margin-left:auto;color:var(--muted);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:360px}
.content{flex:1;min-height:0;overflow:auto}.messages{width:min(820px,calc(100% - 32px));margin:0 auto;padding:42px 0 160px}.empty{min-height:58vh;display:grid;place-items:center;text-align:center}.empty h1{font-size:30px;letter-spacing:-.04em;margin:0 0 8px}.empty p{max-width:600px;margin:0;color:var(--muted);line-height:1.7}
.msg{margin:0 0 28px}.msg.user{display:flex;justify-content:flex-end}.msg.user .bubble{max-width:78%;padding:11px 15px;background:var(--panel2);border-radius:18px;white-space:pre-wrap;line-height:1.55}.msg.assistant .bubble{white-space:pre-wrap;line-height:1.72}.status{color:var(--muted);font-size:13px;margin-top:8px}
.composerWrap{position:fixed;left:270px;right:0;bottom:0;padding:18px;background:linear-gradient(to top,var(--bg) 72%,transparent)}.composer{width:min(820px,calc(100% - 32px));margin:0 auto;border:1px solid var(--line);background:var(--panel);border-radius:20px;padding:12px;box-shadow:0 12px 42px rgba(0,0,0,.08)}
textarea{display:block;width:100%;min-height:48px;max-height:180px;resize:none;border:0;outline:0;background:transparent;color:var(--text);padding:4px 6px;line-height:1.5}.composerFoot{display:flex;align-items:center;justify-content:flex-end;margin-top:8px}
.primary{border:0;background:var(--accent);color:var(--accentText);border-radius:11px;padding:8px 14px;cursor:pointer;font-weight:650;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}.primary:disabled{opacity:.45;cursor:not-allowed}
.gate{width:min(650px,calc(100% - 36px));margin:80px auto;padding:28px;border:1px solid var(--line);background:var(--panel);border-radius:22px}.gate h2{margin:0 0 8px;font-size:23px}.gate p{color:var(--muted);line-height:1.65}.gateActions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.code{font:700 28px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;margin:18px 0 8px}.hidden{display:none!important}.error{color:var(--danger)}
@media(max-width:760px){.app{grid-template-columns:1fr}.sidebar{display:none}.composerWrap{left:0}.topbar{padding:0 10px}.model{min-width:0;flex:1}.account{display:none}.messages{padding-top:28px}}
</style>
</head>
<body>
<div class="app">
<aside class="sidebar">
  <div class="brand">${t.title}<small>${t.subtitle}</small></div>
  <button class="sideButton" id="newChat">${t.newChat}</button>
  <div class="statusRow"><span class="dot" id="sideDot"></span><span id="sideStatus">${t.checking}</span></div>
  <div class="meta">${t.privateNote}</div>
</aside>
<main class="main">
<header class="topbar">
  <select class="model" id="modelSelect" disabled><option>${t.loadingModels}</option></select>
  <select id="effortSelect" aria-label="${t.reasoning}" disabled><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option><option value="xhigh">Extra High</option></select>
  <div class="account" id="accountLabel">${t.checking}</div>
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
  const text=${JSON.stringify(t)}, $=id=>document.getElementById(id);
  const state={config:null,conversationId:"",busy:false};
  async function req(path,opt={}){const r=await fetch("/api/ai"+path,{...opt,credentials:"same-origin",cache:"no-store",headers:{Accept:"application/json",...(opt.headers||{})}});const type=r.headers.get("content-type")||"";const d=type.includes("application/json")?await r.json():null;if(r.status===401){location.reload();throw new Error("Authentication required");}if(!r.ok)throw new Error(d?.error||("HTTP "+r.status));return d}
  function setStatus(ok,label){$("sideDot").className="dot "+(ok?"online":"offline");$("sideStatus").textContent=label;$("accountLabel").textContent=label}
  function gate(title,message){$("gate").classList.remove("hidden");$("messages").classList.add("hidden");$("composerWrap").classList.add("hidden");$("gateTitle").textContent=title;$("gateText").textContent=message;$("startLogin").classList.add("hidden");$("devicePanel").classList.add("hidden")}
  function showChat(){$("gate").classList.add("hidden");$("messages").classList.remove("hidden");$("composerWrap").classList.remove("hidden")}
  async function checkStatus(){try{const cfg=await req("/config");state.config=cfg;setStatus(true,text.online);$("accountLabel").textContent=cfg.provider?.name||text.online;const select=$("modelSelect");select.textContent="";for(const model of cfg.models||[]){const o=document.createElement("option");o.value=model;o.textContent=model;if(model===cfg.default_model)o.selected=true;select.appendChild(o)}select.disabled=false;$("effortSelect").classList.add("hidden");showChat();return true}catch(e){setStatus(false,text.offline);gate(text.signedOut,e.message||text.connectHint);return false}}
  function append(role,content){$("emptyState").classList.add("hidden");const root=document.createElement("div");root.className="msg "+role;const bubble=document.createElement("div");bubble.className="bubble";bubble.textContent=content;root.appendChild(bubble);$("messages").appendChild(root);$("content").scrollTop=$("content").scrollHeight;return bubble}
  async function send(){
    const message=$("composer").value.trim(); if(!message||state.busy)return;
    state.busy=true; $("sendButton").disabled=true; $("composer").value="";
    append("user",message);
    const assistant=append("assistant",""), status=document.createElement("div");
    status.className="status"; status.textContent=text.thinking; assistant.parentElement.appendChild(status);
    try {
      const r=await fetch("/api/ai/chat",{method:"POST",credentials:"same-origin",cache:"no-store",headers:{"Content-Type":"application/json",Accept:"text/event-stream"},body:JSON.stringify({conversation_id:state.conversationId||null,message,model:$("modelSelect").value})});
      if(r.status===401){location.reload();return}
      if(!r.ok||!r.body){const d=await r.json().catch(()=>null);throw new Error(d?.error||("HTTP "+r.status))}
      const reader=r.body.getReader(), decoder=new TextDecoder(); let buffer="",streamed="";
      while(true){
        const x=await reader.read(); if(x.done)break; buffer+=decoder.decode(x.value,{stream:true});
        let i;
        while((i=buffer.indexOf("\\n\\n"))>=0){
          const block=buffer.slice(0,i); buffer=buffer.slice(i+2); let event="message",payload=null;
          for(const line of block.split("\\n")){
            if(line.startsWith("event:"))event=line.slice(6).trim();
            if(line.startsWith("data:")){try{payload=JSON.parse(line.slice(5).trim())}catch{}}
          }
          if(event==="meta"&&payload?.conversation_id)state.conversationId=payload.conversation_id;
          if(event==="delta"&&payload?.delta){streamed+=payload.delta;assistant.textContent=streamed;$("content").scrollTop=$("content").scrollHeight}
          if(event==="done")status.textContent="";
          if(event==="error")throw new Error(payload?.error||text.error);
        }
      }
      if(!assistant.textContent)assistant.textContent="—";
    } catch(e) {
      assistant.textContent=e.message||text.error; assistant.classList.add("error"); status.textContent="";
    } finally {
      state.busy=false; $("sendButton").disabled=false; $("composer").focus();
    }
  }
  $("retry").addEventListener("click",checkStatus);$("newChat").addEventListener("click",()=>{state.conversationId="";$("messages").querySelectorAll(".msg").forEach(n=>n.remove());$("emptyState").classList.remove("hidden")});$("sendButton").addEventListener("click",send);$("composer").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();void send()}});$("composer").addEventListener("input",e=>{e.currentTarget.style.height="auto";e.currentTarget.style.height=Math.min(e.currentTarget.scrollHeight,180)+"px"});void checkStatus();
})();
</script>
</body></html>`;
}
