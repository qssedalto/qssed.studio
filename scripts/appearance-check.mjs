import vm from "node:vm";
import {
  APPEARANCE_GENERATION_VALUE,
  appearanceClientRuntime,
  appearanceThemeFromRequest
} from "../studio/appearance.js";
import { appearanceSettingsContent } from "../studio/ui-settings.js";

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

function browserHarness() {
  const cookieStore = new Map([
    ["qssed_theme_mode", "dark"],
    ["qssed_accent", "iphone-cad4c5"]
  ]);
  const storage = new Map([
    ["qssed-theme-mode", "light"],
    ["qssed-accent", "iphone-dfceea"]
  ]);
  const listeners = {};
  const media = {
    matches: false,
    addEventListener(type, listener) {
      listeners[type] = listener;
    }
  };
  const document = {
    documentElement: { dataset: {}, lang: "zh-CN" }
  };
  Object.defineProperty(document, "cookie", {
    get() {
      return [...cookieStore].map(([key, value]) => key + "=" + encodeURIComponent(value)).join("; ");
    },
    set(value) {
      const pair = String(value || "").split(";", 1)[0];
      const index = pair.indexOf("=");
      if (index <= 0) return;
      const key = pair.slice(0, index).trim();
      const raw = pair.slice(index + 1);
      try { cookieStore.set(key, decodeURIComponent(raw)); }
      catch { cookieStore.set(key, raw); }
    }
  });
  const localStorage = {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); }
  };
  const events = [];
  const window = {
    matchMedia() { return media; },
    dispatchEvent(event) { events.push(event); }
  };
  const context = vm.createContext({
    window,
    document,
    localStorage,
    location: {
      hostname: "qsseda.com",
      pathname: "/zh-cn/settings/appearance"
    },
    CustomEvent: class CustomEvent {
      constructor(type, init) {
        this.type = type;
        this.detail = init?.detail;
      }
    },
    Set,
    Array,
    String,
    encodeURIComponent,
    decodeURIComponent
  });
  return { context, cookieStore, storage, media, listeners, events, document, window };
}

const browser = browserHarness();
new vm.Script(appearanceClientRuntime(), { filename: "appearance-runtime.js" }).runInContext(browser.context);

assert(browser.window.AERTEXTheme, "Shared appearance runtime must initialize AERTEXTheme.");
assert(browser.window.AERTEXTheme.palette.length === 43, "Shared appearance runtime must expose all 43 workbook HEX colors.");
assert(browser.window.AERTEXTheme.colors["iphone-9aadf6"]?.hex === "#9AADF6", "Workbook HEX values must survive into the shared runtime exactly.");
assert(browser.window.AERTEXTheme.getMode() === "system", "Existing users must migrate to System mode once.");
assert(browser.document.documentElement.dataset.themeMode === "system", "System mode must be reflected on the document.");
assert(browser.document.documentElement.dataset.theme === "dark", "System mode must initially follow the simulated dark device.");
assert(browser.cookieStore.get("qssed_theme_mode") === "system", "System migration must be shared through the parent-domain mode cookie.");
assert(browser.cookieStore.get("qssed_theme_generation") === APPEARANCE_GENERATION_VALUE, "System migration must be versioned so it only runs once.");
assert(browser.cookieStore.get("qssed_locale") === "zh-cn", "Chinese route language must be shared with AERTEX ID.");
assert(browser.window.AERTEXTheme.getAccent() === "iphone-cad4c5", "Existing iPhone accent color should survive the one-time mode reset.");

browser.window.AERTEXTheme.setMode("light");
assert(browser.window.AERTEXTheme.getMode() === "light", "Users must be able to choose Light after the one-time System migration.");
assert(browser.document.documentElement.dataset.theme === "light", "Light selection must update the rendered theme.");
assert(browser.cookieStore.get("qssed_theme_mode") === "light", "Light selection must persist to the shared cookie.");

browser.window.AERTEXTheme.setAccent("iphone-f2adda");
assert(browser.window.AERTEXTheme.getAccent() === "iphone-f2adda", "Accent selection must update.");
assert(browser.document.documentElement.dataset.accent === "iphone-f2adda", "Accent selection must update the document.");
assert(browser.cookieStore.get("qssed_accent") === "iphone-f2adda", "Accent selection must persist to the shared cookie.");

