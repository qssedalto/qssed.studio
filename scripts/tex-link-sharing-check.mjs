import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 newSecret,validToken,constantTimeToken,loadConfig,loadValidLink,resolveLinkGrant,
 readPublicDocument,documentKey,shareKey,grantKey,putJson,requestPrefix
} from "../studio/tex-link-capabilities.js";
import {handleTexLinkPublic} from "../studio/tex-link-public.js";
import {enhanceWorkTexCollaboration} from "../studio/ui-work-tex-collaboration-instant.js";
import {texWorkbenchContent} from "../studio/ui-tex-workbench.js";
import {enhanceTexWorkbenchLocal} from "../studio/ui-tex-local.js";
import {polishTexWorkbenchApp} from "../studio/ui-tex-app.js";

const owner="11111111-1111-4111-8111-111111111111";
const user="22222222-2222-4222-8222-222222222222";
const outsider="33333333-3333-4333-8333-333333333333";
const doc="44444444-4444-4444-8444-444444444444";
const wrongDoc="55555555-5555-4555-8555-555555555555";
const store=new Map();
const env={STORAGE:{
  async get(key){return store.has(key)?{text:async()=>JSON.stringify(store.get(key))}:null;},
  async head(key){return store.has(key)?{key,customMetadata:store.get(key)?.meta||{}}:null;},
  async put(key,text){store.set(key,JSON.parse(text));},
  async list({prefix,limit}){return{objects:[...store.keys()].filter(x=>x.startsWith(prefix)).slice(0,limit||1000).map(key=>({key}))};}
}};
const token=newSecret(), second=newSecret();
assert(validToken(token)&&validToken(second));
assert.equal(token.length,43);
assert.notEqual(token,second);
assert(constantTimeToken(token,token));
assert(!constantTimeToken(token,second));
assert(!constantTimeToken(token,"a"));

const baseDoc={owner_id:owner,id:doc,title:"Statistical TeX & notes",
  source:"% private mark\n\\documentclass{article}\n\\begin{document}Hello\\end{document}",
  files:[
    {name:"references.bib",encoding:"utf8",content:"@book{one,title={Hello}}"},
    {name:"photo.png",encoding:"base64",content:Buffer.from([137,80,78,71,13,10,26,10]).toString("base64")}
  ]};
await putJson(env,documentKey(owner,doc),baseDoc);
const initial={owner_id:owner,document_id:doc,token,revision:crypto.randomUUID(),
  enabled:true,audience:"selected",role:"editor",request_access:true};
await putJson(env,shareKey(owner,doc),initial);
assert.equal((await loadConfig(env,owner,doc)).token,token);
assert.equal((await loadValidLink(env,owner,doc,token)).audience,"selected");
assert.equal(await loadValidLink(env,owner,doc,second),null);
assert.equal(await loadValidLink(env,owner,wrongDoc,token),null);
assert.equal(await resolveLinkGrant(env,user,doc),null);

const approved={member_id:user,owner_id:owner,document_id:doc,
  revision:initial.revision,kind:"approved",role:"viewer"};
await putJson(env,grantKey(user,doc),approved);
assert.equal((await resolveLinkGrant(env,user,doc)).role,"viewer");
assert.equal(await resolveLinkGrant(env,outsider,doc),null);
assert.equal((await readPublicDocument(env,owner,doc)).files.length,2);
const link="https://work.qsseda.com/share/tex/"+owner+"/"+doc+"/"+token;
const selectedHtml=await handleTexLinkPublic(new Request(link),env);
assert.equal(selectedHtml.status,200);
const hidden=await selectedHtml.text();
assert(!hidden.includes("private mark"),"Restricted link must not reveal source without membership.");
assert(hidden.includes("请求访问权限"),"Restricted link must offer request access.");
const selectedDownload=await handleTexLinkPublic(new Request(
  "https://work.qsseda.com/api/tex/link/download?owner="+owner+"&document="+doc+"&token="+token),env);
assert.equal(selectedDownload.status,403,"Selected-user link must not allow anonymous downloads.");

const anyone={...initial,audience:"anyone",request_access:false,role:"viewer",revision:crypto.randomUUID()};
await putJson(env,shareKey(owner,doc),anyone);
assert.equal(await resolveLinkGrant(env,user,doc),null,"Changing audience invalidates prior approved grants.");
const publicHtml=await handleTexLinkPublic(new Request(link),env);
assert.equal(publicHtml.status,200);
assert((await publicHtml.text()).includes("private mark"),"Public-view link should render escaped source.");
const downloaded=await handleTexLinkPublic(new Request(
  "https://work.qsseda.com/api/tex/link/download?owner="+owner+"&document="+doc+"&token="+token),env);
