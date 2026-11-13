import assert from "node:assert/strict";
import vm from "node:vm";
import { enhanceWorkTexFileChat } from "../studio/ui-work-tex-file-chat.js";

for (const zh of [true,false]) {
  const html=enhanceWorkTexFileChat("",zh);
  const code=html.match(/<script id="aertex-file-chat-runtime">([\s\S]*?)<\/script>/)?.[1];
  const css=html.match(/<style id="aertex-file-chat-style">([\s\S]*?)<\/style>/)?.[1];
  assert(code && css,"Popup markup, CSS and runtime must exist");
  new vm.Script(code);
  assert(!html.includes('class="close"'),"No close X allowed: toolbar icon is sole toggle");
  assert(!code.includes('chat.qsseda.com'),"Editor must not navigate to external chat website");
  assert(!code.includes('auth.qsseda.com'),"Editor must not navigate to external authentication website");
  assert(!code.includes('location.assign('), "No top-level redirects permitted");
  assert(!css.includes('position:fixed;top:0;bottom:0;left:0;right:0'),"Popup must not be fullscreen");
  assert(css.includes('width:min(408px,calc(100vw - 24px))'),"Mobile popup must leave a visible border");
  assert(css.includes('z-index:100080'),"Popup must overlay editor content without changing its layout");
  assert(css.includes('.aertex-filechat [hidden]{display:none!important}'),
    "Locked composer must remain hidden even though body is flex");

  const appListeners=new Map(),windowListeners=new Map(),attrs={},flags=new Set();
  const simple=(name)=>({
    name,hidden:false,value:"",textContent:"",disabled:false,
    attrs:{},events:{},classList:{toggle(){},add(){},remove(){}},
    style:{setProperty(){}},
    addEventListener(kind,handler){this.events[kind]=handler},
    setAttribute(key,value){this.attrs[key]=value},
    replaceChildren(){},append(){},focus(){}
  });
  const ids=new Map();
  const get=id=>{if(!ids.has(id))ids.set(id,simple(id));return ids.get(id)};
  const trigger=get("tex-command-chat-shortcut");
  trigger.setAttribute=(key,val)=>{attrs[key]=val};
  trigger.classList={toggle(key,enabled){if(enabled)flags.add(key);else flags.delete(key)}};
  trigger.getBoundingClientRect=()=>({right:340,bottom:63});
  const root={dataset:{texCollaborationDocumentId:"22222222-2222-4222-8222-222222222222"}};
  let activeFile="main.tex";
  const panel=simple("aside");
  panel.querySelector=selector=>{
    assert(selector.startsWith("#aertex-chat-"),"No close button should be queried");
    return get(selector.slice(1));
  };
  panel.setAttribute=()=>{};
  const document={
    body:{append(v){assert.equal(v,panel)}},
    querySelector(selector){return selector===".tex-work-app[data-tex-root]"?root:null},
    createElement(type){assert.equal(type,"aside");return panel},
    getElementById(id){return id==="tex-command-chat-shortcut"?trigger:null},
    addEventListener(kind,handler){appListeners.set(kind,handler)}
  };
  const window={
    innerWidth:900,innerHeight:700,visualViewport:null,
    __aertexTexExplorerAsset:()=>({name:activeFile}),
    addEventListener(kind,handler){windowListeners.set(kind,handler)}
  };
  class MutationObserver {
    constructor(callback){this.callback=callback}
    observe(){}
  }
  const context={document,window,MutationObserver,TextEncoder,TextDecoder,
    navigator:{},indexedDB:{},crypto:globalThis.crypto,
    fetch:async()=>({ok:true,json:async()=>({registered:false})}),
    Date,JSON,Uint8Array,URL,atob,btoa,setInterval,clearInterval};
  vm.runInNewContext(code,context,{filename:"filechat-ui-runtime.js"});
  assert.equal(panel.hidden,true,"Popup must start closed");
  const toggle=appListeners.get("aertex:tex-chat-toggle");
  assert.equal(typeof toggle,"function");
  assert(!appListeners.has("pointerdown"),"Outside clicks must not dismiss the popup");
  assert(!appListeners.has("click"),"No document-wide dismissal listener");
  assert(!appListeners.has("keydown"),"Esc and unrelated keys cannot dismiss the popup");
  toggle();
  assert.equal(panel.hidden,false,"First icon activation opens popup");
  assert.equal(attrs["aria-expanded"],"true");
  assert(flags.has("is-chat-open"));
  assert.equal(typeof panel.style.setProperty,"function");

  activeFile="chapters/unit.tex";
  const selected=windowListeners.get("aertex:tex-project-asset-selected");
  assert.equal(typeof selected,"function");
  selected();
  assert.equal(panel.hidden,false,"Changing editor files may lock conversation, but not close the popup");
  assert.equal(attrs["aria-expanded"],"true");

  toggle();
  assert.equal(panel.hidden,true,"Second icon activation closes popup");
  assert.equal(attrs["aria-expanded"],"false");
  assert(!flags.has("is-chat-open"));
  toggle();
  assert.equal(panel.hidden,false,"Third icon activation reopens popup");
  toggle();
  assert.equal(panel.hidden,true,"Fourth icon activation closes popup");
}
console.log("File-chat popup: icon-only open/close, no X/Escape/backdrop dismissal, no external sites, mobile floating frame and stable file-switch state PASS");
