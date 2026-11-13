import assert from "node:assert/strict";
import vm from "node:vm";
import { WORK_TEX_EXPLORER_TREE } from "../studio/ui-work-tex-explorer-tree.js";
import { WORK_TEX_EXPLORER_STYLE } from "../studio/ui-work-tex-explorer-style.js";

const code=WORK_TEX_EXPLORER_TREE.replace("__ZH__","true");
assert.doesNotThrow(()=>new vm.Script(code),"Explorer selection runtime must parse");
const start=code.indexOf("  function syncSelectedTree(){");
const end=code.indexOf("\n  window.__aertexTexSyncSelectedTree=",start);
assert(start>=0&&end>start,"A dedicated hierarchical selection updater must exist");
const body=code.slice(start,end);
assert(body.includes("selected?.name||'main.tex'"));
assert(body.includes("row.dataset.project===id && row.dataset.file===name"));
assert(body.includes("row.classList.toggle('is-active',active)"));
assert(body.includes("row.setAttribute('aria-current','true')"));
assert(body.includes("folderRow.classList.add('is-active-path')"));
assert(body.includes("projectRow?.classList?.add('is-file-active')"));
assert(body.includes("parent.hidden=false"),"Selected nested files must expand collapsed ancestors");
assert(code.includes("syncSelectedTree(reveal);\n    window.dispatchEvent(new Event('aertex:tex-project-asset-selected'));"),
  "Selecting main.tex must update highlighted hierarchy");
assert(code.includes("window.dispatchEvent(new Event('aertex:tex-project-asset-selected'));\n    syncSelectedTree(true);"),
  "Switching to supplementary files must update the highlighted hierarchy");
assert(code.includes("    syncSelectedTree();\n  }\n  async function expand("),
  "Rebuilt folder contents must restore selection");
assert(code.includes("projectObserver.observe(root,{attributes:true,attributeFilter:['data-tex-collaboration-document-id']})"),
  "Async project switching must refresh selected hierarchy");
assert(WORK_TEX_EXPLORER_STYLE.includes(".tex-tree-folder.is-active-path"));
assert(WORK_TEX_EXPLORER_STYLE.includes(".tex-document-item.is-file-active"));
assert(WORK_TEX_EXPLORER_STYLE.includes(".tex-tree-file[aria-current=\"true\"]"));

class Classes {
  constructor(){this.items=new Set()}
  add(value){this.items.add(value)}
  remove(value){this.items.delete(value)}
  toggle(value,active){if(active)this.add(value);else this.remove(value)}
  contains(value){return this.items.has(value)}
}
const make=(type,properties={})=>({classList:new Classes(),dataset:{},attrs:{},
  setAttribute(k,v){this.attrs[k]=v},removeAttribute(k){delete this.attrs[k]},
  querySelector(){return null},...properties});
const project=make("project",{dataset:{texDocumentId:"project-1"}});
const box=make("tree",{hidden:true,previousElementSibling:project});
box.classList.add("tex-tree-children");
const a=make("A",{dataset:{projectId:"project-1",projectFolder:"chapters"}}),
  b=make("B",{dataset:{projectId:"project-1",projectFolder:"chapters/2026"}});
a.classList.add("tex-tree-folder");b.classList.add("tex-tree-folder");
const aSub=make("aSub",{hidden:true,previousElementSibling:a});
const bSub=make("bSub",{hidden:true,previousElementSibling:b});
aSub.classList.add("tex-tree-folder-children");
bSub.classList.add("tex-tree-folder-children");
const file=make("file",{dataset:{project:"project-1",file:"chapters/2026/math.tex"},parentElement:bSub});
const main=make("main",{dataset:{project:"project-1",file:"main.tex"},parentElement:box});
bSub.parentElement=aSub;aSub.parentElement=box;box.parentElement={};
const list={
  querySelectorAll(selector){
    if(selector===".tex-tree-file")return [file,main];
    if(selector===".tex-tree-folder")return [a,b];
    if(selector===".tex-document-item[data-tex-document-id]")return [project];
    return [];
  }
};
const root={dataset:{texCollaborationDocumentId:"project-1"}};
const selected={name:"chapters/2026/math.tex"};
const openProjects=new Set(),openFolders=new Set();
const script=body+"\nsyncSelectedTree(true);";
const passive=body+"\nsyncSelectedTree();";
vm.runInNewContext(script,{activeId:()=>root.dataset.texCollaborationDocumentId,selected,
  list,openProjects,openFolders},{timeout:1000});
assert(file.classList.contains("is-active"));
assert(!main.classList.contains("is-active"));
assert.equal(file.attrs["aria-current"],"true");
assert(a.classList.contains("is-active-path") && b.classList.contains("is-active-path"));
assert(project.classList.contains("is-file-active"));
assert.equal(aSub.hidden,false);assert.equal(bSub.hidden,false);assert.equal(box.hidden,false);
assert(openProjects.has("project-1"));
assert(openFolders.has("project-1/chapters") && openFolders.has("project-1/chapters/2026"));
box.hidden=true;aSub.hidden=true;bSub.hidden=true;
vm.runInNewContext(passive,{activeId:()=>root.dataset.texCollaborationDocumentId,selected,
  list,openProjects,openFolders},{timeout:1000});
assert(box.hidden&&aSub.hidden&&bSub.hidden,"Passive refresh must not reopen collapsed project folders");
selected.name="main.tex";
vm.runInNewContext(passive,{activeId:()=>root.dataset.texCollaborationDocumentId,selected,
  list,openProjects,openFolders},{timeout:1000});
assert(main.classList.contains("is-active"));
assert(!file.classList.contains("is-active"));
assert(!a.classList.contains("is-active-path") && !b.classList.contains("is-active-path"));
assert(code.includes("sub.hidden=!openFolders.has(key)"));
assert(code.includes("if(openProjects.has(id)||id===initialId)arrowNode.click();"));
assert(!code.includes("openProjects.size===0&&id===activeId()"));
console.log("Independent expansion and passive selection refresh passed.");
