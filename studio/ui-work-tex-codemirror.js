function replaceExact(source, needle, replacement) {
  const index = source.indexOf(needle);
  if (index < 0) return source;
  return source.slice(0, index) + replacement + source.slice(index + needle.length);
}

export function enhanceWorkTexCodeMirror(markup, zh) {
  const copy = zh ? {
    loading: "正在加载高级编辑器…",
    failed: "高级编辑器加载失败，已继续使用基础编辑器。",
    remoteCursor: "协作者光标",
    remoteSelection: "协作者选区",
    cursorReady: "远程光标与选区已启用；每位协作者使用稳定的独立颜色。"
  } : {
    loading: "Loading the advanced editor…",
    failed: "The advanced editor could not load. The basic editor remains available.",
    remoteCursor: "Collaborator cursor",
    remoteSelection: "Collaborator selection",
    cursorReady: "Remote cursors and selections are enabled with a stable color for each collaborator."
  };

  let output = String(markup || "");

  output = replaceExact(
    output,
    `          if (connection) connection.presence = items;\n          const role = connection?.role || 'owner';\n          setStatus(role === 'viewer' ? 'readonly' : 'live', role === 'viewer' ? labels.readOnly : labels.connected, count);`,
    `          if (connection) connection.presence = items;\n          const role = connection?.role || 'owner';\n          const localSource = document.getElementById('tex-source');\n          const localStart = Number(localSource?.selectionStart) || 0;\n          const localEnd = Number(localSource?.selectionEnd) || 0;\n          const exactLocal = items.filter(person => person?.role === role && Number(person?.selection_start) === localStart && Number(person?.selection_end) === localEnd);\n          if (!window.__qssedaTexSelfParticipantId && exactLocal.length === 1) window.__qssedaTexSelfParticipantId = String(exactLocal[0]?.id || '');\n          const root = document.querySelector('.tex-work-app[data-tex-root]');\n          const documentId = String(root?.dataset?.texCollaborationDocumentId || document.querySelector('.tex-document-item.is-active')?.dataset?.texDocumentId || '');\n          const presenceSnapshot = {\n            document_id: documentId,\n            role,\n            participants: items.map(person => ({ ...person, self: Boolean(window.__qssedaTexSelfParticipantId && String(person?.id || '') === window.__qssedaTexSelfParticipantId) })),\n            at: Date.now()\n          };\n          window.__qssedaTexPresenceSnapshot = presenceSnapshot;\n          window.dispatchEvent(new CustomEvent('qsseda:tex-presence', { detail: presenceSnapshot }));\n          setStatus(role === 'viewer' ? 'readonly' : 'live', role === 'viewer' ? labels.readOnly : labels.connected, count);`
  );

  output = replaceExact(
    output,
    `        undoButton.addEventListener('click', () => { source.focus(); document.execCommand('undo'); });\n        redoButton.addEventListener('click', () => { source.focus(); document.execCommand('redo'); });`,
    `        undoButton.addEventListener('click', () => {\n          const bridge = window.__qssedaTexEditorBridge;\n          if (bridge?.undo) bridge.undo();\n          else { source.focus(); document.execCommand('undo'); }\n        });\n        redoButton.addEventListener('click', () => {\n          const bridge = window.__qssedaTexEditorBridge;\n          if (bridge?.redo) bridge.redo();\n          else { source.focus(); document.execCommand('redo'); }\n        });`
  );

  output = output
    .replaceAll("远程位置已同步，彩色光标绘制将在编辑器升级为 CodeMirror 后启用。", copy.cursorReady)
    .replaceAll("Remote positions are synchronized; visual cursor rendering will enable after the editor moves to CodeMirror.", copy.cursorReady);

  output += `
    <style id="qsseda-work-tex-codemirror-style">
      .tex-work-app .tex-codemirror-host{
        position:relative!important;
        min-width:0!important;
        min-height:470px!important;
        height:100%!important;
        overflow:hidden!important;
        background:transparent!important;
      }
      .tex-work-app #tex-source.tex-source-bridge{
        position:absolute!important;
        left:-10000px!important;
        top:0!important;
        width:1px!important;
        min-width:1px!important;
        height:1px!important;
        min-height:1px!important;
        padding:0!important;
        margin:0!important;
        opacity:0!important;
        pointer-events:none!important;
        overflow:hidden!important;
        resize:none!important;
      }
      .tex-work-app .tex-codemirror-host>.cm-editor{
        width:100%!important;
        height:100%!important;
        min-height:470px!important;
        background:transparent!important;
        color:var(--text)!important;
        outline:none!important;
      }
      .tex-work-app .tex-codemirror-host .cm-scroller{
        height:100%!important;
        overflow:auto!important;
        overscroll-behavior:contain!important;
        font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace!important;
        font-size:13px!important;
        line-height:1.62!important;
        scrollbar-gutter:stable;
      }
      .tex-work-app .tex-codemirror-host .cm-content{
        min-height:100%!important;
        padding:11px 0 24px!important;
        caret-color:var(--primary)!important;
      }
      .tex-work-app .tex-codemirror-host .cm-content:focus,
      .tex-work-app .tex-codemirror-host .cm-content:focus-visible{
        outline:none!important;
        box-shadow:none!important;
      }
      .tex-work-app .tex-codemirror-host>.cm-editor.cm-focused{
        outline:none!important;
        box-shadow:none!important;
      }
      .tex-work-app .tex-codemirror-host .cm-line{padding:0 16px!important}
      .tex-work-app .tex-codemirror-host .cm-gutters{
        border-right:1px solid var(--hairline)!important;
        background:color-mix(in srgb,var(--fill) 60%,transparent)!important;
        color:var(--quiet)!important;
      }
      .tex-work-app .tex-codemirror-host .cm-lineNumbers .cm-gutterElement{padding:0 9px 0 8px!important;font-size:9px!important}
      .tex-work-app .tex-codemirror-host .cm-activeLine,
      .tex-work-app .tex-codemirror-host .cm-activeLineGutter{background:color-mix(in srgb,var(--primary) 4%,transparent)!important}
      .tex-work-app .tex-codemirror-host .cm-selectionBackground,
      .tex-work-app .tex-codemirror-host .cm-content ::selection{background:color-mix(in srgb,var(--primary) 20%,transparent)!important}
      .tex-work-app .tex-codemirror-host .cm-cursor{border-left-color:var(--primary)!important;border-left-width:1.5px!important}
      .tex-work-app .tex-codemirror-host .cm-panels{background:var(--surface)!important;color:var(--text)!important}
      .tex-work-app .tex-codemirror-host .cm-panels input{background:var(--fill)!important;color:var(--text)!important;border:1px solid var(--border)!important;border-radius:7px!important}
      .tex-work-app .tex-codemirror-host .cm-tooltip{border:1px solid var(--border)!important;border-radius:10px!important;background:var(--surface)!important;color:var(--text)!important;box-shadow:0 10px 30px rgba(0,0,0,.12)!important;overflow:hidden!important}
      .tex-work-app .tex-codemirror-host.is-readonly .cm-content{cursor:default!important}
      .tex-work-app .tex-codemirror-host.is-readonly .cm-cursor{display:none!important}

      .tex-cm-remote-layer{
        position:absolute!important;
        inset:0!important;
        z-index:8!important;
        overflow:hidden!important;
        pointer-events:none!important;
      }
      .tex-cm-remote-selection{
        position:absolute!important;
        border-radius:2px!important;
        pointer-events:none!important;
      }
      .tex-cm-remote-caret{
        position:absolute!important;
        width:2px!important;
        min-width:2px!important;
        border-radius:999px!important;
        pointer-events:none!important;
        transform:translateX(-1px);
      }
      .tex-cm-remote-caret.is-typing{animation:qssedaRemoteCaretPulse .72s ease-in-out infinite alternate}
      .tex-cm-remote-label{
        position:absolute!important;
        left:0!important;
        bottom:calc(100% + 3px)!important;
        max-width:150px!important;
        padding:3px 6px!important;
        border-radius:6px!important;
        color:#fff!important;
        font:700 8px/1.25 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;
        white-space:nowrap!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        box-shadow:0 2px 7px rgba(0,0,0,.16)!important;
      }
      @keyframes qssedaRemoteCaretPulse{from{opacity:.55}to{opacity:1}}
      @media(max-width:760px), (max-width:950px) and (pointer:coarse){
        .tex-work-app .tex-codemirror-host{min-height:0!important;height:100%!important}
        .tex-work-app .tex-codemirror-host>.cm-editor{min-height:0!important;height:100%!important}
        .tex-work-app .tex-codemirror-host .cm-scroller{font-size:16px!important;line-height:1.58!important;-webkit-overflow-scrolling:touch}
        .tex-work-app .tex-codemirror-host .cm-content{padding:12px 0 24px!important}
        .tex-work-app .tex-codemirror-host .cm-line{padding:0 14px!important}
        .tex-work-app .tex-codemirror-host .cm-gutters{display:none!important}
        .tex-cm-remote-label{font-size:9px!important;padding:4px 6px!important}
      }
    </style>
    <script id="qsseda-work-tex-codemirror-runtime">
      (() => {
        if (window.__qssedaTexCodeMirrorReady) return;
        window.__qssedaTexCodeMirrorReady = true;

        const labels = ${JSON.stringify(copy)};
        const root = document.querySelector('.tex-work-app[data-tex-root]');
        const source = document.getElementById('tex-source');
        const editor = document.getElementById('tex-editor');
        if (!root || !source || !editor) return;

        let view = null;
        let host = null;
        let remoteLayer = null;
        let remoteParticipants = [];
        let remoteFrame = 0;
        let resizeObserver = null;
        let sourceSyncQueued = false;
        let syncingToSource = false;
        let syncingFromSource = false;
        let applyingHistory = false;
        let activeHistoryDocument = '';
        let undoStack = [];
        let redoStack = [];
        let historyGroupStartedAt = 0;
        let inferredSelfId = String(window.__qssedaTexSelfParticipantId || '');

        const valueDescriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
        const nativeFocus = source.focus.bind(source);
        const nativeValue = () => String(valueDescriptor?.get ? valueDescriptor.get.call(source) : source.textContent || '');

        function activeDocumentId() {
          return String(root.dataset.texCollaborationDocumentId || document.querySelector('.tex-document-item.is-active')?.dataset?.texDocumentId || '').trim();
        }

        function accessRole() {
          const role = String(root.dataset.texCollaborationAccessRole || 'owner');
          return role === 'viewer' ? 'viewer' : role === 'editor' ? 'editor' : 'owner';
        }

        function clamp(value, maximum) {
          const number = Number(value);
          if (!Number.isFinite(number)) return 0;
          return Math.max(0, Math.min(maximum, Math.floor(number)));
        }

        function resetHistoryIfDocumentChanged(nextValue = null) {
          const id = activeDocumentId();
          if (id === activeHistoryDocument) return;
          activeHistoryDocument = id;
          undoStack = [];
          redoStack = [];
          historyGroupStartedAt = 0;
          remoteParticipants = [];
          if (nextValue !== null) scheduleRemoteRender();
        }

        function recordUndo(startState) {
          if (applyingHistory || syncingFromSource) return;
          const now = Date.now();
          if (!historyGroupStartedAt || now - historyGroupStartedAt > 1200) {
            const selection = startState.selection.main;
            undoStack.push({ doc: startState.doc.toString(), anchor: selection.anchor, head: selection.head });
            if (undoStack.length > 120) undoStack.shift();
            historyGroupStartedAt = now;
          }
          redoStack = [];
        }

        function setBridgeSelection(anchor, head, notify = true) {
          const maximum = nativeValue().length;
          const a = clamp(anchor, maximum);
          const h = clamp(head, maximum);
          const start = Math.min(a, h);
          const end = Math.max(a, h);
          try { source.setSelectionRange(start, end, a <= h ? 'forward' : 'backward'); } catch {}
          if (notify) source.dispatchEvent(new Event('select', { bubbles: true }));
        }

        function publishViewToBridge(update) {
          if (!view || syncingFromSource) return;
          resetHistoryIfDocumentChanged();
          if (update.docChanged) recordUndo(update.startState);
          const selection = update.state.selection.main;
          syncingToSource = true;
          try {
            if (update.docChanged) {
              source.value = update.state.doc.toString();
              setBridgeSelection(selection.anchor, selection.head, false);
              source.dispatchEvent(new Event('input', { bubbles: true }));
            } else if (update.selectionSet) {
              setBridgeSelection(selection.anchor, selection.head, true);
            }
          } finally {
            syncingToSource = false;
          }
          if (update.docChanged || update.selectionSet || update.viewportChanged || update.geometryChanged) scheduleRemoteRender();
          applyReadOnly();
        }

        function syncViewFromSource() {
          if (!view || syncingToSource) return;
          const next = nativeValue();
          resetHistoryIfDocumentChanged(next);
          const current = view.state.doc.toString();
          const maximum = next.length;
          const anchor = clamp(source.selectionStart, maximum);
          const head = clamp(source.selectionEnd, maximum);
          const currentSelection = view.state.selection.main;
          if (current === next && currentSelection.anchor === anchor && currentSelection.head === head) return;
          syncingFromSource = true;
          try {
            const transaction = {};
            if (current !== next) transaction.changes = { from: 0, to: current.length, insert: next };
            transaction.selection = { anchor, head };
            view.dispatch(transaction);
          } finally {
            syncingFromSource = false;
          }
          scheduleRemoteRender();
        }

        function queueSourceSync() {
          if (!view || syncingToSource || sourceSyncQueued) return;
          sourceSyncQueued = true;
          queueMicrotask(() => {
            sourceSyncQueued = false;
            syncViewFromSource();
          });
        }

        function applyReadOnly() {
          if (!view || !host) return;
          const readOnly = source.readOnly || accessRole() === 'viewer';
          host.classList.toggle('is-readonly', readOnly);
          if (view.contentDOM.contentEditable !== String(!readOnly)) view.contentDOM.contentEditable = String(!readOnly);
          view.contentDOM.setAttribute('aria-readonly', String(readOnly));
        }

        function colorFor(person) {
          const key = String(person?.id || person?.username || person?.display_name || 'collaborator');
          let hash = 2166136261;
          for (let index = 0; index < key.length; index += 1) {
            hash ^= key.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
          }
          return Math.abs(hash) % 360;
        }

        function inferSelf(participants) {
          // Self identity comes from the server-assigned WebSocket client id,
          // never inferred from matching cursor positions or membership roles.
          const self = (Array.isArray(participants) ? participants : [])
            .find(person => person?.self === true);
          inferredSelfId = self ? String(self?.client_id || '') : '';
          return inferredSelfId;
        }

        function participantName(person) {
          return String(person?.display_name || person?.username || labels.remoteCursor).trim().slice(0, 80) || labels.remoteCursor;
        }

        function appendSelectionRect(from, to, hue, hostRect) {
          if (!view || !remoteLayer || from >= to) return;
          const doc = view.state.doc;
          let line = doc.lineAt(from);
          let rendered = 0;
          while (line && rendered < 120) {
            const segmentFrom = Math.max(from, line.from);
            const segmentTo = Math.min(to, line.to);
            const a = view.coordsAtPos(segmentFrom, 1);
            const b = view.coordsAtPos(segmentTo, -1);
            if (a && b) {
              const left = Math.min(a.left, b.left) - hostRect.left;
              const right = Math.max(a.left, b.left) - hostRect.left;
              const top = a.top - hostRect.top;
              const height = Math.max(2, a.bottom - a.top);
              const rect = document.createElement('span');
              rect.className = 'tex-cm-remote-selection';
              rect.setAttribute('aria-label', labels.remoteSelection);
              rect.style.left = left + 'px';
              rect.style.top = top + 'px';
              rect.style.width = Math.max(3, right - left) + 'px';
              rect.style.height = height + 'px';
              rect.style.background = 'hsla(' + hue + ',72%,52%,.16)';
              remoteLayer.append(rect);
            }
            rendered += 1;
            if (line.to >= to || line.number >= doc.lines) break;
            line = doc.line(line.number + 1);
          }
        }

        function renderRemotePresence() {
          remoteFrame = 0;
          if (!view || !host || !remoteLayer) return;
          remoteLayer.replaceChildren();
          if (editor.hidden || !activeDocumentId()) return;
          const hostRect = host.getBoundingClientRect();
          const docLength = view.state.doc.length;
          const selfId = inferSelf(remoteParticipants);
          let labelOffset = 0;
          for (const person of remoteParticipants) {
            if (!person || person.self || (selfId && String(person.client_id || '') === selfId)) continue;
            const start = clamp(person.selection_start, docLength);
            const end = clamp(person.selection_end, docLength);
            const from = Math.min(start, end);
            const to = Math.max(start, end);
            const hue = colorFor(person);
            if (from !== to) appendSelectionRect(from, to, hue, hostRect);

            const caretPosition = clamp(person.caret_position ?? end, docLength);
            const coords = view.coordsAtPos(caretPosition, caretPosition === docLength ? -1 : 1);
            if (!coords) continue;
            const top = coords.top - hostRect.top;
            const left = coords.left - hostRect.left;
            const height = Math.max(14, coords.bottom - coords.top);
            const caret = document.createElement('span');
            caret.className = 'tex-cm-remote-caret' + (person.typing ? ' is-typing' : '');
            caret.setAttribute('aria-label', labels.remoteCursor + ': ' + participantName(person));
            caret.style.left = left + 'px';
            caret.style.top = top + 'px';
            caret.style.height = height + 'px';
            caret.style.background = 'hsl(' + hue + ' 72% 48%)';

            const label = document.createElement('span');
            label.className = 'tex-cm-remote-label';
            label.textContent = participantName(person);
            label.style.background = 'hsl(' + hue + ' 72% 42%)';
            if (top < 24) {
              label.style.bottom = 'auto';
              label.style.top = 'calc(100% + 3px)';
            }
            if (labelOffset) label.style.transform = 'translateY(' + ((labelOffset % 3) * 2) + 'px)';
            labelOffset += 1;
            caret.append(label);
            remoteLayer.append(caret);
          }
        }

        function scheduleRemoteRender() {
          if (remoteFrame) return;
          remoteFrame = window.requestAnimationFrame(renderRemotePresence);
        }

        function onPresence(event) {
          const detail = event?.detail || window.__qssedaTexPresenceSnapshot || {};
          const currentId = activeDocumentId();
          if (detail?.document_id && currentId && String(detail.document_id) !== currentId) return;
          remoteParticipants = Array.isArray(detail?.participants) ? detail.participants : [];
          scheduleRemoteRender();
        }

        function applyHistorySnapshot(snapshot, targetStack) {
          if (!view || !snapshot || accessRole() === 'viewer' || source.readOnly) return false;
          const currentSelection = view.state.selection.main;
          targetStack.push({ doc: view.state.doc.toString(), anchor: currentSelection.anchor, head: currentSelection.head });
          if (targetStack.length > 120) targetStack.shift();
          applyingHistory = true;
          try {
            view.dispatch({
              changes: { from: 0, to: view.state.doc.length, insert: snapshot.doc },
              selection: {
                anchor: clamp(snapshot.anchor, snapshot.doc.length),
                head: clamp(snapshot.head, snapshot.doc.length)
              },
              scrollIntoView: true
            });
          } finally {
            applyingHistory = false;
          }
          historyGroupStartedAt = 0;
          return true;
        }

        function undo() {
          const snapshot = undoStack.pop();
          if (!snapshot) return false;
          return applyHistorySnapshot(snapshot, redoStack);
        }

        function redo() {
          const snapshot = redoStack.pop();
          if (!snapshot) return false;
          return applyHistorySnapshot(snapshot, undoStack);
        }

        // Remote ESM dependencies can be delayed or blocked on mobile networks.
        // A bounded fallback prevents an endless "loading" state and retains
        // the normal textarea editor when both CDNs are unavailable.
        let mounting = false;
        function announceEditor(kind, reason = '') {
          const detail = { kind, reason, at: Date.now() };
          window.__qssedaTexEditorStatus = detail;
          window.dispatchEvent(new CustomEvent('qsseda:tex-editor-state', { detail }));
        }
        async function timedModule(url, milliseconds) {
          let timer;
          try {
            return await Promise.race([
              import(url),
              new Promise((_, reject) => {
                timer = window.setTimeout(() => reject(new Error('Editor module request timed out')), milliseconds);
              })
            ]);
          } finally {
            if (timer) window.clearTimeout(timer);
          }
        }
        async function resilientModule(primary, alternate, timeout = 4500) {
          try { return await timedModule(primary, timeout); }
          catch (first) {
            console.warn('AERTEX editor primary CDN unavailable', first);
            return timedModule(alternate, timeout);
          }
        }

        async function mount() {
          if (mounting || view) return;
          mounting = true;
          announceEditor('loading');
          let cm;
          let syntax = null;
          try {
            // Language highlighting is optional; a grammar CDN failure must
            // never prevent basic CodeMirror typing or cursor display.
            const grammar = Promise.all([
              resilientModule(
                'https://cdn.jsdelivr.net/npm/@codemirror/language@6.12.4/+esm',
                'https://esm.sh/@codemirror/language@6.12.4?bundle',
                3300
              ),
              resilientModule(
                'https://cdn.jsdelivr.net/npm/@codemirror/legacy-modes@6.5.3/mode/stex/+esm',
                'https://esm.sh/@codemirror/legacy-modes@6.5.3/mode/stex?bundle',
                3300
              )
            ]).then(modules => modules).catch(() => null);
            cm = await resilientModule(
              'https://cdn.jsdelivr.net/npm/codemirror@6.0.2/+esm',
              'https://esm.sh/codemirror@6.0.2?bundle',
              5500
            );
            syntax = await grammar;
          } catch (error) {
            mounting = false;
            console.warn(labels.failed, error);
            announceEditor('failed', 'module-unavailable');
            return;
          }

          const { EditorView, basicSetup } = cm || {};
          if (!EditorView || !basicSetup) {
            mounting = false;
            console.warn(labels.failed, 'Invalid CodeMirror module exports');
            announceEditor('failed', 'module-invalid');
            return;
          }

          host = document.createElement('div');
          host.id = 'tex-codemirror-host';
          host.className = 'tex-codemirror-host';
          source.before(host);

          const theme = EditorView.theme({
            '&': { height: '100%', backgroundColor: 'transparent' },
            '.cm-scroller': { fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace' },
            '.cm-content': { caretColor: 'var(--primary)' },
            '.cm-gutters': { backgroundColor: 'transparent' },
            '&.cm-focused': { outline: 'none' }
          });

          const baseExtensions = [
            basicSetup,
            theme,
            EditorView.lineWrapping,
            EditorView.updateListener.of(publishViewToBridge)
          ];
          try {
            const [language, latex] = syntax || [];
            let extensions = baseExtensions;
            if (language?.StreamLanguage && latex?.stex) {
              try {
                extensions = [basicSetup, language.StreamLanguage.define(latex.stex),
                  theme, EditorView.lineWrapping, EditorView.updateListener.of(publishViewToBridge)];
                view = new EditorView({ parent: host, doc: nativeValue(), extensions });
              } catch (syntaxError) {
                // Some CDN bundles load a second @codemirror/state version.
                // Fall back to the editor rather than failing the entire page.
                console.warn('AERTEX TeX syntax plugin unavailable; continuing without syntax highlighting', syntaxError);
                try { view?.destroy(); } catch {}
                view = null;
                host.replaceChildren();
              }
            }
            if (!view) view = new EditorView({
              parent: host, doc: nativeValue(), extensions: baseExtensions
            });
          } catch (error) {
            mounting = false;
            host.remove();
            host = null;
            console.warn(labels.failed, error);
            announceEditor('failed', 'editor-init-failed');
            return;
          }

          remoteLayer = document.createElement('div');
          remoteLayer.className = 'tex-cm-remote-layer';
          remoteLayer.setAttribute('aria-hidden', 'true');
          host.append(remoteLayer);

          source.classList.add('tex-source-bridge');
          source.setAttribute('aria-hidden', 'true');
          source.tabIndex = -1;

          if (valueDescriptor?.get && valueDescriptor?.set) {
            try {
              Object.defineProperty(source, 'value', {
                configurable: true,
                enumerable: true,
                get() { return valueDescriptor.get.call(source); },
                set(value) {
                  valueDescriptor.set.call(source, String(value ?? ''));
                  if (!syncingToSource) queueSourceSync();
                }
              });
            } catch {}
          }

          try {
            source.focus = () => { if (view) view.focus(); else nativeFocus(); };
          } catch {}

          source.addEventListener('input', () => {
            if (!syncingToSource) syncViewFromSource();
          });

          const roleObserver = new MutationObserver(() => {
            applyReadOnly();
            resetHistoryIfDocumentChanged(nativeValue());
            scheduleRemoteRender();
          });
          roleObserver.observe(root, { attributes: true, attributeFilter: ['data-tex-collaboration-access-role', 'data-tex-collaboration-document-id'] });
          roleObserver.observe(source, { attributes: true, attributeFilter: ['readonly'] });

          host.addEventListener('beforeinput', event => {
            if (source.readOnly || accessRole() === 'viewer') event.preventDefault();
          }, true);
          host.addEventListener('paste', event => {
            if (source.readOnly || accessRole() === 'viewer') event.preventDefault();
          }, true);
          host.addEventListener('drop', event => {
            if (source.readOnly || accessRole() === 'viewer') event.preventDefault();
          }, true);
          host.addEventListener('keydown', event => {
            if (!(source.readOnly || accessRole() === 'viewer')) return;
            const key = String(event.key || '');
            const editingKey = key.length === 1 || ['Backspace', 'Delete', 'Enter', 'Tab'].includes(key) || ((event.ctrlKey || event.metaKey) && ['v', 'x', 'z', 'y'].includes(key.toLowerCase()));
            if (editingKey) event.preventDefault();
          }, true);

          view.scrollDOM.addEventListener('scroll', scheduleRemoteRender, { passive: true });
          window.addEventListener('resize', scheduleRemoteRender, { passive: true });
          window.addEventListener('qsseda:tex-presence', onPresence);
          resizeObserver = new ResizeObserver(scheduleRemoteRender);
          resizeObserver.observe(host);

          window.__qssedaTexEditorBridge = {
            kind: 'codemirror6',
            focus: () => view?.focus(),
            undo,
            redo,
            getValue: () => view?.state.doc.toString() || nativeValue(),
            getSelection: () => {
              const selection = view?.state.selection.main;
              return selection ? { anchor: selection.anchor, head: selection.head } : { anchor: source.selectionStart || 0, head: source.selectionEnd || 0 };
            },
            syncFromSource: syncViewFromSource,
            scrollToRemote(position) {
              if (!view || !activeDocumentId()) return false;
              const at = clamp(position, view.state.doc.length);
              try {
                view.dispatch({ effects: EditorView.scrollIntoView(at, { y: 'center', x: 'nearest' }) });
                scheduleRemoteRender();
                return true;
              } catch { return false; }
            },
            replaceSelection(text) {
              if (!view || source.readOnly || accessRole() === 'viewer') return false;
              const selection = view.state.selection.main;
              const insert = String(text ?? '');
              view.dispatch({ changes: { from: selection.from, to: selection.to, insert }, selection: { anchor: selection.from + insert.length }, scrollIntoView: true });
              view.focus();
              return true;
            }
          };

          resetHistoryIfDocumentChanged(nativeValue());
          applyReadOnly();
          syncViewFromSource();
          if (window.__qssedaTexPresenceSnapshot) onPresence({ detail: window.__qssedaTexPresenceSnapshot });
          scheduleRemoteRender();
          mounting = false;
          announceEditor('ready');
          window.dispatchEvent(new CustomEvent('qsseda:tex-editor-ready', {
            detail: { kind: 'codemirror6' }
          }));

          window.addEventListener('pagehide', () => {
            if (remoteFrame) cancelAnimationFrame(remoteFrame);
            resizeObserver?.disconnect();
            roleObserver.disconnect();
            try { view?.destroy(); } catch {}
            view = null;
          }, { once: true });
        }

        window.addEventListener('qsseda:tex-editor-retry', () => {
          if (!view && !mounting) void mount();
        });
        void mount();
      })();
    </script>`;

  return output;
}
