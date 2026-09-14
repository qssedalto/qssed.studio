import { curatedLinksContent } from "./curated-links.js";
import { curatedLinksFavoritesEnhancer } from "./curated-links-favorites.js";

function localePrefix(zh) {
  return zh ? "/zh-cn" : "/en";
}

function sharedStyles() {
  return `
    <style>
      .links-hub{display:grid;gap:16px;min-width:0}
      .links-create-card,.links-route-card,.links-detail-shell{border:1px solid var(--border);border-radius:22px;background:var(--card)}
      .links-create-card{padding:24px}
      .links-card-eyebrow{display:block;color:var(--muted);font-size:11px;font-weight:680;letter-spacing:.02em}
      .links-create-card h2,.links-route-card h2,.links-detail-head h2{margin:5px 0 7px;font-size:25px;letter-spacing:-.035em}
      .links-create-card p,.links-route-card p,.links-detail-head p{max-width:860px;margin:0;color:var(--muted);font-size:13px;line-height:1.55}
      .links-quick-form{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;margin-top:18px;max-width:980px}
      .links-quick-input{width:100%;height:48px;min-height:48px;margin:0!important;padding:0 14px!important;border:0!important;border-radius:13px!important;background:var(--fill)!important;color:var(--text)!important;box-shadow:inset 0 0 0 1px var(--border)!important;font-size:14px!important}
      .links-quick-input:focus{box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 14%,transparent),inset 0 0 0 1px var(--primary)!important}
      .links-quick-submit{width:auto!important;min-width:128px!important;height:48px!important;min-height:48px!important;margin:0!important;padding:0 18px!important;border:0!important;border-radius:13px!important;background:var(--primary)!important;color:#fff!important;font-size:14px!important;font-weight:700!important;box-shadow:none!important;transition:transform 100ms ease-out,filter .12s ease!important}
      .links-quick-submit:hover{filter:brightness(1.04)}.links-quick-submit:active{transform:scale(.98)!important}.links-quick-submit:disabled{opacity:.52}
      .links-quick-status{min-height:18px;margin-top:8px;color:var(--muted);font-size:11px}.links-quick-status.is-error{color:var(--danger)}.links-quick-status.is-success{color:var(--success,#2f8f46)}
      .links-route-card{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:20px;align-items:center;padding:24px;color:var(--text);text-decoration:none;transition:background .12s ease,transform 100ms ease-out}
      .links-route-card:hover{background:var(--fill)}.links-route-card:active{transform:scale(.995)}
      .links-route-meta{display:flex;align-items:center;gap:8px;margin-top:12px;color:var(--muted);font-size:11px}.links-route-meta strong{display:grid;place-items:center;min-width:30px;height:26px;padding:0 9px;border-radius:999px;background:var(--fill);color:var(--text);font-size:12px}
      .links-route-arrow{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:var(--fill);color:var(--primary);font-size:22px;transition:transform 100ms ease-out}.links-route-card:hover .links-route-arrow{transform:translateX(2px)}
      .links-detail-shell{padding:0;overflow:hidden}.links-detail-head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;padding:22px 24px;border-bottom:1px solid var(--hairline)}
      .links-detail-back{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 11px;border-radius:10px;background:var(--fill);color:var(--text);text-decoration:none;font-size:12px;font-weight:650}.links-detail-back:hover{background:var(--secondary)}
      .links-detail-body{padding:18px}
      .links-private-toolbar{display:flex;align-items:center;gap:10px;margin-bottom:12px}.links-private-search{width:100%;height:44px;min-height:44px;margin:0!important;padding:0 13px!important;border:0!important;border-radius:12px!important;background:var(--fill)!important;box-shadow:inset 0 0 0 1px var(--border)!important;color:var(--text)!important}
      .links-private-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.links-private-card{display:flex;min-width:0;min-height:150px;flex-direction:column;padding:14px;border:0;border-radius:14px;background:var(--fill);color:var(--text);text-decoration:none;box-shadow:inset 0 0 0 1px var(--border);transition:background .12s ease,transform 100ms ease-out}.links-private-card:hover{background:var(--secondary)}.links-private-card:active{transform:scale(.985)}
      .links-private-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.links-private-card-top strong{font-size:14px;line-height:1.3}.links-private-card-top span{color:var(--primary)}.links-private-card p{margin:8px 0 12px;color:var(--muted);font-size:12.5px;line-height:1.45}.links-private-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:auto;color:var(--quiet)}.links-private-meta span{font-size:10px}.links-private-meta code{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:10px ui-monospace,SFMono-Regular,Menlo,monospace}
      .links-private-empty{display:grid;place-items:center;min-height:180px;padding:28px;border-radius:16px;background:var(--fill);color:var(--muted);font-size:12px;text-align:center}.links-private-empty[hidden]{display:none}
      .links-curated-route .curated-links-shell{gap:14px}.links-curated-route .curated-links-note{margin-bottom:0}
      @media(max-width:980px){.links-private-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:700px){.links-hub{gap:12px}.links-create-card,.links-route-card{padding:18px}.links-quick-form{grid-template-columns:1fr}.links-quick-submit{width:100%!important}.links-route-card{grid-template-columns:minmax(0,1fr) auto}.links-detail-head{align-items:flex-start;flex-direction:column;padding:18px}.links-detail-body{padding:12px}.links-private-grid{grid-template-columns:1fr}.links-route-arrow{width:38px;height:38px}}
    </style>
  `;
}

