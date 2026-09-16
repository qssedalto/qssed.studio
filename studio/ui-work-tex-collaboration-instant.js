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

function stabilizeInvitedCollaborationControls(markup) {
  let output = String(markup || "");

  output = output.replace(
    `        const observer = new MutationObserver(() => {\n          if (!drawer.classList.contains('is-open')) return;\n          applyAccess();\n        });\n        observer.observe(drawer, { childList: true, subtree: true });`,
    `        const refreshAccessControls = () => {\n          if (!drawer.classList.contains('is-open')) return;\n          window.requestAnimationFrame(() => applyAccess());\n          window.setTimeout(() => applyAccess(), 90);\n          window.setTimeout(() => applyAccess(), 320);\n        };\n        drawer.addEventListener('transitionend', refreshAccessControls);\n        window.addEventListener('qsseda:tex-collaboration-snapshot', refreshAccessControls);`
  );

  output = output.replace(
    `        window.addEventListener('pagehide', () => observer.disconnect(), { once: true });`,
    `        window.addEventListener('pagehide', () => {\n          drawer.removeEventListener('transitionend', refreshAccessControls);\n          window.removeEventListener('qsseda:tex-collaboration-snapshot', refreshAccessControls);\n        }, { once: true });`
  );

  return output;
}

export function enhanceWorkTexCollaboration(markup, zh) {
  const output = enhanceWorkTexSharedStable(
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
    ),
    zh
  );

  return stabilizeInvitedCollaborationControls(output);
}
