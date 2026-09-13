export function adminOverviewContent(zh) {
  const labels = zh
    ? ["用户总数", "管理员数量"]
    : ["Total Users", "Admins"];
  return `
    <section class="admin-scan">
      <span></span>
      <strong>${zh ? "管理数据概览" : "Admin Data Overview"}</strong>
      <p>${zh ? "汇总用户、角色、权限和操作日志。" : "Overview of users, roles, permissions, and operation logs."}</p>
    </section>
    <section class="admin-metrics" id="admin-overview-metrics">
      ${labels.map((label, index) => `<article class="admin-motion-card admin-skeleton" style="--stagger:${index}"><span>${label}</span><strong data-admin-metric="${index}">0</strong></article>`).join("")}
    </section>
    <section class="admin-dashboard-grid">
      <article class="os-card admin-section-card">
        <div class="admin-section-head"><h2>${zh ? "最近登录用户" : "Recent Login Users"}</h2><span class="status-pulse"></span></div>
        <div id="admin-recent-users" class="admin-list-skeleton"></div>
      </article>
      <article class="os-card admin-section-card">
        <div class="admin-section-head"><h2>${zh ? "最近操作日志" : "Recent Operation Logs"}</h2><button class="admin-ghost" data-admin-nav="/admin/logs">${zh ? "查看全部" : "View all"}</button></div>
        <div id="admin-recent-logs" class="admin-log-list admin-list-skeleton"></div>
      </article>
      <article class="os-card admin-section-card danger-event-card">
        <div class="admin-section-head"><h2>${zh ? "系统风险提示" : "System Risk Signals"}</h2><span>${zh ? "审计规则" : "Audit rules"}</span></div>
        <div id="admin-risk-list" class="admin-risk-list admin-list-skeleton"></div>
      </article>
    </section>
  `;
}

export function adminUsersContent(zh) {
  const roleOptions = zh ? [["", "全部角色"], ["admin", "管理员"], ["editor", "编辑者"], ["user", "普通成员"]] : [["", "All roles"], ["admin", "Administrator"], ["editor", "Editor"], ["user", "Member"]];
  const statusOptions = zh ? [["", "全部状态"], ["active", "正常"], ["suspended", "已停用"], ["banned", "已封禁"]] : [["", "All status"], ["active", "active"], ["suspended", "suspended"], ["banned", "banned"]];
  return `
    <section class="admin-toolbar os-card">
      <input id="admin-user-search" class="os-search" placeholder="${zh ? "搜索用户、邮箱、ID..." : "Search users, email, ID..."}">
      <select id="admin-role-filter">${roleOptions.map(option => `<option value="${option[0]}">${option[1]}</option>`).join("")}</select>
      <select id="admin-status-filter">${statusOptions.map(option => `<option value="${option[0]}">${option[1]}</option>`).join("")}</select>
    </section>
    <section class="os-card admin-table-card">
      <div class="admin-section-head"><h2>${zh ? "用户列表" : "Users"}</h2><span id="admin-users-count">0</span></div>
      <div id="admin-users-table" class="admin-data-table admin-user-table admin-list-skeleton"></div>
    </section>
    <section class="os-card admin-detail-card" id="admin-user-detail">
      <h2>${zh ? "用户详情" : "User Detail"}</h2>
      <div id="admin-user-detail-body" class="admin-empty">${zh ? "选择一位用户查看最近登录和操作记录。" : "Select a user to review recent logins and operations."}</div>
    </section>
  `;
}

export function adminRolesContent(zh) {
  return `
    <section class="os-card admin-role-summary">
      <div class="admin-section-head">
        <h2>${zh ? "RBAC 角色权限" : "RBAC Roles"}</h2>
        <button id="admin-save-permissions" class="admin-primary" disabled>${zh ? "保存权限" : "Save permissions"}</button>
      </div>
      <p>${zh ? "角色用于控制成员可访问的功能。普通成员适合日常使用，不具备用户管理、角色权限调整或管理级审计访问能力；管理员与编辑者应仅授予确有需要的账号。所有权限调整都会保留操作记录。" : "Roles control which features members can access. Members are intended for everyday use and cannot manage users, change role permissions, or access administrator-only audit data. Administrator and editor roles should be granted only when needed. Permission changes are recorded."}</p>
      <div id="admin-unsaved-bar" class="admin-unsaved" hidden>${zh ? "有未保存的权限变更" : "Unsaved permission changes"}</div>
    </section>
    <section id="admin-role-cards" class="admin-role-cards admin-list-skeleton"></section>
    <section class="os-card admin-table-card">
      <div class="admin-section-head"><h2>${zh ? "权限矩阵" : "Permission Matrix"}</h2><span>${zh ? "分组开关" : "Grouped switches"}</span></div>
      <div id="admin-permission-matrix" class="admin-permission-matrix admin-list-skeleton"></div>
    </section>
  `;
}

export function adminLogsContent(zh) {
  const actions = zh
    ? [["", "全部动作"], ["auth.login.failed", "登录失败"], ["user.role.update", "修改用户角色"], ["user.ban", "封禁用户"], ["user.unban", "解除封禁"], ["user.suspend", "停用用户"], ["role.permissions.update", "修改角色权限"]]
    : [["", "All actions"], ["auth.login.failed", "auth.login.failed"], ["user.role.update", "user.role.update"], ["user.ban", "user.ban"], ["user.unban", "user.unban"], ["user.suspend", "user.suspend"], ["role.permissions.update", "role.permissions.update"]];
  const severities = zh ? [["", "全部级别"], ["info", "信息"], ["warning", "警告"], ["danger", "危险"]] : [["", "All severity"], ["info", "info"], ["warning", "warning"], ["danger", "danger"]];
  return `
    <section class="admin-toolbar os-card">
      <input id="admin-log-search" class="os-search" placeholder="${zh ? "搜索描述、对象、动作..." : "Search description, target, action..."}">
      <select id="admin-log-action">${actions.map(action => `<option value="${action[0]}">${action[1]}</option>`).join("")}</select>
      <select id="admin-log-severity">${severities.map(severity => `<option value="${severity[0]}">${severity[1]}</option>`).join("")}</select>
      <input id="admin-log-actor" placeholder="${zh ? "用户邮箱 / ID" : "Actor email / ID"}">
      <input id="admin-log-from" type="date">
      <input id="admin-log-to" type="date">
    </section>
    <section class="os-card admin-table-card">
      <div class="admin-section-head"><h2>${zh ? "操作日志" : "Operation Logs"}</h2><span id="admin-logs-count">0</span></div>
      <div id="admin-logs-list" class="admin-log-timeline admin-list-skeleton"></div>
    </section>
    <aside id="admin-log-drawer" class="admin-drawer" aria-hidden="true">
      <button id="admin-log-drawer-close" class="admin-ghost">×</button>
      <div id="admin-log-drawer-body"></div>
    </aside>
  `;
}

