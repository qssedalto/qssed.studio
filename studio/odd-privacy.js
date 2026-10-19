/**
 * Deliberately fictional 1000-clause privacy-policy parody for /sign-up/odd.
 * None of these provisions is an actual legal or AERTEX privacy statement.
 * All clauses are rendered from static editorial text; no user content is read.
 */
const CHAPTERS = [
  ["总则与宇宙管辖", "你的注册请求已被木星会议室临时接管"],
  ["邮箱的四大元素", "每一个 @ 符号均需佩戴工牌"],
  ["昵称抢注管理", "所有尚未想到的昵称都已被未来的你预约"],
  ["密码趣味鉴赏", "一个简单密码可能因太朴素而被授予文学奖"],
  ["验证码辨认条例", "相似的 0、O 与圆形饼干享有平等地位"],
  ["注册按钮礼仪", "按钮被连续点击时有权申请年假"],
  ["鼠标移动隐私", "鼠标如果走出屏幕需要向键盘请假"],
  ["光标闪烁秩序", "光标每眨一次眼睛都能申请零食补贴"],
  ["输入框座位制度", "每个输入框都保留靠窗座位给标点符号"],
  ["页面加载礼貌", "加载动画可以先旋转再决定是否工作"],
  ["用户头像肖像权", "像素点可以集体表决今天是否上镜"],
  ["浏览器记忆自治", "浏览器忘记的事情不允许责怪金鱼"],
  ["按钮颜色选举", "粉红和蓝色必须公开举行公正的剪刀石头布"],
  ["网络速度公平", "网速较慢时字节有权扶着墙慢慢走"],
  ["系统通知文风", "通知消息可自行选择押韵但不可抢走键盘"],
  ["错误代码保护", "404 与 418 可以互换今日心情但不得互换身份证"],
  ["同意勾选说明", "复选框即使被勾选仍可表达害羞"],
  ["删除幻想规定", "已经不存在的数据不能再参加捉迷藏"],
  ["申诉窗口开放日", "申诉委员会由三只塑料鸭子和一块橡皮组成"],
  ["终章与时间悖论", "本政策的明天版本可能在昨天经过审议"]
];
const SITUATIONS = [
  "你打算在凌晨三点提交表单",
  "第一个字符比其余字符提前到达",
  "光标连续闪烁超过七次",
  "键盘上的空格键要求单独署名",
  "浏览器想把星期二改名为星期八",
  "有一枚标点符号试图冒充管理员",
  "加载动画连续转了四圈半",
  "你决定把确认按钮当成电梯按钮",
  "鼠标对屏幕右上角产生了思乡情绪",
  "系统声称已经读完一本不存在的说明书"
];
const RULINGS = [
  "须先听取三只企鹅的建议，并附上一份没有盖章的云朵收据",
  "相关资料将在想象中的抽屉里排队，按照彩虹出现的顺序放行",
  "平台有权请一盆仙人掌主持复核，但仙人掌不得索要茶水费",
  "申请人可向墙角的路由器提出诗歌形式的申诉，押韵与否不影响虚构结果",
  "本项暂交由一枚抛不起来的硬币表决，正反两面均为再考虑一下"
];

export const ODD_PRIVACY_CLAUSE_COUNT = CHAPTERS.length * SITUATIONS.length * RULINGS.length;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])
  );
}

