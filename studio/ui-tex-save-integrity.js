// Inserted in the editor's lexical scope. Autosave, manual save, file actions
// and navigation share ONE queue; a failed write never clears the dirty flag.
export const TEX_SAVE_INTEGRITY_RUNTIME = String.raw`
let saveInFlight=null;
function restoreUnsavedRoute(){
  if(activeId && typeof syncDocumentRoute==='function')syncDocumentRoute(activeId,true);
}
function saveCurrent(silent){
  if(saveInFlight)return saveInFlight;
  if(!activeId||!dirty)return Promise.resolve(true);
  const task=(async()=>{
    let retries=0;
    while(activeId&&dirty){
      if(window.__aertexTexCanSave && !window.__aertexTexCanSave(activeId)){
        setSaveState(copy.unsaved,true);return false;
      }
      const id=activeId;
      const baseDocument=activeDocument;
      const submitted=snapshot();
      ++saveSequence;
      window.clearTimeout(saveTimer);
      if(!silent)setSaveState(copy.saving);
      try{
        const data=await api('/api/tex/documents?id='+encodeURIComponent(id),{
          method:'PUT',body:JSON.stringify(submitted)
        });
        if(id!==activeId||activeDocument!==baseDocument)return false;
        if(!data?.document||data.document.id!==id)throw new Error(copy.error);
        const sourceRebased=(baseDocument?.realtime_epoch||'v2')!==(data.document.realtime_epoch||'v2');
        activeDocument=data.document;
        retries=0;
        updateLocal(activeDocument);
        // Never write the submitted text back into the editor. Keystrokes
        // entered during the request are a new revision that must be flushed.
        dirty=title.value!==submitted.title||engine.value!==submitted.engine||source.value!==submitted.source;
        setSaveState(dirty?copy.unsaved:copy.saved);
        window.dispatchEvent(new CustomEvent('aertex:tex-document-saved',{
          detail:{documentId:id,document:activeDocument}
        }));
        if(sourceRebased)window.dispatchEvent(new CustomEvent('aertex:tex-source-refreshed',{detail:{documentId:id}}));
      }catch(error){
        if(id===activeId&&activeDocument===baseDocument&&['document_write_conflict','collaboration_state_changed'].includes(error?.payload?.code)&&retries++<2){
          await new Promise(resolve=>window.setTimeout(resolve,100*retries));
          continue; // Re-snapshot the live CRDT, never substitute a fresh ETag for stale text.
        }
        if(id===activeId){
          dirty=true;
          setSaveState(error?.message||copy.error,true);
          showMessage(error?.message||copy.error,true);
        }
        return false;
      }
    }
    return true;
  })();
  saveInFlight=task.finally(()=>{saveInFlight=null;});
  return saveInFlight;
}
window.addEventListener('aertex:tex-local-conflict',event=>{
  if(event?.detail?.documentId!==activeId)return;
  dirty=true;setSaveState(copy.unsaved,true);showMessage(event.detail.message||copy.error,true);
});
window.addEventListener('beforeunload',event=>{
  // An async request can still be settling after its content is already
  // identical to the authoritative record; don't show a false warning.
  const changed=Boolean(activeDocument && (
    title.value!==String(activeDocument.title||'') ||
    engine.value!==String(activeDocument.engine||'xelatex') ||
    source.value!==String(activeDocument.source||'')));
  if(!changed)return;
  event.preventDefault();event.returnValue='';
});
`;
