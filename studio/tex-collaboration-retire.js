// Deletion/archiving must serialize with ACKNOWLEDGED live edits, not only
// R2 writes. Otherwise an unprojected Yjs edit can be erased by an R2 CAS.
import { Doc, applyUpdate } from '../tex-vendor/server-yjs.mjs';
import { readJsonBounded } from './request-json-bounded.js';
import { isTexMainLocked, retireTexDocument, texDocumentRevision, TEX_WRITE_CONFLICT } from './tex-document-guards.js';
import { texRealtimeEpoch, texRealtimeRoomName } from './tex-realtime-epoch.js';
const ID = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const MAX_STATE = 6 * 1024 * 1024;
const MAX_JOURNAL = 2048;
const reply = (value, status=200) => new Response(JSON.stringify(value), {status,
  headers:{'content-type':'application/json','cache-control':'no-store'}});
const changed = () => reply({code:TEX_WRITE_CONFLICT,
  error:'The project has newer live edits. Wait for collaboration to save, then reload before archiving or deleting. No live content was removed.'},409);
const unavailable = () => Object.assign(new Error('Could not safely coordinate this operation. Your original source or encrypted recovery copy has been retained.'),{status:503});

export async function retireTexSource(env, previous, reason='deleted') {
  if(!['deleted','archived'].includes(reason) || !previous?.storage_revision ||
     !env?.TEX_COLLAB_ROOMS?.idFromName || !env?.TEX_COLLAB_ROOMS?.get) throw unavailable();
  const room = env.TEX_COLLAB_ROOMS.get(env.TEX_COLLAB_ROOMS.idFromName(
    texRealtimeRoomName(previous.owner_id,previous.id,texRealtimeEpoch(previous))));
  let response;
  try {
    response=await room.fetch(new Request('https://tex-collaboration-room.internal/commit-retire',{
      method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
        owner_id:previous.owner_id,document_id:previous.id,epoch:texRealtimeEpoch(previous),
        storage_revision:previous.storage_revision,reason
      })
    }));
  } catch {throw unavailable();}
  const result=await response.json().catch(()=>null);
  if(response.status===409)throw Object.assign(new Error(result?.error||'The project changed.'),{status:409,code:TEX_WRITE_CONFLICT});
  if(response.status===423)throw Object.assign(new Error(result?.error||'The project is locked.'),{status:423});
  if(!response.ok || result?.retired!==true || typeof result.storage_revision!=='string' || !result.storage_revision)throw unavailable();
  return result;
}

function decode(value) {
  if(typeof value!=='string'||!value||value.length>Math.ceil(MAX_STATE/3)*4+4||!/^[A-Za-z0-9+/]+={0,2}$/.test(value))throw Error('Invalid live snapshot');
  const raw=atob(value);if(raw.length>MAX_STATE)throw Error('Live snapshot too large');
  return Uint8Array.from(raw,c=>c.charCodeAt(0));
}
const title = value => String(value??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,180)||'Untitled TeX document';
async function liveMatchesStored(state, document) {
  const snapshot=await state.storage.get('snapshot');
  const journal=await state.storage.list({prefix:'u:',limit:MAX_JOURNAL+1});
  if(journal.size>MAX_JOURNAL)throw Error('Live journal exceeds safe verification size');
  if(!snapshot?.data&&!journal.size)return true;
  const doc=new Doc();let size=0;
  try {
    const apply=value=>{const bytes=decode(value);size+=bytes.length;if(size>MAX_STATE)throw Error('Live state too large');applyUpdate(doc,bytes);};
    if(snapshot?.data)apply(snapshot.data);
    for(const [key,value] of journal){
      if(Number(key.slice(2))<=Number(snapshot?.through_sequence||0))continue;
      apply(value.data);
    }
    // An out-of-order update can be acknowledged yet remain invisible until
    // its dependencies arrive. Equality of visible text is not sufficient.
    if(doc.store.pendingStructs || doc.store.pendingDs)return false;
    const meta=doc.getMap('meta');
    return doc.getText('source').toString()===document.source &&
      title(meta.get('title')??document.title)===title(document.title) &&
      (meta.get('engine')??document.engine)===document.engine;
  } finally {doc.destroy();}
}

// Only the authenticated API gateway can invoke this DO endpoint. Its lock is
// the SAME lock used by websocket updates and atomic source-save publication.
export async function handleRoomRetirement(request,state,env) {
  let input;
  try {input=await readJsonBounded(request,4096);}catch {return reply({error:'Invalid retirement request.'},400);}
  if(!ID.test(input?.owner_id||'')||!ID.test(input?.document_id||'')||
     !['archived','deleted'].includes(input?.reason)||typeof input.storage_revision!=='string'||
     !input.storage_revision||input.storage_revision.length>256)return reply({error:'Invalid retirement identity.'},400);
  return state.blockConcurrencyWhile(async()=>{
    try {
      const key=`_system/tex-documents/${input.owner_id}/${input.document_id}.json`;
      const object=await env.STORAGE.get(key);
      if(!object||object.etag!==input.storage_revision)return changed();
      const document=await object.json();
      if(document.document_deleted||document.id!==input.document_id||document.owner_id!==input.owner_id||
         texRealtimeEpoch(document)!==input.epoch)return changed();
      if(isTexMainLocked(document)||document.locked_files?.length||document.locked_folders?.length)
        return reply({error:'Unlock the project and its files first.'},423);
      if(!await liveMatchesStored(state,document))return changed();
      const marker=await retireTexDocument(env.STORAGE,key,texDocumentRevision(document,object),input.reason);
      // Even when acknowledgement is lost, this durable tombstone makes every
      // queued old-room update fail its active-source check before accepting it.
      return reply({retired:true,storage_revision:marker.storage_revision});
    } catch(error) {
      if(error?.code===TEX_WRITE_CONFLICT)return changed();
      return reply({error:'Source retirement could not be confirmed. Keep the encrypted recovery copy and retry cleanup.'},503);
    }
  });
}
