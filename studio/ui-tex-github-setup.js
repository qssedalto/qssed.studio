// Standalone quota onboarding page. All return navigation remains on the current Work origin.
export function texGithubSetupContent(zh, locale) {
  const label = zh ? {
    eyebrow:"AERTEX / WORK / GITHUB", title:"远程编译 · 使用前须知",
    intro:"GitHub Actions 远程编译用于移动设备、临时无法使用本机 TeX 的场景。桌面电脑优先使用本机编译：更快，也不会消耗有限额度。",
    rules:"额度与计费规则",note:"申请由管理员审核，通过后才会分配额度。",
    how:"申请每周额度", choose:"申请的每周额度",submit:"提交额度申请",
    consent:"我了解：每次主动提交 GitHub 编译均可能消耗一次额度；即使编译失败也可能扣除，且源码会写入本人专属私有 GitHub 仓库。",
    return:"返回原文档", pending:"申请已提交，等待管理员审核。", approved:"额度已获批准，可以返回文档进行编译。",
    admin:"管理员无需申请、无需扣费或受每周上限限制。",
    unavailable:"远程编译尚未启用，请等待管理员完成服务设置。",
    fail:"无法获取额度状态，请稍后重试。", working:"正在提交申请…",
    perWeek:"每周最多使用 100 次（含上周结余）", roll:"每周一 00:00（北京时间）发放本周额度，未使用部分自动结转下周。",
    expensive:"编译会占用 GitHub Actions 资源。请先用本机 TeX 检查语法，再谨慎使用远程编译。",
    current:"当前本周可用",balance:"累计未使用结余",request:"每周申请",submitError:"申请失败"
  } : {
    eyebrow:"AERTEX / WORK / GITHUB",title:"Remote compilation · Before you start",
    intro:"Use GitHub Actions compilation on mobile or when local TeX is unavailable. Local builds are faster and do not consume credits.",
    rules:"Weekly credit policy",note:"Your request requires administrator approval before use.",
    how:"Request a weekly allocation",choose:"Credits granted per week",submit:"Submit application",
    consent:"I understand each submitted build may consume a credit even if compilation fails, and my source is uploaded to my private GitHub repository.",
    return:"Return to original document",pending:"Application submitted. Awaiting administrator review.",approved:"Credit approved. Return to your document to compile.",
    admin:"Administrators can build without requests, credit charges, or a weekly limit.",
    unavailable:"Remote compilation is not yet enabled.",fail:"Could not load quota status.",working:"Submitting application…",
    perWeek:"Up to 100 builds per week (including rollover)",roll:"New credits arrive Mondays at 00:00 China Standard Time; unused credits carry forward.",
    expensive:"GitHub Actions builds consume resources. Check your TeX locally before using limited remote builds.",
    current:"Available this week",balance:"Unspent balance",request:"Credits per week",submitError:"Application failed"
  };
  const copy=JSON.stringify(label).replace(/</g,"\\u003c");
  return '<main class="tex-setup" id="tex-setup">'+
  '<header class="tex-setup-heading"><div class="tex-setup-eyebrow">'+label.eyebrow+'</div><h1>'+label.title+'</h1><p>'+label.intro+'</p></header>'+
  '<div class="tex-setup-columns"><section class="tex-setup-panel"><h2>'+label.rules+'</h2>'+
  '<div class="tex-setup-rule"><span>01</span><strong>'+label.perWeek+'</strong></div>'+
  '<div class="tex-setup-rule"><span>02</span><strong>'+label.roll+'</strong></div>'+
  '<div class="tex-setup-rule"><span>03</span><strong>'+label.expensive+'</strong></div>'+
  '<div class="tex-setup-note">'+label.note+'</div></section>'+
  '<section class="tex-setup-panel"><h2>'+label.how+'</h2><p id="tex-setup-state" role="status" aria-live="polite"></p>'+
  '<div id="tex-setup-metrics" class="tex-setup-metrics" hidden></div>'+
  '<form id="tex-setup-form" hidden><label>'+label.choose+' <select id="tex-setup-credits" name="credits"><option value="10">10</option><option value="25">25</option><option value="50">50</option><option value="100" selected>100</option></select></label>'+
  '<label class="tex-setup-consent"><input type="checkbox" id="tex-setup-consent" required><span>'+label.consent+'</span></label>'+
  '<button class="tex-setup-primary" id="tex-setup-submit" type="submit">'+label.submit+'</button></form>'+
  '<a id="tex-setup-return" class="tex-setup-return" href="/'+locale+'/tex">'+label.return+'</a>'+
  '</section></div></main>'+
  '<style id="tex-setup-style">'+
  '.tex-setup{max-width:1130px;margin:22px auto;padding:18px 24px 52px;color:var(--text)}'+
  '.tex-setup-heading{padding:28px 0 34px;border-bottom:1px solid var(--border)}'+
  '.tex-setup-eyebrow{font:700 11px ui-monospace,Consolas,monospace;letter-spacing:.14em;color:var(--primary)}'+
  '.tex-setup h1{font-size:clamp(30px,4vw,50px);letter-spacing:-.045em;line-height:1.15;margin:13px 0 16px}'+
  '.tex-setup-heading p{max-width:790px;color:var(--muted);font-size:15px;line-height:1.8}'+
  '.tex-setup-columns{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:25px}'+
  '.tex-setup-panel{padding:28px;background:var(--surface);border:1px solid var(--border);border-radius:19px;min-width:0}'+
  '.tex-setup-panel h2{margin:0 0 22px;font-size:21px}'+
  '.tex-setup-rule{display:flex;gap:16px;padding:14px 0;border-bottom:1px solid var(--border);align-items:flex-start}'+
  '.tex-setup-rule span{color:var(--primary);font:700 12px ui-monospace,monospace}'+
  '.tex-setup-rule strong{font-size:13px;line-height:1.8;font-weight:580}'+
  '.tex-setup-note{margin-top:20px;color:var(--muted);font-size:12px;line-height:1.7}'+
  '#tex-setup-state{font-size:13px;line-height:1.65;color:var(--muted);min-height:28px}'+
  '#tex-setup-form{display:grid;gap:20px}#tex-setup-form[hidden],#tex-setup-metrics[hidden]{display:none!important}'+
  '#tex-setup-form>label:not(.tex-setup-consent){display:grid;gap:10px;font-weight:650}'+
  '#tex-setup-credits{width:100%;height:46px;border:1px solid var(--border);border-radius:10px;background:var(--card);color:var(--text);padding:0 13px}'+
  '.tex-setup-consent{display:flex;gap:10px;align-items:flex-start;font-size:12px;line-height:1.65;color:var(--muted)}'+
  '.tex-setup-consent input{accent-color:var(--primary);margin-top:4px}'+
  '.tex-setup-primary,.tex-setup-return{display:flex;align-items:center;justify-content:center;min-height:44px;border-radius:10px;cursor:pointer;font:650 13px inherit;text-decoration:none;padding:0 17px}'+
  '.tex-setup-primary{border:0;background:var(--primary);color:white}.tex-setup-return{margin-top:19px;color:var(--text);border:1px solid var(--border);background:var(--card)}'+
  '.tex-setup-metrics{display:grid;gap:9px;margin:16px 0;color:var(--text);font-size:13px}'+
  '@media(max-width:800px){.tex-setup{padding:13px 14px 42px}.tex-setup-columns{grid-template-columns:1fr}.tex-setup-panel{padding:21px}}'+
  '</style><script id="tex-setup-runtime">(()=>{' +
  'const copy='+copy+';const q=id=>document.getElementById(id);'+
  'const params=new URLSearchParams(location.search);const original=params.get("return")||"";'+
  'let back="/'+locale+'/tex";'+
  'if(original.startsWith("/")&&!original.startsWith("//")&&!original.includes("\\\\")&&!original.includes("\\u0000")){'+
  'try{const parsed=new URL(original,location.origin);if(parsed.origin===location.origin&&'+
  '/^\\/(zh-cn|en-us|en)\\/(?:d\\/[a-f0-9-]{36}|tex)$/.test(parsed.pathname))back=parsed.pathname+parsed.search+parsed.hash;}catch{}}'+
  'q("tex-setup-return").href=back;'+
  'const state=q("tex-setup-state"),form=q("tex-setup-form"),metrics=q("tex-setup-metrics");'+
  'async function status(){const r=await fetch("/api/tex/github/status",{credentials:"same-origin",cache:"no-store"});if(!r.ok)throw Error(copy.fail);return r.json();}'+
  'async function refresh(){const s=await status();form.hidden=true;metrics.hidden=true;'+
  'if(!s.configured){state.textContent=copy.unavailable;return;}'+
  'if(s.is_admin||s.unlimited){state.textContent=copy.admin;metrics.hidden=false;metrics.textContent="∞";return;}'+
  'if(s.approval_status==="approved"){state.textContent=copy.approved;metrics.hidden=false;'+
  'metrics.textContent=copy.current+": "+s.remaining+" / "+copy.balance+": "+s.balance;return;}'+
  'if(s.approval_status==="pending"){state.textContent=copy.pending;return;}'+
  'state.textContent=copy.note;form.hidden=false;}'+
  'form.addEventListener("submit",async event=>{event.preventDefault();'+
  'const credits=Number(q("tex-setup-credits").value);if(!q("tex-setup-consent").checked)return;'+
  'const submit=q("tex-setup-submit");submit.disabled=true;state.textContent=copy.working;'+
  'try{const r=await fetch("/api/tex/github/apply",{method:"POST",credentials:"same-origin",'+
  'headers:{"content-type":"application/json"},body:JSON.stringify({credits})});'+
  'const data=await r.json();if(!r.ok)throw Error(data.error||copy.submitError);'+
  'form.hidden=true;state.textContent=copy.pending;'+
  'setTimeout(()=>{location.assign(back)},1500);'+
  '}catch(e){state.textContent=e.message||copy.submitError;submit.disabled=false;}});'+
  'refresh().catch(e=>{state.textContent=e.message||copy.fail;});'+
  '})();</script>';
}
