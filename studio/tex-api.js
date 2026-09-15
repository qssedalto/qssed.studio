import { handleTexApi as handleCoreTexApi } from "./tex-api-core.js";
import {
  handleTexVersionApi,
  identifyTexVersionUser,
  purgeDocumentVersions,
  snapshotDocumentVersion
} from "./tex-version-api.js";

export async function handleTexApi(request, env, action) {
  if (action === "versions") return handleTexVersionApi(request, env);

  let deleteOwnerId = "";
  let deleteDocumentId = "";
  if (action === "documents" && request.method === "DELETE") {
    try {
      deleteDocumentId = new URL(request.url).searchParams.get("id") || "";
      const identity = await identifyTexVersionUser(request);
      deleteOwnerId = identity.userId || "";
    } catch {}
  }

  const response = await handleCoreTexApi(request, env, action);
  if (action !== "documents" || !response.ok) return response;

  if (request.method === "POST" || request.method === "PUT") {
    try {
      const payload = await response.clone().json();
      const document = payload?.document;
      if (document?.id && document?.owner_id) {
        await snapshotDocumentVersion(env, document.owner_id, document, {
          reason: request.method === "POST" ? "created" : "autosave",
          // A PUT already represents one completed cloud autosave. Keep every
          // content-changing autosave as its own version; the version layer still
          // fingerprints identical content, so no-op saves are not duplicated.
          force: true
        });
      }
    } catch {}
  } else if (request.method === "DELETE" && deleteOwnerId && deleteDocumentId) {
    try { await purgeDocumentVersions(env, deleteOwnerId, deleteDocumentId); } catch {}
  }

  return response;
}
