import assert from "node:assert/strict";
import test from "node:test";

import { createDashboardCharts } from "./dashboard-charts.js";

test("aggregates dashboard chart data from existing customer rows", () => {
  const charts = createDashboardCharts(
    [
      {
        id: "customer_1",
        createdAt: "2026-05-03T12:00:00.000Z",
        subscriptions: [
          { startedAt: "2026-05-03T12:00:00.000Z" },
          { startedAt: "2026-06-01T12:00:00.000Z" },
        ],
        purchases: [
          {
            type: "MEMBERSHIP_PAYMENT",
            status: "PAID",
            amount: "29.99",
            purchasedAt: "2026-05-04T12:00:00.000Z",
          },
          {
            type: "MEMBERSHIP_PAYMENT",
            status: "FAILED",
            amount: "29.99",
            purchasedAt: "2026-06-04T12:00:00.000Z",
          },
        ],
        auditEvents: [
          {
            type: "PAYMENT_FAILED",
            actorName: "AMP System",
            metadata: {},
            createdAt: "2026-06-04T13:00:00.000Z",
          },
          {
            type: "ACCOUNT_UPDATED",
            actorName: "Bob Roberts",
            metadata: {
              paymentMethod: { brand: "Visa" },
              resolvedPayments: 1,
              recoveredRevenue: "29.99",
            },
            createdAt: "2026-06-05T12:00:00.000Z",
          },
        ],
      },
    ],
    { months: 2, days: 7, now: new Date("2026-06-27T12:00:00.000Z") },
  );

  assert.deepEqual(charts.monthlyRevenue.values, [29.99, 0]);
  assert.deepEqual(charts.customerGrowth.newCustomers, [1, 0]);
  assert.deepEqual(charts.customerGrowth.cumulativeCustomers, [1, 1]);
  assert.deepEqual(charts.subscriptionGrowth.newSubscriptions, [1, 1]);
  assert.deepEqual(charts.subscriptionGrowth.cumulativeSubscriptions, [1, 2]);
  assert.deepEqual(charts.needsAttention.values, [0, 2]);
  assert.deepEqual(charts.csrFixImpact.fixes, [0, 1]);
  assert.deepEqual(charts.csrFixImpact.recoveredRevenue, [0, 29.99]);
  assert.equal(charts.monthlyRevenue.daily.labels.length, 7);
  assert.equal(charts.needsAttention.daily.values.at(-1), 0);
});