function accountLinksScript(zh, mode) {
  const prefix = localePrefix(zh);
  const mineHref = `${prefix}/info/links/mine`;
  const strings = zh ? {
    invalid: "请输入有效的 http(s) 链接。",
    unavailable: "当前无法读取账号链接。",
    creating: "正在新建链接…",
    created: "链接已创建，正在打开“我的链接”…",
    failed: "新建失败，请稍后重试。",
    empty: "还没有私人链接。",
    adminEmpty: "目前还没有任何用户创建私人链接。",
    mineTitle: "我的链接",
    adminTitle: "用户创建的链接",
    mineHint: "只有当前账号和管理员可以看到这些链接。",
    adminHint: "管理员视图：显示所有用户创建的私人链接，并标明创建者。",
    owner: "创建者",
    me: "我创建的",
    loginRequired: "请先登录后再新建链接。"
  } : {
    invalid: "Enter a valid http(s) link.",
    unavailable: "Account links are currently unavailable.",
    creating: "Creating link…",
    created: "Link created. Opening My Links…",
    failed: "Could not create the link. Try again later.",
    empty: "No private links yet.",
    adminEmpty: "No user-created private links yet.",
    mineTitle: "My links",
    adminTitle: "User-created links",
    mineHint: "Only this account and administrators can see these links.",
    adminHint: "Administrator view: all user-created private links with their creator.",
    owner: "Created by",
    me: "Created by me",
    loginRequired: "Sign in before creating a link."
  };

  return `
    <script>
      (() => {
        const mode = ${JSON.stringify(mode)};
        const mineHref = ${JSON.stringify(mineHref)};
        let session = null;
        let isAdmin = false;
        let links = [];

        function esc(value) { return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
        function normalizeUrl(value) {
          const raw = String(value || '').trim();
          if (!raw) return '';
          const candidate = /^https?:\/\//i.test(raw) ? raw : 'https://' + raw;
          try {
            const parsed = new URL(candidate);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : '';
          } catch { return ''; }
        }
        function inferTitle(value) {
          try {
            const parsed = new URL(value);
            const host = parsed.hostname.replace(/^www\./, '');
            const parts = parsed.pathname.split('/').filter(Boolean);
            const tail = parts.length ? decodeURIComponent(parts.at(-1)).replace(/[-_]+/g, ' ').trim() : '';
            return tail ? host + ' · ' + tail.slice(0, 90) : host;
          } catch { return value.slice(0, 160); }
        }
        function hostname(value) { try { return new URL(value).hostname.replace(/^www\./, ''); } catch { return 'external'; } }
        function authHeaders() { return session?.access_token ? { Authorization: 'Bearer ' + session.access_token } : {}; }

        async function getSession() {
          if (typeof supabaseClient === 'undefined') return null;
          const result = await supabaseClient.auth.getSession();
          return result?.data?.session || null;
        }

        async function fetchLinks() {
          if (!session) return [];
          const response = await fetch('/api/user-links', { headers: { ...authHeaders(), Accept:'application/json' }, cache:'no-store' });
          if (!response.ok) throw new Error('HTTP ' + response.status);
          const payload = await response.json();
          isAdmin = payload.is_admin === true;
          links = Array.isArray(payload.links) ? payload.links : [];
          return links;
        }

        function setStatus(message, kind='') {
          const el = document.getElementById('links-quick-status');
          if (!el) return;
          el.textContent = message;
          el.classList.toggle('is-error', kind === 'error');
          el.classList.toggle('is-success', kind === 'success');
        }

        async function createQuickLink(event) {
          event.preventDefault();
          const input = document.getElementById('links-quick-url');
          const button = document.getElementById('links-quick-submit');
          if (!session) { setStatus(${JSON.stringify(strings.loginRequired)}, 'error'); return; }
          const url = normalizeUrl(input?.value || '');
          if (!url) { setStatus(${JSON.stringify(strings.invalid)}, 'error'); input?.focus(); return; }
          button.disabled = true;
          setStatus(${JSON.stringify(strings.creating)});
          try {
            const response = await fetch('/api/user-links', {
              method:'POST',
              headers:{ ...authHeaders(), 'Content-Type':'application/json', Accept:'application/json' },
              body:JSON.stringify({ title:inferTitle(url), url, category:'tools', description:'' })
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(payload.error || ('HTTP ' + response.status));
            if (input) input.value = '';
            setStatus(${JSON.stringify(strings.created)}, 'success');
            window.setTimeout(() => { window.location.href = mineHref; }, 420);
          } catch (error) {
            console.error('Quick link creation failed', error);
            setStatus(${JSON.stringify(strings.failed)}, 'error');
            button.disabled = false;
          }
        }

        function renderHubCount() {
          const count = document.getElementById('links-hub-private-count');
          const label = document.getElementById('links-hub-private-label');
          if (count) count.textContent = String(links.length);
          if (label) label.textContent = isAdmin ? ${JSON.stringify(zh ? "所有用户私人链接" : "all user private links")} : ${JSON.stringify(zh ? "当前账号私人链接" : "private links for this account")};
        }

        function renderPrivate() {
          const title = document.getElementById('links-private-page-title');
          const hint = document.getElementById('links-private-page-hint');
          const count = document.getElementById('links-private-page-count');
          const grid = document.getElementById('links-private-grid');
          const empty = document.getElementById('links-private-empty');
          const search = document.getElementById('links-private-search');
          if (!grid || !empty) return;
          if (title) title.textContent = isAdmin ? ${JSON.stringify(strings.adminTitle)} : ${JSON.stringify(strings.mineTitle)};
          if (hint) hint.textContent = isAdmin ? ${JSON.stringify(strings.adminHint)} : ${JSON.stringify(strings.mineHint)};
          if (count) count.textContent = String(links.length);

          const draw = () => {
            const query = String(search?.value || '').trim().toLocaleLowerCase();
            const visible = links.filter(link => !query || [link.title, link.description, link.url, link.owner_label].join(' ').toLocaleLowerCase().includes(query));
            grid.innerHTML = visible.map(link => {
              const ownerText = link.is_own ? ${JSON.stringify(strings.me)} + ' · ' + (link.owner_label || '') : ${JSON.stringify(strings.owner)} + ' ' + (link.owner_label || '');
              return '<a class="links-private-card" href="' + esc(link.url) + '" target="_blank" rel="noopener noreferrer"><div class="links-private-card-top"><strong>' + esc(link.title) + '</strong><span aria-hidden="true">↗</span></div><p>' + esc(link.description || link.url) + '</p><div class="links-private-meta"><span>' + esc(ownerText) + '</span><code>' + esc(hostname(link.url)) + '</code></div></a>';
            }).join('');
            empty.hidden = visible.length > 0;
            if (!visible.length) empty.textContent = links.length ? ${JSON.stringify(zh ? "没有符合搜索条件的链接。" : "No links match your search.")} : (isAdmin ? ${JSON.stringify(strings.adminEmpty)} : ${JSON.stringify(strings.empty)});
          };
          search?.addEventListener('input', draw);
          draw();
        }

        async function init() {
          try {
            session = await getSession();
            const submit = document.getElementById('links-quick-submit');
            if (submit) submit.disabled = !session;
            document.getElementById('links-quick-form')?.addEventListener('submit', createQuickLink);
            if (!session) {
              setStatus(${JSON.stringify(strings.loginRequired)}, 'error');
              if (mode === 'private') {
                const empty = document.getElementById('links-private-empty');
                if (empty) empty.textContent = ${JSON.stringify(strings.loginRequired)};
              }
              return;
            }
            await fetchLinks();
            if (mode === 'hub') renderHubCount();
            if (mode === 'private') renderPrivate();
          } catch (error) {
            console.error('Account links initialization failed', error);
            if (mode === 'hub') setStatus(${JSON.stringify(strings.unavailable)}, 'error');
            if (mode === 'private') {
              const empty = document.getElementById('links-private-empty');
              if (empty) empty.textContent = ${JSON.stringify(strings.unavailable)};
            }
          }
        }

        if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', init, { once:true });
        else window.setTimeout(init, 0);
      })();
    </script>
  `;
}

