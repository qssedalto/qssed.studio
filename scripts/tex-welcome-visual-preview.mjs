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
    "window.addEventListener('load',()=>{const w=document.querySelector('.qtex-welcome'),card=document.querySelectorAll('.qtex-template'),k=document.querySelector('.qtex-welcome-brand'),head=document.querySelector('.qtex-welcome-copy h2');",
    "const pass=!!w&&card.length===3&&!!head&&!!k&&getComputedStyle(k).writingMode==='horizontal-tb'&&document.querySelectorAll('.tex-start-card').length===0&&",
    "Math.abs(card[0].getBoundingClientRect().width-card[1].getBoundingClientRect().width)<2&&",
    "Math.abs(parseFloat(getComputedStyle(head.firstElementChild).fontSize)-parseFloat(getComputedStyle(head.lastElementChild).fontSize))<1&&",
    "head.getBoundingClientRect().right<=w.getBoundingClientRect().right+2&&",
    "w.getBoundingClientRect().width<=document.querySelector('.tex-editor-panel').getBoundingClientRect().width+2;",
    "document.body.setAttribute('data-visual-qa',pass?'PASS':'FAIL');",
    "document.body.setAttribute('data-visual-card-count',card.length);",
    "});",
    "</script></body></html>"
  ].join("");
  html=polishWorkTexVisualTheme(html);
  html=injectWorkTexHomeLinks(html,zh?"zh-cn":"en-us","https://qsseda.com");
  html=polishWorkTexViewportEdges(html);
  html=polishWorkTexWelcome(html);
  const file=path.join(dir,zh?"welcome-zh.html":"welcome-en.html");
  fs.writeFileSync(file,html,"utf8");
  if(!html.includes("qsseda-work-tex-welcome-clean"))throw Error("Isolated stylesheet missing");
  console.log(file,html.length);
}
