import { texRealtimeEpoch, texRealtimeRoomName } from './tex-realtime-epoch.js';
import { workerLog } from './server-runtime.js';

// Resolve the *active source epoch*. The former owner:document room name no
// longer receives live sockets; sending revocations only there did nothing.
export async function invalidateTexCollaboration(env, owner, document, kind, target = '', epoch) {
  if (!env?.TEX_COLLAB_ROOMS?.idFromName || !env?.TEX_COLLAB_ROOMS?.get) return false;
  if (!['revoke-member', 'revoke-links', 'source-rebased', 'source-retired'].includes(kind)) throw new Error('Invalid room notification');
  try {
    if (epoch === undefined) {
      const head = await env.STORAGE.head(`_system/tex-documents/${owner}/${document}.json`);
      epoch = texRealtimeEpoch(head?.customMetadata?.realtimeEpoch);
    }
    const room = env.TEX_COLLAB_ROOMS.get(env.TEX_COLLAB_ROOMS.idFromName(texRealtimeRoomName(owner, document, epoch)));
    const response = await room.fetch(new Request('https://tex-collaboration-room.internal/' + kind, {
      method: 'POST', headers: {
        'X-Qsseda-Collab-Owner': owner, 'X-Qsseda-Collab-Document': document,
        ...(target ? { 'X-Qsseda-Collab-Target': target } : {})
      }
    }));
    if (!response.ok) throw new Error('Room notification rejected: ' + response.status);
    return true;
  } catch (error) {
    // The short authorization lease still expires closed if a DO is unavailable.
    workerLog('warn', 'tex.collaboration.invalidate_failed', { document_id: document, operation: kind,
      message: String(error?.message || error).slice(0, 160) });
    return false;
  }
}
