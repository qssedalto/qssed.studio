import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { handleTexProjectFiles } from "../studio/tex-project-files-api.js";
import { reconcileTexMainEntry } from "../studio/tex-main-entry.js";
import { texWorkbenchContent } from "../studio/ui-tex-workbench.js";
import { enhanceTexProjectControls } from "../studio/ui-tex-project-controls.js";
import { TEX_FILE_MODAL_RUNTIME } from "../studio/ui-tex-file-modal-runtime.js";
import { enhanceTexFileModal } from "../studio/ui-tex-file-modal.js";

const owner="11111111-1111-4111-8111-111111111111";
const other="22222222-2222-4222-8222-222222222222";
const id="33333333-3333-4333-8333-333333333333";
const key="_system/tex-documents/"+owner+"/"+id+".json";
const original={
  id,owner_id:owner,title:"A test project",engine:"xelatex",
  source:"\\documentclass{article}\n\\begin{document}Hello\\end{document}",
  files:[{name:"sample.bib",encoding:"utf8",content:"@misc{a,title={A}}"}],
  project_type:"blank",created_at:new Date().toISOString(),updated_at:new Date().toISOString()
};
const objects=new Map([[key,structuredClone(original)]]);
const etagFor = value => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const storage={
  async get(k){const doc=objects.get(k);return doc ? {etag:etagFor(doc),text:()=>Promise.resolve(JSON.stringify(doc))} : null;},
  async put(k,content,options){
    const current=objects.get(k);
    if(options.onlyIf?.etagMatches && (!current||etagFor(current)!==options.onlyIf.etagMatches))return null;
    assert.equal(options.customMetadata.kind,"tex-document");
    const doc=JSON.parse(content);
    assert.equal(Number(options.customMetadata.fileCount),doc.files.length+(doc.main_deleted?0:1));
    objects.set(k,doc);
    return {etag:etagFor(doc)};
  }
};
const invoke=async (input,user=owner) => {
  const req=new Request("https://work.qsseda.com/api/tex/files",{
    method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(input)
  });
  const res=await handleTexProjectFiles(req,{STORAGE:storage},user);
  return { status:res.status,body:await res.json() };
};
const file=(name,content="")=>({name,encoding:"utf8",content});
const inserted=await invoke({document_id:id,files:[file("chapter1.tex","\\section{One}")]});
assert.equal(inserted.status,200);
assert.equal(inserted.body.document.files.length,2);
assert.equal(inserted.body.document.files[1].name,"chapter1.tex");
assert.equal(inserted.body.document.source,original.source,"Adding a file must not overwrite main.tex.");
assert.equal(objects.get(key).files.length,2,"The new file must persist to the owner document.");

const multi=await invoke({document_id:id,files:[file("sections/notes.txt","hello"),file("refs/additional.bib","@book{b}")]});
assert.equal(multi.status,200);
assert.equal(objects.get(key).files.length,4);

const edited=await invoke({document_id:id,operation:"replace",
  files:[file("chapter1.tex","\\\\section{Updated}") ]});
assert.equal(edited.status,200,"Existing supplementary files must be editable.");
assert.equal(objects.get(key).files.find(f=>f.name==="chapter1.tex").content,"\\\\section{Updated}");
assert.equal(objects.get(key).source,original.source,"Editing an extra file must not replace main.tex.");
const missingEdit=await invoke({document_id:id,operation:"replace",files:[file("not-here.tex","") ]});
assert.equal(missingEdit.status,404,"Only existing files may be edited.");

