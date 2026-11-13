// First-paint guard for the standalone Work TeX editor.
// The HTML response contains late style/runtime enrichments; without a guard,
// the browser can paint the raw welcome copy, icons and starter layout first.
// Install the mask in <head>, BEFORE the body is parsed, and remove it only
// after the final client enhancements have had a chance to render.
export function guardWorkTexFirstPaint(markup) {
  let output = String(markup || "");
  if (!output.includes("<head>") || !/<html\b/i.test(output) || !output.includes('class="tex-workbench tex-work-app"')) {
    return output;
  }
  if (output.includes('id="aertex-tex-first-paint-style"')) return output;

  // The attribute is emitted by the server, not added after DOMContentLoaded;
  // this keeps the mask present even on a slow connection / slow script load.
  output = output.replace(/(<html\b[^>]*)(>)/i, '$1 data-aertex-tex-boot="loading"$2');
  const earlyStyles = `<style id="aertex-tex-first-paint-style">
:root[data-aertex-tex-boot="loading"]{
  --aertex-tex-boot-bg:#fff;
  background-color:var(--aertex-tex-boot-bg)!important;
}
@media(prefers-color-scheme:dark){
  :root[data-aertex-tex-boot="loading"]{--aertex-tex-boot-bg:#0b0b0d}
}
:root[data-theme="light"][data-aertex-tex-boot="loading"]{--aertex-tex-boot-bg:#fff}
:root[data-theme="dark"][data-aertex-tex-boot="loading"]{--aertex-tex-boot-bg:#0b0b0d}
:root[data-aertex-tex-boot="loading"]::after{
  content:"";display:block;position:fixed;inset:0;
  z-index:2147483647;pointer-events:auto;
  background:var(--aertex-tex-boot-bg);
  /* CSS-only escape hatch if the page's inline runtime is blocked or crashes. */
  animation:aertex-tex-boot-safety 0s linear 7s both;
}
@keyframes aertex-tex-boot-safety{to{visibility:hidden;pointer-events:none}}
</style><noscript><style>
:root[data-aertex-tex-boot="loading"]::after{display:none!important}
</style></noscript>`;

  // Place the critical CSS before any external scripts or late page styles.
  output = output.replace("<head>", "<head>" + earlyStyles);
  const releaseScript = `<script id="aertex-tex-first-paint-runtime">
(() => {
  const root=document.documentElement;
  if(root.dataset.aertexTexBoot!=="loading")return;
  let released=false;
  const release=()=>{
    if(released)return;
    released=true;
    window.clearTimeout(hardLimit);
    root.removeAttribute("data-aertex-tex-boot");
    window.dispatchEvent(new Event("aertex:tex-first-paint-ready"));
  };
  // Never trap the user behind a loading screen if a compiler, font or plugin
  // is unavailable. The shield is visual only and is not an auth/lock screen.
  const hardLimit=window.setTimeout(release,4500);
  const sleep=ms=>new Promise(resolve=>window.setTimeout(resolve,ms));
  const paint=()=>new Promise(resolve=>{
    if(typeof requestAnimationFrame==="function")requestAnimationFrame(()=>requestAnimationFrame(resolve));
    else window.setTimeout(resolve,32);
  });
  const prepared=()=>{
    const app=document.querySelector(".tex-work-app[data-tex-root]");
    if(!app || !document.getElementById("aertex-tex-compile-toolbar-style"))return false;
    // The welcome copy has an independent late stylesheet; never reveal its
    // undecorated text before that stylesheet exists in the parsed document.
    if(app.querySelector(".qtex-welcome")&&!document.getElementById("qsseda-work-tex-welcome-clean"))return false;
    const editor=app.querySelector("#tex-editor");
    if(editor&&!editor.hidden&&!document.getElementById("tex-title-static"))return false;
    return true;
  };
  const ready=async()=>{
    try{
      // Parsing plus one layout cycle is essential: several injected scripts
      // initialize via setTimeout, and system fonts need one stable paint.
      await Promise.all([
        sleep(520),
        Promise.race([
          document.fonts?.ready?.catch(()=>{})||Promise.resolve(),
          sleep(850)
        ])
      ]);
      for(let tries=0;tries<22&&!prepared();tries++)await sleep(90);
      await paint();
    }catch{}
    release();
  };
  if(document.readyState==="loading")
    document.addEventListener("DOMContentLoaded",()=>void ready(),{once:true});
  else void ready();
})();
</script>`;
  // A final bootstrap script runs after the UI's dynamically appended
  // enhancers. Never hide the actual content nodes or intercept application
  // events: only the root pseudo-element covers the transient first paint.
  return output + releaseScript;
}