export function adminSystemContent(zh) {
  return `<section class="os-card is-large"><h2>${zh ? "系统状态" : "System Status"}</h2><p>${zh ? "当前管理界面尚未接入运行状态、存储占用与容量统计等监控数据；账户、权限与审计相关信息仍可在对应管理页面查看。" : "Runtime health, storage usage, and capacity metrics are not yet available in the management interface. Account, permission, and audit information remains available in the corresponding administration pages."}</p></section>`;
}

export function adminClientScript(ipInfo) {
  return `
    <script>
      const adminRequestContext = ${JSON.stringify({
        ip_address: ipInfo?.ip || "",
        user_agent: ""
      })};


      const adminState = {
        currentUser: null,
        users: [],
        overview: null,
        roles: null,
        logs: [],
        pendingPermissions: null,
        permissionDirty: false
      };

      const ADMIN_OVERVIEW_CACHE_KEY = "qssed-admin-overview-v1";
      const ADMIN_USERS_CACHE_KEY = "qssed-admin-users-v1";
      const ADMIN_ROLES_CACHE_KEY = "qssed-admin-roles-v1";
      const ADMIN_LOGS_CACHE_KEY = "qssed-admin-logs-v1";
      const ADMIN_ACCESS_CACHE_KEY = "qssed-admin-access-v1";
      const ADMIN_VIEW_CACHE_PREFIX = "qssed-admin-view-v1:";

      function readAdminCache(key) {
        try {
          const raw = sessionStorage.getItem(key);
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      }

      function writeAdminCache(key, value) {
        try {
          sessionStorage.setItem(key, JSON.stringify(value));
        } catch {}
      }

      function clearAdminUiCaches() {
        try {
          sessionStorage.removeItem(ADMIN_OVERVIEW_CACHE_KEY);
          sessionStorage.removeItem(ADMIN_USERS_CACHE_KEY);
          sessionStorage.removeItem(ADMIN_ROLES_CACHE_KEY);
          sessionStorage.removeItem(ADMIN_LOGS_CACHE_KEY);
          sessionStorage.removeItem(ADMIN_ACCESS_CACHE_KEY);
          Object.keys(sessionStorage)
            .filter(key => key.startsWith(ADMIN_VIEW_CACHE_PREFIX))
            .forEach(key => sessionStorage.removeItem(key));
        } catch {}
      }

      function cacheAdminViewHtml() {
        try {
          const content = document.getElementById("os-content");
          if (!content) return;
          sessionStorage.setItem(ADMIN_VIEW_CACHE_PREFIX + location.pathname, content.innerHTML);
        } catch {}
      }

      function adminOverviewFingerprint(data) {
        const normalizeUsers = (data?.recent_users || []).map(user => [
          user.user_id || user.id || "",
          user.username || "",
          user.display_name || "",
          user.email || "",
          user.role || "",
          user.status || "",
          user.last_sign_in_at || ""
        ]).sort((a, b) => String(a[0]).localeCompare(String(b[0])));

        const normalizeLogs = items => (items || []).map(log => [
          log.id || "",
          log.action || "",
          log.severity || "",
          log.created_at || "",
          log.actor_email || "",
          log.target_id || "",
          log.target_label || ""
        ]).sort((a, b) => String(a[0]).localeCompare(String(b[0])));

        return JSON.stringify({
          user_count: Number(data?.user_count) || 0,
          admin_count: Number(data?.admin_count) || 0,
          recent_users: normalizeUsers,
          recent_logs: normalizeLogs(data?.recent_logs),
          risks: normalizeLogs(data?.risks)
        });
      }

      function adminUsersFingerprint(users) {
        return JSON.stringify((users || []).map(user => [
          user.user_id || "",
          user.username || "",
          user.display_name || "",
          user.email || "",
          user.role || "",
          user.status || "",
          user.created_at || "",
          user.last_sign_in_at || "",
          (user.recent_logins || []).map(login => [
            login.id || "",
            login.created_at || "",
            Boolean(login.success),
            login.risk_level || ""
          ]),
          (user.recent_actions || []).map(log => [
            log.id || "",
            log.created_at || "",
            log.action || "",
            log.severity || ""
          ])
        ]).sort((a, b) => String(a[0]).localeCompare(String(b[0]))));
      }

      function cacheAdminUsers() {
        writeAdminCache(ADMIN_USERS_CACHE_KEY, {
          user_id: adminState.currentUser?.id || "",
          fingerprint: adminUsersFingerprint(adminState.users),
          users: adminState.users
        });
      }

      function adminRolesFingerprint(data) {
        const normalized = normalizeRolePermissions(data || {});
        return JSON.stringify({
          roles: normalized.roles.map(role => [role.name || "", role.description || ""]).sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
          permissions: normalized.permissions.map(permission => [permission.key || "", permission.category || "", permission.description || ""]).sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
          role_permissions: normalized.role_permissions.map(item => [item.role || "", item.permission || ""]).sort((a, b) => (String(a[0]) + ":" + String(a[1])).localeCompare(String(b[0]) + ":" + String(b[1]))),
          user_counts: Object.entries(normalized.user_counts || {}).sort(([a], [b]) => a.localeCompare(b))
        });
      }

      function cacheAdminRoles() {
        if (!adminState.roles) return;
        writeAdminCache(ADMIN_ROLES_CACHE_KEY, {
          user_id: adminState.currentUser?.id || "",
          fingerprint: adminRolesFingerprint(adminState.roles),
          data: adminState.roles
        });
      }

      function adminLogsFingerprint(logs) {
        return JSON.stringify((logs || []).map(log => [
          log.id || "",
          log.action || "",
          log.severity || "",
          log.created_at || "",
          log.actor_user_id || "",
          log.actor_email || "",
          log.target_type || "",
          log.target_id || "",
          log.target_label || "",
          log.description || ""
        ]).sort((a, b) => String(a[0]).localeCompare(String(b[0]))));
      }

      function cacheAdminLogs(logs) {
        writeAdminCache(ADMIN_LOGS_CACHE_KEY, {
          user_id: adminState.currentUser?.id || "",
          fingerprint: adminLogsFingerprint(logs),
          logs
        });
      }

      function adminIsZh() {
        return location.pathname.startsWith("/zh-cn");
      }

      function adminText(zh, cn, en) {
        return zh ? cn : en;
      }

      // i18n marker: keep database/API canonical keys in English; localize labels only at render time.
      function adminRoleLabel(role) {
        const labels = adminIsZh()
          ? { admin: "管理员", editor: "编辑者", user: "普通成员" }
          : { admin: "Administrator", editor: "Editor", user: "Member" };
        return labels[role] || role || "-";
      }

      // i18n marker: status values remain active/suspended/banned for RPC filters and updates.
      function adminStatusLabel(status) {
        if (!adminIsZh()) return status || "-";
        return ({ active: "正常", suspended: "已停用", banned: "已封禁" })[status] || status || "-";
      }

      // i18n marker: severity values remain info/warning/danger for audit filtering.
      function adminSeverityLabel(severity) {
        if (!adminIsZh()) return severity || "-";
        return ({ info: "信息", warning: "警告", danger: "危险" })[severity] || severity || "-";
      }

      // i18n marker: audit action keys are stored as machine-readable English action names.
      function adminActionLabel(action) {
        if (!adminIsZh()) return action || "-";
        return ({
          "login": "登录",
          "auth.login.failed": "登录失败",
          "user.role.update": "修改用户角色",
          "user.ban": "封禁用户",
          "user.unban": "解除封禁",
          "user.suspend": "停用用户",
          "role.permissions.update": "修改角色权限"
        })[action] || action || "-";
      }

      // i18n marker: audit descriptions may come from database functions in English; render a Chinese hint without mutating stored logs.
      function adminLogDescription(log) {
        const text = log?.description || log?.target_label || "-";
        if (!adminIsZh()) return text;
        if (log?.action === "auth.login.failed") return "密码登录失败。";
        if (log?.action === "user.role.update") return "用户角色已更新。";
        if (log?.action === "user.ban") return "用户已被封禁。";
        if (log?.action === "user.unban") return "用户已解除封禁。";
        if (log?.action === "user.suspend") return "用户已停用。";
        if (log?.action === "role.permissions.update") return "角色权限矩阵已更新。";
        return text;
      }

      // i18n marker: permission keys stay stable for RBAC; Chinese copy is display-only.
      function adminPermissionLabel(key) {
        if (!adminIsZh()) return key || "-";
        return ({
          "users.read": "查看用户", "users.update": "更新用户", "users.ban": "封禁用户",
          "roles.read": "查看角色", "roles.update": "更新角色",
          "logs.read": "查看日志", "system.read": "查看系统",
          "notes.read": "查看笔记", "notes.create": "创建笔记", "notes.update": "更新笔记", "notes.delete": "删除笔记",
          "links.read": "查看链接", "links.create": "创建链接", "links.update": "更新链接", "links.delete": "删除链接",
          "projects.read": "查看项目", "projects.create": "创建项目", "projects.update": "更新项目", "projects.delete": "删除项目"
        })[key] || key || "-";
      }

      function adminPermissionDescription(permission) {
        if (!adminIsZh()) return permission.description || permission.key || "";
        return adminPermissionLabel(permission.key) + "权限";
      }

      function adminCategoryLabel(category) {
        if (!adminIsZh()) return category || "general";
        return ({ users: "用户", roles: "角色", logs: "日志", system: "系统", notes: "笔记", links: "链接", projects: "项目", general: "通用" })[category] || category || "通用";
      }

      function adminFieldLabel(key) {
        if (!adminIsZh()) return key;
        return ({
          id: "日志 ID",
          actor_user_id: "操作者 ID",
          actor_email: "操作者邮箱",
          action: "动作",
          target_type: "对象类型",
          target_id: "对象 ID",
          target_label: "对象名称",
          description: "描述",
          ip_address: "IP 地址",
          user_agent: "浏览器标识",
          severity: "级别",
          created_at: "创建时间"
        })[key] || key;
      }

      function adminRoleDescription(role) {
        const descriptions = adminIsZh()
          ? {
              admin: "拥有完整管理权限，可管理成员、角色权限与审计记录。仅应授予承担管理职责的账号。",
              editor: "适用于需要扩展工作区操作能力的成员，不包含用户管理、角色权限调整等管理员能力。",
              user: "普通成员，用于日常个人使用。可以访问获准的个人功能，但不能管理其他成员、修改角色权限或访问仅限管理员的审计信息。"
            }
          : {
              admin: "Full administrative access for member management, role permissions, and audit records. Grant this role only to accounts with administrative responsibilities.",
              editor: "For members who need broader workspace capabilities without user management or role-permission administration.",
              user: "Standard member for everyday personal use. Can use permitted personal features but cannot manage other members, change role permissions, or access administrator-only audit information."
            };
        return descriptions[role.name] || role.description || "-";
      }

      function adminEscape(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
      }

      function adminFormatDate(value) {
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

      function adminSkeleton(target, rows) {
        if (!target) return;
        target.innerHTML = Array.from({ length: rows || 4 }).map(() => '<div class="skeleton-line"></div>').join("");
      }

      function adminEmpty(message, actionLabel, action) {
        return '<article class="admin-empty-state"><div class="admin-empty-orb">Q</div><strong>' + adminEscape(message) + '</strong>' + (actionLabel ? '<button class="admin-ghost" data-empty-action="' + adminEscape(action || "") + '">' + adminEscape(actionLabel) + '</button>' : "") + '</article>';
      }

      function adminToast(message, type) {
        let host = document.getElementById("admin-toast-host");
        if (!host) {
          host = document.createElement("div");
          host.id = "admin-toast-host";
          document.body.appendChild(host);
        }
        const toast = document.createElement("div");
        toast.className = "admin-toast " + (type || "info");
        toast.innerHTML = '<strong>' + (type === "danger" ? "!" : type === "warning" ? "?" : "✓") + '</strong><span>' + adminEscape(message) + '</span>';
        host.appendChild(toast);
        window.setTimeout(() => toast.classList.add("is-hiding"), 2800);
        window.setTimeout(() => toast.remove(), 3300);
      }

      function adminConfirm(options) {
        return new Promise(resolve => {
          const overlay = document.createElement("div");
          overlay.className = "admin-confirm-backdrop";
          const needsInput = Boolean(options.confirmText);
          overlay.innerHTML =
            '<div class="admin-confirm ' + (options.danger ? "is-danger" : "") + '">' +
              '<h3>' + adminEscape(options.title) + '</h3>' +
              '<p>' + adminEscape(options.message) + '</p>' +
              (needsInput ? '<input id="admin-confirm-input" placeholder="' + adminEscape(options.confirmText) + '">' : '') +
              '<div class="admin-confirm-actions">' +
                '<button class="admin-ghost" data-confirm-cancel>' + adminEscape(adminText(adminIsZh(), "取消", "Cancel")) + '</button>' +
                '<button class="' + (options.danger ? "admin-danger" : "admin-primary") + '" data-confirm-ok>' + adminEscape(options.confirmLabel || adminText(adminIsZh(), "确认", "Confirm")) + '</button>' +
              '</div>' +
            '</div>';
          document.body.appendChild(overlay);
          requestAnimationFrame(() => overlay.classList.add("is-open"));
          const close = value => {
            overlay.classList.remove("is-open");
            window.setTimeout(() => overlay.remove(), 180);
            resolve(value);
          };
          overlay.querySelector("[data-confirm-cancel]").addEventListener("click", () => close(false));
          overlay.addEventListener("click", event => { if (event.target === overlay) close(false); });
          overlay.querySelector("[data-confirm-ok]").addEventListener("click", () => {
            const input = overlay.querySelector("#admin-confirm-input");
            if (input && input.value.trim() !== options.confirmText) {
              overlay.querySelector(".admin-confirm").classList.remove("shake-once");
              void overlay.querySelector(".admin-confirm").offsetWidth;
              overlay.querySelector(".admin-confirm").classList.add("shake-once");
              input.classList.add("is-error");
              return;
            }
            close(true);
          });
        });
      }

      function animateNumber(el, value) {
        if (!el) return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced) {
          el.innerText = String(value);
          return;
        }
        const target = Number(value) || 0;
        const start = performance.now();
        const duration = 520;
        function tick(now) {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.innerText = String(Math.round(target * eased));
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }

      async function adminRpc(name, params) {
        const { data, error } = await supabaseClient.rpc(name, params || {});
        if (error) {
          console.error("Admin RPC failed", name, error.message);
          return { data: null, error };
        }
        return { data, error: null };
      }

      function adminLoadError(message) {
        return adminEmpty(message || adminText(adminIsZh(), "无法读取管理数据，请稍后重试。", "Unable to load management data. Please try again later."));
      }

      async function hydrateAdminModule(user) {
        adminState.currentUser = user;
        adminRequestContext.user_agent = navigator.userAgent || "";
        const path = location.pathname.replace(/^\\/(zh-cn|en)/, "") || "/dashboard";
        if (path === "/admin/general") await loadAdminOverview();
        if (path === "/admin/users") await loadAdminUsers();
        if (path === "/admin/roles") await loadAdminRoles();
        if (path === "/admin/logs") await loadAdminLogs();
        bindAdminNavigation();
      }

      function bindAdminNavigation() {
        document.querySelectorAll("[data-admin-nav]").forEach(button => {
          button.addEventListener("click", () => {
            const prefix = adminIsZh() ? "/zh-cn" : "/en";
            location.href = prefix + button.dataset.adminNav;
          });
        });
      }

      async function loadAdminOverview() {
        const stored = readAdminCache(ADMIN_OVERVIEW_CACHE_KEY);
        const cached = stored?.user_id === adminState.currentUser?.id ? stored : null;

        if (cached?.data) {
          adminState.overview = cached.data;
          renderAdminOverview(cached.data);
          void refreshAdminOverview(cached);
          return;
        }

        ["admin-recent-users", "admin-recent-logs", "admin-risk-list"].forEach(id => adminSkeleton(document.getElementById(id), 4));
        await refreshAdminOverview(null);
      }

      async function refreshAdminOverview(cached) {
        const result = await adminRpc("get_admin_overview", {});
        if (result.error) {
          if (cached?.data) {
            console.warn("Admin overview refresh failed; keeping cached data.");
            return;
          }
          document.querySelectorAll("[data-admin-metric]").forEach(el => {
            el.closest("article")?.classList.remove("admin-skeleton");
            el.innerText = "—";
          });
          ["admin-recent-users", "admin-recent-logs", "admin-risk-list"].forEach(id => {
            const target = document.getElementById(id);
            if (!target) return;
            target.classList.remove("admin-list-skeleton");
            target.innerHTML = adminLoadError();
          });
          adminToast(adminText(adminIsZh(), "管理数据读取失败。", "Admin data failed to load."), "danger");
          return;
        }

        const fresh = result.data || {};
        const fingerprint = adminOverviewFingerprint(fresh);
        adminState.overview = fresh;

        if (cached?.fingerprint === fingerprint) return;

        writeAdminCache(ADMIN_OVERVIEW_CACHE_KEY, {
          user_id: adminState.currentUser?.id || "",
          fingerprint,
          data: fresh
        });
        renderAdminOverview(fresh);
      }

      function renderAdminOverview(data) {
        const values = [data.user_count, data.admin_count];
        document.querySelectorAll("[data-admin-metric]").forEach((el, index) => {
          el.closest("article")?.classList.remove("admin-skeleton");
          el.innerText = String(Number(values[index]) || 0);
        });
        const users = document.getElementById("admin-recent-users");
        if (users) {
          users.classList.remove("admin-list-skeleton");
          users.innerHTML = (data.recent_users || []).length ? data.recent_users.map(user =>
            '<article class="admin-mini-row"><span class="admin-avatar">' + adminEscape((user.display_name || user.email || "?").slice(0, 1).toUpperCase()) + '</span><div><strong>' + adminEscape(user.display_name || user.username || user.email || user.id) + '</strong><small>' + adminEscape(user.email || adminRoleLabel(user.role)) + '</small></div><em class="admin-badge ' + adminEscape(user.status || "active") + '">' + adminEscape(adminStatusLabel(user.status || "active")) + '</em></article>'
          ).join("") : adminEmpty(adminText(adminIsZh(), "暂无最近用户", "No recent users"));
        }
        const logs = document.getElementById("admin-recent-logs");
        if (logs) {
          logs.classList.remove("admin-list-skeleton");
          logs.innerHTML = renderAdminLogRows(data.recent_logs || [], true);
        }
        const risks = document.getElementById("admin-risk-list");
        if (risks) {
          risks.classList.remove("admin-list-skeleton");
          const riskItems = data.risks || [];
          risks.innerHTML = riskItems.length ? riskItems.map(log =>
            '<article class="admin-risk ' + adminEscape(log.severity) + '"><strong>' + adminEscape(adminActionLabel(log.action)) + '</strong><p>' + adminEscape(adminLogDescription(log)) + '</p><small>' + adminFormatDate(log.created_at) + '</small></article>'
          ).join("") : adminEmpty(adminText(adminIsZh(), "暂无风险事件", "No risk events"), adminText(adminIsZh(), "查看日志", "Open logs"), "/admin/logs");
          if (riskItems.some(log => log.severity === "danger")) risks.closest(".danger-event-card")?.classList.add("pulse-once");
        }
        cacheAdminViewHtml();
      }

      async function loadAdminUsers() {
        const table = document.getElementById("admin-users-table");
        const stored = readAdminCache(ADMIN_USERS_CACHE_KEY);
        const cached = stored?.user_id === adminState.currentUser?.id ? stored : null;

        bindAdminUserFilters();

        if (cached?.users) {
          adminState.users = cached.users;
          renderAdminUsers();
          void refreshAdminUsers(cached);
          return;
        }

        adminSkeleton(table, 6);
        await refreshAdminUsers(null);
      }

      async function refreshAdminUsers(cached) {
        const table = document.getElementById("admin-users-table");
        const result = await adminRpc("get_admin_users", {});
        if (result.error) {
          if (cached?.users) {
            console.warn("Admin users refresh failed; keeping cached data.");
            return;
          }
          adminState.users = [];
          table?.classList.remove("admin-list-skeleton");
          if (table) table.innerHTML = adminLoadError();
          const count = document.getElementById("admin-users-count");
          if (count) count.innerText = "—";
          adminToast(adminText(adminIsZh(), "用户列表读取失败。", "User list failed to load."), "danger");
          return;
        }

        const fresh = result.data || [];
        const fingerprint = adminUsersFingerprint(fresh);
        adminState.users = fresh;

        if (cached?.fingerprint === fingerprint) return;

        cacheAdminUsers();
        renderAdminUsers();
      }

      function bindAdminUserFilters() {
        ["admin-user-search", "admin-role-filter", "admin-status-filter"].forEach(id => {
          const el = document.getElementById(id);
          if (el && !el.dataset.bound) {
            el.dataset.bound = "true";
            el.addEventListener("input", renderAdminUsers);
            el.addEventListener("change", renderAdminUsers);
          }
        });
      }

      function filteredAdminUsers() {
        const q = (document.getElementById("admin-user-search")?.value || "").toLowerCase();
        const role = document.getElementById("admin-role-filter")?.value || "";
        const status = document.getElementById("admin-status-filter")?.value || "";
        return adminState.users.filter(user => {
          const haystack = [user.user_id, user.username, user.display_name, user.email, user.role, user.status].join(" ").toLowerCase();
          return (!q || haystack.includes(q)) && (!role || user.role === role) && (!status || user.status === status);
        });
      }

      function renderAdminUsers() {
        const zh = adminIsZh();
        const table = document.getElementById("admin-users-table");
        if (!table) return;
        const users = filteredAdminUsers();
        document.getElementById("admin-users-count").innerText = String(users.length);
        table.classList.remove("admin-list-skeleton");
        if (!users.length) {
          table.innerHTML = adminEmpty(adminText(zh, "暂无匹配用户", "No matching users"));
          return;
        }
        const head = ["ID", adminText(zh, "用户名", "Username"), adminText(zh, "邮箱", "Email"), adminText(zh, "头像", "Avatar"), adminText(zh, "角色", "Role"), adminText(zh, "状态", "Status"), adminText(zh, "创建时间", "Created"), adminText(zh, "最近登录", "Last login"), adminText(zh, "最近活跃", "Last active"), adminText(zh, "操作", "Actions")];
        table.innerHTML = '<div class="admin-table-row admin-table-head">' + head.map(item => '<strong>' + adminEscape(item) + '</strong>').join("") + '</div>' +
          users.map((user, index) => renderAdminUserRow(user, index)).join("");
        table.querySelectorAll("[data-user-detail]").forEach(button => button.addEventListener("click", () => showAdminUserDetail(button.dataset.userDetail)));
        table.querySelectorAll("[data-user-role]").forEach(select => select.addEventListener("change", () => changeAdminUserRole(select.dataset.userRole, select.value)));
        table.querySelectorAll("[data-user-status]").forEach(select => select.addEventListener("change", () => changeAdminUserStatus(select.dataset.userStatus, select.value)));
        cacheAdminViewHtml();
      }

      function renderAdminUserRow(user, index) {
        const isSelf = user.user_id === adminState.currentUser?.id;
        return '<div class="admin-table-row animated-row" data-user-row="' + adminEscape(user.user_id) + '" style="--stagger:' + Math.min(index, 12) + '">' +
          '<span class="mono">' + adminEscape(String(user.user_id || "-").slice(0, 8)) + '</span>' +
          '<span>' + adminEscape(user.display_name || user.username || "-") + '</span>' +
          '<span>' + adminEscape(user.email || "-") + '</span>' +
          '<span><span class="admin-avatar">' + adminEscape((user.display_name || user.email || "?").slice(0, 1).toUpperCase()) + '</span></span>' +
          '<span><select data-user-role="' + adminEscape(user.user_id) + '"' + (isSelf ? ' data-self="true"' : '') + '>' + ["admin","editor","user"].map(role => '<option value="' + role + '"' + (user.role === role ? " selected" : "") + '>' + adminEscape(adminRoleLabel(role)) + '</option>').join("") + '</select></span>' +
          '<span><select data-user-status="' + adminEscape(user.user_id) + '"' + (isSelf ? " disabled" : "") + '>' + ["active","suspended","banned"].map(status => '<option value="' + status + '"' + (user.status === status ? " selected" : "") + '>' + adminEscape(adminStatusLabel(status)) + '</option>').join("") + '</select></span>' +
          '<span>' + adminFormatDate(user.created_at) + '</span>' +
          '<span>' + adminFormatDate(user.last_sign_in_at) + '</span>' +
          '<span>' + adminFormatDate(user.last_seen_at) + '</span>' +
          '<span><button class="admin-ghost" data-user-detail="' + adminEscape(user.user_id) + '">' + adminEscape(adminText(adminIsZh(), "详情", "Detail")) + '</button></span>' +
        '</div>';
      }

      function getAdminUser(userId) {
        return adminState.users.find(user => user.user_id === userId);
      }

      function showAdminUserDetail(userId) {
        const user = getAdminUser(userId);
        const body = document.getElementById("admin-user-detail-body");
        if (!user || !body) return;
        const logins = user.recent_logins || [];
        const actions = user.recent_actions || [];
        body.innerHTML =
          '<div class="admin-detail-grid">' +
            '<div><strong>' + adminEscape(user.display_name || user.username || user.email) + '</strong><p>' + adminEscape(user.user_id) + '</p><p>' + adminEscape(adminRoleLabel(user.role)) + ' · ' + adminEscape(adminStatusLabel(user.status)) + '</p></div>' +
            '<div><h3>' + adminEscape(adminText(adminIsZh(), "最近登录", "Recent logins")) + '</h3>' + (logins.length ? logins.map(login => '<p>' + adminFormatDate(login.created_at) + ' · ' + adminEscape(login.ip_address || "-") + ' · ' + adminEscape(login.browser || "-") + '</p>').join("") : '<p>-</p>') + '</div>' +
            '<div><h3>' + adminEscape(adminText(adminIsZh(), "最近操作", "Recent actions")) + '</h3>' + (actions.length ? actions.map(log => '<p>' + adminFormatDate(log.created_at) + ' · ' + adminEscape(adminActionLabel(log.action)) + '</p>').join("") : '<p>-</p>') + '</div>' +
          '</div>';
        cacheAdminViewHtml();
      }

      async function changeAdminUserRole(userId, role) {
        const user = getAdminUser(userId);
        if (!user) return;
        if (user.user_id === adminState.currentUser?.id && role !== "admin") {
          adminToast(adminText(adminIsZh(), "不能移除自己的 admin 权限。", "You cannot remove your own admin role."), "danger");
          renderAdminUsers();
          return;
        }
        const ok = await adminConfirm({
          title: adminText(adminIsZh(), "确认修改角色", "Confirm role change"),
          message: (user.email || user.user_id) + " → " + adminRoleLabel(role),
          confirmLabel: adminText(adminIsZh(), "修改角色", "Update role"),
          danger: role === "admin" || user.role === "admin"
        });
        if (!ok) {
          renderAdminUsers();
          return;
        }
        const result = await adminRpc("update_user_role", { p_user_id: userId, p_role: role, p_ip_address: adminRequestContext.ip_address, p_user_agent: adminRequestContext.user_agent });
        if (result.error) {
          adminToast(result.error.message, "danger");
          renderAdminUsers();
          return;
        }
        user.role = role;
        cacheAdminUsers();

        pulseAdminRow(userId, "warning");
        adminToast(adminText(adminIsZh(), "角色已更新。", "Role updated."), "warning");
        renderAdminUsers();
      }

      async function changeAdminUserStatus(userId, status) {
        const user = getAdminUser(userId);
        if (!user) return;
        if (user.user_id === adminState.currentUser?.id && status !== "active") {
          adminToast(adminText(adminIsZh(), "不能封禁或停用自己。", "You cannot suspend or ban yourself."), "danger");
          renderAdminUsers();
          return;
        }
        const isDanger = status === "banned";
        const ok = await adminConfirm({
          title: adminText(adminIsZh(), isDanger ? "确认封禁用户" : "确认修改状态", isDanger ? "Confirm user ban" : "Confirm status change"),
          message: (user.email || user.user_id) + " → " + adminStatusLabel(status),
          confirmLabel: adminText(adminIsZh(), isDanger ? "封禁用户" : "修改状态", isDanger ? "Ban user" : "Update status"),
          danger: isDanger,
          confirmText: isDanger ? "BAN" : ""
        });
        if (!ok) {
          renderAdminUsers();
          return;
        }
        const result = await adminRpc("update_user_status", { p_user_id: userId, p_status: status, p_ip_address: adminRequestContext.ip_address, p_user_agent: adminRequestContext.user_agent });
        if (result.error) {
          adminToast(result.error.message, "danger");
          renderAdminUsers();
          return;
        }
        user.status = status;
        cacheAdminUsers();

        pulseAdminRow(userId, status === "active" ? "success" : "warning");
        adminToast(adminText(adminIsZh(), status === "active" ? "用户已解除封禁。" : "用户状态已更新。", status === "active" ? "User restored." : "User status updated."), status === "banned" ? "danger" : "success");
        renderAdminUsers();
      }

      function pulseAdminRow(userId, type) {
        const row = document.querySelector('[data-user-row="' + CSS.escape(userId) + '"]');
        if (!row) return;
        row.classList.remove("row-flash-warning", "row-flash-success");
        void row.offsetWidth;
        row.classList.add(type === "success" ? "row-flash-success" : "row-flash-warning");
      }

      async function loadAdminRoles() {
        const cards = document.getElementById("admin-role-cards");
        const matrix = document.getElementById("admin-permission-matrix");
        const stored = readAdminCache(ADMIN_ROLES_CACHE_KEY);
        const cached = stored?.user_id === adminState.currentUser?.id ? stored : null;

        if (cached?.data) {
          adminState.roles = normalizeRolePermissions(cached.data);
          adminState.pendingPermissions = JSON.parse(JSON.stringify(adminState.roles.role_permissions));
          adminState.permissionDirty = false;
          renderAdminRoles();
          void refreshAdminRoles(cached);
          return;
        }

        adminSkeleton(cards, 3);
        adminSkeleton(matrix, 8);
        await refreshAdminRoles(null);
      }

      async function refreshAdminRoles(cached) {
        const cards = document.getElementById("admin-role-cards");
        const matrix = document.getElementById("admin-permission-matrix");
        const result = await adminRpc("get_role_permissions", {});
        if (result.error) {
          if (cached?.data) {
            console.warn("Admin roles refresh failed; keeping cached data.");
            return;
          }
          [cards, matrix].forEach(target => {
            if (!target) return;
            target.classList.remove("admin-list-skeleton");
            target.innerHTML = adminLoadError();
          });
          adminToast(adminText(adminIsZh(), "角色权限读取失败。", "Role permissions failed to load."), "danger");
          return;
        }

        const fresh = normalizeRolePermissions(result.data || {});
        const fingerprint = adminRolesFingerprint(fresh);

        if (cached?.fingerprint === fingerprint) return;

        adminState.roles = fresh;
        adminState.pendingPermissions = JSON.parse(JSON.stringify(fresh.role_permissions));
        adminState.permissionDirty = false;
        cacheAdminRoles();
        renderAdminRoles();
      }

      function normalizeRolePermissions(data) {
        return {
          roles: data.roles || [],
          permissions: data.permissions || [],
          role_permissions: data.role_permissions || [],
          user_counts: data.user_counts || {}
        };
      }

      function roleHasPermission(role, permission) {
        return (adminState.pendingPermissions || []).some(item => item.role === role && item.permission === permission);
      }

      function setRolePermission(role, permission, enabled) {
        adminState.pendingPermissions = (adminState.pendingPermissions || []).filter(item => !(item.role === role && item.permission === permission));
        if (enabled) adminState.pendingPermissions.push({ role, permission });
        adminState.permissionDirty = true;
        document.getElementById("admin-unsaved-bar").hidden = false;
        document.getElementById("admin-save-permissions").disabled = false;
      }

      function renderAdminRoles() {
        const data = adminState.roles;
        const cards = document.getElementById("admin-role-cards");
        const matrix = document.getElementById("admin-permission-matrix");
        if (cards) {
          cards.classList.remove("admin-list-skeleton");
          cards.innerHTML = data.roles.map(role => {
            const count = data.user_counts?.[role.name] || 0;
            const perms = (adminState.pendingPermissions || []).filter(item => item.role === role.name).length;
            return '<article class="os-card admin-motion-card"><small>' + adminEscape(role.name) + '</small><h2>' + adminEscape(adminRoleLabel(role.name)) + '</h2><p>' + adminEscape(adminRoleDescription(role)) + '</p><strong>' + count + adminText(adminIsZh(), ' 位用户 · ', ' users · ') + perms + adminText(adminIsZh(), ' 项权限', ' permissions') + '</strong></article>';
          }).join("");
        }
        if (!matrix) return;
        matrix.classList.remove("admin-list-skeleton");
        const grouped = {};
        data.permissions.forEach(permission => {
          grouped[permission.category || "general"] ||= [];
          grouped[permission.category || "general"].push(permission);
        });
        matrix.innerHTML = Object.entries(grouped).map(([category, permissions]) =>
          '<details class="permission-group" open><summary>' + adminEscape(adminCategoryLabel(category)) + '</summary>' +
          '<div class="permission-grid">' +
            '<strong class="permission-head">' + adminEscape(adminText(adminIsZh(), "权限", "Permission")) + '</strong>' + data.roles.map(role => '<strong>' + adminEscape(adminRoleLabel(role.name)) + '</strong>').join("") +
            permissions.map(permission =>
              '<div class="permission-key"><strong>' + adminEscape(adminPermissionLabel(permission.key)) + '</strong><small>' + adminEscape(permission.key) + ' · ' + adminEscape(adminPermissionDescription(permission)) + '</small></div>' +
              data.roles.map(role => '<label class="switch-cell"><input type="checkbox" data-role="' + adminEscape(role.name) + '" data-permission="' + adminEscape(permission.key) + '"' + (roleHasPermission(role.name, permission.key) ? " checked" : "") + '><span></span></label>').join("")
            ).join("") +
          '</div></details>'
        ).join("");
        matrix.querySelectorAll('input[type="checkbox"]').forEach(input => input.addEventListener("change", async () => {
          const key = input.dataset.permission;
          const critical = ["users.ban", "roles.update", "users.update"].includes(key);
          if (critical && !input.checked) {
            const ok = await adminConfirm({
              title: adminText(adminIsZh(), "确认关闭关键权限", "Confirm critical permission change"),
              message: adminRoleLabel(input.dataset.role) + " / " + adminPermissionLabel(key),
              confirmLabel: adminText(adminIsZh(), "继续修改", "Continue"),
              danger: true
            });
            if (!ok) {
              input.checked = true;
              return;
            }
          }
          setRolePermission(input.dataset.role, key, input.checked);
          input.closest(".switch-cell")?.classList.add("updated");
          window.setTimeout(() => input.closest(".switch-cell")?.classList.remove("updated"), 2000);
        }));
        const save = document.getElementById("admin-save-permissions");
        if (save && !save.dataset.bound) {
          save.dataset.bound = "true";
          save.addEventListener("click", saveAdminPermissions);
        }
        cacheAdminViewHtml();
      }

      async function saveAdminPermissions() {
        const roles = adminState.roles.roles.map(role => role.name);
        for (const role of roles) {
          const permissions = (adminState.pendingPermissions || []).filter(item => item.role === role).map(item => item.permission);
          const result = await adminRpc("update_role_permissions", { p_role: role, p_permissions: permissions, p_ip_address: adminRequestContext.ip_address, p_user_agent: adminRequestContext.user_agent });
          if (result.error) {
            adminToast(result.error.message, "danger");
            return;
          }
          adminState.roles = normalizeRolePermissions(result.data || adminState.roles);
          adminState.pendingPermissions = JSON.parse(JSON.stringify(adminState.roles.role_permissions));
        }
        adminState.permissionDirty = false;
        cacheAdminRoles();
        document.getElementById("admin-unsaved-bar").hidden = true;
        const save = document.getElementById("admin-save-permissions");
        save.disabled = true;
        const old = save.innerText;
        save.innerText = adminText(adminIsZh(), "已保存", "Saved");
        window.setTimeout(() => save.innerText = old, 1400);
        adminToast(adminText(adminIsZh(), "权限矩阵已保存。", "Permission matrix saved."), "success");
        renderAdminRoles();
      }

      async function loadAdminLogs() {
        bindAdminLogFilters();
        await refreshAdminLogs({ useCache: true });
      }

      function bindAdminLogFilters() {
        ["admin-log-search","admin-log-action","admin-log-severity","admin-log-actor","admin-log-from","admin-log-to"].forEach(id => {
          const el = document.getElementById(id);
          if (el && !el.dataset.bound) {
            el.dataset.bound = "true";
            el.addEventListener("input", debounce(() => refreshAdminLogs({ useCache: false }), 180));
            el.addEventListener("change", () => refreshAdminLogs({ useCache: false }));
          }
        });
        const close = document.getElementById("admin-log-drawer-close");
        if (close && !close.dataset.bound) {
          close.dataset.bound = "true";
          close.addEventListener("click", () => toggleAdminLogDrawer(null));
        }
      }

      function debounce(fn, delay) {
        let timer;
        return () => {
          clearTimeout(timer);
          timer = setTimeout(fn, delay);
        };
      }

      async function refreshAdminLogs(options = {}) {
        const list = document.getElementById("admin-logs-list");
        const params = {
          p_action: document.getElementById("admin-log-action")?.value || null,
          p_severity: document.getElementById("admin-log-severity")?.value || null,
          p_actor: document.getElementById("admin-log-actor")?.value || null,
          p_search: document.getElementById("admin-log-search")?.value || null,
          p_from: document.getElementById("admin-log-from")?.value ? document.getElementById("admin-log-from").value + "T00:00:00" : null,
          p_to: document.getElementById("admin-log-to")?.value ? document.getElementById("admin-log-to").value + "T23:59:59" : null,
          p_limit: 120
        };
        const isDefault = !params.p_action && !params.p_severity && !params.p_actor && !params.p_search && !params.p_from && !params.p_to;
        const stored = options.useCache && isDefault ? readAdminCache(ADMIN_LOGS_CACHE_KEY) : null;
        const cached = stored?.user_id === adminState.currentUser?.id ? stored : null;

        if (cached?.logs) {
          adminState.logs = cached.logs;
          renderAdminLogs();
          void fetchAdminLogs(params, cached, true);
          return;
        }

        if (!list?.children.length) adminSkeleton(list, 8);
        await fetchAdminLogs(params, null, isDefault);
      }

      async function fetchAdminLogs(params, cached, cacheDefault) {
        const list = document.getElementById("admin-logs-list");
        const result = await adminRpc("get_audit_logs", params);
        if (result.error) {
          if (cached?.logs) {
            console.warn("Admin logs refresh failed; keeping cached data.");
            return;
          }
          adminState.logs = [];
          list?.classList.remove("admin-list-skeleton");
          if (list) list.innerHTML = adminLoadError();
          const count = document.getElementById("admin-logs-count");
          if (count) count.innerText = "—";
          adminToast(adminText(adminIsZh(), "操作日志读取失败。", "Audit logs failed to load."), "danger");
          return;
        }

        const fresh = result.data || [];
        const fingerprint = adminLogsFingerprint(fresh);

        if (cached?.fingerprint === fingerprint) return;

        adminState.logs = fresh;
        if (cacheDefault) cacheAdminLogs(fresh);
        renderAdminLogs();
      }

      function renderAdminLogs() {
        const list = document.getElementById("admin-logs-list");
        if (!list) return;
        list.classList.remove("admin-list-skeleton");
        document.getElementById("admin-logs-count").innerText = String(adminState.logs.length);
        list.innerHTML = renderAdminLogRows(adminState.logs, false);
        list.querySelectorAll("[data-log-id]").forEach(row => row.addEventListener("click", () => toggleAdminLogDrawer(row.dataset.logId)));
        cacheAdminViewHtml();
      }

      function renderAdminLogRows(logs, compact) {
        if (!logs.length) return adminEmpty(adminText(adminIsZh(), "暂无日志", "No logs yet"));
        return logs.map((log, index) =>
          '<article class="admin-log-row animated-row ' + adminEscape(log.severity || "info") + '" style="--stagger:' + Math.min(index, 12) + '" data-log-id="' + adminEscape(log.id || index) + '">' +
            '<span class="log-dot"></span>' +
            '<div><strong>' + adminEscape(adminActionLabel(log.action)) + '</strong><p>' + adminEscape(adminLogDescription(log)) + '</p><small>' + adminFormatDate(log.created_at) + ' · ' + adminEscape(log.actor_email || "-") + (compact ? "" : " · " + adminEscape(log.ip_address || "-")) + '</small></div>' +
            '<em class="admin-badge ' + adminEscape(log.severity || "info") + '">' + adminEscape(adminSeverityLabel(log.severity || "info")) + '</em>' +
          '</article>'
        ).join("");
      }

      function toggleAdminLogDrawer(logId) {
        const drawer = document.getElementById("admin-log-drawer");
        const body = document.getElementById("admin-log-drawer-body");
        if (!drawer || !body) return;
        if (!logId) {
          drawer.classList.remove("is-open");
          drawer.setAttribute("aria-hidden", "true");
          return;
        }
        const log = adminState.logs.find(item => String(item.id) === String(logId));
        if (!log) return;
        body.innerHTML =
          '<h2>' + adminEscape(adminActionLabel(log.action)) + '</h2>' +
          '<p>' + adminEscape(adminLogDescription(log)) + '</p>' +
          '<dl class="admin-drawer-facts">' +
            Object.entries(log).filter(([key]) => !["metadata"].includes(key)).map(([key, value]) => '<div><dt>' + adminEscape(adminFieldLabel(key)) + '<small> ' + adminEscape(key) + '</small></dt><dd>' + adminEscape(typeof value === "string" ? value : JSON.stringify(value)) + '</dd></div>').join("") +
          '</dl>' +
          '<pre>' + adminEscape(JSON.stringify(log.metadata || {}, null, 2)) + '</pre>';
        drawer.classList.add("is-open");
        drawer.setAttribute("aria-hidden", "false");
      }

      window.hydrateAdminModule = hydrateAdminModule;
    </script>
  `;
}
