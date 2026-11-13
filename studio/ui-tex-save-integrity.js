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
    while(activeId&&dirty){
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
        activeDocument=data.document;
        updateLocal(activeDocument);
        // Never write the submitted text back into the editor. Keystrokes
        // entered during the request are a new revision that must be flushed.
        dirty=title.value!==submitted.title||engine.value!==submitted.engine||source.value!==submitted.source;
        setSaveState(dirty?copy.unsaved:copy.saved);
        window.dispatchEvent(new CustomEvent('aertex:tex-document-saved',{
          detail:{documentId:id,document:activeDocument}
        }));
      }catch(error){
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
window.addEventListener('beforeunload',event=>{
  if(!dirty&&!saveInFlight)return;
  event.preventDefault();event.returnValue='';
});
`;
