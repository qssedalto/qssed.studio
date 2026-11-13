// Device-aware text and Windows installation guidance for Work TeX.
export function enhanceWorkTexDeviceReadiness(markup, zh) {
  const copy = zh ? {
    pdfTitle:'PDF 预览', mobileNoPdf:'暂无 PDF。移动设备可使用下方远程编译功能（需要获得额度）。',
    mobileSelect:'选择文件后可查看已有 PDF。',
    title:'首次编译前，请准备 Windows 本机环境',
    missing:'未检测到可用的本机 TeX 环境。如需本机编译，请按顺序安装；已安装则检查浏览器的本地网络权限后重试。也可使用下方需要额度的远程编译。',
    cloud:'本机编译尚不可用，但云端编译服务已连接。仅在需要本机编译时安装以下组件。',
    unsupported:'已连接 Bridge，但当前 TeX 引擎不受支持。请切换引擎后重新检测。',
    noEngine:'Windows Bridge 已连接，但未发现可用的 XeLaTeX。请检查 TeX Live 是否安装完整，再重新检测。',
    step1:'第 1 步：安装 TeX Live',step2:'第 2 步：安装 Windows 连接组件',
    iso:'下载 TeX Live（ISO）',bridge:'安装 Windows 连接组件',
    guide:'在 AERTEX 主站查看安装指南',retry:'重新检测连接',
    hint:'先安装 TeX Live，再启动 Windows 连接组件。若浏览器询问本地网络访问权限，请选择允许。',
    warn:'即将打开 Microsoft OneDrive 上的 TeX Live ISO，可能需要额外的网络环境。是否继续？'
  } : {
    pdfTitle:'PDF Preview',mobileNoPdf:'No PDF yet. Remote compilation below requires an approved quota.',
    mobileSelect:'Select a file to view an existing PDF.',
    title:'Prepare Windows before your first local compile',
    missing:'No working local TeX environment was found. Install the components in order for local builds, or check browser permissions if already installed. Quota-based remote compilation remains an alternative below.',
    cloud:'Local compilation is unavailable, but cloud compilation is connected. Install these only if you need local compilation.',
    unsupported:'Bridge is connected, but the selected TeX engine is unsupported. Select a supported engine and retry.',
    noEngine:'Windows Bridge is connected, but XeLaTeX is unavailable. Check that TeX Live is installed and retry.',
    step1:'Step 1: Install TeX Live',step2:'Step 2: Install Windows Bridge',
    iso:'Download TeX Live (ISO)',bridge:'Install Windows component',
    guide:'View the AERTEX setup guide',retry:'Check connection again',
    hint:'Install TeX Live before starting the Windows Bridge. Allow browser local-network access if requested.',
    warn:'You are opening the TeX Live ISO on Microsoft OneDrive. Additional network access may be needed. Continue?'
  };
  const setup='https://qsseda.com/'+(zh?'zh-cn':'en-us')+'/work/local';
  const bridge='https://qsseda.com/api/work/bridge/windows';
  const iso='https://1drv.ms/u/c/45a22b56b9646fc7/IQDExSUns1FzR6M3luj0QRQaAZ8Pc6frUc6zaYEr-Qnexvo?e=w9mHFn';
  const css=`<style id="tex-device-readiness-style">
  .tex-work-app.is-tex-mobile .tex-compiler-card,\n  .tex-work-app.is-tex-mobile #tex-compiler-pill,
  .tex-work-app.is-tex-mobile .tex-live-preview-toggle,
  .tex-work-app.is-tex-mobile .tex-live-preview-foot>span{display:none!important}
  .tex-work-app.is-tex-mobile .tex-live-preview-foot:has(#tex-live-preview-open[hidden]){display:none!important}
  .tex-work-app.is-tex-mobile .tex-live-preview-head{justify-content:flex-start!important}
  .tex-work-app.is-tex-windows-setup .tex-compiler-card{display:none!important}\n  .tex-work-app .tex-first-run-windows[hidden],.tex-work-app .tex-windows-steps[hidden]{display:none!important}
  .tex-work-app .tex-first-run-windows{display:grid;gap:10px;margin:9px;padding:13px;
   border:1px solid var(--border);border-radius:13px;background:var(--surface);color:var(--text)}
  .tex-work-app .tex-first-run-windows h3{margin:0;font-size:13px;font-weight:700;line-height:1.4}
  .tex-work-app .tex-first-run-windows p{margin:0;font-size:11px;line-height:1.6;color:var(--muted)}
  .tex-work-app .tex-windows-steps{display:grid;gap:8px}
  .tex-work-app .tex-windows-step{display:flex;align-items:center;justify-content:space-between;
    flex-wrap:wrap;gap:8px;border:1px solid var(--border);background:var(--card);padding:10px;border-radius:10px}
  .tex-work-app .tex-windows-step strong{font-size:11px}
  .tex-work-app .tex-first-run-windows a,.tex-work-app .tex-first-run-windows button{
    display:inline-flex;align-items:center;justify-content:center;min-height:36px;max-width:100%;
    padding:7px 11px;font-size:11px;font-weight:600;line-height:1.4;text-align:center;
    color:var(--text);background:var(--card);border:1px solid var(--border);
    text-decoration:none;border-radius:9px;cursor:pointer}
  .tex-work-app .tex-windows-actions{display:flex;flex-wrap:wrap;gap:8px}
  .tex-work-app .tex-first-run-windows a:focus-visible,.tex-work-app .tex-first-run-windows button:focus-visible{
    outline:2px solid var(--primary);outline-offset:2px}
  </style>`;
  const js=`<script id="tex-device-readiness-script">(() => {
    const copy=__COPY__;
    const root=document.querySelector('.tex-work-app');
    if(!root)return;
    const ua=navigator.userAgent||'';
    const mobile=/Android|iPhone|iPad|iPod|Mobile/i.test(ua)||
      (navigator.platform==='MacIntel'&&Number(navigator.maxTouchPoints)>1);
    const windows=/Windows NT/i.test(ua)&&!mobile;
    if(mobile){
      root.classList.add('is-tex-mobile');
      const heading=root.querySelector('#tex-live-preview-card .tex-live-preview-head strong');
      if(heading)heading.textContent=copy.pdfTitle;
      const placeholder=root.querySelector('#tex-live-preview-placeholder');
      if(placeholder)placeholder.textContent=copy.mobileNoPdf;
      const status=root.querySelector('#tex-live-preview-status');
      if(status)status.textContent=copy.mobileSelect;
      return;
    }
    if(!windows)return;
    const runner=root.querySelector('.tex-runs-panel');
    const preview=root.querySelector('#tex-live-preview-card');
    if(!runner||document.getElementById('tex-first-run-windows'))return;
    const panel=document.createElement('section');
    panel.id='tex-first-run-windows';panel.className='tex-first-run-windows';
    panel.hidden=true;panel.setAttribute('aria-live','polite');
    const title=document.createElement('h3');title.textContent=copy.title;
    const description=document.createElement('p');
    const steps=document.createElement('div');steps.className='tex-windows-steps';
    function link(text,url){
      const a=document.createElement('a');a.textContent=text;a.href=url;
      a.target='_blank';a.rel='noopener noreferrer';return a;
    }
    function step(text,label,url){
      const el=document.createElement('div');el.className='tex-windows-step';
      const heading=document.createElement('strong');heading.textContent=text;
      el.append(heading,link(label,url));steps.append(el);
    }
    step(copy.step1,copy.iso,__ISO__);
    step(copy.step2,copy.bridge,__BRIDGE__);
    steps.querySelector('a')?.addEventListener('click',event=>{
      if(!window.confirm(copy.warn))event.preventDefault();
    });
    const actions=document.createElement('div');actions.className='tex-windows-actions';
    actions.append(link(copy.guide,__SETUP__));
    const retry=document.createElement('button');retry.type='button';retry.textContent=copy.retry;
    retry.addEventListener('click',()=>{
      const btn=root.querySelector('#tex-connection-check');
      if(btn&&!btn.disabled)btn.click();
    });
    actions.append(retry);
    const hint=document.createElement('p');hint.textContent=copy.hint;
    panel.append(title,description,steps,actions,hint);
    if(preview)preview.after(panel);else runner.prepend(panel);
    function sync(data){
      if(!data||typeof data!=='object')return;
      panel.hidden=Boolean(data.localSupported);
      root.classList.toggle('is-tex-windows-setup',!data.localSupported && !data.cloudAvailable);
      if(panel.hidden)return;
      const hasBridge=Boolean(data.localDetected);
      const engineReady=Boolean(data.localEngineReady);
      description.textContent=hasBridge?(engineReady?copy.unsupported:copy.noEngine):
        data.cloudAvailable?copy.cloud:copy.missing;
      steps.hidden=hasBridge && engineReady;
      // When the Bridge exists but TeX Live does not, offer only the TeX
      // installation link; do not ask the user to reinstall a running service.
      if(steps.children[1])steps.children[1].hidden=hasBridge;
      hint.hidden=hasBridge;
    }
    window.addEventListener('qsseda:tex-compiler-probed',event=>sync(event.detail));
    sync(window.__aertexTexCompilerProbe);
  })();</script>`
  .replace('__COPY__',JSON.stringify(copy))
  .replace('__SETUP__',JSON.stringify(setup))
  .replace('__BRIDGE__',JSON.stringify(bridge))
  .replace('__ISO__',JSON.stringify(iso));
  return String(markup||'').replace('</body>',css+js+'</body>');
}