export function linksHubContent(zh) {
  const prefix = localePrefix(zh);
  const copy = zh ? {
    createEyebrow:"账号链接",
    createTitle:"新建收藏链接",
    createIntro:"输入你想收藏的网址，提交后会直接保存到当前账号的私人链接库。",
    placeholder:"输入你希望收藏的链接",
    submit:"新建链接",
    privateEyebrow:"私人链接库",
    privateTitle:"我的链接",
    privateIntro:"查看当前账号创建的链接。管理员进入后可以查看所有用户创建的私人链接。",
    publicEyebrow:"公共链接库",
    publicTitle:"精选链接",
    publicIntro:"系统精选、历史对话中使用过的项目、工具、服务和官方资料。搜索、筛选和全部 140 条链接都放在独立页面里。",
    curatedMeta:"140 条精选链接 · 8 个分类"
  } : {
    createEyebrow:"Account links",
    createTitle:"Create a saved link",
    createIntro:"Enter a site you want to save. It will be stored directly in your private account link library.",
    placeholder:"Enter the link you want to save",
    submit:"Create link",
    privateEyebrow:"Private library",
    privateTitle:"My links",
    privateIntro:"View links created by this account. Administrators can view all user-created private links.",
    publicEyebrow:"Public library",
    publicTitle:"Curated links",
    publicIntro:"System picks, projects used in prior chats, tools, services, and official references. Search, filters, and all 140 links live on a dedicated page.",
    curatedMeta:"140 curated links · 8 categories"
  };

  return `${sharedStyles()}
    <div class="links-hub">
      <section class="links-create-card">
        <span class="links-card-eyebrow">${copy.createEyebrow}</span>
        <h2>${copy.createTitle}</h2>
        <p>${copy.createIntro}</p>
        <form class="links-quick-form" id="links-quick-form">
          <input class="links-quick-input" id="links-quick-url" type="text" inputmode="url" autocomplete="url" placeholder="${copy.placeholder}" aria-label="${copy.placeholder}" required>
          <button class="links-quick-submit" id="links-quick-submit" type="submit" disabled>${copy.submit}</button>
        </form>
        <div class="links-quick-status" id="links-quick-status" aria-live="polite"></div>
      </section>

      <a class="links-route-card" href="${prefix}/info/links/mine">
        <div>
          <span class="links-card-eyebrow">${copy.privateEyebrow}</span>
          <h2>${copy.privateTitle}</h2>
          <p>${copy.privateIntro}</p>
          <div class="links-route-meta"><strong id="links-hub-private-count">—</strong><span id="links-hub-private-label">${zh ? "正在读取账号链接" : "Loading account links"}</span></div>
        </div>
        <span class="links-route-arrow" aria-hidden="true">→</span>
      </a>

      <a class="links-route-card" href="${prefix}/info/links/curated">
        <div>
          <span class="links-card-eyebrow">${copy.publicEyebrow}</span>
          <h2>${copy.publicTitle}</h2>
          <p>${copy.publicIntro}</p>
          <div class="links-route-meta"><strong>140</strong><span>${copy.curatedMeta}</span></div>
        </div>
        <span class="links-route-arrow" aria-hidden="true">→</span>
      </a>
    </div>
    ${accountLinksScript(zh, "hub")}`;
}

