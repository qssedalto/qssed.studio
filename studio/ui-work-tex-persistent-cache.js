// Persistent per-account, per-document browser cache for Work TeX documents.
// Access control stays on the Worker; cached payloads never bypass route authorization.
const cacheRuntime = "(() => {\n  if (window.__aertexTexDocumentCache) return;\n  const root = document.querySelector('.tex-work-app[data-tex-root]');\n  const userId = String(root?.dataset?.texCacheUser || '').trim().toLowerCase();\n  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;\n  if (!uuid.test(userId) || !window.indexedDB) return;\n\n  const databaseName = 'aertex-work-tex-documents-v1';\n  const storeName = 'documents';\n  const keyFor = id => userId + ':' + id.toLowerCase();\n  const safeId = id => uuid.test(String(id || '')) ? String(id).toLowerCase() : '';\n  const openDb = new Promise(resolve => {\n    try {\n      const request = indexedDB.open(databaseName, 1);\n      request.onupgradeneeded = () => {\n        const db = request.result;\n        if (!db.objectStoreNames.contains(storeName)) db.createObjectStore(storeName, { keyPath: 'key' });\n      };\n      request.onsuccess = () => {\n        const db = request.result;\n        db.onversionchange = () => db.close();\n        resolve(db);\n      };\n      request.onerror = () => resolve(null);\n      request.onblocked = () => resolve(null);\n    } catch { resolve(null); }\n  });\n\n  async function transaction(mode, work) {\n    const db = await openDb;\n    if (!db) return null;\n    return new Promise(resolve => {\n      try {\n        const tx = db.transaction(storeName, mode);\n        const store = tx.objectStore(storeName);\n        let result = null;\n        const req = work(store);\n        if (req) req.onsuccess = () => { result = req.result ?? null; };\n        tx.oncomplete = () => resolve(result);\n        tx.onerror = () => resolve(null);\n        tx.onabort = () => resolve(null);\n      } catch { resolve(null); }\n    });\n  }\n\n  async function putDocument(doc) {\n    const id = safeId(doc?.id);\n    if (!id || typeof doc?.source !== 'string' || doc.source.length > 180000) return;\n    try {\n      const entry = {\n        key: keyFor(id), userId, docId: id, cachedAt: Date.now(),\n        document: {\n          id,\n          title: String(doc.title || '').slice(0, 180),\n          source: doc.source,\n          engine: String(doc.engine || 'xelatex').slice(0, 24),\n          created_at: doc.created_at || '',\n          updated_at: doc.updated_at || '',\n          owner_id: String(doc.owner_id || ''),\n          collaboration_role: doc.collaboration_role || ''\n        }\n      };\n      await transaction('readwrite', store => store.put(entry));\n    } catch {}\n  }\n\n  async function getDocument(id) {\n    const normalized = safeId(id);\n    if (!normalized) return null;\n    const entry = await transaction('readonly', store => store.get(keyFor(normalized)));\n    if (!entry || entry.userId !== userId || entry.docId !== normalized) return null;\n    if (entry.document?.id !== normalized || typeof entry.document?.source !== 'string') return null;\n    return entry.document;\n  }\n\n  async function removeDocument(id) {\n    const normalized = safeId(id);\n    if (normalized) await transaction('readwrite', store => store.delete(keyFor(normalized)));\n  }\n\n  async function clearAccount() {\n    const db = await openDb;\n    if (!db) return;\n    await new Promise(resolve => {\n      try {\n        const tx = db.transaction(storeName, 'readwrite');\n        const cursor = tx.objectStore(storeName).openCursor();\n        cursor.onsuccess = () => {\n          const next = cursor.result;\n          if (!next) return;\n          if (next.value?.userId === userId) next.delete();\n          next.continue();\n        };\n        tx.oncomplete = () => resolve();\n        tx.onerror = () => resolve();\n        tx.onabort = () => resolve();\n      } catch { resolve(); }\n    });\n  }\n\n  window.__aertexTexDocumentCache = { getDocument, putDocument, removeDocument, clearAccount };\n\n  const upstreamFetch = window.fetch.bind(window);\n  window.fetch = async function aertexTexCacheFetch(input, init) {\n    const response = await upstreamFetch(input, init);\n    let url;\n    try { url = new URL(input instanceof Request ? input.url : String(input || ''), location.href); } catch { return response; }\n    if (url.origin !== location.origin) return response;\n    const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();\n    if (url.pathname === '/api/auth/logout' && method === 'POST' && response.ok) {\n      void clearAccount();\n      return response;\n    }\n    const documentApi = url.pathname === '/api/tex/documents';\n    const sharedApi = url.pathname === '/api/tex/collaboration/shared';\n    const id = safeId(url.searchParams.get(documentApi ? 'id' : 'document'));\n    if (!documentApi && !sharedApi) return response;\n    if (id && [401, 403, 404].includes(response.status)) {\n      void removeDocument(id);\n      return response;\n    }\n    if (documentApi && method === 'DELETE' && id && response.ok) {\n      void removeDocument(id);\n      return response;\n    }\n    if (!response.ok || (method !== 'GET' && method !== 'PUT' && method !== 'POST')) return response;\n    // Realtime collaboration has already resolved owner/shared permissions.\n    // Save only full documents returned by the authoritative API, never list\n    // summaries or arbitrary user-supplied fetch bodies.\n    void response.clone().json().then(data => {\n      if (data?.document) void putDocument(data.document);\n    }).catch(() => {});\n    return response;\n  };\n})();";
// Persistent IndexedDB documents are a background cache only. A cached TeX
// source has no trustworthy main_deleted/main_filename/file list and can
// show the WRONG main.tex after the entry was deleted, replaced or renamed.
// Wait for the already-in-flight authenticated API GET before painting source.
const hydrateSource = "function restorePreviouslyOpenedDocument(){\\n" +
  "  // The server-authorized document loader remains visible until the\\n" +
  "  // authoritative GET returns. Do not inject a stale cached source.\\n" +
  "}\\n";

