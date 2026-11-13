import { isTexMainLocked, sourceInputError, countLiveTexDocuments } from "./tex-document-guards.js";
import { texRealtimeEpoch, texRealtimeRoomName } from "./tex-realtime-epoch.js";
import { verifyNativeAppSession, nativeJson } from "./native-mobile-auth.js";
import { snapshotDocumentVersion } from "./tex-version-api.js";

// The native Work editor operates only on its owner's TeX documents.
// Collaborative/ACL-based editing, PDF compilation and rich previews remain
// on work.qsseda.com until those contracts have device-specific coverage.
const ROOT = "_system/tex-documents/";
const ENGINES = new Set(["xelatex", "lualatex", "pdflatex"]);
const MAX_SOURCE = 180000;
const MAX_BODY = 512 * 1024;

function validId(id) { return /^[0-9a-f-]{36}$/i.test(id || ""); }
function key(userId, docId) { return ROOT + userId + "/" + docId + ".json"; }
function metadata(doc) {
  return { ownerId: doc.owner_id, hidden: "true", kind: "tex-document",
    title: doc.title, engine: doc.engine, preview: doc.source.replace(/\s+/g, " ").slice(0,220),
    createdAt: doc.created_at, updatedAt: doc.updated_at,
    projectType: doc.project_type || "legacy", fileCount: String((doc.main_deleted ? 0 : 1) + (doc.files?.length || 0)),
    pinned: doc.pinned ? "true" : "false", locked: doc.locked ? "true" : "false",
    realtimeEpoch: texRealtimeEpoch(doc),mainLocked:isTexMainLocked(doc)?"true":"false" };
}
function summary(doc) {
  return { id: doc.id, title: doc.title, engine: doc.engine,
    preview: doc.preview || (doc.source || "").replace(/\s+/g," ").slice(0,220),
    created_at: doc.created_at, updated_at: doc.updated_at };
}

