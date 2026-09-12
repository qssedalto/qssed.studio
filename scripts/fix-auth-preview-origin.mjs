import fs from 'node:fs';

function replaceOnce(text, needle, replacement, label) {
  const count = text.split(needle).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one match, found ${count}`);
  return text.replace(needle, replacement);
}

let auth = fs.readFileSync('auth-worker.js', 'utf8');
let main = fs.readFileSync('worker.js', 'utf8');

main = replaceOnce(
  main,
  '  const origin = request.headers.get("Origin") || "";\n  const productionOrigin = "https://auth.qsseda.studio";\n  const previewAllowed = env?.AUTH_PREVIEW_ALLOW_WORKERS_DEV === "1" && /^https:\\/\\/qsseda-auth-preview\\.[a-z0-9-]+\\.workers\\.dev$/i.test(origin);\n  if (origin !== productionOrigin && !previewAllowed) {',
  '  const origin = request.headers.get("Origin") || "";\n  const productionOrigin = "https://auth.qsseda.studio";\n  const previewAllowed = env?.AUTH_PREVIEW_ALLOW_WORKERS_DEV === "1";\n  if (origin !== productionOrigin && !previewAllowed) {',
  'preview origin gate'
);

auth = replaceOnce(
  auth,
  '        <div id="homeActions"><a id="studioButton" class="button" href="/continue">${copy.openStudio}</a><a class="button secondary" href="/account">${copy.account}</a></div>',
  '        <div id="homeActions"><a id="studioButton" class="button" href="/continue">${copy.openStudio}</a><a class="button secondary" href="/account">${copy.account}</a><button id="homeLogoutButton" class="secondary" type="button">${copy.signOut}</button></div>',
  'home logout button'
);

auth = replaceOnce(
  auth,
  '  var page=document.body.dataset.page||"home";\n  var loading=document.getElementById("loading"),signedOut=document.getElementById("signedOut"),signedIn=document.getElementById("signedIn"),loginForm=document.getElementById("loginForm"),loginButton=document.getElementById("loginButton"),loginMessage=document.getElementById("loginMessage"),logoutButton=document.getElementById("logoutButton");',
  '  var page=document.body.dataset.page||"home";\n  var loading=document.getElementById("loading"),signedOut=document.getElementById("signedOut"),signedIn=document.getElementById("signedIn"),loginForm=document.getElementById("loginForm"),loginButton=document.getElementById("loginButton"),loginMessage=document.getElementById("loginMessage"),logoutButton=document.getElementById("logoutButton"),homeLogoutButton=document.getElementById("homeLogoutButton");',
  'home logout variable'
);

auth = replaceOnce(
  auth,
  '  if(logoutButton)logoutButton.addEventListener("click",async function(){logoutButton.disabled=true;try{await fetch("/api/logout",{method:"POST",credentials:"same-origin"})}catch(e){}location.replace("/login")});',
  '  async function signOut(button){if(button)button.disabled=true;try{await fetch("/api/logout",{method:"POST",credentials:"same-origin"})}catch(e){}location.replace("/login")}\n  if(logoutButton)logoutButton.addEventListener("click",function(){signOut(logoutButton)});\n  if(homeLogoutButton)homeLogoutButton.addEventListener("click",function(){signOut(homeLogoutButton)});',
  'logout handlers'
);

fs.writeFileSync('auth-worker.js', auth);
fs.writeFileSync('worker.js', main);
console.log('Fixed preview handoff gate and added home sign-out button.');
