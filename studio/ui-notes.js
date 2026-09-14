export function researchNotesContent(zh) {
  const copy = zh ? {
    eyebrow: "研究工作区",
    introTitle: "把想法、资料和推导留在一个地方",
    intro: "研究笔记与当前账号关联，自动保存到 R2 的隐藏系统目录。适合记录文献阅读、方法推导、实验过程、数据观察、临时想法和下一步计划。",
    total: "笔记总数",
    active: "进行中",
    pinned: "已固定",
    projects: "项目数",
    library: "笔记库",
    libraryHint: "搜索标题、项目、标签或正文摘要",
    search: "搜索笔记",
    newNote: "新建笔记",
    all: "全部",
    activeFilter: "进行中",
    referenceFilter: "参考",
    doneFilter: "已完成",
    emptyTitle: "还没有研究笔记",
    emptyHint: "新建第一条笔记，把研究过程从这里开始积累。",
    noMatches: "没有匹配的笔记",
    editorEmptyTitle: "选择一条笔记开始编辑",
    editorEmptyHint: "左侧是你的笔记库。可以新建笔记，或选择已有条目继续研究。",
    title: "标题",
    titlePlaceholder: "例如：Bootstrap 置信区间的适用条件",
    project: "项目 / 课题",
    projectPlaceholder: "例如：概率论作业 / 数模竞赛 / 论文阅读",
    kind: "类型",
    kindOptions: [
      ["question", "研究问题"],
      ["literature", "文献阅读"],
      ["method", "方法与推导"],
      ["experiment", "实验记录"],
      ["data", "数据观察"],
      ["idea", "想法"],
      ["meeting", "讨论 / 会议"]
    ],
    status: "状态",
    statusOptions: [["active", "进行中"], ["reference", "参考"], ["done", "已完成"]],
    source: "来源 / 参考",
    sourcePlaceholder: "论文、网页、书籍章节、课程、数据集链接或其他来源",
    tags: "标签",
    tagsPlaceholder: "例如：统计推断, Bootstrap, Python",
    body: "研究记录",
    bodyPlaceholder: "记录问题、背景、推导过程、实验结果、代码思路、反例、疑问和自己的判断。这里可以写得很长，不需要一开始就整理得很完美。",
    conclusion: "阶段结论",
    conclusionPlaceholder: "目前能确定什么？哪些判断最值得以后快速回看？",
    nextSteps: "下一步",
    nextStepsPlaceholder: "还要验证什么、补什么数据、继续读什么、下一次从哪里接着做？",
    pin: "固定笔记",
    pinHint: "固定后会排在笔记库最前面",
    save: "保存",
    delete: "删除笔记",
    deleteConfirm: "确定删除这条研究笔记吗？此操作无法撤销。",
    saved: "已保存到账号",
    autosaved: "已自动保存",
    saving: "正在保存…",
    loading: "正在读取账号笔记…",
    unavailable: "研究笔记服务暂时不可用",
    updated: "更新",
    chars: "字",
    untitled: "未命名笔记",
    newDefault: "新的研究笔记",
    select: "选择"
  } : {
    eyebrow: "Research workspace",
    introTitle: "Keep ideas, sources, and reasoning in one place",
    intro: "Research notes are linked to your account and autosaved to a hidden R2 system path. Use them for literature reviews, derivations, experiments, data observations, quick ideas, and next steps.",
    total: "Notes",
    active: "Active",
    pinned: "Pinned",
    projects: "Projects",
    library: "Notebook",
    libraryHint: "Search titles, projects, tags, or previews",
    search: "Search notes",
    newNote: "New note",
    all: "All",
    activeFilter: "Active",
    referenceFilter: "Reference",
    doneFilter: "Done",
    emptyTitle: "No research notes yet",
    emptyHint: "Create your first note and start building your research trail here.",
    noMatches: "No matching notes",
    editorEmptyTitle: "Select a note to start editing",
    editorEmptyHint: "Your notebook is on the left. Create a note or pick an existing one to continue working.",
    title: "Title",
    titlePlaceholder: "For example: When bootstrap confidence intervals work",
    project: "Project / topic",
    projectPlaceholder: "For example: Probability homework / Modeling contest / Paper review",
    kind: "Type",
    kindOptions: [
      ["question", "Research question"],
      ["literature", "Literature"],
      ["method", "Method & derivation"],
      ["experiment", "Experiment"],
      ["data", "Data observation"],
      ["idea", "Idea"],
      ["meeting", "Discussion / meeting"]
    ],
    status: "Status",
    statusOptions: [["active", "Active"], ["reference", "Reference"], ["done", "Done"]],
    source: "Source / reference",
    sourcePlaceholder: "Paper, webpage, book section, class, dataset URL, or other source",
    tags: "Tags",
    tagsPlaceholder: "For example: inference, bootstrap, Python",
    body: "Research record",
    bodyPlaceholder: "Capture the problem, context, derivation, experiment results, code ideas, counterexamples, questions, and your own judgment. It does not need to be polished on the first pass.",
    conclusion: "Working conclusion",
    conclusionPlaceholder: "What can you say with confidence so far? What is worth finding quickly later?",
    nextSteps: "Next steps",
    nextStepsPlaceholder: "What still needs validation, more data, further reading, or continuation next time?",
    pin: "Pin note",
    pinHint: "Pinned notes stay at the top of the notebook",
    save: "Save",
    delete: "Delete note",
    deleteConfirm: "Delete this research note? This cannot be undone.",
    saved: "Saved to account",
    autosaved: "Autosaved",
    saving: "Saving…",
    loading: "Loading account notes…",
    unavailable: "Research notes are temporarily unavailable",
    updated: "Updated",
    chars: "characters",
    untitled: "Untitled note",
    newDefault: "New research note",
    select: "Select"
  };

  const kindOptions = copy.kindOptions.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
  const statusOptions = copy.statusOptions.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");

  return `
    <section class="notes-overview">
      <div class="notes-intro-card">
        <span class="notes-eyebrow">${copy.eyebrow}</span>
        <h2>${copy.introTitle}</h2>
        <p>${copy.intro}</p>
        <button id="notes-new-top" class="notes-primary-button" type="button">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
          <span>${copy.newNote}</span>
        </button>
      </div>
      <div class="notes-stats" aria-label="${copy.eyebrow}">
        <article><span>${copy.total}</span><strong id="notes-stat-total">—</strong></article>
        <article><span>${copy.active}</span><strong id="notes-stat-active">—</strong></article>
        <article><span>${copy.pinned}</span><strong id="notes-stat-pinned">—</strong></article>
        <article><span>${copy.projects}</span><strong id="notes-stat-projects">—</strong></article>
      </div>
    </section>

    <section id="notes-workspace" class="notes-workspace" data-notes-workspace>
      <aside class="notes-library">
        <div class="notes-library-head">
          <div><span class="notes-eyebrow">${copy.eyebrow}</span><h2>${copy.library}</h2><p>${copy.libraryHint}</p></div>
          <button id="notes-new" class="notes-icon-button" type="button" aria-label="${copy.newNote}" title="${copy.newNote}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
        <label class="notes-search-shell">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg>
          <input id="notes-search" type="search" placeholder="${copy.search}" aria-label="${copy.search}" autocomplete="off">
        </label>
        <div id="notes-filters" class="notes-filters" role="group" aria-label="${copy.status}">
          <button type="button" class="is-active" data-note-filter="all">${copy.all}</button>
          <button type="button" data-note-filter="active">${copy.activeFilter}</button>
          <button type="button" data-note-filter="reference">${copy.referenceFilter}</button>
          <button type="button" data-note-filter="done">${copy.doneFilter}</button>
        </div>
        <div id="notes-list" class="notes-list" aria-live="polite"></div>
      </aside>

      <div class="notes-editor-shell">
        <div id="notes-editor-empty" class="notes-editor-empty">
          <div class="notes-editor-empty-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h10l4 4v12H5z"/><path d="M15 4v5h5M8 13h8M8 17h6"/></svg>
          </div>
          <h2>${copy.editorEmptyTitle}</h2>
          <p>${copy.editorEmptyHint}</p>
          <button id="notes-empty-new" class="notes-primary-button" type="button">${copy.newNote}</button>
        </div>

        <form id="notes-editor" class="notes-editor" hidden autocomplete="off">
          <div class="notes-editor-header">
            <div class="notes-editor-title-wrap">
              <span class="notes-eyebrow">${copy.eyebrow}</span>
              <input id="note-title" class="note-title-input" type="text" maxlength="180" placeholder="${copy.titlePlaceholder}" aria-label="${copy.title}">
            </div>
            <div class="notes-editor-actions">
              <button id="note-pin" class="notes-pin-button" type="button" aria-pressed="false" title="${copy.pin}">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 4 8 0-1 5 3 3-5 1-1 7-1-7-5-1 3-3z"/></svg>
              </button>
              <button id="note-save" class="notes-save-button" type="button">${copy.save}</button>
            </div>
          </div>

          <div class="notes-meta-grid">
            <label><span>${copy.project}</span><input id="note-project" type="text" maxlength="120" placeholder="${copy.projectPlaceholder}"></label>
            <label><span>${copy.kind}</span><select id="note-kind">${kindOptions}</select></label>
            <label><span>${copy.status}</span><select id="note-status">${statusOptions}</select></label>
            <label><span>${copy.tags}</span><input id="note-tags" type="text" maxlength="800" placeholder="${copy.tagsPlaceholder}"></label>
          </div>

          <label class="notes-field"><span>${copy.source}</span><input id="note-source" type="text" maxlength="1600" placeholder="${copy.sourcePlaceholder}"></label>
          <label class="notes-field notes-body-field"><span>${copy.body}</span><textarea id="note-body" maxlength="48000" placeholder="${copy.bodyPlaceholder}"></textarea></label>

          <div class="notes-two-column">
            <label class="notes-field"><span>${copy.conclusion}</span><textarea id="note-conclusion" maxlength="8000" placeholder="${copy.conclusionPlaceholder}"></textarea></label>
            <label class="notes-field"><span>${copy.nextSteps}</span><textarea id="note-next-steps" maxlength="5000" placeholder="${copy.nextStepsPlaceholder}"></textarea></label>
          </div>

          <div class="notes-editor-footer">
            <div class="notes-save-state-wrap">
              <span id="note-save-state" class="notes-save-state">${copy.loading}</span>
              <span class="notes-char-count"><strong id="note-char-count">0</strong> ${copy.chars}</span>
            </div>
            <button id="note-delete" class="notes-delete-button" type="button">${copy.delete}</button>
          </div>
        </form>
      </div>
    </section>

    <style>
      .notes-overview{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(420px,.65fr);gap:12px;margin-bottom:14px}
      .notes-intro-card,.notes-stats,.notes-library,.notes-editor-shell{border:1px solid var(--border);background:var(--card);border-radius:20px}
      .notes-intro-card{padding:22px}.notes-eyebrow{display:block;color:var(--muted);font-size:11px;font-weight:680;letter-spacing:.01em}.notes-intro-card h2{margin:5px 0 8px;font-size:25px;letter-spacing:-.035em}.notes-intro-card p{max-width:780px;margin:0;color:var(--muted);font-size:13px;line-height:1.65}
      .notes-primary-button{width:auto!important;min-height:40px!important;margin:17px 0 0!important;padding:0 14px!important;display:inline-flex!important;align-items:center;justify-content:center;gap:8px;border:0!important;border-radius:11px!important;background:var(--primary)!important;color:var(--primary-ink)!important;font-size:13px!important;font-weight:700!important}.notes-primary-button svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round}
      .notes-stats{display:grid;grid-template-columns:1fr 1fr;gap:1px;overflow:hidden;background:var(--border)}.notes-stats article{display:flex;min-height:92px;flex-direction:column;justify-content:flex-end;padding:15px;background:var(--card)}.notes-stats span{color:var(--muted);font-size:11px}.notes-stats strong{margin-top:4px;font-size:25px;letter-spacing:-.04em}
      .notes-workspace{display:grid;grid-template-columns:minmax(280px,340px) minmax(0,1fr);gap:12px;align-items:stretch;min-height:650px}.notes-library,.notes-editor-shell{min-height:650px;overflow:hidden}.notes-library{display:flex;flex-direction:column;padding:16px}.notes-library-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.notes-library-head h2{margin:3px 0 0;font-size:20px;letter-spacing:-.03em}.notes-library-head p{margin:4px 0 0;color:var(--muted);font-size:11px;line-height:1.45}
      .notes-icon-button,.notes-pin-button{width:38px!important;height:38px!important;min-height:38px!important;margin:0!important;padding:0!important;display:grid!important;place-items:center;border:1px solid var(--border)!important;border-radius:11px!important;background:var(--fill)!important;color:var(--text)!important}.notes-icon-button svg,.notes-pin-button svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.notes-pin-button.is-pinned{color:var(--primary)!important;background:color-mix(in srgb,var(--primary) 10%,var(--fill))!important;border-color:color-mix(in srgb,var(--primary) 24%,var(--border))!important}
      .notes-search-shell{display:flex;align-items:center;gap:8px;margin-top:14px;padding:0 10px;border:1px solid var(--border);border-radius:11px;background:var(--fill)}.notes-search-shell svg{width:16px;height:16px;flex:0 0 auto;fill:none;stroke:var(--muted);stroke-width:1.8}.notes-search-shell input{min-width:0;height:38px;margin:0!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;font-size:12px!important}
      .notes-filters{display:flex;gap:5px;margin-top:10px;overflow-x:auto}.notes-filters button{width:auto!important;min-height:29px!important;margin:0!important;padding:0 9px!important;border:0!important;border-radius:9px!important;background:transparent!important;color:var(--muted)!important;font-size:10px!important;font-weight:650!important;white-space:nowrap}.notes-filters button.is-active{background:var(--fill)!important;color:var(--text)!important}
      .notes-list{display:grid;gap:7px;margin-top:12px;overflow:auto;padding-right:2px}.notes-list-item{width:100%;margin:0!important;padding:12px!important;border:1px solid transparent!important;border-radius:13px!important;background:var(--fill)!important;color:var(--text)!important;text-align:left!important}.notes-list-item:hover{background:var(--secondary)!important}.notes-list-item.is-selected{border-color:color-mix(in srgb,var(--primary) 28%,var(--border))!important;background:color-mix(in srgb,var(--primary) 7%,var(--fill))!important}.notes-list-top{display:flex;align-items:flex-start;gap:8px}.notes-list-top strong{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}.notes-list-pin{color:var(--primary);font-size:10px}.notes-list-item p{display:-webkit-box;overflow:hidden;-webkit-line-clamp:2;-webkit-box-orient:vertical;margin:6px 0 0;color:var(--muted);font-size:10px;line-height:1.45}.notes-list-meta{display:flex;justify-content:space-between;gap:8px;margin-top:8px;color:var(--quiet);font-size:9px}.notes-list-meta span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.notes-list-empty{display:grid;place-items:center;min-height:170px;padding:18px;text-align:center;color:var(--muted)}.notes-list-empty strong{color:var(--text);font-size:13px}.notes-list-empty span{max-width:230px;margin-top:5px;font-size:10px;line-height:1.5}
      .notes-editor-shell{position:relative;padding:20px}.notes-editor-empty{min-height:608px;display:grid;place-items:center;align-content:center;text-align:center}.notes-editor-empty-icon{width:56px;height:56px;display:grid;place-items:center;border-radius:17px;background:var(--fill);color:var(--muted)}.notes-editor-empty-icon svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}.notes-editor-empty h2{margin:14px 0 0;font-size:20px;letter-spacing:-.03em}.notes-editor-empty p{max-width:420px;margin:7px 0 0;color:var(--muted);font-size:12px;line-height:1.55}.notes-editor-empty .notes-primary-button{margin-top:15px!important}
      .notes-editor{display:block}.notes-editor[hidden]{display:none}.notes-editor-header{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding-bottom:16px;border-bottom:1px solid var(--hairline)}.notes-editor-title-wrap{min-width:0;flex:1}.note-title-input{width:100%;height:auto!important;margin:2px 0 0!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;color:var(--text)!important;font-size:27px!important;font-weight:760!important;letter-spacing:-.04em}.notes-editor-actions{display:flex;gap:7px}.notes-save-button{width:auto!important;min-height:38px!important;margin:0!important;padding:0 13px!important;border:0!important;border-radius:11px!important;background:var(--primary)!important;color:var(--primary-ink)!important;font-size:12px!important;font-weight:700!important}
      .notes-meta-grid{display:grid;grid-template-columns:1.25fr .85fr .85fr 1.15fr;gap:9px;margin-top:16px}.notes-meta-grid label,.notes-field{display:grid;gap:6px}.notes-meta-grid span,.notes-field>span{color:var(--muted);font-size:10px;font-weight:650}.notes-meta-grid input,.notes-meta-grid select,.notes-field input,.notes-field textarea{width:100%;margin:0!important;border:1px solid var(--border)!important;border-radius:11px!important;background:var(--fill)!important;color:var(--text)!important;box-shadow:none!important}.notes-meta-grid input,.notes-meta-grid select,.notes-field input{height:40px!important;padding:0 11px!important;font-size:11px!important}.notes-field{margin-top:11px}.notes-field textarea{min-height:132px;padding:11px 12px!important;resize:vertical;font-size:12px!important;line-height:1.6}.notes-body-field textarea{min-height:300px;font-size:13px!important}.notes-two-column{display:grid;grid-template-columns:1fr 1fr;gap:10px}.notes-two-column .notes-field textarea{min-height:145px}
      .notes-editor-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:14px;padding-top:14px;border-top:1px solid var(--hairline)}.notes-save-state-wrap{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:10px}.notes-save-state.is-error{color:var(--danger)}.notes-char-count{color:var(--quiet)}.notes-delete-button{width:auto!important;min-height:36px!important;margin:0!important;padding:0 11px!important;border:1px solid color-mix(in srgb,var(--danger) 24%,var(--border))!important;border-radius:10px!important;background:color-mix(in srgb,var(--danger) 5%,var(--card))!important;color:var(--danger)!important;font-size:10px!important;font-weight:700!important}.notes-delete-button:hover{background:color-mix(in srgb,var(--danger) 10%,var(--card))!important;border-color:color-mix(in srgb,var(--danger) 42%,var(--border))!important}
      @media(max-width:1100px){.notes-overview{grid-template-columns:1fr}.notes-workspace{grid-template-columns:290px minmax(0,1fr)}.notes-meta-grid{grid-template-columns:1fr 1fr}}
      @media(max-width:820px){.notes-workspace{grid-template-columns:1fr}.notes-library,.notes-editor-shell{min-height:auto}.notes-list{max-height:340px}.notes-editor-empty{min-height:340px}.notes-two-column{grid-template-columns:1fr}}
      @media(max-width:580px){.notes-intro-card,.notes-library,.notes-editor-shell{padding:15px}.notes-stats{grid-template-columns:1fr 1fr}.notes-meta-grid{grid-template-columns:1fr}.notes-editor-header{display:grid}.notes-editor-actions{justify-content:flex-start}.note-title-input{font-size:23px!important}.notes-editor-footer{align-items:flex-start;flex-direction:column}}
    </style>

    <script>
      (() => {
        const start = () => {
          const root = document.getElementById('notes-workspace');
          if (!root) return;

          const copy = ${JSON.stringify(copy)};
          const list = document.getElementById('notes-list');
          const search = document.getElementById('notes-search');
          const filters = document.getElementById('notes-filters');
          const editor = document.getElementById('notes-editor');
          const editorEmpty = document.getElementById('notes-editor-empty');
          const saveState = document.getElementById('note-save-state');
          const charCount = document.getElementById('note-char-count');
          const pinButton = document.getElementById('note-pin');
          const fields = {
            title: document.getElementById('note-title'),
            project: document.getElementById('note-project'),
            kind: document.getElementById('note-kind'),
            status: document.getElementById('note-status'),
            tags: document.getElementById('note-tags'),
            source: document.getElementById('note-source'),
            body: document.getElementById('note-body'),
            conclusion: document.getElementById('note-conclusion'),
            next_steps: document.getElementById('note-next-steps')
          };

          let notes = [];
          let selectedId = '';
          let selectedNote = null;
          let filter = 'all';
          let query = '';
          let loadingNote = false;
          let saveTimer = null;
          let saveSequence = 0;

          async function token() {
            const result = await supabaseClient.auth.getSession();
            const value = result?.data?.session?.access_token;
            if (!value) throw new Error(${JSON.stringify(zh ? '登录状态已失效' : 'Session expired')});
            return value;
          }

          async function api(path, options) {
            const access = await token();
            const headers = new Headers(options?.headers || {});
            headers.set('Authorization', 'Bearer ' + access);
            if (options?.body) headers.set('Content-Type', 'application/json;charset=UTF-8');
            const response = await fetch(path, { ...options, headers, cache: 'no-store' });
            if (!response.ok) {
              const payload = await response.json().catch(() => ({}));
              throw new Error(payload?.error || copy.unavailable);
            }
            return response.json();
          }

          function setState(text, error) {
            if (!saveState) return;
            saveState.textContent = text || '';
            saveState.classList.toggle('is-error', Boolean(error));
          }

          function notePayload() {
            return {
              title: fields.title.value,
              project: fields.project.value,
              kind: fields.kind.value,
              status: fields.status.value,
              tags: fields.tags.value,
              source: fields.source.value,
              body: fields.body.value,
              conclusion: fields.conclusion.value,
              next_steps: fields.next_steps.value,
              pinned: Boolean(selectedNote?.pinned)
            };
          }

          function updateCharCount() {
            const total = [fields.body.value, fields.conclusion.value, fields.next_steps.value].reduce((sum, value) => sum + value.length, 0);
            if (charCount) charCount.textContent = String(total);
          }

          function summaryFromNote(note) {
            return {
              id: note.id,
              title: note.title,
              project: note.project,
              kind: note.kind,
              tags: note.tags,
              status: note.status,
              pinned: note.pinned,
              created_at: note.created_at,
              updated_at: note.updated_at,
              preview: String(note.body || note.conclusion || '').trim().slice(0, 220)
            };
          }

          function updateStats() {
            const projects = new Set(notes.map(note => String(note.project || '').trim()).filter(Boolean));
            document.getElementById('notes-stat-total').textContent = String(notes.length);
            document.getElementById('notes-stat-active').textContent = String(notes.filter(note => note.status === 'active').length);
            document.getElementById('notes-stat-pinned').textContent = String(notes.filter(note => note.pinned).length);
            document.getElementById('notes-stat-projects').textContent = String(projects.size);
          }

          function filteredNotes() {
            const normalized = query.trim().toLocaleLowerCase();
            return notes.filter(note => {
              if (filter !== 'all' && note.status !== filter) return false;
              if (!normalized) return true;
              return [note.title, note.project, note.tags, note.kind, note.preview].some(value => String(value || '').toLocaleLowerCase().includes(normalized));
            });
          }

          function formatDate(value) {
            if (!value) return '—';
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return '—';
            const now = new Date();
            if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          }

          function renderList() {
            list.replaceChildren();
            const visible = filteredNotes();
            if (!visible.length) {
              const empty = document.createElement('div');
              empty.className = 'notes-list-empty';
              const strong = document.createElement('strong');
              strong.textContent = notes.length ? copy.noMatches : copy.emptyTitle;
              const hint = document.createElement('span');
              hint.textContent = notes.length ? copy.libraryHint : copy.emptyHint;
              empty.append(strong, hint);
              list.append(empty);
              updateStats();
              return;
            }

            visible.forEach(note => {
              const button = document.createElement('button');
              button.type = 'button';
              button.className = 'notes-list-item' + (note.id === selectedId ? ' is-selected' : '');
              const top = document.createElement('div');
              top.className = 'notes-list-top';
              const title = document.createElement('strong');
              title.textContent = note.title || copy.untitled;
              top.append(title);
              if (note.pinned) {
                const pin = document.createElement('span');
                pin.className = 'notes-list-pin';
                pin.textContent = '●';
                top.append(pin);
              }
              const preview = document.createElement('p');
              preview.textContent = note.preview || note.project || note.tags || '—';
              const meta = document.createElement('div');
              meta.className = 'notes-list-meta';
              const project = document.createElement('span');
              project.textContent = note.project || note.status || '—';
              const time = document.createElement('time');
              time.textContent = formatDate(note.updated_at);
              meta.append(project, time);
              button.append(top, preview, meta);
              button.addEventListener('click', () => void selectNote(note.id));
              list.append(button);
            });
            updateStats();
          }

          function showEditor(note) {
            selectedNote = note;
            selectedId = note?.id || '';
            editor.hidden = !note;
            editorEmpty.hidden = Boolean(note);
            if (!note) {
              renderList();
              return;
            }
            loadingNote = true;
            fields.title.value = note.title || '';
            fields.project.value = note.project || '';
            fields.kind.value = note.kind || 'question';
            fields.status.value = note.status || 'active';
            fields.tags.value = note.tags || '';
            fields.source.value = note.source || '';
            fields.body.value = note.body || '';
            fields.conclusion.value = note.conclusion || '';
            fields.next_steps.value = note.next_steps || '';
            pinButton.classList.toggle('is-pinned', Boolean(note.pinned));
            pinButton.setAttribute('aria-pressed', note.pinned ? 'true' : 'false');
            updateCharCount();
            setState(copy.saved, false);
            loadingNote = false;
            renderList();
          }

          async function loadNotes(preserveSelection) {
            try {
              const data = await api('/api/notes', { method: 'GET' });
              notes = Array.isArray(data?.notes) ? data.notes : [];
              renderList();
              if (preserveSelection && selectedId && notes.some(note => note.id === selectedId)) return;
              if (!selectedId && notes.length) await selectNote(notes[0].id);
            } catch (error) {
              list.replaceChildren();
              const empty = document.createElement('div');
              empty.className = 'notes-list-empty';
              const strong = document.createElement('strong');
              strong.textContent = error?.message || copy.unavailable;
              empty.append(strong);
              list.append(empty);
              ['notes-stat-total','notes-stat-active','notes-stat-pinned','notes-stat-projects'].forEach(id => { document.getElementById(id).textContent = '—'; });
            }
          }

          async function selectNote(id) {
            if (!id || id === selectedId && selectedNote) return;
            window.clearTimeout(saveTimer);
            setState(copy.loading, false);
            try {
              const data = await api('/api/notes?id=' + encodeURIComponent(id), { method: 'GET' });
              showEditor(data.note);
            } catch (error) {
              setState(error?.message || copy.unavailable, true);
            }
          }

          async function createNote() {
            window.clearTimeout(saveTimer);
            try {
              const data = await api('/api/notes', { method: 'POST', body: JSON.stringify({ title: copy.newDefault, kind: 'question', status: 'active' }) });
              const note = data.note;
              notes.unshift(summaryFromNote(note));
              showEditor(note);
              fields.title.focus();
              fields.title.select();
            } catch (error) {
              setState(error?.message || copy.unavailable, true);
            }
          }

          async function saveNote(label) {
            if (!selectedId || loadingNote) return;
            const sequence = ++saveSequence;
            setState(copy.saving, false);
            try {
              const data = await api('/api/notes?id=' + encodeURIComponent(selectedId), { method: 'PUT', body: JSON.stringify(notePayload()) });
              if (sequence !== saveSequence) return;
              selectedNote = data.note;
              const next = summaryFromNote(data.note);
              const index = notes.findIndex(note => note.id === selectedId);
              if (index >= 0) notes.splice(index, 1, next); else notes.unshift(next);
              notes.sort((a, b) => Boolean(a.pinned) !== Boolean(b.pinned) ? (a.pinned ? -1 : 1) : String(b.updated_at || '').localeCompare(String(a.updated_at || '')));
              setState(label || copy.saved, false);
              renderList();
            } catch (error) {
              if (sequence !== saveSequence) return;
              setState(error?.message || copy.unavailable, true);
            }
          }

          function queueSave() {
            updateCharCount();
            if (!selectedId || loadingNote) return;
            window.clearTimeout(saveTimer);
            saveTimer = window.setTimeout(() => void saveNote(copy.autosaved), 750);
          }

          async function deleteNote() {
            if (!selectedId || !window.confirm(copy.deleteConfirm)) return;
            window.clearTimeout(saveTimer);
            const deletingId = selectedId;
            try {
              await api('/api/notes?id=' + encodeURIComponent(deletingId), { method: 'DELETE' });
              notes = notes.filter(note => note.id !== deletingId);
              selectedId = '';
              selectedNote = null;
              showEditor(null);
              if (notes.length) await selectNote(notes[0].id);
            } catch (error) {
              setState(error?.message || copy.unavailable, true);
            }
          }

          Object.values(fields).forEach(field => {
            field.addEventListener('input', queueSave);
            field.addEventListener('change', queueSave);
          });
          pinButton.addEventListener('click', () => {
            if (!selectedNote) return;
            selectedNote.pinned = !selectedNote.pinned;
            pinButton.classList.toggle('is-pinned', selectedNote.pinned);
            pinButton.setAttribute('aria-pressed', selectedNote.pinned ? 'true' : 'false');
            queueSave();
          });
          document.getElementById('note-save').addEventListener('click', () => void saveNote(copy.saved));
          document.getElementById('note-delete').addEventListener('click', () => void deleteNote());
          document.getElementById('notes-new').addEventListener('click', () => void createNote());
          document.getElementById('notes-new-top').addEventListener('click', () => void createNote());
          document.getElementById('notes-empty-new').addEventListener('click', () => void createNote());
          search.addEventListener('input', () => { query = search.value || ''; renderList(); });
          filters.addEventListener('click', event => {
            const button = event.target.closest('[data-note-filter]');
            if (!button) return;
            filter = button.dataset.noteFilter || 'all';
            filters.querySelectorAll('[data-note-filter]').forEach(item => item.classList.toggle('is-active', item === button));
            renderList();
          });

          void loadNotes(false);
        };
        window.setTimeout(start, 0);
      })();
    </script>
  `;
}
