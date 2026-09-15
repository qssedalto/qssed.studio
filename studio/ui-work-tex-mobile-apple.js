export function enhanceWorkTexMobileApple(markup, zh) {
  const templates = {
    blank: {
      title: zh ? "空白 TeX 文档" : "Blank TeX Document",
      engine: "xelatex",
      source: "\\documentclass{article}\n\\begin{document}\n\nHello, TeX!\n\n\\end{document}\n"
    },
    article: {
      title: zh ? "中文文章" : "Chinese Article",
      engine: "xelatex",
      source: "\\documentclass[12pt]{ctexart}\n\\usepackage{amsmath,amssymb}\n\\usepackage[a4paper,margin=2.5cm]{geometry}\n\\title{标题}\n\\author{}\n\\date{}\n\n\\begin{document}\n\\maketitle\n\n\\section{引言}\n在这里开始写作。\n\n\\end{document}\n"
    },
    math: {
      title: zh ? "数学笔记" : "Math Notes",
      engine: "xelatex",
      source: "\\documentclass[12pt]{ctexart}\n\\usepackage{amsmath,amssymb,mathtools}\n\\usepackage[a4paper,margin=2.4cm]{geometry}\n\\title{数学笔记}\n\\date{}\n\n\\begin{document}\n\\maketitle\n\n\\section{公式}\n\\[\n  e^{i\\pi}+1=0\n\\]\n\n\\end{document}\n"
    }
  };

  const labels = zh ? {
    creating: "正在创建",
    preparing: "正在准备编辑器…",
    opening: "正在打开编辑器…",
    failed: "创建失败",
    retry: "请再试一次"
  } : {
    creating: "Creating",
    preparing: "Preparing the editor…",
    opening: "Opening the editor…",
    failed: "Could not create document",
    retry: "Please try again"
  };

  return String(markup || "") + `
    <style id="qsseda-work-tex-mobile-apple-polish">
      @media (max-width:760px), (max-width:950px) and (pointer:coarse){
        :root{--tex-mobile-tabs-h:calc(52px + env(safe-area-inset-bottom,0px))}

        .tex-work-app .tex-editor-panel{position:relative!important}
        .tex-work-app .tex-start-surface{
          align-items:stretch!important;
          justify-content:flex-start!important;
          padding:calc(30px + env(safe-area-inset-top,0px)) 18px 28px!important;
          gap:0!important;
          background:var(--surface)!important;
          transform:translateX(0) scale(1);
          opacity:1;
          transition:transform .30s cubic-bezier(.22,1,.36,1),opacity .20s ease!important;
          will-change:transform,opacity;
        }
        .tex-work-app .tex-start-surface.is-leaving{
          pointer-events:none!important;
          transform:translateX(-18px) scale(.992)!important;
          opacity:0!important;
        }
        .tex-work-app .tex-start-surface>.tex-start-mark{
          align-self:flex-start!important;
          width:44px!important;
          height:44px!important;
          margin:0 0 18px!important;
          border-radius:13px!important;
          background:color-mix(in srgb,var(--primary) 8%,var(--fill))!important;
          box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 14%,var(--hairline))!important;
          font-size:12px!important;
        }
        .tex-work-app .tex-start-surface>.tex-start-copy{
          width:100%!important;
          max-width:none!important;
          gap:5px!important;
          text-align:left!important;
        }
        .tex-work-app .tex-start-copy strong{
          display:block!important;
          width:100%!important;
          text-align:left!important;
          font-size:22px!important;
          line-height:1.2!important;
          letter-spacing:-.035em!important;
        }
        .tex-work-app .tex-start-copy span{
          display:block!important;
          width:100%!important;
          max-width:34rem!important;
          text-align:left!important;
          font-size:13px!important;
          line-height:1.5!important;
        }
        .tex-work-app .tex-start-surface>.tex-start-grid{
          width:100%!important;
          max-width:none!important;
          grid-template-columns:1fr!important;
          justify-items:stretch!important;
          align-items:stretch!important;
          gap:10px!important;
          margin-top:20px!important;
        }
        .tex-work-app .tex-start-surface>.tex-start-grid>.tex-start-card{
          appearance:none!important;
          -webkit-appearance:none!important;
          display:flex!important;
          flex-direction:column!important;
          align-items:flex-start!important;
          justify-content:center!important;
          justify-self:stretch!important;
          width:100%!important;
          min-width:0!important;
          min-height:82px!important;
          margin:0!important;
          padding:15px 16px!important;
          border:0!important;
          border-radius:16px!important;
          text-align:left!important;
          background:var(--card)!important;
          color:var(--text)!important;
          box-shadow:inset 0 0 0 1px var(--hairline)!important;
          cursor:pointer!important;
          pointer-events:auto!important;
          touch-action:manipulation!important;
          transition:transform .18s cubic-bezier(.22,1,.36,1),background .16s ease,box-shadow .16s ease,opacity .18s ease!important;
          -webkit-tap-highlight-color:transparent!important;
        }
        .tex-work-app .tex-start-surface>.tex-start-grid>.tex-start-card:hover{
          transform:none!important;
          background:var(--card)!important;
          box-shadow:inset 0 0 0 1px var(--hairline)!important;
        }
        .tex-work-app .tex-start-surface>.tex-start-grid>.tex-start-card:active{
          transform:scale(.982)!important;
          background:color-mix(in srgb,var(--primary) 5%,var(--card))!important;
        }
        .tex-work-app .tex-start-surface>.tex-start-grid>.tex-start-card.is-selected{
          background:color-mix(in srgb,var(--primary) 7%,var(--card))!important;
          box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 38%,var(--hairline))!important;
          transform:scale(.985)!important;
        }
        .tex-work-app .tex-start-surface>.tex-start-grid>.tex-start-card[aria-disabled="true"]:not(.is-selected){opacity:.42!important}
        .tex-work-app .tex-start-surface>.tex-start-grid>.tex-start-card>b,
        .tex-work-app .tex-start-surface>.tex-start-grid>.tex-start-card>span{
          display:block!important;
          align-self:stretch!important;
          width:100%!important;
          min-width:0!important;
          margin:0!important;
          padding:0!important;
          text-align:left!important;
        }
        .tex-work-app .tex-start-surface>.tex-start-grid>.tex-start-card>b{
          font-size:15px!important;
          line-height:1.3!important;
          letter-spacing:-.012em!important;
        }
        .tex-work-app .tex-start-surface>.tex-start-grid>.tex-start-card>span{
          margin-top:5px!important;
          color:var(--muted)!important;
          font-size:12px!important;
          line-height:1.45!important;
        }
        .tex-work-app .tex-start-surface>.tex-start-features{
          width:100%!important;
          justify-content:flex-start!important;
          gap:8px 14px!important;
          margin-top:16px!important;
          padding:0 2px!important;
          color:var(--quiet)!important;
        }
        .tex-work-app .tex-start-features span{
          font-size:9px!important;
          line-height:1.35!important;
        }

        .tex-mobile-create-transition{
          position:absolute!important;
          inset:0!important;
          z-index:45!important;
          display:grid!important;
          place-items:center!important;
          padding:calc(24px + env(safe-area-inset-top,0px)) 28px 28px!important;
          background:color-mix(in srgb,var(--surface) 94%,transparent)!important;
          -webkit-backdrop-filter:blur(22px) saturate(145%);
          backdrop-filter:blur(22px) saturate(145%);
          opacity:0!important;
          transform:translateX(18px)!important;
          pointer-events:none!important;
          transition:opacity .20s ease,transform .30s cubic-bezier(.22,1,.36,1)!important;
        }
        .tex-mobile-create-transition.is-visible{
          opacity:1!important;
          transform:translateX(0)!important;
        }
        .tex-mobile-create-transition-card{
          display:grid!important;
          justify-items:center!important;
          gap:10px!important;
          width:min(100%,280px)!important;
          text-align:center!important;
        }
        .tex-mobile-create-transition-mark{
          position:relative!important;
          display:grid!important;
          place-items:center!important;
          width:52px!important;
          height:52px!important;
          border-radius:16px!important;
          background:color-mix(in srgb,var(--primary) 8%,var(--fill))!important;
          box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 18%,var(--hairline))!important;
          font:700 13px ui-monospace,SFMono-Regular,Menlo,monospace!important;
        }
        .tex-mobile-create-transition-mark::after{
          content:"";
          position:absolute;
          inset:-6px;
          border:2px solid transparent;
          border-top-color:var(--primary);
          border-right-color:color-mix(in srgb,var(--primary) 40%,transparent);
          border-radius:999px;
          animation:tex-mobile-create-spin .85s linear infinite;
        }
        .tex-mobile-create-transition strong{font-size:17px!important;letter-spacing:-.025em!important}
        .tex-mobile-create-transition span{color:var(--muted)!important;font-size:12px!important;line-height:1.45!important}
        .tex-mobile-create-error{
          display:none!important;
          margin-top:12px!important;
          padding:10px 12px!important;
          border-radius:12px!important;
          background:color-mix(in srgb,var(--danger) 9%,var(--fill))!important;
          color:var(--danger)!important;
          font-size:11px!important;
          line-height:1.45!important;
          text-align:left!important;
        }
        .tex-mobile-create-error.is-visible{display:block!important}
        @keyframes tex-mobile-create-spin{to{transform:rotate(360deg)}}

        .tex-work-app .tex-editor.tex-mobile-editor-enter{
          opacity:0!important;
          transform:translateX(22px)!important;
          will-change:transform,opacity;
        }
        .tex-work-app .tex-editor.tex-mobile-editor-enter.is-visible{
          opacity:1!important;
          transform:translateX(0)!important;
          transition:transform .34s cubic-bezier(.22,1,.36,1),opacity .22s ease!important;
        }

        .tex-work-app .tex-live-preview-viewport{
          height:calc(var(--tex-mobile-vh) - var(--tex-mobile-tabs-h) - 170px)!important;
        }

        .tex-mobile-tabs{
          height:var(--tex-mobile-tabs-h)!important;
          padding:2px 10px env(safe-area-inset-bottom,0px)!important;
          border-top:1px solid color-mix(in srgb,var(--hairline) 92%,transparent)!important;
          background:color-mix(in srgb,var(--surface) 84%,transparent)!important;
          -webkit-backdrop-filter:blur(26px) saturate(170%)!important;
          backdrop-filter:blur(26px) saturate(170%)!important;
          transition:transform .18s ease,opacity .14s ease!important;
        }
        .tex-mobile-tab{
          gap:1px!important;
          min-height:46px!important;
          padding:2px 4px!important;
          border-radius:10px!important;
          font-size:10px!important;
          font-weight:550!important;
          line-height:1.1!important;
        }
        .tex-mobile-tab svg{
          width:22px!important;
          height:22px!important;
          stroke-width:1.75!important;
        }
        .tex-mobile-tab[aria-selected="true"]{
          color:var(--primary)!important;
          font-weight:650!important;
          background:transparent!important;
        }
        .tex-mobile-tab[aria-selected="true"] svg{stroke-width:2!important}
        .tex-mobile-tab:active{background:color-mix(in srgb,var(--fill) 72%,transparent)!important}

        body.tex-mobile-keyboard-open .tex-work-app .tex-shell>.tex-documents-panel,
        body.tex-mobile-keyboard-open .tex-work-app .tex-shell>.tex-editor-panel,
        body.tex-mobile-keyboard-open .tex-work-app .tex-shell>.tex-runs-panel{
          bottom:0!important;
        }
        body.tex-mobile-keyboard-open .tex-mobile-tabs{
          opacity:0!important;
          pointer-events:none!important;
          transform:translateY(100%)!important;
        }

        @media (prefers-reduced-motion:reduce){
          .tex-work-app .tex-start-surface,
          .tex-mobile-create-transition,
          .tex-work-app .tex-editor.tex-mobile-editor-enter,
          .tex-work-app .tex-editor.tex-mobile-editor-enter.is-visible{
            transition:none!important;
            transform:none!important;
          }
          .tex-mobile-create-transition-mark::after{animation:none!important}
        }
      }
    </style>
    <script id="qsseda-work-tex-mobile-template-runtime">
      (() => {
        const media = window.matchMedia('(max-width:760px), (max-width:950px) and (pointer:coarse)');
        if (!media.matches) return;

        const templates = ${JSON.stringify(templates)};
        const labels = ${JSON.stringify(labels)};
        const enterKey = 'qsseda.work.tex.mobile-enter.v1';
        const panel = document.querySelector('.tex-work-app .tex-editor-panel');
        const surface = document.querySelector('.tex-work-app .tex-start-surface');
        const editor = document.getElementById('tex-editor');
        let busy = false;
        let transition = null;

        const ensureTransition = () => {
          if (transition || !panel) return transition;
          transition = document.createElement('div');
          transition.className = 'tex-mobile-create-transition';
          transition.setAttribute('aria-live', 'polite');
          transition.innerHTML = '<div class="tex-mobile-create-transition-card"><div class="tex-mobile-create-transition-mark">TeX</div><strong></strong><span></span><div class="tex-mobile-create-error"></div></div>';
          panel.append(transition);
          return transition;
        };

        const setTransition = (title, detail, visible = true) => {
          const layer = ensureTransition();
          if (!layer) return;
          layer.querySelector('strong').textContent = title || '';
          layer.querySelector('span').textContent = detail || '';
          layer.querySelector('.tex-mobile-create-error').classList.remove('is-visible');
          layer.classList.toggle('is-visible', visible);
        };

        const showError = message => {
          const layer = ensureTransition();
          if (!layer) return;
          layer.querySelector('strong').textContent = labels.failed;
          layer.querySelector('span').textContent = labels.retry;
          const error = layer.querySelector('.tex-mobile-create-error');
          error.textContent = message || labels.failed;
          error.classList.add('is-visible');
          layer.classList.add('is-visible');
        };

        const resetCards = () => {
          surface?.classList.remove('is-leaving');
          for (const card of document.querySelectorAll('[data-tex-start-template]')) {
            card.classList.remove('is-selected');
            card.removeAttribute('aria-disabled');
          }
        };

        const createTemplate = async button => {
          if (busy || !button) return;
          const key = button.dataset.texStartTemplate || 'blank';
          const payload = templates[key] || templates.blank;
          const label = button.querySelector('b')?.textContent?.trim() || payload.title;
          busy = true;

          for (const card of document.querySelectorAll('[data-tex-start-template]')) {
            card.setAttribute('aria-disabled', 'true');
          }
          button.classList.add('is-selected');
          setTransition(labels.creating + '“' + label + '”', labels.preparing, true);
          window.requestAnimationFrame(() => surface?.classList.add('is-leaving'));

          try {
            const response = await fetch('/api/tex/documents', {
              method: 'POST',
              credentials: 'same-origin',
              cache: 'no-store',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json;charset=UTF-8'
              },
              body: JSON.stringify(payload)
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || !data?.document?.id) {
              throw new Error(data?.error || ('HTTP ' + response.status));
            }

            try {
              window.sessionStorage.setItem(enterKey, JSON.stringify({
                id: data.document.id,
                label,
                at: Date.now()
              }));
              window.sessionStorage.setItem('qsseda.work.tex.mobile-pane.v1', 'editor');
            } catch {}

            setTransition(label, labels.opening, true);
            window.setTimeout(() => window.location.reload(), 180);
          } catch (error) {
            busy = false;
            resetCards();
            showError(String(error?.message || error || labels.failed));
            window.setTimeout(() => {
              transition?.classList.remove('is-visible');
            }, 2600);
          }
        };

        const intercept = event => {
          const button = event.target?.closest?.('[data-tex-start-template]');
          if (!button) return;
          if (event.type === 'pointerup' && event.pointerType === 'mouse') return;
          event.preventDefault();
          event.stopImmediatePropagation();
          if (!busy) void createTemplate(button);
        };

        document.addEventListener('pointerup', intercept, true);
        document.addEventListener('click', intercept, true);

        let pending = null;
        try {
          const value = JSON.parse(window.sessionStorage.getItem(enterKey) || 'null');
          if (value && Date.now() - Number(value.at || 0) < 15000) pending = value;
          else window.sessionStorage.removeItem(enterKey);
        } catch {}

        if (pending && editor) {
          const label = pending.label || '';
          setTransition(label, labels.opening, true);
          surface?.classList.add('is-leaving');
          editor.classList.add('tex-mobile-editor-enter');

          const reveal = () => {
            if (editor.hidden) return false;
            transition?.classList.remove('is-visible');
            window.requestAnimationFrame(() => {
              window.requestAnimationFrame(() => editor.classList.add('is-visible'));
            });
            window.setTimeout(() => {
              editor.classList.remove('tex-mobile-editor-enter', 'is-visible');
              surface?.classList.remove('is-leaving');
              try { window.sessionStorage.removeItem(enterKey); } catch {}
            }, 420);
            return true;
          };

          if (!reveal()) {
            const observer = new MutationObserver(() => {
              if (!reveal()) return;
              observer.disconnect();
            });
            observer.observe(editor, { attributes: true, attributeFilter: ['hidden'] });
            window.setTimeout(() => {
              observer.disconnect();
              reveal();
            }, 6000);
          }
        }
      })();
    </script>`;
}
