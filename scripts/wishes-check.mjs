import fs from "node:fs";
import { dashboardContent, dashboardIcon } from "../studio/ui-dashboard.js";
import { wishesContent } from "../studio/ui-wishes.js";

const read = path => fs.readFileSync(path, "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const entry = read("studio/entry.js");
const config = read("studio/config.js");
const shell = read("studio/ui-shell.js");
const birthday = read("studio/ui-birthday.js");
const midAutumn = read("studio/ui-mid-autumn.js");
const dashboardStyle = read("studio/ui-style-dashboard.js");
const uiStyles = read("studio/ui-styles.js");

for (const required of [
  'injectPublicSeo(birthdayPage(fullLocale), fullLocale, "/birthday")',
  'injectPublicSeo(midAutumnPage(fullLocale), fullLocale, "/mid-autumn")',
  '/^\\/wish\\/(birthday|mid-autumn)$/',
  'if (kind === "birthday") return "/birthday";',
  'if (kind === "mid-autumn") return "/mid-autumn";',
  'target.search = "";',
  'target.searchParams.set("name", name)',
  '.slice(0, 36)'
]) {
  assert(entry.includes(required), "Wish routing invariant missing: " + required);
}

assert(config.includes('"/wishes"'), "Wish Center must be an authenticated OS route.");
assert(shell.includes('if (path === "/wishes") return wishesContent(locale);'), "Studio shell must render Wish Center content inside the standard layout.");
assert(shell.includes('"/wishes": { section: "wishes"') && shell.includes('"/wishes":page("wishes",n.wishes)'), "Wish Center must have metadata for core and localized shell routes.");
assert(!entry.includes("function wishesPage("), "Legacy standalone Wish Center page must be removed.");
assert(!entry.includes('injectPublicSeo(wishesPage('), "Wish Center must not bypass the Studio shell as a public page.");

const wishZh = wishesContent("zh-cn");
const wishEn = wishesContent("en-us");
assert(wishZh.includes('data-wishes-center') && wishZh.includes("生日快乐") && wishZh.includes("/zh-cn/wish/birthday"), "Chinese Wish Center must render localized shell content.");
assert(wishEn.includes('data-wishes-center') && wishEn.includes("Happy Birthday") && wishEn.includes("/en-us/wish/birthday"), "English Wish Center must render localized shell content.");
assert(wishZh.includes("history.replaceState") && wishZh.includes("navigator.clipboard.writeText"), "Wish Center must preserve route preview and copy-link behavior.");
assert(shell.includes("function wishNavItems") && shell.includes('"/wishes#new-year"') && shell.includes('"/wishes#society"'), "Wish Center must expose categorized sidebar subnavigation.");
assert(shell.includes('class="os-nav-item-chevron"') && shell.includes('aria-hidden="true">›</b>'), "Every sidebar subitem must render an explicit chevron.");
for (const category of ["新年与团圆","传统与节气","家庭与成长","关系与表达","社会与自然"]) {
  assert(wishZh.includes(category), "Chinese Wish Center is missing category: " + category);
}
for (const festival of ["元旦","除夕","春节","元宵节","妇女节","植树节","愚人节","清明节","地球日","劳动节","国庆节","端午节","儿童节","母亲节","父亲节","七夕节","情人节","生日","中秋节"]) {
  assert(wishZh.includes(festival), "Chinese Wish Center is missing festival: " + festival);
}
assert((wishZh.match(/class="wish-category"/g) || []).length === 5, "Wish Center must render five categorized festival sections.");
assert(wishZh.includes('data-catalog-kind="birthday"') && wishZh.includes('data-catalog-kind="mid-autumn"'), "Birthday and Mid-Autumn catalog entries must connect to the existing builder.");
assert(wishZh.includes('class="wish-festival is-planned"') && wishZh.includes("准备中"), "Future festivals must render as non-link planned entries.");


assert(birthday.includes('params.get("name")'), "Birthday page must support ?name=.");
assert(midAutumn.includes('params.get("name")'), "Mid-Autumn page must support ?name=.");

const zh = dashboardContent(true, { gptHref: "https://gpt.qsseda.com/zh-cn", adminHref: "", activeLocale: "zh-cn" }, "zh-cn");
const en = dashboardContent(false, { gptHref: "https://gpt.qsseda.com/en-us", adminHref: "", activeLocale: "en-us" }, "en-us");
assert(zh.includes("送一份祝福") && zh.includes("打开祝福中心") && zh.includes("/zh-cn/wishes"), "Chinese dashboard must expose the localized Wish Center.");
assert(en.includes("Wish Links") && en.includes("/en-us/wishes"), "English dashboard must expose Wish Links on the canonical en-us route.");
assert(zh.includes('data-home-wish-builder'), "Chinese Home must render the wish builder directly.");
assert(en.includes('data-home-wish-builder'), "English Home must render the wish builder directly.");
assert(zh.includes('data-home-wish-kind="birthday"') && zh.includes('data-home-wish-kind="mid-autumn"'), "Home wish builder must expose both greeting types.");
assert(zh.includes('id="dashboard-home-wish-name"'), "Home wish builder must ask for an optional recipient.");
assert(zh.includes('id="dashboard-home-wish-route"'), "Home wish builder must preview the share route.");

const birthdayGlyph = dashboardIcon("gift");
assert(birthdayGlyph.includes('<rect x="4.5" y="11" width="15" height="9" rx="1.5"/>'), "Birthday glyph must keep symmetric cake geometry.");
assert(dashboardStyle.includes("display:flex;align-items:center;justify-content:center"), "Dashboard icon containers must use deterministic flex centering.");
assert(uiStyles.includes("width:48px!important;min-width:48px!important;max-width:48px!important"), "Compact back control must remain a true 48px circle.");
assert(uiStyles.includes(".compact-back-button span{display:none!important}"), "Compact back control must not re-expand because of its text label.");

assert(!entry.includes("redirect_uri"), "Wish router must not become an arbitrary redirector.");
assert(!entry.includes('searchParams.get("url")'), "Wish router must not accept arbitrary destination URLs.");

console.log("AERTEX wish-link routing checks passed.");
