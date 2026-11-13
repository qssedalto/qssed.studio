import { validateTexSourceSave, finalizeTexSourceSave } from "./tex-collaboration-save.js";
import { readJsonBounded } from "./request-json-bounded.js";
import { sourceInputError, isTexMainLocked, texDocumentRevision, putTexDocument, TEX_WRITE_CONFLICT, retireTexDocument, countLiveTexDocuments } from "./tex-document-guards.js";
import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { json } from "./routing.js";
import { verifyStudioApiSession, withStudioSessionCookies } from "./session-gate.js";
import { hasStorageBinding, isStorageObjectId } from "./storage-api.js";
import { workerLog } from "./server-runtime.js";
import { handleTexProjects } from "./tex-project-api.js";
import { handleTexProjectFiles } from "./tex-project-files-api.js";
import { reconcileTexMainEntry } from "./tex-main-entry.js";
import { texRealtimeEpoch } from "./tex-realtime-epoch.js";
import { handleTexOrganize, removeTexProjectPins } from "./tex-organize-api.js";
import { invalidateTexCollaboration } from "./tex-collaboration-invalidate.js";
import { purgeDocumentVersions } from "./tex-version-api.js";
import { handleTexArchive } from "./tex-archive-api.js";

const DOCUMENT_ROOT = "_system/tex-documents/";
const RUN_ROOT = "_system/tex-runs/";
const RESULT_ROOT = "_system/tex-results/";
const ENGINES = new Set(["xelatex", "lualatex", "pdflatex"]);
const MAX_DOCUMENTS = 120;
const MAX_RUNS = 300;
const MAX_SOURCE_CHARS = 180000;
const MAX_PAYLOAD_BYTES = 3 * 1024 * 1024;
const MAX_RESULT_BYTES = 16 * 1024 * 1024;

// 统一 TeX API 的会话与资源权限检查，再按文档、编译和运行结果分派；不能只因客户端知道文档 ID 就允许访问。
export async function handleTexApi(request, env, action) {
  const session = await verifyStudioApiSession(request);
  if (!session.ok) return withStudioSessionCookies(json({ error: "Authentication required." }, 401), session.cookies);

  const auth = await verifyTexUser(session.accessToken);
  if (auth.error) return withStudioSessionCookies(auth.error, session.cookies);

  if (isMutation(request.method) && !isSameOriginMutation(request)) {
    return withStudioSessionCookies(json({ error: "Cross-origin TeX writes are not allowed." }, 403), session.cookies);
  }

  let response;
  if (action === "status") response = handleStatus(request, env);
  else if (action === "documents") response = await handleDocuments(request, env, auth.user.id);
  else if (action === "projects") response = await handleTexProjects(request, env, auth.user.id, session.accessToken);
  else if (action === "files") response = await handleTexProjectFiles(request, env, auth.user.id);
  else if (action === "organize") response = await handleTexOrganize(request, env, auth.user.id);
  else if (action === "archive") response = await handleTexArchive(request, env, auth.user);
  else if (action === "runs") response = await handleRuns(request, env, auth.user.id);
  else if (action === "compile") response = await handleCompile(request, env, auth.user.id);
  else if (action === "result") response = await handleResult(request, env, auth.user.id);
  else response = json({ error: "Unknown TeX API action." }, 404);

  return withStudioSessionCookies(response, session.cookies);
}

export async function verifyTexUser(accessToken) {
  const token = String(accessToken || "").trim();
  if (!token) return { error: json({ error: "Authentication required." }, 401) };

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${token}`
  };

  let userResponse;
  try {
    userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers });
  } catch {
    return { error: json({ error: "Authentication service is temporarily unavailable." }, 503) };
  }

  if (userResponse.status === 401 || userResponse.status === 403) {
    return { error: json({ error: "Session is invalid or expired." }, 401) };
  }
  if (!userResponse.ok) {
    return { error: json({ error: "Authentication service is temporarily unavailable." }, 503) };
  }

  let user;
  try {
    user = await userResponse.json();
  } catch {
    return { error: json({ error: "Authentication service is temporarily unavailable." }, 503) };
  }
  if (!isStorageObjectId(user?.id)) {
    return { error: json({ error: "Session is invalid or expired." }, 401) };
  }

  let profiles;
  try {
    const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=status&id=eq.${encodeURIComponent(user.id)}`, { headers });
    if (profileResponse.status === 401 || profileResponse.status === 403) {
      return { error: json({ error: "Session is invalid or expired." }, 401) };
    }
    if (!profileResponse.ok) {
      return { error: json({ error: "Account service is temporarily unavailable." }, 503) };
    }
    profiles = await profileResponse.json();
  } catch {
    return { error: json({ error: "Account service is temporarily unavailable." }, 503) };
  }

  if (!Array.isArray(profiles) || profiles.length !== 1 || profiles[0]?.status !== "active") {
    return { error: json({ error: "Account is not authorized to use TeX storage." }, 403) };
  }

  return { user };
}

