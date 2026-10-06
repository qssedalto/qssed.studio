/**
 * 【初学者导读】
 * 文件：studio/ui-work-tex-collaboration-instant.js
 * 这是 AERTEX Work/TeX 前端模块（work-tex-collaboration-instant）。这组文件把编辑器、预览、协作、移动端适配或性能优化拆成多个小模块，避免一个超大文件承担全部职责。
 * 阅读顺序：先找本文件 export 的安装/初始化函数，再看它接收的 editor/state/session 参数；之后沿事件监听、缓存和 DOM 更新理解副作用。
 * 初学者重点：编辑器状态、服务器版本、协作会话和预览缓存是不同层次的数据；修改其中一层时不要假设其他层会自动同步。
 * 修改注意：协作/实时模块尤其要考虑乱序消息、重复消息、断线重连和旧版本客户端；性能优化模块不能以牺牲正确性为代价。
 * 调试方法：先区分“编辑器内容错”“预览错”“协作同步错”“移动布局错”，再进入对应模块，不要在整个 Work 链路里盲查。
 */
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

function refineCollaborationMobileUx(markup, zh) {
  let output = String(markup || "");

  // The first span in the realtime state is the 9px status dot. Writing the
  // detail copy into it squeezed a full paragraph into a dot on mobile.
  output = output.replace(
    `          const detail = state?.querySelector('span');`,
    `          const detail = state?.querySelector('div > span');`
  );

  // Keep a resolved owner/invitee state so locked-control taps never report a
  // false owner warning while the access request is still pending.
  output = output.replace(
    `            const canManage = access.can_manage === true;\n            drawer.classList.toggle('is-invited-view', !canManage);`,
    `            const canManage = access.can_manage === true;\n            drawer.dataset.accessMode = canManage ? 'owner' : 'invited';\n            drawer.classList.toggle('is-invited-view', !canManage);`
  );
  output = output.replace(
    `          access = null;\n          accessDocumentId = documentId;\n          drawer.classList.add('is-invited-view');\n          lockInvite(true);`,
    `          access = null;\n          accessDocumentId = documentId;\n          drawer.dataset.accessMode = 'pending';\n          drawer.classList.add('is-invited-view');\n          lockInvite(true);`
  );

  const lockedCopy = zh
    ? "只有文档所有者可以管理成员与权限"
    : "Only the document owner can manage members and permissions";

  output += `
    <style id="qsseda-work-tex-mobile-collaboration-refine">
      .tex-collaboration-state-dot{
        overflow:hidden!important;
        font-size:0!important;
        line-height:0!important;
        white-space:nowrap!important;
      }
      .tex-collaboration-state>div,
      .tex-collaboration-disabled-row>div{
        min-width:0!important;
      }
      .tex-collaboration-state>div>span,
      .tex-collaboration-disabled-row>div>span{
        overflow-wrap:anywhere!important;
        word-break:normal!important;
      }

      .tex-collaboration-drawer.is-invited-view #tex-collaboration-invite input,
      .tex-collaboration-drawer.is-invited-view #tex-collaboration-invite select,
      .tex-collaboration-drawer.is-invited-view #tex-collaboration-invite button,
      .tex-collaboration-drawer.is-invited-view #tex-collaboration-invite .tex-role-segment button,
      .tex-collaboration-drawer.is-invited-view .tex-collaboration-member-actions>.tex-role-segment button{
        pointer-events:none!important;
      }
      .tex-collaboration-drawer.is-invited-view #tex-collaboration-invite,
      .tex-collaboration-drawer.is-invited-view .tex-collaboration-member-actions>.tex-role-segment{
        cursor:not-allowed!important;
      }
      .tex-collaboration-lock-toast{
        position:absolute;
        left:50%;
        bottom:78px;
        z-index:40;
        max-width:calc(100% - 32px);
        padding:10px 14px;
        border-radius:12px;
        background:color-mix(in srgb,var(--text) 88%,transparent);
        color:var(--surface);
        box-shadow:0 10px 30px rgba(0,0,0,.22);
        font-size:12px;
        font-weight:700;
        line-height:1.4;
        text-align:center;
        opacity:0;
        pointer-events:none;
        transform:translate(-50%,8px);
        transition:opacity .16s ease,transform .16s ease;
      }
      .tex-collaboration-lock-toast.is-visible{
        opacity:1;
        transform:translate(-50%,0);
      }
      @media(max-width:760px), (max-width:950px) and (pointer:coarse){
        .tex-collaboration-page[data-page="live"] .tex-collaboration-section{
          min-width:0!important;
          overflow:hidden!important;
        }
        .tex-collaboration-page[data-page="live"] .tex-collaboration-state,
        .tex-collaboration-page[data-page="live"] .tex-collaboration-disabled-row{
          width:100%!important;
          min-width:0!important;
          box-sizing:border-box!important;
        }
        .tex-collaboration-lock-toast{
          bottom:76px;
          width:max-content;
          max-width:calc(100% - 28px);
          font-size:12px;
        }
      }
    </style>
    <script id="qsseda-work-tex-mobile-collaboration-lock-notice">
      (() => {
        if (window.__qssedaMobileCollaborationLockNoticeReady) return;
        window.__qssedaMobileCollaborationLockNoticeReady = true;

        const drawer = document.querySelector('.tex-collaboration-drawer');
        if (!drawer) return;
        const lockedCopy = ${JSON.stringify(lockedCopy)};
        let hideTimer = 0;

        const showLockedNotice = () => {
          let toast = drawer.querySelector('.tex-collaboration-lock-toast');
          if (!toast) {
            toast = document.createElement('div');
            toast.className = 'tex-collaboration-lock-toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            drawer.append(toast);
          }
          toast.textContent = lockedCopy;
          window.clearTimeout(hideTimer);
          toast.classList.add('is-visible');
          hideTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 1800);
        };

        drawer.addEventListener('click', event => {
          if (drawer.dataset.accessMode !== 'invited') return;
          const target = event.target instanceof Element ? event.target : null;
          if (!target) return;
          const inviteControl = target.closest('#tex-collaboration-invite');
          const memberRole = target.closest('.tex-collaboration-member-actions > .tex-role-segment');
          if (!inviteControl && !memberRole) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          showLockedNotice();
        }, true);

        window.addEventListener('pagehide', () => window.clearTimeout(hideTimer), { once: true });
      })();
    </script>`;

  return output;
}

