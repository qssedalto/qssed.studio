import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../studio/ui-shell.js',import.meta.url),'utf8');
const start=source.indexOf('    async function hydrateOsUser() {');
const end=source.indexOf('\n    ${publicMode',start);
assert(start>0&&end>start);
for(const user of [{id:'user',email:'fallback@example.invalid'},
 {id:'user',user_metadata:null},
 {id:'user',user_metadata:{username:'Named',display_name:'Display'}}]){
 for(const present of [true,false]){
  const label={innerText:''};let hydrated=false;
  const ctx=vm.createContext({readStableOsUser:async()=>({user}),document:{getElementById:id=>id==='os-user-name'&&present?label:null},
   sessionStorage:{removeItem(){}},console,hydrateProfileSummary:async()=>{hydrated=true;},
   updateCurrentDevice:async()=>{},hydrateProfileHome:async()=>{},hydrateProfileAudit:async()=>{}});
  await vm.runInContext(source.slice(start,end)+'\nhydrateOsUser();',ctx);
  assert(hydrated,'Missing optional metadata or detached label must not abort account hydration');
  if(present)assert.equal(label.innerText,'@'+(user.user_metadata?.username||user.email||'User'));
 }
}
console.log('PASS: optional/null user metadata and absent account label do not crash Work or skip profile hydration');
