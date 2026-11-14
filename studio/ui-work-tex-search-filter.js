// Authenticated Work TeX explorer search, metadata and accessible filter popover.
// Search only requests projects owned by the current authenticated account.
export function enhanceWorkTexSearchFilter(markup, zh=true, ownerSlug="account") {
  const css = String.raw`
    /* English-only optical typefaces; the Chinese fallback stays upright. */
    @font-face{
      font-family:"AERTEX Michelangelus";
      src:url("/_aertex/fonts/michelangelus-italic-v1.woff2") format("woff2"),local("Michelangelus Italic");
      font-weight:400;font-style:normal;font-display:swap;unicode-range:U+0020-007E;
    }
    @font-face{
      font-family:"AERTEX Michelangelus";
      src:url("/_aertex/fonts/michelangelus-bolditalic-v1.woff2") format("woff2"),local("Michelangelus Bold Italic");
      font-weight:700;font-style:normal;font-display:swap;unicode-range:U+0020-007E;
    }
    body.os-shell:has(.tex-work-app) #tex-document-list .tex-tree-file,
    body.os-shell:has(.tex-work-app) #tex-document-list .tex-tree-file>span,
    body.os-shell:has(.tex-work-app) #tex-search,
    body.os-shell:has(.tex-work-app) #tex-search::placeholder,
    body.os-shell:has(.tex-work-app) #tex-search-results .tex-found-name {
      font-family:"AERTEX Michelangelus","Segoe UI","Microsoft YaHei UI",sans-serif!important;
      font-style:normal!important;font-weight:400!important;
    }
    body.os-shell:has(.tex-work-app) #tex-document-list .tex-tree-folder>span:not(.tex-row-menu-trigger),
    body.os-shell:has(.tex-work-app) #tex-document-list>.tex-document-item>strong,
    body.os-shell:has(.tex-work-app) .tex-panel-head>strong {
      font-family:"AERTEX Michelangelus","Segoe UI","Microsoft YaHei UI",sans-serif!important;
      font-weight:700!important;font-style:normal!important;
    }
    body.os-shell:has(.tex-work-app) #tex-document-list .tex-tree-file,
    body.os-shell:has(.tex-work-app) #tex-document-list .tex-tree-file.is-active,
    body.os-shell:has(.tex-work-app) #tex-document-list .tex-tree-file>span {
      font-weight:400!important;
    }
    body.os-shell:has(.tex-work-app) #tex-document-list .tex-tree-file.is-active {
      box-shadow:none!important;border-left:0!important;
    }
    body.os-shell:has(.tex-work-app) #tex-document-list .tex-tree-file.is-active::after {
      border-left:0!important;box-shadow:none!important;
    }
    body.os-shell:has(.tex-work-app) .tex-tree-document-icon{
      stroke-width:43!important;fill:none!important;
    }
    body.os-shell:has(.tex-work-app) .tex-work-app #tex-project-home,
    :root[data-theme="dark"] body.os-shell:has(.tex-work-app) .tex-work-app .tex-documents-panel #tex-project-home{
      background:var(--card)!important;color:var(--text)!important;
      border:1px solid var(--border)!important;box-shadow:none!important;
    }
    body.os-shell:has(.tex-work-app) #tex-project-home:hover{
      background:var(--fill)!important;filter:none!important;
    }

    /* Two separate controls. Filter aligns with the '+' in the create row. */
    body.os-shell:has(.tex-work-app) .tex-documents-panel .tex-explorer-search-row{
      box-sizing:border-box!important;display:grid!important;
      grid-template-columns:minmax(0,1fr) 38px!important;column-gap:7px!important;
      align-items:center!important;margin:0 9px 8px!important;min-width:0!important;
    }
    body.os-shell:has(.tex-work-app) .tex-explorer-search-row>.tex-search{
      min-width:0!important;width:100%!important;max-width:none!important;
      margin:0!important;box-sizing:border-box!important;display:flex!important;
      align-items:center!important;padding:0 10px!important;gap:8px!important;
    }
    body.os-shell:has(.tex-work-app) .tex-explorer-search-row #tex-search{
      width:100%!important;min-width:0!important;flex:1 1 auto!important;
    }
    body.os-shell:has(.tex-work-app) .tex-explorer-search-row #tex-search-filter{
      display:grid!important;place-items:center!important;
      width:38px!important;height:38px!important;min-width:38px!important;
      min-height:38px!important;max-width:38px!important;
      padding:0!important;margin:0!important;border:0!important;
      border-radius:10px!important;background:transparent!important;
      color:var(--text)!important;box-shadow:none!important;
      cursor:pointer!important;position:relative!important;
    }
    body.os-shell:has(.tex-work-app) #tex-search-filter:hover,
    body.os-shell:has(.tex-work-app) #tex-search-filter[aria-expanded="true"]{
      background:color-mix(in srgb,var(--text) 9%,transparent)!important;
    }
    body.os-shell:has(.tex-work-app) #tex-search-filter svg{
      width:21px!important;height:21px!important;display:block!important;
      stroke:currentColor!important;fill:none!important;
      stroke-width:2.1!important;stroke-linecap:round!important;
      stroke-linejoin:round!important;
    }
    body.os-shell:has(.tex-work-app) #tex-search-filter[data-has-filter="true"]::after{
      content:"";position:absolute;width:5px;height:5px;border-radius:50%;
      right:5px;top:5px;background:var(--primary);pointer-events:none;
    }
    @media(max-width:760px),(max-width:950px) and (pointer:coarse){
      body.os-shell:has(.tex-work-app) .tex-documents-panel .tex-explorer-search-row{
        grid-template-columns:minmax(0,1fr) 48px!important;
        column-gap:8px!important;margin:0 14px 10px!important;
      }
      body.os-shell:has(.tex-work-app) .tex-explorer-search-row #tex-search-filter{
        width:48px!important;height:48px!important;min-width:48px!important;
        min-height:48px!important;max-width:48px!important;
      }
      body.os-shell:has(.tex-work-app) #tex-search-filter svg{width:24px!important;height:24px!important}
    }
    .tex-work-app #tex-document-list[hidden],
    .tex-work-app #tex-documents-empty[hidden],
    .tex-work-app #tex-search-results[hidden],#tex-search-filter-panel[hidden] {
      display:none!important;
    }
    .tex-work-app #tex-search-results{
      display:block;min-height:0;flex:1 1 0;overflow-y:auto;overflow-x:hidden;
      box-sizing:border-box;padding:2px 7px 11px;scrollbar-width:thin;
    }
    /* Results use the exact 34px explorer rhythm. Details only appear on hover. */
    body.os-shell:has(.tex-work-app) #tex-search-results .tex-found-entry{
      box-sizing:border-box!important;display:flex!important;align-items:center!important;
      gap:7px!important;width:100%!important;height:35px!important;min-height:35px!important;
      padding:4px 8px!important;margin:0!important;border:0!important;
      border-radius:8px!important;background:transparent;color:var(--text);
      text-align:left!important;cursor:pointer;
    }
    body.os-shell:has(.tex-work-app) #tex-search-results .tex-found-entry:hover,
    body.os-shell:has(.tex-work-app) #tex-search-results .tex-found-entry:focus-visible{
      background:var(--fill)!important;outline-offset:-2px;
    }
    .tex-work-app #tex-search-results .tex-found-entry svg{
      flex:0 0 19px!important;width:19px!important;height:19px!important;
      stroke:#858b95!important;stroke-width:2!important;fill:none!important;
      stroke-linecap:round!important;stroke-linejoin:round!important;
    }
    .tex-work-app #tex-search-results .tex-found-content{
      min-width:0!important;flex:1 1 auto!important;display:block!important;
    }
    .tex-work-app #tex-search-results .tex-found-name{
      display:block!important;font-size:13px!important;line-height:21px!important;
      white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;
      overflow-wrap:normal!important;
    }
    .tex-work-app #tex-search-results .tex-found-path,
    .tex-work-app #tex-search-results .tex-found-detail{display:none!important}
    .tex-work-app #tex-search-results .tex-search-progress,
    .tex-work-app #tex-search-results .tex-search-none{
      padding:11px 10px;font-size:12px;color:var(--muted);line-height:1.45;
    }
    /* No second generated tooltip: the browser's native title alone remains. */

    /* One compact grouped system-style filter sheet; no inner scrollbar. */
    html body #tex-search-filter-panel{
      position:fixed!important;z-index:2147480000!important;
      width:360px!important;min-width:0!important;
      max-width:calc(100vw - 16px)!important;max-height:none!important;
      box-sizing:border-box!important;overflow:visible!important;
      padding:11px 12px 12px!important;margin:0!important;
      border:1px solid var(--border,#45454b)!important;
      border-radius:19px!important;
      background:var(--card,#242426)!important;color:var(--text,#f6f6f7)!important;
      box-shadow:0 14px 35px rgba(0,0,0,.22)!important;
      font-family:"Segoe UI","Microsoft YaHei UI",sans-serif!important;
      font-size:12px!important;line-height:1.28!important;
    }
    #tex-search-filter-panel .tex-filter-head{
      display:grid!important;grid-template-columns:38px 1fr 38px!important;
      height:38px!important;align-items:center!important;margin:0 0 6px!important;
      padding:0!important;gap:0!important;min-height:0!important;
    }
    #tex-search-filter-panel .tex-filter-head h2{
      grid-column:2!important;margin:0!important;min-width:0!important;
      white-space:nowrap!important;text-align:center!important;
      font:700 16px/1.2 "Segoe UI","Microsoft YaHei UI",sans-serif!important;
    }
    #tex-search-filter-panel .tex-filter-head>[data-action="done"]{
      grid-column:3!important;justify-self:end!important;
      width:37px!important;height:37px!important;min-height:37px!important;
      min-width:37px!important;padding:0!important;margin:0!important;
      display:grid!important;place-items:center!important;
      border:0!important;border-radius:50%!important;
      background:var(--primary,#087dff)!important;color:#fff!important;
      font-size:23px!important;line-height:1!important;
      font-weight:500!important;box-shadow:none!important;
    }
    #tex-search-filter-panel h3{
      display:block!important;margin:9px 4px 5px!important;padding:0!important;
      font:600 11px/1.3 "Segoe UI","Microsoft YaHei UI",sans-serif!important;
      color:var(--muted)!important;
    }
    #tex-search-filter-panel .tex-filter-group{
      box-sizing:border-box!important;display:block!important;
      background:var(--fill)!important;border:1px solid var(--border)!important;
      border-radius:12px!important;overflow:hidden!important;padding:0 10px!important;
    }
    #tex-search-filter-panel .tex-filter-group>label{
      box-sizing:border-box!important;display:flex!important;
      justify-content:space-between!important;align-items:center!important;
      width:100%!important;height:33px!important;min-height:33px!important;
      max-height:33px!important;margin:0!important;padding:0 2px!important;
      font:400 12.5px/1.2 "Segoe UI","Microsoft YaHei UI",sans-serif!important;
      color:var(--text)!important;cursor:pointer;gap:6px!important;
    }
    #tex-search-filter-panel .tex-filter-group>label+label{
      border-top:1px solid var(--border)!important;
    }
    #tex-search-filter-panel .tex-filter-group>label>span:first-child{
      white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;
      flex:1 1 auto!important;min-width:0!important;
    }
    #tex-search-filter-panel input[type="checkbox"],
    #tex-search-filter-panel input[type="radio"]{
      appearance:auto!important;-webkit-appearance:auto!important;
      box-sizing:border-box!important;position:static!important;
      display:block!important;flex:0 0 17px!important;
      width:17px!important;height:17px!important;
      min-width:17px!important;min-height:17px!important;
      max-width:17px!important;max-height:17px!important;
      padding:0!important;margin:0!important;
      border-radius:initial!important;box-shadow:none!important;
      background:transparent!important;accent-color:var(--primary)!important;
      cursor:pointer!important;
    }
    #tex-search-filter-panel .tex-filter-group .tex-filter-date-control,
    #tex-search-filter-panel .tex-filter-group .tex-filter-size-control,
    #tex-search-filter-panel .tex-filter-group .tex-filter-select{
      box-sizing:border-box!important;display:flex!important;
      align-items:center!important;justify-content:space-between!important;
      flex:0 0 150px!important;max-width:150px!important;
      width:150px!important;height:27px!important;min-height:27px!important;
      border-radius:8px!important;border:1px solid var(--border)!important;
      background:var(--card)!important;color:var(--text)!important;
      padding:0 6px!important;margin:0!important;
      font:400 11.5px/1.2 "Segoe UI","Microsoft YaHei UI",sans-serif!important;
    }
    /* A real, visible calendar button. No 1x1 hidden native picker:
       Chrome anchored that popup to the tiny element and clipped its UI. */
    #tex-search-filter-panel .tex-filter-group .tex-filter-date-control {
      position:relative!important;padding:0!important;overflow:visible!important;
      color-scheme:dark;
    }
    #tex-search-filter-panel .tex-filter-date-control>.tex-filter-date-label{
      box-sizing:border-box!important;display:flex!important;align-items:center!important;
      justify-content:space-between!important;gap:5px!important;
      flex:1 1 auto!important;width:100%!important;height:25px!important;
      min-width:0!important;padding:0 7px!important;margin:0!important;
      text-align:left!important;border:0!important;border-radius:7px!important;
      background:transparent!important;color:var(--text)!important;
      font:inherit!important;white-space:nowrap!important;box-shadow:none!important;
      cursor:pointer!important;position:relative!important;
    }
    #tex-search-filter-panel .tex-filter-date-label svg{
      flex:0 0 16px!important;position:static!important;
      width:16px!important;height:16px!important;
      stroke:currentColor!important;fill:none!important;stroke-width:1.8!important;
      opacity:.93!important;pointer-events:none!important;
    }
    #tex-search-filter-panel .tex-filter-date-label .tex-date-text{
      flex:1 1 auto!important;display:block!important;min-width:0!important;
      margin:0!important;line-height:23px!important;
      white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;
      color:inherit!important;
    }
    #tex-search-filter-panel .tex-filter-date-label[aria-expanded="true"]{
      outline:2px solid var(--primary)!important;outline-offset:0!important;
    }
    /* Styled like the adjacent sort dropdown: dark native selects with readable
       light foreground, matching option colors, and a stable floating calendar. */
    #tex-search-filter-panel .tex-date-calendar[hidden]{display:none!important}
    #tex-search-filter-panel .tex-date-calendar{
      position:fixed!important;z-index:2147480600!important;
      box-sizing:border-box!important;width:280px!important;max-width:calc(100vw - 16px)!important;
      padding:11px 10px 9px!important;margin:0!important;
      overflow:visible!important;border:1px solid var(--border)!important;
      border-radius:12px!important;background:var(--card,#242426)!important;
      color:var(--text,#fff)!important;color-scheme:dark;
      box-shadow:0 15px 34px rgba(0,0,0,.32)!important;
      font:400 12px/1.35 "Segoe UI","Microsoft YaHei UI",sans-serif!important;
    }
    #tex-search-filter-panel .tex-date-calendar-nav{
      display:grid!important;grid-template-columns:29px minmax(0,1fr) 77px 29px!important;
      align-items:center!important;gap:5px!important;margin:0 0 7px!important;
      height:30px!important;
    }
    #tex-search-filter-panel .tex-date-calendar-nav button{
      box-sizing:border-box!important;display:grid!important;place-items:center!important;
      min-width:0!important;width:29px!important;height:29px!important;min-height:29px!important;
      padding:0!important;margin:0!important;border:1px solid transparent!important;
      border-radius:7px!important;background:transparent!important;
      color:var(--text)!important;font-size:21px!important;line-height:1!important;
    }
    #tex-search-filter-panel .tex-date-calendar-nav button:hover,
    #tex-search-filter-panel .tex-calendar-grid button:not(:disabled):hover,
    #tex-search-filter-panel .tex-calendar-actions button:hover{
      background:var(--fill)!important;
    }
    #tex-search-filter-panel .tex-date-calendar-nav select{
      box-sizing:border-box!important;display:block!important;min-width:0!important;
      max-width:none!important;width:100%!important;height:29px!important;min-height:29px!important;
      padding:0 5px!important;margin:0!important;border:1px solid var(--border)!important;
      border-radius:7px!important;background:var(--fill)!important;
      color:var(--text)!important;box-shadow:none!important;
      font:400 12px "Segoe UI","Microsoft YaHei UI",sans-serif!important;
      appearance:auto!important;-webkit-appearance:auto!important;
      color-scheme:dark!important;
    }
    #tex-search-filter-panel .tex-calendar-weekdays,
    #tex-search-filter-panel .tex-calendar-grid{
      display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr))!important;
      gap:1px!important;align-items:center!important;
    }
    #tex-search-filter-panel .tex-calendar-weekdays span{
      display:grid!important;place-items:center!important;height:21px!important;
      color:var(--muted)!important;font-size:10px!important;
    }
    #tex-search-filter-panel .tex-calendar-grid button{
      box-sizing:border-box!important;display:grid!important;place-items:center!important;
      border:0!important;border-radius:6px!important;
      width:100%!important;height:29px!important;min-height:29px!important;
      max-height:29px!important;padding:0!important;margin:0!important;
      background:transparent!important;color:var(--text)!important;
      font:400 12px "Segoe UI","Microsoft YaHei UI",sans-serif!important;
      cursor:pointer!important;
    }
    #tex-search-filter-panel .tex-calendar-grid button:disabled{
      visibility:hidden!important;pointer-events:none!important;
    }
    #tex-search-filter-panel .tex-calendar-grid button[aria-selected="true"]{
      background:var(--primary)!important;color:#fff!important;
    }
    #tex-search-filter-panel .tex-calendar-grid button.is-today:not([aria-selected="true"]){
      box-shadow:inset 0 0 0 1px var(--primary)!important;
    }
    #tex-search-filter-panel .tex-calendar-actions{
      box-sizing:border-box!important;display:flex!important;
      justify-content:space-between!important;align-items:center!important;
      gap:7px!important;margin-top:7px!important;padding-top:7px!important;
      border-top:1px solid var(--border)!important;
    }
    #tex-search-filter-panel .tex-calendar-actions button{
      height:25px!important;min-height:25px!important;
      padding:0 8px!important;margin:0!important;
      border:0!important;border-radius:7px!important;
      background:transparent!important;color:var(--text)!important;
      font:400 11px "Segoe UI","Microsoft YaHei UI",sans-serif!important;
    }
    /* Fix the washed-out or seemingly disabled KB/MB entries in dark mode. */
    #tex-search-filter-panel .tex-filter-size-control>select,
    #tex-search-filter-panel select.tex-filter-select{
      color-scheme:dark!important;
    }
    #tex-search-filter-panel select option{
      color:var(--text,#fff)!important;background:var(--card,#242426)!important;
      font-style:normal!important;font-weight:400!important;
    }
    :root[data-theme="light"] #tex-search-filter-panel .tex-date-calendar,
    :root[data-theme="light"] #tex-search-filter-panel .tex-date-calendar-nav select,
    :root[data-theme="light"] #tex-search-filter-panel .tex-filter-size-control>select,
    :root[data-theme="light"] #tex-search-filter-panel select.tex-filter-select{
      color-scheme:light!important;
    }
    #tex-search-filter-panel .tex-filter-size-control{
      gap:3px!important;padding:0 3px 0 7px!important;
    }
    #tex-search-filter-panel .tex-filter-size-control>input{
      flex:1 1 auto!important;min-width:0!important;
      width:0!important;height:24px!important;min-height:24px!important;
      padding:0!important;margin:0!important;
      border:0!important;border-radius:0!important;box-shadow:none!important;
      outline-offset:0!important;background:transparent!important;
      color:var(--text)!important;font:inherit!important;
    }
    #tex-search-filter-panel .tex-filter-size-control>select{
      box-sizing:border-box!important;flex:0 0 53px!important;
      width:53px!important;min-width:53px!important;max-width:53px!important;
      height:24px!important;min-height:24px!important;
      padding:0 2px!important;margin:0!important;
      background:transparent!important;color:var(--text)!important;
      font:inherit!important;border:0!important;border-radius:0!important;
      box-shadow:none!important;cursor:pointer!important;
    }
    #tex-search-filter-panel .tex-filter-group select.tex-filter-select{
      appearance:auto!important;-webkit-appearance:auto!important;
      padding:0 5px!important;cursor:pointer!important;
    }
    #tex-search-filter-panel button:focus-visible,
    #tex-search-filter-panel select:focus-visible,
    #tex-search-filter-panel input:focus-visible{
      outline:2px solid var(--primary)!important;outline-offset:2px!important;
    }
    #tex-search-filter-panel .tex-filter-actions{
      display:flex!important;align-items:center!important;justify-content:flex-start!important;
      height:24px!important;min-height:24px!important;
      margin:7px 2px 0!important;padding:0!important;
    }
    #tex-search-filter-panel .tex-filter-actions>[data-action="reset"]{
      box-sizing:border-box!important;min-height:24px!important;height:24px!important;
      border:0!important;border-radius:7px!important;
      color:var(--muted)!important;background:transparent!important;
      padding:0 7px!important;box-shadow:none!important;
      font:400 11px "Segoe UI","Microsoft YaHei UI",sans-serif!important;
    }
    #tex-search-filter-panel .tex-filter-actions>[data-action="reset"]:hover{
      color:var(--text)!important;background:var(--fill)!important;
    }
    @media(max-height:620px){
      #tex-search-filter-panel h3{margin-top:6px!important;margin-bottom:3px!important}
      #tex-search-filter-panel .tex-filter-group>label{height:29px!important;min-height:29px!important;max-height:29px!important}
      html body #tex-search-filter-panel{padding:8px 11px!important}
    }
    @media(max-height:470px){
      html body #tex-search-filter-panel{
        max-height:calc(100dvh - 12px)!important;overflow-y:auto!important;
      }
    }
  `;
  const script = String.raw`
    (() => {
      const root=document.querySelector('.tex-work-app[data-tex-root]');
      const input=document.getElementById('tex-search'),box=input?.closest('.tex-search');
      const list=document.getElementById('tex-document-list'),empty=document.getElementById('tex-documents-empty');
      if(!root||!input||!box||!list||window.__aertexTexAdvancedSearch)return;
      window.__aertexTexAdvancedSearch=true;
      const zh=__ZH__, owner=__OWNER__;
      const copy=zh?{
        title:'过滤条件',type:'包括类型',project:'项目',folder:'文件夹',file:'文件',
        status:'保存状态',saved:'已保存',unsaved:'未保存',created:'创建时间不早于',
        modified:'最后修改不早于',size:'大小不超过',
        order:'排序',newest:'最近修改',name:'名称',
        reset:'重置',done:'完成',searching:'正在检索项目文件',
        noResults:'没有找到符合条件的项目或文件',unknown:'未记录',
        dateCreated:'创建',dateModified:'修改',byteSize:'大小',state:'状态',path:'路径'
      }:{
        title:'Filters',type:'Include types',project:'Projects',folder:'Folders',file:'Files',
        status:'Save status',saved:'Saved',unsaved:'Unsaved',created:'Created since',
        modified:'Modified since',size:'Maximum size',
        order:'Sort',newest:'Recently modified',name:'Name',
        reset:'Reset',done:'Done',searching:'Searching project files',
        noResults:'No matching projects or files',unknown:'Not recorded',
        dateCreated:'Created',dateModified:'Modified',byteSize:'Size',state:'State',path:'Path'
      };
      const api=async url=>{
        const response=await fetch(url,{credentials:'same-origin',cache:'no-store',headers:{accept:'application/json'}});
        if(!response.ok)throw Error('Search index unavailable');
        return response.json();
      };
      const state={types:{project:true,folder:true,file:true},status:'all',created:'',modified:'',maxSize:'',sizeUnit:'KB',order:'recent'};
      const results=document.createElement('section');
      results.id='tex-search-results';results.hidden=true;results.setAttribute('aria-live','polite');
      list.before(results);
      const button=document.createElement('button');
      button.type='button';button.id='tex-search-filter';button.setAttribute('aria-label',copy.title);
      button.setAttribute('title',copy.title);button.setAttribute('aria-expanded','false');
      button.setAttribute('aria-haspopup','dialog');
      button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 6.5H21 M6 12H18 M9 17.5H15"/></svg>';
      const searchRow=document.createElement('div');
      searchRow.className='tex-explorer-search-row';
      box.before(searchRow);
      searchRow.append(box,button);
      const pop=document.createElement('section');
      pop.id='tex-search-filter-panel';pop.hidden=true;
      pop.setAttribute('role','dialog');pop.setAttribute('aria-modal','false');
      pop.setAttribute('aria-label',copy.title);
      pop.innerHTML='<div class="tex-filter-head"><h2></h2><button type="button" data-action="done" aria-label="'+copy.done+'">'+
        '<svg width="23" height="23" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-11" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>'+
        '<h3 data-caption="type"></h3><div class="tex-filter-group" id="tex-filter-types"></div>'+
        '<h3 data-caption="status"></h3><div class="tex-filter-group" id="tex-filter-status"></div>'+
        '<h3 data-caption="dates"></h3><div class="tex-filter-group" id="tex-filter-dates"></div>'+
        '<div class="tex-filter-actions"><button type="button" data-action="reset"></button></div>';
      document.body.append(pop);
      pop.querySelector('h2').textContent=copy.title;
      pop.querySelector('[data-caption="type"]').textContent=copy.type;
      pop.querySelector('[data-caption="status"]').textContent=copy.status;
      pop.querySelector('[data-caption="dates"]').textContent=zh?'时间、大小与排序':'Time, size and sorting';
      pop.querySelector('[data-action="reset"]').textContent=copy.reset;
      const types=pop.querySelector('#tex-filter-types'),statuses=pop.querySelector('#tex-filter-status');
      for(const key of ['project','folder','file']){
        const l=document.createElement('label'),title=document.createElement('span'),check=document.createElement('input');
        title.textContent=copy[key];check.type='checkbox';check.checked=state.types[key];check.dataset.type=key;
        l.append(title,check);types.append(l);
      }
      for(const [value,label] of [['all',zh?'全部状态':'All statuses'],['saved',copy.saved],['unsaved',copy.unsaved]]){
        const l=document.createElement('label'),span=document.createElement('span'),check=document.createElement('input');
        span.textContent=label;check.type='radio';check.name='tex-filter-status-choice';check.value=value;check.checked=value==='all';
        l.append(span,check);statuses.append(l);
      }
      const dates=pop.querySelector('#tex-filter-dates');
      const calendar='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.8" y="5.5" width="16.4" height="15.2" rx="2.2"/><path d="M7.5 3.5v4M16.5 3.5v4M3.8 10.1h16.4M8.1 14h1M12 14h1M16 14h1"/></svg>';
      const dateFields={};
      const dateLabel=value=>value ? value.replace(/-/g,'/') : (zh?'选择日期':'Choose date');
      function addDate(label,key){
        const row=document.createElement('label'),caption=document.createElement('span'),control=document.createElement('span');
        caption.textContent=label;control.className='tex-filter-date-control';
        const picker=document.createElement('input');picker.type='date';picker.dataset.key=key;
        picker.setAttribute('aria-label',label);
        const trigger=document.createElement('button');trigger.type='button';
        trigger.className='tex-filter-date-label';trigger.setAttribute('aria-label',label);
        const display=document.createElement('span');display.className='tex-date-text';display.textContent=dateLabel('');
        trigger.append(display);
        trigger.insertAdjacentHTML('beforeend',calendar);
        trigger.addEventListener('click',()=>{
          try{picker.showPicker?.();}catch{picker.focus();picker.click();}
        });
        picker.addEventListener('change',()=>{state[key]=picker.value;display.textContent=dateLabel(picker.value);refresh()});
        control.append(trigger,picker);row.append(caption,control);dates.append(row);
        dateFields[key]={picker,display};return picker;
      }
      addDate(copy.created,'created');addDate(copy.modified,'modified');
      const sizeRow=document.createElement('label'),sizeTitle=document.createElement('span');
      sizeTitle.textContent=copy.size;
      const sizeControl=document.createElement('span');sizeControl.className='tex-filter-size-control';
      const sizeInput=document.createElement('input');sizeInput.type='number';sizeInput.dataset.key='maxSize';
      sizeInput.min='0';sizeInput.step='0.1';sizeInput.placeholder=zh?'不限':'Any';
      sizeInput.setAttribute('aria-label',copy.size);
      const unit=document.createElement('select');unit.dataset.key='sizeUnit';unit.setAttribute('aria-label',zh?'大小单位':'Size unit');
      for(const u of ['KB','MB']){
        const option=document.createElement('option');option.value=u;option.textContent=u;unit.append(option);
      }
      sizeControl.append(sizeInput,unit);sizeRow.append(sizeTitle,sizeControl);dates.append(sizeRow);
      const sort=document.createElement('label'),sortTitle=document.createElement('span'),sortSelect=document.createElement('select');
      sortTitle.textContent=copy.order;sortSelect.className='tex-filter-select';
      for(const [value,label]of [['recent',copy.newest],['name',copy.name]]){
        const option=document.createElement('option');option.value=value;option.textContent=label;sortSelect.append(option);
      }
      sortSelect.dataset.key='order';sort.append(sortTitle,sortSelect);dates.append(sort);
      const position=()=>{
        const bounds=button.getBoundingClientRect();
        const width=pop.offsetWidth,height=pop.offsetHeight;
        const left=Math.max(8,Math.min(innerWidth-width-8,bounds.right-width));
        const beneath=bounds.bottom+8;
        const top=Math.max(8,Math.min(innerHeight-height-8,beneath));
        pop.style.left=left+'px';pop.style.top=top+'px';
      };
      const close=()=>{pop.hidden=true;button.setAttribute('aria-expanded','false')};
      button.addEventListener('click',()=>{pop.hidden=!pop.hidden;button.setAttribute('aria-expanded',String(!pop.hidden));if(!pop.hidden)position()});
      pop.addEventListener('click',e=>{
        if(e.target.closest('[data-action="done"]')){close();button.focus()}
        if(e.target.closest('[data-action="reset"]')){
          state.types={project:true,folder:true,file:true};state.status='all';
          state.created='';state.modified='';state.maxSize='';state.sizeUnit='KB';state.order='recent';
          for(const el of pop.querySelectorAll('[data-type]'))el.checked=true;
          for(const el of pop.querySelectorAll('[name="tex-filter-status-choice"]'))el.checked=el.value==='all';
          for(const el of pop.querySelectorAll('[data-key]'))
            el.value=el.dataset.key==='order'?'recent':el.dataset.key==='sizeUnit'?'KB':'';
          for(const field of Object.values(dateFields))field.display.textContent=dateLabel('');
          refresh();
        }
      });
      pop.addEventListener('change',e=>{
        const el=e.target;
        if(el.dataset.type)state.types[el.dataset.type]=el.checked;
        if(el.name==='tex-filter-status-choice')state.status=el.value;
        if(el.dataset.key)state[el.dataset.key]=el.value;
        refresh();
      });
      sizeInput.addEventListener('input',()=>{
        state.maxSize=sizeInput.value;refresh();
      });
      document.addEventListener('pointerdown',e=>{
        if(!pop.hidden&&!pop.contains(e.target)&&!button.contains(e.target))close();
      },true);
      document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!pop.hidden){close();button.focus()}});
      window.addEventListener('resize',()=>{if(!pop.hidden)position()});
      window.addEventListener('pagehide',()=>pop.remove(),{once:true});
      let projects=[],listedAt=0,index=new Map(),inflight=new Map(),generation=0,timer=0;
      const textbytes=s=>new TextEncoder().encode(String(s||'')).length;
      const sizeOf=file=>file?.encoding==='base64'
        ?Math.max(0,Math.floor(String(file.content||'').replace(/=+$/,'').length*3/4))
        :textbytes(file?.content);
      const savedStatus=entry=>{
        const current=root.dataset.texCollaborationDocumentId||'';
        if(entry.projectId!==current)return 'saved';
        const active=window.__aertexTexExplorerAsset?.();
        const pending=window.__aertexTexExplorerHasUnsaved?.()===true;
        const mainDirty=window.__aertexTexMainDirty?.()===true ||
          /未保存|unsaved|正在保存|saving/i.test(document.getElementById('tex-save-state')?.textContent||'');
        const selectedName=active?.name||'main.tex';
        const matchingFile=entry.type==='file'&&entry.name===selectedName;
        const matchingFolder=entry.type==='folder'&&selectedName.startsWith(entry.name+'/');
        return (entry.type==='project' && (pending||mainDirty))||
          (matchingFile && (active?.main?mainDirty:pending))||
          (matchingFolder && pending) ? 'unsaved':'saved';
      };
      const dateOf=value=>{
        const t=Date.parse(value||'');
        return Number.isFinite(t)?new Date(t).toLocaleString(zh?'zh-CN':'en-US'):copy.unknown;
      };
      const formatSize=value=>{
        if(!Number.isFinite(value)||value<0)return copy.unknown;
        if(value<1024)return Math.round(value)+' B';
        if(value<1048576)return (value/1024).toFixed(1)+' KB';
        return (value/1048576).toFixed(2)+' MB';
      };
      const pathOf=e=>owner+'/'+e.projectTitle+(e.name?'/'+e.name:'');
      const info=e=>{
        const stateText=savedStatus(e)==='unsaved'?copy.unsaved:copy.saved;
        return copy.path+': '+pathOf(e)+'\n'+copy.dateCreated+': '+dateOf(e.created_at)+
          '\n'+copy.dateModified+': '+dateOf(e.updated_at)+
          '\n'+copy.byteSize+': '+formatSize(e.size_bytes)+'\n'+copy.state+': '+stateText;
      };
      const projectEntry=p=>({
        type:'project',id:p.id,projectId:p.id,projectTitle:p.title,name:'',
        created_at:p.created_at||null,updated_at:p.updated_at||null,
        size_bytes:index.get(p.id)?.projectSize ?? null,
        preview:p.preview||''
      });
      function summarize(doc){
        const fileEntries=[];
        if(!doc.main_deleted){
          fileEntries.push({name:doc.main_filename||'main.tex',main:true,created_at:doc.main_file_created_at||null,
            updated_at:doc.main_file_updated_at||null,size_bytes:textbytes(doc.source)});
        }
        for(const file of doc.files||[]){
          if(!file||typeof file.name!=='string')continue;
          fileEntries.push({name:file.name,main:false,
            created_at:file.created_at||null,updated_at:file.updated_at||null,size_bytes:sizeOf(file)});
        }
        const groups=new Map();
        for(const f of fileEntries){
          const parts=f.name.split('/');let prefix='';
          for(const segment of parts.slice(0,-1)){
            prefix=prefix?prefix+'/'+segment:segment;
            let group=groups.get(prefix);
            if(!group){group={name:prefix,size_bytes:0,created_at:null,updated_at:null};groups.set(prefix,group)}
            group.size_bytes+=f.size_bytes;
            if(f.created_at && (!group.created_at||f.created_at<group.created_at))group.created_at=f.created_at;
            if(f.updated_at && (!group.updated_at||f.updated_at>group.updated_at))group.updated_at=f.updated_at;
          }
        }
        return {files:fileEntries,folders:[...groups.values()],
          projectSize:fileEntries.reduce((n,f)=>n+f.size_bytes,0)};
      }
      const loadProjects=async()=>{
        if(Date.now()-listedAt<30000 && projects.length)return projects;
        const data=await api('/api/tex/documents');projects=Array.isArray(data.documents)?data.documents:[];
        listedAt=Date.now();return projects;
      };
      const getIndex=async p=>{
        const cached=index.get(p.id);
        if(cached&&cached.updatedAt===p.updated_at)return cached;
        if(inflight.has(p.id))return inflight.get(p.id);
        const request=api('/api/tex/documents?id='+encodeURIComponent(p.id)).then(data=>{
          if(!data.document||data.document.id!==p.id)throw Error('Project not accessible');
          const entry={...summarize(data.document),updatedAt:p.updated_at};
          index.set(p.id,entry);return entry;
        }).finally(()=>inflight.delete(p.id));
        inflight.set(p.id,request);return request;
      };
      function entries(){
        const out=[];
        for(const p of projects){
          out.push(projectEntry(p));
          const detail=index.get(p.id);
          if(!detail)continue;
          for(const f of detail.files)out.push({...f,type:'file',id:p.id,projectId:p.id,projectTitle:p.title});
          for(const f of detail.folders)out.push({...f,type:'folder',id:p.id,projectId:p.id,projectTitle:p.title});
        }
        return out;
      }
      const match=e=>{
        if(!state.types[e.type])return false;
        const status=savedStatus(e);
        if(state.status!=='all'&&status!==state.status)return false;
        if(state.created&&(!e.created_at||e.created_at.slice(0,10)<state.created))return false;
        if(state.modified&&(!e.updated_at||e.updated_at.slice(0,10)<state.modified))return false;
        if(state.maxSize!==''&&(!Number.isFinite(e.size_bytes)||
          e.size_bytes>Number(state.maxSize)*(state.sizeUnit==='MB'?1048576:1024)))return false;
        const q=input.value.trim().toLocaleLowerCase();
        if(!q)return true;
        return [e.name,e.projectTitle,e.type==='project'?e.preview:'',pathOf(e)]
          .some(v=>String(v||'').toLocaleLowerCase().includes(q));
      };
      const filterActive=()=>state.status!=='all'||Boolean(state.created||state.modified||state.maxSize)||
        Object.values(state.types).some(x=>!x);
      const searchActive=()=>Boolean(input.value.trim()||filterActive());
      const icon=type=>type==='project'
        ?'<svg viewBox="0 0 24 24"><rect x="2.7" y="2.7" width="18.6" height="18.6" rx="1"/><path d="M8.8 3v18M9 9h12"/></svg>'
        :type==='folder'
        ?'<svg viewBox="0 0 24 24"><path d="M12 20c-2.4-2-5-2.8-9-2V4c4-.3 7.2.7 9 2.5 2-1.8 5.1-2.8 9-2.5v14c-4-.8-6.6 0-9 2Z M12 6.5V20"/></svg>'
        :'<svg viewBox="0 0 24 24"><path d="M4 2H15L21 8V22H4Z M15 2V8H21 M8 12H17 M8 16H15 M8 19H17"/></svg>';
      function addResult(entry){
        const row=document.createElement('button');row.type='button';row.className='tex-found-entry';
        row.dataset.type=entry.type;row.dataset.project=entry.id;row.title=info(entry);
        const svg=document.createElement('span');svg.innerHTML=icon(entry.type);
        const content=document.createElement('span');content.className='tex-found-content';
        const title=document.createElement('span');title.className='tex-found-name';
        title.textContent=entry.type==='project'?entry.projectTitle:entry.name.split('/').at(-1);
        content.append(title);row.append(svg.firstElementChild,content);
        row.addEventListener('pointerenter',()=>{row.title=info(entry)});
        row.addEventListener('focus',()=>{row.title=info(entry)});
        row.addEventListener('click',()=>void openResult(entry));return row;
      }
      function refresh(){
        button.dataset.hasFilter=String(filterActive());
        const active=searchActive();
        list.hidden=active;empty.hidden=active || Boolean(list.querySelector('.tex-document-item'));
        results.hidden=!active;
        if(!active){results.replaceChildren();return}
        const found=entries().filter(match);
        found.sort(state.order==='name'?
          (a,b)=>pathOf(a).localeCompare(pathOf(b),zh?'zh':'en',{numeric:true}):
          (a,b)=>String(b.updated_at||'').localeCompare(String(a.updated_at||''))||
            pathOf(a).localeCompare(pathOf(b)));
        results.replaceChildren();
        const subset=found.slice(0,300);
        for(const e of subset)results.append(addResult(e));
        if(!subset.length){
          const note=document.createElement('p');note.className='tex-search-none';
          note.textContent=copy.noResults;results.append(note);
        }
        const pending=projects.filter(p=>!index.has(p.id)).length;
        if(pending&&state.types.file||pending&&state.types.folder){
          const note=document.createElement('p');note.className='tex-search-progress';
          note.textContent=copy.searching+' · '+(projects.length-pending)+'/'+projects.length;
          results.append(note);
        }
      }
      async function indexAll(){
        const token=++generation;
        try {
          const all=await loadProjects();if(token!==generation)return;
          refresh();
          if(!state.types.file&&!state.types.folder)return;
          let cursor=0;
          const worker=async()=>{
            while(cursor<all.length && token===generation){
              const p=all[cursor++];
              try{await getIndex(p)}catch{}
              if(token===generation)refresh();
            }
          };
          await Promise.all([worker(),worker(),worker()]);
          if(token===generation)refresh();
        }catch(err){
          if(token===generation&&searchActive()){
            results.replaceChildren();
            const msg=document.createElement('p');msg.className='tex-search-none';
            msg.textContent=err.message||'Search unavailable';results.append(msg);
          }
        }
      }
      const schedule=()=>{
        clearTimeout(timer);refresh();
        if(searchActive())timer=setTimeout(()=>void indexAll(),180);
        else generation++;
      };
      // Intercept the legacy project-title-only search, which erased all
      // file/folder rows and replaced a valid query with an empty screen.
      input.addEventListener('input',e=>{
        if(searchActive())e.stopImmediatePropagation();
        schedule();
      },true);
      async function openResult(entry){
        const project=[...list.querySelectorAll(':scope > .tex-document-item[data-tex-document-id]')]
          .find(row=>row.dataset.texDocumentId===entry.projectId);
        if(!project)return;
        if(entry.type==='project'){project.click();return}
        const container=project.nextElementSibling;
        if(container?.hidden)project.querySelector('.tex-project-chevron')?.click();
        const selector=entry.type==='file'?'.tex-tree-file':'.tex-tree-folder';
        let item=null;
        for(let i=0;i<60;i++){
          item=[...list.querySelectorAll(selector)].find(row=>entry.type==='file'
            ?row.dataset.project===entry.projectId&&row.dataset.file===entry.name
            :row.dataset.projectId===entry.projectId&&row.dataset.projectFolder===entry.name);
          if(item)break;
          await new Promise(resolve=>setTimeout(resolve,60));
        }
        if(item){
          if(entry.type==='folder'){
            // The matched nested node exists even while ancestor groups are
            // collapsed. Reveal its full ancestry through the explorer's own
            // chevron handlers so expansion state is kept in sync.
            const ancestors=[];let parent=item.parentElement;
            while(parent&&parent!==list){
              if(parent.classList?.contains('tex-tree-folder-children')&&parent.hidden)
                ancestors.unshift(parent.previousElementSibling);
              parent=parent.parentElement;
            }
            for(const ancestor of ancestors)ancestor?.querySelector('.tex-project-chevron')?.click();
          }
          item.click();
        }
      }
      const getRowEntry=row=>{
        const projectRow=row.matches('.tex-document-item')?row:
          [...list.querySelectorAll(':scope > .tex-document-item[data-tex-document-id]')]
            .find(p=>p.dataset.texDocumentId===(row.dataset.project||row.dataset.projectId));
        const id=projectRow?.dataset.texDocumentId;if(!id)return null;
        const p=projects.find(p=>p.id===id)||{
          id,title:projectRow.querySelector('strong')?.textContent||'',created_at:null,updated_at:null
        };
        if(row.matches('.tex-document-item'))return projectEntry(p);
        const d=index.get(id);
        const type=row.matches('.tex-tree-file')?'file':'folder';
        const name=type==='file'?row.dataset.file:row.dataset.projectFolder;
        const file=d?.[type==='file'?'files':'folders']?.find(f=>f.name===name);
        return {type,id,projectId:id,projectTitle:p.title,name,
          created_at:file?.created_at||null,updated_at:file?.updated_at||null,
          size_bytes:file?.size_bytes??null};
      };
      list.addEventListener('pointerover',e=>{
        const row=e.target.closest('.tex-document-item,.tex-tree-file,.tex-tree-folder');
        if(!row)return;
        const entry=getRowEntry(row);if(!entry)return;
        row.title=info(entry);
        row.dataset.aertexMeta=info(entry);
        const p=projects.find(p=>p.id===entry.projectId);
        if(p&&!index.has(p.id)){
          void getIndex(p).then(()=>{
            if(row.isConnected){
              const updated=getRowEntry(row);
              if(updated){row.title=info(updated);row.dataset.aertexMeta=info(updated);}
            }
          }).catch(()=>{});
        }
      });
      document.addEventListener('aertex:tex-project-asset-selected',()=>{if(searchActive())refresh()});
      window.addEventListener('aertex:tex-file-updated',()=>{index.clear();listedAt=0; if(searchActive())schedule()});
      root.addEventListener('input',e=>{if(e.target.id==='tex-source'&&searchActive())refresh()},true);
      // Prime only the cheap project summaries. Full file bytes are loaded
      // lazily when search or a project tooltip actually needs them.
      void loadProjects().then(()=>{if(searchActive())refresh()}).catch(()=>{});
    })();
  `.replace('__ZH__', zh ? 'true':'false').replace('__OWNER__', JSON.stringify(String(ownerSlug||"account").replace(/[^A-Za-z0-9_.-]/g,"-").slice(0,48)));
  return String(markup||'').replace('</head>','<style id="aertex-tex-search-filter-css">'+css+'</style></head>')
    .replace('</body>','<script id="aertex-tex-search-filter-runtime">'+script+'</script></body>');
}
