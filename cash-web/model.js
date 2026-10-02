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
  function finiteAmount(value, fallback = 0) {
    const amount = Number(value);
    return Number.isFinite(amount) && amount >= 0 ? amount : fallback;
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
    const anchor = parseDateKey(anchorKey) || parseDateKey(ODD_MONDAY_ANCHOR);
    if (!date || date.getUTCDay() !== 1) return false;
    const diff = Math.round((date.getTime() - anchor.getTime()) / DAY_MS);
    return diff >= 0 && diff % 14 === 0;
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
    const plannedEvents = [];
    for (const date of TUTOR_DATES) {
      plannedEvents.push({ id: `tutor-income-${date}`, date, type: 'income', amount: 160, category: 'tutoringIncome', note: '预计家教收入', source: 'tutoring', enabled: true });
      plannedEvents.push({ id: `tutor-travel-${date}`, date, type: 'expense', amount: 32, category: 'tutoringTransport', note: '预计家教交通', source: 'tutoring', enabled: true });
    }
    return {
      version: 4,
      settings: {
        periodStart: PERIOD_START,
        periodEnd: PERIOD_END,
        manualEntryEnd: MANUAL_ENTRY_END,
        oddMondayAnchor: ODD_MONDAY_ANCHOR,
        openingCash: 6206.32,
        emergencyCredit: 200
      },
      transactions: [],
      plannedEvents,
      expectedEvents: [],
      recurringExpenses: [
        { id: 'installment', name: '月供 + Apple Music + iCloud', category: 'installment', amount: 250, frequency: 'monthly', dayOfMonth: null, reserveWhenUndated: true, enabled: true },
        { id: 'electricity', name: '电费', category: 'electricity', amount: 100, frequency: 'monthly', dayOfMonth: null, reserveWhenUndated: true, enabled: true },
        { id: 'water', name: '水费', category: 'water', amount: 60, frequency: 'monthly', dayOfMonth: null, reserveWhenUndated: true, enabled: true },
        { id: 'phone', name: '话费', category: 'phone', amount: 100, frequency: 'monthly', dayOfMonth: null, reserveWhenUndated: true, enabled: true },
        { id: 'chatgpt', name: 'ChatGPT', category: 'chatgpt', amount: 140, frequency: 'monthly', dayOfMonth: null, reserveWhenUndated: true, enabled: true }
      ],
      budgetRules: {
        foodByDayType: { classDay: 24, oddMonday: 20, evenMonday: 24, saturday: 20, sunday: 20 },
        socialTransport: { weeklyVisits: 2, medianPerVisit: 25.5, minPerVisit: 21, maxPerVisit: 30 }
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
      note: String(item?.note || ''), linkedPlanId: item?.linkedPlanId ? String(item.linkedPlanId) : null
    };
  }
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
    settings.openingCash = finiteAmount(settings.openingCash, 6206.32);
    settings.emergencyCredit = finiteAmount(settings.emergencyCredit, 200);
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
      weeklyVisits: finiteAmount(socialInput.weeklyVisits, 2), medianPerVisit: finiteAmount(socialInput.medianPerVisit, 25.5),
      minPerVisit: finiteAmount(socialInput.minPerVisit, 21), maxPerVisit: finiteAmount(socialInput.maxPerVisit, 30)
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

    // Recurring expenses have three materially different states:
    // scheduled (known future date), reserve (unknown date), and overdue.
    // Overdue items remain reserved instead of silently disappearing.
    const recurringInstances = [];
    for (const recurring of data.recurringExpenses.filter(x => x.enabled)) {
      for (const month of monthKeys(start, end)) {
        const [year, monthNumber] = month.split('-').map(Number);
        const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
        const exactDate = recurring.dayOfMonth ? `${month}-${String(Math.min(recurring.dayOfMonth, lastDay)).padStart(2, '0')}` : null;
        if (exactDate && !within(exactDate, start, end)) continue;
        const actual = actualForCategory(
          periodTransactions,
          recurring.category,
          tx => monthKey(tx.date) === month && tx.type === 'expense' && tx.date <= asOf
        );
        const remaining = roundMoney(Math.max(0, recurring.amount - actual));
        const monthEnd = monthEndKey(month);
        let status = 'settled';
        if (remaining > 0) {
          if (monthEnd <= asOf || (exactDate && exactDate <= asOf)) status = 'overdue';
          else if (exactDate) status = 'scheduled';
          else if (recurring.reserveWhenUndated) status = 'reserve';
          else status = 'unreserved';
        }
        recurringInstances.push({
          recurringId: recurring.id, name: recurring.name, category: recurring.category,
          month, monthEnd, exactDate, amount: recurring.amount, actual, remaining,
          status, reserve: status === 'reserve' || status === 'overdue'
        });
      }
    }
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
      const knownRecurringItems = isFuture ? scheduledRecurring.filter(x => x.exactDate === key) : [];
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
    const normalized = normalizeData(data), header = ['日期', '类型', '金额', '现金金额', '花呗金额', '分类', '备注'];
    const rows = normalized.transactions.slice().sort((a, b) => a.date.localeCompare(b.date)).map(tx => [tx.date, tx.type === 'income' ? '收入' : '支出', tx.amount, tx.type === 'income' ? tx.amount : roundMoney(tx.amount - huabeiPart(tx)), huabeiPart(tx), categoryName(tx.category), tx.note]);
    return '\uFEFF' + [header, ...rows].map(row => row.map(csvEscape).join(',')).join('\r\n');
  }

  return { PERIOD_START, PERIOD_END, MANUAL_ENTRY_END, ODD_MONDAY_ANCHOR, TUTOR_DATES, CATEGORIES, parseDateKey, isoDate, addDays, monthKey, monthEndKey, finiteAmount, roundMoney, dateRange, isOddMonday, weekKey, dayType, uid, createDefaultData, normalizeData, calculateFinancialModel, categoryName, huabeiPart, cashSignedAmount, serializeData, parseData, transactionsToCsv };
});
