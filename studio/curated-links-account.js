export function curatedLinksAccountContent(zh) {
  const copy = zh ? {
    add: "新增链接",
    title: "新建收藏链接",
    intro: "你创建的链接只对当前账号和管理员可见，其他普通用户无法读取。",
    name: "名称",
    namePlaceholder: "例如：OpenAI API 文档",
    url: "链接地址",
    urlPlaceholder: "https://example.com",
    category: "分类",
    description: "说明",
    descriptionPlaceholder: "简单写一下这个链接是什么、为什么值得保存。",
    cancel: "取消",
    create: "创建链接",
    creating: "正在创建…",
    mine: "我的链接",
    admin: "用户创建的链接",
    mineHint: "只有你和管理员可以看到这些内容。",
    adminHint: "管理员视图：这里显示所有用户创建的私人链接。",
    empty: "还没有账号私人链接",
    owner: "创建者",
    me: "我创建的",
    login: "正在读取账号…",
    error: "账号链接暂时无法读取",
    createError: "创建失败，请检查链接地址后重试。"
  } : {
    add: "Add link",
    title: "Create saved link",
    intro: "Links you create are visible only to your account and administrators. Other regular users cannot read them.",
    name: "Name",
    namePlaceholder: "For example: OpenAI API docs",
    url: "URL",
    urlPlaceholder: "https://example.com",
    category: "Category",
    description: "Description",
    descriptionPlaceholder: "Briefly describe what this link is and why it is useful.",
    cancel: "Cancel",
    create: "Create link",
    creating: "Creating…",
    mine: "My links",
    admin: "User-created links",
    mineHint: "Only you and administrators can see these links.",
    adminHint: "Administrator view: all private links created by users.",
    empty: "No private account links yet",
    owner: "Created by",
    me: "Created by me",
    login: "Loading account…",
    error: "Account links are temporarily unavailable",
    createError: "Could not create the link. Check the URL and try again."
  };

  return `
    <style>
      .account-links-action{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 14px;border-radius:16px;background:var(--fill)}
      .account-links-action-copy{display:grid;gap:2px}.account-links-action-copy strong{font-size:13px}.account-links-action-copy span{color:var(--muted);font-size:11px}
      .account-links-add{width:auto!important;min-width:max-content!important;height:42px!important;min-height:42px!important;margin:0!important;padding:0 15px!important;border:0!important;border-radius:11px!important;background:var(--primary)!important;color:#fff!important;font-size:13px!important;font-weight:680!important;box-shadow:none!important;transition:transform 100ms ease-out,filter .12s ease!important}.account-links-add:hover{filter:brightness(1.04)}.account-links-add:active{transform:scale(.97)!important}.account-links-add:disabled{opacity:.5}
      .account-links-section{display:none;padding:18px;border:1px solid var(--border);border-radius:18px;background:var(--card)}.account-links-section.is-visible{display:block}.account-links-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:12px}.account-links-head h2{margin:0;font-size:20px;letter-spacing:-.025em}.account-links-head p{margin:0;color:var(--muted);font-size:11px}.account-links-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.account-links-empty{display:grid;place-items:center;min-height:100px;border-radius:14px;background:var(--fill);color:var(--muted);font-size:12px}.account-link-owner::before{content:'•';margin-right:5px;color:var(--primary)}
      .account-link-dialog-backdrop{position:fixed;z-index:140;inset:0;display:none;place-items:center;padding:24px;background:rgba(0,0,0,.24);backdrop-filter:blur(8px)}.account-link-dialog-backdrop.is-open{display:grid}.account-link-dialog{width:min(620px,100%);max-height:calc(100vh - 48px);overflow:auto;padding:20px;border:1px solid var(--border);border-radius:20px;background:var(--surface);box-shadow:0 24px 70px rgba(0,0,0,.18)}
      .account-link-dialog-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.account-link-dialog-head h2{margin:0;font-size:23px;letter-spacing:-.03em}.account-link-dialog-head p{margin:6px 0 0;color:var(--muted);font-size:12px;line-height:1.5}.account-link-close{display:grid;place-items:center;width:34px!important;min-width:34px!important;height:34px!important;min-height:34px!important;margin:0!important;padding:0!important;border:0!important;border-radius:50%!important;background:var(--fill)!important;color:var(--text)!important;font-size:19px!important}
      .account-link-form{display:grid;gap:12px;margin-top:18px}.account-link-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.account-link-field{display:grid;gap:6px}.account-link-field span{color:var(--muted);font-size:11px;font-weight:650}.account-link-field input,.account-link-field select,.account-link-field textarea{width:100%;margin:0;border:0;border-radius:12px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border);color:var(--text)}.account-link-field input,.account-link-field select{height:44px;min-height:44px;padding:0 12px}.account-link-field textarea{min-height:110px;padding:12px;resize:vertical;line-height:1.5}.account-link-status{min-height:18px;color:var(--muted);font-size:11px}.account-link-status.is-error{color:var(--danger)}.account-link-actions{display:flex;justify-content:flex-end;gap:8px}.account-link-actions button{width:auto!important;min-width:88px!important;height:40px!important;min-height:40px!important;margin:0!important;padding:0 14px!important;border-radius:11px!important}.account-link-cancel{background:var(--fill)!important;color:var(--text)!important}.account-link-submit{background:var(--primary)!important;color:#fff!important}
      @media(max-width:960px){.account-links-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:700px){.account-links-action{align-items:flex-start;flex-direction:column}.account-links-grid,.account-link-row{grid-template-columns:1fr}.account-links-section{padding:14px}.account-links-head{align-items:flex-start;flex-direction:column}}
    </style>

    <section class="account-links-action" id="account-links-action">
      <div class="account-links-action-copy"><strong>${zh ? "账号私人链接" : "Private account links"}</strong><span>${textEscape(copy.intro)}</span></div>
      <button class="account-links-add" id="account-links-add" type="button">＋ ${copy.add}</button>
    </section>

    <section class="account-links-section" id="account-links-section">
      <div class="account-links-head"><div><h2 id="account-links-title">${copy.mine}</h2><p id="account-links-hint">${copy.mineHint}</p></div><strong id="account-links-count">0</strong></div>
      <div class="account-links-grid" id="account-links-grid"></div>
      <div class="account-links-empty" id="account-links-empty">${copy.login}</div>
    </section>

    <div class="account-link-dialog-backdrop" id="account-link-dialog" aria-hidden="true">
      <section class="account-link-dialog" role="dialog" aria-modal="true" aria-labelledby="account-link-dialog-title">
        <div class="account-link-dialog-head"><div><h2 id="account-link-dialog-title">${copy.title}</h2><p>${copy.intro}</p></div><button class="account-link-close" id="account-link-close" type="button" aria-label="${copy.cancel}">×</button></div>
        <form class="account-link-form" id="account-link-form">
          <div class="account-link-row">
            <label class="account-link-field"><span>${copy.name}</span><input id="account-link-name" maxlength="180" required placeholder="${copy.namePlaceholder}"></label>
            <label class="account-link-field"><span>${copy.url}</span><input id="account-link-url" maxlength="2048" inputmode="url" required placeholder="${copy.urlPlaceholder}"></label>
          </div>
          <label class="account-link-field"><span>${copy.category}</span><select id="account-link-category"></select></label>
          <label class="account-link-field"><span>${copy.description}</span><textarea id="account-link-description" maxlength="1200" placeholder="${copy.descriptionPlaceholder}"></textarea></label>
          <div class="account-link-status" id="account-link-status" aria-live="polite"></div>
          <div class="account-link-actions"><button class="account-link-cancel" id="account-link-cancel" type="button">${copy.cancel}</button><button class="account-link-submit" id="account-link-submit" type="submit">${copy.create}</button></div>
        </form>
      </section>
    </div>

    <script>
      (() => {
        const add = document.getElementById('account-links-add');
        const action = document.getElementById('account-links-action');
        const section = document.getElementById('account-links-section');
        const title = document.getElementById('account-links-title');
        const hint = document.getElementById('account-links-hint');
        const count = document.getElementById('account-links-count');
        const grid = document.getElementById('account-links-grid');
        const empty = document.getElementById('account-links-empty');
        const dialog = document.getElementById('account-link-dialog');
        const form = document.getElementById('account-link-form');
        const close = document.getElementById('account-link-close');
        const cancel = document.getElementById('account-link-cancel');
        const nameInput = document.getElementById('account-link-name');
        const urlInput = document.getElementById('account-link-url');
        const categoryInput = document.getElementById('account-link-category');
        const descriptionInput = document.getElementById('account-link-description');
        const status = document.getElementById('account-link-status');
        const submit = document.getElementById('account-link-submit');
        const overview = document.querySelector('[data-curated-links-root] .curated-links-overview');
        const stats = overview?.querySelector('.curated-links-stats');
        const categoryFilter = document.getElementById('curated-link-category');
        let session = null;
        let isAdmin = false;

        if (overview && action) {
          action.style.display = 'contents';
          if (stats) stats.before(add);
          action.querySelector('.account-links-action-copy')?.remove();
        }

        if (categoryFilter && categoryInput) {
          Array.from(categoryFilter.options).filter(option => option.value !== 'all').forEach(option => categoryInput.append(option.cloneNode(true)));
        }

        function esc(value) { return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
        function authHeaders() { return session?.access_token ? { Authorization: 'Bearer ' + session.access_token } : {}; }
        function normalizeUrl(value) { const raw = String(value || '').trim(); if (!raw) return ''; return /^https?:\/\//i.test(raw) ? raw : 'https://' + raw; }
        function hostname(value) { try { return new URL(value).hostname.replace(/^www\./, ''); } catch { return 'external'; } }
        function openDialog() { if (!session) return; form.reset(); status.textContent=''; status.classList.remove('is-error'); if (categoryInput.options.length) categoryInput.selectedIndex=0; dialog.classList.add('is-open'); dialog.setAttribute('aria-hidden','false'); document.documentElement.style.overflow='hidden'; setTimeout(() => nameInput.focus(), 0); }
        function closeDialog() { dialog.classList.remove('is-open'); dialog.setAttribute('aria-hidden','true'); document.documentElement.style.overflow=''; }

        function render(links) {
          grid.innerHTML = '';
          for (const link of links) {
            const card = document.createElement('a');
            card.className = 'curated-link-card';
            card.href = link.url;
            card.target = '_blank';
            card.rel = 'noopener noreferrer';
            const ownerText = link.is_own ? ${JSON.stringify(copy.me)} + ' · ' + (link.owner_label || '') : ${JSON.stringify(copy.owner)} + ' ' + (link.owner_label || '');
            card.innerHTML = '<div class="curated-link-card-top"><strong>' + esc(link.title) + '</strong><span aria-hidden="true">↗</span></div><p>' + esc(link.description || '') + '</p><div class="curated-link-meta"><span class="account-link-owner">' + esc(ownerText) + '</span><code>' + esc(hostname(link.url)) + '</code></div>';
            grid.append(card);
          }
          title.textContent = isAdmin ? ${JSON.stringify(copy.admin)} : ${JSON.stringify(copy.mine)};
          hint.textContent = isAdmin ? ${JSON.stringify(copy.adminHint)} : ${JSON.stringify(copy.mineHint)};
          count.textContent = String(links.length);
          empty.textContent = ${JSON.stringify(copy.empty)};
          empty.hidden = links.length > 0;
          section.classList.add('is-visible');
        }

        async function loadLinks() {
          if (!session) { add.disabled = true; section.classList.remove('is-visible'); return; }
          add.disabled = false;
          try {
            const response = await fetch('/api/user-links', { headers: { ...authHeaders(), Accept: 'application/json' }, cache: 'no-store' });
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const payload = await response.json();
            isAdmin = payload.is_admin === true;
            render(Array.isArray(payload.links) ? payload.links : []);
          } catch (error) {
            console.error('Account links load failed', error);
            section.classList.add('is-visible');
            empty.hidden = false;
            empty.textContent = ${JSON.stringify(copy.error)};
          }
        }

        async function createLink(event) {
          event.preventDefault();
          if (!session) return;
          submit.disabled = true;
          submit.textContent = ${JSON.stringify(copy.creating)};
          status.textContent = '';
          status.classList.remove('is-error');
          try {
            const response = await fetch('/api/user-links', {
              method: 'POST',
              headers: { ...authHeaders(), 'Content-Type':'application/json', Accept:'application/json' },
              body: JSON.stringify({ title:nameInput.value, url:normalizeUrl(urlInput.value), category:categoryInput.value || 'tools', description:descriptionInput.value })
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(payload.error || ('HTTP ' + response.status));
            closeDialog();
            await loadLinks();
          } catch (error) {
            console.error('Account link creation failed', error);
            status.textContent = ${JSON.stringify(copy.createError)};
            status.classList.add('is-error');
          } finally {
            submit.disabled = false;
            submit.textContent = ${JSON.stringify(copy.create)};
          }
        }

        add?.addEventListener('click', openDialog);
        close?.addEventListener('click', closeDialog);
        cancel?.addEventListener('click', closeDialog);
        dialog?.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });
        form?.addEventListener('submit', createLink);
        document.addEventListener('keydown', event => { if (event.key === 'Escape' && dialog.classList.contains('is-open')) closeDialog(); });

        async function init() {
          try {
            if (typeof supabaseClient === 'undefined') throw new Error('Supabase unavailable');
            const result = await supabaseClient.auth.getSession();
            session = result?.data?.session || null;
            await loadLinks();
            supabaseClient.auth.onAuthStateChange(async (_event, nextSession) => { session = nextSession || null; await loadLinks(); });
          } catch (error) {
            console.error('Account links initialization failed', error);
            add.disabled = true;
          }
        }
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true }); else void init();
      })();
    </script>
  `;
}

function textEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
