import { SUPABASE_KEY,SUPABASE_URL } from "./config.js";
import { verifyStudioApiSession } from "./session-gate.js";
import {
 validId,validToken,loadValidLink,resolveLinkGrant,readPublicDocument
} from "./tex-link-capabilities.js";
import { authorizedUser } from "./tex-link-sharing-api.js";

function escape(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function cacheHeaders(type="text/html;charset=UTF-8"){
 return {
  "content-type":type,
  "cache-control":"no-store, private, max-age=0",
  "referrer-policy":"no-referrer",
  "x-robots-tag":"noindex, nofollow, noarchive",
  "x-content-type-options":"nosniff",
  "x-frame-options":"DENY",
  "strict-transport-security":"max-age=31536000; includeSubDomains",
  "cross-origin-resource-policy":"same-origin",
  "permissions-policy":"camera=(), microphone=(), geolocation=(), payment=()",
  "content-security-policy":"default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"
 };
}
const fail=(message,status=404)=>new Response(message,{status,headers:cacheHeaders("text/plain;charset=UTF-8")});
const wrap=(body,status=200)=>new Response(body,{status,headers:cacheHeaders()});
function makeUrl(owner,doc,token,name){
 const url="/api/tex/link/download?owner="+encodeURIComponent(owner)+
 "&document="+encodeURIComponent(doc)+"&token="+encodeURIComponent(token);
 return url+(name?"&file="+encodeURIComponent(name):"");
}
async function sessionAccount(request){
 const session=await verifyStudioApiSession(request);
 if(!session.ok)return null;
 return authorizedUser(session.accessToken);
}
async function directMembership(userId,owner,doc,session){
 if(userId===owner)return {role:"owner"};
 if(!session?.ok)return null;
 try {
  const query="/rest/v1/tex_document_collaborators?select=role&owner_id=eq."+
    encodeURIComponent(owner)+"&document_id=eq."+encodeURIComponent(doc)+
    "&member_id=eq."+encodeURIComponent(userId)+"&limit=1";
  const response=await fetch(SUPABASE_URL+query,{
    headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+session.accessToken}
  });
  if(!response.ok)return null;
  const rows=await response.json();
  return Array.isArray(rows)&&rows[0] ? {role:rows[0].role==="editor"?"editor":"viewer"} : null;
 }catch{return null;}
}
async function effectiveViewAccess(request,env,config,owner,doc){
 const session=await verifyStudioApiSession(request);
 const account=session.ok?await authorizedUser(session.accessToken):null;
 const direct=account ? await directMembership(account.id,owner,doc,session) : null;
 const grant=account&&!direct ? await resolveLinkGrant(env,account.id,doc) : null;
 return {
  account,allowed:config.audience==="anyone"||Boolean(direct||grant),
  role:direct?.role||grant?.role||config.role,
  directlyAllowed:Boolean(direct||grant)
 };
}
function safeFilename(name){
 return /^[^\\\x00-\x1f\x7f]+$/.test(name)&&name.length<=140&&!name.includes("..")&&!name.startsWith("/")
  &&name.split("/").every(x=>x&&x!==".") ;
}
const mimeType=name=>/\.pdf$/i.test(name)?"application/pdf":/\.png$/i.test(name)?"image/png":/\.jpe?g$/i.test(name)?"image/jpeg":"text/plain;charset=UTF-8";
async function download(request,env){
 if(request.method!=="GET"&&request.method!=="HEAD")return fail("Method not allowed.",405);
 const url=new URL(request.url),q=url.searchParams;
 const owner=q.get("owner"),doc=q.get("document"),token=q.get("token");
 if(!validId(owner)||!validId(doc)||!validToken(token))return fail("Invalid sharing link.");
 const config=await loadValidLink(env,owner,doc,token);
 if(!config)return fail("This sharing link is unavailable.");
 const access=await effectiveViewAccess(request,env,config,owner,doc);
 if(!access.allowed)return fail("You do not have permission to download this file.",403);
 const document=await readPublicDocument(env,owner,doc);
 if(!document)return fail("Document not found.");
 let content="", filename="main.tex",binary=false;
 const name=q.get("file");
 if(name){
  if(!safeFilename(name))return fail("Invalid file.",400);
  const file=document.files.find(x=>x.name===name);
  if(!file)return fail("File not found.");
  filename=name.split("/").pop();binary=file.encoding==="base64";
  content=file.content;
 }else content=document.source;
 let bytes;
 try {
  bytes=binary?Uint8Array.from(atob(content),c=>c.charCodeAt(0)):new TextEncoder().encode(content);
 }catch{return fail("Stored file is invalid.",500);}
 const safe=filename.replace(/[^a-zA-Z0-9._-]/g,"_");
 const headers=cacheHeaders(mimeType(filename));
 headers["content-disposition"]='attachment; filename="'+safe+'"';
 headers["content-security-policy"]="default-src 'none'; sandbox";
 return new Response(request.method==="HEAD"?null:bytes,{headers});
}
function pageTemplate(config,doc,owner,token,access){
 const allow=access.allowed;
 const user=access.account;
 const editor=config.role==="editor";
 const title=allow?escape(doc.title):"受保护的 TeX 文档";
 const source=allow?escape(doc.source):"";
 const files=allow?doc.files.map(f=>'<a class="file" href="'+escape(makeUrl(owner,doc.id,token,f.name))+'"><span>📄 '+escape(f.name)+'</span><span>下载</span></a>').join(""):"";
 const visit="/zh-cn/d/"+doc.id;
 const status=allow?(access.directlyAllowed?'已拥有该文档的访问权限':editor?'持有链接者可以查看。登录后可加入编辑。':'持有链接者可以查看和下载。'):
   config.request_access?"此文档仅限受邀成员访问。你可以申请访问并等待所有者批准。":"此文档仅限受邀成员访问。";
 const cta=allow ?
   (access.directlyAllowed?'<a class="button primary" href="'+escape(visit)+'">在 AERTEX Work 中打开</a>':
     '<button class="button primary" id="join" type="button">'+
       (editor?'登录并加入编辑':'在工作台中只读打开')+'</button>'):
   config.request_access?'<button class="button primary" id="request" type="button">请求访问权限</button>':'';
 const meta=JSON.stringify({owner_id:owner,document_id:doc.id,token}).replace(/</g,"\\u003c");
 return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><meta name="robots" content="noindex,nofollow"><title>${title} · AERTEX Work</title>
 <style>:root{color-scheme:light dark}*{box-sizing:border-box}body{margin:0;background:#121317;color:#f3f4f7;font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}main{max-width:860px;margin:40px auto;padding:0 16px}.card{background:#202126;border:1px solid #393a43;border-radius:20px;padding:26px;box-shadow:0 14px 40px #0002}header{display:flex;align-items:center;gap:13px;margin-bottom:24px}.logo{display:grid;place-items:center;width:40px;height:40px;background:#9db2ff;color:#171821;border-radius:13px;font-weight:900}h1{font-size:23px;line-height:1.3;margin:0;overflow-wrap:anywhere}small{color:#a5a7b4}.info{padding:14px;background:#2a2b31;border-radius:12px;color:#cbcdd6;margin-bottom:18px}.actions{display:flex;gap:9px;flex-wrap:wrap;margin:20px 0}.button{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:9px 16px;border-radius:10px;border:1px solid #565967;background:#303139;color:#fafbff;text-decoration:none;font:inherit;font-weight:650;cursor:pointer}.button.primary{background:#9db2ff;border-color:#9db2ff;color:#171821}.button:focus-visible{outline:3px solid #b6c5ff;outline-offset:2px}#status{min-height:26px;font-size:13px;color:#b2c2ff}h2{font-size:15px;margin:24px 0 9px}pre{white-space:pre-wrap;overflow-wrap:anywhere;max-height:500px;overflow:auto;background:#121317;border:1px solid #3b3c48;border-radius:12px;padding:18px;font:13px/1.6 ui-monospace,SFMono-Regular,Consolas,monospace}.file{display:flex;justify-content:space-between;gap:12px;padding:11px 12px;color:#d9e1ff;text-decoration:none;border-bottom:1px solid #363740;overflow-wrap:anywhere}@media(max-width:600px){main{margin:14px auto}.card{padding:18px;border-radius:15px}h1{font-size:19px}}</style></head><body><main><div class="card"><header><div class="logo">A</div><div><h1>${title}</h1><small>AERTEX Work · 文档共享</small></div></header><p class="info">${escape(status)}</p><div class="actions">${cta}${allow?'<a class="button" href="'+escape(makeUrl(owner,doc.id,token))+'">下载 main.tex</a>':''}<a class="button" href="/zh-cn/tex">前往工作台</a></div><div id="status" role="status" aria-live="polite"></div>${allow?'<h2>源文件预览</h2><pre>'+source+'</pre>':''}${files?'<h2>项目附件</h2>'+files:''}<small>分享链接只对获得链接的人开放。所有者可以随时停用或重置链接。</small></div></main><script>(()=>{const m=${meta};for(const [id,action] of [['join','redeem'],['request','request']]){const button=document.getElementById(id);if(!button)continue;button.addEventListener('click',async()=>{button.disabled=true;const status=document.getElementById('status');status.textContent='正在验证账户与权限…';try{const response=await fetch('/api/tex/link?action='+action,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(m)});const data=await response.json().catch(()=>({}));if(response.status===401){status.textContent='请先登录 AERTEX 账户，然后重新打开此分享链接。';return;}if(!response.ok)throw new Error(data.error||'操作失败');if(action==='redeem')location.href='/zh-cn/d/'+m.document_id;else status.textContent='访问请求已发送，等待文档所有者审批。';}catch(e){status.textContent=e.message||'操作失败';}finally{button.disabled=false;}});}})();</script></body></html>`;
}
export async function handleTexLinkPublic(request,env){
 if(!env?.STORAGE)return fail("Storage unavailable.",503);
 const path=new URL(request.url).pathname;
 if(path.startsWith("/api/tex/link/download"))return download(request,env);
 if(request.method!=="GET"&&request.method!=="HEAD")return fail("Method not allowed.",405);
 const hit=path.match(/^\/share\/tex\/([0-9a-f-]{36})\/([0-9a-f-]{36})\/([A-Za-z0-9_-]{43})\/?$/i);
 if(!hit)return fail("Invalid sharing link.");
 const [,owner,doc,token]=hit;
 if(!validId(owner)||!validId(doc)||!validToken(token))return fail("Invalid sharing link.");
 try{
  const config=await loadValidLink(env,owner,doc,token);
  if(!config)return fail("Sharing link expired or disabled.");
  const document=await readPublicDocument(env,owner,doc);
  if(!document)return fail("Document not found.");
  const access=await effectiveViewAccess(request,env,config,owner,doc);
  const page=pageTemplate(config,document,owner,token,access);
  return request.method==="HEAD"?new Response(null,{headers:cacheHeaders()}):wrap(page);
 }catch{return fail("Could not open sharing link.",503);}
}
