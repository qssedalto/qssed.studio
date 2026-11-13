export function enhanceWorkTexRealtime(markup, zh) {
  const copy = zh ? {
    live: "实时协作",
    connecting: "正在连接",
    connected: "实时同步",
    offline: "协作离线",
    readOnly: "只读协作",
    online: "在线",
    typing: "正在编辑",
    enabled: "CRDT 实时同步已启用",
    enabledDetail: "当前 TeX 源码会通过 Yjs CRDT 与加密的同源 WebSocket 房间实时合并；成员权限仍由 AERTEX 账号与文档成员列表控制。",
    cursorPending: "远程位置已同步，彩色光标绘制将在编辑器升级为 CodeMirror 后启用。",
    noConnection: "实时通道暂时不可用，自动保存仍然继续工作。"
  } : {
    live: "Live collaboration",
    connecting: "Connecting",
    connected: "Live sync",
    offline: "Collaboration offline",
    readOnly: "Read-only collaboration",
    online: "online",
    typing: "editing",
    enabled: "CRDT live sync enabled",
    enabledDetail: "TeX source now merges in real time through Yjs CRDT and a same-origin authenticated WebSocket room. Access remains controlled by AERTEX document membership.",
    cursorPending: "Remote positions are synchronized; visual cursor rendering will enable after the editor moves to CodeMirror.",
    noConnection: "The realtime channel is unavailable. Autosave continues to work."
  };

  return String(markup || "") + `
    <style id="qsseda-work-tex-realtime-style">
      .tex-work-app .tex-realtime-status{
        display:none;align-items:center;gap:6px;margin-left:auto;padding:4px 8px;border-radius:999px;
        background:var(--fill);color:var(--muted);font-size:9px;font-weight:700;white-space:nowrap;
      }
      .tex-work-app .tex-realtime-status.is-visible{display:flex}
      .tex-work-app .tex-realtime-status i{width:6px;height:6px;border-radius:50%;background:var(--quiet)}
      .tex-work-app .tex-realtime-status.is-live{color:var(--primary)}
      .tex-work-app .tex-realtime-status.is-live i{background:var(--primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 12%,transparent)}
      .tex-work-app .tex-realtime-status.is-readonly{color:var(--muted)}
      .tex-work-app .tex-collaboration-button.is-live{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 30%,var(--border))!important}
      .tex-work-app .tex-collaboration-button.is-live:after{content:"";width:6px;height:6px;border-radius:50%;background:var(--primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 10%,transparent)}
      .tex-work-app[data-tex-collaboration-access-role="viewer"] #tex-source{cursor:default}
      .tex-work-app[data-tex-collaboration-access-role="viewer"] #tex-delete{display:none!important}
      .tex-realtime-presence{display:flex;flex-wrap:wrap;gap:7px;margin-top:4px}
      .tex-realtime-person{display:flex;align-items:center;gap:7px;padding:6px 9px;border-radius:999px;background:var(--fill);color:var(--muted);font-size:10px}
      .tex-realtime-person.is-typing{color:var(--primary)}
      .tex-realtime-person-avatar{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;overflow:hidden;background:color-mix(in srgb,var(--primary) 10%,var(--surface));color:var(--primary);font-size:8px;font-weight:800}
      .tex-realtime-person-avatar img{width:100%;height:100%;object-fit:cover}
      @media(max-width:760px){.tex-work-app .tex-realtime-status{font-size:8px;padding:4px 7px}.tex-work-app .tex-source-label{flex-wrap:wrap}}
    </style>
    <script id="qsseda-work-tex-realtime-runtime">
      (() => {
        if (window.__qssedaTexRealtimeReady) return;
        window.__qssedaTexRealtimeReady = true;

        const labels = ${JSON.stringify(copy)};
        const upstreamFetch = window.fetch.bind(window);
        const sharedDocuments = new Map();
        let Y = null;
        let yjsPromise = null;
        let connection = null;
        let reconnectTimer = 0;
        let reconnectAttempt = 0;
        let documentGeneration = 0;
        let presenceTimer = 0;
        let compactCounter = 0;

        const REMOTE_ORIGIN = { qsseda: 'remote' };
        const LOCAL_ORIGIN = { qsseda: 'local' };

        function responseJson(data, status = 200) {
          return new Response(JSON.stringify(data), {
            status,
            headers: { 'Content-Type': 'application/json;charset=UTF-8', 'Cache-Control': 'no-store' }
          });
        }

        function requestInfo(input, init) {
          const request = input instanceof Request ? input : null;
          const raw = request ? request.url : String(input || '');
          let url = null;
          try { url = new URL(raw, location.href); } catch {}
          const method = String(init?.method || request?.method || 'GET').toUpperCase();
          return { request, url, method };
        }

        async function readJsonResponse(response) {
          return response.clone().json().catch(() => null);
        }

        function rememberSharedDocuments(items) {
          for (const item of Array.isArray(items) ? items : []) {
            const id = String(item?.id || '');
            if (!id) continue;
            sharedDocuments.set(id, {
              owner_id: String(item?.owner_id || ''),
              collaboration_role: item?.collaboration_role === 'editor' ? 'editor' : 'viewer'
            });
          }
        }

        window.fetch = async function qssedaRealtimeFetch(input, init) {
          const info = requestInfo(input, init);
          const url = info.url;
          if (!url || url.origin !== location.origin) return upstreamFetch(input, init);

          if (url.pathname === '/api/tex/documents' && info.method === 'GET' && !url.searchParams.get('id')) {
            const [ownResponse, sharedResponse] = await Promise.all([
              upstreamFetch(input, init),
              upstreamFetch('/api/tex/collaboration/shared', { credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' } }).catch(() => null)
            ]);
            if (!ownResponse.ok) return ownResponse;
            const ownData = await readJsonResponse(ownResponse) || {};
            const sharedData = sharedResponse?.ok ? await readJsonResponse(sharedResponse) : null;
            const shared = Array.isArray(sharedData?.documents) ? sharedData.documents : [];
            rememberSharedDocuments(shared);
            const documents = [...(Array.isArray(ownData.documents) ? ownData.documents : []), ...shared]
              .sort((a, b) => String(b?.updated_at || '').localeCompare(String(a?.updated_at || '')));
            return responseJson({ ...ownData, documents, count: documents.length, scope: shared.length ? 'own-and-shared' : (ownData.scope || 'own') });
          }

          if (url.pathname === '/api/tex/documents' && url.searchParams.get('id')) {
            const id = String(url.searchParams.get('id') || '');
            const shared = sharedDocuments.get(id);
            if (shared) {
              if (info.method === 'DELETE') return responseJson({ error: 'Shared documents cannot be deleted by collaborators.' }, 403);
              if (info.method === 'GET' || info.method === 'PUT') {
                const target = '/api/tex/collaboration/shared?document=' + encodeURIComponent(id);
                const forwarded = { ...(init || {}), credentials: 'same-origin', cache: 'no-store' };
                const response = await upstreamFetch(target, forwarded);
                if (response.ok) {
                  const data = await readJsonResponse(response);
                  if (data?.document) rememberSharedDocuments([data.document]);
                  if (data) return responseJson(data, response.status);
                }
                return response;
              }
            }
          }

          if (url.pathname === '/api/tex/collaboration' && info.method === 'GET' && !url.searchParams.get('action')) {
            const id = String(url.searchParams.get('document') || '');
            const shared = sharedDocuments.get(id);
            const response = shared
              ? await upstreamFetch('/api/tex/collaboration/shared?document=' + encodeURIComponent(id) + '&participants=1', { credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' } })
              : await upstreamFetch(input, init);
            if (!response.ok) return response;
            const data = await readJsonResponse(response);
            return data ? responseJson({ ...data, realtime_ready: true, sync_mode: 'yjs-websocket' }, response.status) : response;
          }

          return upstreamFetch(input, init);
        };

        function loadYjs() {
          if (Y) return Promise.resolve(Y);
          if (!yjsPromise) {
            yjsPromise = import('/assets/tex/yjs.js').then(module => {
              Y = module;
              return module;
            }).catch(error => {
              yjsPromise = null;
              throw error;
            });
          }
          return yjsPromise;
        }

        function bytesToBase64(bytes) {
          let binary = '';
          const chunk = 0x8000;
          for (let index = 0; index < bytes.length; index += chunk) {
            binary += String.fromCharCode(...bytes.subarray(index, Math.min(index + chunk, bytes.length)));
          }
          return btoa(binary);
        }

        function base64ToBytes(value) {
          const binary = atob(String(value || ''));
          const bytes = new Uint8Array(binary.length);
          for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
          return bytes;
        }

        function activeElements() {
          return {
            root: document.querySelector('.tex-work-app[data-tex-root]'),
            list: document.getElementById('tex-document-list'),
            source: document.getElementById('tex-source'),
            title: document.getElementById('tex-title'),
            engine: document.getElementById('tex-engine'),
            deleteButton: document.getElementById('tex-delete'),
            collaborationButton: document.getElementById('tex-collaboration-open')
          };
        }

        function activeDocumentId(root, list) {
          const stored = String(root?.dataset?.texCollaborationDocumentId || '').trim();
          if (stored) return stored;
          return String(list?.querySelector('.tex-document-item.is-active')?.dataset?.texDocumentId || '').trim();
        }

        function ensureStatusNode() {
          let node = document.getElementById('tex-realtime-status');
          if (node) return node;
          const sourceLabel = document.querySelector('.tex-work-app .tex-source-label');
          if (!sourceLabel) return null;
          node = document.createElement('span');
          node.id = 'tex-realtime-status';
          node.className = 'tex-realtime-status';
          node.innerHTML = '<i></i><span></span>';
          sourceLabel.insertBefore(node, sourceLabel.lastElementChild || null);
          return node;
        }

        function setStatus(kind, text, count = 0) {
          const node = ensureStatusNode();
          if (node) {
            node.classList.toggle('is-visible', Boolean(text));
            node.classList.toggle('is-live', kind === 'live');
            node.classList.toggle('is-readonly', kind === 'readonly');
            const label = node.querySelector('span');
            if (label) label.textContent = text + (count > 0 ? ' · ' + count + ' ' + labels.online : '');
          }
          const button = document.getElementById('tex-collaboration-open');
          button?.classList.toggle('is-live', kind === 'live' || kind === 'readonly');
          const detail = {
            document_id: connection?.id || '',
            role: connection?.role || '',
            kind,
            connected: kind === 'live' || kind === 'readonly',
            participants: connection?.presence?.length || 0
          };
          window.__qssedaTexRealtimeSnapshot = detail;
          window.dispatchEvent(new CustomEvent('qsseda:tex-realtime-status', { detail }));
        }

        function applyAccessRole(role) {
          const { root, source, title, engine, deleteButton } = activeElements();
          const normalized = role === 'viewer' ? 'viewer' : role === 'editor' ? 'editor' : 'owner';
          if (root) root.dataset.texCollaborationAccessRole = normalized;
          const readOnly = normalized === 'viewer';
          if (source) source.readOnly = readOnly;
          if (title) title.readOnly = readOnly;
          if (engine) engine.disabled = readOnly;
          if (deleteButton) deleteButton.disabled = normalized !== 'owner';
          const form = document.getElementById('tex-collaboration-invite');
          if (form) {
            for (const control of form.querySelectorAll('input,select,button')) control.disabled = normalized !== 'owner';
          }
        }

        function updateLiveSettingsSurface(kind) {
          const page = document.querySelector('.tex-collaboration-page[data-page="live"]');
          if (!page) return;
          const state = page.querySelector('.tex-collaboration-state');
          const strong = state?.querySelector('strong');
          const detail = state?.querySelector('span');
          if (strong) strong.textContent = kind === 'offline' ? labels.noConnection : labels.enabled;
          if (detail) detail.textContent = kind === 'offline' ? labels.noConnection : labels.enabledDetail;
          const rows = page.querySelectorAll('.tex-collaboration-disabled-row');
          if (rows[0]) {
            const text = rows[0].querySelector('div span');
            if (text) text.textContent = labels.cursorPending;
          }
        }

        function initials(person) {
          const text = String(person?.display_name || person?.username || '?').trim();
          return (text.slice(0, 2) || '?').toUpperCase();
        }

        function relativeIndex(current, encoded, fallback) {
          if (!current?.ready || !encoded || !Y?.decodeRelativePosition) return fallback;
          try {
            const position = Y.decodeRelativePosition(base64ToBytes(encoded));
            const resolved = Y.createAbsolutePositionFromRelativePosition(position, current.ydoc);
            return resolved?.type === current.ytext ? resolved.index : fallback;
          } catch { return fallback; }
        }

        function publishPresence(items) {
          const id = connection?.id || '';
          const snapshot = {
            document_id: id, role: connection?.role || 'owner',
            participants: items, at: Date.now()
          };
          window.__qssedaTexPresenceSnapshot = snapshot;
          window.dispatchEvent(new CustomEvent('qsseda:tex-presence', { detail: snapshot }));
        }

        function renderPresence(participants) {
          const current = connection;
          // A user may have multiple Safari tabs/WebSocket connections.
          // Presence counts people, not sockets. Keep the local tab as the
          // preferred representative so self/follow state remains consistent.
          const people = new Map();
          const sockets = [];
          for (const person of Array.isArray(participants) ? participants : []) {
            const identity = String(person?.id || person?.client_id || '').trim();
            if (!identity) continue;
            const a = relativeIndex(current, person?.anchor_rel, Number(person?.selection_start) || 0);
            const h = relativeIndex(current, person?.head_rel, Number(person?.caret_position ?? person?.selection_end) || 0);
            const entry = {
              ...person,
              self: Boolean(current?.clientId && person?.client_id === current.clientId),
              selection_start: Math.min(a, h),
              selection_end: Math.max(a, h),
              caret_position: h
            };
            sockets.push(entry);
            const earlier = people.get(identity);
            if (!earlier || (!earlier.self && entry.self)) people.set(identity, entry);
          }
          // Preserve existing desktop socket-level display: only compact touch
          // screens collapse duplicate tabs into one online person.
          const compactTouch = window.matchMedia('(max-width:1280px) and (pointer:coarse), (max-width:760px)').matches;
          const items = compactTouch ? [...people.values()] : sockets;
          const count = items.length;
          if (current) current.presence = items;
          publishPresence(items);
          const role = current?.role || 'owner';
          setStatus(role === 'viewer' ? 'readonly' : 'live', role === 'viewer' ? labels.readOnly : labels.connected, count);

          const page = document.querySelector('.tex-collaboration-page[data-page="live"] .tex-collaboration-section');
          if (!page) return;
          let host = page.querySelector('.tex-realtime-presence');
          if (!host) {
            host = document.createElement('div');
            host.className = 'tex-realtime-presence';
            page.append(host);
          }
          host.replaceChildren();
          for (const person of items) {
            const chip = document.createElement(person?.self ? 'span' : 'button');
            chip.className = 'tex-realtime-person' +
              (person?.typing ? ' is-typing' : '') + (person?.self ? ' is-self' : '');
            if (!person?.self) {
              chip.type = 'button';
              chip.dataset.clientId = String(person?.client_id || '');
              chip.title = String(person?.display_name || person?.username || labels.live);
              chip.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('qsseda:tex-follow-toggle', {
                  detail: { client_id: String(person?.client_id || '') }
                }));
              });
            }
            const avatar = document.createElement('span');
            avatar.className = 'tex-realtime-person-avatar';
            if (person?.avatar_url) {
              const image = document.createElement('img');
              image.src = person.avatar_url;
              image.alt = '';
              image.referrerPolicy = 'no-referrer';
              avatar.append(image);
            } else avatar.textContent = initials(person);
            const name = document.createElement('span');
            name.textContent = person?.display_name || person?.username || labels.live;
            chip.append(avatar, name);
            if (person?.typing && person?.self) chip.title = labels.typing;
            host.append(chip);
          }
        }

        function syncText(ytext, nextValue, origin) {
          const current = ytext.toString();
          const next = String(nextValue ?? '');
          if (current === next) return;
          let start = 0;
          const common = Math.min(current.length, next.length);
          while (start < common && current.charCodeAt(start) === next.charCodeAt(start)) start += 1;
          let currentEnd = current.length;
          let nextEnd = next.length;
          while (currentEnd > start && nextEnd > start && current.charCodeAt(currentEnd - 1) === next.charCodeAt(nextEnd - 1)) {
            currentEnd -= 1;
            nextEnd -= 1;
          }
          ytext.doc.transact(() => {
            if (currentEnd > start) ytext.delete(start, currentEnd - start);
            if (nextEnd > start) ytext.insert(start, next.slice(start, nextEnd));
          }, origin);
        }

        function syncMeta(ymeta, key, value, origin) {
          const next = String(value ?? '');
          if (String(ymeta.get(key) ?? '') === next) return;
          ymeta.doc.transact(() => ymeta.set(key, next), origin);
        }

        function dispatchSyntheticInput(element, type = 'input') {
          element.dispatchEvent(new Event(type, { bubbles: true }));
        }

        function renderYState(current) {
          if (!current?.ready || !current?.ytext || !current?.ymeta) return;
          const { source, title, engine } = activeElements();
          current.applyingRemote = true;
          try {
            if (source && source.value !== current.ytext.toString()) {
              const start = source.selectionStart;
              const end = source.selectionEnd;
              source.value = current.ytext.toString();
              const limit = source.value.length;
              source.setSelectionRange(Math.min(start, limit), Math.min(end, limit));
              dispatchSyntheticInput(source);
            }
            const remoteTitle = String(current.ymeta.get('title') ?? '');
            if (title && remoteTitle && title.value !== remoteTitle) {
              title.value = remoteTitle;
              dispatchSyntheticInput(title);
            }
            const remoteEngine = String(current.ymeta.get('engine') ?? '');
            if (engine && remoteEngine && engine.value !== remoteEngine) {
              engine.value = remoteEngine;
              dispatchSyntheticInput(engine, 'change');
            }
          } finally {
            current.applyingRemote = false;
          }
        }

        function applyPendingLocal(current) {
          if (!current?.pendingLocalEdit || current.role === 'viewer') return;
          current.pendingLocalEdit = false;
          const { source, title, engine } = activeElements();
          if (source) syncText(current.ytext, source.value, LOCAL_ORIGIN);
          if (title) syncMeta(current.ymeta, 'title', title.value, LOCAL_ORIGIN);
          if (engine) syncMeta(current.ymeta, 'engine', engine.value, LOCAL_ORIGIN);
        }

        function sendPresence(immediate = false) {
          if (!connection?.socket || connection.socket.readyState !== WebSocket.OPEN) return;
          const send = () => {
            presenceTimer = 0;
            const current = connection;
            if (!current?.socket || current.socket.readyState !== WebSocket.OPEN) return;
            const source = document.getElementById('tex-source');
            const bridge = window.__qssedaTexEditorBridge;
            const editorSelection = bridge?.getSelection?.();
            const maximum = Math.max(current.ytext?.length || 0, source?.value?.length || 0, bridge?.getValue?.()?.length || 0);
            const rangeStart = Math.max(0, Math.min(maximum, Number(source?.selectionStart) || 0));
            const rangeEnd = Math.max(0, Math.min(maximum, Number(source?.selectionEnd) || 0));
            const anchor = Math.max(0, Math.min(maximum, Number(editorSelection?.anchor ?? (source?.selectionDirection === 'backward' ? rangeEnd : rangeStart)) || 0));
            const head = Math.max(0, Math.min(maximum, Number(editorSelection?.head ?? (source?.selectionDirection === 'backward' ? rangeStart : rangeEnd)) || 0));
            const relative = offset => {
              if (!current.ready || !Y?.createRelativePositionFromTypeIndex) return '';
              try { return bytesToBase64(Y.encodeRelativePosition(Y.createRelativePositionFromTypeIndex(current.ytext, offset))); }
              catch { return ''; }
            };
            const themeAccent = getComputedStyle(document.documentElement).getPropertyValue('--aertex-accent').trim();
            const cursorColor = /^#[0-9a-f]{6}$/i.test(themeAccent) ? themeAccent : '';
            current.socket.send(JSON.stringify({
              type: 'presence',
              cursor_color: cursorColor,
              selection_start: Math.min(anchor, head),
              selection_end: Math.max(anchor, head),
              caret_position: head,
              anchor_rel: relative(anchor),
              head_rel: relative(head),
              typing: Date.now() - (current.lastInputAt || 0) < 1300
            }));
          };
          window.clearTimeout(presenceTimer);
          if (immediate) send();
          else presenceTimer = window.setTimeout(send, 90);
        }

        function maybeCompact(current) {
          if (!current?.ready || !current.socket || current.socket.readyState !== WebSocket.OPEN || current.role === 'viewer') return;
          compactCounter += 1;
          if (compactCounter < 60 || !current.serverSequence) return;
          compactCounter = 0;
          try {
            current.socket.send(JSON.stringify({
              type: 'snapshot',
              data: bytesToBase64(Y.encodeStateAsUpdate(current.ydoc)),
              through_sequence: current.serverSequence
            }));
          } catch {}
        }

        function closeConnection() {
          documentGeneration += 1;
          window.clearTimeout(reconnectTimer);
          reconnectTimer = 0;
          reconnectAttempt = 0;
          if (connection?.socket) {
            try { connection.intentionalClose = true; connection.socket.close(1000, 'Document changed'); } catch {}
          }
          try { connection?.ydoc?.destroy(); } catch {}
          connection = null;
          publishPresence([]);
          setStatus('', '');
        }

        async function connectDocument(id) {
          const generation = ++documentGeneration;
          window.clearTimeout(reconnectTimer);
          const elements = activeElements();
          if (!id || !elements.source || !elements.title || !elements.engine) {
            closeConnection();
            return;
          }

          setStatus('connecting', labels.connecting);
          updateLiveSettingsSurface('connecting');
          let module;
          try { module = await loadYjs(); }
          catch {
            if (generation === documentGeneration) {
              setStatus('offline', labels.offline);
              updateLiveSettingsSurface('offline');
            }
            return;
          }
          if (generation !== documentGeneration) return;

          if (connection?.socket) {
            try { connection.intentionalClose = true; connection.socket.close(1000, 'Document changed'); } catch {}
          }
          try { connection?.ydoc?.destroy(); } catch {}

          const ydoc = new module.Doc();
          const ytext = ydoc.getText('source');
          const ymeta = ydoc.getMap('meta');
          const current = {
            id,
            generation,
            ydoc,
            ytext,
            ymeta,
            socket: null,
            ready: false,
            applyingRemote: false,
            pendingLocalEdit: false,
            role: sharedDocuments.get(id)?.collaboration_role || 'owner',
            serverSequence: 0,
            clientId: '',
            presence: [],
            lastInputAt: 0,
            intentionalClose: false
          };
          connection = current;
          applyAccessRole(current.role);

          ydoc.on('update', (update, origin) => {
            if (origin !== LOCAL_ORIGIN || !current.ready || current.role === 'viewer') return;
            if (!current.socket || current.socket.readyState !== WebSocket.OPEN) return;
            current.socket.send(JSON.stringify({ type: 'update', data: bytesToBase64(update) }));
          });
          ytext.observe(() => {
            if (!current.ready || current.applyingRemote) return;
            renderYState(current);
            if (current.presence.length) renderPresence(current.presence);
          });
          ymeta.observe(() => {
            if (current.ready && !current.applyingRemote) renderYState(current);
          });

          const websocketUrl = new URL('/api/tex/collaboration/realtime', location.href);
          websocketUrl.protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
          websocketUrl.searchParams.set('document', id);
          const socket = new WebSocket(websocketUrl.toString());
          current.socket = socket;

          socket.addEventListener('open', () => {
            if (connection !== current) return;
            reconnectAttempt = 0;
            setStatus('connecting', labels.connecting);
          });

          socket.addEventListener('message', event => {
            if (connection !== current || typeof event.data !== 'string') return;
            let payload;
            try { payload = JSON.parse(event.data); } catch { return; }
            if (payload.type === 'sync') {
              current.clientId = String(payload.client_id || '');
              current.role = ['owner', 'editor', 'viewer'].includes(payload.role) ? payload.role : current.role;
              applyAccessRole(current.role);
              current.serverSequence = Math.max(current.serverSequence, Number(payload.sequence) || 0);
              if (payload.initialized) {
                try {
                  if (payload.snapshot) module.applyUpdate(ydoc, base64ToBytes(payload.snapshot), REMOTE_ORIGIN);
                  for (const update of Array.isArray(payload.updates) ? payload.updates : []) {
                    if (update?.data) module.applyUpdate(ydoc, base64ToBytes(update.data), REMOTE_ORIGIN);
                    current.serverSequence = Math.max(current.serverSequence, Number(update?.seq) || 0);
                  }
                  current.ready = true;
                  renderYState(current);
                  applyPendingLocal(current);
                  sendPresence(true);
                  updateLiveSettingsSurface('live');
                } catch {
                  setStatus('offline', labels.offline);
                }
              } else if (current.role !== 'viewer') {
                const seed = new module.Doc();
                const seedText = seed.getText('source');
                const seedMeta = seed.getMap('meta');
                seedText.insert(0, elements.source.value || '');
                seedMeta.set('title', elements.title.value || '');
                seedMeta.set('engine', elements.engine.value || 'xelatex');
                socket.send(JSON.stringify({ type: 'initialize', data: bytesToBase64(module.encodeStateAsUpdate(seed)) }));
                seed.destroy();
              }
              return;
            }
            if (payload.type === 'initialized' && payload.data) {
              try {
                module.applyUpdate(ydoc, base64ToBytes(payload.data), REMOTE_ORIGIN);
                current.serverSequence = Math.max(current.serverSequence, Number(payload.sequence) || 0);
                current.ready = true;
                renderYState(current);
                applyPendingLocal(current);
                sendPresence(true);
                updateLiveSettingsSurface('live');
              } catch {}
              return;
            }
            if (payload.type === 'update' && payload.data) {
              try {
                module.applyUpdate(ydoc, base64ToBytes(payload.data), REMOTE_ORIGIN);
                current.serverSequence = Math.max(current.serverSequence, Number(payload.sequence) || 0);
                current.ready = true;
                renderYState(current);
                maybeCompact(current);
              } catch {}
              return;
            }
            if (payload.type === 'presence-list') {
              renderPresence(payload.participants);
              return;
            }
            if (payload.type === 'error' && payload.code === 'read_only') {
              current.role = 'viewer';
              applyAccessRole('viewer');
              renderPresence(current.presence);
            }
          });

          socket.addEventListener('close', event => {
            if (connection !== current) return;
            current.ready = false;
            publishPresence([]);
            setStatus('offline', labels.offline);
            updateLiveSettingsSurface('offline');
            if (current.intentionalClose) return;
            const delay = event.code === 4001 ? 180 : Math.min(5000, 450 * Math.pow(1.7, reconnectAttempt++));
            reconnectTimer = window.setTimeout(() => {
              if (connection === current) void connectDocument(id);
            }, delay);
          });

          socket.addEventListener('error', () => {
            if (connection === current) setStatus('offline', labels.offline);
          });
        }

        function scheduleDocumentConnection() {
          const { root, list } = activeElements();
          const id = activeDocumentId(root, list);
          if (!id) {
            closeConnection();
            return;
          }
          if (connection?.id === id && connection.socket && [WebSocket.OPEN, WebSocket.CONNECTING].includes(connection.socket.readyState)) return;
          window.setTimeout(() => {
            const current = activeElements();
            const resolved = activeDocumentId(current.root, current.list);
            if (resolved === id) void connectDocument(id);
          }, 20);
        }

        function installInputBindings() {
          const { source, title, engine } = activeElements();
          source?.addEventListener('input', () => {
            const current = connection;
            if (!current || current.applyingRemote) return;
            current.lastInputAt = Date.now();
            if (!current.ready) {
              current.pendingLocalEdit = true;
              sendPresence();
              return;
            }
            if (current.role === 'viewer') return;
            syncText(current.ytext, source.value, LOCAL_ORIGIN);
            sendPresence();
          });
          title?.addEventListener('input', () => {
            const current = connection;
            if (!current || current.applyingRemote) return;
            if (!current.ready) { current.pendingLocalEdit = true; return; }
            if (current.role !== 'viewer') syncMeta(current.ymeta, 'title', title.value, LOCAL_ORIGIN);
          });
          engine?.addEventListener('change', () => {
            const current = connection;
            if (!current || current.applyingRemote) return;
            if (!current.ready) { current.pendingLocalEdit = true; return; }
            if (current.role !== 'viewer') syncMeta(current.ymeta, 'engine', engine.value, LOCAL_ORIGIN);
          });
          window.addEventListener('qsseda:tex-editor-selection', event => {
            if (!connection?.ready || event?.detail?.document_id !== connection.id) return;
            // CodeMirror is the visible editor. The hidden textarea's 'select'
            // event is not a reliable signal after a mouse click on a CM line.
            sendPresence();
          });
          window.addEventListener('aertex-themechange', () => sendPresence(true));
          source?.addEventListener('select', () => sendPresence());
          source?.addEventListener('click', () => sendPresence());
          source?.addEventListener('keyup', () => sendPresence());
        }

        function init() {
          const { root, list } = activeElements();
          if (!root || !list) {
            window.setTimeout(init, 40);
            return;
          }
          installInputBindings();
          ensureStatusNode();
          const observer = new MutationObserver(scheduleDocumentConnection);
          observer.observe(root, { attributes: true, attributeFilter: ['data-tex-collaboration-document-id'] });
          observer.observe(list, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'data-tex-document-id'] });
          document.addEventListener('visibilitychange', () => {
            if (!document.hidden) scheduleDocumentConnection();
          });
          window.addEventListener('pagehide', () => {
            observer.disconnect();
            closeConnection();
          }, { once: true });
          updateLiveSettingsSurface('connecting');
          scheduleDocumentConnection();
        }

        window.setTimeout(init, 0);
      })();
    </script>`;
}
