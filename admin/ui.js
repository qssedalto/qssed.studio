const NAV = [
  ["/", "Overview", "OV"],
  ["/users", "Users", "US"],
  ["/roles", "Roles & permissions", "RL"],
  ["/access", "Access control", "AC"],
  ["/intelligence", "Intelligence", "AI"],
  ["/logs", "Audit logs", "LG"],
  ["/system", "System", "SY"]
];

export function renderAdminConsole(route, options = {}) {
  const current = NAV.some(([path]) => path === route) ? route : "/";
  const identity = escapeHtml(options.identity || "Administrator");
  const root = escapeHtml(options.root || "qsseda.com");
  const build = escapeHtml(options.build || "control-plane-v1");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="color-scheme" content="dark">
<title>AERTEX Administration</title>
<style>
:root{
  color-scheme:dark;
  --bg:#090c10;--panel:#0e1319;--panel2:#121820;--line:#27313c;--line2:#1b232c;
  --text:#e8edf3;--muted:#8b98a7;--quiet:#657281;--accent:#78a9ff;--good:#50d890;
  --warn:#f0b35d;--bad:#ff6b6b;--code:#0a1016;
  font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
}
*{box-sizing:border-box}
html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text)}
body{font-size:13px}
button,input,select,textarea{font:inherit}
.app{min-height:100vh;display:grid;grid-template-columns:238px minmax(0,1fr)}
.side{position:sticky;top:0;height:100vh;border-right:1px solid var(--line);background:#0b0f14;padding:14px 12px;display:flex;flex-direction:column;gap:14px}
.brand{padding:8px 10px 12px;border-bottom:1px solid var(--line2)}
.brand strong{display:block;font-size:14px;letter-spacing:.09em}
.brand span{display:block;margin-top:5px;color:var(--quiet);font:10px ui-monospace,SFMono-Regular,Menlo,monospace}
.env{display:flex;align-items:center;gap:8px;margin:0 10px;padding:8px 10px;border:1px solid #2a3a2f;background:#0d1711;color:#9deab9;font:10px ui-monospace,SFMono-Regular,Menlo,monospace}
.env:before{content:"";width:7px;height:7px;border-radius:50%;background:var(--good)}
nav{display:grid;gap:3px}
nav a{display:grid;grid-template-columns:28px 1fr;align-items:center;min-height:38px;padding:0 9px;color:var(--muted);text-decoration:none;border:1px solid transparent}
nav a b{font:10px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--quiet)}
nav a:hover{background:var(--panel)}
nav a.active{color:var(--text);background:var(--panel2);border-color:var(--line)}
.sidefoot{margin-top:auto;padding:10px;color:var(--quiet);font:10px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}
.sidefoot button{margin-top:10px;width:100%;height:34px;border:1px solid var(--line);background:transparent;color:var(--muted);cursor:pointer}
.main{min-width:0}
.top{height:54px;position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:14px;padding:0 20px;border-bottom:1px solid var(--line);background:rgba(9,12,16,.92);backdrop-filter:blur(16px)}
.top .path{font:11px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--quiet)}
.top .who{margin-left:auto;color:var(--muted);font-size:11px}
.content{padding:22px;max-width:1500px;margin:0 auto}
.head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:18px}
.head h1{margin:0;font-size:24px;letter-spacing:-.025em}
.head p{margin:6px 0 0;color:var(--muted);line-height:1.5}
.tools{display:flex;gap:8px}
.btn{height:34px;padding:0 12px;border:1px solid var(--line);background:var(--panel2);color:var(--text);cursor:pointer}
.btn.primary{border-color:#355b93;background:#15335b;color:#d7e7ff}
.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.card{border:1px solid var(--line);background:var(--panel);padding:14px}
.metric small{display:block;color:var(--quiet);font:10px ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;letter-spacing:.06em}
.metric strong{display:block;margin-top:8px;font-size:24px;letter-spacing:-.03em}
.section{margin-top:12px;border:1px solid var(--line);background:var(--panel)}
.sectionHead{min-height:42px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 13px;border-bottom:1px solid var(--line)}
.sectionHead h2{margin:0;font-size:12px;letter-spacing:.02em}
.state{padding:30px 14px;color:var(--muted)}
.tableWrap{overflow:auto}
table{border-collapse:collapse;width:100%;min-width:760px}
th,td{text-align:left;padding:9px 11px;border-bottom:1px solid var(--line2);vertical-align:top}
th{position:sticky;top:0;background:#10161d;color:var(--quiet);font:10px ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase}
td{font-size:11px;color:#cfd6df}
td.mono,.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
pre{margin:0;padding:14px;overflow:auto;background:var(--code);color:#c5d2df;font:11px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace}
.form{display:grid;grid-template-columns:1.3fr .7fr 1fr 1.5fr auto;gap:8px;padding:12px}
.form input,.form select{height:34px;border:1px solid var(--line);background:#0b1016;color:var(--text);padding:0 9px;min-width:0}
.split{display:grid;grid-template-columns:1.2fr .8fr;gap:12px}
.badge{display:inline-block;padding:3px 6px;border:1px solid var(--line);font:9px ui-monospace,SFMono-Regular,Menlo,monospace}
.badge.ok{border-color:#235d3c;color:#8de5ad;background:#0e1b14}
.badge.bad{border-color:#6a3030;color:#ff9999;background:#1c1010}
@media(max-width:1000px){.app{grid-template-columns:1fr}.side{position:static;height:auto;border-right:0;border-bottom:1px solid var(--line)}nav{grid-template-columns:repeat(3,minmax(0,1fr))}.sidefoot{display:none}.grid{grid-template-columns:repeat(2,1fr)}.split{grid-template-columns:1fr}.form{grid-template-columns:1fr 1fr}.form .wide{grid-column:1/-1}}
@media(max-width:560px){.content{padding:14px}.grid{grid-template-columns:1fr 1fr}nav{grid-template-columns:1fr 1fr}.head{align-items:flex-start;display:grid}.form{grid-template-columns:1fr}}
</style>
</head>
<body data-route="${escapeHtml(current)}">
<div class="app">
  <aside class="side">
    <div class="brand"><strong>AERTEX ADMIN</strong><span>CONTROL PLANE · ${build}</span></div>
    <div class="env">PRODUCTION · ${root}</div>
    <nav>
      ${NAV.map(([path,label,code])=>`<a href="${path}" class="${path===current?"active":""}"><b>${code}</b><span>${escapeHtml(label)}</span></a>`).join("")}
    </nav>
    <div class="sidefoot">
      <div>${identity}</div>
      <div>Administrative surface isolated from user products.</div>
      <button id="logout" type="button">Close admin session</button>
    </div>
  </aside>
  <main class="main">
    <header class="top"><span class="path">admin://${escapeHtml(current === "/" ? "overview" : current.slice(1))}</span><span class="who">${identity}</span></header>
    <div class="content">
      <div class="head">
        <div><h1 id="pageTitle">Loading…</h1><p id="pageDescription">Reading administrative state.</p></div>
        <div class="tools"><button class="btn" id="refresh" type="button">Refresh</button></div>
      </div>
      <div id="view"><div class="state">Loading control-plane data…</div></div>
    </div>
  </main>
</div>
<script>
(()=> {
  const route=document.body.dataset.route||"/";
  const view=document.getElementById("view");
  const title=document.getElementById("pageTitle");
  const description=document.getElementById("pageDescription");
  const pageMeta={
    "/":["System overview","Operational status and administrator-only metrics."],
    "/users":["Users","Accounts, status, and role assignments."],
    "/roles":["Roles & permissions","Administrative role and permission matrix."],
    "/logs":["Audit logs","Administrative and account-change audit events."],
    "/access":["Access control","Device exemptions and access-audit telemetry."],
    "/intelligence":["Intelligence","Provider, model, and user-access administration."],
    "/system":["System","Control-plane health and deployment context."]
  };
  [title.textContent,description.textContent]=pageMeta[route]||pageMeta["/"];

  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const scalar=v=>v==null?"—":typeof v==="object"?JSON.stringify(v):String(v);
  async function post(path,body={}){
    const r=await fetch(path,{method:"POST",credentials:"same-origin",cache:"no-store",headers:{"content-type":"application/json;charset=UTF-8",accept:"application/json"},body:JSON.stringify(body)});
    const data=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(data.error||("HTTP "+r.status));
    return data;
  }
  async function get(path){
    const r=await fetch(path,{credentials:"same-origin",cache:"no-store",headers:{accept:"application/json"}});
    const data=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(data.error||("HTTP "+r.status));
    return data;
  }
  function table(rows){
    const list=Array.isArray(rows)?rows:[];
    if(!list.length)return '<div class="state">No records.</div>';
    const cols=[...new Set(list.flatMap(row=>Object.keys(row||{})))].slice(0,12);
    return '<div class="tableWrap"><table><thead><tr>'+cols.map(c=>'<th>'+esc(c)+'</th>').join('')+'</tr></thead><tbody>'+
      list.map(row=>'<tr>'+cols.map(c=>'<td class="'+(/id|uuid|time|date|email|ip/i.test(c)?"mono":"")+'">'+esc(scalar(row?.[c]))+'</td>').join('')+'</tr>').join('')+
      '</tbody></table></div>';
  }
  function objCards(obj){
    const entries=Object.entries(obj||{});
    if(!entries.length)return '<div class="state">No metrics.</div>';
    return '<div class="grid">'+entries.slice(0,12).map(([k,v])=>'<article class="card metric"><small>'+esc(k)+'</small><strong>'+esc(typeof v==="object"?(Array.isArray(v)?v.length:"…"):v)+'</strong></article>').join('')+'</div>';
  }
  function errorView(error){view.innerHTML='<div class="section"><div class="state">Control-plane request failed: '+esc(error?.message||error)+'</div></div>'}

  async function overview(){
    const result=await post("/api/admin/overview");
    const data=result.data||{};
    view.innerHTML=objCards(data)+'<section class="section"><div class="sectionHead"><h2>Raw administrative overview</h2></div><pre>'+esc(JSON.stringify(data,null,2))+'</pre></section>';
  }
  async function users(){
    const result=await post("/api/admin/users");
    const rows=Array.isArray(result.data)?result.data:(result.data?.users||[]);
    view.innerHTML='<section class="section"><div class="sectionHead"><h2>Accounts</h2></div>'+table(rows)+'</section>';
  }
  async function roles(){
    const result=await post("/api/admin/roles");
    const rows=Array.isArray(result.data)?result.data:(result.data?.roles||[]);
    view.innerHTML='<section class="section"><div class="sectionHead"><h2>Permission matrix</h2></div>'+table(rows)+'</section>';
  }
  async function logs(){
    const result=await post("/api/admin/logs",{p_limit:120});
    const rows=Array.isArray(result.data)?result.data:(result.data?.logs||[]);
    view.innerHTML='<section class="section"><div class="sectionHead"><h2>Recent events</h2></div>'+table(rows)+'</section>';
  }
  async function access(){
    const [exemptions,auditSummary,auditList]=await Promise.all([
      post("/api/admin/device-exemptions"),
      post("/api/admin/access-audit",{action:"summary"}),
      post("/api/admin/access-audit",{action:"list",limit:80,filters:{}})
    ]);
    const rows=Array.isArray(exemptions.data)?exemptions.data:[];
    const auditRows=Array.isArray(auditList.entries)?auditList.entries:[];
    view.innerHTML='<div class="split"><section class="section"><div class="sectionHead"><h2>Huawei device ID exemptions</h2></div>'+table(rows)+'</section>'+
      '<section class="section"><div class="sectionHead"><h2>Access audit summary</h2></div><pre>'+esc(JSON.stringify(auditSummary.summary||{},null,2))+'</pre></section></div>'+
      '<section class="section"><div class="sectionHead"><h2>Grant or revoke account exemption</h2></div><form class="form" id="exemptionForm">'+
      '<input name="user" placeholder="User UUID" required><select name="enabled"><option value="true">Grant</option><option value="false">Revoke</option></select><input name="expires" placeholder="Expiration ISO (optional)"><input class="wide" name="note" placeholder="Administrative note"><button class="btn primary" type="submit">Apply</button></form></section>'+
      '<section class="section"><div class="sectionHead"><h2>Recent access-audit events</h2></div>'+table(auditRows)+'</section>';
    document.getElementById("exemptionForm")?.addEventListener("submit",async event=>{
      event.preventDefault();const fd=new FormData(event.currentTarget);
      try{
        await post("/api/admin/device-exemption",{p_user_id:String(fd.get("user")||"").trim(),p_enabled:fd.get("enabled")==="true",p_expires_at:String(fd.get("expires")||"").trim()||null,p_note:String(fd.get("note")||"").trim()||null});
        await access();
      }catch(error){alert(error.message)}
    });
  }
  async function intelligence(){
    const state=await get("/api/admin/ai/state?fast=1");
    view.innerHTML=objCards({providers:Array.isArray(state.providers)?state.providers.length:0,users:Array.isArray(state.users)?state.users.length:0})+
      '<div class="split"><section class="section"><div class="sectionHead"><h2>Providers</h2></div>'+table(state.providers||[])+'</section>'+
      '<section class="section"><div class="sectionHead"><h2>User AI access</h2></div>'+table(state.users||[])+'</section></div>';
  }
  async function system(){
    const health=await get("/health");
    const overviewResult=await post("/api/admin/overview").catch(()=>({data:{}}));
    view.innerHTML=objCards({service:health.service||"admin",status:health.status||"unknown",origin:health.origin||location.origin,time:health.time||"—"})+
      '<section class="section"><div class="sectionHead"><h2>Control plane</h2></div><pre>'+esc(JSON.stringify({health,overview:overviewResult.data||{}},null,2))+'</pre></section>';
  }
  const loaders={"/":overview,"/users":users,"/roles":roles,"/logs":logs,"/access":access,"/intelligence":intelligence,"/system":system};
  async function load(){view.innerHTML='<div class="state">Loading control-plane data…</div>';try{await (loaders[route]||overview)()}catch(error){errorView(error)}}
  document.getElementById("refresh")?.addEventListener("click",()=>void load());
  document.getElementById("logout")?.addEventListener("click",async()=>{
    await fetch("/api/auth/logout",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:"{}"}).catch(()=>{});
    location.replace("/");
  });
  void load();
})();
</script>
</body></html>`;
}

export function hiddenAdminNotFound() {
  return new Response("Not found.", {
    status: 404,
    headers: {
      "content-type": "text/plain;charset=UTF-8",
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
      "x-robots-tag": "noindex, nofollow, noarchive, nosnippet"
    }
  });
}

export function adminHtml(markup, status = 200) {
  return new Response(markup, {
    status,
    headers: {
      "content-type": "text/html;charset=UTF-8",
      "cache-control": "private, no-store",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
      "x-robots-tag": "noindex, nofollow, noarchive, nosnippet",
      "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
      "content-security-policy": "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
    }
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
