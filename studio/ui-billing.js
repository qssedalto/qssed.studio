export function billingSettingsContent(zh) {
  const text = zh ? {
    loading:"正在读取订阅…", current:"当前套餐", drive:"AERTEX Drive", renew:"有效期",
    free:"长期有效", source:"来源", plans:"可用套餐", unavailable:"支付接口尚未开放",
    unavailableDetail:"当前阶段用于验证套餐、权益和管理员授权。支付宝与微信支付接入后会在这里启用购买。",
    error:"暂时无法读取订阅信息。", active:"有效", grace:"宽限期", manual:"管理员授权",
    system:"系统", autoRenew:"自动续费", off:"关闭", on:"开启", quota:"云盘容量",
    student:"学生资格", studentIntro:"使用学信网《教育部学籍在线验证报告》中的二维码申请学生资格。AERTEX 不需要你的学信网账号或密码。",
    privacy:"仅选择二维码区域。不要提交完整报告，也不要提交身份证号、学号、姓名、证件照片、账号密码或其他无关个人信息。",
    localOnly:"二维码图片只在你的浏览器本地解析，不会上传到 AERTEX。服务器只接收经校验的学信网官方验证链接。",
    consent:"我确认所选图片仅包含用于认证的二维码，不包含其他敏感个人信息。",
    chooseQr:"选择二维码图片", pasteLink:"或粘贴扫码得到的学信网官方验证链接", submitStudent:"提交学生认证",
    cancelStudent:"取消待审核申请", pending:"待审核", verified:"已认证", rejected:"未通过", expired:"已过期",
    notSubmitted:"尚未认证", unsupportedQr:"当前浏览器无法本地识别二维码，请使用系统相机扫码后粘贴官方验证链接。",
    invalidQr:"未识别到受支持的学信网官方验证二维码。", tooLarge:"图片过大，请选择 5 MB 以内的二维码截图。",
    imageOnly:"仅支持 PNG、JPEG 或 WebP 图片。", multipleQr:"图片中检测到多个二维码，请裁剪到只剩一个二维码。",
    submitted:"学生认证申请已提交。", canceled:"待审核申请已取消。", verifyingUntil:"有效期至"
  } : {
    loading:"Loading subscription…", current:"Current plan", drive:"AERTEX Drive", renew:"Valid through",
    free:"No expiry", source:"Source", plans:"Available plans", unavailable:"Checkout is not available yet",
    unavailableDetail:"This phase validates plans, entitlements, and administrator grants. Alipay and WeChat Pay checkout will be enabled here later.",
    error:"Subscription information is temporarily unavailable.", active:"Active", grace:"Grace period", manual:"Admin grant",
    system:"System", autoRenew:"Auto-renew", off:"Off", on:"On", quota:"Drive quota",
    student:"Student eligibility", studentIntro:"Use the QR code from an official CHSI Online Verification Report of Student Record. AERTEX never asks for your CHSI account password.",
    privacy:"Select only the QR-code area. Do not submit a full report or any image containing an ID number, student number, name, portrait, account credentials, or unrelated personal information.",
    localOnly:"The QR image is decoded locally in your browser and is never uploaded to AERTEX. The server receives only a validated official CHSI verification URL.",
    consent:"I confirm the selected image contains only the verification QR code and no other sensitive personal information.",
    chooseQr:"Choose QR image", pasteLink:"Or paste the official CHSI verification URL obtained by scanning the QR code", submitStudent:"Submit verification",
    cancelStudent:"Cancel pending request", pending:"Pending review", verified:"Verified", rejected:"Rejected", expired:"Expired",
    notSubmitted:"Not verified", unsupportedQr:"This browser cannot decode QR codes locally. Scan it with the system camera and paste the official verification URL instead.",
    invalidQr:"No supported official CHSI verification QR code was found.", tooLarge:"Image is too large. Use a QR crop under 5 MB.",
    imageOnly:"Only PNG, JPEG, or WebP images are supported.", multipleQr:"Multiple QR codes were detected. Crop the image so only one QR code remains.",
    submitted:"Student verification request submitted.", canceled:"Pending verification request canceled.", verifyingUntil:"Valid through"
  };

  return `
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
      <div style="margin-top:18px;padding:16px;border:1px solid var(--border);border-radius:16px">
        <strong>${zh ? "隐私提醒" : "Privacy notice"}</strong>
        <p style="margin:8px 0 0">${text.privacy}</p>
        <p style="margin:8px 0 0">${text.localOnly}</p>
        <label style="display:flex;gap:10px;align-items:flex-start;margin-top:14px">
          <input id="student-consent" type="checkbox" style="margin-top:3px">
          <span>${text.consent}</span>
        </label>
        <div style="display:grid;gap:10px;margin-top:14px">
          <input id="student-qr-file" type="file" accept="image/png,image/jpeg,image/webp" capture="environment" disabled>
          <input id="student-target" type="url" inputmode="url" autocomplete="off" spellcheck="false" placeholder="${text.pasteLink}" disabled>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button id="student-submit" class="btn primary" type="button" disabled>${text.submitStudent}</button>
            <button id="student-cancel" class="btn" type="button" hidden>${text.cancelStudent}</button>
          </div>
          <p id="student-feedback" style="margin:0"></p>
        </div>
      </div>
      <p style="margin-top:14px"><a href="https://www.chsi.com.cn/xlcx/rhsq.jsp" target="_blank" rel="noopener noreferrer">${zh ? "前往学信网申请在线验证报告 ↗" : "Apply for a CHSI online verification report ↗"}</a></p>
    </section>
    <section class="os-card settings-general-note">
      <strong>${text.plans}</strong>
      <div id="billing-plan-list" class="settings-choice-grid"></div>
      <p id="billing-status" style="margin-top:16px">${text.unavailableDetail}</p>
    </section>
    <script>
      (() => {
        const copy=${JSON.stringify(text)};
        const current=document.getElementById("billing-current");
        const planList=document.getElementById("billing-plan-list");
        const status=document.getElementById("billing-status");
        const studentState=document.getElementById("student-state");
        const studentConsent=document.getElementById("student-consent");
        const studentQrFile=document.getElementById("student-qr-file");
        const studentTarget=document.getElementById("student-target");
        const studentSubmit=document.getElementById("student-submit");
        const studentCancel=document.getElementById("student-cancel");
        const studentFeedback=document.getElementById("student-feedback");
        const bytes=value=>{let n=Number(value)||0;const units=["B","KB","MB","GB","TB"];let i=0;while(n>=1024&&i<units.length-1){n/=1024;i++}return n.toLocaleString(undefined,{maximumFractionDigits:i?1:0})+" "+units[i]};
        const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
        const date=value=>{if(!value)return copy.free;const d=new Date(value);return Number.isNaN(d.getTime())?copy.free:d.toLocaleString()};
        const source=value=>value==="admin_grant"?copy.manual:value==="system"?copy.system:String(value||copy.system);
        const allowedStudentTarget=value=>{
          try{
            const url=new URL(String(value||"").trim());
            const host=url.hostname.toLowerCase();
            return url.protocol==="https:"&&!url.username&&!url.password&&!url.port&&(host==="chsi.com.cn"||host==="www.chsi.com.cn")&&/^\\/xlcx\\//i.test(url.pathname)?url.toString():"";
          }catch{return ""}
        };
        const studentStatusLabel=value=>({pending:copy.pending,verified:copy.verified,rejected:copy.rejected,expired:copy.expired,not_submitted:copy.notSubmitted}[String(value)]||copy.notSubmitted);
        function renderStudent(data){
          const state=data&&typeof data==="object"?data:{status:"not_submitted",eligible:false};
          let detail="—";
          if(state.status==="verified"&&state.report_expires_at)detail=copy.verifyingUntil+" "+date(state.report_expires_at);
          else if(state.status==="pending")detail=zh?"正在等待管理员通过学信网官方渠道核验。":"Waiting for administrator review through the official CHSI verification service.";
          else if(state.status==="rejected"&&state.review_note)detail=String(state.review_note);
          else if(state.status==="expired")detail=zh?"请重新提交有效的学生认证。":"Submit a new valid student verification.";
          studentState.innerHTML='<div class="settings-choice '+(state.eligible?'is-selected':'')+'"><strong>'+esc(studentStatusLabel(state.status))+'</strong><span>'+esc(detail)+'</span></div>';
          studentCancel.hidden=state.status!=="pending";
          const locked=state.status==="pending"||state.eligible;
          studentConsent.disabled=locked;
          studentQrFile.disabled=locked||!studentConsent.checked;
          studentTarget.disabled=locked||!studentConsent.checked;
          studentSubmit.disabled=locked||!studentConsent.checked||!allowedStudentTarget(studentTarget.value);
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
        async function decodeQrLocally(file){
          studentFeedback.textContent="";
          if(!file)return;
          if(file.size>5*1024*1024){studentFeedback.textContent=copy.tooLarge;return}
          if(!["image/png","image/jpeg","image/webp"].includes(file.type)){studentFeedback.textContent=copy.imageOnly;return}
          if(typeof BarcodeDetector!=="function"){
            studentFeedback.textContent=copy.unsupportedQr;
            return;
          }
          let bitmap;
          try{
            bitmap=await createImageBitmap(file);
            const detector=new BarcodeDetector({formats:["qr_code"]});
            const codes=await detector.detect(bitmap);
            if(codes.length!==1){
              studentFeedback.textContent=codes.length>1?copy.multipleQr:copy.invalidQr;
              return;
            }
            const target=allowedStudentTarget(codes[0]?.rawValue||"");
            if(!target){studentFeedback.textContent=copy.invalidQr;return}
            studentTarget.value=target;
            studentFeedback.textContent=zh?"已在本地识别官方验证二维码，图片不会上传。":"Official verification QR decoded locally; the image will not be uploaded.";
          }catch(error){
            console.error("Local QR decode failed",error);
            studentFeedback.textContent=copy.invalidQr;
          }finally{
            try{bitmap?.close?.()}catch{}
            studentQrFile.value="";
            studentSubmit.disabled=!studentConsent.checked||!allowedStudentTarget(studentTarget.value);
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
        studentConsent?.addEventListener("change",()=>{
          const enabled=studentConsent.checked;
          studentQrFile.disabled=!enabled;
          studentTarget.disabled=!enabled;
          studentSubmit.disabled=!enabled||!allowedStudentTarget(studentTarget.value);
          if(!enabled){
            studentTarget.value="";
            studentQrFile.value="";
            studentFeedback.textContent="";
          }
        });
        studentQrFile?.addEventListener("change",event=>void decodeQrLocally(event.target.files?.[0]));
        studentTarget?.addEventListener("input",()=>{
          studentSubmit.disabled=!studentConsent.checked||!allowedStudentTarget(studentTarget.value);
        });
        studentSubmit?.addEventListener("click",async()=>{
          const target=allowedStudentTarget(studentTarget.value);
          if(!studentConsent.checked||!target){studentFeedback.textContent=copy.invalidQr;return}
          studentSubmit.disabled=true;
          try{
            const response=await fetch("/api/student-verification",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json",Accept:"application/json"},body:JSON.stringify({target_url:target})});
            const payload=await response.json().catch(()=>({}));
            if(!response.ok)throw new Error(payload.error||("HTTP "+response.status));
            studentTarget.value="";
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
