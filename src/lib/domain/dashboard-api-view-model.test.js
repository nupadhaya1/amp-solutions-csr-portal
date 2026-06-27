import assert from "node:assert/strict";
import test from "node:test";

import { createDashboardApiViewModel } from "./dashboard-api-view-model.js";

test("returns the dashboard view model fields used by the API response", () => {
  const payload = createDashboardApiViewModel([
    {
      id: "customer_1",
      firstName: "Alex",
      lastName: "Morgan",
      email: "alex@example.com",
      phone: "404-555-0181",
      status: "OVERDUE",
      vehicles: [{ year: 2021, make: "Honda", model: "Civic", licensePlate: "CZR4821" }],
      subscriptions: [{ status: "OVERDUE", plan: { name: "Signature Wash" } }],
      purchases: [{ type: "MEMBERSHIP_PAYMENT", status: "FAILED" }],
    },
    {
      id: "customer_2",
      firstName: "Priya",
      lastName: "Shah",
      email: "priya@example.com",
      phone: "678-555-0124",
      status: "ACTIVE",
      vehicles: [],
      subscriptions: [{ status: "ACTIVE", plan: { name: "Family Unlimited", monthlyPrice: "49.99" } }],
      purchases: [],
    },
  ]);

  assert.deepEqual(Object.keys(payload), [
    "stats",
    "criticalQueue",
    "criticalCustomers",
    "recentCustomers",
  ]);
  assert.equal(payload.stats[0].label, "Total customers");
  assert.equal(payload.criticalQueue.count, 1);
  assert.equal(payload.criticalCustomers[0].id, "customer_1");
  assert.equal(payload.recentCustomers.length, 2);
});
