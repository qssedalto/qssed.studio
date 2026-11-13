import { isTexMainLocked } from './tex-document-guards.js';
import { texRealtimeEpoch } from './tex-realtime-epoch.js';
import { prepareTexConnection, activeTexRoomSource, createTexSourceSnapshot } from "./tex-collaboration-connect.js";
import { registerTexRoomEpoch } from "./tex-collaboration-history.js";
import { handleRoomSaveValidation } from "./tex-collaboration-save.js";
import { handleTexArchiveTransaction } from "./tex-archive-api.js";
import { decodeUpdate, mergeUpdates } from "../tex-vendor/server-yjs.mjs";
import { resolveLinkGrant } from "./tex-link-capabilities.js";
import { IPHONE_THEME_PALETTE } from "./iphone-theme-palette.js";
import { handleTexFileChatRoom } from "./tex-file-chat-room.js";
const MAX_MESSAGE_BYTES = 2 * 1024 * 1024;
const MAX_UPDATE_BYTES = 1024 * 1024;
const MAX_PRESENCE_POSITION = 180000;
const AUTH_LEASE_MS = 90 * 1000;
const VALID_COLLAB_ACCENTS = new Set(IPHONE_THEME_PALETTE.map(color => color.id));

// Presence shares only a palette identifier; never accept arbitrary CSS from a socket.
export function safeCollaborationAccent(value) {
  return typeof value === "string" && VALID_COLLAB_ACCENTS.has(value) ? value : "";
}

function safeText(value, maximum = 120) {
  return String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maximum);
}

export function decodeCollaborationIdentity(value, maximum = 120) {
  try { return safeText(decodeURIComponent(value || ""), maximum); }
  catch { return ""; }
}

function safeBase64(value) {
  const text = String(value || "");
  if (!text || text.length > MAX_MESSAGE_BYTES * 2 || !/^[A-Za-z0-9+/=_-]+$/.test(text)) return "";
  return text;
}

function decodeYjsUpdate(value) {
  const text = safeBase64(value);
  if (!text) return null;
  try {
    const raw = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
    if (raw.length > MAX_UPDATE_BYTES) return null;
    const bytes = Uint8Array.from(raw, character => character.charCodeAt(0));
    decodeUpdate(bytes); // Reject malformed binary before persisting/broadcasting it.
    return bytes;
  } catch { return null; }
}
function encodeYjsUpdate(bytes) {
  let raw = "";
  for (let offset=0; offset<bytes.length; offset+=16384)
    raw += String.fromCharCode(...bytes.subarray(offset, offset+16384));
  return btoa(raw);
}

function updateKey(sequence) {
  return `u:${String(sequence).padStart(12, "0")}`;
}

