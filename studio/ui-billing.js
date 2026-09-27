export function billingSettingsContent(zh) {
  const text = zh ? {
    loading:"正在读取订阅…", current:"当前套餐", drive:"AERTEX Drive", renew:"有效期",
    free:"长期有效", source:"来源", plans:"可用套餐", unavailable:"支付接口尚未开放",
    unavailableDetail:"当前阶段用于验证套餐、权益和管理员授权。支付宝与微信支付接入后会在这里启用购买。",
    error:"暂时无法读取订阅信息。", active:"有效", grace:"宽限期", manual:"管理员授权",
    system:"系统", autoRenew:"自动续费", off:"关闭", on:"开启", quota:"云盘容量",
    student:"学生资格", studentIntro:"使用学信网《教育部学籍在线验证报告》中的二维码申请学生资格。AERTEX 不需要你的学信网账号或密码。",
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
    student:"Student eligibility", studentIntro:"Use the QR code from an official CHSI Online Verification Report of Student Record. AERTEX never asks for your CHSI account password.",
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
      @media (max-width:620px){
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
      <div id="student-tutorial" style="margin-top:18px;padding:18px;border:1px solid var(--border);border-radius:16px">
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
      <div id="billing-plan-list" class="settings-choice-grid"></div>
      <p id="billing-status" style="margin-top:16px">${text.unavailableDetail}</p>
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
        let studentTutorialAcknowledged=false;
        let studentLocked=false;
        let studentPreviewUrl="";
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
          if(studentLocked){
            studentTutorialReady.disabled=true;
            studentTutorial.style.display="none";
            studentVerificationForm.hidden=true;
            studentVerificationForm.style.display="none";
          }else{
            studentTutorialReady.disabled=false;
            studentTutorial.style.display="";
            studentVerificationForm.hidden=!studentTutorialAcknowledged;
            studentVerificationForm.style.display=studentTutorialAcknowledged?"":"none";
          }
          syncStudentControls();
        }
        function syncStudentControls(){
          const canUseForm=studentTutorialAcknowledged&&!studentLocked&&!studentVerificationForm.hidden&&studentVerificationForm.style.display!=="none";
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
            const plans=Array.isArray(data.plans)?data.plans:[];
            planList.innerHTML=plans.map(item=>{
              const selected=item.id===plan.id;
              const title=item.display_name_${zh ? "zh" : "en"}||item.display_name_en||item.id;
              const detail=item.description_${zh ? "zh" : "en"}||item.description_en||"";
              const storage=bytes(item.entitlements?.drive_storage_bytes||0);
              return '<div class="settings-choice '+(selected?'is-selected':'')+'"><strong>'+esc(title)+'</strong><span>'+esc(detail)+' · '+esc(storage)+'</span></div>';
            }).join("");
            status.textContent=copy.unavailable+" · "+copy.unavailableDetail;
          }catch(error){
            console.error("Billing state failed",error);
            current.innerHTML='<div class="settings-choice"><strong>'+esc(copy.error)+'</strong><span>—</span></div>';
            if(status)status.textContent=copy.error;
          }
        }
        studentTutorialReady?.addEventListener("click",()=>{
          if(studentLocked)return;
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
        void load();
        void loadStudent();
      })();
    </script>
  `;
}
