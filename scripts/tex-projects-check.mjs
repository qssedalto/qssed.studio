import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import { deflateRawSync, gunzipSync } from "node:zlib";
import { handleTexProjects } from "../studio/tex-project-api.js";

const userId="11111111-1111-4111-8111-111111111111";
const realFetch=globalThis.fetch;
let profile={first_name:"名",last_name:"姓"};
let adminVerified=false, adminRpcUnavailable=false, adminRpcCount=0;
let writes=[];
globalThis.fetch=async (url,options) => {
  if(String(url).includes("/rest/v1/rpc/verify_admin_session")){
    adminRpcCount++;
    assert.equal(options?.method,"POST","Admin bypass must use POST to verified server RPC");
    assert.equal(options?.headers?.authorization,"Bearer user-token");
    if(adminRpcUnavailable)return Response.json({error:"Unavailable"},{status:503});
    return Response.json(adminVerified,{status:200});
  }
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
  assert.equal(incomplete.response.status,422,"Unverified accounts must still supply their legal names.");
  assert.equal(adminRpcCount,1,"Server must verify admin when legal names are missing.");

  adminVerified=true;
  const adminBlank=await create(postJson({type:"blank",title:"管理员的新项目"}));
  assert.equal(adminBlank.response.status,201,"Verified administrator should be able to create a blank project without legal names.");
  assert.equal(adminBlank.body.document.owner_id,userId);
  assert.match(adminBlank.body.document.source,/\\author\{\}/,
    "Administrator project must not fabricate a legal author name.");
  assert.equal(adminBlank.body.document.project_type,"blank");

  adminRpcUnavailable=true;
  const unverified=await create(postJson({type:"blank",title:"Admin RPC Down"}));
  assert.equal(unverified.response.status,422,"Admin RPC failure must fail closed.");
  adminRpcUnavailable=false;
  adminVerified=false;
  profile={first_name:"名",last_name:"姓"};
  const rpcBefore=adminRpcCount;
  const normal=await create(postJson({type:"blank",title:"Signed Name"}));
  assert.equal(normal.response.status,201);
  assert.equal(adminRpcCount,rpcBefore,"Complete author names should not require an admin RPC.");

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
  assert.equal(github.body.document.files.length,25,"Import must retain all 25 supporting files from the current GitHub repository.");
  assert.equal(github.body.document.files.filter(f=>f.name.endsWith(".py")).length,7,"Python scripts must be retained as text.");
  assert(github.body.document.files.some(f=>f.name==="main.pdf"),"Project PDF must be retained.");
  assert(github.body.document.files.some(f=>f.name==="README.md"),"Markdown readme must be retained.");
  assert.equal(github.body.skipped.length,0,"GitHub workflow and .gitignore are now supported text files.");
  assert(github.body.document.files.some(f=>f.name===".github/workflows/latex.yml"));
  assert(github.body.document.files.some(f=>f.name===".gitignore"));
  const tooMany=zip(Array.from({length:501},(_,i)=>({
    name:"limit-test/"+(i===0?"main.tex":"chapter"+i+".tex"),data:"Hello"
  })));
  const overCount=await create(asZip(tooMany));
  assert.equal(overCount.response.status,400,"More than 500 importable files must be rejected.");
  assert.match(overCount.body.error,/500 importable files/,"File-count failure must explain the 500-file limit.");

  // The actual user-uploaded Machine-Learning-main.zip has 36 ZIP records:
  // 15 substantive files, 15 macOS AppleDouble copies, and 6 directories.
  const actualFiles=[
    "references.bib","main.tex",".gitignore","README.md",
    "config/preamble.tex","config/titlepage.tex",
    "chapters/least_squares.tex","chapters/foundations.tex",
    "chapters/preface.tex","chapters/gradient_methods.tex",
    "chapters/generalization.tex","chapters/logistic_regression.tex",
    "appendices/notation.tex","appendices/development_log.tex",
    ".github/workflows/latex.yml"
  ];
  const actualEntries=[
    "Machine-Learning-main/","Machine-Learning-main/config/",
    "Machine-Learning-main/chapters/","Machine-Learning-main/appendices/",
    "Machine-Learning-main/.github/","Machine-Learning-main/.github/workflows/"
  ].map(name=>({name,data:""}));
  for(const name of actualFiles){
    actualEntries.push({name:"Machine-Learning-main/"+name,
      data:name==="main.tex"?"\\\\documentclass{article}\\n\\\\begin{document}ML\\\\end{document}":"Project source"});
    actualEntries.push({name:"__MACOSX/Machine-Learning-main/"+name.split("/").slice(0,-1).concat("._"+name.split("/").at(-1)).join("/"),
      data:"macOS AppleDouble"});
  }
  const uploaded=await create(asZip(zip(actualEntries)));
  assert.equal(uploaded.response.status,201,JSON.stringify(uploaded.body));
  assert.equal(uploaded.body.document.files.length,14,"The uploaded ZIP must retain all 14 supporting files.");
  assert.equal(uploaded.body.skipped.length,15,"AppleDouble metadata should not become project files.");
  assert(uploaded.body.document.files.some(x=>x.name===".gitignore"),"The ZIP's gitignore must be preserved.");
  assert(uploaded.body.document.files.some(x=>x.name===".github/workflows/latex.yml"),"The ZIP's YAML workflow must be preserved.");
  assert(uploaded.body.document.files.some(x=>x.name==="chapters/gradient_methods.tex"));

  const maximum=zip(Array.from({length:500},(_,i)=>({
    name:i===0?"project/main.tex":"project/src/file-"+i+".js",
    data:i===0?"\\\\documentclass{article}":"export const number = "+i+";"
  })));
  const maxUpload=await create(asZip(maximum));
  assert.equal(maxUpload.response.status,201,JSON.stringify(maxUpload.body));
  assert.equal(maxUpload.body.document.files.length,499,"Exactly 500 total project files must be accepted.");

  const office=await create(asZip(zip([
    {name:"mixed/main.tex",data:"\\\\documentclass{article}"},
    ...["report.docx","budget.xlsx","slides.pptx","records.csv","src/main.cpp",
      "src/Main.java","src/app.js","config/settings.json","README.md"].map(name=>({
        name:"mixed/"+name,
        data:/\.(docx|xlsx|pptx)$/.test(name)?Buffer.from([0x50,0x4b,0x03,0x04,0,0]):"Example content"
      }))
  ])));
  assert.equal(office.response.status,201,JSON.stringify(office.body));
  assert.equal(office.body.document.files.filter(x=>x.encoding==="base64").length,3,"Office files must be stored as binary.");
  for(const ext of [".csv",".cpp",".java",".js",".json"])
    assert(office.body.document.files.some(x=>x.name.endsWith(ext)&&x.encoding==="utf8"),ext+" must import as UTF-8 source.");

  const hiddenTraversal=await create(asZip(zip([{name:"../.github/workflows/test.yml",data:"hidden"},
    {name:"main.tex",data:"valid"}])));
  assert.equal(hiddenTraversal.response.status,400,"Ignored metadata must not bypass ZIP Slip validation.");
  const unsafe=zip([{name:"../main.tex",data:"hello"}]);
  const refused=await create(asZip(unsafe));
  assert.equal(refused.response.status,400,"Traversal paths must be rejected.");
  const nonZip=await create(asZip(Buffer.from("not a zip")));
  assert.equal(nonZip.response.status,400,"Invalid ZIP must be rejected.");
  assert.equal(writes.length,7,"Only successfully validated projects can reach R2.");
  console.log("TeX project creation, verified admin author bypass, legal-name gate, sample files, ZIP import and traversal checks passed.");
}finally{
  globalThis.fetch=realFetch;
}
