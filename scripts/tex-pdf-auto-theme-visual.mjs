import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { enhanceWorkTexPdfAutoTheme } from "../studio/ui-work-tex-pdf-auto-theme.js";

function pdfFixture() {
  const stream = [
    "q 1 1 1 rg 0 0 400 600 re f Q",
    "BT /F1 28 Tf 0 0 0 rg 40 520 Td (AERTEX PDF COLOR TEST) Tj ET",
    "q 120 0 0 120 90 230 cm /Im0 Do Q"
  ].join("\n");
  const imageData="FF0000 00FF00 0000FF FFFF00>";
  const objects=[
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 600] /Resources << /Font << /F1 4 0 R >> /XObject << /Im0 6 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Length "+Buffer.byteLength(stream)+" >>\nstream\n"+stream+"\nendstream",
    "<< /Type /XObject /Subtype /Image /Width 2 /Height 2 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /ASCIIHexDecode /Length "+Buffer.byteLength(imageData)+" >>\nstream\n"+imageData+"\nendstream"
  ];
  let pdf="%PDF-1.4\n", offsets=[0];
  for (const [i,item] of objects.entries()) {
    offsets.push(Buffer.byteLength(pdf));
    pdf+=(i+1)+" 0 obj\n"+item+"\nendobj\n";
  }
  const xref=Buffer.byteLength(pdf);
  pdf+="xref\n0 "+(objects.length+1)+"\n0000000000 65535 f \n";
  for (const offset of offsets.slice(1)) pdf+=String(offset).padStart(10,"0")+" 00000 n \n";
  pdf+="trailer\n<< /Size "+(objects.length+1)+" /Root 1 0 R >>\nstartxref\n"+xref+"\n%%EOF\n";
  return Buffer.from(pdf).toString("base64");
}

