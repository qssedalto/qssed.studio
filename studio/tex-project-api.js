// Create user-owned TeX projects without trusting arbitrary client paths.
// ZIP imports accept only bounded, safe content; no shell execution or external requests.
import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { json } from "./routing.js";
import { workerLog } from "./server-runtime.js";
import { VERIFIED_SAMPLE_FROG_BASE64 } from "./tex-example-frog.js";

const ROOT = "_system/tex-documents/";
const LIMIT_ZIP = 3 * 1024 * 1024;
const LIMIT_TOTAL = 4 * 1024 * 1024;
const LIMIT_FILES = 24;
const SOURCE_LIMIT = 180000;
const MAX_DOCS = 120;
const BINARY_EXT = /\.(png|jpe?g|pdf)$/i;
const ALLOWED = /\.(tex|bib|sty|cls|bst|txt|png|jpe?g|pdf)$/i;
const utf8 = new TextDecoder("utf-8", { fatal: true });

function problem(message, status = 400) { return json({ error: message }, status); }
function titleText(s) { return String(s || "").replace(/[\x00-\x1f\x7f]/g, " ").trim().slice(0, 180); }
function safeName(name) {
  return typeof name === "string" && name.length <= 140 &&
    !name.startsWith("/") && !name.includes("\\") && !name.includes("\x00") &&
    !name.split("/").some(part => part === "" || part === "." || part === ".." || part.startsWith(".")) &&
    !/^\.github\//i.test(name) && ALLOWED.test(name);
}
function toBase64(bytes) {
  let output = "";
  for(let i=0;i<bytes.length;i+=8192) output += String.fromCharCode(...bytes.subarray(i,i+8192));
  return btoa(output);
}
function texEscape(s) {
  return String(s).replace(/[\\{}%$#&_~^]/g, ch => ({
    "\\": "\\textbackslash{}", "{":"\\{", "}":"\\}", "%":"\\%",
    "$":"\\$", "#":"\\#", "&":"\\&", "_":"\\_",
    "~":"\\textasciitilde{}", "^":"\\textasciicircum{}"
  }[ch]));
}
function blankSource(projectName, author) {
  const date = new Date().toLocaleDateString("en-US", {
    month:"long",year:"numeric",timeZone:"Asia/Shanghai"
  });
  return "\\documentclass{article}\n" +
    "\\usepackage{graphicx} % Required for inserting images\n\n" +
    "\\title{" + texEscape(projectName) + "}\n" +
    "\\author{" + texEscape(author) + "}\n" +
    "\\date{" + date + "}\n\n" +
    "\\begin{document}\n\n\\maketitle\n\n\\section{Introduction}\n\n\\end{document}\n";
}
async function ownerName(token,userId) {
  const response = await fetch(SUPABASE_URL + "/rest/v1/profiles?select=first_name,last_name&id=eq." + encodeURIComponent(userId), {
    headers:{ apikey:SUPABASE_KEY, authorization:"Bearer " + token, accept:"application/json" }
  });
  if(!response.ok) return "";
  const rows = await response.json();
  const p = Array.isArray(rows) ? rows[0] : null;
  const first = String(p?.first_name || "").trim();
  const last = String(p?.last_name || "").trim();
  return first && last ? (first + " " + last) : "";
}
async function boundedZip(stream) {
  if(!stream) throw new Error("File body missing.");
  const reader=stream.getReader();let len=0;const chunks=[];
  try {
    while(true){const {done,value}=await reader.read();if(done)break;len+=value.byteLength;
      if(len>LIMIT_ZIP) throw new Error("ZIP file exceeds 3 MB.");
      chunks.push(value);}
  } finally {reader.releaseLock();}
  const bytes=new Uint8Array(len);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.byteLength;}return bytes;
}
async function inflateBounded(compressed,maxBytes) {
  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  const reader=stream.getReader();const pieces=[];let size=0;
  try {
    while(true){const {done,value}=await reader.read();if(done)break;
      size+=value.byteLength;if(size>maxBytes)throw new Error("Decompressed file is too large.");
      pieces.push(value);}
  } finally {await reader.cancel().catch(()=>{});}
  const out=new Uint8Array(size);let pos=0;for(const piece of pieces){out.set(piece,pos);pos+=piece.length;}return out;
}
async function unzip(raw) {
  if(raw.length<22) throw new Error("Invalid ZIP archive.");
  const v=new DataView(raw.buffer,raw.byteOffset,raw.byteLength);
  let tail=-1;for(let i=raw.length-22;i>=Math.max(0,raw.length-65557);i--){
    if(v.getUint32(i,true)===0x06054b50){tail=i;break;}}
  if(tail<0) throw new Error("ZIP central directory missing.");
  const total=v.getUint16(tail+10,true);
  const cd=v.getUint32(tail+16,true);
  if(total<1||total>LIMIT_FILES+16||cd>=tail)throw new Error("ZIP contains too many files.");
  const entries=[];let offset=cd;let totalBytes=0;
  for(let i=0;i<total;i++){
    if(offset+46>tail||v.getUint32(offset,true)!==0x02014b50)throw new Error("Invalid ZIP entry.");
    const flag=v.getUint16(offset+8,true),method=v.getUint16(offset+10,true);
    const packed=v.getUint32(offset+20,true),plain=v.getUint32(offset+24,true);
    const nameLen=v.getUint16(offset+28,true),extra=v.getUint16(offset+30,true),comment=v.getUint16(offset+32,true);
    const pos=v.getUint32(offset+42,true);
    if(flag&1||![0,8].includes(method)||plain===0xffffffff||packed===0xffffffff)
      throw new Error("Encrypted or unsupported ZIP format.");
    if(offset+46+nameLen+extra+comment>tail||pos+30>raw.length)throw new Error("ZIP entry is incomplete.");
    const name=utf8.decode(raw.subarray(offset+46,offset+46+nameLen));
    offset+=46+nameLen+extra+comment;
    if(name.endsWith("/"))continue;
    totalBytes+=plain;
    if(totalBytes>LIMIT_TOTAL||plain>1024*1024||packed>LIMIT_ZIP||entries.length>=LIMIT_FILES)
      throw new Error("ZIP exceeds safe project limits.");
    if(v.getUint32(pos,true)!==0x04034b50)throw new Error("ZIP local header missing.");
    const start=pos+30+v.getUint16(pos+26,true)+v.getUint16(pos+28,true);
    if(start+packed>raw.length)throw new Error("ZIP file data truncated.");
    const slice=raw.subarray(start,start+packed);
    const data=method===0?slice:await inflateBounded(slice,Math.min(plain,1024*1024));
    if(data.length!==plain)throw new Error("ZIP file length does not match archive.");
    entries.push({name,data});
  }
  if(!entries.length)throw new Error("No supported files in ZIP.");
  const split=entries.map(e=>e.name.split("/"));
  // Never strip "." or ".." as a shared archive prefix; doing so would
  // convert "../main.tex" into the seemingly safe "main.tex" (ZIP Slip).
  const candidate=split[0]?.[0] || "";
  const safeTop=/^[A-Za-z0-9][A-Za-z0-9._ -]{0,99}$/.test(candidate) &&
    candidate!=="." && candidate!=="..";
  const root=safeTop && split.every(parts=>parts.length>1&&parts[0]===candidate)
    ?candidate+"/":"";
  const named=entries.map(e=>({name:root?e.name.slice(root.length):e.name,data:e.data}));
  const seen=new Set();
  for(const e of named){if(!safeName(e.name)||seen.has(e.name.toLowerCase()))throw new Error("Unsafe or duplicate project path: "+e.name);seen.add(e.name.toLowerCase());}
  const main=named.find(e=>e.name==="main.tex");
  if(!main) throw new Error("ZIP must include main.tex at project root.");
  let source;
  try{source=utf8.decode(main.data);}catch{throw new Error("main.tex must be UTF-8.");}
  if(!source||source.length>SOURCE_LIMIT)throw new Error("main.tex exceeds source limit.");
  const extras=[];
  for(const e of named){if(e===main)continue;
    if(BINARY_EXT.test(e.name))extras.push({name:e.name,encoding:"base64",content:toBase64(e.data)});
    else extras.push({name:e.name,encoding:"utf8",content:utf8.decode(e.data)});
  }
  return {source,extras};
}
async function createDocument(env,userId,title,source,files,type) {
  const prefix=ROOT+userId+"/";
  const page=await env.STORAGE.list({prefix,limit:MAX_DOCS+1});
  if(page.objects.length>=MAX_DOCS)return problem("Project limit reached.",409);
  const now=new Date().toISOString(),id=crypto.randomUUID();
  const record={id,owner_id:userId,title,engine:"xelatex",source,
    files:files||[],project_type:type,created_at:now,updated_at:now};
  await env.STORAGE.put(prefix+id+".json",JSON.stringify(record),{
    httpMetadata:{contentType:"application/json;charset=UTF-8"},
    customMetadata:{ownerId:userId,hidden:"true",kind:"tex-document",
      title,engine:"xelatex",preview:source.replace(/\s+/g," ").trim().slice(0,220),
      projectType:type,fileCount:String(1+(files?.length||0)),
      createdAt:now,updatedAt:now}
  });
  return json({document:record,created:true},201);
}
export async function handleTexProjects(request,env,userId,accessToken) {
  if(request.method!=="POST")return problem("Method not allowed.",405);
  if(!env?.STORAGE)return problem("Project storage unavailable.",503);
  try {
    const isZip=(request.headers.get("content-type")||"").toLowerCase().includes("application/zip");
    if(isZip){
      const title=titleText(decodeURIComponent(request.headers.get("x-tex-project-name")||""));
      if(!title)return problem("Project name is required.");
      if(Number(request.headers.get("content-length")||0)>LIMIT_ZIP)return problem("ZIP must be under 3 MB.",413);
      const {source,extras}=await unzip(await boundedZip(request.body));
      return await createDocument(env,userId,title,source,extras,"imported");
    }
    if(Number(request.headers.get("content-length")||0)>4096)return problem("Invalid project input.",413);
    const raw=await request.text();
    if(raw.length>4096)return problem("Invalid project input.",413);
    const body=JSON.parse(raw||"{}");
    const title=titleText(body?.title);
    if(!title)return problem("Enter a project name.");
    if(!["blank","example"].includes(body?.type))return problem("Unknown project type.");
    if(body.type==="example"){
      const [main,bib,frog]=await Promise.all([
        decompressExample(SAMPLE_MAIN_GZIP),decompressExample(SAMPLE_BIB_GZIP),sampleFrog(env)
      ]);
      const files=[
        {name:"sample.bib",encoding:"utf8",content:bib},
        {name:"frog.jpg",encoding:"base64",content:frog}
      ];
      return await createDocument(env,userId,title,main,files,"example");
    }
    const author=await ownerName(accessToken,userId);
    if(!author)return problem("Please complete your legal first and last name in account settings before creating a blank project.",422);
    return await createDocument(env,userId,title,blankSource(title,author),[],"blank");
  } catch(error) {
    workerLog("warn","tex.project.create.failed",{user_id:userId,reason:String(error?.message||"unknown").slice(0,120)});
    return problem(String(error?.message||"Could not create project.").slice(0,200),400);
  }
}

