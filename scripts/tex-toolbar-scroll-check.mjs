import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { enhanceWorkTexToolbarScroll } from "../studio/ui-work-tex-toolbar-scroll.js";

const page = enhanceWorkTexToolbarScroll('<main class="tex-work-app"></main>', true);
const enPage = enhanceWorkTexToolbarScroll('', false);
const entry = readFileSync(new URL("../studio/entry.js",import.meta.url),"utf8");
assert(entry.includes("enhanceWorkTexToolbarScroll(enhanceWorkTexDeviceReadiness"),
  "Responsive toolbar must run after device/mobile CSS for /work/tex");
assert(page.includes('id="aertex-tex-scrollable-toolbar"'));
assert(page.includes('id="aertex-tex-scrollable-toolbar-runtime"'));
assert(page.includes('打开此文件的端到端加密协作聊天'));
assert(enPage.includes('Open encrypted chat for this file'));
assert(page.includes('tex-command-chat-svg'));
assert(page.includes('stroke:currentColor!important'),"Outline bubble must use theme currentColor");
assert(page.includes('stroke-width:1.7!important'),"Bubble outline must match neighboring Fluent icons");
assert(page.includes("color:color-mix(in srgb,var(--text) 74%,var(--surface))!important"),"Icon must invert between light and dark palettes");
assert(!page.includes("fill:#007"),"Message bubble SVG must not force iMessage blue");
assert(page.includes("overflow-x:auto!important"),"Only the command group should scroll");
assert(page.includes("touch-action:pan-x!important"),"iPad touch drags must scroll sideways");
assert(page.includes("overscroll-behavior-x:contain!important"),"Avoid dragging the whole document horizontally");
assert(page.includes("width:0!important"),"Command strip must shrink inside the actual editor width");
assert(page.includes("flex:0 0 auto!important"),"Realtime badge and character counter must not shrink");
assert(page.includes("tex-toolbar-tiny"),"Narrow split-pane layout must be supported");
assert(page.includes("ResizeObserver"),"Sizing must react to editor pane resizing");
assert(page.includes("tex-editor-commandbar > .tex-editor-command"),
  "Existing toolbar icon size must remain unchanged");
assert(!page.includes("bar.append(status"),"Never move realtime status into scrollable buttons");
assert(!page.includes("bar.append(count"),"Never move line counts into scrollable buttons");

function simulate(html) {
  const match=html.match(/<script id="aertex-tex-scrollable-toolbar-runtime">([\s\S]*?)<\/script>/);
  assert(match,"Could not locate injected runtime");
  let lastObserved;
  const makeNode=(name="")=>({
    name,style:{},dataset:{},events:{},attrs:{},children:[],disabled:false,scrollLeft:0,
    setAttribute(k,v){this.attrs[k]=String(v);},
    addEventListener(k,fn){this.events[k]=fn;},
    append(child){this.children.push(child);},
    scrollBy(options){this.scrollLeft+=(options.left||0);},
    getBoundingClientRect(){return {width:this.width||0};},
    classList:{
      classes:new Set(),
      toggle(name,on){if(on)this.classes.add(name);else this.classes.delete(name);},
      contains(name){return this.classes.has(name);}
    }
  });
  const root=makeNode("root"), header=makeNode("header"),bar=makeNode("bar"), collab=makeNode("collab");
  header.width=690;
  root.querySelector=(s)=>s===".tex-source-label"?header:null;
  header.querySelector=(s)=>s===".tex-editor-commandbar"?bar:null;
  let shortcut,collabClicks=0,opened=[];
  collab.click=()=>collabClicks++;
  const document={
    body:{append(){}},
    dispatchEvent(event){opened.push(event.type);},
    querySelector(s){return s===".tex-work-app[data-tex-root]"?root:null;},
    getElementById(s){
      if(s==="tex-collaboration-open")return collab;
      if(s==="tex-command-chat-shortcut")return shortcut;
      return null;
    },
    createElement(name){const el=makeNode(name);el.remove=()=>{};el.click=()=>{if(name==='a')opened.push([el.href,el.target,el.rel]);};if(name==='button')Object.defineProperty(el,"id",{
      get(){return this._id;},set(value){this._id=value; shortcut=this;}
    });return el;}
  };
  class ResizeObserver {constructor(cb){this.cb=cb;lastObserved=this} observe(node){assert.equal(node,header)}disconnect(){}}
  class MutationObserver {constructor(cb){this.cb=cb} observe(node){assert.equal(node,collab)}disconnect(){}}
  const win={addEventListener(){},matchMedia(){return {matches:false}},setTimeout(){throw Error("Unexpected deferred retry")},open(...args){opened.push(args);return {}},location:{assign(url){opened.push([url])}}};
  vm.runInNewContext(match[1],{document,window:win,ResizeObserver,MutationObserver,Event:class{constructor(type){this.type=type}}},{timeout:1000});
  assert.equal(shortcut.id,"tex-command-chat-shortcut");
  assert.equal(shortcut.attrs["aria-label"],html.includes("打开此文件的端到端加密协作聊天")?"打开此文件的端到端加密协作聊天":"Open encrypted chat for this file");
  assert.equal(shortcut.type,"button");
  assert.equal(shortcut.dataset.texAction,"open-encrypted-chat");
  assert(shortcut.innerHTML.includes('<svg'));
  assert.equal(bar.children[0],shortcut);
  assert.equal(bar.attrs.role,"group");
  assert.equal(bar.attrs.tabindex,"0");
  assert(header.classList.contains("tex-toolbar-compact"),"690px editor must suppress file label to keep stats fixed");
  assert(!header.classList.contains("tex-toolbar-tight"));
  header.width=290;lastObserved.cb();
  assert(header.classList.contains("tex-toolbar-tiny"),"290px editor must reserve room for badge and count");
  let stopped=false;
  shortcut.events.click({stopPropagation(){stopped=true;}});
  assert(stopped);
  assert.equal(collabClicks,0,"Bubble must never open collaboration settings");
  assert.deepEqual(opened,["aertex:tex-chat-open"],"Bubble must open the current file's encrypted chat drawer");
  bar.events.keydown({target:bar,key:"ArrowRight",preventDefault(){}});
  assert.equal(bar.scrollLeft,125,"Keyboard users can horizontally pan icon group");
  bar.events.keydown({target:bar,key:"ArrowLeft",preventDefault(){}});
  assert.equal(bar.scrollLeft,0);
  collab.disabled=true;
  assert.equal(shortcut.disabled,false,"Chat must not be disabled by editing or collaboration settings");
}
simulate(page);
simulate(enPage);
console.log("Outlined SVG, file-scoped E2EE chat drawer, fixed realtime/count status and horizontal scroll passed.");
