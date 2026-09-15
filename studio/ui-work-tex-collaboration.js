export function enhanceWorkTexCollaboration(markup, zh) {
  const copy = zh ? {
    open: "协作",
    title: "协作设置",
    close: "关闭协作设置",
    noDocument: "先打开一份 TeX 文档",
    members: "成员",
    membersDetail: "管理谁可以参与这份文档。成员设置会绑定到当前文档。",
    invite: "邀请成员",
    username: "用户名",
    viewer: "只读",
    editor: "可编辑",
    owner: "所有者",
    add: "添加",
    adding: "正在添加…",
    remove: "移除",
    removeConfirm: "确定从这份文档中移除该成员吗？",
    loading: "正在读取协作设置…",
    empty: "还没有其他协作者",
    error: "无法读取协作设置，请稍后重试。",
    searching: "正在搜索用户…",
    noMatches: "没有找到相关用户",
    searchHint: "输入至少 2 个字符搜索用户名",
    alreadyMember: "已在成员中",
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
    unavailable: "协作服务暂时不可用，请稍后重试。",
    previous: "上一步",
    next: "下一步",
    done: "完成",
    pageMembers: "成员与权限",
    pageLive: "实时协作",
    pageLinks: "链接共享"
  } : {
    open: "Collaborate",
    title: "Collaboration settings",
    close: "Close collaboration settings",
    noDocument: "Open a TeX document first",
    members: "People",
    membersDetail: "Manage who can participate in this document. Membership is scoped to the active document.",
    invite: "Invite people",
    username: "Username",
    viewer: "Viewer",
    editor: "Editor",
    owner: "Owner",
    add: "Add",
    adding: "Adding…",
    remove: "Remove",
    removeConfirm: "Remove this person from the document?",
    loading: "Loading collaboration settings…",
    empty: "No other collaborators yet",
    error: "Could not load collaboration settings. Please try again.",
    searching: "Searching users…",
    noMatches: "No matching users",
    searchHint: "Type at least 2 characters to search usernames",
    alreadyMember: "Already a member",
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
    unavailable: "Collaboration is temporarily unavailable. Please try again.",
    previous: "Back",
    next: "Next",
    done: "Done",
    pageMembers: "People & access",
    pageLive: "Live collaboration",
    pageLinks: "Link sharing"
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
        appearance:none!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;
        flex:0 0 auto!important;width:auto!important;min-width:94px!important;height:40px!important;min-height:40px!important;margin:0!important;padding:0 14px!important;
        border:0!important;border-radius:12px!important;background:var(--fill)!important;color:var(--text)!important;
        box-shadow:inset 0 0 0 1px var(--border)!important;font-size:12px!important;font-weight:700!important;white-space:nowrap!important;
        cursor:pointer!important;transition:background .16s ease,box-shadow .16s ease,transform .16s ease,opacity .16s ease!important
      }
      .tex-work-app .tex-collaboration-button:hover:not(:disabled){background:var(--card)!important;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 30%,var(--border))!important}
      .tex-work-app .tex-collaboration-button:active:not(:disabled){transform:scale(.97)}
      .tex-work-app .tex-collaboration-button:disabled{opacity:.38!important;cursor:not-allowed!important}
      .tex-work-app .tex-collaboration-button svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round}
      .tex-collaboration-avatars{display:flex;align-items:center;margin-left:1px}
      .tex-collaboration-avatar-dot{display:grid;place-items:center;width:21px;height:21px;margin-left:-5px;border:2px solid var(--fill);border-radius:50%;background:var(--surface);color:var(--muted);font-size:8px;font-weight:800;overflow:hidden}
      .tex-collaboration-avatar-dot:first-child{margin-left:0}.tex-collaboration-avatar-dot img{width:100%;height:100%;object-fit:cover}

      body.tex-collaboration-open{overflow:hidden!important}
      .tex-collaboration-backdrop{position:fixed;inset:0;z-index:2147482000;background:rgba(0,0,0,.20);opacity:0;pointer-events:none;transition:opacity .2s ease}
      .tex-collaboration-backdrop.is-open{opacity:1;pointer-events:auto}
      .tex-collaboration-drawer{position:fixed;top:10px;right:10px;bottom:10px;z-index:2147482001;display:flex;flex-direction:column;width:min(520px,calc(100vw - 28px));min-width:0;overflow:hidden;border-radius:24px;background:color-mix(in srgb,var(--surface) 97%,transparent);box-shadow:0 24px 80px rgba(0,0,0,.22),inset 0 0 0 1px var(--border);-webkit-backdrop-filter:blur(26px) saturate(155%);backdrop-filter:blur(26px) saturate(155%);transform:translateX(calc(100% + 20px));transition:transform .28s cubic-bezier(.22,1,.36,1)}
      .tex-collaboration-drawer.is-open{transform:translateX(0)}
      .tex-collaboration-drawer-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:24px 24px 17px;border-bottom:1px solid var(--hairline)}
      .tex-collaboration-heading{display:grid;gap:6px;min-width:0}.tex-collaboration-heading strong{font-size:24px;line-height:1.2;letter-spacing:-.03em}.tex-collaboration-heading span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted);font-size:14px}
      .tex-collaboration-close{display:grid;place-items:center;width:44px;height:44px;min-width:44px;margin:0;padding:0;border:0;border-radius:14px;background:var(--fill);color:var(--muted);box-shadow:inset 0 0 0 1px var(--border);font-size:25px;line-height:1;cursor:pointer}.tex-collaboration-close:hover{color:var(--text);background:var(--card)}

      .tex-collaboration-stepper{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;padding:12px 14px;border-bottom:1px solid var(--hairline);background:color-mix(in srgb,var(--fill) 48%,transparent)}
      .tex-collaboration-step{display:flex;align-items:center;justify-content:center;gap:7px;min-width:0;height:42px;padding:0 10px;border:0;border-radius:13px;background:transparent;color:var(--muted);font-size:11px;font-weight:700;white-space:nowrap;cursor:pointer;transition:background .16s ease,color .16s ease,box-shadow .16s ease,transform .16s ease}
      .tex-collaboration-step:hover{background:color-mix(in srgb,var(--surface) 72%,transparent);color:var(--text)}
      .tex-collaboration-step:active{transform:scale(.98)}
      .tex-collaboration-step.is-active{background:var(--surface);color:var(--text);box-shadow:0 1px 4px rgba(0,0,0,.06),inset 0 0 0 1px var(--border)}
      .tex-collaboration-step-index{display:grid;place-items:center;width:22px;height:22px;min-width:22px;border-radius:999px;background:var(--fill);color:var(--muted);font-size:10px;font-weight:800;transition:background .16s ease,color .16s ease}
      .tex-collaboration-step.is-active .tex-collaboration-step-index{background:var(--primary);color:#fff}
      .tex-collaboration-step-label{overflow:hidden;text-overflow:ellipsis}

      .tex-collaboration-pages{position:relative;flex:1;min-height:0;overflow:hidden}
      .tex-collaboration-page{height:100%;overflow:auto;overscroll-behavior:contain;padding:22px 22px 28px}.tex-collaboration-page[hidden]{display:none!important}
      .tex-collaboration-section{display:grid;gap:16px;padding:20px;border-radius:20px;background:var(--card);box-shadow:inset 0 0 0 1px var(--hairline)}
      .tex-collaboration-section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.tex-collaboration-section-head>div{display:grid;gap:7px}.tex-collaboration-section-head strong{font-size:17px;letter-spacing:-.015em}.tex-collaboration-section-head span{color:var(--muted);font-size:13px;line-height:1.55}
      .tex-collaboration-count{display:grid;place-items:center;min-width:34px;height:28px;padding:0 9px;border-radius:999px;background:var(--fill);color:var(--muted);font-size:12px;font-weight:750}
      .tex-collaboration-state{display:flex;align-items:flex-start;gap:12px;padding:15px;border-radius:15px;background:var(--fill)}.tex-collaboration-state-dot{width:9px;height:9px;margin-top:5px;border-radius:50%;background:var(--primary);flex:0 0 auto}.tex-collaboration-state>div{display:grid;gap:5px;min-width:0}.tex-collaboration-state strong{font-size:14px}.tex-collaboration-state span{color:var(--muted);font-size:12px;line-height:1.55}

      .tex-collaboration-invite{display:grid;grid-template-columns:minmax(0,1fr) 112px 80px;align-items:start;gap:9px}
      .tex-collaboration-user-search{position:relative;min-width:0}
      .tex-collaboration-invite input,.tex-collaboration-invite select,.tex-collaboration-member select{width:100%;min-width:0;height:44px;margin:0;padding:0 12px;border:0;border-radius:12px;background:var(--fill);color:var(--text);box-shadow:inset 0 0 0 1px var(--border);font-size:13px;outline:none}
      .tex-collaboration-invite input:focus,.tex-collaboration-invite select:focus,.tex-collaboration-member select:focus{box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 10%,transparent),inset 0 0 0 1px color-mix(in srgb,var(--primary) 60%,var(--border))}
      .tex-collaboration-invite button,.tex-collaboration-remove{appearance:none;border:0;border-radius:12px;background:var(--primary);color:#fff;font-size:13px;font-weight:750;cursor:pointer}.tex-collaboration-invite>button{height:44px}.tex-collaboration-invite button:disabled{opacity:.45;cursor:not-allowed}

      .tex-collaboration-search-results{position:absolute;top:calc(100% + 7px);left:0;right:0;z-index:30;display:grid;gap:4px;max-height:260px;padding:6px;overflow:auto;border-radius:14px;background:var(--surface);box-shadow:0 18px 46px rgba(0,0,0,.16),inset 0 0 0 1px var(--border)}
      .tex-collaboration-search-results[hidden]{display:none!important}
      .tex-collaboration-search-state{padding:12px 11px;color:var(--muted);font-size:12px;line-height:1.4}
      .tex-collaboration-search-result{display:grid;grid-template-columns:38px minmax(0,1fr) auto;align-items:center;gap:10px;width:100%;min-width:0;padding:8px;border:0;border-radius:10px;background:transparent;color:var(--text);text-align:left;cursor:pointer}
      .tex-collaboration-search-result:hover,.tex-collaboration-search-result:focus-visible{outline:none;background:var(--fill)}
      .tex-collaboration-search-result-avatar{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;overflow:hidden;background:color-mix(in srgb,var(--primary) 9%,var(--surface));color:var(--primary);font-size:11px;font-weight:800}.tex-collaboration-search-result-avatar img{width:100%;height:100%;object-fit:cover}
      .tex-collaboration-search-result-copy{display:grid;gap:2px;min-width:0}.tex-collaboration-search-result-copy strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}.tex-collaboration-search-result-copy span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted);font-size:11px}
      .tex-collaboration-search-result-meta{padding:5px 7px;border-radius:999px;background:var(--fill);color:var(--quiet);font-size:9px;font-weight:750;white-space:nowrap}

      .tex-collaboration-list{display:grid;gap:9px}.tex-collaboration-member{display:grid;grid-template-columns:42px minmax(0,1fr) 96px 60px;align-items:center;gap:10px;padding:11px;border-radius:14px;background:var(--fill)}.tex-collaboration-member.is-owner{grid-template-columns:42px minmax(0,1fr) 96px}
      .tex-collaboration-member-avatar{display:grid;place-items:center;width:42px;height:42px;border-radius:50%;overflow:hidden;background:color-mix(in srgb,var(--primary) 9%,var(--surface));color:var(--primary);font-size:12px;font-weight:800}.tex-collaboration-member-avatar img{width:100%;height:100%;object-fit:cover}
      .tex-collaboration-member-copy{display:grid;gap:3px;min-width:0}.tex-collaboration-member-copy strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}.tex-collaboration-member-copy span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted);font-size:11px}
      .tex-collaboration-role-pill{display:grid;place-items:center;height:34px;padding:0 10px;border-radius:10px;background:var(--surface);color:var(--muted);font-size:11px;font-weight:700}
      .tex-collaboration-remove{height:34px;padding:0 9px;background:color-mix(in srgb,var(--danger) 10%,var(--fill));color:var(--danger);font-size:11px}.tex-collaboration-remove:hover{background:color-mix(in srgb,var(--danger) 15%,var(--fill))}
      .tex-collaboration-empty{padding:22px 10px;text-align:center;color:var(--muted);font-size:13px}.tex-collaboration-note{color:var(--quiet);font-size:11px;line-height:1.55}
      .tex-collaboration-message{display:none;padding:12px 13px;border-radius:12px;background:var(--fill);color:var(--muted);font-size:12px;line-height:1.5}.tex-collaboration-message.is-visible{display:block}.tex-collaboration-message.is-error{background:color-mix(in srgb,var(--danger) 8%,var(--fill));color:var(--danger)}
      .tex-collaboration-disabled-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px;border-radius:14px;background:var(--fill);opacity:.76}.tex-collaboration-disabled-row>div{display:grid;gap:5px}.tex-collaboration-disabled-row strong{font-size:13px}.tex-collaboration-disabled-row span{color:var(--muted);font-size:11px;line-height:1.45}.tex-collaboration-disabled-badge{flex:0 0 auto;padding:6px 9px;border-radius:999px;background:var(--surface);color:var(--quiet);font-size:10px;font-weight:750}
      .tex-collaboration-footer{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:10px;padding:14px 18px;border-top:1px solid var(--hairline);background:color-mix(in srgb,var(--surface) 96%,transparent)}
      .tex-collaboration-footer-status{color:var(--muted);font-size:11px}.tex-collaboration-nav-button{height:40px;min-width:88px;padding:0 14px;border:0;border-radius:12px;background:var(--fill);color:var(--text);box-shadow:inset 0 0 0 1px var(--border);font-size:12px;font-weight:700;cursor:pointer}.tex-collaboration-nav-button.is-primary{background:var(--primary);color:#fff;box-shadow:none}.tex-collaboration-nav-button:disabled{opacity:.35;cursor:not-allowed}

      @media(max-width:760px), (max-width:950px) and (pointer:coarse){
        .tex-work-app .tex-editor-toolbar{align-items:stretch!important}
        .tex-work-app .tex-collaboration-button{width:100%!important;min-width:0!important}
        .tex-collaboration-drawer{top:auto;left:6px;right:6px;bottom:6px;width:auto;max-height:calc(100dvh - 12px);border-radius:24px;transform:translateY(calc(100% + 14px))}.tex-collaboration-drawer.is-open{transform:translateY(0)}
        .tex-collaboration-drawer-head{padding:20px 18px 14px}.tex-collaboration-heading strong{font-size:22px}.tex-collaboration-heading span{font-size:13px}
        .tex-collaboration-stepper{gap:5px;padding:10px}.tex-collaboration-step{height:40px;gap:5px;padding:0 6px;font-size:10px}.tex-collaboration-step-index{width:20px;height:20px;min-width:20px;font-size:9px}
        .tex-collaboration-page{padding:16px 14px 22px}.tex-collaboration-section{padding:17px}
        .tex-collaboration-invite{grid-template-columns:minmax(0,1fr) 88px 64px;gap:7px}.tex-collaboration-invite>button{grid-column:auto;height:44px}.tex-collaboration-invite input,.tex-collaboration-invite select{font-size:12px;padding:0 10px}.tex-collaboration-invite>button{font-size:12px}
        .tex-collaboration-member{grid-template-columns:42px minmax(0,1fr) 92px}.tex-collaboration-member:not(.is-owner) .tex-collaboration-remove{grid-column:2/-1;width:100%;height:36px}.tex-collaboration-member.is-owner{grid-template-columns:42px minmax(0,1fr) 88px}
        .tex-collaboration-footer{grid-template-columns:1fr 1fr;padding:12px}.tex-collaboration-footer-status{grid-column:1/-1;text-align:center}.tex-collaboration-nav-button{width:100%}
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
        let pageIndex = 0;
        let searchTimer = 0;
        let searchSequence = 0;

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
          '<nav class="tex-collaboration-stepper" aria-label="' + labels.title + '">' +
            '<button class="tex-collaboration-step is-active" type="button" data-page-index="0"><span class="tex-collaboration-step-index">1</span><span class="tex-collaboration-step-label">' + labels.pageMembers + '</span></button>' +
            '<button class="tex-collaboration-step" type="button" data-page-index="1"><span class="tex-collaboration-step-index">2</span><span class="tex-collaboration-step-label">' + labels.pageLive + '</span></button>' +
            '<button class="tex-collaboration-step" type="button" data-page-index="2"><span class="tex-collaboration-step-index">3</span><span class="tex-collaboration-step-label">' + labels.pageLinks + '</span></button>' +
          '</nav>' +
          '<div class="tex-collaboration-pages">' +
            '<section class="tex-collaboration-page" data-page="members">' +
              '<div class="tex-collaboration-section">' +
                '<div class="tex-collaboration-section-head"><div><strong>' + labels.members + '</strong><span>' + labels.membersDetail + '</span></div><span id="tex-collaboration-count" class="tex-collaboration-count">0</span></div>' +
                '<form id="tex-collaboration-invite" class="tex-collaboration-invite">' +
                  '<div class="tex-collaboration-user-search">' +
                    '<input id="tex-collaboration-username" type="text" autocomplete="off" spellcheck="false" placeholder="' + labels.username + '" aria-label="' + labels.username + '" aria-autocomplete="list" aria-controls="tex-collaboration-search-results">' +
                    '<div id="tex-collaboration-search-results" class="tex-collaboration-search-results" role="listbox" hidden></div>' +
                  '</div>' +
                  '<select id="tex-collaboration-role" aria-label="' + labels.invite + '"><option value="editor">' + labels.editor + '</option><option value="viewer">' + labels.viewer + '</option></select>' +
                  '<button id="tex-collaboration-add" type="submit">' + labels.add + '</button>' +
                '</form>' +
                '<div id="tex-collaboration-message" class="tex-collaboration-message"></div>' +
                '<div id="tex-collaboration-list" class="tex-collaboration-list"></div>' +
                '<div class="tex-collaboration-note">' + labels.permissionHint + '</div>' +
              '</div>' +
            '</section>' +
            '<section class="tex-collaboration-page" data-page="live" hidden>' +
              '<div class="tex-collaboration-section">' +
                '<div class="tex-collaboration-section-head"><div><strong>' + labels.liveTitle + '</strong></div></div>' +
                '<div class="tex-collaboration-state"><span class="tex-collaboration-state-dot"></span><div><strong>' + labels.livePreparing + '</strong><span>' + labels.liveDetail + '</span></div></div>' +
                '<div class="tex-collaboration-disabled-row"><div><strong>' + labels.remoteCursor + '</strong><span>' + labels.remoteCursorDetail + '</span></div><span class="tex-collaboration-disabled-badge">CRDT</span></div>' +
                '<div class="tex-collaboration-disabled-row"><div><strong>' + labels.follow + '</strong><span>' + labels.followDetail + '</span></div><span class="tex-collaboration-disabled-badge">Yjs</span></div>' +
              '</div>' +
            '</section>' +
            '<section class="tex-collaboration-page" data-page="links" hidden>' +
              '<div class="tex-collaboration-section">' +
                '<div class="tex-collaboration-section-head"><div><strong>' + labels.linkTitle + '</strong><span>' + labels.linkDetail + '</span></div></div>' +
                '<div class="tex-collaboration-disabled-row"><div><strong>' + labels.linkPreparing + '</strong><span>' + labels.shareAfter + '</span></div><span class="tex-collaboration-disabled-badge">OFF</span></div>' +
              '</div>' +
            '</section>' +
          '</div>' +
          '<div class="tex-collaboration-footer">' +
            '<span id="tex-collaboration-footer-status" class="tex-collaboration-footer-status"></span>' +
            '<button id="tex-collaboration-prev" class="tex-collaboration-nav-button" type="button">' + labels.previous + '</button>' +
            '<button id="tex-collaboration-next" class="tex-collaboration-nav-button is-primary" type="button">' + labels.next + '</button>' +
          '</div>';
        document.body.append(backdrop, drawer);

        const closeButton = drawer.querySelector('.tex-collaboration-close');
        const documentLabel = drawer.querySelector('#tex-collaboration-document');
        const footerStatus = drawer.querySelector('#tex-collaboration-footer-status');
        const pages = Array.from(drawer.querySelectorAll('.tex-collaboration-page'));
        const steps = Array.from(drawer.querySelectorAll('.tex-collaboration-step'));
        const previousButton = drawer.querySelector('#tex-collaboration-prev');
        const nextButton = drawer.querySelector('#tex-collaboration-next');
        const count = drawer.querySelector('#tex-collaboration-count');
        const form = drawer.querySelector('#tex-collaboration-invite');
        const searchWrap = drawer.querySelector('.tex-collaboration-user-search');
        const username = drawer.querySelector('#tex-collaboration-username');
        const searchResults = drawer.querySelector('#tex-collaboration-search-results');
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

        function setPage(nextIndex) {
          pageIndex = Math.max(0, Math.min(pages.length - 1, Number(nextIndex) || 0));
          pages.forEach((page, index) => { page.hidden = index !== pageIndex; if (index === pageIndex) page.scrollTop = 0; });
          steps.forEach((step, index) => {
            const active = index === pageIndex;
            step.classList.toggle('is-active', active);
            if (active) step.setAttribute('aria-current', 'step');
            else step.removeAttribute('aria-current');
          });
          footerStatus.textContent = (pageIndex + 1) + ' / ' + pages.length;
          previousButton.disabled = pageIndex === 0;
          nextButton.textContent = pageIndex === pages.length - 1 ? labels.done : labels.next;
          if (pageIndex !== 0) hideSearchResults();
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

        function friendlyError(error) {
          const text = String(error?.message || '').trim();
          if (!text) return labels.error;
          if (/UNION|INTERSECT|EXCEPT|ORDER BY|PGRST|postgres|syntax error/i.test(text)) return labels.unavailable;
          return text;
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

        function isExistingMember(person) {
          const handle = String(person?.username || '').toLowerCase();
          if (!handle) return false;
          return Array.isArray(snapshot?.participants) && snapshot.participants.some(item => String(item?.username || '').toLowerCase() === handle);
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

        function hideSearchResults() {
          searchResults.hidden = true;
          searchResults.replaceChildren();
        }

        function showSearchState(text) {
          searchResults.replaceChildren();
          const state = document.createElement('div');
          state.className = 'tex-collaboration-search-state';
          state.textContent = text;
          searchResults.append(state);
          searchResults.hidden = false;
        }

        function renderSearchResults(results) {
          searchResults.replaceChildren();
          if (!Array.isArray(results) || !results.length) {
            showSearchState(labels.noMatches);
            return;
          }
          for (const person of results) {
            const option = document.createElement('button');
            option.type = 'button';
            option.className = 'tex-collaboration-search-result';
            option.setAttribute('role', 'option');
            option.append(makeAvatar(person, 'tex-collaboration-search-result-avatar'));

            const copyNode = document.createElement('span');
            copyNode.className = 'tex-collaboration-search-result-copy';
            const name = document.createElement('strong');
            name.textContent = person.display_name || person.username;
            const handle = document.createElement('span');
            handle.textContent = '@' + person.username;
            copyNode.append(name, handle);
            option.append(copyNode);

            const meta = document.createElement('span');
            meta.className = 'tex-collaboration-search-result-meta';
            meta.textContent = isExistingMember(person) ? labels.alreadyMember : '+';
            option.append(meta);

            option.addEventListener('click', () => {
              username.value = person.username;
              hideSearchResults();
              role.focus();
            });
            searchResults.append(option);
          }
          searchResults.hidden = false;
        }

        async function searchUsers(rawQuery) {
          const id = activeDocumentId();
          const query = String(rawQuery || '').trim().replace(/^@+/, '');
          const sequence = ++searchSequence;
          if (!id || query.length < 2) {
            hideSearchResults();
            return;
          }
          showSearchState(labels.searching);
          try {
            const data = await api('/api/tex/collaboration?action=search&document=' + encodeURIComponent(id) + '&q=' + encodeURIComponent(query));
            if (sequence !== searchSequence || query !== String(username.value || '').trim().replace(/^@+/, '')) return;
            renderSearchResults(data?.results || []);
          } catch (error) {
            if (sequence !== searchSequence) return;
            showSearchState(friendlyError(error));
          }
        }

        function scheduleSearch() {
          window.clearTimeout(searchTimer);
          const query = String(username.value || '').trim().replace(/^@+/, '');
          if (query.length < 2) {
            hideSearchResults();
            return;
          }
          searchTimer = window.setTimeout(() => void searchUsers(query), 280);
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
            showMessage(friendlyError(error), true);
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
            showMessage(friendlyError(error), true);
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
            showMessage(friendlyError(error), true);
            button.disabled = false;
          }
        }

        form.addEventListener('submit', async event => {
          event.preventDefault();
          const id = activeDocumentId();
          const handle = username.value.trim();
          if (!id || !handle || loading) return;
          hideSearchResults();
          setBusy(true);
          add.textContent = labels.adding;
          showMessage('');
          try {
            snapshot = await api('/api/tex/collaboration', { method: 'POST', body: JSON.stringify({ document_id: id, username: handle, role: role.value }) });
            username.value = '';
            showMessage(labels.saved);
            renderParticipants();
          } catch (error) {
            showMessage(friendlyError(error), true);
          } finally {
            add.textContent = labels.add;
            setBusy(false);
          }
        });

        function openDrawer() {
          if (!activeDocumentId()) return;
          opened = true;
          setPage(0);
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
          window.clearTimeout(searchTimer);
          searchSequence += 1;
          hideSearchResults();
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
          username.value = '';
          hideSearchResults();
          renderAvatars();
          if (opened) void loadSnapshot(true);
        }

        openButton.addEventListener('click', openDrawer);
        closeButton.addEventListener('click', closeDrawer);
        backdrop.addEventListener('click', closeDrawer);
        previousButton.addEventListener('click', () => setPage(pageIndex - 1));
        nextButton.addEventListener('click', () => {
          if (pageIndex >= pages.length - 1) closeDrawer();
          else setPage(pageIndex + 1);
        });
        steps.forEach(step => step.addEventListener('click', () => setPage(Number(step.dataset.pageIndex || 0))));
        username.addEventListener('input', scheduleSearch);
        username.addEventListener('focus', () => {
          const query = String(username.value || '').trim().replace(/^@+/, '');
          if (query.length >= 2) scheduleSearch();
        });
        drawer.addEventListener('pointerdown', event => {
          if (!searchWrap.contains(event.target)) hideSearchResults();
        });
        titleInput?.addEventListener('input', () => {
          if (opened) documentLabel.textContent = titleInput.value.trim() || activeDocumentId();
        });
        document.addEventListener('keydown', event => {
          if (event.key === 'Escape' && !searchResults.hidden) {
            hideSearchResults();
            username.focus();
            return;
          }
          if (event.key === 'Escape' && opened) closeDrawer();
        });

        const listObserver = documentList ? new MutationObserver(syncDocument) : null;
        listObserver?.observe(documentList, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'data-tex-document-id'] });
        window.addEventListener('pagehide', () => listObserver?.disconnect(), { once: true });
        setPage(0);
        syncDocument();
      })();
    </script>`;

  return output;
}
