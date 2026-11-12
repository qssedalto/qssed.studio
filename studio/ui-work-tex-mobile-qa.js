// Responsive repairs for iPad Safari and narrow touch screens only.
// This module is appended after the existing Work TeX enhancements, so
// it never changes desktop/fine-pointer layout.
export function enhanceWorkTexMobileQa(markup) {
  return String(markup || "") + `
<style id="aertex-tex-mobile-qa">
@media (max-width:950px) and (pointer:coarse), (max-width:760px) {
  .tex-work-app .tex-editor-toolbar {
    display:grid!important;
    position:relative!important;
    grid-template-columns:minmax(72px,1fr) minmax(105px,1.12fr) max-content!important;
    gap:7px!important;
    padding:20px 10px 7px!important;
    align-items:end!important;
    min-width:0!important;
    min-height:0!important;
  }
  .tex-work-app .tex-editor-toolbar>#tex-title {
    grid-column:1/-1!important;
    width:100%!important;
    min-width:0!important;
    margin:0!important;
    padding:0 5px!important;
    height:36px!important;
    min-height:36px!important;
  }
  .tex-work-app .tex-editor-toolbar>label {
    grid-column:1!important;
    align-self:end!important;
    width:100%!important;
    min-width:0!important;
    margin:0!important;
  }
  .tex-work-app .tex-editor-toolbar>label>#tex-engine {
    width:100%!important;
    min-width:0!important;
    max-width:100%!important;
    height:40px!important;
    min-height:40px!important;
  }
  .tex-work-app .tex-editor-toolbar>#tex-collaboration-open {
    grid-column:2!important;
    align-self:end!important;
    width:100%!important;
    min-width:0!important;
    max-width:100%!important;
    height:40px!important;
    min-height:40px!important;
    margin:0!important;
    padding:0 7px!important;
    overflow:hidden!important;
  }
  .tex-work-app .tex-editor-toolbar>.tex-panel-home-link {
    grid-column:3!important;
    align-self:end!important;
    justify-self:end!important;
    min-width:42px!important;
    min-height:40px!important;
    height:40px!important;
    max-width:118px!important;
    padding:0 7px!important;
    margin:0!important;
    overflow:hidden!important;
  }
  .tex-work-app .tex-editor-toolbar>.tex-save-state {
    position:absolute!important;
    top:3px!important;
    right:10px!important;
    margin:0!important;
    white-space:nowrap!important;
  }
  .tex-work-app .tex-editor {
    grid-template-rows:auto auto minmax(0,1fr) auto!important;
    min-height:0!important;
    overflow:hidden!important;
  }
  .tex-work-app .tex-editor-footer, .tex-work-app #tex-compile {display:none!important}
  .tex-work-app .tex-source-label {
    min-height:43px!important;
    padding:2px 9px!important;
    max-width:100%!important;
    min-width:0!important;
    gap:6px!important;
    overflow:hidden!important;
  }
  .tex-work-app .tex-source-label>span {flex:0 0 auto!important}
  .tex-work-app .tex-source-label>div:last-child {max-width:98px!important;overflow:hidden!important;text-overflow:ellipsis!important}
  .tex-work-app .tex-editor-commandbar {flex:1 1 auto!important;min-width:0!important;max-width:100%!important;overflow-x:auto!important}
  .tex-work-app .tex-shell>.tex-documents-panel,
  .tex-work-app .tex-shell>.tex-editor-panel,
  .tex-work-app .tex-shell>.tex-runs-panel {min-height:0!important;max-width:100%!important}
  .tex-work-app .tex-document-list,
  .tex-work-app #tex-document-list {flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior-y:contain!important;-webkit-overflow-scrolling:touch!important}
  .tex-work-app .tex-tree-children, .tex-work-app .tex-tree-folder-children {min-width:0!important}
  .tex-work-app .tex-tree-children>div, .tex-work-app .tex-tree-folder-children>div {width:100%!important;min-width:0!important}
  .tex-work-app .tex-tree-file, .tex-work-app .tex-tree-folder {
    display:flex!important;
    flex-direction:row!important;
    align-items:center!important;
    justify-content:flex-start!important;
    text-align:left!important;
    width:100%!important;
    min-width:0!important;
    max-width:100%!important;
    padding:4px 6px!important;
    margin:0!important;
    overflow:hidden!important;
  }
  .tex-work-app .tex-tree-file>span, .tex-work-app .tex-tree-folder>span {flex:1 1 auto!important;text-align:left!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
  .tex-work-app .tex-inline-file-viewer {width:auto!important;max-width:calc(100% - 12px)!important;height:auto!important;min-height:0!important;margin:0 6px 6px!important}
  .tex-work-app .tex-inline-file-header {min-width:0!important;max-width:100%!important;flex-wrap:nowrap!important;gap:6px!important}
  .tex-work-app .tex-inline-file-actions {flex:0 1 auto!important;min-width:0!important;width:auto!important;flex-wrap:nowrap!important;overflow-x:auto!important}
  .tex-work-app .tex-inline-file-actions button {flex:0 0 auto!important}
  .tex-work-app .tex-inline-preview {min-width:0!important;max-width:100%!important;overflow-x:auto!important;overflow-wrap:anywhere!important;padding:12px 14px!important}
  .tex-work-app .tex-inline-preview img {max-width:100%!important;height:auto!important}
  .tex-work-app .tex-inline-preview table {display:block;max-width:100%!important;overflow-x:auto!important;border-collapse:collapse}
  .tex-work-app .tex-inline-preview th,.tex-work-app .tex-inline-preview td {border:1px solid var(--border);padding:5px 8px;min-width:55px}
  .tex-work-app .tex-inline-preview pre {max-width:100%!important;white-space:pre!important;overflow-x:auto!important;overflow-wrap:normal!important}
  .tex-work-app .tex-inline-preview blockquote {margin:8px 0;padding-left:12px;border-left:3px solid var(--primary);color:var(--muted)}
  .tex-work-app .tex-inline-preview a {color:var(--primary);text-decoration:underline}
  .tex-work-app .tex-inline-preview ul,.tex-work-app .tex-inline-preview ol {padding-left:22px}
  .tex-work-app .tex-inline-preview h1 {font-size:1.6em}
  .tex-work-app .tex-inline-preview h2 {font-size:1.35em}
  .tex-work-app .tex-inline-preview h3 {font-size:1.2em}
  .tex-work-app .tex-inline-preview p {margin:.55em 0}
}
@media (max-width:540px) {
  .tex-work-app .tex-editor-toolbar>.tex-panel-home-link {width:42px!important}
  .tex-work-app .tex-editor-toolbar>.tex-panel-home-link .aertex-wordmark-token {display:none!important}
}
@media (min-width:951px) and (max-width:1280px) and (pointer:coarse) {
  body.os-shell .tex-workbench .tex-shell {
    display:grid!important;
    grid-template-columns:208px minmax(0,1fr) 208px!important;
    width:100%!important;
    max-width:100%!important;
    height:calc(100dvh - 8px)!important;
    min-height:0!important;
    overflow:hidden!important;
  }
  .tex-work-app .tex-shell.is-left-collapsed {grid-template-columns:46px minmax(0,1fr) 208px!important}
  .tex-work-app .tex-shell.is-right-collapsed {grid-template-columns:208px minmax(0,1fr) 46px!important}
  .tex-work-app .tex-shell.is-left-collapsed.is-right-collapsed {grid-template-columns:46px minmax(0,1fr) 46px!important}
  .tex-work-app .tex-shell>.tex-documents-panel,
  .tex-work-app .tex-shell>.tex-editor-panel,
  .tex-work-app .tex-shell>.tex-runs-panel {min-width:0!important;min-height:0!important;max-width:100%!important;overflow:hidden!important}
  .tex-work-app .tex-shell>.tex-documents-panel {display:flex!important;flex-direction:column!important}
  .tex-work-app .tex-shell>.tex-runs-panel {display:flex!important;flex-direction:column!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important}
  .tex-work-app .tex-side-toggle {display:grid!important}
  .tex-work-app .tex-shell.is-left-collapsed .tex-documents-panel>.tex-panel-head {flex-direction:column!important;align-items:center!important;gap:5px!important;padding:8px 4px!important}
  .tex-work-app .tex-shell.is-left-collapsed .tex-documents-panel>.tex-panel-head .tex-panel-title,
  .tex-work-app .tex-shell.is-left-collapsed .tex-documents-panel>:not(.tex-panel-head),
  .tex-work-app .tex-shell.is-left-collapsed .tex-documents-panel .tex-panel-home-link,
  .tex-work-app .tex-shell.is-right-collapsed .tex-runs-panel>:not(.tex-right-panel-toggle) {display:none!important}
  .tex-work-app .tex-shell.is-left-collapsed .tex-left-panel-toggle {margin:0!important}
  .tex-work-app .tex-shell.is-right-collapsed .tex-right-panel-toggle {left:8px!important;top:10px!important}
  .tex-work-app #tex-document-list {flex:1 1 auto!important;min-height:0!important;max-height:100%!important;overflow-x:hidden!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important}
  .tex-work-app .tex-tree-children>div,.tex-work-app .tex-tree-folder-children>div {min-width:0!important;width:100%!important}
  .tex-work-app .tex-tree-file,.tex-work-app .tex-tree-folder {justify-content:flex-start!important;text-align:left!important;min-width:0!important;max-width:100%!important}
  .tex-work-app .tex-editor-panel,.tex-work-app .tex-editor,.tex-work-app .tex-codemirror-host {min-width:0!important;min-height:0!important}
  .tex-work-app .tex-editor {display:grid!important;height:100%!important;grid-template-rows:auto auto minmax(0,1fr)!important;overflow:hidden!important}
  .tex-work-app .tex-editor-toolbar {
    display:flex!important;
    flex-wrap:nowrap!important;
    min-width:0!important;
    gap:6px!important;
    padding:20px 8px 5px!important;
    position:relative!important;
    overflow:hidden!important;
  }
  .tex-work-app .tex-editor-toolbar>#tex-title {flex:1 1 80px!important;min-width:0!important;font-size:14px!important}
  .tex-work-app .tex-editor-toolbar>label {flex:0 1 115px!important;min-width:0!important}
  .tex-work-app .tex-editor-toolbar>#tex-collaboration-open {flex:0 1 119px!important;min-width:0!important;max-width:119px!important;padding:0 7px!important;overflow:hidden!important}
  .tex-work-app .tex-editor-toolbar>.tex-panel-home-link {flex:0 1 104px!important;min-width:34px!important;max-width:104px!important;padding:0 4px!important;overflow:hidden!important}
  .tex-work-app .tex-editor-toolbar>.tex-save-state {position:absolute!important;top:3px!important;right:8px!important;white-space:nowrap!important;font-size:10px!important}
  .tex-work-app .tex-editor-footer,.tex-work-app #tex-compile {display:none!important}
  .tex-work-app .tex-source-label {min-width:0!important;max-width:100%!important;min-height:44px!important;padding:2px 8px!important;gap:5px!important;overflow:hidden!important}
  .tex-work-app .tex-source-label>span {flex:0 0 auto!important;min-width:0!important;font-size:11px!important}
  .tex-work-app .tex-source-label>div:last-child {flex:0 0 auto!important;max-width:125px!important;overflow:hidden!important;text-overflow:ellipsis!important}
  .tex-work-app .tex-realtime-status {flex:0 1 112px!important;min-width:0!important;overflow:hidden!important;white-space:nowrap!important}
  .tex-work-app .tex-editor-commandbar {flex:1 1 auto!important;min-width:0!important;width:0!important;max-width:100%!important;overflow-x:auto!important;overflow-y:hidden!important}
  .tex-work-app .tex-inline-file-viewer {height:auto!important;max-width:calc(100% - 12px)!important;min-width:0!important;min-height:0!important;margin:0 6px 6px!important}
  .tex-work-app .tex-inline-file-header {min-width:0!important;max-width:100%!important;flex-wrap:wrap!important}
  .tex-work-app .tex-inline-file-actions {width:auto!important;max-width:100%!important;min-width:0!important;overflow-x:auto!important}
  .tex-work-app .tex-inline-preview {min-width:0!important;max-width:100%!important;overflow-x:auto!important;overflow-wrap:anywhere!important;padding:12px 15px!important}
  .tex-work-app .tex-inline-preview pre,.tex-work-app .tex-inline-preview table {display:block;max-width:100%!important;overflow-x:auto!important}
  .tex-work-app #tex-source,.tex-work-app .tex-codemirror-host>.cm-editor {min-height:0!important;max-width:100%!important}
}
@media (max-width:1280px) and (pointer:coarse), (max-width:760px) {
  body.os-shell:has(.tex-work-app) #tex-source:focus,
  body.os-shell:has(.tex-work-app) #tex-source:focus-visible,
  body.os-shell:has(.tex-work-app) .tex-inline-file-viewer textarea:focus,
  body.os-shell:has(.tex-work-app) .tex-inline-file-viewer textarea:focus-visible,
  body.os-shell:has(.tex-work-app) .tex-codemirror-host>.cm-editor.cm-focused,
  body.os-shell:has(.tex-work-app) .tex-codemirror-host .cm-content:focus,
  body.os-shell:has(.tex-work-app) .tex-editor:focus-within {
    outline:0!important;
    box-shadow:none!important;
    filter:none!important;
  }
  .tex-work-app .tex-inline-file-viewer textarea {width:100%!important;max-width:100%!important;min-width:0!important;min-height:0!important;overflow-wrap:anywhere!important;overflow-x:auto!important}
  .tex-work-app .tex-inline-preview img {max-width:100%!important;height:auto!important}
  .tex-work-app .tex-inline-preview table {display:block;max-width:100%!important;overflow-x:auto!important;border-collapse:collapse}
  .tex-work-app .tex-inline-preview th,.tex-work-app .tex-inline-preview td {border:1px solid var(--border);padding:5px 8px}
  .tex-work-app .tex-inline-preview pre {white-space:pre!important;overflow-x:auto!important;overflow-wrap:normal!important}
  .tex-work-app .tex-inline-preview blockquote {border-left:3px solid var(--primary);margin:8px 0;padding-left:12px;color:var(--muted)}
  .tex-work-app .tex-inline-preview a {color:var(--primary);text-decoration:underline}
  .tex-work-app .tex-inline-preview ul,.tex-work-app .tex-inline-preview ol {padding-left:22px}
}
</style>
<script id="aertex-tex-mobile-qa-runtime">(${mobileTexQaRuntime.toString()})()</script>`;
}

