const CLIENT_ID = "qsseda-pkce-browser-test";
const SCOPE = "profile.read session.read";
const CALLBACK_PATH = "/pkce-test/callback";

export function handlePkceTestRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";

  if (request.method !== "GET") {
    return json({ error: "method_not_allowed" }, 405);
  }

  if (pathname === "/pkce-test") {
    return html(startPage(url.origin));
  }

  if (pathname === CALLBACK_PATH) {
    return html(callbackPage(url.origin));
  }

  return json({ error: "not_found" }, 404);
}

function startPage(origin) {
  const redirectUri = `${origin}${CALLBACK_PATH}`;
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#07080a">
  <title>PKCE 自检 · QssedA Auth</title>
  <style>${css()}</style>
</head>
<body>
  <main class="shell">
    <div class="brand"><div class="mark">Q</div><div><strong>QssedA Auth</strong><span>OAuth 2.0 + PKCE Self-Test</span></div></div>
    <section class="card">
      <div class="eyebrow">开发者工具</div>
      <h1>PKCE 自检</h1>
      <p class="lead">不用桌面 GUI，也可以在当前浏览器完整验证 Authorization Code + PKCE (S256) 流程。</p>

      <div class="flow">
        <div><b>1</b><span>生成 code_verifier / state</span></div>
        <div><b>2</b><span>SHA-256 生成 code_challenge</span></div>
        <div><b>3</b><span>进入 /authorize 并确认授权</span></div>
        <div><b>4</b><span>用 code + verifier 换取 QssedA Token</span></div>
      </div>

      <div class="meta"><span>Client</span><code>${CLIENT_ID}</code></div>
      <div class="meta"><span>Callback</span><code>${escapeHtml(redirectUri)}</code></div>
      <div class="meta"><span>Scope</span><code>${SCOPE}</code></div>

      <button id="startButton" type="button">开始 PKCE 自检</button>
      <a class="button secondary" href="/">返回认证中心</a>
      <p id="message" class="message"></p>
    </section>
    <div class="foot">测试数据只保存在当前标签页的 sessionStorage；页面不会显示完整 Token。</div>
  </main>
<script>
(function(){
  const clientId=${JSON.stringify(CLIENT_ID)};
  const scope=${JSON.stringify(SCOPE)};
  const redirectUri=${JSON.stringify(redirectUri)};
  const button=document.getElementById('startButton');
  const message=document.getElementById('message');

  function base64url(bytes){
    let binary='';
    bytes.forEach(byte=>binary+=String.fromCharCode(byte));
    return btoa(binary).replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=+$/,'');
  }

  function randomUrlSafe(length){
    const bytes=new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return base64url(bytes);
  }

  async function challenge(verifier){
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier));
    return base64url(new Uint8Array(digest));
  }

  button.addEventListener('click',async()=>{
    button.disabled=true;
    message.textContent='正在生成 PKCE 参数…';
    try{
      const verifier=randomUrlSafe(64);
      const state=randomUrlSafe(24);
      const codeChallenge=await challenge(verifier);
      sessionStorage.setItem('qsseda_pkce_verifier',verifier);
      sessionStorage.setItem('qsseda_pkce_state',state);
      sessionStorage.setItem('qsseda_pkce_started_at',String(Date.now()));

      const params=new URLSearchParams({
        response_type:'code',
        client_id:clientId,
        redirect_uri:redirectUri,
        scope,
        state,
        code_challenge:codeChallenge,
        code_challenge_method:'S256'
      });
      location.assign('/authorize?'+params.toString());
    }catch(error){
      message.textContent='无法生成 PKCE 参数：'+(error&&error.message?error.message:'未知错误');
      button.disabled=false;
    }
  });
})();
</script>
</body>
</html>`;
}

function callbackPage(origin) {
  const redirectUri = `${origin}${CALLBACK_PATH}`;
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#07080a">
  <title>PKCE 自检结果 · QssedA Auth</title>
  <style>${css()}</style>
</head>
<body>
  <main class="shell">
    <div class="brand"><div class="mark">Q</div><div><strong>QssedA Auth</strong><span>OAuth 2.0 + PKCE Self-Test</span></div></div>
    <section class="card">
      <div id="statusIcon" class="result-icon pending">…</div>
      <h1 id="title">正在验证 PKCE</h1>
      <p id="lead" class="lead">正在校验 state 并兑换一次性 Authorization Code。</p>

      <div id="steps" class="flow compact">
        <div id="stateStep"><b>1</b><span>state 校验</span><em>等待</em></div>
        <div id="codeStep"><b>2</b><span>Authorization Code</span><em>等待</em></div>
        <div id="tokenStep"><b>3</b><span>PKCE Token Exchange</span><em>等待</em></div>
      </div>

      <div id="result" class="result hidden">
        <div class="meta"><span>Access Token</span><code id="accessToken">—</code></div>
        <div class="meta"><span>Refresh Token</span><code id="refreshToken">—</code></div>
        <div class="meta"><span>有效期</span><code id="expires">—</code></div>
        <div class="meta"><span>Scope</span><code id="scope">—</code></div>
        <button id="refreshButton" type="button">测试 Refresh Token Rotation</button>
        <button id="revokeButton" class="secondary" type="button">撤销当前测试 Token</button>
      </div>

      <div id="errorBox" class="error-box hidden"></div>
      <a class="button secondary" href="/pkce-test">重新测试</a>
      <a class="button ghost" href="/">返回认证中心</a>
    </section>
    <div class="foot">为防止截图泄漏，Token 只显示前后少量字符。</div>
  </main>
<script>
(async function(){
  const clientId=${JSON.stringify(CLIENT_ID)};
  const redirectUri=${JSON.stringify(redirectUri)};
  const params=new URLSearchParams(location.search);
  const expectedState=sessionStorage.getItem('qsseda_pkce_state')||'';
  const verifier=sessionStorage.getItem('qsseda_pkce_verifier')||'';
  const returnedState=params.get('state')||'';
  const code=params.get('code')||'';
  const oauthError=params.get('error')||'';
  const title=document.getElementById('title');
  const lead=document.getElementById('lead');
  const icon=document.getElementById('statusIcon');
  const result=document.getElementById('result');
  const errorBox=document.getElementById('errorBox');
  let currentAccess='';
  let currentRefresh='';

  function step(id,text,ok){
    const el=document.getElementById(id).querySelector('em');
    el.textContent=text;
    el.className=ok===true?'ok':ok===false?'bad':'';
  }

  function mask(value){
    if(!value)return '—';
    if(value.length<20)return value.slice(0,4)+'…';
    return value.slice(0,10)+'…'+value.slice(-6);
  }

  function fail(message){
    icon.textContent='!';icon.className='result-icon fail';
    title.textContent='PKCE 自检失败';
    lead.textContent='流程没有完成。';
    errorBox.textContent=message;
    errorBox.classList.remove('hidden');
  }

  function showTokens(data){
    currentAccess=data.access_token||'';
    currentRefresh=data.refresh_token||'';
    document.getElementById('accessToken').textContent=mask(currentAccess);
    document.getElementById('refreshToken').textContent=mask(currentRefresh);
    document.getElementById('expires').textContent=String(data.expires_in||0)+' 秒';
    document.getElementById('scope').textContent=data.scope||'—';
    result.classList.remove('hidden');
  }

  async function postToken(form){
    const response=await fetch('/oauth/token',{
      method:'POST',
      headers:{'content-type':'application/x-www-form-urlencoded'},
      body:new URLSearchParams(form).toString()
    });
    const data=await response.json();
    if(!response.ok)throw new Error(data.error_description||data.error||'Token endpoint returned an error');
    return data;
  }

  try{
    if(oauthError){
      step('stateStep','已返回',false);
      throw new Error('授权被拒绝或返回错误：'+oauthError);
    }
    if(!expectedState||!verifier){
      step('stateStep','缺失',false);
      throw new Error('当前标签页没有 PKCE 测试上下文，请从 /pkce-test 重新开始。');
    }
    if(returnedState!==expectedState){
      step('stateStep','不匹配',false);
      throw new Error('state 校验失败，已停止 Token Exchange。');
    }
    step('stateStep','通过',true);
    if(!code){
      step('codeStep','缺失',false);
      throw new Error('回调中没有 Authorization Code。');
    }
    step('codeStep','收到一次性 Code',true);

    const token=await postToken({
      grant_type:'authorization_code',
      client_id:clientId,
      code,
      redirect_uri:redirectUri,
      code_verifier:verifier
    });
    step('tokenStep','兑换成功',true);
    icon.textContent='✓';icon.className='result-icon success';
    title.textContent='PKCE 自检通过';
    lead.textContent='Authorization Code + PKCE (S256) 已成功换取 QssedA Token。';
    showTokens(token);
    sessionStorage.removeItem('qsseda_pkce_verifier');
    sessionStorage.removeItem('qsseda_pkce_state');
    sessionStorage.removeItem('qsseda_pkce_started_at');
  }catch(error){
    fail(error&&error.message?error.message:'未知错误');
  }

  document.getElementById('refreshButton').addEventListener('click',async function(){
    if(!currentRefresh)return;
    this.disabled=true;
    const old=currentRefresh;
    this.textContent='正在刷新…';
    try{
      const token=await postToken({grant_type:'refresh_token',client_id:clientId,refresh_token:old});
      const rotated=token.refresh_token&&token.refresh_token!==old;
      showTokens(token);
      this.textContent=rotated?'Rotation 成功 ✓':'刷新成功';
      lead.textContent=rotated?'Refresh Token 已轮换，旧 Refresh Token 已失效。':'Refresh Token 已刷新。';
    }catch(error){
      this.textContent='刷新失败';
      fail(error&&error.message?error.message:'Refresh Token 测试失败');
    }finally{
      setTimeout(()=>{this.disabled=false;if(this.textContent!=='刷新失败')this.textContent='再次测试 Refresh Token Rotation'},900);
    }
  });

  document.getElementById('revokeButton').addEventListener('click',async function(){
    if(!currentAccess&&!currentRefresh)return;
    this.disabled=true;
    this.textContent='正在撤销…';
    try{
      for(const token of [currentAccess,currentRefresh].filter(Boolean)){
        const response=await fetch('/oauth/revoke',{
          method:'POST',
          headers:{'content-type':'application/x-www-form-urlencoded'},
          body:new URLSearchParams({client_id:clientId,token}).toString()
        });
        if(!response.ok)throw new Error('撤销失败');
      }
      currentAccess='';currentRefresh='';
      this.textContent='测试 Token 已撤销 ✓';
      document.getElementById('refreshButton').disabled=true;
      lead.textContent='PKCE 流程通过，测试产生的 Token 已撤销。';
    }catch(error){
      this.textContent='撤销失败';
      fail(error&&error.message?error.message:'撤销失败');
    }
  });
})();
</script>
</body>
</html>`;
}

