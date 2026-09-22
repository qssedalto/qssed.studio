import { ZH_COUNTRIES, ADMIN_EMAILS, TEXT } from "./config.js";
import { html, json } from "./routing.js";
import { auditClientScript } from "./ui-audit.js";
import { baseHead, supabaseScript, themeScript, topControls } from "./ui-page.js";

export function notFoundPage(t, links) {
  const zh = t === TEXT.zh;
  const title = zh ? "找不到该网页" : "Page not found";
  const action = zh ? "返回 qsseda.studio" : "Return to qsseda.studio";
  const year = new Date().getFullYear();
  const copyright = zh
    ? `Copyright © ${year} qsseda.studio. 保留所有权利。`
    : `Copyright © ${year} qsseda.studio. All rights reserved.`;

  return `
<!DOCTYPE html>
<html lang="${zh ? "zh-CN" : "en"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="color-scheme" content="light dark">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <title>404 · ${t.studioName}</title>
  <style>
    :root{
      color-scheme:light dark;
      --bg:#f5f5f7;
      --fg:#1d1d1f;
      --muted:#6e6e73;
      --quiet:#8e8e93;
      --line:#424245;
      --icon-fill:#ffffff;
      --icon-soft:#e8e8ed;
      --shadow:rgba(0,0,0,.16);
      font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Segoe UI",system-ui,sans-serif;
    }
    *{box-sizing:border-box}
    html,body{margin:0;min-height:100%;background:var(--bg);color:var(--fg)}
    body{min-height:100svh}
    .nf-page{
      min-height:100svh;
      display:flex;
      flex-direction:column;
      align-items:center;
      padding:max(54px,8svh) 24px max(28px,env(safe-area-inset-bottom));
      text-align:center;
    }
    .nf-main{
      width:min(100%,760px);
      display:flex;
      flex:1;
      flex-direction:column;
      align-items:center;
      justify-content:flex-start;
      padding-top:clamp(16px,5svh,72px);
    }
    .nf-art{
      width:clamp(168px,32vw,236px);
      height:auto;
      display:block;
      margin:0 0 clamp(34px,5vw,54px);
      overflow:visible;
    }
    .nf-title{
      margin:0;
      color:var(--fg);
      font-size:clamp(38px,7vw,64px);
      font-weight:500;
      line-height:1.08;
      letter-spacing:-.045em;
      text-wrap:balance;
    }
    .nf-link{
      display:inline-flex;
      align-items:center;
      gap:.12em;
      margin-top:clamp(28px,4vw,40px);
      color:var(--muted);
      font-size:clamp(19px,3vw,25px);
      font-weight:600;
      line-height:1.25;
      text-decoration:none;
      transition:color .15s ease,transform .12s ease;
      -webkit-tap-highlight-color:transparent;
    }
    .nf-link:hover{color:var(--fg)}
    .nf-link:active{transform:scale(.98)}
    .nf-link:focus-visible{outline:3px solid color-mix(in srgb,var(--fg) 25%,transparent);outline-offset:7px;border-radius:4px}
    .nf-chevron{
      width:.58em;
      height:.58em;
      border-top:2.5px solid currentColor;
      border-right:2.5px solid currentColor;
      transform:rotate(45deg);
      margin-left:.18em;
    }
    .nf-footer{
      flex:0 0 auto;
      display:flex;
      flex-direction:column;
      align-items:center;
      gap:13px;
      margin-top:44px;
      color:var(--quiet);
    }
    .nf-mark{
      display:grid;
      grid-template-columns:repeat(2,13px);
      grid-template-rows:repeat(2,13px);
      gap:3px;
      transform:rotate(45deg);
      opacity:.62;
    }
    .nf-mark span{
      display:block;
      border-radius:3px;
      background:currentColor;
    }
    .nf-mark span:nth-child(4){opacity:.42}
    .nf-copy{
      margin:0;
      font-size:clamp(13px,2vw,17px);
      font-weight:600;
      line-height:1.45;
    }
    @media (prefers-color-scheme:dark){
      :root{
        --bg:#6b6b6d;
        --fg:#ffffff;
        --muted:#dedee2;
        --quiet:#b6b6ba;
        --line:#3b3b3d;
        --icon-fill:#f7f7f8;
        --icon-soft:#d8d8dc;
        --shadow:rgba(0,0,0,.28);
      }
    }
    @media (max-width:520px){
      .nf-page{padding-left:20px;padding-right:20px}
      .nf-main{padding-top:clamp(22px,7svh,58px)}
      .nf-art{width:min(48vw,204px)}
      .nf-title{font-weight:500}
    }
  </style>
</head>
<body>
  <main class="nf-page">
    <section class="nf-main" aria-labelledby="nf-title">
      <svg class="nf-art" viewBox="0 0 260 170" role="img" aria-label="${zh ? "页面未找到" : "Page not found"}">
        <defs>
          <filter id="nf-shadow" x="-25%" y="-25%" width="160%" height="170%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="var(--shadow)"/>
          </filter>
        </defs>
        <g filter="url(#nf-shadow)">
          <rect x="39" y="34" width="154" height="104" rx="28" fill="var(--icon-fill)"/>
          <path d="M39 65h154" fill="none" stroke="var(--icon-soft)" stroke-width="4"/>
          <circle cx="61" cy="50" r="4" fill="var(--line)" opacity=".72"/>
          <circle cx="76" cy="50" r="4" fill="var(--line)" opacity=".42"/>
          <path d="M72 93h54M72 111h36" fill="none" stroke="var(--line)" stroke-width="7" stroke-linecap="round" opacity=".68"/>
          <circle cx="173" cy="91" r="40" fill="var(--icon-fill)" stroke="var(--line)" stroke-width="5"/>
          <path d="M202 120l25 28" fill="none" stroke="var(--line)" stroke-width="11" stroke-linecap="round"/>
          <path d="M161 77l24 28M185 77l-24 28" fill="none" stroke="var(--line)" stroke-width="6" stroke-linecap="round"/>
        </g>
      </svg>
      <h1 class="nf-title" id="nf-title">${title}</h1>
      <a class="nf-link" href="${links.dashboard}">
        <span>${action}</span><span class="nf-chevron" aria-hidden="true"></span>
      </a>
    </section>
    <footer class="nf-footer">
      <div class="nf-mark" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
      <p class="nf-copy">${copyright}</p>
    </footer>
  </main>
</body>
</html>
`;
}

