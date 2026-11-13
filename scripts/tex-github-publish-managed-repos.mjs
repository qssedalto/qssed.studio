// Controlled one-time visibility migration for AERTEX-managed TeX repos.
// DRY RUN by default. NEVER publish unrelated/private personal repositories.
// Before executing, review historical content and obtain the affected users'
// authorization: making a repo private again does not revoke cloned/forked data.
//
// Environment:
//   AERTEX_TEX_GITHUB_OWNER=<operator GitHub username>
//   GITHUB_TOKEN=<token with administration:write and private repo visibility>
//   node scripts/tex-github-publish-managed-repos.mjs
//   node scripts/tex-github-publish-managed-repos.mjs --execute --ack-public-history
//
// The token must be supplied via a secure environment/secret manager, not a
// literal token pasted into a terminal command or committed to this repository.
const OWNER=String(process.env.AERTEX_TEX_GITHUB_OWNER||"").trim();
const TOKEN=String(process.env.GITHUB_TOKEN||"").trim();
const args=new Set(process.argv.slice(2));
const execute=args.has("--execute");
const acknowledged=args.has("--ack-public-history");
if(!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(OWNER)||!TOKEN){
  console.error("Provide AERTEX_TEX_GITHUB_OWNER and GITHUB_TOKEN via secure environment variables.");
  process.exit(2);
}
if([...args].some(arg=>!["--execute","--ack-public-history"].includes(arg))||
   (execute&&!acknowledged)){
  console.error("Usage: node scripts/tex-github-publish-managed-repos.mjs [--execute --ack-public-history]");
  process.exit(2);
}
const NAME=/^aertex-tex-[a-f0-9]{32}$/;
const url="https://api.github.com";
async function request(path,method="GET",body){
  const response=await fetch(url+path,{
    method,headers:{
      authorization:"Bearer "+TOKEN,
      accept:"application/vnd.github+json",
      "x-github-api-version":"2026-03-10",
      "user-agent":"AERTEX-TeX-Visibility-Migration",
      ...(body===undefined?{}:{"content-type":"application/json"})
    },
    ...(body===undefined?{}:{body:JSON.stringify(body)}),
    redirect:"manual"
  });
  if(!response.ok){
    // Never include headers or credentials in logs.
    throw new Error(method+" "+path+" returned HTTP "+response.status);
  }
  return response.status===204?null:response.json();
}
const repos=[];
for(let page=1;page<=100;page++){
  const result=await request("/user/repos?type=owner&per_page=100&page="+page);
  if(!Array.isArray(result))throw Error("Unexpected GitHub repository list");
  repos.push(...result);
  if(result.length<100)break;
  if(page===100)throw Error("Repository listing exceeded the safety page limit");
}
const managed=repos.filter(repo=>
  repo?.owner?.login?.toLowerCase()===OWNER.toLowerCase() &&
  NAME.test(String(repo.name||"")));
const privateManaged=managed.filter(repo=>repo.private===true);
const alreadyPublic=managed.length-privateManaged.length;
console.log("Operator:",OWNER,"managed:",managed.length,
  "already public:",alreadyPublic,"private:",privateManaged.length);
for(const repo of privateManaged)console.log(execute?"PUBLISH":"DRY-RUN",repo.full_name,"id="+repo.id);
if(!execute){
  console.log("No repositories changed. Review user consent and ALL Git history before public migration.");
  process.exit(0);
}
console.log("Publishing ONLY AERTEX-managed repositories, one by one.");
let converted=0,failed=0;
for(const repo of privateManaged){
  const path="/repos/"+OWNER+"/"+repo.name;
  try{
    const current=await request(path);
    if(!NAME.test(current?.name||"")||
       current?.owner?.login?.toLowerCase()!==OWNER.toLowerCase()||
       String(current?.id)!==String(repo.id))throw Error("Repository identity changed");
    if(current.private!==true){console.log("SKIP already public:",repo.name);continue;}
    await request(path,"PATCH",{private:false});
    const after=await request(path);
    if(after.private!==false || String(after.id)!==String(repo.id))
      throw Error("Visibility change not confirmed");
    converted++;
    console.log("PUBLIC",repo.name);
  }catch(error){
    failed++;
    console.error("FAILED",repo.name,String(error?.message||error));
    // Continue so partial progress is explicit; never report all as migrated.
  }
}
console.log("Migration finished. Converted:",converted,"Failed:",failed);
if(failed)process.exitCode=1;
