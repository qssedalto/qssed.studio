import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { enhanceWorkTexOrganizeUi } from "../studio/ui-work-tex-organize-ui.js";
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
    this.records.set(key,{body:typeof body==="string"?body:String(body),customMetadata:options.customMetadata||{}});
  }
  async get(key){
    const entry=this.records.get(key);
    return entry?{text:async()=>entry.body,json:async()=>JSON.parse(entry.body),customMetadata:entry.customMetadata}:null;
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
assert(html.includes("max-height:none!important"),"Explorer must fill its available vertical space");
assert(html.includes("#tex-command-rename-project svg") && html.includes("#tex-command-rename svg"),"Project and file menus must reuse their distinct Fluent rename artwork");
assert(html.includes("width:158px!important"),"Popup must use a narrow balanced action menu");
assert(html.includes("tex-project-rename-sigma"),"Project rename icon must retain the Sigma accent");

assert(script.includes("function vBlocks(") && script.includes("function vPatch("),"Visual mode must parse source and patch original TeX offsets");
assert(!script.includes("embedded.src=src") && !script.includes("The project PDF appears here"),
  "Visual mode must never be implemented as a compiled PDF overlay");
assert(script.includes("bridge.replaceRange(from,to,next,false)"),
  "Visual edits must use the CodeMirror transaction bridge for realtime and undo");
assert(script.includes("import('/assets/tex/katex.js')"),
  "Math formulas must be typeset by a self-hosted MathML renderer");
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
  {id,updated_at:archiveDoc.updated_at,encrypted:{...payload,titleIv:title.iv,titleData:title.data}});
assert.equal(r.status,200,JSON.stringify(r.data));
assert.equal(await env.STORAGE.head(root),null,"Plaintext document must be removed on archive");
r=await send(handleTexArchive,"/api/tex/archive?mode=list","GET");
assert.equal(r.data.items.length,1);
const stored=await env.STORAGE.get("_system/tex-archive/"+userId+"/"+id+".json");
assert(stored);
assert(!String(await stored.text()).includes("\\section{Intro}"),"Storage must contain ciphertext, not plaintext");
r=await send(handleTexArchive,"/api/tex/archive?mode=list","GET",null,{id:otherId});
assert.equal(r.data.items.length,0,"Vaults must be owner-scoped");
r=await send(handleTexArchive,"/api/tex/archive?mode=restore","POST",
  {id,document:archiveDoc});
assert.equal(r.status,200,JSON.stringify(r.data));
assert(await env.STORAGE.head(root),"Restoring must re-create the original project");
assert.equal((await send(handleTexArchive,"/api/tex/archive?mode=list","GET")).data.items.length,0);
console.log("TeX organizer, lock safeguards, authenticated encrypted archive cycle, fixed editor and syntax checks passed.");
