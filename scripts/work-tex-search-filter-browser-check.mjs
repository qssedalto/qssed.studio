import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { enhanceWorkTexSearchFilter } from '../studio/ui-work-tex-search-filter.js';

const browser=['/usr/bin/chromium','/usr/bin/google-chrome','/usr/bin/chromium-browser'].find(fs.existsSync);
if(!browser){console.log('Chromium not installed; static search-filter test still runs.');process.exit(0)}
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'aertex-search-qa-'));
try{
  const html=String.raw`<!doctype html><html data-theme="dark"><head><meta charset="utf-8"><style>
:root{--card:#242426;--fill:#313135;--border:#484850;--text:#f7f7fa;--muted:#aaaaaf;--primary:#0a84ff}
body{margin:0;background:#18181b;color:var(--text);font:13px "Segoe UI",sans-serif}
.tex-documents-panel{width:445px;height:95vh;display:flex;flex-direction:column;padding:14px;box-sizing:border-box}
.tex-panel-head{height:36px}.tex-create-row{display:grid;grid-template-columns:48px minmax(0,1fr) 48px;gap:8px;margin-bottom:8px}
.tex-search{height:46px;border:1px solid var(--border);border-radius:13px}
#tex-search-results{min-height:0}
</style></head><body class="os-shell">
<section class="tex-work-app" data-tex-root data-tex-collaboration-document-id="11111111-1111-4111-8111-111111111111">
<aside class="tex-documents-panel">
<div class="tex-panel-head"><strong>LaTex</strong></div>
<div class="tex-create-row"><a id="tex-project-home" href="/">Home</a><button id="tex-create">+</button></div>
<div class="tex-search"><svg></svg><input id="tex-search" type="search"></div>
<div id="tex-document-list">
<button class="tex-document-item" data-tex-document-id="11111111-1111-4111-8111-111111111111"><strong>APMCM</strong></button>
<div class="tex-tree-children">
<button class="tex-tree-file is-active" data-project="11111111-1111-4111-8111-111111111111" data-file="main.tex"><span>main.tex</span></button>
</div></div>
<div id="tex-documents-empty">No projects</div>
</aside>
<span id="tex-save-state">已自动保存</span>
</section>
<script>
window.fetch=async (url)=>{
 const project={id:'11111111-1111-4111-8111-111111111111',title:'APMCM',
 created_at:'2026-11-13T12:00:00.000Z',updated_at:'2026-11-14T12:00:00.000Z',preview:'math paper'};
 const document={...project,main_filename:'main.tex',source:'test source',main_file_created_at:project.created_at,main_file_updated_at:project.updated_at,
 files:[{name:'chapters/introduction.tex',encoding:'utf8',content:'chapter one',
 created_at:'2026-11-13T13:00:00.000Z',updated_at:'2026-11-14T11:00:00.000Z'}]};
 return {ok:true,json:async()=>String(url).includes('?id=')?{document}:{documents:[project]}};
};
window.addEventListener('error',e=>{document.body.dataset.qa='ERROR-'+String(e.message)+'-at-'+e.lineno});
window.addEventListener('unhandledrejection',e=>{document.body.dataset.qa='REJECTION-'+String(e.reason)});
window.addEventListener('load',()=>{
 setTimeout(()=>{
  const input=document.querySelector('#tex-search');
  const btn=document.getElementById('tex-search-filter');
  const checks=[];
  checks.push(!!btn);
  checks.push(btn.parentElement?.classList.contains('tex-explorer-search-row')===true);
  checks.push(!btn.closest('.tex-search'));
  input.value='main';input.dispatchEvent(new Event('input',{bubbles:true}));
  setTimeout(()=>{
   const matches=[...document.querySelectorAll('#tex-search-results .tex-found-entry')];
   checks.push(matches.some(x=>x.dataset.type==='file'&&x.querySelector('.tex-found-name').textContent==='main.tex'));
   checks.push(matches.some(x=>x.title.includes('admin/APMCM/main.tex')&&x.title.includes('创建')));
   checks.push(document.querySelector('#tex-document-list').hidden===true);
   checks.push(!matches.some(x=>x.querySelector('.tex-found-path,.tex-found-detail')));
   checks.push(matches.every(x=>Math.abs(x.getBoundingClientRect().height-35)<1.5));
   btn.click();
   const popup=document.getElementById('tex-search-filter-panel');
   checks.push(!popup.hidden&&btn.getAttribute('aria-expanded')==='true');
   const inputFile=popup.querySelector('input[data-type="file"]');
   checks.push(!!inputFile);
   checks.push(popup.scrollHeight<=popup.clientHeight+5 && getComputedStyle(popup).overflowY==='visible');
   const head=popup.querySelector('.tex-filter-head');
   checks.push(head.getBoundingClientRect().height<45 && head.querySelector('h2').getBoundingClientRect().height<27);
   const tick=popup.querySelector('[data-action="done"]');
   checks.push(tick.offsetWidth<=40 && tick.offsetHeight<=40 && !!tick.querySelector('svg'));
   const dates=[...popup.querySelectorAll('.tex-filter-date-label .tex-date-text')];
   checks.push(dates.length===2 && dates.every(x=>x.textContent==='选择日期'));
   const unit=popup.querySelector('[data-key="sizeUnit"]');
   checks.push(unit?.value==='KB' && [...unit.options].map(x=>x.value).join(',')==='KB,MB');
   const pickerButton=popup.querySelector('.tex-filter-date-label');
   checks.push(pickerButton && !pickerButton.querySelector('input[type="date"]'));
   pickerButton.click();
   const calendar=popup.querySelector('#tex-filter-calendar');
   checks.push(!calendar.hidden && pickerButton.getAttribute('aria-expanded')==='true');
   checks.push(calendar.getBoundingClientRect().width>=250 &&
     calendar.getBoundingClientRect().bottom<=innerHeight+1);
   checks.push(calendar.querySelectorAll('.tex-calendar-grid button:not(:disabled)').length>=28);
   checks.push(getComputedStyle(calendar).colorScheme.includes('dark'));
   const year=calendar.querySelector('[data-calendar-year]');
   year.value='2026';year.dispatchEvent(new Event('change',{bubbles:true}));
   const month=calendar.querySelector('[data-calendar-month]');
   month.value='10';month.dispatchEvent(new Event('change',{bubbles:true}));
   const date=[...calendar.querySelectorAll('.tex-calendar-grid button:not(:disabled)')]
     .find(x=>x.textContent==='13');
   checks.push(!!date);
   date?.click();
   checks.push(calendar.hidden && pickerButton.getAttribute('aria-expanded')==='false');
   checks.push(pickerButton.querySelector('.tex-date-text').textContent==='2026/11/13');
   checks.push(document.querySelector('#tex-search-results').hidden===false);
   pickerButton.click();calendar.querySelector('[data-calendar-clear]').click();
   checks.push(pickerButton.querySelector('.tex-date-text').textContent==='选择日期');
   checks.push(calendar.hidden);
   checks.push(getComputedStyle(unit).colorScheme.includes('dark'));
   unit.value='MB';unit.dispatchEvent(new Event('change',{bubbles:true}));
   checks.push(unit.value==='MB');
   checks.push(getComputedStyle(document.querySelector('.tex-tree-file.is-active')).boxShadow==='none');
   const row=document.querySelector('.tex-tree-file');
   row.dispatchEvent(new PointerEvent('pointerover',{bubbles:true}));
   checks.push(row.title.includes('admin/APMCM/main.tex'));
   checks.push(btn.getBoundingClientRect().left>=input.getBoundingClientRect().right);
   input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));
   checks.push(document.querySelector('#tex-document-list').hidden===false);
   document.body.dataset.qa=checks.every(Boolean)?'PASS':'FAIL-'+JSON.stringify(checks);
  },1600);
 },80);
});
</script></body></html>`;
  const page=enhanceWorkTexSearchFilter(html,true,'admin');
  const filepath=path.join(dir,'qa.html');fs.writeFileSync(filepath,page);
  const result=spawnSync(browser,['--headless','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--allow-file-access-from-files','--virtual-time-budget=6000','--dump-dom',pathToFileURL(filepath).href],
    {encoding:'utf8',timeout:30000,maxBuffer:8*1024*1024});
  assert.equal(result.status,0,result.stderr.slice(-2000));
  const match=result.stdout.match(/data-qa="([^"]+)"/);
  assert.equal(match?.[1],'PASS',match?.[1]||('Search QA did not execute: '+result.stdout.slice(-1500)+' | stderr='+result.stderr.slice(-800)));
  console.log('Headless Chromium verified accessible dark calendar, date selection and clearing, KB/MB dropdown, search results and tooltip metadata.');
}finally{fs.rmSync(dir,{recursive:true,force:true})}
