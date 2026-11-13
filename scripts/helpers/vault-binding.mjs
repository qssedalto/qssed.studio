import { TexCollaborationRoom } from '../../studio/tex-collaboration-room.js';

export function attachVaultBinding(env) {
  const rooms = new Map();
  env.TEX_COLLAB_ROOMS = {
    idFromName: name => name,
    get(name) {
      if (!rooms.has(name)) {
        let queue = Promise.resolve();
        const storage = new Map();
        const state = {
          getWebSockets: () => [],
          storage: { deleteAll: async () => storage.clear() },
          blockConcurrencyWhile(fn) {
            const next = queue.then(fn);
            queue = next.catch(() => {});
            return next;
          }
        };
        const room = new TexCollaborationRoom(state, env);
        rooms.set(name, { room, storage, fetch: request => room.fetch(request) });
      }
      return rooms.get(name);
    }
  };
  return rooms;
}
