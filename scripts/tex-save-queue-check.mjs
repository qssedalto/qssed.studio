import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import { TEX_SAVE_INTEGRITY_RUNTIME } from '../studio/ui-tex-save-integrity.js';

function harness() {
  const requests=[],states=[],messages=[],events=[],listeners=new Map();
  const c=vm.createContext({
    activeId:'one',activeDocument:{id:'one',source:'old'},dirty:true,
    title:{value:'Title'},engine:{value:'xelatex'},source:{value:'A'},
    saveSequence:0,saveTimer:null,copy:{saving:'saving',unsaved:'unsaved',saved:'saved',error:'error'},
    window:{clearTimeout(){},dispatchEvent(e){events.push(e);},addEventListener(n,f){listeners.set(n,f);}},
    CustomEvent:class { constructor(type,options){this.type=type;this.detail=options.detail;} },
    updateLocal(){},setSaveState:(...args)=>states.push(args),showMessage:(...args)=>messages.push(args),
    api:(url,options)=>new Promise((resolve,reject)=>requests.push({url,body:JSON.parse(options.body),resolve,reject})),
    encodeURIComponent,Promise,
  });
  vm.runInContext('function snapshot(){return {title:title.value,engine:engine.value,source:source.value};}',c);
  vm.runInContext(TEX_SAVE_INTEGRITY_RUNTIME,c);
  return {c,requests,states,messages,events,listeners,save:()=>vm.runInContext('saveCurrent(true)',c)};
}
const tick=()=>new Promise(r=>setImmediate(r));
const succeed=(r)=>r.resolve({document:{id:'one',...r.body,storage_revision:'etag'}});
{
  const h=harness(),a=h.save(),b=h.save();
  assert.equal(a,b,'All callers must share the same save promise');
  assert.equal(h.requests.length,1,'No duplicate PUT while one is pending');
  h.c.source.value='AB';h.c.dirty=true;
  succeed(h.requests[0]);await tick();
  assert.equal(h.requests.length,2,'Typing during PUT must be flushed as a second serialized revision');
  assert.equal(h.requests[1].body.source,'AB');
  assert.equal(h.c.source.value,'AB','An older response must never repaint editor text');
  succeed(h.requests[1]);assert.equal(await a,true);assert.equal(h.c.dirty,false);
  assert.equal(h.events.length,2);
}
{
  const h=harness(),promise=h.save();
  h.requests[0].reject(new Error('Conflict; keep edits'));
  assert.equal(await promise,false);assert.equal(h.c.dirty,true);
  assert.equal(h.c.source.value,'A');assert.equal(h.c.activeDocument.source,'old');
  assert.equal(h.messages[0][0],'Conflict; keep edits');
  const retry=h.save();assert.equal(h.requests.length,2);
  succeed(h.requests[1]);assert.equal(await retry,true,'Failed queue must be retryable');
}
{
  const h=harness(),promise=h.save();
  h.requests[0].resolve({document:{id:'other',source:'wrong'}});
  assert.equal(await promise,false);assert.equal(h.c.dirty,true);
  assert.equal(h.c.activeDocument.id,'one');
}
{
  const h=harness(),promise=h.save();h.c.activeId='two';h.c.activeDocument={id:'two'};
  succeed(h.requests[0]);assert.equal(await promise,false);
  assert.equal(h.c.activeDocument.id,'two','A late response must not replace a different active document');
}
{
  const h=harness();let prevented=false;
  const event={preventDefault(){prevented=true;}};h.listeners.get('beforeunload')(event);
  assert.equal(prevented,true);assert.equal(event.returnValue,'');
  h.c.dirty=false;h.c.activeDocument={id:'one',title:'Title',engine:'xelatex',source:'A'};
  prevented=false;h.listeners.get('beforeunload')(event);assert.equal(prevented,false,
    'No warning when actual source/title/engine match saved content even if dirty flags were stale');
}
const load=f=>fs.readFileSync(new URL('../studio/'+f,import.meta.url),'utf8');
assert(load('ui-work-tex-document-switch.js').includes('if(force)documentFastFetch.delete(id)'));
assert(load('ui-tex-workbench.js').includes('if(!(await saveCurrent(true))){restoreUnsavedRoute();return;}'));
assert(load('ui-tex-project-controls.js').includes('if(!(await saveCurrent(true)))'));
assert(load('ui-work-tex-editor-tools.js').includes('__aertexFileGetContext'));
console.log('PASS: serialized saves, in-flight edits, failure/retry, wrong-document response, unload warning and navigation guards');
