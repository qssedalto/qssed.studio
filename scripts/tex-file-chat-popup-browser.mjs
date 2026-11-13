// Real-browser geometry and interaction QA for the editor's icon-only popup.
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { enhanceWorkTexFileChat } from "../studio/ui-work-tex-file-chat.js";
import { enhanceWorkTexToolbarScroll } from "../studio/ui-work-tex-toolbar-scroll.js";

const chrome = [process.env.CHROME_BINARY,"/usr/bin/google-chrome","/usr/bin/chromium",
  "/opt/google/chrome/chrome"].filter(Boolean).find(existsSync);
if (!chrome) throw Error("Chromium/Chrome is required for file-chat floating popup visual QA");
const dir=mkdtempSync(path.join(tmpdir(),"aertex-filechat-visual-"));
const artifact=process.env.AERTEX_CHAT_QA_DIR||"/tmp/aertex-filechat-visual";
mkdirSync(artifact,{recursive:true});

const setup=[
  "<script>",
  "window.__chatStatusCount=0;window.__incomingMeta=null;",
  "const __nativeInterval=window.setInterval.bind(window);",
  "window.setInterval=(fn,ms,...args)=>__nativeInterval(fn,Math.min(ms,120),...args);",
  "window.fetch=async(_url,opt)=>{const b=JSON.parse(opt.body);",
  "  if(b.op==='status'){window.__chatStatusCount++;return {ok:true,json:async()=>({user_id:'11111111-1111-4111-8111-111111111111',owner_id:'11111111-1111-4111-8111-111111111111',role:'owner'})}}",
  "  const payload=b.op==='device'?{registered:true}:b.op==='latest'?{last:window.__incomingMeta}:",
  "    b.op==='envelope-get'?{ready:false}:b.op==='devices'?{initialized:false,devices:[]}:",
  "    b.op==='envelope-put'?{saved:true}:b.op==='messages'?{messages:[]}:{};",
  "  return {ok:true,json:async()=>payload};",
  "};",
  "</script>"
].join("\n");
const verify=[
  "<script>",
  "(async()=>{",
  "const sleep=ms=>new Promise(done=>setTimeout(done,ms));",
  "async function until(pred,ms=11000){const begin=Date.now();while(Date.now()-begin<ms){",
  " if(pred())return;await sleep(70)}throw Error('Timed out waiting for chat state')}",
  "try{",
  " await until(()=>document.getElementById('tex-command-chat-shortcut'));",
  " const button=document.getElementById('tex-command-chat-shortcut');",
  " const popup=document.getElementById('aertex-filechat');",
  " if(!popup||!popup.hidden)throw Error('Popup must start hidden');",
  " if(popup.querySelector('#aertex-chat-passkey'))throw Error('Passkey still blocks chat');",
  " if(popup.querySelector('#aertex-chat-help-link'))throw Error('Obsolete Passkey tutorial remains');",
  " await until(()=>window.__chatStatusCount>=1);",
  " await sleep(200);",
  " button.click();",
  " await until(()=>!popup.hidden);",
  " const rect=popup.getBoundingClientRect(),anchor=button.getBoundingClientRect();",
  " if(rect.width<260||rect.width>415||rect.height<180)throw Error('Popup geometry incorrect');",
  " if(rect.left<-1||rect.right>innerWidth+1||rect.bottom>innerHeight+2)",
  "   throw Error('Popup escaped viewport');",
  " if(Math.abs(rect.top-anchor.bottom-8)>3)",
  "   throw Error('Popup must open immediately below chat bubble: top='+rect.top+' anchorBottom='+anchor.bottom+' expected='+(anchor.bottom+8));",
  " if(popup.querySelector('.close'))throw Error('Unexpected close X');",
  " if(button.getAttribute('aria-expanded')!=='true')throw Error('Icon expanded state incorrect');",
  " document.body.click();",
  " document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));",
  " if(popup.hidden)throw Error('Backdrop/Escape closed popup');",
  " const startCount=window.__chatStatusCount;",
  " window.dispatchEvent(new Event('aertex:tex-project-asset-selected'));",
  " await sleep(90);",
  " if(popup.hidden||window.__chatStatusCount!==startCount)",
  "   throw Error('Switching a file must not reopen or reload project chat');",
  " button.click();",
  " if(!popup.hidden)throw Error('Second icon activation must close');",
  " if(button.getAttribute('aria-expanded')!=='false')throw Error('Collapsed icon state incorrect');",
  " // The chat is closed but background notifications still listen to the project.",
  " window.__incomingMeta={id:'11111111-2222-4333-8444-555555555555',",
  "  at:Date.now(),user_id:'77777777-7777-4777-8777-777777777777',sender_name:'测试协作者'};",
  " const toast=document.getElementById('aertex-project-chat-toast');",
  " await until(()=>!toast.hidden,11000);",
  " if(!toast.textContent.includes('测试协作者在')||!toast.textContent.includes('发了一条信息'))",
  "   throw Error('Message toast username/project wording incorrect');",
  " if(toast.getBoundingClientRect().top>40)throw Error('Toast must be at site top');",
  " toast.click();",
  " if(popup.hidden||!toast.hidden)throw Error('Toast click must open popup and dismiss toast');",
  " if(button.getAttribute('aria-expanded')!=='true')throw Error('Toast click did not reuse bubble');",
  " document.body.dataset.filechatQa='PASS';",
  " document.body.dataset.filechatPopupSize=Math.round(rect.width)+'x'+Math.round(rect.height);",
  "}catch(error){document.body.dataset.filechatQa='FAIL';document.body.dataset.filechatReason=error.message||String(error)}",
  "})();",
  "</script>"
].join("\n");

