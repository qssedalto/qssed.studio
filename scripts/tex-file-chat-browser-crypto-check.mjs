import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdtempSync, existsSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { enhanceWorkTexFileChat } from "../studio/ui-work-tex-file-chat.js";
import { enhanceWorkTexToolbarScroll } from "../studio/ui-work-tex-toolbar-scroll.js";

const binary=[process.env.CHROME_BINARY,"/usr/bin/google-chrome","/usr/bin/chromium",
  "/opt/google/chrome/chrome"].filter(Boolean).find(existsSync);
if(!binary)throw Error("Chrome required for live E2EE browser integration test");
const owner="11111111-1111-4111-8111-111111111111";
const projectA="22222222-2222-4222-8222-222222222222";
const projectB="33333333-3333-4333-8333-333333333333";
const memory={device:new Map(),envelopes:new Map(),messages:[],sentPlaintext:false,
  sentFileSelector:false,passkeyCalls:0};
const setup=[
  "<script>",
  "window.__qaActiveFile='main.tex';",
  "window.__aertexTexExplorerAsset=()=>({name:window.__qaActiveFile});",
  "Object.defineProperty(navigator,'credentials',{configurable:true,value:{",
  "create:()=>{throw Error('Unexpected Passkey CREATE')},",
  "get:()=>{throw Error('Unexpected Passkey GET')}}});",
  "</script>"
].join("\n");
const qa=[
  "<script>",
  "(async()=>{",
  " const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));",
  " async function until(fn,ms=10000){const t=Date.now();while(Date.now()-t<ms){",
  "  if(fn())return;await sleep(70)}throw Error('Timed out waiting for encrypted chat state')}",
  " try{",
  "   const round=new URL(location.href).searchParams.get('round');",
  "   await until(()=>document.getElementById('tex-command-chat-shortcut'));",
  "   const button=document.getElementById('tex-command-chat-shortcut');",
  "   button.click();",
  "   await until(()=>!document.getElementById('aertex-filechat').hidden);",
  "   const panel=document.getElementById('aertex-filechat');",
  "   const conversation=document.getElementById('aertex-chat-conversation');",
  "   const send=document.getElementById('aertex-chat-send');",
  "   const status=document.getElementById('aertex-chat-status');",
  "   if(panel.querySelector('#aertex-chat-passkey'))throw Error('Passkey UI must be removed');",
  "   if(panel.querySelector('#aertex-chat-help-view'))throw Error('Legacy Passkey help must be removed');",
  "   if(round==='fresh'){",
  "     await until(()=>status.textContent.includes('等待项目密钥同步'));",
  "     if(panel.hidden||!send.disabled)throw Error('New encryption identity must wait for owner key');",
  "     document.body.dataset.filechatCryptoQa='PASS';return;",
  "   }",
  "   await until(()=>!send.disabled,10000);",
  "   if(conversation.hidden)throw Error('Authorized project chat did not open automatically');",
  "   if(round==='first'){",
  "     document.getElementById('aertex-chat-input').value='Private browser-to-browser encrypted message';",
  "     send.click();",
  "     await until(()=>document.getElementById('aertex-chat-feed').textContent.includes('Private browser-to-browser'));",
  "   }else{",
  "     await until(()=>document.getElementById('aertex-chat-feed').textContent.includes('Private browser-to-browser'));",
  "     const roomTitle=document.getElementById('aertex-chat-filename').textContent;",
  "     window.__qaActiveFile='chapters/new.tex';",
  "     window.dispatchEvent(new Event('aertex:tex-project-asset-selected'));",
  "     await sleep(250);",
  "     if(panel.hidden||conversation.hidden||send.disabled)throw Error('File switch relocked project chat');",
  "     if(document.getElementById('aertex-chat-filename').textContent!==roomTitle)",
  "       throw Error('File switch changed project chat identity');",
  "     document.querySelector('.tex-work-app').dataset.texCollaborationDocumentId='33333333-3333-4333-8333-333333333333';",
  "     await until(()=>!document.getElementById('aertex-chat-feed').textContent.includes('Private browser-to-browser'));",
  "     if(panel.hidden)throw Error('Project switch closed floating popup');",
  "   }",
  "   document.body.dataset.filechatCryptoQa='PASS';",
  " }catch(e){document.body.dataset.filechatCryptoQa='FAIL';",
  "  document.body.dataset.filechatCryptoReason=(e.message||String(e))+' | status: '+",
  "    (document.getElementById('aertex-chat-status')?.textContent||'')}",
  "})();",
  "</script>"
].join("\n");
const markup='<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">'
 +'<meta name="viewport" content="width=device-width,initial-scale=1">'
 +'<style>body{margin:0;font-family:system-ui}.tex-work-app{height:85vh}'
 +'.tex-source-label{display:flex;gap:6px;align-items:center;padding:9px;border-bottom:1px solid #ccc}'
 +'.tex-editor-commandbar{display:flex;min-width:0}</style></head><body class="os-shell">'
 +'<div class="tex-work-app" data-tex-root data-tex-collaboration-document-id='
 +'"22222222-2222-4222-8222-222222222222"><div class="tex-source-label">'
 +'<span>TeX 源码</span><div class="tex-editor-commandbar"></div>'
 +'<div id="tex-realtime-status">同步中</div><div>36 行 · 833 字符</div></div></div>'
 +setup+enhanceWorkTexToolbarScroll("",true)+enhanceWorkTexFileChat("",true)+qa+'</body></html>';

