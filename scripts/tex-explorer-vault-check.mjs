import { attachVaultBinding } from "./helpers/vault-binding.mjs";
import assert from "node:assert/strict";
import { createHash, webcrypto } from "node:crypto";
import { enhanceWorkTexOrganizeUi } from "../studio/ui-work-tex-organize-ui.js";
import { enhanceWorkTexCompileToolbar } from "../studio/ui-work-tex-compile-toolbar.js";
import { handleTexArchive } from "../studio/tex-archive-api.js";
import { handleTexOrganize } from "../studio/tex-organize-api.js";
import { handleTexProjectFiles } from "../studio/tex-project-files-api.js";

const userId="12e34567-e89b-12d3-a456-426614174111";
const otherId="12e34567-e89b-12d3-a456-426614174222";
const id="12e34567-e89b-12d3-a456-426614174333";
const work="https://work.qsseda.com";
const root="_system/tex-documents/"+userId+"/"+id+".json";

class MemoryR2 {
  constructor(){this.records=new Map();}
  async put(key,body,options={}){
    const current=this.records.get(key);
    if(options.onlyIf?.etagMatches && current?.etag!==options.onlyIf.etagMatches)return null;
    if(options.onlyIf?.etagDoesNotMatch==="*" && current)return null;
    const etag=createHash("sha256").update(String(body)).digest("hex");
    this.records.set(key,{body:typeof body==="string"?body:String(body),etag,customMetadata:options.customMetadata||{}});
    return {etag};
  }
  async get(key){
    const entry=this.records.get(key);
    return entry?{etag:entry.etag,text:async()=>entry.body,json:async()=>JSON.parse(entry.body),customMetadata:entry.customMetadata}:null;
  }
  async head(key){return this.records.get(key)||null;}
  async delete(key){
    for(const k of Array.isArray(key)?key:[key])this.records.delete(k);
  }
  async list({prefix}){
    const objects=[...this.records.entries()].filter(([key])=>key.startsWith(prefix))
      .map(([key,value])=>({key,customMetadata:value.customMetadata}));
    return {objects,truncated:false};
  }
}
const env={STORAGE:new MemoryR2()};
attachVaultBinding(env);
const doc={id,owner_id:userId,title:"Machine Learning",engine:"xelatex",
  source:"\\documentclass{ctexart}\n\\input{chapters/intro}\n",
  files:[{name:"chapters/intro.tex",encoding:"utf8",content:"\\section{Intro}\n"}],
  created_at:"2026-11-13T00:00:00.000Z",updated_at:"2026-11-13T00:00:00.000Z"};
await env.STORAGE.put(root,JSON.stringify(doc));
const request=(path,method="GET",body=null)=>new Request(work+path,{
  method,headers:{"content-type":"application/json"},...(body?{body:JSON.stringify(body)}:{})
});
const send=async(handler,path,method,body,who={id:userId})=>{
  const response=await handler(request(path,method,body),env,who);
  const data=await response.json();
  return {status:response.status,data};
};
let r=await send(handleTexOrganize,"/api/tex/organize","POST",
  {document_id:id,action:"pin-file",name:"chapters/intro.tex",value:true},userId);
assert.equal(r.status,200);assert.deepEqual(r.data.document.pinned_files,["chapters/intro.tex"]);
r=await send(handleTexOrganize,"/api/tex/organize","POST",
  {document_id:id,action:"pin-file",name:"missing.tex",value:false},userId);
assert.equal(r.status,404);
r=await send(handleTexOrganize,"/api/tex/organize","POST",
  {document_id:id,action:"lock-project",value:true},userId);
assert.equal(r.data.document.locked,true);
r=await send(handleTexProjectFiles,"/api/tex/files","POST",
  {document_id:id,operation:"delete",name:"chapters/intro.tex"},userId);
assert.equal(r.status,423,"Locked projects must not permit file deletion");
r=await send(handleTexOrganize,"/api/tex/organize","POST",
  {document_id:id,action:"lock-project",value:false},userId);
assert.equal(r.status,200);
r=await send(handleTexOrganize,"/api/tex/organize","POST",
  {document_id:id,action:"rename-folder",name:"chapters",value:"lessons"},userId);
assert.equal(r.status,200);
assert(r.data.document.source.includes("\\input{lessons/intro}"));
assert.equal(r.data.document.files[0].name,"lessons/intro.tex");

const html=enhanceWorkTexOrganizeUi('<main class="tex-work-app"></main>',true);
assert(html.includes('id="aertex-tex-organize-runtime"'));
const script=html.match(/<script id="aertex-tex-organize-runtime">([\s\S]*?)<\/script>/)?.[1];
assert(script);new Function(script);
for(const phrase of ["tex-row-menu-trigger","tex-editor-mode","tex-organize-pins","tex-organize-archives","tex-archive-toggle","tex-runs-panel",
  "window.__aertexTexSetVisualMode","PBKDF2","AES-GCM","900000","account_password"]){
  assert(html.includes(phrase),"Missing "+phrase);
}
assert(html.includes("#tex-document-list::-webkit-scrollbar"),"Explorer scrollbar must be visually hidden without disabling scroll");

