import assert from 'node:assert/strict';
import vm from 'node:vm';
import * as Y from '../tex-vendor/node_modules/yjs/dist/yjs.mjs';
import { enhanceWorkTexRealtime } from '../studio/ui-work-tex-realtime.js';
const html=enhanceWorkTexRealtime('',false);
let runtime=html.match(/<script id="qsseda-work-tex-realtime-runtime">([\s\S]*?)<\/script>/)[1];
function replaceFunction(name, body){
  const re=new RegExp('^        (?:async )?function '+name+'\\(','m'),match=re.exec(runtime);
  assert(match,'Missing function '+name);
  const next=/^        (?:async )?function /gm;next.lastIndex=match.index+match[0].length;
  const ending=next.exec(runtime);assert(ending,'Missing function boundary '+name);
  runtime=runtime.slice(0,match.index)+'        '+body+'\n\n'+runtime.slice(ending.index);
}
replaceFunction('loadYjs','function loadYjs(){Y=testY;return Promise.resolve(testY);}');
replaceFunction('activeElements','function activeElements(){return testElements;}');
replaceFunction('activeDocumentId','function activeDocumentId(){return testContext.document.id;}');
for(const name of ['setStatus','applyAccessRole','updateLiveSettingsSurface','renderPresence','sendPresence','publishPresence','maybeCompact'])
  replaceFunction(name,`function ${name}(){}`);
runtime=runtime.replace('        window.setTimeout(init, 0);','        window.testApi={connectDocument,installInputBindings,closeConnection,current:()=>connection};');
class Element extends EventTarget{
  constructor(value=''){super();this.value=value;this.selectionStart=this.selectionEnd=0;this.selectionDirection='forward';}
  setSelectionRange(a,b,d){this.selectionStart=a;this.selectionEnd=b;this.selectionDirection=d;}
}
class Socket extends EventTarget{
  static OPEN=1;static CONNECTING=0;static instances=[];
  constructor(url){super();this.url=url;this.readyState=1;this.sent=[];Socket.instances.push(this);}
  send(data){this.sent.push(JSON.parse(data));}
  close(code){this.readyState=3;this.closedCode=code;}
  emit(type,data={}){const event=new Event(type);for(const [key,value] of Object.entries(data))Object.defineProperty(event,key,{value});this.dispatchEvent(event);}
  message(value){this.emit('message',{data:JSON.stringify(value)});}
}
const id='22222222-2222-4222-8222-222222222222';
function fixture(){
  const elements={root:{},list:{},source:new Element('A'),title:new Element('Draft'),engine:new Element('xelatex')};
  const context={document:{id,source:'A',title:'Draft',engine:'xelatex',realtime_epoch:'v2'}};
  const events=[];const win=new EventTarget();
  Object.assign(win,{fetch:async()=>new Response('{}'),setTimeout:()=>1,clearTimeout(){},__aertexFileGetContext:()=>context});
  win.addEventListener('aertex:tex-local-conflict',event=>events.push(event.detail));
  const sandbox={window:win,document:{getElementById:name=>elements[({ 'tex-source':'source','tex-title':'title','tex-engine':'engine'})[name]],querySelector:()=>null},
    location:{href:'https://work.qsseda.com/zh-cn/d/'+id,origin:'https://work.qsseda.com',protocol:'https:'},
    testY:Y,testElements:elements,testContext:context,URL,Response,Request,Headers,Event,CustomEvent,WebSocket:Socket,
    TextEncoder,TextDecoder,Uint8Array,ArrayBuffer,atob,btoa,console};
  vm.runInNewContext(runtime,sandbox,{timeout:1000});
  win.testApi.installInputBindings();return{...win.testApi,win,elements,context,events};
}
function seed(){const doc=new Y.Doc();doc.getText('source').insert(0,'A');doc.getMap('meta').set('title','Draft');doc.getMap('meta').set('engine','xelatex');return doc;}
const b64=doc=>Buffer.from(Y.encodeStateAsUpdate(doc)).toString('base64');
const sync=(socket,doc)=>socket.message({type:'sync',initialized:true,source_epoch:'v2',snapshot:b64(doc),updates:[],sequence:0,role:'owner',client_id:'self'});
const f=fixture(),server=seed();
await f.connectDocument(id);const first=Socket.instances.at(-1);
f.elements.source.value='A-local';f.elements.source.dispatchEvent(new Event('input'));
sync(first,server);
assert.equal(f.elements.source.value,'A-local','Initial synchronization must not overwrite typing made during connection');
assert.equal(f.current().ytext.toString(),'A-local');
assert.equal(f.current().conflict,false);
Y.applyUpdate(server,Y.encodeStateAsUpdate(f.current().ydoc));
const oldDoc=f.current().ydoc;
first.emit('close',{code:1006});
f.elements.source.value+='-offline';f.elements.source.dispatchEvent(new Event('input'));
assert(f.current().ytext.toString().includes('-offline'),'Offline input must enter the retained CRDT');
server.getText('source').insert(0,'remote-');
await f.connectDocument(id);const second=Socket.instances.at(-1);
assert.equal(f.current().ydoc,oldDoc,'Reconnect must reuse the same Y.Doc/client IDs');
sync(second,server);
assert(f.elements.source.value.includes('remote-')&&f.elements.source.value.includes('-offline'),'Both remote and offline edits must survive reconnect');
assert(second.sent.some(message=>message.type==='update'),'Unacknowledged local state must be resent after synchronization');
first.emit('close',{code:1006});assert.equal(f.current().ready,true,'An old socket close cannot deactivate the replacement socket');
assert(f.win.__aertexTexExportState(id,'v2'));assert.equal(f.win.__aertexTexExportState(id,'wrong'), '');
const g=fixture(),changed=seed();changed.getText('source').insert(0,'new-');
await g.connectDocument(id);const third=Socket.instances.at(-1);
g.elements.source.value='A-draft';g.elements.source.dispatchEvent(new Event('input'));sync(third,changed);
assert.equal(g.elements.source.value,'A-draft','A conflicting initial snapshot must not erase the draft');
assert.equal(g.current().conflict,true);assert.equal(g.win.__aertexTexCanSave(id),false);assert.equal(g.events.length,1);
assert(!third.sent.some(message=>message.type==='update'),'Conflicting full text must not overwrite remote edits');
const h=fixture();await h.connectDocument(id);const fourth=Socket.instances.at(-1);
h.elements.source.value='A-unsaved';h.elements.source.dispatchEvent(new Event('input'));
fourth.message({type:'sync',initialized:true,source_epoch:'v2',snapshot:b64(seed()),updates:[],sequence:0,role:'viewer',client_id:'self'});
assert.equal(h.elements.source.value,'A-unsaved','Viewer demotion must not erase an unsaved draft');
assert.equal(h.current().conflict,true);assert.equal(h.win.__aertexTexCanSave(id),false);assert.equal(h.events.length,1);
f.closeConnection();g.closeConnection();h.closeConnection();server.destroy();changed.destroy();
console.log('PASS: real Yjs initial typing, offline retention, reconnect merge, old socket isolation, export epoch and initial-conflict preservation');
