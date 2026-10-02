(function(){
  const VALID_MODES=new Set(["system","light","dark"]);
  const VALID_ACCENTS=new Set(["sapphire","aqua","jade","lime","amber","coral","rose","magenta","violet","graphite"]);
  const media=window.matchMedia("(prefers-color-scheme: light)");
  function rootDomain(){
    const host=String(location.hostname||"").toLowerCase();
    return ["qsseda.com","qsseda.online","qsseda.studio"].find(domain=>host===domain||host.endsWith("."+domain))||"";
  }
  function cookie(name){
    const parts=String(document.cookie||"").split(";");
    for(const part of parts){const i=part.indexOf("=");if(i>0&&part.slice(0,i).trim()===name){try{return decodeURIComponent(part.slice(i+1).trim())}catch{return part.slice(i+1).trim()}}}
    return "";
  }
  function writeCookie(name,value){
    try{const domain=rootDomain();document.cookie=name+"="+encodeURIComponent(value)+"; Path=/; Max-Age=31536000; SameSite=Lax"+(domain?"; Domain=."+domain:"")}catch{}
  }
  function ensureSystemDefaultV2(){
    if(cookie("qssed_theme_default_v2")==="1") return;
    try{localStorage.setItem("qssed-theme-mode","system")}catch{}
    writeCookie("qssed_theme_mode","system");
    writeCookie("qssed_theme_default_v2","1");
  }
  function readMode(){
    const shared=cookie("qssed_theme_mode"); if(VALID_MODES.has(shared)) return shared;
    try{const local=localStorage.getItem("qssed-theme-mode");if(VALID_MODES.has(local))return local}catch{}
    return "system";
  }
  function readAccent(){
    const shared=cookie("qssed_accent");if(VALID_ACCENTS.has(shared))return shared;
    try{const local=localStorage.getItem("qssed-accent");if(VALID_ACCENTS.has(local))return local}catch{}
    return "sapphire";
  }
  function resolved(mode){return mode==="light"||mode==="dark"?mode:(media.matches?"light":"dark")}
  function apply(){
    ensureSystemDefaultV2();
    const mode=readMode(),accent=readAccent(),theme=resolved(mode);
    document.documentElement.dataset.themeMode=mode;
    document.documentElement.dataset.theme=theme;
    document.documentElement.dataset.accent=accent;
    if(!cookie("qssed_theme_mode"))writeCookie("qssed_theme_mode",mode);
    if(!cookie("qssed_accent"))writeCookie("qssed_accent",accent);
  }
  apply();
  media.addEventListener?.("change",()=>{if(readMode()==="system")apply()});
})();