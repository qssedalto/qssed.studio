// Single-source welcome page presentation. Uses its own qtex classes so
// legacy TeX editor/preview selectors cannot resize or duplicate elements.
export function polishWorkTexWelcome(markup) {
  const source = String(markup || "");
  if (!source.includes('class="qtex-welcome"') || !source.includes("</body>")) return source;
  const style = `<style id="qsseda-work-tex-welcome-clean">

body.os-shell:has(.tex-work-app) .tex-editor-placeholder:has(.qtex-welcome){
  display:flex!important;
  flex-direction:column!important;
  justify-content:flex-start!important;
  align-items:center!important;
  gap:12px!important;
  width:100%!important;
  height:100%!important;
  min-height:0!important;
  overflow-x:hidden!important;
  overflow-y:auto!important;
  padding:clamp(35px,6vh,88px) clamp(20px,3.2vw,56px) 40px!important;
  background:var(--work-panel)!important;
  text-align:left!important;
  container:qtex / inline-size;
}
body.os-shell:has(.tex-work-app) .qtex-welcome,
body.os-shell:has(.tex-work-app) .qtex-welcome *{
  box-sizing:border-box;
}
body.os-shell:has(.tex-work-app) .qtex-welcome{
  width:min(100%,1020px);
  min-width:0;
  flex:0 0 auto;
  display:grid;
  gap:clamp(20px,2.2vw,29px);
  color:var(--text);
  font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;
  font-feature-settings:"ss01" on;
  -webkit-font-smoothing:antialiased;
  text-align:left;
}
body.os-shell:has(.tex-work-app) .qtex-welcome-bar{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
  padding-bottom:15px;
  border-bottom:1px solid var(--work-line);
  font:700 10px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace;
  letter-spacing:.12em;
  color:var(--muted);
}
body.os-shell:has(.tex-work-app) .qtex-welcome-brand{
  display:inline-flex;
  align-items:center;
  gap:8px;
  white-space:nowrap;
  color:var(--text);
}
body.os-shell:has(.tex-work-app) .qtex-welcome-brand i{
  display:inline-block;
  width:9px;height:9px;
  flex:0 0 9px;
  border-radius:2px;
  background:#cbf476;
  box-shadow:12px 0 0 #a9c6ff;
  margin-right:13px;
  transform:rotate(-9deg);
}
body.os-shell:has(.tex-work-app) .qtex-welcome-brand>span{color:var(--quiet)}
body.os-shell:has(.tex-work-app) .qtex-welcome-number{color:var(--quiet)}
body.os-shell:has(.tex-work-app) .qtex-welcome-hero{
  display:grid;
  grid-template-columns:minmax(0,1.15fr) minmax(270px,.85fr);
  align-items:center;
  gap:clamp(28px,3vw,50px);
}
body.os-shell:has(.tex-work-app) .qtex-welcome-copy{
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  gap:13px;
  min-width:0;
}
body.os-shell:has(.tex-work-app) .qtex-welcome-kicker{
  color:var(--muted);
  font:650 10px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace;
  letter-spacing:.08em;
}
body.os-shell:has(.tex-work-app) .qtex-welcome-copy h2{
  margin:0;
  font:820 clamp(34px,3.55vw,56px)/1.16 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;
  letter-spacing:-.068em;
  text-wrap:balance;
}
body.os-shell:has(.tex-work-app) .qtex-welcome-copy h2>span,
body.os-shell:has(.tex-work-app) .qtex-welcome-copy h2>em{
  display:block;
}
body.os-shell:has(.tex-work-app) .qtex-welcome-copy h2>span{
  font:inherit!important;
  font-size:inherit!important;
  line-height:inherit!important;
  letter-spacing:inherit!important;
  color:var(--text)!important;
}
body.os-shell:has(.tex-work-app) .qtex-welcome-copy h2>em{
  color:#1b52ec;
  font-style:normal;
}
body.os-shell:has(.tex-work-app) .qtex-welcome-copy p{
  max-width:40ch;
  margin:0;
  color:var(--muted);
  font:450 clamp(12px,1.03vw,15px)/1.8 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;
}
body.os-shell:has(.tex-work-app) .qtex-welcome-art{
  display:grid;
  align-items:center;
  min-width:0;
  padding:12px 0 15px;
}
body.os-shell:has(.tex-work-app) .qtex-paper{
  width:100%;
  max-width:398px;
  padding:19px 20px 18px;
  border:1px solid var(--work-line);
  border-radius:14px;
  background:var(--work-card);
  box-shadow:0 16px 40px rgba(17,23,30,.07),0 2px 5px rgba(17,23,30,.025);
  transform:rotate(1.25deg);
}
body.os-shell:has(.tex-work-app) .qtex-paper-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  border-bottom:1px solid var(--work-line);
  margin-bottom:17px;
  padding-bottom:13px;
  font:650 11px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace;
  color:var(--muted);
}
body.os-shell:has(.tex-work-app) .qtex-paper-header>span:first-child{display:inline-flex;gap:8px;align-items:center}
body.os-shell:has(.tex-work-app) .qtex-paper-header i{width:7px;height:7px;border-radius:50%;background:#4dc97b}
body.os-shell:has(.tex-work-app) .qtex-code{
  display:grid;
  grid-template-columns:24px minmax(0,1fr);
  align-items:center;
  gap:8px;
  padding:6px 0;
  min-width:0;
}
body.os-shell:has(.tex-work-app) .qtex-code>span{
  color:var(--quiet);
  font:500 10px/1.5 ui-monospace,Consolas,monospace;
}
body.os-shell:has(.tex-work-app) .qtex-code code{
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:var(--text);
  font:600 clamp(11px,.88vw,13px)/1.6 ui-monospace,SFMono-Regular,Consolas,monospace;
}
body.os-shell:has(.tex-work-app) .qtex-code:nth-of-type(3) code{color:#1b52ec}
body.os-shell:has(.tex-work-app) .qtex-paper-bottom{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:13px;
  margin-top:18px;
  padding:10px;
  border-radius:8px;
  color:#1c2e18;
  background:#cbf476;
  font:750 11px/1.3 ui-monospace,SFMono-Regular,Consolas,monospace;
  letter-spacing:.07em;
}
body.os-shell:has(.tex-work-app) .qtex-paper-bottom span:nth-child(2){font-size:16px}
body.os-shell:has(.tex-work-app) .qtex-templates{
  display:grid;
  gap:14px;
  min-width:0;
}
body.os-shell:has(.tex-work-app) .qtex-templates-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding-top:16px;
  border-top:1px solid var(--work-line);
}
body.os-shell:has(.tex-work-app) .qtex-templates-header strong{
  font:760 16px/1.4 Inter,ui-sans-serif,"PingFang SC","Microsoft YaHei",sans-serif;
  letter-spacing:-.035em;
}
body.os-shell:has(.tex-work-app) .qtex-templates-header>span{
  color:var(--quiet);
  font:650 10px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace;
  letter-spacing:.08em;
}
body.os-shell:has(.tex-work-app) .qtex-template-grid{
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:13px;
  min-width:0;
}
body.os-shell:has(.tex-work-app) .qtex-template{
  --qtex-accent:#cbf476;
  appearance:none;
  position:relative;
  display:flex;
  flex-direction:column;
  align-items:stretch;
  justify-content:space-between;
  gap:24px;
  min-width:0;
  min-height:152px;
  padding:18px 19px 17px;
  border:1px solid var(--work-line);
  border-radius:14px;
  background:var(--work-card);
  color:var(--text);
  text-align:left;
  box-shadow:0 8px 24px rgba(17,23,30,.025);
  cursor:pointer;
  overflow:hidden;
  -webkit-tap-highlight-color:transparent;
  transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;
}
body.os-shell:has(.tex-work-app) .qtex-template::before{
  content:"";
  position:absolute;
  left:0;top:0;right:0;
  height:4px;
  background:var(--qtex-accent);
}
body.os-shell:has(.tex-work-app) .qtex-template-article{--qtex-accent:#c9b2ff}
body.os-shell:has(.tex-work-app) .qtex-template-math{--qtex-accent:#a9c6ff}
body.os-shell:has(.tex-work-app) .qtex-template-top{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}
body.os-shell:has(.tex-work-app) .qtex-template-icon{
  display:grid;
  place-items:center;
  width:40px;height:40px;
  border-radius:10px;
  background:var(--qtex-accent);
  color:#17201c;
  font:750 21px/1 ui-monospace,SFMono-Regular,Consolas,monospace;
}
body.os-shell:has(.tex-work-app) .qtex-template-arrow{
  font:600 16px/1 ui-sans-serif,sans-serif;
  color:var(--quiet);
}
body.os-shell:has(.tex-work-app) .qtex-template-info{
  display:flex;
  flex-direction:column;
  gap:6px;
  min-width:0;
}
body.os-shell:has(.tex-work-app) .qtex-template-info>strong{
  font:770 clamp(15px,1.1vw,19px)/1.4 Inter,ui-sans-serif,"PingFang SC","Microsoft YaHei",sans-serif;
  letter-spacing:-.04em;
  color:var(--text)!important;
}
body.os-shell:has(.tex-work-app) .qtex-template-info>span{
  color:var(--muted);
  font:450 11px/1.6 Inter,ui-sans-serif,"PingFang SC","Microsoft YaHei",sans-serif;
  text-wrap:pretty;
}
body.os-shell:has(.tex-work-app) .qtex-template:hover{
  border-color:color-mix(in srgb,var(--qtex-accent) 65%,var(--work-line));
  box-shadow:0 13px 30px rgba(17,23,30,.07);
  transform:translateY(-3px);
}
body.os-shell:has(.tex-work-app) .qtex-template:focus-visible{
  outline:3px solid var(--primary);
  outline-offset:2px;
}
body.os-shell:has(.tex-work-app) .qtex-welcome-footer{
  display:flex;
  justify-content:flex-start;
  gap:22px;
  flex-wrap:wrap;
  color:var(--quiet);
  font:600 10px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace;
  letter-spacing:.03em;
}
body.os-shell:has(.tex-work-app) .qtex-welcome-footer>span::before{
  content:"";
  display:inline-block;
  width:5px;height:5px;
  margin-right:8px;
  vertical-align:2px;
  border-radius:50%;
  background:var(--qtex-green,#8ab978);
}
@container qtex (max-width:790px){
  body.os-shell:has(.tex-work-app) .qtex-welcome-hero{grid-template-columns:1fr!important}
  body.os-shell:has(.tex-work-app) .qtex-welcome-art{display:none!important}
  body.os-shell:has(.tex-work-app) .qtex-welcome-copy h2{font-size:clamp(31px,5.5cqw,48px)!important}
}
@container qtex (max-width:615px){
  body.os-shell:has(.tex-work-app) .qtex-template-grid{grid-template-columns:1fr!important;gap:10px!important}
  body.os-shell:has(.tex-work-app) .qtex-template{
    min-height:103px!important;
    gap:8px!important;
    padding:13px 15px!important;
  }
  body.os-shell:has(.tex-work-app) .qtex-template-icon{width:32px;height:32px;font-size:17px}
  body.os-shell:has(.tex-work-app) .qtex-welcome-bar{gap:8px}
  body.os-shell:has(.tex-work-app) .qtex-welcome-number{display:none}
  body.os-shell:has(.tex-work-app) .qtex-welcome{gap:18px}
}
@media(max-width:760px){
  body.os-shell:has(.tex-work-app) .tex-editor-placeholder:has(.qtex-welcome){
    justify-content:flex-start!important;
    min-height:100%!important;
    padding:26px 18px 80px!important;
  }
}
:root[data-theme="dark"] body.os-shell:has(.tex-work-app) .qtex-welcome-copy h2>em{color:#99b6ff}
@media(prefers-reduced-motion:reduce){
  body.os-shell:has(.tex-work-app) .qtex-template{transition:none}
  body.os-shell:has(.tex-work-app) .qtex-template:hover{transform:none}
}

</style>`;
  return source.replace("</body>", style + "</body>");
}
