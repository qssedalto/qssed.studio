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
 {name:"unsupported extension",files:[file("code.js","bad")],status:400},
 {name:"text in binary",files:[file("image.png","not binary")],status:400},
 {name:"wrong binary signature",files:[{name:"file.pdf",encoding:"base64",content:Buffer.from("not a pdf").toString("base64")}],status:400},
 {name:"overlarge",files:[file("huge.tex","a".repeat(180001))],status:400}
];
for(const test of invalidCases){
  const r=await invoke({document_id:id,files:test.files});
  assert.equal(r.status,test.status,test.name+" "+JSON.stringify(r.body));
  assert.equal(objects.get(key).files.length,4,"Failed writes must not mutate project files.");
}
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
assert(markup.includes('id="tex-file-text-editor"'),"New text files need an editable surface.");
assert(markup.includes("operation:'replace'"),"Text editing must save through authorized file replacement.");
console.log("TeX file creation, ACL isolation, duplicate protection, import UI and disabled plus validated.");
