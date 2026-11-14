import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { enhanceWorkTexSearchFilter } from '../studio/ui-work-tex-search-filter.js';

const html='<html><head></head><body><section class="tex-work-app" data-tex-root></section></body></html>';
const zh=enhanceWorkTexSearchFilter(html,true,'admin');
const en=enhanceWorkTexSearchFilter(html,false,'alice');
assert(zh.includes('id="aertex-tex-search-filter-css"'));
assert(zh.includes('id="aertex-tex-search-filter-runtime"'));
assert(zh.includes('/_aertex/fonts/michelangelus-italic-v1.woff2')&&zh.includes('/_aertex/fonts/michelangelus-bolditalic-v1.woff2'), 'Both fonts must be hosted on Work rather than only using local installed faces');
assert(zh.includes('font-weight:400!important')&&zh.includes('font-weight:700!important'));
assert(zh.includes('.tex-tree-file.is-active')&&zh.includes('box-shadow:none!important'));
assert(zh.includes('#tex-project-home')&&zh.includes('background:var(--card)!important'));
assert(zh.includes('stroke-width:43!important'));
assert(zh.includes('#tex-search-filter-panel')&&zh.includes('.tex-found-entry'));
assert(zh.includes('tex-explorer-search-row')&&zh.includes('grid-template-columns:minmax(0,1fr) 38px'),
  'Filter button must sit alongside a shortened search field, not inside it');
assert(zh.includes('max-height:none!important')&&zh.includes('overflow:visible!important'),
  'Standard filter sheet must fit within one screen without an internal scrollbar');
assert(zh.includes('tex-filter-date-control')&&zh.includes('tex-filter-size-control'),
  'Use readable date buttons and an inline KB/MB selector');
assert(zh.includes('stroke-width:2.1!important')&&zh.includes('stroke:currentColor!important'));
const script=zh.match(/<script id="aertex-tex-search-filter-runtime">([\s\S]*?)<\/script>/)?.[1];
assert(script);
new vm.Script(script);
assert(script.includes('owner="admin"'));
assert(script.includes('/api/tex/documents?id=')&&script.includes("api('/api/tex/documents')"));
assert(script.includes('state.types[e.type]')&&script.includes('state.status')&&script.includes('state.maxSize'));
assert(script.includes('searchRow.append(box,button)')&&script.includes("sizeUnit:'KB'"));
assert(!script.includes('showPicker') && !script.includes("picker.type='date'"),
  'No hidden 1px date input: it creates a clipped, unreadable native picker');
assert(script.includes('calendarPop.hidden=false')&&script.includes('renderCalendar()')&&
  script.includes("dateFields[key].display.textContent=dateLabel(value)")&&
  script.includes("state.sizeUnit==='MB'?1048576:1024"),
  'Accessible styled calendar and KB/MB filters must remain functional');
assert(zh.includes('tex-date-calendar-nav')&&zh.includes('tex-calendar-grid')&&
  zh.includes('tex-date-calendar[hidden]')&&zh.includes('color-scheme:dark'),
  'Calendar uses a visible themed day grid and readable selects');
assert(!script.includes('content.append(title,path,meta)'),
  'Search result paths, timestamps and sizes must not permanently consume sidebar height');
assert(script.includes('Date.parse')&&script.includes("created_at")&&script.includes("updated_at"));
assert(script.includes("e.stopImmediatePropagation()"),'Legacy title-only search must not empty the browser tree');
assert(script.includes('row.title=info(entry)')&&script.includes('copy.path'), 'Path and metadata on result hover');
assert(script.includes('row.title=info(entry)'), 'Normal tree must expose metadata tooltips');
assert(script.includes('getIndex(p)'), 'Results must come from authenticated project records, not demo data');
assert(en.includes('owner="alice"')&&en.includes("No matching projects or files"));
const files=fs.readFileSync(new URL('../studio/tex-project-files-api.js',import.meta.url),'utf8');
assert(files.includes('created_at: before?.created_at')&&files.includes('updated_at: changed ? changeAt'));
assert(files.includes('file_write_conflict'), 'File revision CAS must remain intact');
const source=fs.readFileSync(new URL('../studio/tex-api-core.js',import.meta.url),'utf8');
assert(source.includes('main_file_created_at')&&source.includes('main_file_updated_at'));
assert(source.includes('commitTexSourceSave'), 'Source collaboration gate must remain intact');
const entry=fs.readFileSync(new URL('../studio/entry.js',import.meta.url),'utf8');
assert(entry.includes('enhanceWorkTexSearchFilter(markup, zh, verifiedOwnerSlug)'));
const icon=fs.readFileSync(new URL('../studio/assets/tex-document-outline.svg',import.meta.url),'utf8');
assert(icon.includes('stroke-width="43"')&&icon.includes('viewBox="0 0 447 447"'));
console.log('Authenticated Work TeX search/filter, theme/font, metadata, unsaved safety and SVG contracts passed.');
