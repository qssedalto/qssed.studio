/**
 * 【初学者导读】
 * 文件：studio/ui-work-tex-version-density.js
 * AERTEX Work/TeX 前端模块：负责编辑器、版本、工作区或页面交互。
 * 阅读顺序：先确认这个模块从哪里被导入，再看入口函数接收什么状态/Request；随后追踪 API、DOM、缓存或重定向副作用。
 * 初学者重点：Work/Watch 等独立产品虽然共享登录和品牌，但域名、路由和部署边界是分开的，不能把一个产品的假设直接复制到另一个。
 * 修改注意：保持已有 URL、查询参数、DOM 标识和登录交接兼容；如果产品边界变化，必须同步修改对应 CI 检查。
 * 调试方法：先确认 host/path 命中了哪个入口，再检查会话和内部状态，最后看具体 UI 或 API 结果。
 */
export function enhanceWorkTexVersionDensity(markup) {
  return String(markup || "") + `
    <style id="qsseda-work-tex-version-density">
      /* The base run list is a CSS grid with a large minimum height. With only one
         version, grid track stretching made that single row fill the whole panel.
         Pin history rows to their content height and let the parent panel own scroll. */
      .tex-work-app .tex-run-list.is-version-history{
        flex:0 0 auto!important;
        min-height:0!important;
        height:auto!important;
        align-content:start!important;
        align-items:start!important;
        grid-auto-rows:max-content!important;
        grid-template-rows:none!important;
        overflow:visible!important;
      }
      .tex-work-app .tex-run-list.is-version-history>.tex-version-item{
        align-self:start!important;
        min-height:52px!important;
        height:52px!important;
        max-height:52px!important;
        overflow:hidden!important;
      }
      .tex-work-app .tex-run-list.is-version-history>.tex-version-item .tex-version-top,
      .tex-work-app .tex-run-list.is-version-history>.tex-version-item .tex-version-meta{
        min-height:0!important;
      }
      .tex-work-app .tex-run-list.is-version-history>.tex-version-item .tex-version-actions{
        align-self:center!important;
      }
      @media(max-width:1080px){
        .tex-work-app .tex-run-list.is-version-history{
          overflow:visible!important;
        }
        .tex-work-app .tex-run-list.is-version-history>.tex-version-item{
          height:auto!important;
          max-height:none!important;
          min-height:72px!important;
          overflow:visible!important;
        }
      }
    </style>`;
}