function handleStatus(request, env) {
  if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
  const compiler = compilerConfig(env);
  return json({
    storage_available: hasStorageBinding(env),
    compiler_available: compiler.available,
    engines: [...ENGINES],
    max_source_chars: MAX_SOURCE_CHARS,
    compiler_contract: 1
  });
}

async function handleDocuments(request, env, userId) {
  if (!hasStorageBinding(env)) return json({ error: "TeX storage is temporarily unavailable." }, 503);
  if (request.method === "GET") return getDocuments(request, env, userId);
  if (request.method === "POST") return createDocument(request, env, userId);
  if (request.method === "PUT") return updateDocument(request, env, userId);
  if (request.method === "DELETE") return deleteDocument(request, env, userId);
  return json({ error: "Method not allowed" }, 405);
}

async function handleRuns(request, env, userId) {
  if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
  if (!hasStorageBinding(env)) return json({ error: "TeX storage is temporarily unavailable." }, 503);
  const url = new URL(request.url);
  const documentId = cleanObjectId(url.searchParams.get("document"));
  try {
    const runs = [];
    let cursor;
    const prefix = documentId ? runDocumentPrefix(userId, documentId) : runUserPrefix(userId);
    do {
      const page = await env.STORAGE.list({ prefix, cursor, limit: 500, include: ["customMetadata"] });
      for (const object of page.objects) {
        const reference = parseRunKey(object.key, userId);
        if (!reference) continue;
        const run = runFromMetadata(object.customMetadata, userId, reference.documentId, reference.runId);
        if (run) runs.push(run);
        if (runs.length >= MAX_RUNS) break;
      }
      cursor = page.cursor;
      if (!page.truncated || !cursor || runs.length >= MAX_RUNS) break;
    } while (cursor);
    runs.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
    return json({ runs, count: runs.length, scope: "own" });
  } catch (error) {
    workerLog("error", "tex.runs.list.failed", { user_id: userId, message: String(error?.message || error) });
    return json({ error: "Could not load TeX compile history." }, 503);
  }
}

// TeX 编译需验证归属、输入与编译器可用性，记录运行状态和结果；不要把客户端 source 直接变成任意系统命令。
async function handleCompile(request, env, userId) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!hasStorageBinding(env)) return json({ error: "TeX storage is temporarily unavailable." }, 503);
  const parsed = await parsePayload(request);
  if (parsed.error) return parsed.error;
  const documentId = cleanObjectId(parsed.value?.document_id);
  if (!documentId) return json({ error: "Invalid TeX document identifier." }, 400);

  const document = await readDocument(env, userId, documentId);
  if (!document) return json({ error: "TeX document not found." }, 404);

  const runId = crypto.randomUUID();
  let run = createRun(userId, document, runId);
  await writeRun(env, run);

  const compiler = compilerConfig(env);
  if (!compiler.available) {
    run = finishRun(run, "unavailable", "The TeX compiler service is not connected yet.");
    await writeRun(env, run);
    return json({ error: "The TeX compiler service is not connected yet.", run }, 503);
  }

  try {
    const response = await fetch(compiler.url, {
      method: "POST",
      redirect: "error",
      headers: {
        "content-type": "application/json;charset=UTF-8",
        accept: "application/pdf",
        authorization: `Bearer ${compiler.token}`,
        "x-qsseda-tex-contract": "1"
      },
      body: JSON.stringify({
        contract: 1,
        job_id: runId,
        engine: document.engine,
        source: document.source,
        options: {
          shell_escape: false,
          network: false,
          max_runtime_seconds: 20,
          output: "pdf"
        }
      })
    });

    if (!response.ok) {
      const message = await safeCompilerMessage(response);
      run = finishRun(run, "failed", message || `Compiler returned HTTP ${response.status}.`);
      await writeRun(env, run);
      return json({ error: run.error, run }, 502);
    }

    const contentType = String(response.headers.get("content-type") || "").toLowerCase();
    if (!contentType.includes("application/pdf")) {
      run = finishRun(run, "failed", "Compiler response was not a PDF.");
      await writeRun(env, run);
      return json({ error: run.error, run }, 502);
    }

    const bytes = await response.arrayBuffer();
    if (!bytes.byteLength || bytes.byteLength > MAX_RESULT_BYTES) {
      run = finishRun(run, "failed", "Compiler result exceeded the allowed PDF size.");
      await writeRun(env, run);
      return json({ error: run.error, run }, 502);
    }

    await env.STORAGE.put(resultKey(userId, documentId, runId), bytes, {
      httpMetadata: { contentType: "application/pdf" },
      customMetadata: {
        ownerId: userId,
        hidden: "true",
        kind: "tex-result",
        documentId,
        runId,
        createdAt: run.created_at
      }
    });
    run = finishRun(run, "success", "", true, bytes.byteLength);
    await writeRun(env, run);
    return json({ run, result_url: resultUrl(documentId, runId) });
  } catch (error) {
    workerLog("error", "tex.compile.failed", { user_id: userId, document_id: documentId, message: String(error?.message || error) });
    run = finishRun(run, "failed", "The TeX compiler could not be reached.");
    await writeRun(env, run).catch(() => {});
    return json({ error: run.error, run }, 502);
  }
}

