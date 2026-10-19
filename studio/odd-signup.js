/**
 * Odd registration: a self-contained, deliberately impossible parody.
 * No account checks, real personal data, network requests or storage.
 */
export function oddSignUpPage(normalHref = "/sign-up") {
  const safeHref = /^\/(?:[a-z]{2}(?:-[a-z0-9]+)?\/)?sign-up$/.test(normalHref)
    ? normalHref
    : "/sign-up";
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="color-scheme" content="light">
  <meta name="robots" content="noindex,nofollow">
  <title>离谱注册中心 · AERTEX ODD</title>
  <style>
    :root{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;color:#242936;background:#f6f7fb;font-synthesis:none}
    *{box-sizing:border-box}
    body{margin:0;min-height:100vh;background:radial-gradient(ellipse at 5% 8%,#ffeaed 0,transparent 36%),radial-gradient(ellipse at 95% 8%,#e6edff 0,transparent 38%),#f7f8fc}
    button,input,select{font:inherit}
    button{cursor:pointer}
    a{color:inherit;text-decoration:none}
    a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #8aa5ef;outline-offset:3px}
    .layout{max-width:760px;margin:auto;padding:28px 22px 72px}
    .nav{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:47px}
    .brand{display:flex;align-items:center;gap:12px;font-weight:850;font-size:19px;letter-spacing:.035em}
    .brand-mark{display:grid;place-items:center;width:36px;height:36px;border-radius:11px;background:#232936;color:#fff;transform:rotate(-8deg);font-size:19px}
    .nav-right{display:flex;align-items:center;gap:13px}
    .lab{border:1px solid #e9c4c9;color:#a44d5a;border-radius:100px;padding:7px 11px;background:#fff6f6;font-size:11px;font-weight:800;letter-spacing:.12em}
    .back{font-size:13px;color:#6c7487;font-weight:650}
    .hero{text-align:center;margin-bottom:29px}
    .eyebrow{color:#df6974;font-size:11px;font-weight:900;letter-spacing:.22em;margin:0 0 12px}
    h1{font-size:clamp(30px,6vw,43px);letter-spacing:-.05em;line-height:1.2;margin:0;color:#222635}
    .subhead{color:#777f90;margin:14px auto 0;line-height:1.8;font-size:14px}
    .card{background:#fff;border:1px solid #e8eaf0;border-radius:24px;padding:32px 38px 36px;box-shadow:0 15px 50px rgba(42,50,80,.06),0 2px 8px rgba(42,50,80,.03)}
    .card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:26px}
    h2{font-size:20px;letter-spacing:-.025em;margin:0 0 7px}
    .quiet{font-size:12px;color:#9ba2b1;margin:0;line-height:1.6}
    .percent{font-size:15px;font-weight:900;padding:7px 10px;border-radius:10px;background:#eaf6ed;color:#23a15c;font-variant-numeric:tabular-nums;white-space:nowrap}
    .tracks{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:28px}
    .track{height:7px;border-radius:20px;background:#e8eaf0;position:relative;overflow:hidden}
    .track::before{content:"";position:absolute;inset:0 auto 0 0;width:var(--fill,0%);background:#e86c76;box-shadow:0 0 7px #e86c7666;transition:width .2s ease}
    .field{margin:0 0 25px}
    .field label.main-label{display:block;font-size:14px;font-weight:750;margin:0 0 10px;color:#3b4150}
    .req{color:#e06c77;margin-left:3px}
    .control{position:relative}
    .control>input,.control>select{width:100%;height:52px;border:1px solid #dfe3eb;border-radius:12px;padding:0 15px;color:#272d3a;background:#fff;transition:border .16s,box-shadow .16s;box-shadow:0 1px 2px #22222205;appearance:none}
    .control>input:hover,.control>select:hover{border-color:#bdc5d2}
    .control>input:focus,.control>select:focus{outline:none;border-color:#829deb;box-shadow:0 0 0 4px #839bef21}
    .control input::placeholder{color:#adb3c0}
    .select-chev{position:absolute;right:16px;top:15px;pointer-events:none;color:#778092}
    .message{font-size:12px;color:#cf5b65;line-height:1.7;margin:8px 1px 0;min-height:0}
    .message[hidden]{display:none}
    .input-tip{color:#949aaa;font-size:11px;line-height:1.6;margin:8px 0 0}
    .strength{height:5px;border-radius:10px;overflow:hidden;margin:9px 0 2px;background:#f0f1f5}
    .strength-bar{height:100%;width:0;background:#e56c77;border-radius:10px;transition:width .25s}
    .password-field>input{padding-right:73px}
    .reveal{position:absolute;right:8px;top:7px;border:0;border-radius:8px;color:#667183;background:#f4f5f8;padding:9px 11px;font-size:12px;font-weight:700}
    .captcha{display:flex;gap:10px;align-items:center}
    .captcha input{min-width:0;flex:1;height:52px;border:1px solid #dfe3eb;border-radius:12px;padding:0 14px;outline:none}
    .captcha input:focus{border-color:#829deb;box-shadow:0 0 0 4px #839bef21}
    .captcha-art{position:relative;flex:none;width:176px;min-height:59px;display:flex;align-items:center;justify-content:center;gap:3px;padding:0 7px 0 9px;border-radius:14px;border:1px solid #c8d4e3;overflow:hidden;isolation:isolate;background:radial-gradient(ellipse at 18% 30%,#f4cbd4aa 0,transparent 37%),radial-gradient(ellipse at 84% 75%,#a8bee788 0,transparent 38%),repeating-linear-gradient(16deg,#cedceb80 0 2px,transparent 2px 14px),linear-gradient(135deg,#f0f5ff,#dce6f2)}
    .captcha-art::before{content:"";position:absolute;z-index:1;inset:0;pointer-events:none;background:repeating-linear-gradient(-13deg,transparent 0 15px,#7488af37 15px 17px,transparent 17px 31px);mix-blend-mode:multiply}
    .captcha-art::after{content:"";position:absolute;z-index:1;top:39%;left:-18%;width:140%;height:2px;background:#a35d8066;box-shadow:0 13px 0 #7191bf55,0 -13px 0 #7191bf44;transform:rotate(-10deg);pointer-events:none}
    .captcha-noise{position:absolute;inset:0;z-index:1;pointer-events:none;background-image:radial-gradient(#5076a666 1px,transparent 1.7px),radial-gradient(#e1719180 1px,transparent 2px);background-position:7px 12px,24px 29px;background-size:24px 21px,29px 31px;opacity:.55}
    .captcha-ghost{position:absolute;z-index:1;pointer-events:none;user-select:none;font-size:21px;font-weight:900;font-style:italic;letter-spacing:2px;opacity:.19}
    .captcha-ghost.g1{left:4px;top:3px;color:#c14d75;transform:rotate(-16deg)}
    .captcha-ghost.g2{right:26px;bottom:0;color:#4778ab;transform:rotate(11deg)}
    .captcha-code{position:relative;z-index:2;display:flex;align-items:center;gap:0;white-space:nowrap;line-height:1;font-weight:900;font-size:25px;user-select:none}
    .captcha-code i{display:inline-block;font-style:normal;color:#455d85;text-shadow:2px 2px #f38fa6,-1px -1px #7d9fcd80}
    .captcha-code i:nth-child(5n+1){transform:rotate(-11deg) translateY(3px);color:#466189}
    .captcha-code i:nth-child(5n+2){transform:rotate(9deg) translateY(-4px);color:#a34d72}
    .captcha-code i:nth-child(5n+3){transform:rotate(-7deg) translateY(2px);color:#4a6b9c}
    .captcha-code i:nth-child(5n+4){transform:rotate(13deg) translateY(-3px);color:#9d4e71}
    .captcha-code i:nth-child(5n+5){transform:rotate(-14deg) translateY(1px)}
    .captcha-refresh{position:relative;z-index:3;flex:none;margin-left:auto;border:0;background:#ffffffe0;backdrop-filter:blur(5px);border-radius:10px;padding:9px 10px;font-size:19px;color:#5e6c81;box-shadow:0 3px 12px #29345322}
    .captcha-refresh:hover{background:#fff;transform:rotate(15deg)}
    .consent{margin:4px 0 24px;display:flex;align-items:center;gap:9px;color:#7e8797;font-size:12px;cursor:pointer;line-height:1.6}
    .consent input{accent-color:#e56b75;width:15px;height:15px;flex:none}
    .submit{border:0;border-radius:13px;padding:16px 19px;display:flex;align-items:center;justify-content:center;gap:9px;width:100%;background:#272d3c;color:white;font-size:15px;font-weight:800;transition:transform .15s,background .15s}
    .submit:hover{background:#3d465d;transform:translateY(-1px)}
    .submit:active{transform:translateY(1px)}
    .demo{border:1px solid #e0e5ed;border-radius:12px;background:#fff;padding:12px 18px;color:#677084;font-size:13px;font-weight:750}
    .demo:hover{background:#f6f7f9}
    .foot-actions{text-align:center;margin:16px 0 0}
    .result{margin:18px 0 0;padding:15px 17px;border:1px solid #f3c8c9;border-radius:12px;background:#fff4f5;color:#b84455;font-size:13px;line-height:1.7}
    .result[hidden]{display:none}
    .real-link{text-decoration:underline;text-underline-offset:3px;font-weight:750;color:#555e73}
    footer{text-align:center;color:#949bad;font-size:12px;line-height:1.9;margin:26px auto 0;max-width:480px}
    .notice{display:flex;justify-content:center;gap:6px;align-items:center;color:#8f6571;font-weight:700;margin-top:10px}
    @media(max-width:550px){
      .layout{padding:17px 14px 50px}
      .nav{margin-bottom:37px}
      .back{font-size:12px}
      .card{padding:24px 20px 28px;border-radius:19px}
      .card-top{margin-bottom:21px}
      .tracks{margin-bottom:25px}
      .captcha-art{width:148px;min-height:54px;padding:0 5px}
      .captcha-code{font-size:21px}
      .captcha-refresh{padding:7px 8px;font-size:18px}
      .hero{margin-bottom:24px}
    }
    @media(prefers-reduced-motion:reduce){*,*::before,*::after{transition:none!important;animation:none!important}}
  </style>
</head>
<body>
  <main class="layout">
    <nav class="nav" aria-label="页面导航">
      <a class="brand" href="${safeHref}"><span class="brand-mark" aria-hidden="true">↗</span><span>AERTEX <span style="color:#e16c79">ODD</span></span></a>
      <div class="nav-right"><span class="lab">趣味模拟</span><a class="back" href="${safeHref}">正常注册 ↗</a></div>
    </nav>
    <header class="hero">
      <p class="eyebrow">THE IMPOSSIBLE SIGN-UP</p>
      <h1>注册一个新账号<span style="color:#e56b75">。</span></h1>
      <p class="subhead">理论上只需要一分钟。<br>实际上，系统可能并不想让你注册。</p>
    </header>
    <article class="card">
      <div class="card-top">
        <div><h2>创建账户</h2><p class="quiet">请完成以下 6 项不太合理的校验</p></div>
        <span class="percent" id="percent" aria-live="polite">0%</span>
      </div>
      <div class="tracks" aria-hidden="true"><i class="track" id="progress-segment-0"></i><i class="track" id="progress-segment-1"></i><i class="track" id="progress-segment-2"></i><i class="track" id="progress-segment-3"></i></div>
      <form id="odd-form" action="#" method="post" autocomplete="off" novalidate onsubmit="return false">
        <div class="field">
          <label class="main-label" for="odd-email">邮箱 <span class="req">*</span></label>
          <div class="control"><input id="odd-email" type="text" inputmode="email" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="you@example.invalid"></div>
          <div class="strength" aria-hidden="true"><div class="strength-bar" id="email-meter"></div></div>
          <p class="message" id="email-message" aria-live="polite" hidden></p>
        </div>
        <div class="field">
          <label class="main-label" for="odd-username">用户昵称 <span class="req">*</span></label>
          <div class="control"><input id="odd-username" type="text" maxlength="42" autocomplete="off" placeholder="取一个全宇宙独一无二的名字"></div>
          <p class="message" id="username-message" aria-live="polite" hidden></p>
        </div>
        <div class="field">
          <label class="main-label" for="odd-gender">用户性别 <span class="req">*</span></label>
          <div class="control"><select id="odd-gender" aria-label="用户性别">
            <option value="">请选择</option><option value="male">男</option><option value="female">女</option><option value="other">其他</option><option value="secret">保密</option>
          </select><span class="select-chev" aria-hidden="true">⌄</span></div>
          <p class="message" id="gender-message" aria-live="polite" hidden></p>
        </div>
        <div class="field">
          <label class="main-label" for="odd-password">密码 <span class="req">*</span></label>
          <div class="control password-field"><input id="odd-password" type="password" autocomplete="off" placeholder="请输入密码"><button class="reveal" type="button" id="reveal">显示</button></div>
          <p class="message" id="password-message" aria-live="polite" hidden></p>
        </div>
        <div class="field">
          <label class="main-label" for="odd-confirm">确认密码 <span class="req">*</span></label>
          <div class="control password-field"><input id="odd-confirm" type="password" autocomplete="off" placeholder="请再次输入密码"></div>
          <p class="message" id="confirm-message" aria-live="polite" hidden></p>
        </div>
        <div class="field">
          <label class="main-label" for="odd-captcha">验证码 <span class="req">*</span></label>
          <div class="captcha"><input id="odd-captcha" type="text" autocapitalize="characters" autocomplete="off" aria-label="图片验证码" placeholder="请输入右侧字符"><div class="captcha-art" aria-label="字符验证码"><span class="captcha-noise" aria-hidden="true"></span><span class="captcha-ghost g1" aria-hidden="true">8W0?</span><span class="captcha-ghost g2" aria-hidden="true">M7Q9</span><span class="captcha-code" id="captcha-code" aria-hidden="true"><i>7</i><i>M</i><i>?</i><i>Q</i></span><button class="captcha-refresh" type="button" id="captcha-refresh" aria-label="换一张验证码" title="换一张">↻</button></div></div>
          <p class="message" id="captcha-message" aria-live="polite" hidden></p>
        </div>
        <label class="consent"><input id="odd-consent" type="checkbox"><span>我已阅读并同意：本网站可能不同意我。</span></label>
        <button class="submit" type="submit">立即注册 <span aria-hidden="true">→</span></button>
        <div class="foot-actions"><button class="demo" type="button" id="demo">一键体验所有报错 ✨</button></div>
        <div class="result" role="status" aria-live="assertive" id="result" hidden></div>
      </form>
    </article>
    <footer>
      <div>当前系统处于<span style="font-weight:800;color:#667083">“非常努力地阻止注册”</span>模式。</div>
      <div class="notice">趣味模拟 · 互动玩法</div>
      <div>想认真注册？<a href="${safeHref}" class="real-link">前往正式注册入口</a></div>
    </footer>
  </main>
  <script>
    (() => {
      "use strict";
      const $ = (id) => document.getElementById(id);
      const email = $("odd-email"), username = $("odd-username"), gender = $("odd-gender");
      const password = $("odd-password"), confirm = $("odd-confirm"), captcha = $("odd-captcha");
      const fields = [email, username, gender, password, confirm, captcha];
      const note = (id, message) => {
        const el = $(id);
        el.textContent = message;
        el.hidden = !message;
      };
      const refreshProgress = () => {
        const populated = fields.filter((field) => String(field.value || "").trim()).length;
        const percent = Math.round(populated * 100 / fields.length);
        $("percent").textContent = percent + "%";
        for (let index = 0; index < 4; index++) {
          const fill = Math.max(0, Math.min(100, (percent - index * 25) * 4));
          $("progress-segment-" + index).style.setProperty("--fill", fill + "%");
        }
      };
      const renderEmail = () => {
        const active = !!email.value.trim();
        $("email-meter").style.width = active ? "54%" : "0";
        note("email-message", active ? "邮箱强度：中等。为保证安全，请包含大写字母、小写字母、数字和特殊字符。（没错，是邮箱。）" : "");
        refreshProgress();
      };
      const renderUsername = () => {
        note("username-message", username.value.trim() ? "当前昵称已被占用！占用邮箱：visitor-404@example.invalid；密码：已被宇宙加密。" : "");
        refreshProgress();
      };
      const renderGender = () => {
        const selected = gender.options[gender.selectedIndex]?.text || "";
        note("gender-message", gender.value ? "“" + selected + "”性别已被占用，请重新选择。剩余库存：0。" : "");
        refreshProgress();
      };
      const renderPassword = () => {
        note("password-message", password.value ? "当前密码已被另一位用户占用，占用用户：银河系第 42 位路人。（密码太有个性，系统不敢收）" : "");
        if (confirm.value) renderConfirm();
        refreshProgress();
      };
      const renderConfirm = () => {
        if (!confirm.value) note("confirm-message", "");
        else if (confirm.value === password.value) note("confirm-message", "两次输入的密码完全一致。系统认为这过于可疑，请重新输入。");
        else note("confirm-message", "两次输入的密码不一致。请把它们改成一致，然后再收到另一种错误。");
        refreshProgress();
      };
      const renderCaptcha = () => {
        note("captcha-message", captcha.value.trim() ? "验证码可能正确，但它已于昨天过期。请昨天再试。" : "");
        refreshProgress();
      };
      email.addEventListener("input", renderEmail);
      username.addEventListener("input", renderUsername);
      gender.addEventListener("change", renderGender);
      password.addEventListener("input", renderPassword);
      confirm.addEventListener("input", renderConfirm);
      captcha.addEventListener("input", renderCaptcha);
      $("reveal").addEventListener("click", () => {
        const shown = password.type === "password";
        password.type = shown ? "text" : "password";
        $("reveal").textContent = shown ? "隐藏" : "显示";
      });
      const codes = ["7M?Q", "404!", "0O0O", "????", "∞-1", "NOPE", "X7#K", "L?8Z", "S5$S", "1I|l", "6G9Q", "8B3E"];
      let codeIndex = 0;
      const renderCaptchaCode = (value) => {
        const target = $("captcha-code");
        target.replaceChildren();
        for (const character of value) {
          const piece = document.createElement("i");
          piece.textContent = character;
          target.appendChild(piece);
        }
      };
      $("captcha-refresh").addEventListener("click", () => {
        codeIndex = (codeIndex + 1) % codes.length;
        renderCaptchaCode(codes[codeIndex]);
        note("captcha-message", "新验证码已经生成。但系统无法证明你刚才看到的是哪一张。");
      });
      $("demo").addEventListener("click", () => {
        email.value = "demo@example.invalid";
        username.value = "12345678";
        gender.value = "male";
        password.value = "demo-only-123";
        confirm.value = password.value;
        captcha.value = "7M?Q";
        $("odd-consent").checked = true;
        [renderEmail, renderUsername, renderGender, renderPassword, renderConfirm, renderCaptcha].forEach((fn) => fn());
        $("result").hidden = true;
        email.scrollIntoView({behavior:"smooth",block:"center"});
      });
      $("odd-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const missing = fields.filter((field) => !field.value.trim()).length;
        const result = $("result");
        result.hidden = false;
        result.textContent = missing
          ? "注册失败（错误码 ODD-" + missing + "00）：你还有 " + missing + " 项没填。不过填完也会失败，别有压力。"
          : !$("odd-consent").checked
            ? "注册失败：你尚未同意系统有权不同意你。"
            : "🎉 恭喜！你已成功完成注册失败。错误码：418 · 我是一只茶壶。";
        result.scrollIntoView({behavior:"smooth",block:"nearest"});
      });
      renderCaptchaCode(codes[codeIndex]);
      refreshProgress();
    })();
  </script>
</body>
</html>`;
}
