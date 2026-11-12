// Browser QA waits in wall-clock time: PDF.js loads external modules asynchronously,
// whereas --virtual-time-budget advances the timeout before the module can arrive.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dir=path.resolve(process.env.AERTEX_PREVIEW_DIR || path.join(os.tmpdir(),"aertex-tex-pdf-visual"));
const fixture=path.join(dir,"pdf-theme-qa.html");
if(!fs.existsSync(fixture))throw Error("Missing PDF theme browser fixture. Run tex-pdf-auto-theme-visual.mjs first.");

const browser=process.env.CHROME_BINARY ||
  ["/usr/bin/google-chrome","/usr/bin/chromium","/opt/google/chrome/chrome"].find(p=>fs.existsSync(p));
if(!browser)throw Error("Chromium/Chrome unavailable");
const profile=fs.mkdtempSync(path.join(os.tmpdir(),"aertex-pdf-chrome-"));
let stderr="";
const chrome=spawn(browser,[
  "--headless=new","--no-sandbox","--disable-dev-shm-usage",
  "--disable-gpu","--hide-scrollbars","--no-first-run",
  "--allow-file-access-from-files","--window-size=1300,950",
  "--remote-debugging-port=0","--user-data-dir="+profile,
  "file://"+fixture
],{stdio:["ignore","ignore","pipe"]});
chrome.stderr.on("data",chunk=>{stderr=(stderr+String(chunk)).slice(-14000)});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const deadline=Date.now()+55000;
let ws=null;const exceptions=[];let msgId=0;const pending=new Map();
async function request(method,params={}){
  return new Promise((resolve,reject)=>{
    if(!ws || ws.readyState!==WebSocket.OPEN)return reject(Error("CDP websocket unavailable"));
    const id=++msgId;const timer=setTimeout(()=>{pending.delete(id);reject(Error("CDP timeout: "+method))},4000);
    pending.set(id,{resolve,reject,timer});
    ws.send(JSON.stringify({id,method,params}));
  });
}
try{
  let port="";
  while(Date.now()<deadline){
    if(chrome.exitCode!=null)throw Error("Chromium exited early: "+chrome.exitCode+"\n"+stderr);
    const active=path.join(profile,"DevToolsActivePort");
    if(fs.existsSync(active)){port=fs.readFileSync(active,"utf8").split("\n")[0];break;}
    await sleep(150);
  }
  if(!port)throw Error("Chromium debugging port unavailable\n"+stderr);
  let page=null;
  while(Date.now()<deadline){
    try{
      const tabs=await (await fetch("http://127.0.0.1:"+port+"/json")).json();
      page=tabs.find(t=>t.type==="page" && t.url.includes("pdf-theme-qa.html"));
      if(page)break;
    }catch{}
    await sleep(150);
  }
  if(!page)throw Error("PDF theme browser tab not found\n"+stderr);
  ws=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{
    ws.addEventListener("open",resolve,{once:true});
    ws.addEventListener("error",reject,{once:true});
  });
  ws.addEventListener("message",event=>{
    let value;
    try{value=JSON.parse(event.data)}catch{return}
    if(value.id){
      const handler=pending.get(value.id);
      if(handler){
        clearTimeout(handler.timer);pending.delete(value.id);
        if(value.error)handler.reject(Error(JSON.stringify(value.error)));
        else handler.resolve(value.result||{});
      }
    }
    if(value.method==="Runtime.exceptionThrown"){
      exceptions.push(value.params?.exceptionDetails?.text||"JS exception");
    }
    if(value.method==="Runtime.consoleAPICalled" && value.params?.type==="warning"){
      exceptions.push((value.params.args||[]).map(a=>a.value||a.description).join(" "));
    }
  });
  await request("Runtime.enable");
  await request("Page.enable");
  let result="";
  while(Date.now()<deadline){
    const response=await request("Runtime.evaluate",{
      expression:"JSON.stringify({status:document.body?.dataset?.pdfThemeQa||'',report:document.body?.dataset?.pdfThemeReport||'',notice:document.querySelector('.aertex-pdf-notice')?.textContent||'',debug:window.__aertexPdfDebug||null})",
      returnByValue:true
    });
    if(response.result?.value){
      result=JSON.parse(response.result.value);
      if(result.status)break;
    }
    await sleep(180);
  }
  try{
    const screen=await request("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
    if(screen.data)fs.writeFileSync(path.join(dir,"pdf-theme-auto.png"),Buffer.from(screen.data,"base64"));
  }catch(e){exceptions.push(String(e))}
  if(result?.status!=="PASS"){
    throw Error("PDF browser test failed: "+JSON.stringify(result)+
      "\nJavaScript exceptions/warnings: "+exceptions.join("\n")+
      "\nChrome STDERR: "+stderr.slice(-3000));
  }
  console.log("PASS: real Chromium PDF light/dark/image-color pixel verification");
  console.log(result.report);
}finally{
  try{ws?.close()}catch{}
  for(const handler of pending.values()){clearTimeout(handler.timer);handler.reject(Error("CDP closed"))}
  pending.clear();
  try{chrome.kill("SIGTERM")}catch{}
  await sleep(200);
  fs.rmSync(profile,{recursive:true,force:true});
}