export function enhanceWorkTexPersistentCache(markup) {
  let source = String(markup || "");
  const anchors = [
    ["function renderEditor(){const open=Boolean(activeDocument);", "function renderEditor(){if(activeDocument)document.getElementById('tex-document-restore')?.remove();const open=Boolean(activeDocument);"],
    ["placeholder.hidden=open;", "placeholder.hidden=open||Boolean(routeDocumentId());"],
    ["async function initialize(){try{", hydrateSource + "async function initialize(){void restorePreviouslyOpenedDocument();try{"],
    ["if(requested)await openDocument(requested,'replace');", "if(requested)await openDocument(requested,'replace',true);"],
    ["showMessage(error?.message||copy.error,true);}}\n          title.addEventListener", "showMessage(error?.message||copy.error,true);const loader=document.getElementById('tex-document-restore');if(loader)loader.textContent=error?.message||copy.error;}}\n          title.addEventListener"],
    ["if(ticket!==documentOpenTicket)return;\n    if(!data?.document)throw new Error(copy.error);", "if(ticket!==documentOpenTicket)return;\n    if(!data?.document)throw new Error(copy.error);"],
    ["    renderEditor();\n    renderDocuments();\n    if(routeMode)syncDocumentRoute(id,routeMode==='replace');", "    renderEditor();\n    editor.inert=false;\n    delete root.dataset.texCachePreview;\n    renderDocuments();\n    if(routeMode)syncDocumentRoute(id,routeMode==='replace');"]
  ];
  for (const [before, after] of anchors) {
    if (source.split(before).length !== 2) throw new Error("Work TeX cache integration anchor changed: " + before.slice(0, 55));
    source = source.replace(before, after);
  }
  return source + '<script id="qsseda-work-tex-document-cache">' + cacheRuntime + '</script>';
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Only a server-verified account receives its local-cache partition key.
// The Worker has already checked document access for /<locale>/d/<uuid>,
// before serving this HTML. The cache does not authenticate a request.
export function prepareWorkTexDocumentShell(markup, { userId = "", documentId = "", zh = true } = {}) {
  let output = String(markup || "");
  const user = UUID.test(String(userId)) ? String(userId).toLowerCase() : "";
  if (!user) return output;
  const root = '<section class="tex-workbench tex-work-app" data-tex-root>';
  if (!output.includes(root)) throw new Error("Work TeX cache root markup changed.");
  output = output.replace(root,
    '<section class="tex-workbench tex-work-app" data-tex-root data-tex-cache-user="' + user + '">');
  if (!UUID.test(String(documentId))) return output;
  const placeholder = '<div id="tex-editor-placeholder" class="tex-editor-placeholder">';
  const editor = '<section id="tex-editor" class="tex-editor" hidden>';
  if (!output.includes(placeholder) || !output.includes(editor)) {
    throw new Error("Work TeX authorized document shell anchors changed.");
  }
  // Do not paint the welcome page for a deep-linked document, even for users
  // without an existing IndexedDB snapshot. Show a calm progress state until
  // a cached copy (or the verified live copy) is ready.
  output = output.replace(placeholder,
    '<div id="tex-editor-placeholder" class="tex-editor-placeholder" hidden>');
  const label = zh ? '正在打开文档…' : 'Opening document…';
  const loading = '<div class="tex-document-restore" id="tex-document-restore" role="status" aria-live="polite"><span class="tex-document-restore-spinner" aria-hidden="true"></span>' + label + '</div>';
  output = output.replace(editor, loading + editor);
  const css = '<style id="tex-document-restoration-style">' +
    '#tex-editor-placeholder[hidden]{display:none!important}' +
    '.tex-work-app .tex-document-restore{min-height:260px;display:flex;align-items:center;justify-content:center;gap:12px;color:var(--muted);font-size:13px}' +
    '.tex-work-app .tex-document-restore-spinner{width:18px;height:18px;border-radius:50%;border:2px solid var(--border);border-top-color:var(--primary);animation:tex-doc-restore-spin .8s linear infinite}' +
    '@keyframes tex-doc-restore-spin{to{transform:rotate(360deg)}}' +
    '</style>';
  return output.replace('</head>', css + '</head>');
}
