import assert from "node:assert/strict";
import vm from "node:vm";
import fs from "node:fs";
import { guardWorkTexFirstPaint } from "../studio/ui-work-tex-paint-guard.js";

const page = '<!DOCTYPE html><html lang="zh-cn" data-theme="dark"><head><title>AERTEX Work</title>' +
  '<script src="https://cdn.jsdelivr.net/npm/example"></script></head>' +
  '<body class="os-shell"><section class="tex-workbench tex-work-app" data-tex-root>' +
  '<div class="qtex-welcome">Welcome</div><section id="tex-editor"></section></section></body></html>';

const output = guardWorkTexFirstPaint(page);
assert.notEqual(output,page,"Work TeX must get a first-paint guard");
assert(output.includes('<html lang="zh-cn" data-theme="dark" data-aertex-tex-boot="loading">'),
  "The server must emit the initial cover state in the HTML tag");
assert(output.indexOf('id="aertex-tex-first-paint-style"') < output.indexOf('<script src="https://cdn.jsdelivr.net'),
  "Critical cover CSS must be parsed before third-party JS can block rendering");
assert(output.indexOf('id="aertex-tex-first-paint-style"') < output.indexOf('<body class='),
  "No welcome text can appear before critical guard CSS");
assert(output.includes(':root[data-theme="light"][data-aertex-tex-boot="loading"]{--aertex-tex-boot-bg:#fff}'));
assert(output.includes(':root[data-theme="dark"][data-aertex-tex-boot="loading"]{--aertex-tex-boot-bg:#0b0b0d}'));
assert(output.includes('@media(prefers-color-scheme:dark)'),"System-dark mode must not initially flash white");
assert(output.includes('z-index:2147483647'),"The mask must cover raw text and images");
assert(output.includes('<noscript>'),"No-JS browsers must not stay covered");
assert(output.includes('animation:aertex-tex-boot-safety 0s linear 7s both'),
  "A failed runtime needs a CSS-only emergency release");
assert.equal(guardWorkTexFirstPaint(output),output,"Injection must be idempotent");
const plain=page.replace('class="tex-workbench tex-work-app"','class="public-home"');
assert.equal(guardWorkTexFirstPaint(plain),plain,"Other pages must not be affected");

const runtime=output.match(/<script id="aertex-tex-first-paint-runtime">([\s\S]*?)<\/script>/)?.[1];
assert(runtime,"First-paint runtime missing");
new vm.Script(runtime);
const flush=async()=>{for(let i=0;i<36;i++)await Promise.resolve();};
for(const readyState of ["loading","interactive"]){
  const pending=[],events=new Map();
  const root={dataset:{aertexTexBoot:"loading"},removeAttribute(name){
    assert.equal(name,"data-aertex-tex-boot");delete this.dataset.aertexTexBoot;
  }};
  let titlePrepared=false;
  const app={querySelector(selector){
    if(selector===".qtex-welcome")return {};
    if(selector==="#tex-editor")return {hidden:false};
    return null;
  }};
  const document={
    documentElement:root,readyState,fonts:{ready:Promise.resolve()},
    querySelector:selector=>selector===".tex-work-app[data-tex-root]"?app:null,
    getElementById(id){
      if(id==="aertex-tex-compile-toolbar-style"||id==="qsseda-work-tex-welcome-clean")return {};
      if(id==="tex-title-static"&&titlePrepared)return {};
      return null;
    },
    addEventListener:(name,fn)=>events.set(name,fn)
  };
  const window={
    setTimeout(fn,ms){
      pending.push({fn,ms});
      if(ms!==4500)queueMicrotask(fn);
      return pending.length;
    },
    clearTimeout(){},dispatchEvent(evt){events.set("released",evt)}
  };
  class Event{constructor(type){this.type=type;}}
  vm.runInNewContext(runtime,{window,document,requestAnimationFrame:fn=>fn(),Event,Promise,queueMicrotask});
  assert.equal(root.dataset.aertexTexBoot,"loading","Mask must cover unhydrated text");
  titlePrepared=true;
  if(readyState==="loading"){
    assert(events.has("DOMContentLoaded"));
    events.get("DOMContentLoaded")();
  }
  await flush();
  assert.equal(root.dataset.aertexTexBoot,undefined,"Once styled, unmask in both DOM-ready paths");
  assert.equal(events.get("released")?.type,"aertex:tex-first-paint-ready");
  const watchdog=pending.find(item=>item.ms===4500);
  assert(watchdog);
  watchdog.fn();
  assert.equal(root.dataset.aertexTexBoot,undefined,"Watchdog must not remask the site");
}

const entry=fs.readFileSync(new URL("../studio/entry.js",import.meta.url),"utf8");
assert(entry.includes('if (pathname === "/work/tex") markup = guardWorkTexFirstPaint(markup);'),
  "Only Work TeX must activate the first-paint guard");
console.log("Work TeX first-paint theme guard checks passed.");
