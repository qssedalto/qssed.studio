export function profileContent(path, zh) {
  if (path.endsWith("/account")) return accountAuditContent(zh);

  if (path.endsWith("/preferences")) return `<section class="os-card is-large"><h2>${zh ? "偏好设置" : "Preferences"}</h2><p>${zh ? "主题和语言可通过页面右上角按钮切换。字体和通知偏好目前没有保存或配置接口。" : "Theme and language can be switched with the controls in the top-right corner. Font and notification preferences do not currently have configuration or persistence APIs."}</p></section>`;
  return `
    <section id="profile-summary" class="profile-home" data-profile-home>
      <div id="profile-cover" class="profile-cover" data-cover-style="aurora">
        <div class="profile-cover-noise" aria-hidden="true"></div>
        <div class="profile-cover-actions">
          <button id="profile-edit-button" class="profile-pill-button" type="button">${zh ? "编辑资料" : "Edit profile"}</button>
        </div>
      </div>

      <div class="profile-identity">
        <div id="profile-avatar" class="os-avatar profile-avatar-large">...</div>
        <div class="profile-identity-copy">
          <div class="profile-name-row">
            <h2 id="profile-display-name">${zh ? "正在读取账号资料..." : "Loading account profile..."}</h2>
            <span class="profile-name-lock" title="${zh ? "姓名不可修改" : "Name cannot be changed"}">🔒</span>
          </div>
          <p id="profile-email">...</p>
          <div id="profile-tags" class="os-chip-row"></div>
          <p id="profile-signature" class="profile-signature"></p>
        </div>
      </div>

      <div class="profile-home-grid">
        <article class="profile-section-card profile-about-card">
          <div class="profile-section-head">
            <div>
              <span class="profile-eyebrow">${zh ? "关于我" : "About"}</span>
              <h3>${zh ? "个人介绍" : "Profile"}</h3>
            </div>
          </div>
          <p id="profile-bio" class="profile-bio">${zh ? "还没有填写个人介绍。" : "No bio yet."}</p>
          <div class="profile-meta-row">
            <span id="profile-presence" class="profile-presence">✨ ${zh ? "在线" : "Online"}</span>
            <span id="profile-location" class="profile-location"></span>
          </div>
          <div id="profile-interests" class="profile-interest-list"></div>
        </article>

        <article class="profile-section-card">
          <div class="profile-section-head">
            <div>
              <span class="profile-eyebrow">${zh ? "快捷入口" : "Quick access"}</span>
              <h3>${zh ? "我的空间" : "My space"}</h3>
            </div>
          </div>
          <div class="profile-quick-grid">
            <a href="${zh ? "/zh-cn/profile/account" : "/en/profile/account"}"><span>◷</span><strong>${zh ? "账户信息" : "Account"}</strong><small>${zh ? "登录、设备与审计" : "Sign-in, devices & audit"}</small></a>
            <a href="${zh ? "/zh-cn/settings/storage" : "/en/settings/storage"}"><span>☁︎</span><strong>${zh ? "私人存储" : "Private storage"}</strong><small>${zh ? "管理 R2 文件" : "Manage R2 files"}</small></a>
            <a href="${zh ? "/zh-cn/info/links" : "/en/info/links"}"><span>⌘</span><strong>${zh ? "收藏链接" : "Saved links"}</strong><small>${zh ? "信息中心入口" : "Information center"}</small></a>
            <a href="${zh ? "/zh-cn/profile/preferences" : "/en/profile/preferences"}"><span>⚙︎</span><strong>${zh ? "偏好设置" : "Preferences"}</strong><small>${zh ? "外观与语言" : "Appearance & language"}</small></a>
          </div>
        </article>
      </div>

      <article class="profile-section-card profile-links-card">
        <div class="profile-section-head">
          <div>
            <span class="profile-eyebrow">${zh ? "联系与链接" : "Contact & links"}</span>
            <h3>${zh ? "我的链接库" : "My link library"}</h3>
            <p>${zh ? "把 QQ、GitHub、Bilibili、X、个人网站或其他入口集中在这里。" : "Keep QQ, GitHub, Bilibili, X, personal sites, and other destinations in one place."}</p>
          </div>
          <button id="profile-add-link" class="profile-pill-button profile-pill-secondary" type="button">＋ ${zh ? "添加链接" : "Add link"}</button>
        </div>
        <div id="profile-link-list" class="profile-link-list"></div>
      </article>
    </section>

    <div id="profile-sheet-backdrop" class="profile-sheet-backdrop" hidden></div>

    <aside id="profile-edit-sheet" class="profile-sheet" aria-hidden="true">
      <div class="profile-sheet-grabber" aria-hidden="true"></div>
      <div class="profile-sheet-head">
        <div><span class="profile-eyebrow">${zh ? "个人主页" : "Profile"}</span><h3>${zh ? "编辑资料" : "Edit profile"}</h3></div>
        <button class="profile-sheet-close" type="button" data-close-profile-sheet aria-label="${zh ? "关闭" : "Close"}">×</button>
      </div>
      <div class="profile-sheet-body">
        <label class="profile-field"><span>${zh ? "姓名" : "Name"}</span><input id="profile-readonly-name" type="text" readonly aria-readonly="true"><small>${zh ? "姓名由账号资料确定，不允许在个人主页中修改。" : "Your name comes from your account profile and cannot be changed here."}</small></label>
        <div class="profile-field">
          <span>${zh ? "头像" : "Profile photo"}</span>
          <div class="profile-media-editor">
            <div id="profile-avatar-preview" class="profile-media-preview profile-avatar-preview"></div>
            <div class="profile-media-copy"><strong>${zh ? "更换头像" : "Change profile photo"}</strong><small>${zh ? "支持 JPG、PNG、WebP，最大 5 MB。头像会保存到你的账号资料中。" : "JPG, PNG, or WebP up to 5 MB. Your photo is saved to your account profile."}</small><button id="profile-avatar-choose" class="profile-inline-button" type="button">${zh ? "选择图片" : "Choose image"}</button></div>
            <input id="profile-avatar-file" type="file" accept="image/jpeg,image/png,image/webp" hidden>
          </div>
        </div>
        <div class="profile-field">
          <span>${zh ? "自定义背景" : "Custom background"}</span>
          <div class="profile-media-editor">
            <div id="profile-background-preview" class="profile-media-preview profile-background-preview"></div>
            <div class="profile-media-copy"><strong>${zh ? "上传封面背景" : "Upload cover background"}</strong><small>${zh ? "支持 JPG、PNG、WebP，最大 8 MB。上传图片后会覆盖下面的主页配色；清除后会恢复配色。" : "JPG, PNG, or WebP up to 8 MB. An uploaded image overrides the color preset below; clearing it restores the preset."}</small><div class="profile-media-actions"><button id="profile-background-choose" class="profile-inline-button" type="button">${zh ? "选择图片" : "Choose image"}</button><button id="profile-background-clear" class="profile-inline-button secondary" type="button">${zh ? "清除背景" : "Clear background"}</button></div></div>
            <input id="profile-background-file" type="file" accept="image/jpeg,image/png,image/webp" hidden>
          </div>
        </div>
        <label class="profile-field"><span>${zh ? "个性签名" : "Signature"}</span><input id="profile-edit-signature" type="text" maxlength="80" placeholder="${zh ? "一句话介绍现在的你" : "A short line about you"}"><small>${zh ? "会显示在姓名与邮箱下方，建议控制在一句话内。" : "Shown under your name and email. Keep it to one concise line."}</small></label>
        <label class="profile-field"><span>${zh ? "个人介绍" : "Bio"}</span><textarea id="profile-edit-bio" maxlength="500" rows="5" placeholder="${zh ? "介绍你的兴趣、方向或正在做的事" : "Share your interests, focus, or what you are working on"}"></textarea><small>${zh ? "用于“关于我”区域，适合写长期兴趣、学习方向或正在进行的项目。" : "Used in the About section for longer-term interests, focus areas, or current projects."}</small></label>
        <label class="profile-field"><span>${zh ? "所在地" : "Location"}</span><input id="profile-edit-location" type="text" maxlength="80" placeholder="${zh ? "例如：苏州" : "For example: Suzhou"}"><small>${zh ? "仅填写你愿意公开展示的城市或地区，不建议填写具体住址。" : "Only add a city or region you are comfortable showing. Avoid a precise address."}</small></label>
        <div class="profile-field"><span>${zh ? "在线状态" : "Status"}</span><div class="profile-status-editor"><select id="profile-edit-status-kind"><option value="online">${zh ? "在线" : "Online"}</option><option value="focus">${zh ? "专注中" : "Focus"}</option><option value="busy">${zh ? "忙碌" : "Busy"}</option><option value="away">${zh ? "离开" : "Away"}</option><option value="offline">${zh ? "隐身" : "Offline"}</option></select><input id="profile-edit-status-emoji" type="text" maxlength="8" value="✨" aria-label="${zh ? "状态表情" : "Status emoji"}"><input id="profile-edit-status-text" type="text" maxlength="80" placeholder="${zh ? "自定义状态文字" : "Custom status text"}"></div></div>
        <label class="profile-field"><span>${zh ? "兴趣标签" : "Interests"}</span><input id="profile-edit-interests" type="text" placeholder="${zh ? "用逗号分隔，例如：统计学, AI, 骑行" : "Comma-separated, e.g. Statistics, AI, Cycling"}"><small>${zh ? "最多 12 个标签。" : "Up to 12 tags."}</small></label>
        <div class="profile-field"><span>${zh ? "主页配色" : "Profile cover"}</span><div id="profile-cover-picker" class="profile-cover-picker">${["aurora","sky","sunset","grape","graphite","mint"].map(value => `<button type="button" data-cover-choice="${value}" aria-label="${value}"><span data-cover-style="${value}"></span></button>`).join("")}</div></div>
      </div>
      <div class="profile-sheet-actions"><button id="profile-save-button" class="profile-save-button" type="button">${zh ? "保存" : "Save"}</button></div>
    </aside>

    <aside id="profile-link-sheet" class="profile-sheet profile-link-sheet" aria-hidden="true">
      <div class="profile-sheet-grabber" aria-hidden="true"></div>
      <div class="profile-sheet-head">
        <div><span class="profile-eyebrow">${zh ? "链接库" : "Link library"}</span><h3 id="profile-link-sheet-title">${zh ? "添加链接" : "Add link"}</h3></div>
        <button class="profile-sheet-close" type="button" data-close-profile-link-sheet aria-label="${zh ? "关闭" : "Close"}">×</button>
      </div>
      <div class="profile-sheet-body">
        <input id="profile-link-id" type="hidden">
        <div class="profile-link-presets"><button type="button" data-link-preset="QQ">QQ</button><button type="button" data-link-preset="GitHub">GitHub</button><button type="button" data-link-preset="Bilibili">Bilibili</button><button type="button" data-link-preset="X">X</button><button type="button" data-link-preset="${zh ? "个人网站" : "Website"}">${zh ? "个人网站" : "Website"}</button></div>
        <label class="profile-field"><span>${zh ? "名称" : "Title"}</span><input id="profile-link-title" type="text" maxlength="50" placeholder="QQ / GitHub / Website"></label>
        <label class="profile-field"><span>${zh ? "链接" : "URL"}</span><input id="profile-link-url" type="url" maxlength="1024" placeholder="https://"></label>
        <label class="profile-field"><span>${zh ? "分类" : "Category"}</span><select id="profile-link-category"><option value="social">${zh ? "社交" : "Social"}</option><option value="developer">${zh ? "开发者" : "Developer"}</option><option value="site">${zh ? "网站" : "Website"}</option><option value="contact">${zh ? "联系方式" : "Contact"}</option><option value="other">${zh ? "其他" : "Other"}</option></select></label>
        <label class="profile-field"><span>${zh ? "备注" : "Note"}</span><input id="profile-link-note" type="text" maxlength="140" placeholder="${zh ? "可选" : "Optional"}"></label>
        <label class="profile-pin-row"><input id="profile-link-pinned" type="checkbox"><span>${zh ? "置顶这个链接" : "Pin this link"}</span></label>
      </div>
      <div class="profile-sheet-actions"><button id="profile-link-save" class="profile-save-button" type="button">${zh ? "保存链接" : "Save link"}</button></div>
    </aside>
  `;
}
export function accountAuditContent(zh) {
  return `
    <section class="audit-grid">
      <article class="os-card is-large">
        <h2>${zh ? "账号基本信息" : "Account Information"}</h2>
        <dl class="audit-facts">
          <div><dt>${zh ? "注册时间" : "Registered at"}</dt><dd id="audit-created-at">...</dd></div>
          <div><dt>${zh ? "账号 ID" : "Account ID"}</dt><dd id="audit-user-id">...</dd></div>
          <div><dt>${zh ? "邮箱" : "Email"}</dt><dd id="audit-email">...</dd></div>
          <div><dt>${zh ? "最近登录" : "Last sign-in"}</dt><dd id="audit-last-sign-in">...</dd></div>
        </dl>
      </article>
      <article class="os-card">
        <h2>${zh ? "最近审计统计" : "Recent Audit Stats"}</h2>
        <div class="audit-stats">
          <span><strong id="audit-login-count">0</strong>${zh ? "最近登录记录" : "recent events"}</span>
          <span><strong id="audit-device-count">0</strong>${zh ? "最近设备" : "recent devices"}</span>
          <span><strong id="audit-risk-count">0</strong>${zh ? "最近风险" : "recent risks"}</span>
        </div>
      </article>
    </section>
    <section class="os-card audit-section">
      <h2>${zh ? "登录记录" : "Login Records"}</h2>
      <div id="audit-login-table" class="audit-table"></div>
    </section>
  `;
}

