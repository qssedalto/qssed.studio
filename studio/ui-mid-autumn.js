export function midAutumnPage(locale = "zh") {
  const zh = locale === "zh";
  const lang = zh ? "zh-CN" : "en";
  const title = zh ? "中秋快乐 · AERTEX" : "Happy Mid-Autumn Festival · AERTEX";
  const blessing = zh ? "祝你中秋快乐" : "Happy Mid-Autumn Festival";
  const lead = zh
    ? "愿今夜月光所至，都是平安、团圆与好心情。"
    : "May tonight bring you peace, reunion, and a little more joy.";
  const action = zh ? "点亮今夜" : "Light up the night";
  const hint = zh ? "点击按钮，开启全屏中秋动画" : "Tap to open the full-screen Mid-Autumn animation";
  const stageTitle = zh ? "中秋快乐" : "Happy Mid-Autumn";
  const stageCopy = zh ? "月满 · 人安 · 事事圆满" : "Full moon · Peace · Everything comes together";
  const replay = zh ? "再看一次" : "Replay";
  const close = zh ? "关闭" : "Close";
  const otherHref = zh ? "/en/mid-autumn" : "/zh-cn/mid-autumn";
  const otherLabel = zh ? "EN" : "ZH";

  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#090713">
  <title>${title}</title>
  <style>
    :root{
      color-scheme:dark;
      --bg:#090713;
      --bg2:#160d26;
      --ink:#fff9eb;
      --muted:rgba(255,249,235,.68);
      --gold:#f5d78c;
      --gold2:#ffefb7;
      --line:rgba(255,238,190,.16);
      --glass:rgba(20,12,35,.46);
    }
    *{box-sizing:border-box}
    html,body{margin:0;min-height:100%;background:var(--bg);color:var(--ink)}
    html{scroll-behavior:smooth}
    body{
      min-height:100svh;
      overflow-x:hidden;
      font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","PingFang SC","Microsoft YaHei",system-ui,sans-serif;
      background:
        radial-gradient(circle at 72% 22%,rgba(244,207,120,.12),transparent 28rem),
        radial-gradient(circle at 28% 90%,rgba(101,55,145,.22),transparent 34rem),
        linear-gradient(155deg,#080711 0%,#100b1d 48%,#170d28 100%);
    }
    body.stage-open{overflow:hidden;touch-action:none}
    button,a{font:inherit}
    a{color:inherit;text-decoration:none}
    .shell{
      min-height:100svh;
      width:min(1180px,calc(100% - 34px));
      margin:0 auto;
      padding:max(18px,env(safe-area-inset-top)) 0 max(22px,env(safe-area-inset-bottom));
      display:flex;
      flex-direction:column;
      position:relative;
      isolation:isolate;
    }
    .shell::before{
      content:"";
      position:absolute;
      inset:4% -10% auto auto;
      width:min(68vw,700px);
      aspect-ratio:1;
      border-radius:50%;
      background:radial-gradient(circle,rgba(255,223,146,.08),rgba(255,223,146,.025) 42%,transparent 70%);
      filter:blur(4px);
      z-index:-1;
    }
    .topbar{
      min-height:58px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:18px;
    }
    .brand{
      display:inline-flex;
      align-items:center;
      gap:12px;
      min-width:0;
      color:var(--ink);
    }
    .brand-logo{
      width:42px;
      height:42px;
      object-fit:contain;
      flex:0 0 auto;
      filter:drop-shadow(0 8px 24px rgba(0,0,0,.2));
    }
    .brand-stack{display:flex;flex-direction:column;gap:4px;min-width:0}
    .brand-word{
      display:flex;
      align-items:center;
      height:18px;
      width:104px;
      color:#fff;
      line-height:1;
      overflow:visible;
    }
    .brand-word .aertex-wordmark-token{width:104px;height:20px}
    .brand-sub{
      color:rgba(255,255,255,.48);
      font-size:10px;
      font-weight:650;
      letter-spacing:.19em;
      text-transform:uppercase;
      white-space:nowrap;
    }
    .lang{
      height:38px;
      min-width:48px;
      padding:0 13px;
      border:1px solid var(--line);
      border-radius:999px;
      display:grid;
      place-items:center;
      color:rgba(255,248,226,.82);
      background:rgba(255,255,255,.035);
      -webkit-backdrop-filter:blur(16px);
      backdrop-filter:blur(16px);
      font-size:12px;
      font-weight:720;
    }
    .hero{
      flex:1;
      display:grid;
      grid-template-columns:minmax(0,1fr) minmax(340px,.86fr);
      align-items:center;
      gap:clamp(36px,7vw,92px);
      padding:clamp(70px,11vh,116px) 0 clamp(58px,10vh,96px);
    }
    .copy{max-width:710px}
    .eyebrow{
      margin:0 0 20px;
      color:var(--gold);
      font-size:11px;
      font-weight:760;
      letter-spacing:.25em;
      text-transform:uppercase;
    }
    h1{
      margin:0;
      font-size:clamp(58px,8.2vw,118px);
      line-height:.94;
      letter-spacing:-.055em;
      font-weight:820;
      text-wrap:balance;
    }
    .name{
      display:block;
      margin-bottom:12px;
      color:var(--gold2);
      font-size:clamp(28px,4vw,54px);
      line-height:1.08;
      letter-spacing:-.035em;
      font-weight:720;
    }
    .lead{
      max-width:620px;
      margin:28px 0 0;
      color:var(--muted);
      font-size:clamp(17px,2vw,22px);
      line-height:1.78;
      text-wrap:pretty;
    }
    .actions{
      margin-top:36px;
      display:flex;
      flex-wrap:wrap;
      align-items:center;
      gap:14px;
    }
    .start{
      position:relative;
      min-height:50px;
      padding:0 23px;
      border:0;
      border-radius:999px;
      color:#36250e;
      background:linear-gradient(145deg,#fff3c8 0%,#efd184 52%,#d9ae55 100%);
      box-shadow:0 18px 48px rgba(0,0,0,.28),inset 0 1px rgba(255,255,255,.5);
      font-size:14px;
      font-weight:780;
      cursor:pointer;
      transition:transform .18s ease,box-shadow .18s ease;
      overflow:hidden;
    }
    .start::after{
      content:"";
      position:absolute;
      inset:-60% -30%;
      background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.5) 49%,transparent 63%);
      transform:translateX(-72%);
      animation:sheen 4s ease-in-out infinite;
    }
    .start:hover{transform:translateY(-2px);box-shadow:0 22px 58px rgba(0,0,0,.32),inset 0 1px rgba(255,255,255,.5)}
    .start:active{transform:scale(.985)}
    @keyframes sheen{0%,68%{transform:translateX(-72%)}85%,100%{transform:translateX(72%)}}
    .hint{color:rgba(255,255,255,.42);font-size:12px;line-height:1.5}
    .art{
      min-height:520px;
      display:grid;
      place-items:center;
      position:relative;
    }
    .moon-wrap{
      width:min(450px,82vw);
      aspect-ratio:1;
      position:relative;
      display:grid;
      place-items:center;
    }
    .halo{
      position:absolute;
      inset:-16%;
      border-radius:50%;
      background:radial-gradient(circle,rgba(255,225,154,.2) 0%,rgba(255,225,154,.07) 43%,transparent 70%);
      filter:blur(8px);
      animation:breathe 5.4s ease-in-out infinite;
    }
    .moon{
      width:76%;
      aspect-ratio:1;
      border-radius:50%;
      position:relative;
      overflow:hidden;
      background:
        radial-gradient(circle at 35% 31%,rgba(255,255,255,.62) 0 4%,transparent 5%),
        radial-gradient(circle at 63% 68%,rgba(183,141,74,.17) 0 7%,transparent 8%),
        radial-gradient(circle at 41% 65%,rgba(193,149,74,.13) 0 10%,transparent 11%),
        radial-gradient(circle at 67% 31%,rgba(174,127,61,.12) 0 8%,transparent 9%),
        radial-gradient(circle at 45% 42%,#fff4c9 0%,#f4d88c 54%,#d7ad59 100%);
      box-shadow:0 0 44px rgba(244,211,132,.28),0 0 130px rgba(244,211,132,.14);
    }
    .moon::after{
      content:"";
      position:absolute;
      inset:0;
      border-radius:50%;
      box-shadow:inset -28px -34px 50px rgba(109,72,29,.22),inset 18px 16px 30px rgba(255,255,255,.18);
    }
    .ring{
      position:absolute;
      inset:4%;
      border:1px solid rgba(255,231,170,.14);
      border-radius:50%;
      transform:scaleY(.58) rotate(12deg);
    }
    .ring.r2{inset:-9%;opacity:.55;transform:scaleY(.58) rotate(-15deg)}
    .cloud{
      position:absolute;
      height:38px;
      border-radius:999px;
      background:linear-gradient(90deg,transparent,rgba(235,224,255,.14),rgba(255,241,212,.14),transparent);
      filter:blur(.2px);
    }
    .cloud.c1{width:66%;left:-4%;bottom:25%;animation:floatA 8s ease-in-out infinite}
    .cloud.c2{width:58%;right:-2%;top:27%;opacity:.72;animation:floatB 9s ease-in-out infinite}
    @keyframes breathe{50%{transform:scale(1.05);opacity:.78}}
    @keyframes floatA{50%{transform:translateX(24px)}}
    @keyframes floatB{50%{transform:translateX(-22px)}}
    .footer{
      display:flex;
      justify-content:space-between;
      gap:18px;
      padding-top:20px;
      border-top:1px solid rgba(255,255,255,.07);
      color:rgba(255,255,255,.34);
      font-size:10px;
      font-weight:650;
      letter-spacing:.17em;
      text-transform:uppercase;
    }

    .festival-stage{
      position:fixed;
      inset:0;
      z-index:9999;
      width:100vw;
      height:100vh;
      height:100dvh;
      opacity:0;
      visibility:hidden;
      pointer-events:none;
      overflow:hidden;
      background:
        radial-gradient(circle at 50% 44%,rgba(62,39,83,.42),transparent 42%),
        linear-gradient(180deg,#06040d 0%,#0d0718 60%,#160b23 100%);
      transition:opacity .55s ease,visibility 0s linear .55s;
      isolation:isolate;
    }
    .festival-stage.active{
      opacity:1;
      visibility:visible;
      pointer-events:auto;
      transition:opacity .55s ease;
    }
    #festival-canvas{position:absolute;inset:0;width:100%;height:100%;z-index:1}
    .stage-glow{
      position:absolute;
      left:50%;top:45%;
      width:min(62vw,720px);
      aspect-ratio:1;
      transform:translate(-50%,-50%) scale(.62);
      border-radius:50%;
      background:radial-gradient(circle,rgba(255,225,148,.22),rgba(255,225,148,.07) 40%,transparent 70%);
      filter:blur(12px);
      opacity:0;
      z-index:0;
    }
    .active .stage-glow{animation:stageGlow 2.2s .2s cubic-bezier(.2,.75,.2,1) forwards}
    .stage-moon{
      position:absolute;
      left:50%;top:42%;
      width:min(49vw,520px);
      max-width:74vh;
      aspect-ratio:1;
      transform:translate(-50%,-50%) scale(.18);
      border-radius:50%;
      opacity:0;
      z-index:2;
      background:
        radial-gradient(circle at 36% 30%,rgba(255,255,255,.55) 0 3.6%,transparent 4.6%),
        radial-gradient(circle at 62% 68%,rgba(170,122,57,.15) 0 8%,transparent 9%),
        radial-gradient(circle at 42% 63%,rgba(171,123,58,.12) 0 12%,transparent 13%),
        radial-gradient(circle at 49% 45%,#fff6d0 0%,#f4d786 56%,#c89442 100%);
      box-shadow:0 0 40px rgba(250,221,141,.28),0 0 150px rgba(250,221,141,.18);
    }
    .active .stage-moon{animation:moonEnter 1.8s .2s cubic-bezier(.16,.82,.25,1) forwards}
    .stage-moon::after{
      content:"";
      position:absolute;inset:0;border-radius:50%;
      box-shadow:inset -40px -44px 70px rgba(97,57,15,.2),inset 22px 18px 40px rgba(255,255,255,.16);
    }
    .stage-cloud{
      position:absolute;
      height:54px;
      border-radius:999px;
      z-index:3;
      opacity:0;
      filter:blur(.5px);
      background:linear-gradient(90deg,transparent,rgba(213,201,238,.12),rgba(255,239,200,.18),rgba(213,201,238,.11),transparent);
    }
    .stage-cloud.left{width:52vw;left:-10vw;top:47%}
    .stage-cloud.right{width:48vw;right:-8vw;top:35%}
    .active .stage-cloud.left{animation:cloudLeft 2.4s .65s ease-out forwards}
    .active .stage-cloud.right{animation:cloudRight 2.6s .85s ease-out forwards}
    .stage-brand{
      position:absolute;
      top:max(20px,env(safe-area-inset-top));
      left:50%;
      transform:translateX(-50%) translateY(-12px);
      z-index:7;
      display:flex;
      align-items:center;
      gap:10px;
      opacity:0;
      color:rgba(255,250,236,.84);
    }
    .active .stage-brand{animation:fadeDown .85s .45s ease forwards}
    .stage-brand img{width:28px;height:28px;object-fit:contain}
    .stage-brand .aertex-wordmark-token{width:86px;height:17px}
    .stage-copy{
      position:absolute;
      left:50%;
      top:69%;
      width:min(92vw,900px);
      transform:translate(-50%,18px);
      z-index:7;
      text-align:center;
      opacity:0;
      padding:0 18px;
    }
    .active .stage-copy{animation:copyEnter 1s 1.45s cubic-bezier(.2,.75,.2,1) forwards}
    .stage-name{
      display:block;
      margin:0 0 9px;
      color:var(--gold2);
      font-size:clamp(16px,2.4vw,24px);
      font-weight:680;
      letter-spacing:.02em;
    }
    .stage-title{
      margin:0;
      font-size:clamp(46px,9vw,104px);
      line-height:.98;
      letter-spacing:-.055em;
      font-weight:820;
      text-shadow:0 9px 40px rgba(0,0,0,.35);
    }
    .stage-copy p{
      margin:16px 0 0;
      color:rgba(255,248,226,.7);
      font-size:clamp(14px,2vw,20px);
      letter-spacing:.08em;
    }
    .lantern{
      position:absolute;
      z-index:4;
      width:42px;
      height:58px;
      border-radius:46% 46% 40% 40%;
      opacity:0;
      background:linear-gradient(90deg,#8c2c1d,#d9652d 43%,#f4a14d 52%,#b84124);
      box-shadow:0 0 28px rgba(255,143,65,.26),inset 0 0 10px rgba(255,221,137,.28);
    }
    .lantern::before,.lantern::after{content:"";position:absolute;left:6px;right:6px;height:4px;border-radius:4px;background:#d9aa63}
    .lantern::before{top:-3px}.lantern::after{bottom:-3px}
    .lantern.l1{left:9%;bottom:4%;transform:scale(.7)}
    .lantern.l2{right:11%;bottom:10%;transform:scale(.54)}
    .lantern.l3{left:22%;bottom:-2%;transform:scale(.42)}
    .lantern.l4{right:25%;bottom:1%;transform:scale(.38)}
    .active .lantern.l1{animation:lanternUp 8s 1.2s ease-in infinite}
    .active .lantern.l2{animation:lanternUp 9s 2.1s ease-in infinite}
    .active .lantern.l3{animation:lanternUp 8.5s 3.2s ease-in infinite}
    .active .lantern.l4{animation:lanternUp 10s 4s ease-in infinite}
    .stage-controls{
      position:absolute;
      left:50%;
      bottom:max(18px,env(safe-area-inset-bottom));
      transform:translateX(-50%) translateY(12px);
      z-index:9;
      display:flex;
      gap:10px;
      opacity:0;
    }
    .active .stage-controls{animation:controlsEnter .8s 2.2s ease forwards}
    .stage-btn{
      min-height:40px;
      padding:0 16px;
      border-radius:999px;
      border:1px solid rgba(255,242,207,.16);
      background:rgba(12,7,22,.38);
      color:rgba(255,250,235,.82);
      -webkit-backdrop-filter:blur(18px);
      backdrop-filter:blur(18px);
      font-size:12px;
      font-weight:700;
      cursor:pointer;
    }
    .stage-btn.primary{background:rgba(239,208,132,.92);color:#2f2110;border-color:transparent}
    @keyframes stageGlow{to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
    @keyframes moonEnter{0%{opacity:0;transform:translate(-50%,-50%) scale(.18)}55%{opacity:1}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}
    @keyframes cloudLeft{from{opacity:0;transform:translateX(-12%)}to{opacity:1;transform:translateX(18%)}}
    @keyframes cloudRight{from{opacity:0;transform:translateX(14%)}to{opacity:1;transform:translateX(-18%)}}
    @keyframes fadeDown{to{opacity:1;transform:translateX(-50%) translateY(0)}}
    @keyframes copyEnter{to{opacity:1;transform:translate(-50%,0)}}
    @keyframes controlsEnter{to{opacity:1;transform:translateX(-50%) translateY(0)}}
    @keyframes lanternUp{
      0%{opacity:0;translate:0 0}
      10%{opacity:.88}
      70%{opacity:.72}
      100%{opacity:0;translate:0 -88vh}
    }
    @media(max-width:850px){
      .hero{grid-template-columns:1fr;text-align:center;padding-top:64px;gap:44px}
      .copy{margin:0 auto}
      .lead{margin-left:auto;margin-right:auto}
      .actions{justify-content:center}
      .art{min-height:360px}
      .moon-wrap{width:min(350px,80vw)}
      .footer{margin-top:12px}
      .stage-moon{width:min(72vw,430px);top:39%}
      .stage-copy{top:66%}
    }
    @media(max-width:520px){
      .shell{width:min(100% - 26px,1180px)}
      .topbar{min-height:54px}
      .brand-logo{width:36px;height:36px}
      .brand-word,.brand-word .aertex-wordmark-token{width:92px}
      .brand-sub{font-size:9px}
      .hero{padding-top:48px;padding-bottom:44px}
      h1{font-size:clamp(54px,17vw,80px)}
      .name{font-size:clamp(25px,8vw,36px)}
      .art{min-height:310px}
      .moon-wrap{width:min(300px,78vw)}
      .footer{flex-direction:column;gap:8px;align-items:center;text-align:center}
      .stage-moon{width:min(78vw,370px);top:38%}
      .stage-copy{top:65%;padding:0 12px}
      .stage-title{font-size:clamp(44px,15vw,72px)}
      .stage-copy p{font-size:13px}
      .stage-controls{width:100%;justify-content:center}
    }
    @media(prefers-reduced-motion:reduce){
      *,*::before,*::after{animation:none!important;transition:none!important}
      .festival-stage.active{opacity:1;visibility:visible}
      .festival-stage.active .stage-glow,
      .festival-stage.active .stage-moon,
      .festival-stage.active .stage-brand,
      .festival-stage.active .stage-copy,
      .festival-stage.active .stage-controls{opacity:1}
      .festival-stage.active .stage-moon{transform:translate(-50%,-50%) scale(1)}
      .festival-stage.active .stage-brand{transform:translateX(-50%)}
      .festival-stage.active .stage-copy{transform:translate(-50%,0)}
      .festival-stage.active .stage-controls{transform:translateX(-50%)}
    }
  </style>
</head>
<body>
  <main class="shell">
    <header class="topbar">
      <a class="brand" href="${zh ? "/zh-cn" : "/en"}" aria-label="AERTEX">
        <img class="brand-logo" src="/favicon.svg?v=aertex-20260924-3" alt="" aria-hidden="true">
        <span class="brand-stack">
          <span class="brand-word">AERTEX</span>
          <span class="brand-sub">Mid-Autumn Greeting</span>
        </span>
      </a>
      <a class="lang" href="${otherHref}">${otherLabel}</a>
    </header>

    <section class="hero">
      <div class="copy">
        <p class="eyebrow">AERTEX · MID-AUTUMN</p>
        <h1><span class="name" id="person-name" hidden></span>${blessing}</h1>
        <p class="lead">${lead}</p>
        <div class="actions">
          <button class="start" id="start-festival" type="button">${action}</button>
          <span class="hint">${hint}</span>
        </div>
      </div>

      <div class="art" aria-hidden="true">
        <div class="moon-wrap">
          <div class="halo"></div>
          <div class="ring"></div>
          <div class="ring r2"></div>
          <div class="moon"></div>
          <div class="cloud c1"></div>
          <div class="cloud c2"></div>
        </div>
      </div>
    </section>

    <footer class="footer">
      <span>AERTEX · MID-AUTUMN</span>
      <span id="footer-year"></span>
    </footer>
  </main>

  <section class="festival-stage" id="festival-stage" aria-hidden="true" aria-label="${stageTitle}">
    <canvas id="festival-canvas" aria-hidden="true"></canvas>
    <div class="stage-glow" aria-hidden="true"></div>
    <div class="stage-moon" aria-hidden="true"></div>
    <div class="stage-cloud left" aria-hidden="true"></div>
    <div class="stage-cloud right" aria-hidden="true"></div>

    <div class="stage-brand" aria-label="AERTEX">
      <img src="/favicon.svg?v=aertex-20260924-3" alt="" aria-hidden="true">
      <span>AERTEX</span>
    </div>

    <i class="lantern l1" aria-hidden="true"></i>
    <i class="lantern l2" aria-hidden="true"></i>
    <i class="lantern l3" aria-hidden="true"></i>
    <i class="lantern l4" aria-hidden="true"></i>

    <div class="stage-copy">
      <span class="stage-name" id="stage-name" hidden></span>
      <h2 class="stage-title">${stageTitle}</h2>
      <p>${stageCopy}</p>
    </div>

    <div class="stage-controls">
      <button class="stage-btn primary" id="replay-festival" type="button">${replay}</button>
      <button class="stage-btn" id="close-festival" type="button">${close}</button>
    </div>
  </section>

  <script>
  (function(){
    var zh = ${JSON.stringify(zh)};
    var params = new URLSearchParams(location.search);
    var name = (params.get("name") || "").trim().slice(0,36);
    var person = document.getElementById("person-name");
    var stageName = document.getElementById("stage-name");
    var stage = document.getElementById("festival-stage");
    var start = document.getElementById("start-festival");
    var replay = document.getElementById("replay-festival");
    var close = document.getElementById("close-festival");
    var reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.getElementById("footer-year").textContent = "© " + new Date().getFullYear();

    if(name){
      person.textContent = zh ? name + "，" : name + ",";
      person.hidden = false;
      stageName.textContent = zh ? name + "，愿你今夜月圆人安" : name + ", wishing you a peaceful moonlit night";
      stageName.hidden = false;
      document.title = name + " · " + ${JSON.stringify(title)};
    }

    var canvas = document.getElementById("festival-canvas");
    var ctx = canvas.getContext("2d");
    var ratio = 1;
    var w = 0;
    var h = 0;
    var stars = [];
    var sparks = [];
    var raf = 0;
    var startedAt = 0;
    var burstTimers = [];

    function resize(){
      ratio = Math.min(window.devicePixelRatio || 1,2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.max(1,Math.floor(w * ratio));
      canvas.height = Math.max(1,Math.floor(h * ratio));
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(ratio,0,0,ratio,0,0);
      makeStars();
    }

    function makeStars(){
      stars = [];
      var count = Math.min(150,Math.max(60,Math.floor((w*h)/10500)));
      for(var i=0;i<count;i++){
        stars.push({
          x:Math.random()*w,
          y:Math.random()*h*.75,
          r:.35+Math.random()*1.25,
          a:.18+Math.random()*.55,
          tw:Math.random()*Math.PI*2
        });
      }
    }

    function firework(x,y,scale){
      if(reduceMotion) return;
      var colors = ["#fff2bd","#f5d77e","#ffb35e","#fff9e8","#e9c8ff"];
      var total = Math.floor(34 + 30*(scale||1));
      for(var i=0;i<total;i++){
        var angle = Math.PI*2*(i/total) + (Math.random()-.5)*.08;
        var speed = (2.2+Math.random()*3.2)*(scale||1);
        sparks.push({
          x:x,y:y,
          vx:Math.cos(angle)*speed,
          vy:Math.sin(angle)*speed,
          life:58+Math.random()*34,
          max:92,
          r:.8+Math.random()*1.7,
          c:colors[(Math.random()*colors.length)|0],
          tail:[]
        });
      }
    }

    function scheduleBursts(){
      clearBursts();
      if(reduceMotion) return;
      var plan = [
        [900,.22,.28,.72],
        [1500,.78,.25,.82],
        [2200,.17,.48,.68],
        [2900,.84,.45,.72],
        [3600,.31,.20,.58],
        [4300,.69,.17,.62],
        [5300,.50,.28,.86]
      ];
      plan.forEach(function(p){
        burstTimers.push(setTimeout(function(){
          if(stage.classList.contains("active")) firework(w*p[1],h*p[2],p[3]);
        },p[0]));
      });
    }

    function clearBursts(){
      burstTimers.forEach(clearTimeout);
      burstTimers = [];
    }

    function draw(ts){
      ctx.clearRect(0,0,w,h);
      var t = (ts-startedAt)/1000;

      for(var i=0;i<stars.length;i++){
        var s = stars[i];
        var alpha = s.a*(.72+.28*Math.sin(t*1.4+s.tw));
        ctx.beginPath();
        ctx.fillStyle = "rgba(255,246,221,"+alpha+")";
        ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fill();
      }

      for(var j=sparks.length-1;j>=0;j--){
        var p = sparks[j];
        p.life--;
        if(p.life<=0){sparks.splice(j,1);continue}
        p.vy += .018;
        p.vx *= .992;
        p.vy *= .994;
        p.x += p.vx;
        p.y += p.vy;
        p.tail.push([p.x,p.y]);
        if(p.tail.length>5) p.tail.shift();
        var a = Math.min(1,p.life/24);

        if(p.tail.length>1){
          ctx.beginPath();
          ctx.moveTo(p.tail[0][0],p.tail[0][1]);
          for(var k=1;k<p.tail.length;k++) ctx.lineTo(p.tail[k][0],p.tail[k][1]);
          ctx.strokeStyle = p.c;
          ctx.globalAlpha = a*.2;
          ctx.lineWidth = .8;
          ctx.stroke();
        }

        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.fillStyle = p.c;
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      if(stage.classList.contains("active")) raf = requestAnimationFrame(draw);
      else raf = 0;
    }

    function restartAnimation(){
      stage.classList.remove("active");
      void stage.offsetWidth;
      stage.classList.add("active");
      sparks = [];
      startedAt = performance.now();
      scheduleBursts();
      if(!raf) raf = requestAnimationFrame(draw);
    }

    function openStage(){
      stage.setAttribute("aria-hidden","false");
      document.body.classList.add("stage-open");
      stage.classList.add("active");
      resize();
      startedAt = performance.now();
      sparks = [];
      scheduleBursts();
      if(!raf) raf = requestAnimationFrame(draw);
      setTimeout(function(){ close.focus({preventScroll:true}); },2300);
    }

    function closeStage(){
      stage.classList.remove("active");
      stage.setAttribute("aria-hidden","true");
      document.body.classList.remove("stage-open");
      clearBursts();
      sparks = [];
      if(raf){cancelAnimationFrame(raf);raf=0}
      ctx.clearRect(0,0,w,h);
      start.focus({preventScroll:true});
    }

    start.addEventListener("click",openStage);
    replay.addEventListener("click",restartAnimation);
    close.addEventListener("click",closeStage);
    stage.addEventListener("pointerdown",function(event){
      if(!stage.classList.contains("active") || reduceMotion) return;
      if(event.target.closest("button")) return;
      firework(event.clientX,event.clientY,.62);
    });
    window.addEventListener("keydown",function(event){
      if(event.key==="Escape" && stage.classList.contains("active")) closeStage();
    });
    window.addEventListener("resize",resize,{passive:true});
    resize();
  })();
  <\/script>
</body>
</html>`;
}
