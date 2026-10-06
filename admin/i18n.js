/**
 * 【初学者导读】
 * 文件：admin/i18n.js
 * AERTEX Admin 后端/基础模块：负责管理员会话、内容管理、国际化或管理 API。
 * 阅读顺序：从最外层入口开始，先看域名/path/method 判断，再看登录或令牌校验，最后追到具体 handler/模块；不要从某个深层函数孤立地理解整条请求链。
 * 请求链思维：浏览器/客户端 → Worker → 会话/安全门禁 → 路由 → API/页面 → 数据源 → Response。
 * 修改注意：入口文件的小改动可能影响整个产品域名，修改路由或响应头后要跑对应 CI。
 * 调试方法：先记录“实际 host + pathname + method + 是否有会话”，通常可以快速判断请求为什么走错分支。
 */
import { preferredLocaleFromRequest } from "../studio/locale.js";

const PAGE_PATHS = ["/", "/overview", "/users", "/roles", "/access", "/content", "/storage", "/billing", "/student-verification", "/intelligence", "/logs", "/system"];

const EN = [
  ["AERTEX 主站","AERTEX Home"],
  ["返回 AERTEX 主站","Return to AERTEX Home"],
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
  ["订阅与权益","Billing & Entitlements"],
  ["学生认证","Student Verification"],
  ["审核并管理学生的学信网验证申请。","Review and manage CHSI student-verification requests."],
  ["打开学信网官方验证 ↗","Open official CHSI verification ↗"],
  ["认证通过","Verify"],
  ["拒绝","Reject"],
  ["审核说明","Review guidance"],
  ["管理员仅核验经过白名单检查的学信网验证信息。新版报告二维码可能包含 16 位在线验证码而非网址；遇到验证码时，请在学信网“在线验证报告”页面完成核验。请勿要求用户提供学信网密码、身份证、完整学籍报告或人脸信息。","Only review CHSI verification information that passed the allow-list checks. Newer report QR codes may contain a 16-character online verification code instead of a URL; enter the code on CHSI's Online Verification Report page. Never ask users for a CHSI password, ID document, full student record report, or face information."],
  ["待审核申请","Pending requests"],
  ["已通过","Verified"],
  ["共 ","Total "],
  [" 条申请"," requests"],
  ["验证信息","Verification"],
  ["学校（可选）","School (optional)"],
  ["学历层次（可选）","Education level (optional)"],
  ["报告有效期","Report validity"],
  ["复制验证码","Copy code"],
  ["打开学信网验证 ↗","Open CHSI verification ↗"],
  ["暂无学生认证申请。","No student-verification requests."],
  ["管理套餐、有效期与用户产品权益。","Manage plans, validity periods, and user product entitlements."],
  ["当前套餐","Current plan"],
  ["云盘配额","Drive quota"],
  ["有效期至","Valid through"],
  ["授权天数","Grant days"],
  ["授予套餐","Grant plan"],
  ["恢复 Free","Reset to Free"],
  ["管理员授权已更新。","Administrator subscription grant updated."],
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
  ["否","no"],
  ["Intelligence 管理","Intelligence Admin"],
  ["集中管理 AI Provider、凭据、用户权限与配额","Manage AI providers, credentials, user access, and quotas."],
  ["添加 AI Provider","Add AI Provider"],
  ["Provider 类型","Provider type"],
  ["请选择 Provider","Choose a Provider"],
  ["智谱 GLM","Zhipu GLM"],
  ["阿里云百炼","Alibaba Cloud Bailian"],
  ["OpenAI Admin Key（可选，仅账单）","OpenAI Admin Key (optional, billing only)"],
  ["Admin Key 只用于读取 OpenAI Organization Costs，不参与用户聊天","The Admin Key is used only for OpenAI Organization Costs and is never used for user inference."],
  ["允许模型","Allowed models"],
  ["AERTEX 月预算（USD）","AERTEX monthly budget (USD)"],
  ["自定义模型输入 $/百万 Token","Custom model input $ / 1M tokens"],
  ["自定义模型输出 $/百万 Token","Custom model output $ / 1M tokens"],
  ["验证并保存 Provider","Validate & save provider"],
  ["正在验证…","Validating…"],
  ["用户授权","User access"],
  ["正在加载…","Loading…"],
  ["允许使用","AI access"],
  ["Providers","Provider"],
  ["用户可用模型","User models"],
  ["日费用上限 $","Daily cost limit $"],
  ["月费用上限 $","Monthly cost limit $"],
  ["日 Token 上限","Daily token limit"],
  ["月 Token 上限","Monthly token limit"],
  ["保存授权","Save access"],
  ["尚未配置 Provider","No provider configured"],
  ["官方本月费用","Official month cost"],
  ["AERTEX 本地估算","AERTEX local estimate"],
  ["预算剩余","Budget remaining"],
  ["本月请求","Requests this month"],
  ["兼容 API","Compatible API"],
  ["官方账单已连接","Official billing connected"],
  ["未配置 Admin Key","No Admin Key"],
  ["已保存","Saved"],
  ["Project Key 验证通过","Project Key validated"],
  ["请至少为用户选择一个 Provider","Select at least one provider for this user."],
  ["选择 Provider","Choose providers"],
  ["选择允许模型","Choose allowed models"],
  ["选择默认模型","Choose default model"],
  ["选择用户模型","Choose user models"],
  ["已选择","Selected"],
  ["个模型","models"],
  ["个 Provider","providers"],
  ["取消","Cancel"],
  ["完成","Done"],
  ["请至少选择一个允许模型","Select at least one allowed model."],
  ["请先选择允许模型","Choose allowed models first."],
  ["检查 Key","Check Key"],
  ["正在检查…","Checking…"],
  ["Key 正常","Key valid"],
  ["尚未检查 Key","Key not checked"],
  ["请先检查 API Key","Check the API Key first."],
  ["这个 API Key 没有返回可用于对话的模型","This API Key returned no chat-capable models."],
  ["保存中…","Saving…"],
  ["已保存 ✓","Saved ✓"],
  ["编辑","Edit"],
  ["编辑 Provider","Edit Provider"],
  ["替换 Project API Key（留空则保留）","Replace Project API Key (leave blank to keep)"],
  ["替换 Admin Key（留空则保留）","Replace Admin Key (leave blank to keep)"],
  ["清除现有 Admin Key","Remove existing Admin Key"],
  ["启用 Provider","Provider enabled"],
  ["保存修改","Save changes"],
  ["确定删除这个 Provider？此操作不可撤销","Delete this provider? This action cannot be undone."],
  ["Provider 已更新","Provider updated"],
  ["Provider 已删除","Provider deleted"],
  ["当前 Key","Current key"],
  ["当前已保存 Key 正常","Stored key is valid"],
  ["检查新 Key","Check new key"],
  ["当前网络或服务区域暂不支持 OpenAI API 检查这里不是在判定 Key 无效；请在 OpenAI 官方支持的国家或地区使用需要连接 OpenAI 的功能","OpenAI API checks are unavailable from the current network or service region. This does not mean the key is invalid. Use OpenAI-connected features only from an officially supported country or territory."],
  ["已确认上游 Provider 限流：AERTEX 收到真实 HTTP 429这个结果不能判定 Key 无效","Confirmed upstream provider rate limit: AERTEX received a real HTTP 429. This does not mean the API key is invalid."],
  ["上游 Provider 明确拒绝了 API Key 身份验证","The upstream provider explicitly rejected API-key authentication."],
  ["上游 Provider 报告当前账户额度不足","The upstream provider reports insufficient account quota."],
  ["上游 Provider 拒绝当前账户或模型的访问权限","The upstream provider denied access for this account or model."],
  ["上游 Provider 当前过载，请稍后重试","The upstream provider is temporarily overloaded. Try again later."],
  ["建议等待","Retry after"],
  ["秒后重试","seconds"],
  ["请求 ID","Request ID"],
  ["Provider 错误码","Provider error code"],
  ["检查时间","Checked at"],
  ["上游未返回 Retry-After；AERTEX 不会自动连续重试","The upstream provider did not return Retry-After; AERTEX will not auto-retry repeatedly."],
  ["后重试","retry"],
  ["上游状态","Upstream status"]
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
  return preferredLocaleFromRequest(request);
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
    for (const [from, to] of [...EN].sort((a,b)=>b[0].length-a[0].length)) output = output.replaceAll(from, to);
  }
  return output;
}
