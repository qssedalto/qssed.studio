import assert from "node:assert/strict";
import { MemoryR2 } from "./helpers/memory-r2.mjs";
import { handleTexApi } from "../studio/tex-api-core.js";
import { handleTexSharedCollaboration } from "../studio/tex-collaboration-shared.js";
import { handleTexProjectFiles } from "../studio/tex-project-files-api.js";
import { handleTexOrganize } from "../studio/tex-organize-api.js";
import { handleTexVersionApi } from "../studio/tex-version-api.js";
import { handleNativeWorkDocuments } from "../studio/native-work-documents.js";
import { handleTexCollaborationRealtime } from "../studio/tex-collaboration-realtime.js";
import { decodeCollaborationIdentity } from "../studio/tex-collaboration-room.js";

const owner = "11111111-1111-4111-8111-111111111111";
const member = "22222222-2222-4222-8222-222222222222";
const id = "33333333-3333-4333-8333-333333333333";
const key = `_system/tex-documents/${owner}/${id}.json`;
const origin = "https://work.qsseda.com";
const original = { id, owner_id: owner, title: "Integrity", source: "Original source", engine: "xelatex", realtime_epoch: "v2",
  main_filename: "entry.tex", files: [{ name: "chapters/one.tex", encoding: "utf8", content: "One" }],
  project_type: "blank", pinned: true, locked_files: [], locked_folders: [],
  created_at: "2026-01-01T00:00:00.000Z", updated_at: "2026-01-01T00:00:00.000Z" };
