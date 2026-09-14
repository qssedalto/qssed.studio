export function polishWorkTexNavigation(markup, zh, pathname) {
  let output = String(markup || "");
  const prefix = zh ? "/zh-cn" : "/en";
  const localLabel = zh ? "本机桥接" : "Local Bridge";
  const texLabel = zh ? "TeX 工作台" : "TeX Workbench";
  const localPlain = `<a href="${prefix}/work/local">${localLabel}</a>`;
  const localCurrent = `<a href="${prefix}/work/local" aria-current="page">${localLabel}</a>`;
  const texLink = `<a href="${prefix}/work/tex"${pathname === "/work/tex" ? ' aria-current="page"' : ""}>${texLabel}</a>`;

  if (!output.includes(`href="${prefix}/work/tex"`)) {
    if (output.includes(localCurrent)) output = output.replace(localCurrent, localCurrent + texLink);
    else if (output.includes(localPlain)) output = output.replace(localPlain, localPlain + texLink);
  }

  if (pathname !== "/work/tex") return output;

  output = output.replaceAll("os-nav-group is-active", "os-nav-group ");
  output = output.replace('<section class="os-nav-group " data-qsseda-work-nav="1">', '<section class="os-nav-group is-active" data-qsseda-work-nav="1">');

  const shellTitle = zh ? "工作区" : "Workspace";
  const shellDescription = zh
    ? "工作区总览，用于查看并进入工作台、项目、实验、草稿与任务。"
    : "An overview for entering the Workbench, projects, experiments, drafts, and tasks.";
  const title = texLabel;
  const description = zh
    ? "专注写作、编译和 PDF 预览的独立 TeX 工作界面。"
    : "A dedicated TeX surface for writing, compiling, and PDF preview.";

  output = output.replace(`<h1>${shellTitle}</h1>`, `<h1>${title}</h1>`);
  output = output.replace(`<p>${shellDescription}</p>`, `<p>${description}</p>`);
  output = output.replace(`${shellTitle} · QssedA Studio`, `${title} · QssedA Studio`);
  output = output.replace('const currentPath = "/workspace";', 'const currentPath = "/work/tex";');
  output = output.replace(`data-fallback-href="${prefix}/dashboard"`, `data-fallback-href="${prefix}/work"`);
  output = output.replace(`const compactFallbackHref = "${prefix}/dashboard";`, `const compactFallbackHref = "${prefix}/work";`);
  output = output.replace("const compactMenuRoot = true;", "const compactMenuRoot = false;");
  return output;
}

export function polishWorkHubTexRoute(markup) {
  return String(markup || "").replaceAll("/workspace/experiments/tex", "/work/tex");
}