const SAMPLE_MAIN_GZIP="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";
const SAMPLE_BIB_GZIP="H4sIAAAAAAAC/zWOQQ6CMBBF95xiwkoTMcHigoWJiAk7VniAihNAgZKhBU3Tu0tomd3/8+ZlrpxkU7aoK0LsZ/7CmB08WIYrWQsCuICfoaAK4X6EbKN8C8lGtggrVNQIOjWiGwhr7MdmWnJh8As6MVTWa84NylnQB3Y6LZLc7J3nh5zAesI4Zq59C0U9b1f7I7sJLt1iEq3q0OKR63rVPdH+u90PvMLRWll0CgJ2Dn3PeH9E/y3y9AAAAA==";
async function decompressExample(gzip){
 const bytes=Uint8Array.from(atob(gzip),c=>c.charCodeAt(0));
 const reader=new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip")).getReader();
 const chunks=[];let total=0;
 while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;
   if(total>20000)throw new Error("Example asset too large.");chunks.push(value);}
 const decoded=new Uint8Array(total);let pos=0;for(const part of chunks){decoded.set(part,pos);pos+=part.length;}
 return utf8.decode(decoded);
}
// Immutable public upstream Git blob. Its Git blob SHA matches the exact
// frog.jpg from the user-provided three-file sample archive (97,080 bytes).
// Never fetch caller-supplied URLs or trust unverified remote image bytes.
const EXAMPLE_FROG_URL =
  "https://raw.githubusercontent.com/ucaiado/QLearning_Trading/b18eea5e6a1fc64bb56f683843bcadb841f97f91/frog.jpg";
const EXAMPLE_FROG_SHA256 =
  "2913cb8ca0c77173737a5f2d0c9b80c0034e09a6c8708af1a8737dfcd8e8bc44";
const EXAMPLE_FROG_CACHE="_system/tex-templates/example-v1/frog.jpg";
async function verifiedFrog(bytes){
  if(bytes.length!==97080)return false;
  const hash=await crypto.subtle.digest("SHA-256",bytes);
  const hex=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,"0")).join("");
  return hex===EXAMPLE_FROG_SHA256;
}
async function sampleFrog(env){
  // Keep the sample self-contained: runtime GitHub access is not reliable
  // in all worker environments. The bundled asset is pinned and verified.
  const binary=atob(VERIFIED_SAMPLE_FROG_BASE64);
  const bytes=Uint8Array.from(binary, ch=>ch.charCodeAt(0));
  if(!(await verifiedFrog(bytes))){
    workerLog("error","tex.project.sample_asset_invalid",{reason:"Bundled sample checksum mismatch"});
    throw new Error("Verified example image failed integrity check.");
  }
  return VERIFIED_SAMPLE_FROG_BASE64;
}

const SAMPLE_FROG_JPG = "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";