assert(script.includes("if(!stored.archived||stored.id!==id)") &&
  script.includes("records.delete(id)") &&
  script.includes("list.querySelector('.tex-document-item[data-tex-document-id=") &&
  script.includes("sessionStorage.setItem(archiveExpandFlag,'1')") &&
  script.includes("location.replace('/'+locale+'/tex')"),
  "Confirmed encrypted archives must disappear from active projects, reopen archive rail and navigate to the localized overview");
assert(!script.includes("['rename','delete','archive','lock'].includes(action)"),
  "Archiving must not trigger two independent main.tex saves while capturing a version");
assert(script.includes("bridge.getAssetValue?.()!==selected.content"),
  "The archive must refuse dirty supplementary file contents instead of storing a stale snapshot");
assert(script.includes("archiveToggle.querySelector('span').textContent"),
  "Third-column archive section must surface the archived project count");

assert(html.includes("max-height:none!important"),"Explorer must fill its available vertical space");
assert(html.includes("#tex-command-rename-project svg") && html.includes("#tex-command-rename svg"),"Project and file menus must reuse their distinct Fluent rename artwork");
assert(html.includes("width:158px!important"),"Popup must use a narrow balanced action menu");
assert(html.includes("tex-project-rename-sigma"),"Project rename icon must retain the Sigma accent");

assert(script.includes("function vBlocks(") && script.includes("function vPatch("),"Visual mode must parse source and patch original TeX offsets");
assert(!script.includes("embedded.src=src") && !script.includes("The project PDF appears here"),
  "Visual mode must never be implemented as a compiled PDF overlay");

assert(script.includes("isVisualTeX") && script.includes("syncVisualAvailability()"),
  "Non-TeX files must use the existing CodeMirror editor instead of a second visual/source pane");
assert(script.includes("editorChoice.hidden=!available") &&
  script.includes("editorSelect.disabled=!available"),
  "Hide and disable visual editor selector for Python, YAML, BibTeX and other non-TeX files");
assert(!script.includes("tex-v-raw-document") && !script.includes("直接编辑 LaTeX 源码 · 不叠加 PDF"),
  "Do not add duplicate source editors or redundant visual-mode disclaimer labels");
assert(script.includes("隐藏文档导言区") && script.includes("aria-expanded"),
  "The preamble button must switch between show and hide labels");
assert(html.includes("is-visual-mode.is-asset-mode.is-codemirror-asset"),
  "Visual TeX mode must hide the shared CodeMirror host even for non-main TeX files");
const finalEditor = enhanceWorkTexCompileToolbar(html,true);
assert(finalEditor.includes("body.os-shell:has(.tex-work-app) .tex-work-app #tex-editor>.tex-editor-footer") &&
  finalEditor.includes("display:none!important;height:0!important"),
  "Visual mode must hide the obsolete footer even if an earlier style makes it visible");
assert(finalEditor.includes("grid-template-rows:auto auto minmax(0,1fr)!important"),
  "Source and visual editors must consume the freed footer space without overflow");
assert(finalEditor.includes("titleStack.append(heading,saveState)"),
  "Visual mode must share the same live save label directly under the project title");
assert(script.includes("bridge.replaceRange(from,to,next,false)"),
  "Visual edits must use the CodeMirror transaction bridge for realtime and undo");
assert(script.includes("import('/assets/tex/katex.js')"),
  "Math formulas must be typeset by a self-hosted MathML renderer");

assert(script.includes("const displayMath=vMathDisplaySource(math)") &&
  script.includes("b.dataset.mathTex=displayMath") &&
  script.includes("if(displayMath!==math)b.textContent=vMath(displayMath)"),
  "KaTeX and its early text fallback must omit equation labels without changing source ranges");
const mathHelperStart=script.indexOf("  function vMathDisplaySource(");
const mathHelperEnd=script.indexOf("  function vChip(",mathHelperStart);
const closeHelperStart=script.indexOf("  function vClose(");
const closeHelperEnd=script.indexOf("  function vEnvEnd(",closeHelperStart);
assert(mathHelperStart>0&&mathHelperEnd>mathHelperStart&&closeHelperEnd>closeHelperStart,
  "Visual math source sanitizer must have a balanced-label parser");
const sanitizeMath=new Function(
  script.slice(closeHelperStart,closeHelperEnd)+script.slice(mathHelperStart,mathHelperEnd)+
  "\nreturn vMathDisplaySource;"
)();
const labelledEquation="\\label{eq:finite-difference}\\frac{\\partial J}{\\partial \\beta_j}";
assert.equal(sanitizeMath(labelledEquation),"\\frac{\\partial J}{\\partial \\beta_j}",
  "Cross-reference label must not be printed as a red TeX command");
assert.equal(sanitizeMath("\\label{a}\\alpha \\label {b}\\beta"),"\\alpha \\beta",
  "Multiple labels and label-space-brace forms must be hidden");
assert.equal(sanitizeMath("x+\\label{eq:{nested}}y"),"x+y",
  "Nested braces must not leak label content into preview");
assert.equal(sanitizeMath("a\\notag b\\nonumber"),"a b",
  "AMS no-number metadata must not appear in typeset math");
