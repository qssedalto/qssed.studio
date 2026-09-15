import { enhanceWorkTexCollaboration as enhanceCoreWorkTexCollaboration } from "./ui-work-tex-collaboration-instant-core.js";
import { enhanceWorkTexVersionHistory } from "./ui-work-tex-version-history.js";
import { enhanceWorkTexEditorTools } from "./ui-work-tex-editor-tools.js";
import { enhanceWorkTexVersionDensity } from "./ui-work-tex-version-density.js";
import { enhanceWorkTexEditorRefine } from "./ui-work-tex-editor-refine.js";
import { enhanceWorkTexPreviewSession } from "./ui-work-tex-preview-session.js";
import { enhanceWorkTexPreviewFastPath } from "./ui-work-tex-preview-fastpath.js";
import { enhanceWorkTexPreviewDirectCache } from "./ui-work-tex-preview-direct-cache.js";
import { enhanceWorkTexRealtime } from "./ui-work-tex-realtime.js";
import { enhanceWorkTexCodeMirror } from "./ui-work-tex-codemirror.js";
import { enhanceWorkTexSharedStable } from "./ui-work-tex-shared-stable.js";

export function enhanceWorkTexCollaboration(markup, zh) {
  return enhanceWorkTexSharedStable(
    enhanceWorkTexCodeMirror(
      enhanceWorkTexRealtime(
        enhanceWorkTexPreviewDirectCache(
          enhanceWorkTexPreviewFastPath(
            enhanceWorkTexPreviewSession(
              enhanceWorkTexEditorRefine(
                enhanceWorkTexVersionDensity(
                  enhanceWorkTexEditorTools(
                    enhanceWorkTexVersionHistory(enhanceCoreWorkTexCollaboration(markup, zh), zh),
                    zh
                  )
                ),
                zh
              ),
              zh
            )
          )
        ),
        zh
      ),
      zh
    )
  );
}
