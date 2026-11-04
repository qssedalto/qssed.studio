(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CashflowModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const PERIOD_START = '2026-10-01';
  const PERIOD_END = '2027-01-13';
  const MANUAL_ENTRY_END = '2026-10-07';
  const ODD_MONDAY_ANCHOR = '2026-10-12';
  const DAY_MS = 86400000;
  const TUTOR_DATES = Object.freeze([
    '2026-10-11', '2026-10-17', '2026-10-18', '2026-10-24', '2026-10-25', '2026-10-31',
    '2026-11-01', '2026-11-07', '2026-11-08', '2026-11-14', '2026-11-15',
    '2026-11-21', '2026-11-22', '2026-11-28', '2026-11-29', '2026-12-05',
    '2026-12-06', '2026-12-12', '2026-12-13', '2026-12-19', '2026-12-20',
    '2026-12-26', '2026-12-27'
  ]);
  const CATEGORIES = Object.freeze({
    income: Object.freeze([
      { id: 'tutoringIncome', name: '家教收入' }, { id: 'familyRepayment', name: '家人还款' },
      { id: 'salary', name: '工资/劳务' }, { id: 'otherIncome', name: '其他收入' }
    ]),
    expense: Object.freeze([
      { id: 'food', name: '餐饮' }, { id: 'socialTransport', name: '社交交通' },
      { id: 'tutoringTransport', name: '家教交通' }, { id: 'installment', name: '月供/Apple/iCloud' },
      { id: 'electronics', name: '电子消费支出' },
      { id: 'electricity', name: '电费' }, { id: 'water', name: '水费' },
      { id: 'phone', name: '话费' }, { id: 'chatgpt', name: 'ChatGPT' },
      { id: 'otherExpense', name: '其他支出' }
    ])
  });

  function parseDateKey(key) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key));
    if (!match) return null;
    const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    return isoDate(date) === key ? date : null;
  }
  function isoDate(date) { return date.toISOString().slice(0, 10); }
  function addDays(date, count) { return new Date(date.getTime() + count * DAY_MS); }
  function monthKey(value) {
    const date = typeof value === 'string' ? parseDateKey(value) : value;
    return date ? `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}` : '';
  }
  function monthEndKey(month) {
    const [year, monthNumber] = String(month).split('-').map(Number);
    if (!year || !monthNumber) return '';
    const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
    return `${month}-${String(lastDay).padStart(2, '0')}`;
  }
  function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }
  function finiteAmount(value, fallback = 0) {
    const amount = finiteNumber(value, fallback);
    return amount >= 0 ? amount : fallback;
  }
  function roundMoney(value) { return Math.round((Number(value) + Number.EPSILON) * 100) / 100; }
  function dateRange(startKey = PERIOD_START, endKey = PERIOD_END) {
    const start = parseDateKey(startKey), end = parseDateKey(endKey), dates = [];
    if (!start || !end || start > end) return dates;
    for (let date = start; date <= end; date = addDays(date, 1)) dates.push(isoDate(date));
    return dates;
  }
  function isOddMonday(key, anchorKey = ODD_MONDAY_ANCHOR) {
    const date = typeof key === 'string' ? parseDateKey(key) : key;
    const rawAnchor = parseDateKey(anchorKey) || parseDateKey(ODD_MONDAY_ANCHOR);
    if (!date || date.getUTCDay() !== 1) return false;
    const anchorOffset = (rawAnchor.getUTCDay() + 6) % 7;
    const anchorMonday = addDays(rawAnchor, -anchorOffset);
    const diff = Math.round((date.getTime() - anchorMonday.getTime()) / DAY_MS);
    return diff % 14 === 0;
  }
  function weekKey(key) {
    const date = parseDateKey(key);
    const offset = (date.getUTCDay() + 6) % 7;
    return isoDate(addDays(date, -offset));
  }
  function dayType(key, anchorKey = ODD_MONDAY_ANCHOR) {
    const date = parseDateKey(key), dow = date.getUTCDay();
    if (dow === 1) return isOddMonday(date, anchorKey) ? 'oddMonday' : 'evenMonday';
    if (dow === 6) return 'saturday';
    if (dow === 0) return 'sunday';
    return 'classDay';
  }
  function uid(prefix = 'item') {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function createDefaultData() {
    return {
      version: 4,
      settings: {
        periodStart: PERIOD_START,
        periodEnd: PERIOD_END,
        manualEntryEnd: MANUAL_ENTRY_END,
        oddMondayAnchor: ODD_MONDAY_ANCHOR,
        openingCash: 0,
        emergencyCredit: 0
      },
      transactions: [],
      plannedEvents: [],
      expectedEvents: [],
      recurringExpenses: [],
      budgetRules: {
        foodByDayType: { classDay: 0, oddMonday: 0, evenMonday: 0, saturday: 0, sunday: 0 },
        socialTransport: { weeklyVisits: 0, medianPerVisit: 0, minPerVisit: 0, maxPerVisit: 0 }
      }
    };
  }

  function normalizeItem(item, typeFallback = 'expense') {
    const type = item?.type === 'income' ? 'income' : item?.type === 'expense' ? 'expense' : typeFallback;
    const amount = finiteAmount(item?.amount);
    const huabeiAmount = type === 'expense' ? Math.min(amount, finiteAmount(item?.huabeiAmount)) : 0;
    return {
      id: String(item?.id || uid(type === 'income' ? 'income' : 'expense')),
      date: parseDateKey(item?.date) ? item.date : '', type,
      amount, huabeiAmount: roundMoney(huabeiAmount), category: String(item?.category || (type === 'income' ? 'otherIncome' : 'otherExpense')),
      note: String(item?.note || ''),
      linkedPlanId: item?.linkedPlanId ? String(item.linkedPlanId) : null,
      linkedRecurringId: item?.linkedRecurringId ? String(item.linkedRecurringId) : null,
      linkedRecurringMonth: /^\d{4}-\d{2}$/.test(String(item?.linkedRecurringMonth || '')) ? String(item.linkedRecurringMonth) : null
    };
  }
  // 先把旧存档与不完整输入归一化到稳定数据结构，后续金额与日期算法才不必在每个分支重复处理缺失字段。
  function normalizeData(input) {
    const base = createDefaultData(), source = input && typeof input === 'object' ? input : {};
    const settings = { ...base.settings, ...(source.settings || {}) };
    settings.periodStart = parseDateKey(settings.periodStart) ? settings.periodStart : PERIOD_START;
    settings.periodEnd = parseDateKey(settings.periodEnd) ? settings.periodEnd : PERIOD_END;
    settings.manualEntryEnd = parseDateKey(settings.manualEntryEnd) ? settings.manualEntryEnd : MANUAL_ENTRY_END;
    settings.oddMondayAnchor = parseDateKey(settings.oddMondayAnchor) ? settings.oddMondayAnchor : ODD_MONDAY_ANCHOR;
    if (settings.periodEnd < settings.periodStart) settings.periodEnd = settings.periodStart;
    if (settings.manualEntryEnd < settings.periodStart) settings.manualEntryEnd = settings.periodStart;
    if (settings.manualEntryEnd > settings.periodEnd) settings.manualEntryEnd = settings.periodEnd;
    settings.openingCash = finiteNumber(settings.openingCash, 0);
    settings.emergencyCredit = finiteAmount(settings.emergencyCredit, 0);
    const transactions = Array.isArray(source.transactions) ? source.transactions.map(x => normalizeItem(x)).filter(x => x.date) : [];
    const plannedEventsSource = Array.isArray(source.plannedEvents) ? source.plannedEvents : base.plannedEvents;
    const plannedEvents = plannedEventsSource.map(x => ({ ...normalizeItem(x), source: String(x.source || 'manual'), enabled: x.enabled !== false })).filter(x => x.date);
    if (source.version === 2) for (const item of base.plannedEvents) if (!plannedEvents.some(x => x.id === item.id)) plannedEvents.push({ ...item });
    const expectedSource = Array.isArray(source.expectedEvents) ? source.expectedEvents : base.expectedEvents;
    const expectedEvents = expectedSource.map(x => ({ id: String(x.id || uid('expected')), expectedMonth: /^\d{4}-\d{2}$/.test(x.expectedMonth) ? x.expectedMonth : '', type: x.type === 'expense' ? 'expense' : 'income', amount: finiteAmount(x.amount), category: String(x.category || 'otherIncome'), note: String(x.note || ''), enabled: x.enabled !== false })).filter(x => x.expectedMonth);
    const recurringSource = Array.isArray(source.recurringExpenses) ? source.recurringExpenses : base.recurringExpenses;
    const recurringExpenses = recurringSource.map(x => ({ id: String(x.id || uid('recurring')), name: String(x.name || '周期支出'), category: String(x.category || 'otherExpense'), amount: finiteAmount(x.amount), frequency: 'monthly', dayOfMonth: Number.isInteger(Number(x.dayOfMonth)) && Number(x.dayOfMonth) >= 1 && Number(x.dayOfMonth) <= 31 ? Number(x.dayOfMonth) : null, reserveWhenUndated: x.reserveWhenUndated !== false, enabled: x.enabled !== false }));
    const rules = source.budgetRules || {};
    const foodBase = base.budgetRules.foodByDayType;
    const foodInput = rules.foodByDayType || {};
    const foodByDayType = Object.fromEntries(Object.keys(foodBase).map(key => [key, finiteAmount(foodInput[key], foodBase[key])]));
    const socialInput = rules.socialTransport || {};
    const socialTransport = {
      weeklyVisits: finiteAmount(socialInput.weeklyVisits, 0), medianPerVisit: finiteAmount(socialInput.medianPerVisit, 0),
      minPerVisit: finiteAmount(socialInput.minPerVisit, 0), maxPerVisit: finiteAmount(socialInput.maxPerVisit, 0)
    };
    return { version: 4, settings, transactions, plannedEvents, expectedEvents, recurringExpenses, budgetRules: { foodByDayType, socialTransport } };
  }

  function signedAmount(item) { return item.type === 'income' ? item.amount : -item.amount; }
  function huabeiPart(item) { return item.type === 'expense' ? Math.min(item.amount, finiteAmount(item.huabeiAmount)) : 0; }
  function cashSignedAmount(item) { return item.type === 'income' ? item.amount : -(item.amount - huabeiPart(item)); }
  function categoryName(category) { return [...CATEGORIES.income, ...CATEGORIES.expense].find(x => x.id === category)?.name || category; }
  function within(key, start, end) { return key >= start && key <= end; }
  function actualForCategory(transactions, category, predicate = () => true) { return roundMoney(transactions.filter(x => x.category === category && predicate(x)).reduce((sum, x) => sum + x.amount, 0)); }
  function monthKeys(start, end) { const keys = []; for (const key of dateRange(start, end)) if (!keys.includes(monthKey(key))) keys.push(monthKey(key)); return keys; }
  function effectiveAsOf(value, start, end) {
    if (!parseDateKey(value)) return start;
    if (value < start) return isoDate(addDays(parseDateKey(start), -1));
    return value > end ? end : value;
  }
  // 优先使用显式计划关联匹配交易，再检查同日期和类型的候选；每笔实际交易只能替代一次计划扣款，避免重复抵扣。
  function resolvePlanReplacements(plans, transactions) {
    const replaced = new Set(), usedTransactions = new Set();
    for (const plan of plans) {
      const linked = transactions.find(tx => tx.linkedPlanId === plan.id && !usedTransactions.has(tx.id));
      if (linked) { replaced.add(plan.id); usedTransactions.add(linked.id); }
    }
    for (const plan of plans) {
      if (replaced.has(plan.id)) continue;
      const candidates = transactions.filter(tx => !usedTransactions.has(tx.id) && tx.date === plan.date && tx.type === plan.type && tx.category === plan.category);
      if (!candidates.length) continue;
      const exact = candidates.find(tx => roundMoney(tx.amount) === roundMoney(plan.amount));
      const match = exact || candidates[0];
      replaced.add(plan.id);
      usedTransactions.add(match.id);
    }
    return replaced;
  }

  function recurringDateForMonth(month, dayOfMonth) {
    if (!dayOfMonth) return { exactDate: null, requestedDay: null, effectiveDay: null, adjustedToMonthEnd: false };
    const [year, monthNumber] = String(month).split('-').map(Number);
    const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
    const requestedDay = Math.max(1, Math.min(31, Number(dayOfMonth)));
    const effectiveDay = Math.min(requestedDay, lastDay);
    return {
      exactDate: `${month}-${String(effectiveDay).padStart(2, '0')}`,
      requestedDay,
      effectiveDay,
      adjustedToMonthEnd: requestedDay !== effectiveDay
    };
  }

  function allocateRecurringActuals(instances, transactions, asOf) {
    const pools = transactions
      .filter(tx => tx.type === 'expense' && tx.date <= asOf && tx.amount > 0)
      .map(tx => ({ tx, remaining: roundMoney(tx.amount) }));

    const allocate = (instance, candidates) => {
      let matched = roundMoney(instance.actual || 0);
      for (const pool of candidates) {
        if (pool.remaining <= 0 || matched >= instance.amount) continue;
        const amount = roundMoney(Math.min(pool.remaining, instance.amount - matched));
        if (amount <= 0) continue;
        matched = roundMoney(matched + amount);
        pool.remaining = roundMoney(pool.remaining - amount);
        instance.matchedTransactionIds.push(pool.tx.id);
      }
      instance.actual = matched;
      instance.remaining = roundMoney(Math.max(0, instance.amount - matched));
    };

    // Explicit links are authoritative and may settle a recurring item even
    // when the real bank posting date differs from the configured due date.
    for (const instance of instances) {
      allocate(instance, pools.filter(pool =>
        pool.tx.linkedRecurringId === instance.recurringId &&
        (pool.tx.linkedRecurringMonth || monthKey(pool.tx.date)) === instance.month
      ));
      const explicit = transactions
        .filter(tx =>
          tx.type === 'expense' &&
          tx.date <= asOf &&
          tx.linkedRecurringId === instance.recurringId &&
          (tx.linkedRecurringMonth || monthKey(tx.date)) === instance.month
        )
        .sort((a, b) => a.date.localeCompare(b.date));
      instance.settledDate = explicit.length ? explicit[0].date : null;
      instance.prepaid = Boolean(instance.settledDate && instance.exactDate && instance.settledDate < instance.exactDate);
    }

    // For dated recurring charges, automatic matching is deliberately strict:
    // the real expense must share both the configured date and category.
    // This prevents an unrelated purchase in the same category from silently
    // cancelling one or more recurring charges.
    for (const instance of instances) {
      if (!instance.exactDate || instance.remaining <= 0) continue;
      allocate(instance, pools.filter(pool =>
        !pool.tx.linkedRecurringId &&
        pool.tx.date === instance.exactDate &&
        pool.tx.category === instance.category
      ));
    }

    // Undated recurring items may only auto-match when the month/category also
    // has a strong identity signal: same amount or the note names the item.
    for (const instance of instances) {
      if (instance.exactDate || instance.remaining <= 0) continue;
      const name = String(instance.name || '').trim().toLowerCase();
      allocate(instance, pools.filter(pool => {
        if (pool.tx.linkedRecurringId || monthKey(pool.tx.date) !== instance.month || pool.tx.category !== instance.category) return false;
        const note = String(pool.tx.note || '').trim().toLowerCase();
        return roundMoney(pool.tx.amount) === roundMoney(instance.amount) || (name && note.includes(name));
      }));
    }

    return instances;
  }

  function buildRecurringInstances(data, periodTransactions, start, end, asOf) {
    const instances = [];
    for (const recurring of data.recurringExpenses.filter(item => item.enabled)) {
      for (const month of monthKeys(start, end)) {
        const dateInfo = recurringDateForMonth(month, recurring.dayOfMonth);
        if (dateInfo.exactDate && !within(dateInfo.exactDate, start, end)) continue;
        instances.push({
          recurringId: recurring.id,
          name: recurring.name,
          category: recurring.category,
          month,
          monthEnd: monthEndKey(month),
          exactDate: dateInfo.exactDate,
          requestedDay: dateInfo.requestedDay,
          effectiveDay: dateInfo.effectiveDay,
          adjustedToMonthEnd: dateInfo.adjustedToMonthEnd,
          amount: roundMoney(recurring.amount),
          actual: 0,
          remaining: roundMoney(recurring.amount),
          matchedTransactionIds: [],
          settledDate: null,
          prepaid: false,
          reserveWhenUndated: recurring.reserveWhenUndated,
          status: 'pending',
          reserve: false
        });
      }
    }

    allocateRecurringActuals(instances, periodTransactions, asOf);

    for (const instance of instances) {
      if (instance.remaining <= 0) {
        instance.status = instance.prepaid ? 'prepaid' : 'settled';
      } else if (instance.exactDate) {
        if (instance.exactDate < asOf) instance.status = 'overdue';
        else if (instance.exactDate === asOf) instance.status = 'due';
        else instance.status = 'scheduled';
      } else if (instance.monthEnd < asOf) {
        instance.status = 'overdue';
      } else if (instance.reserveWhenUndated) {
        instance.status = 'reserve';
      } else {
        instance.status = 'unreserved';
      }
      instance.reserve = instance.status === 'reserve' || instance.status === 'overdue' || instance.status === 'due';
    }
    return instances;
  }

  // 所有日余额、周期计划与实际差异从统一模型推导，避免 UI 的独立计算与存储数据出现两套口径。
  function calculateFinancialModel(input, options = {}) {
    const data = normalizeData(input);
    const {
      periodStart: start,
      periodEnd: end,
      manualEntryEnd,
      oddMondayAnchor,
      openingCash,
      emergencyCredit
    } = data.settings;
    const dates = dateRange(start, end);
    const asOf = effectiveAsOf(options.asOf || isoDate(new Date()), start, end);
    const futureStarts = key => key > asOf;

    // openingCash is the balance at periodStart. Transactions before the
    // planning period are retained for audit/import purposes but must not
    // change this period's cash balance.
    const periodTransactions = data.transactions.filter(tx => within(tx.date, start, end));
    const outOfPeriodTransactions = data.transactions.filter(tx => !within(tx.date, start, end));
    const currentTransactions = periodTransactions.filter(tx => tx.date <= asOf);
    const actualNet = roundMoney(currentTransactions.reduce((sum, tx) => sum + cashSignedAmount(tx), 0));
    const cashBalance = roundMoney(openingCash + actualNet);
    const huabeiUsed = roundMoney(currentTransactions.reduce((sum, tx) => sum + huabeiPart(tx), 0));
    const huabeiAvailable = roundMoney(Math.max(0, emergencyCredit - huabeiUsed));

    // Each enabled recurring expense becomes one explicit monthly instance.
    // Dated instances participate in the daily calendar; undated or overdue
    // instances are kept in reserve instead of being invented on a fake date.
    const recurringInstances = buildRecurringInstances(data, periodTransactions, start, end, asOf);
    const reserveItems = recurringInstances.filter(x => x.reserve && x.remaining > 0);
    const reserveRequiredAmount = roundMoney(reserveItems.reduce((sum, x) => sum + x.remaining, 0));
    const fundedReserveAmount = roundMoney(Math.min(Math.max(0, cashBalance), reserveRequiredAmount));
    const reserveShortfall = roundMoney(Math.max(0, reserveRequiredAmount - fundedReserveAmount));
    const disposableBalance = roundMoney(Math.max(0, cashBalance - fundedReserveAmount));
    const scheduledRecurring = recurringInstances.filter(x => x.status === 'scheduled' && x.remaining > 0 && x.exactDate > asOf);

    const foodBudgetByDate = new Map();
    for (const key of dates) {
      foodBudgetByDate.set(key, key <= manualEntryEnd ? 0 : data.budgetRules.foodByDayType[dayType(key, oddMondayAnchor)]);
    }

    // Social transport is a weekly envelope. Do not invent fake daily
    // transactions by spreading it across every future day.
    const weeks = new Map();
    for (const key of dates) {
      const wk = weekKey(key);
      if (!weeks.has(wk)) weeks.set(wk, []);
      weeks.get(wk).push(key);
    }
    const socialWeekly = new Map();
    const weeklyTarget = roundMoney(data.budgetRules.socialTransport.weeklyVisits * data.budgetRules.socialTransport.medianPerVisit);
    for (const [wk, weekDates] of weeks) {
      const automaticDates = weekDates.filter(key => key > manualEntryEnd);
      const proratedTarget = roundMoney(weeklyTarget * automaticDates.length / 7);
      const actual = actualForCategory(
        periodTransactions,
        'socialTransport',
        tx => weekKey(tx.date) === wk && tx.type === 'expense' && tx.date <= asOf
      );
      const futureDates = automaticDates.filter(futureStarts);
      const remaining = futureDates.length ? roundMoney(Math.max(0, proratedTarget - actual)) : 0;
      socialWeekly.set(wk, { week: wk, dates: weekDates, automaticDates, target: proratedTarget, actual, remaining, futureDates });
    }
    const socialBudgetReserve = roundMoney([...socialWeekly.values()].reduce((sum, week) => sum + week.remaining, 0));

    // A real transaction may replace at most one plan. This prevents one
    // tutoring payment from accidentally resolving several same-day plans.
    const enabledPlans = data.plannedEvents.filter(plan => plan.enabled && within(plan.date, start, end));
    const replacedPlanIds = resolvePlanReplacements(
      enabledPlans,
      periodTransactions.filter(tx => tx.date <= asOf)
    );

    const daily = [];
    let actualRunning = openingCash;
    let projectedRunning = cashBalance;
    for (const key of dates) {
      const actualItems = periodTransactions.filter(tx => tx.date === key && tx.date <= asOf);
      const actualDelta = roundMoney(actualItems.reduce((sum, tx) => sum + cashSignedAmount(tx), 0));
      actualRunning = roundMoney(actualRunning + actualDelta);

      const isFuture = futureStarts(key);
      const plannedItems = enabledPlans
        .filter(plan => plan.date === key)
        .map(plan => ({ ...plan, replaced: replacedPlanIds.has(plan.id) }));
      const plannedDelta = isFuture
        ? roundMoney(plannedItems.filter(x => !x.replaced).reduce((sum, x) => sum + signedAmount(x), 0))
        : 0;
      const recurringItems = recurringInstances.filter(x => x.exactDate === key);
      const knownRecurringItems = isFuture ? recurringItems.filter(x => x.status === 'scheduled' && x.remaining > 0) : [];
      const recurringDelta = isFuture
        ? -roundMoney(knownRecurringItems.reduce((sum, x) => sum + x.remaining, 0))
        : 0;
      const actualFood = actualForCategory(actualItems, 'food', x => x.type === 'expense');
      const foodBudget = foodBudgetByDate.get(key);
      const foodForecast = isFuture ? Math.max(0, roundMoney(foodBudget - actualFood)) : 0;
      const week = socialWeekly.get(weekKey(key));

      // Daily projected path contains only date-specific items. Weekly social
      // budget and undated fixed expenses are deducted once in the final
      // reconciliation below.
      const budgetForecast = foodForecast;
      const projectedDelta = roundMoney(plannedDelta + recurringDelta - foodForecast);
      if (isFuture) projectedRunning = roundMoney(projectedRunning + projectedDelta);
      const displayDelta = isFuture ? projectedDelta : actualDelta;

      daily.push({
        key, month: monthKey(key), dayType: dayType(key, oddMondayAnchor),
        statuses: {
          actual: actualItems,
          planned: plannedItems,
          recurring: recurringItems,
          forecast: {
            foodBudget, foodForecast,
            weeklySocialRemaining: week?.remaining || 0,
            knownRecurringItems
          }
        },
        actualDelta, actualCashBalance: actualRunning, plannedDelta, budgetForecast,
        recurringDelta, projectedDelta, displayDelta,
        projectedCashBeforeReserve: projectedRunning
      });
    }

    const scheduledEndBeforeReserve = projectedRunning;
    const activeExpected = data.expectedEvents.filter(
      event => event.enabled &&
        event.expectedMonth >= monthKey(start) &&
        event.expectedMonth <= monthKey(end) &&
        monthEndKey(event.expectedMonth) > asOf
    );
    const undatedExpectedNet = roundMoney(activeExpected.reduce((sum, item) => sum + signedAmount(item), 0));
    const forecastEndBalance = roundMoney(
      scheduledEndBeforeReserve - reserveRequiredAmount - socialBudgetReserve + undatedExpectedNet
    );

    const futurePlans = enabledPlans.filter(plan => plan.date > asOf && !replacedPlanIds.has(plan.id));
    const plannedIncome = roundMoney(futurePlans.filter(x => x.type === 'income').reduce((sum, x) => sum + x.amount, 0));
    const plannedExpense = roundMoney(futurePlans.filter(x => x.type === 'expense').reduce((sum, x) => sum + x.amount, 0));
    const knownRecurringExpense = roundMoney(scheduledRecurring.reduce((sum, x) => sum + x.remaining, 0));
    const futureFoodBudget = roundMoney(daily.reduce((sum, x) => sum + x.statuses.forecast.foodForecast, 0));

    const monthly = monthKeys(start, end).map(month => {
      const txs = periodTransactions.filter(tx => monthKey(tx.date) === month && tx.date <= asOf);
      const actualIncome = roundMoney(txs.filter(x => x.type === 'income').reduce((s, x) => s + x.amount, 0));
      const actualExpense = roundMoney(txs.filter(x => x.type === 'expense').reduce((s, x) => s + x.amount, 0));
      const monthDays = daily.filter(x => x.month === month);
      const monthPlans = futurePlans.filter(x => monthKey(x.date) === month);
      const monthPlannedIncome = roundMoney(monthPlans.filter(x => x.type === 'income').reduce((s, x) => s + x.amount, 0));
      const monthPlannedExpense = roundMoney(monthPlans.filter(x => x.type === 'expense').reduce((s, x) => s + x.amount, 0));
      const foodBudget = roundMoney(monthDays.reduce((s, x) => s + foodBudgetByDate.get(x.key), 0));
      const foodActual = actualForCategory(txs, 'food', x => x.type === 'expense');
      const foodForecast = roundMoney(monthDays.reduce((s, x) => s + x.statuses.forecast.foodForecast, 0));
      const socialActual = actualForCategory(txs, 'socialTransport', x => x.type === 'expense');
      let socialBudget = 0, socialRemaining = 0;
      for (const week of socialWeekly.values()) {
        const automaticInMonth = week.automaticDates.filter(key => monthKey(key) === month).length;
        if (automaticInMonth && week.automaticDates.length) {
          socialBudget += week.target * automaticInMonth / week.automaticDates.length;
        }
        const futureInMonth = week.futureDates.filter(key => monthKey(key) === month).length;
        if (futureInMonth && week.futureDates.length) {
          socialRemaining += week.remaining * futureInMonth / week.futureDates.length;
        }
      }
      const reserved = roundMoney(reserveItems.filter(x => x.month === month).reduce((s, x) => s + x.remaining, 0));
      const scheduledRecurringAmount = roundMoney(scheduledRecurring.filter(x => x.month === month).reduce((s, x) => s + x.remaining, 0));
      const expected = roundMoney(activeExpected.filter(x => x.expectedMonth === month).reduce((s, x) => s + signedAmount(x), 0));
      return {
        month, actualIncome, actualExpense,
        plannedIncome: monthPlannedIncome, plannedExpense: monthPlannedExpense,
        foodBudget, foodActual, foodForecast,
        socialBudget: roundMoney(socialBudget), socialActual, socialRemaining: roundMoney(socialRemaining),
        reserved, scheduledRecurring: scheduledRecurringAmount, expected
      };
    });

    const currentMonth = monthKey(asOf < start ? start : asOf);
    return {
      data, asOf, dates,
      ledger: {
        openingCash, actualNet, cashBalance,
        transactions: data.transactions, periodTransactions, outOfPeriodTransactions
      },
      reserve: {
        items: reserveItems, amount: fundedReserveAmount,
        requiredAmount: reserveRequiredAmount, shortfall: reserveShortfall
      },
      disposableBalance, emergencyCredit, huabeiUsed, huabeiAvailable,
      budget: {
        foodByDate: Object.fromEntries(foodBudgetByDate),
        socialWeekly: [...socialWeekly.values()],
        socialBudgetReserve,
        currentMonth: monthly.find(x => x.month === currentMonth) || monthly[0]
      },
      plan: { dated: data.plannedEvents, undatedExpected: activeExpected, undatedExpectedNet },
      forecast: {
        daily,
        scheduledEndBeforeReserve,
        scheduledReserve: reserveRequiredAmount,
        socialBudgetReserve,
        endBalance: forecastEndBalance,
        components: {
          currentCash: cashBalance,
          plannedIncome, plannedExpense,
          knownRecurringExpense,
          futureFoodBudget,
          socialBudgetReserve,
          fixedReserve: reserveRequiredAmount,
          expectedNet: undatedExpectedNet,
          endBalance: forecastEndBalance
        }
      },
      recurring: {
        instances: recurringInstances,
        scheduled: scheduledRecurring,
        due: reserveItems.filter(x => x.status === 'due'),
        overdue: reserveItems.filter(x => x.status === 'overdue')
      },
      monthly
    };
  }

  function serializeData(data) { return JSON.stringify(normalizeData(data), null, 2); }
  function parseData(text) {
    const parsed = typeof text === 'string' ? JSON.parse(text) : text;
    if (!parsed || ![2, 3, 4].includes(parsed.version)) throw new Error('不支持的数据文件版本');
    return normalizeData(parsed);
  }
  function csvEscape(value) { const text = String(value ?? ''); return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text; }
  function transactionsToCsv(data) {
    const normalized = normalizeData(data), header = ['日期', '类型', '金额', '现金金额', '花呗金额', '分类', '备注', '周期支出结算', '结算月份'];
    const recurringNames = new Map(normalized.recurringExpenses.map(item => [item.id, item.name]));
    const rows = normalized.transactions.slice().sort((a, b) => a.date.localeCompare(b.date)).map(tx => [
      tx.date,
      tx.type === 'income' ? '收入' : '支出',
      tx.amount,
      tx.type === 'income' ? tx.amount : roundMoney(tx.amount - huabeiPart(tx)),
      huabeiPart(tx),
      categoryName(tx.category),
      tx.note,
      tx.linkedRecurringId ? (recurringNames.get(tx.linkedRecurringId) || tx.linkedRecurringId) : '',
      tx.linkedRecurringMonth || ''
    ]);
    return '\uFEFF' + [header, ...rows].map(row => row.map(csvEscape).join(',')).join('\r\n');
  }

  return { PERIOD_START, PERIOD_END, MANUAL_ENTRY_END, ODD_MONDAY_ANCHOR, TUTOR_DATES, CATEGORIES, parseDateKey, isoDate, addDays, monthKey, monthEndKey, finiteNumber, finiteAmount, roundMoney, dateRange, isOddMonday, weekKey, dayType, uid, createDefaultData, normalizeData, calculateFinancialModel, categoryName, huabeiPart, cashSignedAmount, recurringDateForMonth, serializeData, parseData, transactionsToCsv };
});
