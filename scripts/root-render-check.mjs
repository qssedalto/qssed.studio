import { TEXT } from "../studio/config.js";
import { buildLinks } from "../studio/routing.js";
import { osPage } from "../studio/ui-shell.js";
import { decorateWorkNavigation } from "../studio/ui-work.js";
import { polishWorkTexNavigation } from "../studio/ui-work-tex.js";
import { SUPPORTED_LOCALES, localeContentLanguage } from "../studio/locale.js";

const ipInfo = { ip:"127.0.0.1", country:"US", region:"", city:"", locale:"en-us" };

for (const fullLocale of SUPPORTED_LOCALES) {
  const contentLanguage = localeContentLanguage(fullLocale);
  const t = TEXT[contentLanguage];
  if (!t) throw new Error(`Missing base TEXT dictionary for ${fullLocale} -> ${contentLanguage}`);

  const links = buildLinks(contentLanguage, "/", fullLocale);
  const productLinks = {
    workHref: `https://work.qsseda.com/${fullLocale}/tex`,
    awHref: "https://aw.qsseda.studio",
    gptHref: `https://gpt.qsseda.com/${fullLocale}`,
    adminHref: "",
    activeLocale: fullLocale
  };

  let markup;
  try {
    markup = osPage(t, links, "/", { ...ipInfo, locale: fullLocale }, "", productLinks);
    markup = decorateWorkNavigation(markup, contentLanguage === "zh", "/", "https://qsseda.com", "https://work.qsseda.com", fullLocale);
    markup = polishWorkTexNavigation(markup, contentLanguage === "zh", "/", "https://work.qsseda.com");
  } catch (error) {
    console.error(`Authenticated home render chain failed for locale ${fullLocale}`);
    throw error;
  }

  if (typeof markup !== "string" || !markup.includes('<body class="os-shell">')) {
    throw new Error(`Root SSR did not produce the Studio shell for ${fullLocale}`);
  }
  if (!markup.includes(`lang="${fullLocale}"`)) {
    throw new Error(`Root SSR lost locale ${fullLocale}`);
  }
  if (!markup.includes('href="https://aw.qsseda.studio"') || !markup.includes('ActivityWatch')) {
    throw new Error(`Root SSR lost the ActivityWatch independent product for ${fullLocale}`);
  }
  const workIndex = markup.indexOf("AERTEX Work");
  const awIndex = markup.indexOf("ActivityWatch");
  const intelligenceIndex = markup.indexOf("AERTEX Intelligence");
  if (!(workIndex >= 0 && awIndex > workIndex && intelligenceIndex > awIndex)) {
    throw new Error(`Independent product order is wrong for ${fullLocale}`);
  }
}

console.log(`Root SSR checks passed for ${SUPPORTED_LOCALES.length} locales.`);
