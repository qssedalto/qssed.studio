// A single dependency graph guarantees that CodeMirror uses one state package.
// Delivered from work.qsseda.com; never imported from a browser CDN.
export { EditorView, basicSetup } from "codemirror";
export { EditorState } from "@codemirror/state";
export { StreamLanguage } from "@codemirror/language";
export { stex } from "@codemirror/legacy-modes/mode/stex";