function browserHarness(fixture) {
  const bytes = Uint8Array.from(atob(fixture), c => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], {type:'application/pdf'}));
  const frame = document.getElementById('tex-live-preview-frame');
  frame.src = url + '#view=FitH';
  frame.hidden = false;
  const report = [];
  function canvas() {
    return document.querySelector('.aertex-pdf-page[data-painted-theme="' +
      document.documentElement.dataset.theme + '"] canvas');
  }
  function samplePoint(ctx, x, y) {
    const w=ctx.canvas.width, h=ctx.canvas.height;
    return [...ctx.getImageData(Math.round(x*w/400),Math.round((600-y)*h/600),1,1).data].slice(0,3);
  }
  function textBrightPixels(ctx) {
    const w=ctx.canvas.width, h=ctx.canvas.height;
    let bright=0;
    for(let x=42;x<345;x+=2) {
      for(let y=521;y<548;y+=2) {
        const p=ctx.getImageData(Math.round(x*w/400),Math.round((600-y)*h/600),1,1).data;
        if(p[0]>200 && p[1]>200 && p[2]>200) bright++;
      }
    }
    return bright;
  }
  function inspect() {
    const c=canvas();
    if (!c || c.width<50 || c.height<50) return null;
    const ctx=c.getContext('2d');
    return {
      background:samplePoint(ctx,10,570),
      image:[samplePoint(ctx,117,316),samplePoint(ctx,178,317),samplePoint(ctx,117,261),samplePoint(ctx,177,261)],
      bright:textBrightPixels(ctx),
      css: getComputedStyle(document.getElementById('tex-live-preview-frame')).visibility,
      manualTheme: !!document.querySelector('.aertex-pdf-reader [data-pdf-action="theme"]')
    };
  }
  const waitFor = (mode, timeout=17000) => new Promise((resolve,reject)=>{
    const started=Date.now();
    const timer=setInterval(()=>{
      if(document.documentElement.dataset.theme!==mode){clearInterval(timer);reject(Error('Theme changed unexpectedly'));return;}
      const details=inspect();
      if(details) {clearInterval(timer);resolve(details);return;}
      if(Date.now()-started>timeout) {
        clearInterval(timer);reject(Error('Rendering timed out: '+mode+' / '+
          document.querySelector('.aertex-pdf-notice')?.textContent));
      }
    },100);
  });
  (async()=>{
    try{
      const light=await waitFor('light');
      report.push({step:'light',light});
      // Pixel-level layout contract: native-looking SVG glyphs, no fake ink
      // tools, distinct left/center/right groups, and working page/search UI.
      const bar=document.querySelector('.aertex-pdf-toolbar');
      const left=bar?.querySelector('.aertex-pdf-section-left');
      const center=bar?.querySelector('.aertex-pdf-section-center');
      const right=bar?.querySelector('.aertex-pdf-section-right');
      const icons=bar?.querySelectorAll('button.aertex-pdf-tool svg.aertex-pdf-icon');
      if (!bar||!left||!center||!right||icons.length!==11) {
        throw Error('Native PDF toolbar SVG icons/3 groups missing: '+(icons?.length||0));
      }
      const groups=[left,center,right].map(e=>e.getBoundingClientRect());
      if (Math.abs(bar.getBoundingClientRect().height-44)>1 ||
          groups[0].right>groups[1].left+2 ||
          groups[1].right>groups[2].left+2 ||
          getComputedStyle(bar).backgroundColor!=='rgb(247, 247, 247)') {
        throw Error('Native PDF toolbar sizing or alignment differs: '+JSON.stringify(groups.map(r=>[r.left,r.right])));
      }
      if(bar.querySelector('[data-pdf-action="highlight"]')||
         bar.querySelector('[data-pdf-action="draw"]')) {
         throw Error('Unsupported drawing controls must not be displayed');
      }
      const pageToggle=bar.querySelector('[data-pdf-action="pages"]');
      const pageList=document.querySelector('.aertex-pdf-outline');
      pageToggle.click();
      if(pageList.hidden || !pageList.querySelector('[data-pdf-page-num="1"]')) {
        throw Error('Page navigation icon does not display a functioning page list');
      }
      pageList.querySelector('[data-pdf-page-num="1"]').click();
      if(!pageList.hidden) throw Error('Page thumbnail selection must close the list');
      const searchToggle=bar.querySelector('[data-pdf-action="search-toggle"]');
      const search=bar.querySelector('[data-pdf-action="find"]');
      if(!search.hidden) throw Error('Native search field must start collapsed');
      searchToggle.click();
      if(search.hidden || document.activeElement!==search) throw Error('Search icon does not reveal/focus the field');
      search.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
      if(!search.hidden) throw Error('Escape does not close PDF search');
      // Native outline label and pixel-traced glyph details.
      if(pageToggle.title!=='目录' ||
         !bar.querySelector('[data-pdf-action="rotate"] svg circle[cx="12"]') ||
         !bar.querySelector('[data-pdf-action="expand"] svg path')) {
        throw Error('Directory title or native rotation/expand glyph is incorrect');
      }
      if(getComputedStyle(bar.querySelector('[data-pdf-action="rotate"]')).color!=='rgb(37, 37, 37)') {
        throw Error('Light toolbar icons must be dark, not forced white');
      }
      const legacy=document.getElementById('tex-preview-expand');
      const newExpand=bar.querySelector('[data-pdf-action="expand"]');
      if(getComputedStyle(legacy).display!=='none') {
        throw Error('Old PDF expand icon must not appear outside the toolbar');
      }
      newExpand.click();
      if(!document.body.classList.contains('tex-preview-expanded') ||
         newExpand.getAttribute('aria-expanded')!=='true') {
        throw Error('Native expand icon did not activate the existing preview fullscreen');
      }
      newExpand.click();
      if(document.body.classList.contains('tex-preview-expanded')) {
        throw Error('Native expand icon did not restore the preview');
      }
      report.push({step:'native-toolbar',icons:icons.length,groups:groups.map(r=>Math.round(r.left))});
      document.documentElement.dataset.themeMode='dark';
      document.documentElement.dataset.theme='dark';
      window.dispatchEvent(new Event('aertex-themechange'));
      const dark=await waitFor('dark');
      const darkBar=getComputedStyle(bar);
      if(darkBar.backgroundColor!=='rgb(59, 59, 59)' ||
         getComputedStyle(bar.querySelector('[data-pdf-action="rotate"]')).color!=='rgb(243, 243, 243)') {
        throw Error('Dark PDF toolbar/icons did not inherit the site theme');
      }
      report.push({step:'dark',dark});
      document.documentElement.dataset.themeMode='light';
      document.documentElement.dataset.theme='light';
      window.dispatchEvent(new Event('aertex-themechange'));
      const back=await waitFor('light');
      report.push({step:'light-restored',back});
      if(light.background.some(x=>x<230))throw Error('Original light page is not white');
      if(dark.background.some(x=>x>75))throw Error('Dark PDF background is still white');
      if(!dark.bright || dark.bright<35)throw Error('Dark PDF text was not repainted white: '+dark.bright);
      if(light.css!=='hidden' || dark.css!=='hidden')throw Error('Native user-switchable PDF viewer is still visible');
      if(light.manualTheme || dark.manualTheme || back.manualTheme)throw Error('Manual PDF theme switch is present');
      for(let i=0;i<light.image.length;i++){
        const a=light.image[i],b=dark.image[i];
        if(a.some((v,j)=>Math.abs(v-b[j])>24))
          throw Error('Embedded image pixels changed in dark mode at sample '+i+': '+a+' -> '+b);
      }
      if(back.background.some(x=>x<230))throw Error('PDF did not switch back to light');
      document.body.dataset.pdfThemeQa='PASS';
    }catch(error){
      document.body.dataset.pdfThemeQa='FAIL-'+String(error.message||error);
    }finally{
      document.body.dataset.pdfThemeReport=JSON.stringify(report);
    }
  })();
}

const fixture=pdfFixture();
const base='<html lang="zh-cn" data-theme="light"><head><meta charset="utf-8">'+
'<style>html,body{margin:0;height:100%}body.os-shell{background:#e8e8ea}'+
'.tex-work-app{width:980px;height:760px;margin:0 auto}.tex-live-preview-viewport{position:relative;width:100%;height:740px;overflow:hidden}'+
'#tex-live-preview-frame{display:block;width:100%;height:100%}'+
'#tex-live-preview-placeholder{display:none}</style></head><body class="os-shell">'+
'<section class="tex-work-app"><div class="tex-live-preview-viewport">'+
'<button id="tex-preview-expand" type="button" aria-label="Expand">Legacy expand</button>'+
'<script>document.getElementById("tex-preview-expand").addEventListener("click",()=>document.body.classList.toggle("tex-preview-expanded"));</script>'+
'<iframe id="tex-live-preview-frame" hidden></iframe>'+
'<div id="tex-live-preview-placeholder" hidden></div></div></section>';
const harness='('+browserHarness.toString()+')('+JSON.stringify(fixture)+');';
const html=enhanceWorkTexPdfAutoTheme('<!doctype html>'+base+'<script>'+harness+'</script></body></html>');
const dir=path.resolve(process.env.AERTEX_PREVIEW_DIR || path.join(os.tmpdir(),'aertex-tex-pdf-visual'));
fs.mkdirSync(dir,{recursive:true});
const target=path.join(dir,'pdf-theme-qa.html');
fs.writeFileSync(target,html);
console.log(target,html.length);
