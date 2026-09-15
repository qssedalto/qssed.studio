export function enhanceWorkTexCollaboration(markup, zh) {
  const copy = zh ? {
    open: "协作",
    title: "协作设置",
    close: "关闭协作设置",
    noDocument: "先打开一份 TeX 文档",
    members: "成员",
    membersDetail: "管理谁可以参与这份文档。成员设置会绑定到当前文档。",
    invite: "邀请成员",
    username: "QssedA 用户名",
    viewer: "只读",
    editor: "可编辑",
    owner: "所有者",
    add: "添加",
    adding: "正在添加…",
    remove: "移除",
    removeConfirm: "确定从这份文档中移除该成员吗？",
    loading: "正在读取协作设置…",
    empty: "还没有其他协作者",
    error: "无法读取协作设置",
    liveTitle: "实时共同编辑",
    livePreparing: "CRDT 同步通道准备中",
    liveDetail: "这一阶段先完成成员与权限基础。下一阶段会把编辑器接入 CodeMirror + Yjs，届时启用多人光标、选区和并发编辑。",
    remoteCursor: "显示协作者光标与选区",
    remoteCursorDetail: "接入 Yjs Awareness 后启用",
    follow: "跟随协作者",
    followDetail: "跟随对方当前编辑位置",
    linkTitle: "链接共享",
    linkPreparing: "下一阶段启用",
    linkDetail: "公开或受控分享链接暂时保持关闭，避免在权限模型完成前产生绕过成员列表的入口。",
    shareAfter: "成员权限验证完成后再开放分享链接。",
    ownerHint: "所有者拥有完整管理权限",
    permissionHint: "“可编辑”权限已经可以保存到协作配置，但实时源码同步会等 CRDT 通道完成后再开放。",
    saved: "协作设置已更新",
    unavailable: "协作数据库尚未部署或暂时不可用"
  } : {
    open: "Collaborate",
    title: "Collaboration settings",
    close: "Close collaboration settings",
    noDocument: "Open a TeX document first",
    members: "People",
    membersDetail: "Manage who can participate in this document. Membership is scoped to the active document.",
    invite: "Invite people",
    username: "QssedA username",
    viewer: "Viewer",
    editor: "Editor",
    owner: "Owner",
    add: "Add",
    adding: "Adding…",
    remove: "Remove",
    removeConfirm: "Remove this person from the document?",
    loading: "Loading collaboration settings…",
    empty: "No other collaborators yet",
    error: "Could not load collaboration settings",
    liveTitle: "Live co-editing",
    livePreparing: "CRDT sync channel is being prepared",
    liveDetail: "This phase establishes members and permissions first. The next phase will connect CodeMirror + Yjs for concurrent editing, selections, and remote cursors.",
    remoteCursor: "Remote cursors and selections",
    remoteCursorDetail: "Enabled after Yjs Awareness is connected",
    follow: "Follow collaborator",
    followDetail: "Follow the active editing position",
    linkTitle: "Link sharing",
    linkPreparing: "Coming next",
    linkDetail: "Public or controlled share links stay disabled until the permission model is fully enforced, so there is no alternate path around the member list.",
    shareAfter: "Share links will be enabled after member access is fully enforced.",
    ownerHint: "The owner has full management access",
    permissionHint: "Editor permission can already be stored, but live source synchronization will remain disabled until the CRDT channel is ready.",
    saved: "Collaboration settings updated",
    unavailable: "The collaboration database is not deployed or is temporarily unavailable"
  };

  let output = String(markup || "");

  output = output.replace(
    "button.type='button';button.className='tex-document-item'+(item.id===activeId?' is-active':'');",
    "button.type='button';button.dataset.texDocumentId=item.id;button.className='tex-document-item'+(item.id===activeId?' is-active':'');"
  );
  output = output.replace(
    "activeId=id;activeDocument=data.document||null;renderEditor();",
    "activeId=id;root.dataset.texCollaborationDocumentId=id;activeDocument=data.document||null;renderEditor();"
  );
  output = output.replace(
    "activeId=data.document.id;activeDocument=data.document;updateLocal(activeDocument);",
    "activeId=data.document.id;root.dataset.texCollaborationDocumentId=activeId;activeDocument=data.document;updateLocal(activeDocument);"
  );
  output = output.replace(
    "activeId='';activeDocument=null;dirty=false;runs=[];",
    "activeId='';root.dataset.texCollaborationDocumentId='';activeDocument=null;dirty=false;runs=[];"
  );

  output += `
    <style id="qsseda-work-tex-collaboration-style">
      .tex-work-app .tex-editor-toolbar{align-items:end!important}
      .tex-work-app .tex-collaboration-button{
        appearance:none!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;
        flex:0 0 auto!important;width:auto!important;min-width:88px!important;height:38px!important;min-height:38px!important;margin:0!important;padding:0 12px!important;
        border:0!important;border-radius:11px!important;background:var(--fill)!important;color:var(--text)!important;
        box-shadow:inset 0 0 0 1px var(--border)!important;font-size:10px!important;font-weight:700!important;white-space:nowrap!important;
        cursor:pointer!important;transition:background .16s ease,box-shadow .16s ease,transform .16s ease,opacity .16s ease!important
      }
      .tex-work-app .tex-collaboration-button:hover:not(:disabled){background:var(--card)!important;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 30%,var(--border))!important}
      .tex-work-app .tex-collaboration-button:active:not(:disabled){transform:scale(.97)}
      .tex-work-app .tex-collaboration-button:disabled{opacity:.38!important;cursor:not-allowed!important}
      .tex-work-app .tex-collaboration-button svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round}
      .tex-collaboration-avatars{display:flex;align-items:center;margin-left:1px}
      .tex-collaboration-avatar-dot{display:grid;place-items:center;width:19px;height:19px;margin-left:-5px;border:2px solid var(--fill);border-radius:50%;background:var(--surface);color:var(--muted);font-size:7px;font-weight:800;overflow:hidden}
      .tex-collaboration-avatar-dot:first-child{margin-left:0}.tex-collaboration-avatar-dot img{width:100%;height:100%;object-fit:cover}

      body.tex-collaboration-open{overflow:hidden!important}
      .tex-collaboration-backdrop{position:fixed;inset:0;z-index:2147482000;background:rgba(0,0,0,.20);opacity:0;pointer-events:none;transition:opacity .2s ease}
      .tex-collaboration-backdrop.is-open{opacity:1;pointer-events:auto}
      .tex-collaboration-drawer{position:fixed;top:8px;right:8px;bottom:8px;z-index:2147482001;display:flex;flex-direction:column;width:min(430px,calc(100vw - 24px));min-width:0;overflow:hidden;border-radius:22px;background:color-mix(in srgb,var(--surface) 97%,transparent);box-shadow:0 24px 80px rgba(0,0,0,.22),inset 0 0 0 1px var(--border);-webkit-backdrop-filter:blur(26px) saturate(155%);backdrop-filter:blur(26px) saturate(155%);transform:translateX(calc(100% + 18px));transition:transform .28s cubic-bezier(.22,1,.36,1)}
      .tex-collaboration-drawer.is-open{transform:translateX(0)}
      .tex-collaboration-drawer-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:18px 18px 13px;border-bottom:1px solid var(--hairline)}
      .tex-collaboration-heading{display:grid;gap:4px;min-width:0}.tex-collaboration-heading strong{font-size:17px;letter-spacing:-.025em}.tex-collaboration-heading span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted);font-size:10px}
      .tex-collaboration-close{display:grid;place-items:center;width:30px;height:30px;min-width:30px;margin:0;padding:0;border:0;border-radius:10px;background:var(--fill);color:var(--muted);box-shadow:inset 0 0 0 1px var(--border);font-size:18px;line-height:1;cursor:pointer}.tex-collaboration-close:hover{color:var(--text);background:var(--card)}
      .tex-collaboration-scroll{display:grid;gap:12px;min-height:0;padding:14px 14px 24px;overflow:auto;overscroll-behavior:contain}
      .tex-collaboration-section{display:grid;gap:10px;padding:14px;border-radius:17px;background:var(--card);box-shadow:inset 0 0 0 1px var(--hairline)}
      .tex-collaboration-section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.tex-collaboration-section-head>div{display:grid;gap:4px}.tex-collaboration-section-head strong{font-size:12px;letter-spacing:-.01em}.tex-collaboration-section-head span{color:var(--muted);font-size:9px;line-height:1.45}
      .tex-collaboration-count{display:grid;place-items:center;min-width:28px;height:23px;padding:0 7px;border-radius:999px;background:var(--fill);color:var(--muted);font-size:8px;font-weight:750}
      .tex-collaboration-state{display:flex;align-items:flex-start;gap:9px;padding:11px;border-radius:13px;background:var(--fill)}.tex-collaboration-state-dot{width:8px;height:8px;margin-top:4px;border-radius:50%;background:var(--primary);flex:0 0 auto}.tex-collaboration-state>div{display:grid;gap:3px;min-width:0}.tex-collaboration-state strong{font-size:10px}.tex-collaboration-state span{color:var(--muted);font-size:9px;line-height:1.45}
      .tex-collaboration-invite{display:grid;grid-template-columns:minmax(0,1fr) 98px 70px;gap:7px}
      .tex-collaboration-invite input,.tex-collaboration-invite select,.tex-collaboration-member select{min-width:0;height:36px;margin:0;padding:0 10px;border:0;border-radius:10px;background:var(--fill);color:var(--text);box-shadow:inset 0 0 0 1px var(--border);font-size:9px;outline:none}
      .tex-collaboration-invite input:focus,.tex-collaboration-invite select:focus,.tex-collaboration-member select:focus{box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 10%,transparent),inset 0 0 0 1px color-mix(in srgb,var(--primary) 60%,var(--border))}
      .tex-collaboration-invite button,.tex-collaboration-remove{appearance:none;border:0;border-radius:10px;background:var(--primary);color:#fff;font-size:9px;font-weight:750;cursor:pointer}.tex-collaboration-invite button:disabled{opacity:.45;cursor:not-allowed}
      .tex-collaboration-list{display:grid;gap:7px}.tex-collaboration-member{display:grid;grid-template-columns:34px minmax(0,1fr) 88px 52px;align-items:center;gap:8px;padding:8px;border-radius:12px;background:var(--fill)}.tex-collaboration-member.is-owner{grid-template-columns:34px minmax(0,1fr) 88px}
      .tex-collaboration-member-avatar{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;overflow:hidden;background:color-mix(in srgb,var(--primary) 9%,var(--surface));color:var(--primary);font-size:10px;font-weight:800}.tex-collaboration-member-avatar img{width:100%;height:100%;object-fit:cover}
      .tex-collaboration-member-copy{display:grid;gap:2px;min-width:0}.tex-collaboration-member-copy strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px}.tex-collaboration-member-copy span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted);font-size:8px}
      .tex-collaboration-role-pill{display:grid;place-items:center;height:28px;padding:0 8px;border-radius:9px;background:var(--surface);color:var(--muted);font-size:8px;font-weight:700}
      .tex-collaboration-remove{height:30px;padding:0 7px;background:color-mix(in srgb,var(--danger) 10%,var(--fill));color:var(--danger)}.tex-collaboration-remove:hover{background:color-mix(in srgb,var(--danger) 15%,var(--fill))}
      .tex-collaboration-empty{padding:15px 8px;text-align:center;color:var(--muted);font-size:9px}.tex-collaboration-note{color:var(--quiet);font-size:8px;line-height:1.5}
      .tex-collaboration-message{display:none;padding:9px 10px;border-radius:10px;background:var(--fill);color:var(--muted);font-size:9px;line-height:1.45}.tex-collaboration-message.is-visible{display:block}.tex-collaboration-message.is-error{background:color-mix(in srgb,var(--danger) 8%,var(--fill));color:var(--danger)}
      .tex-collaboration-disabled-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 11px;border-radius:12px;background:var(--fill);opacity:.72}.tex-collaboration-disabled-row>div{display:grid;gap:3px}.tex-collaboration-disabled-row strong{font-size:9px}.tex-collaboration-disabled-row span{color:var(--muted);font-size:8px;line-height:1.4}.tex-collaboration-disabled-badge{flex:0 0 auto;padding:4px 7px;border-radius:999px;background:var(--surface);color:var(--quiet);font-size:7px;font-weight:750}

      @media(max-width:760px), (max-width:950px) and (pointer:coarse){
        .tex-work-app .tex-editor-toolbar{align-items:stretch!important}
        .tex-work-app .tex-collaboration-button{width:100%!important;min-width:0!important}
        .tex-collaboration-drawer{top:auto;left:6px;right:6px;bottom:6px;width:auto;max-height:calc(100dvh - 18px);border-radius:22px;transform:translateY(calc(100% + 14px))}.tex-collaboration-drawer.is-open{transform:translateY(0)}
        .tex-collaboration-invite{grid-template-columns:minmax(0,1fr) 92px}.tex-collaboration-invite button{grid-column:1/-1;height:38px}
        .tex-collaboration-member{grid-template-columns:34px minmax(0,1fr) 86px}.tex-collaboration-member:not(.is-owner) .tex-collaboration-remove{grid-column:2/-1;width:100%;height:32px}.tex-collaboration-member.is-owner{grid-template-columns:34px minmax(0,1fr) 80px}
      }
    </style>
    <script id="qsseda-work-tex-collaboration-runtime">
      (() => {
        const root = document.querySelector('.tex-work-app[data-tex-root]');
        const toolbar = document.querySelector('.tex-work-app .tex-editor-toolbar');
        const titleInput = document.getElementById('tex-title');
        const documentList = document.getElementById('tex-document-list');
        if (!root || !toolbar || document.getElementById('tex-collaboration-open')) return;

        const labels = ${JSON.stringify(copy)};
        let snapshot = null;
        let loading = false;
        let opened = false;
        let requestSequence = 0;

        const openButton = document.createElement('button');
        openButton.id = 'tex-collaboration-open';
        openButton.className = 'tex-collaboration-button';
        openButton.type = 'button';
        openButton.disabled = true;
        openButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 19c0-2.4-2-4-4.5-4S7 16.6 7 19"></path><circle cx="11.5" cy="9" r="3"></circle><path d="M18 8v6M15 11h6"></path></svg><span>' + labels.open + '</span><span class="tex-collaboration-avatars" aria-hidden="true"></span>';
        toolbar.append(openButton);

        const backdrop = document.createElement('div');
        backdrop.className = 'tex-collaboration-backdrop';
        backdrop.hidden = true;

        const drawer = document.createElement('aside');
        drawer.className = 'tex-collaboration-drawer';
        drawer.setAttribute('role', 'dialog');
        drawer.setAttribute('aria-modal', 'true');
        drawer.setAttribute('aria-label', labels.title);
        drawer.hidden = true;
        drawer.innerHTML =
          '<div class="tex-collaboration-drawer-head">' +
            '<div class="tex-collaboration-heading"><strong>' + labels.title + '</strong><span id="tex-collaboration-document"></span></div>' +
            '<button class="tex-collaboration-close" type="button" aria-label="' + labels.close + '">×</button>' +
          '</div>' +
          '<div class="tex-collaboration-scroll">' +
            '<section class="tex-collaboration-section">' +
              '<div class="tex-collaboration-section-head"><div><strong>' + labels.members + '</strong><span>' + labels.membersDetail + '</span></div><span id="tex-collaboration-count" class="tex-collaboration-count">0</span></div>' +
              '<form id="tex-collaboration-invite" class="tex-collaboration-invite">' +
                '<input id="tex-collaboration-username" type="text" autocomplete="off" spellcheck="false" placeholder="' + labels.username + '" aria-label="' + labels.username + '">' +
                '<select id="tex-collaboration-role" aria-label="' + labels.invite + '"><option value="editor">' + labels.editor + '</option><option value="viewer">' + labels.viewer + '</option></select>' +
                '<button id="tex-collaboration-add" type="submit">' + labels.add + '</button>' +
              '</form>' +
              '<div id="tex-collaboration-message" class="tex-collaboration-message"></div>' +
              '<div id="tex-collaboration-list" class="tex-collaboration-list"></div>' +
              '<div class="tex-collaboration-note">' + labels.permissionHint + '</div>' +
            '</section>' +
            '<section class="tex-collaboration-section">' +
              '<div class="tex-collaboration-section-head"><div><strong>' + labels.liveTitle + '</strong></div></div>' +
              '<div class="tex-collaboration-state"><span class="tex-collaboration-state-dot"></span><div><strong>' + labels.livePreparing + '</strong><span>' + labels.liveDetail + '</span></div></div>' +
              '<div class="tex-collaboration-disabled-row"><div><strong>' + labels.remoteCursor + '</strong><span>' + labels.remoteCursorDetail + '</span></div><span class="tex-collaboration-disabled-badge">CRDT</span></div>' +
              '<div class="tex-collaboration-disabled-row"><div><strong>' + labels.follow + '</strong><span>' + labels.followDetail + '</span></div><span class="tex-collaboration-disabled-badge">Yjs</span></div>' +
            '</section>' +
            '<section class="tex-collaboration-section">' +
              '<div class="tex-collaboration-section-head"><div><strong>' + labels.linkTitle + '</strong><span>' + labels.linkDetail + '</span></div></div>' +
              '<div class="tex-collaboration-disabled-row"><div><strong>' + labels.linkPreparing + '</strong><span>' + labels.shareAfter + '</span></div><span class="tex-collaboration-disabled-badge">OFF</span></div>' +
            '</section>' +
          '</div>';
        document.body.append(backdrop, drawer);

        const closeButton = drawer.querySelector('.tex-collaboration-close');
        const documentLabel = drawer.querySelector('#tex-collaboration-document');
        const count = drawer.querySelector('#tex-collaboration-count');
        const form = drawer.querySelector('#tex-collaboration-invite');
        const username = drawer.querySelector('#tex-collaboration-username');
        const role = drawer.querySelector('#tex-collaboration-role');
        const add = drawer.querySelector('#tex-collaboration-add');
        const message = drawer.querySelector('#tex-collaboration-message');
        const list = drawer.querySelector('#tex-collaboration-list');
        const avatars = openButton.querySelector('.tex-collaboration-avatars');

        function activeDocumentId() {
          const stored = String(root.dataset.texCollaborationDocumentId || '').trim();
          if (stored) return stored;
          return String(documentList?.querySelector('.tex-document-item.is-active')?.dataset?.texDocumentId || '').trim();
        }

        async function api(path, options = {}) {
          const response = await fetch(path, {
            ...options,
            credentials: 'same-origin',
            cache: 'no-store',
            headers: {
              Accept: 'application/json',
              ...(options.body ? { 'Content-Type': 'application/json;charset=UTF-8' } : {}),
              ...(options.headers || {})
            }
          });
          const payload = await response.json().catch(() => ({}));
          if (!response.ok) {
            const error = new Error(payload?.error || labels.error);
            error.status = response.status;
            throw error;
          }
          return payload;
        }

        function showMessage(text, error = false) {
          message.textContent = text || '';
          message.classList.toggle('is-visible', Boolean(text));
          message.classList.toggle('is-error', Boolean(error));
        }

        function initials(person) {
          const source = String(person?.display_name || person?.username || '?').trim();
          return source ? source.slice(0, 2).toUpperCase() : '?';
        }

        function makeAvatar(person, className) {
          const node = document.createElement('span');
          node.className = className;
          if (person?.avatar_url) {
            const image = document.createElement('img');
            image.src = person.avatar_url;
            image.alt = '';
            image.referrerPolicy = 'no-referrer';
            node.append(image);
          } else {
            node.textContent = initials(person);
          }
          return node;
        }

        function roleLabel(value) {
          return value === 'owner' ? labels.owner : value === 'editor' ? labels.editor : labels.viewer;
        }

        function renderAvatars() {
          avatars.replaceChildren();
          const participants = Array.isArray(snapshot?.participants) ? snapshot.participants.slice(0, 3) : [];
          for (const participant of participants) avatars.append(makeAvatar(participant, 'tex-collaboration-avatar-dot'));
        }

        function renderParticipants() {
          const participants = Array.isArray(snapshot?.participants) ? snapshot.participants : [];
          count.textContent = String(participants.length);
          list.replaceChildren();
          renderAvatars();
          if (!participants.length && !loading) {
            const empty = document.createElement('div');
            empty.className = 'tex-collaboration-empty';
            empty.textContent = labels.empty;
            list.append(empty);
            return;
          }

          for (const participant of participants) {
            const row = document.createElement('article');
            row.className = 'tex-collaboration-member' + (participant.is_owner ? ' is-owner' : '');
            row.append(makeAvatar(participant, 'tex-collaboration-member-avatar'));

            const copyNode = document.createElement('div');
            copyNode.className = 'tex-collaboration-member-copy';
            const name = document.createElement('strong');
            name.textContent = participant.display_name || participant.username || labels.members;
            const handle = document.createElement('span');
            handle.textContent = participant.username ? '@' + participant.username : '';
            copyNode.append(name, handle);
            row.append(copyNode);

            if (participant.is_owner) {
              const badge = document.createElement('span');
              badge.className = 'tex-collaboration-role-pill';
              badge.textContent = labels.owner;
              badge.title = labels.ownerHint;
              row.append(badge);
            } else {
              const select = document.createElement('select');
              select.setAttribute('aria-label', roleLabel(participant.role));
              select.innerHTML = '<option value="editor">' + labels.editor + '</option><option value="viewer">' + labels.viewer + '</option>';
              select.value = participant.role === 'editor' ? 'editor' : 'viewer';
              select.disabled = !snapshot?.can_manage;
              select.addEventListener('change', () => void changeRole(participant.id, select.value, select));
              row.append(select);

              const remove = document.createElement('button');
              remove.className = 'tex-collaboration-remove';
              remove.type = 'button';
              remove.textContent = labels.remove;
              remove.disabled = !snapshot?.can_manage;
              remove.addEventListener('click', () => void removeMember(participant.id, remove));
              row.append(remove);
            }
            list.append(row);
          }
        }

        function setBusy(value) {
          loading = value;
          add.disabled = value || !activeDocumentId();
          username.disabled = value;
          role.disabled = value;
        }

        async function loadSnapshot(showLoading = true) {
          const id = activeDocumentId();
          const sequence = ++requestSequence;
          if (!id) {
            snapshot = null;
            renderParticipants();
            return;
          }
          if (showLoading) {
            setBusy(true);
            showMessage(labels.loading);
          }
          try {
            const data = await api('/api/tex/collaboration?document=' + encodeURIComponent(id));
            if (sequence !== requestSequence || id !== activeDocumentId()) return;
            snapshot = data;
            showMessage('');
            renderParticipants();
          } catch (error) {
            if (sequence !== requestSequence) return;
            snapshot = null;
            renderParticipants();
            showMessage(error?.message || labels.unavailable, true);
          } finally {
            if (sequence === requestSequence) setBusy(false);
          }
        }

        async function changeRole(memberId, nextRole, select) {
          const id = activeDocumentId();
          if (!id || !memberId) return;
          select.disabled = true;
          try {
            snapshot = await api('/api/tex/collaboration', { method: 'PATCH', body: JSON.stringify({ document_id: id, member_id: memberId, role: nextRole }) });
            showMessage(labels.saved);
            renderParticipants();
          } catch (error) {
            showMessage(error?.message || labels.error, true);
            await loadSnapshot(false);
          }
        }

        async function removeMember(memberId, button) {
          const id = activeDocumentId();
          if (!id || !memberId || !window.confirm(labels.removeConfirm)) return;
          button.disabled = true;
          try {
            snapshot = await api('/api/tex/collaboration?document=' + encodeURIComponent(id) + '&member=' + encodeURIComponent(memberId), { method: 'DELETE' });
            showMessage(labels.saved);
            renderParticipants();
          } catch (error) {
            showMessage(error?.message || labels.error, true);
            button.disabled = false;
          }
        }

        form.addEventListener('submit', async event => {
          event.preventDefault();
          const id = activeDocumentId();
          const handle = username.value.trim();
          if (!id || !handle || loading) return;
          setBusy(true);
          add.textContent = labels.adding;
          showMessage('');
          try {
            snapshot = await api('/api/tex/collaboration', { method: 'POST', body: JSON.stringify({ document_id: id, username: handle, role: role.value }) });
            username.value = '';
            showMessage(labels.saved);
            renderParticipants();
          } catch (error) {
            showMessage(error?.message || labels.error, true);
          } finally {
            add.textContent = labels.add;
            setBusy(false);
          }
        });

        function openDrawer() {
          if (!activeDocumentId()) return;
          opened = true;
          drawer.hidden = false;
          backdrop.hidden = false;
          document.body.classList.add('tex-collaboration-open');
          documentLabel.textContent = titleInput?.value?.trim() || activeDocumentId();
          window.requestAnimationFrame(() => {
            drawer.classList.add('is-open');
            backdrop.classList.add('is-open');
            window.setTimeout(() => username.focus(), 120);
          });
          void loadSnapshot(true);
        }

        function closeDrawer() {
          if (!opened) return;
          opened = false;
          drawer.classList.remove('is-open');
          backdrop.classList.remove('is-open');
          document.body.classList.remove('tex-collaboration-open');
          window.setTimeout(() => {
            if (opened) return;
            drawer.hidden = true;
            backdrop.hidden = true;
          }, 290);
          openButton.focus();
        }

        function syncDocument() {
          const id = activeDocumentId();
          openButton.disabled = !id;
          openButton.title = id ? labels.open : labels.noDocument;
          documentLabel.textContent = titleInput?.value?.trim() || id || labels.noDocument;
          snapshot = null;
          renderAvatars();
          if (opened) void loadSnapshot(true);
        }

        openButton.addEventListener('click', openDrawer);
        closeButton.addEventListener('click', closeDrawer);
        backdrop.addEventListener('click', closeDrawer);
        titleInput?.addEventListener('input', () => {
          if (opened) documentLabel.textContent = titleInput.value.trim() || activeDocumentId();
        });
        document.addEventListener('keydown', event => {
          if (event.key === 'Escape' && opened) closeDrawer();
        });

        const listObserver = documentList ? new MutationObserver(syncDocument) : null;
        listObserver?.observe(documentList, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'data-tex-document-id'] });
        window.addEventListener('pagehide', () => listObserver?.disconnect(), { once: true });
        syncDocument();
      })();
    </script>`;

  return output;
}
