import { osHubGrid, osHubIcon } from "./ui-primitives.js";

export function settingsGeneralContent(zh) {
  const prefix = zh ? "/zh-cn" : "/en";
  const rows = zh ? [
    ["外观", "浅色或深色", `${prefix}/settings/appearance`, "appearance"],
    ["语言", "中文或 English", `${prefix}/settings/language`, "language"],
    ["账户与安全", "设备和登录记录", `${prefix}/settings/security`, "shield"]
  ] : [
    ["Appearance", "Light or dark", `${prefix}/settings/appearance`, "appearance"],
    ["Language", "Chinese or English", `${prefix}/settings/language`, "language"],
    ["Account & Security", "Devices and sign-ins", `${prefix}/settings/security`, "shield"]
  ];
  return `
    <section class="os-card settings-general-card">
      <div class="settings-general-heading">
        ${osHubIcon("general")}
        <div>
          <small>${zh ? "通用" : "General"}</small>
          <h2>${zh ? "常用设置" : "Common Settings"}</h2>
          <p>${zh ? "外观、语言和账户安全。" : "Appearance, language, and account security."}</p>
        </div>
      </div>
      <div class="settings-general-list">
        ${rows.map(row => `<a href="${row[2]}">${osHubIcon(row[3])}<span><strong>${row[0]}</strong><small>${row[1]}</small></span><b aria-hidden="true">›</b></a>`).join("")}
      </div>
    </section>
    <section class="os-card settings-general-note">
      <strong>${zh ? "更多设置" : "More Settings"}</strong>
      <p>${zh ? "对应服务接入后会显示在这里。" : "More controls will appear as their services become available."}</p>
    </section>
  `;
}

export function securityAuditContent(zh) {
  return `
    <section class="os-card audit-section">
      <h2>${zh ? "当前设备" : "Current Device"}</h2>
      <div id="audit-current-device" class="audit-current">...</div>
    </section>
    <section class="os-card audit-section">
      <h2>${zh ? "登录设备" : "Signed-in Devices"}</h2>
      <div id="audit-device-list" class="audit-devices"></div>
    </section>
    <section class="os-card audit-section">
      <h2>${zh ? "登录历史" : "Sign-in History"}</h2>
      <div id="audit-login-timeline" class="audit-timeline"></div>
    </section>
    <section class="os-card audit-section">
      <h2>${zh ? "安全提醒" : "Security Alerts"}</h2>
      <div id="audit-risk-alerts" class="audit-alerts"></div>
    </section>
  `;
}

export function appearanceSettingsContent(zh) {
  return `
    <section class="os-card is-large settings-detail-card">
      <h2>${zh ? "显示模式" : "Appearance"}</h2>
      <p>${zh ? "选择浅色或深色。设置保存在当前浏览器。" : "Choose light or dark. This setting is saved in the current browser."}</p>
      <div class="settings-choice-grid">
        <button class="settings-choice" type="button" data-settings-theme="light"><strong>${zh ? "浅色" : "Light"}</strong><span>${zh ? "浅色界面" : "Light interface"}</span></button>
        <button class="settings-choice" type="button" data-settings-theme="dark"><strong>${zh ? "深色" : "Dark"}</strong><span>${zh ? "深色界面" : "Dark interface"}</span></button>
      </div>
    </section>
    <script>
      (() => {
        const choices = Array.from(document.querySelectorAll("[data-settings-theme]"));
        if (!choices.length) return;
        const refresh = () => {
          const current = document.documentElement.dataset.theme || "light";
          choices.forEach(button => button.classList.toggle("is-selected", button.dataset.settingsTheme === current));
        };
        choices.forEach(button => button.addEventListener("click", () => {
          const theme = button.dataset.settingsTheme;
          document.documentElement.classList.add("theme-switching");
          document.documentElement.dataset.theme = theme;
          try { localStorage.setItem("qssed-theme", theme); } catch {}
          window.setTimeout(() => document.documentElement.classList.remove("theme-switching"), 220);
          refresh();
        }));
        refresh();
      })();
    </script>
  `;
}

