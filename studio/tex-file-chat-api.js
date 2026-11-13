// Authenticated per-project encrypted chat gateway. This endpoint owns all
// document ACL checks, so the Durable Object never trusts browser claims.
import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { json } from "./routing.js";
import { verifyStudioApiSession, withStudioSessionCookies } from "./session-gate.js";
import { hasStorageBinding } from "./storage-api.js";
import { resolveDocumentAccess,verifyActiveUser,documentKey,cleanObjectId } from "./tex-collaboration-realtime.js";
import { hashText } from "./tex-file-chat-webauthn.js";

const MAX_REQUEST=20000;
const safeResponse=(data,status)=>json(data,status);

export async function handleTexFileChatApi(request,env) {
  if(request.method!=="POST")return safeResponse({error:"Method not allowed"},405);
  const url=new URL(request.url);
  if(!/^work\.qsseda\.(com|studio)$/.test(url.hostname))return safeResponse({error:"Work host required"},403);
  if(request.headers.get("Origin")!==url.origin)return safeResponse({error:"Same-origin request required"},403);
  if(!/^application\/json\b/i.test(request.headers.get("Content-Type")||""))
    return safeResponse({error:"JSON required"},415);
  if(!env?.TEX_COLLAB_ROOMS?.idFromName||!hasStorageBinding(env))
    return safeResponse({error:"Encrypted collaboration unavailable"},503);
  const session=await verifyStudioApiSession(request);
  if(!session.ok)return withStudioSessionCookies(safeResponse({error:"Authentication required"},401),session.cookies);
  const auth=await verifyActiveUser(session.accessToken);
  if(auth.error)return withStudioSessionCookies(auth.error,session.cookies);
  let body;
  try{
    const raw=await request.text();
    if(new TextEncoder().encode(raw).length>MAX_REQUEST)throw Error("too large");
    body=JSON.parse(raw);
    if(!body||typeof body!=="object"||Array.isArray(body))throw Error("bad body");
  }catch{return withStudioSessionCookies(safeResponse({error:"Invalid chat request"},400),session.cookies)}
  const documentId=cleanObjectId(body.document_id);
  if(!documentId)
    return withStudioSessionCookies(safeResponse({error:"Invalid project identifier"},400),session.cookies);
  const access=await resolveDocumentAccess(env,auth.user.id,documentId,session.accessToken);
  if(!access)return withStudioSessionCookies(safeResponse({error:"Document access denied"},404),session.cookies);
  // Link-only visitors must become named collaborators before exchanging
  // persistent encrypted keys. A shareable read link is not a chat invitation.
  if(access.via_link===true)return withStudioSessionCookies(
    safeResponse({error:"Join as a named collaborator before using encrypted chat"},403),session.cookies);
  const ownerId=access.owner_id;
  try{
    const stored=await env.STORAGE.get(documentKey(ownerId,documentId));
    if(!stored)return withStudioSessionCookies(safeResponse({error:"Project missing"},404),session.cookies);
  }catch{return withStudioSessionCookies(safeResponse({error:"Project temporarily unavailable"},503),session.cookies)}
  const allowed=new Set([ownerId,auth.user.id]);
  if(access.role==="owner"){
    // Only live named members can receive new encryption key envelopes.
    // Fail closed rather than share to stale/removed collaborators.
    try{
      const r=await fetch(SUPABASE_URL+"/rest/v1/rpc/tex_collaboration_participants",{
        method:"POST",
        headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+session.accessToken,
          "content-type":"application/json",accept:"application/json"},
        body:JSON.stringify({p_owner_id:ownerId,p_document_id:documentId})
      });
      if(!r.ok)return withStudioSessionCookies(safeResponse({error:"Collaboration member verification unavailable"},503),session.cookies);
      const members=await r.json();
      if(!Array.isArray(members)||members.length>95)
        return withStudioSessionCookies(safeResponse({error:"Collaboration member list unavailable"},503),session.cookies);
      for(const item of members){
        if(cleanObjectId(item.participant_id))allowed.add(item.participant_id);
      }
    }catch{return withStudioSessionCookies(safeResponse({error:"Collaboration member verification unavailable"},503),session.cookies)}
  }
  const projectHash=await hashText("project-chat-v2:"+ownerId+":"+documentId);
  const room=env.TEX_COLLAB_ROOMS.get(env.TEX_COLLAB_ROOMS.idFromName(ownerId+":"+documentId));
  const headers=new Headers({"content-type":"application/json",
    "X-Qsseda-Chat-User":auth.user.id,
    "X-Qsseda-Chat-Owner":ownerId,
    "X-Qsseda-Chat-Project":projectHash,
    "X-Qsseda-Chat-Rp":url.hostname,
    "X-Qsseda-Chat-Origin":url.origin,
    "X-Qsseda-Chat-Role":access.role,
    "X-Qsseda-Chat-Username":String(auth.profile?.username||"").replace(/[^a-zA-Z0-9_.-]/g,"").slice(0,40),
    "X-Qsseda-Chat-Display-Name":encodeURIComponent(String(auth.profile?.display_name||"").replace(/[\u0000-\u001f\u007f]/g," ").trim().slice(0,80)),
    "X-Qsseda-Chat-Allowed":[...allowed].join(",")});
  // The server alone derives the project chat identity; file_name is ignored.
  // The new v2 room namespace does not overwrite any legacy per-file ciphertext.
  const forwarded={...body};
  delete forwarded.document_id;delete forwarded.file_name;
  try{
    const response=await room.fetch(new Request("https://tex-collaboration-room.internal/file-chat",{
      method:"POST",headers,body:JSON.stringify(forwarded)
    }));
    return withStudioSessionCookies(response,session.cookies);
  }catch{
    return withStudioSessionCookies(safeResponse({error:"Encrypted chat temporarily unavailable"},503),session.cookies);
  }
}
