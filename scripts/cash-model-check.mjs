/**
 * 【初学者导读】
 * 文件：scripts/cash-model-check.mjs
 * 这是 CI 回归检查脚本，主题是：cash model。
 * 作用：把产品架构、关键字符串、公开路由或行为假设写成自动断言；当源码被未来改动破坏时，让 Pull Request 在合并前失败。
 * 阅读方法：从 read()/加载的源码开始，再逐条看 assert；每个 assert 都应能翻译成一句“这个产品必须继续满足什么规则”。
 * 修改原则：如果 CI 失败，先判断源码是否真的违反产品规则；不要为了“变绿”直接删除断言。只有产品规则明确改变时，才应同时修改实现和检查。
 * 测试设计：优先检查用户可感知行为、安全边界和跨模块契约，避免只验证某一行代码长得是否完全一样。
 * 调试方法：先看失败断言的消息，再去对应源码确认实际值；必要时增加更小的针对性样例，而不是扩大整套测试的复杂度。
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const M = require("../cash-web/model.js");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const blank = M.createDefaultData();
assert(blank.settings.openingCash === 0, "New Cash accounts must start with zero opening balance.");
assert(blank.settings.emergencyCredit === 0, "New Cash accounts must start with zero emergency credit.");
assert(blank.transactions.length === 0, "New Cash accounts must not contain transactions.");
assert(blank.plannedEvents.length === 0, "New Cash accounts must not contain personal planned events.");
assert(blank.expectedEvents.length === 0, "New Cash accounts must not contain expected events.");
assert(blank.recurringExpenses.length === 0, "New Cash accounts must not contain personal recurring expenses.");
assert(Object.values(blank.budgetRules.foodByDayType).every(value => value === 0), "New Cash accounts must start with zero food budgets.");
assert(Object.values(blank.budgetRules.socialTransport).every(value => value === 0), "New Cash accounts must start with zero social transport budgets.");

const data = M.createDefaultData();
data.settings.periodStart = "2027-02-01";
data.settings.periodEnd = "2027-02-28";
data.settings.manualEntryEnd = "2027-02-03";
data.settings.oddMondayAnchor = "2027-02-10";
data.settings.openingCash = 1234.56;
data.settings.emergencyCredit = 345;
data.budgetRules.foodByDayType.classDay = 31.25;
data.budgetRules.socialTransport.weeklyVisits = 3;
data.transactions = [
  { id:"before", date:"2027-01-31", type:"expense", amount:100, category:"otherExpense", note:"outside" },
  { id:"inside", date:"2027-02-02", type:"expense", amount:50, category:"custom-category", note:"inside" }
];
data.plannedEvents = [
  { id:"plan", date:"2027-02-20", type:"income", amount:500, category:"custom-income", note:"custom plan", source:"manual", enabled:true }
];
data.expectedEvents = [
  { id:"expected", expectedMonth:"2027-02", type:"expense", amount:75, category:"custom-expected", note:"expected", enabled:true }
];
data.recurringExpenses = [
  { id:"recurring", name:"Custom recurring", category:"custom-recurring", amount:90, frequency:"monthly", dayOfMonth:null, reserveWhenUndated:true, enabled:true }
];

const normalized = M.normalizeData(data);
assert(normalized.settings.periodStart === "2027-02-01", "Custom period start must survive normalization.");
assert(normalized.settings.periodEnd === "2027-02-28", "Custom period end must survive normalization.");
assert(normalized.settings.manualEntryEnd === "2027-02-03", "Manual-entry cutoff must be editable.");
assert(normalized.settings.oddMondayAnchor === "2027-02-10", "Odd-week anchor must be editable.");
assert(normalized.settings.openingCash === 1234.56, "Opening cash must never be silently rewritten.");
const negativeOpening = M.normalizeData({ ...data, settings: { ...data.settings, openingCash: -321.45 } });
assert(negativeOpening.settings.openingCash === -321.45, "Opening balance must remain fully editable, including signed values.");
assert(normalized.settings.emergencyCredit === 345, "Emergency credit must be editable.");
assert(normalized.recurringExpenses[0].name === "Custom recurring", "Recurring name must remain editable.");
assert(normalized.recurringExpenses[0].category === "custom-recurring", "Recurring category must remain editable.");
assert(normalized.plannedEvents[0].category === "custom-income", "Plan category must accept custom values.");
assert(normalized.expectedEvents[0].category === "custom-expected", "Expected-event category must accept custom values.");

const restored = M.parseData(M.serializeData(normalized));
assert(restored.settings.openingCash === 1234.56, "Cloud/export roundtrip must preserve editable settings.");
assert(restored.expectedEvents.length === 1, "Cloud/export roundtrip must preserve expected events.");

const model = M.calculateFinancialModel(restored, { asOf:"2027-02-02" });
assert(model.dates.length === 28, "Arbitrary February planning period must produce 28 days.");
assert(model.ledger.outOfPeriodTransactions.length === 1, "Pre-period transactions must be retained but excluded from current cash.");
assert(model.ledger.cashBalance === 1184.56, "Current cash must equal opening balance plus in-period actual cash only.");
assert(M.dayType("2027-02-08", "2027-02-10") === "oddMonday", "Odd-week anchor should resolve to its containing Monday.");
assert(M.dayType("2027-02-15", "2027-02-10") === "evenMonday", "Week parity must alternate after the anchor.");
assert(M.dayType("2027-02-01", "2027-02-10") === "evenMonday", "Week parity must also work before the anchor.");
assert(model.forecast.components.plannedIncome === 500, "Future custom plan must enter forecast components.");
assert(model.forecast.components.fixedReserve === 90, "Undated recurring expense must be reserved.");
assert(model.forecast.components.expectedNet === -75, "Expected monthly expense must enter expected net.");
assert(model.forecast.daily.every(day => !("socialForecast" in day.statuses.forecast)), "Weekly social budget must never become invented daily spending.");


const recurringData = M.createDefaultData();
recurringData.settings.periodStart = "2027-02-01";
recurringData.settings.periodEnd = "2027-04-30";
recurringData.settings.manualEntryEnd = "2027-02-01";
recurringData.settings.openingCash = 1000;
recurringData.recurringExpenses = [
  { id:"icloud", name:"iCloud", category:"Apple", amount:68, frequency:"monthly", dayOfMonth:18, reserveWhenUndated:true, enabled:true },
  { id:"month-end", name:"Month end", category:"installment", amount:150, frequency:"monthly", dayOfMonth:31, reserveWhenUndated:true, enabled:true },
  { id:"zero", name:"Zero dated", category:"otherExpense", amount:0, frequency:"monthly", dayOfMonth:15, reserveWhenUndated:true, enabled:true }
];
recurringData.transactions = [
  { id:"unrelated-apple", date:"2027-02-05", type:"expense", amount:68, category:"Apple", note:"unrelated Apple purchase" }
];

const recurringModel = M.calculateFinancialModel(recurringData, { asOf:"2027-02-06" });
const icloudInstances = recurringModel.recurring.instances.filter(item => item.recurringId === "icloud");
assert(icloudInstances.map(item => item.exactDate).join(",") === "2027-02-18,2027-03-18,2027-04-18", "A dated monthly recurring expense must expand onto the configured date in every in-range month.");
assert(icloudInstances[0].remaining === 68 && icloudInstances[0].status === "scheduled", "An unrelated same-category transaction on another date must not settle a dated recurring charge.");
const feb18 = recurringModel.forecast.daily.find(day => day.key === "2027-02-18");
assert(feb18.statuses.recurring.some(item => item.recurringId === "icloud"), "Daily calendar data must expose the recurring instance on its exact date.");
assert(feb18.recurringDelta === -68, "A scheduled iCloud-style charge must change the exact calendar day by its remaining amount.");
assert(feb18.displayDelta === -68, "With no other dated items, the calendar net delta must equal the recurring charge.");
const zeroFeb15 = recurringModel.forecast.daily.find(day => day.key === "2027-02-15");
assert(zeroFeb15.statuses.recurring.some(item => item.recurringId === "zero"), "A zero-amount dated recurring item must still keep its configured date visible.");
assert(zeroFeb15.recurringDelta === 0, "A zero-amount dated recurring item must never create a fake cash deduction.");
const febMonthEnd = recurringModel.recurring.instances.find(item => item.recurringId === "month-end" && item.month === "2027-02");
const marMonthEnd = recurringModel.recurring.instances.find(item => item.recurringId === "month-end" && item.month === "2027-03");
const aprMonthEnd = recurringModel.recurring.instances.find(item => item.recurringId === "month-end" && item.month === "2027-04");
assert(febMonthEnd.exactDate === "2027-02-28" && febMonthEnd.adjustedToMonthEnd, "A day-31 recurring charge must clamp to February month-end and report that adjustment.");
assert(marMonthEnd.exactDate === "2027-03-31" && !marMonthEnd.adjustedToMonthEnd, "A day-31 recurring charge must stay on March 31 when that date exists.");
assert(aprMonthEnd.exactDate === "2027-04-30" && aprMonthEnd.adjustedToMonthEnd, "A day-31 recurring charge must clamp to April 30.");
assert(M.recurringDateForMonth("2028-02", 31).exactDate === "2028-02-29", "Month-end clamping must honor leap years.");

const sharedData = M.createDefaultData();
sharedData.settings.periodStart = "2027-02-01";
sharedData.settings.periodEnd = "2027-02-28";
sharedData.settings.manualEntryEnd = "2027-02-01";
sharedData.recurringExpenses = [
  { id:"shared-a", name:"Shared A", category:"shared", amount:40, frequency:"monthly", dayOfMonth:10, reserveWhenUndated:true, enabled:true },
  { id:"shared-b", name:"Shared B", category:"shared", amount:40, frequency:"monthly", dayOfMonth:10, reserveWhenUndated:true, enabled:true }
];
sharedData.transactions = [
  { id:"one-payment", date:"2027-02-10", type:"expense", amount:40, category:"shared", note:"only one recurring payment" }
];
const sharedModel = M.calculateFinancialModel(sharedData, { asOf:"2027-02-10" });
const sharedInstances = sharedModel.recurring.instances.filter(item => item.month === "2027-02");
assert(sharedInstances.filter(item => item.status === "settled").length === 1, "One real transaction must not settle multiple same-category recurring items.");
assert(sharedInstances.filter(item => item.status === "due").length === 1, "The unmatched same-day recurring item must remain due and reserved.");
assert(sharedModel.reserve.requiredAmount === 40, "The unmatched due-today recurring amount must remain reserved.");

const linkedData = M.createDefaultData();
linkedData.settings.periodStart = "2027-02-01";
linkedData.settings.periodEnd = "2027-02-28";
linkedData.settings.manualEntryEnd = "2027-02-01";
linkedData.recurringExpenses = [
  { id:"linked-recurring", name:"Linked recurring", category:"subscription", amount:68, frequency:"monthly", dayOfMonth:18, reserveWhenUndated:true, enabled:true }
];
linkedData.transactions = [
  { id:"linked-payment", date:"2027-02-16", type:"expense", amount:68, category:"otherExpense", note:"posted early", linkedRecurringId:"linked-recurring" }
];
const linkedModel = M.calculateFinancialModel(linkedData, { asOf:"2027-02-20" });
const linkedInstance = linkedModel.recurring.instances.find(item => item.recurringId === "linked-recurring");
assert(linkedInstance.status === "prepaid" && linkedInstance.remaining === 0, "An explicit recurring link before the configured due date must settle the item as prepaid even when posting date/category differ.");
assert(M.normalizeData(linkedData).transactions[0].linkedRecurringId === "linked-recurring", "Recurring transaction links must survive normalization.");
assert(M.normalizeData(linkedData).transactions[0].linkedRecurringMonth === null, "Legacy recurring links without an explicit month must remain backward-compatible.");

const prepaidData = M.createDefaultData();
prepaidData.settings.periodStart = "2027-01-01";
prepaidData.settings.periodEnd = "2027-02-28";
prepaidData.settings.manualEntryEnd = "2027-01-01";
prepaidData.settings.openingCash = 1000;
prepaidData.recurringExpenses = [
  { id:"loan", name:"月供", category:"installment", amount:150, frequency:"monthly", dayOfMonth:15, reserveWhenUndated:true, enabled:true }
];
prepaidData.transactions = [
  { id:"prepay", date:"2027-01-28", type:"expense", amount:150, category:"installment", note:"提前还 2 月月供", linkedRecurringId:"loan", linkedRecurringMonth:"2027-02" }
];
const prepaidNormalized = M.normalizeData(prepaidData);
assert(prepaidNormalized.transactions[0].linkedRecurringMonth === "2027-02", "Cross-month recurring settlement target must survive normalization.");
const prepaidModel = M.calculateFinancialModel(prepaidNormalized, { asOf:"2027-02-01" });
const prepaidInstance = prepaidModel.recurring.instances.find(item => item.recurringId === "loan" && item.month === "2027-02");
assert(prepaidInstance.status === "prepaid", "A fully linked payment before the configured due date must mark the target recurring instance prepaid.");
assert(prepaidInstance.settledDate === "2027-01-28", "A prepaid recurring instance must remember the actual early payment date.");
assert(prepaidInstance.remaining === 0, "A prepaid recurring instance must have no remaining amount on the original due date.");
const prepaidDueDay = prepaidModel.forecast.daily.find(day => day.key === "2027-02-15");
assert(prepaidDueDay.statuses.recurring.some(item => item.recurringId === "loan" && item.status === "prepaid"), "The original due date must still expose the prepaid recurring instance for explanation.");
assert(prepaidDueDay.recurringDelta === 0, "A prepaid recurring instance must not deduct cash again on the original due date.");
assert(prepaidModel.forecast.components.knownRecurringExpense === 0, "Prepaid fixed charges must be removed from future known recurring deductions.");

const partialData = M.createDefaultData();
partialData.settings.periodStart = "2027-02-01";
partialData.settings.periodEnd = "2027-02-28";
partialData.settings.manualEntryEnd = "2027-02-01";
partialData.settings.openingCash = 1000;
partialData.recurringExpenses = [
  { id:"partial-loan", name:"部分提前还款", category:"installment", amount:150, frequency:"monthly", dayOfMonth:15, reserveWhenUndated:true, enabled:true }
];
partialData.transactions = [
  { id:"partial-payment", date:"2027-02-05", type:"expense", amount:100, category:"installment", note:"提前还 100", linkedRecurringId:"partial-loan", linkedRecurringMonth:"2027-02" }
];
const partialModel = M.calculateFinancialModel(partialData, { asOf:"2027-02-06" });
const partialInstance = partialModel.recurring.instances.find(item => item.recurringId === "partial-loan" && item.month === "2027-02");
assert(partialInstance.status === "scheduled" && partialInstance.remaining === 50, "A partial early repayment must leave only the unpaid remainder scheduled.");
const partialDueDay = partialModel.forecast.daily.find(day => day.key === "2027-02-15");
assert(partialDueDay.recurringDelta === -50, "The original due date must deduct only the remainder after a partial early repayment.");

console.log("Cash configurable model checks passed.");