new vm.Script(appearanceClientRuntime(), { filename: "appearance-runtime-second-load.js" }).runInContext(browser.context);
assert(browser.window.AERTEXTheme.getMode() === "light", "The migration must not overwrite a later user choice on subsequent loads.");

browser.window.AERTEXTheme.setMode("system");
browser.media.matches = true;
browser.listeners.change?.();
assert(browser.document.documentElement.dataset.theme === "light", "System mode must react to device appearance changes.");

const fixedRequest = {
  headers: {
    get(name) {
      if (name !== "Cookie") return "";
      return "qssed_theme_generation=" + APPEARANCE_GENERATION_VALUE + "; qssed_theme_mode=dark; qssed_theme=dark";
    }
  }
};
assert(appearanceThemeFromRequest(fixedRequest) === "dark", "Server first paint must honor a current fixed dark preference.");

const systemRequest = {
  headers: {
    get(name) {
      if (name !== "Cookie") return "";
      return "qssed_theme_generation=" + APPEARANCE_GENERATION_VALUE + "; qssed_theme_mode=system; qssed_theme=dark";
    }
  }
};
assert(appearanceThemeFromRequest(systemRequest) === "", "System mode must not be frozen to the legacy resolved theme on the server.");


// Verify the script after HTML interpolation: syntax errors here disable every
// appearance-mode and accent button even when the shared Theme API works.
const settingsScripts={};
for (const [locale, zh] of [["zh-cn",true],["en-us",false],["zh-tw",false],["ja-jp",false],["ar-sa",false]]) {
  const html=appearanceSettingsContent(zh,locale);
  const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert(script,"Appearance settings script should render for "+locale);
  assert(!script.includes("$"+"{JSON.stringify("),
    "Broken escaped template interpolation leaked into rendered script for "+locale);
  new vm.Script(script,{filename:"appearance-settings-"+locale+".js"});
  settingsScripts[locale]=script;
}

// Simulate real click registration and persistence for modes and swatches.
const clickable=(dataset)=>({
  dataset, listeners:{}, attributes:{},
  classList:{
    values:new Set(),
    toggle(name,on){if(on)this.values.add(name);else this.values.delete(name);}
  },
  addEventListener(type,handler){this.listeners[type]=handler;},
  setAttribute(key,value){this.attributes[key]=value;},
  click(){this.listeners.click?.();}
});
const modes=["system","light","dark"].map(mode=>clickable({mode}));
const palette=browser.window.AERTEXTheme.palette;
const accentChoices=[palette[0],palette.find(item=>item!==palette[0])];
assert(accentChoices[0]&&accentChoices[1],"At least two accent colors are required");
const accents=accentChoices.map(accent=>clickable({accent}));
const currentAccent={textContent:""}, feedback={textContent:""};
browser.document.documentElement.classList={add(){},remove(){}};
browser.document.querySelectorAll=selector=>
  selector==="[data-mode]"?modes:selector==="[data-accent]"?accents:[];
browser.document.getElementById=id=>
  id==="theme-current-accent"?currentAccent:id==="theme-feedback"?feedback:null;
browser.window.addEventListener=()=>{};
browser.window.setTimeout=()=>1;
browser.window.clearTimeout=()=>{};
new vm.Script(settingsScripts["zh-cn"],{filename:"appearance-settings-events.js"}).runInContext(browser.context);
assert(modes.every(button=>typeof button.listeners.click==="function"),
  "Every appearance mode must bind a click listener");
assert(accents.every(button=>typeof button.listeners.click==="function"),
  "Every accent swatch must bind a click listener");
modes[2].click();
assert(browser.window.AERTEXTheme.getMode()==="dark","Dark-mode click must persist");
assert(modes[2].attributes["aria-pressed"]==="true","Dark-mode selection must be visible");
modes[1].click();
assert(browser.window.AERTEXTheme.getMode()==="light","Light-mode click must persist");
accents[1].click();
assert(browser.window.AERTEXTheme.getAccent()===accentChoices[1],
  "Accent click must persist through the shared theme API");
assert(accents[1].attributes["aria-pressed"]==="true",
  "Selected accent must update accessibility and visual state");
assert(feedback.textContent.length>0,"Theme click must show saved feedback");
assert(currentAccent.textContent.length>0,"Current accent label must refresh");

console.log("Shared AERTEX appearance runtime checks passed.");
