const STATUS_COPY = {
  "通知": ["通知尚未开放", "通知服务还没接入。"],
  "Notifications": ["Notifications aren’t available yet", "Notification delivery is not connected yet."],
  "AI 设置": ["AI 设置尚未开放", "用户级 AI 配置还没开放。"],
  "AI Settings": ["AI settings aren’t available yet", "User-level AI configuration is not available yet."],
  "第三方集成": ["第三方集成尚未开放", "用户级集成配置还没开放。"],
  "Integrations": ["Integrations aren’t available yet", "User-level integrations are not available yet."]
};

export function statusContent(zh, zhTitle, zhBody, enTitle, enBody) {
  const requestedTitle = zh ? zhTitle : enTitle;
  const fallbackBody = zh ? zhBody : enBody;
  const normalized = STATUS_COPY[requestedTitle];
  const title = normalized?.[0] || requestedTitle;
  const body = normalized?.[1] || fallbackBody;
  return `
    <section class="os-card is-large status-panel" role="status">
      <small>${zh ? "状态" : "Status"}</small>
      <h2>${title}</h2>
      <p>${body}</p>
    </section>`;
}

export function osHubIcon(name) {
  const icons = {
    profile: '<circle cx="12" cy="8" r="3.1"/><path d="M5.5 19c.9-3.2 3.2-5 6.5-5s5.6 1.8 6.5 5"/>',
    account: '<rect x="4" y="5" width="16" height="14" rx="3"/><path d="M8 9h8M8 13h5"/>',
    preferences: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9M8 4v6M16 14v6"/>',
    links: '<path d="M9.5 14.5l5-5M7.2 16.8l-1.3 1.3a3.2 3.2 0 01-4.5-4.5l3.4-3.4a3.2 3.2 0 014.5 0M16.8 7.2l1.3-1.3a3.2 3.2 0 014.5 4.5l-3.4 3.4a3.2 3.2 0 01-4.5 0"/>',
    storage: '<path d="M4 7.5C4 5.6 7.6 4 12 4s8 1.6 8 3.5S16.4 11 12 11 4 9.4 4 7.5z"/><path d="M4 7.5v4C4 13.4 7.6 15 12 15s8-1.6 8-3.5v-4M4 11.5v4C4 17.4 7.6 19 12 19s8-1.6 8-3.5v-4"/>',
    shield: '<path d="M12 3l7 3v5c0 4.4-2.6 7.8-7 10-4.4-2.2-7-5.6-7-10V6l7-3z"/><path d="M9.3 12l1.8 1.8 3.7-4"/>',
    general: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
    users: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.2"/><path d="M3.5 19c.7-3.4 2.7-5 5.5-5s4.8 1.6 5.5 5M14 15c2.8-.2 4.8 1.1 5.8 4"/>',
    roles: '<path d="M4 6h16v12H4z"/><path d="M8 10h8M8 14h5"/>',
    logs: '<path d="M6 4h12v16H6z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    system: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.8 1.8"/>',
    appearance: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 000 16z"/>',
    language: '<path d="M4 5h10M9 5c-.2 5-2.3 8.3-5 10M6 9c1.8 2.8 4 4.8 7 6M14 10h6M17 7v10M14 17h6"/>',
    notifications: '<path d="M6 16h12l-1.5-2V10a4.5 4.5 0 00-9 0v4L6 16z"/><path d="M10 19h4"/>',
    ai: '<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3zM18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15z"/>',
    integrations: '<path d="M8 8V5a3 3 0 016 0v3M16 16v3a3 3 0 01-6 0v-3M7 12h10"/>'
  };
  const body = icons[name] || icons.general;
  return `<span class="os-hub-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg></span>`;
}

export function osHubCard(item) {
  const classes = ["os-hub-card"];
  if (item.featured) classes.push("is-featured");
  if (item.tone) classes.push("tone-" + item.tone);
  return `<a class="${classes.join(" ")}" href="${item.href}">
    <div class="os-hub-card-top">
      ${osHubIcon(item.icon)}
      <span class="os-hub-arrow" aria-hidden="true">›</span>
    </div>
    <div class="os-hub-card-copy">
      <div class="os-hub-card-title-row">
        <h2>${item.title}</h2>
        ${item.meta ? `<small>${item.meta}</small>` : ""}
      </div>
      ${item.description ? `<p>${item.description}</p>` : ""}
    </div>
  </a>`;
}

export function osHubGrid(items, extraClass = "") {
  return `<section class="os-hub-grid ${extraClass}">${items.map(osHubCard).join("")}</section>`;
}
