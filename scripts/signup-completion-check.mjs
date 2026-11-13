import assert from "node:assert/strict";
import vm from "node:vm";
import { signUpPage } from "../studio/auth-pages.js";
import { TEXT } from "../studio/config.js";
import { buildLinks } from "../studio/routing.js";

function registrationHarness(zh, responder) {
  const markup = signUpPage(
    zh ? TEXT.zh : TEXT.en, buildLinks(zh ? "zh" : "en", "/sign-up"),
    {country: zh ? "CN" : "US"}
  );
  assert(markup.includes('id="signup-complete"'), "Final registration result screen must exist.");
  assert(markup.includes('role="status" aria-live="polite"'), "Completion must be announced accessibly.");
  const marker = "<script>\n    const adminEmails = ";
  const begin = markup.indexOf(marker);
  const end = markup.indexOf("</script>", begin);
  assert(begin >= 0 && end > begin, "Sign-up wizard inline script not found.");
  const code = markup.slice(begin + "<script>".length, end);
  const nodes=new Map();
  class FakeElement {
    constructor(id) {
      this.id=id;this.style={display:id==="step-password"?"none":""};this.disabled=false;
      this.textContent="";this.innerHTML="";this.value="";this.checked=false;this.listeners={};
      this.attrs={};this.classList={toggle(){},add(){},remove(){}};
    }
    addEventListener(name,fn) {this.listeners[name]=fn;}
    setAttribute(name,value) {this.attrs[name]=String(value);}
    removeAttribute(name) {delete this.attrs[name];}
    insertAdjacentHTML() {}
    querySelector() {return node("completion-icon");}
    focus() {}
  }
  function node(id) {
    if(!nodes.has(id))nodes.set(id,new FakeElement(id));
    return nodes.get(id);
  }
  const document={
    getElementById:node,
    querySelectorAll:()=>[],
    querySelector:()=>null
  };
  let requests=0;
  const context=vm.createContext({
    document,FormData,Date,Math,URL,
    window:{setTimeout(){return 1;},clearTimeout(){}},
    fetch:async (...args)=>{requests++;return responder(...args);}
  });
  vm.runInContext(code,context,{filename:"signup-generated.js"});
  node("create-account-btn").textContent=zh?"开始使用":"Get Started";
  vm.runInContext([
    'username="math-researcher";',
    'firstName="Test";lastName="User";userEmail="example@test.invalid";',
    'birthDate="2000-01-01";gender="female";',
    'passwordInput.value="Abcdef1!strong";',
    'confirmPasswordInput.value=passwordInput.value;',
    'passwordConfirmationValid=true;',
    'document.getElementById("step-password").style.display="block";',
    'updatePasswordStrength();'
  ].join("\n"),context);
  assert.equal(node("create-account-btn").disabled,false,"Valid password and confirmation enable registration.");
  return {context,node,get requests(){return requests;},submit:()=>node("create-account-btn").listeners.click()};
}

const success=registrationHarness(true,async(url,opts)=>{
  assert.equal(url,"/api/auth/signup");
  assert.equal(opts.method,"POST");
  assert.equal(opts.credentials,"same-origin");
  assert.equal(opts.body.get("username"),"math-researcher");
  assert.equal(opts.body.get("email"),"example@test.invalid");
  return {ok:true,status:200,json:async()=>({success:true,avatar_status:"skipped"})};
});
await success.submit();
assert.equal(success.requests,1);
assert.equal(success.node("signup-complete").style.display,"block");
assert.equal(success.node("step-password").style.display,"none");
assert.equal(success.node("post-signup-actions").style.display,"block");
assert.match(success.node("signup-complete-title").textContent,/注册申请已提交/);
assert.equal(success.node("create-account-btn").disabled,true,"Submit must stay disabled after success.");
assert.equal(success.node("create-account-btn").attrs["aria-busy"],undefined);
vm.runInContext("updatePasswordStrength()",success.context);
await success.submit();
assert.equal(success.requests,1,"A second click after successful registration must not POST again.");
assert.notEqual(success.node("step-username").style.display,"block",
  "A completed signup must never return to username as taken.");

let resolvePending;
const pending=registrationHarness(false,()=>new Promise(resolve=>{resolvePending=resolve;}));
const pendingPromise=pending.submit();
assert.equal(pending.requests,1);
assert.equal(pending.node("create-account-btn").disabled,true);
vm.runInContext("updatePasswordStrength()",pending.context);
assert.equal(pending.node("create-account-btn").disabled,true,
  "Keyboard blur/validation during a request must not unlock the submit button.");
await pending.submit();
assert.equal(pending.requests,1,"Concurrent double-click must produce only one request.");
resolvePending({ok:true,status:200,json:async()=>({success:true,avatar_status:"failed"})});
await pendingPromise;
assert.equal(pending.node("signup-complete").style.display,"block");
assert.match(pending.node("signup-complete-detail").textContent,/profile photo/);

const unknown=registrationHarness(true,async()=>{throw Error("network dropped after server creation");});
await unknown.submit();
assert.equal(unknown.node("signup-complete").style.display,"block");
assert.match(unknown.node("signup-complete-title").textContent,/确认注册结果/);
assert.equal(unknown.node("create-account-btn").disabled,true);
await unknown.submit();
assert.equal(unknown.requests,1,"Uncertain server result must not be automatically retried.");
assert.equal(unknown.node("step-username").style.display,"none");

for(const code of [500,503,429]){
  const transient=registrationHarness(false,async()=>({
    ok:false,status:code,json:async()=>({error:"upstream error"})
  }));
  await transient.submit();
  assert.equal(transient.requests,1);
  assert.equal(transient.node("create-account-btn").disabled,true);
  assert.equal(transient.node("signup-complete").style.display,"block");
  await transient.submit();
  assert.equal(transient.requests,1,"Ambiguous 5xx/429 must not create duplicate accounts.");
}

const taken=registrationHarness(true,async()=>({
  ok:false,status:409,json:async()=>({field:"username",error:"username_taken"})
}));
await taken.submit();
assert.equal(taken.node("step-username").style.display,"block",
  "An actual first-attempt username conflict should still allow correction.");
assert.equal(taken.node("username-next-btn").disabled,true);
assert.equal(taken.node("create-account-btn").disabled,true,
  "Returning to username cannot leave a hidden submission enabled.");
assert.match(taken.node("username-status").textContent,/被使用/);

console.log("Registration completion, duplicate-submit guard, pending keyboard blur, network-unknown, and genuine conflict checks passed.");
