/**
 * 【初学者导读】
 * 文件：studio/ui-work-tex-mobile-apple.js
 * 这是 AERTEX Work/TeX 前端模块（work-tex-mobile-apple）。这组文件把编辑器、预览、协作、移动端适配或性能优化拆成多个小模块，避免一个超大文件承担全部职责。
 * 阅读顺序：先找本文件 export 的安装/初始化函数，再看它接收的 editor/state/session 参数；之后沿事件监听、缓存和 DOM 更新理解副作用。
 * 初学者重点：编辑器状态、服务器版本、协作会话和预览缓存是不同层次的数据；修改其中一层时不要假设其他层会自动同步。
 * 修改注意：协作/实时模块尤其要考虑乱序消息、重复消息、断线重连和旧版本客户端；性能优化模块不能以牺牲正确性为代价。
 * 调试方法：先区分“编辑器内容错”“预览错”“协作同步错”“移动布局错”，再进入对应模块，不要在整个 Work 链路里盲查。
 */
// Apple 风格移动端过渡增强：处理面板打开/关闭动画和过渡遮罩，仅影响视觉状态，不持有文档业务数据。\nexport function enhanceWorkTexMobileApple(markup, zh) {
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

        /* The base TeX layout still caps this panel at 330px on phones.
           Work uses a full-height tab instead, so remove that legacy cap. */
        .tex-work-app .tex-shell>.tex-documents-panel,
        .tex-work-app .tex-shell>.tex-runs-panel{
          max-height:none!important;
        }
        .tex-work-app .tex-documents-panel{
          overflow:hidden!important;
        }
        .tex-work-app .tex-document-list{
          flex:1 1 auto!important;
          min-height:0!important;
          overflow-x:hidden!important;
          overflow-y:auto!important;
          overscroll-behavior:contain!important;
          -webkit-overflow-scrolling:touch!important;
          padding:0 10px calc(22px + env(safe-area-inset-bottom,0px))!important;
        }
        .tex-work-app #tex-documents-empty{
          flex:1 1 auto!important;
          min-height:0!important;
          align-content:start!important;
        }

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
          transform:scale(.985)!important;
          background:color-mix(in srgb,var(--primary) 7%,var(--card))!important;
          box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary) 38%,var(--hairline))!important;
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
        .tex-mobile-tab svg{width:22px!important;height:22px!important;stroke-width:1.75!important}
        .tex-mobile-tab[aria-selected="true"]{color:var(--primary)!important;font-weight:650!important;background:transparent!important}
        .tex-mobile-tab[aria-selected="true"] svg{stroke-width:2!important}
        .tex-mobile-tab:active{background:color-mix(in srgb,var(--fill) 72%,transparent)!important}

        body.tex-mobile-keyboard-open .tex-work-app .tex-shell>.tex-documents-panel,
        body.tex-mobile-keyboard-open .tex-work-app .tex-shell>.tex-editor-panel,
        body.tex-mobile-keyboard-open .tex-work-app .tex-shell>.tex-runs-panel{bottom:0!important}
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

        const labels = ${JSON.stringify(labels)};
        const panel = document.querySelector('.tex-work-app .tex-editor-panel');
        const surface = document.querySelector('.tex-work-app .tex-start-surface');
        const editor = document.getElementById('tex-editor');
        const template = document.getElementById('tex-template');
        const create = document.getElementById('tex-create');
        const message = document.getElementById('tex-message');
        let busy = false;
        let transition = null;
        let lastPointerButton = null;
        let lastPointerAt = 0;

        // 确保转场层只创建一次；重复进入页面或重新初始化时复用现有节点，避免叠加多个全屏遮罩。\n  const ensureTransition = () => {
          if (transition || !panel) return transition;
          transition = document.createElement('div');
          transition.className = 'tex-mobile-create-transition';
          transition.setAttribute('aria-live', 'polite');
          transition.innerHTML = '<div class="tex-mobile-create-transition-card"><div class="tex-mobile-create-transition-mark">TeX</div><strong></strong><span></span><div class="tex-mobile-create-error"></div></div>';
          panel.append(transition);
          return transition;
        };

        const setTransition = (title, detail) => {
          const layer = ensureTransition();
          if (!layer) return;
          layer.querySelector('strong').textContent = title || '';
          layer.querySelector('span').textContent = detail || '';
          layer.querySelector('.tex-mobile-create-error').classList.remove('is-visible');
          layer.classList.add('is-visible');
        };

        const showError = errorText => {
          const layer = ensureTransition();
          if (!layer) return;
          layer.querySelector('strong').textContent = labels.failed;
          layer.querySelector('span').textContent = labels.retry;
          const error = layer.querySelector('.tex-mobile-create-error');
          error.textContent = errorText || labels.failed;
          error.classList.add('is-visible');
          layer.classList.add('is-visible');
        };

        const reset = () => {
          busy = false;
          surface?.classList.remove('is-leaving');
          editor?.classList.remove('tex-mobile-editor-enter', 'is-visible');
          for (const card of document.querySelectorAll('[data-tex-start-template]')) {
            card.classList.remove('is-selected');
            card.removeAttribute('aria-disabled');
          }
        };

        const finishOpen = () => {
          if (!editor || editor.hidden) return false;
          document.querySelector('.tex-mobile-tab[data-mobile-pane="editor"]')?.click();
          if (transition) transition.classList.remove('is-visible');
          window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => editor.classList.add('is-visible'));
          });
          window.setTimeout(() => {
            editor.classList.remove('tex-mobile-editor-enter', 'is-visible');
            surface?.classList.remove('is-leaving');
            busy = false;
            for (const card of document.querySelectorAll('[data-tex-start-template]')) {
              card.classList.remove('is-selected');
              card.removeAttribute('aria-disabled');
            }
          }, 420);
          return true;
        };

        const createTemplate = button => {
          if (busy || !button || !template || !create || !editor) return;
          busy = true;
          const key = button.dataset.texStartTemplate || 'blank';
          const label = button.querySelector('b')?.textContent?.trim() || key;

          for (const card of document.querySelectorAll('[data-tex-start-template]')) {
            card.setAttribute('aria-disabled', 'true');
          }
          button.classList.add('is-selected');
          editor.classList.add('tex-mobile-editor-enter');
          setTransition(labels.creating + '“' + label + '”', labels.preparing);
          window.requestAnimationFrame(() => surface?.classList.add('is-leaving'));

          template.value = key;
          template.dispatchEvent(new Event('change', { bubbles: true }));

          let settled = false;
          let editorObserver = null;
          let messageObserver = null;
          const cleanup = () => {
            editorObserver?.disconnect();
            messageObserver?.disconnect();
          };
          const succeed = () => {
            if (settled || !finishOpen()) return false;
            settled = true;
            cleanup();
            return true;
          };
          const fail = () => {
            if (settled || !message || message.hidden || !message.textContent?.trim()) return false;
            settled = true;
            cleanup();
            reset();
            showError(message.textContent.trim());
            window.setTimeout(() => transition?.classList.remove('is-visible'), 2600);
            return true;
          };

          editorObserver = new MutationObserver(() => void succeed());
          editorObserver.observe(editor, { attributes: true, attributeFilter: ['hidden'] });
          if (message) {
            messageObserver = new MutationObserver(() => void fail());
            messageObserver.observe(message, { attributes: true, childList: true, subtree: true, characterData: true });
          }

          create.click();
          if (succeed()) return;

          window.setTimeout(() => {
            if (settled) return;
            if (succeed() || fail()) return;
            settled = true;
            cleanup();
            reset();
            showError(labels.failed);
            window.setTimeout(() => transition?.classList.remove('is-visible'), 2200);
          }, 9000);
        };

        const intercept = event => {
          const button = event.target?.closest?.('[data-tex-start-template]');
          if (!button) return;
          if (event.type === 'pointerup' && event.pointerType === 'mouse') return;

          if (event.type === 'click' && button === lastPointerButton && Date.now() - lastPointerAt < 900) {
            event.preventDefault();
            event.stopImmediatePropagation();
            return;
          }

          event.preventDefault();
          event.stopImmediatePropagation();
          if (event.type === 'pointerup') {
            lastPointerButton = button;
            lastPointerAt = Date.now();
          }
          createTemplate(button);
        };

        document.addEventListener('pointerup', intercept, true);
        document.addEventListener('click', intercept, true);
      })();
    </script>`;
}
