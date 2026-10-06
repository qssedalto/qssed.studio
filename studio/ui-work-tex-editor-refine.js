// 初学者导读：TeX 编辑器细节优化层：处理选择、滚动、焦点等交互修正，原则上不改变文档内容语义。
export function enhanceWorkTexEditorRefine(markup, zh) {
  const copy = zh ? {
    savedLocal: "已另存到本机",
    chooserUnavailable: "当前浏览器不支持系统另存为窗口，已改用普通下载。",
    saveAsFailed: "另存为失败",
    texFile: "TeX 源文件"
  } : {
    savedLocal: "Saved locally",
    chooserUnavailable: "This browser does not support the system Save As dialog, so a normal download was used instead.",
    saveAsFailed: "Save As failed",
    texFile: "TeX source file"
  };

  return String(markup || "") + `
    <style id="qsseda-work-tex-editor-refine">
      /* Keep the version timeline compact, but make it readable at normal desktop scale. */
      .tex-work-app .tex-run-list.is-version-history>.tex-version-item{
        min-height:60px!important;
        height:60px!important;
        max-height:60px!important;
        padding:8px 10px 8px 20px!important;
      }
      .tex-work-app .tex-run-list.is-version-history .tex-version-top strong{
        font-size:13px!important;
        line-height:1.25!important;
        font-weight:750!important;
      }
      .tex-work-app .tex-run-list.is-version-history .tex-version-badge{
        padding:4px 8px!important;
        font-size:10px!important;
        line-height:1.1!important;
      }
      .tex-work-app .tex-run-list.is-version-history .tex-version-meta{
        gap:10px!important;
        font-size:10.5px!important;
        line-height:1.25!important;
      }
      .tex-work-app .tex-run-list.is-version-history .tex-version-action{
        height:32px!important;
        min-height:32px!important;
        padding:0 11px!important;
        border-radius:9px!important;
        font-size:11px!important;
        font-weight:700!important;
      }
      .tex-work-app .tex-version-policy{
        font-size:10.5px!important;
        line-height:1.4!important;
        padding:7px 10px!important;
      }
      .tex-work-app .tex-run-list.is-version-history>.tex-version-item:before{
        top:19px!important;
      }
      .tex-work-app .tex-run-list.is-version-history>.tex-version-item:after{
        top:27px!important;
      }
      @media(max-width:1080px){
        .tex-work-app .tex-run-list.is-version-history>.tex-version-item{
          min-height:82px!important;
          height:auto!important;
          max-height:none!important;
        }
        .tex-work-app .tex-run-list.is-version-history .tex-version-top strong{font-size:14px!important}
        .tex-work-app .tex-run-list.is-version-history .tex-version-badge{font-size:11px!important}
        .tex-work-app .tex-run-list.is-version-history .tex-version-meta{font-size:11px!important}
        .tex-work-app .tex-run-list.is-version-history .tex-version-action{height:34px!important;min-height:34px!important;font-size:11px!important}
      }
    </style>
    <script id="qsseda-work-tex-local-save-as">
      (() => {
        if (window.__qssedaTexLocalSaveAsReady) return;
        window.__qssedaTexLocalSaveAsReady = true;
        const labels = ${JSON.stringify(copy)};

        const install = () => {
          const bar = document.querySelector('.tex-editor-commandbar');
          const source = document.getElementById('tex-source');
          const title = document.getElementById('tex-title');
          if (!bar || !source || !title) {
            window.setTimeout(install, 60);
            return;
          }

          const buttons = Array.from(bar.querySelectorAll('.tex-editor-command'));
          const saveAsButton = buttons[1];
          if (!saveAsButton || saveAsButton.dataset.localSaveAs === '1') return;
          saveAsButton.dataset.localSaveAs = '1';

          // The older implementation used a cloud-duplicate dialog. Save As now has
          // desktop-editor semantics, so remove that sheet entirely.
          document.querySelector('.tex-save-as-dialog')?.remove();

          const safeName = value => {
            const base = String(value || 'qsseda-tex')
              .replace(/[\\/:*?\"<>|]+/g, '-')
              .replace(/\s+/g, ' ')
              .trim()
              .slice(0, 120) || 'qsseda-tex';
            return /\.tex$/i.test(base) ? base : base + '.tex';
          };

          const showMessage = (text, error = false) => {
            const node = document.getElementById('tex-message');
            if (!node) return;
            node.hidden = !text;
            node.textContent = text || '';
            node.classList.toggle('is-error', Boolean(error));
          };

          const fallbackDownload = () => {
            const blob = new Blob([source.value || ''], { type: 'application/x-tex;charset=UTF-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = safeName(title.value);
            document.body.append(link);
            link.click();
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1500);
          };

          const saveAsLocal = async () => {
            saveAsButton.disabled = true;
            try {
              if (typeof window.showSaveFilePicker === 'function') {
                const handle = await window.showSaveFilePicker({
                  suggestedName: safeName(title.value),
                  types: [{
                    description: labels.texFile,
                    accept: {
                      'application/x-tex': ['.tex'],
                      'text/plain': ['.tex']
                    }
                  }]
                });
                const writable = await handle.createWritable();
                await writable.write(source.value || '');
                await writable.close();
                showMessage(labels.savedLocal);
                return;
              }

              fallbackDownload();
              showMessage(labels.chooserUnavailable);
            } catch (error) {
              // AbortError means the user simply cancelled the native Save As dialog.
              if (error?.name === 'AbortError') return;
              showMessage(error?.message || labels.saveAsFailed, true);
            } finally {
              saveAsButton.disabled = false;
            }
          };

          // Capture on the button target runs before the old bubble listener, so the
          // previous cloud-copy behaviour is completely bypassed without touching the
          // stable editor toolbar implementation.
          saveAsButton.addEventListener('click', event => {
            event.preventDefault();
            event.stopImmediatePropagation();
            void saveAsLocal();
          }, true);
        };

        install();
      })();
    </script>`;
}
