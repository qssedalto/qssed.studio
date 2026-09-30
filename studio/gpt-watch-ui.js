export function intelligenceWatchStyles() {
  return String.raw`
.watchModelButton,.watchModelSheet,.sendGlyph{display:none}
@media (max-width:320px) and (max-height:520px),(max-width:260px){
  :root{--aertex-watch-topbar:44px;--aertex-watch-composer:48px}
  html,body{width:100%;max-width:100%;overflow:hidden}
  body{overscroll-behavior:none}
  .main{height:var(--aertex-visual-height,100dvh);min-height:0;overflow:hidden}
  .topbar{height:var(--aertex-watch-topbar);min-height:var(--aertex-watch-topbar);padding:4px 5px;gap:4px;border-bottom-color:color-mix(in srgb,var(--line) 72%,transparent)}
  .topbar .iconButton{width:34px;height:34px;min-width:34px;min-height:34px;border-radius:50%}
  .topbar .sidebarToggleGlyph,.topbar .composeGlyph{width:19px!important;height:19px!important}
  .topbarSpacer,.model,.account,.aertex-account-root{display:none!important}
  .watchModelButton{min-width:0;flex:1;display:flex;align-items:center;justify-content:center;height:34px;padding:0 9px;border:1px solid var(--line);border-radius:12px;background:var(--panel);color:var(--text);font:inherit;font-size:11px;font-weight:680;letter-spacing:-.01em;cursor:pointer}
  .watchModelButton:active{transform:scale(.97)}
  .watchModelLabel{display:block;min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .content{min-height:0;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
  .messages{width:calc(100% - 12px);padding:10px 0 62px}
  .empty{min-height:calc(var(--aertex-visual-height,100dvh) - 110px);padding:10px 6px}
  .empty h1{font-size:17px;line-height:1.15;letter-spacing:-.025em;margin-bottom:5px}
  .empty p{max-width:180px;font-size:10px;line-height:1.35}
  .msg{margin:0 0 14px;font-size:12px}
  .msg.user .bubble{max-width:88%;padding:8px 10px;border-radius:14px;line-height:1.4}
  .msg.assistant .bubble{line-height:1.52}
  .status{font-size:10px;margin-top:4px}
  .composerWrap,.app.sidebar-collapsed .composerWrap{left:0;padding:4px max(4px,env(safe-area-inset-right)) max(4px,env(safe-area-inset-bottom)) max(4px,env(safe-area-inset-left));background:linear-gradient(to top,var(--bg) 82%,transparent)}
  .composer{width:100%;margin:0;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:4px;padding:4px 4px 4px 8px;border-radius:15px;box-shadow:0 5px 20px rgba(0,0,0,.12)}
  textarea{min-height:34px;max-height:76px;padding:8px 4px 7px;font-size:12px;line-height:1.35}
  .composerFoot{margin:0;align-self:end}
  #sendButton{width:34px;height:34px;min-width:34px;min-height:34px;padding:0;border-radius:50%}
  .sendLabel{display:none}
  .sendGlyph{display:block;width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
  .sidebar{width:min(90vw,230px);padding:max(8px,env(safe-area-inset-top)) 8px max(8px,env(safe-area-inset-bottom));gap:8px}
  .sidebar .brand{font-size:16px;padding:5px 3px}.sidebar .brand small{font-size:9px;margin-top:2px}
  .sidebar .statusRow{font-size:10px;gap:6px}.sidebar .dot{width:7px;height:7px}
  .sideSectionTitle{font-size:9px;padding:5px 3px 1px}
  .chatLink{font-size:11px;padding:7px 6px}
  .chatAction{font-size:11px;padding:4px}
  .shareChoice{padding:6px}.shareChoiceCard{width:calc(100vw - 12px);max-height:calc(var(--aertex-visual-height,100dvh) - 12px);overflow:auto;padding:14px;border-radius:17px}.shareChoiceCard h2{font-size:16px}.shareChoiceCard p{font-size:11px;margin:6px 0 12px}.shareChoiceAction{min-height:36px;font-size:11px}
  .watchModelSheet{position:fixed;z-index:520;inset:0;display:flex;flex-direction:column;background:var(--bg);color:var(--text);padding:max(4px,env(safe-area-inset-top)) 5px max(4px,env(safe-area-inset-bottom))}
  .watchModelSheet[hidden]{display:none!important}
  .watchModelHeader{height:38px;display:grid;grid-template-columns:34px minmax(0,1fr) 34px;align-items:center;gap:3px}
  .watchModelClose{width:34px;height:34px;border:0;border-radius:50%;background:var(--panel2);color:var(--text);font:inherit;font-size:20px;line-height:1;cursor:pointer}
  .watchModelTitle{min-width:0;text-align:center;font-size:12px;font-weight:720;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .watchModelList{min-height:0;overflow:auto;display:grid;align-content:start;gap:4px;padding:4px 1px 2px;-webkit-overflow-scrolling:touch}
  .watchModelGroup{padding:7px 7px 2px;color:var(--muted);font-size:8px;font-weight:750;text-transform:uppercase;letter-spacing:.045em}
  .watchModelOption{position:relative;width:100%;min-height:39px;display:grid;gap:1px;align-content:center;padding:6px 24px 6px 9px;border:0;border-radius:12px;background:var(--panel);color:var(--text);text-align:left;font:inherit;cursor:pointer}
  .watchModelOption strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:700}
  .watchModelOption small{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted);font-size:8px}
  .watchModelOption[aria-checked="true"]::after{content:"✓";position:absolute;right:9px;top:50%;transform:translateY(-50%);font-size:12px;font-weight:800}
  .watchModelOption:disabled{opacity:.42}
}
@media (prefers-reduced-motion:reduce){.watchModelButton{transition:none!important}}
`;
}