export function languageSettingsContent(zh) {
  return `
    <section class="os-card is-large settings-detail-card">
      <h2>${zh ? "显示语言" : "Language"}</h2>
      <p>${zh ? "选择 AERTEX 的界面语言。" : "Choose the interface language for AERTEX."}</p>
      <div class="settings-choice-grid">
        <a class="settings-choice ${zh ? "is-selected" : ""}" href="/zh-cn/settings/language"><strong>中文</strong><span>简体中文</span></a>
        <a class="settings-choice ${zh ? "" : "is-selected"}" href="/en/settings/language"><strong>English</strong><span>English</span></a>
      </div>
    </section>
  `;
}

export function aiSettingsContent(zh) {
  const copy = zh ? {
    title:"AI 设置",
    intro:"查看当前账号的 Intelligence 权限、Provider、模型和使用额度。默认模型保存在当前浏览器。",
    loading:"正在读取 AI 配置…",
    enabled:"已启用",
    disabled:"未启用",
    providers:"可用 Provider",
    models:"默认模型",
    usage:"用量与额度",
    today:"今日",
    month:"本月",
    tokens:"Token",
    cost:"费用",
    unlimited:"不限",
    unavailable:"当前账号尚未获得 Intelligence 权限，或管理员尚未分配可用 Provider。",
    region:"当前网络区域",
    open:"打开 AERTEX Intelligence",
    saved:"默认模型已保存到当前浏览器",
    error:"无法读取 AI 配置"
  } : {
    title:"AI Settings",
    intro:"View this account's Intelligence access, providers, models, and usage limits. The default model is saved in this browser.",
    loading:"Loading AI configuration…",
    enabled:"Enabled",
    disabled:"Not enabled",
    providers:"Available providers",
    models:"Default model",
    usage:"Usage & limits",
    today:"Today",
    month:"This month",
    tokens:"Tokens",
    cost:"Cost",
    unlimited:"Unlimited",
    unavailable:"Intelligence access has not been enabled for this account, or no provider has been assigned.",
    region:"Current network region",
    open:"Open AERTEX Intelligence",
    saved:"Default model saved in this browser",
    error:"Unable to load AI configuration"
  };
  return `
    <style>
      .ai-settings-stack{display:grid;gap:16px}
      .ai-settings-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin-top:14px}
      .ai-settings-panel{padding:18px;border:1px solid var(--border);border-radius:18px;background:var(--card)}
      .ai-settings-panel small{display:block;color:var(--muted);font-size:12px;margin-bottom:8px}
      .ai-settings-panel strong{display:block;font-size:18px}
      .ai-settings-panel p{margin:7px 0 0;color:var(--muted);line-height:1.5}
      .ai-provider-list{display:grid;gap:9px;margin-top:12px}
      .ai-provider-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-top:1px solid var(--border)}
      .ai-provider-row:first-child{border-top:0;padding-top:0}
      .ai-provider-row span{min-width:0;color:var(--muted);font-size:13px;text-align:right}
      .ai-model-select{width:100%;min-height:48px;margin-top:12px;padding:0 12px;border:1px solid var(--border);border-radius:12px;background:var(--card);color:var(--text);font:inherit}
      .ai-settings-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:14px}
      .ai-settings-feedback{color:var(--muted);font-size:12px}
      .ai-usage-line{display:flex;justify-content:space-between;gap:12px;margin-top:9px;font-size:13px}
      @media(max-width:620px){.ai-settings-grid{grid-template-columns:1fr}}
    </style>
    <section class="os-card is-large settings-detail-card">
      <div class="settings-general-heading">
        ${osHubIcon("ai")}
        <div>
          <small>AERTEX INTELLIGENCE</small>
          <h2>${copy.title}</h2>
          <p>${copy.intro}</p>
        </div>
      </div>
      <div id="ai-settings-state" class="ai-settings-stack">
        <div class="ai-settings-panel"><strong>${copy.loading}</strong></div>
      </div>
    </section>
    <script>
      (() => {
        const copy=${JSON.stringify(copy)};
        const isZh=${JSON.stringify(zh)};
        const root=document.getElementById("ai-settings-state");
        const preferenceKey="aertex-ai-default-model-v1";
        const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
        const money=value=>Number.isFinite(Number(value))?"$"+Number(value).toFixed(4):"—";
        const integer=value=>Number.isFinite(Number(value))?Math.round(Number(value)).toLocaleString():"—";
        const limit=(used,max,kind)=>{
          const usedText=kind==="usd"?money(used):integer(used);
          const maxText=max==null?copy.unlimited:(kind==="usd"?money(max):integer(max));
          return usedText+" / "+maxText;
        };
        const providerLabel=p=>{
          const name=String(p?.name||"");
          const vendor=p?.provider==="zhipu"?"智谱 GLM":p?.provider==="bailian"?"阿里云百炼":p?.provider==="openai"?"OpenAI":String(p?.provider||"Provider");
          return vendor+(name?" · "+name:"");
        };
        const preferenceDomain=()=>{
          const host=String(location.hostname||"").toLowerCase();
          return ["qsseda.com","qsseda.online","qsseda.studio"].find(domain=>host===domain||host.endsWith("."+domain))||"";
        };
        const readPreference=()=>{
          try{
            const prefix=preferenceKey+"=";
            const raw=document.cookie.split(";").map(part=>part.trim()).find(part=>part.startsWith(prefix));
            if(raw)return JSON.parse(decodeURIComponent(raw.slice(prefix.length)));
          }catch{}
          try{return JSON.parse(localStorage.getItem(preferenceKey)||"null")}catch{return null}
        };
        const savePreference=(providerId,model)=>{
          const value=JSON.stringify({provider_id:providerId,model});
          try{localStorage.setItem(preferenceKey,value)}catch{}
          try{
            const domain=preferenceDomain();
            document.cookie=preferenceKey+"="+encodeURIComponent(value)+"; Path=/; Max-Age=31536000; SameSite=Lax; Secure"+(domain?"; Domain="+domain:"");
          }catch{}
        };
        async function load(){
          try{
            const response=await fetch("/api/ai/config",{credentials:"same-origin",cache:"no-store",headers:{Accept:"application/json"}});
            const cfg=await response.json().catch(()=>null);
            if(!response.ok||!cfg?.enabled)throw new Error(cfg?.error||copy.unavailable);
            const providers=Array.isArray(cfg.providers)?cfg.providers:[];
            const models=Array.isArray(cfg.models)?cfg.models:[];
            const available=models.filter(item=>item.available!==false);
            const saved=readPreference();
            const chosen=available.find(item=>item.provider_id===saved?.provider_id&&item.model===saved?.model)
              || available.find(item=>item.provider_id===cfg.default_provider_id&&item.model===cfg.default_model)
              || available[0]
              || null;
            root.innerHTML=
              '<div class="ai-settings-grid">'+
                '<div class="ai-settings-panel"><small>'+esc(copy.enabled)+'</small><strong>AERTEX Intelligence</strong><p>'+esc(copy.region)+': '+esc(cfg.country||"—")+'</p></div>'+
                '<div class="ai-settings-panel"><small>'+esc(copy.providers)+'</small><strong>'+esc(String(providers.filter(p=>p.available!==false).length))+'</strong><p>'+esc(available.length+" "+copy.models)+'</p></div>'+
              '</div>'+
              '<div class="ai-settings-panel"><small>'+esc(copy.providers)+'</small><div class="ai-provider-list">'+
                providers.map(p=>'<div class="ai-provider-row"><strong>'+esc(providerLabel(p))+'</strong><span>'+esc(p.available===false?(isZh?"当前网络不可用":"Unavailable on current network"):(isZh?"可用":"Available"))+'</span></div>').join("")+
              '</div></div>'+
              '<div class="ai-settings-panel"><small>'+esc(copy.models)+'</small><strong>'+esc(chosen?.model||"—")+'</strong>'+
                '<select id="ai-default-model" class="ai-model-select" '+(available.length?"":"disabled")+'>'+
                  available.map(item=>'<option value="'+esc(item.provider_id+"|"+item.model)+'" '+(chosen&&item.provider_id===chosen.provider_id&&item.model===chosen.model?"selected":"")+'>'+esc(providerLabel(providers.find(p=>p.id===item.provider_id)))+' · '+esc(item.model)+'</option>').join("")+
                '</select><div class="ai-settings-actions"><a class="btn primary" href="'+esc((location.pathname.startsWith("/en")?"/en":"/zh-cn")+"/gpt/handoff?next="+encodeURIComponent(location.pathname.startsWith("/en")?"/en":"/zh-cn"))+'">'+esc(copy.open)+'</a><span id="ai-settings-feedback" class="ai-settings-feedback"></span></div></div>'+
              '<div class="ai-settings-panel"><small>'+esc(copy.usage)+'</small>'+
                '<div class="ai-usage-line"><span>'+esc(copy.today+" · "+copy.tokens)+'</span><strong>'+esc(limit(cfg.usage?.today_tokens,cfg.limits?.daily_tokens,"tokens"))+'</strong></div>'+
                '<div class="ai-usage-line"><span>'+esc(copy.month+" · "+copy.tokens)+'</span><strong>'+esc(limit(cfg.usage?.month_tokens,cfg.limits?.monthly_tokens,"tokens"))+'</strong></div>'+
                '<div class="ai-usage-line"><span>'+esc(copy.today+" · "+copy.cost)+'</span><strong>'+esc(limit(cfg.usage?.today_usd,cfg.limits?.daily_usd,"usd"))+'</strong></div>'+
                '<div class="ai-usage-line"><span>'+esc(copy.month+" · "+copy.cost)+'</span><strong>'+esc(limit(cfg.usage?.month_usd,cfg.limits?.monthly_usd,"usd"))+'</strong></div>'+
              '</div>';
            const select=document.getElementById("ai-default-model");
            const feedback=document.getElementById("ai-settings-feedback");
            select?.addEventListener("change",()=>{
              const [providerId,...rest]=select.value.split("|");
              const model=rest.join("|");
              savePreference(providerId,model);
              const chosenOption=available.find(item=>item.provider_id===providerId&&item.model===model);
              const heading=select.previousElementSibling;
              if(heading&&chosenOption)heading.textContent=chosenOption.model;
              if(feedback){feedback.textContent=copy.saved;window.setTimeout(()=>{feedback.textContent=""},1800)}
            });
          }catch(error){
            root.innerHTML='<div class="ai-settings-panel"><small>'+esc(copy.disabled)+'</small><strong>'+esc(copy.unavailable)+'</strong><p>'+esc(String(error?.message||copy.error))+'</p></div>';
          }
        }
        void load();
      })();
    </script>
  `;
}

