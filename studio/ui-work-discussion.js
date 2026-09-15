export function workDiscussionContent(zh) {
  const copy = zh ? {
    title: "会议讨论",
    subtitle: "围绕议题集中讨论、记录决定，并把后续行动留在同一个空间。",
    newMeeting: "新建会议",
    search: "搜索讨论",
    today: "今天",
    recent: "最近讨论",
    meetingOne: "网站协作与移动端体验",
    meetingTwo: "TeX 协作功能规划",
    meetingThree: "QssedA Work 产品讨论",
    live: "进行中",
    ended: "已结束",
    participants: "参与者",
    agenda: "议程",
    notes: "会议记录",
    topicOne: "移动端 Work 路由与页面切换",
    topicTwo: "协作成员加载与状态同步",
    topicThree: "下一阶段功能边界",
    messagePlaceholder: "输入讨论内容…",
    send: "发送",
    emptyTitle: "选择一个讨论",
    emptyDetail: "从左侧选择会议，或新建一个讨论空间。",
    you: "你",
    sampleOne: "discussion 应该和 TeX 一样是独立 Work 界面，不继承 Studio 的顶部和菜单。",
    sampleTwo: "同意。路由、登录态可以复用，但页面本身应该完全由 Discussion 接管。",
    decision: "决定",
    decisionText: "Discussion 使用独立全屏 Work Shell，不显示 Studio 导航。",
    openTex: "TeX",
    discussion: "Discussion"
  } : {
    title: "Meeting Discussion",
    subtitle: "Discuss agendas, capture decisions, and keep follow-up actions in one focused workspace.",
    newMeeting: "New meeting",
    search: "Search discussions",
    today: "Today",
    recent: "Recent discussions",
    meetingOne: "Website collaboration and mobile UX",
    meetingTwo: "TeX collaboration planning",
    meetingThree: "QssedA Work product discussion",
    live: "Live",
    ended: "Ended",
    participants: "Participants",
    agenda: "Agenda",
    notes: "Meeting notes",
    topicOne: "Mobile Work routing and navigation",
    topicTwo: "Collaboration member loading and sync",
    topicThree: "Next-stage product boundaries",
    messagePlaceholder: "Write a message…",
    send: "Send",
    emptyTitle: "Choose a discussion",
    emptyDetail: "Select a meeting on the left or create a new discussion space.",
    you: "You",
    sampleOne: "Discussion should be a standalone Work surface like TeX, without the Studio top bar or sidebar.",
    sampleTwo: "Agreed. We can reuse routing and session plumbing, while Discussion owns the entire visible interface.",
    decision: "Decision",
    decisionText: "Discussion uses its own full-screen Work shell and does not render Studio navigation.",
    openTex: "TeX",
    discussion: "Discussion"
  };

  return `
    <section class="discussion-app" aria-label="${copy.title}">
      <style id="qsseda-work-discussion-ui">
        .discussion-app{height:100%;min-height:100%;display:grid;grid-template-rows:auto minmax(0,1fr);overflow:hidden;border:1px solid color-mix(in srgb,var(--border,#d2d2d7) 72%,transparent);border-radius:24px;background:var(--surface,#fff);box-shadow:0 1px 3px rgba(0,0,0,.04);color:var(--text,#1d1d1f)}
        .discussion-topbar{min-height:62px;padding:10px 14px 10px 18px;display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid color-mix(in srgb,var(--border,#d2d2d7) 68%,transparent);background:color-mix(in srgb,var(--surface,#fff) 97%,var(--fill,#f5f5f7))}
        .discussion-brand{display:flex;align-items:center;gap:11px;min-width:0}.discussion-brand-icon{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:var(--fill,#f2f2f7);color:var(--primary,#007aff);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--border,#d2d2d7) 55%,transparent)}
        .discussion-brand-icon svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.discussion-brand-copy{min-width:0}.discussion-brand-copy strong{display:block;font-size:15px;line-height:1.15;letter-spacing:-.02em}.discussion-brand-copy span{display:block;margin-top:3px;color:var(--quiet,#86868b);font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .discussion-top-actions{display:flex;align-items:center;gap:8px}.discussion-chip,.discussion-primary{min-height:34px;border:0;border-radius:10px;padding:0 12px;font:inherit;font-size:11px;font-weight:700;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:6px}.discussion-chip{background:var(--fill,#f2f2f7);color:var(--text,#1d1d1f);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--border,#d2d2d7) 55%,transparent)}.discussion-primary{background:var(--primary,#007aff);color:#fff}.discussion-layout{min-height:0;display:grid;grid-template-columns:280px minmax(0,1fr) 270px}.discussion-sidebar{min-height:0;overflow:auto;padding:14px;border-right:1px solid color-mix(in srgb,var(--border,#d2d2d7) 62%,transparent);background:color-mix(in srgb,var(--fill,#f5f5f7) 46%,var(--surface,#fff))}.discussion-search{width:100%;height:36px;border:0;border-radius:11px;padding:0 12px;background:var(--surface,#fff);color:var(--text,#1d1d1f);font:inherit;font-size:11px;outline:none;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--border,#d2d2d7) 65%,transparent)}.discussion-section-label{margin:16px 4px 7px;color:var(--quiet,#86868b);font-size:10px;font-weight:750;text-transform:uppercase;letter-spacing:.07em}.discussion-list{display:grid;gap:6px}.discussion-item{width:100%;border:0;text-align:left;padding:11px;border-radius:13px;background:transparent;color:inherit;cursor:pointer;font:inherit}.discussion-item.active{background:var(--surface,#fff);box-shadow:0 1px 2px rgba(0,0,0,.04),inset 0 0 0 1px color-mix(in srgb,var(--border,#d2d2d7) 58%,transparent)}.discussion-item-row{display:flex;align-items:center;justify-content:space-between;gap:10px}.discussion-item strong{font-size:11px;line-height:1.35}.discussion-item small{display:block;margin-top:5px;color:var(--quiet,#86868b);font-size:9px}.discussion-live{flex:0 0 auto;padding:3px 6px;border-radius:999px;background:color-mix(in srgb,#34c759 10%,transparent);color:#248a3d;font-size:8px;font-weight:800}.discussion-main{min-width:0;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto;background:var(--surface,#fff)}.discussion-room-head{padding:16px 18px;border-bottom:1px solid color-mix(in srgb,var(--border,#d2d2d7) 62%,transparent)}.discussion-room-head h2{margin:0;font-size:18px;line-height:1.2;letter-spacing:-.03em}.discussion-room-head p{margin:6px 0 0;color:var(--muted,#6e6e73);font-size:10px;line-height:1.5}.discussion-feed{min-height:0;overflow:auto;padding:18px;display:flex;flex-direction:column;gap:14px}.discussion-message{display:grid;grid-template-columns:32px minmax(0,1fr);gap:10px;max-width:760px}.discussion-avatar{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:var(--fill,#f2f2f7);font-size:10px;font-weight:800}.discussion-bubble{padding:11px 13px;border-radius:14px;background:var(--fill,#f5f5f7);font-size:11px;line-height:1.55}.discussion-meta{margin:0 0 5px;font-size:9px;color:var(--quiet,#86868b);font-weight:700}.discussion-decision{margin-left:42px;max-width:700px;padding:11px 13px;border-radius:13px;background:color-mix(in srgb,var(--primary,#007aff) 7%,var(--surface,#fff));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary,#007aff) 17%,var(--border,#d2d2d7))}.discussion-decision strong{display:block;margin-bottom:4px;color:var(--primary,#007aff);font-size:9px;text-transform:uppercase;letter-spacing:.06em}.discussion-decision span{font-size:10px;line-height:1.45}.discussion-composer{padding:12px 14px;border-top:1px solid color-mix(in srgb,var(--border,#d2d2d7) 62%,transparent);display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px}.discussion-composer textarea{min-height:38px;max-height:110px;resize:none;border:0;border-radius:12px;padding:10px 12px;background:var(--fill,#f5f5f7);color:var(--text,#1d1d1f);font:inherit;font-size:11px;line-height:1.4;outline:none;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--border,#d2d2d7) 55%,transparent)}.discussion-composer button{align-self:end;height:38px}.discussion-inspector{min-height:0;overflow:auto;padding:16px;border-left:1px solid color-mix(in srgb,var(--border,#d2d2d7) 62%,transparent);background:color-mix(in srgb,var(--fill,#f5f5f7) 36%,var(--surface,#fff))}.discussion-panel{padding:13px;border-radius:14px;background:var(--surface,#fff);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--border,#d2d2d7) 58%,transparent)}.discussion-panel+.discussion-panel{margin-top:10px}.discussion-panel h3{margin:0 0 10px;font-size:10px}.discussion-people{display:flex;align-items:center}.discussion-person{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;margin-right:-6px;background:var(--fill,#f2f2f7);border:2px solid var(--surface,#fff);font-size:8px;font-weight:800}.discussion-agenda{display:grid;gap:8px}.discussion-agenda div{display:grid;grid-template-columns:16px minmax(0,1fr);gap:7px;align-items:start;color:var(--muted,#6e6e73);font-size:9px;line-height:1.45}.discussion-agenda span:first-child{width:16px;height:16px;border-radius:5px;display:grid;place-items:center;background:var(--fill,#f2f2f7);color:var(--quiet,#86868b);font-size:8px;font-weight:800}
        @media(max-width:1000px){.discussion-layout{grid-template-columns:230px minmax(0,1fr)}.discussion-inspector{display:none}}
        @media(max-width:700px){.discussion-app{border:0;border-radius:0}.discussion-topbar{min-height:56px;padding:8px 10px}.discussion-brand-copy span{display:none}.discussion-top-actions .discussion-chip{display:none}.discussion-layout{grid-template-columns:1fr}.discussion-sidebar{display:none}.discussion-room-head{padding:13px 14px}.discussion-feed{padding:14px}.discussion-composer{padding:10px}.discussion-room-head h2{font-size:16px}}
      </style>

      <header class="discussion-topbar">
        <div class="discussion-brand">
          <div class="discussion-brand-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 5.5h16v10H9l-5 4z"></path><path d="M8 9h8M8 12h5"></path></svg></div>
          <div class="discussion-brand-copy"><strong>${copy.title}</strong><span>${copy.subtitle}</span></div>
        </div>
        <div class="discussion-top-actions">
          <a class="discussion-chip" href="${zh ? "/zh-cn/tex" : "/en/tex"}">${copy.openTex}</a>
          <button class="discussion-primary" type="button" id="discussion-new">${copy.newMeeting}</button>
        </div>
      </header>

      <div class="discussion-layout">
        <aside class="discussion-sidebar">
          <input class="discussion-search" id="discussion-search" type="search" placeholder="${copy.search}" autocomplete="off">
          <div class="discussion-section-label">${copy.today}</div>
          <div class="discussion-list" id="discussion-list">
            <button class="discussion-item active" type="button" data-title="${copy.meetingOne}"><span class="discussion-item-row"><strong>${copy.meetingOne}</strong><span class="discussion-live">${copy.live}</span></span><small>19:20 · 4 ${copy.participants}</small></button>
            <button class="discussion-item" type="button" data-title="${copy.meetingTwo}"><span class="discussion-item-row"><strong>${copy.meetingTwo}</strong></span><small>16:40 · 3 ${copy.participants}</small></button>
          </div>
          <div class="discussion-section-label">${copy.recent}</div>
          <div class="discussion-list"><button class="discussion-item" type="button" data-title="${copy.meetingThree}"><span class="discussion-item-row"><strong>${copy.meetingThree}</strong></span><small>${copy.ended}</small></button></div>
        </aside>

        <main class="discussion-main">
          <div class="discussion-room-head"><h2 id="discussion-room-title">${copy.meetingOne}</h2><p>4 ${copy.participants} · ${copy.live}</p></div>
          <div class="discussion-feed" id="discussion-feed">
            <article class="discussion-message"><div class="discussion-avatar">${copy.you.slice(0,1)}</div><div><div class="discussion-meta">${copy.you} · 19:18</div><div class="discussion-bubble">${copy.sampleOne}</div></div></article>
            <article class="discussion-message"><div class="discussion-avatar">A</div><div><div class="discussion-meta">Alex · 19:19</div><div class="discussion-bubble">${copy.sampleTwo}</div></div></article>
            <div class="discussion-decision"><strong>${copy.decision}</strong><span>${copy.decisionText}</span></div>
          </div>
          <form class="discussion-composer" id="discussion-composer"><textarea id="discussion-input" rows="1" placeholder="${copy.messagePlaceholder}"></textarea><button class="discussion-primary" type="submit">${copy.send}</button></form>
        </main>

        <aside class="discussion-inspector">
          <section class="discussion-panel"><h3>${copy.participants}</h3><div class="discussion-people"><span class="discussion-person">${copy.you.slice(0,1)}</span><span class="discussion-person">A</span><span class="discussion-person">M</span><span class="discussion-person">L</span></div></section>
          <section class="discussion-panel"><h3>${copy.agenda}</h3><div class="discussion-agenda"><div><span>1</span><span>${copy.topicOne}</span></div><div><span>2</span><span>${copy.topicTwo}</span></div><div><span>3</span><span>${copy.topicThree}</span></div></div></section>
          <section class="discussion-panel"><h3>${copy.notes}</h3><div class="discussion-agenda"><div><span>✓</span><span>${copy.decisionText}</span></div></div></section>
        </aside>
      </div>

      <script id="qsseda-work-discussion-client">
        (() => {
          const form = document.getElementById('discussion-composer');
          const input = document.getElementById('discussion-input');
          const feed = document.getElementById('discussion-feed');
          const title = document.getElementById('discussion-room-title');
          const list = document.getElementById('discussion-list');
          const search = document.getElementById('discussion-search');
          const esc = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
          form?.addEventListener('submit', event => {
            event.preventDefault();
            const value = input?.value.trim();
            if (!value || !feed) return;
            const article = document.createElement('article');
            article.className = 'discussion-message';
            article.innerHTML = '<div class="discussion-avatar">${copy.you.slice(0,1)}</div><div><div class="discussion-meta">${copy.you} · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div><div class="discussion-bubble">' + esc(value) + '</div></div>';
            feed.append(article);
            input.value = '';
            feed.scrollTop = feed.scrollHeight;
          });
          document.querySelectorAll('.discussion-item').forEach(item => item.addEventListener('click', () => {
            document.querySelectorAll('.discussion-item').forEach(node => node.classList.remove('active'));
            item.classList.add('active');
            if (title) title.textContent = item.dataset.title || item.textContent.trim();
          }));
          search?.addEventListener('input', () => {
            const query = search.value.trim().toLowerCase();
            document.querySelectorAll('.discussion-item').forEach(item => { item.hidden = Boolean(query) && !item.textContent.toLowerCase().includes(query); });
          });
          document.getElementById('discussion-new')?.addEventListener('click', () => input?.focus());
        })();
      </script>
    </section>
  `;
}

export function polishWorkDiscussionShell(markup, zh, pathname) {
  if (pathname !== "/work/discussion") return String(markup || "");
  const title = zh ? "会议讨论 · QssedA Work" : "Meeting Discussion · QssedA Work";
  let output = String(markup || "");
  output = output.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  return output.replace(
    "</head>",
    `<style id="qsseda-work-discussion-only">
      html{background:var(--bg-soft)!important}
      body.os-shell{display:block!important;min-height:100vh!important;margin:0!important;padding:8px!important;overflow:hidden!important;background:var(--bg-soft)!important}
      body.os-shell>.top-controls-zone,body.os-shell>.compact-back-zone,body.os-shell .os-sidebar,body.os-shell .os-hero,body.os-shell #admin-lock{display:none!important}
      body.os-shell .os-layout,body.os-shell .os-main,body.os-shell #os-content{display:block!important;width:100%!important;max-width:none!important;min-height:calc(100vh - 16px)!important;height:calc(100vh - 16px)!important;margin:0!important;padding:0!important}
      @media(max-width:700px){body.os-shell{padding:0!important}body.os-shell .os-layout,body.os-shell .os-main,body.os-shell #os-content{height:100vh!important;min-height:100vh!important}}
    </style></head>`
  );
}