export function intelligenceWatchMarkup(zh) {
  const title = zh ? "选择模型" : "Choose model";
  const close = zh ? "关闭模型选择" : "Close model picker";
  return `<button class="watchModelButton" id="watchModelButton" type="button" aria-haspopup="dialog" aria-controls="watchModelSheet"><span class="watchModelLabel" id="watchModelLabel">—</span></button>
<div class="watchModelSheet" id="watchModelSheet" role="dialog" aria-modal="true" aria-labelledby="watchModelTitle" hidden>
  <div class="watchModelHeader">
    <button class="watchModelClose" id="watchModelClose" type="button" aria-label="${close}">‹</button>
    <div class="watchModelTitle" id="watchModelTitle">${title}</div>
    <span aria-hidden="true"></span>
  </div>
  <div class="watchModelList" id="watchModelList" role="listbox"></div>
</div>`;
}

export function intelligenceWatchClientScript() {
  return String.raw`
  const tinyWatchMedia=window.matchMedia("(max-width:320px) and (max-height:520px), (max-width:260px)");
  const draftStoragePrefix="aertex-intelligence-draft-v1:";
  function isTinyWatch(){return tinyWatchMedia.matches}
  function composerDraftKey(){return draftStoragePrefix+(state.conversationId||"new")}
  function readComposerDraft(){
    const key=composerDraftKey();
    try{const value=sessionStorage.getItem(key);if(value!==null)return value}catch{}
    try{const value=localStorage.getItem(key);if(value!==null)return value}catch{}
    return "";
  }
  function persistComposerDraft(value){
    const key=composerDraftKey(),draft=String(value??$("composer")?.value??"");
    try{sessionStorage.setItem(key,draft)}catch{}
    try{localStorage.setItem(key,draft)}catch{}
  }
  function clearComposerDraft(){
    const key=composerDraftKey();
    try{sessionStorage.removeItem(key)}catch{}
    try{localStorage.removeItem(key)}catch{}
  }
  function resizeComposerInput(){
    const input=$("composer");if(!input)return;
    input.style.height="auto";
    const max=isTinyWatch()?76:180;
    input.style.height=Math.min(input.scrollHeight,max)+"px";
  }
  function restoreComposerDraft(){
    const input=$("composer");if(!input)return;
    const draft=readComposerDraft();
    if(draft!==input.value)input.value=draft;
    resizeComposerInput();
  }
  function syncWatchViewport(){
    if(!isTinyWatch()){document.documentElement.style.removeProperty("--aertex-visual-height");return}
    const viewport=window.visualViewport;
    const height=Math.max(1,Math.round(Number(viewport?.height)||window.innerHeight||1));
    document.documentElement.style.setProperty("--aertex-visual-height",height+"px");
  }
  function syncWatchModelButton(){
    const label=$("watchModelLabel"),select=$("modelSelect");if(!label||!select)return;
    const selected=select.selectedOptions?.[0];
    label.textContent=selected?.value||text.noModels;
    $("watchModelButton")?.toggleAttribute("disabled",!selected||selected.disabled);
  }
  function renderWatchModels(){
    const list=$("watchModelList"),select=$("modelSelect");if(!list||!select)return;
    list.replaceChildren();
    let currentGroup="";
    for(const option of [...select.options]){
      if(!option.value&&!option.dataset.providerId)continue;
      const group=option.parentElement?.tagName==="OPTGROUP"?(option.parentElement.label||""):"";
      if(group&&group!==currentGroup){
        currentGroup=group;
        const heading=document.createElement("div");heading.className="watchModelGroup";heading.textContent=group;list.appendChild(heading);
      }
      const button=document.createElement("button");
      button.className="watchModelOption";button.type="button";button.role="option";
      button.dataset.model=option.value||"";button.dataset.providerId=option.dataset.providerId||"";
      button.disabled=option.disabled;button.setAttribute("aria-checked",option.selected?"true":"false");
      const name=document.createElement("strong");name.textContent=option.value||option.textContent||text.noModels;
      const meta=document.createElement("small");meta.textContent=group;
      button.append(name,meta);list.appendChild(button);
    }
  }
  function openWatchModelSheet(){
    if(!isTinyWatch())return;
    renderWatchModels();
    const sheet=$("watchModelSheet");if(!sheet)return;
    sheet.hidden=false;document.body.classList.add("watch-model-open");
    syncWatchViewport();$("watchModelClose")?.focus();
  }
  function closeWatchModelSheet(){
    const sheet=$("watchModelSheet");if(!sheet)return;
    sheet.hidden=true;document.body.classList.remove("watch-model-open");$("watchModelButton")?.focus();
  }
  $("watchModelButton")?.addEventListener("click",openWatchModelSheet);
  $("watchModelClose")?.addEventListener("click",closeWatchModelSheet);
  $("watchModelList")?.addEventListener("click",event=>{
    const button=event.target.closest(".watchModelOption");if(!button||button.disabled)return;
    const select=$("modelSelect");
    const option=[...select.options].find(item=>item.value===button.dataset.model&&(item.dataset.providerId||"")===(button.dataset.providerId||""));
    if(!option)return;
    option.selected=true;select.dispatchEvent(new Event("change",{bubbles:true}));
    syncWatchModelButton();closeWatchModelSheet();
  });
  document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!$("watchModelSheet")?.hidden)closeWatchModelSheet()});
  tinyWatchMedia.addEventListener?.("change",()=>{syncWatchViewport();syncWatchModelButton();if(!isTinyWatch())closeWatchModelSheet()});
  window.visualViewport?.addEventListener("resize",syncWatchViewport);
  window.visualViewport?.addEventListener("scroll",syncWatchViewport);
  window.addEventListener("pagehide",()=>persistComposerDraft());
  window.addEventListener("pageshow",()=>{restoreComposerDraft();syncWatchViewport();syncWatchModelButton()});
  document.addEventListener("visibilitychange",()=>{
    if(document.visibilityState==="hidden")persistComposerDraft();
    else{restoreComposerDraft();syncWatchViewport();syncWatchModelButton()}
  });
`;
}
