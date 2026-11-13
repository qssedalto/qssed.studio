import { registerTexRoomEpoch } from "./tex-collaboration-history.js";
import { Doc, applyUpdate, encodeStateAsUpdate, encodeStateVector } from '../tex-vendor/server-yjs.mjs';
import { readJsonBounded } from './request-json-bounded.js';
import { isTexMainLocked, sourceInputError, texWriteConflict } from './tex-document-guards.js';
import { texRealtimeEpoch, texRealtimeRoomName } from './tex-realtime-epoch.js';
import { invalidateTexCollaboration } from './tex-collaboration-invalidate.js';

const MAX_UPDATE = 1024 * 1024;
const MAX_STATE = 6 * 1024 * 1024;
const MAX_JOURNAL = 2048;
const idPattern = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const fields = value => ({ source: value.source, title: value.title, engine: value.engine });
const equal = (a, b) => a.source === b.source && a.title === b.title && a.engine === b.engine;
const reply = (value, status = 200) => new Response(JSON.stringify(value), { status,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const conflict = () => reply({ error: 'The collaboration contains a newer edit. Your local text has been preserved; synchronize before saving.', code: 'collaboration_state_changed' }, 409);
const canonicalTitle = value => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180) || 'Untitled TeX document';
const yFields = (doc, previous) => ({ source: doc.getText('source').toString(),
  title: canonicalTitle(doc.getMap('meta').get('title') ?? previous.title),
  engine: doc.getMap('meta').get('engine') ?? previous.engine });
function decode(value, maximum = MAX_UPDATE) {
  if (typeof value !== 'string' || !value || value.length > Math.ceil(maximum / 3) * 4 + 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) throw Error('Invalid collaboration update');
  const raw = atob(value);
  if (raw.length > maximum) throw Error('Collaboration update too large');
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}
function encode(bytes) {
  let raw = '';
  for (let i = 0; i < bytes.length; i += 16384) raw += String.fromCharCode(...bytes.subarray(i, i + 16384));
  return btoa(raw);
}

// A server-side R2 read/write CAS alone does not detect a tab that read an old
// document hours earlier. Require its base ETag. An old ETag is allowed only
// when the submitted CRDT state demonstrably contains the current server state.
export async function validateTexSourceSave(env, previous, input, document) {
  if (typeof input.storage_revision !== 'string' || !input.storage_revision || input.storage_revision.length > 256)
    throw Object.assign(new Error('This editor must be refreshed before saving. Download your local source first; no server content was changed.'), { status: 428, code: 'save_revision_required' });
  if (!env?.TEX_COLLAB_ROOMS?.idFromName || !env?.TEX_COLLAB_ROOMS?.get) {
    if (input.storage_revision !== previous.storage_revision) throw texWriteConflict();
    // A standalone editor has no CRDT binding. Its full-text replacement must
    // isolate the former room rather than later replaying an obsolete snapshot.
    document.realtime_epoch = crypto.randomUUID();
    return { rebase: true };
  }
  const room = env.TEX_COLLAB_ROOMS.get(env.TEX_COLLAB_ROOMS.idFromName(
    texRealtimeRoomName(previous.owner_id, previous.id, texRealtimeEpoch(previous))));
  let response;
  try {
    response = await room.fetch(new Request('https://tex-collaboration-room.internal/validate-save', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
        owner_id: previous.owner_id, document_id: previous.id, epoch: texRealtimeEpoch(previous),
        previous_revision: previous.storage_revision, client_revision: input.storage_revision,
        candidate: fields(document), update: input.collaboration_update || null
      })
    }));
  } catch {
    throw Object.assign(new Error('Collaboration validation is temporarily unavailable. Your local changes have not been discarded.'), { status: 503, code: 'collaboration_unavailable' });
  }
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.ok) throw Object.assign(new Error(result?.error || 'Could not verify the collaboration state.'),
    { status: [400, 409, 413, 423, 428].includes(response.status) ? response.status : 503, code: result?.code || 'collaboration_unavailable' });
  if (result.rebase) document.realtime_epoch = crypto.randomUUID();
  return result;
}
export async function finalizeTexSourceSave(env, previous, plan) {
  if (plan?.rebase) await invalidateTexCollaboration(env, previous.owner_id, previous.id,
    'source-rebased', '', texRealtimeEpoch(previous));
}

