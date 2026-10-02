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
    'className="chatMore"',
    'more.dataset.action="menu"',
    'id="chatMenuPortal"',
    'data-menu-action="share"',
    'data-menu-action="rename"',
    'data-menu-action="pin"',
    'data-menu-action="archive"',
    'data-menu-action="delete"',
    'id="renameDialog"',
    'id="deleteDialog"',
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
    'history.replaceState({conversationId:state.conversationId}',
    'qssed_theme',
    'data-theme="dark"',
    'id="watchModelButton"',
    'id="watchModelPortal"',
    'id="watchModelList"',
    'id="watchComposerForm"',
    'id="watchComposerInput"',
    'class="sendGlyph"',
    'aertex-intelligence-draft-v2:',
    'window.visualViewport',
    'persistComposerDraft(message)',
    'clearComposerDraft()',
  ]) {
    if (!html.includes(required)) throw new Error(`GPT UI ${locale} missing multi-provider invariant: ${required}`);
  }
  if (!html.includes('className="chatLoadError"') || !html.includes('console.error("Unable to load Intelligence conversations",error)')) {
    throw new Error("Intelligence history load failures must be visible instead of looking like an empty sidebar");
  }
  const loadStart = html.indexOf("async function loadConversations(){");
  const loadEnd = html.indexOf("\n${intelligenceWatchClientScript()}", loadStart);
  const loadSource = loadStart >= 0 && loadEnd > loadStart ? html.slice(loadStart, loadEnd) : "";
  if (!loadSource || loadSource.includes("catch{}")) {
    throw new Error("Intelligence history loader must not silently swallow conversation API failures");
  }
  if (html.includes('window.prompt(text.rename') || html.includes('window.confirm(text.confirmDelete)')) {
    throw new Error("Intelligence chat rename/delete must use the in-product ChatGPT-style dialogs instead of browser prompt/confirm");
  }
  if (!html.includes('.chatMenuPortal{position:fixed') || !html.includes('.chatMenuItem.danger') || !html.includes('.chatPin svg')) {
    throw new Error("Intelligence sidebar must provide the ChatGPT-style ellipsis menu, destructive row, and pinned indicator");
  }
  if (!html.includes('JSON.stringify({is_pinned:!item.is_pinned})') || !html.includes('JSON.stringify({is_archived:true})')) {
    throw new Error("Intelligence chat menu must wire pin/unpin and archive actions to the conversation API");
  }
  if (!html.includes('@media(max-width:760px)') || !html.includes('.app.sidebar-open .sidebar')) {
    throw new Error("Intelligence must provide mobile overlay sidebar behavior");
  }
  if (!html.includes('(max-width:320px) and (max-height:520px)') || !html.includes('.watchModelOption[aria-selected="true"]')) {
    throw new Error("Intelligence must provide a dedicated tiny-watch layout and model picker");
  }
  if (!html.includes('.topbarSpacer,.model,.account,.aertex-account-root{display:none!important}')) {
    throw new Error("Tiny-watch layout must hide the native model select and nonessential account chrome");
  }
  if (!html.includes('class="watchModelPortal"') || !html.includes('grid-template-rows:42px minmax(0,1fr)')) {
    throw new Error("Watch model picker must render as a root-level portal with a scrollable list row");
  }
  if (!html.includes('const models=Array.isArray(state.config?.models)?state.config.models:[]')) {
    throw new Error("Watch model picker must render from Intelligence config instead of relying on hidden native select layout");
  }
  if (!html.includes('button.dataset.model=model') || !html.includes('select.dispatchEvent(new Event("change",{bubbles:true}))')) {
    throw new Error("Watch model selection must use exact model/provider matching instead of the native select hit target");
  }
  if (!html.includes('window.addEventListener("pagehide",()=>captureComposerDraft())') || !html.includes('document.addEventListener("visibilitychange"')) {
    throw new Error("Intelligence must preserve drafts across watch input suspension and page restoration");
  }
  if (!html.includes('if(current.length){') || !html.includes('input.value=stored') || !html.includes('composerDraftShadow')) {
    throw new Error("Watch draft restoration must reconcile non-destructively with text returned by the system input UI");
  }
  if (!html.includes('addEventListener("change",event=>') || !html.includes('addEventListener("compositionend",event=>')) {
    throw new Error("Watch composer must capture system-input completion events in addition to ordinary input events");
  }
  if (!html.includes('type="text"') || !html.includes('enterkeyhint="send"') || !html.includes('class="watchComposerInput"')) {
    throw new Error("Tiny-watch composer must use a real editable single-line input so watchOS can present its native Send control");
  }
  if (!html.includes('textarea{display:none!important}') || !html.includes('"watchComposerForm")?.addEventListener("submit"')) {
    throw new Error("Tiny-watch composer must submit the native Watch input through the existing chat send pipeline");
  }
  if (!html.includes('syncWatchInputToComposer()') || !html.includes('watchInput.placeholder=localeBase.startsWith("/zh")?"发消息…":"Message…"')) {
    throw new Error("Watch composer must synchronize native text entry into the existing composer buffer and use a compact placeholder");
  }
  if (html.includes('window.prompt(text.placeholder,current)') || html.includes('watchComposerPromptOpen')) {
    throw new Error("Watch composer must not use JavaScript prompt as its text-entry mechanism");
  }
  if (!html.includes('.msg.user .bubble{max-width:88%;padding:10px 12px') || !html.includes('font-size:18px') || !html.includes('.msg.assistant .bubble{max-width:96%;padding:11px 12px') || !html.includes('font-size:20px')) {
    throw new Error("Tiny-watch chat must use native-scale Messages-like typography for user and assistant bubbles");
  }
  if (!html.includes('.msg.assistant .bubble .richMarkdown{font-size:inherit;line-height:1.42}')) {
    throw new Error("Rich assistant content must inherit the enlarged Watch bubble typography instead of reverting to desktop line-height");
  }
  if (!html.includes('.watchComposerInput{display:block') || !html.includes('font-size:17px') || !html.includes('border-radius:999px') || !html.includes('#sendButton{width:42px;height:42px')) {
    throw new Error("Tiny-watch composer must use a large native-scale iMessage-style pill and circular send affordance");
  }
  if (!html.includes('html,body{width:100%;max-width:100%;min-height:100%;overflow-x:hidden;overflow-y:auto}') || !html.includes('.content{min-height:calc(var(--aertex-visual-height,100dvh) - var(--aertex-watch-topbar) - 58px);overflow:visible!important')) {
    throw new Error("Tiny-watch conversation must scroll at the document level so the Digital Crown can move the middle content");
  }
  if (!html.includes('.topbar{position:fixed') || !html.includes('.composerWrap,.app.sidebar-collapsed .composerWrap{position:fixed')) {
    throw new Error("Tiny-watch header and composer must stay fixed while the document conversation scrolls between them");
  }
  if (!html.includes('function scrollChatToBottom(){') || !html.includes('const root=document.scrollingElement||document.documentElement')) {
    throw new Error("Tiny-watch auto-scroll must target the document scroller instead of the non-scrolling middle content container");
  }
  if (!html.includes('watchInputSessionActive=true') || !html.includes('queueWatchAutoSend()') || !html.includes('watchAutoSendTimer=window.setTimeout')) {
    throw new Error("Watch text confirmation must be able to auto-send after the native watchOS input session returns");
  }
  const watchInputBinding = html.match(/\$\("watchComposerInput"\)\?\.addEventListener\("input",[\s\S]*?\}\);/);
  if (!watchInputBinding || watchInputBinding[0].includes('queueWatchAutoSend()')) {
    throw new Error("Watch must not auto-send on every input event while the user is still editing");
  }
  if (!html.includes('.app.sidebar-collapsed .composerWrap{left:0}')) {
    throw new Error("Intelligence composer must follow desktop sidebar collapse state");
  }
  if (!html.includes('window.AERTEXRich.stream(assistant,streamed)') || !html.includes('window.AERTEXRich.finalize(assistant,streamed)')) {
    throw new Error("Assistant output must use the rich streaming render path");
  }
  if (!html.includes('function findBareMathToken(source)') || !html.includes('function appendRecoveredPlain(parent, value)') || !html.includes('function prettyMathFallback(expression)')) {
    throw new Error("Rich renderer must recover bare LaTeX and keep a readable local math fallback");
  }
  if (!html.includes('{ type: "mathDisplay", re: /\\$\\$([\\s\\S]+?)\\$\\$/ }') || !html.includes('{ type: "mathBracket", re: /\\\\\\[([\\s\\S]+?)\\\\\\]/ }')) {
    throw new Error("Rich renderer must support multiline display math with both $...$ and \\[...\\] delimiters");
  }
  if (!html.includes('if (isRecoverableMathOnlyLine(trimmed))') || !html.includes('addMath(fragment, trimmed, true)')) {
    throw new Error("Standalone bare LaTeX equations must be recovered as display math");
  }
  if (!html.includes('.msg.assistant .bubble .mathBlock{max-width:100%') || !html.includes('.msg.assistant .bubble .mathFallback{font-family:ui-serif')) {
    throw new Error("Apple Watch assistant bubbles must keep recovered equations readable and horizontally contained");
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