// No privileged APIs or non-project DOM are touched by this mobile-only runtime.
function mobileTexQaRuntime() {
  const media = window.matchMedia('(max-width:1280px) and (pointer:coarse), (max-width:760px)');
  const mobilePaneMedia = window.matchMedia('(max-width:950px) and (pointer:coarse), (max-width:760px)');
  const root = document.querySelector('.tex-work-app');
  const toolbar = root?.querySelector('.tex-editor-toolbar');
  const footer = root?.querySelector('.tex-editor-footer');
  const save = root?.querySelector('.tex-save-state');
  if (!root || !toolbar || !footer || !save) return;
  const restore = save.nextSibling;
  const moveSave = () => {
    if (media.matches) {
      if (save.parentElement !== toolbar) toolbar.append(save);
    } else if (save.parentElement !== footer) {
      if (restore && restore.parentNode === footer) footer.insertBefore(save, restore);
      else footer.prepend(save);
    }
  };
  media.addEventListener?.('change', moveSave);
  moveSave();

  // Keep the TeX editor selection in view when tapping an individual nested file.
  const list = root.querySelector('#tex-document-list');
  list?.addEventListener('click', event => {
    if (!mobilePaneMedia.matches || !event.target.closest('.tex-tree-file')) return;
    window.setTimeout(() => {
      root.querySelector('.tex-mobile-tab[data-mobile-pane="editor"]')?.click();
    }, 0);
  });

  // Internal Markdown links select project files without navigating away.
  root.addEventListener('click', event => {
    if (!media.matches) return;
    const link = event.target.closest?.('.tex-inline-preview a[data-tex-project-link]');
    if (!link) return;
    event.preventDefault();
    const name = String(link.dataset.texProjectLink || '').replace(/^\.\//, '');
    const target = [...(list?.querySelectorAll('.tex-tree-file[data-file]') || [])]
      .find(button => button.dataset.file === name);
    target?.click();
  });

  // A safe, browser-only Markdown subset for touch layouts. All text is
  // escaped before formatting; raw HTML never executes.
  const html = value => String(value).replace(/[&<>"']/g, ch => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[ch]));
  function inline(raw) {
    const fragments = [];
    const marker = fragment => {
      const id = fragments.length;fragments.push(fragment);return '\u0001' + id + '\u0002';
    };
    let s = html(raw);
    s = s.replace(/`([^`\n]+)`/g, (_,code) => marker('<code>' + code + '</code>'));
    s = s.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, (_,name,url) =>
      marker('<a href="' + html(url) + '" rel="noopener noreferrer" target="_blank">' + name + '</a>'));
    s = s.replace(/\[([^\]\n]+)\]\(([^()\s]+)\)/g, (_,name,path) => {
      const relative=path.replace(/^\.\//, '');
      if (relative.startsWith('/') || relative.startsWith('#') ||
          relative.split('/').some(part=>part==='..'||part==='') ||
          /^[a-z][a-z0-9+.-]*:/i.test(relative)) return '['+name+']('+path+')';
      return marker('<a href="#" data-tex-project-link="' + html(relative) + '">' + name + '</a>');
    });
    s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_\n]+)__/g, '<strong>$1</strong>')
      .replace(/~~([^~\n]+)~~/g, '<del>$1</del>')
      .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
    return s.replace(/\u0001(\d+)\u0002/g, (_,id)=>fragments[Number(id)]||'');
  }
  function md(raw) {
    const lines = String(raw||'').replace(/\r\n?/g,'\n').split('\n');
    const out = []; let paragraph = [], block = [];
    const flushParagraph = () => {
      if (paragraph.length) {out.push('<p>'+paragraph.map(inline).join('<br>')+'</p>');paragraph=[];}
    };
    const flushList = () => {
      if (block.length) {out.push('</'+block[0]+'>');block=[];}
    };
    for (let i=0;i<lines.length;i++) {
      const line=lines[i];
      const fence = /^\s{0,3}(`{3,}|~{3,})(.*)$/.exec(line);
      if (fence) {
        flushParagraph();flushList();
        const closing=new RegExp('^\\s{0,3}'+fence[1][0]+'{'+fence[1].length+',}\\s*$');
        const code=[];
        while (++i < lines.length && !closing.test(lines[i])) code.push(lines[i]);
        out.push('<pre><code>'+html(code.join('\n'))+'</code></pre>');
        continue;
      }
      if (!line.trim()) {flushParagraph();flushList();continue;}
      const heading=/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
      if (heading) {flushParagraph();flushList();const n=heading[1].length;out.push('<h'+n+'>'+inline(heading[2])+'</h'+n+'>');continue;}
      if (/^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {flushParagraph();flushList();out.push('<hr>');continue;}
      if (/^\s{0,3}>/.test(line)) {
        flushParagraph();flushList();
        const quotes=[line.replace(/^\s{0,3}>\s?/,'')];
        while(i+1<lines.length && /^\s{0,3}>/.test(lines[i+1])) quotes.push(lines[++i].replace(/^\s{0,3}>\s?/,''));
        out.push('<blockquote><p>'+quotes.map(inline).join('<br>')+'</p></blockquote>');continue;
      }
      if (line.includes('|') && i+1<lines.length && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[i+1])) {
        flushParagraph();flushList();
        const cells=s=>s.trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim());
        const heads=cells(line);
        i++;const data=[];
        while(i+1<lines.length&&lines[i+1].trim().includes('|')) data.push(cells(lines[++i]));
        out.push('<table><thead><tr>'+heads.map(c=>'<th>'+inline(c)+'</th>').join('')+'</tr></thead><tbody>'+
          data.map(row=>'<tr>'+heads.map((_,j)=>'<td>'+inline(row[j]||'')+'</td>').join('')+'</tr>').join('')+'</tbody></table>');
        continue;
      }
      const ordered=/^\s{0,3}\d+[.)]\s+(.+)$/.exec(line);
      const unordered=/^\s{0,3}[-*+]\s+(.+)$/.exec(line);
      if (ordered||unordered) {
        flushParagraph();const tag=ordered?'ol':'ul';
        if(block[0]!==tag){flushList();block=[tag];out.push('<'+tag+'>');}
        let item=ordered?ordered[1]:unordered[1];
        let check='';
        const task=/^\[([ xX])\]\s*(.*)$/.exec(item);
        if(task){check='<input type="checkbox" disabled'+(task[1].toLowerCase()==='x'?' checked':'')+'> ';item=task[2];}
        out.push('<li>'+check+inline(item)+'</li>');continue;
      }
      flushList();
      paragraph.push(line.trim());
    }
    flushParagraph();flushList();
    return out.join('\n');
  }
  window.__aertexMobileMarkdown = raw => media.matches ? md(raw) : null;
}