function json(res,obj,status=200){
  res.writeHead(status,{"content-type":"application/json;charset=utf-8","cache-control":"no-store"});
  res.end(JSON.stringify(obj));
}
const server=createServer(async(req,res)=>{
  if(req.method==="GET"){
    res.writeHead(200,{"content-type":"text/html;charset=utf-8","cache-control":"no-store"});
    res.end(markup);return;
  }
  if(req.method!=="POST"||req.url!=="/api/tex/file-chat")return json(res,{error:"Not found"},404);
  let raw="";for await(const chunk of req){raw+=chunk;if(raw.length>35000)break}
  let b;try{b=JSON.parse(raw)}catch{return json(res,{error:"Bad request"},400)}
  const op=b.op,project=b.document_id;
  if(Object.hasOwn(b,"file_name"))memory.sentFileSelector=true;
  if(op==="begin"||op==="verify"){memory.passkeyCalls++;return json(res,{error:"Passkey removed"},410)}
  if(op==="status")return json(res,{user_id:owner,owner_id:owner,role:"owner"});
  if(op==="device"){
    memory.device.set(project+":"+b.device_id,{id:b.device_id,x:b.x,y:b.y,project});
    return json(res,{registered:true});
  }
  if(op==="devices"){
    return json(res,{initialized:[...memory.envelopes.values()].some(e=>e.project===project),
      devices:[...memory.device.values()].filter(d=>d.project===project).map(d=>({
        user_id:owner,device_id:d.id,x:d.x,y:d.y,
        ready:memory.envelopes.has(project+":"+d.id)}))});
  }
  if(op==="envelope-put"){
    if(memory.envelopes.has(project+":"+b.to_device))return json(res,{error:"Already initialized"},409);
    memory.envelopes.set(project+":"+b.to_device,{
      to_user:b.to_user,to_device:b.to_device,from_device:b.from_device,
      iv:b.iv,ct:b.ct,project
    });
    return json(res,{saved:true});
  }
  if(op==="envelope-get"){
    const e=memory.envelopes.get(project+":"+b.device_id);
    if(!e)return json(res,{ready:false});
    const from=memory.device.get(project+":"+e.from_device);
    return json(res,{ready:true,envelope:e,owner_public:{x:from.x,y:from.y}});
  }
  if(op==="messages")return json(res,{messages:memory.messages.filter(m=>m.project===project)});
  if(op==="latest"){
    const messages=memory.messages.filter(m=>m.project===project);
    const last=messages.at(-1);
    return json(res,{last:last?{id:last.id,at:last.at,user_id:last.user_id,sender_name:"Owner"}:null});
  }
  if(op==="send"){
    if(b.text||b.message||!b.ct||!b.iv)memory.sentPlaintext=true;
    memory.messages.push({id:b.message_id,project,user_id:owner,iv:b.iv,ct:b.ct,at:Date.now()});
    return json(res,{sent:true});
  }
  return json(res,{error:"Unknown op"},404);
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const origin="http://127.0.0.1:"+server.address().port;
const profile=mkdtempSync(path.join(tmpdir(),"aertex-filechat-e2ee-chrome-"));

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function browserRound(round){
  const browserProfile=round==="fresh"?profile+"-fresh":profile;
  const portFile=path.join(browserProfile,"DevToolsActivePort");
  rmSync(portFile,{force:true});
  const child=spawn(binary,[
    "--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-gpu",
    "--no-first-run","--user-data-dir="+browserProfile,"--window-size=900,780",
    "--remote-debugging-port=0",origin+"/?round="+round
  ],{stdio:["ignore","ignore","pipe"]});
  let stderr="",websocket=null,messageId=0;
  const callbacks=new Map(),exceptions=[];
  child.stderr.on("data",d=>{stderr=(stderr+String(d)).slice(-6500)});
  const deadline=Date.now()+37000;
  async function command(method,params={}){
    return new Promise((resolve,reject)=>{
      if(!websocket||websocket.readyState!==WebSocket.OPEN)return reject(Error("CDP closed"));
      const id=++messageId;
      const timeout=setTimeout(()=>{callbacks.delete(id);reject(Error("CDP timeout: "+method))},4000);
      callbacks.set(id,{resolve,reject,timeout});
      websocket.send(JSON.stringify({id,method,params}));
    });
  }
  try{
    let port="";
    while(Date.now()<deadline){
      if(child.exitCode!==null)throw Error("Chrome exited: "+stderr);
      if(existsSync(portFile)){port=readFileSync(portFile,"utf8").split("\n")[0];break}
      await sleep(100);
    }
    if(!port)throw Error("Chrome DevTools port unavailable: "+stderr);
    let tab=null;
    while(Date.now()<deadline){
      try{
        const tabs=await (await fetch("http://127.0.0.1:"+port+"/json")).json();
        tab=tabs.find(x=>x.type==="page"&&x.url.includes("round="+round));
        if(tab)break;
      }catch{}
      await sleep(120);
    }
    if(!tab)throw Error("E2EE test tab not found: "+stderr);
    websocket=new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((resolve,reject)=>{
      websocket.addEventListener("open",resolve,{once:true});
      websocket.addEventListener("error",reject,{once:true});
    });
    websocket.addEventListener("message",event=>{
      let data;
      try{data=JSON.parse(event.data)}catch{return}
      if(data.id){
        const callback=callbacks.get(data.id);
        if(callback){
          clearTimeout(callback.timeout);callbacks.delete(data.id);
          if(data.error)callback.reject(Error(JSON.stringify(data.error)));
          else callback.resolve(data.result||{});
        }
      }
      if(data.method==="Runtime.exceptionThrown")
        exceptions.push(data.params?.exceptionDetails?.text||"JS exception");
    });
    await command("Runtime.enable");
    let report={};
    while(Date.now()<deadline){
      const response=await command("Runtime.evaluate",{
        expression:"JSON.stringify({status:document.body?.dataset?.filechatCryptoQa||'',reason:document.body?.dataset?.filechatCryptoReason||'',banner:document.getElementById('aertex-chat-status')?.textContent||'',passkey:document.getElementById('aertex-chat-passkey')?.textContent||''})",
        returnByValue:true
      });
      if(response.result?.value){
        report=JSON.parse(response.result.value);
        if(report.status)break;
      }
      await sleep(190);
    }
    if(report.status!=="PASS")throw Error("File E2EE browser round "+round+" failed: "+
      JSON.stringify(report)+" exceptions="+exceptions.join(" | ")+" stderr="+stderr.slice(-1700));
  }finally{
    try{websocket?.close()}catch{}
    child.kill("SIGTERM");
    await Promise.race([
      new Promise(resolve=>child.once("close",resolve)),
      sleep(1800)
    ]);
    if(child.exitCode===null)child.kill("SIGKILL");
  }
}

try{
  await browserRound("first");
  assert.equal(memory.messages.length,1,"Must send a fully encrypted message");
  assert(!memory.sentPlaintext,"Server must never see message plaintext");
  assert(!JSON.stringify(memory.messages).includes("Private browser-to-browser"),
    "Messages must be ciphertext only");
  await browserRound("second");
  await browserRound("fresh");
  assert.equal(memory.passkeyCalls,0,"No WebAuthn calls allowed in any browser");
  assert(!memory.sentFileSelector,"Project chat API never selects rooms by filename");
  console.log("REAL CHROME E2EE: direct project entry, encrypted send, refresh decrypt, fresh profile without Passkey and project isolation PASS");
}finally{
  await new Promise(resolve=>server.close(resolve));
  rmSync(profile,{recursive:true,force:true});
  rmSync(profile+"-fresh",{recursive:true,force:true});
}
