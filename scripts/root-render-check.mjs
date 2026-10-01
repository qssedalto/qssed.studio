import { TEXT } from "../studio/config.js";
import { buildLinks } from "../studio/routing.js";
import { osPage } from "../studio/ui-shell.js";
import { decorateWorkNavigation } from "../studio/ui-work.js";
import { polishWorkTexNavigation } from "../studio/ui-work-tex.js";
import { SUPPORTED_LOCALES, localeContentLanguage } from "../studio/locale.js";
import { QSS_DOMAIN_ROOTS, awOriginForRequest } from "../studio/domain-family.js";

const ipInfo = { ip:"127.0.0.1", country:"US", region:"", city:"", locale:"en-us" };

for (const root of QSS_DOMAIN_ROOTS) {
  const mainOrigin = `https://${root}`;
  const workOrigin = `https://work.${root}`;
  const gptOrigin = `https://gpt.${root}`;
  const expectedAwOrigin = `https://aw.${root}`;
  const request = new Request(mainOrigin + "/");

  if (awOriginForRequest(request) !== expectedAwOrigin) {
    throw new Error(`ActivityWatch origin mapping failed for ${root}`);
  }

  for (const fullLocale of SUPPORTED_LOCALES) {
    const contentLanguage = localeContentLanguage(fullLocale);
    const t = TEXT[contentLanguage];
    if (!t) throw new Error(`Missing base TEXT dictionary for ${fullLocale} -> ${contentLanguage}`);

    const links = buildLinks(contentLanguage, "/", fullLocale);
    const productLinks = {
      workHref: `${workOrigin}/${fullLocale}/tex`,
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

    if (typeof markup !== "string" || !markup.includes('<body class="os-shell">')) {
      throw new Error(`Root SSR did not produce the Studio shell for ${root} / ${fullLocale}`);
    }
    if (!markup.includes(`lang="${fullLocale}"`)) {
      throw new Error(`Root SSR lost locale ${root} / ${fullLocale}`);
    }
    if (!markup.includes(`href="${expectedAwOrigin}"`) || !markup.includes("ActivityWatch")) {
      throw new Error(`Root SSR lost the matching ActivityWatch product for ${root} / ${fullLocale}`);
    }
    for (const otherRoot of QSS_DOMAIN_ROOTS) {
      if (otherRoot !== root && markup.includes(`href="https://aw.${otherRoot}"`)) {
        throw new Error(`ActivityWatch cross-root leak: ${root} rendered aw.${otherRoot}`);
      }
    }
    const workIndex = markup.indexOf("AERTEX Work");
    const awIndex = markup.indexOf("ActivityWatch");
    const intelligenceIndex = markup.indexOf("AERTEX Intelligence");
    if (!(workIndex >= 0 && awIndex > workIndex && intelligenceIndex > awIndex)) {
      throw new Error(`Independent product order is wrong for ${root} / ${fullLocale}`);
    }
  }
}

console.log(`Root SSR checks passed for ${SUPPORTED_LOCALES.length} locales across ${QSS_DOMAIN_ROOTS.length} synchronized roots.`);
