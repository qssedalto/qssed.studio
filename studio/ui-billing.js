export function billingSettingsContent(zh) {
  const text = zh ? {
    loading:"正在读取订阅…", current:"当前套餐", drive:"AERTEX Drive", renew:"有效期",
    free:"长期有效", source:"来源", plans:"可用套餐", unavailable:"支付接口尚未开放",
    unavailableDetail:"当前阶段用于验证套餐、权益和管理员授权。支付宝与微信支付接入后会在这里启用购买。",
    error:"暂时无法读取订阅信息。", active:"有效", grace:"宽限期", manual:"管理员授权",
    system:"系统", autoRenew:"自动续费", off:"关闭", on:"开启", quota:"云盘容量"
  } : {
    loading:"Loading subscription…", current:"Current plan", drive:"AERTEX Drive", renew:"Valid through",
    free:"No expiry", source:"Source", plans:"Available plans", unavailable:"Checkout is not available yet",
    unavailableDetail:"This phase validates plans, entitlements, and administrator grants. Alipay and WeChat Pay checkout will be enabled here later.",
    error:"Subscription information is temporarily unavailable.", active:"Active", grace:"Grace period", manual:"Admin grant",
    system:"System", autoRenew:"Auto-renew", off:"Off", on:"On", quota:"Drive quota"
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
        const bytes=value=>{let n=Number(value)||0;const units=["B","KB","MB","GB","TB"];let i=0;while(n>=1024&&i<units.length-1){n/=1024;i++}return n.toLocaleString(undefined,{maximumFractionDigits:i?1:0})+" "+units[i]};
        const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
        const date=value=>{if(!value)return copy.free;const d=new Date(value);return Number.isNaN(d.getTime())?copy.free:d.toLocaleString()};
        const source=value=>value==="admin_grant"?copy.manual:value==="system"?copy.system:String(value||copy.system);
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
        void load();
      })();
    </script>
  `;
}
