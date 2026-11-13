import assert from "node:assert/strict";
import vm from "node:vm";
import { enhanceWorkTexFileChat } from "../studio/ui-work-tex-file-chat.js";

for(const zh of [true,false]){
  const html=enhanceWorkTexFileChat("",zh);
  const css=html.split('<style id="aertex-file-chat-style">')[1]?.split("</style>")[0];
  const js=html.split('<script id="aertex-file-chat-runtime">')[1]?.split("</script>")[0];
  assert(css&&js,"Chat CSS and browser code must be included");
  new vm.Script(js);
  assert(html.includes('id="aertex-filechat"')===false,
    "Chat markup is constructed only once by runtime");
  assert(!html.includes('aertex-project-passkey-help-script'),"No verification tutorial");
  assert(!js.includes('id="aertex-chat-passkey"'),"No Passkey button");
  assert(!js.includes('aertex-chat-unlock-view'),"No Passkey overlay");
  assert(!js.includes("navigator.credentials."),"Never ask for a second credential");
  assert(js.includes("if(active().document)void loadRoom()"),
    "Project message listener must initialize before popup opens");
  assert(js.includes("if(panel.hidden)toggleChat()"),
    "Clicking notification must open existing chat via same toggle");
  assert(js.includes("setTimeout(()=>{toast.hidden=true;},2000)"),
    "Notification duration must be exactly 2 seconds");
  assert(js.includes("const top=Math.max(visualTop+gap,(rect?.bottom||64)+8)"),
    "Popup must be positioned just below the chat bubble");
  assert(js.includes("state.lastMessage=null"),"New project must reset message baseline");
  assert(js.includes("if(state.document!==current.document)void loadRoom()"),
    "Switching projects must change room");
  assert(!js.includes('if(panel.hidden)return;\n    const current=active()'),
    "Closing chat must not stop incoming-message monitoring");
  assert(css.includes('aertex-project-chat-toast[hidden]'),"Hidden toast CSS must be explicit");
  assert(css.includes('z-index:2147483000'),"Top message toast must overlay the site");
  assert(css.includes('width:min(408px,calc(100vw - 24px))'),
    "Floating chat must fit small screens");
  assert(css.includes('resize:none!important'),"Composer may not have resize handle");
  assert(css.includes('.chat-toggle-help input[type=checkbox]'),
    "Dismissible toggle hint still works");
}
console.log("Direct-entry project chat popup: no Passkey, top toast, below-bubble anchor, project watcher PASS");
