/**
 * 【初学者导读】
 * 文件：studio/ui-work-tex-mobile-tools.js
 * 这是 AERTEX Work/TeX 前端模块（work-tex-mobile-tools）。这组文件把编辑器、预览、协作、移动端适配或性能优化拆成多个小模块，避免一个超大文件承担全部职责。
 * 阅读顺序：先找本文件 export 的安装/初始化函数，再看它接收的 editor/state/session 参数；之后沿事件监听、缓存和 DOM 更新理解副作用。
 * 初学者重点：编辑器状态、服务器版本、协作会话和预览缓存是不同层次的数据；修改其中一层时不要假设其他层会自动同步。
 * 修改注意：协作/实时模块尤其要考虑乱序消息、重复消息、断线重连和旧版本客户端；性能优化模块不能以牺牲正确性为代价。
 * 调试方法：先区分“编辑器内容错”“预览错”“协作同步错”“移动布局错”，再进入对应模块，不要在整个 Work 链路里盲查。
 */
export function enhanceWorkTexMobileTools(markup, zh) {
  const copy = zh ? {
    toolbar: "TeX 快捷输入",
    slash: "反斜杠",
    braces: "花括号",
    inlineMath: "行内数学",
    displayMath: "行间数学",
    superscript: "上标",
    subscript: "下标",
    fraction: "分式",
    root: "根号",
    align: "对齐公式",
    item: "列表项"
  } : {
    toolbar: "TeX quick input",
    slash: "Backslash",
    braces: "Braces",
    inlineMath: "Inline math",
    displayMath: "Display math",
    superscript: "Superscript",
    subscript: "Subscript",
    fraction: "Fraction",
    root: "Square root",
    align: "Aligned equations",
    item: "List item"
  };

  return String(markup || "") + `
    <style id="qsseda-work-tex-mobile-tools">
      .tex-mobile-inputbar{display:none}
      @media (max-width:760px), (max-width:950px) and (pointer:coarse){
        .tex-work-app .tex-editor{grid-template-rows:auto auto minmax(0,1fr) auto auto!important}
        .tex-mobile-inputbar{
          display:flex!important;
          align-items:center!important;
          gap:6px!important;
          width:100%!important;
          min-height:44px!important;
          padding:5px 8px!important;
          overflow-x:auto!important;
          overflow-y:hidden!important;
          scrollbar-width:none!important;
          overscroll-behavior-x:contain!important;
          -webkit-overflow-scrolling:touch;
          border-top:1px solid var(--hairline)!important;
          background:color-mix(in srgb,var(--surface) 94%,transparent)!important;
          -webkit-backdrop-filter:blur(18px) saturate(150%);
          backdrop-filter:blur(18px) saturate(150%);
        }
        .tex-mobile-inputbar::-webkit-scrollbar{display:none}
        .tex-mobile-inputbar button{
          flex:0 0 auto!important;
          width:auto!important;
          min-width:40px!important;
          height:34px!important;
          min-height:34px!important;
          margin:0!important;
          padding:0 10px!important;
          border:1px solid var(--hairline)!important;
          border-radius:10px!important;
          background:var(--card)!important;
          color:var(--text)!important;
          box-shadow:none!important;
          font:600 13px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace!important;
          white-space:nowrap!important;
          -webkit-tap-highlight-color:transparent;
        }
        .tex-mobile-inputbar button:active{transform:scale(.95)!important;background:var(--fill)!important}
        .tex-mobile-inputbar button:focus-visible{outline:none!important;box-shadow:0 0 0 2px color-mix(in srgb,var(--primary) 24%,transparent)!important}
        body.tex-mobile-keyboard-open .tex-mobile-inputbar{
          position:relative!important;
          z-index:12!important;
        }
      }
    </style>
    <script id="qsseda-work-tex-mobile-tools-runtime">
      (() => {
        const source = document.getElementById('tex-source');
        const footer = document.querySelector('.tex-work-app .tex-editor-footer');
        if (!source || !footer || document.getElementById('tex-mobile-inputbar')) return;

        const bar = document.createElement('div');
        bar.id = 'tex-mobile-inputbar';
        bar.className = 'tex-mobile-inputbar';
        bar.setAttribute('role', 'toolbar');
        bar.setAttribute('aria-label', ${JSON.stringify(copy.toolbar)});

        const actions = [
          ['\\\\', '\\\\', 1, ${JSON.stringify(copy.slash)}],
          ['{ }', '{}', 1, ${JSON.stringify(copy.braces)}],
          ['$…$', '$$', 1, ${JSON.stringify(copy.inlineMath)}],
          ['$$', '$$\\n\\n$$', 3, ${JSON.stringify(copy.displayMath)}],
          ['^', '^{}', 2, ${JSON.stringify(copy.superscript)}],
          ['_', '_{}', 2, ${JSON.stringify(copy.subscript)}],
          ['\\\\frac', '\\\\frac{}{}', 6, ${JSON.stringify(copy.fraction)}],
          ['√', '\\\\sqrt{}', 6, ${JSON.stringify(copy.root)}],
          ['align', '\\\\begin{align*}\\n  \\n\\\\end{align*}', 17, ${JSON.stringify(copy.align)}],
          ['\\\\item', '\\\\item ', 6, ${JSON.stringify(copy.item)}]
        ];

        const insert = (text, cursorOffset) => {
          const start = Number.isFinite(source.selectionStart) ? source.selectionStart : source.value.length;
          const end = Number.isFinite(source.selectionEnd) ? source.selectionEnd : start;
          const selected = source.value.slice(start, end);
          let value = text;
          let cursor = start + Math.max(0, Math.min(cursorOffset, text.length));

          if (text === '{}') {
            value = '{' + selected + '}';
            cursor = selected ? start + value.length : start + 1;
          } else if (text === '$$' && selected) {
            value = '$' + selected + '$';
            cursor = start + value.length;
          } else if (text === '^{}' && selected) {
            value = '^{' + selected + '}';
            cursor = start + value.length;
          } else if (text === '_{}' && selected) {
            value = '_{' + selected + '}';
            cursor = start + value.length;
          } else if (text === '\\\\sqrt{}' && selected) {
            value = '\\\\sqrt{' + selected + '}';
            cursor = start + value.length;
          } else if (text === '\\\\frac{}{}' && selected) {
            value = '\\\\frac{' + selected + '}{}';
            cursor = start + value.length - 1;
          }

          source.setRangeText(value, start, end, 'end');
          source.focus({ preventScroll: true });
          source.setSelectionRange(cursor, cursor);
          source.dispatchEvent(new Event('input', { bubbles: true }));
        };

        for (const [label, value, cursorOffset, aria] of actions) {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = label;
          button.setAttribute('aria-label', aria);
          button.addEventListener('pointerdown', event => event.preventDefault());
          button.addEventListener('click', () => insert(value, cursorOffset));
          bar.append(button);
        }

        footer.before(bar);
      })();
    </script>`;
}