export function privateLinksPageContent(zh) {
  const prefix = localePrefix(zh);
  const copy = zh ? {
    eyebrow:"私人链接库",
    title:"我的链接",
    intro:"普通用户只会读取自己的链接；管理员会读取所有用户创建的私人链接并显示创建者。",
    back:"返回收藏链接",
    search:"搜索我的链接",
    loading:"正在读取账号链接…"
  } : {
    eyebrow:"Private library",
    title:"My links",
    intro:"Regular users read only their own links. Administrators read all user-created private links and see the creator.",
    back:"Back to Saved Links",
    search:"Search private links",
    loading:"Loading account links…"
  };

  return `${sharedStyles()}
    <section class="links-detail-shell">
      <header class="links-detail-head">
        <div>
          <span class="links-card-eyebrow">${copy.eyebrow}</span>
          <h2 id="links-private-page-title">${copy.title}</h2>
          <p id="links-private-page-hint">${copy.intro}</p>
        </div>
        <a class="links-detail-back" href="${prefix}/info/links">← ${copy.back}</a>
      </header>
      <div class="links-detail-body">
        <div class="links-private-toolbar"><input class="links-private-search" id="links-private-search" type="search" autocomplete="off" placeholder="${copy.search}" aria-label="${copy.search}"></div>
        <div class="links-route-meta" style="margin:0 0 12px"><strong id="links-private-page-count">0</strong><span>${zh ? "可见链接" : "visible links"}</span></div>
        <div class="links-private-grid" id="links-private-grid"></div>
        <div class="links-private-empty" id="links-private-empty">${copy.loading}</div>
      </div>
    </section>
    ${accountLinksScript(zh, "private")}`;
}

export function curatedLinksPageContent(zh) {
  const prefix = localePrefix(zh);
  const copy = zh ? {
    eyebrow:"公共链接库",
    title:"精选链接",
    intro:"在独立页面里浏览全部系统精选链接，并使用搜索、分类和来源筛选。",
    back:"返回收藏链接"
  } : {
    eyebrow:"Public library",
    title:"Curated links",
    intro:"Browse the complete curated library here with search, category, and source filters.",
    back:"Back to Saved Links"
  };
  return `${sharedStyles()}
    <section class="links-detail-shell links-curated-route">
      <header class="links-detail-head">
        <div><span class="links-card-eyebrow">${copy.eyebrow}</span><h2>${copy.title}</h2><p>${copy.intro}</p></div>
        <a class="links-detail-back" href="${prefix}/info/links">← ${copy.back}</a>
      </header>
      <div class="links-detail-body">${curatedLinksContent(zh)}${curatedLinksFavoritesEnhancer(zh)}</div>
    </section>`;
}
