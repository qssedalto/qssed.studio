export function intelligenceThemeFromRequest(request) {
  const cookie = String(request?.headers?.get?.("Cookie") || "");
  const match = cookie.match(/(?:^|;\s*)qssed_theme=(light|dark)(?:;|$)/i);
  return match ? match[1].toLowerCase() : "";
}

export function intelligenceThemeAttr(theme) {
  return theme === "light" || theme === "dark" ? ` data-theme="${theme}"` : "";
}

export function intelligenceThemeBootScript() {
  return `<script>
(function(){
  function cookieTheme(){
    const match=document.cookie.match(/(?:^|;\\s*)qssed_theme=(light|dark)(?:;|$)/);
    return match?match[1]:"";
  }
  function persist(theme){
    try{localStorage.setItem("qssed-theme",theme)}catch{}
    try{
      const host=location.hostname.toLowerCase();
      const domain=host==="qsseda.com"||host.endsWith(".qsseda.com")?"; Domain=.qsseda.com":"";
      document.cookie="qssed_theme="+theme+"; Path=/; Max-Age=31536000; SameSite=Lax"+domain;
    }catch{}
  }
  try{
    const cookie=cookieTheme();
    const saved=localStorage.getItem("qssed-theme");
    const system=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";
    const theme=cookie||saved||system;
    document.documentElement.dataset.theme=theme;
    persist(theme);
  }catch{
    if(!document.documentElement.dataset.theme){
      document.documentElement.dataset.theme=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";
    }
  }
})();
<\/script>`;
}