export function settingsHubContent(zh) {
  const prefix = zh ? "/zh-cn" : "/en";
  const items = zh ? [
    { title:"通用", meta:"设置", description:"常用设置。", href:`${prefix}/settings/general`, icon:"general", featured:true, tone:"blue" },
    { title:"外观", meta:"可用", description:"浅色或深色。", href:`${prefix}/settings/appearance`, icon:"appearance" },
    { title:"语言", meta:"可用", description:"中文或 English。", href:`${prefix}/settings/language`, icon:"language" },
    { title:"账户与安全", meta:"可用", description:"设备、登录历史和安全提醒。", href:`${prefix}/settings/security`, icon:"shield" },
    { title:"通知", meta:"未开放", description:"提醒和站内消息。", href:`${prefix}/settings/notifications`, icon:"notifications" },
    { title:"AI", meta:"可用", description:"Provider、模型、额度和默认模型。", href:`${prefix}/settings/ai`, icon:"ai" },
    { title:"第三方集成", meta:"未开放", description:"外部服务和授权。", href:`${prefix}/settings/integrations`, icon:"integrations" },
    { title:"订阅与权益", meta:"测试中", description:"套餐、有效期和产品权益。", href:`${prefix}/settings/subscription`, icon:"account" },
    { title:"存储", meta:"可用", description:"AERTEX Drive 私人云盘。", href:`${prefix}/settings/storage`, icon:"storage" }
  ] : [
    { title:"General", meta:"Settings", description:"Common settings.", href:`${prefix}/settings/general`, icon:"general", featured:true, tone:"blue" },
    { title:"Appearance", meta:"Available", description:"Light or dark.", href:`${prefix}/settings/appearance`, icon:"appearance" },
    { title:"Language", meta:"Available", description:"Chinese or English.", href:`${prefix}/settings/language`, icon:"language" },
    { title:"Account & Security", meta:"Available", description:"Devices, sign-in history, and alerts.", href:`${prefix}/settings/security`, icon:"shield" },
    { title:"Notifications", meta:"Unavailable", description:"Alerts and in-app messages.", href:`${prefix}/settings/notifications`, icon:"notifications" },
    { title:"AI", meta:"Available", description:"Providers, models, quotas, and default model.", href:`${prefix}/settings/ai`, icon:"ai" },
    { title:"Integrations", meta:"Unavailable", description:"External services and authorization.", href:`${prefix}/settings/integrations`, icon:"integrations" },
    { title:"Subscription", meta:"Testing", description:"Plans, validity, and product entitlements.", href:`${prefix}/settings/subscription`, icon:"account" },
    { title:"Storage", meta:"Available", description:"Private files in AERTEX Drive.", href:`${prefix}/settings/storage`, icon:"storage" }
  ];
  return osHubGrid(items, "settings-hub-grid");
}

