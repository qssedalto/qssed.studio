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
const memory={registered:new Set(),device:new Map(),envelopes:new Map(),messages:[],
  sentPlaintext:false,sentFileSelector:false,verified:0};
const setup=[
  "<script>",
  "window.__qaActiveFile='main.tex';",
  "window.__aertexTexExplorerAsset=()=>({name:window.__qaActiveFile});",
  "const fakeId=new Uint8Array(32).fill(7);",
  "window.__passkeyCreateCount=0;window.__passkeyGetCount=0;",
  "const fakeCredentials={",
  " create:async()=>{window.__passkeyCreateCount++;return {type:'public-key',id:'fake',rawId:fakeId.buffer,",
  "   response:{clientDataJSON:new Uint8Array([123,125]).buffer,attestationObject:new Uint8Array([160]).buffer}}},",
  " get:async()=>{window.__passkeyGetCount++;return {type:'public-key',id:'fake',rawId:fakeId.buffer,",
  "   response:{clientDataJSON:new Uint8Array([123,125]).buffer,",
  "     authenticatorData:new Uint8Array(37).buffer,signature:new Uint8Array(64).buffer}}}",
  "};",
  "Object.defineProperty(navigator,'credentials',{configurable:true,value:fakeCredentials});",
  "Object.defineProperty(window,'PublicKeyCredential',{configurable:true,value:class {}});",
  "</script>"
].join("\n");
const qa=[
  "<script>",
  "(async()=>{",
  " const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));",
  " async function until(predicate,ms=9000){const s=Date.now();while(Date.now()-s<ms){",
  "  if(predicate())return;await sleep(70)}throw Error('Timed out waiting for chat state')}",
  " try{",
  "  const round=new URL(location.href).searchParams.get('round');",
  "  await until(()=>document.getElementById('tex-command-chat-shortcut'));",
  "  const toolbar=document.getElementById('tex-command-chat-shortcut');",
  "  toolbar.click();",
  "  await until(()=>document.getElementById('aertex-filechat')?.hidden===false);",
  "  const panel=document.getElementById('aertex-filechat');",
  "  const conversation=document.getElementById('aertex-chat-conversation');",
  "  const passkey=document.getElementById('aertex-chat-passkey');",
  "  await until(()=>!passkey.disabled);",
  "  if(conversation.hidden!==true)throw Error('Chat was unlocked without Passkey');",
  "  if(round==='first'&&!passkey.textContent.includes('创建'))throw Error('First-use Passkey creation missing');",
  "  if(round==='second'&&!passkey.textContent.includes('验证'))throw Error('Reload did not require fresh Passkey');",
  "  passkey.click();",
  "  if(round==='fresh'){",
  "    // A new browser profile has no IndexedDB ECDH key, but the server already has a Passkey.",
  "    // It must verify via GET without opening Windows Security's second CREATE dialog.",
  "    await until(()=>window.__passkeyGetCount===1,9000);",
  "    await sleep(700);",
  "    if(window.__passkeyCreateCount!==0)throw Error('Existing project Passkey triggered a second save-passkey dialog');",
  "    if(document.getElementById('aertex-chat-status').textContent.includes('检测到新设备'))",
  "      throw Error('Browser ECDH identity misclassified as new physical device');",
  "    document.body.dataset.filechatCryptoQa='PASS';return;",
  "  }",
  "  await until(()=>!conversation.hidden,9000);",
  "  if(round==='first'){",
  "    document.getElementById('aertex-chat-input').value='Private browser-to-browser encrypted message';",
  "    document.getElementById('aertex-chat-send').click();",
  "    await until(()=>document.getElementById('aertex-chat-feed').textContent.includes('Private browser-to-browser'),9000);",
  "  }else{",
  "    await until(()=>document.getElementById('aertex-chat-feed').textContent.includes('Private browser-to-browser'),9000);",
  "    const roomTitle=document.getElementById('aertex-chat-filename').textContent;",
  "    window.__qaActiveFile='chapters/new.tex';",
  "    window.dispatchEvent(new Event('aertex:tex-project-asset-selected'));",
  "    await sleep(220);",
  "    if(panel.hidden||conversation.hidden)throw Error('Changing files relocked the project conversation');",
  "    if(document.getElementById('aertex-chat-filename').textContent!==roomTitle)",
  "      throw Error('File changed the displayed chat identity');",
  "    if(!document.getElementById('aertex-chat-feed').textContent.includes('Private browser-to-browser'))",
  "      throw Error('File switch lost the project chat history');",
  "    document.querySelector('.tex-work-app').dataset.texCollaborationDocumentId='33333333-3333-4333-8333-333333333333';",
  "    await until(()=>conversation.hidden&&passkey.textContent.includes('创建'),9000);",
  "    if(panel.hidden)throw Error('Project switch closed the floating panel');",
  "    if(document.getElementById('aertex-chat-feed').textContent.includes('Private browser-to-browser'))",
  "      throw Error('Project switch leaked the previous project messages');",
  "  }",
  "  document.body.dataset.filechatCryptoQa='PASS';",
  " }catch(e){document.body.dataset.filechatCryptoQa='FAIL';",
  "  document.body.dataset.filechatCryptoReason=(e.message||String(e))+' | status: '+(document.getElementById('aertex-chat-status')?.textContent||'')+' | button: '+(document.getElementById('aertex-chat-passkey')?.textContent||'')+' | composer: '+document.getElementById('aertex-chat-conversation')?.hidden}",
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
  if(req.method!=="POST"||req.url!=="/api/tex/file-chat"){
    return json(res,{error:"Not found"},404);
  }
  let raw="";
  for await(const chunk of req){raw+=chunk;if(raw.length>35000)break}
  let body;
  try{body=JSON.parse(raw)}catch{return json(res,{error:"Bad request"},400)}
  const op=body.op;
  if(Object.hasOwn(body,"file_name"))memory.sentFileSelector=true;
  if(op==="status")return json(res,{registered:memory.registered.has(body.document_id),
    user_id:owner,owner_id:owner,role:"owner"});
  if(op==="begin")return json(res,{
    mode:memory.registered.has(body.document_id)?"get":"create",
    challenge_id:"one-time-test",public_key:{
      rp:{id:"127.0.0.1",name:"AERTEX file chat test"},
      user:{id:"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",name:"test",displayName:"test"},
      challenge:"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      pubKeyCredParams:[{type:"public-key",alg:-7}],timeout:90000,attestation:"none",
      authenticatorSelection:{residentKey:"required",userVerification:"required"},
      rpId:"127.0.0.1",userVerification:"required",allowCredentials:[]
    }
  });
  if(op==="verify"){memory.registered.add(body.document_id);
    memory.verified++;
    return json(res,{verified:true,owner_id:owner,user_id:owner,role:"owner",token:"Z".repeat(43),expires_in:600});
  }
  if(body.token!=="Z".repeat(43))return json(res,{error:"Passkey required"},401);
  if(op==="device"){
    memory.device.set(body.device_id,{id:body.device_id,x:body.x,y:body.y});
    return json(res,{registered:true});
  }
  if(op==="devices"){
    return json(res,{initialized:memory.envelopes.size>0,
      devices:[...memory.device.values()].map(x=>({user_id:owner,device_id:x.id,x:x.x,y:x.y,
        ready:memory.envelopes.has(x.id)}))});
  }
  if(op==="envelope-put"){
    if(memory.envelopes.has(body.to_device))return json(res,{error:"Already initialized"},409);
    memory.envelopes.set(body.to_device,{to_user:body.to_user,to_device:body.to_device,
      from_device:body.from_device,iv:body.iv,ct:body.ct});
    return json(res,{saved:true});
  }
  if(op==="envelope-get"){
    const envelope=memory.envelopes.get(body.device_id);
    if(!envelope)return json(res,{ready:false});
    const from=memory.device.get(envelope.from_device);
    return json(res,{ready:true,envelope,owner_public:{x:from.x,y:from.y}});
  }
  if(op==="messages")return json(res,{messages:memory.messages});
  if(op==="send"){
    if(body.text||body.message||!body.ct||!body.iv)memory.sentPlaintext=true;
    memory.messages.push({id:body.message_id,user_id:owner,iv:body.iv,ct:body.ct,at:Date.now()});
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
  assert(memory.registered.has(projectA),"Initial project Passkey creation must complete");
  assert.equal(memory.messages.length,1,"Must send encrypted message");
  assert(!memory.sentPlaintext,"Server must not see plaintext message field");
  assert(!JSON.stringify(memory.messages).includes("Private browser-to-browser"),
    "Server must only store ciphertext");
  await browserRound("second");
  await browserRound("fresh");
  assert(memory.verified>=3,"Page reload and fresh browser profile must revalidate project Passkey");
  assert(!memory.sentFileSelector,"Project chat API must not send a file selector");
  console.log("REAL CHROME E2EE integration: project Passkey, ciphertext, reload and fresh-profile verification without duplicate Passkey creation PASS");
}finally{
  await new Promise(resolve=>server.close(resolve));
  rmSync(profile,{recursive:true,force:true});
  rmSync(profile+"-fresh",{recursive:true,force:true});
}
