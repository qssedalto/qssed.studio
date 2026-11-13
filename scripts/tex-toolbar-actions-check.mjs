import assert from "node:assert/strict";
import { enhanceWorkTexEditorTools } from "../studio/ui-work-tex-editor-tools.js";
import { enhanceWorkTexCompileToolbar } from "../studio/ui-work-tex-compile-toolbar.js";
import fs from "node:fs";
import vm from "node:vm";

// Exercise the generated browser runtime, not just source-code substrings.
// Copy only selected text; Save As downloads a local .tex file and must never POST.
for (const zh of [true, false]) {
  const html = enhanceWorkTexEditorTools("", zh);
  const script = html.match(/<script id="qsseda-work-tex-editor-tools-runtime">([\s\S]*?)<\/script>/)?.[1];
  assert(script, "Missing editor commands runtime");
  const handlers = new Map();
  const buttons = new Map();
  const requests = [];
  const navigations = [];
  const downloads = [];
  let clipboard = "";
  let copyCount = 0;

  function node(tag = "div") {
    const listeners = new Map();
    return {
      tag, listeners, dataset: {}, style: {}, hidden: false,
      value: "", disabled: false, open: false,
      classList: { toggle() {} },
      setAttribute() {}, append() {}, appendChild() {}, remove() {},
      insertBefore() {}, focus() {}, select() {}, scrollIntoView() {},
      addEventListener(type, fn) {
        if (!listeners.has(type)) listeners.set(type, []);
        listeners.get(type).push(fn);
      },
      emit(type) {
        const e = { type, target: this, preventDefault() {}, stopPropagation() {}, key: "" };
        return (listeners.get(type) || []).map(fn => fn(e));
      },
      click() { if (this.tag === "a") downloads.push({filename:this.download,href:this.href}); if (!this.disabled) return this.emit("click"); },
      showModal() { this.open = true; },
      close(value = "") { this.open = false; this.returnValue = value; this.emit("close"); },
      querySelector() { return null; }
    };
  }

  const input = node("input");
  const form = node("form");
  const error = node("p");
  error.hidden = true;
  const cancel = node("button");
  const confirm = node("button");
  const saveAsDialog = node("dialog");
  saveAsDialog.querySelector = selector => ({
    form, input, ".tex-save-as-error": error,
    '[data-action="cancel"]': cancel, '[data-action="create"]': confirm
  })[selector] || null;

  const deleteDialog = node("dialog");
  const fileName = node("li");
  const deleteClose = node("button");
  const deleteCancel = node("button");
  const deleteConfirm = node("button");
  deleteDialog.querySelector = selector => ({
    ".tex-delete-file-name": fileName,
    ".tex-delete-dialog-close": deleteClose,
    ".tex-delete-dialog-cancel": deleteCancel,
    ".tex-delete-dialog-confirm": deleteConfirm
  })[selector] || null;

  const source = node("textarea");
  source.value = "alpha beta";
  source.selectionStart = 0;
  source.selectionEnd = 5;
  const title = node("input");
  title.value = "main.tex";
  const editor = node("section");
  const sourceLabel = node("div");
  sourceLabel.lastElementChild = node("div");
  const root = node("div");
  root.dataset.texCollaborationDocumentId = "document-1";
  root.dataset.texCollaborationAccessRole = "owner";
  root.querySelector = selector => selector === ".tex-source-label" ? sourceLabel : null;
  const message = node("div");
  const state = node("span");
  const footerDelete = node("button");
  const objects = new Map([
    ["tex-source", source], ["tex-title", title], ["tex-engine", { value: "xelatex" }],
    ["tex-editor", editor], ["tex-message", message],
    ["tex-save-state", state], ["tex-delete", footerDelete]
  ]);
  const document = {
    querySelector: selector => selector === ".tex-work-app[data-tex-root]" ? root : null,
    getElementById: id => objects.get(id) || null,
    createElement(tag) {
      if (tag === "dialog") return handlers.has("save-dialog") ? deleteDialog : (handlers.set("save-dialog", saveAsDialog), saveAsDialog);
      const element = node(tag);
      if (tag === "button") {
        Object.defineProperty(element, "title", {
          set(value) { buttons.set(value, element); }
        });
      }
      return element;
    },
    body: { append() {} },
    addEventListener() {},
    execCommand() { return true; }
  };
  const window = {
    setTimeout(callback) { callback(); },
    requestAnimationFrame(callback) { callback(); },
    addEventListener() {},
    dispatchEvent() {}
  };
  const navigator = { clipboard: {
    async writeText(value) { clipboard = value; copyCount += 1; },
    async readText() { return clipboard; }
  }};
  const locale = zh ? "zh-cn" : "en-us";
  const location = {
    pathname: "/" + locale + "/d/document-1",
    assign(url) { navigations.push(url); }
  };
  const fetch = async (url, options) => {
    requests.push({ url, options });
    return { ok: true, async json() { return { document: { id: "new-document-id", title: "My Copy" } }; } };
  };
  class Observer { observe() {} }
  class FakeEvent { constructor(type) { this.type = type; } }
  new Function("window", "document", "navigator", "MutationObserver", "Event",
    "location", "fetch", "CustomEvent", script)(
      window, document, navigator, Observer, FakeEvent, location, fetch, class {}
    );
  const button = action => {
    const result = [...buttons.values()].find(item => item.dataset.texAction === action);
    assert(result, "Missing " + action + " toolbar button");
    assert.equal(result.id, "tex-command-" + action, "Stable toolbar ID mismatch");
    return result;
  };
  const flush = async () => { for (let i = 0; i < 12; i += 1) await Promise.resolve(); };

  button("copy").click();
  await flush();
  assert.equal(clipboard, "alpha", "Copy must use source selection");
  assert.equal(copyCount, 1, "Copy must write exactly once");
  assert.equal(saveAsDialog.open, false, "Copy must not open Save As");
  assert.equal(requests.length, 0, "Copy must not create a document");

  button("save-as").click();
  assert.equal(saveAsDialog.open, false, "Save As must no longer open the cloud-duplicate dialog");
  assert.equal(downloads.length, 1, "Save As must initiate exactly one local file download");
  assert.equal(downloads[0].filename, "main.tex", "Local file download must retain filename");
  assert.equal(requests.length, 0, "Save As must not create a cloud document");
  assert.equal(navigations.length, 0, "Save As must not navigate away from the editor");
  source.selectionStart = 0; source.selectionEnd = 0;
  source.emit("select");
  assert.equal(button("copy").disabled, true, "Selection-only Copy must be disabled without a selection");
  assert.equal(button("save-as").disabled, false, "Local Save As must remain available without a selection");

  assert(html.includes("svg.tex-fluent-icon"), "Missing actual Microsoft Fluent SVG geometry");
  assert(html.includes("saveAs:") && html.includes("copy:"), "Distinct copy and Save As icons required");
  assert(!html.includes("M9 29V18.8c0-.8"), "Old save-as pencil-crossing line must not return");
  assert(html.includes("tex-fluent-icon .tex-fluent-accent{fill:var(--primary)!important"), "Copy highlight must follow user theme color");
}
// Manual compilation now uses the precise reference circular-play SVG,
 // with dynamic light/dark neutral colors and the original busy accent state.
