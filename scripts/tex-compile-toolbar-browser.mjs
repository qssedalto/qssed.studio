// Real Chromium regression: content-width command bar must always touch the
// fixed compile action, with no phantom desktop space and true mobile scroll.
import assert from "node:assert/strict";
import {existsSync,mkdtempSync,mkdirSync,writeFileSync,rmSync} from "node:fs";
import {spawnSync} from "node:child_process";
import path from "node:path";
import {tmpdir} from "node:os";
import {enhanceWorkTexToolbarScroll} from "../studio/ui-work-tex-toolbar-scroll.js";
import {enhanceWorkTexCompileToolbar} from "../studio/ui-work-tex-compile-toolbar.js";

const chrome=[process.env.CHROME_BINARY,"/usr/bin/google-chrome","/usr/bin/chromium",
 "/opt/google/chrome/chrome"].filter(Boolean).find(existsSync);
if(!chrome)throw Error("Chromium required for toolbar visual QA");
const tmp=mkdtempSync(path.join(tmpdir(),"aertex-tex-compile-"));
const artifacts="/tmp/aertex-compile-toolbar-visual";
mkdirSync(artifacts,{recursive:true});
const runtime="\n(async()=>{\n  try{\n    const wait=async(fn)=>{for(let i=0;i<100;i++){if(fn())return;await new Promise(r=>setTimeout(r,20))}throw Error(\"Toolbar runtime not mounted\")};\n    await wait(()=>document.getElementById(\"tex-compile-fixed\"));\n    const header=document.querySelector(\".tex-source-label\"),bar=document.querySelector(\".tex-editor-commandbar\");\n    const fixed=document.getElementById(\"tex-compile-fixed\"),compile=document.getElementById(\"tex-compile\");\n    const vector=fixed.querySelector(\".tex-compile-vector\"),indicator=document.getElementById(\"tex-build-indicator\");\n    const source=document.getElementById(\"tex-source\"),count=document.getElementById(\"tex-source-statistics\");\n    const doc=document.querySelector(\".tex-work-app\").dataset.texCollaborationDocumentId;\n    const box=el=>el.getBoundingClientRect();\n    const gap=box(fixed).left-box(bar).right;\n    if(getComputedStyle(header).justifyContent!==\"flex-start\")\n      throw Error(\"Command toolbar is not left-aligned\");\n    if(fixed.previousElementSibling!==bar||bar.parentElement!==header)\n      throw Error(\"Compile must be an adjacent fixed sibling of the scroll bar\");\n    if(Math.abs(gap-parseFloat(getComputedStyle(header).gap))>1.8)\n      throw Error(\"Adjacent gap incorrect: \"+gap);\n    if(box(count).left+1<box(fixed).right)throw Error(\"Count must follow the compile button\");\n    if(box(vector).width<24.5||box(vector).width>25.5)throw Error(\"SVG must be 25px\");\n    if(box(fixed).width<38||box(fixed).width>40)throw Error(\"Compile footprint not 39px\");\n    if(box(fixed).right>box(header).right+1)throw Error(\"Compile overflows the editor\");\n    if(innerWidth>1400&&(bar.scrollWidth>bar.clientWidth+2||box(fixed).left>950))\n      throw Error(\"Large screen has phantom scroll-bar space\");\n    if(innerWidth<430&&bar.scrollWidth<=bar.clientWidth+2)\n      throw Error(\"Small screen command strip should scroll horizontally\");\n    if(compile.parentElement!==fixed)throw Error(\"Original compile control was not moved\");\n    source.value+=\"\\n% edited\";\n    source.dispatchEvent(new Event(\"input\",{bubbles:true}));\n    if(indicator.hidden||!indicator.title.includes(\"等待编译\")||\n       !indicator.querySelector('circle[fill=\"#5e646e\"]')||\n       !indicator.querySelector('path[fill=\"#f8f9fb\"]'))\n      throw Error(\"Missing dirty-warning vector before automatic compilation\");\n    const emit=(name,detail={})=>window.dispatchEvent(new CustomEvent(\"aertex:tex-build-\"+name,\n      {detail:{documentId:doc,automatic:true,...detail}}));\n    document.body.style.setProperty(\"--primary\",\"#9c64e8\");\n    emit(\"started\");\n    if(!fixed.classList.contains(\"is-compiling\")||\n       getComputedStyle(vector).color!==\"rgb(156, 100, 232)\")\n      throw Error(\"Automatic compiling must use user's accent color\");\n    if(!vector.querySelector('svg path[d^=\"M10 7.8\"]'))\n      throw Error(\"Circular-play SVG was not found\");\n    emit(\"result\",{ok:true});\n    if(fixed.classList.contains(\"is-compiling\")||!indicator.querySelector(\"mask\")||\n       !indicator.querySelector(\"circle[mask]\"))\n      throw Error(\"Successful build must reset accent and show transparent check\");\n    emit(\"started\",{automatic:false});\n    if(!fixed.classList.contains(\"is-compiling\"))throw Error(\"Manual compile must turn accent on\");\n    emit(\"result\",{ok:false,log:\"Broken LaTeX\"});\n    if(fixed.classList.contains(\"is-compiling\")||!indicator.title.includes(\"编译失败\")||\n       !indicator.querySelector('circle[mask]'))\n      throw Error(\"Failure must reset accent and show a transparent X\");\n    emit(\"started\");\n    source.value+=\"\\n% more editing\";\n    source.dispatchEvent(new Event(\"input\",{bubbles:true}));\n    emit(\"finished\");\n    if(fixed.classList.contains(\"is-compiling\")||!indicator.title.includes(\"等待编译\"))\n      throw Error(\"Stale compilation must stop animation and remain dirty\");\n    document.body.dataset.toolbarQa=\"PASS\";\n    document.body.dataset.toolbarDetails=JSON.stringify({gap,scrollWidth:bar.scrollWidth,\n      barWidth:bar.clientWidth,width:innerWidth,compileX:box(fixed).left});\n  }catch(error){\n    document.body.dataset.toolbarQa=\"FAIL\";\n    document.body.dataset.toolbarError=error.message||String(error);\n  }\n})();\n";
function page(dark){
  const buttons=Array.from({length:16},(_,i)=>'<button class="tex-editor-command">'+(i+1)+'</button>').join("");
  return '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">'+
   '<meta name="viewport" content="width=device-width, initial-scale=1">'+
   '<style>body{margin:0;font:13px Arial,sans-serif}.tex-work-app{width:100%;'+
   '--text:'+(dark?'#eee':'#252831')+';--surface:'+(dark?'#22252b':'#fff')+';'+
   '--fill:'+(dark?'#3c404a':'#eff0f5')+';--muted:#727580;}'+
   '.tex-source-label{width:100%;display:flex;gap:8px;align-items:center;height:50px;'+
   'box-sizing:border-box;padding:0 6px}.tex-editor-commandbar{display:flex;align-items:center}'+
   '.tex-editor-command{height:39px;box-sizing:border-box}.tex-editor-toolbar{display:flex}'+
   '#tex-source-statistics{font-size:10px}.tex-editor-footer{display:flex}</style></head>'+
   '<body class="os-shell" data-theme="'+(dark?'dark':'light')+'">'+
   '<div class="tex-work-app" data-tex-root '+
   'data-tex-collaboration-document-id="22222222-2222-4222-8222-222222222222">'+
   '<div class="tex-editor-toolbar"><input id="tex-title" value="机器学习"/>'+
   '<span class="tex-save-state" id="tex-save-state">已自动保存</span></div>'+
   '<div class="tex-source-label"><span>TeX</span><div class="tex-editor-commandbar">'+
   buttons+'</div><span id="tex-realtime-status">同步</span>'+
   '<div id="tex-source-statistics">36 行 · 833 字符</div></div>'+
   '<div id="tex-editor"><textarea id="tex-source"></textarea>'+
   '<div class="tex-editor-footer"><button id="tex-compile">立即编译</button></div></div>'+
   '<div id="tex-document-list"></div></div>'+
   enhanceWorkTexToolbarScroll("",true)+enhanceWorkTexCompileToolbar("",true)+
   '<script>'+runtime+'</script></body></html>';
}
try{
 for(const width of [1600,900,600,380]){
  for(const dark of [false,true]){
   const name="compile-"+width+"-"+(dark?"dark":"light");
   const html=path.join(tmp,name+".html");
   const image=path.join(artifacts,name+".png");
   writeFileSync(html,page(dark),"utf8");
   const run=spawnSync(chrome,["--headless=new","--no-sandbox","--disable-gpu",
    "--disable-dev-shm-usage","--no-first-run","--allow-file-access-from-files",
    "--window-size="+width+",900","--virtual-time-budget=3500",
    "--screenshot="+image,"--dump-dom","file://"+html],
    {encoding:"utf8",timeout:25000,maxBuffer:3500000});
   assert.equal(run.status,0,"Chrome failed: "+String(run.stderr).slice(-1200));
   const dom=String(run.stdout||"");
   assert(dom.includes('data-toolbar-qa="PASS"'),name+": "+
    (dom.match(/data-toolbar-error="([^"]+)"/)?.[1]||"No PASS flag"));
   assert(existsSync(image),"Chrome screenshot missing: "+name);
   console.log(name+" : fixed adjacency, SVG warning, animated accent and transparent status PASS");
  }
 }
}finally{rmSync(tmp,{recursive:true,force:true})}
