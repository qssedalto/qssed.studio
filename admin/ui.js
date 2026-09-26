const NAV = [
  ["/", "总览", "OV"],
  ["/users", "用户", "US"],
  ["/roles", "角色与权限", "RL"],
  ["/access", "访问控制", "AC"],
  ["/content", "内容", "CT"],
  ["/storage", "存储", "ST"],
  ["/intelligence", "AI 管理", "AI"],
  ["/logs", "审计日志", "LG"],
  ["/system", "系统", "SY"]
];

export function renderAdminConsole(route, options = {}) {
  const current = NAV.some(([path]) => path === route) ? route : "/";
  const identity = escapeHtml(options.identity || "管理员");
  const root = escapeHtml(options.root || "qsseda.com");
  const build = escapeHtml(options.build || "control-plane-v1");

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="color-scheme" content="dark">
<title>AERTEX 管理控制台</title>
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
.btn.danger{border-color:#6a3030;background:#251313;color:#ff9a9a}
.btn:disabled{opacity:.45;cursor:not-allowed}
.inline{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.inline select,.inline input,.compactInput,.multiSelect{min-height:32px;border:1px solid var(--line);background:#0b1016;color:var(--text);padding:5px 8px}
.multiSelect{min-height:78px;min-width:190px}
.stack{display:grid;gap:8px}
.stack label{display:grid;gap:4px;color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.05em}
.stack input,.stack select,.stack textarea{width:100%;border:1px solid var(--line);background:#0b1016;color:var(--text);padding:8px}
.stack textarea{min-height:72px;resize:vertical}
.controlGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:12px}
.permissionGrid{display:grid;gap:8px;padding:12px}
.permissionRole{border:1px solid var(--line2);background:#0b1016;padding:12px}
.permissionRoleHead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:9px}
.permissionChecks{display:flex;gap:7px;flex-wrap:wrap}
.permissionChecks label{display:flex;align-items:center;gap:5px;padding:5px 7px;border:1px solid var(--line2);color:var(--muted);font:10px ui-monospace,SFMono-Regular,Menlo,monospace}
.feedback{min-height:18px;padding:0 12px 10px;color:var(--muted);font-size:11px}
.feedback.ok{color:var(--good)}.feedback.bad{color:var(--bad)}
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
@media(max-width:1000px){.app{grid-template-columns:1fr}.side{position:static;height:auto;border-right:0;border-bottom:1px solid var(--line)}nav{grid-template-columns:repeat(3,minmax(0,1fr))}.sidefoot{display:none}.grid{grid-template-columns:repeat(2,1fr)}.split{grid-template-columns:1fr}.form{grid-template-columns:1fr 1fr}.form .wide{grid-column:1/-1}.controlGrid{grid-template-columns:1fr 1fr}}
@media(max-width:560px){.content{padding:14px}.grid{grid-template-columns:1fr 1fr}nav{grid-template-columns:1fr 1fr}.head{align-items:flex-start;display:grid}.form{grid-template-columns:1fr}.controlGrid{grid-template-columns:1fr}}
</style>
</head>
<body data-route="${escapeHtml(current)}">
<div class="app">
  <aside class="side">
    <div class="brand"><strong>AERTEX ADMIN</strong><span>管理控制面 · ${build}</span></div>
    <div class="env">生产环境 · ${root}</div>
    <nav>
      ${NAV.map(([path,label,code])=>`<a href="${path}" class="${path===current?"active":""}"><b>${code}</b><span>${escapeHtml(label)}</span></a>`).join("")}
    </nav>
    <div class="sidefoot">
      <div>${identity}</div>
      <div>此管理界面与用户产品完全隔离。</div>
      <button id="logout" type="button">退出管理员会话</button>
    </div>
  </aside>
  <main class="main">
    <header class="top"><span class="path">admin://${escapeHtml(current === "/" ? "overview" : current.slice(1))}</span><span class="who">${identity}</span></header>
    <div class="content">
      <div class="head">
        <div><h1 id="pageTitle">加载中…</h1><p id="pageDescription">正在读取管理状态。</p></div>
        <div class="tools"><button class="btn" id="refresh" type="button">刷新</button></div>
      </div>
      <div id="view"><div class="state">正在加载管理数据…</div></div>
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
    "/":["系统总览","查看运行状态和仅管理员可见的指标。"],
    "/users":["用户","管理账户、状态与角色分配。"],
    "/roles":["角色与权限","管理角色与权限矩阵。"],
    "/logs":["审计日志","查看管理操作与账户变更审计事件。"],
    "/access":["访问控制","管理设备豁免并查看访问审计记录。"],
    "/content":["内容","跨账户管理摘要与私有链接；与用户产品保持隔离。"],
    "/storage":["存储","查看跨账户 R2 用户文件，并执行管理操作。"],
    "/intelligence":["AI 管理","管理服务商、模型和用户 AI 访问权限。"],
    "/system":["系统","查看管理控制面的健康状态与部署信息。"]
  };
  [title.textContent,description.textContent]=pageMeta[route]||pageMeta["/"];

  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const scalar=v=>v==null?"—":typeof v==="object"?JSON.stringify(v):String(v);
  const FIELD_LABELS={
    id:"ID",user_id:"用户 ID",display_name:"显示名称",username:"用户名",email:"邮箱",role:"角色",status:"状态",
    last_sign_in_at:"最近登录",last_seen_at:"最近活动",created_at:"创建时间",updated_at:"更新时间",
    owner:"所有者",owner_id:"所有者 ID",owner_label:"所有者",title:"标题",source:"来源",tags:"标签",
    url:"URL",scope:"范围",category:"分类",description:"说明",community:"社区公开",reference:"文件标识",
    name:"名称",content_type:"文件类型",size:"大小",uploaded_at:"上传时间",enabled:"启用",expires_at:"到期时间",
    note:"备注",ip:"IP",user_agent:"设备信息",action:"操作",resource_type:"资源类型",resource_id:"资源 ID",
    event_type:"事件类型",success:"成功",result:"结果",reason:"原因",timestamp:"时间",time:"时间",
    service:"服务",origin:"来源",files:"文件数",used:"已用空间",partial:"部分结果",summaries:"摘要数",
    private_links:"私有链接",community_links:"社区链接",providers:"服务商",users:"用户数",
    active_providers:"启用服务商",count:"数量",total:"总数",active:"正常",suspended:"已暂停",banned:"已封禁"
  };
  const fieldLabel=key=>FIELD_LABELS[String(key)]||String(key);
  const roleLabel=value=>({admin:"管理员",editor:"编辑者",user:"普通用户"}[String(value)]||String(value));
  const valueLabel=(key,value)=>{
    if(key==="role")return roleLabel(value);
    if(key==="status")return ({active:"正常",suspended:"已暂停",banned:"已封禁",disabled:"已停用"}[String(value)]||scalar(value));
    if(typeof value==="boolean")return value?"是":"否";
    return scalar(value);
  };
  const localizeForDisplay=value=>{
    if(Array.isArray(value))return value.map(localizeForDisplay);
    if(value&&typeof value==="object")return Object.fromEntries(Object.entries(value).map(([key,item])=>[fieldLabel(key),localizeForDisplay(item)]));
    if(typeof value==="boolean")return value?"是":"否";
    return value;
  };
  const permissionLabel=value=>({
    "users.read":"查看用户","users.update":"修改用户","users.ban":"暂停或封禁用户",
    "roles.read":"查看角色与权限","roles.update":"修改角色权限","logs.read":"查看操作日志",
    "system.read":"查看系统状态","notes.read":"查看笔记","notes.create":"创建笔记","notes.update":"修改笔记","notes.delete":"删除笔记",
    "links.read":"查看链接","links.create":"创建链接","links.update":"修改链接","links.delete":"删除链接"
  }[String(value)]||String(value));
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
  async function requestJson(path,options={}){
    const r=await fetch(path,{...options,credentials:"same-origin",cache:"no-store",headers:{accept:"application/json",...(options.headers||{})}});
    const data=await r.json().catch(()=>({}));
    if(!r.ok){
      const error=new Error(data.error||("HTTP "+r.status));
      error.code=data.code||null;
      error.diagnostic=data.diagnostic||null;
      throw error;
    }
    return data;
  }
  function table(rows){
    const list=Array.isArray(rows)?rows:[];
    if(!list.length)return '<div class="state">暂无记录。</div>';
    const cols=[...new Set(list.flatMap(row=>Object.keys(row||{})))].slice(0,12);
    return '<div class="tableWrap"><table><thead><tr>'+cols.map(c=>'<th>'+esc(fieldLabel(c))+'</th>').join('')+'</tr></thead><tbody>'+
      list.map(row=>'<tr>'+cols.map(c=>'<td class="'+(/id|uuid|time|date|email|ip/i.test(c)?"mono":"")+'">'+esc(valueLabel(c,row?.[c]))+'</td>').join('')+'</tr>').join('')+
      '</tbody></table></div>';
  }
  function objCards(obj){
    const entries=Object.entries(obj||{});
    if(!entries.length)return '<div class="state">暂无指标。</div>';
    return '<div class="grid">'+entries.slice(0,12).map(([k,v])=>'<article class="card metric"><small>'+esc(fieldLabel(k))+'</small><strong>'+esc(typeof v==="object"?(Array.isArray(v)?v.length:"…"):v)+'</strong></article>').join('')+'</div>';
  }
  const num=value=>{const text=String(value??"").trim();if(!text)return null;const number=Number(text);return Number.isFinite(number)?number:null};
  const intOrNull=value=>{const number=num(value);return number==null?null:Math.max(0,Math.trunc(number))};
  const bytes=value=>{let n=Number(value)||0;const units=["B","KB","MB","GB","TB"];let i=0;while(n>=1024&&i<units.length-1){n/=1024;i++}return n.toLocaleString(undefined,{maximumFractionDigits:i?1:0})+" "+units[i]};
  function errorView(error){view.innerHTML='<div class="section"><div class="state">管理请求失败：'+esc(error?.message||error)+'</div></div>'}

  async function overview(){
    const result=await post("/api/admin/overview");
    const data=result.data||{};
    view.innerHTML=objCards(data)+'<section class="section"><div class="sectionHead"><h2>原始管理概览</h2></div><pre>'+esc(JSON.stringify(localizeForDisplay(data),null,2))+'</pre></section>';
  }
  async function users(){
    const result=await post("/api/admin/users");
    const rows=Array.isArray(result.data)?result.data:(result.data?.users||[]);
    if(!rows.length){view.innerHTML='<section class="section"><div class="state">暂无账户。</div></section>';return}
    view.innerHTML='<section class="section"><div class="sectionHead"><h2>账户</h2><span class="mono">'+rows.length+' 条记录</span></div><div class="tableWrap"><table><thead><tr><th>用户</th><th>邮箱</th><th>角色</th><th>状态</th><th>最近登录</th><th>操作</th></tr></thead><tbody>'+
      rows.map(row=>'<tr data-user-row="'+esc(row.user_id)+'"><td><strong>'+esc(row.display_name||row.username||"—")+'</strong><br><span class="mono">'+esc(row.user_id)+'</span></td><td class="mono">'+esc(row.email||"—")+'</td>'+
      '<td><select class="userRole compactInput"><option value="admin" '+(row.role==="admin"?"selected":"")+'>管理员</option><option value="editor" '+(row.role==="editor"?"selected":"")+'>编辑者</option><option value="user" '+(row.role==="user"?"selected":"")+'>普通用户</option></select></td>'+
      '<td><select class="userStatus compactInput"><option value="active" '+(row.status==="active"?"selected":"")+'>正常</option><option value="suspended" '+(row.status==="suspended"?"selected":"")+'>已暂停</option><option value="banned" '+(row.status==="banned"?"selected":"")+'>已封禁</option></select></td>'+
      '<td class="mono">'+esc(row.last_sign_in_at||row.last_seen_at||"—")+'</td><td><div class="inline"><button class="btn saveUser" type="button">应用</button></div></td></tr>').join('')+
      '</tbody></table></div><div class="feedback" id="usersFeedback"></div></section>';

    document.querySelectorAll(".saveUser").forEach(button=>button.addEventListener("click",async()=>{
      const row=button.closest("[data-user-row]");if(!row)return;
      const userId=row.dataset.userRow;
      const role=row.querySelector(".userRole")?.value||"user";
      const status=row.querySelector(".userStatus")?.value||"active";
      const feedback=document.getElementById("usersFeedback");
      button.disabled=true;
      try{
        await post("/api/admin/user-role",{p_user_id:userId,p_role:role});
        await post("/api/admin/user-status",{p_user_id:userId,p_status:status});
        feedback.textContent="账户设置已更新，并已写入审计日志。";
        feedback.className="feedback ok";
      }catch(error){
        feedback.textContent=error.message;
        feedback.className="feedback bad";
      }finally{button.disabled=false}
    }));
  }
  async function roles(){
    const result=await post("/api/admin/roles");
    const data=result.data||{};
    const roles=Array.isArray(data.roles)?data.roles:[];
    const permissions=Array.isArray(data.permissions)?data.permissions:[];
    const assigned=Array.isArray(data.role_permissions)?data.role_permissions:[];
    const selectedByRole=new Map(roles.map(role=>[role.name,new Set(assigned.filter(item=>item.role===role.name).map(item=>item.permission))]));
    view.innerHTML='<section class="section"><div class="sectionHead"><h2>权限矩阵</h2><span class="mono">'+permissions.length+' 项权限</span></div><div class="permissionGrid">'+
      roles.map(role=>'<article class="permissionRole" data-role="'+esc(role.name)+'"><div class="permissionRoleHead"><div><strong>'+esc(roleLabel(role.name))+'</strong><br><span class="mono">'+esc((data.user_counts||{})[role.name]??0)+' 位用户</span></div><button class="btn saveRole" type="button">保存角色</button></div><div class="permissionChecks">'+
        permissions.map(permission=>'<label title="'+esc(permissionLabel(permission.key))+'"><input type="checkbox" value="'+esc(permission.key)+'" '+(selectedByRole.get(role.name)?.has(permission.key)?"checked":"")+'><span>'+esc(permissionLabel(permission.key))+'</span></label>').join('')+
      '</div></article>').join('')+'</div><div class="feedback" id="rolesFeedback"></div></section>';

    document.querySelectorAll(".saveRole").forEach(button=>button.addEventListener("click",async()=>{
      const card=button.closest("[data-role]");if(!card)return;
      const role=card.dataset.role;
      const list=[...card.querySelectorAll('input[type="checkbox"]:checked')].map(input=>input.value);
      const feedback=document.getElementById("rolesFeedback");
      button.disabled=true;
      try{
        await post("/api/admin/permissions",{p_role:role,p_permissions:list});
        feedback.textContent="角色权限矩阵已更新，并已写入审计日志。";
        feedback.className="feedback ok";
      }catch(error){
        feedback.textContent=error.message;
        feedback.className="feedback bad";
      }finally{button.disabled=false}
    }));
  }
  async function logs(){
    const result=await post("/api/admin/logs",{p_limit:120});
    const rows=Array.isArray(result.data)?result.data:(result.data?.logs||[]);
    view.innerHTML='<section class="section"><div class="sectionHead"><h2>最近事件</h2></div>'+table(rows)+'</section>';
  }
  async function access(){
    const [exemptions,auditSummary,auditList]=await Promise.all([
      post("/api/admin/device-exemptions"),
      post("/api/admin/access-audit",{action:"summary"}),
      post("/api/admin/access-audit",{action:"list",limit:80,filters:{}})
    ]);
    const rows=Array.isArray(exemptions.data)?exemptions.data:[];
    const auditRows=Array.isArray(auditList.entries)?auditList.entries:[];
    view.innerHTML='<div class="split"><section class="section"><div class="sectionHead"><h2>华为设备 ID 豁免</h2></div>'+table(rows)+'</section>'+
      '<section class="section"><div class="sectionHead"><h2>访问审计摘要</h2></div><pre>'+esc(JSON.stringify(localizeForDisplay(auditSummary.summary||{}),null,2))+'</pre></section></div>'+
      '<section class="section"><div class="sectionHead"><h2>授予或撤销账户豁免</h2></div><form class="form" id="exemptionForm">'+
      '<input name="user" placeholder="用户 UUID" required><select name="enabled"><option value="true">授予</option><option value="false">撤销</option></select><input name="expires" placeholder="到期时间 ISO（可选）"><input class="wide" name="note" placeholder="管理备注"><button class="btn primary" type="submit">应用</button></form></section>'+
      '<section class="section"><div class="sectionHead"><h2>最近访问审计事件</h2></div>'+table(auditRows)+'</section>';
    document.getElementById("exemptionForm")?.addEventListener("submit",async event=>{
      event.preventDefault();const fd=new FormData(event.currentTarget);
      try{
        await post("/api/admin/device-exemption",{p_user_id:String(fd.get("user")||"").trim(),p_enabled:fd.get("enabled")==="true",p_expires_at:String(fd.get("expires")||"").trim()||null,p_note:String(fd.get("note")||"").trim()||null});
        await access();
      }catch(error){alert(error.message)}
    });
  }
  async function content(){
    const [summaries,links]=await Promise.all([
      get("/api/admin/content/summaries"),
      get("/api/admin/content/links")
    ]);
    const summaryRows=(summaries.rows||[]).map(row=>({
      owner:row.owner_label||row.owner_id,
      title:row.title||"—",
      source:row.source||"—",
      tags:row.tags||"—",
      updated_at:row.updated_at||"—"
    }));
    const linkRows=Array.isArray(links.rows)?links.rows:[];
    view.innerHTML=objCards({summaries:summaries.count||0,private_links:linkRows.filter(row=>!row.community).length,community_links:linkRows.filter(row=>row.community).length})+
      '<section class="section"><div class="sectionHead"><h2>用户摘要</h2><span class="mono">'+summaryRows.length+' 条记录</span></div>'+table(summaryRows)+'</section>'+
      '<section class="section"><div class="sectionHead"><h2>用户创建的链接</h2><span class="mono">'+linkRows.length+' 条记录</span></div><div class="tableWrap"><table><thead><tr><th>所有者</th><th>标题</th><th>URL</th><th>范围</th><th>更新时间</th><th>操作</th></tr></thead><tbody>'+
      linkRows.map(row=>'<tr data-link-owner="'+esc(row.owner_id)+'" data-link-id="'+esc(row.id)+'"><td>'+esc(row.owner_label||row.owner_id)+'</td><td>'+esc(row.title||"—")+'</td><td class="mono">'+esc(row.url||"—")+'</td><td><span class="badge '+(row.community?"ok":"")+'">'+(row.community?"社区":"私有")+'</span></td><td class="mono">'+esc(row.updated_at||"—")+'</td><td><div class="inline"><button class="btn toggleLinkScope" type="button">'+(row.community?"转为私有":"发布")+'</button><button class="btn danger deleteLink" type="button">删除</button></div></td></tr>').join('')+
      '</tbody></table></div><div class="feedback" id="contentFeedback"></div></section>';

    document.querySelectorAll(".toggleLinkScope").forEach(button=>button.addEventListener("click",async()=>{
      const row=button.closest("[data-link-owner]");if(!row)return;
      const item=linkRows.find(link=>link.owner_id===row.dataset.linkOwner&&link.id===row.dataset.linkId);if(!item)return;
      button.disabled=true;
      try{
        await requestJson("/api/admin/content/link?owner="+encodeURIComponent(item.owner_id)+"&id="+encodeURIComponent(item.id),{
          method:"PUT",headers:{"content-type":"application/json;charset=UTF-8"},
          body:JSON.stringify({title:item.title,url:item.url,category:item.category,description:item.description,community:!item.community})
        });
        await content();
      }catch(error){const feedback=document.getElementById("contentFeedback");if(feedback){feedback.textContent=error.message;feedback.className="feedback bad"}button.disabled=false}
    }));
    document.querySelectorAll(".deleteLink").forEach(button=>button.addEventListener("click",async()=>{
      const row=button.closest("[data-link-owner]");if(!row)return;
      const item=linkRows.find(link=>link.owner_id===row.dataset.linkOwner&&link.id===row.dataset.linkId);if(!item||!confirm("确定删除链接 “"+(item.title||item.id)+"” 吗？"))return;
      button.disabled=true;
      try{
        await requestJson("/api/admin/content/link?owner="+encodeURIComponent(item.owner_id)+"&id="+encodeURIComponent(item.id),{method:"DELETE"});
        await content();
      }catch(error){const feedback=document.getElementById("contentFeedback");if(feedback){feedback.textContent=error.message;feedback.className="feedback bad"}button.disabled=false}
    }));
  }

  async function storage(){
    const result=await get("/api/admin/storage/files");
    const rows=Array.isArray(result.rows)?result.rows:[];
    view.innerHTML=objCards({files:result.count||0,used:bytes(result.used_bytes||0),partial:result.partial?"是":"否"})+
      '<section class="section"><div class="sectionHead"><h2>用户文件</h2><span class="mono">'+rows.length+' 条记录</span></div><div class="tableWrap"><table><thead><tr><th>所有者</th><th>名称</th><th>类型</th><th>大小</th><th>上传时间</th><th>操作</th></tr></thead><tbody>'+
      rows.map(row=>'<tr data-storage-ref="'+esc(row.reference)+'"><td>'+esc(row.owner_label||row.owner_id)+'</td><td>'+esc(row.name||"file")+'<br><span class="mono">'+esc(row.reference)+'</span></td><td class="mono">'+esc(row.content_type||"application/octet-stream")+'</td><td>'+esc(bytes(row.size))+'</td><td class="mono">'+esc(row.uploaded_at||"—")+'</td><td><div class="inline"><a class="btn" href="/api/admin/storage/object?id='+encodeURIComponent(row.reference)+'">下载</a><button class="btn danger deleteStorage" type="button">删除</button></div></td></tr>').join('')+
      '</tbody></table></div><div class="feedback" id="storageFeedback"></div></section>';

    document.querySelectorAll(".deleteStorage").forEach(button=>button.addEventListener("click",async()=>{
      const row=button.closest("[data-storage-ref]");const ref=row?.dataset.storageRef;if(!ref||!confirm("确定删除存储对象 “"+ref+"” 吗？"))return;
      button.disabled=true;
      try{
        await requestJson("/api/admin/storage/object?id="+encodeURIComponent(ref),{method:"DELETE"});
        await storage();
      }catch(error){const feedback=document.getElementById("storageFeedback");if(feedback){feedback.textContent=error.message;feedback.className="feedback bad"}button.disabled=false}
    }));
  }

  async function intelligence(){
    const state=await get("/api/admin/ai/state?fast=1");
    const providers=Array.isArray(state.providers)?state.providers:[];
    const users=Array.isArray(state.users)?state.users:[];
    view.innerHTML=objCards({providers:providers.length,users:users.length,active_providers:providers.filter(provider=>provider.is_active!==false).length})+
      '<section class="section"><div class="sectionHead"><h2>添加服务商</h2><span class="mono">凭据仅保存在 AI 管理模块</span></div>'+
      '<form class="controlGrid" id="providerForm"><div class="stack"><label>服务商<select name="provider" required><option value="openai">OpenAI</option><option value="zhipu">Zhipu</option><option value="bailian">Bailian</option></select></label><label>名称<input name="name" required></label></div>'+
      '<div class="stack"><label>项目 API 密钥<input name="key" type="password" autocomplete="off" required></label><label>管理/计费密钥（OpenAI 可选）<input name="adminKey" type="password" autocomplete="off"></label><button class="btn" id="validateProvider" type="button">验证密钥并加载模型</button></div>'+
      '<div class="stack"><label>允许的模型<textarea name="models" placeholder="请先验证密钥"></textarea></label><label>默认模型<input name="defaultModel"></label></div>'+
      '<div class="stack"><label>每月预算（USD）<input name="budget" type="number" min="0" step=".01"></label><label>输入价格 / 百万 Token（USD）<input name="input" type="number" min="0" step=".001" value="0"></label><label>输出价格 / 百万 Token（USD）<input name="output" type="number" min="0" step=".001" value="0"></label></div>'+
      '<div class="stack"><button class="btn primary" type="submit">创建服务商</button></div></form><div class="feedback" id="providerFeedback"></div></section>'+
      '<section class="section"><div class="sectionHead"><h2>服务商</h2></div><div class="tableWrap"><table><thead><tr><th>名称</th><th>类型</th><th>默认模型</th><th>模型</th><th>本月用量</th><th>状态</th><th>操作</th></tr></thead><tbody>'+
      providers.map(provider=>'<tr data-provider="'+esc(provider.id)+'"><td>'+esc(provider.name||"—")+'<br><span class="mono">'+esc(provider.id)+'</span></td><td class="mono">'+esc(provider.provider)+'</td><td class="mono">'+esc(provider.default_model||"—")+'</td><td>'+esc((provider.allowed_models||[]).join(", "))+'</td><td>'+esc(provider.month_usage_usd??0)+' USD · '+esc(provider.month_requests??0)+' 次请求</td><td><span class="badge '+(provider.is_active!==false?"ok":"bad")+'">'+(provider.is_active!==false?"已启用":"已停用")+'</span></td><td><div class="inline"><button class="btn toggleProvider" type="button">'+(provider.is_active!==false?"停用":"启用")+'</button><button class="btn danger deleteProvider" type="button">删除</button></div></td></tr>').join('')+
      '</tbody></table></div></section>'+
      '<section class="section"><div class="sectionHead"><h2>用户 AI 访问权限</h2></div><div class="tableWrap"><table><thead><tr><th>用户</th><th>启用</th><th>服务商</th><th>美元限额</th><th>Token 限额</th><th>每分钟请求</th><th>操作</th></tr></thead><tbody>'+
      users.map(user=>{const selected=new Set((user.provider_access||[]).filter(item=>item.enabled!==false).map(item=>item.provider_id));return '<tr data-ai-user="'+esc(user.user_id)+'"><td><strong>'+esc(user.display_name||user.username||"—")+'</strong><br><span class="mono">'+esc(user.email||user.user_id)+'</span></td><td><input class="aiEnabled" type="checkbox" '+(user.enabled?"checked":"")+'></td><td><select class="aiProviders multiSelect" multiple>'+providers.filter(provider=>provider.is_active!==false).map(provider=>'<option value="'+esc(provider.id)+'" '+(selected.has(provider.id)?"selected":"")+'>'+esc(provider.name)+'</option>').join('')+'</select></td>'+
      '<td><input class="dailyUsd compactInput" type="number" min="0" step=".01" value="'+esc(user.daily_limit_usd??"")+'" placeholder="每日"><br><input class="monthlyUsd compactInput" type="number" min="0" step=".01" value="'+esc(user.monthly_limit_usd??"")+'" placeholder="每月"></td>'+
      '<td><input class="dailyTokens compactInput" type="number" min="0" step="1" value="'+esc(user.daily_limit_tokens??"")+'" placeholder="每日"><br><input class="monthlyTokens compactInput" type="number" min="0" step="1" value="'+esc(user.monthly_limit_tokens??"")+'" placeholder="每月"></td>'+
      '<td><input class="rpm compactInput" type="number" min="1" max="300" value="'+esc(user.requests_per_minute??20)+'"></td><td><button class="btn saveAiAccess" type="button">应用</button></td></tr>'}).join('')+
      '</tbody></table></div><div class="feedback" id="aiFeedback"></div></section>';

    const providerForm=document.getElementById("providerForm");
    const providerFeedback=document.getElementById("providerFeedback");
    document.getElementById("validateProvider")?.addEventListener("click",async()=>{
      const fd=new FormData(providerForm);
      const button=document.getElementById("validateProvider");
      button.disabled=true;
      try{
        const result=await requestJson("/api/admin/ai/validate-project-key",{method:"POST",headers:{"content-type":"application/json;charset=UTF-8"},body:JSON.stringify({provider:String(fd.get("provider")||""),api_key:String(fd.get("key")||"").trim()})});
        const models=Array.isArray(result.models)?result.models:[];
        providerForm.elements.models.value=models.join(", ");
        if(models.length&&!providerForm.elements.defaultModel.value)providerForm.elements.defaultModel.value=models[0];
        providerFeedback.textContent="服务商密钥验证成功，共 "+models.length+" 个模型可用。";
        providerFeedback.className="feedback ok";
      }catch(error){providerFeedback.textContent=error.message;providerFeedback.className="feedback bad"}finally{button.disabled=false}
    });
    providerForm?.addEventListener("submit",async event=>{
      event.preventDefault();const fd=new FormData(providerForm);
      const models=String(fd.get("models")||"").split(",").map(value=>value.trim()).filter(Boolean);
      try{
        await requestJson("/api/admin/ai/provider",{method:"POST",headers:{"content-type":"application/json;charset=UTF-8"},body:JSON.stringify({
          provider:String(fd.get("provider")||""),name:String(fd.get("name")||"").trim(),api_key:String(fd.get("key")||"").trim(),admin_key:String(fd.get("adminKey")||"").trim(),
          allowed_models:models,default_model:String(fd.get("defaultModel")||"").trim(),monthly_budget_usd:num(fd.get("budget")),input_price_per_million:num(fd.get("input"))??0,output_price_per_million:num(fd.get("output"))??0,is_active:true
        })});
        await intelligence();
      }catch(error){providerFeedback.textContent=error.message;providerFeedback.className="feedback bad"}
    });

    document.querySelectorAll(".toggleProvider").forEach(button=>button.addEventListener("click",async()=>{
      const row=button.closest("[data-provider]");const provider=providers.find(item=>item.id===row?.dataset.provider);if(!provider)return;
      button.disabled=true;
      try{
        await requestJson("/api/admin/ai/provider/"+encodeURIComponent(provider.id),{method:"PATCH",headers:{"content-type":"application/json;charset=UTF-8"},body:JSON.stringify({
          name:provider.name,allowed_models:provider.allowed_models||[],default_model:provider.default_model,monthly_budget_usd:provider.monthly_budget_usd,input_price_per_million:provider.input_price_per_million||0,output_price_per_million:provider.output_price_per_million||0,is_active:provider.is_active===false
        })});
        await intelligence();
      }catch(error){providerFeedback.textContent=error.message;providerFeedback.className="feedback bad";button.disabled=false}
    }));
    document.querySelectorAll(".deleteProvider").forEach(button=>button.addEventListener("click",async()=>{
      const row=button.closest("[data-provider]");const provider=providers.find(item=>item.id===row?.dataset.provider);if(!provider||!confirm("确定删除服务商 “"+provider.name+"” 吗？"))return;
      button.disabled=true;
      try{await requestJson("/api/admin/ai/provider/"+encodeURIComponent(provider.id),{method:"DELETE"});await intelligence()}
      catch(error){providerFeedback.textContent=error.message;providerFeedback.className="feedback bad";button.disabled=false}
    }));
    document.querySelectorAll(".saveAiAccess").forEach(button=>button.addEventListener("click",async()=>{
      const row=button.closest("[data-ai-user]");if(!row)return;
      const user=users.find(item=>item.user_id===row.dataset.aiUser);if(!user)return;
      const selected=[...row.querySelector(".aiProviders").selectedOptions].map(option=>option.value);
      const providerAccess=selected.map(providerId=>{const provider=providers.find(item=>item.id===providerId);return {provider_id:providerId,allowed_models:Array.isArray(provider?.allowed_models)?provider.allowed_models:[]};});
      const feedback=document.getElementById("aiFeedback");button.disabled=true;
      try{
        await requestJson("/api/admin/ai/access",{method:"POST",headers:{"content-type":"application/json;charset=UTF-8"},body:JSON.stringify({
          user_id:user.user_id,enabled:row.querySelector(".aiEnabled").checked,provider_access:providerAccess,
          daily_limit_usd:num(row.querySelector(".dailyUsd").value),monthly_limit_usd:num(row.querySelector(".monthlyUsd").value),
          daily_limit_tokens:intOrNull(row.querySelector(".dailyTokens").value),monthly_limit_tokens:intOrNull(row.querySelector(".monthlyTokens").value),
          requests_per_minute:Number(row.querySelector(".rpm").value)||20
        })});
        feedback.textContent="已更新 "+(user.email||user.user_id)+" 的 AI 访问权限。";
        feedback.className="feedback ok";
      }catch(error){feedback.textContent=error.message;feedback.className="feedback bad"}finally{button.disabled=false}
    }));
  }
  async function system(){
    const health=await get("/health");
    const overviewResult=await post("/api/admin/overview").catch(()=>({data:{}}));
    view.innerHTML=objCards({service:health.service||"admin",status:health.status||"unknown",origin:health.origin||location.origin,time:health.time||"—"})+
      '<section class="section"><div class="sectionHead"><h2>管理控制面</h2></div><pre>'+esc(JSON.stringify(localizeForDisplay({health,overview:overviewResult.data||{}}),null,2))+'</pre></section>';
  }
  const loaders={"/":overview,"/users":users,"/roles":roles,"/logs":logs,"/access":access,"/content":content,"/storage":storage,"/intelligence":intelligence,"/system":system};
  async function load(){view.innerHTML='<div class="state">正在加载管理数据…</div>';try{await (loaders[route]||overview)()}catch(error){errorView(error)}}
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
