import vm from "node:vm";
import { renderGptApp, renderIntelligenceNotFound, renderSharedConversation } from "../studio/gpt-ui.js";

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
    'id="sidebarToggle"',
    'id="topNewChat"',
    'id="sidebarBackdrop"',
    'aria-controls="gptSidebar"',
    'class="iconButton sidebarNewChat"',
    'class="sidebarToggleGlyph"',
    'class="composeGlyph"',
    'M5.25 8.25h13.5',
    'M5.25 15.75h9',
    'aertex-intelligence-sidebar-v1',
    'app.classList.toggle("sidebar-collapsed"',
    'app.classList.toggle("sidebar-open"',
    'rename.dataset.action="rename"',
    'share.dataset.action="share"',
    'id="shareChoice"',
    'id="shareWithName"',
    'id="shareAnonymous"',
    'share_author_name:shareAuthorName',
    'chooseShareIdentity()',
    'window.AERTEXRich',
    'window.AERTEXRich.stream(assistant,streamed)',
    'window.AERTEXRich.finalize(assistant,streamed)',
    'cdn.jsdelivr.net/npm/katex@0.16.11',
    'cdn.jsdelivr.net/npm/highlight.js@11.10.0',
    'className = "codeCopy"',
    'className = "tableScroll"',
    'rel = "noopener noreferrer nofollow"',
    'del.dataset.action="delete"',
    'history.replaceState({conversationId:state.conversationId}',
    'qssed_theme',
    'data-theme="dark"',
    'id="watchModelButton"',
    'id="watchModelSheet"',
    'id="watchModelList"',
    'class="sendGlyph"',
    'aertex-intelligence-draft-v1:',
    'window.visualViewport',
    'persistComposerDraft(message)',
    'clearComposerDraft()',
  ]) {
    if (!html.includes(required)) throw new Error(`GPT UI ${locale} missing multi-provider invariant: ${required}`);
  }
  if (!html.includes('@media(max-width:760px)') || !html.includes('.app.sidebar-open .sidebar')) {
    throw new Error("Intelligence must provide mobile overlay sidebar behavior");
  }
  if (!html.includes('(max-width:320px) and (max-height:520px)') || !html.includes('.watchModelOption[aria-checked="true"]')) {
    throw new Error("Intelligence must provide a dedicated tiny-watch layout and model picker");
  }
  if (!html.includes('button.dataset.model=option.value||""') || !html.includes('select.dispatchEvent(new Event("change",{bubbles:true}))')) {
    throw new Error("Watch model selection must use exact model/provider matching instead of the native select hit target");
  }
  if (!html.includes('window.addEventListener("pagehide",()=>persistComposerDraft())') || !html.includes('document.addEventListener("visibilitychange"')) {
    throw new Error("Intelligence must preserve drafts across watch input suspension and page restoration");
  }
  if (!html.includes('.app.sidebar-collapsed .composerWrap{left:0}')) {
    throw new Error("Intelligence composer must follow desktop sidebar collapse state");
  }
  if (!html.includes('window.AERTEXRich.stream(assistant,streamed)') || !html.includes('window.AERTEXRich.finalize(assistant,streamed)')) {
    throw new Error("Assistant output must use the rich streaming render path");
  }
  if (html.includes('bubble.className="bubble";bubble.textContent=content')) {
    throw new Error("Assistant history rendering must not use the legacy unconditional plain-text path");
  }
  const shared = renderSharedConversation(locale, { conversation: { title: "Rich share", author_name: "Example Author" }, messages: [{ role: "assistant", content: "**bold**\n\n```js\nconst x=1;\n```" }] }, "dark");
  if (!shared.includes('data-rich-message="true"') || !shared.includes("AERTEXRich.enhance(document)")) {
    throw new Error("Shared Intelligence conversations must preserve rich assistant formatting");
  }
  if (!shared.includes("Example Author")) {
    throw new Error("Shared Intelligence conversation must render an explicitly shared author name");
  }
  const anonymousShared = renderSharedConversation(locale, { conversation: { title: "Anonymous share", author_name: "" }, messages: [] }, "dark");
  if (anonymousShared.includes("Example Author")) {
    throw new Error("Anonymous shared Intelligence conversations must not leak an author name");
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
