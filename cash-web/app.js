(() => {
  'use strict';
  const M = window.CashflowModel;
  const $ = id => document.getElementById(id);
  let data = M.createDefaultData();
  let model;
  let meta = { today: localDateKey(), dataFilePath: 'AERTEX Cloud' };
  let editingTransactionId = null;
  let editingPlanId = null;
  let editingExpectedId = null;
  let selectedDay = null;
  let saveChain = Promise.resolve();
  let toastTimer;

  const money = (value, decimals = 0) => `¥${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  const signed = (value, decimals = 1) => `${value >= 0 ? '+' : '-'}${money(Math.abs(value), decimals)}`;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const amount = (element, fallback = 0) => { const number = Number(String(element.value).trim().replace(/[，,。]/g, '.')); return Number.isFinite(number) && number >= 0 ? number : fallback; };
  const normalizeDateInput = value => {
    const parts = String(value || '').trim().replace(/[年/.]/g, '-').replace('月', '-').replace(/日/g, '').split('-');
    if (parts.length !== 3) return '';
    const key = `${parts[0]}-${String(Number(parts[1])).padStart(2, '0')}-${String(Number(parts[2])).padStart(2, '0')}`;
    return M.parseDateKey(key) ? key : '';
  };
  const isActualDateAllowed = key => M.parseDateKey(key) && key >= data.settings.periodStart && key <= data.settings.periodEnd && key <= meta.today;
  function localDateKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  function mainSiteOrigin() {
    const host = location.hostname.toLowerCase();
    for (const root of ['qsseda.com', 'qsseda.online', 'qsseda.studio']) {
      if (host === root || host.endsWith('.' + root)) return 'https://' + root;
    }
    return '/';
  }

  function showToast(message, error = false) {
    $('toast').textContent = message; $('toast').classList.toggle('error', error); $('toast').classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('show'), 2800);
  }
  function setSaveStatus(text) { $('storageStatus').textContent = `${text}${meta.dataFilePath ? ` · ${meta.dataFilePath}` : ''}`; }
  function persist(message = '已自动保存到云端') {
    setSaveStatus('正在保存到云端…');
    const snapshot = M.normalizeData(data);
    saveChain = saveChain.then(async () => {
      const response = await fetch('/api/cash/data', {
        method: 'PUT',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(snapshot)
      });
      if (!response.ok) {
        let detail = '';
        try { detail = (await response.json())?.error || ''; } catch {}
        throw new Error(detail || `HTTP ${response.status}`);
      }
      return response.json();
    }).then(result => {
      setSaveStatus(message); return result;
    }).catch(error => { setSaveStatus('保存失败'); showToast(`保存失败：${error.message}`, true); });
    return saveChain;
  }
  function recalculate() { model = M.calculateFinancialModel(data, { asOf: meta.today }); }
  function mutate(message = '已自动保存') { data = M.normalizeData(data); recalculate(); render(); return persist(message); }

  function categoryOptions(type, selected) {
    return M.CATEGORIES[type].map(x => `<option value="${x.id}"${x.id === selected ? ' selected' : ''}>${escapeHtml(x.name)}</option>`).join('');
  }
  function setTransactionCategory(type, selected = null) {
    const categories = M.CATEGORIES[type];
    $('txCategoryList').innerHTML = categories.map(x => `<option value="${escapeHtml(x.name)}" data-category-id="${x.id}"></option>`).join('');
    $('txCategory').value = selected ? M.categoryName(selected) : categories[0].name;
  }
  function transactionCategory(type) {
    const value = $('txCategory').value.trim();
    const known = M.CATEGORIES[type].find(x => x.id === value || x.name === value);
    return known?.id || value;
  }
  function setFreeCategoryField(inputId, listId, type, selected = null) {
    const categories = M.CATEGORIES[type];
    $(listId).innerHTML = categories.map(x => `<option value="${escapeHtml(x.name)}"></option>`).join('');
    $(inputId).value = selected ? M.categoryName(selected) : categories[0].name;
  }
  function freeCategory(inputId, type) {
    const value = $(inputId).value.trim();
    const known = M.CATEGORIES[type].find(x => x.id === value || x.name === value);
    return known?.id || value;
  }

  function render() {
    recalculate(); renderKpis(); renderForecastBreakdown(); renderBalanceChart(); renderBudget(); renderReserve(); renderTransactions(); renderCalendar(); renderRules(); renderRecurring(); renderPlans(); renderExpected(); renderMonthly();
    if ($('periodSummary')) $('periodSummary').textContent = `${data.settings.periodStart.replaceAll('-', '/')}—${data.settings.periodEnd.replaceAll('-', '/')} · ${model.dates.length} 天 · 真实账本、预算、计划与预测分层`;
    if ($('calendarTitle')) $('calendarTitle').textContent = `${model.dates.length} 天日历`;
    if ($('backToAertex')) $('backToAertex').href = mainSiteOrigin();
  }

  function renderKpis() {
    $('kCash').textContent = money(model.ledger.cashBalance, 2);
    $('kReserve').textContent = money(model.reserve.amount, 2);
    $('kReserveDetail').textContent = model.reserve.shortfall > 0
      ? `需求 ${money(model.reserve.requiredAmount, 2)} · 缺口 ${money(model.reserve.shortfall, 2)}`
      : `需求 ${money(model.reserve.requiredAmount, 2)} · 已全部覆盖`;
    $('kDisposable').textContent = money(model.disposableBalance, 2);
    $('kDisposable').className = model.disposableBalance < 500 ? 'negative' : '';
    $('kCredit').textContent = money(model.huabeiAvailable, 2);
    $('kCreditDetail').textContent = `总额度 ${money(model.emergencyCredit, 2)} · 已用 ${money(model.huabeiUsed, 2)} · 不计入现金`;
    $('kForecast').textContent = money(model.forecast.endBalance, 2);
    const month = model.budget.currentMonth;
    const target = M.roundMoney(month.foodBudget + month.socialBudget);
    const actual = M.roundMoney(month.foodActual + month.socialActual);
    const percent = target ? actual / target * 100 : 0;
    $('kBudget').textContent = `${percent.toFixed(0)}%`;
    $('kBudgetDetail').textContent = `${money(actual, 1)} / ${money(target, 1)}`;
    const warnings = [];
    if (model.reserve.shortfall > 0) warnings.push(`固定支出预留需求为 ${money(model.reserve.requiredAmount, 2)}，当前只覆盖 ${money(model.reserve.amount, 2)}，尚缺 ${money(model.reserve.shortfall, 2)}。`);
    if (model.disposableBalance < 500) warnings.push(`当前可支配余额为 ${money(model.disposableBalance)}，低于 500 元。`);
    if (model.recurring.overdue.length) warnings.push(`有 ${model.recurring.overdue.length} 项固定支出已过预计扣费时间但尚未在真实账本中匹配，现继续作为待覆盖预留。`);
    if (model.ledger.outOfPeriodTransactions.length) warnings.push(`检测到 ${model.ledger.outOfPeriodTransactions.length} 笔规划周期外交易；它们保留在数据中，但不会改变本周期的期初现金。`);
    $('notice').hidden = !warnings.length;
    $('notice').className = `notice${model.disposableBalance < 500 ? ' warning' : ''}`;
    $('notice').textContent = warnings.join(' ');
  }

  function renderForecastBreakdown() {
    const c = model.forecast.components;
    const rows = [
      ['当前真实现金', c.currentCash, 'base'],
      ['未来明确收入', c.plannedIncome, 'plus'],
      ['未来明确支出', -c.plannedExpense, 'minus'],
      ['已知日期固定支出', -c.knownRecurringExpense, 'minus'],
      ['未来餐饮预算', -c.futureFoodBudget, 'minus'],
      ['剩余社交交通预算', -c.socialBudgetReserve, 'minus'],
      ['未定日/逾期固定支出预留', -c.fixedReserve, 'minus'],
      ['未定日预期净额', c.expectedNet, c.expectedNet >= 0 ? 'plus' : 'minus']
    ];
    $('forecastBreakdown').innerHTML = rows.map(([label, value, kind]) => `<div class="formula-item ${kind}"><span>${label}</span><strong>${signed(value, 2)}</strong></div>`).join('') +
      `<div class="formula-equals"><span>预计期末现金</span><strong>${money(c.endBalance, 2)}</strong></div>`;
    $('forecastFormula').textContent = '只把有明确日期的项目放进每日曲线；周预算和未知扣费日预留只在最终余额中扣一次。';
  }

  function renderBalanceChart() {
    const days = model.forecast.daily, W = 1000, H = 300, L = 64, R = 22, T = 24, B = 38;
    const forecastValues = days.map(day => day.projectedCashBeforeReserve);
    const actualDays = days.filter(day => day.key <= model.asOf);
    const actualValues = actualDays.map(day => day.actualCashBalance);
    const all = [0, model.ledger.cashBalance, ...forecastValues, ...actualValues];
    let min = Math.min(...all), max = Math.max(...all); if (max === min) max += 1;
    const pad = Math.max((max - min) * .08, 100); min -= pad; max += pad;
    const x = index => days.length <= 1 ? (L + W - R) / 2 : L + index * (W - L - R) / (days.length - 1);
    const y = value => T + (max - value) * (H - T - B) / (max - min);
    let svg = '';
    for (let i = 0; i <= 4; i++) { const value = min + (max - min) * i / 4, yy = y(value); svg += `<line x1="${L}" y1="${yy}" x2="${W - R}" y2="${yy}" stroke="var(--grid)"/><text x="${L - 8}" y="${yy + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${Math.round(value)}</text>`; }
    const forecastPoints = forecastValues.map((value, index) => `${x(index).toFixed(1)},${y(value).toFixed(1)}`).join(' ');
    svg += `<polyline points="${forecastPoints}" fill="none" stroke="var(--forecast)" stroke-width="3" stroke-dasharray="7 6" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (actualDays.length > 1) {
      const actualPoints = actualDays.map(day => { const index = days.findIndex(x => x.key === day.key); return `${x(index).toFixed(1)},${y(day.actualCashBalance).toFixed(1)}`; }).join(' ');
      svg += `<polyline points="${actualPoints}" fill="none" stroke="var(--actual)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    } else svg += `<circle cx="${x(0)}" cy="${y(model.ledger.cashBalance)}" r="4" fill="var(--actual)"/>`;
    const labelKeys = [...new Set([days[0]?.key, ...days.filter(day => day.key.endsWith('-01')).map(day => day.key), days.at(-1)?.key].filter(Boolean))];
    labelKeys.forEach(key => { const index = days.findIndex(day => day.key === key); if (index >= 0) svg += `<text x="${x(index)}" y="${H - 9}" text-anchor="middle" font-size="11" fill="var(--muted)">${key.slice(5).replace('-', '/')}</text>`; });
    $('balanceChart').innerHTML = svg;
    $('balanceCaption').textContent = `曲线只显示有明确日期的现金路径；未定日固定支出 ${money(model.reserve.requiredAmount, 2)} 和社交预算 ${money(model.budget.socialBudgetReserve, 2)} 在期末公式中单独扣除。`;
  }

  function progressRow(label, actual, target) {
    const percent = target ? Math.min(100, actual / target * 100) : 0;
    return `<div class="budget-row"><span>${label}</span><progress class="progress" value="${percent}" max="100"></progress><strong>${money(actual, 1)} / ${money(target, 1)}</strong></div>`;
  }
  function renderBudget() {
    const month = model.budget.currentMonth;
    $('budgetTitle').textContent = `${month.month.replace('-', ' 年 ')} 月预算`;
    const socialTarget = month.socialBudget;
    $('budgetExecution').innerHTML = progressRow('餐饮', month.foodActual, month.foodBudget) + progressRow('社交交通', month.socialActual, socialTarget) + `<div class="row-list"><div class="summary-row"><span>餐饮未来预算</span><strong>${money(month.foodForecast, 1)}</strong></div><div class="summary-row"><span>社交交通剩余周预算</span><strong>${money(month.socialRemaining, 1)}</strong></div></div>`;
  }
  function renderReserve() {
    const overdue = model.recurring.overdue.length ? `<div class="summary-row"><span>已过预计扣费日、仍待确认</span><strong class="negative">${model.recurring.overdue.length} 项</strong></div>` : '';
    $('reserveSummary').innerHTML = `<div class="summary-row"><span>固定支出预留需求</span><strong>${money(model.reserve.requiredAmount, 2)}</strong></div><div class="summary-row"><span>当前现金已覆盖</span><strong>${money(model.reserve.amount, 2)}</strong></div><div class="summary-row"><span>尚未覆盖缺口</span><strong class="${model.reserve.shortfall > 0 ? 'negative' : ''}">${money(model.reserve.shortfall, 2)}</strong></div>${overdue}`;
  }

  function renderTransactions() {
    const transactions = data.transactions.slice().sort((a, b) => b.date.localeCompare(a.date));
    $('transactionCount').textContent = `${transactions.length} 笔实际`;
    $('emptyLedger').hidden = transactions.length > 0;
    $('transactionBody').innerHTML = transactions.map(tx => {
      const huabei = M.huabeiPart(tx), cash = tx.type === 'income' ? tx.amount : M.roundMoney(tx.amount - huabei);
      const payment = tx.type === 'income' ? `现金 ${money(cash, 2)}` : `${cash > 0 ? `现金 ${money(cash, 2)}` : ''}${cash > 0 && huabei > 0 ? '<br>' : ''}${huabei > 0 ? `花呗 ${money(huabei, 2)}` : ''}`;
      return `<tr><td>${tx.date}</td><td><span class="badge actual-badge">实际${tx.type === 'income' ? '收入' : '支出'}</span></td><td class="${tx.type === 'income' ? 'positive' : 'negative'}">${tx.type === 'income' ? '+' : '-'}${money(tx.amount, 2)}</td><td>${payment}</td><td>${escapeHtml(M.categoryName(tx.category))}</td><td>${escapeHtml(tx.note || '—')}</td><td><button class="table-action" data-edit-tx="${tx.id}">编辑</button><button class="table-action danger" data-delete-tx="${tx.id}">删除</button></td></tr>`;
    }).join('');
    document.querySelectorAll('[data-edit-tx]').forEach(button => button.addEventListener('click', () => openTransaction(data.transactions.find(x => x.id === button.dataset.editTx))));
    document.querySelectorAll('[data-delete-tx]').forEach(button => button.addEventListener('click', () => deleteTransaction(button.dataset.deleteTx)));
  }

  function renderCalendar() {
    const monthNames = [...new Set(model.dates.map(M.monthKey))], weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    $('calendar').innerHTML = monthNames.map(month => {
      const days = model.forecast.daily.filter(day => day.month === month);
      const blanks = Array(M.parseDateKey(days[0].key).getUTCDay()).fill('<span></span>').join('');
      const buttons = days.map(day => {
        const actual = day.statuses.actual.length > 0;
        const planned = day.statuses.planned.some(x => !x.replaced);
        const forecast = day.statuses.forecast.foodForecast > 0 || day.statuses.forecast.knownRecurringItems.length > 0;
        const dow = M.parseDateKey(day.key).getUTCDay();
        const deltaLabel = day.key <= model.asOf ? '实际现金变化' : '预测变化';
        return `<button class="day${dow === 0 || dow === 6 ? ' weekend' : ''}" data-day="${day.key}" title="${deltaLabel} ${signed(day.displayDelta, 2)}"><span>${Number(day.key.slice(-2))}</span><span class="amount">${signed(day.displayDelta, 0)}</span><span class="day-statuses">${actual ? '<b class="status-dot actual"></b>' : ''}${planned ? '<b class="status-dot plan"></b>' : ''}${forecast ? '<b class="status-dot forecast"></b>' : ''}</span></button>`;
      }).join('');
      return `<div class="calendar-month"><h3>${month.replace('-', ' 年 ')} 月</h3><div class="weekday-row">${weekdays.map(x => `<span>${x}</span>`).join('')}</div><div class="month-days">${blanks}${buttons}</div></div>`;
    }).join('');
    document.querySelectorAll('[data-day]').forEach(button => button.addEventListener('click', () => openDay(button.dataset.day)));
  }

  function renderRules() {
    const mapping = {
      periodStart: data.settings.periodStart,
      periodEnd: data.settings.periodEnd,
      manualEntryEnd: data.settings.manualEntryEnd,
      oddMondayAnchor: data.settings.oddMondayAnchor,
      openingCash: data.settings.openingCash,
      emergencyCredit: data.settings.emergencyCredit,
      foodClassDay: data.budgetRules.foodByDayType.classDay,
      foodOddMonday: data.budgetRules.foodByDayType.oddMonday,
      foodEvenMonday: data.budgetRules.foodByDayType.evenMonday,
      foodSaturday: data.budgetRules.foodByDayType.saturday,
      foodSunday: data.budgetRules.foodByDayType.sunday,
      socialVisits: data.budgetRules.socialTransport.weeklyVisits,
      socialMedian: data.budgetRules.socialTransport.medianPerVisit,
      socialMin: data.budgetRules.socialTransport.minPerVisit,
      socialMax: data.budgetRules.socialTransport.maxPerVisit
    };
    for (const [id, value] of Object.entries(mapping)) $(id).value = value;
  }
  function renderRecurring() {
    $('recurringEditor').innerHTML = data.recurringExpenses.map(item => `<section class="recurring-card">
      <div class="recurring-card-head">
        <label class="toggle-field"><input data-recurring-enabled="${item.id}" aria-label="启用" type="checkbox"${item.enabled ? ' checked' : ''}><span>启用这项周期支出</span></label>
        <button class="button danger-button" type="button" data-delete-recurring="${item.id}">删除</button>
      </div>
      <div class="recurring-grid">
        <label class="mini-field recurring-name-field"><span>名称 <em>可修改</em></span><input data-recurring-name="${item.id}" aria-label="名称" type="text" maxlength="80" value="${escapeHtml(item.name)}"></label>
        <label class="mini-field"><span>分类 <em>可修改</em></span><input data-recurring-category="${item.id}" aria-label="分类" type="text" maxlength="80" value="${escapeHtml(item.category)}"></label>
        <label class="mini-field"><span>金额 <em>可修改</em></span><input data-recurring-amount="${item.id}" aria-label="金额" type="number" min="0" step="0.01" value="${item.amount}"></label>
        <label class="mini-field"><span>每月扣费日 <em>可修改</em></span><input data-recurring-day="${item.id}" aria-label="扣费日" type="number" min="1" max="31" placeholder="留空表示待定" value="${item.dayOfMonth || ''}"></label>
        <label class="toggle-field recurring-reserve-field"><input data-recurring-reserve="${item.id}" type="checkbox"${item.reserveWhenUndated ? ' checked' : ''}><span>扣费日未知时仍预留金额</span></label>
      </div>
    </section>`).join('');

    document.querySelectorAll('[data-recurring-enabled]').forEach(el => el.addEventListener('change', () => {
      data.recurringExpenses.find(x => x.id === el.dataset.recurringEnabled).enabled = el.checked;
      mutate('周期支出已保存到云端');
    }));
    document.querySelectorAll('[data-recurring-name]').forEach(el => el.addEventListener('change', () => {
      const item = data.recurringExpenses.find(x => x.id === el.dataset.recurringName);
      item.name = el.value.trim() || '周期支出';
      mutate('周期支出名称已保存到云端');
    }));
    document.querySelectorAll('[data-recurring-category]').forEach(el => el.addEventListener('change', () => {
      const item = data.recurringExpenses.find(x => x.id === el.dataset.recurringCategory);
      item.category = el.value.trim() || 'otherExpense';
      mutate('周期支出分类已保存到云端');
    }));
    document.querySelectorAll('[data-recurring-amount]').forEach(el => el.addEventListener('change', () => {
      const item = data.recurringExpenses.find(x => x.id === el.dataset.recurringAmount);
      item.amount = amount(el, item.amount);
      mutate('周期支出金额已保存到云端');
    }));
    document.querySelectorAll('[data-recurring-day]').forEach(el => el.addEventListener('change', () => {
      const item = data.recurringExpenses.find(x => x.id === el.dataset.recurringDay);
      const day = Number(el.value);
      item.dayOfMonth = Number.isInteger(day) && day >= 1 && day <= 31 ? day : null;
      mutate('扣费规则已保存到云端');
    }));
    document.querySelectorAll('[data-recurring-reserve]').forEach(el => el.addEventListener('change', () => {
      const item = data.recurringExpenses.find(x => x.id === el.dataset.recurringReserve);
      item.reserveWhenUndated = el.checked;
      mutate('预留规则已保存到云端');
    }));
    document.querySelectorAll('[data-delete-recurring]').forEach(el => el.addEventListener('click', () => {
      if (!confirm('确定删除这项周期支出吗？')) return;
      data.recurringExpenses = data.recurringExpenses.filter(x => x.id !== el.dataset.deleteRecurring);
      mutate('周期支出已删除');
    }));
  }

  function addRecurring() {
    data.recurringExpenses.push({
      id: M.uid('recurring'),
      name: '新周期支出',
      category: 'otherExpense',
      amount: 0,
      frequency: 'monthly',
      dayOfMonth: null,
      reserveWhenUndated: true,
      enabled: true
    });
    mutate('已新增周期支出');
  }

  function planStatus(plan) {
    if (!plan.enabled) return '<span class="badge budget-badge">已停用</span>';
    const day = model.forecast.daily.find(x => x.key === plan.date);
    const resolved = day?.statuses.planned.find(x => x.id === plan.id);
    if (resolved?.replaced) return '<span class="badge actual-badge">已由实际替换</span>';
    if (plan.date <= model.asOf) return '<span class="badge budget-badge">已到期</span>';
    return '<span class="badge plan-badge">计划</span>';
  }
  function renderPlans() {
    const plans = data.plannedEvents.slice().sort((a, b) => a.date.localeCompare(b.date));
    $('planCount').textContent = `${plans.length} 项计划`;
    $('planBody').innerHTML = plans.map(plan => `<tr><td>${plan.date}</td><td>${plan.type === 'income' ? '收入' : '支出'}</td><td class="${plan.type === 'income' ? 'positive' : 'negative'}">${plan.type === 'income' ? '+' : '-'}${money(plan.amount, 2)}</td><td>${escapeHtml(M.categoryName(plan.category))}</td><td>${escapeHtml(plan.note || '—')}</td><td>${planStatus(plan)}</td><td><button class="table-action" data-edit-plan="${plan.id}">编辑</button><button class="table-action danger" data-delete-plan="${plan.id}">删除</button></td></tr>`).join('');
    document.querySelectorAll('[data-edit-plan]').forEach(button => button.addEventListener('click', () => openPlan(data.plannedEvents.find(x => x.id === button.dataset.editPlan))));
    document.querySelectorAll('[data-delete-plan]').forEach(button => button.addEventListener('click', () => deletePlan(button.dataset.deletePlan)));
  }

  function renderMonthly() {
    $('monthBody').innerHTML = model.monthly.map(x => `<tr><td>${x.month.replace('-', '/')}</td><td>${money(x.actualIncome, 1)}</td><td>${money(x.actualExpense, 1)}</td><td>${money(x.plannedIncome, 1)}</td><td>${money(x.plannedExpense, 1)}</td><td>${money(x.foodBudget, 1)} / ${money(x.foodActual, 1)}</td><td>${money(x.socialBudget, 1)} / ${money(x.socialActual, 1)}</td><td>${money(x.reserved, 1)}</td></tr>`).join('');
    const W = 900, H = 280, L = 52, R = 18, T = 24, B = 40;
    const values = model.monthly.flatMap(x => [x.actualExpense, x.plannedExpense, x.foodForecast + x.socialRemaining, x.reserved]);
    const max = Math.max(1, ...values) * 1.12, group = (W - L - R) / model.monthly.length;
    const y = value => T + (max - value) * (H - T - B) / max, barHeight = value => Math.max(0, H - B - y(value));
    const colors = ['var(--actual)', 'var(--plan)', 'var(--budget)', 'var(--forecast)'];
    let svg = '';
    for (let i = 0; i <= 4; i++) { const value = max * i / 4, yy = y(value); svg += `<line x1="${L}" y1="${yy}" x2="${W - R}" y2="${yy}" stroke="var(--grid)"/><text x="${L - 7}" y="${yy + 4}" text-anchor="end" font-size="10" fill="var(--muted)">${Math.round(value)}</text>`; }
    model.monthly.forEach((month, index) => {
      const center = L + group * (index + .5), width = Math.min(24, group * .15);
      [month.actualExpense, month.plannedExpense, month.foodForecast + month.socialRemaining, month.reserved].forEach((value, i) => { svg += `<rect x="${center + (i - 2) * (width + 3)}" y="${y(value)}" width="${width}" height="${barHeight(value)}" rx="3" fill="${colors[i]}"/>`; });
      svg += `<text x="${center}" y="${H - 12}" text-anchor="middle" font-size="11" fill="var(--muted)">${month.month.replace('-', '/')}</text>`;
    });
    $('monthlyChart').innerHTML = svg;
  }

  function openTransaction(transaction = null, date = null) {
    editingTransactionId = transaction?.id || null;
    $('transactionTitle').textContent = transaction ? '编辑真实收支' : '新增真实收支';
    $('txDate').min = data.settings.periodStart; $('txDate').max = meta.today;
    $('txDate').value = transaction?.date || date || meta.today;
    $('txType').value = transaction?.type || 'expense';
    setTransactionCategory($('txType').value, transaction?.category);
    $('txAmount').value = transaction?.amount || ''; $('txHuabeiAmount').value = transaction?.huabeiAmount || 0; $('txNote').value = transaction?.note || '';
    updateTransactionPaymentFields();
    $('txValidation').hidden = true; $('transactionDialog').showModal();
  }
  function saveTransaction(event) {
    event.preventDefault(); const date = normalizeDateInput($('txDate').value), value = amount($('txAmount'), -1), type = $('txType').value;
    const huabeiAmount = type === 'expense' ? amount($('txHuabeiAmount'), -1) : 0;
    if (!isActualDateAllowed(date)) { $('txValidation').hidden = false; $('txValidation').textContent = `请输入 ${data.settings.periodStart} 至 ${meta.today < data.settings.periodEnd ? meta.today : data.settings.periodEnd} 之间的日期。期初现金已经代表周期开始时的余额，周期外交易不会再次参与计算。`; return; }
    if (!(value > 0)) { $('txValidation').hidden = false; $('txValidation').textContent = '金额必须大于 0。'; return; }
    if (huabeiAmount < 0 || huabeiAmount > value) { $('txValidation').hidden = false; $('txValidation').textContent = '花呗消费金额不能大于本笔支出金额。'; return; }
    const existing = data.transactions.find(x => x.id === editingTransactionId);
    const availableForThisEntry = M.roundMoney(data.settings.emergencyCredit - model.huabeiUsed + (existing ? M.huabeiPart(existing) : 0));
    if (huabeiAmount > availableForThisEntry) { $('txValidation').hidden = false; $('txValidation').textContent = `花呗可用额度不足，本笔最多可记 ${money(Math.max(0, availableForThisEntry), 2)}。`; return; }
    const category = transactionCategory(type);
    if (!category) { $('txValidation').hidden = false; $('txValidation').textContent = '请输入或选择分类。'; return; }
    const transaction = { id: editingTransactionId || M.uid('tx'), date, type, amount: value, huabeiAmount, category, note: $('txNote').value.trim() };
    const index = data.transactions.findIndex(x => x.id === editingTransactionId); if (index >= 0) data.transactions[index] = transaction; else data.transactions.push(transaction);
    $('transactionDialog').close(); mutate('真实账本已保存');
  }
  function updateTransactionPaymentFields() {
    const expense = $('txType').value === 'expense';
    $('txHuabeiField').hidden = !expense;
    $('txHuabeiAmount').disabled = !expense;
    if (!expense) $('txHuabeiAmount').value = 0;
  }
  function deleteTransaction(id) { if (!confirm('确定删除这笔真实交易吗？')) return; data.transactions = data.transactions.filter(x => x.id !== id); mutate('真实交易已删除'); }

  function openPlan(plan = null, date = null) {
    editingPlanId = plan?.id || null; $('planTitle').textContent = plan ? '编辑明确日期计划' : '新增明确日期计划';
    $('planDate').min = data.settings.periodStart; $('planDate').max = data.settings.periodEnd; $('planDate').value = plan?.date || date || data.settings.periodStart;
    $('planType').value = plan?.type || 'expense'; setFreeCategoryField('planCategory', 'planCategoryList', $('planType').value, plan?.category);
    $('planAmount').value = plan?.amount || ''; $('planNote').value = plan?.note || ''; $('planEnabled').checked = plan?.enabled !== false; $('planDialog').showModal();
  }
  function savePlan(event) {
    event.preventDefault(); const value = amount($('planAmount'), -1), date = $('planDate').value;
    if (!M.parseDateKey(date) || date < data.settings.periodStart || date > data.settings.periodEnd || !(value > 0)) return showToast('请填写周期内日期和有效金额', true);
    const category = freeCategory('planCategory', $('planType').value);
    if (!category) return showToast('请填写计划分类', true);
    const existing = data.plannedEvents.find(x => x.id === editingPlanId);
    const plan = { id: editingPlanId || M.uid('plan'), date, type: $('planType').value, amount: value, category, note: $('planNote').value.trim(), source: existing?.source || 'manual', enabled: $('planEnabled').checked };
    const index = data.plannedEvents.findIndex(x => x.id === editingPlanId); if (index >= 0) data.plannedEvents[index] = plan; else data.plannedEvents.push(plan);
    $('planDialog').close(); mutate('计划已保存');
  }
  function deletePlan(id) { if (!confirm('确定删除这项计划吗？')) return; data.plannedEvents = data.plannedEvents.filter(x => x.id !== id); mutate('计划已删除'); }

  function renderExpected() {
    const items = data.expectedEvents.slice().sort((a, b) => a.expectedMonth.localeCompare(b.expectedMonth));
    $('expectedCount').textContent = `${items.length} 项预期`;
    $('emptyExpected').hidden = items.length > 0;
    $('expectedBody').innerHTML = items.map(item => `<tr>
      <td>${item.expectedMonth}</td>
      <td>${item.type === 'income' ? '收入' : '支出'}</td>
      <td class="${item.type === 'income' ? 'positive' : 'negative'}">${item.type === 'income' ? '+' : '-'}${money(item.amount, 2)}</td>
      <td>${escapeHtml(M.categoryName(item.category))}</td>
      <td>${escapeHtml(item.note || '—')}</td>
      <td><span class="badge ${item.enabled ? 'plan-badge' : 'budget-badge'}">${item.enabled ? '启用' : '停用'}</span></td>
      <td><button class="table-action" type="button" data-edit-expected="${item.id}">编辑</button><button class="table-action danger" type="button" data-delete-expected="${item.id}">删除</button></td>
    </tr>`).join('');
    document.querySelectorAll('[data-edit-expected]').forEach(button => button.addEventListener('click', () => openExpected(data.expectedEvents.find(x => x.id === button.dataset.editExpected))));
    document.querySelectorAll('[data-delete-expected]').forEach(button => button.addEventListener('click', () => deleteExpected(button.dataset.deleteExpected)));
  }

  function openExpected(item = null) {
    editingExpectedId = item?.id || null;
    $('expectedTitle').textContent = item ? '编辑未定日期预期' : '新增未定日期预期';
    $('expectedMonth').min = M.monthKey(data.settings.periodStart);
    $('expectedMonth').max = M.monthKey(data.settings.periodEnd);
    $('expectedMonth').value = item?.expectedMonth || M.monthKey(data.settings.periodStart);
    $('expectedType').value = item?.type || 'income';
    setFreeCategoryField('expectedCategory', 'expectedCategoryList', $('expectedType').value, item?.category);
    $('expectedAmount').value = item?.amount || '';
    $('expectedNote').value = item?.note || '';
    $('expectedEnabled').checked = item?.enabled !== false;
    $('expectedDialog').showModal();
  }

  function saveExpected(event) {
    event.preventDefault();
    const expectedMonth = $('expectedMonth').value;
    const value = amount($('expectedAmount'), -1);
    const type = $('expectedType').value;
    const category = freeCategory('expectedCategory', type);
    if (!/^\d{4}-\d{2}$/.test(expectedMonth) || expectedMonth < M.monthKey(data.settings.periodStart) || expectedMonth > M.monthKey(data.settings.periodEnd)) {
      return showToast('请选择规划周期内的预计月份', true);
    }
    if (!(value > 0) || !category) return showToast('请填写有效金额和分类', true);
    const item = {
      id: editingExpectedId || M.uid('expected'),
      expectedMonth,
      type,
      amount: value,
      category,
      note: $('expectedNote').value.trim(),
      enabled: $('expectedEnabled').checked
    };
    const index = data.expectedEvents.findIndex(x => x.id === editingExpectedId);
    if (index >= 0) data.expectedEvents[index] = item; else data.expectedEvents.push(item);
    $('expectedDialog').close();
    mutate('未定日期预期已保存到云端');
  }

  function deleteExpected(id) {
    if (!confirm('确定删除这项未定日期预期吗？')) return;
    data.expectedEvents = data.expectedEvents.filter(x => x.id !== id);
    mutate('未定日期预期已删除');
  }

  function openDay(key) {
    selectedDay = key; const day = model.forecast.daily.find(x => x.key === key);
    const dayTypeLabels = { classDay: '普通上课日', oddMonday: '单周周一', evenMonday: '双周周一', saturday: '周六', sunday: '周日' };
    const actualIncome = M.roundMoney(day.statuses.actual.filter(x => x.type === 'income').reduce((sum, x) => sum + x.amount, 0));
    const actualExpense = M.roundMoney(day.statuses.actual.filter(x => x.type === 'expense').reduce((sum, x) => sum + x.amount, 0));
    const isActualDay = key <= model.asOf;
    $('dayTitle').textContent = key;
    $('daySubtitle').textContent = isActualDay
      ? `${dayTypeLabels[day.dayType]} · 实际现金变化 ${signed(day.actualDelta, 2)} · 收入 ${money(actualIncome, 2)} · 支出 ${money(actualExpense, 2)}`
      : `${dayTypeLabels[day.dayType]} · 当日预测变化 ${signed(day.projectedDelta, 2)}`;
    const actual = day.statuses.actual.length ? day.statuses.actual.map(x => `<p>${x.type === 'income' ? '+' : '-'}${money(x.amount, 2)} · ${escapeHtml(M.categoryName(x.category))}${M.huabeiPart(x) ? ` · 花呗 ${money(M.huabeiPart(x), 2)}` : ''} ${escapeHtml(x.note)}</p>`).join('') : '<p>无真实交易</p>';
    const planned = day.statuses.planned.length ? day.statuses.planned.map(x => `<p>${x.replaced ? '已替换' : x.type === 'income' ? '+' : '-'}${x.replaced ? ' · ' : money(x.amount, 2) + ' · '}${escapeHtml(x.note)}</p>`).join('') : '<p>无明确日期计划</p>';
    const forecast = `<p>餐饮预算 ${money(day.statuses.forecast.foodBudget, 1)}${day.statuses.forecast.foodForecast ? ` · 未来需预留 ${money(day.statuses.forecast.foodForecast, 1)}` : ' · 当日不再产生餐饮预测'}</p><p>本周剩余社交交通预算 ${money(day.statuses.forecast.weeklySocialRemaining, 1)} · 仅按周保留，不伪造成当天支出</p>${day.statuses.forecast.knownRecurringItems.map(x => `<p>${escapeHtml(x.name)} ${money(x.remaining, 1)}</p>`).join('')}`;
    $('dayLayers').innerHTML = `<section class="day-layer actual"><h3>实际</h3>${actual}</section><section class="day-layer plan"><h3>计划</h3>${planned}</section><section class="day-layer forecast"><h3>预测</h3>${forecast}</section>`;
    $('transactionForDay').disabled = !isActualDateAllowed(key); $('dayDialog').showModal();
  }

  function bindRuleInputs() {
    const dateFields = {
      periodStart: 'periodStart',
      periodEnd: 'periodEnd',
      manualEntryEnd: 'manualEntryEnd',
      oddMondayAnchor: 'oddMondayAnchor'
    };
    for (const [id, key] of Object.entries(dateFields)) {
      $(id).addEventListener('change', () => {
        const value = $(id).value;
        if (!M.parseDateKey(value)) return renderRules();
        data.settings[key] = value;
        data = M.normalizeData(data);
        mutate('规划日期已保存到云端');
      });
    }

    const bindings = {
      openingCash: () => data.settings.openingCash, emergencyCredit: () => data.settings.emergencyCredit,
      foodClassDay: () => data.budgetRules.foodByDayType.classDay, foodOddMonday: () => data.budgetRules.foodByDayType.oddMonday,
      foodEvenMonday: () => data.budgetRules.foodByDayType.evenMonday, foodSaturday: () => data.budgetRules.foodByDayType.saturday,
      foodSunday: () => data.budgetRules.foodByDayType.sunday, socialVisits: () => data.budgetRules.socialTransport.weeklyVisits,
      socialMedian: () => data.budgetRules.socialTransport.medianPerVisit, socialMin: () => data.budgetRules.socialTransport.minPerVisit, socialMax: () => data.budgetRules.socialTransport.maxPerVisit
    };
    const setters = {
      openingCash: v => data.settings.openingCash = v, emergencyCredit: v => data.settings.emergencyCredit = v,
      foodClassDay: v => data.budgetRules.foodByDayType.classDay = v, foodOddMonday: v => data.budgetRules.foodByDayType.oddMonday = v,
      foodEvenMonday: v => data.budgetRules.foodByDayType.evenMonday = v, foodSaturday: v => data.budgetRules.foodByDayType.saturday = v,
      foodSunday: v => data.budgetRules.foodByDayType.sunday = v, socialVisits: v => data.budgetRules.socialTransport.weeklyVisits = v,
      socialMedian: v => data.budgetRules.socialTransport.medianPerVisit = v, socialMin: v => data.budgetRules.socialTransport.minPerVisit = v, socialMax: v => data.budgetRules.socialTransport.maxPerVisit = v
    };
    for (const id of Object.keys(bindings)) $(id).addEventListener('change', () => { setters[id](amount($(id), bindings[id]())); mutate('预算规则已保存到云端'); });
  }

  function downloadText(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function exportBackup() {
    downloadText('AERTEX-Cash-Backup.json', M.serializeData(data), 'application/json;charset=utf-8');
    showToast('备份已导出');
  }
  function importBackup() { $('importFile').click(); }
  async function handleImportFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      data = M.parseData(await file.text());
      render();
      await persist('导入数据已保存到云端');
      showToast('备份导入成功');
    } catch (error) {
      showToast(`导入失败：${error.message}`, true);
    }
  }
  async function exportCsv() {
    downloadText('AERTEX-Cash-Ledger.csv', M.transactionsToCsv(data), 'text/csv;charset=utf-8');
    showToast('真实账本 CSV 已导出');
  }

  function openAdvancedData() {
    $('advancedJson').value = M.serializeData(data);
    $('advancedValidation').hidden = true;
    $('advancedDialog').showModal();
  }
  function refreshAdvancedData() {
    $('advancedJson').value = M.serializeData(data);
    $('advancedValidation').hidden = true;
  }
  async function applyAdvancedData() {
    try {
      data = M.parseData($('advancedJson').value);
      render();
      await persist('高级数据已保存到云端');
      $('advancedDialog').close();
      showToast('完整数据已应用');
    } catch (error) {
      $('advancedValidation').hidden = false;
      $('advancedValidation').textContent = `JSON 无法应用：${error.message}`;
    }
  }

  async function initialize() {
    meta.today = localDateKey();
    meta.dataFilePath = 'AERTEX Cloud';
    const response = await fetch('/api/cash/data', {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { accept: 'application/json' }
    });
    if (response.status === 404) {
      data = M.createDefaultData();
      await persist('已创建云端现金流数据');
    } else {
      if (!response.ok) {
        let detail = '';
        try { detail = (await response.json())?.error || ''; } catch {}
        throw new Error(detail || `HTTP ${response.status}`);
      }
      const payload = await response.json();
      data = M.parseData(payload.data);
      setSaveStatus('云端数据已载入');
    }
    render();
  }

  $('addTransaction').addEventListener('click', () => openTransaction()); $('addPlan').addEventListener('click', () => openPlan());
  $('addRecurring').addEventListener('click', addRecurring); $('addExpected').addEventListener('click', () => openExpected());
  $('transactionForm').addEventListener('submit', saveTransaction); $('planForm').addEventListener('submit', savePlan); $('expectedForm').addEventListener('submit', saveExpected);
  $('txType').addEventListener('change', () => { setTransactionCategory($('txType').value); updateTransactionPaymentFields(); });
  $('planType').addEventListener('change', () => setFreeCategoryField('planCategory', 'planCategoryList', $('planType').value));
  $('expectedType').addEventListener('change', () => setFreeCategoryField('expectedCategory', 'expectedCategoryList', $('expectedType').value));
  document.querySelectorAll('.close-dialog').forEach(x => x.addEventListener('click', () => $('transactionDialog').close()));
  document.querySelectorAll('.close-plan').forEach(x => x.addEventListener('click', () => $('planDialog').close()));
  document.querySelectorAll('.close-expected').forEach(x => x.addEventListener('click', () => $('expectedDialog').close()));
  $('closeDay').addEventListener('click', () => $('dayDialog').close());
  $('transactionForDay').addEventListener('click', () => { $('dayDialog').close(); openTransaction(null, selectedDay); });
  $('planForDay').addEventListener('click', () => { $('dayDialog').close(); openPlan(null, selectedDay); });
  $('exportBackup').addEventListener('click', exportBackup); $('importBackup').addEventListener('click', importBackup); $('exportCsv').addEventListener('click', exportCsv);
  $('importFile').addEventListener('change', handleImportFile);
  $('advancedData').addEventListener('click', openAdvancedData);
  $('closeAdvanced').addEventListener('click', () => $('advancedDialog').close());
  $('refreshAdvanced').addEventListener('click', refreshAdvancedData);
  $('applyAdvanced').addEventListener('click', applyAdvancedData);
  bindRuleInputs();
  window.addEventListener('error', event => console.error('Renderer error:', event.error || event.message));
  initialize().catch(error => { setSaveStatus('载入失败'); showToast(`无法载入账本：${error.message}`, true); console.error(error); });
})();