assert.equal(sanitizeMath("x+\\label{unfinished"),"x+\\label{unfinished",
  "Malformed labels must remain visible/editable instead of silently disappearing");
assert(labelledEquation.includes("\\label{eq:finite-difference}"),
  "Sanitization must never mutate the original TeX source");

const parserStart=script.indexOf("  function vClose("),parserEnd=script.indexOf("  function vChip(",parserStart);
assert(parserStart>=0&&parserEnd>parserStart,"Visual parser must be present");
const parseVisual=new Function("maxVisualBlocks",
  script.slice(parserStart,parserEnd)+"\nreturn vBlocks;")(2500);
const sampleVisual=String.raw`\documentclass{ctexart}
\title{机器学习}
\begin{document}
\maketitle
\begin{abstract}
这是摘要。
\end{abstract}
\section{基础}\label{intro}
正文 \textbf{加粗} 与 $x^2$。
\begin{table}
\begin{tabular}{lc}
\toprule
名称 & 数值 \\
\midrule
x & 1 \\
\bottomrule
\end{tabular}
\end{table}
\input{chapters/foundations}
\printbibliography
\end{document}`;
const blocks=parseVisual(sampleVisual);
assert.deepEqual(blocks.map(b=>b.type),
  ["preamble","command","abstract","heading","paragraph","table","command","command","end"],
  "Visual LaTeX blocks must retain document structure, including nested table floats");
for(const block of blocks)assert(block.start>=0&&block.end<=sampleVisual.length&&block.end>block.start,
  "Every visual block must map to a valid original TeX source span");
const heading=blocks.find(x=>x.type==="heading");
assert.equal(sampleVisual.slice(heading.innerStart,heading.innerEnd),"基础");
assert.equal(sampleVisual.slice(blocks.at(-1).start,blocks.at(-1).end),"\\end{document}");

assert(!html.includes("localStorage.setItem('archive"),"Vault secrets must not be written into local storage");

const te=new TextEncoder(),salt=webcrypto.getRandomValues(new Uint8Array(16));
const binaryBase64=data=>Buffer.from(data).toString("base64");
const vaultPassword="P5*secure_archive_password_generated!";
const base=await webcrypto.subtle.importKey("raw",te.encode(vaultPassword),"PBKDF2",false,["deriveKey"]);
const key=await webcrypto.subtle.deriveKey({name:"PBKDF2",salt,hash:"SHA-256",iterations:900000},base,
  {name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
async function seal(text,aad) {
  const iv=webcrypto.getRandomValues(new Uint8Array(12));
  const out=await webcrypto.subtle.encrypt({name:"AES-GCM",iv,additionalData:te.encode(aad)},key,te.encode(text));
  return {iv:binaryBase64(iv),data:binaryBase64(Buffer.from(out))};
}
const check=await seal("AERTEX-TeX-Archive:verified","aertex:archive:v1:check");
r=await send(handleTexArchive,"/api/tex/archive?mode=config","POST",
  {salt:binaryBase64(salt),iv:check.iv,check:check.data,iterations:900000});
assert.equal(r.status,200);
const archiveDoc=JSON.parse((await env.STORAGE.get(root)).body||await (await env.STORAGE.get(root)).text());
const payload=await seal(JSON.stringify(archiveDoc),"AERTEX-TeX-archive:"+id);
const title=await seal(archiveDoc.title,"AERTEX-TeX-archive-title:"+id);
r=await send(handleTexArchive,"/api/tex/archive?mode=store","POST",
  {id,updated_at:archiveDoc.updated_at,storage_revision:(await env.STORAGE.head(root)).etag,vault_salt:binaryBase64(salt),encrypted:{...payload,titleIv:title.iv,titleData:title.data}});
assert.equal(r.status,200,JSON.stringify(r.data));
assert.equal((await env.STORAGE.get(root)).customMetadata.kind,"tex-tombstone","Plaintext must be replaced by a payload-free CAS marker");
assert.equal(JSON.parse(await (await env.STORAGE.get(root)).text()).source,undefined);
r=await send(handleTexArchive,"/api/tex/archive?mode=list","GET");
assert.equal(r.data.items.length,1);
const stored=await env.STORAGE.get("_system/tex-archive/"+userId+"/"+id+".json");
assert(stored);
assert(!String(await stored.text()).includes("\\section{Intro}"),"Storage must contain ciphertext, not plaintext");
r=await send(handleTexArchive,"/api/tex/archive?mode=list","GET",null,{id:otherId});
assert.equal(r.data.items.length,0,"Vaults must be owner-scoped");
r=await send(handleTexArchive,"/api/tex/archive?mode=restore","POST",
  {id,document:archiveDoc,vault_salt:binaryBase64(salt)});
assert.equal(r.status,200,JSON.stringify(r.data));
assert(await env.STORAGE.head(root),"Restoring must re-create the original project");
assert.equal((await send(handleTexArchive,"/api/tex/archive?mode=list","GET")).data.items.length,0);
console.log("TeX organizer, lock safeguards, authenticated encrypted archive cycle, fixed editor and syntax checks passed.");
