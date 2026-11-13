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
          storage: {
            get:async key=>structuredClone(storage.get(key)),
            put:async (key,value)=>{for(const [k,v] of typeof key==='object'?Object.entries(key):[[key,value]])storage.set(k,structuredClone(v));},
            list:async ({prefix='',limit=Infinity}={})=>new Map([...storage].filter(([k])=>k.startsWith(prefix)).sort().slice(0,limit)),
            delete:async keys=>{for(const key of Array.isArray(keys)?keys:[keys])storage.delete(key);},
            deleteAll: async () => storage.clear()
          },
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