const markup='<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">'
  +'<meta name="viewport" content="width=device-width,initial-scale=1">'
  +'<style>body{margin:0;font:14px "Segoe UI",sans-serif;background:#f3f5f9}'
  +'.tex-work-app{min-height:80vh;width:100%}'
  +'.tex-source-label{display:flex;gap:4px;width:100%;padding:8px;background:white;box-sizing:border-box;align-items:center}'
  +'.tex-editor-commandbar{display:flex;min-width:0}'
  +'.tex-editor-command{width:39px;height:39px;border:0;background:none}'
  +'</style></head><body class="os-shell"><div class="tex-work-app" data-tex-root '
  +'data-tex-collaboration-document-id="22222222-2222-4222-8222-222222222222">'
  +'<div class="tex-source-label"><span>TeX 源码</span><div class="tex-editor-commandbar">'
  +'<button class="tex-editor-command" type="button">⌘</button></div>'
  +'<div id="tex-realtime-status">● 同步中 · 2 在线</div><div>36 行 · 833 字符</div></div>'
  +'<main style="padding:24px">TeX 编辑器保持可用；聊天窗口浮于其上。</main>'
  +'</div>'+setup+enhanceWorkTexToolbarScroll("",true)+enhanceWorkTexFileChat("",true)+verify
  +'</body></html>';

for (const width of [390,800,1440]) {
  const html=path.join(dir,"chat-"+width+".html");
  const png=path.join(artifact,"chat-popup-"+width+".png");
  writeFileSync(html,markup,"utf8");
  const args=["--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-gpu",
    "--no-first-run","--allow-file-access-from-files","--hide-scrollbars",
    "--window-size="+width+",900","--virtual-time-budget=16000","--screenshot="+png,
    "--dump-dom","file://"+html];
  const run=spawnSync(chrome,args,{encoding:"utf8",timeout:30000,maxBuffer:3000000});
  assert.equal(run.status,0,"Chromium failed: "+String(run.stderr).slice(-1500));
  const dom=String(run.stdout||"");
  assert(dom.includes('data-filechat-qa="PASS"'),"Popup browser QA failed at "+width+
    "px: "+(dom.match(/data-filechat-reason="([^"]+)"/)?.[1]||"PASS marker missing")+
    " status="+(dom.match(/id="aertex-chat-status"[^>]*>([^<]*)/)?.[1]||"none")+
    " qa="+(dom.match(/data-filechat-qa="([^"]+)"/)?.[1]||"none")+
    " source="+(dom.includes("id=\"aertex-project-chat-toast\"")?"mounted":"unmounted"));
  assert(existsSync(png),"Chat screenshot missing at "+width+"px");
  console.log("Floating chat popup browser QA passed at "+width+"px, screenshot: "+png);
}
rmSync(dir,{recursive:true,force:true});
