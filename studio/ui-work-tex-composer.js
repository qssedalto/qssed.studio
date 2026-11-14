// ChatGPT-inspired welcome composer. Designed for the existing TeX Work app;
// does not introduce an unverified AI backend or bypass project-chat Passkeys.
const ICON = {
  plus: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4.5v15M4.5 12h15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  attach: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8.05 12.8 6.27-6.27a3.55 3.55 0 0 1 5.02 5.02l-8.38 8.38a5.42 5.42 0 0 1-7.67-7.67l8.4-8.4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  library: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 5.75h9.2c1.13 0 2.05.92 2.05 2.05v10.35c0 1.13-.92 2.05-2.05 2.05H8c-1.13 0-2.05-.92-2.05-2.05V7.8c0-1.13.92-2.05 2.05-2.05Z" fill="currentColor" opacity=".17"/><path d="M6.85 4.1h8.55M5.25 6.45h9.2M4.65 9.1V18c0 1.17.95 2.12 2.12 2.12h10.5c1.17 0 2.12-.95 2.12-2.12V8.2c0-1.17-.95-2.12-2.12-2.12H7.72c-1.7 0-3.07 1.37-3.07 3.02Z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.3" y="3.8" width="17.4" height="16.4" rx="3.3" fill="currentColor" opacity=".17"/><circle cx="8.5" cy="9" r="2" fill="currentColor"/><path d="m4.3 17.1 4.6-4.8c.69-.72 1.86-.7 2.52.03l2.2 2.43 2.1-2.05a1.8 1.8 0 0 1 2.56.02l2.05 2.1" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/><rect x="3.3" y="3.8" width="17.4" height="16.4" rx="3.3" stroke="currentColor" stroke-width="1.5"/></svg>',
  web: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.85"/><path d="M3.4 12h17.2M12 3c-2.56 2.35-4.03 5.5-4.03 9S9.44 18.65 12 21c2.56-2.35 4.03-5.5 4.03-9S14.56 5.35 12 3Z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6.75 9.3 5.25 5.35 5.25-5.35" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrow: '<svg class="qtex-send-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19.5V4.5m0 0-6.25 6.25M12 4.5l6.25 6.25" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  wave: '<svg class="qtex-send-wave" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 10v4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="9.2" y="3.2" width="5.6" height="12.1" rx="2.8" stroke="currentColor" stroke-width="1.8"/><path d="M6.5 11.7a5.5 5.5 0 0 0 11 0M12 17.4v3.2M8.8 20.6h6.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
};
const CSS = String.raw`
/* One compact task surface, rather than a second marketing hero. */
body.os-shell:has(.tex-work-app) .qtex-welcome {width:min(100%,1060px)!important;}
body.os-shell:has(.tex-work-app) .qtex-welcome-hero {
  min-height:clamp(136px,22vh,228px)!important;
  margin-bottom:4px!important;
}
body.os-shell:has(.tex-work-app) .qtex-welcome-copy {padding:38px 4px 0!important;}
body.os-shell:has(.tex-work-app) .qtex-welcome-copy p {display:none!important;}
body.os-shell:has(.tex-work-app) .qtex-composer,
body.os-shell:has(.tex-work-app) .qtex-composer * {box-sizing:border-box;}
body.os-shell:has(.tex-work-app) .qtex-composer {
  --qtex-composer-bg:color-mix(in srgb,var(--text) 9%,var(--work-card,var(--surface)));
  position:relative;width:min(100%,920px);
  margin:0 auto clamp(40px,7vh,72px);text-align:left;
  font:400 14px/1.5 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;
  color:var(--text);z-index:5;
}
:root[data-theme="dark"] body.os-shell:has(.tex-work-app) .qtex-composer {
  --qtex-composer-bg:color-mix(in srgb,white 11%,var(--work-card,var(--surface)));
}
body.os-shell:has(.tex-work-app) .qtex-composer-shell {
  position:relative;width:100%;border-radius:30px;
  padding:13px 13px 10px;
  background:var(--qtex-composer-bg);
  border:1px solid color-mix(in srgb,var(--text) 7%,transparent);
  box-shadow:0 1px 2px rgba(0,0,0,.025);
  transition:box-shadow .15s ease,border-color .15s ease;
}
body.os-shell:has(.tex-work-app) .qtex-composer-shell:focus-within {
  border-color:color-mix(in srgb,var(--primary) 34%,transparent);
  box-shadow:0 0 0 2px color-mix(in srgb,var(--primary) 8%,transparent);
}
body.os-shell:has(.tex-work-app) #qtex-composer-input {
  display:block!important;min-height:36px;max-height:180px;
  width:100%!important;resize:none!important;border:0!important;
  outline:none!important;background:transparent!important;box-shadow:none!important;
  color:var(--text)!important;
  padding:7px 13px 8px!important;margin:0!important;
  font:400 clamp(14px,1.25vw,16px)/1.5 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif!important;
  scrollbar-width:thin;overflow-y:auto;white-space:pre-wrap;
}
body.os-shell:has(.tex-work-app) #qtex-composer-input::placeholder {
  color:var(--muted)!important;opacity:.75;
}
body.os-shell:has(.tex-work-app) .qtex-composer-footer {
  display:flex;align-items:center;gap:6px;
  min-height:43px;margin-top:6px;
}
body.os-shell:has(.tex-work-app) .qtex-composer-spacer{flex:1 1 auto;min-width:5px}
body.os-shell:has(.tex-work-app) .qtex-composer button {
  appearance:none;border:none;outline:0;margin:0;
  -webkit-tap-highlight-color:transparent;
  cursor:pointer;font:inherit;color:var(--text);
}
body.os-shell:has(.tex-work-app) .qtex-composer svg {
  display:block;width:22px;height:22px;flex-shrink:0;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-plus-btn {
  position:relative;display:grid;place-items:center;
  width:41px;height:41px;padding:0!important;
  border-radius:999px;background:transparent;
  transition:background .14s ease,transform .14s ease;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-plus-btn svg{width:25px;height:25px}
body.os-shell:has(.tex-work-app) .qtex-plus-btn:hover,
body.os-shell:has(.tex-work-app) .qtex-plus-btn[aria-expanded="true"]{
  background:color-mix(in srgb,var(--text) 11%,transparent);
}
body.os-shell:has(.tex-work-app) .qtex-plus-tooltip {
  position:absolute;left:50%;bottom:calc(100% + 13px);
  transform:translate(-50%,5px);
  background:#262627;color:#fff;border:1px solid #474747;
  border-radius:999px;padding:7px 12px;white-space:nowrap;
  box-shadow:0 7px 19px rgba(0,0,0,.19);font-size:12px;line-height:1.2;
  opacity:0;visibility:hidden;pointer-events:none;
  transition:opacity .12s,transform .12s,visibility .12s;
}
body.os-shell:has(.tex-work-app) .qtex-plus-btn:hover .qtex-plus-tooltip,
body.os-shell:has(.tex-work-app) .qtex-plus-btn:focus-visible .qtex-plus-tooltip{
  opacity:1;visibility:visible;transform:translate(-50%,0);
}
body.os-shell:has(.tex-work-app) .qtex-plus-btn[aria-expanded="true"] .qtex-plus-tooltip{display:none}
body.os-shell:has(.tex-work-app) .qtex-target-btn {
  display:flex;align-items:center;gap:6px;
  min-width:0;max-width:min(270px,42%);
  padding:8px 10px!important;border-radius:12px;
  color:var(--muted)!important;background:transparent;
  white-space:nowrap;font-size:12px!important;
}
body.os-shell:has(.tex-work-app) .qtex-target-btn:hover,
body.os-shell:has(.tex-work-app) .qtex-target-btn[aria-expanded="true"]{
  color:var(--text)!important;background:color-mix(in srgb,var(--text) 7%,transparent)
}
body.os-shell:has(.tex-work-app) .qtex-target-btn>span{overflow:hidden;text-overflow:ellipsis}
body.os-shell:has(.tex-work-app) .qtex-target-btn svg{width:15px;height:15px;transition:transform .15s}
body.os-shell:has(.tex-work-app) .qtex-target-btn[aria-expanded="true"] svg{transform:rotate(180deg)}
body.os-shell:has(.tex-work-app) .qtex-voice-btn {
  width:37px;height:39px;display:grid;place-items:center;flex:0 0 37px;
  padding:0!important;border-radius:12px;background:transparent;
}
body.os-shell:has(.tex-work-app) .qtex-voice-btn:hover {
  background:color-mix(in srgb,var(--text) 8%,transparent);
}
body.os-shell:has(.tex-work-app) .qtex-voice-btn[aria-pressed="true"]{
  color:var(--primary)!important;
  background:color-mix(in srgb,var(--primary) 11%,transparent);
}
body.os-shell:has(.tex-work-app) .qtex-send-btn {
  width:41px;height:41px;padding:0!important;flex:0 0 41px;
  display:grid;place-items:center;border-radius:999px;
  color:#fff!important;background:var(--primary,#4875df)!important;
  transition:filter .15s ease,transform .15s ease;
}
body.os-shell:has(.tex-work-app) .qtex-send-btn:hover{filter:brightness(1.1)}
body.os-shell:has(.tex-work-app) .qtex-send-btn:active{transform:scale(.96)}
body.os-shell:has(.tex-work-app) .qtex-send-btn svg{width:21px;height:21px}
body.os-shell:has(.tex-work-app) .qtex-send-btn .qtex-send-arrow{display:none}
body.os-shell:has(.tex-work-app) .qtex-composer[data-has-draft="true"] .qtex-send-btn .qtex-send-arrow{display:block}
body.os-shell:has(.tex-work-app) .qtex-composer[data-has-draft="true"] .qtex-send-btn .qtex-send-wave{display:none}
body.os-shell:has(.tex-work-app) .qtex-composer button:focus-visible,
body.os-shell:has(.tex-work-app) .qtex-composer-menu button:focus-visible {
  outline:2px solid var(--primary)!important;outline-offset:2px!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer-menu[hidden],
body.os-shell:has(.tex-work-app) .qtex-composer-files[hidden],
body.os-shell:has(.tex-work-app) .qtex-composer-status[hidden] {display:none!important}
body.os-shell:has(.tex-work-app) .qtex-composer-menu {
  position:fixed;z-index:10120;
  width:min(355px,calc(100vw - 24px));
  max-height:min(430px,calc(100dvh - 30px));overflow-y:auto;
  padding:7px;background:var(--work-card,var(--surface));
  color:var(--text);border-radius:17px;
  border:1px solid var(--work-line,var(--border));
  box-shadow:0 14px 48px rgba(0,0,0,.22),0 3px 10px rgba(0,0,0,.07);
  scrollbar-width:thin;
}
body.os-shell:has(.tex-work-app) .qtex-composer-menu button {
  display:flex;align-items:center;gap:12px;
  width:100%;min-height:59px;border-radius:11px;
  padding:10px 11px!important;background:transparent;text-align:left;
  color:var(--text)!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer-menu button:hover,
body.os-shell:has(.tex-work-app) .qtex-composer-menu button:focus-visible{
  background:color-mix(in srgb,var(--text) 7%,var(--work-card,var(--surface)));
}
body.os-shell:has(.tex-work-app) .qtex-menu-icon {
  width:25px;height:25px;display:grid;place-items:center;flex:0 0 25px;
  color:var(--text);
}
body.os-shell:has(.tex-work-app) .qtex-menu-icon svg{width:22px;height:22px}
body.os-shell:has(.tex-work-app) .qtex-menu-copy{
  min-width:0;display:flex;flex-direction:column;gap:2px;
}
body.os-shell:has(.tex-work-app) .qtex-menu-copy strong{
  font:630 13px/1.38 Inter,ui-sans-serif,"Segoe UI","PingFang SC",sans-serif;
  color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
body.os-shell:has(.tex-work-app) .qtex-menu-copy small{
  font:420 11px/1.42 Inter,ui-sans-serif,"Segoe UI","PingFang SC",sans-serif;
  color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
body.os-shell:has(.tex-work-app) .qtex-target-section{
  color:var(--muted);font-size:11px;font-weight:600;
  padding:10px 13px 5px;
}
body.os-shell:has(.tex-work-app) .qtex-target-entry svg{
  width:20px;height:20px;flex:0 0 20px;color:var(--muted);
}
body.os-shell:has(.tex-work-app) .qtex-target-entry[aria-checked="true"] {
  background:color-mix(in srgb,var(--primary) 9%,var(--work-card,var(--surface)))!important;
}
body.os-shell:has(.tex-work-app) .qtex-target-empty {
  font-size:12px;color:var(--muted);padding:12px;
}
body.os-shell:has(.tex-work-app) .qtex-composer-files{
  display:flex;flex-wrap:wrap;gap:6px;padding:3px 10px 6px;
}
body.os-shell:has(.tex-work-app) .qtex-file-chip {
  display:inline-flex;align-items:center;gap:7px;max-width:100%;
  border-radius:10px;border:1px solid var(--work-line,var(--border));
  background:color-mix(in srgb,var(--text) 5%,transparent);
  color:var(--text);padding:5px 6px 5px 10px;font-size:11px;
}
body.os-shell:has(.tex-work-app) .qtex-file-chip>span{
  min-width:0;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
body.os-shell:has(.tex-work-app) .qtex-file-chip>button {
  display:grid;place-items:center;width:20px;height:20px;padding:0!important;
  border-radius:6px;background:transparent;
}
body.os-shell:has(.tex-work-app) .qtex-file-chip>button svg{width:14px;height:14px}
body.os-shell:has(.tex-work-app) .qtex-composer-status {
  margin:8px 9px 0;color:var(--muted);
  font:450 11px/1.45 ui-sans-serif,"Segoe UI","PingFang SC",sans-serif;
}
body.os-shell:has(.tex-work-app) .qtex-web-badge {
  display:flex;align-items:center;gap:7px;margin:0 10px 7px;
  color:var(--primary);font-size:11px;font-weight:600;
}
body.os-shell:has(.tex-work-app) .qtex-web-badge[hidden]{display:none!important}
body.os-shell:has(.tex-work-app) .qtex-web-badge svg{width:17px;height:17px}
@media(max-width:760px){
  body.os-shell:has(.tex-work-app) .qtex-welcome-hero{min-height:160px!important}
  body.os-shell:has(.tex-work-app) .qtex-composer{margin-bottom:34px;width:100%}
  body.os-shell:has(.tex-work-app) .qtex-composer-shell{padding:10px 7px 8px;border-radius:25px}
  body.os-shell:has(.tex-work-app) #qtex-composer-input{font-size:14px!important;padding:8px 13px!important}
  body.os-shell:has(.tex-work-app) .qtex-composer-footer{gap:2px}
  body.os-shell:has(.tex-work-app) .qtex-target-btn{max-width:46%;font-size:11px!important;padding:7px!important}
  body.os-shell:has(.tex-work-app) .qtex-voice-btn{flex-basis:32px;width:32px}
  body.os-shell:has(.tex-work-app) .qtex-voice-btn svg{width:19px;height:19px}
  body.os-shell:has(.tex-work-app) .qtex-send-btn{width:39px;height:39px;flex-basis:39px}
}
@media(prefers-reduced-motion:reduce){
  body.os-shell:has(.tex-work-app) .qtex-composer *{transition:none!important}
}
`;
const RUNTIME = String.raw`
(() => {
  const composer=document.getElementById('qtex-composer');
  if(!composer)return;
  const t=(cn,en)=>composer.dataset.locale==='zh'?cn:en;
  const input=document.getElementById('qtex-composer-input');
  const plus=document.getElementById('qtex-composer-plus');
  const target=document.getElementById('qtex-composer-target');
  const targetText=document.getElementById('qtex-composer-target-text');
  const send=document.getElementById('qtex-composer-send');
  const mic=document.getElementById('qtex-composer-mic');
  const actions=document.getElementById('qtex-composer-menu');
  const chooser=document.getElementById('qtex-composer-target-menu');
  const status=document.getElementById('qtex-composer-status');
  const fileInput=document.getElementById('qtex-composer-file');
  const filesBox=document.getElementById('qtex-composer-files');
  const webBadge=document.getElementById('qtex-composer-web-badge');
  const sidebar=document.getElementById('tex-document-list');
  const state={projectId:'',target:'',files:[],web:false,recognition:null};
  function notify(message){
    status.textContent=message||'';
    status.hidden=!message;
  }
  function adjustInput(){
    input.style.height='auto';
    input.style.height=Math.min(180,Math.max(36,input.scrollHeight))+'px';
    composer.dataset.hasDraft=String(Boolean(input.value.trim()||state.files.length));
    send.setAttribute('aria-label',input.value.trim()||state.files.length?t('继续','Continue'):t('语音输入','Voice input'));
  }
  function closeMenus(){
    actions.hidden=true;chooser.hidden=true;
    plus.setAttribute('aria-expanded','false');
    target.setAttribute('aria-expanded','false');
  }
  function positionMenu(menu,anchor){
    const rect=anchor.getBoundingClientRect();
    const vw=window.innerWidth,vh=window.visualViewport?.height||window.innerHeight;
    const width=Math.min(355,vw-24);
    const left=Math.max(12,Math.min(rect.left, vw-width-12));
    menu.style.width=width+'px';
    menu.style.left=left+'px';
    menu.style.top='12px';
    const height=Math.min(menu.scrollHeight,vh-24);
    const top=rect.top>=height+14?rect.top-height-10:Math.min(vh-height-12,rect.bottom+12);
    menu.style.top=Math.max(12,top)+'px';
  }
  function toggleMenu(menu,button){
    const opening=menu.hidden;
    closeMenus();
    if(opening){
      menu.hidden=false;button.setAttribute('aria-expanded','true');
      positionMenu(menu,button);
      menu.querySelector('button')?.focus();
    }else button.focus();
  }
  plus.addEventListener('click',()=>toggleMenu(actions,plus));
  target.addEventListener('click',()=>{
    renderTargets();toggleMenu(chooser,target);
  });
  document.addEventListener('pointerdown',e=>{
    if(!composer.contains(e.target)&&!actions.contains(e.target)&&!chooser.contains(e.target))closeMenus();
  },true);
  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape')return;
    if(!actions.hidden||!chooser.hidden){closeMenus();e.preventDefault();input.focus();}
  });
  const reposition=()=>{
    if(!actions.hidden)positionMenu(actions,plus);
    if(!chooser.hidden)positionMenu(chooser,target);
  };
  window.addEventListener('resize',reposition);
  window.addEventListener('scroll',reposition,true);
  window.visualViewport?.addEventListener('resize',reposition);
  function renderTargets(){
    chooser.replaceChildren();
    const makeButton=(label,description,id,kind)=>{
      const button=document.createElement('button');button.type='button';
      button.className='qtex-target-entry';button.setAttribute('role','menuitemradio');
      button.setAttribute('aria-checked',String(state.target===kind&&(!id||state.projectId===id)));
      const icon=document.createElement('span');icon.className='qtex-menu-icon';
      icon.innerHTML=kind==='chat'
        ?'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 5.5h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-5.7 3v-3.4A2 2 0 0 1 3 16.5v-9a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>'
        :'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4.2l2.1 2.3H18a2.5 2.5 0 0 1 2.5 2.5v8A2.7 2.7 0 0 1 17.8 20H6.2a2.7 2.7 0 0 1-2.7-2.7Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>';
      const copy=document.createElement('span');copy.className='qtex-menu-copy';
      const title=document.createElement('strong');title.textContent=label;
      const sub=document.createElement('small');sub.textContent=description;
      copy.append(title,sub);button.append(icon,copy);
      button.addEventListener('click',()=>{
        state.target=kind;state.projectId=id||'';
        targetText.textContent=label;
        closeMenus();input.focus();notify('');
      });
      chooser.append(button);
    };
    makeButton(t('聊天','Chat'),t('打开 AERTEX Chat','Open AERTEX Chat'),'','chat');
    const title=document.createElement('div');title.className='qtex-target-section';
    title.textContent=t('我的项目','My projects');chooser.append(title);
    const rows=sidebar?[...sidebar.querySelectorAll(':scope > .tex-document-item[data-tex-document-id]')]:[];
    if(!rows.length){
      const empty=document.createElement('div');empty.className='qtex-target-empty';
      empty.textContent=t('还没有项目，请先创建。','No projects yet. Create one first.');
      chooser.append(empty);
    }
    for(const row of rows){
      const id=row.dataset.texDocumentId;
      const label=(row.querySelector('strong')?.textContent||'').trim()||t('未命名项目','Untitled project');
      if(id)makeButton(label,t('在现有项目中继续','Continue in this TeX project'),id,'project');
    }
  }
  function renderFiles(){
    filesBox.replaceChildren();
    filesBox.hidden=!state.files.length;
    for(const file of state.files){
      const chip=document.createElement('span');chip.className='qtex-file-chip';
      const name=document.createElement('span');name.textContent=file.name;
      const remove=document.createElement('button');remove.type='button';
      remove.setAttribute('aria-label',t('移除 ','Remove ')+file.name);
      remove.innerHTML='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
      remove.addEventListener('click',()=>{
        state.files=state.files.filter(item=>item!==file);
        renderFiles();adjustInput();
      });
      chip.append(name,remove);filesBox.append(chip);
    }
  }
  function needsProject(){
    if(state.target==='project'&&state.projectId)return true;
    notify(t('请先选择一个项目。','Choose a project first.'));
    renderTargets();closeMenus();chooser.hidden=false;
    target.setAttribute('aria-expanded','true');positionMenu(chooser,target);
    return false;
  }
  function currentRow(){
    return sidebar?[...sidebar.querySelectorAll(':scope > .tex-document-item[data-tex-document-id]')]
      .find(row=>row.dataset.texDocumentId===state.projectId):null;
  }
  function launchFileDialog(kind){
    if(!needsProject())return;
    const row=currentRow();if(!row){notify(t('项目列表尚未加载。','Project list is not loaded.'));return;}
    row.click();
    let attempts=0;
    const poll=()=>{
      const context=window.__aertexFileGetContext?.();
      const ready=context?.document?.id===state.projectId&&typeof window.__aertexTexFileOpenDialog==='function';
      if(!ready&&attempts++<32)return window.setTimeout(poll,100);
      if(!ready)return notify(t('无法打开项目文件，请从左侧文件管理器重试。','Open the project file manager from the sidebar.'));
      window.__aertexTexFileOpenDialog();
      if(kind==='library'){
        document.getElementById('tex-file-tab-import')?.click();
        return;
      }
      if(state.files.length){
        const input=document.getElementById('tex-file-input');
        if(!input||typeof DataTransfer!=='function')return;
        const transfer=new DataTransfer();
        for(const file of state.files)transfer.items.add(file);
        input.files=transfer.files;
        input.dispatchEvent(new Event('change',{bubbles:true}));
        state.files=[];renderFiles();adjustInput();
        return;
      }
      const native=document.getElementById('tex-file-input');
      if(native){
        if(kind==='image') native.accept='.png,.jpg,.jpeg,.webp,.gif,.svg';
        native.click();
      }
    };
    poll();
  }
  actions.addEventListener('click',event=>{
    const action=event.target.closest('button[data-action]')?.dataset.action;
    if(!action)return;
    closeMenus();notify('');
    if(action==='file'||action==='image'){
      fileInput.accept=action==='image'?'image/png,image/jpeg,image/webp,image/gif,image/svg+xml':'';
      fileInput.click();
    }else if(action==='library'){
      launchFileDialog('library');
    }else if(action==='web'){
      state.web=!state.web;
      webBadge.hidden=!state.web;
      input.placeholder=state.web?t('搜索最新研究、论文或报告','Search recent papers, studies and reports'):t('输入问题或描述你的需求','Ask or describe what you need');
      input.focus();
    }
  });
  fileInput.addEventListener('change',()=>{
    const received=[...fileInput.files].slice(0,16);
    if(received.length){
      state.files=[...state.files,...received].slice(0,16);
      renderFiles();adjustInput();
      notify(t('文件已选择，发送前请选择项目；上传仍需确认。','Files selected. Choose a project; upload requires confirmation.'));
    }
    fileInput.value='';
  });
  const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
  function voice(){
    if(!Speech)return notify(t('当前浏览器不支持语音输入。','Voice input is unavailable in this browser.'));
    if(state.recognition){state.recognition.stop();return;}
    const recognition=new Speech();recognition.lang=t('zh-CN','en-US');
    recognition.continuous=false;recognition.interimResults=false;
    state.recognition=recognition;mic.setAttribute('aria-pressed','true');
    recognition.addEventListener('result',e=>{
      const speech=Array.from(e.results).map(r=>r[0]?.transcript||'').join(' ');
      input.value+=(input.value.trim()?' ':'')+speech;
      adjustInput();input.focus();
    });
    recognition.addEventListener('error',()=>notify(t('语音识别未完成，请检查浏览器麦克风权限。','Voice recognition failed. Check microphone permission.')));
    recognition.addEventListener('end',()=>{state.recognition=null;mic.setAttribute('aria-pressed','false');});
    try{recognition.start()}catch{state.recognition=null;mic.setAttribute('aria-pressed','false');}
  }
  mic.addEventListener('click',voice);
  async function submit(){
    const draft=input.value.trim();
    if(!draft&&!state.files.length)return voice();
    if(state.web&&draft){
      // Explicit user action: open normal search results; no fake AI-generated citations.
      window.open('https://www.google.com/search?q='+encodeURIComponent(draft),'_blank','noopener,noreferrer');
      return;
    }
    if(!state.target){
      notify(t('请选择项目或聊天。','Choose a project or chat.'));
      renderTargets();closeMenus();chooser.hidden=false;
      target.setAttribute('aria-expanded','true');positionMenu(chooser,target);
      return;
    }
    if(state.target==='chat'){
      if(draft){
        try{
          await navigator.clipboard.writeText(draft);
          notify(t('文本已复制，请在聊天窗口粘贴。不会自动发送。','Text copied. Paste it in Chat; nothing is auto-sent.'));
        }catch{notify(t('请复制输入内容后到聊天页面粘贴。','Copy your text into the Chat window.'))}
      }
      window.open('https://chat.qsseda.com/','_blank','noopener,noreferrer');
      return;
    }
    if(!needsProject())return;
    if(state.files.length){launchFileDialog('file');return;}
    const row=currentRow();if(!row)return notify(t('没有找到选中的项目。','Selected project not found.'));
    // Preserve the user's text without sending before dedicated Passkey verification.
    row.click();
    if(!draft)return;
    try{
      await navigator.clipboard.writeText(draft);
    }catch{}
    let attempts=0;
    const showChat=()=>{
      const active=window.__aertexFileGetContext?.();
      if(active?.document?.id!==state.projectId&&attempts++<32)return window.setTimeout(showChat,100);
      const chatButton=document.getElementById('tex-command-chat-shortcut');
      if(chatButton&&chatButton.getAttribute('aria-expanded')!=='true')chatButton.click();
      const field=document.getElementById('aertex-chat-input');
      if(field&&!field.disabled){
        field.value=draft;field.dispatchEvent(new Event('input',{bubbles:true}));field.focus();
      }else{
        const message=document.getElementById('tex-message');
        if(message){
          message.textContent=t('请先验证项目聊天 Passkey，再粘贴输入内容发送。','Verify the project chat Passkey, then paste your message.');
          message.hidden=false;
        }
      }
    };
    showChat();
  }
  send.addEventListener('click',()=>void submit());
  input.addEventListener('input',adjustInput);
  input.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){
      e.preventDefault();void submit();
    }
  });
  adjustInput();
})();
`;
export function enhanceWorkTexComposer(markup,zh=true){
  const source=String(markup||'');
  if(!source.includes('class="qtex-welcome"') || !source.includes('</body>'))return source;
  if(source.includes('id="qtex-composer"'))return source;
  const c=zh?{
    placeholder:'输入问题或描述你的需求',add:'添加文件等内容',target:'选择项目或聊天',
    file:'添加文件',fileDesc:'从计算机上传',
    library:'查找资料库',libraryDesc:'浏览并查看你的文件',
    image:'添加图像',imageDesc:'从计算机选择图片',
    web:'网页搜索',webDesc:'查找最新研究与报告',
    voice:'语音输入',send:'发送或继续'
  }:{
    placeholder:'Ask or describe what you need',add:'Add files and more',target:'Choose project or chat',
    file:'Add files',fileDesc:'Upload from computer',
    library:'Browse library',libraryDesc:'Browse your project files',
    image:'Add image',imageDesc:'Choose an image from your computer',
    web:'Web search',webDesc:'Find recent research and reports',
    voice:'Voice input',send:'Send or continue'
  };
  const item=(action,icon,title,detail)=>'<button type="button" role="menuitem" data-action="'+action+'"><span class="qtex-menu-icon">'+icon+'</span><span class="qtex-menu-copy"><strong>'+title+'</strong><small>'+detail+'</small></span></button>';
  const widget='<section id="qtex-composer" class="qtex-composer" data-locale="'+(zh?'zh':'en')+'" data-has-draft="false" aria-label="'+c.placeholder+'">'+
    '<div class="qtex-composer-shell">'+
      '<div id="qtex-composer-web-badge" class="qtex-web-badge" hidden>'+ICON.web+'<span>'+c.web+'</span></div>'+
      '<div id="qtex-composer-files" class="qtex-composer-files" hidden></div>'+
      '<textarea id="qtex-composer-input" rows="1" aria-label="'+c.placeholder+'" placeholder="'+c.placeholder+'" spellcheck="true"></textarea>'+
      '<div class="qtex-composer-footer">'+
        '<button id="qtex-composer-plus" class="qtex-plus-btn" type="button" aria-label="'+c.add+'" title="" aria-haspopup="menu" aria-expanded="false" aria-controls="qtex-composer-menu">'+ICON.plus+'<span class="qtex-plus-tooltip" aria-hidden="true">'+c.add+'</span></button>'+
        '<span class="qtex-composer-spacer"></span>'+
        '<button id="qtex-composer-target" type="button" class="qtex-target-btn" aria-haspopup="menu" aria-expanded="false" aria-controls="qtex-composer-target-menu"><span id="qtex-composer-target-text">'+c.target+'</span>'+ICON.chevron+'</button>'+
        '<button id="qtex-composer-mic" class="qtex-voice-btn" type="button" aria-label="'+c.voice+'" aria-pressed="false">'+ICON.mic+'</button>'+
        '<button id="qtex-composer-send" class="qtex-send-btn" type="button" aria-label="'+c.send+'">'+ICON.arrow+ICON.wave+'</button>'+
      '</div></div>'+
      '<p id="qtex-composer-status" class="qtex-composer-status" role="status" aria-live="polite" hidden></p>'+
      '<input id="qtex-composer-file" type="file" multiple hidden aria-hidden="true">'+
      '<div id="qtex-composer-menu" class="qtex-composer-menu" role="menu" aria-label="'+c.add+'" hidden>'+
        item('file',ICON.attach,c.file,c.fileDesc)+
        item('library',ICON.library,c.library,c.libraryDesc)+
        item('image',ICON.image,c.image,c.imageDesc)+
        item('web',ICON.web,c.web,c.webDesc)+
      '</div>'+
      '<div id="qtex-composer-target-menu" class="qtex-composer-menu" role="menu" aria-label="'+c.target+'" hidden></div>'+
    '</section>';
  const anchor='      </div>\n      <div class="qtex-templates">';
  if(!source.includes(anchor))return source;
  return source.replace(anchor,'      </div>\n'+widget+'\n      <div class="qtex-templates">')
    .replace('</body>','<style id="qtex-composer-style">'+CSS+'</style><script id="qtex-composer-runtime">'+RUNTIME+'</script></body>');
}
