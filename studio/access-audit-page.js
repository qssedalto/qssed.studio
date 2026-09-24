import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";
import { verifyStudioApiSession, withStudioSessionCookies } from "./session-gate.js";
import { injectBrandLogoRuntime } from "./brand-logo.js";

export async function handleAccessAuditPage(request, zh) {
  const session = await verifyStudioApiSession(request);
  if (!session.ok) return withStudioSessionCookies(hiddenNotFound(), session.cookies);

  const allowed = await isAdministrator(session.accessToken);
  if (!allowed) return withStudioSessionCookies(hiddenNotFound(), session.cookies);

  return withStudioSessionCookies(pageResponse(renderPage(Boolean(zh))), session.cookies);
}

async function isAdministrator(accessToken) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_admin`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${accessToken}`,
        "content-type": "application/json;charset=UTF-8",
        Accept: "application/json"
      },
      body: "{}"
    });
    if (!response.ok) return false;
    return (await response.json()) === true;
  } catch {
    return false;
  }
}

function renderPage(zh) {
  const text = zh ? {
    title: "访问审计",
    subtitle: "AERTEX Access Audit",
    description: "仅管理员可见。保留主站、Work 与 Auth 中与账号、安全和异常相关的访问事件；普通成功浏览和匿名 404 不再逐条写入 R2。",
    today: "今天",
    requests: "请求",
    unique: "独立 IP",
    errors: "错误响应",
    hosts: "站点",
    date: "日期",
    host: "Host",
    ip: "IP",
    path: "路径包含",
    status: "状态码",
    device: "设备",
    app: "App / WebView",
    refresh: "刷新",
    reset: "重置",
    time: "时间",
    method: "方法",
    client: "客户端",
    country: "地区",
    duration: "耗时",
    detail: "详情",
    empty: "没有找到符合条件的访问记录。",
    loading: "正在读取私有审计日志…",
    close: "关闭",
    raw: "完整记录",
    retention: "安全审计默认保留 14 天。普通成功 GET/HEAD 与低价值匿名 404 不写入 R2；Cookie、Authorization、请求正文和表单内容不会写入审计日志。",
    failed: "读取失败"
  } : {
    title: "Access Audit",
    subtitle: "AERTEX Access Audit",
    description: "Administrator only. Security, account, and exception events for Main, Work, and Auth. Routine successful browsing and anonymous 404 noise are no longer stored one object at a time.",
    today: "Today",
    requests: "Requests",
    unique: "Unique IPs",
    errors: "Error responses",
    hosts: "Hosts",
    date: "Date",
    host: "Host",
    ip: "IP",
    path: "Path contains",
    status: "Status",
    device: "Device",
    app: "App / WebView",
    refresh: "Refresh",
    reset: "Reset",
    time: "Time",
    method: "Method",
    client: "Client",
    country: "Region",
    duration: "Duration",
    detail: "Details",
    empty: "No matching access events.",
    loading: "Reading private audit logs…",
    close: "Close",
    raw: "Full record",
    retention: "Security audit events are retained for 14 days by default. Routine successful GET/HEAD traffic and low-value anonymous 404 noise are not written to R2. Cookies, Authorization headers, request bodies, and form contents are never stored.",
    failed: "Failed to load"
  };

  return `<!doctype html>
<html lang="${zh ? "zh-CN" : "en"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<title>${escapeHtml(text.title)} · AERTEX</title>
<style>
:root{color-scheme:light dark;--bg:#f5f5f7;--surface:rgba(255,255,255,.82);--card:#fff;--text:#1d1d1f;--muted:#6e6e73;--quiet:#86868b;--line:rgba(60,60,67,.15);--fill:rgba(118,118,128,.12);--blue:#007aff;--red:#ff3b30;--green:#34c759;--shadow:0 12px 40px rgba(0,0,0,.06)}
@media(prefers-color-scheme:dark){:root{--bg:#000;--surface:rgba(28,28,30,.82);--card:#1c1c1e;--text:#f5f5f7;--muted:#aeaeb2;--quiet:#8e8e93;--line:rgba(84,84,88,.55);--fill:rgba(118,118,128,.24);--shadow:0 16px 46px rgba(0,0,0,.34)}}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif;background:var(--bg);color:var(--text)}body{padding:max(18px,env(safe-area-inset-top)) 18px max(28px,env(safe-area-inset-bottom))}.wrap{width:min(1440px,100%);margin:0 auto}.top{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin:8px 0 22px}.eyebrow{margin:0 0 7px;color:var(--quiet);font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.top h1{margin:0;font-size:clamp(30px,4vw,48px);line-height:1.04;letter-spacing:-.045em}.top p{max-width:760px;margin:10px 0 0;color:var(--muted);font-size:14px;line-height:1.55}.badge{flex:0 0 auto;padding:8px 11px;border-radius:999px;background:color-mix(in srgb,var(--green) 10%,var(--fill));color:color-mix(in srgb,var(--green) 82%,var(--text));font-size:11px;font-weight:700}.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:12px}.metric{padding:17px;border:1px solid var(--line);border-radius:18px;background:var(--card);box-shadow:0 1px 1px rgba(0,0,0,.02)}.metric span{display:block;color:var(--muted);font-size:11px}.metric strong{display:block;margin-top:6px;font-size:25px;letter-spacing:-.035em}.filters{display:grid;grid-template-columns:150px 180px 160px minmax(180px,1fr) 110px 130px 160px auto;gap:8px;padding:12px;border:1px solid var(--line);border-radius:20px;background:var(--surface);backdrop-filter:blur(22px) saturate(140%);-webkit-backdrop-filter:blur(22px) saturate(140%);position:sticky;top:max(8px,env(safe-area-inset-top));z-index:10}.field{display:grid;gap:4px;min-width:0}.field span{padding-left:2px;color:var(--quiet);font-size:9px;font-weight:650}.field input,.field select{width:100%;height:38px;margin:0;padding:0 10px;border:1px solid var(--line);border-radius:11px;background:var(--card);color:var(--text);font:inherit;font-size:12px;outline:none}.field input:focus,.field select:focus{border-color:color-mix(in srgb,var(--blue) 52%,var(--line));box-shadow:0 0 0 3px color-mix(in srgb,var(--blue) 10%,transparent)}.actions{display:flex;align-items:end;gap:6px}.btn{height:38px;padding:0 13px;border:0;border-radius:11px;background:var(--fill);color:var(--text);font:inherit;font-size:12px;font-weight:650;cursor:pointer}.btn.primary{background:var(--blue);color:#fff}.table-card{margin-top:12px;overflow:hidden;border:1px solid var(--line);border-radius:20px;background:var(--card);box-shadow:var(--shadow)}.table-head,.row{display:grid;grid-template-columns:170px 90px minmax(180px,1fr) 155px 90px 150px 110px 70px;align-items:center;gap:10px;padding:0 14px}.table-head{min-height:42px;border-bottom:1px solid var(--line);color:var(--quiet);font-size:10px;font-weight:700}.row{min-height:58px;border-bottom:1px solid var(--line);font-size:11px}.row:last-child{border-bottom:0}.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}.path{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.status{justify-self:start;padding:4px 7px;border-radius:8px;background:var(--fill);font-size:10px;font-weight:700}.status.ok{color:#248a3d}.status.warn{color:#b25000}.status.bad{color:var(--red)}.client{display:grid;gap:2px;min-width:0}.client strong,.client span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.client span{color:var(--muted);font-size:10px}.details-btn{height:30px;padding:0 9px;border:0;border-radius:9px;background:var(--fill);color:var(--blue);font:inherit;font-size:10px;font-weight:700;cursor:pointer}.state{padding:44px 18px;text-align:center;color:var(--muted);font-size:12px}.foot{margin:13px 3px 0;color:var(--quiet);font-size:10px;line-height:1.5}.drawer{position:fixed;inset:0;z-index:100;display:none;background:rgba(0,0,0,.24);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}.drawer.open{display:block}.drawer-panel{position:absolute;top:0;right:0;width:min(600px,94vw);height:100%;overflow:auto;padding:max(20px,env(safe-area-inset-top)) 18px max(24px,env(safe-area-inset-bottom));background:var(--card);box-shadow:-18px 0 50px rgba(0,0,0,.12)}.drawer-head{display:flex;align-items:center;justify-content:space-between;gap:12px;position:sticky;top:0;padding:0 0 12px;background:var(--card);z-index:2}.drawer-head h2{margin:0;font-size:22px;letter-spacing:-.03em}.close{width:36px;height:36px;border:0;border-radius:50%;background:var(--fill);color:var(--text);font-size:20px}.detail-grid{display:grid;gap:8px}.detail-section{padding:14px;border-radius:16px;background:var(--fill)}.detail-section h3{margin:0 0 9px;font-size:12px}.kv{display:grid;grid-template-columns:145px minmax(0,1fr);gap:7px 12px;font-size:11px;line-height:1.45}.kv span:nth-child(odd){color:var(--quiet)}.kv span:nth-child(even){word-break:break-word}.raw{margin-top:10px;padding:12px;border-radius:14px;background:#111;color:#f5f5f7;font:10px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;word-break:break-word;overflow:auto}
@media(max-width:1050px){.metrics{grid-template-columns:repeat(2,1fr)}.filters{grid-template-columns:repeat(2,minmax(0,1fr));position:static}.actions{grid-column:1/-1}.table-card{overflow-x:auto}.table-head,.row{min-width:940px}}
@media(max-width:560px){body{padding-left:10px;padding-right:10px}.top{display:grid}.badge{justify-self:start}.metrics{grid-template-columns:1fr 1fr}.filters{grid-template-columns:1fr}.actions{grid-column:auto}.table-card{border-radius:16px}}
</style>
</head>
<body>
<main class="wrap">
  <header class="top"><div><p class="eyebrow">${escapeHtml(text.subtitle)}</p><h1>${escapeHtml(text.title)}</h1><p>${escapeHtml(text.description)}</p></div><span class="badge">Admin only</span></header>
  <section class="metrics">
    <article class="metric"><span>${escapeHtml(text.requests)}</span><strong id="m-requests">—</strong></article>
    <article class="metric"><span>${escapeHtml(text.unique)}</span><strong id="m-unique">—</strong></article>
    <article class="metric"><span>${escapeHtml(text.errors)}</span><strong id="m-errors">—</strong></article>
    <article class="metric"><span>${escapeHtml(text.hosts)}</span><strong id="m-hosts">—</strong></article>
  </section>
  <section class="filters">
    <label class="field"><span>${escapeHtml(text.date)}</span><input id="f-date" type="date"></label>
    <label class="field"><span>${escapeHtml(text.host)}</span><select id="f-host"><option value="">All</option><option>qsseda.com</option><option>work.qsseda.com</option><option>auth.qsseda.com</option></select></label>
    <label class="field"><span>${escapeHtml(text.ip)}</span><input id="f-ip" autocomplete="off" spellcheck="false"></label>
    <label class="field"><span>${escapeHtml(text.path)}</span><input id="f-path" autocomplete="off" spellcheck="false"></label>
    <label class="field"><span>${escapeHtml(text.status)}</span><select id="f-status"><option value="">All</option><option value="200">200</option><option value="302">302</option><option value="400">400</option><option value="401">401</option><option value="403">403</option><option value="404">404</option><option value="429">429</option><option value="500">500</option></select></label>
    <label class="field"><span>${escapeHtml(text.device)}</span><select id="f-device"><option value="">All</option><option value="mobile">mobile</option><option value="tablet">tablet</option><option value="desktop">desktop</option></select></label>
    <label class="field"><span>${escapeHtml(text.app)}</span><select id="f-app"><option value="">All</option><option value="WeChat">WeChat</option><option value="WeCom">WeCom</option><option value="ChatGPT">ChatGPT</option><option value="Browser">Browser</option></select></label>
    <div class="actions"><button class="btn primary" id="refresh">${escapeHtml(text.refresh)}</button><button class="btn" id="reset">${escapeHtml(text.reset)}</button></div>
  </section>
  <section class="table-card">
    <div class="table-head"><span>${escapeHtml(text.time)}</span><span>${escapeHtml(text.method)}</span><span>Path</span><span>${escapeHtml(text.ip)}</span><span>Status</span><span>${escapeHtml(text.client)}</span><span>${escapeHtml(text.country)}</span><span></span></div>
    <div id="rows"><div class="state">${escapeHtml(text.loading)}</div></div>
  </section>
  <p class="foot">${escapeHtml(text.retention)}</p>
</main>
<div class="drawer" id="drawer"><aside class="drawer-panel"><div class="drawer-head"><h2>${escapeHtml(text.detail)}</h2><button class="close" id="close" aria-label="${escapeHtml(text.close)}">×</button></div><div id="detail" class="detail-grid"></div></aside></div>
<script>
(() => {
  const T=${JSON.stringify(text)};
  const API='/api/admin/access-audit';
  const $=id=>document.getElementById(id);
  const fields=['date','host','ip','path','status','device','app'];
  $('f-date').value=new Date().toISOString().slice(0,10);

  async function api(payload){
    const response=await fetch(API,{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json;charset=UTF-8',Accept:'application/json'},body:JSON.stringify(payload)});
    const data=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(data.error||('HTTP '+response.status));
    return data;
  }

  function filters(){return {host:$('f-host').value,ip:$('f-ip').value.trim(),path:$('f-path').value.trim(),status:$('f-status').value,device:$('f-device').value,app:$('f-app').value};}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function statusClass(status){if(status>=500)return'bad';if(status>=400)return'warn';if(status>=200&&status<400)return'ok';return'';}
  function localTime(value){const d=new Date(value);return Number.isNaN(d.getTime())?String(value||''):d.toLocaleString([], {month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'});}

  async function load(){
    $('rows').innerHTML='<div class="state">'+esc(T.loading)+'</div>';
    try{
      const date=$('f-date').value||new Date().toISOString().slice(0,10);
      const [list,summary]=await Promise.all([api({action:'list',date,limit:150,filters:filters()}),api({action:'summary',date})]);
      renderRows(list.entries||[]);
      renderSummary(summary.summary||{});
    }catch(error){$('rows').innerHTML='<div class="state">'+esc(T.failed+': '+error.message)+'</div>';}
  }

  function renderSummary(s){
    $('m-requests').textContent=String(s.requests??0);
    $('m-unique').textContent=String(s.unique_ips??0);
    const errors=Object.entries(s.status||{}).reduce((n,[code,count])=>n+(Number(code)>=400?Number(count)||0:0),0);
    $('m-errors').textContent=String(errors);
    $('m-hosts').textContent=String(Object.keys(s.hosts||{}).length);
  }

  function renderRows(entries){
    if(!entries.length){$('rows').innerHTML='<div class="state">'+esc(T.empty)+'</div>';return;}
    $('rows').innerHTML=entries.map((e,i)=>'<div class="row">'+
      '<span>'+esc(localTime(e.timestamp||e.uploaded_at))+'</span>'+
      '<span class="mono">'+esc(e.method)+'</span>'+
      '<span class="path mono" title="'+esc(e.path)+'">'+esc(e.path)+'</span>'+
      '<span class="mono">'+esc(e.ip)+'</span>'+
      '<span class="status '+statusClass(Number(e.status))+'">'+esc(e.status)+'</span>'+
      '<span class="client"><strong>'+esc(e.app||e.browser||'—')+'</strong><span>'+esc([e.device,e.os,e.browser].filter(Boolean).join(' · '))+'</span></span>'+
      '<span>'+esc(e.country||'—')+'</span>'+
      '<button class="details-btn" data-key="'+esc(e.key)+'">'+esc(T.detail)+'</button></div>').join('');
    document.querySelectorAll('.details-btn').forEach(button=>button.addEventListener('click',()=>void openDetail(button.dataset.key)));
  }

  async function openDetail(key){
    $('drawer').classList.add('open');
    $('detail').innerHTML='<div class="state">'+esc(T.loading)+'</div>';
    try{
      const data=await api({action:'detail',key});
      const r=data.record||{};
      const sections=[
        ['Request',r.request||{}],['Response',r.response||{}],['Network',r.network||{}],['Client',r.client||{}],['Bot',r.bot||{}]
      ];
      $('detail').innerHTML='<div class="detail-section"><h3>Event</h3><div class="kv"><span>ID</span><span class="mono">'+esc(r.request_id)+'</span><span>UTC</span><span>'+esc(r.timestamp_utc)+'</span><span>Visitor local</span><span>'+esc(r.visitor_local_time+' '+(r.visitor_timezone||''))+'</span><span>Duration</span><span>'+esc(r.duration_ms)+' ms</span></div></div>'+
        sections.map(([name,obj])=>'<div class="detail-section"><h3>'+esc(name)+'</h3><div class="kv">'+Object.entries(obj).map(([k,v])=>'<span>'+esc(k)+'</span><span>'+esc(typeof v==='object'?JSON.stringify(v):v)+'</span>').join('')+'</div></div>').join('')+
        '<div class="detail-section"><h3>'+esc(T.raw)+'</h3><pre class="raw">'+esc(JSON.stringify(r,null,2))+'</pre></div>';
    }catch(error){$('detail').innerHTML='<div class="state">'+esc(T.failed+': '+error.message)+'</div>';}
  }

  $('refresh').addEventListener('click',()=>void load());
  $('reset').addEventListener('click',()=>{['host','ip','path','status','device','app'].forEach(name=>$('f-'+name).value='');$('f-date').value=new Date().toISOString().slice(0,10);void load();});
  $('close').addEventListener('click',()=>$('drawer').classList.remove('open'));
  $('drawer').addEventListener('click',event=>{if(event.target===$('drawer'))$('drawer').classList.remove('open');});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')$('drawer').classList.remove('open');});
  void load();
})();
</script>
</body></html>`;
}

function pageResponse(markup) {
  return new Response(injectBrandLogoRuntime(markup), {
    status: 200,
    headers: {
      "content-type": "text/html;charset=UTF-8",
      "cache-control": "private, no-store",
      "content-security-policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
      "permissions-policy": "camera=(), microphone=(), geolocation=()",
      "x-robots-tag": "noindex, nofollow, noarchive, nosnippet"
    }
  });
}

function hiddenNotFound() {
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

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
