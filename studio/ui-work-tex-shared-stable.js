/**
 * 【初学者导读】
 * 文件：studio/ui-work-tex-shared-stable.js
 * AERTEX Work/TeX 前端模块：负责编辑器、版本、工作区或页面交互。
 * 阅读顺序：先确认这个模块从哪里被导入，再看入口函数接收什么状态/Request；随后追踪 API、DOM、缓存或重定向副作用。
 * 初学者重点：Work/Watch 等独立产品虽然共享登录和品牌，但域名、路由和部署边界是分开的，不能把一个产品的假设直接复制到另一个。
 * 修改注意：保持已有 URL、查询参数、DOM 标识和登录交接兼容；如果产品边界变化，必须同步修改对应 CI 检查。
 * 调试方法：先确认 host/path 命中了哪个入口，再检查会话和内部状态，最后看具体 UI 或 API 结果。
 */
// 共享文档稳定层：在页面进入共享文档时读取成员角色、切换只读/可编辑状态，并修正 owner/协作者视图差异。它负责“稳定权限体验”，不负责真正授权。\nexport function enhanceWorkTexSharedStable(markup, zh) {
  let output = String(markup || "");

  const original = `            rememberSharedDocuments(shared);\n            const documents = [...(Array.isArray(ownData.documents) ? ownData.documents : []), ...shared]\n              .sort((a, b) => String(b?.updated_at || '').localeCompare(String(a?.updated_at || '')));\n            return responseJson({ ...ownData, documents, count: documents.length, scope: shared.length ? 'own-and-shared' : (ownData.scope || 'own') });`;

  const replacement = `            const ownDocuments = Array.isArray(ownData.documents) ? ownData.documents : [];\n            rememberSharedDocuments([...ownDocuments.filter(item => item?.shared === true), ...shared]);\n            const byId = new Map();\n            for (const item of [...ownDocuments, ...shared]) {\n              const id = String(item?.id || '').trim();\n              if (!id || byId.has(id)) continue;\n              byId.set(id, item);\n            }\n            const documents = [...byId.values()]\n              .sort((a, b) => String(b?.updated_at || '').localeCompare(String(a?.updated_at || '')));\n            const hasShared = documents.some(item => item?.shared === true);\n            return responseJson({ ...ownData, documents, count: documents.length, scope: hasShared ? 'own-and-shared' : (ownData.scope || 'own') });`;

  if (output.includes(original)) output = output.replace(original, replacement);

  output = output.replace(
    `            row.className = 'tex-collaboration-member' + (participant.is_owner ? ' is-owner' : '');\n            row.append(makeAvatar(participant, 'tex-collaboration-member-avatar'));`,
    `            row.className = 'tex-collaboration-member' + (participant.is_owner ? ' is-owner' : '');\n            row.dataset.participantId = participant.id;\n            row.append(makeAvatar(participant, 'tex-collaboration-member-avatar'));`
  );

  output = output.replace(
    `          add.disabled = value || saving || !activeDocumentId();\n          username.disabled = value || saving;\n          role.disabled = value || saving;`,
    `          const canManage = snapshot?.can_manage === true;\n          add.disabled = value || saving || !activeDocumentId() || !canManage;\n          username.disabled = value || saving || !canManage;\n          role.disabled = value || saving || !canManage;`
  );

  output += `
    <style id="qsseda-work-tex-document-card-alignment">
      .tex-work-app .tex-document-item{
        grid-template-columns:minmax(0,1fr)!important;
        justify-items:stretch!important;
        align-items:start!important;
        text-align:left!important;
      }
      .tex-work-app .tex-document-item>strong,
      .tex-work-app .tex-document-item>p,
      .tex-work-app .tex-document-item>.tex-document-meta{
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
        justify-self:stretch!important;
        text-align:left!important;
        margin-left:0!important;
        margin-right:0!important;
      }
      .tex-work-app .tex-document-item>.tex-document-meta{
        display:flex!important;
        align-items:center!important;
        justify-content:space-between!important;
      }

      .tex-collaboration-drawer .tex-role-segment{
        box-sizing:border-box!important;
        display:grid!important;
        grid-template-columns:1fr 1fr!important;
        align-items:center!important;
        width:148px!important;
        min-width:148px!important;
        height:38px!important;
        min-height:38px!important;
        padding:2px!important;
        gap:2px!important;
        overflow:hidden!important;
        border-radius:11px!important;
        background:color-mix(in srgb,var(--fill) 92%,var(--surface))!important;
        box-shadow:inset 0 0 0 1px var(--border)!important;
      }
      .tex-collaboration-drawer .tex-role-segment button{
        box-sizing:border-box!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        width:100%!important;
        min-width:0!important;
        height:34px!important;
        min-height:34px!important;
        margin:0!important;
        padding:0 8px!important;
        border:0!important;
        border-radius:9px!important;
        background:transparent!important;
        color:var(--muted)!important;
        box-shadow:none!important;
        transform:none!important;
        font-size:11.5px!important;
        font-weight:700!important;
        line-height:1!important;
        white-space:nowrap!important;
      }
      .tex-collaboration-drawer .tex-role-segment button.is-active{
        background:var(--surface)!important;
        color:var(--text)!important;
        box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 22%,var(--border))!important;
      }
      .tex-collaboration-drawer .tex-role-segment button:disabled{
        opacity:.72!important;
        cursor:not-allowed!important;
      }
      .tex-collaboration-drawer .tex-role-segment button.is-active:disabled{
        opacity:1!important;
        color:var(--text)!important;
        cursor:not-allowed!important;
      }
      .tex-collaboration-drawer .tex-collaboration-member-actions{
        grid-template-columns:148px 64px!important;
        min-width:222px!important;
        gap:8px!important;
      }
      .tex-collaboration-drawer .tex-collaboration-member-actions>.tex-role-segment{
        width:148px!important;
        min-width:148px!important;
        height:38px!important;
        min-height:38px!important;
        padding:2px!important;
      }
      .tex-collaboration-drawer .tex-collaboration-member-actions>.tex-role-segment button{
        height:34px!important;
        min-height:34px!important;
        font-size:11px!important;
      }
      .tex-collaboration-drawer .tex-collaboration-remove{
        box-sizing:border-box!important;
        width:auto!important;
        min-width:58px!important;
        height:34px!important;
        min-height:34px!important;
        padding:0 10px!important;
        border-radius:10px!important;
        font-size:11px!important;
        line-height:1!important;
      }
      .tex-collaboration-drawer .tex-collaboration-remove.is-leave{
        min-width:76px!important;
        background:color-mix(in srgb,var(--danger) 10%,var(--surface))!important;
        color:var(--danger)!important;
        box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--danger) 18%,var(--border))!important;
      }
      .tex-collaboration-drawer.is-invited-view #tex-collaboration-username,
      .tex-collaboration-drawer.is-invited-view #tex-collaboration-role,
      .tex-collaboration-drawer.is-invited-view #tex-collaboration-add,
      .tex-collaboration-drawer.is-invited-view .tex-collaboration-invite>.tex-role-segment button{
        cursor:not-allowed!important;
      }
      .tex-collaboration-drawer.is-invited-view #tex-collaboration-add{
        opacity:.38!important;
        filter:saturate(.55)!important;
        pointer-events:none!important;
      }

      @media (max-width:760px), (max-width:950px) and (pointer:coarse){
        .tex-work-app .tex-editor-toolbar{
          display:grid!important;
          grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
          grid-template-rows:auto auto!important;
          align-items:end!important;
          gap:8px!important;
        }
        .tex-work-app .tex-editor-toolbar>input{
          grid-column:1/-1!important;
          grid-row:1!important;
          width:100%!important;
          min-width:0!important;
          height:42px!important;
          min-height:42px!important;
        }
        .tex-work-app .tex-editor-toolbar>label{
          grid-column:1!important;
          grid-row:2!important;
          width:100%!important;
          min-width:0!important;
          margin:0!important;
        }
        .tex-work-app .tex-editor-toolbar>label select{
          width:100%!important;
          min-width:0!important;
          height:42px!important;
          min-height:42px!important;
        }
        .tex-work-app .tex-editor-toolbar>.tex-collaboration-button{
          grid-column:2!important;
          grid-row:2!important;
          align-self:end!important;
          width:100%!important;
          min-width:0!important;
          height:42px!important;
          min-height:42px!important;
          margin:0!important;
          padding:0 10px!important;
        }
        .tex-collaboration-drawer .tex-collaboration-invite>.tex-role-segment{
          width:132px!important;
          min-width:132px!important;
          height:38px!important;
          min-height:38px!important;
        }
        .tex-collaboration-drawer .tex-collaboration-member-actions{
          grid-template-columns:140px 72px!important;
          justify-content:end!important;
          width:100%!important;
          min-width:0!important;
        }
        .tex-collaboration-drawer .tex-collaboration-member-actions>.tex-role-segment{
          width:140px!important;
          min-width:140px!important;
          height:38px!important;
          min-height:38px!important;
        }
      }
    </style>
    <script id="qsseda-work-tex-invited-collaborator-controls">
      (() => {
        if (window.__qssedaInvitedCollaboratorControlsReady) return;
        window.__qssedaInvitedCollaboratorControlsReady = true;

        const labels = ${JSON.stringify(zh ? {
          locked: "只有文档所有者可以修改此权限",
          leave: "退出协作",
          leaving: "正在退出…",
          leaveConfirm: "确定退出这份文档的协作吗？退出后将无法继续访问，除非所有者再次邀请你。",
          leaveFailed: "无法退出协作，请稍后重试。"
        } : {
          locked: "Only the document owner can change this permission",
          leave: "Leave",
          leaving: "Leaving…",
          leaveConfirm: "Leave collaboration on this document? You will lose access unless the owner invites you again.",
          leaveFailed: "Could not leave collaboration. Please try again."
        })};
        const root = document.querySelector('.tex-work-app[data-tex-root], [data-tex-root]');
        const drawer = document.querySelector('.tex-collaboration-drawer');
        const openButton = document.getElementById('tex-collaboration-open');
        if (!root || !drawer || !openButton) return;

        let access = null;
        let accessDocumentId = '';
        let accessSequence = 0;
        let applying = false;

        const activeDocumentId = () => String(
          root.dataset.texCollaborationDocumentId ||
          document.querySelector('.tex-document-item.is-active')?.dataset?.texDocumentId ||
          ''
        ).trim();

        const lockInvite = locked => {
          const username = document.getElementById('tex-collaboration-username');
          const role = document.getElementById('tex-collaboration-role');
          const add = document.getElementById('tex-collaboration-add');
          if (username) username.disabled = locked;
          if (role) role.disabled = locked;
          if (add) add.disabled = locked;
          const inviteSegment = drawer.querySelector('.tex-collaboration-invite>.tex-role-segment');
          inviteSegment?.querySelectorAll('button').forEach(button => {
            button.disabled = locked;
            button.title = locked ? labels.locked : '';
          });
        };

        const leaveDocument = async button => {
          const documentId = activeDocumentId();
          if (!documentId || !window.confirm(labels.leaveConfirm)) return;
          button.disabled = true;
          button.textContent = labels.leaving;
          try {
            const response = await fetch('/api/tex/collaboration?action=leave&document=' + encodeURIComponent(documentId), {
              method: 'DELETE',
              credentials: 'same-origin',
              cache: 'no-store',
              headers: { Accept: 'application/json' }
            });
            if (!response.ok) {
              const data = await response.json().catch(() => null);
              throw new Error(data?.error || labels.leaveFailed);
            }
            try { window.sessionStorage.removeItem('qsseda.tex.collaboration.snapshot.' + documentId); } catch {}
            window.location.reload();
          } catch (error) {
            button.disabled = false;
            button.textContent = labels.leave;
            window.alert(error?.message || labels.leaveFailed);
          }
        };

        // 把当前共享访问角色应用到编辑器/按钮：viewer 只读、editor 可编辑。服务端仍会在写请求时重新检查权限，前端这里只是同步体验。\n  const applyAccess = () => {
          if (applying) return;
          applying = true;
          try {
            const documentId = activeDocumentId();
            if (!access || accessDocumentId !== documentId) {
              drawer.classList.add('is-invited-view');
              lockInvite(true);
              return;
            }

            const canManage = access.can_manage === true;
            drawer.classList.toggle('is-invited-view', !canManage);
            lockInvite(!canManage);

            drawer.querySelectorAll('.tex-collaboration-member .tex-role-segment button').forEach(button => {
              if (!canManage) {
                button.disabled = true;
                button.title = labels.locked;
              } else {
                button.title = '';
              }
            });

            const rows = drawer.querySelectorAll('.tex-collaboration-member[data-participant-id]');
            for (const row of rows) {
              const participantId = String(row.dataset.participantId || '');
              const remove = row.querySelector('.tex-collaboration-remove');
              if (!remove) continue;

              if (canManage) {
                remove.hidden = false;
                continue;
              }

              if (access.can_leave === true && participantId === String(access.current_user_id || '')) {
                if (!remove.classList.contains('is-leave')) {
                  const leave = remove.cloneNode(true);
                  leave.classList.add('is-leave');
                  leave.hidden = false;
                  leave.disabled = false;
                  leave.textContent = labels.leave;
                  leave.removeAttribute('title');
                  leave.addEventListener('click', event => {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    void leaveDocument(leave);
                  });
                  remove.replaceWith(leave);
                } else {
                  remove.hidden = false;
                  remove.disabled = false;
                  remove.textContent = labels.leave;
                }
              } else {
                remove.hidden = true;
              }
            }
          } finally {
            applying = false;
          }
        };

        // 加载当前文档共享访问状态：文档切换后重新请求，避免沿用上一文档的角色。失败时默认保守为不可写。\n  const loadAccess = async () => {
          const documentId = activeDocumentId();
          const sequence = ++accessSequence;
          access = null;
          accessDocumentId = documentId;
          drawer.classList.add('is-invited-view');
          lockInvite(true);
          if (!documentId) return;
          try {
            const response = await fetch('/api/tex/collaboration?document=' + encodeURIComponent(documentId) + '&action=access', {
              credentials: 'same-origin',
              cache: 'no-store',
              headers: { Accept: 'application/json' }
            });
            if (!response.ok) return;
            const data = await response.json().catch(() => null);
            if (sequence !== accessSequence || documentId !== activeDocumentId() || !data) return;
            access = data;
            accessDocumentId = documentId;
            applyAccess();
          } catch {}
        };

        openButton.addEventListener('click', () => {
          window.setTimeout(() => void loadAccess(), 0);
        });

        const observer = new MutationObserver(() => {
          if (!drawer.classList.contains('is-open')) return;
          applyAccess();
        });
        observer.observe(drawer, { childList: true, subtree: true });

        document.getElementById('tex-document-list')?.addEventListener('click', () => {
          access = null;
          accessDocumentId = '';
        });

        window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
      })();
    </script>`;

  return output;
}
