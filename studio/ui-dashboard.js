export function dashboardIcon(name) {
  const icons = {
    profile: '<circle cx="12" cy="8" r="3.2"/><path d="M5.5 19c.9-3.2 3.2-5 6.5-5s5.6 1.8 6.5 5"/>',
    workbench: '<rect x="4" y="5" width="16" height="14" rx="3"/><path d="M8 9h8M8 13h5"/>',
    storage: '<path d="M4 7.5C4 5.6 7.6 4 12 4s8 1.6 8 3.5S16.4 11 12 11 4 9.4 4 7.5z"/><path d="M4 7.5v4C4 13.4 7.6 15 12 15s8-1.6 8-3.5v-4M4 11.5v4C4 17.4 7.6 19 12 19s8-1.6 8-3.5v-4"/>',
    links: '<path d="M9.5 14.5l5-5M7.2 16.8l-1.3 1.3a3.2 3.2 0 01-4.5-4.5l3.4-3.4a3.2 3.2 0 014.5 0M16.8 7.2l1.3-1.3a3.2 3.2 0 014.5 4.5l-3.4 3.4a3.2 3.2 0 01-4.5 0"/>',
    security: '<path d="M12 3l7 3v5c0 4.4-2.6 7.8-7 10-4.4-2.2-7-5.6-7-10V6l7-3z"/><path d="M9.3 12l1.8 1.8 3.7-4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7.4 7.4 0 00-.1-1l2-1.5-2-3.4-2.5 1A8.3 8.3 0 0014.7 6L14.4 3h-4.8L9.3 6a8.3 8.3 0 00-1.7 1.1l-2.5-1-2 3.4 2 1.5a7.4 7.4 0 000 2l-2 1.5 2 3.4 2.5-1A8.3 8.3 0 009.3 18l.3 3h4.8l.3-3a8.3 8.3 0 001.7-1.1l2.5 1 2-3.4-2-1.5c.1-.3.1-.7.1-1z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    appearance: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 000 16z"/>',
    language: '<path d="M4 5h10M9 5c-.2 5-2.3 8.3-5 10M6 9c1.8 2.8 4 4.8 7 6M14 10h6M17 7v10M14 17h6"/>',
    intelligence: '<path d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v6a2.5 2.5 0 0 1-2.5 2.5H11l-4 3v-3.2A2.5 2.5 0 0 1 5 13.5z"/><path d="M9 9.5h6M9 12.5h4"/>',
    admin: '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M8 9h8M8 13h5M16 13h.01"/>',
    wishes: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M12 7v6M9.5 10h5"/>'
  };
  return '<span class="dashboard-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + (icons[name] || icons.info) + '</svg></span>';
}

export function dashboardContent(zh, options = {}) {
  const prefix = zh ? "/zh-cn" : "/en";
  const productLinks = options && typeof options === "object" ? options : {};
  const gptHref = String(productLinks.gptHref || "");
  const adminHref = String(productLinks.adminHref || "");

  const primaryRows = zh ? [
    ...(gptHref ? [["AERTEX Intelligence","intelligence","tone-blue",gptHref,"GPT"]] : []),
    ...(adminHref ? [["管理员控制台","admin","tone-gray",adminHref,"Admin"]] : []),
    ["工作台","workbench","tone-indigo",`${prefix}/workspace/workbench`,""],
    ["AERTEX Drive","storage","tone-cyan",`${prefix}/settings/storage`,""]
  ] : [
    ...(gptHref ? [["AERTEX Intelligence","intelligence","tone-blue",gptHref,"GPT"]] : []),
    ...(adminHref ? [["Admin Console","admin","tone-gray",adminHref,"Admin"]] : []),
    ["Workbench","workbench","tone-indigo",`${prefix}/workspace/workbench`,""],
    ["AERTEX Drive","storage","tone-cyan",`${prefix}/settings/storage`,""]
  ];

  const accountRows = zh ? [
    ["用户资料","profile","tone-teal",`${prefix}/profile/details`,""],
    ["收藏链接","links","tone-green",`${prefix}/info/links`,""],
    ["账户与安全","security","tone-red",`${prefix}/settings/security`,""],
    ["设置","settings","tone-gray",`${prefix}/settings`,""]
  ] : [
    ["Profile","profile","tone-teal",`${prefix}/profile/details`,""],
    ["Saved Links","links","tone-green",`${prefix}/info/links`,""],
    ["Account & Security","security","tone-red",`${prefix}/settings/security`,""],
    ["Settings","settings","tone-gray",`${prefix}/settings`,""]
  ];

  const moreRows = zh ? [
    ["祝福链接","wishes","tone-orange",`${prefix}/wishes`,"生日 · 中秋"],
    ["信息中心","info","tone-blue",`${prefix}/info`,""]
  ] : [
    ["Wish Links","wishes","tone-orange",`${prefix}/wishes`,"Birthday · Mid-Autumn"],
    ["Information","info","tone-blue",`${prefix}/info`,""]
  ];

  const row = item => {
    const detail = item[4] ? "<small>" + item[4] + "</small>" : "";
    return `<a class="dashboard-setting-row ${item[2]}" href="${item[3]}">${dashboardIcon(item[1])}<span class="dashboard-setting-label"><strong>${item[0]}</strong>${detail}</span><b aria-hidden="true">›</b></a>`;
  };
  const group = (label, items) => `<section class="dashboard-settings-section"><div class="dashboard-settings-caption">${label}</div><div class="dashboard-settings-group">${items.map(row).join("")}</div></section>`;

  return `
    <div class="dashboard-settings-shell">
      <a class="dashboard-account-card" href="${prefix}/profile/details">
        <span class="dashboard-account-avatar"><img src="/favicon.svg?v=aertex-20260924-3" alt=""></span>
        <span class="dashboard-account-copy">
          <strong id="dashboard-account-name">${zh ? "AERTEX 用户" : "AERTEX User"}</strong>
          <small>${zh ? "AERTEX 账户 · 个人工作空间" : "AERTEX Account · Personal Workspace"}</small>
        </span>
        <b aria-hidden="true">›</b>
      </a>

      ${group(zh ? "常用" : "Common", primaryRows)}
      ${group(zh ? "账户与内容" : "Account & Content", accountRows)}
      ${group(zh ? "更多" : "More", moreRows)}
    </div>

    <script>
      (() => {
        const source = document.getElementById("os-user-name");
        const target = document.getElementById("dashboard-account-name");
        if (!target) return;
        const fallback = ${JSON.stringify(zh ? "AERTEX 用户" : "AERTEX User")};
        const paint = () => {
          const value = String(source?.textContent || "").trim();
          target.textContent = value || fallback;
        };
        paint();
        if (source) new MutationObserver(paint).observe(source, { childList: true, characterData: true, subtree: true });
      })();
    <\/script>
  `;
}
