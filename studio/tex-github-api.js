import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { json } from "./routing.js";
import { verifyStudioApiSession, withStudioSessionCookies, studioSessionFailure } from "./session-gate.js";
import { verifyTexUser } from "./tex-api-core.js";
import { getSupabaseSecret, workerLog } from "./server-runtime.js";
import { selectTexPdfRange } from "./tex-github-pdf-range.js";
import { hasStorageBinding, isStorageObjectId } from "./storage-api.js";
import {
  managedTexRepoName, MANAGED_TEX_WORKFLOW_PATH, MANAGED_TEX_WORKFLOW,
  INITIAL_TEX_SOURCE, INITIAL_TEX_README
} from "./tex-github-workflow.js";
import { selectTexGithubCompileFiles } from "./tex-github-source-selection.js";
import {
  texGithubProjectRepositoryName,isTexGithubManagedRepositoryName,readTexGithubProjectRepository,
  writeTexGithubProjectRepository,removeTexGithubProjectRepository
} from "./tex-github-project-repositories.js";

const TABLE = "tex_github_allowances";
const API_VERSION = "2026-03-10";
const MAX_SOURCE = 160000;
const PDF_LIMIT = 16 * 1024 * 1024;
const MINUTE = 60 * 1000;

export async function handleTexGithubApi(request, env, action) {
  const session = await verifyStudioApiSession(request);
  if (!session.ok) return studioSessionFailure(session);
  const verified = await verifyTexUser(session.accessToken);
  if (verified.error) return withStudioSessionCookies(verified.error, session.cookies);
  if (!["GET", "POST", "DELETE"].includes(request.method)) {
    return withStudioSessionCookies(fail(405, "Method not allowed."), session.cookies);
  }
  if (request.method !== "GET" && !strictOrigin(request)) {
    return withStudioSessionCookies(fail(403, "Cross-origin mutation blocked."), session.cookies);
  }
  const userId = verified.user.id;
  const admin = await isVerifiedAdmin(session.accessToken);
  const secret = getSupabaseSecret(env);
  if (!secret && action === "status" && request.method === "GET") {
    return withStudioSessionCookies(json({
      configured:false, is_admin:admin, approval_status:"none", requested_credits:0,
      quota_total:0, quota_used:0, remaining:0, repository_created:false,
      repository_state:"none", repository_name:null, active:false, engine:"xelatex"
    }), session.cookies);
  }
  if (!secret) return withStudioSessionCookies(fail(503, "Protected account storage is unavailable."), session.cookies);

  try {
    let response;
    if (action === "status" && request.method === "GET") {
      let row = await readRow(env, userId);
      const refreshed = row?.approval_status === "approved" && !admin
        ? await data(env, "rpc/tex_gh_refresh_allowance", "POST", {p_user_id:userId}) : null;
      if(refreshed !== null) row = await readRow(env, userId);
      const weeklyUsed = row?.weekly_used || 0;
      const weeklyLimit = Math.max(0,row?.weekly_credits||0);
      const available = admin ? -1 : Math.max(0,weeklyLimit-weeklyUsed);
      const documentId=githubProjectId(request);
      const legacyReceipt=row?.repo_id&&row?.repo_name ?
        await readLegacyDeleteReceipt(env,userId).catch(()=>null) : null;
      const legacyDeleteConfirmed=Boolean(legacyReceipt?.confirmed===true &&
        legacyReceipt?.user_id===userId &&
        String(legacyReceipt?.repo_id)===String(row?.repo_id) &&
        legacyReceipt?.repo_name===row?.repo_name);
      let project=null;
      if(documentId){
        if(!await githubProjectOwned(env,userId,documentId))
          return withStudioSessionCookies(fail(404,"Project not found or inaccessible."),session.cookies);
        project=await readTexGithubProjectRepository(env,userId,documentId);
      }
      response = json({
        document_id:documentId||null,
        configured: configured(env),
        is_admin: admin,
        approval_status: admin ? "approved" : row?.approval_status || "none",
        requested_credits: row?.requested_credits || 0,
        quota_total: row?.quota_total || 0,
        quota_used: row?.quota_used || 0,
        remaining: available,
        unlimited: admin,
        balance: admin ? null : Math.max(0,(row?.quota_total||0)-(row?.quota_used||0)),
        weekly_used: admin ? null : weeklyUsed,
        weekly_credits: admin ? null : weeklyLimit,
        quota_progress_used: admin ? null : weeklyUsed,
        quota_progress_remaining: admin ? null : available,
        week_renews_at: nextChinaMonday(),
        repository_created: Boolean(project?.repo_id && project?.repo_state === "ready"),
        repository_state: project?.repo_state || "none",
        repository_name: project?.repo_id ? project.repo_name : null,
        repository_error: project?.last_error || null,
        repository_delete_confirmed: Boolean(project?.delete_confirmed),
        // Existing account-wide repositories are NOT silently attached to
        // every project. Legacy deletion has its own explicit action.
        legacy_repository_name:row?.repo_id&&["ready","deleting","error"].includes(row?.repo_state)?row.repo_name:null,
        legacy_repository_state:row?.repo_state||"none",
        legacy_repository_delete_confirmed:legacyDeleteConfirmed,
        active: Boolean(row?.active_nonce && project?.active_nonce===row.active_nonce),
        engine: "xelatex"
      });
    } else if (action === "apply" && request.method === "POST") {
      response = admin ? fail(403, "Administrators do not need to apply for credits.") : await apply(request, env, userId);
    } else if (action === "repository" && request.method === "POST") {
      response = await createRepository(request, env, userId, admin);
    } else if (action === "repository" && request.method === "DELETE") {
      response = await deleteRepository(request, env, userId);
    } else if (action === "legacy-repository" && request.method === "DELETE") {
      response = await deleteRepository(request, env, userId, true);
    } else if (action === "sync" && request.method === "POST") {
      response = await syncProjectToGithub(request, env, userId);
    } else if (action === "compile" && request.method === "POST") {
      response = await compile(request, env, userId);
    } else if (action === "runs" && request.method === "GET") {
      response = await listRuns(request, env, userId);
    } else if ((action === "pdf" || action === "download") && (request.method === "GET" || request.method === "HEAD")) {
      response = await servePdf(request, env, userId, action === "download");
    } else if (action === "admin/requests" && request.method === "GET") {
      response = admin ? await adminList(env) : fail(403, "Administrator required.");
    } else if (action === "admin/review" && request.method === "POST") {
      response = admin ? await adminReview(request, env) : fail(403, "Administrator required.");
    } else {
      response = fail(404, "Unknown GitHub compilation action.");
    }
    return withStudioSessionCookies(response, session.cookies);
  } catch (error) {
    const status = Number(error?.status) || 503;
    workerLog("warn", "tex.github.request.failed", {
      action, status, user_id: userId, code: String(error?.code || "backend").slice(0, 40)
    });
    const detail=error?.code==="github_repo_delete_permission_denied" ?
      "GitHub denied repository deletion. Fine-grained tokens require Repository Administration: write; classic PATs require delete_repo; organizations may block deletion. The repository is still linked. Update the operator token/organization permissions, then retry." :
      error?.code==="github_404" && (action==="repository" || action==="legacy-repository") && request.method==="DELETE" ?
      "GitHub repository is not visible to the operator token. Deletion cannot be confirmed: the repository may still exist. No local binding was removed; verify GitHub access before retrying." :
      publicError(status);
    return withStudioSessionCookies(fail(status,detail), session.cookies);
  }
}

