// Add bounded project files to the authenticated user's existing TeX document.
// The caller's userId is supplied by the existing session/CSRF gate in tex-api-core.js.
import { json } from "./routing.js";
import { isStorageObjectId } from "./storage-api.js";
import { workerLog } from "./server-runtime.js";

const DOCUMENT_ROOT = "_system/tex-documents/";
const ALLOWED = /\.(tex|bib|sty|cls|bst|txt|png|jpe?g|pdf)$/i;
const BINARY = /\.(png|jpe?g|pdf)$/i;
const MAX_FILES = 24; // extras; main.tex is the 25th entry
const MAX_SINGLE_BYTES = 3 * 1024 * 1024;
const MAX_TOTAL_BYTES = 4 * 1024 * 1024;
const MAX_JSON_BYTES = 5 * 1024 * 1024;
const MAX_TEXT_CHARS = 180000;
const encoder = new TextEncoder();

function fail(message, status = 400) { return json({ error: message }, status); }
function validName(value) {
  if (typeof value !== "string" || value.length > 140 || !value ||
      value.startsWith("/") || value.includes("\\") || /[\x00-\x1f\x7f]/.test(value) ||
      !ALLOWED.test(value)) return false;
  const parts = value.split("/");
  return parts.length <= 8 && parts.every(part => part && part !== "." && part !== ".." &&
    !part.startsWith(".") && part.length <= 100);
}
function sizeOf(file) {
  if (file.encoding === "base64") return Math.floor(String(file.content || "").length * 3 / 4);
  return encoder.encode(String(file.content || "")).byteLength;
}
function validatedFile(value) {
  if (!value || !validName(value.name)) throw new Error("Invalid filename or unsupported file type.");
  const binary = BINARY.test(value.name);
  if (binary && value.encoding !== "base64") throw new Error("Binary files must use base64 encoding.");
  if (!binary && value.encoding !== "utf8") throw new Error("Text files must use UTF-8.");
  if (typeof value.content !== "string") throw new Error("File content is missing.");
  if (!binary && value.content.length > MAX_TEXT_CHARS) throw new Error("Text file is too large.");
  let bytes;
  if (binary) {
    if (value.content.length > Math.ceil(MAX_SINGLE_BYTES * 4 / 3) + 4 ||
        !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value.content)) {
      throw new Error("Invalid base64 file content.");
    }
    try { bytes = Uint8Array.from(atob(value.content), c => c.charCodeAt(0)); }
    catch { throw new Error("Invalid base64 file content."); }
  } else bytes = encoder.encode(value.content);
  if (bytes.byteLength > MAX_SINGLE_BYTES) throw new Error("A file cannot exceed 3 MB.");
  if (binary) {
    const ext = value.name.split(".").pop().toLowerCase();
    const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const png = bytes.length >= 8 && [137,80,78,71,13,10,26,10].every((x,i)=>bytes[i]===x);
    const pdf = bytes.length >= 5 && [37,80,68,70,45].every((x,i)=>bytes[i]===x);
    if (!((ext === "png" && png) || ((ext === "jpg" || ext === "jpeg") && jpeg) || (ext === "pdf" && pdf))) {
      throw new Error("File content does not match its extension.");
    }
  }
  return { name:value.name, encoding:value.encoding, content:value.content };
}

export async function handleTexProjectFiles(request, env, userId) {
  if (request.method !== "POST") return fail("Method not allowed.", 405);
  if (!env?.STORAGE) return fail("Project storage unavailable.", 503);
  const reported = Number(request.headers.get("content-length") || 0);
  if (reported > MAX_JSON_BYTES) return fail("File upload request is too large.", 413);
  let input;
  try {
    const raw = await request.text();
    if (encoder.encode(raw).length > MAX_JSON_BYTES) return fail("File upload request is too large.", 413);
    input = JSON.parse(raw);
  } catch { return fail("Invalid file upload request."); }
  const documentId = input?.document_id;
  if (!isStorageObjectId(documentId)) return fail("Select a project first.");
  if (!Array.isArray(input?.files) || !input.files.length || input.files.length > MAX_FILES) {
    return fail("Select between 1 and 24 files.");
  }
  const key = DOCUMENT_ROOT + userId + "/" + documentId + ".json";
  try {
    const stored = await env.STORAGE.get(key);
    if (!stored) return fail("Project not found or unavailable for editing.", 404);
    const doc = JSON.parse(await stored.text());
    if (doc?.id !== documentId || doc?.owner_id !== userId) return fail("Project not found.", 404);
    const existing = Array.isArray(doc.files) ? doc.files : [];
    if (existing.length > MAX_FILES) return fail("Project file limit reached.", 409);
    if (!existing.every(f=>validName(f.name) && ["utf8","base64"].includes(f.encoding))) {
      return fail("This project's stored file list is invalid.", 409);
    }
    let added;
    try { added = input.files.map(validatedFile); }
    catch (error) { return fail(error.message); }
    const seen = new Set(["main.tex", ...existing.map(f=>f.name.toLowerCase())]);
    for (const f of added) {
      if (seen.has(f.name.toLowerCase())) return fail("File already exists: " + f.name, 409);
      seen.add(f.name.toLowerCase());
    }
    if (existing.length + added.length > MAX_FILES) return fail("A project can contain at most 25 files including main.tex.", 409);
    const total = encoder.encode(String(doc.source || "")).length +
      [...existing,...added].reduce((n,f)=>n+sizeOf(f),0);
    if (total > MAX_TOTAL_BYTES) return fail("Project file content cannot exceed 4 MB.", 413);
    doc.files = [...existing, ...added];
    doc.updated_at = new Date().toISOString();
    await env.STORAGE.put(key, JSON.stringify(doc), {
      httpMetadata: { contentType:"application/json;charset=UTF-8" },
      customMetadata: {
        ownerId:userId, hidden:"true", kind:"tex-document",
        title:String(doc.title || "").slice(0,180),
        engine:String(doc.engine || "xelatex").slice(0,24),
        preview:String(doc.source || "").replace(/\s+/g," ").trim().slice(0,220),
        projectType:doc.project_type || "legacy",
        fileCount:String(1+doc.files.length),
        createdAt:doc.created_at || doc.updated_at,
        updatedAt:doc.updated_at
      }
    });
    return json({ document:doc, added:added.map(x=>x.name) }, 200);
  } catch(error) {
    workerLog("error", "tex.files.add.failed", {
      user_id:userId, document_id:documentId,
      reason:String(error?.message || "unknown").slice(0,180)
    });
    return fail("Could not save files in this project.", 503);
  }
}
