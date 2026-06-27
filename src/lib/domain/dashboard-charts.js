// @ts-check

function monthKey(date) {
  const value = new Date(date);
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}`;
}

function dayKey(date) {
  const value = new Date(date);
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")}`;
}

function monthLabel(key) {
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function dayLabel(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function monthRange(monthsBack = 12, now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 12));
  const months = [];

  for (let index = monthsBack - 1; index >= 0; index -= 1) {
    const value = new Date(start);
    value.setUTCMonth(start.getUTCMonth() - index);
    months.push(monthKey(value));
  }

  return months;
}

function dayRange(daysBack = 30, now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12));
  const days = [];

  for (let index = daysBack - 1; index >= 0; index -= 1) {
    const value = new Date(start);
    value.setUTCDate(start.getUTCDate() - index);
    days.push(dayKey(value));
  }

  return days;
}

function increment(map, key, amount = 1) {
  map.set(key, (map.get(key) || 0) + Number(amount));
}

function cumulativeValues(months, counts, initial = 0) {
  let runningTotal = initial;

  return months.map((month) => {
    runningTotal += counts.get(month) || 0;
    return runningTotal;
  });
}

function flattenRows(customers, field) {
  return customers.flatMap((customer) => customer[field] || []);
}

/**
 * @param {Array<object>} customers
 * @param {{now?: Date, months?: number}=} options
 */
export function createDashboardCharts(customers, options = {}) {
  const now = options.now || new Date();
  const months = monthRange(options.months || 12, now);
  const days = dayRange(options.days || 30, now);
  const monthSet = new Set(months);
  const daySet = new Set(days);
  const labels = months.map(monthLabel);
  const dayLabels = days.map(dayLabel);
  const purchases = flattenRows(customers, "purchases");
  const subscriptions = flattenRows(customers, "subscriptions");
  const auditEvents = flattenRows(customers, "auditEvents");

  const monthlyRevenue = new Map();
  const dailyRevenue = new Map();
  const customerGrowth = new Map();
  const dailyCustomerGrowth = new Map();
  const subscriptionGrowth = new Map();
  const dailySubscriptionGrowth = new Map();
  const needsAttention = new Map();
  const dailyNeedsAttention = new Map();
  const fixCounts = new Map();
  const dailyFixCounts = new Map();
  const recoveredRevenue = new Map();
  const dailyRecoveredRevenue = new Map();

  customers.forEach((customer) => {
    const month = monthKey(customer.createdAt);
    const day = dayKey(customer.createdAt);
    if (monthSet.has(month)) increment(customerGrowth, month);
    if (daySet.has(day)) increment(dailyCustomerGrowth, day);
  });

  subscriptions.forEach((subscription) => {
    const startedAt = subscription.startedAt || subscription.createdAt;
    const month = monthKey(startedAt);
    const day = dayKey(startedAt);
    if (monthSet.has(month)) increment(subscriptionGrowth, month);
    if (daySet.has(day)) increment(dailySubscriptionGrowth, day);
  });

  purchases.forEach((purchase) => {
    const purchasedAt = purchase.purchasedAt || purchase.createdAt;
    const month = monthKey(purchasedAt);
    const day = dayKey(purchasedAt);

    if (purchase.type === "MEMBERSHIP_PAYMENT" && purchase.status === "PAID") {
      if (monthSet.has(month)) increment(monthlyRevenue, month, purchase.amount);
      if (daySet.has(day)) increment(dailyRevenue, day, purchase.amount);
    }

    if (purchase.type === "MEMBERSHIP_PAYMENT" && purchase.status === "FAILED") {
      if (monthSet.has(month)) increment(needsAttention, month);
      if (daySet.has(day)) increment(dailyNeedsAttention, day);
    }
  });

  auditEvents.forEach((event) => {
    const month = monthKey(event.createdAt);
    const day = dayKey(event.createdAt);

    if (event.type === "PAYMENT_FAILED" || event.type === "SUBSCRIPTION_OVERDUE") {
      if (monthSet.has(month)) increment(needsAttention, month);
      if (daySet.has(day)) increment(dailyNeedsAttention, day);
    }

    const metadata = event.metadata || {};
    const resolvedPayments = Number(metadata.resolvedPayments || 0);
    const isPaymentFix =
      event.actorName === "Bob Roberts" &&
      event.type === "ACCOUNT_UPDATED" &&
      (metadata.paymentMethod || resolvedPayments > 0);

    if (isPaymentFix) {
      if (monthSet.has(month)) {
        increment(fixCounts, month, Math.max(1, resolvedPayments));
        increment(recoveredRevenue, month, metadata.recoveredRevenue || 0);
      }
      if (daySet.has(day)) {
        increment(dailyFixCounts, day, Math.max(1, resolvedPayments));
        increment(dailyRecoveredRevenue, day, metadata.recoveredRevenue || 0);
      }
    }
  });

  const previousCustomers = customers.filter(
    (customer) => monthKey(customer.createdAt) < months[0],
  ).length;
  const previousSubscriptions = subscriptions.filter(
    (subscription) => monthKey(subscription.startedAt || subscription.createdAt) < months[0],
  ).length;
  const previousDailyCustomers = customers.filter(
    (customer) => dayKey(customer.createdAt) < days[0],
  ).length;
  const previousDailySubscriptions = subscriptions.filter(
    (subscription) => dayKey(subscription.startedAt || subscription.createdAt) < days[0],
  ).length;

  return {
    monthlyRevenue: {
      labels,
      values: months.map((month) => Number((monthlyRevenue.get(month) || 0).toFixed(2))),
      daily: {
        labels: dayLabels,
        values: days.map((day) => Number((dailyRevenue.get(day) || 0).toFixed(2))),
      },
    },
    customerGrowth: {
      labels,
      newCustomers: months.map((month) => customerGrowth.get(month) || 0),
      cumulativeCustomers: cumulativeValues(months, customerGrowth, previousCustomers),
      daily: {
        labels: dayLabels,
        newCustomers: days.map((day) => dailyCustomerGrowth.get(day) || 0),
        cumulativeCustomers: cumulativeValues(days, dailyCustomerGrowth, previousDailyCustomers),
      },
    },
    subscriptionGrowth: {
      labels,
      newSubscriptions: months.map((month) => subscriptionGrowth.get(month) || 0),
      cumulativeSubscriptions: cumulativeValues(months, subscriptionGrowth, previousSubscriptions),
      daily: {
        labels: dayLabels,
        newSubscriptions: days.map((day) => dailySubscriptionGrowth.get(day) || 0),
        cumulativeSubscriptions: cumulativeValues(days, dailySubscriptionGrowth, previousDailySubscriptions),
      },
    },
    needsAttention: {
      labels,
      values: months.map((month) => needsAttention.get(month) || 0),
      daily: {
        labels: dayLabels,
        values: days.map((day) => dailyNeedsAttention.get(day) || 0),
      },
    },
    csrFixImpact: {
      labels,
      fixes: months.map((month) => fixCounts.get(month) || 0),
      recoveredRevenue: months.map((month) => Number((recoveredRevenue.get(month) || 0).toFixed(2))),
      daily: {
        labels: dayLabels,
        fixes: days.map((day) => dailyFixCounts.get(day) || 0),
        recoveredRevenue: days.map((day) => Number((dailyRecoveredRevenue.get(day) || 0).toFixed(2))),
      },
    },
  };
}