// Client can select a document ID, never a GitHub owner or repo name.
// R2 ownership is independently verified on every status/action request.
function githubProjectId(request,body){
  const fromBody=body?.document_id;
  const fromQuery=new URL(request.url).searchParams.get("document_id");
  const id=String(fromBody??fromQuery??"");
  return isStorageObjectId(id)?id:"";
}
async function githubProjectOwned(env,userId,documentId){
  if(!hasStorageBinding(env)||!isStorageObjectId(documentId))return false;
  try {return Boolean(await env.STORAGE.head(
    "_system/tex-documents/"+userId+"/"+documentId+".json"));}
  catch{return false;}
}
async function ownedGithubProject(request,env,userId,body) {
  const id=githubProjectId(request,body);
  if(!id)throw httpError(400,"project_required");
  if(!await githubProjectOwned(env,userId,id))throw httpError(404,"project_not_owned");
  return id;
}

function strictOrigin(request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try { return new URL(origin).origin === new URL(request.url).origin; }
    catch { return false; }
  }
  return request.headers.get("sec-fetch-site") === "same-origin";
}

// Keep Work admin visibility and the unlimited quota policy aligned with
// the independently verified Admin console session. The legacy public.is_admin()
// is intentionally not executable by authenticated users; it always yielded
// a 403 here and silently hid the admin quota button.
async function isVerifiedAdmin(accessToken) {
  try {
    const response = await fetch(SUPABASE_URL + "/rest/v1/rpc/verify_admin_session", {
      method:"POST",
      headers:{apikey:SUPABASE_KEY,authorization:"Bearer " + accessToken,
        "content-type":"application/json",accept:"application/json"},
      body:"{}"
    });
    return response.ok && (await response.json()) === true;
  } catch { return false; }
}

function nextChinaMonday(){
  const now=new Date();const china=new Date(now.getTime()+8*3600*1000);
  const d=china.getUTCDay()||7;
  return new Date(Date.UTC(china.getUTCFullYear(),china.getUTCMonth(),china.getUTCDate())+(8-d)*86400000-8*3600000).toISOString();
}

function configured(env) {
  return Boolean(String(env.AERTEX_TEX_GITHUB_TOKEN || "") && validOwner(env.AERTEX_TEX_GITHUB_OWNER) &&
    String(env.AERTEX_TEX_GITHUB_ADMIN_USER_IDS || "").split(",").some(id => isStorageObjectId(id.trim())));
}

function validOwner(owner) {
  return typeof owner === "string" && /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(owner);
}

function fail(status, message) {
  return json({ error: message }, status);
}

function publicError(status) {
  if (status === 400) return "Invalid request.";
  if (status === 403) return "Not authorized for this operation.";
  if (status === 404) return "Not found.";
  if (status === 409) return "A conflicting operation is already in progress.";
  if (status === 429) return "Compilation quota or rate limit reached.";
  return "The GitHub compilation service is currently unavailable.";
}

// Expose a small, fixed diagnostic vocabulary to the authenticated project owner.
 // Avoid leaking GitHub response bodies, request headers, token contents or internal paths.
function githubProvisionDiagnostic(stage,error){
  const code=String(error?.code||"");
  const step={
    locate:"checking whether the repository already exists",
    create:"creating the public repository",
    identity:"validating the repository owner and ID",
    source:"uploading main.tex",
    readme:"uploading README.md",
    workflow:"installing the compilation workflow",
    head:"reading the repository's default branch",
    pdf:"creating the PDF output branch",
    finalize:"saving the repository's ready state"
  }[stage]||"provisioning the repository";
  let reason="A service or storage request failed.";
  if(code==="github_401")reason="GitHub rejected the operator credential. Check the token validity.";
  else if(code==="github_403")reason=stage==="workflow"?
    "GitHub denied workflow-file writes. Grant Workflows: Read and write to the repository token.":
    "GitHub denied this operation. Check the operator token's repository permissions.";
  else if(code==="github_404")reason="GitHub cannot find this repository or branch with the configured token.";
  else if(code==="github_422")reason="GitHub rejected the request as invalid or conflicting.";
  else if(code==="github_429")reason="GitHub rate limiting is active. Retry after the rate limit clears.";
  else if(/^github_5\d\d$/.test(code))reason="GitHub returned a server error.";
  else if(code==="invalid_managed_repository_name")reason="The stored repository name failed validation.";
  else if(code==="credentials_missing")reason="GitHub operator credentials are not configured.";
  else if(code.startsWith("database_"))reason="The protected account database request failed.";
  return "Repository setup failed while "+step+". "+reason+" Existing repository data was preserved for retry.";
}

function httpError(status, code) {
  const error = new Error(code);
  error.status = status;
  error.code = code;
  return error;
}

