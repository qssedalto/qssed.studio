// Each TeX project has one canonical source snapshot in R2 and one CRDT
// collaboration room per explicit main-entry revision. Legacy rooms used
// owner:document without an epoch and could replay permanently stale source.
//
// New clients use the v2 namespace for existing documents. Root-entry
// replacement/deletion rotates the revision, preserving old room storage as
// a recovery path instead of destructively clearing historical Yjs updates.
const REVISION = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function texRealtimeEpoch(record) {
  const raw = typeof record === "string" ? record : record?.realtime_epoch ?? record?.realtimeEpoch;
  return REVISION.test(String(raw || "")) ? String(raw).toLowerCase() : "v2";
}
export function texRealtimeRoomName(ownerId, documentId, epoch) {
  return String(ownerId) + ":" + String(documentId) + ":source:" + texRealtimeEpoch(epoch);
}
export function rotateTexRealtimeEpoch() {
  return crypto.randomUUID();
}
