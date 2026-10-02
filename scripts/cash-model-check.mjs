import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const M = require("../cash-web/model.js");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

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

console.log("Cash configurable model checks passed.");