const invalidCases=[
 {name:"duplicate",files:[file("SAMPLE.BIB","oops")],status:409},
 {name:"main overwrite",files:[file("main.tex","oops")],status:409},
 {name:"path traversal",files:[file("../secret.tex","oops")],status:400},
 {name:"hidden path",files:[file(".git/config.tex","oops")],status:400},
 {name:"unsupported executable",files:[file("tool.exe","not allowed")],status:400},
 {name:"text in binary",files:[file("image.png","not binary")],status:400},
 {name:"wrong binary signature",files:[{name:"file.pdf",encoding:"base64",content:Buffer.from("not a pdf").toString("base64")}],status:400},
 {name:"overlarge",files:[file("huge.tex","a".repeat(2000001))],status:400}
];
for(const test of invalidCases){
  const r=await invoke({document_id:id,files:test.files});
  assert.equal(r.status,test.status,test.name+" "+JSON.stringify(r.body));
  assert.equal(objects.get(key).files.length,4,"Failed writes must not mutate project files.");
}
const renamed=await invoke({document_id:id,operation:"rename",name:"chapter1.tex",new_name:"chapters/chapter1.tex"});
assert.equal(renamed.status,200,"Renaming a supplementary file must succeed.");
assert(objects.get(key).files.some(f=>f.name==="chapters/chapter1.tex"),"Renamed file must persist under its nested folder.");
assert.equal(objects.get(key).files.find(f=>f.name==="chapters/chapter1.tex").content,"\\\\section{Updated}","Rename must not discard file contents.");
const renamedMain=await invoke({document_id:id,operation:"rename",name:"main.tex",new_name:"entry.tex"});
assert.equal(renamedMain.status,200,"The root TeX file must be renameable.");
assert.equal(renamedMain.body.document.main_filename,"entry.tex");
assert.equal(renamedMain.body.document.source,original.source,"Renaming the root entry must not lose its source.");
const collidingMain=await invoke({document_id:id,operation:"rename",name:"entry.tex",new_name:"sample.bib"});
assert.equal(collidingMain.status,409,"The root TeX entry must keep its extension and avoid duplicate names.");
const removedMain=await invoke({document_id:id,operation:"delete",name:"entry.tex"});
assert.equal(removedMain.status,200,"Deleting the root entry must not delete the entire project.");
assert.equal(objects.get(key).main_deleted,true);
assert.equal(objects.get(key).source,"","Deleting the root entry must remove its content.");
assert.equal(objects.get(key).files.length,4,"Root deletion must preserve supporting files.");
const restoredMain=await invoke({document_id:id,files:[file("main.tex",original.source)]});
assert.equal(restoredMain.status,200,"A root TeX entry can be created again after deletion.");
assert.equal(objects.get(key).main_deleted,false);
assert.equal(objects.get(key).main_filename,"main.tex");
assert.equal(objects.get(key).source,original.source);
const invalidRename=await invoke({document_id:id,operation:"rename",name:"chapters/chapter1.tex",new_name:"../unsafe.tex"});
assert.equal(invalidRename.status,409,"Rename must reject unsafe paths.");
const removed=await invoke({document_id:id,operation:"delete",name:"chapters/chapter1.tex"});
assert.equal(removed.status,200,"Deleting an extra project file must succeed.");
assert(!objects.get(key).files.some(f=>f.name==="chapters/chapter1.tex"),"Deleted file must no longer be stored.");
const markdown=await invoke({document_id:id,files:[file("notes/README.md","# Heading")]});
assert.equal(markdown.status,200,"Markdown text files must be supported for inline reading.");
assert.equal((await invoke({document_id:id,operation:"delete",name:"notes/README.md"})).status,200);
// Word, Excel and PowerPoint must remain binary, while CSV, JSON, JS and
// programming language sources must remain directly editable UTF-8 files.
const binaryFile=(name,bytes)=>({
  name,encoding:"base64",content:Buffer.from(bytes).toString("base64")
});
const officeObjects=[
  binaryFile("documents/report.docx",[0x50,0x4b,0x03,0x04,0,0]),
  binaryFile("data/table.xlsx",[0x50,0x4b,0x03,0x04,0,0]),
  binaryFile("slides/deck.pptx",[0x50,0x4b,0x03,0x04,0,0])
];
const extraFormats=[
  file("results/data.csv","x,y\\n1,2"),
  file("code/main.cpp","#include <iostream>"),
  file("code/Main.java","public class Main {}"),
  file("src/app.js","export const x = 1;"),
  file("settings.json",'{"enabled":true}'),
  file("config/build.yml","steps: []"),
  file(".gitignore","node_modules/"),
  file(".github/workflows/ci.yml","name: CI")
];
const formats=await invoke({document_id:id,files:[...officeObjects,...extraFormats]});
assert.equal(formats.status,200,JSON.stringify(formats.body));
assert.equal(formats.body.document.files.filter(f=>/\.(docx|xlsx|pptx)$/.test(f.name)&&f.encoding==="base64").length,3);
assert(formats.body.document.files.some(f=>f.name===".gitignore"));
assert(formats.body.document.files.some(f=>f.name===".github/workflows/ci.yml"));
const badOffice=await invoke({document_id:id,files:[
  binaryFile("broken.docx",Buffer.from("not an Office archive"))
]});
assert.equal(badOffice.status,400,"Office MIME extensions must have a ZIP container signature.");

