// 初学者导读：TeX 工作区主 API 路由：把编辑器请求分发到文件、编译、协作等具体逻辑，避免在路由层重复底层实现。
import { handleTexApi as handleCoreTexApi } from "./tex-api-core.js";
import { handleTexSharedCollaboration } from "./tex-collaboration-shared.js";
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
  let sharedFallbackRequest = null;

  if (action === "documents") {
    try {
      const url = new URL(request.url);
      const documentId = url.searchParams.get("id") || "";
      if (request.method === "DELETE") {
        deleteDocumentId = documentId;
        const identity = await identifyTexVersionUser(request);
        deleteOwnerId = identity.userId || "";
      } else if (documentId && (request.method === "GET" || request.method === "PUT")) {
        // Keep an untouched request body for the shared-document fallback. The
        // account-scoped core PUT parser consumes the original request before it
        // can discover that the document belongs to another owner.
        sharedFallbackRequest = request.clone();
      }
    } catch {}
  }

  let response = await handleCoreTexApi(request, env, action);

  // The browser always opens/saves TeX through /api/tex/documents. If the
  // account-scoped lookup misses, resolve the exact same document through the
  // collaboration ACL on the server. This makes shared-document access
  // independent from client-side fetch interception or script initialization
  // order, while still requiring an explicit collaborator row.
  if (action === "documents" && response.status === 404 && sharedFallbackRequest) {
    response = await handleSharedDocumentFallback(sharedFallbackRequest, env);
  }

  if (action !== "documents" || !response.ok) return response;

  if (request.method === "GET") {
    response = await mergeSharedDocumentList(request, env, response);
  } else if (request.method === "POST" || request.method === "PUT") {
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

async function handleSharedDocumentFallback(request, env) {
  try {
    const url = new URL(request.url);
    const documentId = String(url.searchParams.get("id") || "").trim();
    if (!documentId) return new Response(JSON.stringify({ error: "TeX document not found." }), {
      status: 404,
      headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" }
    });

    url.pathname = "/api/tex/collaboration/shared";
    url.searchParams.delete("id");
    url.searchParams.set("document", documentId);
    return handleTexSharedCollaboration(new Request(url.toString(), request), env);
  } catch {
    return new Response(JSON.stringify({ error: "TeX document not found." }), {
      status: 404,
      headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store" }
    });
  }
}

async function mergeSharedDocumentList(request, env, ownResponse) {
  const url = new URL(request.url);
  if (url.searchParams.get("id")) return ownResponse;

  try {
    const ownData = await ownResponse.clone().json();
    const sharedResponse = await handleTexSharedCollaboration(request, env);
    if (!sharedResponse.ok) return ownResponse;

    const sharedData = await sharedResponse.clone().json().catch(() => null);
    const ownDocuments = Array.isArray(ownData?.documents) ? ownData.documents : [];
    const sharedDocuments = Array.isArray(sharedData?.documents) ? sharedData.documents : [];
    if (!sharedDocuments.length) return ownResponse;

    const documents = [];
    const seen = new Set();
    for (const document of [...ownDocuments, ...sharedDocuments]) {
      const id = String(document?.id || "").trim();
      if (!id || seen.has(id)) continue;
      seen.add(id);
      documents.push(document);
    }
    documents.sort((a, b) => String(b?.updated_at || "").localeCompare(String(a?.updated_at || "")));

    const headers = new Headers(ownResponse.headers);
    headers.set("content-type", "application/json;charset=UTF-8");
    headers.set("cache-control", "private, no-store");
    headers.delete("content-length");
    return new Response(JSON.stringify({
      ...ownData,
      documents,
      count: documents.length,
      scope: "own-and-shared"
    }), {
      status: ownResponse.status,
      statusText: ownResponse.statusText,
      headers
    });
  } catch {
    return ownResponse;
  }
}
