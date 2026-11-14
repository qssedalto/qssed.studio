// Time-aware personalized greetings for the TeX workspace.
// The browser supplies its local hour, so the greeting follows the user's
// operating-system time zone rather than the UTC/server clock.
export function selectWorkTexGreeting({ zh = true, username = "", localHour = 12, previousIndex = -1, random = Math.random } = {}) {
  const name = String(username || (zh ? "朋友" : "there")).trim() || (zh ? "朋友" : "there");
  const numericHour = Number(localHour);
  const hour = Number.isFinite(numericHour) ? ((Math.trunc(numericHour) % 24) + 24) % 24 : 12;
  let chineseTimeGreeting, englishTimeGreeting;
  if (hour >= 5 && hour < 11) {
    chineseTimeGreeting = `早上好，${name}！`;
    englishTimeGreeting = `Good morning, ${name}!`;
  } else if (hour >= 11 && hour < 14) {
    chineseTimeGreeting = `中午好，${name}！`;
    englishTimeGreeting = `Good afternoon, ${name}!`;
  } else if (hour >= 14 && hour < 18) {
    chineseTimeGreeting = `下午好，${name}！`;
    englishTimeGreeting = `Good afternoon, ${name}!`;
  } else if (hour >= 18 && hour < 24) {
    chineseTimeGreeting = `晚上好，${name}！`;
    englishTimeGreeting = `Good evening, ${name}!`;
  } else {
    chineseTimeGreeting = `夜深了，${name}。`;
    englishTimeGreeting = `Working late, ${name}?`;
  }
  const lines = zh ? [
    "我们从哪里开始？",
    "随时可以开始。",
    "今天有什么安排？",
    `很高兴见到你，${name}。`,
    `${name}，我能帮你做些什么？`,
    "今天想聊点什么？",
    chineseTimeGreeting,
    englishTimeGreeting
  ] : [
    "Where should we begin?",
    "Ready when you are.",
    "What's on the agenda today?",
    `Good to see you, ${name}.`,
    `${name}, what can I help you with?`,
    "What would you like to work on today?",
    englishTimeGreeting
  ];
  // Avoid repeating the same heading on consecutive refreshes in this tab.
  const choices = lines.map((_, index) => index).filter(index => index !== previousIndex);
  const unit = Number(random());
  const offset = Math.min(choices.length - 1, Math.max(0, Math.floor((Number.isFinite(unit) ? unit : 0) * choices.length)));
  const index = choices[offset];
  return { index, text: lines[index] };
}

