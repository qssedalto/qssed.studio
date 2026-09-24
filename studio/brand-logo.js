export const AERTEX_MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <g fill="currentColor">
    <path d="M32 5L7 58h13l13-29 4-9-2-15z"/>
    <path d="M32 5h5l18 37-13 3-9-19z"/>
    <path d="M44 47l6 11h12l-9-15z"/>
    <path d="M5 58c13-13 32-20 55-19-18 3-33 10-43 19z"/>
  </g>
</svg>`;

export const AERTEX_WORDMARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1048 240" aria-hidden="true" focusable="false">
  <g fill="currentColor">
    <path d="M92 18L16 194h42l35-82 18-42-19-52z"/>
    <path d="M92 18h15l55 114-42 8-28-59z"/>
    <path d="M130 154l21 40h45l-33-47z"/>
    <path d="M8 194c43-43 103-64 180-61-60 9-110 31-140 61z"/>

    <path d="M208 45h140v35H251v27h77v31h-77v22h97v35H208z"/>
    <path fill-rule="evenodd" d="M373 45h101c49 0 77 23 77 61 0 29-15 49-45 59l52 30h-54l-45-26h-43v26h-43zm43 35v57h53c27 0 39-10 39-29 0-18-12-28-39-28z"/>
    <path d="M577 45h151v37h-54v113h-43V82h-54z"/>
    <path d="M752 45h140v35h-97v27h77v31h-77v22h97v35H752z"/>
    <path d="M912 45h48l33 48 31-48h24l-49 73 49 77h-48l-35-51-34 51h-49l58-78z"/>
  </g>
</svg>`;

const STATIC_WORDMARK = `<span class="aertex-wordmark-token" data-aertex-wordmark="" role="img" aria-label="AERTEX">${AERTEX_WORDMARK_SVG}</span>`;

const STYLE = `<style id="aertex-wordmark-style">
.aertex-wordmark-token{display:inline-flex;align-items:center;vertical-align:-.12em;line-height:1;white-space:nowrap;width:4.37em;max-width:100%;color:inherit;flex:0 0 auto}
.aertex-wordmark-token>svg{display:block;width:100%;height:auto;max-width:100%;color:currentColor}
</style>`;

const SCRIPT = `<script id="aertex-wordmark-runtime">
(function(){
  if(window.__aertexWordmarkRuntime)return;
  window.__aertexWordmarkRuntime=true;
  const token="AERTEX";
  const svgMarkup=${JSON.stringify(AERTEX_WORDMARK_SVG)};
  const skipped="script,style,title,textarea,input,select,option,pre,code,kbd,samp,noscript,[data-aertex-wordmark]";
  function logo(){
    const wrap=document.createElement("span");
    wrap.className="aertex-wordmark-token";
    wrap.dataset.aertexWordmark="";
    wrap.setAttribute("role","img");
    wrap.setAttribute("aria-label","AERTEX");
    wrap.innerHTML=svgMarkup;
    return wrap;
  }
  function eligible(node){
    const parent=node&&node.parentElement;
    if(!parent||!node.nodeValue||!node.nodeValue.includes(token))return false;
    return !parent.closest(skipped);
  }
  function replaceNode(node){
    if(!eligible(node))return;
    const parts=node.nodeValue.split(token);
    const frag=document.createDocumentFragment();
    for(let i=0;i<parts.length;i++){
      if(parts[i])frag.appendChild(document.createTextNode(parts[i]));
      if(i<parts.length-1)frag.appendChild(logo());
    }
    node.replaceWith(frag);
  }
  function scan(root){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    let current;
    while((current=walker.nextNode())) if(eligible(current)) nodes.push(current);
    nodes.forEach(replaceNode);
  }
  function start(){
    scan(document.body);
    const observer=new MutationObserver(records=>{
      for(const record of records){
        if(record.type==="characterData") replaceNode(record.target);
        for(const node of record.addedNodes){
          if(node.nodeType===Node.TEXT_NODE) replaceNode(node);
          else if(node.nodeType===Node.ELEMENT_NODE && !node.closest("[data-aertex-wordmark]")) scan(node);
        }
      }
    });
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
<\/script>`;

function replaceVisibleAertexText(markup) {
  const blockedTags = new Set(["script", "style", "title", "textarea", "option", "pre", "code", "kbd", "samp", "noscript"]);
  const lower = markup.toLowerCase();
  let output = "";
  let cursor = 0;
  let blocked = "";

  while (cursor < markup.length) {
    if (blocked) {
      const closeAt = lower.indexOf(`</${blocked}`, cursor);
      if (closeAt < 0) {
        output += markup.slice(cursor);
        break;
      }
      output += markup.slice(cursor, closeAt);
      cursor = closeAt;
      blocked = "";
      continue;
    }

    const tagAt = markup.indexOf("<", cursor);
    if (tagAt < 0) {
      output += markup.slice(cursor).split("AERTEX").join(STATIC_WORDMARK);
      break;
    }

    output += markup.slice(cursor, tagAt).split("AERTEX").join(STATIC_WORDMARK);
    const tagEnd = markup.indexOf(">", tagAt);
    if (tagEnd < 0) {
      output += markup.slice(tagAt);
      break;
    }

    const tag = markup.slice(tagAt, tagEnd + 1);
    output += tag;
    const match = tag.match(/^<\s*([a-z0-9-]+)\b/i);
    if (match && blockedTags.has(match[1].toLowerCase()) && !/^<\s*\//.test(tag)) {
      blocked = match[1].toLowerCase();
    }
    cursor = tagEnd + 1;
  }

  return output;
}

export function brandLogoRuntime() {
  return STYLE + SCRIPT;
}

export function injectBrandLogoRuntime(markup) {
  const text = String(markup || "");
  if (!text) return text;

  const branded = replaceVisibleAertexText(text);
  if (branded.includes('id="aertex-wordmark-runtime"')) return branded;

  let output = branded;
  let lower = output.toLowerCase();

  if (!output.includes('id="aertex-wordmark-style"')) {
    const headEnd = lower.lastIndexOf("</head>");
    if (headEnd >= 0) {
      output = output.slice(0, headEnd) + STYLE + output.slice(headEnd);
    } else {
      output = STYLE + output;
    }
  }

  lower = output.toLowerCase();
  if (!output.includes('id="aertex-wordmark-runtime"')) {
    const bodyEnd = lower.lastIndexOf("</body>");
    if (bodyEnd >= 0) {
      output = output.slice(0, bodyEnd) + SCRIPT + output.slice(bodyEnd);
    } else {
      output += SCRIPT;
    }
  }

  return output;
}
