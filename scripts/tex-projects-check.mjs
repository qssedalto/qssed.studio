import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import { deflateRawSync, gunzipSync } from "node:zlib";
import { handleTexProjects } from "../studio/tex-project-api.js";

const userId="11111111-1111-4111-8111-111111111111";
const realFetch=globalThis.fetch;
let profile={first_name:"名",last_name:"姓"};
let writes=[];
globalThis.fetch=async (url) => {
  assert(String(url).includes("/profiles?select=first_name,last_name&id=eq."+userId),
    "Project author must be scoped to the authenticated user's profile.");
  return Response.json([profile],{status:200});
};
const storage={
  async list(){return {objects:[]};},
  async put(key,value){writes.push({key,record:JSON.parse(value)});}
};
const env={STORAGE:storage};
const postJson=(data)=>new Request("https://work.qsseda.com/api/tex/projects",{
  method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(data)
});
const create=async req=>{
  const response=await handleTexProjects(req,env,userId,"user-token");
  const body=await response.json();return {response,body};
};
try{
  const blank=await create(postJson({type:"blank",title:"AERTEX 研究 & 课程"}));
  assert.equal(blank.response.status,201);
  assert.equal(blank.body.document.owner_id,userId);
  assert.equal(blank.body.document.title,"AERTEX 研究 & 课程");
  assert.match(blank.body.document.source,/\\documentclass\{article\}/);
  assert.match(blank.body.document.source,/\\usepackage\{graphicx\}/);
  assert.match(blank.body.document.source,/\\author\{名 姓\}/);
  assert.match(blank.body.document.source,/\\title\{AERTEX 研究 \\& 课程\}/);
  assert.match(blank.body.document.source,/\\date\{[A-Za-z]+ 202\d\}/);
  assert.match(blank.body.document.source,/\\section\{Introduction\}/);
  assert.equal(blank.body.document.files.length,0);
  assert(writes[0].key.startsWith("_system/tex-documents/"+userId+"/"));

  profile={first_name:"",last_name:""};
  const incomplete=await create(postJson({type:"blank",title:"Name Required"}));
  assert.equal(incomplete.response.status,422,"Unknown author must not be made up.");
  profile={first_name:"名",last_name:"姓"};

  // Offline example creation must succeed using the exact bundled frog.jpg.
  // Never silently generate or fetch a substituted image.
  const example=await create(postJson({type:"example",title:"我的示例"}));
  assert.equal(example.response.status,201,JSON.stringify(example.body));
  assert.equal(example.body.document.project_type,"example");
  assert.deepEqual(example.body.document.files.map(f=>f.name),["sample.bib","frog.jpg"]);
  const frogBytes=Buffer.from(example.body.document.files[1].content,"base64");
  assert.equal(frogBytes.length,97080);
  assert.equal(createHash("sha256").update(frogBytes).digest("hex"),
    "2913cb8ca0c77173737a5f2d0c9b80c0034e09a6c8708af1a8737dfcd8e8bc44");
  const sourceFile=fs.readFileSync(new URL("../studio/tex-project-api.js",import.meta.url),"utf8");
  const embedded=name=>{
    const match=sourceFile.match(new RegExp('const '+name+'="([A-Za-z0-9+/=]+)"'));
    assert(match,"Pinned sample fixture missing: "+name);
    return gunzipSync(Buffer.from(match[1],"base64"));
  };
  const fileMain=embedded("SAMPLE_MAIN_GZIP");
  const fileBib=embedded("SAMPLE_BIB_GZIP");
  assert.equal(createHash("sha256").update(fileMain).digest("hex"),
    "98adacccd32d21bba43c108784e0516cb177f30db5a4ad080cf69c9d02b114d9");
  assert.equal(createHash("sha256").update(fileBib).digest("hex"),
    "8749e6a3009dbbdc5886644c8de1eb8ad98c993cb0613ee349b7b31e83750dd1");
  assert(sourceFile.includes("2913cb8ca0c77173737a5f2d0c9b80c0034e09a6c8708af1a8737dfcd8e8bc44"));

  // Generate a minimal 2-entry ZIP. This checks the same import path real users hit,
  // with an intentionally untrusted archive, but no external ZIP package dependency.
  function zip(entries){
    const locals=[],central=[];let offset=0;
    for(const {name,data} of entries){
      const filename=Buffer.from(name),raw=Buffer.from(data);
      const packed=deflateRawSync(raw);
      const local=Buffer.alloc(30);
      local.writeUInt32LE(0x04034b50,0);local.writeUInt16LE(20,4);
      local.writeUInt16LE(8,8);local.writeUInt32LE(packed.length,18);
      local.writeUInt32LE(raw.length,22);local.writeUInt16LE(filename.length,26);
      locals.push(local,filename,packed);
      const entry=Buffer.alloc(46);
      entry.writeUInt32LE(0x02014b50,0);entry.writeUInt16LE(20,4);
      entry.writeUInt16LE(20,6);entry.writeUInt16LE(8,10);
      entry.writeUInt32LE(packed.length,20);entry.writeUInt32LE(raw.length,24);
      entry.writeUInt16LE(filename.length,28);entry.writeUInt32LE(offset,42);
      central.push(entry,filename);
      offset+=local.length+filename.length+packed.length;
    }
    const directory=Buffer.concat(central);
    const tail=Buffer.alloc(22);
    tail.writeUInt32LE(0x06054b50,0);
    tail.writeUInt16LE(entries.length,8);tail.writeUInt16LE(entries.length,10);
    tail.writeUInt32LE(directory.length,12);tail.writeUInt32LE(offset,16);
    return Buffer.concat([...locals,directory,tail]);
  }
  const good=zip([{name:"demo/main.tex",data:"\\documentclass{article}\n\\begin{document}Hi\\end{document}"},
    {name:"demo/sample.bib",data:"@misc{x,title={Sample}}"}]);
  const asZip=data=>new Request("https://work.qsseda.com/api/tex/projects",{
    method:"POST",
    headers:{"content-type":"application/zip","x-tex-project-name":encodeURIComponent("上传的示例")},
    body:data
  });
  const imported=await create(asZip(good));
  assert.equal(imported.response.status,201,JSON.stringify(imported.body));
  assert.equal(imported.body.document.project_type,"imported");
  assert.equal(imported.body.document.files[0].name,"sample.bib");
  assert(imported.body.document.source.includes("\\begin{document}"));

  // Regression: a small GitHub source archive may contain >24 ZIP entries
  // while only 24 entries are relevant to the TeX project. Machine-Learning
  // has 26 files, including 2 Git metadata files and 7 Python scripts.
  const githubNames=[
    ".github/workflows/latex.yml",".gitignore","README.md",
    "appendices/development_log.tex","appendices/notation.tex",
    "chapters/experiments.tex","chapters/foundations.tex",
    "chapters/generalization.tex","chapters/gradient_methods.tex",
    "chapters/least_squares.tex","chapters/logistic_regression.tex",
    "chapters/open_questions.tex","chapters/preface.tex",
    "code/gradient_descent_intro.py","code/grid_search_intro.py",
    "code/linear_regression_demo.py","code/logistic_gradient_check.py",
    "code/logistic_regression_intro.py","code/ordinary_least_squares_intro.py",
    "code/polynomial_comparison.py","config/preamble.tex",
    "config/titlepage.tex","main.pdf","main.tex",
    "references.bib","requirements.txt"
  ];
  assert.equal(githubNames.length,26);
  const archive=zip(githubNames.map(name=>({
    name:"Machine-Learning-main/"+name,
    data:name==="main.tex"?"\\\\documentclass{article}\\n\\\\begin{document}ML\\\\end{document}":
      name==="main.pdf"?"%PDF-1.7\\nfixture":"Example file content"
  })));
  assert(archive.length < 42*1024,"Fixture must replicate a small ZIP that exceeds the old file-count limit.");
  const github=await create(asZip(archive));
  assert.equal(github.response.status,201,JSON.stringify(github.body));
  assert.equal(github.body.document.files.length,23,"Import must retain all 23 supporting files.");
  assert.equal(github.body.document.files.filter(f=>f.name.endsWith(".py")).length,7,"Python scripts must be retained as text.");
  assert(github.body.document.files.some(f=>f.name==="main.pdf"),"Project PDF must be retained.");
  assert(github.body.document.files.some(f=>f.name==="README.md"),"Markdown readme must be retained.");
  assert.equal(github.body.skipped.length,2,"GitHub workflows and .gitignore are metadata, not TeX assets.");
  assert(github.body.skipped.every(x=>x.includes(".github")||x.endsWith(".gitignore")));
  const tooMany=zip(Array.from({length:26},(_,i)=>({
    name:"limit-test/"+(i===0?"main.tex":"chapter"+i+".tex"),data:"Hello"
  })));
  const overCount=await create(asZip(tooMany));
  assert.equal(overCount.response.status,400,"More than 25 importable files must be rejected.");
  assert.match(overCount.body.error,/25 importable files/,"File-count failure must explain the true limit.");
  const hiddenTraversal=await create(asZip(zip([{name:"../.github/workflows/test.yml",data:"hidden"},
    {name:"main.tex",data:"valid"}])));
  assert.equal(hiddenTraversal.response.status,400,"Ignored metadata must not bypass ZIP Slip validation.");
  const unsafe=zip([{name:"../main.tex",data:"hello"}]);
  const refused=await create(asZip(unsafe));
  assert.equal(refused.response.status,400,"Traversal paths must be rejected.");
  const nonZip=await create(asZip(Buffer.from("not a zip")));
  assert.equal(nonZip.response.status,400,"Invalid ZIP must be rejected.");
  assert.equal(writes.length,4,"Only successfully validated projects can reach R2.");
  console.log("TeX project creation, legal-name gate, sample files, ZIP import and traversal checks passed.");
}finally{
  globalThis.fetch=realFetch;
}
