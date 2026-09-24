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
    'value="bailian"',
    'userProviderAccessSelections',
    'provider_access:providerAccess',
    'daily_limit_tokens:row.querySelector(".dailyTokens").value',
    'monthly_limit_tokens:row.querySelector(".monthlyTokens").value',
    '.statusDot.active',
    'provider.is_active?"active":""',
    'budget!=null',
    'error?.code==="RATE_LIMITED"',
    'Retry-After',
    '.hidden{display:none!important}'
  ]) {
    if (!html.includes(required)) throw new Error(`AI admin ${locale} missing multi-provider invariant: ${required}`);
  }
  if (html.includes("OpenAI-compatible API")) throw new Error(`AI admin ${locale} must not label non-OpenAI providers as OpenAI`);
  const compatibleLabel = locale === "zh-cn" ? "兼容 API" : "Compatible API";
  if (!html.includes(compatibleLabel)) throw new Error(`AI admin ${locale} missing provider-compatible label`);
}
console.log("AI admin rendered inline scripts are syntactically valid.");
