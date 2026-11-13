// Shared invariants for every authenticated TeX document mutation.
// R2 conditional writes are atomic: a losing write must not be retried with
// the same stale document, otherwise the protection becomes last-writer-wins.
export const MAX_TEX_SOURCE_CHARACTERS = 180000;
export const TEX_WRITE_CONFLICT = "document_write_conflict";

export function sourceInputError(input) {
  if (!input || Array.isArray(input) || typeof input !== "object" || typeof input.source !== "string")
    return "TeX source must be an explicitly supplied string. No content was changed.";
  if (input.source.length > MAX_TEX_SOURCE_CHARACTERS)
    return "TeX source exceeds 180000 characters. No content was truncated or saved.";
  if (input.source.includes("\0"))
    return "TeX source contains a NUL character. No content was changed.";
  return "";
}

export function isTexMainLocked(document) {
  const name = document?.main_filename || "main.tex";
  return Boolean(document?.locked || document?.locked_files?.includes("main.tex") ||
    document?.locked_files?.includes(name) || document?.locked_folders?.some(folder =>
      name === folder || name.startsWith(folder + "/")));
}

export function hasLockedTexDescendants(document, folder) {
  const prefix = folder + "/";
  return [...(document?.locked_files || []), ...(document?.locked_folders || [])]
    .some(name => name === folder || name.startsWith(prefix));
}

export function texDocumentRevision(document, object) {
  // Never trust a revision stored in JSON or submitted by a client. It must
  // come from the R2 object returned by the same read as the document body.
  document.storage_revision = typeof object?.etag === "string" ? object.etag : "";
  return document;
}

export function texWriteConflict() {
  return Object.assign(new Error("This project changed while it was being saved. Your local changes have not overwritten the newer version. Reload after downloading your local source."),
    { code: TEX_WRITE_CONFLICT, status: 409 });
}

export async function putTexDocument(storage, key, document, options, previousRevision) {
  if (previousRevision !== null && (typeof previousRevision !== "string" || !previousRevision))
    throw new Error("The stored document has no valid R2 revision; refusing an unconditional write.");
  const { storage_revision: ignored, ...body } = document;
  const result = await storage.put(key, JSON.stringify(body), {
    ...options,
    customMetadata:{...options?.customMetadata,mainLocked:isTexMainLocked(document)?"true":"false"},
    onlyIf: previousRevision === null ? { etagDoesNotMatch: "*" } : { etagMatches: previousRevision }
  });
  if (result === null) throw texWriteConflict();
  return texDocumentRevision(document, result);
}

// Keep an empty CAS marker instead of an unconditional DELETE. Otherwise a
// request that read the old object before deletion could recreate it, or the
// delete could erase a newer successful save. Markers contain no user content.
export async function retireTexDocument(storage, key, document, reason = 'deleted') {
  if (!document?.storage_revision) throw new Error('A document revision is required to retire it.');
  const marker = {
    id: document.id, owner_id: document.owner_id, document_deleted: true,
    deleted_at: new Date().toISOString(), reason,
    retired_epoch: document.realtime_epoch || "v2",
    realtime_epoch: crypto.randomUUID()
  };
  return putTexDocument(storage, key, marker, {
    httpMetadata: { contentType: 'application/json;charset=UTF-8' },
    customMetadata: { ownerId: document.owner_id, hidden: 'true', kind: 'tex-tombstone',
      documentDeleted: 'true', realtimeEpoch: marker.realtime_epoch }
  }, document.storage_revision);
}

export function isLiveTexHead(head) {
  return Boolean(head && head.customMetadata?.documentDeleted !== 'true' && head.customMetadata?.kind !== 'tex-tombstone');
}

export async function countLiveTexDocuments(storage, prefix, maximum = 120) {
  let count = 0, cursor;
  do {
    const page = await storage.list({ prefix, cursor, limit: 250, include: ['customMetadata'] });
    count += page.objects.filter(isLiveTexHead).length;
    if (count >= maximum) return count;
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return count;
}
