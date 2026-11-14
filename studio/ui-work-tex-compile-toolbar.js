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
  /* The play icon stays slate-gray except when the compiler is active. */
  body.os-shell:has(.tex-work-app) .tex-compile-fixed:not(.is-compiling) .tex-compile-vector{
    color:#5e646e!important
  }
  :root[data-theme="dark"] body.os-shell:has(.tex-work-app) .tex-compile-fixed:not(.is-compiling) .tex-compile-vector,
  body.os-shell[data-theme="dark"]:has(.tex-work-app) .tex-compile-fixed:not(.is-compiling) .tex-compile-vector{
    color:#a0a4ad!important
  }
  .tex-work-app .tex-compile-vector svg circle{fill:none}
  .tex-work-app .tex-compile-vector svg path{stroke:none;fill:currentColor}
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

  /* The editor pane can be narrow on a wide desktop. Size this header against
     its own pane, not the viewport; preserve every original control and id. */
  body.os-shell .tex-work-app #tex-editor{container-type:inline-size;container-name:aertex-editor}
  body.os-shell .tex-work-app #tex-editor>.tex-editor-toolbar{
    display:grid!important;grid-template-columns:minmax(105px,1fr) minmax(105px,1fr) minmax(210px,1.6fr) minmax(112px,1fr)!important;
    grid-auto-flow:row!important;align-items:end!important;gap:6px!important;
    min-width:0!important;width:100%!important;box-sizing:border-box!important;
    padding:8px!important;overflow:visible!important
  }
  body.os-shell .tex-work-app #tex-editor>.tex-editor-toolbar>.tex-static-title-row{
    grid-column:1/-1!important;grid-row:1!important;width:100%!important;
    box-sizing:border-box!important;padding:0 110px 0 0!important;min-height:43px!important
  }
  body.os-shell .tex-work-app #tex-editor .tex-static-title-stack{flex:1 1 auto!important}
  body.os-shell .tex-work-app #tex-editor>.tex-editor-toolbar>label{
    min-width:0!important;width:100%!important;max-width:100%!important;
    margin:0!important;grid-row:2!important;box-sizing:border-box!important
  }
  body.os-shell .tex-work-app #tex-editor>.tex-editor-toolbar>.tex-editor-choice-label{grid-column:1!important}
  body.os-shell .tex-work-app #tex-editor>.tex-editor-toolbar>label:has(#tex-engine){grid-column:2!important}
  body.os-shell .tex-work-app #tex-editor>.tex-editor-toolbar>.tex-markdown-view-modes{grid-column:2!important;grid-row:3!important}
  body.os-shell .tex-work-app #tex-editor>.tex-editor-toolbar>label>select{
    box-sizing:border-box!important;width:100%!important;min-width:0!important;max-width:100%!important;
    height:38px!important;min-height:38px!important;margin:0!important
  }
  body.os-shell .tex-work-app #tex-editor>.tex-editor-toolbar>#tex-collaboration-open{
    grid-column:3!important;grid-row:2!important;box-sizing:border-box!important;
    width:100%!important;min-width:0!important;max-width:100%!important;
    height:38px!important;min-height:38px!important;gap:5px!important;padding:0 7px!important;
    overflow:hidden!important;justify-content:flex-start!important
  }
  body.os-shell .tex-work-app #tex-editor #tex-collaboration-open .tex-collaboration-avatars{
    min-width:0!important;overflow:hidden!important;flex:1 1 65px!important;max-width:90px!important
  }
  body.os-shell .tex-work-app #tex-editor>.tex-editor-toolbar>.tex-code-theme-picker{
    grid-column:4!important;grid-row:2!important;width:100%!important;min-width:0!important
  }
  body.os-shell .tex-work-app #tex-editor #tex-code-theme-toggle{
    box-sizing:border-box!important;width:100%!important;min-width:0!important;max-width:100%!important;
    height:38px!important;min-height:38px!important;padding:0 7px!important;justify-content:center!important
  }
  body.os-shell .tex-work-app #tex-editor>.tex-editor-toolbar>.tex-panel-home-link{
    grid-column:4!important;grid-row:1!important;align-self:start!important;justify-self:end!important;
    box-sizing:border-box!important;width:auto!important;min-width:0!important;max-width:104px!important;
    min-height:28px!important;height:28px!important;margin:0!important;padding:0 6px!important
  }
  @container aertex-editor (max-width:620px){
    body.os-shell .tex-work-app #tex-editor>.tex-editor-toolbar{grid-template-columns:repeat(2,minmax(0,1fr))!important}
    body.os-shell .tex-work-app #tex-editor>.tex-editor-toolbar>#tex-collaboration-open{grid-column:1!important;grid-row:3!important;font-size:10px!important;gap:3px!important;padding:0 5px!important}
    body.os-shell .tex-work-app #tex-editor #tex-collaboration-open svg.tex-collaboration-people{width:20px!important;height:20px!important;flex:0 0 20px!important}
    body.os-shell .tex-work-app #tex-editor #tex-collaboration-open .tex-collaboration-avatars{max-width:29px!important;flex:0 1 29px!important;margin-left:auto!important}
    body.os-shell .tex-work-app #tex-editor>.tex-editor-toolbar>.tex-code-theme-picker{grid-column:2!important;grid-row:3!important}
    body.os-shell .tex-work-app #tex-editor>.tex-editor-toolbar>.tex-panel-home-link{grid-column:2!important}
    body.os-shell .tex-work-app #tex-editor>.tex-editor-toolbar>.tex-markdown-view-modes{grid-column:1/-1!important;grid-row:4!important}
  }
</style>`;
  // Standalone circular-play SVG modeled on the light/dark reference images.
  const workflowSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9.55" stroke="currentColor" stroke-width="2.05"/><path d="M10.15 7.85a.87.87 0 0 1 1.31-.75l5.58 3.56a1.58 1.58 0 0 1 0 2.68l-5.58 3.56a.87.87 0 0 1-1.31-.74V7.85Z" fill="currentColor"/></svg>';
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
    titleRow.append(indicator,titleStack,logButton);
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
