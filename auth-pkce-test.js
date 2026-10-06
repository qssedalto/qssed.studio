// 初学者导读：PKCE 辅助/测试逻辑，用于验证 code_verifier 与 code_challenge 处理是否符合预期；不要把测试便利逻辑当生产授权绕过。
import { injectBrandLogoRuntime } from "./studio/brand-logo.js";

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
  <meta name="theme-color" content="#0b0b0d" media="(prefers-color-scheme: dark)">
  <meta name="theme-color" content="#f5f5f7" media="(prefers-color-scheme: light)">
  <title>登录流程测试 · AERTEX</title>
  <style>${css()}</style>
</head>
<body>
  <main class="shell">
    <div class="brand"><img class="mark" src="/favicon.svg?v=aertex-20261003-square-1" alt="" aria-hidden="true"><div><strong>AERTEX</strong><span>登录流程测试</span></div></div>
    <section class="card">
      <div class="hero-icon" aria-hidden="true">✓</div>
      <h1>测试应用登录</h1>
      <p class="lead">确认 AERTEX 可以正常完成应用登录与授权。</p>

      <button id="startButton" type="button">开始测试</button>
      <a class="button secondary" href="/">返回</a>
      <p id="message" class="message" role="status" aria-live="polite"></p>

      <details>
        <summary>技术信息</summary>
        <div class="tech">
          <div><span>协议</span><code>OAuth 2.0 + PKCE (S256)</code></div>
          <div><span>Client</span><code>${CLIENT_ID}</code></div>
          <div><span>Callback</span><code>${escapeHtml(redirectUri)}</code></div>
        </div>
      </details>
    </section>
    <div class="foot">AERTEX</div>
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
    message.textContent='正在准备…';
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
      message.textContent='无法开始测试，请重试。';
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
  <meta name="theme-color" content="#0b0b0d" media="(prefers-color-scheme: dark)">
  <meta name="theme-color" content="#f5f5f7" media="(prefers-color-scheme: light)">
  <title>登录流程测试 · AERTEX</title>
  <style>${css()}</style>
