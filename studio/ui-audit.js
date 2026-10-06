// 初学者导读：安全审计页面的前端交互脚本；负责把服务端已授权的审计数据渲染成可读列表，不在浏览器重新判定权限。
export function auditClientScript(ipInfo) {
  return `
    <script>
      const auditRequestContext = ${JSON.stringify({
        ip_address: ipInfo?.ip || "",
        country: ipInfo?.country || "",
        region: ipInfo?.region || "",
        city: ipInfo?.city || ""
      })};

      function formatAuditDate(value) {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const hh = String(date.getHours()).padStart(2, "0");
        const min = String(date.getMinutes()).padStart(2, "0");
        return yyyy + "-" + mm + "-" + dd + " " + hh + ":" + min;
      }

      function auditEscape(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
      }

      function getAuditDeviceId() {
        const key = "qssed-device-id";
        let id = localStorage.getItem(key);
        if (!id) {
          id = crypto.randomUUID ? crypto.randomUUID() : "device-" + Date.now() + "-" + Math.random().toString(16).slice(2);
          localStorage.setItem(key, id);
        }
        return id;
      }

      function parseAuditUserAgent() {
        const ua = navigator.userAgent || "";
        const browser = ua.includes("Edg/") ? "Edge" : ua.includes("Chrome/") ? "Chrome" : ua.includes("Firefox/") ? "Firefox" : ua.includes("Safari/") ? "Safari" : "Unknown";
        const os = ua.includes("Windows") ? "Windows" : ua.includes("Mac OS") ? "macOS" : ua.includes("Android") ? "Android" : ua.includes("iPhone") || ua.includes("iPad") ? "iOS" : ua.includes("Linux") ? "Linux" : "Unknown";
        const device_type = /Mobile|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop";
        return { user_agent: ua, browser, os, device_type, device_name: browser + " on " + os };
      }

      async function updateCurrentDevice(user) {
        if (!user) return null;
        const device = parseAuditUserAgent();
        const device_id = getAuditDeviceId();
        const payload = {
          user_id: user.id,
          device_id,
          device_name: device.device_name,
          browser: device.browser,
          os: device.os,
          device_type: device.device_type,
          last_ip: auditRequestContext.ip_address,
          country: auditRequestContext.country,
          region: auditRequestContext.region,
          city: auditRequestContext.city,
          last_seen_at: new Date().toISOString()
        };

        const { data: existing } = await supabaseClient
          .from("user_devices")
          .select("id, first_seen_at")
          .eq("device_id", device_id)
          .eq("user_id", user.id)
          .maybeSingle();

        const { error } = existing
          ? await supabaseClient.from("user_devices").update(payload).eq("id", existing.id)
          : await supabaseClient.from("user_devices").insert(payload);

        if (error) {
          console.error("Device persistence failed", error.message);
          return null;
        }
        return { ...payload, first_seen_at: existing?.first_seen_at || new Date().toISOString() };
      }

      function getLastSignIn(user) {
        const identityTime = (user.identities || [])
          .map(identity => identity.last_sign_in_at)
          .filter(Boolean)
          .sort()
          .at(-1);
        return user.last_sign_in_at || identityTime || null;
      }

      const PROFILE_SUMMARY_CACHE_KEY = "qssed-profile-summary-v2";
      const PROFILE_AUDIT_CACHE_KEY = "qssed-profile-audit-v2";

      function readProfileCache(key) {
        try {
          const raw = sessionStorage.getItem(key);
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      }

      function writeProfileCache(key, value) {
        try {
          sessionStorage.setItem(key, JSON.stringify(value));
        } catch {}
      }

      function clearProfileUiCaches() {
        try {
          sessionStorage.removeItem(PROFILE_SUMMARY_CACHE_KEY);
          sessionStorage.removeItem(PROFILE_AUDIT_CACHE_KEY);
        } catch {}
      }

      function restoreProfileCoverCache() {
        const cover = document.getElementById("profile-cover");
        if (!cover) return;
        try {
          const summary = readProfileCache(PROFILE_SUMMARY_CACHE_KEY);
          const userId = summary?.user_id;
          if (!userId) return;
          const raw = sessionStorage.getItem("qssed-profile-home-v3:" + String(userId));
          if (!raw) return;
          const cached = JSON.parse(raw);
          const personalization = cached?.personalization;
          if (!personalization) return;
          cover.dataset.coverStyle = personalization.cover_style || "aurora";
          if (personalization.background_url) {
            const safeUrl = String(personalization.background_url).replace(/"/g, "%22");
            cover.style.backgroundColor = "var(--surface-soft)";
            cover.style.backgroundImage = 'linear-gradient(rgba(0,0,0,.08),rgba(0,0,0,.08)),url("' + safeUrl + '")';
            cover.classList.add("has-custom-background");
          }
        } catch {}
      }

      function renderProfileSummarySnapshot(snapshot) {
        if (!snapshot) return;
        const root = document.getElementById("profile-summary");
        if (!root) return;
        const avatar = document.getElementById("profile-avatar");
        const name = document.getElementById("profile-display-name");
        const email = document.getElementById("profile-email");
        const tags = document.getElementById("profile-tags");
        const set = (id, value) => {
          const element = document.getElementById(id);
          if (element) element.textContent = value == null || value === "" ? "—" : String(value);
        };
        const isZh = location.pathname.startsWith("/zh-cn");
        const firstName = String(snapshot.first_name || "").trim();
        const lastName = String(snapshot.last_name || "").trim();
        const realName = String(snapshot.realName || snapshot.displayName || "").trim() ||
          ([firstName, lastName].filter(Boolean).join(isZh ? "" : " ")) ||
          snapshot.username || snapshot.email || "User";

        if (avatar) {
          const fallback = Array.from(realName || "A")[0] || "A";
          avatar.innerHTML = snapshot.avatar_url ? '<img src="' + auditEscape(snapshot.avatar_url) + '" alt="">' : auditEscape(fallback);
        }
        if (name) name.innerText = realName;
        if (email) email.innerText = snapshot.email || "—";
        if (tags) {
          const values = [snapshot.role, snapshot.status].filter(Boolean);
          tags.innerHTML = values.map(value => "<span>" + auditEscape(value) + "</span>").join("");
        }

        set("profile-real-name-value", realName);
        set("profile-username-value", snapshot.username ? "@" + String(snapshot.username).replace(/^@+/, "") : "—");
        set("profile-email-value", snapshot.email || "—");
        if (snapshot.birth_date) {
          const parts = String(snapshot.birth_date).slice(0,10).split("-");
          const birthday = parts.length === 3
            ? (isZh ? Number(parts[0]) + "年" + Number(parts[1]) + "月" + Number(parts[2]) + "日" : parts.join("-"))
            : snapshot.birth_date;
          set("profile-birth-date-value", birthday);
        } else {
          set("profile-birth-date-value", "—");
        }
        const gender = snapshot.gender === "male"
          ? (isZh ? "男" : "Male")
          : snapshot.gender === "female"
            ? (isZh ? "女" : "Female")
            : "—";
        set("profile-gender-value", gender);
        set("profile-gender-privacy-value", snapshot.hide_gender_on_profile ? (isZh ? "隐藏" : "Hidden") : (isZh ? "显示" : "Visible"));
      }

      function buildAuditFingerprint(user, events, devices) {
        const eventKeys = events.map(event => [
          event.id || "",
          event.created_at || "",
          Boolean(event.success),
          event.risk_level || ""
        ]).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
        const deviceKeys = devices.map(device => [
          device.id || "",
          device.device_id || "",
          device.revoked_at || "",
          device.browser || "",
          device.os || "",
          device.device_type || ""
        ]).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
        return JSON.stringify({
          user: [user?.id || "", user?.email || "", user?.created_at || "", getLastSignIn(user) || ""],
          events: eventKeys,
          devices: deviceKeys
        });
      }

      function restoreProfileUiCaches() {
        const summary = readProfileCache(PROFILE_SUMMARY_CACHE_KEY);
        if (summary) renderProfileSummarySnapshot(summary);

        const audit = readProfileCache(PROFILE_AUDIT_CACHE_KEY);
        if (!audit || !audit.user) return;
        if (document.getElementById("audit-created-at")) {
          renderAccountAudit(audit.user, audit.events || [], audit.devices || [], false, false);
        }
        if (document.getElementById("audit-current-device")) {
          renderSecurityAudit(audit.events || [], audit.devices || [], false, false);
        }
      }

      async function hydrateProfileSummary(user) {
        const root = document.getElementById("profile-summary");
        if (!root || !user) return;

        const { data: profile, error: profileError } = await supabaseClient
          .from("profiles")
          .select("username, display_name, avatar_url, role, status, first_name, last_name, birth_date, gender, hide_gender_on_profile, created_at")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile query failed", profileError.message);
          if (readProfileCache(PROFILE_SUMMARY_CACHE_KEY)) return;
        }

        const displayName =
          profile?.display_name ||
          profile?.username ||
          user.user_metadata?.display_name ||
          user.user_metadata?.username ||
          user.email ||
          "User";

        const snapshot = {
          user_id: user.id,
          displayName,
          realName: profile?.display_name || "",
          username: profile?.username || user.user_metadata?.username || "",
          email: user.email || "",
          role: profile?.role || "",
          status: profile?.status || "",
          avatar_url: profile?.avatar_url || "",
          first_name: profile?.first_name || user.user_metadata?.first_name || "",
          last_name: profile?.last_name || user.user_metadata?.last_name || "",
          birth_date: profile?.birth_date || user.user_metadata?.birth_date || "",
          gender: profile?.gender || user.user_metadata?.gender || "",
          hide_gender_on_profile: Boolean(profile?.hide_gender_on_profile ?? user.user_metadata?.hide_gender_on_profile)
        };
        renderProfileSummarySnapshot(snapshot);
        writeProfileCache(PROFILE_SUMMARY_CACHE_KEY, snapshot);
      }

      async function hydrateProfileAudit(user) {
        if (!document.getElementById("audit-created-at") && !document.getElementById("audit-current-device")) return;

        const cached = readProfileCache(PROFILE_AUDIT_CACHE_KEY);
        const [eventsResult, devicesResult] = await Promise.all([
          supabaseClient.from("login_events").select("*").order("created_at", { ascending: false }).limit(50),
          supabaseClient.from("user_devices").select("*").order("last_seen_at", { ascending: false }).limit(20)
        ]);
        const eventsError = Boolean(eventsResult.error);
        const devicesError = Boolean(devicesResult.error);
        const events = eventsError ? [] : eventsResult.data || [];
        const devices = devicesError ? [] : devicesResult.data || [];

        if (eventsError) console.error("Login event query failed", eventsResult.error.message);
        if (devicesError) console.error("Device query failed", devicesResult.error.message);

        if (eventsError || devicesError) {
          if (!cached) {
            renderAccountAudit(user, events, devices, eventsError, devicesError);
            renderSecurityAudit(events, devices, eventsError, devicesError);
          }
          return;
        }

        const cachedUser = {
          id: user.id,
          email: user.email || "",
          created_at: user.created_at || null,
          last_sign_in_at: getLastSignIn(user)
        };
        const fingerprint = buildAuditFingerprint(cachedUser, events, devices);
        if (cached?.user?.id === user.id && cached.fingerprint === fingerprint) return;

        const snapshot = {
          user: cachedUser,
          events,
          devices,
          fingerprint
        };
        writeProfileCache(PROFILE_AUDIT_CACHE_KEY, snapshot);
        renderAccountAudit(cachedUser, events, devices, false, false);
        renderSecurityAudit(events, devices, false, false);
      }

      restoreProfileCoverCache();
      restoreProfileUiCaches();
      window.setTimeout(() => {
        try {
          if (typeof bindProfileHome === "function") bindProfileHome();
        } catch (error) {
          console.error("Profile interaction binding failed", error);
        }
      }, 0);

      function renderAccountAudit(user, events, devices, eventsError, devicesError) {
        const set = (id, value) => { const el = document.getElementById(id); if (el) el.innerText = value || "-"; };
        set("audit-created-at", formatAuditDate(user.created_at));
        set("audit-user-id", user.id);
        set("audit-email", user.email);
        set("audit-last-sign-in", formatAuditDate(getLastSignIn(user)));
        set("audit-login-count", eventsError ? "—" : String(events.length));
        set("audit-device-count", devicesError ? "—" : String(devices.length));
        set("audit-risk-count", eventsError ? "—" : String(events.filter(event => event.risk_level && event.risk_level !== "正常").length));

        const table = document.getElementById("audit-login-table");
        if (table) {
          table.innerHTML = eventsError
            ? '<div class="audit-row"><span>无法读取登录记录 / Unable to load login records</span></div>'
            : renderAuditRows(events);
        }
      }

      function renderAuditRows(events) {
        const head = ["登录时间", "IP 地址", "地区", "浏览器", "操作系统", "设备类型", "登录方式", "登录结果", "风险提示"];
        const header = '<div class="audit-row audit-head">' + head.map(item => '<strong>' + item + '</strong>').join("") + '</div>';
        if (!events.length) return header + '<div class="audit-row"><span>暂无登录记录</span></div>';
        return header + events.map(event => '<div class="audit-row">' + [
          formatAuditDate(event.created_at),
          event.ip_address || "-",
          [event.country, event.region, event.city].filter(Boolean).join(" / ") || "-",
          event.browser || "-",
          event.os || "-",
          event.device_type || "-",
          event.provider || "password",
          event.success ? "成功" : "失败",
          event.risk_level || "正常"
        ].map(item => '<span>' + auditEscape(item) + '</span>').join("") + '</div>').join("");
      }

      function renderSecurityAudit(events, devices, eventsError, devicesError) {
        const currentId = getAuditDeviceId();
        const current = devices.find(device => device.device_id === currentId) || null;
        const currentBox = document.getElementById("audit-current-device");
        if (currentBox) currentBox.innerHTML = devicesError
          ? "无法读取设备数据 / Unable to load device data"
          : current ? renderDeviceCard(current, true) : "暂无当前设备数据";

        const list = document.getElementById("audit-device-list");
        if (list) list.innerHTML = devicesError
          ? "无法读取设备数据 / Unable to load device data"
          : devices.length ? devices.map(device => renderDeviceCard(device, device.device_id === currentId)).join("") : "暂无登录设备";

        const timeline = document.getElementById("audit-login-timeline");
        if (timeline) timeline.innerHTML = eventsError
          ? "无法读取登录历史 / Unable to load login history"
          : renderTimeline(events);

        const alerts = document.getElementById("audit-risk-alerts");
        if (alerts) {
          if (eventsError) {
            alerts.innerHTML = "<p>无法读取风险数据 / Unable to load risk data</p>";
          } else {
            const risks = events.filter(event => event.risk_level && event.risk_level !== "正常");
            alerts.innerHTML = risks.length ? risks.map(event => '<p>' + auditEscape(formatAuditDate(event.created_at)) + " · " + auditEscape(event.risk_level) + " · " + auditEscape(event.ip_address || "-") + '</p>').join("") : "<p>暂无异常登录提示</p>";
          }
        }
      }

      function renderDeviceCard(device, current) {
        const status = device.revoked_at ? "已退出" : "活跃";
        const name = device.device_name || ((device.browser || "Browser") + " on " + (device.os || "OS"));
        return '<article class="audit-device-card">' +
          '<strong>' + auditEscape(name + (current ? " · 当前设备" : "")) + '</strong>' +
          '<span>' + auditEscape([device.browser, device.os, device.device_type].filter(Boolean).join(" / ")) + '</span>' +
          '<span>' + auditEscape([device.last_ip, device.country, device.region, device.city].filter(Boolean).join(" · ")) + '</span>' +
          '<span>首次登录 ' + auditEscape(formatAuditDate(device.first_seen_at)) + ' · 最近活跃 ' + auditEscape(formatAuditDate(device.last_seen_at)) + '</span>' +
          '<em>' + auditEscape(status) + '</em>' +
        '</article>';
      }

      function renderTimeline(events) {
        const groups = { "今天": [], "昨天": [], "本周": [], "更早": [] };
        const now = new Date();
        events.forEach(event => {
          const date = new Date(event.created_at);
          const diffDays = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - new Date(date.getFullYear(), date.getMonth(), date.getDate())) / 86400000);
          const key = diffDays === 0 ? "今天" : diffDays === 1 ? "昨天" : diffDays < 7 ? "本周" : "更早";
          groups[key].push(event);
        });
        return Object.entries(groups).filter(([, items]) => items.length).map(([label, items]) =>
          '<section><h3>' + auditEscape(label) + '</h3>' + items.map(event =>
            '<p>' + [
              formatAuditDate(event.created_at),
              [event.city, event.region, event.country].filter(Boolean).join(" / ") || "-",
              event.ip_address || "-",
              (event.browser || "-") + " on " + (event.os || "-"),
              event.provider || "password",
              event.success ? "成功" : "失败",
              event.risk_level || "正常"
            ].map(auditEscape).join(" · ") + '</p>'
          ).join("") + '</section>'
        ).join("") || "<p>暂无登录历史</p>";
      }
    </script>
  `;
}
