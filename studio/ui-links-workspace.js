import { curatedLinksContent } from "./curated-links.js";

export function linksWorkspaceContent(zh) {
  const copy = zh ? {
    createEyebrow: "账号链接",
    createTitle: "新建收藏链接",
    createIntro: "把你自己的常用网站加入链接库。普通用户只能看到自己创建的内容，管理员可以查看所有用户创建的私人链接。",
    add: "新增链接",
    curatedEyebrow: "公共链接库",
    curatedTitle: "精选链接",
    curatedIntro: "系统精选、历史对话中使用过的项目、工具、服务和官方资料都收在这里。",
    privateEyebrow: "私人链接库",
    mine: "我的链接",
    admin: "用户创建的链接",
    mineHint: "这些链接只对当前账号和管理员可见。",
    adminHint: "管理员视图：这里显示所有用户创建的私人链接，并标明创建账号。",
    loading: "正在读取账号链接…",
    empty: "还没有私人链接，使用上方“新增链接”创建第一条。",
    loadError: "账号链接暂时无法读取。",
    dialogTitle: "新建收藏链接",
    dialogIntro: "保存后会与当前账号关联，并写入 R2 隐藏系统目录。",
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
    createError: "创建失败，请检查链接地址后重试。",
    owner: "创建者",
    me: "我创建的"
  } : {
    createEyebrow: "Account links",
    createTitle: "Create a saved link",
    createIntro: "Add your own frequently used sites. Regular users can see only their own private links; administrators can see all user-created private links.",
    add: "Add link",
    curatedEyebrow: "Public library",
    curatedTitle: "Curated links",
    curatedIntro: "System picks, projects used in prior chats, tools, services, and official references are collected here.",
    privateEyebrow: "Private library",
    mine: "My links",
    admin: "User-created links",
    mineHint: "These links are visible only to this account and administrators.",
    adminHint: "Administrator view: all user-created private links are shown with their creator.",
    loading: "Loading account links…",
    empty: "No private links yet. Use Add link above to create the first one.",
    loadError: "Account links are temporarily unavailable.",
    dialogTitle: "Create saved link",
    dialogIntro: "The link will be associated with the current account and stored in the hidden R2 system area.",
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
    createError: "Could not create the link. Check the URL and try again.",
    owner: "Created by",
    me: "Created by me"
  };

  return `
    <style>
      .links-workspace{display:grid;gap:18px;min-width:0}
      .links-create-panel,.links-curated-panel,.links-private-panel{border:1px solid var(--border);border-radius:22px;background:var(--card)}
      .links-create-panel{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:22px 24px}
      .links-panel-copy{min-width:0}.links-panel-copy small{display:block;color:var(--muted);font-size:11px;font-weight:650;letter-spacing:.02em}.links-panel-copy h2{margin:4px 0 6px;font-size:24px;letter-spacing:-.035em}.links-panel-copy p{max-width:780px;margin:0;color:var(--muted);font-size:12.5px;line-height:1.55}
      .links-add-button{width:auto!important;min-width:max-content!important;height:46px!important;min-height:46px!important;margin:0!important;padding:0 18px!important;border:0!important;border-radius:13px!important;background:var(--primary)!important;color:#fff!important;font-size:14px!important;font-weight:700!important;box-shadow:none!important;transition:transform 100ms ease-out,filter .12s ease!important}.links-add-button:hover{filter:brightness(1.04)}.links-add-button:active{transform:scale(.97)!important}.links-add-button:disabled{opacity:.5}
      .links-curated-panel{overflow:hidden;padding:0}.links-curated-panel-head,.links-private-panel-head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;padding:22px 24px;border-bottom:1px solid var(--hairline)}
      .links-curated-panel-body{padding:18px}.links-curated-panel .curated-links-shell{gap:12px}.links-curated-panel .curated-links-note{margin-bottom:0}
      .links-private-panel{padding:0;overflow:hidden}.links-private-panel-head{align-items:center}.links-private-title{display:flex;align-items:baseline;gap:9px}.links-private-title h2{margin:4px 0 0;font-size:22px;letter-spacing:-.03em}.links-private-count{display:grid;place-items:center;min-width:28px;height:24px;padding:0 8px;border-radius:999px;background:var(--fill);color:var(--muted);font-size:11px;font-weight:700}
      .links-private-body{padding:18px}.links-private-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.links-private-empty{display:grid;place-items:center;min-height:140px;padding:24px;border-radius:16px;background:var(--fill);color:var(--muted);font-size:12px;text-align:center}.links-private-empty[hidden]{display:none}
      .links-private-grid .curated-link-card{min-height:150px}.links-private-owner::before{content:'•';margin-right:5px;color:var(--primary)}
      .links-dialog-backdrop{position:fixed;z-index:160;inset:0;display:none;place-items:center;padding:24px;background:rgba(0,0,0,.24);backdrop-filter:blur(8px)}.links-dialog-backdrop.is-open{display:grid}.links-dialog{width:min(620px,100%);max-height:calc(100vh - 48px);overflow:auto;padding:20px;border:1px solid var(--border);border-radius:20px;background:var(--surface);box-shadow:0 24px 70px rgba(0,0,0,.18)}
      .links-dialog-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.links-dialog-head h2{margin:0;font-size:23px;letter-spacing:-.03em}.links-dialog-head p{margin:6px 0 0;color:var(--muted);font-size:12px;line-height:1.5}.links-dialog-close{display:grid;place-items:center;width:34px!important;min-width:34px!important;height:34px!important;min-height:34px!important;margin:0!important;padding:0!important;border:0!important;border-radius:50%!important;background:var(--fill)!important;color:var(--text)!important;font-size:19px!important}
      .links-form{display:grid;gap:12px;margin-top:18px}.links-form-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.links-form-field{display:grid;gap:6px}.links-form-field span{color:var(--muted);font-size:11px;font-weight:650}.links-form-field input,.links-form-field select,.links-form-field textarea{width:100%;margin:0;border:0;border-radius:12px;background:var(--fill);box-shadow:inset 0 0 0 1px var(--border);color:var(--text)}.links-form-field input,.links-form-field select{height:44px;min-height:44px;padding:0 12px}.links-form-field textarea{min-height:110px;padding:12px;resize:vertical;line-height:1.5}.links-form-status{min-height:18px;color:var(--muted);font-size:11px}.links-form-status.is-error{color:var(--danger)}.links-form-actions{display:flex;justify-content:flex-end;gap:8px}.links-form-actions button{width:auto!important;min-width:88px!important;height:40px!important;min-height:40px!important;margin:0!important;padding:0 14px!important;border-radius:11px!important}.links-form-cancel{background:var(--fill)!important;color:var(--text)!important}.links-form-submit{background:var(--primary)!important;color:#fff!important}
      @media(max-width:960px){.links-private-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:700px){.links-workspace{gap:14px}.links-create-panel{align-items:flex-start;flex-direction:column;padding:18px}.links-add-button{width:100%!important}.links-curated-panel-head,.links-private-panel-head{align-items:flex-start;flex-direction:column;padding:18px}.links-curated-panel-body,.links-private-body{padding:12px}.links-private-grid,.links-form-row{grid-template-columns:1fr}}
    </style>

    <div class="links-workspace">
      <section class="links-create-panel">
        <div class="links-panel-copy">
          <small>${copy.createEyebrow}</small>
          <h2>${copy.createTitle}</h2>
          <p>${copy.createIntro}</p>
        </div>
        <button class="links-add-button" id="links-add-button" type="button">＋ ${copy.add}</button>
      </section>

      <section class="links-curated-panel">
        <header class="links-curated-panel-head">
          <div class="links-panel-copy">
            <small>${copy.curatedEyebrow}</small>
            <h2>${copy.curatedTitle}</h2>
            <p>${copy.curatedIntro}</p>
          </div>
        </header>
        <div class="links-curated-panel-body">
          ${curatedLinksContent(zh)}
        </div>
      </section>

      <section class="links-private-panel">
        <header class="links-private-panel-head">
          <div class="links-panel-copy">
            <small>${copy.privateEyebrow}</small>
            <div class="links-private-title"><h2 id="links-private-title">${copy.mine}</h2><span class="links-private-count" id="links-private-count">0</span></div>
            <p id="links-private-hint">${copy.mineHint}</p>
          </div>
        </header>
        <div class="links-private-body">
          <div class="links-private-grid" id="links-private-grid"></div>
          <div class="links-private-empty" id="links-private-empty">${copy.loading}</div>
        </div>
      </section>
    </div>

    <div class="links-dialog-backdrop" id="links-create-dialog" aria-hidden="true">
      <section class="links-dialog" role="dialog" aria-modal="true" aria-labelledby="links-create-dialog-title">
        <div class="links-dialog-head">
          <div><h2 id="links-create-dialog-title">${copy.dialogTitle}</h2><p>${copy.dialogIntro}</p></div>
          <button class="links-dialog-close" id="links-dialog-close" type="button" aria-label="${copy.cancel}">×</button>
        </div>
        <form class="links-form" id="links-create-form">
          <div class="links-form-row">
            <label class="links-form-field"><span>${copy.name}</span><input id="links-name" maxlength="180" required placeholder="${copy.namePlaceholder}"></label>
            <label class="links-form-field"><span>${copy.url}</span><input id="links-url" maxlength="2048" inputmode="url" required placeholder="${copy.urlPlaceholder}"></label>
          </div>
          <label class="links-form-field"><span>${copy.category}</span><select id="links-category"></select></label>
          <label class="links-form-field"><span>${copy.description}</span><textarea id="links-description" maxlength="1200" placeholder="${copy.descriptionPlaceholder}"></textarea></label>
          <div class="links-form-status" id="links-form-status" aria-live="polite"></div>
          <div class="links-form-actions"><button class="links-form-cancel" id="links-form-cancel" type="button">${copy.cancel}</button><button class="links-form-submit" id="links-form-submit" type="submit">${copy.create}</button></div>
        </form>
      </section>
    </div>

    <script>
      (() => {
        const addButton = document.getElementById('links-add-button');
        const privateTitle = document.getElementById('links-private-title');
        const privateHint = document.getElementById('links-private-hint');
        const privateCount = document.getElementById('links-private-count');
        const privateGrid = document.getElementById('links-private-grid');
        const privateEmpty = document.getElementById('links-private-empty');
        const dialog = document.getElementById('links-create-dialog');
        const form = document.getElementById('links-create-form');
        const closeButton = document.getElementById('links-dialog-close');
        const cancelButton = document.getElementById('links-form-cancel');
        const nameInput = document.getElementById('links-name');
        const urlInput = document.getElementById('links-url');
        const categoryInput = document.getElementById('links-category');
        const descriptionInput = document.getElementById('links-description');
        const formStatus = document.getElementById('links-form-status');
        const submitButton = document.getElementById('links-form-submit');
        const curatedCategory = document.getElementById('curated-link-category');
        let session = null;
        let isAdmin = false;

        if (curatedCategory && categoryInput) {
          Array.from(curatedCategory.options).filter(option => option.value !== 'all').forEach(option => categoryInput.append(option.cloneNode(true)));
        }
        if (!categoryInput.options.length) {
          const fallback = document.createElement('option');
          fallback.value = 'tools';
          fallback.textContent = ${JSON.stringify(zh ? "开发工具" : "Tools")};
          categoryInput.append(fallback);
        }

        function esc(value) { return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
        function authHeaders() { return session?.access_token ? { Authorization: 'Bearer ' + session.access_token } : {}; }
        function normalizeUrl(value) { const raw = String(value || '').trim(); if (!raw) return ''; return /^https?:\/\//i.test(raw) ? raw : 'https://' + raw; }
        function hostname(value) { try { return new URL(value).hostname.replace(/^www\./, ''); } catch { return 'external'; } }
        function openDialog() { if (!session) return; form.reset(); formStatus.textContent=''; formStatus.classList.remove('is-error'); if (categoryInput.options.length) categoryInput.selectedIndex=0; dialog.classList.add('is-open'); dialog.setAttribute('aria-hidden','false'); document.documentElement.style.overflow='hidden'; setTimeout(() => nameInput.focus(), 0); }
        function closeDialog() { dialog.classList.remove('is-open'); dialog.setAttribute('aria-hidden','true'); document.documentElement.style.overflow=''; }

        function renderPrivateLinks(links) {
          privateGrid.innerHTML = '';
          for (const link of links) {
            const card = document.createElement('a');
            card.className = 'curated-link-card';
            card.href = link.url;
            card.target = '_blank';
            card.rel = 'noopener noreferrer';
            const ownerText = link.is_own ? ${JSON.stringify(copy.me)} + ' · ' + (link.owner_label || '') : ${JSON.stringify(copy.owner)} + ' ' + (link.owner_label || '');
            card.innerHTML = '<div class="curated-link-card-top"><strong>' + esc(link.title) + '</strong><span aria-hidden="true">↗</span></div><p>' + esc(link.description || '') + '</p><div class="curated-link-meta"><span class="links-private-owner">' + esc(ownerText) + '</span><code>' + esc(hostname(link.url)) + '</code></div>';
            privateGrid.append(card);
          }
          privateTitle.textContent = isAdmin ? ${JSON.stringify(copy.admin)} : ${JSON.stringify(copy.mine)};
          privateHint.textContent = isAdmin ? ${JSON.stringify(copy.adminHint)} : ${JSON.stringify(copy.mineHint)};
          privateCount.textContent = String(links.length);
          privateEmpty.textContent = ${JSON.stringify(copy.empty)};
          privateEmpty.hidden = links.length > 0;
        }

        async function loadPrivateLinks() {
          if (!session) {
            addButton.disabled = true;
            privateEmpty.hidden = false;
            privateEmpty.textContent = ${JSON.stringify(copy.loading)};
            return;
          }
          addButton.disabled = false;
          try {
            const response = await fetch('/api/user-links', { headers: { ...authHeaders(), Accept:'application/json' }, cache:'no-store' });
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const payload = await response.json();
            isAdmin = payload.is_admin === true;
            renderPrivateLinks(Array.isArray(payload.links) ? payload.links : []);
          } catch (error) {
            console.error('Private links load failed', error);
            privateGrid.innerHTML = '';
            privateCount.textContent = '0';
            privateEmpty.hidden = false;
            privateEmpty.textContent = ${JSON.stringify(copy.loadError)};
          }
        }

        async function createLink(event) {
          event.preventDefault();
          if (!session) return;
          submitButton.disabled = true;
          submitButton.textContent = ${JSON.stringify(copy.creating)};
          formStatus.textContent = '';
          formStatus.classList.remove('is-error');
          try {
            const response = await fetch('/api/user-links', {
              method:'POST',
              headers:{ ...authHeaders(), 'Content-Type':'application/json', Accept:'application/json' },
              body:JSON.stringify({ title:nameInput.value, url:normalizeUrl(urlInput.value), category:categoryInput.value || 'tools', description:descriptionInput.value })
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(payload.error || ('HTTP ' + response.status));
            closeDialog();
            await loadPrivateLinks();
          } catch (error) {
            console.error('Private link creation failed', error);
            formStatus.textContent = ${JSON.stringify(copy.createError)};
            formStatus.classList.add('is-error');
          } finally {
            submitButton.disabled = false;
            submitButton.textContent = ${JSON.stringify(copy.create)};
          }
        }

        addButton?.addEventListener('click', openDialog);
        closeButton?.addEventListener('click', closeDialog);
        cancelButton?.addEventListener('click', closeDialog);
        dialog?.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });
        form?.addEventListener('submit', createLink);
        document.addEventListener('keydown', event => { if (event.key === 'Escape' && dialog.classList.contains('is-open')) closeDialog(); });

        async function init() {
          try {
            if (typeof supabaseClient === 'undefined') throw new Error('Supabase unavailable');
            const result = await supabaseClient.auth.getSession();
            session = result?.data?.session || null;
            await loadPrivateLinks();
            supabaseClient.auth.onAuthStateChange(async (_event, nextSession) => { session = nextSession || null; await loadPrivateLinks(); });
          } catch (error) {
            console.error('Private links session init failed', error);
            addButton.disabled = true;
            privateEmpty.textContent = ${JSON.stringify(copy.loadError)};
          }
        }

        if (document.readyState === 'complete') init(); else window.addEventListener('load', init, { once:true });
      })();
    </script>
  `;
}
