import assert from "node:assert/strict";
import test from "node:test";

import { createCustomerTableViewModel } from "./customer-table-view-model.js";

test("summarizes customer table rows and attention counts", () => {
  const rows = [
    {
      id: "customer_alex",
      fullName: "Alex Morgan",
      email: "alex.morgan@example.com",
      phone: "404-555-0181",
      primaryVehicle: "2021 Honda Civic",
      licensePlate: "CZR4821",
      subscriptionSummary: "Signature Wash OVERDUE",
      hasCriticalIssue: true,
    },
    {
      id: "customer_priya",
      fullName: "Priya Shah",
      email: "priya.shah@example.com",
      phone: "678-555-0124",
      primaryVehicle: "2023 Toyota Sienna",
      licensePlate: "FAM2023",
      subscriptionSummary: "Family Unlimited ACTIVE",
      hasCriticalIssue: false,
    },
  ];

  const viewModel = createCustomerTableViewModel(rows, {
    totalCustomers: 4,
    activeFilters: {
      q: "wash",
      name: "",
      email: "",
      phone: "",
      licensePlate: "CZR",
    },
  });

  assert.equal(viewModel.summary.totalCustomers, 4);
  assert.equal(viewModel.summary.resultCount, 2);
  assert.equal(viewModel.summary.attentionCount, 1);
  assert.equal(viewModel.summary.activeFilterCount, 2);
  assert.deepEqual(
    viewModel.rows.map((row) => ({
      id: row.id,
      initials: row.initials,
      statusLabel: row.statusLabel,
      priorityRank: row.priorityRank,
    })),
    [
      {
        id: "customer_alex",
        initials: "AM",
        statusLabel: "Needs attention",
        priorityRank: 0,
      },
      {
        id: "customer_priya",
        initials: "PS",
        statusLabel: "Active",
        priorityRank: 1,
      },
    ],
  );
});
