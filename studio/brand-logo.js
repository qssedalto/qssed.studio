// 品牌资源集中在一个模块中，产品页面只引用/注入，不各自复制一份 logo 逻辑。
//
// Watch 的登录 handoff 与独立 aw.* 页面都经过这里，所以改品牌替换规则时要同时考虑普通 Studio DOM 和一次性 handoff HTML。
export const AERTEX_MARK_DATA_URI = "data:image/png;base64,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";
export const AERTEX_MARK_SVG = AERTEX_MARK_DATA_URI;

export const AERTEX_WORDMARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1027 198" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet"><path d="M163 133L163 135L193 187L195 188L196 187L223 187L224 188L233 188L234 187L237 188L238 187L200 122L183 126ZM239 106L206 105L205 106L187 106L186 107L168 108L167 109L161 109L135 114L101 124L81 132L61 142L44 153L20 173L6 188L3 193L52 193L79 165L92 155L111 143L137 130L167 119L189 113L209 109L222 108L223 107ZM865 41L907 94L918 110L856 187L857 188L858 187L860 188L861 187L863 188L864 187L866 188L879 188L880 187L895 188L897 187L938 134L980 188L982 187L983 188L987 187L1003 187L1004 188L1021 187L965 118L963 113L1023 41L981 41L943 90L941 89L906 41ZM721 41L721 55L720 56L721 57L721 83L720 84L721 86L720 88L721 92L721 107L720 108L721 188L727 188L728 187L757 187L758 188L773 188L774 187L778 188L779 187L833 188L836 187L837 188L844 188L845 187L845 161L758 161L757 160L757 125L759 123L832 123L832 99L758 99L757 98L757 66L758 65L845 65L845 41ZM565 41L565 65L611 65L612 66L612 187L613 188L614 187L615 188L619 187L639 187L640 188L647 187L649 188L650 187L650 66L651 65L697 65L697 41ZM411 41L411 187L412 188L414 187L438 187L439 188L450 187L450 66L451 65L503 65L512 69L517 74L521 83L521 96L518 103L510 111L502 114L460 114L460 115L475 134L513 187L516 188L517 187L535 187L536 188L555 187L519 137L520 135L529 132L540 125L546 119L552 109L555 99L555 80L552 70L546 60L537 51L531 47L513 41ZM260 41L260 187L261 188L265 187L303 187L304 188L327 188L328 187L342 187L343 188L344 187L354 187L355 188L369 188L370 187L378 187L379 188L381 187L382 188L383 187L384 188L385 187L385 161L298 161L297 160L297 124L298 123L372 123L372 99L298 99L297 98L297 66L298 65L385 65L385 41ZM131 3L73 89L72 92L69 95L33 151L42 144L63 131L89 118L98 115L130 68L149 102L159 100L166 100L167 99L187 98L169 65Z" fill="currentColor"/></svg>`;
export const AERTEX_WORDMARK_DATA_URI = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(AERTEX_WORDMARK_SVG);
export const LOGO_PATHS = new Set(["/logo.svg"]);

/// /logo.svg 的统一响应入口；HEAD 只返回头，GET 返回共享字标资源。
export function logoResponse(request) {
  const method = String(request?.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { "allow": "GET, HEAD", "cache-control": "public, max-age=86400" }
    });
  }
  return new Response(method === "HEAD" ? null : AERTEX_WORDMARK_SVG, {
    status: 200,
    headers: {
      "content-type": "image/svg+xml;charset=UTF-8",
      "cache-control": "public, max-age=604800, immutable",
      "x-content-type-options": "nosniff"
    }
  });
}

const STATIC_WORDMARK = `<span class="aertex-wordmark-token" data-aertex-wordmark="" role="img" aria-label="AERTEX">${AERTEX_WORDMARK_SVG}</span>`;

const STYLE = `<style id="aertex-wordmark-style">
.aertex-wordmark-token{display:inline-flex;align-items:center;justify-content:center;vertical-align:-.11em;line-height:1;white-space:nowrap;width:5.18687em;height:1em;max-width:100%;color:inherit;flex:0 0 auto}
.aertex-wordmark-token>svg{display:block;width:100%;height:100%;overflow:visible;color:currentColor}
.aertex-wordmark-token>svg path{fill:currentColor}
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

// 服务端注入只替换“可见的 AERTEX 品牌文字”，避免误改 script/style/属性里的程序数据。
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

/// 给静态 HTML 补上客户端品牌 runtime；Watch handoff 也用它保持和主站相同品牌表现。
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
