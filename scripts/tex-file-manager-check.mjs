import assert from "node:assert/strict";
import { handleTexProjectFiles } from "../studio/tex-project-files-api.js";
import { texWorkbenchContent } from "../studio/ui-tex-workbench.js";
import { enhanceTexProjectControls } from "../studio/ui-tex-project-controls.js";
import { TEX_FILE_MODAL_RUNTIME } from "../studio/ui-tex-file-modal-runtime.js";

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
const storage={
  async get(k){const doc=objects.get(k);return doc ? {text:()=>Promise.resolve(JSON.stringify(doc))} : null;},
  async put(k,content,options){
    assert.equal(options.customMetadata.kind,"tex-document");
    const doc=JSON.parse(content);
    assert.equal(Number(options.customMetadata.fileCount),doc.files.length+1);
    objects.set(k,doc);
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
const protectedMain=await invoke({document_id:id,operation:"delete",name:"main.tex"});
assert.equal(protectedMain.status,400,"Required main.tex entry point must not be removable.");
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
const outsider=await invoke({document_id:id,files:[file("steal.tex","") ]},other);
assert.equal(outsider.status,404,"Files must only be writable within the authenticated owner's namespace.");
const unknown=await invoke({document_id:"not-an-id",files:[file("a.tex","")]});
assert.equal(unknown.status,400);

// Rendered inline scripts are strings, so parse them explicitly in addition to module --check.
new Function(TEX_FILE_MODAL_RUNTIME.replace("__COPY__", JSON.stringify({zh:true})));
const markup=enhanceTexProjectControls('<body>'+texWorkbenchContent(true)+'</body>',true);
assert(markup.includes('id="tex-create" type="button" disabled'),"Plus should be disabled before a project is active.");
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
console.log("TeX file creation, ACL isolation, duplicate protection, import UI and disabled plus validated.");
