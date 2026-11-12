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

  // Offline CI must never silently generate a substituted frog.jpg.
  // The exact main.tex and bibliography are reproducible from the pinned source.
  const example=await create(postJson({type:"example",title:"我的示例"}));
  assert.equal(example.response.status,400,"A missing verified image fails closed.");
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
  const unsafe=zip([{name:"../main.tex",data:"hello"}]);
  const refused=await create(asZip(unsafe));
  assert.equal(refused.response.status,400,"Traversal paths must be rejected.");
  const nonZip=await create(asZip(Buffer.from("not a zip")));
  assert.equal(nonZip.response.status,400,"Invalid ZIP must be rejected.");
  assert.equal(writes.length,2,"Only successfully validated projects can reach R2.");
  console.log("TeX project creation, legal-name gate, sample files, ZIP import and traversal checks passed.");
}finally{
  globalThis.fetch=realFetch;
}