async function data(env, resource, method = "GET", value = undefined, extra = {}) {
  const token = getSupabaseSecret(env);
  const headers = {
    apikey: token,
    accept: "application/json",
    "content-type": "application/json",
    prefer: "return=representation",
    ...(token.split(".").length === 3 ? { authorization: "Bearer " + token } : {}),
    ...extra
  };
  const response = await fetch(SUPABASE_URL + "/rest/v1/" + resource, {
    method, headers,
    ...(value === undefined ? {} : { body: JSON.stringify(value) })
  });
  if (!response.ok) throw httpError(503, "database_" + response.status);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function readRow(env, userId) {
  const rows = await data(env, TABLE + "?user_id=eq." + encodeURIComponent(userId) + "&select=*");
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function updateRow(env, userId, values, filters = "") {
  const rows = await data(env, TABLE + "?user_id=eq." + encodeURIComponent(userId) + filters, "PATCH", {
    ...values, updated_at: new Date().toISOString()
  });
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function inputBody(request) {
  if (Number(request.headers.get("content-length")) > 4096) throw httpError(400, "payload");
  const raw = await request.text();
  if (raw.length > 4096) throw httpError(400, "payload");
  try { return JSON.parse(raw); } catch { throw httpError(400, "json"); }
}

async function apply(request, env, userId) {
  const body = await inputBody(request);
  const amount = Number(body?.credits);
  if (!configured(env)) return fail(503, "GitHub compilation has not been enabled by the administrator.");
  if (!Number.isInteger(amount) || amount < 1 || amount > 100) return fail(400, "Request between 1 and 100 weekly compilation credits.");
  const existing = await readRow(env, userId);
  if (existing?.approval_status === "pending") return fail(409, "Your earlier request is pending.");
  if (existing?.active_nonce) return fail(409, "A build is still active.");
  if (existing?.approval_status === "rejected" &&
      Date.now() - Date.parse(existing.updated_at || 0) < 60 * MINUTE) {
    return fail(429, "Please wait before submitting another application.");
  }
  const values = {
    user_id: userId, approval_status: "pending", requested_credits: amount
  };
  if (existing) await updateRow(env, userId, values);
  else await data(env, TABLE, "POST", [values]);
  return json({ status: "pending", requested_credits: amount }, 202);
}

async function adminList(env) {
  const rows = await data(env, TABLE +
    "?approval_status=eq.pending&select=user_id,requested_credits,quota_total,quota_used,repo_state,created_at,updated_at&order=updated_at.asc&limit=100");
  return json({ requests: Array.isArray(rows) ? rows : [] });
}

async function adminReview(request, env) {
  const body = await inputBody(request);
  const userId = String(body?.user_id || "");
  if (!isStorageObjectId(userId)) return fail(400, "Invalid user.");
  if (!["approved", "rejected"].includes(body?.decision)) return fail(400, "Invalid decision.");
  const credits = Number(body?.credits);
  if (body.decision === "approved" && (!Number.isInteger(credits) || credits < 1 || credits > 100)) {
    return fail(400, "Grant between 1 and 100 credits.");
  }
  const row = await readRow(env, userId);
  if (!row || row.approval_status !== "pending" || row.active_nonce) return fail(409, "Request is no longer pending.");
  const next = await updateRow(env, userId, {
    approval_status: body.decision,
    ...(body.decision === "approved" ? { quota_total: credits, quota_used: 0 } : {})
  }, "&approval_status=eq.pending");
  if (!next) return fail(409, "Request already reviewed.");
  return json({ approved: next.approval_status === "approved", user_id: userId });
}

async function github(env, path, method = "GET", body = undefined) {
  if (!configured(env)) throw httpError(503, "credentials_missing");
  if (!path.startsWith("/") || path.startsWith("//")) throw httpError(400, "bad_path");
  const response = await fetch("https://api.github.com" + path, {
    method,
    headers: {
      authorization: "Bearer " + env.AERTEX_TEX_GITHUB_TOKEN,
      accept: "application/vnd.github+json",
      "content-type": "application/json",
      "x-github-api-version": API_VERSION,
      "user-agent": "AERTEX-Work-TeX"
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    redirect: "manual"
  });
  if (response.status >= 300 && response.status < 400) throw httpError(502, "unexpected_redirect");
  if (!response.ok) {
    if(method==="DELETE"&&(response.status===403||response.status===401))
      throw httpError(403,"github_repo_delete_permission_denied");
    const status = response.status === 404 ? 404 : response.status === 422 ? 409 : response.status === 403 ? 429 : 503;
    throw httpError(status, "github_" + response.status);
  }
  if (response.status === 204 || response.status === 202) return null;
  return response.json();
}

function githubRepoPath(env, repoName) {
  // Modern per-project repositories end in the project UUID and include
  // a readable project/user/timestamp prefix. Legacy 32-hex repos remain valid.
  // Callers also verify the persisted repository ID and GitHub account.
  if (!configured(env)) throw httpError(503, "credentials_missing");
  if (!isTexGithubManagedRepositoryName(repoName)) throw httpError(503, "invalid_managed_repository_name");
  return "/repos/" + env.AERTEX_TEX_GITHUB_OWNER + "/" + repoName;
}

// Bind every operation to the recorded GitHub repository ID and the operator.
// The legacy private repos remain operational until explicitly migrated;
// never silently publish a previous user's source history on ordinary requests.
function verifyManagedRepo(env, actual, repoId, name) {
  if (String(actual?.id ?? "") !== String(repoId ?? "") ||
      actual?.name !== name ||
      String(actual?.owner?.login || "").toLowerCase() !==
        String(env.AERTEX_TEX_GITHUB_OWNER || "").toLowerCase() ||
      typeof actual?.private !== "boolean") {
    throw httpError(409, "repository_identity_mismatch");
  }
  return actual;
}

// Keep all of a user's projects in one GitHub repo, but each document on
// its own branch. The pinned workflow compiles only that branch's main.tex.
// Compiling project B will not replace the source tree of project A.
function projectBranchName(documentId) {
  if (!isStorageObjectId(documentId)) throw httpError(400, "invalid_project_id");
  return "tex-project-" + documentId.replace(/-/g, "").toLowerCase();
}

async function ensureProjectBranch(env, repoPath, rootBranch, documentId) {
  const branch = projectBranchName(documentId);
  try {
    const ref = await github(env, repoPath + "/git/ref/heads/" + branch);
    if (!/^[a-f0-9]{40}$/.test(String(ref?.object?.sha || ""))) {
      throw httpError(503, "project_branch_unavailable");
    }
    return branch;
  } catch (error) {
    if (error.status !== 404) throw error;
  }
  const main = await github(env, repoPath + "/git/ref/heads/" + encodeURIComponent(rootBranch));
  const sha = String(main?.object?.sha || "");
  if (!/^[a-f0-9]{40}$/.test(sha)) throw httpError(503, "source_branch_unavailable");
  try {
    await github(env, repoPath + "/git/refs", "POST", { ref:"refs/heads/" + branch, sha });
  } catch (error) {
    if (error.status !== 409) throw error;
    const recovered = await github(env, repoPath + "/git/ref/heads/" + branch);
    if (!/^[a-f0-9]{40}$/.test(String(recovered?.object?.sha || ""))) {
      throw httpError(503, "project_branch_unavailable");
    }
  }
  return branch;
}

function b64(value) {
  const bytes = new TextEncoder().encode(value);
  let output = "";
  for (let i = 0; i < bytes.length; i += 8192) {
    output += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  return btoa(output);
}

async function putFile(env, repoPath, name, value, branch, alreadyBase64 = false) {
  const path = repoPath + "/contents/" + name.split("/").map(encodeURIComponent).join("/");
  let sha;
  try { sha = (await github(env, path + "?ref=" + encodeURIComponent(branch))).sha; }
  catch (error) { if (error.status !== 404) throw error; }
  return github(env, path, "PUT", {
    message: "docs(tex): update managed " + name,
    branch, content: alreadyBase64 ? value : b64(value),
    ...(sha ? { sha } : {})
  });
}

// Publish a clean, atomic source snapshot in one Git commit rather than
// rewriting the branch one file at a time (which made 500-file projects
// impractical and could leave stale dependencies from a previous project).
// Only the fixed operator-owned workflow is included; project .github files
// and executable source are excluded by selectTexGithubCompileFiles().
async function commitCompileSnapshot(env, repoPath, branch, selected) {
  const reference=await github(env, repoPath+"/git/ref/heads/"+encodeURIComponent(branch));
  const parent=String(reference?.object?.sha||"");
  if(!/^[0-9a-f]{40}$/.test(parent)) throw httpError(503,"source_branch_unavailable");
  const entries=[
    {name:MANAGED_TEX_WORKFLOW_PATH,encoding:"utf8",content:MANAGED_TEX_WORKFLOW},
    {name:"README.md",encoding:"utf8",content:INITIAL_TEX_README},
    ...selected.entries
  ];
  const tree=[];
  for(const asset of entries){
    const item={path:asset.name,mode:"100644",type:"blob"};
    if(asset.encoding==="base64"){
      const blob=await github(env,repoPath+"/git/blobs","POST",{
        content:asset.content,encoding:"base64"
      });
      if(!/^[0-9a-f]{40}$/.test(String(blob?.sha||""))) throw httpError(503,"file_blob_missing");
      item.sha=blob.sha;
    }else{
      item.content=asset.content;
    }
    tree.push(item);
  }
  // No base_tree: drop stale files from previous compilations and prevent
  // old project inputs or workflows from surviving into the next build.
  const createdTree=await github(env,repoPath+"/git/trees","POST",{tree});
  if(!/^[0-9a-f]{40}$/.test(String(createdTree?.sha||""))) throw httpError(503,"source_tree_missing");
  const createdCommit=await github(env,repoPath+"/git/commits","POST",{
    message:"build(tex): publish saved project for XeLaTeX",
    tree:createdTree.sha,parents:[parent]
  });
  const sha=String(createdCommit?.sha||"");
  if(!/^[0-9a-f]{40}$/.test(sha)) throw httpError(503,"source_commit_missing");
  await github(env,repoPath+"/git/refs/heads/"+encodeURIComponent(branch),"PATCH",{
    sha,force:false
  });
  return {sha, included:selected.included, skipped:selected.skipped};
}

async function verifyOwner(env) {
  const profile = await github(env, "/user");
  if (String(profile?.login || "").toLowerCase() !== String(env.AERTEX_TEX_GITHUB_OWNER).toLowerCase()) {
    throw httpError(403, "token_owner_mismatch");
  }
}

async function createRepository(request, env, userId, admin = false) {
  const acknowledgement=await inputBody(request);
  if(acknowledgement?.ack_public!==true)
    return fail(400,"Confirm that source code and compiled PDFs will be publicly visible.");
  const documentId=await ownedGithubProject(request,env,userId,acknowledgement);
  if(!configured(env))return fail(503,"GitHub service credentials are not configured.");
  let row=await readRow(env,userId);
  if(admin&&!row){
    try{await data(env,TABLE,"POST",[{user_id:userId,approval_status:"approved",requested_credits:100,
      quota_total:0,quota_used:0,weekly_credits:100}]);}
    catch(error){row=await readRow(env,userId);if(!row)throw error;}
    row=await readRow(env,userId);
  }
  if(admin&&row?.approval_status!=="approved")
    row=await updateRow(env,userId,{approval_status:"approved"});
  if(!row||row.approval_status!=="approved")
    return fail(403,"Compilation approval is required.");
  // Immutable project-scoped name. Existing bindings keep their exact name;
  // renamed project titles do not silently target a different GitHub repo.
  let binding=await readTexGithubProjectRepository(env,userId,documentId);
  let name=binding?.repo_name||'';
  if(!name){
    const raw=await env.STORAGE.get("_system/tex-documents/"+userId+"/"+documentId+".json");
    const document=raw?await raw.json():null;
    if(!document||document.owner_id!==userId||document.id!==documentId)
      return fail(404,"Project not found.");
    const profileRows=await data(env,"profiles?id=eq."+encodeURIComponent(userId)+"&select=username");
    const username=Array.isArray(profileRows)?profileRows[0]?.username||'user':'user';
    name=texGithubProjectRepositoryName(documentId,{
      title:document.title||'project',username,
      created_at:new Date().toISOString(),is_admin:admin
    });
  }
  if(binding?.repo_state==="ready")return fail(409,"This project already has a repository.");
  if(binding?.repo_state==="deleting")return fail(409,"Finish deleting this project's repository first.");
  await verifyOwner(env);
  binding=await writeTexGithubProjectRepository(env,userId,documentId,{
    repo_state:"creating",repo_name:name,last_error:null,
    ...(binding?.repo_id?{}:{repo_id:null}),
    source_branch:binding?.source_branch||"main"
  });
  let repoId=binding.repo_id;
  let branch=binding.source_branch||"main";
  let provisioningStep="locate";
  try{
    if(!repoId){
      let created=null;
      try{created=await github(env,"/repos/"+env.AERTEX_TEX_GITHUB_OWNER+"/"+name);}
      catch(error){if(error.status!==404)throw error;}
      if(!created){
        provisioningStep="create";
        created=await github(env,"/user/repos","POST",{
        name,private:false,auto_init:true,
        description:"Public TeX compilation repository for one AERTEX Work project",
        has_issues:false,has_wiki:false,has_projects:false,allow_auto_merge:false
        });
      }
      provisioningStep="identity";
      if(created?.name!==name||typeof created?.private!=="boolean"||
        created.owner?.login?.toLowerCase()!==env.AERTEX_TEX_GITHUB_OWNER.toLowerCase())
        throw httpError(409,"unexpected_repository_identity");
      repoId=created.id;branch=created.default_branch||"main";
      binding=await writeTexGithubProjectRepository(env,userId,documentId,{
        repo_state:"creating",repo_id:repoId,source_branch:branch,last_error:null
      });
    }
    provisioningStep="identity";
    const repoPath=githubRepoPath(env,name);
    verifyManagedRepo(env,await github(env,repoPath),repoId,name);
    provisioningStep="source";
    await putFile(env,repoPath,"main.tex",INITIAL_TEX_SOURCE,branch);
    provisioningStep="readme";
    await putFile(env,repoPath,"README.md",INITIAL_TEX_README,branch);
    provisioningStep="workflow";
    await putFile(env,repoPath,MANAGED_TEX_WORKFLOW_PATH,MANAGED_TEX_WORKFLOW,branch);
    provisioningStep="head";
    const head=await github(env,repoPath+"/git/ref/heads/"+encodeURIComponent(branch));
    provisioningStep="pdf";
    try{
      await github(env,repoPath+"/git/refs","POST",{ref:"refs/heads/pdf-output",sha:head.object.sha});
    }catch(error){
      if(error.status!==409)throw error;
      const existing=await github(env,repoPath+"/git/ref/heads/pdf-output");
      if(!existing?.object?.sha)throw httpError(503,"pdf_branch_missing");
    }
    provisioningStep="finalize";
    await writeTexGithubProjectRepository(env,userId,documentId,{
      repo_state:"ready",repo_id:repoId,source_branch:branch,last_error:null
    });
    return json({created:true,document_id:documentId,repository_name:name,repository_state:"ready"},201);
  }catch(error){
    // Preserve the bound repository ID for retry; never create a second repo
    // when GitHub succeeded but the later workflow provisioning failed.
    const diagnostic=githubProvisionDiagnostic(provisioningStep,error);
    await writeTexGithubProjectRepository(env,userId,documentId,{
      repo_state:"error",repo_id:repoId||null,source_branch:branch,
      last_error:diagnostic
    }).catch(()=>{});
    workerLog("warn","tex.github.project_provision.failed",{
      user_id:userId,document_id:documentId,stage:provisioningStep,
      code:String(error?.code||"unknown").slice(0,50)
    });
    // A fixed, non-sensitive diagnostic is safe for this verified project owner.
    return fail(Number(error?.status)||503,diagnostic);
  }
}

async function deleteRepository(request,env,userId,legacy=false) {
  const body=await inputBody(request);
  if(legacy){
    // Explicitly remove an old shared repository ONLY when specifically
    // requested. Never interpret it as the current project's repository.
    return deleteLegacyGithubRepository(env,userId,body);
  }
  const documentId=await ownedGithubProject(request,env,userId,body);
  let binding=await readTexGithubProjectRepository(env,userId,documentId);
  if(!binding||!["ready","deleting","error","creating"].includes(binding.repo_state))
    return fail(404,"This project does not have a managed repository.");
  if(body?.confirm!=="DELETE "+binding.repo_name)
    return fail(400,"Exact repository name confirmation is required.");
  const repoPath=githubRepoPath(env,binding.repo_name);
  // An interrupted create can leave a name-bound record WITHOUT repo_id.
  // Reconcile it before deletion, rather than trapping the owner forever in
  // "Creation failed" with a Delete button that always responds 404.
  // Newly provisioned repos MUST be public. Only an authenticated operator's
  // confirmed 404 is sufficient to clear a never-created binding.
  if(!binding.repo_id&&!binding.delete_confirmed){
    await verifyOwner(env);
    let existing=null;
    try{existing=await github(env,repoPath);}
    catch(error){if(error.status!==404)throw error;}
    if(!existing){
      await removeTexGithubProjectRepository(env,userId,documentId);
      return json({deleted:true,document_id:documentId,repository_name:binding.repo_name,
        repository_state:"none",repository_not_created:true,
        message:"No public GitHub repository exists; the incomplete project binding was cleared."});
    }
    if(existing?.name!==binding.repo_name ||
       String(existing?.owner?.login||"").toLowerCase()!==
         String(env.AERTEX_TEX_GITHUB_OWNER||"").toLowerCase() ||
       existing?.private!==false||!Number.isSafeInteger(Number(existing?.id))||
       Number(existing.id)<=0)throw httpError(409,"repository_recovery_identity_mismatch");
    binding=await writeTexGithubProjectRepository(env,userId,documentId,{
      repo_id:existing.id,repo_state:"error",delete_confirmed:false
    });
  }
  // An explicit delete cancels in-flight GitHub jobs for THIS repo. Refusing
  // the delete until an account-wide quota nonce clears trapped users in a
  // permanent loop when the polling tab had already closed.
  // Validate the exact persisted GitHub repository ID and owner below.
  // Do not gate an already-bound DELETE on GET /user: GitHub App installation
  // tokens may have Administration:write access but no user-profile API access.
  await writeTexGithubProjectRepository(env,userId,documentId,{
    repo_state:"deleting",last_error:null
  });
  try{
    if(!binding.delete_confirmed){
      // GitHub 404 is not proof a once-created repository was deleted:
      // the operator's token might have lost private-repository access.
      const actual=await github(env,repoPath);
      verifyManagedRepo(env,actual,binding.repo_id,binding.repo_name);
      await github(env,repoPath,"DELETE");
      // Persist a true GitHub-204 receipt BEFORE clearing the R2 binding.
      // A retry may finalize that receipt even if R2 deletion was interrupted.
      await writeTexGithubProjectRepository(env,userId,documentId,{
        repo_state:"deleting",delete_confirmed:true,last_error:null
      });
    }
    const latestRow=await readRow(env,userId);
    if(latestRow?.active_nonce && latestRow.active_nonce===binding.active_nonce){
      try{await releaseCredit(env,userId,latestRow.active_nonce,false);}
      catch(error){
        workerLog("warn","tex.github.deleted_repo_credit_release_failed",{
          user_id:userId,document_id:documentId,code:String(error?.code||"unknown").slice(0,50)
        });
      }
    }
    try{await removeTexGithubProjectRepository(env,userId,documentId);}
    catch(error){
      workerLog("warn","tex.github.deleted_project_record_cleanup_failed",{
        user_id:userId,document_id:documentId,code:String(error?.code||"unknown").slice(0,50)
      });
      return json({deleted:true,cleanup_pending:true,document_id:documentId,
        repository_name:binding.repo_name,repository_state:"deleting",
        message:"GitHub confirmed deletion; project record cleanup pending. Retry deletion to finish."},202);
    }
    return json({deleted:true,document_id:documentId,repository_name:binding.repo_name,
      repository_state:"none",message:"GitHub repository deleted successfully."});
  }catch(error){
    await writeTexGithubProjectRepository(env,userId,documentId,{
      repo_state:"deleting",
      last_error:"Deletion not confirmed. Retry deleting this project's repository; its record was preserved."
    }).catch(()=>{});
    workerLog("warn","tex.github.project_delete.failed",{
      user_id:userId,document_id:documentId,code:String(error?.code||"unknown").slice(0,50)
    });
    throw error;
  }
}

// Legacy deletion needs its own server-only receipt. The previous flow
// could succeed on GitHub but fail when patching SQL; subsequent retries saw
// GitHub 404 and left the same row permanently visible. A verified 204 is
// recorded before database finalization, so retry is safe and idempotent.
function legacyDeleteReceiptKey(userId){
  if(!isStorageObjectId(userId))throw httpError(400,"invalid_user");
  return "_system/tex-github-delete-receipts/"+userId+".json";
}
async function readLegacyDeleteReceipt(env,userId){
  if(!hasStorageBinding(env))return null;
  const object=await env.STORAGE.get(legacyDeleteReceiptKey(userId));
  if(!object)return null;
  return object.json().catch(()=>null);
}
async function writeLegacyDeleteReceipt(env,userId,row){
  if(!hasStorageBinding(env))throw httpError(503,"deletion_receipt_storage_unavailable");
  const receipt={user_id:userId,repo_name:row.repo_name,repo_id:row.repo_id,
    confirmed:true,confirmed_at:new Date().toISOString()};
  await env.STORAGE.put(legacyDeleteReceiptKey(userId),JSON.stringify(receipt),{
    httpMetadata:{contentType:"application/json;charset=UTF-8"}
  });
}

async function deleteLegacyGithubRepository(env,userId,body) {
  const row=await readRow(env,userId);
  if(!row?.repo_id||!row.repo_name||!["ready","deleting","error"].includes(row.repo_state))
    return fail(404,"No legacy account-level repository remains.");
  if(body?.confirm!=="DELETE "+row.repo_name)
    return fail(400,"Exact legacy repository confirmation is required.");
  const receipt=await readLegacyDeleteReceipt(env,userId);
  const alreadyDeleted=receipt?.confirmed===true&&receipt?.user_id===userId&&
    String(receipt.repo_id)===String(row.repo_id)&&receipt.repo_name===row.repo_name;
  if(!alreadyDeleted){
    // Repository owner/name/ID are verified against GitHub before DELETE.
    // GET /user is not needed and rejects valid GitHub App install tokens.
    await updateRow(env,userId,{repo_state:"deleting"});
    const repoPath=githubRepoPath(env,row.repo_name);
    try{
      // Never infer success from a GitHub 404: the token may simply lack
      // visibility. Only an actual successful GitHub DELETE is a receipt.
      const actual=await github(env,repoPath);
      verifyManagedRepo(env,actual,row.repo_id,row.repo_name);
      let legacyRunBelongsHere=false;
      if(row.active_nonce&&Number.isSafeInteger(Number(row.active_run_id))&&Number(row.active_run_id)>0){
        try{
          const run=await github(env,repoPath+"/actions/runs/"+encodeURIComponent(row.active_run_id));
          legacyRunBelongsHere=Number(run?.id)===Number(row.active_run_id);
        }catch(error){if(error.status!==404)throw error;}
      }
      await github(env,repoPath,"DELETE");
      await writeLegacyDeleteReceipt(env,userId,row);
      if(legacyRunBelongsHere&&row.active_nonce){
        await releaseCredit(env,userId,row.active_nonce,false).catch(error=>
          workerLog("warn","tex.github.legacy_deleted_credit_release_failed",{
            user_id:userId,code:String(error?.code||"unknown").slice(0,50)
          })
        );
      }
    }catch(error){
      workerLog("warn","tex.github.legacy_delete.failed",{
        user_id:userId,code:String(error?.code||"unknown").slice(0,50)
      });
      throw error;
    }
  }
  try{
    // The SQL quota ledger may now contain a reservation belonging to ANOTHER
    // project. Do not clear any active_nonce or active_run_id fields here.
    const cleared=await updateRow(env,userId,{
      repo_name:null,repo_id:null,repo_state:"none",source_branch:"main"
    });
    if(!cleared)throw httpError(503,"legacy_record_cleanup_failed");
  }catch(error){
    workerLog("warn","tex.github.legacy_record_cleanup_failed",{
      user_id:userId,code:String(error?.code||"unknown").slice(0,50)
    });
    return json({deleted:true,legacy:true,cleanup_pending:true,
      repository_name:row.repo_name,repository_state:"deleting",
      message:"GitHub confirmed deletion; local account record cleanup is pending. Retry to finish."},202);
  }
  // The SQL row is already finalized. Deleting the receipt is only a tidy-up.
  if(hasStorageBinding(env)){
    await env.STORAGE.delete(legacyDeleteReceiptKey(userId)).catch(error=>
      workerLog("warn","tex.github.legacy_receipt_cleanup_failed",{
        user_id:userId,code:String(error?.code||"unknown").slice(0,50)
      })
    );
  }
  return json({deleted:true,legacy:true,repository_name:row.repo_name,repository_state:"none"});
}

// Saving to GitHub is NOT a compilation request. It never dispatches
// Actions, reserves quota or changes a PDF. Only an explicitly selected,
// authenticated project and its safe TeX dependencies are synchronized.
async function syncProjectToGithub(request,env,userId){
  if(!hasStorageBinding(env))return fail(503,"Document storage unavailable.");
  const body=await inputBody(request);
  const id=await ownedGithubProject(request,env,userId,body);
  const binding=await readTexGithubProjectRepository(env,userId,id);
  if(!binding?.repo_id || binding.repo_state!=="ready")
    return fail(404,"Create this project's GitHub repository first.");
  const object=await env.STORAGE.get("_system/tex-documents/"+userId+"/"+id+".json");
  if(!object)return fail(404,"Project not found.");
  const document=await object.json();
  if(document?.owner_id!==userId||document.id!==id||document.main_deleted===true)
    return fail(403,"Main TeX file unavailable for this project.");
  let selection;
  try{selection=selectTexGithubCompileFiles(document);}
  catch(error){return fail(400,String(error?.message||"Invalid source files.").slice(0,200));}
  const repoPath=githubRepoPath(env,binding.repo_name);
  const remote=await github(env,repoPath);
  verifyManagedRepo(env,remote,binding.repo_id,binding.repo_name);
  const branch=await ensureProjectBranch(env,repoPath,binding.source_branch||"main",id);
  const commit=await commitCompileSnapshot(env,repoPath,branch,selection);
  return json({saved:true,compiled:false,document_id:id,branch,
    commit_sha:commit.sha||null,synced_files:selection.included,
    skipped_files:selection.skipped},200);
}

async function reserveCredit(env, userId, nonce) {
  const result = await data(env, "rpc/tex_gh_reserve_credit", "POST", {
    p_user_id: userId, p_nonce: nonce
  });
  return Number.isInteger(result) ? result : null;
}

async function releaseCredit(env, userId, nonce, refund) {
  return data(env, "rpc/tex_gh_release_credit", "POST", {
    p_user_id: userId, p_nonce: nonce, p_refund: Boolean(refund)
  });
}

async function compile(request, env, userId) {
  const row = await readRow(env, userId);
  if (!row || row.approval_status !== "approved") {
    return fail(403, "An approved compilation quota is required.");
  }
  if (!hasStorageBinding(env)) return fail(503, "Document storage unavailable.");
  const body=await inputBody(request);
  const docId=await ownedGithubProject(request,env,userId,body);
  const binding=await readTexGithubProjectRepository(env,userId,docId);
  if(binding?.repo_state!=="ready"||!binding.repo_id)
    return fail(403,"Create the GitHub repository for this project before compiling.");
  const object = await env.STORAGE.get("_system/tex-documents/" + userId + "/" + docId + ".json");
  if (!object) return fail(404, "Document not found in this account.");
  const doc = JSON.parse(await object.text());
  if (doc?.document_deleted || doc?.owner_id !== userId || doc?.id !== docId || typeof doc.source !== "string") {
    return fail(403, "Document is not owned by this account.");
  }
  if (!doc.source.trim() || doc.source.length > MAX_SOURCE || doc.engine !== "xelatex") {
    return fail(400, "GitHub builds currently require a XeLaTeX document under 160,000 characters.");
  }
  // Validate/choose relevant dependencies before reserving a credit. Office
  // documents, Python/Java/C++ sources, Git metadata and generated main.pdf
  // remain in Work but must not be synchronized to the compile-only repo.
  let selected;
  try { selected=selectTexGithubCompileFiles(doc); }
  catch(error){return fail(400,String(error?.message||"Project files are invalid.").slice(0,200));}
  const nonce = crypto.randomUUID();
  const remaining = await reserveCredit(env, userId, nonce);
  if (remaining === null) return fail(429, "No available credit or another build is active.");
  let dispatchAttempted = false;
  try {
    const repoPath = githubRepoPath(env, binding.repo_name);
    const actual = await github(env, repoPath);
    verifyManagedRepo(env, actual, binding.repo_id, binding.repo_name);

    // Keep the user's saved projects isolated. This compilation only touches
    // the selected project's branch, never another project's source files.
    const projectBranch=await ensureProjectBranch(env,repoPath,binding.source_branch||"main",docId);
    const committed=await commitCompileSnapshot(env,repoPath,projectBranch,selected);
    // Persist the unique Git commit before dispatch. A timed-out HTTP call may
    // have queued an Actions run; never refund a potentially successful dispatch.
    const sourceSha = String(committed.sha || "");
    if (!/^[0-9a-f]{40}$/.test(sourceSha)) throw httpError(503, "source_sha_unavailable");
    // Record the selected project's active reservation BEFORE dispatch. If
    // GitHub accepts a run but the response is lost, this scoped commit SHA
    // allows status polling to release quota safely without mixing projects.
    await writeTexGithubProjectRepository(env,userId,docId,{
      active_nonce:nonce,active_run_id:null,
      active_commit_sha:sourceSha,active_since:new Date().toISOString()
    });
    const bound = await updateRow(env, userId, {
      active_commit_sha: sourceSha
    }, "&active_nonce=eq." + encodeURIComponent(nonce));
    if (!bound) throw httpError(409, "lost_quota_reservation");

    dispatchAttempted = true;
    const dispatched = await github(env, repoPath + "/actions/workflows/aertex-compile.yml/dispatches", "POST", {
      ref: projectBranch,
      return_run_details: true
    });
    const runId = Number(dispatched?.workflow_run_id);
    if (!Number.isSafeInteger(runId) || runId <= 0) {
      throw httpError(503, "dispatch_run_id_unavailable");
    }
    const recorded = await updateRow(env, userId, {
      active_run_id: runId, last_run_at: new Date().toISOString()
    }, "&active_nonce=eq." + encodeURIComponent(nonce));
    if (!recorded) throw httpError(503, "run_id_persistence_failed");
    await writeTexGithubProjectRepository(env,userId,docId,{
      active_nonce:nonce,active_run_id:runId,active_commit_sha:sourceSha
    });
    return json({ queued: true, remaining, run_id: runId, document_id: docId,
      project_branch: projectBranch, synced_files: selected.included, skipped_files: selected.skipped }, 202);
  } catch (error) {
    // A non-returning dispatch may still have started a GitHub run.
    // The recorded commit SHA lets the owner/admin reconcile the exact run;
    // the credit remains reserved and cannot be spent again.
    if (!dispatchAttempted) {
      await releaseCredit(env, userId, nonce, true).catch(() => {});
    }
    throw error;
  }
}

async function listRuns(request,env,userId) {
  const documentId=await ownedGithubProject(request,env,userId);
  const row=await readRow(env,userId);
  const binding=await readTexGithubProjectRepository(env,userId,documentId);
  if(!binding?.repo_id||binding.repo_state!=="ready")
    return json({document_id:documentId,runs:[],jobs:[],active:false});
  const repoPath=githubRepoPath(env,binding.repo_name);
  const response = await github(env,
    repoPath + "/actions/workflows/aertex-compile.yml/runs?event=workflow_dispatch&per_page=20");
  const runs = Array.isArray(response?.workflow_runs) ? response.workflow_runs : [];
  const normalized = runs.map(run => ({
    id: run.id, status: run.status, conclusion: run.conclusion,
    created_at: run.created_at, updated_at: run.updated_at
  }));
  // Only report actual GitHub Actions job/step states. The UI must never
  // invent a percentage or imply that dispatch guarantees a finished PDF.
  let jobs = [];
  if (runs[0]?.id) {
    try {
      const details = await github(env, repoPath + "/actions/runs/" + encodeURIComponent(runs[0].id) + "/jobs?per_page=10");
      jobs = (Array.isArray(details?.jobs) ? details.jobs : []).slice(0, 10).map(job => ({
        name: String(job.name || "").slice(0, 100),
        status: job.status || "queued",
        conclusion: job.conclusion || null,
        steps: (Array.isArray(job.steps) ? job.steps : []).slice(0, 20).map(step => ({
          name: String(step.name || "").slice(0, 100),
          number: Number(step.number) || 0,
          status: step.status || "queued",
          conclusion: step.conclusion || null
        }))
      }));
    } catch {
      // Run status remains useful while GitHub is indexing its job details.
    }
  }

  // The old "any run created recently" heuristic is unsafe: it can release
  // another dispatch's credit. Match the authoritative ID; a stored commit
  // SHA is a recovery fallback when GitHub accepted a request but its 200
  // response (or the subsequent database write) was lost.
  const matchingReservation=Boolean(row?.active_nonce&&binding.active_nonce===row.active_nonce);
  const activeRun = matchingReservation ? runs.find(run => {
    if(row.active_run_id)return Number(run.id)===Number(row.active_run_id);
    return Boolean(binding.active_commit_sha)&&
      String(run.head_sha)===String(binding.active_commit_sha)&&
      Date.parse(run.created_at)>=Date.parse(binding.active_since||"")-15000;
  }) : null;

  if (activeRun?.status === "completed" && row.active_nonce) {
    await releaseCredit(env, userId, row.active_nonce, false).catch(() => {});
  }
  return json({
    document_id:documentId,
    runs: normalized,
    jobs,
    active: Boolean(matchingReservation && (!activeRun || activeRun.status !== "completed")),
    active_run_id: activeRun?.id || null
  });
}

function base64Bytes(data) {
  const string = atob(data.replace(/\s+/g, ""));
  const out = new Uint8Array(string.length);
  for (let i = 0; i < string.length; i++) out[i] = string.charCodeAt(i);
  return out;
}

async function servePdf(request, env, userId, download) {
  const documentId=await ownedGithubProject(request,env,userId);
  const binding=await readTexGithubProjectRepository(env,userId,documentId);
  if(!binding?.repo_id||binding.repo_state!=="ready")
    return fail(404,"This project does not have a compiled PDF.");
  const repoPath=githubRepoPath(env,binding.repo_name);
  const result = await github(env, repoPath + "/contents/main.pdf?ref=pdf-output");
  if (!result || result.type !== "file" || result.size > PDF_LIMIT) {
    return fail(404, "The PDF is not available yet.");
  }
  const blob = result.content ? result : await github(env, repoPath + "/git/blobs/" + encodeURIComponent(result.sha));
  if (!blob?.content || blob.encoding !== "base64") return fail(404, "The PDF is not available yet.");
  const bytes = base64Bytes(blob.content);
  if (bytes.byteLength < 5 || bytes.byteLength > PDF_LIMIT ||
      String.fromCharCode(...bytes.subarray(0, 5)) !== "%PDF-") {
    return fail(502, "Invalid PDF output.");
  }
  // PDFKit uses HTTP Range for inline PDFs on iPad Safari. Serve each
  // requested slice with accurate Content-Range and preserve auth/RLS checks.
  const range = selectTexPdfRange(bytes, download ? null : request.headers.get("range"));
  const headers = {
    "content-type": "application/pdf",
    "cache-control": "private, no-store",
    "x-content-type-options": "nosniff",
    "accept-ranges": "bytes",
    "content-disposition": (download ? "attachment" : "inline") + "; filename=\"aertex-main.pdf\""
  };
  if (range.contentRange) headers["content-range"] = range.contentRange;
  headers["content-length"] = String(range.body?.byteLength || 0);
  return new Response(request.method === "HEAD" ? null : range.body, {
    status: range.status, headers
  });
}