// Internal-only DO endpoint. The public API performs authentication/ACL checks;
// this method rechecks the R2 generation and serializes against live Yjs events.
export async function handleRoomSaveValidation(request, state, env, broadcast) {
  let input;
  try { input = await readJsonBounded(request, 3 * 1024 * 1024); }
  catch (error) { return reply({ error: 'Invalid save verification payload.' }, error?.status === 413 ? 413 : 400); }
  if (!idPattern.test(input.owner_id || '') || !idPattern.test(input.document_id || '') ||
      sourceInputError(input.candidate) || typeof input.candidate.title !== 'string' ||
      !['xelatex', 'lualatex', 'pdflatex'].includes(input.candidate.engine)) return reply({ error: 'Invalid save fields.' }, 400);
  return state.blockConcurrencyWhile(async () => {
    const object = await env.STORAGE.get(`_system/tex-documents/${input.owner_id}/${input.document_id}.json`);
    if (!object || object.etag !== input.previous_revision) return conflict();
    const previous = await object.json();
    if (previous.document_deleted || previous.owner_id !== input.owner_id || previous.id !== input.document_id ||
        texRealtimeEpoch(previous) !== input.epoch) return conflict();
    if (isTexMainLocked(previous) || previous.main_deleted) return reply({ error: 'The TeX entry is locked or unavailable.' }, 423);
    const snapshot = await state.storage.get('snapshot');
    const currentRevision = input.client_revision === object.etag;
    // Establish the new contract with a current R2 reader, never by trusting a
    // stale legacy room/client as the first source of truth after an upgrade.
    if (!currentRevision && !(await state.storage.get('save_contract'))) return conflict();
    if (!snapshot?.data && !currentRevision) return conflict();
    const doc = new Doc();
    try {
      const journal = await state.storage.list({ prefix: 'u:', limit: MAX_JOURNAL + 1 });
      if (journal.size > MAX_JOURNAL) return conflict();
      let bytes = 0;
      if (snapshot?.data) { const data = decode(snapshot.data, MAX_STATE); bytes += data.length; applyUpdate(doc, data); }
      for (const [key, value] of journal) {
        if (Number(key.slice(2)) <= Number(snapshot?.through_sequence || 0)) continue;
        const data = decode(value.data); bytes += data.length;
        if (bytes > MAX_STATE) return conflict();
        applyUpdate(doc, data);
      }
      const before = encodeStateVector(doc);
      const existing = snapshot?.data ? yFields(doc, previous) : fields(previous);
      if (!input.update) {
        if (equal(existing, input.candidate)) {
          await state.storage.put('save_contract', 2);
          return reply({ ok: true, rebase: false });
        }
        // Plain/offline replacement is safe only if both the R2 revision and
        // the live room still equal the caller's base. Rebase after the R2 CAS.
        if (currentRevision && equal(existing, fields(previous))) return reply({ ok: true, rebase: true });
        return conflict();
      }
      applyUpdate(doc, decode(input.update));
      if (!equal(yFields(doc, previous), input.candidate)) return conflict();
      const full = encodeStateAsUpdate(doc);
      const delta = encodeStateAsUpdate(doc, before);
      if (full.length > MAX_STATE || delta.length > MAX_UPDATE) return conflict();
      const sequence = (Number(await state.storage.get('sequence')) || 0) + 1;
      // Persist accepted CRDT state before its R2 projection. If the R2 CAS
      // later loses, collaboration still retains every accepted client edit.
      await registerTexRoomEpoch(env, input.owner_id, input.document_id, input.epoch);
      await state.storage.put({ snapshot: { data: encode(full), through_sequence: sequence, saved_at: Date.now() },
        sequence, save_contract: 2 });
      const keys = [...journal.keys()];
      for (let i = 0; i < keys.length; i += 128) await state.storage.delete(keys.slice(i, i + 128));
      broadcast({ type: snapshot?.data ? 'update' : 'initialized', data: encode(snapshot?.data ? delta : full), sequence });
      return reply({ ok: true, rebase: false });
    } catch {
      return reply({ error: 'The collaboration state could not be verified. Your local source is still available.', code: 'collaboration_state_changed' }, 409);
    } finally { doc.destroy(); }
  });
}
