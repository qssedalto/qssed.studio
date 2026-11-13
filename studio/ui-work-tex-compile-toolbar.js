// Work TeX toolbar: a fixed compile action, immutable title display and
// source-aware compilation result badges. Internal input/buttons remain mounted
// for existing autosave, history, deletion and compilation event handlers.
export function enhanceWorkTexCompileToolbar(markup, zh) {
  const copy = zh ? {
    compile: "立即编译", busy: "正在编译", success: "编译成功", failure: "编译失败", pending: "源码已修改，等待编译",
    download: "下载日志", unnamed: "未命名 TeX 文档",
    logFallback: "编译失败，但编译器没有返回详细日志。"
  } : {
    compile: "Compile now", busy: "Compiling", success: "Compiled successfully", failure: "Compile failed", pending: "Changes waiting to compile",
    download: "Download log", unnamed: "Untitled TeX document",
    logFallback: "Compilation failed without a detailed compiler log."
  };
  const stylesheet = `
<style id="aertex-tex-compile-toolbar-style">
  .tex-work-app #tex-title{display:none!important}
  .tex-work-app #tex-delete,.tex-work-app #tex-download{display:none!important}
  .tex-work-app .tex-editor-toolbar>.tex-static-title-row{
    display:flex!important;flex-wrap:nowrap!important;align-items:flex-start!important;gap:8px!important;
    flex:1 1 auto!important;min-width:0!important;max-width:100%!important;
    min-height:43px!important;margin:0!important;padding:0 4px!important;
    overflow:hidden!important
  }
  /* The original autosave node is moved immediately below the fixed title.
     Preserve its id so every existing save and collaboration handler works. */
  .tex-work-app .tex-static-title-stack{
    display:flex!important;flex-direction:column!important;align-items:flex-start!important;
    justify-content:flex-start!important;gap:2px!important;
    flex:0 1 auto!important;min-width:0!important;max-width:100%!important;
    overflow:hidden!important
  }
  .tex-work-app .tex-static-title-stack>.tex-save-state{
    position:static!important;inset:auto!important;display:block!important;
    box-sizing:border-box!important;width:auto!important;max-width:100%!important;
    min-width:0!important;min-height:0!important;margin:0!important;padding:0!important;
    color:var(--muted)!important;font-size:10.5px!important;font-weight:400!important;
    line-height:1.25!important;letter-spacing:0!important;
    white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important
  }
  .tex-work-app .tex-static-title-stack #tex-save-state{
    display:block!important;max-width:100%!important;overflow:hidden!important;
    text-overflow:ellipsis!important;white-space:nowrap!important
  }
  .tex-work-app .tex-static-title{
    display:block;flex:0 1 auto;max-width:100%;min-width:0;
    color:var(--text);font-size:17px;font-weight:680;letter-spacing:-.02em;
    line-height:24px!important;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
    user-select:text
  }
  .tex-work-app .tex-build-indicator{
    display:flex;flex:0 0 23px;width:23px;height:23px;align-items:center;
    justify-content:center;align-self:flex-start!important;margin:0!important;
    padding:0!important;box-sizing:border-box!important;
    height:24px!important;min-height:24px!important;max-height:24px!important;
    min-width:23px!important;max-width:23px!important
  }
  .tex-work-app .tex-build-indicator[hidden],
  .tex-work-app .tex-build-log[hidden]{display:none!important}
  .tex-work-app .tex-build-indicator svg{
    display:block!important;flex:0 0 23px!important;width:23px!important;
    min-width:23px!important;max-width:23px!important;
    height:23px!important;min-height:23px!important;max-height:23px!important;
    margin:0!important;padding:0!important;vertical-align:top!important
  }
  /* Match the first (24px) project-title line, not the two-line title+save
     stack. Override the site's generic button min-width, height and margin,
     which previously pushed this control onto a visually lower line. */
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-editor-toolbar .tex-build-log{
    appearance:none!important;box-sizing:border-box!important;
    flex:0 0 auto!important;align-self:flex-start!important;
    display:inline-flex!important;align-items:center!important;justify-content:center!important;
    width:auto!important;min-width:76px!important;max-width:100px!important;
    height:24px!important;min-height:24px!important;max-height:24px!important;
    margin:0!important;padding:0 9px!important;
    border:1px solid color-mix(in srgb,#2967d7 25%,transparent)!important;
    border-radius:7px!important;background:#3479f6!important;color:#fff!important;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei UI","PingFang SC",sans-serif!important;
    font-size:12px!important;font-weight:600!important;line-height:1!important;
    letter-spacing:.01em!important;text-align:center!important;
    cursor:pointer!important;white-space:nowrap!important;
    box-shadow:0 1px 2px rgba(0,0,0,.08)!important;
    vertical-align:top!important
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-editor-toolbar .tex-build-log[hidden]{
    display:none!important
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-editor-toolbar .tex-build-log:hover{
    background:#296de9!important
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-editor-toolbar .tex-build-log:focus-visible{
    outline:2px solid #3479f6!important;outline-offset:2px!important
  }
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
    display:block;width:25px;height:25px;position:absolute;top:7px;left:7px;
    pointer-events:none;color:color-mix(in srgb,var(--text) 84%,var(--surface))
  }
  .tex-work-app .tex-compile-vector svg{display:block;width:100%;height:100%;overflow:visible}
  .tex-work-app .tex-compile-fixed:has(#tex-compile:disabled) .tex-compile-vector{opacity:.34}
  .tex-work-app .tex-compile-fixed:has(#tex-compile:hover:not(:disabled)) .tex-compile-vector{
    color:var(--text)
  }
  /* Every build (automatic preview or manual) uses the selected AERTEX
     theme accent. Do not make the disabled native button fade its SVG while busy. */
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-compile-fixed.is-compiling .tex-compile-vector{
    color:var(--primary,#9caefa)!important;opacity:1!important;
    transform-origin:center;animation:aertex-tex-compile-breathe 1.15s ease-in-out infinite
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-compile-fixed.is-compiling #tex-compile:disabled{
    opacity:1!important;cursor:progress!important
  }
  @keyframes aertex-tex-compile-breathe{
    0%,100%{transform:scale(1);opacity:1}
    50%{transform:scale(.93);opacity:.72}
  }
  @media(prefers-reduced-motion:reduce){
    body.os-shell:has(.tex-work-app) .tex-work-app .tex-compile-fixed.is-compiling .tex-compile-vector{
      animation:none!important;opacity:1!important
    }
  }
  /* Remove the entire obsolete footer strip, including its minimum-height,
     borders and grid track. Never delete the original controls: commands
     still reference their DOM ids and the compile button moves to the toolbar. */
  body.os-shell:has(.tex-work-app) .tex-work-app #tex-editor>.tex-editor-footer{
    display:none!important;height:0!important;min-height:0!important;
    max-height:0!important;margin:0!important;padding:0!important;
    border:0!important;box-shadow:none!important;overflow:hidden!important
  }
  body.os-shell:has(.tex-work-app) .tex-work-app #tex-editor{
    grid-template-rows:auto auto minmax(0,1fr)!important;
    min-width:0!important;min-height:0!important;overflow:hidden!important
  }
  /* On touch devices the separate LaTeX insertion keyboard bar still uses
     its own fourth row, not the obsolete autosave/footer strip. */
  body.os-shell:has(.tex-work-app) .tex-work-app #tex-editor:has(>.tex-mobile-inputbar){
    grid-template-rows:auto auto minmax(0,1fr) auto!important
  }
  .tex-work-app .tex-editor-panel,.tex-work-app .tex-static-title-row{
    min-width:0!important;max-width:100%!important
  }
  @media(max-width:950px) and (pointer:coarse), (max-width:760px) {
    .tex-work-app .tex-editor-toolbar>.tex-static-title-row{
      grid-column:1/-1!important;width:100%!important;padding:0 5px!important;
      min-height:43px!important;max-width:100%!important
    }
    .tex-work-app .tex-static-title{font-size:17px}
    .tex-work-app .tex-editor-toolbar>#tex-title{display:none!important}
    body.os-shell:has(.tex-work-app) .tex-work-app .tex-editor-toolbar .tex-build-log{
      font-size:11px!important;min-width:72px!important;padding:0 8px!important
    }
  }
</style>`;
  // Exact GitHub Actions SVG geometry, sourced from simple-icons/icons/githubactions.svg.
  // No hand-redrawn paths: only replace the original blue brand fill with
  // currentColor so the 39px toolbar icon matches monochrome command icons.
  const workflowSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M10.984 13.836a.5.5 0 0 1-.353-.146l-.745-.743a.5.5 0 1 1 .706-.708l.392.391 1.181-1.18a.5.5 0 0 1 .708.707l-1.535 1.533a.504.504 0 0 1-.354.146zm9.353-.147l1.534-1.532a.5.5 0 0 0-.707-.707l-1.181 1.18-.392-.391a.5.5 0 1 0-.706.708l.746.743a.497.497 0 0 0 .706-.001zM4.527 7.452l2.557-1.585A1 1 0 0 0 7.09 4.17L4.533 2.56A1 1 0 0 0 3 3.406v3.196a1.001 1.001 0 0 0 1.527.85zm2.03-2.436L4 6.602V3.406l2.557 1.61zM24 12.5c0 1.93-1.57 3.5-3.5 3.5a3.503 3.503 0 0 1-3.46-3h-2.08a3.503 3.503 0 0 1-3.46 3 3.502 3.502 0 0 1-3.46-3h-.558c-.972 0-1.85-.399-2.482-1.042V17c0 1.654 1.346 3 3 3h.04c.244-1.693 1.7-3 3.46-3 1.93 0 3.5 1.57 3.5 3.5S13.43 24 11.5 24a3.502 3.502 0 0 1-3.46-3H8c-2.206 0-4-1.794-4-4V9.899A5.008 5.008 0 0 1 0 5c0-2.757 2.243-5 5-5s5 2.243 5 5a5.005 5.005 0 0 1-4.952 4.998A2.482 2.482 0 0 0 7.482 12h.558c.244-1.693 1.7-3 3.46-3a3.502 3.502 0 0 1 3.46 3h2.08a3.503 3.503 0 0 1 3.46-3c1.93 0 3.5 1.57 3.5 3.5zm-15 8c0 1.378 1.122 2.5 2.5 2.5s2.5-1.122 2.5-2.5-1.122-2.5-2.5-2.5S9 19.122 9 20.5zM5 9c2.206 0 4-1.794 4-4S7.206 1 5 1 1 2.794 1 5s1.794 4 4 4zm9 3.5c0-1.378-1.122-2.5-2.5-2.5S9 11.122 9 12.5s1.122 2.5 2.5 2.5 2.5-1.122 2.5-2.5zm9 0c0-1.378-1.122-2.5-2.5-2.5S18 11.122 18 12.5s1.122 2.5 2.5 2.5 2.5-1.122 2.5-2.5zm-13 8a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0zm2 0a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0zm12 0c0 1.93-1.57 3.5-3.5 3.5a3.503 3.503 0 0 1-3.46-3.002c-.007.001-.013.005-.021.005l-.506.017h-.017a.5.5 0 0 1-.016-.999l.506-.017c.018-.002.035.006.052.007A3.503 3.503 0 0 1 20.5 17c1.93 0 3.5 1.57 3.5 3.5zm-1 0c0-1.378-1.122-2.5-2.5-2.5S18 19.122 18 20.5s1.122 2.5 2.5 2.5 2.5-1.122 2.5-2.5z"/></svg>';
  // The reference warning glyph is a neutral slate disk with a softly
  // rounded white triangle/exclamation. SVG stays crisp in light/dark modes.
  const pendingSvg = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="11.3" fill="#5e646e"/><path d="M10.65 7.04a1.55 1.55 0 0 1 2.7 0l4.35 7.63a1.7 1.7 0 0 1-1.48 2.53H7.78a1.7 1.7 0 0 1-1.48-2.53Z" fill="#f8f9fb"/><rect x="11.43" y="9.56" width="1.14" height="2.90" rx=".57" fill="#5e646e"/><circle cx="12" cy="14.16" r=".66" fill="#5e646e"/></svg>';
  // Real cutouts, not painted-on white checks/crosses: any background under
  // the icon stays visible through the transparent alpha mask.
  const successSvg = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><defs><mask id="aertex-build-check-cutout" maskUnits="userSpaceOnUse"><rect width="24" height="24" fill="#fff"/><path d="m7.7 12.25 2.95 2.85 5.85-6.55" fill="none" stroke="#000" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></mask></defs><circle cx="12" cy="12" r="11" fill="#4a894a" mask="url(#aertex-build-check-cutout)"/></svg>';
  const failedSvg = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><defs><mask id="aertex-build-cross-cutout" maskUnits="userSpaceOnUse"><rect width="24" height="24" fill="#fff"/><path d="M8.2 8.2 15.8 15.8M15.8 8.2 8.2 15.8" fill="none" stroke="#000" stroke-width="1.9" stroke-linecap="round"/></mask></defs><circle cx="12" cy="12" r="11" fill="#b93535" mask="url(#aertex-build-cross-cutout)"/></svg>';
  const script = `
<script id="aertex-tex-compile-toolbar-runtime">
(() => {
  if(window.__aertexTexCompileToolbarReady)return;
  window.__aertexTexCompileToolbarReady=true;
  const labels=__LABELS__;
  const workflowSvg=__WORKFLOW__;
  const successSvg=__SUCCESS__;
  const failedSvg=__FAILED__;
  const pendingSvg=__PENDING__;
  const start=()=>{
    const root=document.querySelector('.tex-work-app[data-tex-root]');
    const toolbar=root?.querySelector('.tex-editor-toolbar');
    const title=document.getElementById('tex-title');
    const bar=root?.querySelector('.tex-editor-commandbar');
    const compile=document.getElementById('tex-compile');
    const saveState=root?.querySelector('.tex-save-state');
    if(!root||!toolbar||!title||!bar||!compile||!saveState){
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
    const titleStack=document.createElement('div');
    titleStack.className='tex-static-title-stack';
    // Move the existing live save status, rather than duplicating text.
    // Keeping #tex-save-state intact retains all autosave/error updates.
    titleStack.append(heading,saveState);
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
    let sourceRevision=0;
    let startedRevision=0;
    let running=false;
    const activeId=()=>String(root.dataset.texCollaborationDocumentId||
      root.querySelector('.tex-document-item.is-active')?.dataset.texDocumentId||'');
    function resetIndicator(){
      currentLog='';
      indicator.hidden=true;
      indicator.replaceChildren();
      indicator.removeAttribute('title');
      indicator.removeAttribute('aria-label');
      logButton.hidden=true;
    }
    function pendingIndicator(){
      currentLog='';
      indicator.innerHTML=pendingSvg;
      indicator.hidden=false;
      indicator.title=labels.pending;
      indicator.setAttribute('aria-label',labels.pending);
      logButton.hidden=true;
    }
    function setRunning(value){
      running=Boolean(value);
      fixed.classList.toggle('is-compiling',running);
      compile.title=running?labels.busy:labels.compile;
      compile.setAttribute('aria-label',compile.title);
    }
    function markDirty(){
      sourceRevision++;
      pendingIndicator();
    }
    function syncTitle(){
      const id=activeId();
      const value=String(title.value||labels.unnamed);
      if(currentId!==id||heading.textContent!==value){
        if(currentId!==id){
          sourceRevision=0;
          startedRevision=0;
          setRunning(false);
          resetIndicator();
        }
        currentId=id;
        heading.textContent=value;
        heading.title=value;
      }
    }
    titleRow.append(titleStack,indicator,logButton);
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
    // Actual events are emitted by the local preview/compiler for BOTH
    // automatic and user-triggered builds. The native button may be disabled
    // during execution, but the vector keeps pulsing in the chosen theme color.
    const isActiveBuild=event=>{
      const id=String(event?.detail?.documentId||'');
      return !id||!activeId()||id===activeId();
    };
    window.addEventListener('aertex:tex-build-started',event=>{
      if(!isActiveBuild(event))return;
      syncTitle();
      startedRevision=sourceRevision;
      setRunning(true);
      resetIndicator();
    });
    window.addEventListener('aertex:tex-build-result',event=>{
      if(!isActiveBuild(event))return;
      syncTitle();
      setRunning(false);
      if(sourceRevision>startedRevision)pendingIndicator();
      else status(Boolean(event.detail?.ok),event.detail?.log);
    });
    // A compile can become stale when the user continues editing; it then
    // intentionally has no result event. Always remove blue on completion.
    window.addEventListener('aertex:tex-build-finished',event=>{
      if(!isActiveBuild(event))return;
      setRunning(false);
      if(sourceRevision>startedRevision)pendingIndicator();
    });
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
    root.querySelector('#tex-source')?.addEventListener('input',markDirty);
    title.addEventListener('input',syncTitle);
    const list=root.querySelector('#tex-document-list');
    const observer=list?new MutationObserver(syncTitle):null;
    observer?.observe(list,{childList:true,subtree:true,characterData:true});
    window.addEventListener('aertex:tex-file-updated',syncTitle);
    window.addEventListener('aertex:tex-project-asset-selected',syncTitle);
    window.addEventListener('pagehide',()=>{
      observer?.disconnect();
      setRunning(false);
    },{once:true});
    syncTitle();
  };
  start();
})();
</script>`
    .replace('__LABELS__', JSON.stringify(copy))
    .replace('__WORKFLOW__', JSON.stringify(workflowSvg))
    .replace('__SUCCESS__', JSON.stringify(successSvg))
    .replace('__FAILED__', JSON.stringify(failedSvg))
    .replace('__PENDING__', JSON.stringify(pendingSvg));
  return String(markup||'')+stylesheet+script;
}
