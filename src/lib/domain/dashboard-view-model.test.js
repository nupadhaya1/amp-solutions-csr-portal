import assert from "node:assert/strict";
import test from "node:test";

import { createPortalDashboardViewModel } from "./dashboard-view-model.js";

test("builds dashboard cards and critical queue copy from customer data", () => {
  const viewModel = createPortalDashboardViewModel([
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
      subscriptions: [{ status: "ACTIVE", plan: { name: "Family Unlimited" } }],
      purchases: [],
    },
  ]);

  assert.deepEqual(viewModel.stats, [
    { label: "Total customers", value: "2" },
    { label: "Active subscriptions", value: "1" },
    { label: "Open critical issues", value: "1" },
    { label: "Failed payments", value: "1" },
  ]);
  assert.equal(viewModel.criticalQueue.count, 1);
  assert.equal(viewModel.recentCustomers[0].status, "Critical");
});
