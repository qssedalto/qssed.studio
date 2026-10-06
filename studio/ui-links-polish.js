// 初学者导读：链接页面的视觉/交互增强层；只调整呈现，不应改变 favorites/user-links API 的数据语义。
export function polishLinksContent(content, pathname, zh) {
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
