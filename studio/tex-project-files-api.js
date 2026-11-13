// Add bounded project files to the authenticated user's existing TeX document.
// The caller's userId is supplied by the existing session/CSRF gate in tex-api-core.js.
import { json } from "./routing.js";
import { isStorageObjectId } from "./storage-api.js";
import { workerLog } from "./server-runtime.js";
import { MAX_PROJECT_EXTRA_FILES, MAX_PROJECT_FILES, MAX_PROJECT_BYTES, MAX_SINGLE_FILE_BYTES, MAX_JSON_UPLOAD_BYTES, MAX_TEXT_CHARACTERS, isSafeProjectFilename, isBinaryProjectFile } from "./tex-project-file-types.js";

const DOCUMENT_ROOT = "_system/tex-documents/";
const BINARY = { test: isBinaryProjectFile };
const MAX_FILES = MAX_PROJECT_EXTRA_FILES;
const MAX_SINGLE_BYTES = MAX_SINGLE_FILE_BYTES;
const MAX_TOTAL_BYTES = MAX_PROJECT_BYTES;
const MAX_JSON_BYTES = MAX_JSON_UPLOAD_BYTES;
const MAX_TEXT_CHARS = MAX_TEXT_CHARACTERS;
const encoder = new TextEncoder();

function fail(message, status = 400) { return json({ error: message }, status); }
const validName=isSafeProjectFilename;
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
  if (bytes.byteLength > MAX_SINGLE_BYTES) throw new Error("A file cannot exceed 8 MB.");
  if (binary) {
    const ext = value.name.split(".").pop().toLowerCase();
    const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const png = bytes.length >= 8 && [137,80,78,71,13,10,26,10].every((x,i)=>bytes[i]===x);
    const pdf = bytes.length >= 5 && [37,80,68,70,45].every((x,i)=>bytes[i]===x);
    const zip = bytes.length>=4 && bytes[0]===0x50 && bytes[1]===0x4b &&
      [0x03,0x05,0x07].includes(bytes[2]);
    const ole = bytes.length>=8 && [0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1].every((b,i)=>bytes[i]===b);
    const gif = bytes.length>=6 && ["GIF87a","GIF89a"].includes(String.fromCharCode(...bytes.subarray(0,6)));
    const webp = bytes.length>=12 && String.fromCharCode(...bytes.subarray(0,4))==="RIFF" &&
      String.fromCharCode(...bytes.subarray(8,12))==="WEBP";
    const officeZip = new Set(["docx","docm","dotx","xlsx","xlsm","xlsb","pptx","pptm","potx","odt","ods","odp","epub","jar","war","ear","zip"]);
    const legacyOffice = new Set(["doc","dot","xls","ppt"]);
    if (((ext==="png"&&!png)||(["jpg","jpeg"].includes(ext)&&!jpeg)||
         (ext==="pdf"&&!pdf)||(ext==="gif"&&!gif)||(ext==="webp"&&!webp)||
         (officeZip.has(ext)&&!zip&&!(ext==="xlsb"&&ole))||
         (legacyOffice.has(ext)&&!ole))) {
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
  const operation = input?.operation || "add";
  const modifyingEntry = operation === "rename" || operation === "delete";
  if (!modifyingEntry && (!Array.isArray(input?.files) || !input.files.length || input.files.length > MAX_FILES)) {
    return fail("Select between 1 and 499 supporting files.");
  }
  const key = DOCUMENT_ROOT + userId + "/" + documentId + ".json";
  try {
    const stored = await env.STORAGE.get(key);
    if (!stored) return fail("Project not found or unavailable for editing.", 404);
    const doc = JSON.parse(await stored.text());
    if (doc?.id !== documentId || doc?.owner_id !== userId) return fail("Project not found.", 404);
    if (doc.locked) return fail("Unlock the project before modifying files.", 423);
    const lockedNames = new Set(Array.isArray(doc.locked_files) ? doc.locked_files : []);
    const lockedFolders = Array.isArray(doc.locked_folders) ? doc.locked_folders : [];
    const isLocked = name => lockedNames.has(name) ||
      lockedFolders.some(folder => name === folder || name.startsWith(folder + "/"));
    const existing = Array.isArray(doc.files) ? doc.files : [];
    if (existing.length > MAX_FILES) return fail("Project file limit reached.", 409);
    if (!existing.every(f=>validName(f.name) && ["utf8","base64"].includes(f.encoding))) {
      return fail("This project's stored file list is invalid.", 409);
    }
    const entryName = doc.main_deleted === true ? "" : (typeof doc.main_filename === "string" && doc.main_filename ? doc.main_filename : "main.tex");
    let added = [];
    let next;
    if (modifyingEntry) {
      const oldName = input.name;
      if (!validName(oldName)) return fail("Invalid file name.");
      const entry = Boolean(entryName && oldName === entryName);
      const index = existing.findIndex(file => file.name === oldName);
      if (!entry && index < 0) return fail("File not found.", 404);
      if (isLocked(oldName) || (entry && isLocked("main.tex")))
        return fail("Unlock this file before changing it.", 423);
      if (operation === "delete") {
        if (entry) {
          // The canonical TeX compiler still uses an internal main.tex. Deleting
          // the visible entry removes its source and hides it until a new root
          // .tex file is added; it never silently deletes the entire project.
          doc.main_deleted = true;
          doc.source = "";
          doc.main_filename = "main.tex";
        }
        next = entry ? existing : existing.filter((_, i) => i !== index);
      } else {
        const newName = input.new_name;
        if (!validName(newName) || isLocked(newName) ||
            existing.some((file, i) => i !== index && file.name.toLowerCase() === newName.toLowerCase()) ||
            (!entry && newName.toLowerCase() === entryName.toLowerCase()) ||
            (!entry && newName.toLowerCase() === "main.tex")) {
          return fail("Invalid or duplicate destination filename.", 409);
        }
        if (entry) {
          // Keep the root TeX entry as a .tex document; the display name is
          // persisted while the local/compiler API retains main.tex internally.
          if (!/^[^/\\]+\.tex$/i.test(newName)) return fail("The TeX entry filename must end in .tex and stay at the project root.");
          doc.main_filename = newName;
          doc.main_deleted = false;
          doc.pinned_files = (doc.pinned_files || []).map(name => name === oldName ? newName : name);
          doc.locked_files = (doc.locked_files || []).map(name => name === oldName ? newName : name);
          next = existing;
        } else {
          if (BINARY.test(newName) !== BINARY.test(oldName))
            return fail("Cannot rename a text file to a binary type or vice versa.", 400);
          next = existing.map((file, i) => i === index ? { ...file, name: newName } : file);
        }
      }
    } else {
      try { added = input.files.map(validatedFile); }
      catch (error) { return fail(error.message); }
      if (operation === "replace") {
        if (added.length !== 1) return fail("Replace exactly one file.");
        const index = existing.findIndex(f=>f.name === added[0].name);
        if (index < 0) return fail("The file to edit was not found.", 404);
        if (isLocked(added[0].name)) return fail("Unlock this file before editing.", 423);
        next = existing.map((f,i)=>i===index?added[0]:f);
      } else {
        if (operation !== "add") return fail("Unknown file operation.");
        const seen = new Set(["main.tex", ...(entryName ? [entryName.toLowerCase()] : []), ...existing.map(f=>f.name.toLowerCase())]);
        for (const f of added) {
          if (seen.has(f.name.toLowerCase())) return fail("File already exists: " + f.name, 409);
          if (isLocked(f.name)) return fail("The destination folder is locked.",423);
          seen.add(f.name.toLowerCase());
        }
        // After deleting the root entry, the next standalone .tex file
        // recreates the canonical compile entry without fabricating a file.
        const replacementEntry = doc.main_deleted === true && added.length === 1 &&
          /^[^/\\]+\.tex$/i.test(added[0].name) && !isLocked("main.tex");
        if (replacementEntry) {
          doc.source = added[0].content;
          doc.main_filename = added[0].name;
          doc.main_deleted = false;
          next = existing;
        } else {
          if (existing.length + added.length > MAX_FILES)
            return fail("A project can contain at most 500 files including the TeX entry.", 409);
          next = [...existing, ...added];
        }
      }
    }
    const total = encoder.encode(String(doc.source || "")).length +
      next.reduce((n,f)=>n+sizeOf(f),0);
    if (total > MAX_TOTAL_BYTES) return fail("Project file content cannot exceed 32 MB.", 413);
    doc.files = next;
    doc.updated_at = new Date().toISOString();
    await env.STORAGE.put(key, JSON.stringify(doc), {
      httpMetadata: { contentType:"application/json;charset=UTF-8" },
      customMetadata: {
        ownerId:userId, hidden:"true", kind:"tex-document",
        title:String(doc.title || "").slice(0,180),
        engine:String(doc.engine || "xelatex").slice(0,24),
        preview:String(doc.source || "").replace(/\s+/g," ").trim().slice(0,220),
        projectType:doc.project_type || "legacy",
        fileCount:String((doc.main_deleted ? 0 : 1)+doc.files.length),
        pinned:doc.pinned?"true":"false",locked:doc.locked?"true":"false",
        createdAt:doc.created_at || doc.updated_at,
        updatedAt:doc.updated_at
      }
    });
    return json({ document:doc, operation, added:added.map(x=>x.name) }, 200);
  } catch(error) {
    workerLog("error", "tex.files.add.failed", {
      user_id:userId, document_id:documentId,
      reason:String(error?.message || "unknown").slice(0,180)
    });
    return fail("Could not save files in this project.", 503);
  }
}
