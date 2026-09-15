export function enhanceWorkTexDesktopTypography(markup) {
  return String(markup || "") + `
    <style id="qsseda-work-tex-desktop-type">
      @media (min-width:761px){
        .tex-work-app .tex-shell{font-size:14px}

        .tex-work-app .tex-panel-head,
        .tex-work-app .tex-runs-head{padding-top:16px!important;padding-bottom:11px!important}
        .tex-work-app .tex-panel-head strong,
        .tex-work-app .tex-runs-head strong{
          font-size:14px!important;
          line-height:1.25!important;
          letter-spacing:-.012em!important;
        }
        .tex-work-app .tex-panel-head #tex-document-count{
          min-width:22px!important;
          height:22px!important;
          padding:0 6px!important;
          font-size:10.5px!important;
        }

        .tex-work-app .tex-create-row select,
        .tex-work-app .tex-editor-toolbar select{
          font-size:12.5px!important;
        }
        .tex-work-app .tex-search input{
          font-size:12.5px!important;
        }
        .tex-work-app .tex-search svg{
          width:15px!important;
          height:15px!important;
        }

        .tex-work-app .tex-document-item{
          gap:6px!important;
          padding:11px!important;
        }
        .tex-work-app .tex-document-item strong{
          font-size:13.5px!important;
          line-height:1.3!important;
        }
        .tex-work-app .tex-document-item p{
          font-size:11px!important;
          line-height:1.48!important;
        }
        .tex-work-app .tex-document-meta{
          font-size:10px!important;
          line-height:1.35!important;
        }
        .tex-work-app .tex-empty strong{
          font-size:13px!important;
          line-height:1.35!important;
        }
        .tex-work-app .tex-empty span{
          font-size:11px!important;
          line-height:1.5!important;
        }

        .tex-work-app .tex-start-surface{
          gap:22px!important;
        }
        .tex-work-app .tex-start-surface>.tex-start-mark{
          width:58px!important;
          height:58px!important;
          border-radius:18px!important;
          font-size:14px!important;
        }
        .tex-work-app .tex-start-surface>.tex-start-copy{
          gap:8px!important;
          width:min(100%,640px)!important;
        }
        .tex-work-app .tex-start-copy strong{
          font-size:24px!important;
          line-height:1.2!important;
          letter-spacing:-.035em!important;
        }
        .tex-work-app .tex-start-copy span{
          font-size:14px!important;
          line-height:1.58!important;
        }
        .tex-work-app .tex-start-surface>.tex-start-grid{
          width:min(100%,760px)!important;
          gap:12px!important;
        }
        .tex-work-app .tex-start-card{
          min-height:108px!important;
          padding:17px 18px!important;
          border-radius:16px!important;
          gap:7px!important;
        }
        .tex-work-app .tex-start-card b{
          font-size:14px!important;
          line-height:1.3!important;
        }
        .tex-work-app .tex-start-card span{
          font-size:11.5px!important;
          line-height:1.5!important;
        }
        .tex-work-app .tex-start-features{
          gap:16px!important;
        }
        .tex-work-app .tex-start-features span{
          font-size:10.5px!important;
          line-height:1.4!important;
        }

        .tex-work-app .tex-editor-toolbar>input{
          font-size:19px!important;
        }
        .tex-work-app .tex-editor-toolbar label span{
          font-size:10px!important;
        }
        .tex-work-app .tex-source-label{
          font-size:10px!important;
        }
        .tex-work-app #tex-source{
          font-size:15.5px!important;
          line-height:1.62!important;
        }
        .tex-work-app .tex-save-state{
          font-size:10.5px!important;
        }
        .tex-work-app .tex-editor-actions button{
          font-size:11.5px!important;
        }

        .tex-work-app .tex-live-preview-head>strong{
          font-size:14px!important;
          line-height:1.3!important;
        }
        .tex-work-app .tex-live-preview-toggle{
          font-size:11.5px!important;
        }
        .tex-work-app .tex-live-preview-status{
          font-size:11.5px!important;
          line-height:1.45!important;
        }
        .tex-work-app .tex-live-preview-placeholder{
          font-size:12px!important;
          line-height:1.55!important;
        }
        .tex-work-app .tex-live-preview-foot{
          font-size:10.5px!important;
          line-height:1.45!important;
        }

        .tex-work-app .tex-compiler-state strong{
          font-size:13.5px!important;
          line-height:1.35!important;
        }
        .tex-work-app .tex-compiler-card p{
          font-size:11.5px!important;
          line-height:1.55!important;
        }
        .tex-work-app .tex-compiler-card small{
          font-size:10.5px!important;
          line-height:1.5!important;
        }
        .tex-work-app .tex-connection-check{
          min-height:34px!important;
          padding:0 13px!important;
          font-size:11px!important;
        }

        .tex-work-app .tex-run-item strong,
        .tex-work-app .tex-run-top strong{
          font-size:12.5px!important;
          line-height:1.35!important;
        }
        .tex-work-app .tex-run-status{
          font-size:10.5px!important;
        }
        .tex-work-app .tex-run-meta{
          font-size:10px!important;
          line-height:1.4!important;
        }
        .tex-work-app .tex-run-error{
          font-size:10.5px!important;
          line-height:1.5!important;
        }
        .tex-work-app .tex-run-item a{
          font-size:11.5px!important;
        }

        .tex-work-app .tex-side-toggle{
          width:30px!important;
          min-width:30px!important;
          height:30px!important;
          min-height:30px!important;
          font-size:17px!important;
        }
      }

      @media (min-width:1081px){
        .tex-work-app .tex-shell{
          grid-template-columns:260px minmax(460px,1fr) minmax(390px,.82fr)!important;
        }
        .tex-work-app .tex-shell.is-left-collapsed{
          grid-template-columns:46px minmax(460px,1fr) minmax(390px,.82fr)!important;
        }
        .tex-work-app .tex-shell.is-right-collapsed{
          grid-template-columns:260px minmax(460px,1fr) 46px!important;
        }
        .tex-work-app .tex-shell.is-left-collapsed.is-right-collapsed{
          grid-template-columns:46px minmax(0,1fr) 46px!important;
        }
      }
    </style>
    <style id="qsseda-work-tex-collaboration-invite-refine">
      .tex-collaboration-invite{
        display:flex!important;
        align-items:stretch!important;
        width:100%!important;
        gap:9px!important;
      }
      .tex-collaboration-user-search{
        position:relative!important;
        flex:1 1 auto!important;
        width:auto!important;
        min-width:0!important;
        height:46px!important;
      }
      #tex-collaboration-username,
      #tex-collaboration-role,
      #tex-collaboration-add{
        box-sizing:border-box!important;
        height:46px!important;
        min-height:46px!important;
        margin:0!important;
        align-self:stretch!important;
      }
      #tex-collaboration-username{width:100%!important}
      #tex-collaboration-role{
        flex:0 0 112px!important;
        width:112px!important;
      }
      #tex-collaboration-add{
        flex:0 0 80px!important;
        width:80px!important;
        padding:0 12px!important;
        line-height:46px!important;
      }
      .tex-collaboration-search-results{
        top:53px!important;
        z-index:200!important;
      }
      @media(max-width:760px), (max-width:950px) and (pointer:coarse){
        .tex-collaboration-invite{gap:7px!important}
        #tex-collaboration-role{flex-basis:92px!important;width:92px!important}
        #tex-collaboration-add{flex-basis:70px!important;width:70px!important;padding:0 8px!important}
      }
    </style>
    <script id="qsseda-work-tex-collaboration-single-character-search">
      (() => {
        let attempts = 0;
        const init = () => {
          const root = document.querySelector('.tex-work-app[data-tex-root]');
          const username = document.getElementById('tex-collaboration-username');
          const results = document.getElementById('tex-collaboration-search-results');
          if (!root || !username || !results) {
            attempts += 1;
            if (attempts < 30) window.setTimeout(init, 50);
            return;
          }
          if (username.dataset.singleCharacterSearchReady === '1') return;
          username.dataset.singleCharacterSearchReady = '1';

          let timer = 0;
          let sequence = 0;
          const activeDocumentId = () => String(root.dataset.texCollaborationDocumentId || '').trim();
          const initials = person => {
            const source = String(person?.display_name || person?.username || '?').trim();
            return source ? source.slice(0, 2).toUpperCase() : '?';
          };
          const showState = text => {
            results.replaceChildren();
            const state = document.createElement('div');
            state.className = 'tex-collaboration-search-state';
            state.textContent = text;
            results.append(state);
            results.hidden = false;
          };
          const render = people => {
            results.replaceChildren();
            if (!Array.isArray(people) || !people.length) {
              showState(${JSON.stringify("没有找到相关用户")});
              return;
            }
            for (const person of people) {
              const option = document.createElement('button');
              option.type = 'button';
              option.className = 'tex-collaboration-search-result';
              option.setAttribute('role', 'option');

              const avatar = document.createElement('span');
              avatar.className = 'tex-collaboration-search-result-avatar';
              if (person?.avatar_url) {
                const image = document.createElement('img');
                image.src = person.avatar_url;
                image.alt = '';
                image.referrerPolicy = 'no-referrer';
                avatar.append(image);
              } else avatar.textContent = initials(person);

              const copy = document.createElement('span');
              copy.className = 'tex-collaboration-search-result-copy';
              const name = document.createElement('strong');
              name.textContent = person?.display_name || person?.username || '';
              const handle = document.createElement('span');
              handle.textContent = person?.username ? '@' + person.username : '';
              copy.append(name, handle);

              const meta = document.createElement('span');
              meta.className = 'tex-collaboration-search-result-meta';
              meta.textContent = '+';
              option.append(avatar, copy, meta);
              option.addEventListener('click', () => {
                username.value = String(person?.username || '');
                results.hidden = true;
                results.replaceChildren();
                document.getElementById('tex-collaboration-role')?.focus();
              });
              results.append(option);
            }
            results.hidden = false;
          };
          const searchOne = async () => {
            const documentId = activeDocumentId();
            const query = String(username.value || '').trim().replace(/^@+/, '');
            const current = ++sequence;
            if (!documentId || query.length !== 1) return;
            showState(${JSON.stringify("正在搜索用户…")});
            try {
              const response = await fetch('/api/tex/collaboration?action=search&document=' + encodeURIComponent(documentId) + '&q=' + encodeURIComponent(query), {
                credentials: 'same-origin',
                cache: 'no-store',
                headers: { Accept: 'application/json' }
              });
              const payload = await response.json().catch(() => ({}));
              if (current !== sequence || query !== String(username.value || '').trim().replace(/^@+/, '')) return;
              if (!response.ok) {
                showState(${JSON.stringify("无法搜索用户，请稍后重试。")});
                return;
              }
              render(payload?.results || []);
            } catch {
              if (current === sequence) showState(${JSON.stringify("无法搜索用户，请稍后重试。")});
            }
          };
          const schedule = () => {
            window.clearTimeout(timer);
            sequence += 1;
            const query = String(username.value || '').trim().replace(/^@+/, '');
            if (query.length !== 1) return;
            timer = window.setTimeout(searchOne, 180);
          };
          username.addEventListener('input', schedule);
          username.addEventListener('focus', schedule);
        };
        window.setTimeout(init, 0);
      })();
    </script>`;
}