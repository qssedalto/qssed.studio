// ChatGPT-inspired welcome composer. Designed for the existing TeX Work app;
// does not introduce an unverified AI backend or bypass project-chat Passkeys.
const ICON = {
  plus: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4.5v15M4.5 12h15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  attach: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.45 8.55v7.6a5.55 5.55 0 0 0 11.1 0V7.15a4 4 0 0 0-8 0v8.8a2.25 2.25 0 0 0 4.5 0v-7.4" stroke="#97999B" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  library: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9.25" y="2.15" width="12.2" height="15.7" rx="3.05" transform="rotate(17 9.25 2.15)" fill="#BFC0C1"/><rect x="3.05" y="7.4" width="15.2" height="15.2" rx="3.6" transform="rotate(-5 3.05 7.4)" fill="#DADBDD"/><path d="M9.1 6.95 15.1 13c.32.32.81.38 1.19.13l1.48-.99-.8-2.83-5.58-3.49-2.29 1.13Z" fill="#F1F1F1" opacity=".65"/></svg>',
  image: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="1.7" y="1.7" width="20.6" height="20.6" rx="4.6" fill="#43C7EE"/><circle cx="16.45" cy="8" r="3.35" fill="#FFF3CA"/><path d="M1.7 17.25 6.55 12.4c.89-.89 2.31-.91 3.22-.06L20.5 22.3H6.3a4.6 4.6 0 0 1-4.6-4.6v-.45Z" fill="#FFDE80"/></svg>',
  web: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.85" fill="#C8F0FB" stroke="#43C5F2" stroke-width="2.35"/><path d="M3.2 12h17.6M12 3.15c-2.6 2.35-4.05 5.55-4.05 8.85S9.4 18.5 12 20.85c2.6-2.35 4.05-5.55 4.05-8.85S14.6 5.5 12 3.15Z" stroke="#43C5F2" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6.75 9.3 5.25 5.35 5.25-5.35" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrow: '<svg class="qtex-send-arrow" aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M12 20V4m0 0-6.6 6.6M12 4l6.6 6.6" stroke="currentColor" stroke-width="1.95" stroke-linecap="round" stroke-linejoin="round"/></svg>',
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
body.os-shell:has(.tex-work-app) .qtex-send-btn {
  width:41px;height:41px;padding:0!important;flex:0 0 41px;
  display:grid;place-items:center;border-radius:999px;
  color:#fff!important;background:var(--primary,#4875df)!important;
  transition:filter .15s ease,transform .15s ease;
}
body.os-shell:has(.tex-work-app) .qtex-send-btn:hover{filter:brightness(1.1)}
body.os-shell:has(.tex-work-app) .qtex-send-btn:active{transform:scale(.96)}
body.os-shell:has(.tex-work-app) .qtex-send-btn svg{width:21px;height:21px}
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
  body.os-shell:has(.tex-work-app) .qtex-send-btn{width:39px;height:39px;flex-basis:39px}
}

