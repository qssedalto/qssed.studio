import assert from "node:assert/strict";
import fs from "node:fs";
import { selectTexGithubCompileFiles } from "../studio/tex-github-source-selection.js";
import { MAX_PROJECT_FILES } from "../studio/tex-project-file-types.js";
import { MANAGED_TEX_WORKFLOW, MANAGED_TEX_WORKFLOW_PATH, INITIAL_TEX_README } from "../studio/tex-github-workflow.js";

const document=(files=[])=>({
  id:"00000000-0000-4000-8000-000000000000",
  engine:"xelatex",
  source:"\\documentclass{article}\n\\begin{document}Test\\end{document}\n",
  files
});
const text=(name,content="Hello")=>({name,encoding:"utf8",content});
const binary=(name,bytes)=>({name,encoding:"base64",content:Buffer.from(bytes).toString("base64")});
const fixture=document([
  text(".gitignore","node_modules"),text(".github/workflows/latex.yml","on: workflow_dispatch"),
  text("README.md","# Machine Learning"),text("code/app.py","print('hello')"),
  text("code/test.cpp","int main(){}"),text("papers/report.docx","office placeholder"),
  text("chapters/one.tex","\\section{One}"),text("references.bib","@article{test}"),
  text("data/figures.csv","x,y\n1,2"),
  binary("images/graph.png",[137,80,78,71,13,10,26,10]),
  binary("main.pdf",[37,80,68,70,45,49]),
  binary("images/chart.pdf",[37,80,68,70,45,49])
]);
const selected=selectTexGithubCompileFiles(fixture);
assert.deepEqual(selected.entries.map(x=>x.name),[
  "main.tex","chapters/one.tex","references.bib","data/figures.csv",
  "images/graph.png","images/chart.pdf"
]);
assert.equal(selected.included,6);
assert.equal(selected.skipped,6);
assert(!selected.entries.some(x=>x.name.startsWith(".github")));
assert(!selected.entries.some(x=>x.name==="main.pdf"));
assert(!selected.entries.some(x=>x.name.endsWith(".py")));
assert(!selected.entries.some(x=>x.name.endsWith(".docx")));
assert.equal(MAX_PROJECT_FILES,500);
const maxProject=document(Array.from({length:499},(_,i)=>
  i<498?text("code/test-"+i+".js","export {}"):text("chapter499.tex","\\section{Final}")));
const maxResult=selectTexGithubCompileFiles(maxProject);
assert.equal(maxResult.included,2,"A project with 500 files must still compile just its relevant source.");
assert.equal(maxResult.skipped,498);
assert.throws(()=>selectTexGithubCompileFiles(document(Array.from({length:500},(_,i)=>
  text("chapter-"+i+".tex","\\section{One}")))),/more than 500 files/);
for(const name of ["../escape.tex","workflows/../a.tex","/main.tex","workflows\\test.tex"]){
  assert.throws(()=>selectTexGithubCompileFiles(document([text(name)])),/Invalid project file path/);
}
assert.throws(()=>selectTexGithubCompileFiles(document([
  text("figures/chart.tex"),text("figures/CHART.tex")
])),/Duplicate project filename/);
assert.throws(()=>selectTexGithubCompileFiles(document([
  {name:"chapter.tex",encoding:"base64",content:"aGVsbG8="}
])),/Invalid encoding/);
assert.throws(()=>selectTexGithubCompileFiles(document([
  {name:"figure.pdf",encoding:"base64",content:"???notbase64"}
])),/Invalid binary/);

const code=fs.readFileSync(new URL("../studio/tex-github-api.js", import.meta.url),"utf8");
const start=code.indexOf("async function commitCompileSnapshot(");
const end=code.indexOf("\nasync function verifyOwner(",start);
assert(start>=0&&end>start,"Missing atomic Git tree writer");
const calls=[],repo="/repos/example/aertex-tex-123",branch="main";
async function mockGithub(env,path,method="GET",body){
  calls.push({path,method,body});
  if(path.endsWith("/git/ref/heads/main") && method==="GET")return {object:{sha:"a".repeat(40)}};
  if(path.endsWith("/git/blobs") && method==="POST")return {sha:"b".repeat(40)};
  if(path.endsWith("/git/trees") && method==="POST")return {sha:"c".repeat(40)};
  if(path.endsWith("/git/commits") && method==="POST")return {sha:"d".repeat(40)};
  if(path.endsWith("/git/refs/heads/main") && method==="PATCH")return {object:{sha:"d".repeat(40)}};
  throw Error("Unexpected GitHub operation: "+method+" "+path);
}
function mockHttpError(status,reason){const error=new Error(reason);error.status=status;return error;}
const commit=new Function(
  "github","httpError","MANAGED_TEX_WORKFLOW_PATH","MANAGED_TEX_WORKFLOW","INITIAL_TEX_README",
  code.slice(start,end)+"\nreturn commitCompileSnapshot;"
)(
  mockGithub,mockHttpError,MANAGED_TEX_WORKFLOW_PATH,MANAGED_TEX_WORKFLOW,INITIAL_TEX_README
);
const result=await commit({},repo,branch,selected);
assert.equal(result.sha,"d".repeat(40));
assert.equal(result.included,6);
assert.equal(result.skipped,6);
const treeCall=calls.find(x=>x.path.endsWith("/git/trees"));
assert(treeCall && !("base_tree" in treeCall.body),"A clean tree must remove stale previous-project files.");
const tree=treeCall.body.tree;
assert.deepEqual(tree.map(x=>x.path),[
  ".github/workflows/aertex-compile.yml","README.md",...selected.entries.map(x=>x.name)
]);
assert.equal(tree[0].content,MANAGED_TEX_WORKFLOW,"Never publish user-generated workflow YAML.");
assert.equal(tree[1].content,INITIAL_TEX_README);
assert.equal(tree.find(x=>x.path==="main.tex").content,fixture.source);
assert.equal(tree.filter(x=>x.sha==="b".repeat(40)).length,2);
assert.equal(calls.filter(x=>x.path.endsWith("/git/blobs")).length,2,"Only image/PDF binaries need blob POSTs.");
const gitCommit=calls.find(x=>x.path.endsWith("/git/commits"));
assert.deepEqual(gitCommit.body.parents,["a".repeat(40)]);
assert.equal(gitCommit.body.tree,"c".repeat(40));
assert(calls.some(x=>x.path.endsWith("/git/refs/heads/main")&&x.method==="PATCH"&&x.body.force===false));
assert(code.indexOf("selectTexGithubCompileFiles(doc)")<code.indexOf("await reserveCredit(env, userId, nonce)"),
  "Preflight validation must occur before reserving the user's credit.");
assert(!code.includes("extras.length>24"),"Legacy 24-file compiler limit must be removed.");
assert(!code.includes('throw httpError(400,"unsafe_project_path")'),"Compiler should safely skip non-TeX extras.");

console.log("500-file Work project compile selection, pinned workflow isolation, and atomic snapshot verified.");
