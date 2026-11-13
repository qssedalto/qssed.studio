// Work TeX toolbar: a fixed compile action, immutable title display and
// source-aware compilation result badges. Internal input/buttons remain mounted
// for existing autosave, history, deletion and compilation event handlers.
export function enhanceWorkTexCompileToolbar(markup, zh) {
  const copy = zh ? {
    compile: "立即编译", busy: "正在编译", success: "编译成功", failure: "编译失败",
    download: "下载日志", unnamed: "未命名 TeX 文档",
    logFallback: "编译失败，但编译器没有返回详细日志。"
  } : {
    compile: "Compile now", busy: "Compiling", success: "Compiled successfully", failure: "Compile failed",
    download: "Download log", unnamed: "Untitled TeX document",
    logFallback: "Compilation failed without a detailed compiler log."
  };
  const stylesheet = `
<style id="aertex-tex-compile-toolbar-style">
  .tex-work-app #tex-title{display:none!important}
  .tex-work-app #tex-delete,.tex-work-app #tex-download{display:none!important}
  .tex-work-app .tex-editor-toolbar>.tex-static-title-row{
    display:flex!important;align-items:center!important;gap:8px!important;
    flex:1 1 0%!important;min-width:0!important;max-width:100%!important;
    min-height:38px!important;margin:0!important;padding:0 4px!important
  }
  .tex-work-app .tex-static-title{
    display:block;flex:0 1 auto;max-width:100%;min-width:0;
    color:var(--text);font-size:17px;font-weight:680;letter-spacing:-.02em;
    line-height:1.35;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
    user-select:text
  }
  .tex-work-app .tex-build-indicator{
    display:flex;flex:0 0 23px;width:23px;height:23px;align-items:center;
    justify-content:center
  }
  .tex-work-app .tex-build-indicator[hidden],
  .tex-work-app .tex-build-log[hidden]{display:none!important}
  .tex-work-app .tex-build-indicator svg{display:block;width:23px;height:23px}
  .tex-work-app .tex-build-log{
    flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;
    min-width:0;width:auto;min-height:28px;height:28px;padding:0 9px;
    border:0;border-radius:7px;background:#1677ff;color:#fff;
    font:600 11px/1.15 inherit;cursor:pointer;white-space:nowrap;
    box-shadow:none
  }
  .tex-work-app .tex-build-log:hover{background:#0965df}
  .tex-work-app .tex-build-log:focus-visible{outline:2px solid #1677ff;outline-offset:2px}
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-source-label>.tex-compile-fixed{
    box-sizing:border-box!important;display:flex!important;align-items:center!important;
    justify-content:center!important;flex:0 0 39px!important;
    width:39px!important;min-width:39px!important;max-width:39px!important;
    height:39px!important;min-height:39px!important;margin:0!important;
    padding:0!important;position:relative!important;overflow:visible!important
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-compile-fixed #tex-compile{
    appearance:none!important;display:grid!important;place-items:center!important;
    width:39px!important;min-width:39px!important;max-width:39px!important;
    height:39px!important;min-height:39px!important;margin:0!important;
    padding:0!important;border:0!important;border-radius:8px!important;
    background:transparent!important;color:color-mix(in srgb,var(--text) 84%,var(--surface))!important;
    box-shadow:none!important;font-size:0!important;line-height:0!important;
    cursor:pointer!important;opacity:1!important
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-compile-fixed #tex-compile:hover:not(:disabled){
    background:var(--fill)!important
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-compile-fixed #tex-compile:disabled{
    cursor:not-allowed!important;opacity:.34!important
  }
  .tex-work-app .tex-compile-vector{
    display:block;width:31px;height:31px;position:absolute;top:4px;left:4px;
    pointer-events:none;color:color-mix(in srgb,var(--text) 84%,var(--surface))
  }
  .tex-work-app .tex-compile-vector svg{display:block;width:100%;height:100%;overflow:visible}
  .tex-work-app .tex-compile-fixed:has(#tex-compile:disabled) .tex-compile-vector{opacity:.34}
  .tex-work-app .tex-compile-fixed:has(#tex-compile:hover:not(:disabled)) .tex-compile-vector{
    color:var(--text)
  }
  .tex-work-app .tex-editor-footer .tex-editor-actions{display:none!important}
  .tex-work-app .tex-editor-footer{min-height:33px!important}
  @media(max-width:950px) and (pointer:coarse), (max-width:760px) {
    .tex-work-app .tex-editor-toolbar>.tex-static-title-row{
      grid-column:1/-1!important;width:100%!important;padding:0 5px!important;
      min-height:36px!important
    }
    .tex-work-app .tex-static-title{font-size:17px}
    .tex-work-app .tex-editor-toolbar>#tex-title{display:none!important}
    .tex-work-app .tex-build-log{font-size:10px}
  }
</style>`;
  // The workflow shape follows the five-node supplied reference: a ringed
  // play action, two linked completed nodes, two lower nodes, and one muted
  // lower-right ring. Geometry stays monochrome except for the muted ring.
  const workflowSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">'
    + '<g stroke="currentColor" stroke-width=".99" stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M4.91 9.17v8.92c0 1.28 1.06 2.33 2.34 2.33h1.36"/>'
    + '<path d="M4.91 9.17c0 1.78 1.21 2.87 3.18 2.87h.54"/>'
    + '<path d="M14.65 12.15h2.64"/>'
    + '<circle cx="4.91" cy="4.91" r="4.28"/>'
    + '<path d="M3.62 3.02 6.8 4.95 3.62 6.83Z" stroke-width="1.03"/>'
    + '<circle cx="11.69" cy="12.17" r="3.02"/>'
    + '<circle cx="20.28" cy="12.17" r="3.02"/>'
    + '<circle cx="11.69" cy="20.27" r="3.02"/>'
    + '<path d="m10.5 12.03.79.76 1.61-1.6m6.2.84.8.76 1.59-1.6" stroke-width="1.09"/>'
    + '<circle cx="10.87" cy="20.27" r=".39"/><circle cx="12.54" cy="20.27" r=".39"/>'
    + '<path d="M16.93 20.27h.31" stroke-width=".97"/>'
    + '</g><circle cx="20.28" cy="20.27" r="3.02" stroke="#989da5" stroke-width=".99"/>'
    + '</svg>';
  const successSvg = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="11" fill="#4a894a"/><path d="m7.7 12.25 2.95 2.85 5.85-6.55" fill="none" stroke="#fff" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const failedSvg = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="11" fill="#b93535"/><path d="M8.2 8.2 15.8 15.8M15.8 8.2 8.2 15.8" fill="none" stroke="#fff" stroke-width="1.65" stroke-linecap="round"/></svg>';
  const script = `
<script id="aertex-tex-compile-toolbar-runtime">
(() => {
  if(window.__aertexTexCompileToolbarReady)return;
  window.__aertexTexCompileToolbarReady=true;
  const labels=__LABELS__;
  const workflowSvg=__WORKFLOW__;
  const successSvg=__SUCCESS__;
  const failedSvg=__FAILED__;
  const start=()=>{
    const root=document.querySelector('.tex-work-app[data-tex-root]');
    const toolbar=root?.querySelector('.tex-editor-toolbar');
    const title=document.getElementById('tex-title');
    const bar=root?.querySelector('.tex-editor-commandbar');
    const compile=document.getElementById('tex-compile');
    if(!root||!toolbar||!title||!bar||!compile){
      window.setTimeout(start,80);return;
    }
    if(document.getElementById('tex-compile-fixed'))return;
    // Keep the original value-bearing input for autosave, collaborative rename
    // and compilation requests, but remove it from the visual/keyboard UI.
    title.readOnly=true;
    title.tabIndex=-1;
    title.setAttribute('aria-hidden','true');
    title.hidden=true;
    const titleRow=document.createElement('div');
    titleRow.className='tex-static-title-row';
    const heading=document.createElement('span');
    heading.id='tex-title-static';
    heading.className='tex-static-title';
    heading.textContent=title.value||labels.unnamed;
    heading.title=heading.textContent;
    const indicator=document.createElement('span');
    indicator.id='tex-build-indicator';
    indicator.className='tex-build-indicator';
    indicator.hidden=true;
    indicator.setAttribute('role','status');
    indicator.setAttribute('aria-live','polite');
    const logButton=document.createElement('button');
    logButton.id='tex-build-download-log';
    logButton.type='button';
    logButton.className='tex-build-log';
    logButton.textContent=labels.download;
    logButton.hidden=true;
    let currentLog='';
    let currentId='';
    const activeId=()=>String(root.dataset.texCollaborationDocumentId||
      root.querySelector('.tex-document-item.is-active')?.dataset.texDocumentId||'');
    function resetIndicator(){
      currentLog='';
      indicator.hidden=true;
      indicator.replaceChildren();
      indicator.removeAttribute('title');
      logButton.hidden=true;
    }
    function syncTitle(){
      const id=activeId();
      const value=String(title.value||labels.unnamed);
      if(currentId!==id||heading.textContent!==value){
        if(currentId!==id)resetIndicator();
        currentId=id;
        heading.textContent=value;
        heading.title=value;
      }
    }
    titleRow.append(heading,indicator,logButton);
    toolbar.insertBefore(titleRow,title);
    const fixed=document.createElement('span');
    fixed.id='tex-compile-fixed';
    fixed.className='tex-compile-fixed';
    bar.after(fixed);
    fixed.append(compile);
    const vector=document.createElement('span');
    vector.className='tex-compile-vector';
    vector.setAttribute('aria-hidden','true');
    vector.innerHTML=workflowSvg;
    fixed.append(vector);
    compile.title=labels.compile;
    compile.setAttribute('aria-label',labels.compile);
    const status=(ok,log)=>{
      indicator.innerHTML=ok?successSvg:failedSvg;
      indicator.hidden=false;
      indicator.title=ok?labels.success:labels.failure;
      indicator.setAttribute('aria-label',indicator.title);
      currentLog=ok?'':String(log||labels.logFallback);
      logButton.hidden=Boolean(ok);
    };
    window.addEventListener('aertex:tex-build-result',event=>{
      const data=event.detail||{};
      if(data.documentId&&activeId()&&String(data.documentId)!==activeId())return;
      syncTitle();
      status(Boolean(data.ok),data.log);
    });
    window.addEventListener('aertex:tex-build-started',()=>resetIndicator());
    logButton.addEventListener('click',()=>{
      if(!currentLog)return;
      const fileName=(heading.textContent||'AERTEX')
        .replace(/[\\\\/:*?"<>|]/g,'_').trim().slice(0,90)||'AERTEX';
      const payload=new Blob([currentLog],{type:'text/plain;charset=utf-8'});
      const url=URL.createObjectURL(payload);
      const link=document.createElement('a');
      link.href=url;
      link.download=fileName+'-tex-build.log';
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(()=>URL.revokeObjectURL(url),1000);
    });
    root.querySelector('#tex-source')?.addEventListener('input',resetIndicator);
    title.addEventListener('input',syncTitle);
    const list=root.querySelector('#tex-document-list');
    const observer=list?new MutationObserver(syncTitle):null;
    observer?.observe(list,{childList:true,subtree:true,characterData:true});
    window.addEventListener('aertex:tex-file-updated',syncTitle);
    window.addEventListener('aertex:tex-project-asset-selected',syncTitle);
    window.addEventListener('pagehide',()=>observer?.disconnect(),{once:true});
    syncTitle();
  };
  start();
})();
</script>`
    .replace('__LABELS__', JSON.stringify(copy))
    .replace('__WORKFLOW__', JSON.stringify(workflowSvg))
    .replace('__SUCCESS__', JSON.stringify(successSvg))
    .replace('__FAILED__', JSON.stringify(failedSvg));
  return String(markup||'')+stylesheet+script;
}
