import { TEXT } from "../studio/config.js";
import { buildLinks } from "../studio/routing.js";
import { osPage } from "../studio/ui-shell.js";
import { decorateWorkNavigation } from "../studio/ui-work.js";
import { polishWorkTexNavigation } from "../studio/ui-work-tex.js";
import { LOCALE_META, SUPPORTED_LOCALES, localeContentLanguage } from "../studio/locale.js";
import { QSS_DOMAIN_ROOTS, awOriginForRequest } from "../studio/domain-family.js";

const ipInfo = { ip:"127.0.0.1", country:"US", region:"", city:"", locale:"en-us" };

for (const root of QSS_DOMAIN_ROOTS) {
  const mainOrigin = `https://${root}`;
  const workOrigin = `https://work.${root}`;
  const cashOrigin = `https://cash.${root}`;
  const gptOrigin = `https://gpt.${root}`;
  const expectedAwRoot = root === "qsseda.studio" ? "qsseda.com" : root;
  const expectedAwOrigin = `https://aw.${expectedAwRoot}`;
  const request = new Request(mainOrigin + "/");

  if (awOriginForRequest(request) !== expectedAwOrigin) {
    throw new Error(`AERTEX Watch origin mapping failed for ${root}`);
  }

  for (const fullLocale of SUPPORTED_LOCALES) {
    const contentLanguage = localeContentLanguage(fullLocale);
    const t = TEXT[contentLanguage];
    if (!t) throw new Error(`Missing base TEXT dictionary for ${fullLocale} -> ${contentLanguage}`);

    const links = buildLinks(contentLanguage, "/", fullLocale);
    const productLinks = {
      workHref: `${workOrigin}/${fullLocale}/tex`,
      cashHref: `${cashOrigin}/${fullLocale}`,
      awHref: expectedAwOrigin,
      gptHref: `${gptOrigin}/${fullLocale}`,
      adminHref: "",
      activeLocale: fullLocale
    };

    let markup;
    try {
      markup = osPage(t, links, "/", { ...ipInfo, locale: fullLocale }, "", productLinks);
      markup = decorateWorkNavigation(markup, contentLanguage === "zh", "/", mainOrigin, workOrigin, fullLocale);
      markup = polishWorkTexNavigation(markup, contentLanguage === "zh", "/", workOrigin);
    } catch (error) {
      console.error(`Authenticated home render chain failed for ${root} / ${fullLocale}`);
      throw error;
    }

    if (typeof markup !== "string" || !markup.includes('<body class="os-shell os-root-menu">')) {
      throw new Error(`Root SSR did not produce the desktop root-menu shell for ${root} / ${fullLocale}`);
    }
    if (!markup.includes('class="desktop-main-menu"') || !markup.includes('class="compact-main-menu"')) {
      throw new Error(`Desktop root did not reuse the compact/mobile menu for ${root} / ${fullLocale}`);
    }
    if (markup.includes("compact-menu-card is-primary")) {
      throw new Error(`Root menu must not render mismatched oversized primary cards for ${root} / ${fullLocale}`);
    }
    if (!markup.includes(".desktop-main-menu .compact-menu-product-grid{\n        display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px")) {
      throw new Error(`Desktop root menu and product cards must use the same three-column proportions for ${root} / ${fullLocale}`);
    }
    if (!markup.includes("body.os-shell.os-root-menu{\n        height:auto!important;") || !markup.includes("overflow-y:auto!important;")) {
      throw new Error(`Desktop root menu must allow document scrolling for ${root} / ${fullLocale}`);
    }
    if (!markup.includes(`lang="${fullLocale}"`)) {
      throw new Error(`Root SSR lost locale ${root} / ${fullLocale}`);
    }
    const shortLabel = LOCALE_META[fullLocale]?.shortName;
    if (!shortLabel || !markup.includes(`>${shortLabel}</summary>`)) {
      throw new Error(`Circular language control lost compact label for ${root} / ${fullLocale}`);
    }
    if (!markup.includes(':root[data-theme="dark"] body.os-shell .os-brand-mark img{filter:brightness(0) invert(1)!important}')) {
      throw new Error(`Dark-mode white logo rule missing for ${root} / ${fullLocale}`);
    }
    if (!markup.includes(`href="${expectedAwOrigin}"`) || !markup.includes("AERTEX Watch")) {
      throw new Error(`Root SSR lost the matching AERTEX Watch product for ${root} / ${fullLocale}`);
    }
    for (const otherRoot of QSS_DOMAIN_ROOTS) {
      if (otherRoot !== expectedAwRoot && markup.includes(`href="https://aw.${otherRoot}"`)) {
        throw new Error(`AERTEX Watch cross-root leak: ${root} rendered aw.${otherRoot}`);
      }
    }
    const workIndex = markup.indexOf("AERTEX Work");
    const cashIndex = markup.indexOf("AERTEX Cash");
    const awIndex = markup.indexOf("AERTEX Watch");
    const intelligenceIndex = markup.indexOf("AERTEX Intelligence");
    if (!(workIndex >= 0 && cashIndex > workIndex && awIndex > cashIndex && intelligenceIndex > awIndex)) {
      throw new Error(`Independent product order is wrong for ${root} / ${fullLocale}`);
    }
    if (!markup.includes(`href="${cashOrigin}/${fullLocale}"`)) {
      throw new Error(`Root SSR lost the matching Cash product for ${root} / ${fullLocale}`);
    }
    for (const productHref of [
      `${workOrigin}/${fullLocale}/tex`,
      `${cashOrigin}/${fullLocale}`,
      expectedAwOrigin,
      `${gptOrigin}/${fullLocale}`
    ]) {
      if (!markup.includes(`href="${productHref}" target="_blank" rel="noopener noreferrer"`)) {
        throw new Error(`Independent product must open in a new tab for ${root} / ${fullLocale}: ${productHref}`);
      }
    }
  }
}

console.log(`Root SSR checks passed for ${SUPPORTED_LOCALES.length} locales across ${QSS_DOMAIN_ROOTS.length} synchronized roots.`);
