export function birthdayPage(locale = "zh") {
  const zh = locale === "zh";
  const lang = zh ? "zh-CN" : "en";
  const title = zh ? "生日快乐 · AERTEX" : "Happy Birthday · AERTEX";
  const headline = zh ? "生日快乐" : "Happy Birthday";
  const subline = zh
    ? "愿新的一岁，保持好奇、自由生长，所有期待都有回响。"
    : "May the year ahead stay curious, bright, and full of things worth looking forward to.";
  const wish = zh
    ? "愿你心有所向，行有所获，岁岁常欢愉。"
    : "May every good wish find its way to you.";
  const action = zh ? "点亮祝福" : "Light the wish";
  const hint = zh ? "在地址后加 ?name=名字，可以生成专属祝福。" : "Add ?name=YourName to the URL for a personal greeting.";
  const otherHref = zh ? "/en/birthday" : "/zh-cn/birthday";
  const otherLabel = zh ? "EN" : "中文";

  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#e62b1e">
  <title>${title}</title>
  <style>
    :root{
      color-scheme:dark;
      --red:#e63222;
      --red-deep:#b81412;
      --red-soft:#ff5b3d;
      --gold:#f7d28b;
      --gold-strong:#ffd995;
      --cream:#fff3d2;
      --ink:#5a110c;
      --glass:rgba(255,255,255,.08);
      --line:rgba(255,224,162,.58);
    }
    *{box-sizing:border-box}
    html,body{margin:0;min-height:100%;background:#c91d16}
    body{
      min-height:100svh;
      overflow-x:hidden;
      font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","PingFang SC","Microsoft YaHei",system-ui,sans-serif;
      color:#fff7e8;
      background:
        radial-gradient(circle at 66% 13%,rgba(255,210,122,.24),transparent 23rem),
        radial-gradient(circle at 14% 78%,rgba(255,205,113,.10),transparent 28rem),
        linear-gradient(160deg,#ff4a2f 0%,#e62b1e 44%,#b91412 100%);
    }
    body::before{
      content:"";
      position:fixed;inset:0;pointer-events:none;opacity:.27;
      background-image:radial-gradient(rgba(255,238,202,.55) .65px,transparent .65px);
      background-size:10px 10px;
      mix-blend-mode:soft-light;
    }
    a{color:inherit;text-decoration:none}
    button{font:inherit}
    .page{
      position:relative;
      min-height:100svh;
      overflow:hidden;
      isolation:isolate;
      padding:calc(18px + env(safe-area-inset-top)) 18px calc(24px + env(safe-area-inset-bottom));
    }
    .glow{
      position:absolute;z-index:-3;border-radius:50%;
      width:min(68vw,620px);aspect-ratio:1;
      top:-14vw;right:-12vw;
      background:radial-gradient(circle at 37% 34%,#ffd98f 0%,#ffb04d 9%,#f24b29 44%,rgba(170,16,13,.15) 73%,transparent 74%);
      box-shadow:inset 0 0 55px rgba(255,236,181,.25),0 0 72px rgba(255,193,102,.2);
      opacity:.88;
    }
    .orbit,.orbit::after{
      position:absolute;content:"";z-index:-2;border:1px solid rgba(255,222,150,.62);border-radius:50%;
    }
    .orbit{width:92vw;height:92vw;max-width:900px;max-height:900px;right:-31vw;top:-30vw;transform:rotate(18deg)}
    .orbit::after{inset:28px}
    .star{position:absolute;width:7px;height:7px;background:#ffe9b6;transform:rotate(45deg);box-shadow:0 0 17px 5px rgba(255,224,160,.55);z-index:-1}
    .star::before,.star::after{content:"";position:absolute;inset:2px -7px;background:#ffe9b6;border-radius:99px}
    .star::after{transform:rotate(90deg)}
    .s1{right:11%;top:11%}.s2{left:12%;top:34%;transform:scale(.65) rotate(45deg)}.s3{right:19%;top:47%;transform:scale(.45) rotate(45deg)}
    .topbar{
      width:min(1120px,100%);margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:16px;
      position:relative;z-index:5;
    }
    .brand{display:flex;align-items:center;gap:10px;font-weight:760;letter-spacing:.18em;font-size:13px}
    .brand-mark{width:30px;height:30px;border:1px solid rgba(255,236,193,.72);border-radius:10px;display:grid;place-items:center;background:rgba(255,255,255,.06);backdrop-filter:blur(10px)}
    .brand-mark::before{content:"A";font-weight:850;font-size:17px;color:var(--gold)}
    .top-actions{display:flex;align-items:center;gap:8px}
    .chip{
      display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:0 14px;border:1px solid rgba(255,235,194,.42);
      border-radius:999px;background:rgba(118,14,10,.14);backdrop-filter:blur(12px);font-size:13px;color:#fff2d2;
    }
    .stage{
      width:min(1120px,100%);margin:clamp(38px,7vh,82px) auto 0;
      display:grid;grid-template-columns:minmax(0,1.05fr) minmax(310px,.95fr);gap:clamp(26px,6vw,78px);align-items:center;
      position:relative;z-index:2;
    }
    .copy{max-width:640px}
    .eyebrow{
      margin:0 0 18px;color:var(--gold);font-size:12px;font-weight:760;letter-spacing:.28em;text-transform:uppercase;
      display:flex;align-items:center;gap:12px;
    }
    .eyebrow::before{content:"";width:44px;height:1px;background:linear-gradient(90deg,transparent,var(--gold))}
    h1{font-size:clamp(52px,8.3vw,108px);line-height:.92;margin:0;letter-spacing:-.055em;font-weight:850;text-wrap:balance}
    h1 .name{display:block;color:var(--gold-strong);font-size:.34em;line-height:1.35;letter-spacing:.04em;margin-top:18px;font-weight:690}
    .lead{font-size:clamp(17px,2.1vw,23px);line-height:1.75;color:rgba(255,246,228,.86);max-width:620px;margin:26px 0 0}
    .wish{margin:22px 0 0;font-family:"Songti SC","STSong",serif;color:#ffe3a7;font-size:clamp(16px,1.7vw,20px);letter-spacing:.08em}
    .controls{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:34px}
    .primary{
      position:relative;overflow:hidden;border:0;border-radius:999px;padding:14px 22px;min-width:144px;
      background:linear-gradient(145deg,#fff3cb,#f2c36f);color:#721b12;font-weight:760;box-shadow:0 14px 35px rgba(77,8,5,.28);
      cursor:pointer;transition:transform .18s ease,box-shadow .18s ease;
    }
    .primary:hover{transform:translateY(-2px);box-shadow:0 18px 42px rgba(77,8,5,.34)}
    .primary:active{transform:translateY(0) scale(.98)}
    .hint{font-size:12px;color:rgba(255,243,216,.62);margin-top:18px;max-width:520px}
    .envelope-wrap{perspective:1100px;display:grid;place-items:center}
    .envelope{
      width:min(390px,88vw);aspect-ratio:.64;border-radius:30px;
      position:relative;overflow:hidden;
      background:
        radial-gradient(circle at 72% 14%,rgba(255,221,144,.20),transparent 30%),
        linear-gradient(155deg,#ff4a30 0%,#ed3523 43%,#cb1d16 100%);
      box-shadow:0 34px 80px rgba(70,4,3,.34),inset 0 0 0 1px rgba(255,231,184,.16);
      transform:rotateY(-4deg) rotateX(2deg);
      transition:transform .6s cubic-bezier(.2,.7,.2,1),box-shadow .6s ease;
    }
    .envelope:hover{transform:rotateY(0) rotateX(0) translateY(-6px);box-shadow:0 42px 96px rgba(70,4,3,.42),inset 0 0 0 1px rgba(255,231,184,.2)}
    .envelope::before{
      content:"";position:absolute;left:-18%;right:-18%;height:47%;bottom:22%;border-radius:0 0 50% 50%;
      border-bottom:1px solid rgba(255,219,140,.86);transform:rotate(0.01deg);
      background:
        linear-gradient(168deg,transparent 0 44%,rgba(255,203,106,.15) 44.2% 44.7%,transparent 45%),
        linear-gradient(12deg,transparent 0 44%,rgba(255,203,106,.12) 44.2% 44.7%,transparent 45%);
    }
    .envelope::after{
      content:"";position:absolute;width:104px;height:104px;border-radius:50%;left:50%;bottom:18.5%;transform:translate(-50%,50%);
      background:radial-gradient(circle at 35% 30%,#fff0bd,#f3c16b 55%,#c9842e 100%);
      box-shadow:0 10px 23px rgba(92,18,9,.28),inset 0 0 0 1px rgba(255,248,223,.6);
    }
    .env-brand{position:absolute;top:22%;left:0;right:0;text-align:center;color:var(--gold);font-weight:800;font-size:clamp(34px,8vw,55px);letter-spacing:.06em;text-shadow:0 2px 16px rgba(125,35,14,.22)}
    .env-brand::first-letter{font-size:1.08em}
    .env-greet{position:absolute;top:38%;left:0;right:0;text-align:center;color:#ffe2a2;letter-spacing:.45em;padding-left:.45em;font-family:"Songti SC","STSong",serif;font-size:18px}
    .mountains{position:absolute;left:-4%;right:-4%;bottom:24%;height:32%;opacity:.95}
    .mountains svg{width:100%;height:100%;display:block}
    .date{position:absolute;left:24px;right:24px;bottom:8%;text-align:center;color:rgba(255,237,197,.58);font-size:11px;letter-spacing:.22em}
    .footer{width:min(1120px,100%);margin:clamp(40px,8vh,90px) auto 0;display:flex;align-items:center;justify-content:space-between;gap:16px;font-size:11px;letter-spacing:.14em;color:rgba(255,239,207,.48);position:relative;z-index:2}
    .footer-line{height:1px;flex:1;background:linear-gradient(90deg,rgba(255,224,160,.08),rgba(255,224,160,.42),rgba(255,224,160,.08))}
    canvas{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:20}
    @media (max-width:820px){
      .page{padding-left:16px;padding-right:16px}
      .stage{grid-template-columns:1fr;margin-top:42px;text-align:center;gap:42px}
      .copy{margin:0 auto}
      .eyebrow{justify-content:center}
      .eyebrow::before{display:none}
      .lead,.hint{margin-left:auto;margin-right:auto}
      .controls{justify-content:center}
      .envelope{width:min(330px,82vw);transform:none}
      .env-greet{font-size:16px}
      .footer{margin-top:56px}
      .glow{width:110vw;right:-58vw;top:-26vw}
    }
    @media (prefers-reduced-motion:reduce){
      *,*::before,*::after{scroll-behavior:auto!important;animation:none!important;transition:none!important}
    }
  </style>
</head>
<body>
  <canvas id="confetti" aria-hidden="true"></canvas>
  <div class="page">
    <div class="glow" aria-hidden="true"></div>
    <div class="orbit" aria-hidden="true"></div>
    <i class="star s1" aria-hidden="true"></i>
    <i class="star s2" aria-hidden="true"></i>
    <i class="star s3" aria-hidden="true"></i>

    <header class="topbar">
      <a class="brand" href="${zh ? "/zh-cn" : "/en"}" aria-label="AERTEX">
        <span class="brand-mark" aria-hidden="true"></span>
        <span>AERTEX</span>
      </a>
      <nav class="top-actions" aria-label="${zh ? "页面导航" : "Page navigation"}">
        <a class="chip" href="${otherHref}">${otherLabel}</a>
      </nav>
    </header>

    <main class="stage">
      <section class="copy">
        <p class="eyebrow">AERTEX · BIRTHDAY EDITION</p>
        <h1 id="headline">${headline}<span class="name" id="person-name" hidden></span></h1>
        <p class="lead">${subline}</p>
        <p class="wish">${wish}</p>
        <div class="controls">
          <button class="primary" id="celebrate" type="button">${action}</button>
        </div>
        <p class="hint">${hint}</p>
      </section>

      <section class="envelope-wrap" aria-label="${zh ? "AERTEX 生日红包封面" : "AERTEX birthday red envelope"}">
        <div class="envelope">
          <div class="env-brand">AERTEX</div>
          <div class="env-greet">${headline}</div>
          <div class="mountains" aria-hidden="true">
            <svg viewBox="0 0 600 230" preserveAspectRatio="none">
              <defs>
                <linearGradient id="g1" x1="0" x2="1">
                  <stop offset="0" stop-color="#f7c66d" stop-opacity=".38"/>
                  <stop offset="1" stop-color="#ffe0a0" stop-opacity=".82"/>
                </linearGradient>
                <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stop-color="#8f120f" stop-opacity=".18"/>
                  <stop offset="1" stop-color="#770d0b" stop-opacity=".55"/>
                </linearGradient>
              </defs>
              <path d="M0 173 C72 122 111 151 161 108 C201 73 234 98 274 71 C316 43 349 88 389 70 C439 49 482 95 523 64 C558 38 583 63 600 78 L600 230 L0 230 Z" fill="url(#g2)"/>
              <path d="M0 183 C77 137 128 167 178 125 C225 86 267 113 308 88 C349 63 398 115 443 90 C493 61 543 103 600 79" fill="none" stroke="url(#g1)" stroke-width="4"/>
              <path d="M-25 149 C65 119 91 201 190 158 C281 118 306 178 381 149 C453 121 515 151 630 114" fill="none" stroke="#ffd88b" stroke-opacity=".38" stroke-width="9" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="date" id="date-line">AERTEX · CELEBRATE THE DAY</div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <span>AERTEX</span>
      <span class="footer-line" aria-hidden="true"></span>
      <span id="year"></span>
    </footer>
  </div>

  <script>
    (function(){
      var params = new URLSearchParams(location.search);
      var name = (params.get("name") || "").trim().slice(0, 36);
      var person = document.getElementById("person-name");
      if (name) {
        person.textContent = name;
        person.hidden = false;
        document.title = name + " · " + ${JSON.stringify(title)};
      }
      var year = String(new Date().getFullYear());
      document.getElementById("year").textContent = year;
      var d = new Date();
      document.getElementById("date-line").textContent = "AERTEX · " + d.toLocaleDateString(${JSON.stringify(lang)}, {year:"numeric",month:"long",day:"numeric"});

      var canvas = document.getElementById("confetti");
      var ctx = canvas.getContext("2d");
      var particles = [];
      var running = false;
      var reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

      function resize(){
        var ratio = Math.min(devicePixelRatio || 1, 2);
        canvas.width = Math.floor(innerWidth * ratio);
        canvas.height = Math.floor(innerHeight * ratio);
        canvas.style.width = innerWidth + "px";
        canvas.style.height = innerHeight + "px";
        ctx.setTransform(ratio,0,0,ratio,0,0);
      }

      function burst(){
        if (reduceMotion) return;
        resize();
        particles = [];
        var count = Math.min(120, Math.max(70, Math.floor(innerWidth / 10)));
        for (var i=0;i<count;i++){
          particles.push({
            x:innerWidth*.5 + (Math.random()-.5)*90,
            y:innerHeight*.58,
            vx:(Math.random()-.5)*11,
            vy:-6-Math.random()*10,
            g:.18+Math.random()*.12,
            size:4+Math.random()*7,
            spin:Math.random()*Math.PI,
            vr:(Math.random()-.5)*.3,
            life:80+Math.random()*65,
            gold:Math.random()>.32
          });
        }
        if (!running){running=true;requestAnimationFrame(frame);}
      }

      function frame(){
        ctx.clearRect(0,0,innerWidth,innerHeight);
        var alive = 0;
        for (var i=0;i<particles.length;i++){
          var p=particles[i];
          if (p.life<=0) continue;
          alive++;
          p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.spin+=p.vr;p.life--;
          ctx.save();
          ctx.translate(p.x,p.y);
          ctx.rotate(p.spin);
          ctx.globalAlpha=Math.max(0,Math.min(1,p.life/28));
          ctx.fillStyle=p.gold ? "#f8d488" : "#fff4d4";
          ctx.fillRect(-p.size*.5,-p.size*.18,p.size,p.size*.36);
          ctx.restore();
        }
        if (alive){requestAnimationFrame(frame);}else{running=false;ctx.clearRect(0,0,innerWidth,innerHeight);}
      }

      addEventListener("resize",resize,{passive:true});
      document.getElementById("celebrate").addEventListener("click",function(){
        burst();
        this.textContent = ${JSON.stringify(zh ? "愿望已点亮 ✦" : "Wish lit ✦")};
      });
      resize();
    })();
  </script>
</body>
</html>`;
}
