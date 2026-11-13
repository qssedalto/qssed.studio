import { texRealtimeEpoch, texRealtimeRoomName } from './tex-realtime-epoch.js';
const ROOT = '_system/tex-room-epochs/';

// Registry entries contain identifiers only, never source text or credentials.
// Every room that persists new source must register first, so archive/delete
// can also remove histories from previous main-file generations.
export async function registerTexRoomEpoch(env, owner, document, epoch) {
  const normalized = texRealtimeEpoch(epoch);
  const key = `${ROOT}${owner}/${document}/${normalized}.json`;
  await env.STORAGE.put(key, JSON.stringify({ owner_id: owner, document_id: document, epoch: normalized }), {
    onlyIf: { etagDoesNotMatch: '*' }, httpMetadata: { contentType: 'application/json' },
    customMetadata: { ownerId: owner, hidden: 'true', kind: 'tex-room-epoch' }
  });
}

export async function purgeTexCollaborationHistory(env, owner, document, epoch) {
  if (!env?.TEX_COLLAB_ROOMS?.idFromName || !env?.TEX_COLLAB_ROOMS?.get)
    throw Error('Collaboration history cleanup is unavailable. The encrypted copy has been retained.');
  const purge = async name => {
    const room = env.TEX_COLLAB_ROOMS.get(env.TEX_COLLAB_ROOMS.idFromName(name));
    const response = await room.fetch(new Request('https://tex-collaboration-room.internal/source-retired', {
      method: 'POST', headers: { 'X-Qsseda-Collab-Owner': owner, 'X-Qsseda-Collab-Document': document }
    }));
    if (!response.ok) throw Error('Collaboration history cleanup must be retried. The encrypted copy is safe.');
  };
  const names = new Set([owner + ':' + document, texRealtimeRoomName(owner, document, 'v2'),
    texRealtimeRoomName(owner, document, epoch)]);
  for (const name of names) await purge(name);
  const prefix = `${ROOT}${owner}/${document}/`;
  let cursor;
  do {
    const page = await env.STORAGE.list({ prefix, cursor, limit: 100 });
    for (let start = 0; start < page.objects.length; start += 8) {
      await Promise.all(page.objects.slice(start, start + 8).map(async entry => {
        const value = entry.key.slice(prefix.length).replace(/\.json$/, '');
        const normalized = texRealtimeEpoch(value);
        if (normalized !== value) return; // Never resolve arbitrary storage keys as room names.
        const name = texRealtimeRoomName(owner, document, normalized);
        if (!names.has(name)) await purge(name);
        await env.STORAGE.delete(entry.key); // Resume from remaining entries after interruption.
      }));
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
}