export async function handleNativeWorkDocuments(request, env) {
  const session = await verifyNativeAppSession(request);
  if (!session.ok) return session.response;
  const userId = session.user.id;
  if (!env?.STORAGE?.get || !env?.STORAGE?.put || !env?.STORAGE?.list) {
    return nativeJson({ error: "Work storage is unavailable." }, 503);
  }
  const id = new URL(request.url).searchParams.get("id") || "";
  if (id && !validId(id)) return nativeJson({ error: "Invalid document identifier." }, 400);
  try {
    if (request.method === "GET" && id) {
      const obj = await env.STORAGE.get(key(userId, id));
      if (!obj) return nativeJson({ error: "Document not found." }, 404);
      const doc = JSON.parse(await obj.text());
      if (doc.document_deleted || doc.owner_id !== userId || doc.id !== id) return nativeJson({ error: "Document not found." }, 404);
      if (new URL(request.url).searchParams.get("view") === "versions") {
        // Existing website version snapshots live in the same owner-prefixed R2
        // store. Return bounded, metadata-only history, no source or PDF data.
        const prefix = "_system/tex-versions/" + userId + "/" + id + "/";
        const versionId = new URL(request.url).searchParams.get("version");
        if (versionId !== null) {
          if (!validId(versionId)) return nativeJson({ error: "Invalid version id." }, 400);
          const historic = await env.STORAGE.get(prefix + versionId + ".json");
          if (!historic) return nativeJson({ error: "Version not found." }, 404);
          const stored = JSON.parse(await historic.text());
          if (stored?.owner_id !== userId || stored?.document_id !== id ||
              stored?.id !== versionId || typeof stored?.source !== "string" ||
              stored.source.length > MAX_SOURCE) {
            return nativeJson({ error: "Version not found." }, 404);
          }
          return nativeJson({
            readonly: true,
            version: {
              id: versionId, document_id: id,
              title: String(stored.title || doc.title).slice(0, 180),
              engine: ENGINES.has(stored.engine) ? stored.engine : "xelatex",
              source: stored.source,
              reason: String(stored.reason || "manual").slice(0, 50),
              created_at: stored.created_at || null
            }
          });
        }
        const versions = [];
        let cursor;
        do {
          const page = await env.STORAGE.list({
            prefix, limit: 500, cursor, include: ["customMetadata"]
          });
          for (const entry of page.objects) {
            const versionId = entry.key.slice(prefix.length).replace(/\.json$/, "");
            const meta = entry.customMetadata || {};
            if (!validId(versionId) || !entry.key.endsWith(".json") ||
                meta.kind !== "tex-version" || meta.ownerId !== userId ||
                meta.documentId !== id || meta.versionId !== versionId) continue;
            versions.push({
              id: versionId, document_id: id,
              title: meta.title || doc.title,
              engine: ENGINES.has(meta.engine) ? meta.engine : "xelatex",
              reason: meta.reason || "autosave",
              created_at: meta.createdAt || null,
              source_chars: Math.max(0, Number(meta.sourceChars) || 0),
              preview: String(meta.preview || "").slice(0, 220)
            });
          }
          cursor = page.cursor;
          if (!page.truncated || !cursor) break;
        } while (true);
        versions.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
        return nativeJson({
          document_id: id, versions: versions.slice(0, 80),
          count: versions.length, storage: "source-only",
          pdf_persisted: false
        });
      }
      return nativeJson({ document: doc, etag: obj.etag });
    }
    if (request.method === "GET") {
      const docs = [];
      let cursor;
      do {
        const page = await env.STORAGE.list({
          prefix: ROOT + userId + "/", limit: 500, cursor, include: ["customMetadata"]
        });
        for (const obj of page.objects) {
          const docId = obj.key.slice((ROOT + userId + "/").length).replace(/\.json$/, "");
          const meta = obj.customMetadata || {};
          if (!validId(docId) || meta.kind !== "tex-document" || meta.ownerId !== userId) continue;
          docs.push(summary({ id: docId, title: meta.title || "Untitled", engine: meta.engine,
            preview: meta.preview, created_at: meta.createdAt, updated_at: meta.updatedAt }));
          if (docs.length >= 120) break;
        }
        cursor = page.cursor;
        if (!page.truncated || !cursor || docs.length >= 120) break;
      } while (true);
      docs.sort((a,b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")));
      return nativeJson({ documents: docs, count: docs.length, scope: "own" });
    }
    if (!["POST", "PUT"].includes(request.method)) return nativeJson({ error: "Method not allowed." }, 405);
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > MAX_BODY) return nativeJson({ error: "Document too large." }, 413);
    let input;
    try { input = JSON.parse(raw); } catch { return nativeJson({ error: "Invalid JSON." }, 400); }
    if (sourceInputError(input) || !input || typeof input !== "object" || Array.isArray(input) ||
      typeof input.source !== "string" || input.source.length > MAX_SOURCE ||
      typeof input.title !== "string" || input.title.length > 180 ||
      !ENGINES.has(input.engine)) {
      return nativeJson({ error: "Invalid TeX document." }, 400);
    }
    if (request.method === "POST" && id) return nativeJson({ error: "Unexpected document id." }, 400);
    if (request.method === "PUT" && !id) return nativeJson({ error: "Document id is required." }, 400);
    let previous = null;
    let onlyIf;
    if (id) {
      const obj = await env.STORAGE.get(key(userId, id));
      if (!obj) return nativeJson({ error: "Document not found." }, 404);
      previous = JSON.parse(await obj.text());
      if (previous.owner_id !== userId || previous.id !== id || previous.document_deleted) return nativeJson({ error: "Document not found." }, 404);
      if (isTexMainLocked(previous)) return nativeJson({error:"Unlock the main file or project before editing."},423);
      if (previous.main_deleted) return nativeJson({error:"Add a TeX entry before editing this project."},409);
      const match = request.headers.get("If-Match");
      if (!match || match !== obj.etag) return nativeJson({ error: "Document changed elsewhere; reload first." }, 409);
      onlyIf = { etagMatches: obj.etag };
    } else {
      if (await countLiveTexDocuments(env.STORAGE, ROOT + userId + "/", 120) >= 120) return nativeJson({ error: "Work document limit reached." }, 409);
      onlyIf = { etagDoesNotMatch: "*" };
    }
    const now = new Date().toISOString();
    const docId = id || crypto.randomUUID();
    const document = {
      ...previous,
      id: docId, owner_id: userId,
      // Native writes replace plain text, not a Yjs update. Isolate the old
      // room so it cannot replay its snapshot over the native edit.
      realtime_epoch: previous && previous.source !== input.source ? crypto.randomUUID() : texRealtimeEpoch(previous),
      title: input.title.trim() || "Untitled TeX document",
      engine: input.engine, source: input.source,
      created_at: previous?.created_at || now, updated_at: now
    };
    const saved = await env.STORAGE.put(key(userId, docId), JSON.stringify(document), {
      onlyIf, httpMetadata: { contentType: "application/json;charset=UTF-8" },
      customMetadata: metadata(document)
    });
    if (!saved) return nativeJson({ error: "Document changed elsewhere; reload first." }, 409);
    if (previous && document.realtime_epoch !== texRealtimeEpoch(previous) && env?.TEX_COLLAB_ROOMS?.get) {
      try {
        const room = env.TEX_COLLAB_ROOMS.get(env.TEX_COLLAB_ROOMS.idFromName(
          texRealtimeRoomName(userId, docId, texRealtimeEpoch(previous))));
        await room.fetch(new Request("https://tex-collaboration-room.internal/source-rebased", {method:"POST", headers:{
          "X-Qsseda-Collab-Owner":userId, "X-Qsseda-Collab-Document":docId
        }}));
      } catch { /* Old tabs are still blocked by the persisted epoch check. */ }
    }
    try { await snapshotDocumentVersion(env, userId, document, {
      reason: previous ? "autosave" : "created", force: true
    }); } catch { /* The document is saved even if version recording is unavailable. */ }
    return nativeJson({ document, etag: saved.etag }, previous ? 200 : 201);
  } catch {
    return nativeJson({ error: "Work document request failed." }, 503);
  }
}
