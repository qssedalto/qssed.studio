import { Doc, encodeStateAsUpdate } from '../tex-vendor/server-yjs.mjs';
import { isTexMainLocked, isLiveTexHead } from './tex-document-guards.js';
import { texRealtimeEpoch } from './tex-realtime-epoch.js';
import { registerTexRoomEpoch } from './tex-collaboration-history.js';

const failure = (message, status = 409) => new Response(message, { status });
function encode(bytes) {
  let raw = '';
  for (let i = 0; i < bytes.length; i += 16384) raw += String.fromCharCode(...bytes.subarray(i, i + 16384));
  return btoa(raw);
}
export function createTexSourceSnapshot(doc) {
  if (typeof doc?.source !== 'string' || doc.source.length > 180000 || doc.source.includes('\0')) throw Error('Invalid source');
  const seed = new Doc();
  try {
    seed.getText('source').insert(0, doc.source);
    seed.getMap('meta').set('title', doc.title || 'Untitled TeX document');
    seed.getMap('meta').set('engine', doc.engine || 'xelatex');
    return { data: encode(encodeStateAsUpdate(seed)), through_sequence: 0, saved_at: Date.now() };
  } finally { seed.destroy(); }
}
// Invoked within the room's blockConcurrencyWhile, including socket acceptance.
// A request authorized before a revoke/rebase must not join afterwards with its
// stale authority, and a stale browser must never seed a new room with old text.
export async function prepareTexConnection(state, env, request, identity) {
  const { owner, document, user, role } = identity;
  const epoch = texRealtimeEpoch(request.headers.get('X-Qsseda-Collab-Epoch'));
  const checkedAt = Number(request.headers.get('X-Qsseda-Collab-Checked-At'));
  const viaLink = request.headers.get('X-Qsseda-Collab-Link-Grant') === '1';
  if (!Number.isFinite(checkedAt) || checkedAt <= 0 || checkedAt > Date.now() + 5000 || Date.now() - checkedAt > 30000)
    return { response: failure('Collaboration authorization must be refreshed.', 403) };
  const revokedAt = Number(await state.storage.get(viaLink ? 'revoked:links' : 'revoked:member:' + user)) || 0;
  if (checkedAt <= revokedAt || await state.storage.get('retired')) return { response: failure('Collaboration permission changed.', 403) };
  const key = `_system/tex-documents/${owner}/${document}.json`;
  const head = await env.STORAGE.head(key);
  if (!isLiveTexHead(head) || texRealtimeEpoch(head.customMetadata?.realtimeEpoch) !== epoch)
    return { response: failure('The source revision changed.') };
  let snapshot = await state.storage.get('snapshot');
  let locked = head.customMetadata?.mainLocked === 'true' || head.customMetadata?.locked === 'true';
  if (!snapshot?.data || head.customMetadata?.mainLocked === undefined) {
    const object = await env.STORAGE.get(key);
    if (!object) return { response: failure('The source no longer exists.', 404) };
    const doc = await object.json();
    if (doc.document_deleted || doc.owner_id !== owner || doc.id !== document || texRealtimeEpoch(doc) !== epoch || doc.main_deleted)
      return { response: failure('The source revision changed.') };
    locked = locked || isTexMainLocked(doc);
    if (!snapshot?.data) {
      if (typeof doc.source !== 'string' || doc.source.length > 180000 || doc.source.includes('\0'))
        return { response: failure('This source must be repaired or exported before live editing.') };
      snapshot = createTexSourceSnapshot(doc);
      await registerTexRoomEpoch(env, owner, document, epoch);
      await state.storage.put({ snapshot, sequence: 0, registered: true });
    }
  }
  if (!(await state.storage.get('registered'))) {
    await registerTexRoomEpoch(env, owner, document, epoch);
    await state.storage.put('registered', true);
  }
  return { role: locked ? 'viewer' : role, epoch, checkedAt };
}

export async function activeTexRoomSource(env, participant) {
  const key = `_system/tex-documents/${participant.owner_id}/${participant.document_id}.json`;
  const head = await env.STORAGE.head(key);
  if (!isLiveTexHead(head) || texRealtimeEpoch(head.customMetadata?.realtimeEpoch) !== texRealtimeEpoch(participant.epoch)) return false;
  if (head.customMetadata?.mainLocked === 'true' || head.customMetadata?.locked === 'true') return false;
  if (head.customMetadata?.mainLocked === undefined) {
    const object = await env.STORAGE.get(key), doc = object ? await object.json() : null;
    if (!doc || doc.document_deleted || doc.main_deleted || isTexMainLocked(doc) || texRealtimeEpoch(doc) !== texRealtimeEpoch(participant.epoch)) return false;
  }
  return true;
}