const toolbarSource=fs.readFileSync(new URL("../studio/ui-work-tex-compile-toolbar.js",import.meta.url),"utf8");
assert(toolbarSource.includes('<circle cx="12" cy="12" r="9.25" stroke="currentColor" stroke-width="2.25"/>') &&
  toolbarSource.includes('d="M10 7.8c0-.59') &&
  toolbarSource.includes('fill="currentColor"') &&
  toolbarSource.includes('.tex-compile-fixed:not(.is-compiling) .tex-compile-vector'),
  "Compile toolbar must use circular-play SVG instead of GitHub Actions artwork");
for(const zh of [true,false]){
  const ui=enhanceWorkTexCompileToolbar("<body></body>",zh);
  const runtime=ui.match(/<script id="aertex-tex-compile-toolbar-runtime">([\s\S]*?)<\/script>/)?.[1];
  assert(runtime,"Missing compile toolbar runtime");
  new vm.Script(runtime);
  assert(ui.includes("bar.after(fixed)") &&
    ui.includes("fixed.append(compile)") &&
    ui.includes("flex:0 0 39px!important"),
    "Compile action must be a fixed 39px toolbar control outside scrollable commands");
  assert(ui.includes("title.readOnly=true") && ui.includes("title.hidden=true") &&
    ui.includes("tex-title-static"),"Document title must be static, not editable by clicking its heading");
  assert(ui.includes("tex-build-indicator") && ui.includes("tex-build-download-log") &&
    ui.includes("URL.createObjectURL(payload)"),"Compilation must display a vector result and download its error log locally");
  assert(ui.includes("titleStack.append(heading,saveState)") &&
    ui.includes("titleRow.append(titleStack,indicator,logButton)"),
    "The original live autosave element must be directly below the static project title");
  assert(ui.includes("#tex-editor>.tex-editor-footer") &&
    ui.includes("display:none!important;height:0!important;min-height:0!important") &&
    ui.includes("grid-template-rows:auto auto minmax(0,1fr)!important"),
    "The obsolete footer must have no visible height or reserved layout row");
  assert(ui.includes("max-width:100%!important") &&
    ui.includes("text-overflow:ellipsis!important") &&
    ui.includes(".tex-static-title-stack #tex-save-state"),
    "Save status must be clipped to the available title width without overflowing");
  assert(ui.includes("align-items:flex-start!important") &&
    ui.includes("flex-wrap:nowrap!important") &&
    ui.includes("line-height:24px!important") &&
    ui.includes("height:24px!important;min-height:24px!important;max-height:24px!important"),
    "Project title, result SVG and log control must share a 24px first-line baseline without wrapping");
  assert(ui.includes("font-family:-apple-system,BlinkMacSystemFont") &&
    ui.includes("font-size:12px!important") &&
    ui.includes("margin:0!important;padding:0 9px!important"),
    "Log button should have compact typography and override generic margin/height rules");
  assert(ui.includes(".tex-build-log[hidden]") &&
    ui.includes("display:none!important"),
    "A new page must never show an old failure log until a real compile result arrives");
  assert(!ui.includes("data:image/png"),"Compile toolbar must not render a raster icon");
}
// Run the actual compile-toolbar bootstrap against a minimal DOM. In
// particular, check that it MOVES the existing status node instead of making
// a second, stale copy while the footer remains visually collapsed.
for(const zh of [true,false]){
  const browserScript=enhanceWorkTexCompileToolbar("",zh)
    .match(/<script id="aertex-tex-compile-toolbar-runtime">([\s\S]*?)<\/script>/)?.[1];
  const nodes=new Map();
  const listeners=new Map();
  const el=(id="")=>{
    const n={id,children:[],parentElement:null,dataset:{},textContent:"",hidden:false,
      classList:{flags:new Set(),toggle(name,on){
        if(on)this.flags.add(name);else this.flags.delete(name);
      },contains(name){return this.flags.has(name)}},
      setAttribute(){},removeAttribute(){},addEventListener(type,fn){listeners.set("node:"+id+":"+type,fn)},
      append(...values){for(const value of values){if(value.parentElement){value.parentElement.children=value.parentElement.children.filter(v=>v!==value)}value.parentElement=this;this.children.push(value)}},
      insertBefore(value,ref){const i=this.children.indexOf(ref);if(value.parentElement)value.parentElement.children=value.parentElement.children.filter(v=>v!==value);value.parentElement=this;this.children.splice(i<0?this.children.length:i,0,value)},
      after(value){value.parentElement=this.parentElement;this.insertedAfter=value},
      replaceChildren(...values){this.children=[];this.append(...values)},
      querySelector(){return null}
    };
    if(id)nodes.set(id,n);
    return n;
  };
  const root=el("root"),toolbar=el("toolbar"),bar=el("bar"),title=el("tex-title");
  const footer=el("footer"),saveState=el("save"),compile=el("tex-compile"),source=el("source");
  const titleInput=title;titleInput.value="机器学习";
  footer.append(saveState);
  toolbar.append(titleInput);
  bar.parentElement=el("source-label");
  root.dataset.texCollaborationDocumentId="project-1";
  root.querySelector=key=>({
    ".tex-editor-toolbar":toolbar,".tex-editor-commandbar":bar,
    ".tex-save-state":saveState,"#tex-document-list":null,
    "#tex-source":source,".tex-document-item.is-active":null
  })[key]||null;
  const browserDocument={
    querySelector:key=>key===".tex-work-app[data-tex-root]"?root:null,
    getElementById:key=>nodes.get(key)||null,
    createElement:()=>el(),
    body:{append(){}}
  };
  const browserWindow={
    addEventListener:(type,fn)=>listeners.set(type,fn),
    setTimeout:()=>{throw new Error("Toolbar bootstrap waited for existing elements")}
  };
  vm.runInNewContext(browserScript,{window:browserWindow,document:browserDocument,
    MutationObserver:class{observe(){}disconnect(){}},Blob,URL});
  const stack=saveState.parentElement;
  assert.equal(stack?.className,"tex-static-title-stack","Autosave must be moved into the project title stack");
  assert.equal(stack.children[1],saveState,"Autosave remains the SAME live status node, under heading");
  assert.equal(stack.children[0].textContent,"机器学习");
  assert.equal(footer.children.length,0,"Footer must not retain its autosave content");
  assert.equal(compile.parentElement?.id,"tex-compile-fixed","Compile action must remain outside scrolling group");
  const fixed=compile.parentElement;
  assert.equal(typeof fixed.classList.toggle,"function","Build animation should use native classList semantics");
  assert.equal(titleInput.readOnly,true,"Title input may not be edited directly");
  assert.equal(titleInput.hidden,true,"The old title input is not visible");
  const titleRow=saveState.parentElement.parentElement;
  const indicator=titleRow.children[1];
  const logButton=titleRow.children[2];
  assert.equal(indicator.hidden,true,"Cold-page load must start with no success/failure badge");
  assert.equal(logButton.hidden,true,"Cold-page load must not show Download log");
  listeners.get("aertex:tex-build-result")({detail:{documentId:"project-1",ok:false,log:"TeX error"}});
  assert.equal(indicator.hidden,false,"A real compile error shows the failure SVG");
  assert.equal(logButton.hidden,false,"A real compile error makes the log downloadable");
  listeners.get("aertex:tex-build-started")({detail:{documentId:"project-1",automatic:false}});
  assert.equal(indicator.hidden,true,"New compilation clears the prior failure badge");
  assert.equal(logButton.hidden,true,"New compilation clears the prior failure log button");
  assert.equal(fixed.classList.contains("is-compiling"),true,
    "Manual compiling should start the theme-accent animation");
  listeners.get("aertex:tex-build-finished")({detail:{documentId:"project-1",automatic:false}});
  assert.equal(fixed.classList.contains("is-compiling"),false,
    "Stale completion must restore the normal compile icon");
  const dirty=listeners.get("node:source:input");
  assert.equal(typeof dirty,"function","Source edits must mark pending compilation");
  dirty();
  assert.equal(indicator.hidden,false,"Uncompiled changes must display reference warning SVG");
  assert.equal(indicator.title,zh?"源码已修改，等待编译":"Changes waiting to compile");
  assert.equal(typeof listeners.get("aertex:tex-build-result"),"function","Compilation result listener missing");
}
console.log("Work TeX exact SVG, fixed compile toolbar and status/log checks passed.");
console.log("Work TeX selected Copy and local Save As checks passed.");
