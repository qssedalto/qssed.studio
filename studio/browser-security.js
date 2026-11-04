export async function hardenBrowserResponse(response, pathname = "") {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;
  if (!isRelevantPath(pathname)) return response;

  const source = await response.text();
  const hardened = hardenBrowserMarkup(source);
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(hardened, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

// 页面脚本替换属于客户端纵深防护，必须保持后端鉴权与 RLS 才能真正保护数据；修改 marker 时需要验证生成 HTML。
export function hardenBrowserMarkup(markup) {
  let output = String(markup || "");
  output = hardenUsernameAvailability(output);
  output = hardenAuditDeviceWriter(output);
  output = hardenProfileSummaryQuery(output);
  output = hardenProfileAuditQueries(output);
  output = hardenProfileEditor(output);
  return output;
}

function hardenUsernameAvailability(markup) {
  const direct = '      const { data, error } = await supabaseClient.rpc("check_registration_username", { p_username: value });';
  if (!markup.includes(direct)) return markup;
  const replacement = `      const usernameCheckResponse = await fetch("/api/auth/username-check", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ username: value }),
        cache: "no-store"
      });
      const data = await usernameCheckResponse.json().catch(() => ({}));
      const error = usernameCheckResponse.ok ? null : new Error(data?.error || "Username check failed");`;
  return markup.replace(direct, replacement);
}

function hardenAuditDeviceWriter(markup) {
  const start = "      async function updateCurrentDevice(user) {";
  const end = "      function getLastSignIn(user) {";
  if (!markup.includes(start) || !markup.includes(end)) return markup;
  const replacement = `      async function updateCurrentDevice(user) {
        if (!user) return null;
        const device_id = getAuditDeviceId();
        try {
          const response = await fetch("/api/account/device", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ device_id }),
            cache: "no-store"
          });
          const payload = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(payload?.error || "Device update failed");
          return payload?.device || null;
        } catch (error) {
          console.error("Device persistence failed", error);
          return null;
        }
      }

`;
  return replaceRange(markup, start, end, replacement, false);
}

function hardenProfileSummaryQuery(markup) {
  const start = "        const { data: profile, error: profileError } = await supabaseClient";
  const end = "          .maybeSingle();";
  if (!markup.includes(start)) return markup;
  const replacement = `        let profile = null;
        let profileError = null;
        const profileController = typeof AbortController === "function" ? new AbortController() : null;
        const profileTimeout = window.setTimeout(() => { try { profileController?.abort(); } catch {} }, 7000);
        try {
          const profileResponse = await fetch("/api/account/summary", {
            credentials: "same-origin",
            headers: { Accept: "application/json" },
            cache: "no-store",
            ...(profileController ? { signal: profileController.signal } : {})
          });
          const profilePayload = await profileResponse.json().catch(() => ({}));
          profile = profilePayload?.profile || null;
          profileError = profileResponse.ok ? null : new Error(profilePayload?.error || "Profile query failed");
        } catch (error) {
          profileError = error;
        } finally {
          window.clearTimeout(profileTimeout);
        }`;
  return replaceRange(markup, start, end, replacement, true);
}

function hardenProfileAuditQueries(markup) {
  const start = "        const [eventsResult, devicesResult] = await Promise.all([";
  const end = "        ]);";
  if (!markup.includes(start)) return markup;
  const replacement = `        const auditResponse = await fetch("/api/account/audit", {
          credentials: "same-origin",
          headers: { Accept: "application/json" },
          cache: "no-store"
        });
        const auditPayload = await auditResponse.json().catch(() => ({}));
        const auditError = auditResponse.ok ? null : new Error(auditPayload?.error || "Account audit failed");
        const eventsResult = {
          error: auditPayload?.events_error || auditError ? (auditError || new Error("Login event query failed")) : null,
          data: Array.isArray(auditPayload?.events) ? auditPayload.events : []
        };
        const devicesResult = {
          error: auditPayload?.devices_error || auditError ? (auditError || new Error("Device query failed")) : null,
          data: Array.isArray(auditPayload?.devices) ? auditPayload.devices : []
        };`;
  return replaceRange(markup, start, end, replacement, true);
}

function hardenProfileEditor(markup) {
  let output = markup;
  output = replaceProfileSavePersonalization(output);
  output = replaceProfileSaveLink(output);
  output = replaceProfileDeleteLink(output);
  output = replaceProfileMediaUpload(output);
  output = replaceProfileAvatarChange(output);
  output = replaceProfileBackgroundChange(output);
  output = replaceProfileBackgroundClear(output);
  output = replaceProfileHydration(output);
  return output;
}

function replaceProfileSavePersonalization(markup) {
  const start = "      async function saveProfilePersonalization() {";
  const end = "      function openProfileLinkSheet(id) {";
  if (!markup.includes(start) || !markup.includes(end)) return markup;
  const replacement = `      async function profileApiJson(path, options = {}) {
        const response = await fetch(path, {
          credentials: "same-origin",
          headers: { Accept: "application/json", ...(options.body ? { "Content-Type": "application/json" } : {}) },
          cache: "no-store",
          ...options
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload?.error || "Profile request failed");
        return payload;
      }
      async function saveProfilePersonalization() {
        if(!profileHomeState.user) return;
        const button=document.getElementById("profile-save-button"); button.disabled=true; button.textContent=profileHomeIsZh()?"正在保存…":"Saving…";
        const interests=document.getElementById("profile-edit-interests").value.split(/[,，]/).map(x=>x.trim()).filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).slice(0,12);
        const cover=document.querySelector("[data-cover-choice].is-selected")?.dataset.coverChoice || "aurora";
        const payload={ signature:document.getElementById("profile-edit-signature").value.trim(), bio:document.getElementById("profile-edit-bio").value.trim(), location:document.getElementById("profile-edit-location").value.trim(), status_kind:document.getElementById("profile-edit-status-kind").value, status_emoji:document.getElementById("profile-edit-status-emoji").value.trim()||"✨", status_text:document.getElementById("profile-edit-status-text").value.trim(), interests, cover_style:cover, background_url:profileHomeState.personalization?.background_url || "" };
        try {
          const result=await profileApiJson("/api/profile/personalization",{method:"PUT",body:JSON.stringify(payload)});
          profileHomeState.personalization=normalizeProfilePersonalization(result.personalization,profileHomeState.user.id); writeProfileHomeCache(); renderProfileHome(); closeProfileSheets();
        } catch(error) {
          console.error("Profile personalization save failed",error); alert(profileHomeIsZh()?"保存失败，请稍后重试。":"Could not save your profile. Please try again.");
        } finally {
          button.disabled=false; button.textContent=profileHomeIsZh()?"保存":"Save";
        }
      }
`;
  return replaceRange(markup, start, end, replacement, false);
}

function replaceProfileSaveLink(markup) {
  const start = "      async function saveProfileLink() {";
  const end = "      async function deleteProfileLink(id) {";
  if (!markup.includes(start) || !markup.includes(end)) return markup;
  const replacement = `      async function saveProfileLink() {
        if(!profileHomeState.user) return;
        const button=document.getElementById("profile-link-save"), title=document.getElementById("profile-link-title").value.trim(), url=document.getElementById("profile-link-url").value.trim();
        if(!title || !/^https?:\\/\\//i.test(url)){ alert(profileHomeIsZh()?"请填写名称，并输入以 http:// 或 https:// 开头的有效链接。":"Enter a title and a valid URL beginning with http:// or https://."); return; }
        button.disabled=true;
        const payload={ title,url,category:document.getElementById("profile-link-category").value,note:document.getElementById("profile-link-note").value.trim(),pinned:document.getElementById("profile-link-pinned").checked,sort_order:profileHomeState.editingLinkId?((profileHomeState.links.find(x=>x.id===profileHomeState.editingLinkId)?.sort_order)||0):(profileHomeState.links.length*10)};
        if(profileHomeState.editingLinkId) payload.id=profileHomeState.editingLinkId;
        try {
          const result=await profileApiJson("/api/profile/link",{method:profileHomeState.editingLinkId?"PUT":"POST",body:JSON.stringify(payload)});
          const saved=result.link;
          if(profileHomeState.editingLinkId) profileHomeState.links=profileHomeState.links.map(x=>x.id===profileHomeState.editingLinkId?saved:x); else profileHomeState.links.push(saved);
          writeProfileHomeCache(); renderProfileLinks(); closeProfileSheets();
        } catch(error) {
          console.error("Profile link save failed",error); alert(profileHomeIsZh()?"链接保存失败。":"Could not save the link.");
        } finally {
          button.disabled=false;
        }
      }
`;
  return replaceRange(markup, start, end, replacement, false);
}

function replaceProfileDeleteLink(markup) {
  const start = "      async function deleteProfileLink(id) {";
  const end = "      function profileMediaExtension(file) {";
  if (!markup.includes(start) || !markup.includes(end)) return markup;
  const replacement = `      async function deleteProfileLink(id) {
        const link=(profileHomeState.links||[]).find(item=>item.id===id); if(!link) return;
        if(!confirm((profileHomeIsZh()?"删除“":"Delete “")+link.title+"”"+(profileHomeIsZh()?"？":"?"))) return;
        try {
          await profileApiJson("/api/profile/link",{method:"DELETE",body:JSON.stringify({id})});
          profileHomeState.links=profileHomeState.links.filter(item=>item.id!==id); writeProfileHomeCache(); renderProfileLinks();
        } catch(error) {
          console.error("Profile link delete failed",error); alert(profileHomeIsZh()?"删除失败。":"Could not delete the link.");
        }
      }
`;
  return replaceRange(markup, start, end, replacement, false);
}

function replaceProfileMediaUpload(markup) {
  const start = "      async function uploadProfileMedia(file, kind) {";
  const end = "      async function changeProfileAvatar(file) {";
  if (!markup.includes(start) || !markup.includes(end)) return markup;
  const replacement = `      async function uploadProfileMedia(file, kind) {
        if(!profileHomeState.user || !file) return null;
        const max=kind==="avatar"?5*1024*1024:8*1024*1024;
        const ext=profileMediaExtension(file);
        if(!ext || file.size>max){ alert(profileHomeIsZh()?(kind==="avatar"?"头像需为 JPG、PNG 或 WebP，且不超过 5 MB。":"背景需为 JPG、PNG 或 WebP，且不超过 8 MB。"):(kind==="avatar"?"Profile photo must be JPG, PNG, or WebP and no larger than 5 MB.":"Background must be JPG, PNG, or WebP and no larger than 8 MB.")); return null; }
        const form=new FormData(); form.set("kind",kind); form.set("file",file);
        try {
          const response=await fetch("/api/profile/media",{method:"POST",credentials:"same-origin",body:form,cache:"no-store",headers:{Accept:"application/json"}});
          const payload=await response.json().catch(()=>({}));
          if(!response.ok) throw new Error(payload?.error||"Image upload failed");
          return payload?.url || null;
        } catch(error) {
          console.error("Profile media upload failed",error); alert(profileHomeIsZh()?"图片上传失败，请稍后重试。":"Image upload failed. Please try again."); return null;
        }
      }
`;
  return replaceRange(markup, start, end, replacement, false);
}

function replaceProfileAvatarChange(markup) {
  const start = "      async function changeProfileAvatar(file) {";
  const end = "      async function changeProfileBackground(file) {";
  if (!markup.includes(start) || !markup.includes(end)) return markup;
  const replacement = `      async function changeProfileAvatar(file) {
        const url=await uploadProfileMedia(file,"avatar"); if(!url) return;
        const avatar=document.getElementById("profile-avatar"); if(avatar) avatar.innerHTML='<img src="'+profileHomeEscape(url)+'" alt="">';
        const preview=document.getElementById("profile-avatar-preview"); if(preview) preview.innerHTML='<img src="'+profileHomeEscape(url)+'" alt="">';
      }
`;
  return replaceRange(markup, start, end, replacement, false);
}

function replaceProfileBackgroundChange(markup) {
  const start = "      async function changeProfileBackground(file) {";
  const end = "      async function clearProfileBackground() {";
  if (!markup.includes(start) || !markup.includes(end)) return markup;
  const replacement = `      async function changeProfileBackground(file) {
        const url=await uploadProfileMedia(file,"background"); if(!url) return;
        const next=normalizeProfilePersonalization({...profileHomeState.personalization,background_url:url},profileHomeState.user.id);
        try {
          const result=await profileApiJson("/api/profile/personalization",{method:"PUT",body:JSON.stringify(next)});
          profileHomeState.personalization=normalizeProfilePersonalization(result.personalization,profileHomeState.user.id);writeProfileHomeCache();renderProfileHome();openProfileSheet();
        } catch(error) {
          console.error("Background save failed",error);alert(profileHomeIsZh()?"背景保存失败。":"Could not save the background.");
        }
      }
`;
  return replaceRange(markup, start, end, replacement, false);
}

function replaceProfileBackgroundClear(markup) {
  const start = "      async function clearProfileBackground() {";
  const end = "      function bindCurrentPageNoReload() {";
  if (!markup.includes(start) || !markup.includes(end)) return markup;
  const replacement = `      async function clearProfileBackground() {
        if(!profileHomeState.user) return;
        const next=normalizeProfilePersonalization({...profileHomeState.personalization,background_url:""},profileHomeState.user.id);
        try {
          const result=await profileApiJson("/api/profile/personalization",{method:"PUT",body:JSON.stringify(next)});
          profileHomeState.personalization=normalizeProfilePersonalization(result.personalization,profileHomeState.user.id);writeProfileHomeCache();renderProfileHome();openProfileSheet();
        } catch(error) {
          console.error("Background clear failed",error);alert(profileHomeIsZh()?"无法清除背景。":"Could not clear the background.");
        }
      }
`;
  return replaceRange(markup, start, end, replacement, false);
}

function replaceProfileHydration(markup) {
  const start = "      async function hydrateProfileHome(user) {";
  const end = "\n\n    </script>";
  if (!markup.includes(start) || !markup.includes(end)) return markup;
  const replacement = `      async function hydrateProfileHome(user) {
        if(!document.querySelector("[data-profile-home]") || !user) return;
        profileHomeState.user=user;
        const cached=readProfileHomeCache(user.id);
        if(cached){profileHomeState.personalization=normalizeProfilePersonalization(cached.personalization,user.id);profileHomeState.links=Array.isArray(cached.links)?cached.links:[];renderProfileHome();}
        try {
          const result=await profileApiJson("/api/profile/home");
          profileHomeState.personalization=normalizeProfilePersonalization(result.personalization,user.id);
          profileHomeState.links=Array.isArray(result.links)?result.links:[];
          writeProfileHomeCache(); renderProfileHome();
        } catch(error) {
          console.error("Profile home query failed",error);
        }
      }`;
  return replaceRange(markup, start, end, replacement, false);
}

// 按精确起止标记替换页面片段；如果标记消失就保留原文，因此生成页面结构变化时回归测试必须及时发现。
function replaceRange(source, startMarker, endMarker, replacement, consumeEnd) {
  const start = source.indexOf(startMarker);
  if (start < 0) return source;
  const endStart = source.indexOf(endMarker, start + startMarker.length);
  if (endStart < 0) return source;
  const end = consumeEnd ? endStart + endMarker.length : endStart;
  return source.slice(0, start) + replacement + source.slice(end);
}

function isRelevantPath(pathname) {
  return /\/(?:zh-cn|en)\/(?:sign-up|profile(?:\/|$))/.test(String(pathname || ""));
}
