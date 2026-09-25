import vm from "node:vm";
import { renderGptApp, renderIntelligenceNotFound } from "../studio/gpt-ui.js";

for (const locale of ["zh-cn", "en"]) {
  const html = renderGptApp(locale);
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  if (!scripts.length) throw new Error("No GPT inline script found for " + locale);
  scripts.forEach((source, index) => {
    new vm.Script(source, { filename: `gpt-ui-${locale}-inline-${index}.js` });
  });

  for (const required of [
    'option.disabled=item.available===false',
    'option.dataset.providerId=item.provider_id',
    'provider_id:selected.dataset.providerId||null',
    'provider.provider==="bailian"',
    'REGION_UNSUPPORTED',
    'id="conversationList"',
    'rename.dataset.action="rename"',
    'share.dataset.action="share"',
    'del.dataset.action="delete"',
    'history.replaceState({conversationId:state.conversationId}',
    'qssed_theme',
    'data-theme="dark"',
  ]) {
    if (!html.includes(required)) throw new Error(`GPT UI ${locale} missing multi-provider invariant: ${required}`);
  }
  if (html.includes('href="/zh-cn/admin"') || html.includes('href="/en/admin"') || html.includes("adminConsole")) {
    throw new Error("Intelligence must not expose administrator navigation");
  }
  const notFound = renderIntelligenceNotFound(locale, { kind: "conversation", theme: "dark" });
  if (notFound.includes("<h1>404</h1>")) throw new Error("Intelligence not-found UI must not render a raw 404 heading");
  for (const required of ["AERTEX", "Intelligence", "nf-art", 'data-theme="dark"', "qssed_theme"]) {
    if (!notFound.includes(required)) throw new Error(`Intelligence not-found ${locale} missing: ${required}`);
  }
}

console.log("GPT multi-provider rendered UI is syntactically valid.");