export function signUpPage(t, links, ipInfo) {
  const zh = t === TEXT.zh;
  const enforceChineseNameRules = ZH_COUNTRIES.includes(ipInfo?.country || "");
  const copy = zh ? {
    usernameHelp: "用户名需保持唯一，且不能包含 Tianguo、admin、administrator，或任何包含 admin 的大小写变体。",
    usernameChecking: "正在检查用户名…",
    usernameAvailable: "用户名可用",
    usernameTaken: "这个用户名已经被使用。",
    usernameReserved: "这个用户名属于保留名称，请更换。",
    usernameTooShort: "用户名至少需要 3 个字符。",
    realNameTitle: "填写真实姓名",
    realNameHelpZhIp: "请填写真实姓名；姓和名均使用汉字，并分别选择对应字数。",
    realNameHelpInternational: "检测到非中文地区网络：请填写真实姓名，但不限制汉字、姓或名的字数。",
    surnameCount: "姓是几个字",
    givenCount: "名是几个字",
    oneChar: "1 个字",
    twoChars: "2 个字",
    invalidNameZhIp: "姓名必须全部为汉字，并与所选字数完全一致。",
    invalidNameInternational: "姓和名都必须填写。",
    avatarTitle: "设置头像",
    avatarHelp: "你可以现在选择头像，也可以稍后再设置。支持 JPG、PNG、WebP，最大 5 MB。",
    choosePhoto: "选择照片",
    usePhoto: "使用这张照片",
    later: "稍后设置",
    invalidAvatar: "请选择 JPG、PNG 或 WebP 图片，且文件不能超过 5 MB。",
    emailHelp: "请确保邮箱真实且可正常使用。无效或无法使用的邮箱可能导致账号受到限制或封禁。",
    invalidEmail: "请输入有效邮箱",
    passwordTitle: "设置密码",
    passwordHelp: "密码需要满足以下所有要求。",
    passwordStrength: "密码强度",
    passwordLength: "至少 8 个字符",
    passwordNumber: "至少 1 个数字",
    passwordUpper: "至少 1 个大写字母",
    passwordLower: "至少 1 个小写字母",
    passwordSpecial: "至少 1 个特殊字符",
    confirmPassword: "确认密码",
    confirmPasswordRequired: "请再次输入密码以确认。",
    passwordMismatch: "两次输入的密码不一致，请检查后重新输入。",
    showPassword: "显示密码",
    hidePassword: "隐藏密码",
    creating: "正在创建账户…",
    avatarFailed: "账户已创建，但头像保存失败，你可以稍后重新设置。"
  } : {
    usernameHelp: "Your username must be unique and cannot contain Tianguo, admin, administrator, or any case variation that includes admin.",
    usernameChecking: "Checking username…",
    usernameAvailable: "Username is available",
    usernameTaken: "This username is already in use.",
    usernameReserved: "This username is reserved. Choose another one.",
    usernameTooShort: "Username must contain at least 3 characters.",
    realNameTitle: "Enter your real name",
    realNameHelpZhIp: "Enter your real name in Chinese characters, then choose the exact length of your family and given names.",
    realNameHelpInternational: "Enter your real first and last name. No Chinese-character or 1–2 character restriction is applied for your region.",
    surnameCount: "Family-name length",
    givenCount: "Given-name length",
    oneChar: "1 character",
    twoChars: "2 characters",
    invalidNameZhIp: "Both name fields must contain only Chinese characters and exactly match the selected lengths.",
    invalidNameInternational: "First name and last name are both required.",
    avatarTitle: "Set a profile photo",
    avatarHelp: "Choose a profile photo now or set one later. JPG, PNG, and WebP up to 5 MB are supported.",
    choosePhoto: "Choose Photo",
    usePhoto: "Use This Photo",
    later: "Set Up Later",
    invalidAvatar: "Choose a JPG, PNG, or WebP image no larger than 5 MB.",
    emailHelp: "Use a real, working email address. Invalid or unusable addresses may result in account restrictions or suspension.",
    invalidEmail: "Enter a valid email address.",
    passwordTitle: "Set a password",
    passwordHelp: "Your password must meet all of the requirements below.",
    passwordStrength: "Password strength",
    passwordLength: "At least 8 characters",
    passwordNumber: "At least 1 number",
    passwordUpper: "At least 1 uppercase letter",
    passwordLower: "At least 1 lowercase letter",
    passwordSpecial: "At least 1 special character",
    confirmPassword: "Confirm password",
    confirmPasswordRequired: "Please enter your password again to confirm it.",
    passwordMismatch: "The passwords do not match. Please check and try again.",
    showPassword: "Show password",
    hidePassword: "Hide password",
    creating: "Creating account…",
    avatarFailed: "Your account was created, but the profile photo could not be saved. You can set it later."
  };

  return `
<!DOCTYPE html>
<html>
<head>
  ${baseHead(t.studioName)}
  <style>
    .signup-help{display:block;margin:6px 0 2px;color:var(--quiet);font-size:13px;line-height:1.55}
    .signup-status{min-height:22px;margin-top:8px;font-size:13px;color:var(--muted)}
    .signup-status.is-good{color:#2f9b63}.signup-status.is-bad{color:var(--danger)}
    .signup-input-shell{position:relative;margin-top:12px}
    .signup-input-shell input{margin-top:0;padding-right:50px}
    .signup-validity{position:absolute;right:15px;top:50%;display:grid;place-items:center;width:24px;height:24px;transform:translateY(-50%);font-size:19px;font-weight:900;line-height:1;opacity:0;pointer-events:none;transition:opacity .15s ease,color .15s ease,transform .15s ease}
    .signup-validity.is-checking{opacity:1;color:var(--muted)}
    .signup-validity.is-good{opacity:1;color:#2f9b63;transform:translateY(-50%) scale(1.04)}
    .signup-validity.is-bad{opacity:1;color:var(--danger)}
    .name-count-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
    .name-count-group{padding:12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface-soft)}
    .name-count-group>span{display:block;margin-bottom:8px;color:var(--muted);font-size:13px;font-weight:700}
    .name-count-options{display:flex;gap:8px}
    .name-count-choice{flex:1;display:flex;align-items:center;gap:7px;padding:9px;border:1px solid var(--border);border-radius:var(--radius);background:var(--card);color:var(--text);font-size:13px;cursor:pointer}
    .name-count-choice input{width:auto;min-height:auto;margin:0}
    .avatar-shell{display:grid;place-items:center;gap:14px;margin:18px 0}
    .avatar-preview{width:112px;height:112px;border-radius:50%;overflow:hidden;display:grid;place-items:center;border:1px solid color-mix(in srgb,var(--border-strong) 80%,transparent);background:linear-gradient(145deg,var(--surface),var(--surface-soft));box-shadow:var(--shadow-soft)}
    .avatar-preview img{width:100%;height:100%;object-fit:cover;display:none}
    .avatar-preview svg{width:48px;height:48px;fill:none;stroke:var(--muted);stroke-width:1.6}
    .avatar-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%}
    .avatar-actions button{margin-top:0}
    .password-heading{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-top:8px}
    .password-heading strong{font-size:15px;color:var(--text)}
    .password-heading span{font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}
    .password-input-shell{position:relative;margin-top:12px}
    .password-input-shell input{margin-top:0;padding-right:54px}
    .password-toggle{position:absolute;right:8px;top:50%;transform:translateY(-50%);display:grid;place-items:center;width:40px;height:40px;min-height:0;margin:0;padding:0;border:0;border-radius:10px;background:transparent;color:var(--muted);box-shadow:none;cursor:pointer}
    .password-toggle:hover{background:var(--surface-soft);color:var(--text)}
    .password-toggle svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
    .password-toggle .eye-off{display:none}
    .password-toggle.is-visible .eye-open{display:none}
    .password-toggle.is-visible .eye-off{display:block}
    .confirm-password-block .password-input-shell input{padding-right:96px}
    .password-confirm-validity{right:52px}
    .confirm-password-block{margin-top:16px}
    .confirm-password-label{display:block;margin-bottom:6px;font-size:13px;font-weight:700;color:var(--text)}
    .password-meter{height:7px;margin-top:10px;border-radius:999px;background:var(--surface-soft);overflow:hidden;border:1px solid var(--border)}
    .password-meter span{display:block;width:0;height:100%;background:var(--primary);transition:width .18s ease,background .18s ease}
    .password-rules{display:grid;gap:7px;margin:12px 0 0;padding:0;list-style:none}
    .password-rules li{display:flex;align-items:center;gap:8px;color:var(--muted);font-size:13px}
    .password-rules li::before{content:"○";font-weight:900;color:var(--quiet)}
    .password-rules li.is-met{color:var(--text)}
    .password-rules li.is-met::before{content:"✓";color:#2f9b63}
    @media (max-width:560px){.name-count-grid,.avatar-actions{grid-template-columns:1fr}}

      /* APPLE_DESIGN_SYSTEM_V2_SIGNUP */
/* APPLE_DESIGN_SYSTEM_V2 — sign-up components */
.signup-help{margin:7px 0 3px;color:var(--muted);font-size:13px;line-height:1.5}
.signup-status{min-height:20px;margin-top:7px;font-size:13px}
.signup-status.is-good{color:var(--success)}.signup-status.is-bad{color:var(--danger)}
.signup-input-shell,.password-input-shell{margin-top:12px}
.signup-validity{right:14px;width:22px;height:22px;font-size:18px}
.signup-validity.is-good{color:var(--success);transform:translateY(-50%) scale(1)}
.name-count-grid{gap:10px}
.name-count-group{
  padding:12px;
  border:0;
  border-radius:15px;
  background:var(--fill);
  box-shadow:inset 0 0 0 1px var(--border);
}
.name-count-group>span{margin-bottom:9px;color:var(--muted);font-size:12px;font-weight:650}
.name-count-options{
  gap:4px;
  padding:3px;
  border-radius:11px;
  background:color-mix(in srgb,var(--surface-soft) 85%,transparent);
}
.name-count-choice{
  min-height:36px;
  justify-content:center;
  padding:7px 9px;
  border:0;
  border-radius:9px;
  background:transparent;
  font-size:13px;
  transition:background .14s ease,transform .1s ease;
}
.name-count-choice:has(input:checked){
  background:var(--surface);
  box-shadow:0 1px 4px rgba(0,0,0,.10);
}
.name-count-choice input{position:absolute;opacity:0;pointer-events:none}
.name-count-choice:active{transform:scale(.97)}
.avatar-shell{gap:13px;margin:20px 0 4px}
.avatar-preview{
  width:108px;height:108px;
  border:1px solid var(--border);
  background:var(--fill);
  box-shadow:0 12px 30px rgba(0,0,0,.10);
}
.avatar-actions{gap:8px}
.password-heading{margin-top:16px}
.password-heading strong{font-size:14px;font-weight:680}
.password-heading span{font-size:12px}
.password-toggle{
  right:6px;width:38px;height:38px;border-radius:10px;
  color:var(--muted);
  transition:background .12s ease,color .12s ease,transform .1s ease;
}
.password-toggle:hover{background:var(--secondary);color:var(--text)}
.password-toggle:active{transform:translateY(-50%) scale(.9)}
.confirm-password-block{margin-top:18px}
.confirm-password-label{margin-bottom:6px;font-size:13px;font-weight:650}
.password-meter{
  height:5px;margin-top:11px;border:0;background:var(--fill)
}
.password-meter span{border-radius:999px;transition:width .18s ease,background .18s ease}
.password-rules{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px 10px;margin-top:12px}
.password-rules li{gap:7px;font-size:12px;line-height:1.35}
.password-rules li::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--quiet)}
.password-rules li.is-met::before{content:"";background:var(--success);box-shadow:0 0 0 3px color-mix(in srgb,var(--success) 13%,transparent)}
#step-username,#step-name,#step-avatar,#step-birthday,#step-gender,#step-email,#step-password{transform-origin:50% 16%}
@media (max-width:560px){
  .password-rules{grid-template-columns:1fr}
  .name-count-grid,.avatar-actions{grid-template-columns:1fr}
}
</style>
</head>
<body>
  ${topControls(links, t)}
  <div class="card">
    <h1 class="brand-title">${t.studioName}</h1>

    <div id="step-username">
      <p>${t.chooseUsername}</p>
      <div class="signup-input-shell">
        <input id="username" type="text" placeholder="${t.usernamePlaceholder}" autocomplete="username" aria-describedby="username-status" aria-invalid="false">
        <span id="username-validity" class="signup-validity" aria-hidden="true"></span>
      </div>
      <div id="username-status" class="signup-status" role="status"></div>
      <button id="username-next-btn" disabled>${t.continue}</button>
      <a class="button secondary" href="${links.login}">${t.alreadyHaveAccount}</a>
    </div>

    <div id="step-name" style="display:none;">
      <p>${copy.realNameTitle}</p>
      <small class="signup-help">${enforceChineseNameRules ? copy.realNameHelpZhIp : copy.realNameHelpInternational}</small>

      <input id="first-name" type="text" ${enforceChineseNameRules ? 'maxlength="2"' : 'maxlength="80"'} placeholder="${t.firstNamePlaceholder}" autocomplete="${enforceChineseNameRules ? "family-name" : "given-name"}">
      ${enforceChineseNameRules ? `
      <div class="name-count-group">
        <span>${copy.surnameCount}</span>
        <div class="name-count-options">
          <label class="name-count-choice"><input type="radio" name="surname-length" value="1"><span>${copy.oneChar}</span></label>
          <label class="name-count-choice"><input type="radio" name="surname-length" value="2"><span>${copy.twoChars}</span></label>
        </div>
      </div>` : ""}

      <input id="last-name" type="text" ${enforceChineseNameRules ? 'maxlength="2"' : 'maxlength="80"'} placeholder="${t.lastNamePlaceholder}" autocomplete="${enforceChineseNameRules ? "given-name" : "family-name"}">
      ${enforceChineseNameRules ? `
      <div class="name-count-group">
        <span>${copy.givenCount}</span>
        <div class="name-count-options">
          <label class="name-count-choice"><input type="radio" name="given-name-length" value="1"><span>${copy.oneChar}</span></label>
          <label class="name-count-choice"><input type="radio" name="given-name-length" value="2"><span>${copy.twoChars}</span></label>
        </div>
      </div>` : ""}

      <div id="name-status" class="signup-status"></div>
      <button id="name-next-btn" disabled>${t.continue}</button>
    </div>

    <div id="step-avatar" style="display:none;">
      <p>${copy.avatarTitle}</p>
      <small class="signup-help">${copy.avatarHelp}</small>
      <div class="avatar-shell">
        <div class="avatar-preview">
          <svg id="avatar-placeholder" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 20c.8-4.2 3.3-6.3 7.5-6.3s6.7 2.1 7.5 6.3"/></svg>
          <img id="avatar-preview-image" alt="">
        </div>
        <input id="avatar-file" type="file" accept="image/jpeg,image/png,image/webp" style="display:none;">
        <div id="avatar-status" class="signup-status"></div>
        <div class="avatar-actions">
          <button id="avatar-choose-btn" type="button">${copy.choosePhoto}</button>
          <button id="avatar-later-btn" type="button" class="secondary">${copy.later}</button>
        </div>
        <button id="avatar-next-btn" type="button" disabled>${copy.usePhoto}</button>
      </div>
    </div>

    <div id="step-birthday" style="display:none;">
      <p>${t.enterBirthDate}</p>
      <div class="birthdate-grid">
        <select id="birth-year"><option value="">${t.birthYear}</option></select>
        <select id="birth-month"><option value="">${t.birthMonth}</option></select>
        <select id="birth-day"><option value="">${t.birthDay}</option></select>
      </div>
      <button id="birthday-next-btn" disabled>${t.continue}</button>
    </div>

    <div id="step-gender" style="display:none;">
      <p>${t.selectGender}</p>
      <label class="choice-row"><input type="radio" name="gender" value="male"><span>${t.male}</span></label>
      <label class="choice-row"><input type="radio" name="gender" value="female"><span>${t.female}</span></label>
      <label class="checkbox-row"><input id="hide-gender-on-profile" type="checkbox"><span>${t.hideGenderOnProfile}</span></label>
      <button id="gender-next-btn" disabled>${t.continue}</button>
    </div>

    <div id="step-email" style="display:none;">
      <p>${t.enterEmail}</p>
      <small class="signup-help">${copy.emailHelp}</small>
      <input id="email" type="email" placeholder="name@example.com" autocomplete="email">
      <div id="email-status" class="signup-status"></div>
      <button id="email-next-btn" disabled>${t.continue}</button>
    </div>

    <div id="step-password" style="display:none;">
      <p>${copy.passwordTitle}</p>
      <small class="signup-help">${copy.passwordHelp}</small>
      <div class="password-heading">
        <strong>${t.passwordPlaceholder}</strong>
        <span id="password-strength">${copy.passwordStrength}：0%</span>
      </div>
      <div class="password-input-shell">
        <input id="password" type="password" placeholder="${t.passwordPlaceholder}" autocomplete="new-password">
        <button id="password-toggle" class="password-toggle" type="button" aria-label="${copy.showPassword}" title="${copy.showPassword}">
          <svg class="eye-open" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
          <svg class="eye-off" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 6.2A11 11 0 0 1 12 6c6.5 0 10 6 10 6a17.7 17.7 0 0 1-2.1 2.8"/><path d="M6.2 6.2C3.5 8 2 12 2 12s3.5 6 10 6c1.6 0 3-.4 4.2-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>
        </button>
      </div>
      <div class="password-meter"><span id="password-meter-fill"></span></div>
      <ul class="password-rules">
        <li id="password-rule-length">${copy.passwordLength}</li>
        <li id="password-rule-number">${copy.passwordNumber}</li>
        <li id="password-rule-upper">${copy.passwordUpper}</li>
        <li id="password-rule-lower">${copy.passwordLower}</li>
        <li id="password-rule-special">${copy.passwordSpecial}</li>
      </ul>
      <div class="confirm-password-block">
        <label class="confirm-password-label" for="confirm-password">${copy.confirmPassword}</label>
        <div class="password-input-shell">
          <input id="confirm-password" type="password" placeholder="${copy.confirmPassword}" autocomplete="new-password" aria-describedby="confirm-password-status" aria-invalid="false">
          <span id="confirm-password-validity" class="signup-validity password-confirm-validity" aria-hidden="true"></span>
          <button id="confirm-password-toggle" class="password-toggle" type="button" aria-label="${copy.showPassword}" title="${copy.showPassword}">
            <svg class="eye-open" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg class="eye-off" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 6.2A11 11 0 0 1 12 6c6.5 0 10 6 10 6a17.7 17.7 0 0 1-2.1 2.8"/><path d="M6.2 6.2C3.5 8 2 12 2 12s3.5 6 10 6c1.6 0 3-.4 4.2-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>
          </button>
        </div>
        <div id="confirm-password-status" class="signup-status" role="status"></div>
      </div>
      <button id="create-account-btn" disabled>${t.getStarted}</button>
    </div>

    <div id="message"></div>
    <div id="post-signup-actions" style="display:none;">
      <a class="button secondary" href="${links.login}">${t.alreadyHaveAccount}</a>
    </div>
  </div>

  ${supabaseScript()}
  ${auditClientScript(ipInfo)}

  <script>
    const adminEmails = ${JSON.stringify(ADMIN_EMAILS)};
    const enforceChineseNameRules = ${JSON.stringify(enforceChineseNameRules)};
    let username = "";
    let firstName = "";
    let lastName = "";
    let surnameLength = 0;
    let givenNameLength = 0;
    let birthDate = "";
    let gender = "";
    let hideGenderOnProfile = false;
    let userEmail = "";
    let avatarFile = null;
    let avatarPreviewUrl = "";
    let usernameCheckTimer = 0;
    let usernameCheckSequence = 0;
    let usernameIsAvailable = false;

    const message = document.getElementById("message");
    const postSignupActions = document.getElementById("post-signup-actions");

    function showStep(id) {
      ["step-username","step-name","step-avatar","step-birthday","step-gender","step-email","step-password"].forEach(step => {
        document.getElementById(step).style.display = "none";
      });
      document.getElementById(id).style.display = "block";
      message.innerText = "";
      postSignupActions.style.display = "none";
    }

    function setButtonState(button, enabled) {
      button.disabled = !enabled;
      button.style.opacity = enabled ? "1" : "0.45";
      button.style.cursor = enabled ? "pointer" : "not-allowed";
    }

    function setStatus(element, text, tone = "") {
      element.textContent = text || "";
      element.classList.remove("is-good", "is-bad");
      if (tone) element.classList.add(tone);
    }

    function usernameLocalReason(value) {
      const text = value.trim();
      const key = text.toLowerCase();
      if (!text) return "";
      if (text.length < 3) return "too_short";
      if (key.includes("tianguo")) return "reserved_tianguo";
      if (key.includes("admin")) return "reserved_admin";
      return "";
    }

    function usernameMessage(reason) {
      if (reason === "too_short") return ${JSON.stringify(copy.usernameTooShort)};
      if (reason === "reserved_tianguo" || reason === "reserved_admin") return ${JSON.stringify(copy.usernameReserved)};
      if (reason === "username_taken") return ${JSON.stringify(copy.usernameTaken)};
      return ${JSON.stringify(copy.usernameTaken)};
    }

    const usernameInput = document.getElementById("username");
    const usernameStatus = document.getElementById("username-status");
    const usernameValidity = document.getElementById("username-validity");
    const usernameNextBtn = document.getElementById("username-next-btn");

    function setUsernameValidity(state) {
      usernameValidity.classList.remove("is-checking", "is-good", "is-bad");
      usernameInput.setAttribute("aria-invalid", state === "bad" ? "true" : "false");
      if (state === "checking") {
        usernameValidity.textContent = "…";
        usernameValidity.classList.add("is-checking");
      } else if (state === "good") {
        usernameValidity.textContent = "✓";
        usernameValidity.classList.add("is-good");
      } else if (state === "bad") {
        usernameValidity.textContent = "×";
        usernameValidity.classList.add("is-bad");
      } else {
        usernameValidity.textContent = "";
      }
    }

    async function checkUsernameAvailability() {
      const value = usernameInput.value.trim();
      usernameIsAvailable = false;
      setButtonState(usernameNextBtn, false);

      if (!value) {
        setStatus(usernameStatus, "");
        setUsernameValidity("");
        return false;
      }

      const localReason = usernameLocalReason(value);
      if (localReason) {
        setStatus(usernameStatus, usernameMessage(localReason), "is-bad");
        setUsernameValidity("bad");
        return false;
      }

      const sequence = ++usernameCheckSequence;
      setStatus(usernameStatus, "");
      setUsernameValidity("checking");
      const { data, error } = await supabaseClient.rpc("check_registration_username", { p_username: value });
      if (sequence !== usernameCheckSequence) return false;
      if (error) {
        setStatus(usernameStatus, ${JSON.stringify(zh ? "暂时无法检查用户名，请稍后再试。" : "Unable to check the username right now.")}, "is-bad");
        setUsernameValidity("bad");
        return false;
      }
      if (!data?.available) {
        setStatus(usernameStatus, usernameMessage(data?.reason || "username_taken"), "is-bad");
        setUsernameValidity("bad");
        return false;
      }
      usernameIsAvailable = true;
      setStatus(usernameStatus, "");
      setUsernameValidity("good");
      setButtonState(usernameNextBtn, true);
      return true;
    }

    usernameInput.addEventListener("input", () => {
      clearTimeout(usernameCheckTimer);
      usernameCheckSequence += 1;
      usernameIsAvailable = false;
      setButtonState(usernameNextBtn, false);

      const value = usernameInput.value.trim();
      if (!value) {
        setStatus(usernameStatus, "");
        setUsernameValidity("");
        return;
      }

      const reason = usernameLocalReason(value);
      if (reason) {
        setStatus(usernameStatus, usernameMessage(reason), "is-bad");
        setUsernameValidity("bad");
        return;
      }

      setStatus(usernameStatus, "");
      setUsernameValidity("checking");
      usernameCheckTimer = window.setTimeout(checkUsernameAvailability, 250);
    });

    usernameNextBtn.addEventListener("click", async () => {
      if (!usernameIsAvailable && !(await checkUsernameAvailability())) return;
      username = usernameInput.value.trim();
      showStep("step-name");
    });

    const firstNameInput = document.getElementById("first-name");
    const lastNameInput = document.getElementById("last-name");
    const surnameLengthInputs = document.querySelectorAll('input[name="surname-length"]');
    const givenNameLengthInputs = document.querySelectorAll('input[name="given-name-length"]');
    const nameStatus = document.getElementById("name-status");
    const nameNextBtn = document.getElementById("name-next-btn");

    function exactHanName(value, expectedLength) {
      const text = value.trim();
      return (expectedLength === 1 || expectedLength === 2) &&
        Array.from(text).length === expectedLength &&
        /^\\p{Script=Han}+$/u.test(text);
    }

    function updateNameButton() {
      let ready = false;

      if (enforceChineseNameRules) {
        surnameLength = Number(document.querySelector('input[name="surname-length"]:checked')?.value || 0);
        givenNameLength = Number(document.querySelector('input[name="given-name-length"]:checked')?.value || 0);
        ready = exactHanName(firstNameInput.value, surnameLength) && exactHanName(lastNameInput.value, givenNameLength);
      } else {
        surnameLength = 0;
        givenNameLength = 0;
        ready =
          firstNameInput.value.trim().length > 0 &&
          firstNameInput.value.trim().length <= 80 &&
          lastNameInput.value.trim().length > 0 &&
          lastNameInput.value.trim().length <= 80;
      }

      setButtonState(nameNextBtn, ready);
      const hasAny = firstNameInput.value.trim() || lastNameInput.value.trim() || surnameLength || givenNameLength;
      const invalidText = enforceChineseNameRules ? ${JSON.stringify(copy.invalidNameZhIp)} : ${JSON.stringify(copy.invalidNameInternational)};
      setStatus(nameStatus, hasAny && !ready ? invalidText : "", hasAny && !ready ? "is-bad" : "");
    }

    firstNameInput.addEventListener("input", updateNameButton);
    lastNameInput.addEventListener("input", updateNameButton);
    surnameLengthInputs.forEach(input => input.addEventListener("change", updateNameButton));
    givenNameLengthInputs.forEach(input => input.addEventListener("change", updateNameButton));

    nameNextBtn.addEventListener("click", () => {
      updateNameButton();
      if (nameNextBtn.disabled) return;
      firstName = firstNameInput.value.trim();
      lastName = lastNameInput.value.trim();
      showStep("step-avatar");
    });

    const avatarInput = document.getElementById("avatar-file");
    const avatarChooseBtn = document.getElementById("avatar-choose-btn");
    const avatarLaterBtn = document.getElementById("avatar-later-btn");
    const avatarNextBtn = document.getElementById("avatar-next-btn");
    const avatarPreview = document.getElementById("avatar-preview-image");
    const avatarPlaceholder = document.getElementById("avatar-placeholder");
    const avatarStatus = document.getElementById("avatar-status");

    avatarChooseBtn.addEventListener("click", () => avatarInput.click());

    avatarInput.addEventListener("change", () => {
      const file = avatarInput.files?.[0] || null;
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!file || !allowed.includes(file.type) || file.size > 5 * 1024 * 1024) {
        avatarFile = null;
        setButtonState(avatarNextBtn, false);
        setStatus(avatarStatus, ${JSON.stringify(copy.invalidAvatar)}, "is-bad");
        return;
      }

      avatarFile = file;
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
      avatarPreviewUrl = URL.createObjectURL(file);
      avatarPreview.src = avatarPreviewUrl;
      avatarPreview.style.display = "block";
      avatarPlaceholder.style.display = "none";
      setStatus(avatarStatus, file.name, "is-good");
      setButtonState(avatarNextBtn, true);
    });

    avatarNextBtn.addEventListener("click", () => {
      if (!avatarFile) return;
      showStep("step-birthday");
    });

    avatarLaterBtn.addEventListener("click", () => {
      avatarFile = null;
      avatarInput.value = "";
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
      avatarPreviewUrl = "";
      avatarPreview.removeAttribute("src");
      avatarPreview.style.display = "none";
      avatarPlaceholder.style.display = "block";
      showStep("step-birthday");
    });

    const birthYearInput = document.getElementById("birth-year");
    const birthMonthInput = document.getElementById("birth-month");
    const birthDayInput = document.getElementById("birth-day");
    const birthdayNextBtn = document.getElementById("birthday-next-btn");
    const currentYear = new Date().getFullYear();

    for (let year = currentYear; year >= 1900; year -= 1) {
      birthYearInput.insertAdjacentHTML("beforeend", '<option value="' + year + '">' + year + '</option>');
    }
    for (let month = 1; month <= 12; month += 1) {
      const value = String(month).padStart(2, "0");
      birthMonthInput.insertAdjacentHTML("beforeend", '<option value="' + value + '">' + month + '</option>');
    }

    function updateBirthDayOptions() {
      const selectedYear = Number(birthYearInput.value);
      const selectedMonth = Number(birthMonthInput.value);
      const previousDay = birthDayInput.value;
      const daysInMonth = selectedYear && selectedMonth ? new Date(selectedYear, selectedMonth, 0).getDate() : 31;
      birthDayInput.innerHTML = '<option value="">${t.birthDay}</option>';
      for (let day = 1; day <= daysInMonth; day += 1) {
        const value = String(day).padStart(2, "0");
        birthDayInput.insertAdjacentHTML("beforeend", '<option value="' + value + '">' + day + '</option>');
      }
      if (previousDay && Number(previousDay) <= daysInMonth) birthDayInput.value = previousDay;
    }

    function updateBirthDateButton() {
      setButtonState(birthdayNextBtn, Boolean(birthYearInput.value && birthMonthInput.value && birthDayInput.value));
    }

    birthYearInput.addEventListener("change", () => { updateBirthDayOptions(); updateBirthDateButton(); });
    birthMonthInput.addEventListener("change", () => { updateBirthDayOptions(); updateBirthDateButton(); });
    birthDayInput.addEventListener("change", updateBirthDateButton);

    birthdayNextBtn.addEventListener("click", () => {
      birthDate = birthYearInput.value + "-" + birthMonthInput.value + "-" + birthDayInput.value;
      showStep("step-gender");
    });

    const genderInputs = document.querySelectorAll('input[name="gender"]');
    const hideGenderOnProfileInput = document.getElementById("hide-gender-on-profile");
    const genderNextBtn = document.getElementById("gender-next-btn");
    function updateGenderButton() {
      setButtonState(genderNextBtn, Boolean(document.querySelector('input[name="gender"]:checked')));
    }
    genderInputs.forEach(input => input.addEventListener("change", updateGenderButton));
    genderNextBtn.addEventListener("click", () => {
      const selectedGender = document.querySelector('input[name="gender"]:checked');
      gender = selectedGender ? selectedGender.value : "";
      hideGenderOnProfile = hideGenderOnProfileInput.checked;
      showStep("step-email");
    });

    const emailInput = document.getElementById("email");
    const emailStatus = document.getElementById("email-status");
    const emailNextBtn = document.getElementById("email-next-btn");

    function emailValid(value) {
      return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value.trim());
    }

    emailInput.addEventListener("input", () => {
      const value = emailInput.value;
      const valid = emailValid(value);
      setButtonState(emailNextBtn, valid);
      setStatus(emailStatus, value && !valid ? ${JSON.stringify(copy.invalidEmail)} : "", value && !valid ? "is-bad" : "");
    });

    emailNextBtn.addEventListener("click", () => {
      if (!emailValid(emailInput.value)) return;
      userEmail = emailInput.value.trim();
      showStep("step-password");
    });

    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");
    const passwordToggle = document.getElementById("password-toggle");
    const confirmPasswordToggle = document.getElementById("confirm-password-toggle");
    const confirmPasswordValidity = document.getElementById("confirm-password-validity");
    const confirmPasswordStatus = document.getElementById("confirm-password-status");
    const showPasswordLabel = ${JSON.stringify(copy.showPassword)};
    const hidePasswordLabel = ${JSON.stringify(copy.hidePassword)};
    let passwordConfirmationValid = false;

    function wirePasswordToggle(button, input) {
      button.addEventListener("click", () => {
        const willShow = input.type === "password";
        input.type = willShow ? "text" : "password";
        button.classList.toggle("is-visible", willShow);
        const label = willShow ? hidePasswordLabel : showPasswordLabel;
        button.setAttribute("aria-label", label);
        button.setAttribute("title", label);
        input.focus({ preventScroll: true });
      });
    }

    function setConfirmPasswordValidity(state) {
      confirmPasswordValidity.classList.remove("is-good", "is-bad");
      confirmPasswordInput.setAttribute("aria-invalid", state === "bad" ? "true" : "false");
      if (state === "good") {
        confirmPasswordValidity.textContent = "✓";
        confirmPasswordValidity.classList.add("is-good");
      } else if (state === "bad") {
        confirmPasswordValidity.textContent = "×";
        confirmPasswordValidity.classList.add("is-bad");
      } else {
        confirmPasswordValidity.textContent = "";
      }
    }

    wirePasswordToggle(passwordToggle, passwordInput);
    wirePasswordToggle(confirmPasswordToggle, confirmPasswordInput);
    const passwordStrength = document.getElementById("password-strength");
    const passwordMeterFill = document.getElementById("password-meter-fill");
    const createAccountBtn = document.getElementById("create-account-btn");

    const passwordRuleEls = {
      length: document.getElementById("password-rule-length"),
      number: document.getElementById("password-rule-number"),
      upper: document.getElementById("password-rule-upper"),
      lower: document.getElementById("password-rule-lower"),
      special: document.getElementById("password-rule-special")
    };

    function passwordChecks(value) {
      return {
        length: value.length >= 8,
        number: /\\d/.test(value),
        upper: /[A-Z]/.test(value),
        lower: /[a-z]/.test(value),
        special: /[^A-Za-z0-9\\s]/.test(value)
      };
    }

    function updatePasswordStrength() {
      const checks = passwordChecks(passwordInput.value);
      const passed = Object.values(checks).filter(Boolean).length;
      const percent = passed * 20;
      passwordStrength.textContent = ${JSON.stringify(copy.passwordStrength + "：")} + percent + "%";
      passwordMeterFill.style.width = percent + "%";
      passwordMeterFill.style.background = percent === 100 ? "#2f9b63" : percent >= 60 ? "#d99a2b" : "var(--danger)";
      Object.entries(checks).forEach(([key, met]) => passwordRuleEls[key].classList.toggle("is-met", met));
      setButtonState(createAccountBtn, percent === 100 && passwordConfirmationValid);
    }

    passwordInput.addEventListener("input", () => {
      passwordConfirmationValid = false;
      setConfirmPasswordValidity("");
      setStatus(confirmPasswordStatus, "");
      updatePasswordStrength();
    });

    confirmPasswordInput.addEventListener("input", () => {
      passwordConfirmationValid = false;
      setConfirmPasswordValidity("");
      setStatus(confirmPasswordStatus, "");
      updatePasswordStrength();
    });

    confirmPasswordInput.addEventListener("blur", () => {
      const value = confirmPasswordInput.value;
      if (!value) {
        passwordConfirmationValid = false;
        setConfirmPasswordValidity("bad");
        setStatus(confirmPasswordStatus, ${JSON.stringify(copy.confirmPasswordRequired)}, "is-bad");
      } else if (value !== passwordInput.value) {
        passwordConfirmationValid = false;
        setConfirmPasswordValidity("bad");
        setStatus(confirmPasswordStatus, ${JSON.stringify(copy.passwordMismatch)}, "is-bad");
      } else {
        passwordConfirmationValid = true;
        setConfirmPasswordValidity("good");
        setStatus(confirmPasswordStatus, "");
      }
      updatePasswordStrength();
    });

    createAccountBtn.addEventListener("click", async () => {
      updatePasswordStrength();
      if (createAccountBtn.disabled) return;

      const originalLabel = createAccountBtn.textContent;
      createAccountBtn.disabled = true;
      createAccountBtn.textContent = ${JSON.stringify(copy.creating)};
      message.textContent = "";

      const form = new FormData();
      form.set("username", username);
      form.set("first_name", firstName);
      form.set("last_name", lastName);
      form.set("surname_length", String(surnameLength));
      form.set("given_name_length", String(givenNameLength));
      form.set("birth_date", birthDate);
      form.set("gender", gender);
      form.set("hide_gender_on_profile", String(hideGenderOnProfile));
      form.set("email", userEmail);
      form.set("password", passwordInput.value);
      if (avatarFile) form.set("avatar", avatarFile, avatarFile.name);

      try {
        const response = await fetch("/api/auth/signup", { method: "POST", body: form });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (payload?.field === "username") {
            showStep("step-username");
            setStatus(usernameStatus, usernameMessage(payload?.error || "username_taken"), "is-bad");
            setUsernameValidity("bad");
            usernameIsAvailable = false;
            setButtonState(usernameNextBtn, false);
          } else {
            message.textContent = payload?.error || ${JSON.stringify(zh ? "注册失败，请检查填写内容。" : "Registration failed. Check your details and try again.")};
          }
          return;
        }

        const randomEmail = adminEmails[Math.floor(Math.random() * adminEmails.length)];
        message.textContent = ${JSON.stringify(t.adminApprovalMessage + " ")} + randomEmail;
        if (payload?.avatar_status === "failed") {
          message.textContent += " " + ${JSON.stringify(copy.avatarFailed)};
        }
        postSignupActions.style.display = "block";
      } finally {
        createAccountBtn.textContent = originalLabel;
        updatePasswordStrength();
      }
    });

    setButtonState(usernameNextBtn, false);
    setButtonState(nameNextBtn, false);
    setButtonState(avatarNextBtn, false);
    updateBirthDayOptions();
    setButtonState(birthdayNextBtn, false);
    setButtonState(genderNextBtn, false);
    setButtonState(emailNextBtn, false);
    updatePasswordStrength();
  </script>
  ${themeScript()}
</body>
</html>
`;
}
export function loginPage(t, links, ipInfo) {
  return `
<!DOCTYPE html>
<html>
<head>
  ${baseHead(t.signIn)}
</head>
<body>
  ${topControls(links, t)}
  <div class="card">
    <h1>${t.signIn}</h1>
    <p id="login-description">${t.loginDescription}</p>

    <input id="email" type="email" placeholder="${t.emailPlaceholder}">
    <input id="password" type="password" placeholder="${t.passwordPlaceholder}">

    <button id="login-btn">${t.signIn}</button>
    <a id="signup-link" class="button secondary" href="${links.signUp}">
      ${t.dontHaveAccount}
    </a>

    <div id="message"></div>
  </div>

  ${supabaseScript()}
  ${auditClientScript(ipInfo)}

  <script>
    const dashboardUrl = ${JSON.stringify(links.dashboard)};
    const emptyCredentialsMessage = ${JSON.stringify(
      t === TEXT.zh ? "请输入邮箱和密码。" : "Please enter email and password."
    )};
    const loginBtn = document.getElementById("login-btn");
    const message = document.getElementById("message");

    loginBtn.addEventListener("click", async () => {
      message.innerText = "";

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      if (!email || !password) {
        message.innerText = emptyCredentialsMessage;
        return;
      }

      const authResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          device_id: getAuditDeviceId()
        })
      });
      const authData = await authResponse.json().catch(() => ({}));

      if (!authResponse.ok) {
        message.innerText = authData.error_description || authData.msg || authData.error || "Login failed.";
        return;
      }

      const { error: sessionError } = await supabaseClient.auth.setSession({
        access_token: authData.access_token,
        refresh_token: authData.refresh_token
      });
      if (sessionError) {
        message.innerText = sessionError.message;
        return;
      }

      const loginName = authData.user?.user_metadata?.username || authData.user?.user_metadata?.display_name || authData.user?.email;
      if (loginName) {
        try {
          document.cookie = "qssed-os-user-name=" + encodeURIComponent("@" + loginName) + "; Path=/; Max-Age=2592000; SameSite=Lax; Secure";
        } catch {}
      }
      try { if (typeof clearProfileUiCaches === "function") clearProfileUiCaches(); } catch {}
      try {
        ["qssed-admin-overview-v1","qssed-admin-users-v1","qssed-admin-roles-v1","qssed-admin-logs-v1","qssed-admin-access-v1"].forEach(key => sessionStorage.removeItem(key));
        Object.keys(sessionStorage).filter(key => key.startsWith("qssed-admin-view-v1:")).forEach(key => sessionStorage.removeItem(key));
      } catch {}
      await updateCurrentDevice(authData.user);
      window.location.href = dashboardUrl;
    });

    async function redirectIfLoggedIn() {
      const { data } = await supabaseClient.auth.getUser();

      if (data.user) {
        const existingName = data.user.user_metadata.username || data.user.user_metadata.display_name || data.user.email;
        if (existingName) {
          try {
            document.cookie = "qssed-os-user-name=" + encodeURIComponent("@" + existingName) + "; Path=/; Max-Age=2592000; SameSite=Lax; Secure";
          } catch {}
        }
        window.location.href = dashboardUrl;
      }
    }

    redirectIfLoggedIn();
  </script>
  ${themeScript()}
</body>
</html>
`;
}
// OS_ROUTE_ARCHITECTURE_V2_FIXED