export function oddPrivacyPage(backHref = "/sign-up/odd") {
  const safeBackHref = /^\/(?:[a-z]{2}(?:-[a-z0-9]+)?\/)?sign-up\/odd$/.test(backHref)
    ? backHref : "/sign-up/odd";
  let numbered = 0;
  const navigation = CHAPTERS.map(([title], index) =>
    `<a href="#chapter-${index + 1}">第${index + 1}章 · ${escapeHtml(title)}</a>`
  ).join("");
  const sections = CHAPTERS.map(([title, detail], chapterIndex) => {
    const clauses = SITUATIONS.flatMap((situation) => RULINGS.map(ruling => {
      numbered += 1;
      const statement = `当${situation}时，关于「${title}」的规则特别认定：${detail}；${ruling}。`;
      return `<li id="clause-${numbered}"><span class="idx">第${String(numbered).padStart(4, "0")}条</span> ${escapeHtml(statement)}</li>`;
    })).join("");
    return `<details class="chapter" id="chapter-${chapterIndex + 1}" ${chapterIndex === 0 ? "open" : ""}>
      <summary><span class="chapter-heading">第${chapterIndex + 1}章 · ${escapeHtml(title)}</span><span class="count">50 条</span></summary>
      <p class="chapter-lead">${escapeHtml(detail)}。</p>
      <ol start="${chapterIndex * 50 + 1}">${clauses}</ol>
    </details>`;
  }).join("");
  if (numbered !== ODD_PRIVACY_CLAUSE_COUNT) throw new Error("Odd privacy policy clause count mismatch");

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="color-scheme" content="light">
  <meta name="robots" content="noindex,nofollow">
  <title>隐私政策（恶搞版）· AERTEX ODD</title>
  <style>
    :root{color:#242936;background:#f7f8fc;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;font-synthesis:none}
    *{box-sizing:border-box}
    body{margin:0;background:radial-gradient(ellipse at 10% 0,#fce7ed 0,transparent 36%),radial-gradient(ellipse at 90% 0,#e5edff 0,transparent 38%),#f7f8fc}
    a{color:#5368a4;text-decoration:none}
    a:hover{text-decoration:underline;text-underline-offset:4px}
    a:focus-visible,summary:focus-visible{outline:3px solid #91a7ec;outline-offset:4px}
    main{max-width:920px;margin:0 auto;padding:35px 20px 75px}
    .top{display:flex;justify-content:space-between;align-items:center;margin-bottom:35px;color:#596174}
    .top strong{font-size:18px;letter-spacing:.04em;color:#232936}
    .top a{font-size:13px;font-weight:700}
    .hero,.chapter{background:#fff;border:1px solid #e5e7ee;border-radius:21px;box-shadow:0 7px 30px #36415d09}
    .hero{padding:35px 38px;margin-bottom:22px}
    h1{margin:0 0 14px;font-size:clamp(26px,5vw,38px);letter-spacing:-.04em}
    .kicker{font-size:12px;letter-spacing:.18em;font-weight:800;color:#bb667c}
    .intro{color:#606b80;font-size:14px;line-height:1.95}
    .notice{background:#fff6f7;border:1px solid #f4dade;color:#935266;border-radius:13px;padding:15px 17px;line-height:1.8;font-size:13px;margin-top:18px}
    .stats{margin:20px 0 0;color:#384861;font-size:14px;font-weight:750}
    .chapters-nav{display:flex;gap:8px;overflow-x:auto;padding:2px 0 17px;scrollbar-width:thin}
    .chapters-nav a{background:#fff;border:1px solid #e1e4ed;padding:9px 12px;border-radius:10px;font-size:12px;white-space:nowrap}
    .chapter{margin:0 0 13px;scroll-margin-top:20px;overflow:hidden}
    summary{cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:23px 27px;list-style-position:inside}
    summary:hover{background:#fcfcff}
    .chapter-heading{font-size:17px;font-weight:800}
    .count{color:#c35f78;background:#fff0f2;border-radius:20px;padding:6px 10px;font-size:12px;font-weight:800;white-space:nowrap}
    .chapter-lead{margin:0;padding:0 28px 15px;color:#7b8497;font-size:13px;line-height:1.7}
    ol{list-style:none;padding:0 28px 27px;margin:0}
    li{padding:12px 1px;border-top:1px solid #eef0f4;line-height:1.8;color:#4c5668;font-size:13px}
    .idx{font-weight:800;color:#ac536e;margin-right:5px;white-space:nowrap}
    .bottom{display:flex;justify-content:center;margin:26px 0;font-size:14px;font-weight:750}
    @media(max-width:580px){main{padding:20px 13px 60px}.hero{padding:24px 20px}.chapter-heading{font-size:14px}summary{padding:18px 16px}.chapter-lead{padding:0 17px 14px}ol{padding:0 17px 20px}}
  </style>
</head>
<body>
  <main>
    <nav class="top"><strong>AERTEX ODD</strong><a href="${safeBackHref}">← 返回注册页面</a></nav>
    <header class="hero">
      <p class="kicker">FICTIONAL POLICY · 1000 CLAUSES</p>
      <h1>隐私政策 <span style="color:#b46b80;font-size:.55em">(恶搞版)</span></h1>
      <p class="intro">欢迎来到本部门的千条特别条款。这份文件的审批速度由企鹅步频决定，条款编号按地球日历排列，阅读完成后也不能兑换积分。</p>
      <div class="notice"><strong>说明：</strong>以下 1000 条都是戏仿创作，不构成正式隐私政策、法律承诺或真实账户服务条款。此恶搞注册界面不会向服务器发送或存储填写内容；请勿将它视为真正的账户注册流程。</div>
      <div class="stats">20 章 · 每章 50 条 · 共 ${ODD_PRIVACY_CLAUSE_COUNT} 条</div>
    </header>
    <nav class="chapters-nav" aria-label="隐私政策章节">${navigation}</nav>
    ${sections}
    <div class="bottom"><a href="${safeBackHref}">← 返回注册页面</a></div>
  </main>
</body>
</html>`;
}
