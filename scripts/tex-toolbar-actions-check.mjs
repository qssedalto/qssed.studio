import assert from "node:assert/strict";
import { enhanceWorkTexEditorTools } from "../studio/ui-work-tex-editor-tools.js";

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
console.log("Work TeX selected Copy and local Save As checks passed.");
