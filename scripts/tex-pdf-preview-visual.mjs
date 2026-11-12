import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {texWorkbenchContent} from "../studio/ui-tex-workbench.js";
import {enhanceTexWorkbenchLocal} from "../studio/ui-tex-local.js";
import {polishTexWorkbenchApp} from "../studio/ui-tex-app.js";
import {enhanceWorkTexCollapsiblePanels} from "../studio/ui-work-tex-panels.js";
import {polishWorkTexNavigation,polishWorkTexVisualTheme,injectWorkTexHomeLinks} from "../studio/ui-work-tex.js";
import {polishWorkTexViewportEdges} from "../studio/ui-work-tex-viewport-edges.js";
import {polishWorkTexWelcome} from "../studio/ui-work-tex-welcome.js";
import {polishWorkTexPdfControls} from "../studio/ui-work-tex-pdf-controls.js";

function pdfFixture(){
  const message="BT /F1 24 Tf 72 750 Td (AERTEX PDF Preview) Tj ET";
  const objects=[
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Length "+Buffer.byteLength(message)+" >>\nstream\n"+message+"\nendstream"
  ];
  let str="%PDF-1.4\n",offsets=[0];
  for(const [i,item] of objects.entries()){
    offsets.push(Buffer.byteLength(str));
    str+=(i+1)+" 0 obj\n"+item+"\nendobj\n";
  }
  const xref=Buffer.byteLength(str);
  str+="xref\n0 "+(objects.length+1)+"\n0000000000 65535 f \n";
  for(const offset of offsets.slice(1))str+=String(offset).padStart(10,"0")+" 00000 n \n";
  str+="trailer\n<< /Size "+(objects.length+1)+" /Root 1 0 R >>\nstartxref\n"+xref+"\n%%EOF\n";
  return Buffer.from(str).toString("base64");
}
const pdf64=pdfFixture();
const dir=path.resolve(process.env.AERTEX_PREVIEW_DIR||path.join(os.tmpdir(),"aertex-tex-pdf-visual"));
fs.mkdirSync(dir,{recursive:true});
const fixtureRuntime="window.addEventListener('load',()=>{\n  setTimeout(()=>{\n    const frame=document.getElementById('tex-live-preview-frame');\n    const expand=document.getElementById('tex-preview-expand');\n    const collapse=document.getElementById('tex-right-panel-toggle');\n    const shell=document.querySelector('.tex-shell');\n    const rail=document.querySelector('.tex-runs-panel');\n    const head=document.querySelector('.tex-live-preview-head');\n    const zoom=document.getElementById('qtex-pdf-zoom');\n    if(!frame||!collapse||!expand||!shell||!rail||!head||!zoom){\n      document.body.dataset.pdfQa='FAIL-MISSING';return;\n    }\n    const bytes=Uint8Array.from(atob(PDF_BASE64),c=>c.charCodeAt(0));\n    const blob=new Blob([bytes],{type:'application/pdf'});\n    frame.src=URL.createObjectURL(blob)+'#zoom=page-width';\n    frame.hidden=false;\n    const placeholder=document.getElementById('tex-live-preview-placeholder');\n    if(placeholder)placeholder.hidden=true;\n    setTimeout(()=>{\n      const plus=zoom.querySelector('[data-qtex-zoom=\"in\"]');\n      const fit=zoom.querySelector('[data-qtex-zoom=\"fit\"]');\n      const before=frame.getAttribute('src')||'';\n      plus.click();\n      const numeric=frame.getAttribute('src')||'';\n      fit.click();\n      const fitted=frame.getAttribute('src')||'';\n      const kind=new URL(location.href).searchParams.get('mode')||'expanded';\n      if(kind==='collapsed'&&!shell.classList.contains('is-right-collapsed'))collapse.click();\n      setTimeout(()=>{\n        const sr=shell.getBoundingClientRect(),rr=rail.getBoundingClientRect();\n        const er=expand.getBoundingClientRect(),cr=collapse.getBoundingClientRect();\n        const edge=Math.abs(window.innerWidth-sr.right);\n        const collapsed=kind==='collapsed';\n        const ok = edge<=2 && fitted.endsWith('#view=FitH') &&\n          numeric.endsWith('#zoom=125') && before.endsWith('#view=FitH') &&\n          (collapsed\n            ? Math.abs(rr.width-44)<=2 &&\n              Math.abs((cr.left+cr.right)/2-(rr.left+rr.right)/2)<=2 &&\n              collapse.parentElement===rail\n            : Math.abs(er.top-cr.top)<=2 &&\n              Math.abs(er.height-cr.height)<=2 &&\n              head.firstElementChild===expand &&\n              collapse.parentElement===head.querySelector('.tex-live-preview-actions'));\n        document.body.dataset.pdfQa=ok?'PASS':'FAIL-GEOMETRY';\n        document.body.dataset.pdfEdge=String(edge.toFixed(1));\n        document.body.dataset.pdfZoom=String(fit.textContent);\n      },150);\n    },200);\n  },100);\n});".replace("PDF_BASE64",JSON.stringify(pdf64));
for(const zh of [true,false]){
  const body=enhanceWorkTexCollapsiblePanels(
    polishTexWorkbenchApp(enhanceTexWorkbenchLocal(texWorkbenchContent(zh),zh),zh),zh
  );
  let html=[
    '<!doctype html><html lang="'+(zh?'zh-CN':'en')+'"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<style>:root{color-scheme:light;--bg:#f5f6f8;--bg-soft:#f5f6f8;--text:#171819;--muted:#74797c;--quiet:#9da1a5;--primary:#1b52ec;--fill:#f1f2f5;--card:#fff;--surface:#fff;--surface-soft:#f8f9fa;--border:#dfe2e6;--hairline:#e3e5e9;--glass-heavy:#fff;--work-panel:#fbfcfd;--work-panel-soft:#f7f8fa;--work-card:#fff;--work-line:#e3e6e9;--work-ease:cubic-bezier(.2,.7,.2,1)}',
    '*{box-sizing:border-box}body{margin:0;color:var(--text);font-family:Inter,"Segoe UI","PingFang SC",sans-serif}</style></head>',
    '<body class="os-shell"><div class="os-layout"><main class="os-main"><div id="os-content">',body,
    '</div></main></div><script>',fixtureRuntime,'</script></body></html>'
  ].join("");
  html=polishWorkTexNavigation(html,zh,"/work/tex","https://work.qsseda.com");
  html=polishWorkTexVisualTheme(html);
  html=injectWorkTexHomeLinks(html,zh?"zh-cn":"en-us","https://qsseda.com");
  html=polishWorkTexViewportEdges(html);
  html=polishWorkTexWelcome(html);
  html=polishWorkTexPdfControls(html);
  const file=path.join(dir,zh?"pdf-zh.html":"pdf-en.html");
  fs.writeFileSync(file,html);
  console.log(file,html.length);
}