function html(content, status = 200) {
  return new Response(content, {
    status,
    headers: {
      "content-type": "text/html;charset=UTF-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      "x-frame-options": "DENY",
      "strict-transport-security": "max-age=31536000",
      "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=()",
      "content-security-policy": "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"
    }
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[character]));
}

function css() {
  return `:root{color-scheme:dark light;--bg:#07080a;--panel:rgba(27,28,32,.84);--surface:rgba(118,118,128,.16);--text:#f5f5f7;--muted:#a1a1a6;--quiet:#73737a;--line:rgba(255,255,255,.11);--accent:#0a84ff;--success:#30d158;--danger:#ff453a}@media(prefers-color-scheme:light){:root{--bg:#f3f4f7;--panel:rgba(255,255,255,.9);--surface:rgba(116,116,128,.1);--text:#111114;--muted:#62626a;--quiet:#85858d;--line:rgba(20,20,30,.1);--accent:#0071e3;--success:#248a3d;--danger:#d70015}}*{box-sizing:border-box}html,body{min-height:100%;margin:0}body{min-height:100dvh;display:grid;place-items:center;padding:max(22px,env(safe-area-inset-top)) max(18px,env(safe-area-inset-right)) max(22px,env(safe-area-inset-bottom)) max(18px,env(safe-area-inset-left));font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif;background:radial-gradient(circle at 18% 12%,rgba(10,132,255,.16),transparent 34%),radial-gradient(circle at 82% 78%,rgba(94,92,230,.10),transparent 30%),var(--bg);color:var(--text)}.shell{width:min(100%,500px)}.brand{display:flex;align-items:center;gap:12px;margin:0 0 18px 4px}.brand strong,.brand span{display:block}.brand span{font-size:12px;color:var(--muted);margin-top:2px}.mark{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:linear-gradient(145deg,#2997ff,#0067d8);color:#fff;font-weight:800}.card{border:1px solid var(--line);border-radius:22px;background:var(--panel);backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);padding:28px;box-shadow:0 28px 80px rgba(0,0,0,.35)}.eyebrow{color:var(--accent);font-size:12px;font-weight:700;margin-bottom:10px}h1{margin:0;font-size:30px;letter-spacing:-.04em}.lead{color:var(--muted);line-height:1.55;margin:10px 0 20px}.flow{display:grid;gap:8px;margin:18px 0}.flow>div{display:grid;grid-template-columns:28px 1fr auto;align-items:center;gap:10px;padding:11px 12px;border:1px solid var(--line);border-radius:13px;background:var(--surface)}.flow b{width:26px;height:26px;display:grid;place-items:center;border-radius:50%;background:rgba(10,132,255,.14);color:var(--accent);font-size:12px}.flow span{font-size:13px;color:var(--muted)}.flow em{font-style:normal;font-size:12px;color:var(--quiet)}.flow em.ok{color:var(--success)}.flow em.bad{color:var(--danger)}.meta{display:grid;grid-template-columns:82px 1fr;gap:10px;padding:10px 0;border-bottom:1px solid var(--line);font-size:12px}.meta span{color:var(--muted)}.meta code{overflow-wrap:anywhere;color:var(--text)}button,.button{width:100%;min-height:50px;margin-top:16px;border:0;border-radius:14px;padding:0 14px;display:flex;align-items:center;justify-content:center;text-align:center;text-decoration:none;background:var(--accent);color:#fff;font:inherit;font-weight:700;cursor:pointer}.secondary{background:var(--surface);color:var(--text);border:1px solid var(--line)}.ghost{background:transparent;color:var(--muted);border:1px solid transparent}button:disabled{opacity:.5}.message{color:var(--danger);font-size:13px;line-height:1.5}.foot{text-align:center;color:var(--quiet);font-size:11px;line-height:1.5;margin-top:14px}.result-icon{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:24px;margin-bottom:16px;background:var(--surface);color:var(--muted)}.result-icon.success{background:rgba(48,209,88,.14);color:var(--success)}.result-icon.fail{background:rgba(255,69,58,.14);color:var(--danger)}.result{margin-top:18px}.hidden{display:none!important}.error-box{margin-top:16px;padding:13px;border-radius:13px;background:rgba(255,69,58,.10);color:var(--danger);font-size:13px;line-height:1.5}@media(max-width:520px){.card{padding:24px 20px}h1{font-size:28px}.meta{grid-template-columns:72px 1fr}}`;
}
