// The visual Markdown editor is bundled and served from the Work origin.
// No remote module, stylesheet, or telemetry is requested by this editor.
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import { TableKit } from "@tiptap/extension-table";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image";

export function createMarkdownVisualEditor({ element, markdown, editable, onUpdate }) {
  const editor = new Editor({
    element,
    content: String(markdown || ""),
    contentType: "markdown",
    editable: Boolean(editable),
    autofocus: false,
    extensions: [
      StarterKit,
      TableKit.configure({ table: { resizable: false } }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Image.configure({ allowBase64: false }),
      Markdown.configure({ markedOptions: { gfm: true } })
    ],
    editorProps: {
      attributes: {
        class: "aertex-markdown-prosemirror",
        spellcheck: "true",
        "aria-label": "Markdown visual document editor"
      },
      // Block browser-native HTML payloads from being pasted unreviewed.
      // Tiptap/ProseMirror schema filters unsupported elements.
    },
    onUpdate: ({ editor: active }) => {
      if (typeof onUpdate === "function") onUpdate(active.getMarkdown());
    }
  });
  return editor;
}