export function settingsFallbackContent(zh) {
  const prefix = zh ? "/zh-cn" : "/en";
  const items = zh
    ? [
        ["外观", "可用", "浅色或深色。", `${prefix}/settings/appearance`],
        ["语言", "可用", "中文或 English。", `${prefix}/settings/language`],
        ["账户与安全", "可用", "设备、登录历史和安全提醒。", `${prefix}/settings/security`],
        ["通知", "未开放", "提醒和站内消息。", `${prefix}/settings/notifications`],
        ["AI", "可用", "Provider、模型、额度和默认模型。", `${prefix}/settings/ai`],
        ["第三方集成", "未开放", "外部服务和授权。", `${prefix}/settings/integrations`],
        ["订阅与权益", "测试中", "套餐、有效期和产品权益。", `${prefix}/settings/subscription`],
        ["存储", "可用", "AERTEX Drive 私人云盘。", `${prefix}/settings/storage`]
      ]
    : [
        ["Appearance", "Available", "Light or dark.", `${prefix}/settings/appearance`],
        ["Language", "Available", "Chinese or English.", `${prefix}/settings/language`],
        ["Account & Security", "Available", "Devices, sign-in history, and alerts.", `${prefix}/settings/security`],
        ["Notifications", "Unavailable", "Alerts and in-app messages.", `${prefix}/settings/notifications`],
        ["AI", "Available", "Providers, models, quotas, and default model.", `${prefix}/settings/ai`],
        ["Integrations", "Unavailable", "External services and authorization.", `${prefix}/settings/integrations`],
        ["Subscription", "Testing", "Plans, validity, and product entitlements.", `${prefix}/settings/subscription`],
        ["Storage", "Available", "Private files in AERTEX Drive.", `${prefix}/settings/storage`]
      ];
  return `<section class="os-grid settings-grid">${items.map(item => `<a class="os-card settings-card-link" href="${item[3]}"><small>${item[1]}</small><h2>${item[0]}</h2><p>${item[2]}</p><span class="settings-card-arrow" aria-hidden="true">›</span></a>`).join("")}</section>`;
}
