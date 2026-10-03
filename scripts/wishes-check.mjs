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
const navigation = read("studio/ui-navigation.js");

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

for (const route of ["/wishes","/wishes/new-year","/wishes/traditions","/wishes/family","/wishes/relationships","/wishes/society"]) {
  assert(config.includes('"' + route + '"'), "Wish Center category route missing from OS_PATHS: " + route);
}
assert(shell.includes('if (path === "/wishes" || path.startsWith("/wishes/")) return wishesContent(path, locale);'), "Studio shell must render the Wish Center hub and category pages inside the standard layout.");
assert(shell.includes('"/wishes": { section: "wishes"') && shell.includes('"/wishes/new-year"') && shell.includes('"/wishes/society"'), "Wish Center must expose metadata for the hub and all category pages.");
assert(!entry.includes("function wishesPage("), "Legacy standalone Wish Center page must be removed.");
assert(!entry.includes('injectPublicSeo(wishesPage('), "Wish Center must not bypass the Studio shell as a public page.");
assert(entry.includes('pathname !== "/wishes"'), "Wish Center root must be excluded from the authenticated OS gate.");
assert(entry.includes('if (pathname === "/wishes") {') && entry.includes('publicMode: true'), "Wish Center root must render the standard Studio shell in public mode.");
assert(entry.includes('injectPublicSeo(markup, fullLocale, "/wishes")'), "Public Wish Center must keep canonical SEO metadata.");
assert(shell.includes('const publicMode = Boolean(productLinks?.publicMode);'), "Studio shell must support an explicit public mode.");
assert(shell.includes('${publicMode ? "" : "hydrateOsUser();"}'), "Public Studio shell must not run the authenticated account hydration redirect.");
assert(dashboardStyle.includes('.os-nav-title::after') && dashboardStyle.includes('.os-nav-items a::after'), "Sidebar arrows must be rendered through CSS ::after.");
assert(dashboardStyle.includes('position:absolute') && dashboardStyle.includes('right:12px') && dashboardStyle.includes('right:8px'), "Top-level and child sidebar arrows must be pinned to the far-right edge.");
assert(dashboardStyle.includes('transform:translateY(-50%) rotate(90deg)'), "Expanded sidebar sections must keep the arrow vertically centered while rotating downward.");
assert(dashboardStyle.includes('transform:translate(1px,-50%)'), "Child arrow hover motion must preserve vertical centering.");
assert(uiStyles.includes('flex-wrap:nowrap') && uiStyles.includes('.os-nav-entry>.os-nav-title::after{margin-left:0}'), "Shared sidebar rows must prevent arrows from wrapping onto a second line.");
assert(!shell.includes('<b aria-hidden="true">↗</b></a>') && uiStyles.includes('.compact-menu-card::after'), "Compact menu arrows must also be CSS pseudo-elements instead of flow content.");
assert(uiStyles.includes('right:20px') && uiStyles.includes('right:18px') && uiStyles.includes('transform:translateY(-50%)'), "Compact menu arrows must stay vertically centered at the far-right edge.");



const wishZh = wishesContent("/wishes", "zh-cn");
const wishEn = wishesContent("/wishes", "en-us");
assert(wishZh.includes('data-wishes-hub') && wishZh.includes("选择祝福分类"), "Chinese Wish Center must render a compact category hub.");
assert(wishEn.includes('data-wishes-hub') && wishEn.includes("Choose a wish category"), "English Wish Center must render a compact category hub.");
assert(!wishZh.includes('class="wish-festival-grid"'), "Wish Center hub must not stack every festival on one large page.");

assert(shell.includes("function wishNavItems") && shell.includes('"/wishes/new-year"') && shell.includes('"/wishes/society"'), "Wish Center sidebar must navigate to real category routes instead of hash anchors.");
assert(!shell.includes('/wishes#new-year') && !shell.includes('/wishes#society'), "Wish Center must not use hash-only category navigation.");
assert(navigation.includes('"/wishes"') && navigation.includes('const sectionRoots = ["/info", "/profile", "/wishes"'), "Compact navigation must treat Wish Center as the parent of category pages.");

const wishPages = {
  "new-year": wishesContent("/wishes/new-year", "zh-cn"),
  traditions: wishesContent("/wishes/traditions", "zh-cn"),
  family: wishesContent("/wishes/family", "zh-cn"),
  relationships: wishesContent("/wishes/relationships", "zh-cn"),
  society: wishesContent("/wishes/society", "zh-cn")
};
for (const [id, markup] of Object.entries(wishPages)) {
  assert(markup.includes('data-wishes-category="' + id + '"'), "Wish category page missing dedicated interface: " + id);
  assert(markup.includes('class="wish-category-overview"') && markup.includes('class="wish-festival-grid"'), "Wish category page must include detailed overview and festival grid: " + id);
}
for (const festival of ["元旦","除夕","春节","元宵节","中秋节"]) assert(wishPages["new-year"].includes(festival), "New Year category missing festival: " + festival);
for (const festival of ["清明节","端午节"]) assert(wishPages.traditions.includes(festival), "Traditions category missing festival: " + festival);
for (const festival of ["生日","妇女节","儿童节","母亲节","父亲节"]) assert(wishPages.family.includes(festival), "Family category missing festival: " + festival);
for (const festival of ["七夕节","情人节","愚人节"]) assert(wishPages.relationships.includes(festival), "Relationships category missing festival: " + festival);
for (const festival of ["植树节","地球日","劳动节","国庆节"]) assert(wishPages.society.includes(festival), "Society category missing festival: " + festival);

assert(wishPages.family.includes('data-template-kind="birthday"') && wishPages.family.includes('data-wish-builder'), "Family category must keep the existing Birthday builder.");
assert(wishPages["new-year"].includes('data-template-kind="mid-autumn"') && wishPages["new-year"].includes('data-wish-builder'), "New Year category must keep the existing Mid-Autumn builder.");
assert(wishPages.traditions.includes("这个分类暂时没有开放的祝福模板"), "Categories without live templates must show a clear non-placeholder status panel.");
assert(wishPages.family.includes("妇女节") && wishPages.family.includes("避免刻板化"), "Family category must include more detailed Women's Day guidance.");
assert(wishPages.society.includes("国庆节") && wishPages.society.includes("节日与假期问候"), "Society category must include detailed National Day guidance.");
assert(wishPages.family.includes("grid-auto-rows:112px") && wishPages.family.includes("margin:0!important") && wishPages.family.includes("height:100%"), "Festival cards must keep equal detailed-card proportions.");
assert(wishPages.family.includes("history.replaceState") && wishPages.family.includes("navigator.clipboard.writeText"), "Available category pages must preserve route preview and copy-link behavior.");

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
