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
  "window.__selectedChatFile='main.tex';",
  "window.__aertexTexExplorerAsset=()=>({name:window.__selectedChatFile});",
  "window.__chatStatusCount=0;",
  "window.__registeredChatRoom=false;",
  "window.fetch=async(_url,opt)=>{if(JSON.parse(opt.body).op==='status')window.__chatStatusCount++;",
  "  return {ok:true,json:async()=>({registered:window.__registeredChatRoom})}};",
  "</script>"
].join("\n");
const verify=[
  "<script>",
  "(async()=>{",
  " const sleep=ms=>new Promise(done=>setTimeout(done,ms));",
  " try{",
  "   await sleep(140);",
  "   const button=document.getElementById('tex-command-chat-shortcut');",
  "   const popup=document.getElementById('aertex-filechat');",
  "   if(!button||!popup)throw Error('Missing chat trigger or popup');",
  "   if(!popup.hidden)throw Error('Chat popup should be closed on load');",
  "   button.click();",
  "   await sleep(200);",
  "   if(popup.hidden)throw Error('First bubble click must open popup');",
  "   const helpLink=document.getElementById('aertex-chat-help-link');",
  "   if(!helpLink||!helpLink.hidden)throw Error('Tutorial link must NOT appear before project Passkey creation');",
  "   if(button.getAttribute('aria-expanded')!=='true')throw Error('Expanded state incorrect');",
  "   const rect=popup.getBoundingClientRect();",
  "   const anchor=button.getBoundingClientRect();",
  "   if(rect.width>415||rect.width<260||rect.height<200)throw Error('Floating popup size incorrect: '+rect.width+'x'+rect.height);",
  "   if(rect.left<-1||rect.right>innerWidth+1||rect.bottom>innerHeight+2)throw Error('Popup escapes viewport');",
  "   if(rect.top<anchor.bottom-2)throw Error('Floating popup covers its only close trigger');",
  "   if(popup.querySelector('.close'))throw Error('Unexpected extra close button');",
  "   document.body.click();",
  "   document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));",
  "   await sleep(40);",
  "   if(popup.hidden)throw Error('Outside click or Escape dismissed popup');",
  "   const initialRoom= document.getElementById('aertex-chat-filename').textContent;",
  "   const startCount=window.__chatStatusCount;",
  "   window.__selectedChatFile='chapters/part1.tex';",
  "   window.dispatchEvent(new Event('aertex:tex-project-asset-selected'));",
  "   await sleep(120);",
  "   if(popup.hidden||document.getElementById('aertex-chat-filename').textContent!==initialRoom)",
  "     throw Error('File switch must keep the same project room');",
  "   if(window.__chatStatusCount!==startCount)throw Error('File switch reloaded or relocked the project chat');",
  "   button.click();",
  "   if(!popup.hidden||button.getAttribute('aria-expanded')!=='false')throw Error('Second bubble click must close popup');",
  "   window.__registeredChatRoom=true;",
  "   button.click();",
  "   await sleep(180);",
  "   if(popup.hidden)throw Error('Bubble must reopen popup');",
  "   if(helpLink.hidden)throw Error('Tutorial link must appear only in project Passkey VERIFY mode');",
  "   if(!helpLink.textContent.includes('不会验证'))throw Error('Tutorial link has wrong label');",
  "   helpLink.click();",
  "   const guide=document.getElementById('aertex-chat-help-view');",
  "   if(guide.hidden||!document.getElementById('aertex-chat-unlock-view').hidden)",
  "     throw Error('Windows tutorial did not replace the unlock screen');",
  "   const guideImages=[...guide.querySelectorAll('img')];",
  "   if(guideImages.length!==3||guideImages.some(img=>!img.src.startsWith('data:image/webp;base64,')))",
  "     throw Error('Tutorial must contain three real redacted uploaded screenshots');",
  "   await Promise.all(guideImages.map(async img=>{",
  "     img.loading='eager';await img.decode();",
  "     if(img.naturalWidth<300||img.naturalHeight<200)throw Error('Corrupt Passkey tutorial screenshot');",
  "   }));",
  "   if(guide.textContent.includes('eb8c338d')||guide.textContent.includes('机器学习'))",
  "     throw Error('Original credential ID or project name leaked into help text');",
  "   guide.querySelector('#aertex-chat-help-back').click();",
  "   if(!guide.hidden||document.getElementById('aertex-chat-unlock-view').hidden)",
  "     throw Error('Back to verification must restore locked Passkey view');",
  "   document.body.dataset.filechatQa='PASS';",
  "   document.body.dataset.filechatPopupSize=Math.round(rect.width)+'x'+Math.round(rect.height);",
  " }catch(error){document.body.dataset.filechatQa='FAIL';document.body.dataset.filechatReason=error.message||String(error)}",
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
    "--window-size="+width+",900","--virtual-time-budget=5000","--screenshot="+png,
    "--dump-dom","file://"+html];
  const run=spawnSync(chrome,args,{encoding:"utf8",timeout:30000,maxBuffer:3000000});
  assert.equal(run.status,0,"Chromium failed: "+String(run.stderr).slice(-1500));
  const dom=String(run.stdout||"");
  assert(dom.includes('data-filechat-qa="PASS"'),"Popup browser QA failed at "+width+
    "px: "+(dom.match(/data-filechat-reason="([^"]+)"/)?.[1]||"PASS marker missing"));
  assert(existsSync(png),"Chat screenshot missing at "+width+"px");
  console.log("Floating chat popup browser QA passed at "+width+"px, screenshot: "+png);
}
rmSync(dir,{recursive:true,force:true});
