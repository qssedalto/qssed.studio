import { SUPABASE_URL } from "./config.js";
import { json } from "./routing.js";
import { verifyStudioApiSession, withStudioSessionCookies } from "./session-gate.js";
import { verifyTexUser } from "./tex-api-core.js";
import { getSupabaseSecret, workerLog } from "./server-runtime.js";
import { hasStorageBinding, isStorageObjectId } from "./storage-api.js";
import {
  managedTexRepoName, MANAGED_TEX_WORKFLOW_PATH, MANAGED_TEX_WORKFLOW,
  INITIAL_TEX_SOURCE, INITIAL_TEX_README
} from "./tex-github-workflow.js";

const TABLE = "tex_github_allowances";
const API_VERSION = "2022-11-28";
const MAX_SOURCE = 160000;
const PDF_LIMIT = 16 * 1024 * 1024;
const MINUTE = 60 * 1000;

export async function handleTexGithubApi(request, env, action) {
  const session = await verifyStudioApiSession(request);
  if (!session.ok) return withStudioSessionCookies(fail(401, "Authentication required."), session.cookies);
  const verified = await verifyTexUser(session.accessToken);
  if (verified.error) return withStudioSessionCookies(verified.error, session.cookies);
  if (!["GET", "POST", "DELETE"].includes(request.method)) {
    return withStudioSessionCookies(fail(405, "Method not allowed."), session.cookies);
  }
  if (request.method !== "GET" && !strictOrigin(request)) {
    return withStudioSessionCookies(fail(403, "Cross-origin mutation blocked."), session.cookies);
  }
  const userId = verified.user.id;
  const adminIds = String(env.AERTEX_TEX_GITHUB_ADMIN_USER_IDS || "").split(",").map(v => v.trim());
  const admin = adminIds.includes(userId);
  const secret = getSupabaseSecret(env);
  if (!secret) return withStudioSessionCookies(fail(503, "Protected account storage is unavailable."), session.cookies);

  try {
    let response;
    if (action === "status" && request.method === "GET") {
      const row = await readRow(env, userId);
      response = json({
        configured: configured(env),
        is_admin: admin,
        approval_status: row?.approval_status || "none",
        requested_credits: row?.requested_credits || 0,
        quota_total: row?.quota_total || 0,
        quota_used: row?.quota_used || 0,
        remaining: Math.max(0, (row?.quota_total || 0) - (row?.quota_used || 0)),
        repository_created: Boolean(row?.repo_id && row?.repo_state === "ready"),
        repository_state: row?.repo_state || "none",
        repository_name: row?.repo_state === "ready" ? row.repo_name : null,
        active: Boolean(row?.active_nonce),
        engine: "xelatex"
      });
    } else if (action === "apply" && request.method === "POST") {
      response = await apply(request, env, userId);
    } else if (action === "repository" && request.method === "POST") {
      response = await createRepository(env, userId);
    } else if (action === "repository" && request.method === "DELETE") {
      response = await deleteRepository(request, env, userId);
    } else if (action === "compile" && request.method === "POST") {
      response = await compile(request, env, userId);
    } else if (action === "runs" && request.method === "GET") {
      response = await listRuns(env, userId);
    } else if ((action === "pdf" || action === "download") && request.method === "GET") {
      response = await servePdf(env, userId, action === "download");
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
    return withStudioSessionCookies(fail(status, publicError(status)), session.cookies);
  }
}

function strictOrigin(request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try { return new URL(origin).origin === new URL(request.url).origin; }
    catch { return false; }
  }
  return request.headers.get("sec-fetch-site") === "same-origin";
}

function configured(env) {
  return Boolean(String(env.AERTEX_TEX_GITHUB_TOKEN || "") && validOwner(env.AERTEX_TEX_GITHUB_OWNER));
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
  if (!Number.isInteger(amount) || amount < 1 || amount > 30) return fail(400, "Request between 1 and 30 compilation credits.");
  const existing = await readRow(env, userId);
  if (existing?.approval_status === "pending") return fail(409, "Your earlier request is pending.");
  if (existing?.active_nonce) return fail(409, "A build is still active.");
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
    const status = response.status === 404 ? 404 : response.status === 422 ? 409 : response.status === 403 ? 429 : 503;
    throw httpError(status, "github_" + response.status);
  }
  if (response.status === 204 || response.status === 202) return null;
  return response.json();
}