// Clean Work TeX welcome dashboard. Scoped to the placeholder so editor styling is unaffected.
export function polishWorkTexWelcome(markup, { username = "" } = {}) {
  const source = String(markup || "");
  if (!source.includes('class="qtex-welcome"') || !source.includes("</body>")) return source;
  const style = `<style id="qsseda-work-tex-welcome-clean">

body.os-shell:has(.tex-work-app) .tex-editor-placeholder:has(.qtex-welcome){
  display:block!important;width:100%!important;height:100%!important;min-height:0!important;
  padding:clamp(34px,5.5vh,76px) clamp(24px,6vw,90px) 80px!important;
  overflow-x:hidden!important;overflow-y:auto!important;background:var(--work-panel,var(--surface))!important;
  text-align:left!important;container:qtex / inline-size;
}
body.os-shell:has(.tex-work-app) .qtex-welcome,
body.os-shell:has(.tex-work-app) .qtex-welcome *{box-sizing:border-box}
body.os-shell:has(.tex-work-app) .qtex-welcome{
  width:min(100%,860px);margin-inline:auto;display:flex;flex-direction:column;gap:0;
  color:var(--text);font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;
  -webkit-font-smoothing:antialiased;text-align:left;
}
body.os-shell:has(.tex-work-app) .qtex-welcome-hero{display:block;margin:0 0 clamp(28px,4.2vh,46px);padding:0}
body.os-shell:has(.tex-work-app) .qtex-welcome-copy{display:flex;flex-direction:column;align-items:flex-start;min-width:0}
body.os-shell:has(.tex-work-app) .qtex-welcome-brand{
  display:inline-flex;align-items:center;gap:9px;margin-bottom:28px;
  color:var(--muted);font:650 12px/1.4 ui-sans-serif,"Segoe UI",sans-serif;
  letter-spacing:.005em;
}
body.os-shell:has(.tex-work-app) .qtex-brand-dot{display:block;width:8px;height:8px;border-radius:3px;background:var(--primary,#4875df)}
body.os-shell:has(.tex-work-app) .qtex-brand-divider{opacity:.5}
body.os-shell:has(.tex-work-app) .qtex-welcome-copy h2{
  margin:0!important;color:var(--text)!important;
  font:740 clamp(34px,3.6vw,48px)/1.25 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif!important;
  letter-spacing:-.045em!important;text-wrap:balance;
}
body.os-shell:has(.tex-work-app) .qtex-welcome-copy h2>span{
  display:inline!important;font:inherit!important;letter-spacing:inherit!important;color:inherit!important;
}
body.os-shell:has(.tex-work-app) .qtex-welcome-copy p{
  max-width:none;margin:11px 0 0;color:var(--muted)!important;
  font:450 14px/1.7 Inter,ui-sans-serif,"Segoe UI","PingFang SC",sans-serif!important;
}
body.os-shell:has(.tex-work-app) .qtex-templates{display:flex;flex-direction:column;gap:13px;min-width:0}
body.os-shell:has(.tex-work-app) .qtex-templates-header,
body.os-shell:has(.tex-work-app) .qtex-recent-heading{
  display:flex;align-items:center;justify-content:space-between;gap:10px;padding:0;margin:0;
}
body.os-shell:has(.tex-work-app) .qtex-templates-header strong,
body.os-shell:has(.tex-work-app) .qtex-recent-heading strong{
  font:700 15px/1.4 Inter,ui-sans-serif,"Segoe UI","PingFang SC",sans-serif;letter-spacing:-.025em;color:var(--text);
}
body.os-shell:has(.tex-work-app) .qtex-template-grid{
  display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;
}
body.os-shell:has(.tex-work-app) .qtex-template{
  appearance:none;display:grid;grid-template-columns:36px minmax(0,1fr) 14px;
  align-items:center;gap:12px;min-width:0;min-height:100px;margin:0;
  padding:16px 14px!important;border:1px solid var(--work-line,var(--border))!important;
  border-radius:13px!important;background:var(--work-card,var(--surface))!important;
  text-align:left;box-shadow:none!important;color:var(--text);cursor:pointer;
  transition:border-color .15s,background-color .15s,transform .15s;
}
body.os-shell:has(.tex-work-app) .qtex-template::before{display:none!important}
body.os-shell:has(.tex-work-app) .qtex-template-icon{
  display:grid;place-items:center;width:36px;height:36px;border-radius:10px;
  background:color-mix(in srgb,var(--primary,#4774df) 9%,var(--work-card,var(--surface)));
  color:var(--text);font-size:18px;
}
body.os-shell:has(.tex-work-app) .qtex-template-icon svg{display:block;width:20px;height:20px;stroke:none}
body.os-shell:has(.tex-work-app) .qtex-template-info{display:flex;flex-direction:column;gap:5px;min-width:0}
body.os-shell:has(.tex-work-app) .qtex-template-info strong{
  color:var(--text)!important;font:680 13px/1.4 Inter,ui-sans-serif,"Segoe UI","PingFang SC",sans-serif!important;
  white-space:nowrap;
}
body.os-shell:has(.tex-work-app) .qtex-template-info>span{
  color:var(--muted)!important;font:450 11px/1.5 Inter,ui-sans-serif,"Segoe UI","PingFang SC",sans-serif!important;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
body.os-shell:has(.tex-work-app) .qtex-template-arrow{width:14px;height:14px;flex:0 0 14px;color:var(--muted);opacity:.8}
body.os-shell:has(.tex-work-app) .qtex-template:hover{
  border-color:color-mix(in srgb,var(--primary) 35%,var(--work-line,var(--border)))!important;
  background:color-mix(in srgb,var(--primary) 3%,var(--work-card,var(--surface)))!important;
  transform:translateY(-1px);
}
body.os-shell:has(.tex-work-app) .qtex-template:focus-visible,
body.os-shell:has(.tex-work-app) .qtex-recent-item:focus-visible{
  outline:2px solid var(--primary)!important;outline-offset:3px!important;
}
body.os-shell:has(.tex-work-app) .qtex-recent{display:flex;flex-direction:column;gap:13px;margin-top:38px}
body.os-shell:has(.tex-work-app) .qtex-recent-heading span{font-size:11px;color:var(--muted)}
body.os-shell:has(.tex-work-app) .qtex-recent-list{
  display:flex;flex-direction:column;overflow:hidden;
  border:1px solid var(--work-line,var(--border));border-radius:14px;
  background:var(--work-card,var(--surface));
}
body.os-shell:has(.tex-work-app) .qtex-recent-item{
  display:grid;grid-template-columns:22px minmax(0,1fr) 18px;align-items:center;gap:13px;
  min-height:69px;padding:12px 18px;color:var(--text);text-decoration:none!important;
  border-bottom:1px solid var(--work-line,var(--border));transition:background .15s;
}
body.os-shell:has(.tex-work-app) .qtex-recent-item:last-child{border-bottom:0}
body.os-shell:has(.tex-work-app) .qtex-recent-item:hover{background:color-mix(in srgb,var(--primary) 5%,var(--work-card,var(--surface)))}
body.os-shell:has(.tex-work-app) .qtex-recent-icon{width:21px;height:21px;display:block;color:var(--muted)}
body.os-shell:has(.tex-work-app) .qtex-recent-body{min-width:0;display:flex;flex-direction:column;gap:5px}
body.os-shell:has(.tex-work-app) .qtex-recent-body strong{font-size:13px;font-weight:640;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text)}
body.os-shell:has(.tex-work-app) .qtex-recent-body small{font-size:11px;color:var(--muted);font-weight:400}
body.os-shell:has(.tex-work-app) .qtex-recent-chevron{width:14px;height:14px;opacity:.7;color:var(--muted)}
body.os-shell:has(.tex-work-app) .qtex-recent-empty{padding:25px 18px;color:var(--muted);font-size:12px;text-align:center}
@container qtex (max-width:700px){
  body.os-shell:has(.tex-work-app) .qtex-template-grid{grid-template-columns:1fr;gap:9px}
  body.os-shell:has(.tex-work-app) .qtex-template{min-height:76px;padding:12px 14px!important}
  body.os-shell:has(.tex-work-app) .qtex-recent{margin-top:30px}
}
@media(max-width:760px){
  body.os-shell:has(.tex-work-app) .tex-editor-placeholder:has(.qtex-welcome){padding:28px 17px 70px!important}
  body.os-shell:has(.tex-work-app) .qtex-welcome-brand{margin-bottom:22px}
  body.os-shell:has(.tex-work-app) .qtex-welcome-copy h2{font-size:33px!important}
  body.os-shell:has(.tex-work-app) .qtex-recent-heading span{display:none}
}
@media(prefers-reduced-motion:reduce){
  body.os-shell:has(.tex-work-app) .qtex-template,body.os-shell:has(.tex-work-app) .qtex-recent-item{transition:none}
  body.os-shell:has(.tex-work-app) .qtex-template:hover{transform:none}
}


/* ChatGPT-inspired composition; the controls remain real TeX actions. */
body.os-shell:has(.tex-work-app) .qtex-welcome{
  width:min(100%,1050px)!important;
}
body.os-shell:has(.tex-work-app) .qtex-welcome-hero{
  position:relative;display:grid!important;place-items:center;
  min-height:clamp(220px,31vh,360px);margin:0 0 18px!important;
}
body.os-shell:has(.tex-work-app) .qtex-welcome-copy{
  width:100%;min-width:0;align-items:center!important;justify-content:center;
  padding:46px 8px 0;text-align:center!important;
}
body.os-shell:has(.tex-work-app) .qtex-welcome-brand{
  position:absolute;top:0;left:0;margin:0;opacity:.82;
}
body.os-shell:has(.tex-work-app) .qtex-welcome-copy h2{
  max-width:100%;margin:0 auto!important;
  font:560 clamp(29px,3.2vw,43px)/1.4 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif!important;
  letter-spacing:-.024em!important;text-align:center!important;
  overflow-wrap:anywhere;
}
body.os-shell:has(.tex-work-app) .qtex-welcome-copy p{
  margin-top:9px!important;text-align:center!important;
  font-size:13px!important;
}
body.os-shell:has(.tex-work-app) .qtex-templates{gap:12px}
body.os-shell:has(.tex-work-app) .qtex-template-grid{
  display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;
  padding:7px;background:var(--work-card,var(--surface));
  border:1px solid var(--work-line,var(--border));border-radius:24px;
}
body.os-shell:has(.tex-work-app) .qtex-template{
  min-height:86px;padding:13px 11px!important;
  border:1px solid transparent!important;border-radius:17px!important;
  background:transparent!important;
}
body.os-shell:has(.tex-work-app) .qtex-template:hover{
  background:color-mix(in srgb,var(--primary) 6%,var(--work-card,var(--surface)))!important;
  border-color:color-mix(in srgb,var(--primary) 16%,transparent)!important;
}
body.os-shell:has(.tex-work-app) .qtex-template-icon{width:36px;height:36px;border-radius:12px}
body.os-shell:has(.tex-work-app) .qtex-template-info strong{font-size:13px!important}
body.os-shell:has(.tex-work-app) .qtex-recent{margin-top:clamp(28px,5vh,54px)}
@container qtex (max-width:700px){
  body.os-shell:has(.tex-work-app) .qtex-template-grid{grid-template-columns:1fr;gap:2px;padding:6px;border-radius:20px}
  body.os-shell:has(.tex-work-app) .qtex-template{min-height:69px!important;padding:10px 12px!important;border-radius:14px!important}
  body.os-shell:has(.tex-work-app) .qtex-recent{margin-top:25px}
}
@media(max-width:760px){
  body.os-shell:has(.tex-work-app) .qtex-welcome-hero{min-height:210px;margin-bottom:8px!important}
  body.os-shell:has(.tex-work-app) .qtex-welcome-copy{padding:40px 0 0}
  body.os-shell:has(.tex-work-app) .qtex-welcome-copy h2{font-size:30px!important}
  body.os-shell:has(.tex-work-app) .qtex-welcome-copy p{font-size:12px!important}
}

</style>`;
  const safeName = JSON.stringify(String(username || "").trim().slice(0, 64))
    .replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026")
    .replace(/\\u2028/g, "\\\\u2028").replace(/\\u2029/g, "\\\\u2029");
  const greetingScript = `<script id="qsseda-work-tex-greeting-runtime">
(() => {
  const heading = document.getElementById("qtex-welcome-greeting");
  if (!heading) return;
  const userName = ${safeName};
  const zh = (document.documentElement.lang || "").toLowerCase().startsWith("zh");
  const key = "aertex.work.tex.previous-greeting.v1";
  let previous = -1;
  try {
    const stored = window.sessionStorage.getItem(key);
    if (stored !== null && Number.isInteger(Number(stored))) previous = Number(stored);
  } catch {}
  const choose = (${selectWorkTexGreeting.toString()});
  // Date#getHours uses the device's configured local time zone, including
  // its daylight-saving changes. No server UTC or fixed China offset.
  const localHour = new Date().getHours();
  const result = choose({ zh, username: userName, localHour, previousIndex: previous });
  (heading.querySelector("span") || heading).textContent = result.text;
  try { window.sessionStorage.setItem(key, String(result.index)); } catch {}
  heading.dataset.greetingIndex = String(result.index);
  heading.dataset.greetingHour = String(localHour);
})();
</script>`;
  const script = `
<script id="qsseda-work-tex-recent-runtime">
(() => {
  const host=document.getElementById("qtex-recent-list");
  const sidebar=document.getElementById("tex-document-list");
  if(!host||!sidebar)return;
  const zh=(document.documentElement.lang||"").toLowerCase().startsWith("zh");
  const icon='<svg class="qtex-recent-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4.2l2.1 2.3H18a2.5 2.5 0 0 1 2.5 2.5v8A2.7 2.7 0 0 1 17.8 20H6.2a2.7 2.7 0 0 1-2.7-2.7Z" stroke="currentColor" stroke-width="1.65" stroke-linejoin="round"/></svg>';
  const arrow='<svg class="qtex-recent-chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 5 7 7-7 7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  let lastSignature="",scheduled=false;
  function update(){
    scheduled=false;
    const rows=Array.from(sidebar.querySelectorAll(':scope > .tex-document-item[data-tex-document-id]'));
    const signature=rows.map(row=>[row.dataset.texDocumentId,row.querySelector('strong')?.textContent||'',row.querySelector('time')?.textContent||''].join("|")).join(";");
    if(signature===lastSignature)return;
    lastSignature=signature;
    host.replaceChildren();
    if(!rows.length){
      const empty=document.createElement("div");
      empty.className="qtex-recent-empty";
      empty.textContent=zh?"还没有最近使用的项目。创建一个项目即可开始。":"No recent projects yet. Create one to get started.";
      host.append(empty);return;
    }
    for(const row of rows.slice(0,6)){
      const link=document.createElement("a");
      link.className="qtex-recent-item";
      link.href=row.href||"#";
      link.dataset.texRecentId=row.dataset.texDocumentId;
      const body=document.createElement("span");
      body.className="qtex-recent-body";
      const title=document.createElement("strong");
      title.textContent=row.querySelector("strong")?.textContent|| (zh?"未命名项目":"Untitled project");
      const meta=document.createElement("small");
      const time=row.querySelector("time")?.textContent?.trim()||"";
      meta.textContent=time?(zh?"最近编辑 · ":"Edited · ")+time:(zh?"TeX 项目":"TeX project");
      body.append(title,meta);
      link.innerHTML=icon;
      link.append(body);
      link.insertAdjacentHTML("beforeend",arrow);
      link.addEventListener("click",event=>{
        if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
        const current=Array.from(sidebar.querySelectorAll(':scope > .tex-document-item[data-tex-document-id]'))
          .find(item=>item.dataset.texDocumentId===link.dataset.texRecentId);
        if(!current)return;
        event.preventDefault();
        current.click();
      });
      host.append(link);
    }
  }
  const queue=()=>{if(scheduled)return;scheduled=true;window.requestAnimationFrame(update)};
  new MutationObserver(queue).observe(sidebar,{childList:true,subtree:true,characterData:true});
  queue();
})();
</script>`;
  return source.replace("</body>", style + greetingScript + script + "</body>");
}
