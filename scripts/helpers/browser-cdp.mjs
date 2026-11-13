import { spawn } from 'node:child_process';
import { existsSync, readFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
export async function openBrowser(url, { width=1440, height=900 }={}) {
 const binary=[process.env.CHROME_BINARY,'/usr/bin/google-chrome','/usr/bin/chromium','/opt/google/chrome/chrome'].filter(Boolean).find(existsSync);
 if(!binary)throw Error('Chrome is required for browser integration verification');
 const profile=mkdtempSync(path.join(tmpdir(),'aertex-audit-browser-'));
 const child=spawn(binary,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-first-run','--user-data-dir='+profile,'--window-size='+width+','+height,'--remote-debugging-port=0','about:blank'],{stdio:['ignore','ignore','pipe']});
 let stderr='',socket=null,id=0;const pending=new Map(),exceptions=[];
 child.stderr.on('data',chunk=>{stderr=(stderr+chunk).slice(-5000);});
 const close=async()=>{for(const item of pending.values()){clearTimeout(item.timer);item.reject(Error('Browser closed'));}pending.clear();try{socket?.close();}catch{}child.kill('SIGTERM');await Promise.race([new Promise(resolve=>child.once('close',resolve)),sleep(1000)]);if(child.exitCode===null)child.kill('SIGKILL');rmSync(profile,{recursive:true,force:true});};
 try{
  const started=Date.now(),portfile=path.join(profile,'DevToolsActivePort');
  while(!existsSync(portfile)&&Date.now()-started<12000){if(child.exitCode!==null)throw Error('Chrome exited: '+stderr);await sleep(80);}
  if(!existsSync(portfile))throw Error('Chrome DevTools port unavailable: '+stderr);
  const port=readFileSync(portfile,'utf8').split('\n')[0];let tab;
  while(Date.now()-started<15000){try{tab=(await(await fetch('http://127.0.0.1:'+port+'/json')).json()).find(t=>t.type==='page');if(tab)break;}catch{}await sleep(80);}
  if(!tab)throw Error('Chrome page unavailable');
  socket=new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.id){const item=pending.get(message.id);if(item){clearTimeout(item.timer);pending.delete(message.id);message.error?item.reject(Error(JSON.stringify(message.error))):item.resolve(message.result||{});}}if(message.method==='Runtime.exceptionThrown')exceptions.push(message.params.exceptionDetails?.exception?.description||message.params.exceptionDetails?.text);});
  const command=(method,params={})=>new Promise((resolve,reject)=>{const key=++id,timer=setTimeout(()=>{pending.delete(key);reject(Error('CDP timeout: '+method));},12000);pending.set(key,{resolve,reject,timer});socket.send(JSON.stringify({id:key,method,params}));});
  const evaluate=async expression=>{const result=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result?.value;};
  const wait=async(expression,timeout=12000)=>{const start=Date.now();while(Date.now()-start<timeout){if(await evaluate(expression))return;await sleep(100);}throw Error('Browser wait timed out: '+expression+' | exceptions: '+exceptions.join('\n'));};
  const screenshot=async file=>{const result=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});writeFileSync(file,Buffer.from(result.data,'base64'));};
  await command('Runtime.enable');await command('Page.enable');await command('Network.enable');
  await command('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
  await command('Network.setBlockedURLs',{urls:['https://*','http://localhost:*','http://127.0.0.1:321*']});
  if(url!=='about:blank')await command('Page.navigate',{url});
  return {command,evaluate,wait,screenshot,exceptions,close};
 }catch(error){await close();throw error;}
}
