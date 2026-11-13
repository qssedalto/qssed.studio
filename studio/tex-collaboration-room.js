import { resolveLinkGrant } from "./tex-link-capabilities.js";
const MAX_MESSAGE_BYTES = 1024 * 1024;
const MAX_PRESENCE_POSITION = 180000;
const AUTH_LEASE_MS = 90 * 1000;

function safeText(value, maximum = 120) {
  return String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maximum);
}

function safeBase64(value) {
  const text = String(value || "");
  if (!text || text.length > MAX_MESSAGE_BYTES * 2 || !/^[A-Za-z0-9+/=_-]+$/.test(text)) return "";
  return text;
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
    if (request.method === "POST" && new URL(request.url).pathname === "/revoke-links") {
      const owner=request.headers.get("X-Qsseda-Collab-Owner");
      const doc=request.headers.get("X-Qsseda-Collab-Document");
      const target=request.headers.get("X-Qsseda-Collab-Target");
      // This endpoint is only addressed through the internal DO stub.
      for(const socket of this.state.getWebSockets()){
        const p=socket.deserializeAttachment()||{};
        if(p.link_grant && p.owner_id===owner && p.document_id===doc && (!target||p.id===target)){
          try{socket.close(4003,"Link-sharing permission changed");}catch{}
        }
      }
      this.broadcastPresence();
      return new Response(null,{status:204});
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

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    const participant = {
      id: userId,
      client_id: crypto.randomUUID(),
      owner_id: ownerId,
      document_id: documentId,
      role,
      link_grant: request.headers.get("X-Qsseda-Collab-Link-Grant") === "1",
      username: safeText(request.headers.get("X-Qsseda-Collab-Username"), 80),
      display_name: safeText(request.headers.get("X-Qsseda-Collab-Display-Name"), 120),
      avatar_url: safeText(request.headers.get("X-Qsseda-Collab-Avatar"), 500),
      connected_at: Date.now(),
      expires_at: Date.now() + AUTH_LEASE_MS,
      selection_start: 0,
      selection_end: 0,
      caret_position: 0,
      anchor_rel: "",
      head_rel: "",
      typing: false,
      cursor_color: ""
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
      role,
      client_id: participant.client_id,
      lease_ms: AUTH_LEASE_MS
    }));
    this.broadcastPresence();

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(socket, message) {
    const participant = socket.deserializeAttachment() || {};
    if (!this.ensureLease(socket, participant)) return;
    if (participant.link_grant) {
      // Fail closed on every message; closing/rekeying or demoting a sharing
      // link cannot leave an old editor socket with stale write authority.
      const current=await resolveLinkGrant(this.env,participant.id,participant.document_id);
      if(!current || current.owner_id!==participant.owner_id || current.role!==participant.role){
        try{socket.close(4003,"Link-sharing permission revoked");}catch{}
        return;
      }
    }
    if (typeof message !== "string" || new TextEncoder().encode(message).byteLength > MAX_MESSAGE_BYTES) {
      socket.close(1009, "Message too large");
      return;
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
      participant.typing = payload.typing === true;
      // Only six-digit palette colors are accepted; arbitrary CSS is never sent to other clients.
      participant.cursor_color = /^#[0-9a-f]{6}$/i.test(String(payload.cursor_color || "")) ?
        String(payload.cursor_color).toLowerCase() : "";
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
      if (!data) return;
      await this.state.blockConcurrencyWhile(async () => {
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
        await this.state.storage.put({
          snapshot: { data, through_sequence: 0, saved_at: Date.now() },
          sequence: 0
        });
        this.broadcast({ type: "initialized", data, sequence: 0 });
      });
      return;
    }

    if (type === "update") {
      const data = safeBase64(payload.data);
      if (!data) return;
      await this.state.blockConcurrencyWhile(async () => {
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
      const data = safeBase64(payload.data);
      const throughSequence = Math.max(0, Number(payload.through_sequence) || 0);
      if (!data) return;
      await this.state.blockConcurrencyWhile(async () => {
        const currentSequence = Number(await this.state.storage.get("sequence")) || 0;
        if (throughSequence > currentSequence) return;
        const currentSnapshot = await this.state.storage.get("snapshot");
        const currentThrough = Number(currentSnapshot?.through_sequence) || 0;
        if (throughSequence < currentThrough) return;
        await this.state.storage.put("snapshot", { data, through_sequence: throughSequence, saved_at: Date.now() });
        const stored = await this.state.storage.list({ prefix: "u:" });
        const deletions = [];
        for (const key of stored.keys()) {
          if (sequenceFromKey(key) <= throughSequence) deletions.push(key);
        }
        if (deletions.length) await this.state.storage.delete(deletions);
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
        typing: participant.typing === true,
        cursor_color: /^#[0-9a-f]{6}$/i.test(String(participant.cursor_color || "")) ?
          participant.cursor_color : ""
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
