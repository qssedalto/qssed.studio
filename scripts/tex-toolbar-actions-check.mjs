import assert from "node:assert/strict";
import { enhanceWorkTexEditorTools } from "../studio/ui-work-tex-editor-tools.js";

// Exercise the generated browser runtime, not just source-code substrings.
// In particular Copy must never invoke Save As, and Save As must POST only
// after explicit form submission and open the new document's correct route.
for (const zh of [true, false]) {
  const html = enhanceWorkTexEditorTools("", zh);
  const script = html.match(/<script id="qsseda-work-tex-editor-tools-runtime">([\s\S]*?)<\/script>/)?.[1];
  assert(script, "Missing editor commands runtime");
  const handlers = new Map();
  const buttons = new Map();
  const requests = [];
  const navigations = [];
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
      click() { if (!this.disabled) return this.emit("click"); },
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
  assert.equal(saveAsDialog.open, true, "Save As must open a dialog");
  assert.equal(requests.length, 0, "Opening Save As must not immediately submit");
  input.value = "  ";
  form.emit("submit");
  await flush();
  assert.equal(requests.length, 0, "Blank names must not create a document");
  assert.equal(error.hidden, false, "Blank-name error must be visible");

  input.value = "My Copy";
  form.emit("submit");
  await flush();
  const created = requests.filter(item => item.url === "/api/tex/documents" && item.options.method === "POST");
  assert.equal(created.length, 1, "Save As must create exactly one document");
  assert.equal(JSON.parse(created[0].options.body).title, "My Copy", "Save As must use the new title");
  assert.equal(navigations[0], "/" + locale + "/d/new-document-id",
    "Save As must navigate to the newly created document in the same locale");
  assert.equal(saveAsDialog.open, false, "Save As should close after success");

  assert(html.includes("svg.tex-smooth-icon"), "Missing smooth Windows-style SVGs");
  assert(html.includes("saveAs:") && html.includes("copy:"), "Distinct copy and Save As icons required");
  assert(!html.includes("M9 29V18.8c0-.8"), "Old save-as pencil-crossing line must not return");
}
console.log("Work TeX toolbar Copy / Save As interaction checks passed.");
