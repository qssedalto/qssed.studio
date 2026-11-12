// Additional iPad Safari repairs, intentionally scoped to touch screens.
// Desktop/fine-pointer layouts and the original controls remain unchanged.
export function enhanceWorkTexMobileFollowup(markup) {
  return String(markup || "") + `
<style id="aertex-tex-mobile-followup">
@media (max-width:1280px) and (pointer:coarse), (max-width:760px) {
  /* The old generic >span rule stretched the chevron to half the folder row,
     moving the folder glyph into the middle of the sidebar. */
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-tree-folder {
    display:flex!important;flex-direction:row!important;align-items:center!important;
    justify-content:flex-start!important;gap:7px!important;
    padding:4px 5px!important;text-align:left!important;min-width:0!important;
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-tree-folder>.tex-project-chevron {
    flex:0 0 16px!important;width:16px!important;min-width:16px!important;
    height:26px!important;display:grid!important;place-items:center!important;
    text-align:center!important;padding:0!important;margin:0!important;
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-tree-folder>svg.tex-project-folder-icon {
    flex:0 0 19px!important;width:19px!important;min-width:19px!important;
    margin:0!important;
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-tree-folder>span:not(.tex-project-chevron) {
    flex:1 1 auto!important;width:auto!important;min-width:0!important;
    text-align:left!important;margin:0!important;overflow:hidden!important;
    text-overflow:ellipsis!important;white-space:nowrap!important;
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-tree-file {
    display:flex!important;align-items:center!important;justify-content:flex-start!important;
    text-align:left!important;min-width:0!important;max-width:100%!important;
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-tree-file>svg{
    flex:0 0 16px!important;width:16px!important;margin:0!important;
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-tree-file>span{
    flex:1 1 auto!important;min-width:0!important;text-align:left!important;
  }
}
@media (min-width:951px) and (max-width:1280px) and (pointer:coarse) {
  /* Must outrank both the generic 3-column grid and the min-width:1081
     desktop-oriented 460px editor minimum. Otherwise collapsed 46px rails
     still occupy the full expanded column and cover the editor. */
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-shell{
    grid-template-columns:208px minmax(0,1fr) 208px!important;
    min-width:0!important;max-width:100%!important;
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-shell.is-left-collapsed{
    grid-template-columns:46px minmax(0,1fr) 208px!important;
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-shell.is-right-collapsed{
    grid-template-columns:208px minmax(0,1fr) 46px!important;
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-shell.is-left-collapsed.is-right-collapsed{
    grid-template-columns:46px minmax(0,1fr) 46px!important;
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-shell>.tex-editor-panel,
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-shell>.tex-documents-panel,
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-shell>.tex-runs-panel{
    min-width:0!important;max-width:100%!important;overflow-x:hidden!important;
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-shell.is-left-collapsed>.tex-documents-panel{
    width:46px!important;min-width:0!important;max-width:46px!important;overflow:hidden!important;
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-shell.is-left-collapsed>.tex-documents-panel>.tex-panel-head{
    display:flex!important;flex-direction:column!important;align-items:center!important;
    justify-content:flex-start!important;gap:0!important;padding:8px 2px!important;
    width:46px!important;min-width:0!important;overflow:hidden!important;
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-shell.is-left-collapsed>.tex-documents-panel>.tex-panel-head .tex-panel-title,
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-shell.is-left-collapsed>.tex-documents-panel>.tex-panel-head .tex-panel-home-link,
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-shell.is-left-collapsed>.tex-documents-panel>:not(.tex-panel-head){
    display:none!important;
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-shell.is-left-collapsed #tex-left-panel-toggle{
    display:grid!important;flex:0 0 28px!important;margin:0!important;
    visibility:visible!important;
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-shell.is-right-collapsed>.tex-runs-panel{
    width:46px!important;min-width:0!important;max-width:46px!important;
    overflow:hidden!important;
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-shell.is-right-collapsed>.tex-runs-panel>:not(#tex-right-panel-restore-touch){
    display:none!important;
  }
  body.os-shell:has(.tex-work-app) .tex-work-app #tex-right-panel-restore-touch{
    display:none!important;
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-shell.is-right-collapsed #tex-right-panel-restore-touch{
    display:grid!important;place-items:center!important;position:relative!important;
    width:30px!important;height:30px!important;min-height:30px!important;
    margin:10px auto!important;padding:0!important;border:1px solid var(--border)!important;
    background:var(--surface)!important;color:var(--text)!important;border-radius:9px!important;
    font-size:18px!important;cursor:pointer!important;z-index:12!important;
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-shell:not(.is-right-collapsed)>.tex-runs-panel{
    overflow-x:hidden!important;overflow-y:auto!important;
    -webkit-overflow-scrolling:touch!important;
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-shell>.tex-editor-panel .tex-editor{
    grid-template-rows:auto auto minmax(0,1fr)!important;
    min-width:0!important;min-height:0!important;
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-shell>.tex-editor-panel .tex-source-label{
    min-width:0!important;overflow:hidden!important;
  }
  body.os-shell:has(.tex-work-app) .tex-work-app .tex-source-label>.tex-editor-commandbar{
    min-width:0!important;max-width:100%!important;flex:1 1 0!important;
    overflow-x:auto!important;overflow-y:hidden!important;
  }
}
</style>
<script id="aertex-tex-mobile-followup-runtime">(() => {
  const compact = window.matchMedia('(max-width:1280px) and (pointer:coarse), (max-width:760px)');
  const tablet = window.matchMedia('(min-width:951px) and (max-width:1280px) and (pointer:coarse)');
  const list = document.querySelector('.tex-work-app #tex-document-list');
  const shell = document.querySelector('.tex-work-app .tex-shell');
  if (!shell || !list) return;
  // A project folder is a navigation container: tapping the folder row
  // toggles expansion but does not select and open main.tex.
  list.addEventListener('click', event => {
    if (!compact.matches || window.__aertexAllowProjectActivation) return;
    const folder = event.target.closest?.('.tex-document-item[data-tex-document-id]');
    if (!folder || !list.contains(folder) || event.target.closest('.tex-project-chevron')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    folder.querySelector('.tex-project-chevron')?.click();
  }, true);
  const runs = shell.querySelector('.tex-runs-panel');
  const original = document.getElementById('tex-right-panel-toggle');
  if (runs && original && !document.getElementById('tex-right-panel-restore-touch')) {
    const restore = document.createElement('button');
    restore.id = 'tex-right-panel-restore-touch';
    restore.type = 'button';
    restore.textContent = '+';
    restore.setAttribute('aria-label', document.documentElement.lang.startsWith('zh') ?
      '展开 PDF 预览栏' : 'Expand PDF preview panel');
    restore.title = restore.getAttribute('aria-label');
    restore.addEventListener('click', () => original.click());
    runs.prepend(restore);
  }
})()</script>`;
}
