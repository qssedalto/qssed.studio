export function polishWorkTexNavigation(markup, zh, pathname) {
  let output = String(markup || "");
  const prefix = zh ? "/zh-cn" : "/en";
  const workTexUrl = zh ? "https://work.qsseda.studio/zh-cn/tex" : "https://work.qsseda.studio/en/tex";
  const texLabel = zh ? "TeX 工作台" : "TeX Workbench";

  // Work is intentionally a single-purpose TeX product. Any stale Work hub or
  // Local Bridge navigation entry resolves back to the one public Work surface.
  output = output
    .replaceAll(`href="${prefix}/work"`, `href="${workTexUrl}"`)
    .replaceAll(`href="${prefix}/work/local"`, `href="${workTexUrl}"`)
    .replaceAll(`href="${prefix}/work/tex"`, `href="${workTexUrl}"`)
    .replaceAll(`href="https://work.qsseda.studio/${zh ? "zh-cn" : "en"}"`, `href="${workTexUrl}"`)
    .replaceAll(`href="https://work.qsseda.studio/${zh ? "zh-cn" : "en"}/local"`, `href="${workTexUrl}"`);

  if (pathname !== "/work/tex") return output;

  const shellTitle = zh ? "工作区" : "Workspace";
  output = output.replace(`${shellTitle} · QssedA Studio`, `${texLabel} · QssedA Work`);

  // The Work host must expose only the TeX application itself. The Studio shell
  // remains in the document for its shared session/client plumbing, but all of
  // its product chrome is removed from layout so the TeX app owns the viewport.
  output = output.replace(
    "</head>",
    `<style id="qsseda-work-tex-only">
      html{background:var(--bg-soft)!important}
      body.os-shell{
        display:block!important;
        min-height:100vh!important;
        margin:0!important;
        padding:8px!important;
        overflow:hidden!important;
        background:var(--bg-soft)!important;
      }
      body.os-shell>.top-controls-zone,
      body.os-shell>.compact-back-zone,
      body.os-shell .os-sidebar,
      body.os-shell .os-hero,
      body.os-shell #admin-lock{display:none!important}
      body.os-shell .os-layout{
        display:block!important;
        width:100%!important;
        max-width:none!important;
        min-height:calc(100vh - 16px)!important;
        margin:0!important;
        padding:0!important;
      }
      body.os-shell .os-main{
        display:block!important;
        width:100%!important;
        max-width:none!important;
        min-height:calc(100vh - 16px)!important;
        margin:0!important;
        padding:0!important;
      }
      body.os-shell #os-content{
        width:100%!important;
        min-height:calc(100vh - 16px)!important;
        margin:0!important;
        padding:0!important;
      }
      body.os-shell .tex-workbench{
        width:100%!important;
        min-height:calc(100vh - 16px)!important;
        gap:0!important;
      }
      body.os-shell .tex-workbench .tex-hero{display:none!important}
      body.os-shell .tex-workbench .tex-shell{
        width:100%!important;
        height:calc(100vh - 16px)!important;
        min-height:calc(100vh - 16px)!important;
        border-radius:24px!important;
      }
      @media(max-width:760px){
        body.os-shell{padding:0!important}
        body.os-shell .os-layout,
        body.os-shell .os-main,
        body.os-shell #os-content,
        body.os-shell .tex-workbench{
          min-height:100vh!important;
        }
        body.os-shell .tex-workbench .tex-shell{
          height:100vh!important;
          min-height:100vh!important;
          border-radius:0!important;
        }
      }
    </style></head>`
  );

  output = output.replace('const currentPath = "/workspace";', `const currentPath = ${JSON.stringify(`${prefix}/tex`)};`);
  return output;
}

export function polishWorkHubTexRoute(markup) {
  const source = String(markup || "");
  const workTexUrl = source.includes("Open TeX Workbench")
    ? "https://work.qsseda.studio/en/tex"
    : "https://work.qsseda.studio/zh-cn/tex";
  return source
    .replaceAll("/workspace/experiments/tex", workTexUrl)
    .replaceAll("/work/local", workTexUrl)
    .replaceAll("/work/tex", workTexUrl)
    .replaceAll("/work", workTexUrl);
}
