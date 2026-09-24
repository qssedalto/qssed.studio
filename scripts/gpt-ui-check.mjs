import vm from "node:vm";
import { renderGptApp } from "../studio/gpt-ui.js";

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
    'boot.isAdmin===true'
  ]) {
    if (!html.includes(required)) throw new Error(`GPT UI ${locale} missing multi-provider invariant: ${required}`);
  }
}

console.log("GPT multi-provider rendered UI is syntactically valid.");