export function profileClientScript() {
  return `<script>
      /* PROFILE_HOME_V3 */
      const PROFILE_HOME_CACHE_PREFIX = "qssed-profile-home-v3:";
      let profileHomeState = { user: null, personalization: null, links: [], editingLinkId: null };

      function profileHomeIsZh() { return location.pathname.startsWith("/zh-cn/"); }
      function profileHomeEscape(value) { return auditEscape(value == null ? "" : String(value)); }
      function profileHomeCacheKey(userId) { return PROFILE_HOME_CACHE_PREFIX + String(userId || ""); }
      function profileHomeStatusLabel(kind) {
        const zh = profileHomeIsZh();
        const labels = zh ? { online:"在线", focus:"专注中", busy:"忙碌", away:"离开", offline:"隐身" } : { online:"Online", focus:"Focus", busy:"Busy", away:"Away", offline:"Offline" };
        return labels[kind] || labels.online;
      }
      function readProfileHomeCache(userId) {
        try { const raw = sessionStorage.getItem(profileHomeCacheKey(userId)); return raw ? JSON.parse(raw) : null; } catch { return null; }
      }
      function writeProfileHomeCache() {
        try { if (profileHomeState.user?.id) sessionStorage.setItem(profileHomeCacheKey(profileHomeState.user.id), JSON.stringify({ personalization: profileHomeState.personalization, links: profileHomeState.links })); } catch {}
      }
      function normalizeProfilePersonalization(row, userId) {
        return {
          user_id: userId,
          signature: row?.signature || "",
          bio: row?.bio || "",
          location: row?.location || "",
          status_kind: row?.status_kind || "online",
          status_text: row?.status_text || "",
          status_emoji: row?.status_emoji || "✨",
          interests: Array.isArray(row?.interests) ? row.interests.slice(0,12) : [],
          cover_style: row?.cover_style || "aurora",
          background_url: row?.background_url || ""
        };
      }
      function renderProfileHome() {
        if (!document.querySelector("[data-profile-home]")) return;
        const p = profileHomeState.personalization || normalizeProfilePersonalization(null, profileHomeState.user?.id);
        const cover = document.getElementById("profile-cover");
        if (cover) {
          cover.dataset.coverStyle = p.cover_style;
          cover.style.backgroundImage = p.background_url ? 'linear-gradient(rgba(0,0,0,.08),rgba(0,0,0,.08)),url("' + p.background_url.replace(/"/g,"%22") + '")' : "";
          cover.classList.toggle("has-custom-background", Boolean(p.background_url));
        }
        const signature = document.getElementById("profile-signature");
        if (signature) signature.textContent = p.signature || (profileHomeIsZh() ? "还没有设置个性签名。" : "No signature yet.");
        const bio = document.getElementById("profile-bio");
        if (bio) bio.textContent = p.bio || (profileHomeIsZh() ? "还没有填写个人介绍。" : "No bio yet.");
        const presence = document.getElementById("profile-presence");
        if (presence) presence.textContent = (p.status_emoji || "✨") + " " + (p.status_text || profileHomeStatusLabel(p.status_kind));
        const location = document.getElementById("profile-location");
        if (location) { location.textContent = p.location ? "⌖ " + p.location : ""; location.hidden = !p.location; }
        const interests = document.getElementById("profile-interests");
        if (interests) interests.innerHTML = p.interests.length ? p.interests.map(item => '<span>' + profileHomeEscape(item) + '</span>').join("") : '<span class="profile-interest-empty">' + (profileHomeIsZh() ? "添加兴趣标签，让主页更像你。" : "Add interests to make this profile yours.") + '</span>';
        renderProfileLinks();
      }
      function profileLinkIcon(title, category) {
        const t=String(title||"").toLowerCase();
        if(t.includes("qq")) return "Q";
        if(t.includes("github")) return "⌘";
        if(t.includes("bilibili")||t.includes("b站")) return "B";
        if(t==="x"||t.includes("twitter")) return "𝕏";
        if(category==="developer") return "</>";
        if(category==="contact") return "@";
        if(category==="site") return "⌂";
        return "↗";
      }
      function renderProfileLinks() {
        const list=document.getElementById("profile-link-list"); if(!list) return;
        const links=[...(profileHomeState.links||[])].sort((a,b)=>Number(b.pinned)-Number(a.pinned)||Number(a.sort_order||0)-Number(b.sort_order||0)||String(a.created_at||"").localeCompare(String(b.created_at||"")));
        if(!links.length){ list.innerHTML='<div class="profile-link-empty"><strong>'+(profileHomeIsZh()?"还没有链接":"No links yet")+'</strong><span>'+(profileHomeIsZh()?"添加 QQ、GitHub、个人网站或其他常用入口。":"Add QQ, GitHub, your website, or any other destination.")+'</span></div>'; return; }
        list.innerHTML=links.map(link => '<article class="profile-link-item">'+
          '<a class="profile-link-main" href="'+profileHomeEscape(link.url)+'" target="_blank" rel="noopener noreferrer"><span class="profile-link-icon">'+profileHomeEscape(profileLinkIcon(link.title,link.category))+'</span><span class="profile-link-copy"><strong>'+profileHomeEscape(link.title)+(link.pinned?' <em>★</em>':'')+'</strong><small>'+profileHomeEscape(link.note || link.url)+'</small></span><span class="profile-link-open">↗</span></a>'+
          '<div class="profile-link-actions"><button type="button" data-profile-link-edit="'+profileHomeEscape(link.id)+'">'+(profileHomeIsZh()?"编辑":"Edit")+'</button><button type="button" data-profile-link-delete="'+profileHomeEscape(link.id)+'">'+(profileHomeIsZh()?"删除":"Delete")+'</button></div>'+
        '</article>').join("");
        list.querySelectorAll("[data-profile-link-edit]").forEach(button=>button.addEventListener("click",()=>openProfileLinkSheet(button.dataset.profileLinkEdit)));
        list.querySelectorAll("[data-profile-link-delete]").forEach(button=>button.addEventListener("click",()=>deleteProfileLink(button.dataset.profileLinkDelete)));
      }
      function openProfileSheet() {
        const sheet=document.getElementById("profile-edit-sheet"), backdrop=document.getElementById("profile-sheet-backdrop"); if(!sheet||!backdrop) return;
        const p=profileHomeState.personalization || normalizeProfilePersonalization(null, profileHomeState.user?.id);
        document.getElementById("profile-readonly-name").value=document.getElementById("profile-display-name")?.textContent || "";
        const avatarPreview=document.getElementById("profile-avatar-preview"); if(avatarPreview) avatarPreview.innerHTML=document.getElementById("profile-avatar")?.innerHTML || "";
        const backgroundPreview=document.getElementById("profile-background-preview"); if(backgroundPreview){ backgroundPreview.dataset.coverStyle=p.cover_style; backgroundPreview.style.backgroundImage=p.background_url?'url("'+p.background_url.replace(/"/g,"%22")+'")':""; backgroundPreview.classList.toggle("has-custom-background",Boolean(p.background_url)); }
        document.getElementById("profile-edit-signature").value=p.signature;
        document.getElementById("profile-edit-bio").value=p.bio;
        document.getElementById("profile-edit-location").value=p.location;
        document.getElementById("profile-edit-status-kind").value=p.status_kind;
        document.getElementById("profile-edit-status-emoji").value=p.status_emoji;
        document.getElementById("profile-edit-status-text").value=p.status_text;
        document.getElementById("profile-edit-interests").value=p.interests.join(", ");
        document.querySelectorAll("[data-cover-choice]").forEach(button=>button.classList.toggle("is-selected",button.dataset.coverChoice===p.cover_style));
        document.documentElement.classList.add("profile-sheet-open"); backdrop.hidden=false; requestAnimationFrame(()=>{backdrop.classList.add("is-visible");sheet.classList.add("is-open");sheet.setAttribute("aria-hidden","false");});
      }
      function closeProfileSheets() {
        document.documentElement.classList.remove("profile-sheet-open"); const backdrop=document.getElementById("profile-sheet-backdrop"); document.querySelectorAll(".profile-sheet.is-open").forEach(sheet=>{sheet.classList.remove("is-open");sheet.setAttribute("aria-hidden","true")}); if(backdrop){backdrop.classList.remove("is-visible");setTimeout(()=>{if(!document.querySelector(".profile-sheet.is-open")) backdrop.hidden=true},220);}
      }
      async function saveProfilePersonalization() {
        if(!profileHomeState.user) return;
        const button=document.getElementById("profile-save-button"); button.disabled=true; button.textContent=profileHomeIsZh()?"正在保存…":"Saving…";
        const interests=document.getElementById("profile-edit-interests").value.split(/[,，]/).map(x=>x.trim()).filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).slice(0,12);
        const cover=document.querySelector("[data-cover-choice].is-selected")?.dataset.coverChoice || "aurora";
        const payload={ user_id:profileHomeState.user.id, signature:document.getElementById("profile-edit-signature").value.trim(), bio:document.getElementById("profile-edit-bio").value.trim(), location:document.getElementById("profile-edit-location").value.trim(), status_kind:document.getElementById("profile-edit-status-kind").value, status_emoji:document.getElementById("profile-edit-status-emoji").value.trim()||"✨", status_text:document.getElementById("profile-edit-status-text").value.trim(), interests, cover_style:cover, background_url:profileHomeState.personalization?.background_url || "" };
        const {data,error}=await supabaseClient.from("profile_personalization").upsert(payload,{onConflict:"user_id"}).select().single();
        button.disabled=false; button.textContent=profileHomeIsZh()?"保存":"Save";
        if(error){ console.error("Profile personalization save failed",error.message); alert(profileHomeIsZh()?"保存失败，请稍后重试。":"Could not save your profile. Please try again."); return; }
        profileHomeState.personalization=normalizeProfilePersonalization(data,profileHomeState.user.id); writeProfileHomeCache(); renderProfileHome(); closeProfileSheets();
      }
      function openProfileLinkSheet(id) {
        const sheet=document.getElementById("profile-link-sheet"), backdrop=document.getElementById("profile-sheet-backdrop"); if(!sheet||!backdrop) return;
        const link=(profileHomeState.links||[]).find(item=>item.id===id)||null; profileHomeState.editingLinkId=link?.id||null;
        document.getElementById("profile-link-sheet-title").textContent=link?(profileHomeIsZh()?"编辑链接":"Edit link"):(profileHomeIsZh()?"添加链接":"Add link");
        document.getElementById("profile-link-id").value=link?.id||"";
        document.getElementById("profile-link-title").value=link?.title||"";
        document.getElementById("profile-link-url").value=link?.url||"";
        document.getElementById("profile-link-category").value=link?.category||"social";
        document.getElementById("profile-link-note").value=link?.note||"";
        document.getElementById("profile-link-pinned").checked=Boolean(link?.pinned);
        document.documentElement.classList.add("profile-sheet-open"); backdrop.hidden=false; requestAnimationFrame(()=>{backdrop.classList.add("is-visible");sheet.classList.add("is-open");sheet.setAttribute("aria-hidden","false");document.getElementById("profile-link-title").focus();});
      }
      async function saveProfileLink() {
        if(!profileHomeState.user) return;
        const button=document.getElementById("profile-link-save"), title=document.getElementById("profile-link-title").value.trim(), url=document.getElementById("profile-link-url").value.trim();
        if(!title || !/^https?:\\/\\//i.test(url)){ alert(profileHomeIsZh()?"请填写名称，并输入以 http:// 或 https:// 开头的有效链接。":"Enter a title and a valid URL beginning with http:// or https://."); return; }
        button.disabled=true;
        const payload={ user_id:profileHomeState.user.id,title,url,category:document.getElementById("profile-link-category").value,note:document.getElementById("profile-link-note").value.trim(),pinned:document.getElementById("profile-link-pinned").checked,sort_order:profileHomeState.editingLinkId?((profileHomeState.links.find(x=>x.id===profileHomeState.editingLinkId)?.sort_order)||0):(profileHomeState.links.length*10)};
        let result;
        if(profileHomeState.editingLinkId) result=await supabaseClient.from("profile_links").update(payload).eq("id",profileHomeState.editingLinkId).select().single();
        else result=await supabaseClient.from("profile_links").insert(payload).select().single();
        button.disabled=false;
        if(result.error){console.error("Profile link save failed",result.error.message);alert(profileHomeIsZh()?"链接保存失败。":"Could not save the link.");return;}
        if(profileHomeState.editingLinkId) profileHomeState.links=profileHomeState.links.map(x=>x.id===profileHomeState.editingLinkId?result.data:x); else profileHomeState.links.push(result.data);
        writeProfileHomeCache(); renderProfileLinks(); closeProfileSheets();
      }
      async function deleteProfileLink(id) {
        const link=(profileHomeState.links||[]).find(item=>item.id===id); if(!link) return;
        if(!confirm((profileHomeIsZh()?"删除“":"Delete “")+link.title+"”"+(profileHomeIsZh()?"？":"?"))) return;
        const {error}=await supabaseClient.from("profile_links").delete().eq("id",id);
        if(error){alert(profileHomeIsZh()?"删除失败。":"Could not delete the link.");return;}
        profileHomeState.links=profileHomeState.links.filter(item=>item.id!==id); writeProfileHomeCache(); renderProfileLinks();
      }
      function profileMediaExtension(file) {
        const map={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
        return map[file?.type] || "";
      }
      async function uploadProfileMedia(file, kind) {
        if(!profileHomeState.user || !file) return null;
        const max=kind==="avatar"?5*1024*1024:8*1024*1024;
        const ext=profileMediaExtension(file);
        if(!ext || file.size>max){ alert(profileHomeIsZh()?(kind==="avatar"?"头像需为 JPG、PNG 或 WebP，且不超过 5 MB。":"背景需为 JPG、PNG 或 WebP，且不超过 8 MB。"):(kind==="avatar"?"Profile photo must be JPG, PNG, or WebP and no larger than 5 MB.":"Background must be JPG, PNG, or WebP and no larger than 8 MB.")); return null; }
        const bucket=kind==="avatar"?"avatars":"profile-media";
        const objectPath=profileHomeState.user.id+"/"+kind+"."+ext;
        const {error}=await supabaseClient.storage.from(bucket).upload(objectPath,file,{upsert:true,contentType:file.type,cacheControl:"3600"});
        if(error){console.error("Profile media upload failed",error.message);alert(profileHomeIsZh()?"图片上传失败，请稍后重试。":"Image upload failed. Please try again.");return null;}
        const {data}=supabaseClient.storage.from(bucket).getPublicUrl(objectPath);
        return data?.publicUrl ? data.publicUrl+"?v="+Date.now() : null;
      }
      async function changeProfileAvatar(file) {
        const url=await uploadProfileMedia(file,"avatar"); if(!url) return;
        const {error}=await supabaseClient.from("profiles").update({avatar_url:url,updated_at:new Date().toISOString()}).eq("id",profileHomeState.user.id);
        if(error){console.error("Avatar profile update failed",error.message);alert(profileHomeIsZh()?"头像已上传，但账号资料更新失败。":"The photo uploaded, but your profile could not be updated.");return;}
        const avatar=document.getElementById("profile-avatar"); if(avatar) avatar.innerHTML='<img src="'+profileHomeEscape(url)+'" alt="">';
        const preview=document.getElementById("profile-avatar-preview"); if(preview) preview.innerHTML='<img src="'+profileHomeEscape(url)+'" alt="">';
      }
      async function changeProfileBackground(file) {
        const url=await uploadProfileMedia(file,"background"); if(!url) return;
        profileHomeState.personalization=normalizeProfilePersonalization({...profileHomeState.personalization,background_url:url},profileHomeState.user.id);
        const {data,error}=await supabaseClient.from("profile_personalization").upsert(profileHomeState.personalization,{onConflict:"user_id"}).select().single();
        if(error){console.error("Background save failed",error.message);alert(profileHomeIsZh()?"背景保存失败。":"Could not save the background.");return;}
        profileHomeState.personalization=normalizeProfilePersonalization(data,profileHomeState.user.id);writeProfileHomeCache();renderProfileHome();openProfileSheet();
      }
      async function clearProfileBackground() {
        if(!profileHomeState.user) return;
        profileHomeState.personalization=normalizeProfilePersonalization({...profileHomeState.personalization,background_url:""},profileHomeState.user.id);
        const {data,error}=await supabaseClient.from("profile_personalization").upsert(profileHomeState.personalization,{onConflict:"user_id"}).select().single();
        if(error){alert(profileHomeIsZh()?"无法清除背景。":"Could not clear the background.");return;}
        profileHomeState.personalization=normalizeProfilePersonalization(data,profileHomeState.user.id);writeProfileHomeCache();renderProfileHome();openProfileSheet();
      }
      function bindCurrentPageNoReload() {
        document.querySelectorAll(".os-nav a[href]").forEach(link=>{
          const target=new URL(link.href,location.href);
          if(target.pathname!==location.pathname)return;
          link.setAttribute("aria-current","page");
          link.dataset.currentPage="true";
          link.addEventListener("click",event=>event.preventDefault());
        });
      }
      function bindProfileHome() {
        const modalBackdrop=document.getElementById("profile-sheet-backdrop"); if(modalBackdrop&&modalBackdrop.parentElement!==document.body)document.body.appendChild(modalBackdrop); document.querySelectorAll(".profile-sheet").forEach(sheet=>{if(sheet.parentElement!==document.body)document.body.appendChild(sheet);});
        if(!document.querySelector("[data-profile-home]")) return;
        document.getElementById("profile-edit-button")?.addEventListener("click",openProfileSheet);
        document.getElementById("profile-add-link")?.addEventListener("click",()=>openProfileLinkSheet(null));
        document.querySelectorAll("[data-close-profile-sheet],[data-close-profile-link-sheet]").forEach(button=>button.addEventListener("click",closeProfileSheets));
        document.getElementById("profile-sheet-backdrop")?.addEventListener("click",closeProfileSheets);
        document.getElementById("profile-save-button")?.addEventListener("click",saveProfilePersonalization);
        document.getElementById("profile-link-save")?.addEventListener("click",saveProfileLink);
        document.getElementById("profile-avatar-choose")?.addEventListener("click",()=>document.getElementById("profile-avatar-file")?.click());
        document.getElementById("profile-avatar-file")?.addEventListener("change",async event=>{const file=event.target.files?.[0];if(file)await changeProfileAvatar(file);event.target.value="";});
        document.getElementById("profile-background-choose")?.addEventListener("click",()=>document.getElementById("profile-background-file")?.click());
        document.getElementById("profile-background-file")?.addEventListener("change",async event=>{const file=event.target.files?.[0];if(file)await changeProfileBackground(file);event.target.value="";});
        document.getElementById("profile-background-clear")?.addEventListener("click",clearProfileBackground);
        bindCurrentPageNoReload();
        document.getElementById("profile-cover-picker")?.addEventListener("click",event=>{const button=event.target.closest("[data-cover-choice]");if(!button)return;document.querySelectorAll("[data-cover-choice]").forEach(x=>x.classList.toggle("is-selected",x===button));});
        document.querySelectorAll("[data-link-preset]").forEach(button=>button.addEventListener("click",()=>{document.getElementById("profile-link-title").value=button.dataset.linkPreset;}));
        window.addEventListener("keydown",event=>{if(event.key==="Escape")closeProfileSheets();});
      }
      async function hydrateProfileHome(user) {
        if(!document.querySelector("[data-profile-home]") || !user) return;
        profileHomeState.user=user;
        const cached=readProfileHomeCache(user.id);
        if(cached){profileHomeState.personalization=normalizeProfilePersonalization(cached.personalization,user.id);profileHomeState.links=Array.isArray(cached.links)?cached.links:[];renderProfileHome();}
        const [personalizationResult,linksResult]=await Promise.all([
          supabaseClient.from("profile_personalization").select("*").eq("user_id",user.id).maybeSingle(),
          supabaseClient.from("profile_links").select("*").eq("user_id",user.id).order("pinned",{ascending:false}).order("sort_order",{ascending:true}).order("created_at",{ascending:true})
        ]);
        if(personalizationResult.error) console.error("Profile personalization query failed",personalizationResult.error.message);
        if(linksResult.error) console.error("Profile links query failed",linksResult.error.message);
        if(!personalizationResult.error) profileHomeState.personalization=normalizeProfilePersonalization(personalizationResult.data,user.id);
        if(!linksResult.error) profileHomeState.links=linksResult.data||[];
        writeProfileHomeCache(); renderProfileHome();
      }

    </script>`;
}
