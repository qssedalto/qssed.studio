/**
 * 【初学者导读】
 * 文件：studio/ui-links-polish.js
 * 这是 AERTEX 前端 UI 模块（links-polish）：通常同时包含页面模板、局部状态、DOM 更新、事件绑定以及对后端 API 的调用。
 * 阅读顺序：①先搜索页面上能看到的标题/按钮文字定位 render；②找 render 依赖的 state；③找 state 在哪里被 API/事件更新；④再去后端搜索相同 API 路径。
 * 初学者提醒：HTML 字符串负责结构，CSS class 负责样式，事件监听负责交互，fetch/API 负责数据；这四层出现问题时要分别排查。
 * 修改注意：不要随意改掉已有 id/data-* 属性，它们可能被事件绑定、自动测试或别的模块引用；动态插入用户文本时要继续做转义。
 * 响应式注意：桌面布局正常并不代表窄屏正常，修改结构后至少检查大屏、平板和手机断点。
 */
// Links 页面视觉/结构修整：在不改变底层链接数据源的前提下统一卡片、导航和当前路径高亮。\nexport function polishLinksContent(content, pathname, zh) {
  let output = String(content || "");

  if (pathname === "/info/links") {
    output = output
      .replace(
        "系统精选、历史对话中使用过的项目、工具、服务和官方资料。搜索、筛选和全部 140 条链接都放在独立页面里。",
        "系统精选的项目、工具、服务和官方资料。搜索、筛选和全部 140 条链接都放在独立页面里。"
      )
      .replace(
        "System picks, projects used in prior chats, tools, services, and official references. Search, filters, and all 140 links live on a dedicated page.",
        "System-picked projects, tools, services, and official references. Search, filters, and all 140 links live on a dedicated page."
      );
  }

  if (pathname !== "/info/links/mine") return output;

  const placeholder = zh ? "搜索链接" : "Search links";
  output = output.replace(
    /<div class="links-private-toolbar"><input class="links-private-search"([^>]*)><\/div>/,
    (_match, attributes) => `<div class="links-private-toolbar links-private-search-shell"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path></svg><input class="links-private-search"${attributes.replace(/placeholder="[^"]*"/, `placeholder="${placeholder}"`).replace(/aria-label="[^"]*"/, `aria-label="${placeholder}"`)}><kbd aria-hidden="true">/</kbd></div>`
  );

  output += `
    <style>
      .links-private-toolbar.links-private-search-shell{display:flex;align-items:center;gap:9px;min-height:46px;margin-bottom:12px;padding:0 12px;border:0;border-radius:12px;background:var(--surface);box-shadow:inset 0 0 0 1px var(--border);transition:box-shadow .12s ease}
      .links-private-toolbar.links-private-search-shell:focus-within{box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 14%,transparent),inset 0 0 0 1px var(--primary)}
      .links-private-toolbar.links-private-search-shell svg{width:17px;height:17px;flex:0 0 auto;fill:none;stroke:var(--muted);stroke-width:1.8;stroke-linecap:round}
      .links-private-toolbar.links-private-search-shell .links-private-search{width:100%;height:44px;min-height:0;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;color:var(--text)!important;font-size:14px!important;outline:none!important}
      .links-private-toolbar.links-private-search-shell kbd{display:grid;place-items:center;min-width:24px;height:24px;padding:0 6px;border:0;border-radius:6px;background:var(--fill);color:var(--quiet);font:11px ui-monospace,SFMono-Regular,Menlo,monospace}
      @media(max-width:760px){.links-private-toolbar.links-private-search-shell kbd{display:none}}
    </style>
    <script>
      (() => {
        const search = document.getElementById('links-private-search');
        if (!search) return;
        document.addEventListener('keydown', event => {
          const target = event.target;
          const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target?.isContentEditable;
          if (event.key === '/' && !typing) {
            event.preventDefault();
            search.focus();
          }
          if (event.key === 'Escape' && document.activeElement === search && search.value) {
            search.value = '';
            search.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });
      })();
    </script>
  `;

  return output;
}