assert.equal(downloaded.status,200);
assert((await downloaded.text()).includes("private mark"));
assert.equal(downloaded.headers.get("referrer-policy"),"no-referrer");
assert.equal(downloaded.headers.get("cache-control").includes("no-store"),true);
const bib=await handleTexLinkPublic(new Request(
  "https://work.qsseda.com/api/tex/link/download?owner="+owner+"&document="+doc+
  "&token="+token+"&file=references.bib"),env);
assert.equal(bib.status,200);
assert((await bib.text()).startsWith("@book"));
const invalidFile=await handleTexLinkPublic(new Request(
  "https://work.qsseda.com/api/tex/link/download?owner="+owner+"&document="+doc+
  "&token="+token+"&file=../secret.tex"),env);
assert.equal(invalidFile.status,400);

const linkGrant={...approved,kind:"link",revision:anyone.revision};
await putJson(env,grantKey(user,doc),linkGrant);
assert.equal((await resolveLinkGrant(env,user,doc)).role,"viewer");
await putJson(env,shareKey(owner,doc),{...anyone,role:"editor"});
assert.equal((await resolveLinkGrant(env,user,doc)).role,"editor");
await putJson(env,shareKey(owner,doc),{...anyone,enabled:false});
assert.equal(await resolveLinkGrant(env,user,doc),null,"Disabling link must revoke link-derived access.");
assert.equal((await handleTexLinkPublic(new Request(link),env)).status,404);
await putJson(env,shareKey(owner,doc),{...anyone,token:second,revision:crypto.randomUUID()});
assert.equal((await handleTexLinkPublic(new Request(link),env)).status,404,"Rotating must revoke old URL.");
assert.equal(await resolveLinkGrant(env,user,doc),null,"Rotating must revoke previous generation grants.");
assert.equal((await handleTexLinkPublic(new Request(
 "https://work.qsseda.com/share/tex/"+owner+"/"+doc+"/"+second),env)).status,200);

for(const zh of [true,false]){
 const markup=enhanceWorkTexCollaboration(
   polishTexWorkbenchApp(enhanceTexWorkbenchLocal(texWorkbenchContent(zh),zh),zh),zh);
 assert(markup.includes('id="qsseda-tex-link-runtime"'),"Link wizard must mount.");
 for(const item of ['tex-link-enabled','tex-link-requests','tex-link-copy','tex-link-rotate',
  'tex-link-visit','tex-link-request-list','tex-link-audience','tex-link-role']){
  assert(markup.includes(item),"Missing link sharing control "+item);
 }
 const script=markup.match(/<script id="qsseda-tex-link-runtime">([\s\S]*?)<\/script>/);
 assert(script,"Runtime script missing.");
 assert.doesNotThrow(()=>new Function(script[1]),"Rendered runtime must parse in browser.");
 assert(markup.includes('qsseda:tex-collaboration-page'),"Step navigation must activate link page.");
}
const ui=readFileSync(new URL("../studio/ui-work-tex-link-sharing.js",import.meta.url),"utf8");
const api=readFileSync(new URL("../studio/tex-link-sharing-api.js",import.meta.url),"utf8");
const socket=readFileSync(new URL("../studio/tex-collaboration-room.js",import.meta.url),"utf8");
const realtime=readFileSync(new URL("../studio/tex-collaboration-realtime.js",import.meta.url),"utf8");
const shared=readFileSync(new URL("../studio/tex-collaboration-shared.js",import.meta.url),"utf8");
assert(ui.includes("stopImmediatePropagation"),"Link saving must not change members.");
assert(api.includes("sameOrigin(request)"),"All sharing mutations require same-origin.");
assert(api.includes("await owned(env,user.id,doc)"),"Only the owner may update link settings.");
assert(api.includes('status:"pending"'),"Access requests must be persisted.");
assert(api.includes('kind:"approved"'),"Request approval must persist a scoped grant.");
assert(socket.includes("resolveLinkGrant(this.env"),"WebSocket writes must recheck link authorization.");
assert(socket.includes("/revoke-links"),"Owner revocation must terminate connected link users.");
assert(socket.includes("X-Qsseda-Collab-Target"),"Single-member revocation must target only that member's socket.");
assert(api.includes('decision:"revoke"') || api.includes('body.decision==="revoke"'),"Owner must be able to revoke an approved grant.");
assert(api.includes('env.STORAGE.delete(grantKey(requester,doc))'),"Revocation must delete the owner-scoped grant index.");
assert(ui.includes('tex-link-approved-list'),"Link settings must render the approved members list.");
assert(ui.includes('tex-link-rotate'),"Owner must be able to invalidate previously issued links.");

assert(realtime.includes('X-Qsseda-Collab-Link-Grant'),"Realtime gateway must tag grant sessions.");
assert(shared.includes("resolveLinkGrant(env"),"Shared editor must verify link grants.");
console.log("TeX link-sharing: token validation, selected/anyone ACL, viewer downloads, approval grants, revocation, browser runtime syntax and realtime guards passed.");
