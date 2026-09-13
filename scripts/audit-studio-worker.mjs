import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targetFiles = ['worker.js','auth-entry.js','auth-worker.js','auth-oauth.js','auth-pkce-test.js','wrangler.jsonc','wrangler.auth.jsonc'];

function walk(dir, prefix='') {
  const out=[];
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.wrangler') continue;
    const rel = path.posix.join(prefix, entry.name);
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(abs, rel));
    else out.push({path:rel,size:fs.statSync(abs).size});
  }
  return out;
}

function lineOf(text, index){ return text.slice(0,index).split('\n').length; }

function topLevelFunctions(text){
  const re=/^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/gm;
  const found=[];
  let m;
  while((m=re.exec(text))) found.push({name:m[1],line:lineOf(text,m.index),index:m.index});
  return found.map((item,i)=>({
    name:item.name,
    line:item.line,
    approxEndLine:i+1<found.length?found[i+1].line-1:text.split('\n').length,
    approxLines:(i+1<found.length?found[i+1].line:text.split('\n').length+1)-item.line
  }));
}

function consts(text){
  const re=/^const\s+([A-Za-z_$][\w$]*)\s*=/gm;
  const result=[]; let m;
  while((m=re.exec(text))) result.push({name:m[1],line:lineOf(text,m.index)});
  return result;
}

function matches(text,re){
  const set=new Set(); let m;
  while((m=re.exec(text))) set.add(m[1]);
  return [...set].sort();
}

function analyze(file){
  const text=fs.readFileSync(file,'utf8');
  return {
    file,
    bytes:Buffer.byteLength(text),
    lines:text.split('\n').length,
    functions:topLevelFunctions(text),
    constants:consts(text),
    routes:matches(text,/(?:pathname\s*===|pathname\s*!==)\s*["'`]([^"'`]+)["'`]/g),
    apiPaths:matches(text,/["'`](\/(?:api|auth|oauth|\.well-known)[^"'`$]*)["'`]/g),
    envBindings:matches(text,/env\?*\.([A-Z][A-Z0-9_]*)/g),
    supabaseResources:matches(text,/\/rest\/v1\/([A-Za-z0-9_]+)/g),
    rpcCalls:matches(text,/rpc\/(?:\$\{)?([A-Za-z0-9_]+)/g)
  };
}

const inventory=walk(root).sort((a,b)=>b.size-a.size);
const analyses=targetFiles.filter(f=>fs.existsSync(f)).map(analyze);
const worker=analyses.find(x=>x.file==='worker.js');

const categories={
  auth:[], storage:[], admin:[], ui:[], routing:[], data:[], shared:[]
};
for(const fn of worker?.functions||[]){
  const n=fn.name.toLowerCase();
  if(/auth|login|signup|registration|session|password|user/.test(n)) categories.auth.push(fn);
  else if(/storage|object|upload|r2/.test(n)) categories.storage.push(fn);
  else if(/admin|audit|role/.test(n)) categories.admin.push(fn);
  else if(/page|render|html|css|head|icon|nav|sidebar|modal|panel|card/.test(n)) categories.ui.push(fn);
  else if(/route|path|link|redirect|locale/.test(n)) categories.routing.push(fn);
  else if(/supabase|profile|project|note|summary|task|draft|experiment|knowledge|search|fetch/.test(n)) categories.data.push(fn);
  else categories.shared.push(fn);
}

console.log('=== QssedA repository inventory ===');
for(const f of inventory) console.log(`${String(f.size).padStart(8)}  ${f.path}`);
console.log('\n=== Worker analyses JSON ===');
console.log(JSON.stringify(analyses,null,2));
console.log('\n=== Suggested worker function clusters ===');
console.log(JSON.stringify(categories,null,2));
console.log('\n=== Largest worker functions (approximate, split by next declaration) ===');
console.log(JSON.stringify([...(worker?.functions||[])].sort((a,b)=>b.approxLines-a.approxLines).slice(0,40),null,2));