/* ChatGPT-like compact single-line composer; keep all existing actions wired. */
body.os-shell:has(.tex-work-app) .qtex-welcome {
  width:min(100%,960px)!important;
}
body.os-shell:has(.tex-work-app) .qtex-welcome-hero {
  min-height:clamp(105px,17vh,170px)!important;
  margin-bottom:12px!important;
}
body.os-shell:has(.tex-work-app) .qtex-welcome-copy {
  padding:12px 4px 0!important;
}
body.os-shell:has(.tex-work-app) .qtex-welcome-copy h2 {
  font-size:clamp(25px,2.5vw,34px)!important;
  font-weight:550!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer {
  --qtex-composer-bg:var(--work-panel,var(--surface));
  width:min(100%,920px);
}
:root[data-theme="dark"] body.os-shell:has(.tex-work-app) .qtex-composer {
  --qtex-composer-bg:var(--work-panel,var(--surface));
}
body.os-shell:has(.tex-work-app) .qtex-composer-shell {
  min-height:62px;
  border-radius:999px;
  padding:5px 9px!important;
  background:var(--qtex-composer-bg)!important;
  border:1px solid color-mix(in srgb,var(--text) 10%,transparent)!important;
  box-shadow:0 3px 15px rgba(0,0,0,.045)!important;
  display:flex;
  align-items:center;
}
body.os-shell:has(.tex-work-app) #qtex-composer-input {
  flex:1 1 auto;
  min-width:0;
  min-height:40px;
  padding:8px 10px!important;
  font-size:15px!important;
  align-self:center;
}
body.os-shell:has(.tex-work-app) .qtex-composer-footer {
  display:contents;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-plus-btn {
  order:-1;
  flex:0 0 40px;
  width:40px;height:40px;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-plus-btn svg {width:24px;height:24px}
body.os-shell:has(.tex-work-app) .qtex-composer-spacer {display:none}
body.os-shell:has(.tex-work-app) .qtex-target-btn {
  flex:0 1 auto;max-width:200px;
}
body.os-shell:has(.tex-work-app) .qtex-send-btn {
  flex:0 0 44px;width:44px;height:44px;
}
body.os-shell:has(.tex-work-app) .qtex-web-badge,
body.os-shell:has(.tex-work-app) .qtex-composer-files {
  position:absolute;bottom:calc(100% + 8px);left:12px;
  max-width:calc(100% - 24px);
}
@media(max-width:760px){
  body.os-shell:has(.tex-work-app) .qtex-welcome-hero {
    min-height:120px!important;
  }
  body.os-shell:has(.tex-work-app) .qtex-welcome-copy h2 {
    font-size:clamp(23px,5vw,30px)!important;
  }
  body.os-shell:has(.tex-work-app) .qtex-composer-shell {
    min-height:58px;padding:5px 7px!important;border-radius:999px;
  }
  body.os-shell:has(.tex-work-app) #qtex-composer-input {
    padding:6px 5px!important;font-size:14px!important;
  }
  body.os-shell:has(.tex-work-app) .qtex-composer .qtex-plus-btn {
    flex-basis:34px;width:34px;height:34px;
  }
  body.os-shell:has(.tex-work-app) .qtex-target-btn {
    max-width:95px;padding:6px 4px!important;
  }
    body.os-shell:has(.tex-work-app) .qtex-send-btn {
    flex-basis:39px;width:39px;height:39px;
  }
}
@media(max-width:480px) {
  body.os-shell:has(.tex-work-app) .qtex-target-btn {max-width:35px}
  body.os-shell:has(.tex-work-app) .qtex-target-btn>span {display:none}
}

/* Compact, inline ChatGPT-style menu rows with ORIGINAL reference icon colors. */
body.os-shell:has(.tex-work-app) .qtex-welcome-hero{
  min-height:clamp(105px,17vh,160px)!important;margin-bottom:9px!important;
}
body.os-shell:has(.tex-work-app) .qtex-welcome-copy{padding:12px 4px 0!important}
body.os-shell:has(.tex-work-app) .qtex-composer{
  width:min(100%,920px);margin:0 auto clamp(22px,3.5vh,38px);
}
body.os-shell:has(.tex-work-app) .qtex-composer-shell{
  min-height:62px;border-radius:999px!important;padding:5px 9px!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-input{
  min-height:40px!important;padding:8px 10px!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer-footer{
  gap:5px!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-plus-btn{
  width:39px;height:39px;flex:0 0 39px;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-plus-btn svg{width:25px;height:25px}
body.os-shell:has(.tex-work-app) .qtex-target-btn{
  max-width:min(235px,60%);padding:7px 8px!important;
}
body.os-shell:has(.tex-work-app) .qtex-send-btn{
  width:41px;height:41px;flex:0 0 41px;
  color:#fff!important;
}
body.os-shell:has(.tex-work-app) .qtex-send-btn .qtex-send-arrow{
  width:23px;height:23px;display:block!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer-menu{
  padding:5px;border-radius:16px;max-height:min(350px,calc(100dvh - 24px));
}
body.os-shell:has(.tex-work-app) .qtex-composer-menu button{
  min-height:47px!important;gap:10px!important;padding:8px 10px!important;
  border-radius:10px!important;
}
body.os-shell:has(.tex-work-app) .qtex-menu-icon{
  width:26px!important;height:26px!important;flex:0 0 26px!important;
}
body.os-shell:has(.tex-work-app) .qtex-menu-icon svg{width:24px!important;height:24px!important}
body.os-shell:has(.tex-work-app) #qtex-composer-menu .qtex-menu-copy{
  flex:1 1 auto;display:flex;flex-direction:row!important;
  align-items:baseline!important;gap:9px!important;white-space:nowrap!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-menu .qtex-menu-copy strong{
  font-size:13px!important;font-weight:630!important;
  flex:0 0 auto;line-height:1.45;
}
body.os-shell:has(.tex-work-app) #qtex-composer-menu .qtex-menu-copy small{
  font-size:11px!important;line-height:1.45!important;flex:0 1 auto;
  overflow:hidden;text-overflow:ellipsis;
}
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu button{
  min-height:50px!important;padding:7px 11px!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu .qtex-menu-copy{
  flex-direction:column!important;gap:1px!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu .qtex-menu-copy strong{font-size:13px!important}
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu .qtex-menu-copy small{font-size:11px!important}
body.os-shell:has(.tex-work-app) .qtex-target-section{padding:7px 12px 3px!important}
body.os-shell:has(.tex-work-app) .qtex-composer-menu button:hover{
  background:color-mix(in srgb,var(--text) 7%,var(--work-card,var(--surface)));
}
@media(max-width:760px){
 body.os-shell:has(.tex-work-app) .qtex-welcome-hero{min-height:120px!important}
 body.os-shell:has(.tex-work-app) .qtex-composer-shell{min-height:58px;padding:5px 7px!important;border-radius:999px!important}
 body.os-shell:has(.tex-work-app) .qtex-target-btn{max-width:65%;padding:6px 7px!important}
 body.os-shell:has(.tex-work-app) .qtex-composer-menu{border-radius:15px}
}


/* Final reference-geometry contract: compact rows, no pointer focus halo. */
body.os-shell:has(.tex-work-app) .qtex-composer-shell:focus-within{
  border-color:color-mix(in srgb,var(--text) 10%,transparent)!important;
  box-shadow:0 3px 15px rgba(0,0,0,.045)!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-target-btn{
  flex:0 1 auto!important;display:inline-flex!important;align-items:center!important;
  justify-content:center!important;gap:5px!important;
  width:auto!important;min-width:0!important;max-width:min(185px,38vw)!important;
  height:36px!important;min-height:0!important;
  padding:0 7px!important;margin:0!important;
  border:0!important;border-radius:10px!important;
  background:transparent!important;box-shadow:none!important;
  color:var(--muted)!important;font:400 12px/1.2 Inter,ui-sans-serif,"PingFang SC","Microsoft YaHei",sans-serif!important;
  white-space:nowrap!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-target-btn:hover{
  background:color-mix(in srgb,var(--text) 5%,transparent)!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-target-btn[aria-expanded="true"]{
  background:transparent!important;color:var(--text)!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-target-btn>span{
  flex:0 1 auto!important;max-width:100%;overflow:hidden;text-overflow:ellipsis;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-target-btn svg{
  width:15px!important;height:15px!important;flex:0 0 15px!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-send-btn{
  flex:0 0 44px!important;width:44px!important;height:44px!important;
  min-width:44px!important;max-width:44px!important;
  min-height:44px!important;max-height:44px!important;
  aspect-ratio:1/1!important;box-sizing:border-box!important;
  display:grid!important;place-items:center!important;
  padding:0!important;margin:0!important;border:0!important;
  border-radius:50%!important;
  background:var(--primary,#4875df)!important;color:#fff!important;
  box-shadow:none!important;transform:none;opacity:1!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-send-btn[disabled]{
  background:color-mix(in srgb,var(--text) 17%,var(--qtex-composer-bg))!important;
  color:color-mix(in srgb,var(--text) 50%,var(--qtex-composer-bg))!important;
  cursor:default!important;filter:none!important;opacity:1!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-send-btn[disabled]:hover,
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-send-btn[disabled]:active{
  filter:none!important;transform:none!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-send-btn svg{
  width:23px!important;height:23px!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-menu{
  max-width:calc(100vw - 24px);border-radius:16px!important;
  padding:5px!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-menu button{
  min-height:41px!important;height:auto!important;
  padding:7px 9px!important;gap:10px!important;
  border-radius:9px!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-menu .qtex-menu-copy{
  flex:1 1 auto!important;display:flex!important;flex-direction:row!important;
  align-items:center!important;gap:9px!important;min-width:0!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-menu .qtex-menu-copy strong{
  font:550 13px/1.25 Inter,ui-sans-serif,"PingFang SC","Microsoft YaHei",sans-serif!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-menu .qtex-menu-copy small{
  font:400 11px/1.25 Inter,ui-sans-serif,"PingFang SC","Microsoft YaHei",sans-serif!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-menu .qtex-menu-icon,
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu .qtex-menu-icon{
  width:24px!important;height:24px!important;flex:0 0 24px!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-menu .qtex-menu-icon svg,
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu .qtex-menu-icon svg{
  width:22px!important;height:22px!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu{
  border-radius:16px!important;padding:5px!important;
  max-width:calc(100vw - 24px);
}
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu button{
  min-height:46px!important;padding:6px 10px!important;gap:10px!important;
  border-radius:9px!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu .qtex-menu-copy{
  gap:0!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu .qtex-menu-copy strong{
  font:570 13px/1.3 Inter,ui-sans-serif,"PingFang SC","Microsoft YaHei",sans-serif!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu .qtex-menu-copy small{
  font:400 11px/1.35 Inter,ui-sans-serif,"PingFang SC","Microsoft YaHei",sans-serif!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu .qtex-target-section{
  padding:6px 11px 3px!important;font-size:11px!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer button:focus,
body.os-shell:has(.tex-work-app) .qtex-composer button:focus-visible,
body.os-shell:has(.tex-work-app) .qtex-composer-menu button:focus,
body.os-shell:has(.tex-work-app) .qtex-composer-menu button:focus-visible{
  outline:0!important;outline-offset:0!important;box-shadow:none!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer[data-keyboard-nav="true"] button:focus-visible{
  outline:2px solid var(--primary)!important;outline-offset:2px!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer-menu button:hover{
  background:color-mix(in srgb,var(--text) 5%,var(--work-card,var(--surface)))!important;
}
@media(max-width:760px){
  body.os-shell:has(.tex-work-app) .qtex-composer .qtex-send-btn{
    width:39px!important;height:39px!important;min-width:39px!important;
    max-width:39px!important;min-height:39px!important;max-height:39px!important;
    flex:0 0 39px!important;
  }
  body.os-shell:has(.tex-work-app) .qtex-composer .qtex-target-btn{
    max-width:min(145px,35vw)!important;height:34px!important;
    padding:0 5px!important;font-size:11px!important;
  }
  body.os-shell:has(.tex-work-app) #qtex-composer-menu button{min-height:39px!important;padding:6px 8px!important;}
}
@media(max-width:480px){
  body.os-shell:has(.tex-work-app) .qtex-composer .qtex-target-btn{
    max-width:min(132px,34vw)!important;
  }
  body.os-shell:has(.tex-work-app) .qtex-composer .qtex-target-btn>span{
    display:block!important;
  }
}


/* Dense, single-line context picker: do not mirror the tall project cards. */
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu{
  width:min(264px,calc(100vw - 24px))!important;
  max-width:calc(100vw - 24px)!important;
  padding:6px!important;border-radius:14px!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu .qtex-target-entry{
  display:grid!important;grid-template-columns:22px minmax(0,1fr) 15px!important;
  justify-content:stretch!important;align-items:center!important;
  width:100%!important;height:42px!important;min-height:42px!important;
  max-height:42px!important;
  padding:0 10px!important;margin:0!important;gap:10px!important;
  border-radius:9px!important;text-align:left!important;
  background:transparent!important;box-shadow:none!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu .qtex-target-entry:hover{
  background:color-mix(in srgb,var(--text) 5%,var(--work-card,var(--surface)))!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu .qtex-target-entry[aria-checked="true"]{
  background:transparent!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu .qtex-target-entry[aria-checked="true"]:hover{
  background:color-mix(in srgb,var(--text) 5%,var(--work-card,var(--surface)))!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu .qtex-target-entry::after{
  content:"";width:13px;height:13px;display:block;justify-self:center;
}
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu .qtex-target-entry[aria-checked="true"]::after{
  content:"✓";font:600 13px/1.1 ui-sans-serif,"Segoe UI",sans-serif;
  color:var(--primary);
}
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu .qtex-menu-icon{
  display:grid!important;place-items:center!important;
  width:22px!important;height:22px!important;
  min-width:22px!important;max-width:22px!important;
  color:var(--muted)!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu .qtex-menu-icon svg{
  width:20px!important;height:20px!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu .qtex-menu-copy{
  display:block!important;min-width:0!important;max-width:100%!important;
  overflow:hidden!important;white-space:nowrap!important;text-overflow:ellipsis!important;
  text-align:left!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu .qtex-menu-copy strong{
  display:block!important;overflow:hidden!important;
  white-space:nowrap!important;text-overflow:ellipsis!important;
  font:560 13px/1.4 Inter,ui-sans-serif,"PingFang SC","Microsoft YaHei",sans-serif!important;
  color:var(--text)!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu .qtex-menu-copy small{display:none!important}
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu .qtex-target-section{
  display:flex!important;align-items:center!important;
  height:28px!important;min-height:28px!important;
  margin:4px 1px 1px!important;padding:5px 11px 3px!important;
  border-top:1px solid var(--work-line,var(--border))!important;
  font:500 11px/1.2 Inter,ui-sans-serif,"PingFang SC","Microsoft YaHei",sans-serif!important;
  color:var(--muted)!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu button:focus,
body.os-shell:has(.tex-work-app) #qtex-composer-target-menu button:focus-visible{
  outline:none!important;box-shadow:none!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer[data-keyboard-nav="true"] #qtex-composer-target-menu button:focus-visible{
  outline:2px solid var(--primary)!important;outline-offset:-2px!important;
}
@media(max-width:480px){
  body.os-shell:has(.tex-work-app) #qtex-composer-target-menu{
    width:min(254px,calc(100vw - 20px))!important;
  }
  body.os-shell:has(.tex-work-app) #qtex-composer-target-menu .qtex-target-entry{
    height:40px!important;min-height:40px!important;max-height:40px!important;
  }
}


/* GPT reference dimensions: a short centered pill that grows ONLY for wrapped text. */
body.os-shell:has(.tex-work-app) .qtex-composer{
  width:min(100%,720px)!important;
  max-width:100%!important;
  margin:0 auto clamp(20px,3.5vh,36px)!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-composer-shell{
  display:flex!important;align-items:center!important;
  flex-wrap:nowrap!important;gap:3px!important;
  width:100%!important;min-height:54px!important;
  height:54px!important;max-height:none!important;
  padding:5px 7px!important;border-radius:999px!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-composer-footer{
  display:contents!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer #qtex-composer-input{
  flex:1 1 0%!important;align-self:center!important;
  display:block!important;width:0!important;min-width:0!important;
  min-height:34px!important;max-height:160px!important;
  margin:0!important;padding:6px 8px!important;
  font-size:15px!important;line-height:22px!important;
  overflow-x:hidden!important;overflow-y:auto!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-plus-btn{
  order:-1!important;flex:0 0 36px!important;
  width:36px!important;height:36px!important;
  min-width:36px!important;max-width:36px!important;
  padding:0!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-plus-btn svg{
  width:23px!important;height:23px!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-target-btn{
  flex:0 0 auto!important;width:auto!important;
  min-width:0!important;max-width:min(176px,42vw)!important;
  height:32px!important;min-height:32px!important;
  padding:0 9px!important;gap:5px!important;
  white-space:nowrap!important;border-radius:999px!important;
  background:color-mix(in srgb,var(--text) 5%,transparent)!important;
  color:var(--muted)!important;
  font-size:12px!important;line-height:1.3!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-target-btn:hover,
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-target-btn[aria-expanded="true"]{
  background:color-mix(in srgb,var(--text) 9%,transparent)!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-target-btn>span{
  display:block!important;flex:0 1 auto!important;
  min-width:0!important;max-width:100%!important;
  overflow:hidden!important;text-overflow:ellipsis!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-target-btn svg{
  flex:0 0 14px!important;width:14px!important;height:14px!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-send-btn{
  flex:0 0 40px!important;width:40px!important;height:40px!important;
  min-width:40px!important;max-width:40px!important;
  min-height:40px!important;max-height:40px!important;
  aspect-ratio:1/1!important;border-radius:50%!important;
  margin:0!important;padding:0!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-send-btn svg{
  width:21px!important;height:21px!important;
}
/* When a message wraps, promote the input into a full-width first row, as in GPT. */
body.os-shell:has(.tex-work-app) .qtex-composer[data-multiline="true"] .qtex-composer-shell{
  display:grid!important;
  grid-template-columns:36px minmax(0,1fr) auto 40px!important;
  grid-template-rows:auto 40px!important;
  column-gap:5px!important;row-gap:3px!important;
  height:auto!important;min-height:92px!important;
  padding:8px 9px 7px!important;border-radius:26px!important;
  align-items:end!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer[data-multiline="true"] #qtex-composer-input{
  grid-column:1/-1!important;grid-row:1!important;
  width:100%!important;min-height:34px!important;
  align-self:start!important;padding:4px 7px!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer[data-multiline="true"] .qtex-plus-btn{
  grid-column:1!important;grid-row:2!important;order:0!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer[data-multiline="true"] .qtex-target-btn{
  grid-column:3!important;grid-row:2!important;
  align-self:center!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer[data-multiline="true"] .qtex-send-btn{
  grid-column:4!important;grid-row:2!important;
}
@media(max-width:760px){
  body.os-shell:has(.tex-work-app) .qtex-composer{
    width:min(100%,720px)!important;
  }
  body.os-shell:has(.tex-work-app) .qtex-composer .qtex-composer-shell{
    height:52px!important;min-height:52px!important;
    padding:5px 6px!important;gap:1px!important;
  }
  body.os-shell:has(.tex-work-app) .qtex-composer #qtex-composer-input{
    font-size:14px!important;padding:6px 6px!important;
  }
  body.os-shell:has(.tex-work-app) .qtex-composer .qtex-plus-btn{
    width:34px!important;height:34px!important;
    flex-basis:34px!important;min-width:34px!important;max-width:34px!important;
  }
  body.os-shell:has(.tex-work-app) .qtex-composer .qtex-send-btn{
    flex-basis:38px!important;width:38px!important;height:38px!important;
    min-width:38px!important;max-width:38px!important;
    min-height:38px!important;max-height:38px!important;
  }
  body.os-shell:has(.tex-work-app) .qtex-composer .qtex-target-btn{
    width:auto!important;min-width:0!important;
    max-width:min(162px,46vw)!important;
    font-size:11px!important;height:30px!important;
    padding:0 6px!important;gap:3px!important;
  }
  body.os-shell:has(.tex-work-app) .qtex-composer[data-multiline="true"] .qtex-composer-shell{
    height:auto!important;min-height:88px!important;
    grid-template-columns:34px minmax(0,1fr) auto 38px!important;
    grid-template-rows:auto 38px!important;
  }
}


/* Hover/press cleanup: avoid inherited minimum button height turning + into an oval.
 * Neither an opened popover nor a previously clicked control paints a sticky halo. */
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-plus-btn{
  box-sizing:border-box!important;
  flex:0 0 36px!important;
  width:36px!important;height:36px!important;
  min-width:36px!important;max-width:36px!important;
  min-height:36px!important;max-height:36px!important;
  aspect-ratio:1/1!important;
  align-self:center!important;
  display:grid!important;place-items:center!important;
  margin:0!important;padding:0!important;
  border:0!important;border-radius:50%!important;
  background:transparent!important;box-shadow:none!important;
  outline:0!important;transform:none!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-plus-btn:hover{
  background:color-mix(in srgb,var(--text) 9%,transparent)!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-plus-btn[aria-expanded="true"]:not(:hover){
  background:transparent!important;
}
/* ID-scoped background-color overrides generic Work button/focus rules. */
body.os-shell:has(.tex-work-app) #qtex-composer #qtex-composer-plus,
body.os-shell:has(.tex-work-app) #qtex-composer #qtex-composer-plus:focus,
body.os-shell:has(.tex-work-app) #qtex-composer #qtex-composer-plus[aria-expanded="true"]:not(:hover){
  background-color:transparent!important;
  background-image:none!important;
  box-shadow:none!important;
}
body.os-shell:has(.tex-work-app) #qtex-composer #qtex-composer-plus:hover{
  background-color:color-mix(in srgb,var(--text) 9%,transparent)!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-target-btn,
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-target-btn[aria-expanded="true"],
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-target-btn:focus,
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-target-btn:focus-visible{
  background:transparent!important;
  border-color:transparent!important;
  box-shadow:none!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer .qtex-target-btn:hover{
  background:color-mix(in srgb,var(--text) 6%,transparent)!important;
}
body.os-shell:has(.tex-work-app) .qtex-composer-shell:focus-within{
  border-color:color-mix(in srgb,var(--text) 10%,transparent)!important;
  box-shadow:0 3px 15px rgba(0,0,0,.045)!important;
}
@media(max-width:760px){
  body.os-shell:has(.tex-work-app) .qtex-composer .qtex-plus-btn{
    flex:0 0 34px!important;
    width:34px!important;height:34px!important;
    min-width:34px!important;max-width:34px!important;
    min-height:34px!important;max-height:34px!important;
  }
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
  const actions=document.getElementById('qtex-composer-menu');
  const chooser=document.getElementById('qtex-composer-target-menu');
  const status=document.getElementById('qtex-composer-status');
  const fileInput=document.getElementById('qtex-composer-file');
  const filesBox=document.getElementById('qtex-composer-files');
  const webBadge=document.getElementById('qtex-composer-web-badge');
  const sidebar=document.getElementById('tex-document-list');
  const state={projectId:'',target:'',files:[],web:false};
  function notify(message){
    status.textContent=message||'';
    status.hidden=!message;
  }
  function adjustInput(){
    // Empty, one-line input stays a compact pill regardless of placeholder length.
    // Only actual wrapped/newline text promotes the composer to a taller grid.
    composer.dataset.multiline='false';
    input.style.height='34px';
    const hasText=Boolean(input.value.trim());
    const style=getComputedStyle(input);
    const lineHeight=parseFloat(style.lineHeight)||22;
    const verticalPadding=(parseFloat(style.paddingTop)||0)+(parseFloat(style.paddingBottom)||0);
    const multiline=Boolean(input.value)&&(
      /\n/.test(input.value)||input.scrollHeight>lineHeight+verticalPadding+3
    );
    composer.dataset.multiline=String(multiline);
    if(!input.value){
      // Wrapped placeholder text must never enlarge an otherwise empty pill.
      input.style.height='34px';
    }else{
      input.style.height='auto';
      input.style.height=Math.min(160,Math.max(34,input.scrollHeight))+'px';
    }
    composer.dataset.hasDraft=String(hasText);
    send.disabled=!hasText;
    send.setAttribute('aria-disabled',String(!hasText));
    send.setAttribute('aria-label',hasText?t('发送或继续','Send or continue'):t('请输入文字后发送','Type a message to enable send'));
  }
  function closeMenus(){
    actions.hidden=true;chooser.hidden=true;
    plus.setAttribute('aria-expanded','false');
    target.setAttribute('aria-expanded','false');
  }
  function positionMenu(menu,anchor){
    const rect=anchor.getBoundingClientRect();
    const vw=window.innerWidth,vh=window.visualViewport?.height||window.innerHeight;
    const width=Math.min(menu===actions?312:264,vw-24);
    const suggestedLeft=menu===chooser?rect.right-width:rect.left;
    const left=Math.max(12,Math.min(suggestedLeft,vw-width-12));
    menu.style.width=width+'px';
    menu.style.left=left+'px';
    menu.style.top='12px';
    const height=Math.min(menu.scrollHeight,vh-24);
    const top=rect.top>=height+14?rect.top-height-10:Math.min(vh-height-12,rect.bottom+12);
    menu.style.top=Math.max(12,top)+'px';
  }
  // Pointer-opened menus should not show an accidental first-row focus ring.
  // Keyboard-opened menus still move focus to the first actionable item.
  let openedWithKeyboard=false;
  document.addEventListener('keydown',e=>{
    if(e.key==='Tab'||e.key==='Enter'||e.key===' '||e.key.startsWith('Arrow')){
      openedWithKeyboard=true;
      composer.dataset.keyboardNav='true';
    }
  },true);
  document.addEventListener('pointerdown',()=>{
    openedWithKeyboard=false;
    composer.dataset.keyboardNav='false';
  },true);
  function toggleMenu(menu,button){
    const opening=menu.hidden;
    closeMenus();
    if(opening){
      menu.hidden=false;button.setAttribute('aria-expanded','true');
      positionMenu(menu,button);
      if(openedWithKeyboard)menu.querySelector('button')?.focus();
    }else if(openedWithKeyboard)button.focus();
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
      // The former two-line descriptions caused giant, uneven rows and
      // a fragmented miniature AERTEX wordmark; keep them accessible only.
      button.setAttribute('aria-label',description?label+'，'+description:label);
      copy.append(title);button.append(icon,copy);
      button.addEventListener('click',()=>{
        state.target=kind;state.projectId=id||'';
        targetText.textContent=label;
        closeMenus();input.focus();notify('');
      });
      chooser.append(button);
    };
    makeButton(t('聊天','Chat'),t('打开聊天','Open chat'),'','chat');
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
  async function submit(){
    const draft=input.value.trim();
    if(!draft&&!state.files.length){input.focus();return;}
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
      // Open during the user's click activation, before awaiting clipboard IO.
      window.open('https://chat.qsseda.com/','_blank','noopener,noreferrer');
      if(draft){
        try{
          await navigator.clipboard.writeText(draft);
          notify(t('文本已复制，请在聊天窗口粘贴。不会自动发送。','Text copied. Paste it in Chat; nothing is auto-sent.'));
        }catch{notify(t('请复制输入内容后到聊天页面粘贴。','Copy your text into the Chat window.'))}
      }
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
  send.addEventListener('click',()=>{if(!send.disabled)void submit();});
  input.addEventListener('input',adjustInput);
  window.addEventListener('resize',adjustInput);
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
    file:'添加照片和文件',fileDesc:'从计算机上传',
    library:'从资料库添加',libraryDesc:'浏览并搜索你的文件',
    image:'添加图像',imageDesc:'从计算机选择图片',
    web:'网页搜索',webDesc:'查找实时新闻和信息',
    send:'发送或继续'
  }:{
    placeholder:'Ask or describe what you need',add:'Add files and more',target:'Choose project or chat',
    file:'Add files',fileDesc:'Upload from computer',
    library:'Browse library',libraryDesc:'Browse your project files',
    image:'Add image',imageDesc:'Choose an image from your computer',
    web:'Web search',webDesc:'Find recent research and reports',
    send:'Send or continue'
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
        '<button id="qtex-composer-send" class="qtex-send-btn" type="button" aria-label="'+c.send+'" aria-disabled="true" disabled>'+ICON.arrow+'</button>'+
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