const fullId="44444444-4444-4444-8444-444444444444";
const fullKey="_system/tex-documents/"+owner+"/"+fullId+".json";
objects.set(fullKey,{...structuredClone(original),id:fullId,files:[]});
const allFiles=Array.from({length:499},(_,i)=>file("code/file"+i+".js","// "+i));
const full=await invoke({document_id:fullId,files:allFiles});
assert.equal(full.status,200,JSON.stringify(full.body).slice(0,600));
assert.equal(full.body.document.files.length,499,"499 extra assets and main.tex = 500 files.");
const over=await invoke({document_id:fullId,files:[file("501st.txt","extra")]});
assert.equal(over.status,409,"The 501st project file must be rejected.");
assert.match(over.body.error,/500 files/);
// Regression: deleting a canonical main.tex, then uploading a complete
// project ZIP/file batch with main.tex used to create an orphan supplementary
// main.tex while leaving main_deleted=true. The tree showed main.tex but the
// header demanded "Create a TeX entry" and the source PUT returned 409.
const batchId="55555555-5555-4555-8555-555555555555";
const batchKey="_system/tex-documents/"+owner+"/"+batchId+".json";
const batchSource="\\\\documentclass{ctexart}\\n\\\\begin{document}Valid\\\\end{document}";
objects.set(batchKey,{...structuredClone(original),id:batchId,source:"",
  main_filename:"main.tex",main_deleted:true,files:[]});
const batchRecreated=await invoke({document_id:batchId,files:[
  file("README.md","# Multi-file import"),file("main.tex",batchSource),
  file("chapters/intro.tex","\\\\section{Introduction}")
]});
assert.equal(batchRecreated.status,200,JSON.stringify(batchRecreated.body).slice(0,500));
assert.match(String(batchRecreated.body.document.realtime_epoch||""),
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  "Importing main.tex must rotate the source room instead of reviving an old Yjs snapshot.");
assert.equal(batchRecreated.body.document.main_deleted,false,
  "Root main.tex in a batch must revive the real compile entry.");
assert.equal(batchRecreated.body.document.main_filename,"main.tex");
assert.equal(batchRecreated.body.document.source,batchSource,
  "The uploaded file bytes must become the canonical source, not a stale cache.");
assert.deepEqual(batchRecreated.body.document.files.map(f=>f.name),
  ["README.md","chapters/intro.tex"],"Supporting assets must remain in original order without another main.tex");
assert.equal(new Set(batchRecreated.body.document.files.map(f=>f.name.toLowerCase())).size,2);
const batchRemoval=await invoke({document_id:batchId,operation:"delete",name:"main.tex"});
assert.equal(batchRemoval.status,200,"The repaired canonical entry must be deletable again.");
assert.notEqual(batchRemoval.body.document.realtime_epoch,batchRecreated.body.document.realtime_epoch,
  "Deleting the main entry must also isolate stale collaboration state.");
assert.equal(objects.get(batchKey).main_deleted,true);
assert.equal(objects.get(batchKey).source,"");
assert.equal(reconcileTexMainEntry(objects.get(batchKey)).main_deleted,true,
  "A deliberate deletion without a real stored main.tex must remain deleted.");

const ghostId="66666666-6666-4666-8666-666666666666";
const ghostKey="_system/tex-documents/"+owner+"/"+ghostId+".json";
const ghostRecord={...structuredClone(original),id:ghostId,main_deleted:true,
  main_filename:"main.tex",source:"",
  files:[file("main.tex",batchSource),file("chapters/part.tex","\\\\section{Part}") ]};
objects.set(ghostKey,ghostRecord);
const recovered=reconcileTexMainEntry(ghostRecord);
assert.equal(recovered.main_deleted,false,"Legacy orphan must become an available entry on read.");
assert.equal(recovered.source,batchSource,"Recovery must copy the actual file content.");
assert.deepEqual(recovered.files.map(f=>f.name),["chapters/part.tex"]);
assert.equal(ghostRecord.main_deleted,true,"Normalization must not mutate raw R2 records.");
assert.equal(ghostRecord.files.length,2,"Recovery must preserve the original stored bytes until a write.");
const persisted=await invoke({document_id:ghostId,files:[file("notes.txt","saved")]});
assert.equal(persisted.status,200);
assert.equal(objects.get(ghostKey).main_deleted,false);
assert.equal(objects.get(ghostKey).source,batchSource);
assert.deepEqual(objects.get(ghostKey).files.map(f=>f.name),["chapters/part.tex","notes.txt"]);
assert.equal(reconcileTexMainEntry({main_deleted:true,source:"",
  files:[file("chapters/part.tex","kept")]}).main_deleted,true,
  "A deleted entry cannot be resurrected from an unrelated chapter.");
assert.equal(reconcileTexMainEntry({main_deleted:true,source:"old deleted text",files:[]}).main_deleted,true,
  "A deleted source must never reappear from an old cache.");

