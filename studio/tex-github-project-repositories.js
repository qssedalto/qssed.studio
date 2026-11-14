// Authenticated, project-specific GitHub compilation repository bindings.
// User-wide SQL allowances remain solely a quota ledger. Per-project R2
// bindings must NEVER be inferred from the old user-wide repository fields.
import { isStorageObjectId } from "./storage-api.js";
import { managedTexRepoName } from "./tex-github-workflow.js";

const PREFIX="_system/tex-github-project-repositories/";
export function texGithubProjectRepositoryName(documentId){
  if(!isStorageObjectId(documentId))throw new Error("Invalid TeX project identifier");
  return managedTexRepoName(documentId);
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
     record.repo_name!==texGithubProjectRepositoryName(documentId))
    throw new Error("Invalid project GitHub repository binding");
  return record;
}
export async function writeTexGithubProjectRepository(env,userId,documentId,changes){
  const current=await readTexGithubProjectRepository(env,userId,documentId);
  const record={
    ...(current||{}),...changes,
    user_id:userId,document_id:documentId,
    repo_name:texGithubProjectRepositoryName(documentId),
    updated_at:new Date().toISOString()
  };
  await env.STORAGE.put(texGithubProjectRepositoryKey(userId,documentId),
    JSON.stringify(record),{httpMetadata:{contentType:"application/json;charset=UTF-8"}});
  return record;
}
export async function removeTexGithubProjectRepository(env,userId,documentId){
  await env.STORAGE.delete(texGithubProjectRepositoryKey(userId,documentId));
}