function sequenceFromKey(key) {
  const value = Number(String(key || "").slice(2));
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

export class TexCollaborationRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    if (request.method === "POST" && new URL(request.url).pathname === "/validate-save")
      return handleRoomSaveValidation(request, this.state, this.env, payload => this.broadcast(payload));
    if(new URL(request.url).pathname==="/vault"){
      const id=request.headers.get("X-Qsseda-Vault-User"), raw=request.headers.get("X-Qsseda-Vault-Email")||"";
      if(!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id||""))return new Response("Invalid vault identity",{status:403});
      let email;try{email=decodeURIComponent(raw);}catch{return new Response("Invalid vault identity",{status:403});}
      return this.state.blockConcurrencyWhile(async()=>{
        try{return await handleTexArchiveTransaction(request,this.env,{id,email});}
        catch{return new Response(JSON.stringify({error:"Archive operation interrupted. Reload before retrying; a recoverable copy has been retained."}),{status:503,headers:{"content-type":"application/json"}});}
      });
    }
    if (new URL(request.url).pathname === "/file-chat") return handleTexFileChatRoom(this.state,request);
    if (request.method === "POST" && ["/revoke-links", "/revoke-member"].includes(new URL(request.url).pathname)) {
      const named = new URL(request.url).pathname === "/revoke-member";
      const owner=request.headers.get("X-Qsseda-Collab-Owner");
      const doc=request.headers.get("X-Qsseda-Collab-Document");
      const target=request.headers.get("X-Qsseda-Collab-Target");
      // Persist revocation before closing: a previously authorized handshake
      // can otherwise arrive after the old sockets have already been closed.
      await this.state.storage.put(named ? 'revoked:member:' + target : 'revoked:links', Date.now());
      // This endpoint is only addressed through the internal DO stub.
      for(const socket of this.state.getWebSockets()){
        const p=socket.deserializeAttachment()||{};
        if((named ? !p.link_grant : p.link_grant) && p.owner_id===owner && p.document_id===doc && (!target||p.id===target)){
          // A close handshake is asynchronous. Expire the attachment FIRST,
          // so broadcasts/queued messages cannot use the old authority.
          socket.serializeAttachment({...p, expires_at:0});
          try{socket.close(4003,"Collaboration permission changed");}catch{}
        }
      }
      this.broadcastPresence();
      return new Response(null,{status:204});
    }
    if (request.method === "POST" && ["/source-rebased","/source-retired"].includes(new URL(request.url).pathname)) {
      // Internal Worker->Durable Object event (no public HTTP route).
      // When a root TeX entry is deleted, renamed or imported, collaborators
      // must not continue editing a Yjs document from the previous revision.
      const owner = request.headers.get("X-Qsseda-Collab-Owner");
      const doc = request.headers.get("X-Qsseda-Collab-Document");
      if (!owner || !doc) return new Response("Missing source identity.", {status:403});
      await this.state.storage.put('retired', true);
      for (const socket of this.state.getWebSockets()) {
        const participant = socket.deserializeAttachment() || {};
        if (participant.owner_id !== owner || participant.document_id !== doc) continue;
        socket.serializeAttachment({...participant, expires_at:0});
        try {
          socket.send(JSON.stringify({type:"source-rebased",document_id:doc}));
          socket.close(4004, "TeX entry revision changed");
        } catch {}
      }
      if(new URL(request.url).pathname==="/source-retired"){
        // The authoritative object is already a CAS tombstone. Remove the
        // obsolete plaintext Yjs history as well as closing its old sockets.
        await this.state.blockConcurrencyWhile(async()=>{
          // This legacy DO also hosts end-to-end encrypted project chat.
          // Retiring source must not destroy its unrelated ciphertext, wrapped
          // keys or Passkeys. Delete only the plaintext source namespace.
          await this.state.storage.delete(['snapshot', 'sequence', 'save_contract', 'registered']);
          let start;
          do {
            const updates = await this.state.storage.list({ prefix: 'u:', limit: 128, ...(start ? { startAfter: start } : {}) });
            const keys = [...updates.keys()];
            if (!keys.length) break;
            start = keys[keys.length - 1];
            await this.state.storage.delete(keys);
          } while (true);
          await this.state.storage.put('retired', true);
        });
      }
      return new Response(null, {status:204});
    }
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return new Response("WebSocket upgrade required.", { status: 426 });
    }

    const userId = safeText(request.headers.get("X-Qsseda-Collab-User"), 80);
    const ownerId = safeText(request.headers.get("X-Qsseda-Collab-Owner"), 80);
    const documentId = safeText(request.headers.get("X-Qsseda-Collab-Document"), 80);
    const role = safeText(request.headers.get("X-Qsseda-Collab-Role"), 16);
    if (!userId || !ownerId || !documentId || !["owner", "editor", "viewer"].includes(role)) {
      return new Response("Invalid collaboration session.", { status: 403 });
    }

    return this.state.blockConcurrencyWhile(async () => {
    let prepared;
    try { prepared = await prepareTexConnection(this.state, this.env, request,
      {owner:ownerId, document:documentId, user:userId, role}); }
    catch { return new Response('Could not validate the collaboration source.', {status:503}); }
    if (prepared.response) return prepared.response;
    const effectiveRole = prepared.role;
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    const participant = {
      id: userId,
      client_id: crypto.randomUUID(),
      owner_id: ownerId,
      document_id: documentId,
      role: effectiveRole, epoch: prepared.epoch, authorization_checked_at: prepared.checkedAt,
      access_role: request.headers.get("X-Qsseda-Collab-Access-Role") || role,
      link_grant: request.headers.get("X-Qsseda-Collab-Link-Grant") === "1",
      username: decodeCollaborationIdentity(request.headers.get("X-Qsseda-Collab-Username"), 80),
      display_name: decodeCollaborationIdentity(request.headers.get("X-Qsseda-Collab-Display-Name"), 120),
      avatar_url: safeText(request.headers.get("X-Qsseda-Collab-Avatar"), 500),
      connected_at: Date.now(),
      expires_at: Date.now() + AUTH_LEASE_MS,
      selection_start: 0,
      selection_end: 0,
      caret_position: 0,
      anchor_rel: "",
      head_rel: "",
      accent_id: "",
      typing: false
    };

    this.state.acceptWebSocket(server);
    server.serializeAttachment(participant);

    const snapshot = await this.state.storage.get("snapshot");
    const sequence = Number(await this.state.storage.get("sequence")) || 0;
    const throughSequence = Number(snapshot?.through_sequence) || 0;
    const updates = [];
    const stored = await this.state.storage.list({ prefix: "u:" });
    for (const [key, value] of stored) {
      const seq = sequenceFromKey(key);
      if (seq > throughSequence && value?.data) updates.push({ seq, data: value.data });
    }
    updates.sort((a, b) => a.seq - b.seq);

    server.send(JSON.stringify({
      type: "sync",
      initialized: Boolean(snapshot?.data),
      snapshot: snapshot?.data || "",
      snapshot_sequence: throughSequence,
      sequence,
      updates,
      role: effectiveRole, source_epoch: prepared.epoch,
      client_id: participant.client_id,
      lease_ms: AUTH_LEASE_MS
    }));
    this.broadcastPresence();

    return new Response(null, { status: 101, webSocket: client });
    });
  }

  async webSocketMessage(socket, message) {
    if (typeof message !== "string" || new TextEncoder().encode(message).byteLength > MAX_MESSAGE_BYTES) {
      socket.close(1009, "Message too large");
      return;
    }
    const participant = socket.deserializeAttachment() || {};
    if (!this.ensureLease(socket, participant)) return;
    if (participant.link_grant) {
      // Fail closed on every message; closing/rekeying or demoting a sharing
      // link cannot leave an old editor socket with stale write authority.
      const current=await resolveLinkGrant(this.env,participant.id,participant.document_id);
      if(!current || current.owner_id!==participant.owner_id || current.role!==(participant.access_role||participant.role)){
        try{socket.close(4003,"Link-sharing permission revoked");}catch{}
        return;
      }
    }

    let payload;
    try { payload = JSON.parse(message); } catch { return; }
    const type = String(payload?.type || "");

    if (type === "ping") {
      socket.send(JSON.stringify({ type: "pong", at: Date.now() }));
      return;
    }

    if (type === "presence") {
      participant.selection_start = clampPosition(payload.selection_start);
      participant.selection_end = clampPosition(payload.selection_end);
      participant.caret_position = clampPosition(payload.caret_position);
      participant.anchor_rel = safeRelativePosition(payload.anchor_rel);
      participant.head_rel = safeRelativePosition(payload.head_rel);
      participant.accent_id = safeCollaborationAccent(payload.accent_id);
      participant.typing = payload.typing === true;
      participant.expires_at = Math.min(Number(participant.expires_at) || 0, Date.now() + AUTH_LEASE_MS);
      socket.serializeAttachment(participant);
      this.broadcastPresence();
      return;
    }

    if (participant.role === "viewer") {
      socket.send(JSON.stringify({ type: "error", code: "read_only", message: "This collaboration session is read-only." }));
      return;
    }

    if (type === "initialize") {
      const data = safeBase64(payload.data);
      if (!decodeYjsUpdate(data)) {
        socket.send(JSON.stringify({type:"error",code:"invalid_update",message:"Invalid collaboration update; nothing was saved."}));
        return;
      }
      await this.state.blockConcurrencyWhile(async () => {
        const activeParticipant = socket.deserializeAttachment() || {};
        if (!this.ensureLease(socket, activeParticipant)) return;
        try {
          if (!(await activeTexRoomSource(this.env, activeParticipant))) {
            socket.serializeAttachment({...activeParticipant, expires_at:0});
            socket.close(4004, 'TeX source or lock changed'); return;
          }
          if (!(await this.state.storage.get('registered'))) {
            await registerTexRoomEpoch(this.env, activeParticipant.owner_id, activeParticipant.document_id, activeParticipant.epoch);
            await this.state.storage.put('registered', true);
          }
        } catch { socket.send(JSON.stringify({type:'error',code:'source_unavailable',message:'Source validation failed; your edit was not acknowledged.'})); return; }
        const existing = await this.state.storage.get("snapshot");
        if (existing?.data) {
          const sequence = Number(await this.state.storage.get("sequence")) || 0;
          socket.send(JSON.stringify({
            type: "sync",
            initialized: true,
            snapshot: existing.data,
            snapshot_sequence: Number(existing.through_sequence) || 0,
            sequence,
            updates: await this.readUpdatesAfter(Number(existing.through_sequence) || 0),
            role: participant.role,
            client_id: participant.client_id,
            lease_ms: AUTH_LEASE_MS
          }));
          return;
        }
        const original=await this.env.STORAGE.get(`_system/tex-documents/${activeParticipant.owner_id}/${activeParticipant.document_id}.json`);
        const document=original?await original.json():null;
        if(!document || document.document_deleted || document.main_deleted || isTexMainLocked(document) ||
          document.owner_id!==activeParticipant.owner_id || document.id!==activeParticipant.document_id ||
          texRealtimeEpoch(document)!==texRealtimeEpoch(activeParticipant.epoch))return;
        const seeded=createTexSourceSnapshot(document);
        await this.state.storage.put({snapshot:seeded,sequence:0});
        this.broadcast({ type: "initialized", data:seeded.data, sequence:0 });
      });
      return;
    }

    if (type === "update") {
      const data = safeBase64(payload.data);
      if (!decodeYjsUpdate(data)) {
        socket.send(JSON.stringify({type:"error",code:"invalid_update",message:"Invalid collaboration update; nothing was saved."}));
        return;
      }
      await this.state.blockConcurrencyWhile(async () => {
        const activeParticipant = socket.deserializeAttachment() || {};
        if (!this.ensureLease(socket, activeParticipant)) return;
        try {
          if (!(await activeTexRoomSource(this.env, activeParticipant))) {
            socket.serializeAttachment({...activeParticipant, expires_at:0});
            socket.close(4004, 'TeX source or lock changed'); return;
          }
          if (!(await this.state.storage.get('registered'))) {
            await registerTexRoomEpoch(this.env, activeParticipant.owner_id, activeParticipant.document_id, activeParticipant.epoch);
            await this.state.storage.put('registered', true);
          }
        } catch { socket.send(JSON.stringify({type:'error',code:'source_unavailable',message:'Source validation failed; your edit was not acknowledged.'})); return; }
        const snapshot = await this.state.storage.get("snapshot");
        if (!snapshot?.data) {
          socket.send(JSON.stringify({ type: "error", code: "not_initialized", message: "The collaboration room is not initialized." }));
          return;
        }
        const sequence = (Number(await this.state.storage.get("sequence")) || 0) + 1;
        await this.state.storage.put({
          sequence,
          [updateKey(sequence)]: { data, at: Date.now(), user_id: participant.id }
        });
        this.broadcast({ type: "update", data, sequence, user_id: participant.id });
      });
      return;
    }

    if (type === "snapshot") {
      const requestedThrough = Number(payload.through_sequence);
      if (!Number.isSafeInteger(requestedThrough) || requestedThrough < 0) return;
      await this.state.blockConcurrencyWhile(async () => {
        const activeParticipant = socket.deserializeAttachment() || {};
        if (!this.ensureLease(socket, activeParticipant)) return;
        try {
          if (!(await activeTexRoomSource(this.env, activeParticipant))) {
            socket.serializeAttachment({...activeParticipant, expires_at:0});
            socket.close(4004, 'TeX source or lock changed'); return;
          }
          if (!(await this.state.storage.get('registered'))) {
            await registerTexRoomEpoch(this.env, activeParticipant.owner_id, activeParticipant.document_id, activeParticipant.epoch);
            await this.state.storage.put('registered', true);
          }
        } catch { socket.send(JSON.stringify({type:'error',code:'source_unavailable',message:'Source validation failed; your edit was not acknowledged.'})); return; }
        const currentSequence = Number(await this.state.storage.get("sequence")) || 0;
        if (requestedThrough > currentSequence) return;
        const currentSnapshot = await this.state.storage.get("snapshot");
        if (!currentSnapshot?.data) return;
        const currentThrough = Number(currentSnapshot.through_sequence) || 0;
        const stored = await this.state.storage.list({ prefix: "u:" });
        const updates = [];
        const deletions = [];
        for (const [key, value] of stored) {
          const sequence = sequenceFromKey(key);
          if (sequence > currentThrough && sequence <= currentSequence) updates.push(value.data);
          if (sequence <= currentSequence) deletions.push(key);
        }
        if (!updates.length) return;
        // A client snapshot is only a request to compact. Never replace server
        // state with it: a stale peer can claim a current sequence while missing
        // another peer's edit (or deletion). Merge the authoritative journal.
        try {
          const parts = [currentSnapshot.data, ...updates].map(value => {
            const raw = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
            const bytes = Uint8Array.from(raw, c => c.charCodeAt(0));
            decodeUpdate(bytes);
            return bytes;
          });
          const data = encodeYjsUpdate(mergeUpdates(parts));
          // Keep the journal intact if compaction cannot fit the SQLite value
          // budget. Refusing compaction is safer than discarding any updates.
          if (data.length > 6 * 1024 * 1024) return;
          await this.state.storage.put("snapshot", { data, through_sequence: currentSequence, saved_at: Date.now() });
          // Chunk deletes for storage APIs with a 128-key per-call limit.
          for (let i=0; i<deletions.length; i+=128) await this.state.storage.delete(deletions.slice(i,i+128));
        } catch {
          socket.send(JSON.stringify({type:"error",code:"compaction_failed",message:"Collaboration history was preserved; compaction could not finish."}));
        }
      });
    }
  }

  webSocketClose(socket) {
    try { socket.close(1000, "Closed"); } catch {}
    this.broadcastPresence();
  }

  webSocketError(socket) {
    try { socket.close(1011, "WebSocket error"); } catch {}
    this.broadcastPresence();
  }

  async readUpdatesAfter(sequence) {
    const updates = [];
    const stored = await this.state.storage.list({ prefix: "u:" });
    for (const [key, value] of stored) {
      const seq = sequenceFromKey(key);
      if (seq > sequence && value?.data) updates.push({ seq, data: value.data });
    }
    updates.sort((a, b) => a.seq - b.seq);
    return updates;
  }

  ensureLease(socket, participant) {
    if ((Number(participant?.expires_at) || 0) > Date.now()) return true;
    try { socket.close(4001, "Collaboration authorization expired"); } catch {}
    return false;
  }

  broadcast(payload) {
    const encoded = JSON.stringify(payload);
    for (const socket of this.state.getWebSockets()) {
      const participant = socket.deserializeAttachment() || {};
      if (!this.ensureLease(socket, participant)) continue;
      try { socket.send(encoded); } catch {}
    }
  }

  broadcastPresence() {
    const participants = [];
    for (const socket of this.state.getWebSockets()) {
      const participant = socket.deserializeAttachment() || {};
      if (!this.ensureLease(socket, participant)) continue;
      participants.push({
        id: participant.id,
        client_id: participant.client_id,
        role: participant.role,
        username: participant.username,
        display_name: participant.display_name,
        avatar_url: participant.avatar_url,
        selection_start: clampPosition(participant.selection_start),
        selection_end: clampPosition(participant.selection_end),
        caret_position: clampPosition(participant.caret_position),
        anchor_rel: safeRelativePosition(participant.anchor_rel),
        head_rel: safeRelativePosition(participant.head_rel),
        accent_id: safeCollaborationAccent(participant.accent_id),
        typing: participant.typing === true
      });
    }
    const encoded = JSON.stringify({ type: "presence-list", participants });
    for (const socket of this.state.getWebSockets()) {
      const participant = socket.deserializeAttachment() || {};
      if (!this.ensureLease(socket, participant)) continue;
      try { socket.send(encoded); } catch {}
    }
  }
}

function clampPosition(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(MAX_PRESENCE_POSITION, Math.floor(parsed)));
}

// A bounded Yjs RelativePosition is a transport hint only, never an authorization token.
function safeRelativePosition(value) {
  const text = typeof value === "string" ? value : "";
  return text.length <= 512 && /^[A-Za-z0-9+/=]*$/.test(text) ? text : "";
}
