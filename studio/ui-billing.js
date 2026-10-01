export function billingSettingsContent(zh) {
  const text = zh ? {
    loading:"正在读取订阅…", current:"当前套餐", drive:"AERTEX Drive", renew:"有效期",
    free:"长期有效", source:"来源", plans:"可用套餐", unavailable:"支付接口尚未开放",
    unavailableDetail:"当前阶段用于验证套餐、权益和管理员授权。支付宝与微信支付接入后会在这里启用购买。",
    error:"暂时无法读取订阅信息。", active:"有效", grace:"宽限期", manual:"管理员授权",
    system:"系统", autoRenew:"自动续费", off:"关闭", on:"开启", quota:"云盘容量",
    student:"学生资格", studentIntro:"先选择你就读的学校或教育机构所在地，再使用对应的官方渠道验证学生身份。此分类与国籍、居住地无关。",
    regionTitle:"你的学校或教育机构位于哪里？", regionHint:"请选择学校所在地，而不是你的国籍、户籍或当前居住地。",
    regionMainlandHigher:"中国大陆高等教育院校", regionMainlandHigherHint:"大学、学院及其他可通过学信网学籍报告验证的高等教育院校",
    regionMainlandOther:"中国大陆其他学校 / 教育机构", regionMainlandOtherHint:"中学、中职或其他无法使用学信网学籍报告的在读情况",
    regionHmt:"中国香港、澳门或台湾地区院校", regionHmtHint:"在香港、澳门或台湾地区注册并就读的学校或院校",
    regionInternational:"其他国家或地区院校", regionInternationalHint:"除中国大陆及港澳台地区以外的学校或高等教育机构",
    methodTitle:"选择学生身份验证方式", methodHint:"AERTEX 只要求验证在读状态，不要求你提交国籍证明或政府身份证件。",
    changeRegion:"更改就读地区", supportedNow:"当前可用", comingSoon:"即将开放",
    methodChsi:"学信网学籍在线验证", methodChsiHint:"使用《教育部学籍在线验证报告》的官方二维码或 16 位在线验证码。",
    methodSchoolEmail:"学校官方邮箱", methodSchoolEmailHint:"通过学校分配的官方教育邮箱验证在读关系。",
    methodEnrollment:"官方在读证明", methodEnrollmentHint:"通过学校官方出具的在读状态证明进行人工审核。",
    methodUnavailable:"这个地区的学生认证方式正在完善。目前不会要求你上传身份证、护照或完整学生证件。",
    privacy:"仅选择二维码区域。不要提交完整报告，也不要提交身份证号、学号、姓名、证件照片、账号密码或其他无关个人信息。",
    localOnly:"二维码图片只在你的浏览器本地解析，不会上传到 AERTEX。服务器只接收用于人工核验的 16 位在线验证码或学信网官方验证地址。",
    consent:"我确认所选图片仅包含用于认证的二维码，不包含其他敏感个人信息。",
    chooseQr:"选择二维码图片", chooseQrHint:"可从照片图库、文件或系统相机选择", pasteLink:"粘贴 16 位在线验证码或学信网官方验证链接", submitStudent:"提交学生认证",
    previewTitle:"已选择的二维码图片", replaceQr:"重新选择", manualLink:"无法识别？手动输入验证码 / 链接", hideManualLink:"收起手动输入", localPreview:"图片只在本机预览和识别，不上传服务器",
    cancelStudent:"取消待审核申请", pending:"待审核", verified:"已认证", rejected:"未通过", expired:"已过期",
    notSubmitted:"尚未认证", unsupportedQr:"当前浏览器无法本地识别二维码，请使用系统相机扫码后粘贴官方验证链接。",
    invalidQr:"未识别到学信网二维码中的 16 位在线验证码或受支持的官方验证链接。", tooLarge:"图片过大，请选择 5 MB 以内的二维码截图。",
    imageOnly:"仅支持 PNG、JPEG 或 WebP 图片。", multipleQr:"图片中检测到多个二维码，请裁剪到只剩一个二维码。",
    submitted:"学生认证申请已提交。", canceled:"待审核申请已取消。", verifyingUntil:"有效期至",
    tutorialTitle:"认证教程", tutorialIntro:"先准备好学信网《教育部学籍在线验证报告》的二维码，再开始上传。",
    tutorialStep1:"打开学信网并登录“学信档案”。",
    tutorialStep2:"进入“在线验证报告”，申请《教育部学籍在线验证报告》。",
    tutorialStep3:"打开或下载报告，找到报告中的官方验证二维码。",
    tutorialStep4:"只截取二维码区域，不要把整份报告、姓名、身份证号、学号、照片等内容截进去。",
    tutorialStep5:"返回 AERTEX，点击下方“我已准备好二维码”，再选择二维码图片完成认证。",
    tutorialReady:"我已准备好二维码，开始认证", tutorialOfficial:"前往学信网申请报告 ↗",
    tutorialTip:"提示：新版学信二维码可能编码的是“学信网报告在线验证”提示和 16 位在线验证码，不一定是网址；AERTEX 会自动提取验证码。"
  } : {
    loading:"Loading subscription…", current:"Current plan", drive:"AERTEX Drive", renew:"Valid through",
    free:"No expiry", source:"Source", plans:"Available plans", unavailable:"Checkout is not available yet",
    unavailableDetail:"This phase validates plans, entitlements, and administrator grants. Alipay and WeChat Pay checkout will be enabled here later.",
    error:"Subscription information is temporarily unavailable.", active:"Active", grace:"Grace period", manual:"Admin grant",
    system:"System", autoRenew:"Auto-renew", off:"Off", on:"On", quota:"Drive quota",
    student:"Student eligibility", studentIntro:"First choose where your school or educational institution is located, then verify student status through the appropriate official channel. This classification is not about nationality or residence.",
    regionTitle:"Where is your school or educational institution located?", regionHint:"Choose the school location, not your nationality, permanent residence, or current location.",
    regionMainlandHigher:"Mainland China · Higher education", regionMainlandHigherHint:"Universities, colleges, and other higher-education institutions that can be verified through CHSI student-record reports",
    regionMainlandOther:"Mainland China · Other education", regionMainlandOtherHint:"Secondary, vocational, or other study situations that cannot use a CHSI student-record report",
    regionHmt:"Hong Kong, Macao, or Taiwan institutions", regionHmtHint:"Schools or institutions registered in Hong Kong, Macao, or Taiwan",
    regionInternational:"Institutions in other countries or regions", regionInternationalHint:"Schools and higher-education institutions outside Mainland China, Hong Kong, Macao, and Taiwan",
    methodTitle:"Choose a student-status verification method", methodHint:"AERTEX verifies enrollment status only. You do not need to provide nationality documents or government-issued identity documents.",
    changeRegion:"Change school location", supportedNow:"Available now", comingSoon:"Coming soon",
    methodChsi:"CHSI student-record verification", methodChsiHint:"Use the official QR code or 16-character online verification code from the Online Verification Report of Student Record.",
    methodSchoolEmail:"Official school email", methodSchoolEmailHint:"Verify enrollment through an official education email address issued by your school.",
    methodEnrollment:"Official enrollment confirmation", methodEnrollmentHint:"Use an official enrollment-status confirmation from the institution for manual review.",
    methodUnavailable:"Verification for this education system is being prepared. AERTEX will not ask you to upload a passport, government ID, or a full student credential.",
    privacy:"Select only the QR-code area. Do not submit a full report or any image containing an ID number, student number, name, portrait, account credentials, or unrelated personal information.",
    localOnly:"The QR image is decoded locally in your browser and is never uploaded to AERTEX. The server receives only a 16-character online verification code or an official CHSI verification URL for manual review.",
    consent:"I confirm the selected image contains only the verification QR code and no other sensitive personal information.",
    chooseQr:"Choose QR image", chooseQrHint:"Choose from Photos, Files, or the system camera", pasteLink:"Paste the 16-character online verification code or official CHSI verification URL", submitStudent:"Submit verification",
    previewTitle:"Selected QR image", replaceQr:"Choose another image", manualLink:"Can't decode it? Enter the code / URL manually", hideManualLink:"Hide manual entry", localPreview:"The image stays on this device for preview and recognition and is not uploaded",
    cancelStudent:"Cancel pending request", pending:"Pending review", verified:"Verified", rejected:"Rejected", expired:"Expired",
    notSubmitted:"Not verified", unsupportedQr:"This browser cannot decode QR codes locally. Scan it with the system camera and paste the official verification URL instead.",
    invalidQr:"No CHSI 16-character online verification code or supported official verification URL was found in the QR code.", tooLarge:"Image is too large. Use a QR crop under 5 MB.",
    imageOnly:"Only PNG, JPEG, or WebP images are supported.", multipleQr:"Multiple QR codes were detected. Crop the image so only one QR code remains.",
    submitted:"Student verification request submitted.", canceled:"Pending verification request canceled.", verifyingUntil:"Valid through",
    tutorialTitle:"Verification guide", tutorialIntro:"Prepare the QR code from your official CHSI Online Verification Report of Student Record before uploading anything.",
    tutorialStep1:"Open CHSI and sign in to your CHSI Archive.",
    tutorialStep2:"Open Online Verification Reports and apply for the Online Verification Report of Student Record.",
    tutorialStep3:"Open or download the report and locate its official verification QR code.",
    tutorialStep4:"Crop only the QR-code area. Do not include the full report, name, ID number, student number, portrait, or other personal information.",
    tutorialStep5:"Return to AERTEX, choose “My QR code is ready”, then select the cropped QR image to continue.",
    tutorialReady:"My QR code is ready — start verification", tutorialOfficial:"Open CHSI report application ↗",
    tutorialTip:"Tip: newer CHSI QR codes can contain a CHSI verification instruction plus a 16-character online verification code rather than a URL. AERTEX extracts that code automatically."
  };

  return `
    <style>
      #student-verification [hidden]{display:none!important}
      #student-consent{width:22px!important;height:22px!important;min-width:22px!important;min-height:22px!important;flex:0 0 22px;margin:2px 0 0!important;padding:0!important}
      #student-pending-actions{margin-top:14px;padding:14px 16px;border:1px solid var(--border);border-radius:14px;background:var(--surface-soft)}
      #student-pending-actions p{margin:0 0 12px}
      .student-path{display:grid;gap:14px;margin-top:18px}
      .student-step-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
      .student-step-head h3{margin:0;font-size:18px;letter-spacing:-.03em}
      .student-step-head p{margin:6px 0 0;color:var(--muted);font-size:13px;line-height:1.55}
      .student-region-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      .student-region-card,.student-method-card{
        appearance:none;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:start;
        min-height:116px;margin:0;padding:17px;text-align:left;border:1px solid var(--border);border-radius:18px;
        background:var(--surface-soft);color:var(--text);box-shadow:none;cursor:pointer;
        transition:transform .2s ease,border-color .18s ease,background .18s ease,box-shadow .2s ease
      }
      .student-region-card strong,.student-method-card strong{display:block;font-size:15px;line-height:1.3;letter-spacing:-.02em}
      .student-region-card span,.student-method-card span{display:block;margin-top:7px;color:var(--muted);font-size:12px;line-height:1.48}
      .student-region-card b,.student-method-card b{color:var(--quiet);font-size:18px;font-weight:500}
      .student-region-card.is-selected{border-color:color-mix(in srgb,var(--primary) 50%,var(--border));background:color-mix(in srgb,var(--primary) 8%,var(--surface-soft));box-shadow:0 10px 24px color-mix(in srgb,var(--primary) 8%,transparent)}
      .student-path-summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 14px;border-radius:15px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border)}
      .student-path-summary strong{font-size:13px}.student-path-summary button{width:auto!important;min-width:0!important;min-height:36px!important;margin:0!important;padding:0 11px!important;border-radius:10px!important;background:var(--card)!important;color:var(--text)!important;font-size:11px!important;box-shadow:inset 0 0 0 1px var(--border)!important}
      .student-method-list{display:grid;gap:10px}
      .student-method-card{min-height:96px;background:var(--card)}
      .student-method-card.is-supported{border-color:color-mix(in srgb,var(--primary) 28%,var(--border))}
      .student-method-card[disabled]{cursor:not-allowed;opacity:.64}
      .student-method-badge{display:inline-flex!important;align-items:center;min-height:24px;margin:0!important;padding:0 8px;border-radius:999px;background:var(--fill);color:var(--muted)!important;font-size:10px!important;font-weight:760!important;white-space:nowrap}
      .student-method-card.is-supported .student-method-badge{background:color-mix(in srgb,var(--primary) 11%,var(--fill));color:var(--primary)!important}
      .student-method-note{margin:0;padding:13px 14px;border-radius:14px;background:var(--fill);color:var(--muted);font-size:12px;line-height:1.55}
      @media(hover:hover) and (pointer:fine){.student-region-card:hover,.student-method-card:not([disabled]):hover{transform:translateY(-2px);border-color:var(--border-strong);box-shadow:0 10px 24px rgba(0,0,0,.055)}}
      .student-file-picker{display:grid;place-items:center;gap:7px;min-height:116px;padding:18px;border:1px solid var(--border);border-radius:18px;background:var(--surface-soft);text-align:center}
      .student-file-picker input[type="file"]{position:absolute!important;width:1px!important;height:1px!important;min-width:1px!important;min-height:1px!important;margin:0!important;padding:0!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;clip-path:inset(50%)!important}
      .student-file-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:0 18px;border-radius:13px;background:var(--primary);color:var(--primary-ink);font-weight:800;cursor:pointer;user-select:none}
      .student-file-button:active{transform:scale(.98)}
      .student-file-button svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
      .student-file-picker small{display:block;color:var(--muted);font-size:12px;line-height:1.45}
      .student-file-preview{display:none;gap:12px;align-items:center;width:100%;padding:12px;border-radius:14px;background:var(--card);box-shadow:inset 0 0 0 1px var(--border);text-align:left}
      .student-file-preview.is-visible{display:grid;grid-template-columns:76px minmax(0,1fr) auto}
      .student-file-preview img{display:block;width:76px;height:76px;object-fit:contain;border-radius:10px;background:#fff}
      .student-file-preview-copy{min-width:0}.student-file-preview-copy strong{display:block}.student-file-preview-name{display:block;margin-top:4px;color:var(--muted);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.student-file-preview-note{display:block;margin-top:4px;color:var(--muted);font-size:12px;line-height:1.45;white-space:normal;overflow:visible;text-overflow:clip;word-break:break-word}
      .student-file-replace{width:auto!important;min-width:0!important;min-height:38px!important;margin:0!important;padding:0 12px!important;border-radius:10px!important;background:var(--fill)!important;color:var(--text)!important;font-size:12px!important}
      .student-manual-toggle{width:auto!important;justify-self:start;min-height:40px!important;margin:2px 0 0!important;padding:0 12px!important;background:transparent!important;color:var(--primary)!important}
      #student-manual-wrap[hidden]{display:none!important}
      #student-target{font-size:16px!important;scroll-margin-top:120px}
      .student-file-picker.is-disabled{opacity:.48}
      .student-file-picker.is-disabled .student-file-button{cursor:not-allowed;pointer-events:none}
      .pricing-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin-top:14px}
      .pricing-card{position:relative;min-width:0;padding:18px;border:1px solid var(--border);border-radius:20px;background:var(--card);box-shadow:0 1px 2px rgba(0,0,0,.025);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}
      .pricing-card:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,0,0,.055)}
      .pricing-card.is-selected{border-color:var(--primary);box-shadow:0 0 0 1px var(--primary)}
      .pricing-card.is-featured{background:linear-gradient(180deg,var(--card),var(--surface-soft))}
      .pricing-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
      .pricing-name{font-size:18px;line-height:1.2;font-weight:800;letter-spacing:-.02em}
      .pricing-badge{display:inline-flex;align-items:center;min-height:24px;padding:0 9px;border-radius:999px;background:var(--fill);color:var(--text);font-size:11px;font-weight:750;white-space:nowrap}
      .pricing-capacity{margin-top:18px;font-size:30px;line-height:1;font-weight:850;letter-spacing:-.045em}
      .pricing-price-row{display:flex;align-items:baseline;gap:5px;margin-top:14px}
      .pricing-price{font-size:24px;line-height:1;font-weight:820;letter-spacing:-.035em}
      .pricing-period{color:var(--muted);font-size:12px}
      .pricing-student{display:inline-flex;align-items:baseline;gap:4px;margin-top:10px;padding:7px 10px;border-radius:999px;background:var(--surface-soft);font-size:13px;font-weight:760}
      .pricing-student strong{font-size:15px}
      .pricing-desc{margin:14px 0 0;color:var(--muted);font-size:13px;line-height:1.5}
      .pricing-footnote{margin:12px 0 0;color:var(--muted);font-size:12px;line-height:1.5}
      @media (max-width:620px){
        .student-region-grid{grid-template-columns:1fr}
        .student-region-card{min-height:104px;padding:15px}
        .student-path-summary{align-items:flex-start;flex-direction:column}
        .student-file-picker{min-height:104px;padding:16px 14px}
        .student-file-button{width:min(100%,320px)}
        .student-file-preview.is-visible{grid-template-columns:64px minmax(0,1fr)}
        .student-file-preview img{width:64px;height:64px}
        .student-file-replace{grid-column:1/-1;width:100%!important}
        #student-target{font-size:16px!important}
      }
      @media (max-width:1050px) and (hover:none) and (pointer:coarse){
        body.os-shell:has(#student-verification){height:auto!important;min-height:100dvh!important;overflow-y:auto!important;overscroll-behavior-y:none!important}
        body.os-shell:has(#student-verification) .os-layout{height:auto!important;min-height:calc(100dvh - 20px)!important}
        body.os-shell:has(#student-verification) .os-main{height:auto!important;min-height:calc(100dvh - 20px)!important;overflow:visible!important;overscroll-behavior-y:none!important}
      }
    </style>
    <section id="billing-settings" class="os-card is-large settings-detail-card">
      <div class="settings-general-heading">
        <div>
          <small>AERTEX</small>
          <h2>${zh ? "订阅与权益" : "Subscription & Entitlements"}</h2>
          <p>${zh ? "查看当前套餐、有效期以及 AERTEX Drive 权益。" : "View your current plan, validity period, and AERTEX Drive entitlement."}</p>
        </div>
      </div>
      <div id="billing-current" class="settings-choice-grid">
        <div class="settings-choice"><strong>${text.loading}</strong><span>—</span></div>
      </div>
    </section>
    <section id="student-verification" class="os-card is-large settings-detail-card">
      <div class="settings-general-heading">
        <div>
          <small>AERTEX STUDENT</small>
          <h2>${text.student}</h2>
          <p>${text.studentIntro}</p>
        </div>
      </div>
      <div id="student-state" class="settings-choice-grid">
        <div class="settings-choice"><strong>${text.notSubmitted}</strong><span>—</span></div>
      </div>
      <div id="student-pending-actions" hidden>
        <p>${zh ? "你已经提交过学生认证，当前正在等待审核。审核期间不能重复上传二维码；如需重新提交，请先取消当前申请。" : "You already have a student verification request pending. You cannot submit another QR code while it is under review. Cancel the current request first if you need to resubmit."}</p>
        <button id="student-cancel" class="btn" type="button">${text.cancelStudent}</button>
      </div>
      <section id="student-region-step" class="student-path">
        <div class="student-step-head">
          <div>
            <h3>undefined</h3>
            <p>undefined</p>
          </div>
        </div>
        <div class="student-region-grid" role="radiogroup" aria-label="undefined">
          <button class="student-region-card" type="button" data-student-region="mainland_higher" aria-pressed="false">
            <span><strong>undefined</strong><span>undefined</span></span><b aria-hidden="true">›</b>
          </button>
          <button class="student-region-card" type="button" data-student-region="mainland_other" aria-pressed="false">
            <span><strong>undefined</strong><span>undefined</span></span><b aria-hidden="true">›</b>
          </button>
          <button class="student-region-card" type="button" data-student-region="hmt" aria-pressed="false">
            <span><strong>undefined</strong><span>undefined</span></span><b aria-hidden="true">›</b>
          </button>
          <button class="student-region-card" type="button" data-student-region="international" aria-pressed="false">
            <span><strong>undefined</strong><span>undefined</span></span><b aria-hidden="true">›</b>
          </button>
        </div>
      </section>
      <section id="student-method-step" class="student-path" hidden>
        <div class="student-step-head">
          <div>
            <h3>undefined</h3>
            <p>undefined</p>
          </div>
        </div>
        <div class="student-path-summary">
          <strong id="student-region-summary"></strong>
          <button id="student-change-region" type="button">undefined</button>
        </div>
        <div id="student-method-list" class="student-method-list"></div>
        <p id="student-method-note" class="student-method-note" hidden>undefined</p>
      </section>
      <div id="student-tutorial" hidden style="margin-top:18px;padding:18px;border:1px solid var(--border);border-radius:16px">
        <div>
          <strong style="font-size:15px">${text.tutorialTitle}</strong>
          <p style="margin:8px 0 0">${text.tutorialIntro}</p>
        </div>
        <ol style="margin:14px 0 0;padding-left:22px;display:grid;gap:10px;line-height:1.55">
          <li>${text.tutorialStep1}</li>
          <li>${text.tutorialStep2}</li>
          <li>${text.tutorialStep3}</li>
          <li><strong>${text.tutorialStep4}</strong></li>
          <li>${text.tutorialStep5}</li>
        </ol>
        <p style="margin:14px 0 0"><a href="https://www.chsi.com.cn/xlcx/rhsq.jsp" target="_blank" rel="noopener noreferrer">${text.tutorialOfficial}</a></p>
        <p style="margin:10px 0 0;opacity:.78">${text.tutorialTip}</p>
        <button id="student-tutorial-ready" class="btn primary" type="button" style="margin-top:16px">${text.tutorialReady}</button>
      </div>
      <div id="student-verification-form" hidden style="margin-top:18px;padding:16px;border:1px solid var(--border);border-radius:16px">
        <strong>${zh ? "隐私提醒" : "Privacy notice"}</strong>
        <p style="margin:8px 0 0">${text.privacy}</p>
        <p style="margin:8px 0 0">${text.localOnly}</p>
        <label style="display:flex;gap:10px;align-items:flex-start;margin-top:14px">
          <input id="student-consent" type="checkbox" style="margin-top:3px">
          <span>${text.consent}</span>
        </label>
        <div style="display:grid;gap:10px;margin-top:14px">
          <div id="student-file-picker" class="student-file-picker">
            <input id="student-qr-file" type="file" accept="image/png,image/jpeg,image/webp">
            <label id="student-file-button" class="student-file-button" for="student-qr-file">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4M7.5 8.5 12 4l4.5 4.5M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>
              <span>${text.chooseQr}</span>
            </label>
            <small>${text.chooseQrHint}</small>
            <div id="student-file-preview" class="student-file-preview">
              <img id="student-file-preview-image" alt="">
              <div class="student-file-preview-copy">
                <strong>${text.previewTitle}</strong>
                <span id="student-file-preview-name" class="student-file-preview-name"></span>
                <span class="student-file-preview-note">${text.localPreview}</span>
              </div>
              <button id="student-file-replace" class="student-file-replace" type="button">${text.replaceQr}</button>
            </div>
          </div>
          <button id="student-manual-toggle" class="student-manual-toggle" type="button">${text.manualLink}</button>
          <div id="student-manual-wrap" hidden>
            <input id="student-target" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="${text.pasteLink}">
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button id="student-submit" class="btn primary" type="button" disabled>${text.submitStudent}</button>
          </div>
          <p id="student-feedback" style="margin:0"></p>
        </div>
      </div>
    </section>
    <section class="os-card settings-general-note">
      <strong>${text.plans}</strong>
      <div id="billing-plan-list" class="pricing-grid"></div>
      <p class="pricing-footnote">${zh ? "学生认证通过后可使用学生价格；学生资格只影响价格，不改变套餐容量与权益。" : "Verified students can use student pricing. Student eligibility changes price only, not plan capacity or entitlements."}</p>
      <p id="billing-status" style="margin-top:12px">${text.unavailableDetail}</p>
    </section>
    <script>
      (() => {
        const copy=${JSON.stringify(text)};
        const isZh=${zh ? "true" : "false"};
        const current=document.getElementById("billing-current");
        const planList=document.getElementById("billing-plan-list");
        const status=document.getElementById("billing-status");
        const studentState=document.getElementById("student-state");
        const studentPendingActions=document.getElementById("student-pending-actions");
        const studentRegionStep=document.getElementById("student-region-step");
        const studentMethodStep=document.getElementById("student-method-step");
        const studentRegionButtons=[...document.querySelectorAll("[data-student-region]")];
        const studentRegionSummary=document.getElementById("student-region-summary");
        const studentChangeRegion=document.getElementById("student-change-region");
        const studentMethodList=document.getElementById("student-method-list");
        const studentMethodNote=document.getElementById("student-method-note");
        const studentTutorial=document.getElementById("student-tutorial");
        const studentTutorialReady=document.getElementById("student-tutorial-ready");
        const studentVerificationForm=document.getElementById("student-verification-form");
        const studentConsent=document.getElementById("student-consent");
        const studentQrFile=document.getElementById("student-qr-file");
        const studentFilePicker=document.getElementById("student-file-picker");
        const studentFileButton=document.getElementById("student-file-button");
        const studentFilePreview=document.getElementById("student-file-preview");
        const studentFilePreviewImage=document.getElementById("student-file-preview-image");
        const studentFilePreviewName=document.getElementById("student-file-preview-name");
        const studentFileReplace=document.getElementById("student-file-replace");
        const studentManualToggle=document.getElementById("student-manual-toggle");
        const studentManualWrap=document.getElementById("student-manual-wrap");
        const studentTarget=document.getElementById("student-target");
        const studentSubmit=document.getElementById("student-submit");
        const studentCancel=document.getElementById("student-cancel");
        const studentFeedback=document.getElementById("student-feedback");
        const bytes=value=>{let n=Number(value)||0;const units=["B","KB","MB","GB","TB"];let i=0;while(n>=1024&&i<units.length-1){n/=1024;i++}return n.toLocaleString(undefined,{maximumFractionDigits:i?1:0})+" "+units[i]};
        const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
        const date=value=>{if(!value)return copy.free;const d=new Date(value);return Number.isNaN(d.getTime())?copy.free:d.toLocaleString()};
        const source=value=>value==="admin_grant"?copy.manual:value==="system"?copy.system:String(value||copy.system);
        const pricingCatalog=[
          {id:"aertex_free",name:"Free",capacity:"10GB",price:"免费",student:"免费",descZh:"基础使用",descEn:"Core storage"},
          {id:"aertex_mini",name:"Mini",capacity:"20GB",price:"¥3.9",student:"¥2.9",descZh:"轻量扩容",descEn:"Light storage expansion"},
          {id:"aertex_plus",name:"Plus",capacity:"60GB",price:"¥9.9",student:"¥7.9",descZh:"日常文件",descEn:"Everyday files"},
          {id:"aertex_pro",name:"Pro",capacity:"200GB",price:"¥34.9",student:"¥25.9",descZh:"照片、文档、学习资料",descEn:"Photos, documents, and study files",featured:true},
          {id:"aertex_max",name:"Max",capacity:"1TB",price:"¥159",student:"¥119",descZh:"主力个人云盘",descEn:"Primary personal cloud storage"},
          {id:"aertex_ultra",name:"Ultra",capacity:"2TB",price:"¥309",student:"¥229",descZh:"重度存储",descEn:"Heavy storage"},
          {id:"aertex_studio",name:"Studio",capacity:"6TB",price:"¥899",student:"¥699",descZh:"创作者 / 大型项目",descEn:"Creators and large projects"},
          {id:"aertex_vault",name:"Vault",capacity:"12TB",price:"¥1,799",student:"¥1,399",descZh:"超大容量长期存储",descEn:"Very large long-term storage"}
        ];
        let studentTutorialAcknowledged=false;
        let studentLocked=false;
        const studentRegionKey="aertex-student-school-region-v1";
        const validStudentRegions=new Set(["mainland_higher","mainland_other","hmt","international"]);
        let studentRegion="";
        let studentMethod="";
        let studentPreviewUrl="";
        const studentRegionLabel=value=>({
          mainland_higher:copy.regionMainlandHigher,
          mainland_other:copy.regionMainlandOther,
          hmt:copy.regionHmt,
          international:copy.regionInternational
        }[String(value)]||"");
        function loadStudentRegionPreference(){
          try{
            const saved=localStorage.getItem(studentRegionKey)||"";
            if(validStudentRegions.has(saved))studentRegion=saved;
          }catch{}
        }
        function saveStudentRegionPreference(){
          try{
            if(studentRegion)localStorage.setItem(studentRegionKey,studentRegion);
            else localStorage.removeItem(studentRegionKey);
          }catch{}
        }
        function renderStudentMethodOptions(){
          if(!studentMethodList)return;
          if(studentRegion==="mainland_higher"){
            studentMethodList.innerHTML=
              '<button class="student-method-card is-supported" type="button" data-student-method="chsi">'+
                '<span><strong>'+esc(copy.methodChsi)+'</strong><span>'+esc(copy.methodChsiHint)+'</span></span>'+
                '<span class="student-method-badge">'+esc(copy.supportedNow)+'</span>'+
              '</button>';
            studentMethodNote.hidden=true;
          }else{
            studentMethodList.innerHTML=
              '<button class="student-method-card" type="button" disabled>'+
                '<span><strong>'+esc(copy.methodSchoolEmail)+'</strong><span>'+esc(copy.methodSchoolEmailHint)+'</span></span>'+
                '<span class="student-method-badge">'+esc(copy.comingSoon)+'</span>'+
              '</button>'+
              '<button class="student-method-card" type="button" disabled>'+
                '<span><strong>'+esc(copy.methodEnrollment)+'</strong><span>'+esc(copy.methodEnrollmentHint)+'</span></span>'+
                '<span class="student-method-badge">'+esc(copy.comingSoon)+'</span>'+
              '</button>';
            studentMethodNote.hidden=false;
          }
          studentMethodList.querySelectorAll("[data-student-method]").forEach(button=>button.addEventListener("click",()=>{
            if(studentLocked)return;
            studentMethod=button.dataset.studentMethod||"";
            studentTutorialAcknowledged=false;
            studentVerificationForm.hidden=true;
            studentVerificationForm.style.display="none";
            studentTutorial.hidden=studentMethod!=="chsi";
            studentTutorial.style.display=studentMethod==="chsi"?"":"none";
            if(studentMethod==="chsi")studentTutorial.scrollIntoView({behavior:"smooth",block:"nearest"});
            syncStudentControls();
          }));
        }
        function paintStudentPath(){
          if(studentLocked){
            studentRegionStep.hidden=true;
            studentMethodStep.hidden=true;
            studentTutorial.hidden=true;
            studentTutorial.style.display="none";
            studentVerificationForm.hidden=true;
            studentVerificationForm.style.display="none";
            return;
          }
          const hasRegion=validStudentRegions.has(studentRegion);
          studentRegionStep.hidden=hasRegion;
          studentMethodStep.hidden=!hasRegion;
          studentRegionButtons.forEach(button=>{
            const selected=button.dataset.studentRegion===studentRegion;
            button.classList.toggle("is-selected",selected);
            button.setAttribute("aria-pressed",selected?"true":"false");
          });
          if(!hasRegion){
            studentMethod="";
            studentTutorial.hidden=true;
            studentTutorial.style.display="none";
            studentVerificationForm.hidden=true;
            studentVerificationForm.style.display="none";
            return;
          }
          studentRegionSummary.textContent=studentRegionLabel(studentRegion);
          if(studentRegion!=="mainland_higher")studentMethod="";
          renderStudentMethodOptions();
          const showTutorial=studentMethod==="chsi"&&studentRegion==="mainland_higher";
          studentTutorial.hidden=!showTutorial;
          studentTutorial.style.display=showTutorial?"":"none";
          if(!showTutorial){
            studentTutorialAcknowledged=false;
            studentVerificationForm.hidden=true;
            studentVerificationForm.style.display="none";
          }
        }
        const normalizeStudentCode=value=>{
          const code=String(value||"").trim().toUpperCase();
          return /^[A-Z0-9]{16}$/.test(code)?code:"";
        };
        const allowedStudentTarget=value=>{
          try{
            const url=new URL(String(value||"").trim());
            const host=url.hostname.toLowerCase();
            return url.protocol==="https:"&&!url.username&&!url.password&&!url.port&&(host==="chsi.com.cn"||host==="www.chsi.com.cn")&&/^\\/xlcx\\//i.test(url.pathname)?url.toString():"";
          }catch{return ""}
        };
        const studentEvidence=value=>{
          const raw=String(value||"").trim();
          const directCode=normalizeStudentCode(raw);
          if(directCode)return {kind:"code",code:directCode};
          const url=allowedStudentTarget(raw);
          if(url)return {kind:"url",url};
          const codeMatch=raw.match(/#([A-Z0-9]{16})#/i);
          if(codeMatch&&/学信网报告在线验证/.test(raw)&&/扫码验证/.test(raw)){
            const code=normalizeStudentCode(codeMatch[1]);
            if(code)return {kind:"code",code};
          }
          return null;
        };
        const studentTransportTarget=evidence=>{
          if(!evidence)return "";
          if(evidence.kind==="url")return evidence.url;
          return "https://www.chsi.com.cn/xlcx/bgcx.jsp?__aertex_online_code="+encodeURIComponent(evidence.code);
        };
        const studentStatusLabel=value=>({pending:copy.pending,verified:copy.verified,rejected:copy.rejected,expired:copy.expired,not_submitted:copy.notSubmitted}[String(value)]||copy.notSubmitted);
        function renderStudent(data){
          const state=data&&typeof data==="object"?data:{status:"not_submitted",eligible:false};
          let detail="—";
          if(state.status==="verified"&&state.report_expires_at)detail=copy.verifyingUntil+" "+date(state.report_expires_at);
          else if(state.status==="pending")detail=isZh?"正在等待管理员通过学信网官方渠道核验。":"Waiting for administrator review through the official CHSI verification service.";
          else if(state.status==="rejected"&&state.review_note)detail=String(state.review_note);
          else if(state.status==="expired")detail=isZh?"请重新提交有效的学生认证。":"Submit a new valid student verification.";
          studentState.innerHTML='<div class="settings-choice '+(state.eligible?'is-selected':'')+'"><strong>'+esc(studentStatusLabel(state.status))+'</strong><span>'+esc(detail)+'</span></div>';
          const pending=state.status==="pending";
          studentPendingActions.hidden=!pending;
          studentLocked=pending||state.eligible;
          studentTutorialReady.disabled=studentLocked;
          paintStudentPath();
          if(!studentLocked&&studentMethod==="chsi"&&studentTutorialAcknowledged){
            studentVerificationForm.hidden=false;
            studentVerificationForm.style.display="";
          }
          syncStudentControls();
        }
        function syncStudentControls(){
          const canUseForm=studentRegion==="mainland_higher"&&studentMethod==="chsi"&&studentTutorialAcknowledged&&!studentLocked&&!studentVerificationForm.hidden&&studentVerificationForm.style.display!=="none";
          studentConsent.disabled=!canUseForm;
          studentQrFile.disabled=!canUseForm;
          studentFilePicker.classList.toggle("is-disabled",!canUseForm);
          studentFileButton.setAttribute("aria-disabled",String(!canUseForm));
          studentTarget.disabled=!canUseForm;
          studentManualToggle.disabled=!canUseForm;
          studentFileReplace.disabled=!canUseForm;
          studentSubmit.disabled=!canUseForm||!studentConsent.checked||!studentEvidence(studentTarget.value);
        }
        async function loadStudent(){
          try{
            const response=await fetch("/api/student-verification",{credentials:"same-origin",cache:"no-store",headers:{Accept:"application/json"}});
            if(!response.ok)throw new Error("HTTP "+response.status);
            renderStudent(await response.json());
          }catch(error){
            console.error("Student verification state failed",error);
            studentFeedback.textContent=copy.error;
          }
        }
        function clearStudentPreview(){
          if(studentPreviewUrl){try{URL.revokeObjectURL(studentPreviewUrl)}catch{}}
          studentPreviewUrl="";
          studentFilePreview.classList.remove("is-visible");
          studentFilePreviewImage.removeAttribute("src");
          studentFilePreviewName.textContent="";
        }
        function showStudentPreview(file){
          clearStudentPreview();
          studentPreviewUrl=URL.createObjectURL(file);
          studentFilePreviewImage.src=studentPreviewUrl;
          studentFilePreviewName.textContent=file.name||copy.chooseQr;
          studentFilePreview.classList.add("is-visible");
        }
        async function decodeWithJsQr(bitmap){
          const canvas=document.createElement("canvas");
          canvas.width=bitmap.width;canvas.height=bitmap.height;
          const ctx=canvas.getContext("2d",{willReadFrequently:true});
          if(!ctx)return "";
          ctx.drawImage(bitmap,0,0);
          const imageData=ctx.getImageData(0,0,canvas.width,canvas.height);
          const mod=await import("https://cdn.jsdelivr.net/npm/jsqr@1.4.0/+esm");
          const jsQR=mod.default||mod;
          return String(jsQR(imageData.data,imageData.width,imageData.height,{inversionAttempts:"attemptBoth"})?.data||"");
        }
        async function decodeQrLocally(file){
          studentFeedback.textContent="";
          if(!file)return;
          if(file.size>5*1024*1024){clearStudentPreview();studentFeedback.textContent=copy.tooLarge;return}
          if(!["image/png","image/jpeg","image/webp"].includes(file.type)){clearStudentPreview();studentFeedback.textContent=copy.imageOnly;return}
          showStudentPreview(file);
          let bitmap;
          try{
            bitmap=await createImageBitmap(file);
            let raw="";
            if(typeof BarcodeDetector==="function"){
              try{
                const detector=new BarcodeDetector({formats:["qr_code"]});
                const codes=await detector.detect(bitmap);
                if(codes.length>1){studentFeedback.textContent=copy.multipleQr;return}
                raw=String(codes[0]?.rawValue||"");
              }catch(error){console.warn("BarcodeDetector QR decode failed",error)}
            }
            if(!raw)raw=await decodeWithJsQr(bitmap);
            const evidence=studentEvidence(raw);
            if(!evidence){
              studentFeedback.textContent=copy.invalidQr;
              studentManualWrap.hidden=false;
              studentManualToggle.textContent=copy.hideManualLink;
              return;
            }
            studentTarget.value=evidence.kind==="code"?evidence.code:evidence.url;
            studentManualWrap.hidden=true;
            studentManualToggle.textContent=copy.manualLink;
            studentFeedback.textContent=evidence.kind==="code"
              ?(isZh?"已识别学信网 16 位在线验证码。图片仅保留在当前页面本地预览，不会上传。":"CHSI 16-character online verification code recognized. The image remains only as a local preview on this page and is never uploaded.")
              :(isZh?"已识别学信网官方验证链接。图片仅保留在当前页面本地预览，不会上传。":"Official CHSI verification URL recognized. The image remains only as a local preview on this page and is never uploaded.");
          }catch(error){
            console.error("Local QR decode failed",error);
            studentFeedback.textContent=copy.invalidQr;
            studentManualWrap.hidden=false;
            studentManualToggle.textContent=copy.hideManualLink;
          }finally{
            try{bitmap?.close?.()}catch{}
            syncStudentControls();
          }
        }
        async function load(){
          try{
            const response=await fetch("/api/billing/state",{credentials:"same-origin",cache:"no-store",headers:{Accept:"application/json"}});
            if(!response.ok)throw new Error("HTTP "+response.status);
            const data=await response.json();
            const plan=data.plan||{};
            const subscription=data.subscription||null;
            const quota=Number(data.entitlements?.drive_storage_bytes)||0;
            current.innerHTML=
              '<div class="settings-choice is-selected"><strong>'+esc(plan.display_name_${zh ? "zh" : "en"}||plan.display_name_en||plan.id||"AERTEX Free")+'</strong><span>'+esc(subscription?.status==="grace"?copy.grace:copy.active)+'</span></div>'+
              '<div class="settings-choice"><strong>'+esc(copy.quota)+'</strong><span>'+esc(bytes(quota))+'</span></div>'+
              '<div class="settings-choice"><strong>'+esc(copy.renew)+'</strong><span>'+esc(date(subscription?.current_period_end))+'</span></div>'+
              '<div class="settings-choice"><strong>'+esc(copy.autoRenew)+'</strong><span>'+esc(subscription?.auto_renew?copy.on:copy.off)+' · '+esc(source(subscription?.source))+'</span></div>';
            planList.innerHTML=pricingCatalog.map(item=>{
              const selected=item.id===plan.id;
              const description=isZh?item.descZh:item.descEn;
              const badge=selected?(isZh?"当前套餐":"Current"):item.featured?(isZh?"推荐":"Popular"):"";
              const ordinary=item.price==="免费"?(isZh?"免费":"Free"):item.price;
              const student=item.student==="免费"?(isZh?"免费":"Free"):item.student;
              return '<article class="pricing-card '+(selected?'is-selected ':'')+(item.featured?'is-featured':'')+'">'+
                '<div class="pricing-head"><strong class="pricing-name">'+esc(item.name)+'</strong>'+(badge?'<span class="pricing-badge">'+esc(badge)+'</span>':'')+'</div>'+
                '<div class="pricing-capacity">'+esc(item.capacity)+'</div>'+
                '<div class="pricing-price-row"><span class="pricing-price">'+esc(ordinary)+'</span>'+(ordinary===(isZh?"免费":"Free")?'':'<span class="pricing-period">'+(isZh?"/ 月":"/ month")+'</span>')+'</div>'+
                '<div class="pricing-student"><strong>'+esc(student)+'</strong>'+(student===(isZh?"免费":"Free")?'':'<span>'+(isZh?"/月 · 学生":"/ month · Student")+'</span>')+'</div>'+
                '<p class="pricing-desc">'+esc(description)+'</p>'+
              '</article>';
            }).join("");
            status.textContent=copy.unavailable+" · "+copy.unavailableDetail;
          }catch(error){
            console.error("Billing state failed",error);
            current.innerHTML='<div class="settings-choice"><strong>'+esc(copy.error)+'</strong><span>—</span></div>';
            if(status)status.textContent=copy.error;
          }
        }
        studentRegionButtons.forEach(button=>button.addEventListener("click",()=>{
          if(studentLocked)return;
          const next=button.dataset.studentRegion||"";
          if(!validStudentRegions.has(next))return;
          studentRegion=next;
          studentMethod="";
          studentTutorialAcknowledged=false;
          saveStudentRegionPreference();
          clearStudentPreview();
          studentQrFile.value="";
          studentTarget.value="";
          studentConsent.checked=false;
          paintStudentPath();
          studentMethodStep.scrollIntoView({behavior:"smooth",block:"nearest"});
          syncStudentControls();
        }));
        studentChangeRegion?.addEventListener("click",()=>{
          if(studentLocked)return;
          studentRegion="";
          studentMethod="";
          studentTutorialAcknowledged=false;
          saveStudentRegionPreference();
          clearStudentPreview();
          studentQrFile.value="";
          studentTarget.value="";
          studentConsent.checked=false;
          paintStudentPath();
          studentRegionStep.scrollIntoView({behavior:"smooth",block:"nearest"});
          syncStudentControls();
        });
        studentTutorialReady?.addEventListener("click",()=>{
          if(studentLocked||studentRegion!=="mainland_higher"||studentMethod!=="chsi")return;
          studentTutorialAcknowledged=true;
          studentVerificationForm.hidden=false;
          studentVerificationForm.style.display="";
          studentTutorialReady.textContent=isZh?"教程已阅读 ✓":"Guide completed ✓";
          studentVerificationForm.scrollIntoView({behavior:"smooth",block:"nearest"});
          syncStudentControls();
        });
        studentConsent?.addEventListener("change",()=>{
          if(studentConsent.checked){
            studentFeedback.textContent=isZh?"已确认隐私提示。选择二维码，或输入 16 位在线验证码 / 官方验证链接后即可提交。":"Privacy notice confirmed. Choose a QR image, or enter the 16-character code / official verification URL to continue.";
          }else{
            studentFeedback.textContent=isZh?"提交前需要勾选隐私确认；二维码图片仍只在本地解析。":"You must confirm the privacy notice before submitting; QR images are still decoded locally.";
          }
          syncStudentControls();
        });
        studentQrFile?.addEventListener("change",event=>void decodeQrLocally(event.target.files?.[0]));
        studentFileReplace?.addEventListener("click",()=>studentQrFile.click());
        studentManualToggle?.addEventListener("click",()=>{
          const willShow=studentManualWrap.hidden;
          studentManualWrap.hidden=!willShow;
          studentManualToggle.textContent=willShow?copy.hideManualLink:copy.manualLink;
          if(willShow){
            requestAnimationFrame(()=>{
              studentTarget.focus({preventScroll:true});
              studentTarget.scrollIntoView({block:"center",behavior:"smooth"});
            });
          }
        });
        studentTarget?.addEventListener("input",()=>syncStudentControls());
        studentSubmit?.addEventListener("click",async()=>{
          const evidence=studentEvidence(studentTarget.value);
          const target=studentTransportTarget(evidence);
          if(!studentConsent.checked||!target){studentFeedback.textContent=copy.invalidQr;return}
          studentSubmit.disabled=true;
          try{
            const response=await fetch("/api/student-verification",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json",Accept:"application/json"},body:JSON.stringify({target_url:target})});
            const payload=await response.json().catch(()=>({}));
            if(!response.ok)throw new Error(payload.error||("HTTP "+response.status));
            studentTarget.value="";
            clearStudentPreview();
            studentQrFile.value="";
            studentFeedback.textContent=copy.submitted;
            renderStudent(payload);
          }catch(error){studentFeedback.textContent=String(error?.message||copy.error)}
        });
        studentCancel?.addEventListener("click",async()=>{
          studentCancel.disabled=true;
          try{
            const response=await fetch("/api/student-verification",{method:"DELETE",credentials:"same-origin",headers:{Accept:"application/json"}});
            const payload=await response.json().catch(()=>({}));
            if(!response.ok)throw new Error(payload.error||("HTTP "+response.status));
            studentFeedback.textContent=copy.canceled;
            renderStudent(payload);
          }catch(error){studentFeedback.textContent=String(error?.message||copy.error)}
          finally{studentCancel.disabled=false}
        });
        loadStudentRegionPreference();
        paintStudentPath();
        void load();
        void loadStudent();
      })();
    </script>
  `;
}
