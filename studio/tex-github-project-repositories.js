// Authenticated, project-specific GitHub compilation repository bindings.
// User-wide SQL allowances remain solely a quota ledger. Per-project R2
// bindings must NEVER be inferred from the old user-wide repository fields.
import { isStorageObjectId } from "./storage-api.js";
import { managedTexRepoName } from "./tex-github-workflow.js";

const PREFIX="_system/tex-github-project-repositories/";
const LEGACY_MANAGED_REPO=/^aertex-tex-[0-9a-f]{32}$/i;
const PROJECT_MANAGED_REPO=/^aertex-tex-[a-z0-9][a-z0-9._-]*-(?:[0-9]{14}|[0-9]{2}-[0-9]{2}-[0-9]{4})-[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// Both original account-level names and newer one-project-per-repository names
// are safe GitHub path components. Never allow a URL, slash or arbitrary name.
export function isTexGithubManagedRepositoryName(name){
  return typeof name==="string"&&name.length<=100&&
    (LEGACY_MANAGED_REPO.test(name)||PROJECT_MANAGED_REPO.test(name));
}
function githubSlug(value,fallback){
  const pieces=[];
  for(const char of String(value||'').normalize('NFKD')){
    if(/[a-zA-Z0-9]/.test(char))pieces.push(char.toLowerCase());
    else if(/[._-]/.test(char))pieces.push('-');
    else if(char.codePointAt(0)>127 && !/[\u0300-\u036f]/.test(char))
      pieces.push('u'+char.codePointAt(0).toString(16));
    else pieces.push('-');
  }
  return pieces.join('').replace(/-+/g,'-').replace(/^-|-$/g,'')||fallback;
}
export function texGithubProjectRepositoryName(documentId,options={}){
  if(!isStorageObjectId(documentId))throw new Error("Invalid TeX project identifier");
  if(!options || !options.title || !options.created_at)return managedTexRepoName(documentId);
  const isAdmin=options.is_admin===true;
  const created=new Date(options.created_at);
  if(!Number.isFinite(created.getTime()))throw new Error("Invalid creation date");
  const dd=String(created.getUTCDate()).padStart(2,'0');
  const mm=String(created.getUTCMonth()+1).padStart(2,'0');
  const yyyy=String(created.getUTCFullYear());
  const stamp=isAdmin?dd+'-'+mm+'-'+yyyy:
    yyyy+mm+dd+String(created.getUTCHours()).padStart(2,'0')+
    String(created.getUTCMinutes()).padStart(2,'0')+
    String(created.getUTCSeconds()).padStart(2,'0');
  const user=isAdmin?'admin':githubSlug(options.username,'user');
  const uuid=documentId.toLowerCase();
  const prefix='aertex-tex-',suffix='-'+stamp+'-'+uuid;
  const budget=100-prefix.length-suffix.length-2;
  const cappedUser=user.slice(0,Math.min(18,Math.max(1,Math.floor(budget/2))));
  const cappedTitle=githubSlug(options.title,'project').slice(0,Math.max(1,budget-cappedUser.length));
  return prefix+cappedTitle+'-'+cappedUser+suffix;
}
export function texGithubProjectRepositoryKey(userId,documentId){
  if(!isStorageObjectId(userId)||!isStorageObjectId(documentId))
    throw new Error("Invalid account or TeX project identifier");
  return PREFIX+userId.toLowerCase()+"/"+documentId.toLowerCase()+".json";
}
export async function readTexGithubProjectRepository(env,userId,documentId){
  const key=texGithubProjectRepositoryKey(userId,documentId);
  const object=await env.STORAGE.get(key);
  if(!object)return null;
  const record=await object.json().catch(()=>null);
  // Fail closed rather than accidentally exposing another project's repo.
  if(!record||record.user_id!==userId||record.document_id!==documentId ||
     typeof record.repo_name!=='string' ||
     !/^aertex-tex-[a-z0-9._-]+$/i.test(record.repo_name) ||
     record.repo_name.length>100 ||
     (record.repo_name!==texGithubProjectRepositoryName(documentId) &&
      !record.repo_name.endsWith('-'+documentId.toLowerCase())))
    throw new Error("Invalid project GitHub repository binding");
  return record;
}
export async function writeTexGithubProjectRepository(env,userId,documentId,changes){
  const current=await readTexGithubProjectRepository(env,userId,documentId);
  const record={
    ...(current||{}),...changes,
    user_id:userId,document_id:documentId,
    repo_name:current?.repo_name || changes?.repo_name || texGithubProjectRepositoryName(documentId),
    updated_at:new Date().toISOString()
  };
  await env.STORAGE.put(texGithubProjectRepositoryKey(userId,documentId),
    JSON.stringify(record),{httpMetadata:{contentType:"application/json;charset=UTF-8"}});
  return record;
}
export async function removeTexGithubProjectRepository(env,userId,documentId){
  await env.STORAGE.delete(texGithubProjectRepositoryKey(userId,documentId));
}