</head>
<body>
  <main class="shell">
    <div class="brand"><img class="mark" src="/favicon.svg?v=aertex-20261003-square-1" alt="" aria-hidden="true"><div><strong>AERTEX</strong><span>登录流程测试</span></div></div>
    <section class="card">
      <div id="statusIcon" class="result-icon pending" aria-hidden="true">…</div>
      <h1 id="title">正在检查</h1>
      <p id="lead" class="lead">请稍候，正在确认登录流程。</p>

      <div id="result" class="result hidden">
        <button id="refreshButton" type="button">测试保持登录</button>
        <button id="revokeButton" class="secondary" type="button">结束测试</button>
      </div>

      <div id="errorBox" class="error-box hidden" role="alert"></div>

      <details>
        <summary>技术信息</summary>
        <div id="steps" class="steps">
          <div id="stateStep"><span>请求校验</span><em>等待</em></div>
          <div id="codeStep"><span>授权结果</span><em>等待</em></div>
          <div id="tokenStep"><span>会话交换</span><em>等待</em></div>
        </div>
        <div class="tech">
          <div><span>Access Token</span><code id="accessToken">—</code></div>
          <div><span>Refresh Token</span><code id="refreshToken">—</code></div>
          <div><span>有效期</span><code id="expires">—</code></div>
          <div><span>Scope</span><code id="scope">—</code></div>
        </div>
      </details>

      <a class="button ghost" href="/pkce-test">重新测试</a>
      <a class="button ghost" href="/">返回 AERTEX</a>
    </section>
    <div class="foot">AERTEX</div>
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
    icon.textContent='!';
    icon.className='result-icon fail';
    title.textContent='测试未完成';
    lead.textContent='请重新尝试。';
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
    if(!response.ok)throw new Error(data.error_description||data.error||'登录服务返回错误');
    return data;
  }

  try{
    if(oauthError){
      step('stateStep','未通过',false);
      throw new Error('你取消了授权，或授权请求未完成。');
    }
    if(!expectedState||!verifier){
      step('stateStep','缺失',false);
      throw new Error('测试信息已失效，请重新开始。');
    }
    if(returnedState!==expectedState){
      step('stateStep','未通过',false);
      throw new Error('安全校验未通过，请重新开始。');
    }
    step('stateStep','通过',true);
    if(!code){
      step('codeStep','缺失',false);
      throw new Error('没有收到授权结果。');
    }
    step('codeStep','通过',true);

    const token=await postToken({
      grant_type:'authorization_code',
      client_id:clientId,
      code,
      redirect_uri:redirectUri,
      code_verifier:verifier
    });
    step('tokenStep','通过',true);
    icon.textContent='✓';
    icon.className='result-icon success';
    title.textContent='登录流程正常';
    lead.textContent='AERTEX 已成功完成应用登录与授权。';
    showTokens(token);
    sessionStorage.removeItem('qsseda_pkce_verifier');
    sessionStorage.removeItem('qsseda_pkce_state');
    sessionStorage.removeItem('qsseda_pkce_started_at');
  }catch(error){
    fail(error&&error.message?error.message:'测试未完成');
  }

  document.getElementById('refreshButton').addEventListener('click',async function(){
    if(!currentRefresh)return;
    this.disabled=true;
    const old=currentRefresh;
    this.textContent='正在检查…';
    try{
      const token=await postToken({grant_type:'refresh_token',client_id:clientId,refresh_token:old});
      const rotated=token.refresh_token&&token.refresh_token!==old;
      showTokens(token);
      this.textContent=rotated?'保持登录正常 ✓':'保持登录正常';
      lead.textContent='应用可以安全地保持登录状态。';
    }catch(error){
      this.textContent='检查失败';
      fail(error&&error.message?error.message:'保持登录测试失败');
    }finally{
      setTimeout(()=>{
        this.disabled=false;
        if(this.textContent!=='检查失败')this.textContent='再次测试保持登录';
      },900);
    }
  });

  document.getElementById('revokeButton').addEventListener('click',async function(){
    if(!currentAccess&&!currentRefresh)return;
    this.disabled=true;
    this.textContent='正在结束…';
    try{
      for(const token of [currentAccess,currentRefresh].filter(Boolean)){
        const response=await fetch('/oauth/revoke',{
          method:'POST',
          headers:{'content-type':'application/x-www-form-urlencoded'},
          body:new URLSearchParams({client_id:clientId,token}).toString()
        });
        if(!response.ok)throw new Error('无法结束测试');
      }
      currentAccess='';
      currentRefresh='';
      this.textContent='测试已结束 ✓';
      document.getElementById('refreshButton').disabled=true;
      lead.textContent='测试产生的访问权限已撤销。';
    }catch(error){
      this.textContent='结束失败';
      fail(error&&error.message?error.message:'无法结束测试');
    }
  });
})();
</script>
</body>
</html>`;
}

function html(content, status = 200) {
  return new Response(injectBrandLogoRuntime(content), {
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
  return `:root{color-scheme:dark light;--bg:#0b0b0d;--panel:rgba(30,30,32,.84);--surface:rgba(118,118,128,.16);--text:#f5f5f7;--muted:#a1a1a6;--line:rgba(255,255,255,.11);--accent:#0a84ff;--success:#30d158;--danger:#ff453a;--shadow:0 28px 80px rgba(0,0,0,.38)}@media(prefers-color-scheme:light){:root{--bg:#f5f5f7;--panel:rgba(255,255,255,.9);--surface:rgba(118,118,128,.10);--text:#1d1d1f;--muted:#6e6e73;--line:rgba(0,0,0,.09);--accent:#0071e3;--success:#248a3d;--danger:#d70015;--shadow:0 24px 64px rgba(0,0,0,.10)}}*{box-sizing:border-box}html,body{min-height:100%;margin:0}body{min-height:100dvh;display:grid;place-items:center;padding:max(22px,env(safe-area-inset-top)) max(18px,env(safe-area-inset-right)) max(22px,env(safe-area-inset-bottom)) max(18px,env(safe-area-inset-left));font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif;font-optical-sizing:auto;background:var(--bg);color:var(--text)}.shell{width:min(100%,440px)}.brand{display:flex;align-items:center;gap:11px;margin:0 0 18px 4px}.brand strong,.brand span{display:block}.brand strong{font-size:15px}.brand span{font-size:12px;color:var(--muted);margin-top:2px}.mark{width:40px;height:40px;display:block;object-fit:contain}.card{border:1px solid var(--line);border-radius:26px;background:var(--panel);backdrop-filter:blur(24px) saturate(135%);-webkit-backdrop-filter:blur(24px) saturate(135%);padding:30px;box-shadow:var(--shadow)}.hero-icon,.result-icon{width:56px;height:56px;margin:0 auto 18px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--accent);font-size:24px;font-weight:800}.result-icon.success{background:color-mix(in srgb,var(--success) 14%,transparent);color:var(--success)}.result-icon.fail{background:color-mix(in srgb,var(--danger) 14%,transparent);color:var(--danger)}h1{text-align:center;margin:0;font-size:29px;line-height:1.1;letter-spacing:-.035em;font-weight:730}.lead{text-align:center;margin:9px 0 22px;color:var(--muted);font-size:14px;line-height:1.5}button,.button{width:100%;min-height:50px;margin-top:14px;border:0;border-radius:14px;padding:0 14px;display:flex;align-items:center;justify-content:center;text-decoration:none;background:var(--accent);color:white;font:inherit;font-size:15px;font-weight:700;cursor:pointer;transition:transform .10s ease,opacity .15s ease}.secondary{background:var(--surface);color:var(--text);border:1px solid var(--line)}.ghost{background:transparent;color:var(--muted)}button:active,.button:active{transform:scale(.98)}button:disabled{opacity:.5}.message{min-height:18px;margin:12px 0 0;text-align:center;color:var(--danger);font-size:12px}.foot{text-align:center;color:var(--muted);font-size:11px;margin-top:14px}.hidden{display:none!important}.result{margin-top:4px}details{margin-top:18px;border-top:1px solid var(--line);padding-top:14px}summary{cursor:pointer;color:var(--muted);font-size:12px;text-align:center;list-style:none}summary::-webkit-details-marker{display:none}.tech{margin-top:12px;border-radius:14px;background:var(--surface);padding:4px 12px}.tech>div,.steps>div{display:grid;grid-template-columns:90px 1fr;gap:10px;padding:10px 0;border-bottom:1px solid var(--line);font-size:11px}.tech>div:last-child,.steps>div:last-child{border-bottom:0}.tech span,.steps span{color:var(--muted)}.tech code{overflow-wrap:anywhere}.steps{margin-top:12px;border-radius:14px;background:var(--surface);padding:4px 12px}.steps em{font-style:normal;text-align:right;color:var(--muted)}.steps em.ok{color:var(--success)}.steps em.bad{color:var(--danger)}.error-box{margin-top:14px;padding:12px;border-radius:13px;background:color-mix(in srgb,var(--danger) 10%,transparent);color:var(--danger);font-size:12px;line-height:1.45}@media(max-width:520px){.card{padding:26px 20px;border-radius:24px}h1{font-size:27px}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.001ms!important;transition-duration:.001ms!important}}@media(prefers-contrast:more){.card,.secondary,.tech,.steps{border:1px solid currentColor}.card{background:var(--bg);backdrop-filter:none;-webkit-backdrop-filter:none}}`;
}
