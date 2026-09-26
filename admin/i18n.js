const PAGE_PATHS = ["/", "/users", "/roles", "/access", "/content", "/storage", "/intelligence", "/logs", "/system"];

const EN = [
  ["AERTEX 管理控制台","AERTEX Administration"],
  ["管理控制面 ·","CONTROL PLANE ·"],
  ["生产环境 ·","PRODUCTION ·"],
  ["此管理界面与用户产品完全隔离。","Administrative surface isolated from user products."],
  ["退出管理员会话","Close admin session"],
  ["系统总览","System overview"],
  ["查看运行状态和仅管理员可见的指标。","Operational status and administrator-only metrics."],
  ["角色与权限","Roles & permissions"],
  ["管理角色与权限矩阵。","Administrative role and permission matrix."],
  ["审计日志","Audit logs"],
  ["查看管理操作与账户变更审计事件。","Administrative and account-change audit events."],
  ["访问控制","Access control"],
  ["管理设备豁免并查看访问审计记录。","Device exemptions and access-audit telemetry."],
  ["跨账户管理摘要与私有链接；与用户产品保持隔离。","Cross-account summaries and private-link administration, isolated from user products."],
  ["查看跨账户 R2 用户文件，并执行管理操作。","Cross-account R2 user-file inventory and administrative file operations."],
  ["AI 管理","Intelligence"],
  ["管理服务商、模型和用户 AI 访问权限。","Provider, model, and user-access administration."],
  ["查看管理控制面的健康状态与部署信息。","Control-plane health and deployment context."],
  ["正在加载管理数据…","Loading control-plane data…"],
  ["正在读取管理状态。","Reading administrative state."],
  ["加载中…","Loading…"],
  ["刷新","Refresh"],
  ["原始管理概览","Raw administrative overview"],
  ["暂无记录。","No records."],
  ["暂无指标。","No metrics."],
  ["暂无账户。","No accounts."],
  ["账户设置已更新，并已写入审计日志。","Account controls updated and audited."],
  ["角色权限矩阵已更新，并已写入审计日志。","Role permission matrix updated and audited."],
  ["权限矩阵","Permission matrix"],
  ["保存角色","Save role"],
  ["最近事件","Recent events"],
  ["华为设备 ID 豁免","Huawei device ID exemptions"],
  ["访问审计摘要","Access audit summary"],
  ["授予或撤销账户豁免","Grant or revoke account exemption"],
  ["最近访问审计事件","Recent access-audit events"],
  ["用户摘要","User summaries"],
  ["用户创建的链接","User-created links"],
  ["用户文件","User files"],
  ["添加服务商","Add provider"],
  ["凭据仅保存在 AI 管理模块","credential stays inside Intelligence"],
  ["项目 API 密钥","Project API key"],
  ["管理/计费密钥（OpenAI 可选）","Admin/billing key (OpenAI optional)"],
  ["验证密钥并加载模型","Validate key & load models"],
  ["允许的模型","Allowed models"],
  ["请先验证密钥","Validate the key first"],
  ["默认模型","Default model"],
  ["每月预算（USD）","Monthly budget USD"],
  ["输入价格 / 百万 Token（USD）","Input $ / 1M"],
  ["输出价格 / 百万 Token（USD）","Output $ / 1M"],
  ["创建服务商","Create provider"],
  ["用户 AI 访问权限","User AI access"],
  ["服务商密钥验证成功，共 ","Provider key validated. "],
  [" 个模型可用。"," models available."],
  ["管理请求失败：","Control-plane request failed: "],
  ["管理控制面","Control plane"],
  ["最近登录","Last sign-in"],
  ["显示名称","Display name"],
  ["最近活动","Last activity"],
  ["创建时间","Created"],
  ["更新时间","Updated"],
  ["用户 ID","User ID"],
  ["所有者 ID","Owner ID"],
  ["所有者","Owner"],
  ["文件标识","Reference"],
  ["文件类型","Type"],
  ["上传时间","Uploaded"],
  ["社区公开","Community"],
  ["资源类型","Resource type"],
  ["资源 ID","Resource ID"],
  ["事件类型","Event type"],
  ["设备信息","User agent"],
  ["文件数","Files"],
  ["已用空间","Used"],
  ["部分结果","Partial"],
  ["摘要数","Summaries"],
  ["私有链接","Private links"],
  ["社区链接","Community links"],
  ["启用服务商","Active providers"],
  ["暂停或封禁用户","Suspend or ban users"],
  ["查看角色与权限","Read roles & permissions"],
  ["修改角色权限","Update role permissions"],
  ["查看操作日志","Read operation logs"],
  ["查看系统状态","Read system status"],
  ["查看笔记","Read notes"],
  ["创建笔记","Create notes"],
  ["修改笔记","Update notes"],
  ["删除笔记","Delete notes"],
  ["查看链接","Read links"],
  ["创建链接","Create links"],
  ["修改链接","Update links"],
  ["删除链接","Delete links"],
  ["查看用户","Read users"],
  ["修改用户","Update users"],
  ["管理员","Administrator"],
  ["编辑者","Editor"],
  ["普通用户","User"],
  ["已暂停","Suspended"],
  ["已封禁","Banned"],
  ["已启用","Active"],
  ["已停用","Disabled"],
  ["正常","Active"],
  ["账户","Accounts"],
  ["用户数","Users"],
  ["用户","Users"],
  ["角色","Role"],
  ["状态","Status"],
  ["邮箱","Email"],
  ["操作","Actions"],
  ["标题","Title"],
  ["范围","Scope"],
  ["名称","Name"],
  ["类型","Type"],
  ["大小","Size"],
  ["模型","Models"],
  ["启用","Enabled"],
  ["美元限额","USD limits"],
  ["Token 限额","Token limits"],
  ["每分钟请求","RPM"],
  ["每月","monthly"],
  ["每日","daily"],
  ["用户 UUID","User UUID"],
  ["到期时间 ISO（可选）","Expiration ISO (optional)"],
  ["管理备注","Administrative note"],
  ["授予","Grant"],
  ["撤销","Revoke"],
  ["应用","Apply"],
  ["转为私有","Make private"],
  ["发布","Publish"],
  ["下载","Download"],
  ["删除","Delete"],
  ["停用","Disable"],
  ["启用","Enable"],
  ["总览","Overview"],
  ["内容","Content"],
  ["存储","Storage"],
  ["系统","System"],
  ["来源","Source"],
  ["标签","Tags"],
  ["分类","Category"],
  ["说明","Description"],
  ["备注","Note"],
  ["时间","Time"],
  ["服务","Service"],
  ["数量","Count"],
  ["总数","Total"],
  [" 条记录"," records"],
  [" 项权限"," permissions"],
  [" 位用户"," users"],
  [" 次请求"," req"],
  ["确定删除链接 “","Delete link "],
  ["确定删除存储对象 “","Delete storage object "],
  ["确定删除服务商 “","Delete provider "],
  ["” 吗？","?"],
  ["社区","community"],
  ["私有","private"],
  ["是","yes"],
  ["否","no"]
];

