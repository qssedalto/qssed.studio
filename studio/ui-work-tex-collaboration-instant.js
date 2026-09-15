import { enhanceWorkTexCollaboration as enhanceCoreWorkTexCollaboration } from "./ui-work-tex-collaboration-instant-core.js";
import { enhanceWorkTexVersionHistory } from "./ui-work-tex-version-history.js";
import { enhanceWorkTexEditorTools } from "./ui-work-tex-editor-tools.js";

export function enhanceWorkTexCollaboration(markup, zh) {
  return enhanceWorkTexEditorTools(enhanceWorkTexVersionHistory(enhanceCoreWorkTexCollaboration(markup, zh), zh), zh);
}
