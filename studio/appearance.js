const ROOT_DOMAINS = Object.freeze(["qsseda.com","qsseda.online","qsseda.studio"]);
const VALID_MODES = Object.freeze(["system","light","dark"]);
const VALID_ACCENTS = Object.freeze(["sapphire","aqua","jade","lime","amber","coral","rose","magenta","violet","graphite"]);
const APPEARANCE_GENERATION = "20261002-system-v2";

export function appearanceThemeFromRequest(request) {
  const cookie = String(request?.headers?.get?.("Cookie") || "");
  if (cookieValue(cookie, "qssed_theme_generation") !== APPEARANCE_GENERATION) return "";
  const mode = cookieValue(cookie, "qssed_theme_mode");
  if (mode === "light" || mode === "dark") return mode;
  return "";
}

export function appearanceThemeAttr(theme) {
  return theme === "light" || theme === "dark" ? ` data-theme="${theme}"` : "";
}

export function appearanceClientRuntime() {
  const roots = JSON.stringify(ROOT_DOMAINS);
  const modes = JSON.stringify(VALID_MODES);
  const accents = JSON.stringify(VALID_ACCENTS);
  const generation = JSON.stringify(APPEARANCE_GENERATION);
  return `(function(){
    "use strict";
    const ROOTS=${roots};
    const VALID_MODES=new Set(${modes});
    const VALID_ACCENTS=new Set(${accents});
    const MODE_KEY="qssed-theme-mode";
    const RESOLVED_KEY="qssed-theme";
    const ACCENT_KEY="qssed-accent";
    const MODE_COOKIE="qssed_theme_mode";
    const RESOLVED_COOKIE="qssed_theme";
    const ACCENT_COOKIE="qssed_accent";
    const GENERATION_COOKIE="qssed_theme_generation";
    const LOCALE_COOKIE="qssed_locale";
    const GENERATION=${generation};
    const media=window.matchMedia("(prefers-color-scheme: light)");

    function preferenceDomain(){
      const host=String(location.hostname||"").toLowerCase();
      return ROOTS.find(domain=>host===domain||host.endsWith("."+domain))||"";
    }
    function cookieValue(name){
      const prefix=name+"=";
      const raw=String(document.cookie||"").split(";").map(part=>part.trim()).find(part=>part.startsWith(prefix));
      if(!raw)return "";
      try{return decodeURIComponent(raw.slice(prefix.length))}catch{return raw.slice(prefix.length)}
    }
    function persistCookie(name,value,maxAge=31536000){
      try{
        const domain=preferenceDomain();
        document.cookie=name+"="+encodeURIComponent(value)+"; Path=/; Max-Age="+maxAge+"; SameSite=Lax; Secure"+(domain?"; Domain=."+domain:"");
      }catch{}
    }
    function normalizeLocale(value){
      const tag=String(value||"").trim().toLowerCase().replaceAll("_","-");
      if(["en-us","en-gb","en-au","zh-cn","zh-tw","ja-jp","ko-kr","fr-fr","es-es","el-gr","ar-sa"].includes(tag))return tag;
      if(tag==="zh"||tag.startsWith("zh-hans")||tag==="zh-sg")return "zh-cn";
      if(tag==="zh-hk"||tag==="zh-mo"||tag.startsWith("zh-hant"))return "zh-tw";
      if(tag==="en"||tag.startsWith("en-us"))return "en-us";
      if(tag.startsWith("en-gb"))return "en-gb";
      if(tag.startsWith("en-au"))return "en-au";
      if(tag.startsWith("ja"))return "ja-jp";
      if(tag.startsWith("ko"))return "ko-kr";
      if(tag.startsWith("fr"))return "fr-fr";
      if(tag.startsWith("es"))return "es-es";
      if(tag.startsWith("el"))return "el-gr";
      if(tag.startsWith("ar"))return "ar-sa";
      return "";
    }
    function persistPageLocale(){
      const locale=normalizeLocale(document.documentElement.lang);
      if(locale)persistCookie(LOCALE_COOKIE,locale);
    }
    function migrateDefaultToSystem(){
      if(cookieValue(GENERATION_COOKIE)===GENERATION)return;
      try{localStorage.setItem(MODE_KEY,"system")}catch{}
      persistCookie(MODE_COOKIE,"system");
      persistCookie(GENERATION_COOKIE,GENERATION);
    }
    function resolvedTheme(mode){
      if(mode==="light"||mode==="dark")return mode;
      return media.matches?"light":"dark";
    }
    function persistResolved(theme){
      try{localStorage.setItem(RESOLVED_KEY,theme)}catch{}
      persistCookie(RESOLVED_COOKIE,theme);
    }
    function readMode(){
      const shared=cookieValue(MODE_COOKIE);
      if(VALID_MODES.has(shared))return shared;
      try{
        const saved=localStorage.getItem(MODE_KEY);
        if(VALID_MODES.has(saved))return saved;
      }catch{}
      return "system";
    }
    function readAccent(){
      const shared=cookieValue(ACCENT_COOKIE);
      if(VALID_ACCENTS.has(shared))return shared;
      try{
        const saved=localStorage.getItem(ACCENT_KEY);
        if(VALID_ACCENTS.has(saved))return saved;
      }catch{}
      return "sapphire";
    }
    function setMode(mode,options={}){
      const nextMode=VALID_MODES.has(mode)?mode:"system";
      const nextTheme=resolvedTheme(nextMode);
      document.documentElement.dataset.themeMode=nextMode;
      document.documentElement.dataset.theme=nextTheme;
      if(options.persist!==false){
        try{localStorage.setItem(MODE_KEY,nextMode)}catch{}
        persistCookie(MODE_COOKIE,nextMode);
        persistCookie(GENERATION_COOKIE,GENERATION);
      }
      persistResolved(nextTheme);
      if(options.announce!==false){
        window.dispatchEvent(new CustomEvent("aertex-themechange",{detail:{mode:nextMode,theme:nextTheme,accent:readAccent()}}));
      }
      return nextTheme;
    }
    function setAccent(accent,options={}){
      const next=VALID_ACCENTS.has(accent)?accent:"sapphire";
      document.documentElement.dataset.accent=next;
      if(options.persist!==false){
        try{localStorage.setItem(ACCENT_KEY,next)}catch{}
        persistCookie(ACCENT_COOKIE,next);
      }
      if(options.announce!==false){
        window.dispatchEvent(new CustomEvent("aertex-themechange",{detail:{mode:readMode(),theme:document.documentElement.dataset.theme||resolvedTheme(readMode()),accent:next}}));
      }
      return next;
    }

    migrateDefaultToSystem();
    persistPageLocale();
    setMode(readMode(),{persist:false,announce:false});
    setAccent(readAccent(),{persist:false,announce:false});
    media.addEventListener?.("change",()=>{if(readMode()==="system")setMode("system",{persist:false})});

    window.AERTEXTheme={
      setMode,
      setAccent,
      getMode:readMode,
      getAccent:readAccent,
      getResolvedTheme:()=>document.documentElement.dataset.theme||resolvedTheme(readMode()),
      palette:Array.from(VALID_ACCENTS)
    };
  })();`;
}

export function appearanceBootScript() {
  return `<script>${appearanceClientRuntime()}<\/script>`;
}

function cookieValue(header, name) {
  const prefix = name + "=";
  for (const part of String(header || "").split(";")) {
    const item = part.trim();
    if (!item.startsWith(prefix)) continue;
    const raw = item.slice(prefix.length);
    try { return decodeURIComponent(raw); } catch { return raw; }
  }
  return "";
}

export const APPEARANCE_GENERATION_VALUE = APPEARANCE_GENERATION;
