import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const src=await readFile(new URL("../auth-worker.js",import.meta.url),"utf8");
const passwordInput='<input id="password" name="password" type="password" autocomplete="current-password" autocapitalize="none" autocorrect="off" spellcheck="false" required>';
assert(src.includes(passwordInput),"Keep native secure input and iCloud Password AutoFill intact.");
assert(src.includes('class="password-entry">'+passwordInput+
  '<div id="passwordVisualMask" class="password-visual-mask" aria-hidden="true"></div>'),
  "Visual overlay must be accessible only as decoration.");
assert(src.includes('html[data-safari-password-mask="on"] #loginForm input[type="password"]'),
  "Only an explicitly enabled WebKit workaround may hide native mask glyphs.");
assert(src.includes('-webkit-text-fill-color:transparent!important'),
  "Hide WebKit broken native secure glyphs under the overlay.");
assert(src.includes('caret-color:var(--text)!important'),
  "Do not hide native password caret or keyboard interaction.");
assert(src.includes('.password-visual-dot{display:block;flex:0 0 7px;width:7px;height:7px;'),
  "Draw true circles using geometry, never font circle or bullet characters.");
assert(src.includes('html[data-safari-password-mask="on"] .password-visual-mask{display:flex}'),
  "Leave native password visuals intact unless the workaround activates.");
assert(src.includes('document.getElementById("password").value})'),
  "Login must submit the original secure field without a parallel plaintext value.");
assert(!src.includes('type="text" autocomplete="current-password"'),
  "No password fields may be converted to plaintext inputs.");

const from=src.indexOf('  function installSafariPasswordVisualMask(){');
const end=src.indexOf('  installSafariPasswordVisualMask();',from);
assert(from>0&&end>from,"Expected isolated Safari visual masking controller.");
const code=src.slice(from,end)+'\ninstallSafariPasswordVisualMask();';
assert.doesNotThrow(()=>new Function("document","window","navigator",code),
  "Visual mask controller must parse in the browser.");

function simulate(touch){
  const fired={};
  const element=(name)=>({
    name,attributes:{},children:[],value:"",scrollLeft:0,
    get childElementCount(){return this.children.length;},
    get lastElementChild(){return this.children[this.children.length-1]||null;},
    setAttribute(k,v){this.attributes[k]=v;},
    addEventListener(k,fn){(fired[name+":"+k]||=[]).push(fn);},
    appendChild(n){this.children.push(n);},
    removeChild(n){this.children.splice(this.children.indexOf(n),1);}
  });
  const input=element("input"),visual=element("visual");
  const root=element("root"),doc=element("document"),win=element("window");
  doc.documentElement=root;doc.hidden=false;
  doc.getElementById=(id)=>id==="password"?input:id==="passwordVisualMask"?visual:null;
  doc.createElement=()=>element("dot");
  win.CSS={supports:()=>true};
  win.setInterval=(fn)=>{win.poll=fn;return 1;};
  win.clearInterval=()=>{};
  const nav={maxTouchPoints:touch?5:0};
  new Function("document","window","navigator",code)(doc,win,nav);
  return {input,visual,root,win,fired};
}
const iPad=simulate(true);
assert.equal(iPad.root.attributes["data-safari-password-mask"],"on");
assert.equal(iPad.visual.childElementCount,0);
const secret="Do-Not-Put-Real-Credentials-In-Tests!42";
iPad.input.value=secret;
iPad.fired["input:input"][0]();
assert.equal(iPad.visual.childElementCount,secret.length,
  "Each inserted character should produce exactly one CSS circle.");
assert(iPad.visual.children.every(e=>e.attributes["aria-hidden"]==="true"&&e.className==="password-visual-dot"));
assert(!JSON.stringify(iPad.visual.children).includes(secret),
  "Overlay must never duplicate the actual password into the DOM.");
assert.equal(iPad.input.value,secret,"Do not alter the real password value.");
iPad.input.value="abc";
iPad.fired["input:change"][0]();
assert.equal(iPad.visual.childElementCount,3,"Paste/deletion updates must remove obsolete circles.");
iPad.input.value="filled-by-system-passwords";
iPad.win.poll();
assert.equal(iPad.visual.childElementCount,iPad.input.value.length,
  "Silent iCloud Passwords AutoFill must be synchronized without relying on an input event.");
const desktop=simulate(false);
assert.equal(desktop.root.attributes["data-safari-password-mask"],undefined,
  "Non-touch browsers must keep native rendering and avoid changes.");
assert.equal(desktop.win.poll,undefined,"No polling or overlay enabled on desktop.");
console.log("iPadOS password mask: securely drawn CSS circles, native secure input, paste, deletion, AutoFill and desktop fallback passed.");
