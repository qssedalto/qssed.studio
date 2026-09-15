import { enhanceWorkTexCollaboration as enhanceWarmWorkTexCollaboration } from "./ui-work-tex-collaboration-performance.js";

function replaceExact(source, needle, replacement) {
  const index = source.indexOf(needle);
  if (index < 0) return source;
  return source.slice(0, index) + replacement + source.slice(index + needle.length);
}

export function enhanceWorkTexCollaboration(markup, zh) {
  let output = enhanceWarmWorkTexCollaboration(markup, zh);

  output = replaceExact(
    output,
    `        const userSearchFreshAge = 15 * 1000;`,
    `        const userSearchFreshAge = 15 * 1000;\n        const userDirectoryStorageKey = 'qsseda.tex.collaboration.directory.v1';\n        const userDirectoryMaxAge = 10 * 60 * 1000;\n        let userDirectory = [];\n        let userDirectoryLoadedAt = 0;\n        let userDirectoryReady = false;\n        let userDirectoryPromise = null;`
  );

  output = replaceExact(
    output,
    `        function normalizeSearchQuery(value) {\n          return String(value || '').trim().replace(/^@+/, '').toLowerCase();\n        }`,
    `        function restoreUserDirectory() {\n          if (userDirectoryReady) return;\n          try {\n            const cached = JSON.parse(window.sessionStorage.getItem(userDirectoryStorageKey) || 'null');\n            if (Array.isArray(cached?.results) && Number.isFinite(Number(cached?.ts)) && Date.now() - Number(cached.ts) < userDirectoryMaxAge) {\n              userDirectory = cached.results;\n              userDirectoryLoadedAt = Number(cached.ts);\n              userDirectoryReady = true;\n            }\n          } catch {}\n        }\n\n        function persistUserDirectory(results) {\n          userDirectory = Array.isArray(results) ? results : [];\n          userDirectoryLoadedAt = Date.now();\n          userDirectoryReady = true;\n          try {\n            window.sessionStorage.setItem(userDirectoryStorageKey, JSON.stringify({ ts: userDirectoryLoadedAt, results: userDirectory }));\n          } catch {}\n        }\n\n        function directoryMatches(query) {\n          const key = String(query || '').trim().toLowerCase();\n          if (!key) return [];\n          return userDirectory\n            .filter(person => {\n              const usernameText = String(person?.username || '').toLowerCase();\n              const displayText = String(person?.display_name || '').toLowerCase();\n              return usernameText.includes(key) || displayText.includes(key);\n            })\n            .sort((a, b) => {\n              const aUser = String(a?.username || '').toLowerCase();\n              const bUser = String(b?.username || '').toLowerCase();\n              const aRank = aUser === key ? 0 : aUser.startsWith(key) ? 1 : 2;\n              const bRank = bUser === key ? 0 : bUser.startsWith(key) ? 1 : 2;\n              return aRank - bRank || aUser.length - bUser.length || aUser.localeCompare(bUser);\n            })\n            .slice(0, 8);\n        }\n\n        async function prefetchUserDirectory(force = false) {\n          restoreUserDirectory();\n          if (!force && userDirectoryReady && Date.now() - userDirectoryLoadedAt < userDirectoryMaxAge) return userDirectory;\n          if (userDirectoryPromise) return userDirectoryPromise;\n          const id = activeDocumentId();\n          if (!id) return userDirectory;\n\n          userDirectoryPromise = api('/api/tex/collaboration?action=search&document=' + encodeURIComponent(id) + '&q=__directory__')\n            .then(data => {\n              const results = Array.isArray(data?.results) ? data.results : [];\n              persistUserDirectory(results);\n              return results;\n            })\n            .catch(() => userDirectory)\n            .finally(() => { userDirectoryPromise = null; });\n          return userDirectoryPromise;\n        }\n\n        function normalizeSearchQuery(value) {\n          return String(value || '').trim().replace(/^@+/, '').toLowerCase();\n        }`
  );

  output = replaceExact(
    output,
    `        function cachedSearchResults(query) {\n          const key = normalizeSearchQuery(query);\n          if (!key) return null;\n          const now = Date.now();`,
    `        function cachedSearchResults(query) {\n          const key = normalizeSearchQuery(query);\n          if (!key) return null;\n          restoreUserDirectory();\n          if (userDirectoryReady) return { results: directoryMatches(key), exact: true, age: 0, local: true };\n          const now = Date.now();`
  );

  output = replaceExact(
    output,
    `          if (id) void loadSnapshot(opened);`,
    `          if (id) {\n            void prefetchUserDirectory();\n            void loadSnapshot(opened);\n          }`
  );

  output = replaceExact(
    output,
    `        username.addEventListener('focus', () => {\n          const query = String(username.value || '').trim().replace(/^@+/, '');`,
    `        username.addEventListener('focus', () => {\n          void prefetchUserDirectory();\n          const query = String(username.value || '').trim().replace(/^@+/, '');`
  );

  output = replaceExact(
    output,
    `        setPage(0);\n        syncDocument();`,
    `        setPage(0);\n        restoreUserDirectory();\n        syncDocument();`
  );

  // Initial document loading stays entirely inside the existing TeX state machine.
  // We only replace the misleading empty state with temporary skeleton rows; the
  // existing renderDocuments() call clears these rows as soon as real data arrives.
  output = output.replace(
    '<div id="tex-document-list" class="tex-document-list"></div>',
    `<div id="tex-document-list" class="tex-document-list tex-document-list-loading" aria-busy="true">
      <div class="tex-document-loading-card" aria-hidden="true"><i></i><span></span><small></small></div>
      <div class="tex-document-loading-card" aria-hidden="true"><i></i><span></span><small></small></div>
      <div class="tex-document-loading-card" aria-hidden="true"><i></i><span></span><small></small></div>
    </div>`
  );
  output = output.replace(
    '<div id="tex-documents-empty" class="tex-empty">',
    '<div id="tex-documents-empty" class="tex-empty" hidden>'
  );

  output += `
    <style id="qsseda-work-tex-safe-loading-and-chevron">
      .tex-work-app .tex-document-list-loading .tex-document-loading-card{
        display:grid;
        gap:8px;
        min-height:76px;
        padding:11px 10px;
        border-radius:11px;
        background:transparent;
      }
      .tex-work-app .tex-document-loading-card i,
      .tex-work-app .tex-document-loading-card span,
      .tex-work-app .tex-document-loading-card small{
        display:block;
        border-radius:999px;
        background:color-mix(in srgb,var(--muted) 14%,transparent);
        animation:qssedaTexDocumentPulse 1.05s ease-in-out infinite alternate;
      }
      .tex-work-app .tex-document-loading-card i{width:42%;height:13px}
      .tex-work-app .tex-document-loading-card span{width:82%;height:9px}
      .tex-work-app .tex-document-loading-card small{width:56%;height:8px}
      .tex-work-app .tex-document-loading-card:nth-child(2) i{width:58%}
      .tex-work-app .tex-document-loading-card:nth-child(2) span{width:72%}
      .tex-work-app .tex-document-loading-card:nth-child(3) i{width:49%}
      .tex-work-app .tex-document-loading-card:nth-child(3) span{width:88%}
      @keyframes qssedaTexDocumentPulse{from{opacity:.44}to{opacity:.88}}

      .tex-collaboration-invite select,
      .tex-collaboration-member select{
        appearance:none!important;
        -webkit-appearance:none!important;
        padding-right:40px!important;
        background-color:var(--fill)!important;
        background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M4.25 6.1 8 9.85l3.75-3.75' stroke='%2395959d' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")!important;
        background-repeat:no-repeat!important;
        background-position:right 14px center!important;
        background-size:16px 16px!important;
      }
      .tex-collaboration-member-actions select{
        background-position:right 13px center!important;
      }
    </style>`;

  return output;
}
