import { TEXT } from "../studio/config.js";
import { buildLinks } from "../studio/routing.js";
import { osPage } from "../studio/ui-shell.js";
import { SUPPORTED_LOCALES, localeContentLanguage } from "../studio/locale.js";

const ipInfo = { ip:"127.0.0.1", country:"US", region:"", city:"", locale:"en-us" };

for (const fullLocale of SUPPORTED_LOCALES) {
  const contentLanguage = localeContentLanguage(fullLocale);
  const t = TEXT[contentLanguage];
  if (!t) throw new Error(`Missing base TEXT dictionary for ${fullLocale} -> ${contentLanguage}`);

  const links = buildLinks(contentLanguage, "/", fullLocale);
  const productLinks = {
    workHref: `https://work.qsseda.com/${fullLocale}/tex`,
    gptHref: `https://gpt.qsseda.com/${fullLocale}`,
    adminHref: "",
    activeLocale: fullLocale
  };

  let markup;
  try {
    markup = osPage(t, links, "/", { ...ipInfo, locale: fullLocale }, "", productLinks);
  } catch (error) {
    console.error(`Root SSR failed for locale ${fullLocale}`);
    throw error;
  }

  if (typeof markup !== "string" || !markup.includes('<body class="os-shell">')) {
    throw new Error(`Root SSR did not produce the Studio shell for ${fullLocale}`);
  }
  if (!markup.includes(`lang="${fullLocale}"`)) {
    throw new Error(`Root SSR lost locale ${fullLocale}`);
  }
}

console.log(`Root SSR checks passed for ${SUPPORTED_LOCALES.length} locales.`);
