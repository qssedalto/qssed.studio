export function birthdayPage(locale = "zh") {
  const zh = locale === "zh";
  const lang = zh ? "zh-CN" : "en";
  const title = zh ? "生日快乐 · AERTEX" : "Happy Birthday · AERTEX";
  const headline = zh ? "生日快乐" : "Happy Birthday";
  const eyebrow = zh ? "AERTEX · BIRTHDAY" : "AERTEX · BIRTHDAY";
  const subline = zh
    ? "今天只说一件事：生日快乐。希望接下来这一年，想做的事能慢慢做成，想见的人都有机会见到。"
     : "Happy birthday. I hope the year ahead gives you more time for the people and things you actually care about.";
  const action = zh ? "庆祝一下" : "Celebrate";
  const explore = zh ? "看看后面" : "Keep going";
  const sectionTitle = zh ? "又长大一岁。" : "One year older.";
  const sectionCopy = zh
    ? "没什么大道理。照顾好自己，继续做喜欢的事，也别把所有事情都想得太重。"
     : "No big speech. Take care of yourself, keep doing what you like, and do not take every little thing too seriously.";
  const cards = zh
    ? [
        ["01", "多一点开心", "能吃好吃的，能睡个好觉，也能常碰上顺心的事。"],
        ["02", "多一点运气", "重要的时候刚好有答案，想争取的事情也能多一点好结果。"],
        ["03", "多一点时间", "留给朋友，留给兴趣，也留给什么都不做的时候。"]
      ]
    : [
        ["01", "More good days", "Good food, good sleep, and more ordinary days that simply go your way."],
        ["02", "More luck", "The right answer at the right time, and a few more things working out in your favor."],
        ["03", "More time", "For friends, for hobbies, and for doing absolutely nothing when you need it."]
      ];
  const momentTitle = zh ? "今天就是你的日子。" : "Today is yours.";
  const momentCopy = zh
    ? "这一页没有什么特别任务。记住今天，收下祝福，然后去好好过生日。"
     : "Nothing complicated here. Remember the date, take the good wishes, and go enjoy your birthday.";
  const wishTitle = zh ? "许个愿吧。" : "Make a wish.";
  const wishCopy = zh
    ? "想什么都行，别告诉我。"
     : "Anything you want. No need to tell me.";
  const wishButton = zh ? "吹灭蜡烛" : "Blow out the candles";
  const wishDone = zh ? "好，替你保密 ✦" : "Got it. Secret kept ✦";
  const closing = zh ? "生日快乐。希望明年再看到这句话的时候，你会觉得这一年过得还不错。" : "Happy birthday. I hope when you see this again next year, you can say this year turned out pretty well.";
  const otherHref = zh ? "/en/birthday" : "/zh-cn/birthday";
  const otherLabel = zh ? "ZH" : "EN";

  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#d92d20">
  <title>${title}</title>
  <style>
    :root{
      color-scheme:dark;
      --red:#d92d20;
      --red-bright:#f0442e;
      --red-deep:#8f1713;
      --gold:#f4cf86;
      --gold-bright:#ffe0a3;
      --paper:#fff6e7;
      --muted:rgba(255,246,231,.7);
      --faint:rgba(255,246,231,.46);
      --hairline:rgba(255,231,184,.18);
      --surface:rgba(91,13,11,.26);
    }
    *{box-sizing:border-box}
    html{scroll-behavior:smooth;background:#a81d17}
    body{
      margin:0;
      min-height:100%;
      overflow-x:hidden;
      font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","PingFang SC","Microsoft YaHei",system-ui,sans-serif;
      color:var(--paper);
      background:
        radial-gradient(circle at 74% 3%,rgba(255,210,126,.18),transparent 28rem),
        linear-gradient(180deg,#ef412c 0%,#d92d20 28%,#b81e18 63%,#8f1713 100%);
    }
    body::before{
      content:"";
      position:fixed;inset:0;
      pointer-events:none;
      opacity:.16;
      background-image:radial-gradient(rgba(255,243,218,.8) .55px,transparent .55px);
      background-size:11px 11px;
      mix-blend-mode:soft-light;
      z-index:50;
    }
    a{color:inherit;text-decoration:none}
    button{font:inherit}
    .nav-wrap{
      position:fixed;
      top:calc(12px + env(safe-area-inset-top));
      left:16px;right:16px;
      z-index:40;
      display:flex;
      justify-content:center;
      pointer-events:none;
    }
    .nav{
      width:min(1080px,100%);
      min-height:52px;
      padding:7px 8px 7px 14px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:14px;
      border:1px solid rgba(255,237,201,.18);
      border-radius:18px;
      background:rgba(117,20,16,.34);
      -webkit-backdrop-filter:blur(22px) saturate(1.18);
      backdrop-filter:blur(22px) saturate(1.18);
      box-shadow:0 10px 35px rgba(76,6,4,.14);
      pointer-events:auto;
    }
    .brand{
      display:flex;align-items:center;gap:9px;
      font-size:12px;font-weight:750;letter-spacing:.18em;
    }
    .brand-mark{
      width:30px;height:30px;border-radius:10px;
      display:grid;place-items:center;
      border:1px solid rgba(255,232,184,.3);
      color:var(--gold-bright);
      background:rgba(255,255,255,.05);
      font-size:16px;font-weight:850;
    }
    .chip{
      min-height:38px;
      padding:0 14px;
      display:inline-flex;align-items:center;justify-content:center;
      border-radius:999px;
      color:#fff1d4;
      background:rgba(255,255,255,.07);
      border:1px solid rgba(255,238,201,.16);
      font-size:13px;font-weight:620;
    }
    .section{
      width:min(1120px,calc(100% - 36px));
      margin:0 auto;
      position:relative;
    }
    .hero{
      min-height:100svh;
      padding:clamp(124px,18vh,180px) 0 88px;
      display:grid;
      grid-template-columns:minmax(0,1.05fr) minmax(320px,.95fr);
      align-items:center;
      gap:clamp(34px,7vw,92px);
    }
    .hero-copy{max-width:700px}
    .eyebrow{
      margin:0 0 22px;
      color:var(--gold);
      font-size:12px;font-weight:750;letter-spacing:.27em;
      text-transform:uppercase;
    }
    h1{
      margin:0;
      font-size:clamp(66px,10.2vw,142px);
      line-height:.88;
      letter-spacing:-.062em;
      font-weight:860;
      text-wrap:balance;
    }
    .hero-name{
      display:block;
      margin-top:24px;
      color:var(--gold-bright);
      font-size:clamp(24px,3.4vw,46px);
      line-height:1.1;
      letter-spacing:.02em;
      font-weight:700;
    }
    .lead{
      max-width:650px;
      margin:30px 0 0;
      color:rgba(255,247,233,.82);
      font-size:clamp(17px,2vw,23px);
      line-height:1.75;
      text-wrap:pretty;
    }
    .hero-actions{
      margin-top:36px;
      display:flex;
      align-items:center;
      gap:12px;
      flex-wrap:wrap;
    }
    .primary,.secondary{
      min-height:46px;
      padding:0 20px;
      border-radius:999px;
      display:inline-flex;align-items:center;justify-content:center;
      font-size:14px;font-weight:700;
      cursor:pointer;
      transition:transform .2s ease,box-shadow .2s ease,background .2s ease;
    }
    .primary{
      border:0;
      color:#67120e;
      background:linear-gradient(145deg,#fff1c9,#efc16d);
      box-shadow:0 14px 35px rgba(79,7,4,.24);
    }
    .secondary{
      color:#fff0d0;
      border:1px solid rgba(255,236,195,.18);
      background:transparent;
    }
    .primary:hover,.secondary:hover{transform:translateY(-2px)}
    .primary:active,.secondary:active{transform:scale(.985)}
    .hero-art{
      min-height:520px;
      display:grid;
      place-items:center;
      position:relative;
      isolation:isolate;
    }
    .sun{
      width:min(430px,78vw);
      aspect-ratio:1;
      border-radius:50%;
      position:relative;
      background:
        radial-gradient(circle at 34% 28%,#ffe3a7 0%,#ffbc59 8%,#f35a31 37%,#d72c20 67%,#a81b16 100%);
      box-shadow:
        inset 0 0 70px rgba(255,232,183,.22),
        0 0 90px rgba(255,185,83,.14);
    }
    .sun::before,.sun::after{
      content:"";
      position:absolute;
      border:1px solid rgba(255,225,166,.5);
      border-radius:50%;
      inset:-16%;
      transform:rotate(18deg) scaleY(.62);
    }
    .sun::after{inset:-29%;opacity:.55}
    .sun-core{
      position:absolute;
      inset:23%;
      border-radius:50%;
      border:1px solid rgba(255,242,213,.17);
      display:grid;place-items:center;
      text-align:center;
      background:rgba(125,20,14,.1);
    }
    .sun-core strong{
      display:block;
      font-size:clamp(32px,5vw,58px);
      letter-spacing:-.04em;
      color:#fff2d5;
    }
    .sun-core span{
      display:block;margin-top:7px;
      font-size:11px;letter-spacing:.2em;
      color:rgba(255,240,209,.64);
      text-transform:uppercase;
    }
    .orbit-dot{
      position:absolute;
      width:10px;height:10px;border-radius:50%;
      background:var(--gold-bright);
      box-shadow:0 0 20px rgba(255,226,164,.7);
    }
    .dot-a{top:11%;right:5%}.dot-b{bottom:14%;left:2%;width:6px;height:6px}.dot-c{top:47%;left:-2%;width:5px;height:5px}
    .divider{
      width:min(1120px,calc(100% - 36px));
      height:1px;
      margin:0 auto;
      background:linear-gradient(90deg,transparent,var(--hairline),transparent);
    }
    .story{
      padding:clamp(100px,15vw,180px) 0;
    }
    .story-copy{max-width:900px}
    .kicker{
      margin:0 0 18px;
      color:var(--gold);
      font-size:12px;font-weight:720;letter-spacing:.22em;
      text-transform:uppercase;
    }
    h2{
      margin:0;
      max-width:980px;
      font-size:clamp(42px,7.2vw,92px);
      line-height:1.02;
      letter-spacing:-.048em;
      font-weight:820;
      text-wrap:balance;
    }
    .story-text{
      margin:28px 0 0;
      max-width:720px;
      color:var(--muted);
      font-size:clamp(17px,1.9vw,22px);
      line-height:1.8;
    }
    .cards{
      margin-top:64px;
      display:grid;
      grid-template-columns:repeat(3,1fr);
      gap:16px;
    }
    .card{
      min-height:310px;
      padding:28px;
      border-radius:28px;
      background:linear-gradient(180deg,rgba(117,16,13,.25),rgba(90,10,9,.18));
      border:1px solid rgba(255,232,188,.1);
      display:flex;
      flex-direction:column;
      justify-content:space-between;
    }
    .card-index{
      color:rgba(255,229,176,.45);
      font-size:12px;letter-spacing:.18em;font-weight:720;
    }
    .card h3{
      margin:0 0 12px;
      color:#fff1d3;
      font-size:clamp(25px,3vw,36px);
      letter-spacing:-.03em;
    }
    .card p{
      margin:0;
      color:rgba(255,245,225,.64);
      font-size:15px;
      line-height:1.72;
    }
    .moment{
      padding:clamp(105px,16vw,190px) 0;
      display:grid;
      grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);
      gap:clamp(34px,8vw,110px);
      align-items:center;
    }
    .moment-visual{
      aspect-ratio:1;
      border-radius:32px;
      position:relative;
      overflow:hidden;
      background:
        radial-gradient(circle at 62% 40%,rgba(255,224,160,.2),transparent 34%),
        linear-gradient(145deg,#c9251b,#921713);
      border:1px solid rgba(255,234,193,.1);
    }
    .moment-ring{
      position:absolute;
      width:72%;
      aspect-ratio:1;
      border-radius:50%;
      border:1px solid rgba(255,224,160,.38);
      left:14%;top:14%;
    }
    .moment-ring::before,.moment-ring::after{
      content:"";
      position:absolute;
      border-radius:50%;
      border:1px solid rgba(255,224,160,.2);
    }
    .moment-ring::before{inset:12%}
    .moment-ring::after{inset:28%}
    .moment-date{
      position:absolute;
      inset:0;
      display:grid;
      place-items:center;
      text-align:center;
      padding:26px;
    }
    .moment-date strong{
      display:block;
      color:#fff0ce;
      font-size:clamp(28px,4vw,52px);
      letter-spacing:-.04em;
    }
    .moment-date span{
      display:block;margin-top:10px;
      color:rgba(255,239,207,.55);
      font-size:11px;letter-spacing:.18em;
      text-transform:uppercase;
    }
    .moment-copy h2{font-size:clamp(40px,6.2vw,78px)}
    .moment-copy p{
      margin:26px 0 0;
      max-width:580px;
      color:var(--muted);
      font-size:clamp(17px,1.8vw,21px);
      line-height:1.8;
    }
    .wish-zone{
      padding:clamp(110px,16vw,190px) 0;
      text-align:center;
    }
    .wish-zone h2{margin-left:auto;margin-right:auto}
    .wish-zone .story-text{margin-left:auto;margin-right:auto}
    .candles{
      margin:54px auto 0;
      width:min(560px,92vw);
      height:210px;
      display:flex;
      justify-content:center;
      align-items:flex-end;
      gap:clamp(24px,7vw,54px);
    }
    .candle{
      width:36px;
      height:clamp(98px,15vw,142px);
      border-radius:16px 16px 7px 7px;
      position:relative;
      background:linear-gradient(90deg,#ebbd68,#ffe0a1 45%,#d99a45);
      box-shadow:0 16px 38px rgba(82,7,4,.2);
    }
    .candle:nth-child(2){height:170px}
    .flame{
      position:absolute;
      width:24px;height:36px;
      left:50%;top:-41px;
      transform:translateX(-50%) rotate(5deg);
      border-radius:52% 48% 48% 52% / 62% 64% 36% 38%;
      background:radial-gradient(circle at 50% 65%,#fff7dc 0 18%,#ffd36f 20% 48%,#ff7a39 66%,rgba(255,94,38,.08) 72%);
      filter:drop-shadow(0 0 12px rgba(255,205,102,.8));
      animation:flicker 1.55s ease-in-out infinite alternate;
      transform-origin:50% 100%;
    }
    .candle:nth-child(2) .flame{animation-delay:-.5s}.candle:nth-child(3) .flame{animation-delay:-1s}
    @keyframes flicker{
      from{transform:translateX(-50%) rotate(-3deg) scale(.96)}
      to{transform:translateX(-50%) rotate(4deg) scale(1.05)}
    }
    .candles.out .flame{
      opacity:0;
      transform:translateX(-50%) translateY(14px) scale(.3);
      transition:opacity .5s ease,transform .5s ease;
    }
    .wish-actions{margin-top:34px}
    .closing{
      min-height:76svh;
      padding:120px 0 110px;
      display:flex;
      flex-direction:column;
      justify-content:center;
      align-items:center;
      text-align:center;
    }
    .closing-mark{
      width:56px;height:56px;border-radius:18px;
      display:grid;place-items:center;
      margin-bottom:26px;
      border:1px solid rgba(255,232,188,.16);
      color:var(--gold-bright);
      font-size:27px;font-weight:850;
      background:rgba(255,255,255,.035);
    }
    .closing h2{max-width:900px}
    .closing p{
      max-width:680px;
      margin:28px 0 0;
      color:var(--muted);
      font-size:clamp(17px,2vw,22px);
      line-height:1.8;
    }
    .signature{
      margin-top:56px;
      color:rgba(255,234,194,.48);
      font-size:11px;font-weight:720;letter-spacing:.22em;
      text-transform:uppercase;
    }
    .footer{
      width:min(1120px,calc(100% - 36px));
      margin:0 auto;
      padding:24px 0 calc(28px + env(safe-area-inset-bottom));
      border-top:1px solid var(--hairline);
      display:flex;align-items:center;justify-content:space-between;gap:18px;
      color:rgba(255,237,204,.4);
      font-size:11px;letter-spacing:.14em;
    }
    canvas{
      position:fixed;inset:0;
      width:100%;height:100%;
      pointer-events:none;
      z-index:60;
    }
    .reveal{
      opacity:0;
      transform:translateY(22px);
      transition:opacity .75s cubic-bezier(.2,.7,.2,1),transform .75s cubic-bezier(.2,.7,.2,1);
    }
    .reveal.visible{opacity:1;transform:none}
    @media(max-width:860px){
      .hero{
        grid-template-columns:1fr;
        text-align:center;
        padding-top:132px;
        gap:58px;
      }
      .hero-copy{margin:0 auto}
      .hero-actions{justify-content:center}
      .hero-art{min-height:390px}
      .sun{width:min(340px,78vw)}
      .cards{grid-template-columns:1fr}
      .card{min-height:220px}
      .moment{grid-template-columns:1fr}
      .moment-visual{width:min(520px,100%);margin:0 auto}
      .moment-copy{text-align:center}
      .moment-copy p{margin-left:auto;margin-right:auto}
    }
    @media(max-width:560px){
      .section{width:min(100% - 28px,1120px)}
      .nav-wrap{left:12px;right:12px}
      .nav{border-radius:16px}
      .brand{letter-spacing:.13em}
      .hero{padding-bottom:72px}
      h1{font-size:clamp(60px,21vw,92px)}
      .hero-name{margin-top:20px}
      .lead{font-size:17px}
      .story{padding:92px 0}
      .cards{margin-top:44px}
      .card{padding:24px;border-radius:24px}
      .moment{padding:96px 0}
      .wish-zone{padding:96px 0}
      .candles{height:190px}
      .closing{min-height:68svh;padding:96px 0}
      .footer{flex-direction:column;align-items:flex-start}
    }
    @media(prefers-reduced-motion:reduce){
      html{scroll-behavior:auto}
      *,*::before,*::after{animation:none!important;transition:none!important}
      .reveal{opacity:1;transform:none}
    }
  </style>
</head>
<body>
  <canvas id="confetti" aria-hidden="true"></canvas>

  <div class="nav-wrap">
    <header class="nav">
      <a class="brand" href="${zh ? "/zh-cn" : "/en"}" aria-label="AERTEX">
        <span class="brand-mark" aria-hidden="true">A</span>
        <span>AERTEX</span>
      </a>
      <a class="chip" href="${otherHref}">${otherLabel}</a>
    </header>
  </div>

  <main>
    <section class="section hero">
      <div class="hero-copy reveal">
        <p class="eyebrow">${eyebrow}</p>
        <h1>${headline}<span class="hero-name" id="person-name" hidden></span></h1>
        <p class="lead">${subline}</p>
        <div class="hero-actions">
          <button class="primary" id="celebrate" type="button">${action}</button>
          <a class="secondary" href="#story">${explore}</a>
        </div>
      </div>

      <div class="hero-art reveal" aria-hidden="true">
        <div class="sun">
          <i class="orbit-dot dot-a"></i>
          <i class="orbit-dot dot-b"></i>
          <i class="orbit-dot dot-c"></i>
          <div class="sun-core">
            <div>
              <strong id="hero-day">24</strong>
              <span id="hero-month">September</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="divider"></div>

    <section class="section story" id="story">
      <div class="story-copy reveal">
        <p class="kicker">ONE MORE YEAR</p>
        <h2>${sectionTitle}</h2>
        <p class="story-text">${sectionCopy}</p>
      </div>
      <div class="cards">
        ${cards.map((card) => `
          <article class="card reveal">
            <span class="card-index">${card[0]}</span>
            <div>
              <h3>${card[1]}</h3>
              <p>${card[2]}</p>
            </div>
          </article>`).join("")}
      </div>
    </section>

    <div class="divider"></div>

    <section class="section moment">
      <div class="moment-visual reveal" aria-hidden="true">
        <div class="moment-ring"></div>
        <div class="moment-date">
          <div>
            <strong id="full-date"></strong>
            <span id="moment-label">TODAY</span>
          </div>
        </div>
      </div>
      <div class="moment-copy reveal">
        <p class="kicker">TODAY</p>
        <h2>${momentTitle}</h2>
        <p>${momentCopy}</p>
      </div>
    </section>

    <div class="divider"></div>

    <section class="section wish-zone">
      <div class="reveal">
        <p class="kicker">MAKE A WISH</p>
        <h2>${wishTitle}</h2>
        <p class="story-text">${wishCopy}</p>
      </div>
      <div class="candles reveal" id="candles" aria-hidden="true">
        <div class="candle"><i class="flame"></i></div>
        <div class="candle"><i class="flame"></i></div>
        <div class="candle"><i class="flame"></i></div>
      </div>
      <div class="wish-actions reveal">
        <button class="primary" id="wish-button" type="button">${wishButton}</button>
      </div>
    </section>

    <div class="divider"></div>

    <section class="section closing reveal">
      <div class="closing-mark" aria-hidden="true">A</div>
      <p class="kicker">AERTEX · HAPPY BIRTHDAY</p>
      <h2 id="closing-title">${headline}</h2>
      <p>${closing}</p>
      <div class="signature">AERTEX · <span id="year"></span></div>
    </section>
  </main>

  <footer class="footer">
    <span>AERTEX</span>
    <span id="footer-date"></span>
  </footer>

  <script>
    (function(){
      var zh = ${JSON.stringify(zh)};
      var locale = ${JSON.stringify(lang)};
      var params = new URLSearchParams(location.search);
      var name = (params.get("name") || "").trim().slice(0,36);
      var person = document.getElementById("person-name");
      var closingTitle = document.getElementById("closing-title");

      if(name){
        person.textContent = name;
        person.hidden = false;
        closingTitle.textContent = name + (zh ? "，生日快乐。" : ", happy birthday.");
        document.title = name + " · " + ${JSON.stringify(title)};
      }

      var now = new Date();
      document.getElementById("year").textContent = String(now.getFullYear());
      document.getElementById("hero-day").textContent = String(now.getDate()).padStart(2,"0");
      document.getElementById("hero-month").textContent = now.toLocaleDateString(locale,{month:"long",year:"numeric"});
      document.getElementById("full-date").textContent = now.toLocaleDateString(locale,{month:"long",day:"numeric"});
      document.getElementById("footer-date").textContent = now.toLocaleDateString(locale,{year:"numeric",month:"long",day:"numeric"});

      var reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
      var reveals = document.querySelectorAll(".reveal");
      if(reduceMotion || !("IntersectionObserver" in window)){
        for(var i=0;i<reveals.length;i++) reveals[i].classList.add("visible");
      }else{
        var observer = new IntersectionObserver(function(entries){
          entries.forEach(function(entry){
            if(entry.isIntersecting){
              entry.target.classList.add("visible");
              observer.unobserve(entry.target);
            }
          });
        },{threshold:.14});
        for(var j=0;j<reveals.length;j++) observer.observe(reveals[j]);
      }

      var canvas = document.getElementById("confetti");
      var ctx = canvas.getContext("2d");
      var particles = [];
      var running = false;

      function resize(){
        var ratio = Math.min(devicePixelRatio || 1,2);
        canvas.width = Math.floor(innerWidth * ratio);
        canvas.height = Math.floor(innerHeight * ratio);
        canvas.style.width = innerWidth + "px";
        canvas.style.height = innerHeight + "px";
        ctx.setTransform(ratio,0,0,ratio,0,0);
      }

      function burst(originY){
        if(reduceMotion) return;
        resize();
        particles = [];
        var count = Math.min(140,Math.max(80,Math.floor(innerWidth / 9)));
        for(var i=0;i<count;i++){
          particles.push({
            x:innerWidth*.5 + (Math.random()-.5)*100,
            y:originY || innerHeight*.56,
            vx:(Math.random()-.5)*12,
            vy:-7-Math.random()*10,
            g:.19+Math.random()*.13,
            size:4+Math.random()*7,
            spin:Math.random()*Math.PI,
            vr:(Math.random()-.5)*.35,
            life:85+Math.random()*70,
            warm:Math.random()>.28
          });
        }
        if(!running){running=true;requestAnimationFrame(frame)}
      }

      function frame(){
        ctx.clearRect(0,0,innerWidth,innerHeight);
        var alive = 0;
        for(var i=0;i<particles.length;i++){
          var p = particles[i];
          if(p.life<=0) continue;
          alive++;
          p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.spin+=p.vr;p.life--;
          ctx.save();
          ctx.translate(p.x,p.y);
          ctx.rotate(p.spin);
          ctx.globalAlpha=Math.max(0,Math.min(1,p.life/28));
          ctx.fillStyle=p.warm ? "#f4cf86" : "#fff3d1";
          ctx.fillRect(-p.size*.5,-p.size*.18,p.size,p.size*.36);
          ctx.restore();
        }
        if(alive){requestAnimationFrame(frame)}
        else{running=false;ctx.clearRect(0,0,innerWidth,innerHeight)}
      }

      document.getElementById("celebrate").addEventListener("click",function(){
        burst(innerHeight*.62);
        this.textContent = ${JSON.stringify(zh ? "好，庆祝过了 ✦" : "Celebrated ✦")};
      });

      document.getElementById("wish-button").addEventListener("click",function(){
        document.getElementById("candles").classList.add("out");
        burst(innerHeight*.68);
        this.textContent = ${JSON.stringify(wishDone)};
        this.disabled = true;
      });

      addEventListener("resize",resize,{passive:true});
      resize();
    })();
  </script>
</body>
</html>`;
}