export function adminLocaleFromPath(pathname) {
  const path = String(pathname || "/").replace(/\/+$/, "") || "/";
  for (const locale of ["zh-cn", "en"]) {
    const prefix = "/" + locale;
    if (path === prefix) return { locale, path: "/" };
    if (path.startsWith(prefix + "/")) {
      const inner = path.slice(prefix.length) || "/";
      return { locale, path: PAGE_PATHS.includes(inner) ? inner : null };
    }
  }
  return { locale: null, path: PAGE_PATHS.includes(path) ? path : null };
}

export function adminCanonicalPath(locale, path) {
  const lang = locale === "en" ? "en" : "zh-cn";
  const inner = PAGE_PATHS.includes(path) ? path : "/";
  return "/" + lang + (inner === "/" ? "" : inner);
}

export function preferredAdminLocale(request) {
  const language = (request.headers.get("Accept-Language") || "").toLowerCase();
  return language.includes("zh") ? "zh-cn" : "en";
}

export function localizeAdminHtml(markup, locale, currentPath) {
  const lang = locale === "en" ? "en" : "zh-cn";
  const prefix = "/" + lang;
  let output = String(markup || "");

  for (const path of PAGE_PATHS) {
    const raw = path === "/" ? 'href="/"' : 'href="' + path + '"';
    const localized = 'href="' + prefix + (path === "/" ? "" : path) + '"';
    output = output.replace(raw, localized);
  }

  output = output.replace(
    "@media(max-width:1000px)",
    ".languageFooter{margin:30px 0 6px;padding:18px 0 2px;border-top:1px solid var(--line2);color:var(--quiet);font-size:11px;text-align:center}.languageFooter a{margin-left:5px;color:var(--muted);text-decoration:none;border-bottom:1px solid #3b4652}.languageFooter a:hover{color:var(--text);border-bottom-color:var(--muted)}@media(max-width:1000px)"
  );

  const target = adminCanonicalPath(lang === "en" ? "zh-cn" : "en", currentPath);
  const footer = lang === "en"
    ? '<footer class="languageFooter">Need to change language? <a href="' + target + '">Switch to 简体中文</a></footer>'
    : '<footer class="languageFooter">需要更改语言？<a href="' + target + '">切换至 English</a></footer>';
  output = output.replace('      <div id="view"><div class="state">', '      <div id="view"><div class="state">');
  output = output.replace('    </div>\n  </main>\n</div>', '      ' + footer + '\n    </div>\n  </main>\n</div>');

  if (lang === "en") {
    output = output.replace('<html lang="zh-CN">','<html lang="en">');
    for (const [from, to] of EN) output = output.replaceAll(from, to);
  }
  return output;
}
