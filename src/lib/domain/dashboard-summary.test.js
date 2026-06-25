import assert from "node:assert/strict";
import test from "node:test";

import { createDashboardSummary } from "./dashboard-summary.js";

test("computes dashboard stats from customer records", () => {
  const summary = createDashboardSummary([
    {
      subscriptions: [{ status: "ACTIVE" }, { status: "OVERDUE" }],
      purchases: [
        { type: "MEMBERSHIP_PAYMENT", status: "FAILED" },
        { type: "SINGLE_WASH", status: "PAID" },
      ],
      vehicles: [
        {
          subscriptionVehicles: [
            { removedAt: null, subscription: { status: "ACTIVE" } },
          ],
        },
      ],
    },
    {
      subscriptions: [{ status: "ACTIVE" }],
      purchases: [],
      vehicles: [{ subscriptionVehicles: [] }],
    },
  ]);

  assert.deepEqual(summary, {
    totalCustomers: 2,
    activeSubscriptions: 2,
    overdueSubscriptions: 1,
    failedMembershipPayments: 1,
    openCriticalIssues: 1,
    vehiclesCoveredByActiveSubscriptions: 1,
  });
});