async function handleResult(request, env, userId) {
  if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
  if (!hasStorageBinding(env)) return json({ error: "TeX storage is temporarily unavailable." }, 503);
  const url = new URL(request.url);
  const documentId = cleanObjectId(url.searchParams.get("document"));
  const runId = cleanObjectId(url.searchParams.get("run"));
  if (!documentId || !runId) return json({ error: "Invalid TeX result identifier." }, 400);
  const object = await env.STORAGE.get(resultKey(userId, documentId, runId));
  if (!object) return json({ error: "TeX result not found." }, 404);
  return new Response(object.body, {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="qsseda-tex-${runId.slice(0, 8)}.pdf"`,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff"
    }
  });
}

async function getDocuments(request, env, userId) {
  const url = new URL(request.url);
  const documentId = cleanObjectId(url.searchParams.get("id"));
  if (documentId) {
    const document = await readDocument(env, userId, documentId);
    return document ? json({ document }) : json({ error: "TeX document not found." }, 404);
  }

  try {
    const documents = [];
    let cursor;
    do {
      const page = await env.STORAGE.list({ prefix: documentPrefix(userId), cursor, limit: 500, include: ["customMetadata"] });
      for (const object of page.objects) {
        const reference = parseDocumentKey(object.key, userId);
        if (!reference) continue;
        const summary = documentFromMetadata(object.customMetadata, userId, reference.documentId);
        if (summary) documents.push(summary);
        if (documents.length >= MAX_DOCUMENTS) break;
      }
      cursor = page.cursor;
      if (!page.truncated || !cursor || documents.length >= MAX_DOCUMENTS) break;
    } while (cursor);
    documents.sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")));
    return json({ documents, count: documents.length, scope: "own" });
  } catch (error) {
    workerLog("error", "tex.documents.list.failed", { user_id: userId, message: String(error?.message || error) });
    return json({ error: "Could not load TeX documents." }, 503);
  }
}

async function createDocument(request, env, userId) {
  const parsed = await parsePayload(request);
  if (parsed.error) return parsed.error;
  const documentId = crypto.randomUUID();
  const normalized = normalizeDocument(parsed.value, userId, documentId, null);
  if (!normalized.ok) return json({ error: normalized.error }, 400);
  try {
    if (await countLiveTexDocuments(env.STORAGE, documentPrefix(userId), MAX_DOCUMENTS) >= MAX_DOCUMENTS) return json({ error: "TeX document limit reached." }, 409);
    await writeDocument(env, normalized.value);
    return json({ document: normalized.value, created: true }, 201);
  } catch (error) {
    workerLog("error", "tex.document.create.failed", { user_id: userId, message: String(error?.message || error) });
    return json({ error: "Could not create TeX document." }, 503);
  }
}

async function updateDocument(request, env, userId) {
  const documentId = cleanObjectId(new URL(request.url).searchParams.get("id"));
  if (!documentId) return json({ error: "Invalid TeX document identifier." }, 400);
  const parsed = await parsePayload(request);
  if (parsed.error) return parsed.error;
  try {
    const previous = await readDocument(env, userId, documentId);
    if (!previous) return json({ error: "TeX document not found." }, 404);
    if (previous.main_deleted === true) return json({error:"This project has no TeX entry. Add a root .tex file before editing the main source."},409);
    // An older tab must not overwrite a replacement of main.tex with its
    // own stale autosave payload. Only a freshly opened revision may write.
    if ((typeof parsed.value?.realtime_epoch !== "string" || texRealtimeEpoch(parsed.value.realtime_epoch) !== texRealtimeEpoch(previous)))
      return json({ error: "This project's main TeX file changed. Reopen it before saving; your older editor has not overwritten the new version.", code: "main_revision_changed" }, 409);
    if (isTexMainLocked(previous))
      return json({ error: "Unlock main.tex or the project before editing.", }, 423);
    const normalized = normalizeDocument(parsed.value, userId, documentId, previous);
    if (!normalized.ok) return json({ error: normalized.error }, 400);
    const savePlan = await validateTexSourceSave(env, previous, parsed.value, normalized.value);
    await writeDocument(env, normalized.value, previous.storage_revision);
    await finalizeTexSourceSave(env, previous, savePlan);
    return json({ document: normalized.value, saved: true });
  } catch (error) {
    if ([400, 409, 413, 423, 428].includes(error?.status)) return json({ error: error.message, code: error.code }, error.status);
    workerLog("error", "tex.document.update.failed", { user_id: userId, document_id: documentId, message: String(error?.message || error) });
    return json({ error: "Could not save TeX document." }, 503);
  }
}

async function deleteDocument(request, env, userId) {
  const documentId = cleanObjectId(new URL(request.url).searchParams.get("id"));
  if (!documentId) return json({ error: "Invalid TeX document identifier." }, 400);
  try {
    const existing = await readDocument(env,userId,documentId);
    if (!existing) return json({ error: "TeX document not found." }, 404);
    if (isTexMainLocked(existing) || existing.locked_files?.length || existing.locked_folders?.length)
      return json({ error: "Unlock the project and its files before deleting." }, 423);
    await retireTexDocument(env.STORAGE, documentKey(userId, documentId), existing);
    await invalidateTexCollaboration(env,userId,documentId,"source-retired","",texRealtimeEpoch(existing));
    await removeTexProjectPins(env,userId,documentId);
    await purgeDocumentArtifacts(env, userId, documentId);
    await purgeDocumentVersions(env,userId,documentId);
    return json({ deleted: true, id: documentId });
  } catch (error) {
    if (error?.code === TEX_WRITE_CONFLICT) return json({error:error.message,code:error.code},409);
    workerLog("error", "tex.document.delete.failed", { user_id: userId, document_id: documentId, message: String(error?.message || error) });
    return json({ error: "Could not delete TeX document." }, 503);
  }
}

async function purgeDocumentArtifacts(env, userId, documentId) {
  let cursor;
  do {
    const page = await env.STORAGE.list({ prefix: runDocumentPrefix(userId, documentId), cursor, limit: 500 });
    for (const object of page.objects) {
      const reference = parseRunKey(object.key, userId);
      if (!reference) continue;
      await env.STORAGE.delete(object.key);
      await env.STORAGE.delete(resultKey(userId, documentId, reference.runId));
    }
    cursor = page.cursor;
    if (!page.truncated || !cursor) break;
  } while (cursor);
}

async function writeDocument(env, document, previousRevision = null) {
  await putTexDocument(env.STORAGE, documentKey(document.owner_id, document.id), document, {
    httpMetadata: { contentType: "application/json;charset=UTF-8" },
    customMetadata: documentMetadata(document)
  }, previousRevision);
}

async function readDocument(env, userId, documentId) {
  const object = await env.STORAGE.get(documentKey(userId, documentId));
  if (!object) return null;
  try {
    const parsed = JSON.parse(await object.text());
    if (!parsed || parsed.document_deleted || parsed.owner_id !== userId || parsed.id !== documentId) return null;
    // GET/compile/edit must agree on the same canonical entry. Historical
    // multi-file uploads could store main.tex as an extra while leaving the
    // main_deleted tombstone set. Recover only that real stored file, never
    // the old erased source. An explicit subsequent save persists the fix.
    const recovered = reconcileTexMainEntry(parsed);
    const normalized = normalizeDocument(recovered, userId, documentId, recovered, true);
    if (!normalized.ok) return null;
    normalized.value.created_at = cleanTimestamp(parsed.created_at);
    normalized.value.updated_at = cleanTimestamp(parsed.updated_at);
    return texDocumentRevision(normalized.value, object);
  } catch {
    return null;
  }
}

function normalizeDocument(input, userId, documentId, previous, storedRead = false) {
  const inputError = storedRead ? "" : sourceInputError(input);
  if (inputError) return { ok: false, error: inputError };
  const source = input && typeof input === "object" ? input : {};
  const engine = cleanText(source.engine, 24) || previous?.engine || "xelatex";
  if (!ENGINES.has(engine)) return { ok: false, error: "Unsupported TeX engine." };
  const now = new Date().toISOString();
  return {
    ok: true,
    value: {
      id: documentId,
      owner_id: userId,
      title: cleanText(source.title, 180) || "Untitled TeX document",
      engine,
      source: cleanSource(source.source),
      realtime_epoch: texRealtimeEpoch(previous),
      main_filename: previous?.main_filename || "main.tex",
      main_deleted: previous?.main_deleted === true,
      files: Array.isArray(previous?.files) ? previous.files : [],
      project_type: previous?.project_type || "legacy",
      pinned: previous?.pinned === true, locked: previous?.locked === true,
      pinned_files: Array.isArray(previous?.pinned_files) ? previous.pinned_files : [],
      locked_files: Array.isArray(previous?.locked_files) ? previous.locked_files : [],
      pinned_folders: Array.isArray(previous?.pinned_folders) ? previous.pinned_folders : [],
      locked_folders: Array.isArray(previous?.locked_folders) ? previous.locked_folders : [],
      created_at: previous?.created_at || now,
      updated_at: now
    }
  };
}

async function writeRun(env, run) {
  await env.STORAGE.put(runKey(run.owner_id, run.document_id, run.id), JSON.stringify(run), {
    httpMetadata: { contentType: "application/json;charset=UTF-8" },
    customMetadata: runMetadata(run)
  });
}

function createRun(userId, document, runId) {
  const now = new Date().toISOString();
  return {
    id: runId,
    owner_id: userId,
    document_id: document.id,
    document_title: document.title,
    engine: document.engine,
    status: "running",
    error: "",
    result_available: false,
    result_bytes: 0,
    created_at: now,
    completed_at: ""
  };
}

function finishRun(run, status, error = "", resultAvailable = false, resultBytes = 0) {
  return {
    ...run,
    status,
    error: cleanText(error, 800),
    result_available: Boolean(resultAvailable),
    result_bytes: Number(resultBytes) || 0,
    completed_at: new Date().toISOString()
  };
}

function documentMetadata(document) {
  return {
    ownerId: document.owner_id,
    hidden: "true",
    kind: "tex-document",
    title: document.title,
    engine: document.engine,
    preview: document.source.replace(/\s+/g, " ").trim().slice(0, 220),
    projectType: document.project_type || "legacy",
    fileCount: String(1+(document.files?.length||0)),
    pinned: document.pinned ? "true" : "false",
    locked: document.locked ? "true" : "false",
    createdAt: document.created_at,
    updatedAt: document.updated_at,
    realtimeEpoch: texRealtimeEpoch(document)
  };
}

function documentFromMetadata(meta, userId, documentId) {
  if (!meta || meta.kind !== "tex-document" || meta.ownerId !== userId) return null;
  const engine = ENGINES.has(meta.engine) ? meta.engine : "xelatex";
  return {
    id: documentId,
    title: cleanText(meta.title, 180),
    engine,
    preview: cleanText(meta.preview, 220),
    file_count: Math.max(1,Math.min(25,Number(meta.fileCount)||1)),
    project_type: cleanText(meta.projectType,24)||"legacy",
    pinned: meta.pinned === "true",
    locked: meta.locked === "true",
    created_at: cleanTimestamp(meta.createdAt),
    updated_at: cleanTimestamp(meta.updatedAt)
  };
}

function runMetadata(run) {
  return {
    ownerId: run.owner_id,
    hidden: "true",
    kind: "tex-run",
    runId: run.id,
    documentId: run.document_id,
    documentTitle: run.document_title,
    engine: run.engine,
    status: run.status,
    error: run.error,
    resultAvailable: run.result_available ? "true" : "false",
    resultBytes: String(run.result_bytes || 0),
    createdAt: run.created_at,
    completedAt: run.completed_at
  };
}

function runFromMetadata(meta, userId, documentId, runId) {
  if (!meta || meta.kind !== "tex-run" || meta.ownerId !== userId || meta.documentId !== documentId || meta.runId !== runId) return null;
  return {
    id: runId,
    document_id: documentId,
    document_title: cleanText(meta.documentTitle, 180),
    engine: ENGINES.has(meta.engine) ? meta.engine : "xelatex",
    status: cleanRunStatus(meta.status),
    error: cleanText(meta.error, 800),
    result_available: meta.resultAvailable === "true",
    result_bytes: Math.max(0, Number(meta.resultBytes) || 0),
    created_at: cleanTimestamp(meta.createdAt),
    completed_at: meta.completedAt ? cleanTimestamp(meta.completedAt) : "",
    result_url: meta.resultAvailable === "true" ? resultUrl(documentId, runId) : ""
  };
}

async function parsePayload(request) {
  try { return { value: await readJsonBounded(request, MAX_PAYLOAD_BYTES) }; }
  catch (error) { return { error: json({ error: error?.status === 413 ? "TeX payload is too large." : "Invalid TeX payload." }, error?.status === 413 ? 413 : 400) }; }
}

function compilerConfig(env) {
  const rawUrl = String(env?.TEX_COMPILER_URL || "").trim();
  const token = String(env?.TEX_COMPILER_TOKEN || "").trim();
  if (!rawUrl || token.length < 16) return { available: false, url: "", token: "" };
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) return { available: false, url: "", token: "" };
    return { available: true, url: parsed.toString(), token };
  } catch {
    return { available: false, url: "", token: "" };
  }
}

async function safeCompilerMessage(response) {
  try {
    const text = await response.text();
    return cleanText(text, 800);
  } catch {
    return "";
  }
}

function isMutation(method) {
  return method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";
}

function isSameOriginMutation(request) {
  const requestOrigin = new URL(request.url).origin;
  const origin = request.headers.get("Origin");
  if (origin) {
    try { return new URL(origin).origin === requestOrigin; } catch { return false; }
  }
  const fetchSite = String(request.headers.get("Sec-Fetch-Site") || "").toLowerCase();
  return fetchSite === "same-origin" || fetchSite === "same-site";
}

function cleanSource(value) {
  return String(value ?? "");
}

function cleanText(value, maximum) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maximum);
}

function cleanTimestamp(value) {
  const timestamp = Date.parse(String(value || ""));
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : new Date(0).toISOString();
}

function cleanRunStatus(value) {
  return ["running", "success", "failed", "unavailable"].includes(value) ? value : "failed";
}

function cleanObjectId(value) {
  const text = String(value || "").trim();
  return isStorageObjectId(text) ? text : "";
}

function documentPrefix(userId) {
  return `${DOCUMENT_ROOT}${userId}/`;
}

function documentKey(userId, documentId) {
  return `${documentPrefix(userId)}${documentId}.json`;
}

function runUserPrefix(userId) {
  return `${RUN_ROOT}${userId}/`;
}

function runDocumentPrefix(userId, documentId) {
  return `${runUserPrefix(userId)}${documentId}/`;
}

function runKey(userId, documentId, runId) {
  return `${runDocumentPrefix(userId, documentId)}${runId}.json`;
}

function resultKey(userId, documentId, runId) {
  return `${RESULT_ROOT}${userId}/${documentId}/${runId}.pdf`;
}

function parseDocumentKey(key, expectedOwnerId) {
  const parts = String(key || "").split("/");
  if (parts.length !== 4 || parts[0] !== "_system" || parts[1] !== "tex-documents" || parts[2] !== expectedOwnerId || !parts[3].endsWith(".json")) return null;
  const documentId = parts[3].slice(0, -5);
  return isStorageObjectId(documentId) ? { documentId } : null;
}

function parseRunKey(key, expectedOwnerId) {
  const parts = String(key || "").split("/");
  if (parts.length !== 5 || parts[0] !== "_system" || parts[1] !== "tex-runs" || parts[2] !== expectedOwnerId || !parts[4].endsWith(".json")) return null;
  const documentId = parts[3];
  const runId = parts[4].slice(0, -5);
  return isStorageObjectId(documentId) && isStorageObjectId(runId) ? { documentId, runId } : null;
}

function resultUrl(documentId, runId) {
  return `/api/tex/result?document=${encodeURIComponent(documentId)}&run=${encodeURIComponent(runId)}`;
}
