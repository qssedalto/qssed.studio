import vm from "node:vm";
import { renderAiAdmin } from "../studio/ai-admin-ui.js";

for (const locale of ["zh-cn","en"]) {
  const html = renderAiAdmin(locale);
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  if (!scripts.length) throw new Error("No inline script found for " + locale);
  scripts.forEach((source,index) => {
    new vm.Script(source,{filename:`ai-admin-ui-${locale}-inline-${index}.js`});
  });
  for (const required of [
    'id="providerType"',
    'value="zhipu"',
    'userProviderAccessSelections',
    'provider_access:providerAccess'
  ]) {
    if (!html.includes(required)) throw new Error(`AI admin ${locale} missing multi-provider invariant: ${required}`);
  }
}
console.log("AI admin rendered inline scripts are syntactically valid.");