const outsider=await invoke({document_id:id,files:[file("steal.tex","") ]},other);
assert.equal(outsider.status,404,"Files must only be writable within the authenticated owner's namespace.");
const unknown=await invoke({document_id:"not-an-id",files:[file("a.tex","")]});
assert.equal(unknown.status,400);

// Rendered inline scripts are strings, so parse them explicitly in addition to module --check.
new Function(TEX_FILE_MODAL_RUNTIME.replace("__COPY__", JSON.stringify({zh:true})));
const markup=enhanceTexProjectControls('<body>'+texWorkbenchContent(true)+'</body>',true);
assert(markup.includes('id="tex-create" type="button" disabled'),"Plus should be disabled before a project is active.");
assert(markup.includes('id="tex-project-home"') &&
  markup.indexOf('id="tex-project-home"') < markup.indexOf('id="tex-project-new-trigger"') &&
  markup.indexOf('id="tex-project-new-trigger"') < markup.indexOf('id="tex-create"'),
  "Home, New Project, and plus must appear in that order within one create row.");
assert(markup.includes('grid-template-columns:38px minmax(0,1fr) 38px!important') &&
  markup.includes('grid-template-columns:48px minmax(0,1fr) 48px!important'),
  "Home control must have equal square tracks to the plus on desktop and mobile.");
assert(markup.includes('aria-label="返回 TeX 首页"') &&
  markup.includes('https://work.qsseda.com/en-us/tex'),
  "Icon must have an accessible label and a safe same-tab work home destination.");

assert(markup.includes("window.__aertexFileSetActive?.(activeDocument)"),"Active project must control plus.");
assert(markup.includes("window.__aertexTexFileOpenDialog?.()"),"Plus must open file dialog, not new-project menu.");
for(const id of ["tex-file-dialog","tex-file-panel-upload","tex-file-panel-new",
    "tex-file-panel-import","tex-file-dropzone","tex-file-import-source","tex-file-import-output"]){
  assert(markup.includes('id="'+id+'"'),"File dialog missing "+id);
}
assert(markup.includes("/api/tex/files"),"Dialog must save through the owner-scoped file API.");
assert(markup.includes("data-file-tab"),"Dialog needs accessible three-way navigation.");
assert(markup.includes("tex-project-files") || markup.includes("tex-file-dialog"),"File modal must remain mounted.");
assert(markup.includes("supports") || markup.includes("500 个文件"),"File picker must describe the expanded file limits.");
assert(markup.includes('id="tex-file-text-editor"'),"New text files need an editable surface.");
assert(markup.includes("operation:'replace'"),"Text editing must save through authorized file replacement.");
// Regression: dragging a directory with dozens of files must never squeeze
// README.md into a vertical one-character column or push Clear into the middle.
const fileDialog=enhanceTexFileModal("<html><body></body></html>",true);
const fileStyle=fileDialog.split('<style id="tex-file-modal-style">')[1]?.split("</style>")[0];
const fileRuntime=fileDialog.split('<script id="tex-file-modal-runtime">')[1]?.split("</script>")[0];
assert(fileStyle&&fileRuntime,"The upload modal must include its CSS and runtime");
assert(fileStyle.includes("grid-template-columns:minmax(0,1fr) 68px 30px!important"),
  "Selected files must have independent name, size, and remove columns");
assert(fileStyle.includes("white-space:nowrap!important;overflow-wrap:normal!important;word-break:normal!important"),
  "Selected filename must stay horizontal and ellipsize instead of wrapping per character");
assert(fileStyle.includes("#tex-file-dialog .tex-file-selection-head")&&
  fileStyle.includes("grid-template-columns:minmax(0,1fr) auto!important"),
  "The selected count and Clear button must occupy the full queue width");
assert(fileStyle.includes("max-height:min(248px,32dvh)")&&
  fileStyle.includes("overflow-y:auto!important"),
  "30+ files must scroll within a bounded list rather than stretch the dialog");
assert(fileStyle.includes("#tex-file-panel-upload:has(.tex-file-selection:not([hidden]))"),
  "After dropping files, shrink the dropzone to expose more of the file queue");
assert(fileRuntime.includes("name.className = 'tex-file-selected-name'")&&
  fileRuntime.includes("name.title = entry.path")&&
  fileRuntime.includes("remove.className = 'tex-file-selected-remove'"),
  "Every queued file needs full-path hover text and a consistent remove control");
new Function(fileRuntime);
console.log("TeX file creation, ACL isolation, duplicate protection, import UI and disabled plus validated.");
