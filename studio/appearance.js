/**
 * 【初学者导读】
 * 文件：studio/appearance.js
 * 全站品牌/外观共享模块：统一主题、主色、Logo 或品牌资源，避免每个产品各自实现。
 * 阅读顺序：先看 export/入口函数，再看它调用的辅助函数；遇到 API 路径、存储键或域名判断时，向上追到 Worker 路由，向下追到具体数据源。
 * 数据流：建议始终回答四个问题——输入从哪里来？在哪里校验？修改了什么状态/存储？最后返回/渲染了什么？
 * 修改注意：先确认公开路由/API/数据结构的兼容性；规则改变时同步更新对应 scripts/*-check.mjs。
 * 调试方法：先使用最小请求复现，再逐步检查分支条件和中间状态，避免只根据最终 UI 猜原因。
 */
import { IPHONE_THEME_DEFAULT, IPHONE_THEME_PALETTE } from "./iphone-theme-palette.js";

const ROOT_DOMAINS = Object.freeze(["qsseda.com","qsseda.online","qsseda.studio"]);
const VALID_MODES = Object.freeze(["system","light","dark"]);
const VALID_ACCENTS = Object.freeze(IPHONE_THEME_PALETTE.map(color => color.id));
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

// 浏览器端外观运行时：读取主站统一的主题/主色偏好，并通过 CSS 变量和事件广播给所有子产品。独立产品不应再实现自己的主题存储。\nexport function appearanceClientRuntime() {
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
    // 设置主色：这里只改变“主色语义变量”，成功绿、警告色、内容分类色等语义颜色应由各产品保持独立。\nfunction setAccent(accent,options={}){
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
