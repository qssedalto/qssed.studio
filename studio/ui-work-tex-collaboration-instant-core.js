/**
 * 【初学者导读】
 * 文件：studio/ui-work-tex-collaboration-instant-core.js
 * 这是 AERTEX Work/TeX 前端模块（work-tex-collaboration-instant-core）。这组文件把编辑器、预览、协作、移动端适配或性能优化拆成多个小模块，避免一个超大文件承担全部职责。
 * 阅读顺序：先找本文件 export 的安装/初始化函数，再看它接收的 editor/state/session 参数；之后沿事件监听、缓存和 DOM 更新理解副作用。
 * 初学者重点：编辑器状态、服务器版本、协作会话和预览缓存是不同层次的数据；修改其中一层时不要假设其他层会自动同步。
 * 修改注意：协作/实时模块尤其要考虑乱序消息、重复消息、断线重连和旧版本客户端；性能优化模块不能以牺牲正确性为代价。
 * 调试方法：先区分“编辑器内容错”“预览错”“协作同步错”“移动布局错”，再进入对应模块，不要在整个 Work 链路里盲查。
 */
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

  // Manual compilation is intentionally local-session only. The cloud compiler
  // remains available to other TeX surfaces, but this Work button never falls
  // through to /api/tex/compile.
  output = output.replaceAll('"compile":"编译 PDF"', '"compile":"立即编译"');
  output = output.replaceAll('"compile":"Compile PDF"', '"compile":"Compile now"');
  output = output.replaceAll('"localOpen":"打开本机 PDF"', '"localOpen":"下载 PDF"');
  output = output.replaceAll('"localOpen":"Open local PDF"', '"localOpen":"Download PDF"');
  output = output.replace(
    'id="tex-compile" class="tex-primary" type="button" disabled>编译 PDF</button>',
    'id="tex-compile" class="tex-primary" type="button" disabled>立即编译</button>'
  );
  output = output.replace(
    'id="tex-compile" class="tex-primary" type="button" disabled>Compile PDF</button>',
    'id="tex-compile" class="tex-primary" type="button" disabled>Compile now</button>'
  );
  output = output.replace(
    `            if (localSupported) setCompilerSurface('local');\n            else if (cloudAvailable) setCompilerSurface('cloud');\n            else if (localBase) setCompilerSurface('unsupported');`,
    `            if (localSupported) setCompilerSurface('local');\n            else if (localBase) setCompilerSurface('unsupported');`
  );
  output = output.replace(
    `            const available = localSupported || cloudAvailable;`,
    `            const available = localSupported;`
  );
  output = output.replace(
    `          await Promise.all([probeCloud(), probeLocal()]);`,
    `          await probeLocal();`
  );
  output = output.replace(
    `          root.addEventListener('click', event => {\n            if (event.target?.closest?.('#tex-compile') !== compile) return;\n            if (!supportsCurrentEngine()) return;\n            event.preventDefault();\n            event.stopImmediatePropagation();\n            void compileLocal(false);\n          }, true);`,
    `          root.addEventListener('click', event => {\n            if (event.target?.closest?.('#tex-compile') !== compile) return;\n            event.preventDefault();\n            event.stopImmediatePropagation();\n            if (!supportsCurrentEngine()) {\n              showMessage(localBase ? localCopy.localUnsupported : localCopy.offline, true);\n              return;\n            }\n            void compileLocal(false);\n          }, true);`
  );
  output = output.replace(
    `              link.href = url;\n              link.target = '_blank';\n              link.rel = 'noopener';\n              link.textContent = localCopy.localOpen + ' ↗';\n              item.append(link);`,
    `              link.href = url;\n              link.className = 'tex-local-download';\n              const fileBase = String(title?.value || 'qsseda-tex').replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'qsseda-tex';\n              link.download = fileBase + '.pdf';\n              link.textContent = localCopy.localOpen;\n              item.append(link);`
  );
  output = output.replace(
    `        window.setTimeout(() => void start(), 420);`,
    `        window.setTimeout(() => void start(), 0);`
  );

  // Disable the old persistent PDF CacheStorage path. PDFs now live only in the
  // loopback compiler's disposable work directory and in this page's Blob URLs.
  output = output.replace(
    `          const isLocalCompile = parsedUrl && parts.method === 'POST' && (parsedUrl.hostname === '127.0.0.1' || parsedUrl.hostname === 'localhost') && parsedUrl.port === '32145' && parsedUrl.pathname === '/tex/compile';`,
    `          const isLocalCompile = false;`
  );
  output = output.replaceAll(`              void restorePreview(root);`, ``);

  output += `
    <style id="qsseda-work-tex-session-compile-and-role-controls">
      .tex-work-app .tex-document-list-loading .tex-document-loading-card{
        display:grid;gap:8px;min-height:76px;padding:11px 10px;border-radius:11px;background:transparent;
      }
      .tex-work-app .tex-document-loading-card i,
      .tex-work-app .tex-document-loading-card span,
      .tex-work-app .tex-document-loading-card small{
        display:block;border-radius:999px;background:color-mix(in srgb,var(--muted) 14%,transparent);
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

      .tex-work-app .tex-local-download{
        display:inline-flex!important;align-items:center!important;justify-content:center!important;
        width:max-content!important;min-height:32px!important;margin-top:8px!important;padding:0 12px!important;
        border-radius:10px!important;background:color-mix(in srgb,var(--primary) 10%,var(--surface))!important;
        color:var(--primary)!important;text-decoration:none!important;font-size:10px!important;font-weight:750!important;
        box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 20%,var(--border))!important;
      }
      .tex-work-app .tex-local-download:hover{background:color-mix(in srgb,var(--primary) 15%,var(--surface))!important}

      .tex-collaboration-invite select.tex-role-native,
      .tex-collaboration-member select.tex-role-native{
        position:absolute!important;width:1px!important;height:1px!important;min-width:1px!important;min-height:1px!important;
        margin:0!important;padding:0!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important;
        clip:rect(0 0 0 0)!important;clip-path:inset(50%)!important;background:none!important;box-shadow:none!important;
      }
      .tex-role-segment{
        display:grid!important;grid-template-columns:1fr 1fr!important;align-items:stretch!important;
        width:148px!important;min-width:148px!important;height:46px!important;padding:3px!important;gap:3px!important;
        border-radius:12px!important;background:var(--fill)!important;box-shadow:inset 0 0 0 1px var(--border)!important;
      }
      .tex-role-segment button{
        appearance:none!important;display:flex!important;align-items:center!important;justify-content:center!important;
        min-width:0!important;height:40px!important;margin:0!important;padding:0 8px!important;border:0!important;border-radius:9px!important;
        background:transparent!important;color:var(--muted)!important;box-shadow:none!important;font-size:11px!important;font-weight:750!important;
        white-space:nowrap!important;cursor:pointer!important;transition:background .14s ease,color .14s ease,box-shadow .14s ease!important;
      }
      .tex-role-segment button.is-active{
        background:var(--surface)!important;color:var(--text)!important;
        box-shadow:0 1px 4px rgba(0,0,0,.08),inset 0 0 0 1px color-mix(in srgb,var(--primary) 20%,var(--border))!important;
      }
      .tex-role-segment button:focus-visible{
        outline:none!important;box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 12%,transparent),inset 0 0 0 1px var(--primary)!important;
      }
      .tex-role-segment button:disabled{opacity:.42!important;cursor:not-allowed!important}
      .tex-collaboration-invite>.tex-role-segment{flex:0 0 148px!important}
      .tex-collaboration-member-actions{grid-template-columns:148px 72px!important;min-width:230px!important}
      .tex-collaboration-member-actions>.tex-role-segment{width:148px!important;min-width:148px!important;height:42px!important;padding:3px!important}
      .tex-collaboration-member-actions>.tex-role-segment button{height:36px!important;font-size:10.5px!important}
      @media(max-width:760px), (max-width:950px) and (pointer:coarse){
        .tex-collaboration-invite{display:grid!important;grid-template-columns:minmax(0,1fr) 132px 76px!important}
        .tex-collaboration-invite>.tex-role-segment{width:132px!important;min-width:132px!important}
        .tex-collaboration-member-actions{grid-template-columns:minmax(0,1fr) 76px!important;min-width:0!important;width:100%!important}
        .tex-collaboration-member-actions>.tex-role-segment{width:100%!important;min-width:0!important}
      }
    </style>
    <script id="qsseda-work-tex-ephemeral-compile-policy">
      (() => {
        const purgePersistentPreview = () => {
          if (!('caches' in window)) return;
          void caches.delete('qsseda-tex-preview-v1').catch(() => {});
        };
        purgePersistentPreview();
        window.addEventListener('pagehide', purgePersistentPreview, { once: true });
      })();
    </script>
    <script id="qsseda-work-tex-role-segments">
      (() => {
        const labels = ${JSON.stringify(zh ? { editor: "可编辑", viewer: "只读" } : { editor: "Editor", viewer: "Viewer" })};
        let drawerObserver = null;

        const enhanceSelect = select => {
          if (!select || select.dataset.qssedaRoleSegment === '1') return;
          if (select.id !== 'tex-collaboration-role' && !select.closest('.tex-collaboration-member-actions')) return;
          select.dataset.qssedaRoleSegment = '1';
          select.classList.add('tex-role-native');

          const group = document.createElement('div');
          group.className = 'tex-role-segment';
          group.setAttribute('role', 'radiogroup');
          group.setAttribute('aria-label', select.getAttribute('aria-label') || 'Access');

          const buttons = ['editor', 'viewer'].map(value => {
            const button = document.createElement('button');
            button.type = 'button';
            button.dataset.roleValue = value;
            button.setAttribute('role', 'radio');
            button.textContent = value === 'editor' ? labels.editor : labels.viewer;
            button.addEventListener('click', () => {
              if (button.disabled || select.disabled) return;
              select.value = value;
              select.dispatchEvent(new Event('change', { bubbles: true }));
            });
            group.append(button);
            return button;
          });

          const sync = () => {
            const current = select.value === 'viewer' ? 'viewer' : 'editor';
            for (const button of buttons) {
              const active = button.dataset.roleValue === current;
              button.classList.toggle('is-active', active);
              button.setAttribute('aria-checked', String(active));
              button.disabled = select.disabled;
            }
          };

          select.addEventListener('change', sync);
          select.addEventListener('focus', () => {
            const target = buttons.find(button => button.dataset.roleValue === select.value) || buttons[0];
            target?.focus();
          });
          new MutationObserver(sync).observe(select, { attributes: true, attributeFilter: ['disabled'] });
          select.after(group);
          sync();
        };

        const scan = () => {
          const drawer = document.querySelector('.tex-collaboration-drawer');
          if (!drawer) return false;
          enhanceSelect(drawer.querySelector('#tex-collaboration-role'));
          drawer.querySelectorAll('.tex-collaboration-member-actions select').forEach(enhanceSelect);
          if (!drawerObserver) {
            drawerObserver = new MutationObserver(scan);
            drawerObserver.observe(drawer, { childList: true, subtree: true });
            window.addEventListener('pagehide', () => drawerObserver?.disconnect(), { once: true });
          }
          return true;
        };

        if (!scan()) {
          const bootObserver = new MutationObserver(() => {
            if (!scan()) return;
            bootObserver.disconnect();
          });
          bootObserver.observe(document.body, { childList: true, subtree: true });
          window.addEventListener('pagehide', () => bootObserver.disconnect(), { once: true });
        }
      })();
    </script>`;

  return output;
}
