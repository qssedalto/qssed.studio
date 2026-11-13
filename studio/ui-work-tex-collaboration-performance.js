import { enhanceWorkTexCollaboration as enhanceBaseWorkTexCollaboration } from "./ui-work-tex-collaboration.js";

function replaceExact(source, needle, replacement) {
  const index = source.indexOf(needle);
  if (index < 0) return source;
  return source.slice(0, index) + replacement + source.slice(index + needle.length);
}

export function enhanceWorkTexCollaboration(markup, zh) {
  let output = enhanceBaseWorkTexCollaboration(markup, zh);

  output = replaceExact(
    output,
    `        let snapshot = null;\n        let draftParticipants = [];`,
    `        window.__qssedaCollaborationOwnsPrefetch = true;\n        let snapshot = null;\n        let snapshotDocumentId = '';\n        let snapshotLoadedAt = 0;\n        let snapshotPromise = null;\n        let snapshotPromiseDocumentId = '';\n        let draftParticipants = [];`
  );

  output = replaceExact(
    output,
    `        let selectedSearchPerson = null;`,
    `        let selectedSearchPerson = null;\n        const userSearchCache = new Map();\n        const userSearchInflight = new Map();\n        const userSearchCacheAge = 2 * 60 * 1000;\n        const userSearchFreshAge = 15 * 1000;`
  );

  output = replaceExact(
    output,
    `        async function loadSnapshot(showLoading = true) {\n          const id = activeDocumentId();\n          const sequence = ++requestSequence;\n          if (!id) {\n            snapshot = null;\n            draftParticipants = [];\n            renderParticipants();\n            return;\n          }\n          if (showLoading) {\n            setBusy(true);\n            showMessage(labels.loading);\n          }\n          try {\n            const data = await api('/api/tex/collaboration?document=' + encodeURIComponent(id));\n            if (sequence !== requestSequence || id !== activeDocumentId()) return;\n            snapshot = data;\n            syncDraftFromSnapshot();\n            showMessage('');\n            renderParticipants();\n          } catch (error) {\n            if (sequence !== requestSequence) return;\n            snapshot = null;\n            draftParticipants = [];\n            renderParticipants();\n            showMessage(friendlyError(error), true);\n          } finally {\n            if (sequence === requestSequence) setBusy(false);\n          }\n        }`,
    `        async function loadSnapshot(showLoading = true, force = false) {\n          const id = activeDocumentId();\n          if (!id) {\n            requestSequence += 1;\n            snapshotDocumentId = '';\n            snapshotLoadedAt = 0;\n            snapshotPromise = null;\n            snapshotPromiseDocumentId = '';\n            snapshot = null;\n            draftParticipants = [];\n            renderParticipants();\n            return null;\n          }\n\n          const hasCurrent = Boolean(snapshot && snapshotDocumentId === id);\n          if (hasCurrent && !force) {\n            if (!opened) syncDraftFromSnapshot();\n            showMessage('');\n            if (opened) renderParticipants();\n            else renderAvatars();\n            setBusy(false);\n            return snapshot;\n          }\n\n          if (!force && snapshotPromise && snapshotPromiseDocumentId === id) {\n            if (showLoading && !hasCurrent) {\n              setBusy(true);\n              showMessage(labels.loading);\n            }\n            try {\n              await snapshotPromise;\n              return snapshot;\n            } finally {\n              if (id === activeDocumentId()) setBusy(false);\n            }\n          }\n\n          const sequence = ++requestSequence;\n          if (showLoading && !hasCurrent) {\n            setBusy(true);\n            showMessage(labels.loading);\n          }\n\n          const request = api('/api/tex/collaboration?document=' + encodeURIComponent(id));\n          snapshotPromise = request;\n          snapshotPromiseDocumentId = id;\n\n          try {\n            const data = await request;\n            if (sequence !== requestSequence || id !== activeDocumentId()) return null;\n            const preserveDraft = opened && hasDraftChanges();\n            snapshotDocumentId = id;\n            snapshotLoadedAt = Date.now();\n            snapshot = data;\n            if (!preserveDraft) syncDraftFromSnapshot();\n            else updateSaveState();\n            showMessage('');\n            if (opened) renderParticipants();\n            else renderAvatars();\n            return data;\n          } catch (error) {\n            if (sequence !== requestSequence) return null;\n            if (!hasCurrent) {\n              snapshotDocumentId = id;\n              snapshotLoadedAt = 0;\n              snapshot = null;\n              draftParticipants = [];\n              renderAvatars();\n            }\n            if (opened || !hasCurrent) showMessage(friendlyError(error), true);\n            return hasCurrent ? snapshot : null;\n          } finally {\n            if (snapshotPromise === request) {\n              snapshotPromise = null;\n              snapshotPromiseDocumentId = '';\n            }\n            if (sequence === requestSequence) setBusy(false);\n          }\n        }`
  );

  output = output.replaceAll("await loadSnapshot(false);", "await loadSnapshot(false, true);");

  output = replaceExact(
    output,
    `        async function searchUsers(rawQuery) {\n          const id = activeDocumentId();\n          const query = String(rawQuery || '').trim().replace(/^@+/, '');\n          const sequence = ++searchSequence;\n          if (!id || query.length < 1) {\n            hideSearchResults();\n            return [];\n          }\n          showSearchState(labels.searching);\n          try {\n            const data = await api('/api/tex/collaboration?action=search&document=' + encodeURIComponent(id) + '&q=' + encodeURIComponent(query));\n            if (sequence !== searchSequence || query !== String(username.value || '').trim().replace(/^@+/, '')) return [];\n            const results = data?.results || [];\n            renderSearchResults(results);\n            return results;\n          } catch (error) {\n            if (sequence !== searchSequence) return [];\n            showSearchState(friendlyError(error));\n            return [];\n          }\n        }\n\n        function scheduleSearch() {\n          window.clearTimeout(searchTimer);\n          selectedSearchPerson = null;\n          const query = String(username.value || '').trim().replace(/^@+/, '');\n          if (query.length < 1) {\n            hideSearchResults();\n            return;\n          }\n          searchTimer = window.setTimeout(() => void searchUsers(query), 220);\n        }`,
    `        function normalizeSearchQuery(value) {\n          return String(value || '').trim().replace(/^@+/, '').toLowerCase();\n        }\n\n        function rememberSearchResults(query, results) {\n          const key = normalizeSearchQuery(query);\n          if (!key) return;\n          // Negative results are not proof of absence: new users and recent\n          // server fixes must be visible on the very next search.\n          if (!Array.isArray(results) || !results.length) { userSearchCache.delete(key); return; }\n          userSearchCache.set(key, { ts: Date.now(), results });\n          if (userSearchCache.size > 48) userSearchCache.delete(userSearchCache.keys().next().value);\n        }\n\n        function cachedSearchResults(query) {\n          const key = normalizeSearchQuery(query);\n          if (!key) return null;\n          const now = Date.now();\n          const exact = userSearchCache.get(key);\n          if (exact && now - exact.ts < userSearchCacheAge) return { results: exact.results, exact: true, age: now - exact.ts };\n\n          let best = null;\n          for (const [cachedKey, entry] of userSearchCache) {\n            if (!cachedKey || !key.startsWith(cachedKey) || now - entry.ts >= userSearchCacheAge) continue;\n            const results = entry.results.filter(person => {\n              const haystack = (String(person?.username || '') + ' ' + String(person?.display_name || '')).toLowerCase();\n              return haystack.includes(key);\n            });\n            // A limited prefix search cannot prove a longer query has no matches.\n            if (results.length && (!best || cachedKey.length > best.key.length)) best = { key: cachedKey, results, exact: false, age: now - entry.ts };\n          }\n          return best;\n        }\n\n        async function searchUsers(rawQuery) {\n          const id = activeDocumentId();\n          const query = normalizeSearchQuery(rawQuery);\n          const sequence = ++searchSequence;\n          if (!id || query.length < 1) {\n            hideSearchResults();\n            return [];\n          }\n\n          const cached = cachedSearchResults(query);\n          if (cached) {\n            renderSearchResults(cached.results);\n            if (cached.exact && cached.age < userSearchFreshAge) return cached.results;\n          } else {\n            showSearchState(labels.searching);\n          }\n\n          const requestKey = id + ':' + query;\n          let request = userSearchInflight.get(requestKey);\n          if (!request) {\n            request = api('/api/tex/collaboration?action=search&document=' + encodeURIComponent(id) + '&q=' + encodeURIComponent(query));\n            userSearchInflight.set(requestKey, request);\n            request.finally(() => {\n              if (userSearchInflight.get(requestKey) === request) userSearchInflight.delete(requestKey);\n            }).catch(() => {});\n          }\n\n          try {\n            const data = await request;\n            const results = Array.isArray(data?.results) ? data.results : [];\n            rememberSearchResults(query, results);\n            if (sequence !== searchSequence || query !== normalizeSearchQuery(username.value)) return results;\n            renderSearchResults(results);\n            return results;\n          } catch (error) {\n            if (sequence !== searchSequence) return [];\n            if (!cached) showSearchState(friendlyError(error));\n            return cached?.results || [];\n          }\n        }\n\n        function scheduleSearch() {\n          window.clearTimeout(searchTimer);\n          selectedSearchPerson = null;\n          const query = normalizeSearchQuery(username.value);\n          if (query.length < 1) {\n            hideSearchResults();\n            return;\n          }\n\n          const cached = cachedSearchResults(query);\n          if (cached) renderSearchResults(cached.results);\n          else showSearchState(labels.searching);\n\n          searchTimer = window.setTimeout(() => void searchUsers(query), 45);\n        }`
  );

  output = replaceExact(
    output,
    `        function openDrawer() {\n          if (!activeDocumentId()) return;\n          opened = true;\n          setPage(0);\n          drawer.hidden = false;\n          backdrop.hidden = false;\n          document.body.classList.add('tex-collaboration-open');\n          documentLabel.textContent = titleInput?.value?.trim() || activeDocumentId();\n          window.requestAnimationFrame(() => {\n            drawer.classList.add('is-open');\n            backdrop.classList.add('is-open');\n            window.setTimeout(() => username.focus(), 120);\n          });\n          void loadSnapshot(true);\n        }`,
    `        function openDrawer() {\n          const id = activeDocumentId();\n          if (!id) return;\n          opened = true;\n          setPage(0);\n          drawer.hidden = false;\n          backdrop.hidden = false;\n          document.body.classList.add('tex-collaboration-open');\n          documentLabel.textContent = titleInput?.value?.trim() || id;\n          window.requestAnimationFrame(() => {\n            drawer.classList.add('is-open');\n            backdrop.classList.add('is-open');\n            window.setTimeout(() => username.focus(), 120);\n          });\n          if (snapshot && snapshotDocumentId === id) {\n            syncDraftFromSnapshot();\n            showMessage('');\n            renderParticipants();\n            if (Date.now() - snapshotLoadedAt > 30000) void loadSnapshot(false, true);\n          } else {\n            void loadSnapshot(true);\n          }\n        }`
  );

  output = replaceExact(
    output,
    `        function syncDocument() {\n          const id = activeDocumentId();\n          openButton.disabled = !id;\n          openButton.title = id ? labels.open : labels.noDocument;\n          documentLabel.textContent = titleInput?.value?.trim() || id || labels.noDocument;\n          snapshot = null;\n          draftParticipants = [];\n          username.value = '';\n          selectedSearchPerson = null;\n          hideSearchResults();\n          renderAvatars();\n          updateSaveState();\n          if (opened) void loadSnapshot(true);\n        }`,
    `        function syncDocument() {\n          const id = activeDocumentId();\n          openButton.disabled = !id;\n          openButton.title = id ? labels.open : labels.noDocument;\n          documentLabel.textContent = titleInput?.value?.trim() || id || labels.noDocument;\n\n          if (id === snapshotDocumentId) {\n            if (!opened) renderAvatars();\n            updateSaveState();\n            return;\n          }\n\n          requestSequence += 1;\n          snapshotPromise = null;\n          snapshotPromiseDocumentId = '';\n          snapshotDocumentId = id;\n          snapshotLoadedAt = 0;\n          snapshot = null;\n          draftParticipants = [];\n          username.value = '';\n          selectedSearchPerson = null;\n          hideSearchResults();\n          renderAvatars();\n          updateSaveState();\n          if (id) void loadSnapshot(opened);\n        }`
  );

  output = replaceExact(
    output,
    `        const listObserver = documentList ? new MutationObserver(syncDocument) : null;`,
    `        window.addEventListener('qsseda:tex-collaboration-snapshot', event => {\n          const data = event.detail;\n          const id = activeDocumentId();\n          const dataId = String(data?.document_id || id || '').trim();\n          if (!id || dataId !== id || !Array.isArray(data?.participants)) return;\n          if (opened && hasDraftChanges()) return;\n          snapshotDocumentId = id;\n          snapshotLoadedAt = Date.now();\n          snapshot = data;\n          syncDraftFromSnapshot();\n          showMessage('');\n          if (opened) renderParticipants();\n          else renderAvatars();\n        });\n\n        const listObserver = documentList ? new MutationObserver(syncDocument) : null;`
  );

  output = output.replace(
    "              void prefetchCollaboration(root, documentList);",
    "              if (!window.__qssedaCollaborationOwnsPrefetch) void prefetchCollaboration(root, documentList);"
  );

  output = output.replace(
    "            previewFrame.src = nextUrl + '#view=FitH';",
    "            previewFrame.src = nextUrl + '#zoom=page-width';"
  );

  output = output.replace(
    "            previewUrl = nextUrl;\n            lastPreviewSnapshot = snapshot;",
    "            previewUrl = nextUrl;\n            window.__qssedaTexPreviewRestored = null;\n            lastPreviewSnapshot = snapshot;"
  );

  output = replaceExact(
    output,
    `          function schedulePreview(delay = 1500) {\n            window.clearTimeout(previewTimer);\n            if (!previewEnabled || !supportsCurrentEngine() || !hasDocument()) return;\n            previewDirty = true;\n            if (!localBusy) setPreviewStatus('idle', localCopy.previewWaiting);\n            previewTimer = window.setTimeout(() => {\n              if (!destroyed && previewEnabled && previewDirty) void compileLocal(true);\n            }, delay);\n          }`,
    `          function restoredPreviewMatches() {\n            const restored = window.__qssedaTexPreviewRestored;\n            return Boolean(\n              restored &&\n              restored.engine === String(engine.value || '').toLowerCase() &&\n              restored.source === (source.value || '')\n            );\n          }\n\n          function schedulePreview(delay = 1500) {\n            window.clearTimeout(previewTimer);\n            if (!previewEnabled || !supportsCurrentEngine() || !hasDocument()) return;\n            previewDirty = true;\n            if (!localBusy) setPreviewStatus('idle', localCopy.previewWaiting);\n            previewTimer = window.setTimeout(() => {\n              if (restoredPreviewMatches()) {\n                lastPreviewSnapshot = currentPreviewSnapshot();\n                previewDirty = false;\n                previewPending = false;\n                return;\n              }\n              if (!destroyed && previewEnabled && previewDirty) void compileLocal(true);\n            }, delay);\n          }`
  );

  output = output.replace(
    "          restoredPreviewKey = cached.key;\n          frame.src = url + '#zoom=page-width';",
    "          restoredPreviewKey = cached.key;\n          window.__qssedaTexPreviewRestored = { key: cached.key, engine: String(engine.value || '').toLowerCase(), source: source.value || '' };\n          frame.src = url + '#zoom=page-width';"
  );

  output = replaceExact(
    output,
    `        const normalizePdfZoom = () => {\n          const src = previewFrame.getAttribute('src') || '';\n          if (!src.startsWith('blob:') || src.includes('#zoom=page-width')) return;\n          const base = src.split('#')[0];\n          previewFrame.setAttribute('src', base + '#zoom=page-width');\n        };\n\n        const frameObserver = new MutationObserver(normalizePdfZoom);\n        frameObserver.observe(previewFrame, { attributes: true, attributeFilter: ['src'] });\n        normalizePdfZoom();\n        window.addEventListener('pagehide', () => frameObserver.disconnect(), { once: true });`,
    `        // Preview producers now set the desired PDF fit mode directly.\n        // Rewriting iframe.src here would force the browser PDF viewer to load twice.`
  );

  output += `
    <style id="qsseda-work-tex-collaboration-alignment-fix">
      .tex-collaboration-drawer .tex-collaboration-member{
        align-items:center!important;
      }
      .tex-collaboration-drawer .tex-collaboration-member-actions{
        display:grid!important;
        grid-template-columns:112px 72px!important;
        align-items:center!important;
        align-content:center!important;
        justify-content:end!important;
        gap:10px!important;
        min-width:194px!important;
        margin:0!important;
        align-self:center!important;
      }
      .tex-collaboration-drawer .tex-collaboration-member-actions select,
      .tex-collaboration-drawer .tex-collaboration-member-actions .tex-collaboration-remove{
        box-sizing:border-box!important;
        width:100%!important;
        min-width:0!important;
        height:42px!important;
        min-height:42px!important;
        max-height:42px!important;
        margin:0!important;
        align-self:center!important;
      }
      .tex-collaboration-drawer .tex-collaboration-member-actions select{
        display:block!important;
        padding:0 34px 0 13px!important;
        line-height:normal!important;
      }
      .tex-collaboration-drawer .tex-collaboration-member-actions .tex-collaboration-remove{
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        padding:0 10px!important;
        line-height:1!important;
      }
      .tex-collaboration-drawer .tex-collaboration-invite{
        align-items:center!important;
      }
      .tex-collaboration-drawer .tex-collaboration-user-search,
      .tex-collaboration-drawer .tex-collaboration-invite input,
      .tex-collaboration-drawer .tex-collaboration-invite select,
      .tex-collaboration-drawer #tex-collaboration-add{
        box-sizing:border-box!important;
        height:46px!important;
        min-height:46px!important;
        max-height:46px!important;
        margin-top:0!important;
        margin-bottom:0!important;
        align-self:center!important;
      }
      @media(max-width:760px), (max-width:950px) and (pointer:coarse){
        .tex-collaboration-drawer .tex-collaboration-member:not(.is-owner) .tex-collaboration-member-actions{
          grid-column:1/-1!important;
          grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
          width:100%!important;
          min-width:0!important;
          margin-top:2px!important;
        }
        .tex-collaboration-drawer .tex-collaboration-member-actions select,
        .tex-collaboration-drawer .tex-collaboration-member-actions .tex-collaboration-remove{
          height:44px!important;
          min-height:44px!important;
          max-height:44px!important;
        }
      }
    </style>`;

  return output;
}
