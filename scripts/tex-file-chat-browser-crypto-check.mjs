import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdtempSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { enhanceWorkTexFileChat } from "../studio/ui-work-tex-file-chat.js";
import { enhanceWorkTexToolbarScroll } from "../studio/ui-work-tex-toolbar-scroll.js";

const binary=[process.env.CHROME_BINARY,"/usr/bin/google-chrome","/usr/bin/chromium",
  "/opt/google/chrome/chrome"].filter(Boolean).find(existsSync);
if(!binary)throw Error("Chrome required for live E2EE browser integration test");
const owner="11111111-1111-4111-8111-111111111111";
const memory={registered:false,device:new Map(),envelopes:new Map(),messages:[],
  sentPlaintext:false,verified:0};
const setup=[
  "<script>",
  "window.__qaActiveFile='main.tex';",
  "window.__aertexTexExplorerAsset=()=>({name:window.__qaActiveFile});",
  "const fakeId=new Uint8Array(32).fill(7);",
  "const fakeCredentials={",
  " create:async()=>({type:'public-key',id:'fake',rawId:fakeId.buffer,",
  "   response:{clientDataJSON:new Uint8Array([123,125]).buffer,attestationObject:new Uint8Array([160]).buffer}}),",
  " get:async()=>({type:'public-key',id:'fake',rawId:fakeId.buffer,",
  "   response:{clientDataJSON:new Uint8Array([123,125]).buffer,",
  "     authenticatorData:new Uint8Array(37).buffer,signature:new Uint8Array(64).buffer}})",
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
  "  await until(()=>!conversation.hidden,9000);",
  "  if(round==='first'){",
  "    document.getElementById('aertex-chat-input').value='Private browser-to-browser encrypted message';",
  "    document.getElementById('aertex-chat-send').click();",
  "    await until(()=>document.getElementById('aertex-chat-feed').textContent.includes('Private browser-to-browser'),9000);",
  "  }else{",
  "    await until(()=>document.getElementById('aertex-chat-feed').textContent.includes('Private browser-to-browser'),9000);",
  "    window.__qaActiveFile='chapters/new.tex';",
  "    window.dispatchEvent(new Event('aertex:tex-project-asset-selected'));",
  "    await until(()=>document.getElementById('aertex-chat-filename').textContent==='chapters/new.tex');",
  "    await until(()=>!passkey.disabled);",
  "    if(!passkey.textContent.includes('创建'))throw Error('New file did not require a new Passkey');",
  "    if(conversation.hidden!==true)throw Error('File switch retained decrypted messages');",
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
  if(op==="status")return json(res,{registered:body.file_name==="main.tex"&&memory.registered,
    user_id:owner,owner_id:owner,role:"owner"});
  if(op==="begin")return json(res,{
    mode:body.file_name==="main.tex"&&memory.registered?"get":"create",
    challenge_id:"one-time-test",public_key:{
      rp:{id:"127.0.0.1",name:"AERTEX file chat test"},
      user:{id:"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",name:"test",displayName:"test"},
      challenge:"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      pubKeyCredParams:[{type:"public-key",alg:-7}],timeout:90000,attestation:"none",
      authenticatorSelection:{residentKey:"required",userVerification:"required"},
      rpId:"127.0.0.1",userVerification:"required",allowCredentials:[]
    }
  });
  if(op==="verify"){if(body.file_name==="main.tex")memory.registered=true;
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

async function browserRound(round){
  return new Promise((resolve,reject)=>{
    let stdout="",stderr="";
    const child=spawn(binary,[
      "--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-gpu",
      "--no-first-run","--user-data-dir="+profile,"--window-size=900,780",
      "--virtual-time-budget=12000","--dump-dom",origin+"/?round="+round
    ],{stdio:["ignore","pipe","pipe"]});
    child.stdout.on("data",d=>{stdout+=String(d)});
    child.stderr.on("data",d=>{stderr=(stderr+String(d)).slice(-4000)});
    const timer=setTimeout(()=>child.kill("SIGKILL"),28000);
    child.on("close",code=>{
      clearTimeout(timer);
      if(code!==0)return reject(Error("Chrome exit "+code+": "+stderr));
      if(!stdout.includes('data-filechat-crypto-qa="PASS"')){
        const reason=stdout.match(/data-filechat-crypto-reason="([^"]*)"/)?.[1];
        return reject(Error("File E2EE browser round "+round+" failed: "+(reason||"no PASS marker")));
      }
      resolve();
    });
  });
}
try{
  await browserRound("first");
  assert(memory.registered,"Initial Passkey creation must complete");
  assert.equal(memory.messages.length,1,"Must send encrypted message");
  assert(!memory.sentPlaintext,"Server must not see plaintext message field");
  assert(!JSON.stringify(memory.messages).includes("Private browser-to-browser"),
    "Server must only store ciphertext");
  await browserRound("second");
  assert(memory.verified>=2,"Page reload must revalidate file-specific Passkey");
  console.log("REAL CHROME E2EE integration: Passkey create, encrypted send, IndexedDB key recovery, reload Passkey verification and distinct file lock PASS");
}finally{
  await new Promise(resolve=>server.close(resolve));
  rmSync(profile,{recursive:true,force:true});
}
