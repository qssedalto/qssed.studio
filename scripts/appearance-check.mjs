import fs from "node:fs";
import vm from "node:vm";
import {
  APPEARANCE_GENERATION_VALUE,
  appearanceClientRuntime,
  appearanceThemeFromRequest
} from "../studio/appearance.js";

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const uiPage = fs.readFileSync(new URL("../studio/ui-page.js", import.meta.url), "utf8");

function browserHarness() {
  const cookieStore = new Map([
    ["qssed_theme_mode", "dark"],
    ["qssed_accent", "jade"]
  ]);
  const storage = new Map([
    ["qssed-theme-mode", "light"],
    ["qssed-accent", "violet"]
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
assert(browser.window.AERTEXTheme.getMode() === "system", "Existing users must migrate to System mode once.");
assert(browser.document.documentElement.dataset.themeMode === "system", "System mode must be reflected on the document.");
assert(browser.document.documentElement.dataset.theme === "dark", "System mode must initially follow the simulated dark device.");
assert(browser.cookieStore.get("qssed_theme_mode") === "system", "System migration must be shared through the parent-domain mode cookie.");
assert(browser.cookieStore.get("qssed_theme_generation") === APPEARANCE_GENERATION_VALUE, "System migration must be versioned so it only runs once.");
assert(browser.cookieStore.get("qssed_locale") === "zh-cn", "Chinese route language must be shared with AERTEX ID.");
assert(browser.window.AERTEXTheme.getAccent() === "jade", "Existing accent color should survive the one-time mode reset.");

browser.window.AERTEXTheme.setMode("light");
assert(browser.window.AERTEXTheme.getMode() === "light", "Users must be able to choose Light after the one-time System migration.");
assert(browser.document.documentElement.dataset.theme === "light", "Light selection must update the rendered theme.");
assert(browser.cookieStore.get("qssed_theme_mode") === "light", "Light selection must persist to the shared cookie.");

browser.window.AERTEXTheme.setAccent("rose");
assert(browser.window.AERTEXTheme.getAccent() === "rose", "Accent selection must update.");
assert(browser.document.documentElement.dataset.accent === "rose", "Accent selection must update the document.");
assert(browser.cookieStore.get("qssed_accent") === "rose", "Accent selection must persist to the shared cookie.");

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

assert(!uiPage.includes('<details class="language-menu"'), "Language picker must not rely on native details-only dismissal.");
assert(uiPage.includes('data-top-control-trigger="language"'), "Language control must use the shared top-control menu controller.");
assert(uiPage.includes('data-top-control-trigger="theme"'), "Appearance control must use the shared top-control menu controller.");
assert(uiPage.includes('data-theme-choice="system"') && uiPage.includes('data-theme-choice="light"') && uiPage.includes('data-theme-choice="dark"'), "Appearance popover must expose System, Light, and Dark choices.");
assert(uiPage.includes('html.top-control-menu-open,html.top-control-menu-open body{overflow:hidden!important'), "Open top-control menus must lock background page scrolling.");
assert(uiPage.includes('event.target === zone') && uiPage.includes('closeMenus()'), "Clicking the blank backdrop must dismiss an open top-control menu.");
assert(uiPage.includes('zone.addEventListener("touchmove", blockBackgroundScroll, { passive:false })'), "Mobile touch scrolling outside the popover must be blocked.");
assert(uiPage.includes('if (event.target?.closest?.(".top-control-popover")) return;'), "Popover contents must remain independently scrollable.");
assert(uiPage.includes('window.AERTEXTheme.setMode(mode)'), "Theme menu choices must set the selected appearance mode directly.");
assert(!uiPage.includes('window.AERTEXTheme.setMode(current === "light" ? "dark" : "light")'), "Theme control must not regress to binary light/dark toggling.");

console.log("Shared AERTEX appearance runtime checks passed.");
