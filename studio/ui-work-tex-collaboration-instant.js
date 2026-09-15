import { enhanceWorkTexCollaboration as enhanceCoreWorkTexCollaboration } from "./ui-work-tex-collaboration-instant-core.js";
import { enhanceWorkTexVersionHistory } from "./ui-work-tex-version-history.js";

export function enhanceWorkTexCollaboration(markup, zh) {
  return enhanceWorkTexVersionHistory(enhanceCoreWorkTexCollaboration(markup, zh), zh);
}
