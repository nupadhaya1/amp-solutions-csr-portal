// @ts-check

function monthKey(date) {
  const value = new Date(date);
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key) {
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function monthRange(monthsBack = 12) {
  const today = new Date();
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1, 12));
  const months = [];

  for (let index = monthsBack - 1; index >= 0; index -= 1) {
    const value = new Date(start);
    value.setUTCMonth(start.getUTCMonth() - index);
    months.push(monthKey(value));
  }

  return months;
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
  const months = monthRange(options.months || 12);
  const monthSet = new Set(months);
  const labels = months.map(monthLabel);
  const purchases = flattenRows(customers, "purchases");
  const subscriptions = flattenRows(customers, "subscriptions");
  const auditEvents = flattenRows(customers, "auditEvents");

  const monthlyRevenue = new Map();
  const customerGrowth = new Map();
  const subscriptionGrowth = new Map();
  const needsAttention = new Map();
  const fixCounts = new Map();
  const recoveredRevenue = new Map();

  customers.forEach((customer) => {
    const key = monthKey(customer.createdAt);
    if (monthSet.has(key)) increment(customerGrowth, key);
  });

  subscriptions.forEach((subscription) => {
    const key = monthKey(subscription.startedAt || subscription.createdAt);
    if (monthSet.has(key)) increment(subscriptionGrowth, key);
  });

  purchases.forEach((purchase) => {
    const key = monthKey(purchase.purchasedAt || purchase.createdAt);
    if (!monthSet.has(key)) return;

    if (purchase.type === "MEMBERSHIP_PAYMENT" && purchase.status === "PAID") {
      increment(monthlyRevenue, key, purchase.amount);
    }

    if (purchase.type === "MEMBERSHIP_PAYMENT" && purchase.status === "FAILED") {
      increment(needsAttention, key);
    }
  });

  auditEvents.forEach((event) => {
    const key = monthKey(event.createdAt);
    if (!monthSet.has(key)) return;

    if (event.type === "PAYMENT_FAILED" || event.type === "SUBSCRIPTION_OVERDUE") {
      increment(needsAttention, key);
    }

    const metadata = event.metadata || {};
    const resolvedPayments = Number(metadata.resolvedPayments || 0);
    const isPaymentFix =
      event.actorName === "Bob Roberts" &&
      event.type === "ACCOUNT_UPDATED" &&
      (metadata.paymentMethod || resolvedPayments > 0);

    if (isPaymentFix) {
      increment(fixCounts, key, Math.max(1, resolvedPayments));
      increment(recoveredRevenue, key, metadata.recoveredRevenue || 0);
    }
  });

  const previousCustomers = customers.filter(
    (customer) => monthKey(customer.createdAt) < months[0],
  ).length;
  const previousSubscriptions = subscriptions.filter(
    (subscription) => monthKey(subscription.startedAt || subscription.createdAt) < months[0],
  ).length;

  return {
    monthlyRevenue: {
      labels,
      values: months.map((month) => Number((monthlyRevenue.get(month) || 0).toFixed(2))),
    },
    customerGrowth: {
      labels,
      newCustomers: months.map((month) => customerGrowth.get(month) || 0),
      cumulativeCustomers: cumulativeValues(months, customerGrowth, previousCustomers),
    },
    subscriptionGrowth: {
      labels,
      newSubscriptions: months.map((month) => subscriptionGrowth.get(month) || 0),
      cumulativeSubscriptions: cumulativeValues(months, subscriptionGrowth, previousSubscriptions),
    },
    needsAttention: {
      labels,
      values: months.map((month) => needsAttention.get(month) || 0),
    },
    csrFixImpact: {
      labels,
      fixes: months.map((month) => fixCounts.get(month) || 0),
      recoveredRevenue: months.map((month) => Number((recoveredRevenue.get(month) || 0).toFixed(2))),
    },
  };
}
