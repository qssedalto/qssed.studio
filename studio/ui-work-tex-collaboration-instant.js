import { enhanceWorkTexCollaboration as enhanceCoreWorkTexCollaboration } from "./ui-work-tex-collaboration-instant-core.js";
import { enhanceWorkTexVersionHistory } from "./ui-work-tex-version-history.js";
import { enhanceWorkTexEditorTools } from "./ui-work-tex-editor-tools.js";
import { enhanceWorkTexVersionDensity } from "./ui-work-tex-version-density.js";

export function enhanceWorkTexCollaboration(markup, zh) {
  return enhanceWorkTexVersionDensity(
    enhanceWorkTexEditorTools(
      enhanceWorkTexVersionHistory(enhanceCoreWorkTexCollaboration(markup, zh), zh),
      zh
    )
  );
}
