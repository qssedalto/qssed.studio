import { IPHONE_THEME_DEFAULT, IPHONE_THEME_PALETTE } from "./iphone-theme-palette.js";

// 外观偏好是“根域家族共享”的，而不是每个产品各存一份。
// 因此用户在主站改主题色/浅深色后，aw.* AERTEX Watch 只要加载 /appearance.js 就会得到同一偏好。
const ROOT_DOMAINS = Object.freeze(["qsseda.com","qsseda.online","qsseda.studio"]);
const VALID_MODES = Object.freeze(["system","light","dark"]);
const VALID_ACCENTS = Object.freeze(IPHONE_THEME_PALETTE.map(color => color.id));
const APPEARANCE_GENERATION = "20261002-system-v2";

/// SSR 只读取显式 light/dark；system 必须由浏览器 matchMedia 解析，因为 Worker 不知道设备实时外观。
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

/// 返回给产品子域执行的轻量浏览器 runtime。
/// Watch Worker 把它暴露为 /appearance.js，用共享 Cookie + localStorage 同步 mode、resolved theme 和 accent。
export function appearanceClientRuntime() {
  const roots = JSON.stringify(ROOT_DOMAINS);
  const modes = JSON.stringify(VALID_MODES);
  const accents = JSON.stringify(VALID_ACCENTS);
  const accentMeta = JSON.stringify(Object.fromEntries(IPHONE_THEME_PALETTE.map(color => [color.id, { hex: color.hex, ink: color.ink }])));
  const defaultAccent = JSON.stringify(IPHONE_THEME_DEFAULT);
  const generation = JSON.stringify(APPEARANCE_GENERATION);
  return `(function(){
    "use strict";
    const ROOTS=${roots};
    const VALID_MODES=new Set(${modes});
    const VALID_ACCENTS=new Set(${accents});
    const ACCENT_META=${accentMeta};
    const DEFAULT_ACCENT=${defaultAccent};
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

    // 找出当前 qsseda 根域并把偏好 Cookie 写到 .<root>，这样 main/aw/gpt/cash/work 可以看到同一设置。
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
      const pathLocale=normalizeLocale(String(location.pathname||"").split("/").filter(Boolean)[0]||"");
      const locale=pathLocale||normalizeLocale(document.documentElement.lang);
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
        if(VALID_MODES.has(saved)){
          persistCookie(MODE_COOKIE,saved);
          return saved;
        }
      }catch{}
      return "system";
    }
    function readAccent(){
      const shared=cookieValue(ACCENT_COOKIE);
      if(VALID_ACCENTS.has(shared))return shared;
      try{
        const saved=localStorage.getItem(ACCENT_KEY);
        if(VALID_ACCENTS.has(saved)){
          persistCookie(ACCENT_COOKIE,saved);
          return saved;
        }
      }catch{}
      return DEFAULT_ACCENT;
    }
    // mode 保存用户意图（system/light/dark）；resolved theme 保存当前真正渲染的 light/dark。
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
    // 主色只保存 palette id，再从静态表映射 hex/ink；避免各产品自己持久化任意 CSS 值。
    function setAccent(accent,options={}){
      const next=VALID_ACCENTS.has(accent)?accent:DEFAULT_ACCENT;
      document.documentElement.dataset.accent=next;
      const meta=ACCENT_META[next]||ACCENT_META[DEFAULT_ACCENT];
      if(meta){
        document.documentElement.style?.setProperty?.("--aertex-accent",meta.hex);
        document.documentElement.style?.setProperty?.("--aertex-accent-ink",meta.ink);
      }
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
      palette:Array.from(VALID_ACCENTS),
      colors:ACCENT_META,
      defaultAccent:DEFAULT_ACCENT
    };
  })();`;
}

/// 放进 <head> 的首屏脚本，尽量在 CSS/正文绘制前设置 data-theme，减少浅深色闪烁。
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
