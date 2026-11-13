import assert from "node:assert/strict";
import vm from "node:vm";
import { enhanceWorkTexFileChat } from "../studio/ui-work-tex-file-chat.js";
import { PASSKEY_GUIDE_SCREENSHOTS } from "../studio/ui-work-tex-passkey-guide-images.js";

for(const zh of [true,false]){
  const html=enhanceWorkTexFileChat("",zh);
  const css=html.split('<style id="aertex-file-chat-style">')[1]?.split("</style>")[0];
  const js=html.split('<script id="aertex-file-chat-runtime">')[1]?.split("</script>")[0];
  const help=html.split('<script id="aertex-project-passkey-help-script">')[1]?.split("</script>")[0];
  assert(css&&js&&help,"Chat popup and project Passkey tutorial must be included");
  new vm.Script(js);
  new vm.Script(help);
  assert(js.includes('id="aertex-chat-passkey"'),"Passkey verification button must be restored");
  assert(js.includes('aertex-chat-unlock-view'),"Chat must initially be locked");
  assert(js.includes("navigator.credentials.create")&&js.includes("navigator.credentials.get"),
    "Each project requires a genuine WebAuthn creation or verification");
  assert(js.includes("await api('verify'"),"Server must validate the signed WebAuthn challenge");
  assert(js.includes("reply.token"),"Only a verified project grant can unlock message access");
  assert(js.includes("await api('device'"),"E2EE device identity must be enrolled after Passkey");
  assert(js.includes("state.ready=true")&&js.includes("conversation.hidden=false"),
    "Successful Passkey must open chat without any owner key sharing");
  assert(!js.includes("等待项目所有者共享加密聊天密钥"),
    "Passkey verification may not lead to an indefinite wait for owner-provided encryption keys");
  assert(js.includes("sealMessageEnvelope")&&js.includes("openMessage3")&&
    js.includes("await api('devices'"),"Each new message needs recipient-wrapped E2EE keys");
  assert(js.includes("if(active().document!==state.document)void loadRoom()"),
    "Project switching must revoke current grant, even with chat popup closed");
  assert(js.includes("window.__aertexPasskeyHelp?.reset()"),
    "Project changes must reset independent verification help state");
  assert(js.includes("if(panel.hidden)toggleChat()"),
    "Clicking a notification opens the same Passkey-protected chat popup");
  assert(js.includes("setTimeout(()=>{toast.hidden=true;},2000)"),
    "Top notification should disappear after two seconds");
  assert(js.includes("const top=Math.max(visualTop+gap,(rect?.bottom||64)+8)"),
    "Chat popup must be located directly below the bubble button");
  assert(js.includes("checkNotifications")&&!js.includes("state.token=''\n  notificationTimer"),
    "Metadata-only alerts must keep working when the chat popup is closed");
  assert(css.includes(".aertex-project-chat-toast[hidden]"),
    "Top notification must remain display:none when inactive");
  assert(css.includes("z-index:2147483000"),
    "Notification must sit on top of site content");
  assert(css.includes("width:min(408px,calc(100vw - 24px))"),
    "Popup must remain viewport-responsive");
  assert(css.includes("resize:none!important"),
    "Composer must not expose an accidental resize handle");
  for(const encoded of Object.values(PASSKEY_GUIDE_SCREENSHOTS)){
    assert(html.includes("data:image/webp;base64,"+encoded),
      "Original Windows Passkey verification screenshots must remain in guide");
  }
}
console.log("WebAuthn project gate restored; owner-independent E2EE, 2s top notification, responsive popup and help guide PASS");
