import fs from "node:fs";
import { dashboardContent, dashboardIcon } from "../studio/ui-dashboard.js";

const read = path => fs.readFileSync(path, "utf8");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const entry = read("studio/entry.js");
const birthday = read("studio/ui-birthday.js");
const midAutumn = read("studio/ui-mid-autumn.js");
const dashboardStyle = read("studio/ui-style-dashboard.js");
const uiStyles = read("studio/ui-styles.js");

for (const required of [
  'if (pathname === "/wishes") {',
  'injectPublicSeo(wishesPage(fullLocale), fullLocale, "/wishes")',
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