function githubRepoPath(env, repoName) {
  if (!configured(env) || !/^aertex-tex-[0-9a-f]{32}$/.test(repoName || "")) throw httpError(503, "configuration");
  return "/repos/" + env.AERTEX_TEX_GITHUB_OWNER + "/" + repoName;
}

function b64(value) {
  const bytes = new TextEncoder().encode(value);
  let output = "";
  for (let i = 0; i < bytes.length; i += 8192) {
    output += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  return btoa(output);
}

async function putFile(env, repoPath, name, value, branch) {
  const path = repoPath + "/contents/" + name.split("/").map(encodeURIComponent).join("/");
  let sha;
  try { sha = (await github(env, path + "?ref=" + encodeURIComponent(branch))).sha; }
  catch (error) { if (error.status !== 404) throw error; }
  return github(env, path, "PUT", {
    message: "docs(tex): update managed " + name,
    branch, content: b64(value),
    ...(sha ? { sha } : {})
  });
}

async function verifyOwner(env) {
  const profile = await github(env, "/user");
  if (String(profile?.login || "").toLowerCase() !== String(env.AERTEX_TEX_GITHUB_OWNER).toLowerCase()) {
    throw httpError(403, "token_owner_mismatch");
  }
}

async function createRepository(env, userId) {
  const row = await readRow(env, userId);
  if (!row || row.approval_status !== "approved") return fail(403, "Compilation approval is required.");
  if (!configured(env)) return fail(503, "GitHub service credentials are not configured.");
  if (row.repo_state === "ready") return fail(409, "This account already has a repository.");
  if (row.repo_state === "deleting") return fail(409, "Repository deletion is in progress.");
  const name = managedTexRepoName(userId);
  if (row.repo_name && row.repo_name !== name) return fail(409, "Repository ownership mismatch.");
  await verifyOwner(env);

  let record = row;
  if (row.repo_state === "none" || row.repo_state === "error") {
    record = await updateRow(env, userId, {
      repo_state: "creating", repo_name: name
    }, "&repo_state=eq." + row.repo_state);
    if (!record) return fail(409, "Repository creation already started.");
  }
  let repoId = record.repo_id;
  let branch = record.source_branch || "main";
  try {
    if (!repoId) {
      const created = await github(env, "/user/repos", "POST", {
        name, private: true, auto_init: true,
        description: "Private TeX workspace managed by AERTEX",
        has_issues: false, has_wiki: false,
        has_projects: false, allow_auto_merge: false
      });
      if (!created?.private || created.owner?.login?.toLowerCase() !== env.AERTEX_TEX_GITHUB_OWNER.toLowerCase()) {
        throw httpError(503, "unexpected_repository_owner");
      }
      repoId = created.id;
      branch = created.default_branch || "main";
      await updateRow(env, userId, { repo_id: repoId, source_branch: branch });
    }
    const repoPath = githubRepoPath(env, name);
    const actual = await github(env, repoPath);
    if (actual?.id !== repoId || !actual.private) throw httpError(409, "repository_identity_mismatch");
    await putFile(env, repoPath, "main.tex", INITIAL_TEX_SOURCE, branch);
    await putFile(env, repoPath, "README.md", INITIAL_TEX_README, branch);
    await putFile(env, repoPath, MANAGED_TEX_WORKFLOW_PATH, MANAGED_TEX_WORKFLOW, branch);
    const head = await github(env, repoPath + "/git/ref/heads/" + encodeURIComponent(branch));
    try {
      await github(env, repoPath + "/git/refs", "POST", {
        ref: "refs/heads/pdf-output", sha: head.object.sha
      });
    } catch (error) {
      if (error.status !== 409) throw error;
      const exists = await github(env, repoPath + "/git/ref/heads/pdf-output");
      if (!exists?.object?.sha) throw httpError(503, "pdf_branch_missing");
    }
    await updateRow(env, userId, { repo_state: "ready", repo_id: repoId, source_branch: branch });
    return json({ created: true, repository_name: name }, 201);
  } catch (error) {
    workerLog("warn", "tex.github.provision.failed", {
      user_id: userId, code: String(error?.code || "unknown").slice(0, 50)
    });
    throw error;
  }
}

async function deleteRepository(request, env, userId) {
  const row = await readRow(env, userId);
  if (!row?.repo_id || !row.repo_name || !["ready", "deleting"].includes(row.repo_state)) {
    return fail(404, "There is no managed repository to delete.");
  }
  if (row.active_nonce) return fail(409, "Wait for the running compile job before deleting.");
  const body = await inputBody(request);
  if (body?.confirm !== "DELETE " + row.repo_name) return fail(400, "Exact repository name confirmation is required.");
  await updateRow(env, userId, { repo_state: "deleting" });
  const repoPath = githubRepoPath(env, row.repo_name);
  try {
    const actual = await github(env, repoPath);
    if (actual?.id !== row.repo_id || !actual.private) throw httpError(409, "repository_identity_mismatch");
    await github(env, repoPath, "DELETE");
  } catch (error) {
    if (error.status !== 404) throw error;
  }
  await updateRow(env, userId, {
    repo_name: null, repo_id: null, repo_state: "none", source_branch: "main",
    active_nonce: null, active_since: null
  });
  return json({ deleted: true });
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
  if (!row || row.approval_status !== "approved" || row.repo_state !== "ready" || !row.repo_id) {
    return fail(403, "A private repository and an approved quota are required.");
  }
  if (!hasStorageBinding(env)) return fail(503, "Document storage unavailable.");
  const body = await inputBody(request);
  const docId = String(body?.document_id || "");
  if (!isStorageObjectId(docId)) return fail(400, "Select one of your saved TeX documents.");
  const object = await env.STORAGE.get("_system/tex-documents/" + userId + "/" + docId + ".json");
  if (!object) return fail(404, "Document not found in this account.");
  const doc = JSON.parse(await object.text());
  if (doc?.owner_id !== userId || doc?.id !== docId || typeof doc.source !== "string") {
    return fail(403, "Document is not owned by this account.");
  }
  if (!doc.source.trim() || doc.source.length > MAX_SOURCE || doc.engine !== "xelatex") {
    return fail(400, "GitHub builds currently require a XeLaTeX document under 160,000 characters.");
  }
  const nonce = crypto.randomUUID();
  const remaining = await reserveCredit(env, userId, nonce);
  if (remaining === null) return fail(429, "No available credit or another build is active.");
  try {
    const repoPath = githubRepoPath(env, row.repo_name);
    const actual = await github(env, repoPath);
    if (actual?.id !== row.repo_id || !actual.private) throw httpError(409, "repository_identity_mismatch");
    await putFile(env, repoPath, "main.tex", doc.source, row.source_branch || "main");
    await github(env, repoPath + "/actions/workflows/aertex-compile.yml/dispatches", "POST", {
      ref: row.source_branch || "main"
    });
    await updateRow(env, userId, { last_run_at: new Date().toISOString() });
    return json({ queued: true, remaining, document_id: docId }, 202);
  } catch (error) {
    await releaseCredit(env, userId, nonce, true).catch(() => {});
    throw error;
  }
}

async function listRuns(env, userId) {
  const row = await readRow(env, userId);
  if (!row?.repo_id || row.repo_state !== "ready") return json({ runs: [], active: false });
  const repoPath = githubRepoPath(env, row.repo_name);
  const dataObject = await github(env,
    repoPath + "/actions/workflows/aertex-compile.yml/runs?event=workflow_dispatch&per_page=8");
  const runs = Array.isArray(dataObject?.workflow_runs) ? dataObject.workflow_runs : [];
  const normalized = runs.map(run => ({
    id: run.id, status: run.status, conclusion: run.conclusion,
    created_at: run.created_at, updated_at: run.updated_at
  }));
  if (row.active_nonce && normalized.some(run =>
    run.status === "completed" && Date.parse(run.created_at) >= Date.parse(row.active_since || "") - MINUTE
  )) {
    await releaseCredit(env, userId, row.active_nonce, false).catch(() => {});
  }
  return json({ runs: normalized, active: Boolean(row.active_nonce) &&
    !normalized.some(run => run.status === "completed" &&
      Date.parse(run.created_at) >= Date.parse(row.active_since || "") - MINUTE) });
}

function base64Bytes(data) {
  const string = atob(data.replace(/\s+/g, ""));
  const out = new Uint8Array(string.length);
  for (let i = 0; i < string.length; i++) out[i] = string.charCodeAt(i);
  return out;
}

async function servePdf(env, userId, download) {
  const row = await readRow(env, userId);
  if (!row?.repo_id || row.repo_state !== "ready") return fail(404, "There is no compiled PDF.");
  const repoPath = githubRepoPath(env, row.repo_name);
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
  return new Response(bytes, {
    headers: {
      "content-type": "application/pdf",
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
      "content-disposition": (download ? "attachment" : "inline") + "; filename=\"aertex-main.pdf\""
    }
  });
}
