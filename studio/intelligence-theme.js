export function intelligenceThemeFromRequest(request) {
  const cookie = String(request?.headers?.get?.("Cookie") || "");
  const mode = cookie.match(/(?:^|;\s*)qssed_theme_mode=(system|light|dark)(?:;|$)/i)?.[1]?.toLowerCase() || "";
  if (mode === "light" || mode === "dark") return mode;
  return "";
}

export function intelligenceThemeAttr(theme) {
  return theme === "light" || theme === "dark" ? ` data-theme="${theme}"` : "";
}

export function intelligenceThemeBootScript() {
  return `<script>
(function(){
  const VALID_MODES=new Set(["system","light","dark"]);
  const VALID_ACCENTS=new Set(["sapphire","aqua","jade","lime","amber","coral","rose","magenta","violet","graphite"]);
  const media=window.matchMedia("(prefers-color-scheme: light)");
  function rootDomain(){
    const host=String(location.hostname||"").toLowerCase();
    return ["qsseda.com","qsseda.online","qsseda.studio"].find(domain=>host===domain||host.endsWith("."+domain))||"";
  }
  function cookie(name){
    const match=document.cookie.match(new RegExp("(?:^|;\\\\s*)"+name.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g,"\\\\$&")+"=([^;]+)(?:;|$)"));
    return match?decodeURIComponent(match[1]):"";
  }
  function writeCookie(name,value){
    try{
      const domain=rootDomain();
      document.cookie=name+"="+encodeURIComponent(value)+"; Path=/; Max-Age=31536000; SameSite=Lax"+(domain?"; Domain=."+domain:"");
    }catch{}
  }
  function readMode(){
    const shared=cookie("qssed_theme_mode");
    if(VALID_MODES.has(shared)) return shared;
    try{const local=localStorage.getItem("qssed-theme-mode");if(VALID_MODES.has(local)) return local}catch{}
    return "system";
  }
  function readAccent(){
    const shared=cookie("qssed_accent");
    if(VALID_ACCENTS.has(shared)) return shared;
    try{const local=localStorage.getItem("qssed-accent");if(VALID_ACCENTS.has(local)) return local}catch{}
    return "sapphire";
  }
  function resolved(mode){return mode==="light"||mode==="dark"?mode:(media.matches?"light":"dark")}
  function apply(){
    const mode=readMode();
    const accent=readAccent();
    const theme=resolved(mode);
    document.documentElement.dataset.themeMode=mode;
    document.documentElement.dataset.theme=theme;
    document.documentElement.dataset.accent=accent;
    if(!cookie("qssed_theme_mode")) writeCookie("qssed_theme_mode",mode);
    if(!cookie("qssed_accent")) writeCookie("qssed_accent",accent);
    try{localStorage.setItem("qssed-theme",theme)}catch{}
  }
  apply();
  media.addEventListener?.("change",()=>{if(readMode()==="system")apply()});
})();
<\/script>`;
}