const storage = new MemoryR2();
const env = { STORAGE: storage };
let role = "editor", canShare = true, tests = 0;
const response = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json" } });
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, options = {}) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  const user = new Headers(options.headers || input?.headers).get("Authorization")?.includes(member) ? member : owner;
  if (url.pathname === "/auth/v1/user") return response({ id: user, email: "audit@example.invalid" });
  if (url.pathname === "/rest/v1/profiles") return response([{ id: user, status: "active", username: "\u6d4b\u8bd5", display_name: "\u5929\u56fd \ud83d\udc31" }]);
  if (url.pathname === "/rest/v1/tex_document_collaborators") return response(canShare ? [{ owner_id: owner, document_id: id, role }] : []);
  throw Error("Unexpected external request: " + url);
};
function reset(extra = {}) {
  storage.records.clear(); storage.writes.length = 0; storage.beforePut = null; role = "editor"; canShare = true;
  storage.seed(key, { ...structuredClone(original), ...extra }, { ownerId: owner, kind: "tex-document", realtimeEpoch: "v2" });
}
function request(path, method = "GET", body, user = owner, extraHeaders = {}) {
  return new Request(origin + path, { method, headers: { Origin: origin, "content-type": "application/json",
    Cookie: `__Host-qsseda-studio-access=${user}; __Secure-qsseda-account-id=${user}`, ...extraHeaders },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}
const payload = (extra = {}) => ({ title: "Integrity", engine: "xelatex", source: "Changed", realtime_epoch: "v2",
  storage_revision: storage.records.get(key)?.etag, ...extra });
async function check(name, run) { await run(); tests++; console.log("PASS " + name); }
async function core(method, body) { return handleTexApi(request(`/api/tex/documents?id=${id}`, method, body), env, "documents"); }
async function shared(body) { return handleTexSharedCollaboration(request(`/api/tex/collaboration/shared?document=${id}`, "PUT", body, member), env); }
try {
  await check("invalid and oversized main source is rejected without any write", async () => {
    for (const value of [undefined, null, 42, {}, [], "x".repeat(180001), "a\0b"]) {
      reset(); const r = await core("PUT", payload({ source: value }));
      assert.equal(r.status, 400, `source type ${typeof value}`); assert.equal(storage.writes.length, 0);
      assert.equal(storage.document(key).source, original.source);
    }
  });
  await check("stored legacy text is read without silent truncation", async () => {
    reset({ source: "x".repeat(180001) });
    const r = await core("GET"); assert.equal(r.status, 200);
    const data = await r.json(); assert.equal(data.document.source.length, 180001);
    assert.equal(data.document.storage_revision, storage.records.get(key).etag);
  });
  await check("owner save preserves project contents and returns new R2 revision", async () => {
    reset(); const old = storage.records.get(key).etag;
    const r = await core("PUT", payload()); assert.equal(r.status, 200);
    const data = await r.json(); assert.notEqual(data.document.storage_revision, old);
    assert.deepEqual(data.document.files, original.files);
    assert(!Object.hasOwn(storage.document(key), "storage_revision"), "R2 revision must not be persisted as authoritative JSON");
    assert.equal(storage.writes.at(-1).options.onlyIf.etagMatches, old);
  });
  await check("overlapping owner save cannot overwrite a parallel file update", async () => {
    reset(); storage.beforePut = async k => {
      if (k !== key) return; storage.beforePut = null;
      storage.seed(key, { ...original, source: "Remote change", files: [...original.files, { name: "new.tex", encoding: "utf8", content: "new" }] });
    };
    const r = await core("PUT", payload()); assert.equal(r.status, 409);
    assert.equal((await r.json()).code, "document_write_conflict");
    assert.equal(storage.document(key).source, "Remote change"); assert.equal(storage.document(key).files.length, 2);
  });
  await check("shared save respects canonical and renamed main-file locks", async () => {
    for (const locked of ["main.tex", "entry.tex"]) {
      reset({ locked_files: [locked] }); assert.equal((await shared(payload())).status, 423);
      assert.equal(storage.writes.length, 0);
    }
  });
  await check("shared writers cannot truncate source or bypass viewer membership", async () => {
    reset(); assert.equal((await shared(payload({ source: "x".repeat(180001) }))).status, 400);
    role = "viewer"; assert.equal((await shared(payload())).status, 403);
    canShare = false; assert.equal((await shared(payload())).status, 404); assert.equal(storage.writes.length, 0);
  });
  await check("shared save uses conditional R2 update", async () => {
    reset(); storage.beforePut = async k => {
      if (k !== key) return; storage.beforePut = null; storage.seed(key, { ...original, title: "New owner title" });
    };
    assert.equal((await shared(payload())).status, 409); assert.equal(storage.document(key).title, "New owner title");
  });
  await check("parent rename and delete cannot bypass descendant locks", async () => {
    for (const action of ["rename-folder", "delete-folder"]) {
      reset({ locked_files: ["chapters/one.tex"] });
      const r = await handleTexOrganize(request("/api/tex/organize", "POST", { document_id: id, action, name: "chapters", value: "lessons" }), env, owner);
      assert.equal(r.status, 423); assert.equal(storage.writes.length, 0);
    }
  });
  await check("renamed main entry can be locked and pinned", async () => {
    reset(); const r = await handleTexOrganize(request("/api/tex/organize", "POST", { document_id: id, action: "lock-file", name: "entry.tex", value: true }), env, owner);
    assert.equal(r.status, 200); assert.deepEqual(storage.document(key).locked_files, ["entry.tex"]);
  });
  await check("oversized replacement root cannot enter storage", async () => {
    reset({ main_deleted: true, source: "", main_filename: "main.tex" });
    const r = await handleTexProjectFiles(request("/api/tex/files", "POST", { document_id: id,
      files: [{ name: "main.tex", encoding: "utf8", content: "x".repeat(180001) }] }), env, owner);
    assert.equal(r.status, 413); assert.equal(storage.writes.length, 0); assert.equal(storage.document(key).main_deleted, true);
  });
  await check("file actions cannot erase an overlapping source save", async () => {
    reset(); storage.beforePut = async k => {
      if (k !== key) return; storage.beforePut = null; storage.seed(key, { ...original, source: "Concurrent main source" });
    };
    const r = await handleTexProjectFiles(request("/api/tex/files", "POST", { document_id: id,
      files: [{ name: "extra.tex", encoding: "utf8", content: "extra" }] }), env, owner);
    assert.equal(r.status, 409); assert.equal(storage.document(key).source, "Concurrent main source");
  });
  await check("historical restore cannot bypass a main-file lock", async () => {
    reset({ locked_files: ["entry.tex"] });
    const r = await handleTexVersionApi(request("/api/tex/versions?action=restore", "POST", { document_id: id, version_id: member }), env);
    assert.equal(r.status, 423); assert.equal(storage.document(key).source, original.source);
  });
  await check("native source save preserves attachments and project metadata", async () => {
    reset(); const r = await handleNativeWorkDocuments(new Request(origin + `/api/native/work/documents?id=${id}`, {
      method: "PUT", headers: { Authorization: `Bearer ${owner}`, "If-Match": storage.records.get(key).etag }, body: JSON.stringify(payload()) }), env);
    assert.equal(r.status, 200); const doc = storage.document(key);
    assert.deepEqual(doc.files, original.files); assert.equal(doc.pinned, true); assert.equal(doc.main_filename, "entry.tex");
    assert.notEqual(doc.realtime_epoch, "v2", "non-CRDT native source replacement must rebase old browser rooms");
    assert.equal(storage.records.get(key).customMetadata.realtimeEpoch, doc.realtime_epoch);
  });
  await check("native writes respect main-file lock and deletion", async () => {
    for (const [extra, status] of [[{locked_files:["entry.tex"]},423],[{main_deleted:true},409]]) {
      reset(extra); const r = await handleNativeWorkDocuments(new Request(origin + `/api/native/work/documents?id=${id}`, {
        method: "PUT", headers: { Authorization: `Bearer ${owner}`, "If-Match": storage.records.get(key).etag }, body: JSON.stringify(payload()) }), env);
      assert.equal(r.status, status); assert.equal(storage.writes.length, 0);
    }
  });
  await check("websocket rejects foreign, absent and null origins before auth", async () => {
    for (const value of ["https://evil.example", "null", ""]) {
      const r = await handleTexCollaborationRealtime(request(`/api/tex/collaboration/live?document=${id}`, "GET", undefined, owner,
        { Upgrade: "websocket", Origin: value }), env);
      assert.equal(r.status, 403);
    }
  });
  await check("Chinese and emoji identities survive the internal HTTP boundary", async () => {
    reset(); let captured;
    const socketEnv = { ...env, TEX_COLLAB_ROOMS: { idFromName: name => name, get: () => ({fetch: async r => {captured=r; return new Response(null,{status:204});}}) } };
    const r = await handleTexCollaborationRealtime(request(`/api/tex/collaboration/live?document=${id}`, "GET", undefined, owner, {Upgrade:"websocket"}), socketEnv);
    assert.equal(r.status, 204); assert.equal(decodeCollaborationIdentity(captured.headers.get("X-Qsseda-Collab-Display-Name")), "\u5929\u56fd \ud83d\udc31");
    assert.equal(decodeCollaborationIdentity("%invalid"), "");
  });
  console.log(`P0 integrity behavioral groups passed: ${tests}`);
} finally { globalThis.fetch = realFetch; }