function optimizeCollaborationSwitching(markup) {
  let output = String(markup || "");

  // Access snapshots are the same permission snapshot already loaded for the
  // collaboration drawer. Avoid a second uncached action=access request.
  output = output.replace(
    `          const documentId = activeDocumentId();\n          const sequence = ++accessSequence;`,
    `          const documentId = activeDocumentId();\n          if (access && accessDocumentId === documentId && Array.isArray(access.participants)) {\n            applyAccess();\n            return;\n          }\n          const sequence = ++accessSequence;`
  );
  output = output.replace(
    `            const response = await fetch('/api/tex/collaboration?document=' + encodeURIComponent(documentId) + '&action=access', {`,
    `            const response = await fetch('/api/tex/collaboration?document=' + encodeURIComponent(documentId), {`
  );

  // Keep access state synchronized from the warm collaboration snapshot even
  // while the drawer is closed, so opening it never starts from a blank state.
  output = output.replace(
    `        window.addEventListener('qsseda:tex-collaboration-snapshot', refreshAccessControls);`,
    `        const syncAccessSnapshot = event => {\n          const data = event?.detail;\n          const id = activeDocumentId();\n          const dataId = String(data?.document_id || '');\n          if (id && dataId === id && Array.isArray(data?.participants)) {\n            access = data;\n            accessDocumentId = id;\n            applyAccess();\n          }\n          refreshAccessControls();\n        };\n        window.addEventListener('qsseda:tex-collaboration-snapshot', syncAccessSnapshot);`
  );
  output = output.replace(
    `          window.removeEventListener('qsseda:tex-collaboration-snapshot', refreshAccessControls);`,
    `          window.removeEventListener('qsseda:tex-collaboration-snapshot', syncAccessSnapshot);`
  );

  output += `
    <script id="qsseda-work-tex-collaboration-instant-switch">
      (() => {
        if (window.__qssedaCollaborationInstantSwitchReady) return;
        window.__qssedaCollaborationInstantSwitchReady = true;

        const root = document.querySelector('.tex-work-app[data-tex-root]');
        const list = document.getElementById('tex-document-list');
        if (!root || !list) return;

        const cachePrefix = 'qsseda.tex.collaboration.snapshot.';
        const maxAge = 5 * 60 * 1000;
        const freshAge = 30 * 1000;
        const inflight = new Map();
        let activeId = String(root.dataset.texCollaborationDocumentId || '');

        const readCached = id => {
          const key = String(id || '');
          if (!key) return null;
          try {
            const parsed = JSON.parse(window.sessionStorage.getItem(cachePrefix + key) || 'null');
            if (!parsed?.data || !Array.isArray(parsed.data.participants) || !Number.isFinite(Number(parsed.ts))) return null;
            if (Date.now() - Number(parsed.ts) > maxAge) return null;
            return parsed;
          } catch {
            return null;
          }
        };

        // 发布协作快照：按 documentId 保存，避免不同文档的成员/权限状态串用；persist=false 仅用于短生命周期 UI 更新。\n  const publish = (id, data, persist = true) => {
          const key = String(id || data?.document_id || '');
          if (!key || !data || !Array.isArray(data.participants)) return;
          if (persist) {
            try {
              window.sessionStorage.setItem(cachePrefix + key, JSON.stringify({ ts: Date.now(), data }));
            } catch {}
          }
          if (String(root.dataset.texCollaborationDocumentId || '') === key) {
            window.dispatchEvent(new CustomEvent('qsseda:tex-collaboration-snapshot', { detail: data }));
          }
        };

        const prefetch = id => {
          const key = String(id || '').trim();
          if (!key) return Promise.resolve(null);
          const cached = readCached(key);
          if (cached) {
            publish(key, cached.data, false);
            if (Date.now() - Number(cached.ts) < freshAge) return Promise.resolve(cached.data);
          }
          if (inflight.has(key)) return inflight.get(key);

          const request = fetch('/api/tex/collaboration?document=' + encodeURIComponent(key), {
            credentials: 'same-origin',
            cache: 'no-store',
            headers: { Accept: 'application/json' }
          }).then(async response => {
            if (!response.ok) return cached?.data || null;
            const data = await response.json().catch(() => null);
            if (data?.document_id === key && Array.isArray(data?.participants)) publish(key, data, true);
            return data;
          }).catch(() => cached?.data || null).finally(() => {
            inflight.delete(key);
          });
          inflight.set(key, request);
          return request;
        };

        // 恢复当前文档协作快照：优先使用刚缓存的数据快速绘制，随后实时/API 模块会用服务器最新状态校正。\n  const hydrateActive = () => {
          const id = String(root.dataset.texCollaborationDocumentId || '').trim();
          if (!id) return;
          const cached = readCached(id);
          if (cached) publish(id, cached.data, false);
          void prefetch(id);
        };

        const onDocumentIntent = event => {
          const target = event.target instanceof Element ? event.target.closest('.tex-document-item[data-tex-document-id]') : null;
          const id = String(target?.dataset?.texDocumentId || '').trim();
          if (id) void prefetch(id);
        };
        list.addEventListener('pointerdown', onDocumentIntent, true);
        list.addEventListener('click', onDocumentIntent, true);

        const activeObserver = new MutationObserver(() => {
          const next = String(root.dataset.texCollaborationDocumentId || '').trim();
          if (!next || next === activeId) return;
          activeId = next;
          hydrateActive();
        });
        activeObserver.observe(root, { attributes: true, attributeFilter: ['data-tex-collaboration-document-id'] });

        const warmDocumentList = () => {
          const ids = Array.from(list.querySelectorAll('.tex-document-item[data-tex-document-id]'))
            .map(item => String(item.dataset.texDocumentId || '').trim())
            .filter(Boolean)
            .slice(0, 8);
          ids.forEach((id, index) => window.setTimeout(() => void prefetch(id), index * 70));
        };

        if ('requestIdleCallback' in window) window.requestIdleCallback(warmDocumentList, { timeout: 500 });
        else window.setTimeout(warmDocumentList, 120);
        hydrateActive();

        window.addEventListener('pagehide', () => {
          activeObserver.disconnect();
          list.removeEventListener('pointerdown', onDocumentIntent, true);
          list.removeEventListener('click', onDocumentIntent, true);
        }, { once: true });
      })();
    </script>`;

  return output;
}

// 协作即时体验总装配：把邀请状态、移动端细节、文档切换缓存和核心协作增强依次注入到 Work/TeX 页面。\nexport function enhanceWorkTexCollaboration(markup, zh) {
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

  return optimizeCollaborationSwitching(
    refineCollaborationMobileUx(stabilizeInvitedCollaborationControls(output), zh)
  );
}
