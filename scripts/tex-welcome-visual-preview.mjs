import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { texWorkbenchContent } from "../studio/ui-tex-workbench.js";
import { enhanceTexWorkbenchLocal } from "../studio/ui-tex-local.js";
import { polishTexWorkbenchApp } from "../studio/ui-tex-app.js";
import { enhanceWorkTexCollapsiblePanels } from "../studio/ui-work-tex-panels.js";
import { polishWorkTexVisualTheme, injectWorkTexHomeLinks } from "../studio/ui-work-tex.js";
import { polishWorkTexViewportEdges } from "../studio/ui-work-tex-viewport-edges.js";
import { polishWorkTexWelcome } from "../studio/ui-work-tex-welcome.js";
import { enhanceWorkTexComposer } from "../studio/ui-work-tex-composer.js";

const dir = path.resolve(process.env.AERTEX_PREVIEW_DIR || path.join(os.tmpdir(),"aertex-tex-welcome-qa"));
fs.mkdirSync(dir,{recursive:true});
for (const zh of [true,false]) {
  let work = enhanceWorkTexCollapsiblePanels(
    polishTexWorkbenchApp(enhanceTexWorkbenchLocal(texWorkbenchContent(zh),zh),zh),zh
  );
  let html = [
    "<!doctype html><html lang=\""+(zh?"zh-CN":"en")+"\">",
    "<head><meta charset=\"utf-8\">",
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
    "<style>",
    ":root{color-scheme:light;--bg:#f5f6f8;--text:#171819;--muted:#74797c;--quiet:#9da1a5;--primary:#1b52ec;--fill:#f1f2f5;--card:#fff;--surface:#fff;--surface-soft:#f8f9fa;--border:#dfe2e6;--hairline:#e3e5e9;--glass-heavy:#fff;--work-panel:#fbfcfd;--work-panel-soft:#f7f8fa;--work-card:#fff;--work-line:#e3e6e9;--work-ease:cubic-bezier(.2,.7,.2,1)}",
    "*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,'Segoe UI','PingFang SC',sans-serif}",
    ".tex-work-app{padding:0!important}.tex-work-app .tex-shell{min-height:0!important;height:100vh!important;border-radius:0!important}",
    "</style></head><body class=\"os-shell\"><main>",
    work,
    "</main><script>",
    "window.addEventListener('load',()=>{const w=document.querySelector('.qtex-welcome'),card=document.querySelectorAll('.qtex-template'),head=document.querySelector('.qtex-welcome-copy h2'),recent=document.getElementById('qtex-recent-list');",
    "const composer=document.getElementById('qtex-composer'),plus=document.getElementById('qtex-composer-plus'),target=document.getElementById('qtex-composer-target'),menu=document.getElementById('qtex-composer-menu');",
    "const shell=document.querySelector('.qtex-composer-shell'),rect=shell?.getBoundingClientRect(),cr=composer?.getBoundingClientRect(),label=document.getElementById('qtex-composer-target-text');",
    "const compact=!!rect&&rect.height<=56&&rect.height>=46&&cr.width<=728&&label&&label.scrollWidth<=label.clientWidth+1;",
    "const plusRect=plus?.getBoundingClientRect();const plusRound=!!plusRect&&Math.abs(plusRect.width-plusRect.height)<.75&&plusRect.height<=37&&plusRect.height>=33&&getComputedStyle(plus).borderRadius==='50%';",
    "plus?.click();const menuOpen=menu&&!menu.hidden&&menu.querySelectorAll('button[data-action]').length===4&&plus.getAttribute('aria-expanded')==='true'&&menu.scrollHeight<232;",
    "const noStickyPlus=getComputedStyle(plus).backgroundColor==='rgba(0, 0, 0, 0)';",
    "plus?.click();const sidebar=document.getElementById('tex-document-list');",
    "if(sidebar){for(const [id,name] of [['10000000-0000-4000-8000-000000000001','APMCM'],['10000000-0000-4000-8000-000000000002','美赛'],['10000000-0000-4000-8000-000000000003','机器学习']]){const row=document.createElement('button');row.className='tex-document-item';row.dataset.texDocumentId=id;const strong=document.createElement('strong');strong.textContent=name;row.append(strong);sidebar.append(row);}}",
    "const cleanTarget=getComputedStyle(target).backgroundColor==='rgba(0, 0, 0, 0)';",
    "target?.click();const picker=document.getElementById('qtex-composer-target-menu');const entries=[...picker.querySelectorAll('button.qtex-target-entry')];",
    "const noStickyTarget=getComputedStyle(target).backgroundColor==='rgba(0, 0, 0, 0)';",
    "const rowFits=entries.length===4&&entries.every(el=>{const r=el.getBoundingClientRect();return r.height<=43&&r.height>=36})&&picker.getBoundingClientRect().height<=220;",
    "const targetOpen=!picker.hidden&&rowFits&&entries.every(el=>!el.querySelector('small'))&&picker.getBoundingClientRect().width<=275;",
    "const send=document.getElementById('qtex-composer-send'),input=document.getElementById('qtex-composer-input');",
    "const arrowOnly=!!send&&!!send.querySelector('.qtex-send-arrow')&&!send.querySelector('.qtex-send-wave')&&!document.getElementById('qtex-composer-mic');",
    "const sr=send?.getBoundingClientRect(),tr=target?.getBoundingClientRect();",
    "const circle=!!sr&&Math.abs(sr.width-sr.height)<1&&sr.width<=45&&sr.width>=37&&!!tr&&tr.width<210&&tr.height<45;",
    "const grey=getComputedStyle(send).backgroundColor;const disabledInitially=!!send?.disabled&&send.getAttribute('aria-disabled')==='true';",
    "input.value='测试输入';input.dispatchEvent(new Event('input',{bubbles:true}));",
    "const activeOnText=!send.disabled&&send.getAttribute('aria-disabled')==='false'&&getComputedStyle(send).backgroundColor!==grey;",
    "input.value='第一行\\n第二行';input.dispatchEvent(new Event('input',{bubbles:true}));",
    "const multilineGrows=composer.dataset.multiline==='true'&&shell.getBoundingClientRect().height>=85;",
    "input.value='  ';input.dispatchEvent(new Event('input',{bubbles:true}));",
    "const disabledOnWhitespace=send.disabled&&composer.dataset.multiline==='false'&&shell.getBoundingClientRect().height<=56;",
    "input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));",
    "const placeholderRestored=send.disabled&&!!input.placeholder&&composer.dataset.multiline==='false'&&shell.getBoundingClientRect().height<=56;",
    "const quietFocus=!document.querySelector('.qtex-composer-shell').matches(':focus-within')||getComputedStyle(document.querySelector('.qtex-composer-shell')).boxShadow!=='0 0 0 2px';",
    "const noFragmentedBrand=picker.textContent.includes('聊天')||document.documentElement.lang==='en';",
    "const pass=!!w&&card.length===3&&!!head&&!!recent&&!!composer&&!!plus&&menuOpen&&targetOpen&&noFragmentedBrand&&arrowOnly&&circle&&plusRound&&noStickyPlus&&cleanTarget&&noStickyTarget&&compact&&multilineGrows&&disabledInitially&&activeOnText&&disabledOnWhitespace&&placeholderRestored&&quietFocus&&",
    "composer.getBoundingClientRect().height>=46&&composer.getBoundingClientRect().width<=w.getBoundingClientRect().width+2&&",
    "head.hasAttribute('data-greeting-index')&&head.textContent.trim()!==(document.documentElement.lang.startsWith('zh')?'欢迎回来':'Welcome back')&&",
    "Math.abs(card[0].getBoundingClientRect().width-card[1].getBoundingClientRect().width)<2&&",
    "head.getBoundingClientRect().right<=w.getBoundingClientRect().right+2&&",
    "w.getBoundingClientRect().width<=document.querySelector('.tex-editor-panel').getBoundingClientRect().width+2;",
    "document.body.setAttribute('data-visual-qa',pass?'PASS':'FAIL');",
    "document.body.setAttribute('data-visual-card-count',card.length);",
    "document.body.setAttribute('data-composer-compact',String(compact));",
    "document.body.setAttribute('data-composer-multiline',String(multilineGrows));",
    "document.body.setAttribute('data-composer-width',String(Math.round(cr.width)));",
    "document.body.setAttribute('data-composer-height',String(Math.round(rect.height)));",
    "document.body.setAttribute('data-plus-round',String(plusRound));",
    "document.body.setAttribute('data-no-sticky-plus',String(noStickyPlus));",
    "document.body.setAttribute('data-no-sticky-target',String(cleanTarget&&noStickyTarget));",
    "document.body.setAttribute('data-plus-rect',String(plusRect.width.toFixed(1))+'x'+String(plusRect.height.toFixed(1)));",
    "document.body.setAttribute('data-plus-radius',String(getComputedStyle(plus).borderRadius));",
    "document.body.setAttribute('data-plus-bg',String(getComputedStyle(plus).backgroundColor));",
    "document.body.setAttribute('data-target-bg',String(getComputedStyle(target).backgroundColor));",
    "});",
    "</script></body></html>"
  ].join("");
  html=polishWorkTexVisualTheme(html);
  html=injectWorkTexHomeLinks(html,zh?"zh-cn":"en-us","https://qsseda.com");
  html=polishWorkTexViewportEdges(html);
  html=polishWorkTexWelcome(html,{username:zh?"天国":"qssedalto"});
  html=enhanceWorkTexComposer(html,zh);
  const file=path.join(dir,zh?"welcome-zh.html":"welcome-en.html");
  fs.writeFileSync(file,html,"utf8");
  if(!html.includes("qsseda-work-tex-welcome-clean"))throw Error("Isolated stylesheet missing");
  console.log(file,html.length);
}
