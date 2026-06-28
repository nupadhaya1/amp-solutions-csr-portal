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
      customerStatus: "OVERDUE",
      primaryVehicle: "2021 Honda Civic",
      licensePlate: "CZR4821",
      subscriptionSummary: "Signature Wash OVERDUE",
      hasCriticalIssue: true,
      searchText: "MEMBERSHIP_PAYMENT FAILED failed payment",
    },
    {
      id: "customer_priya",
      fullName: "Priya Shah",
      email: "priya.shah@example.com",
      phone: "678-555-0124",
      customerStatus: "ACTIVE",
      primaryVehicle: "2023 Toyota Sienna",
      licensePlate: "FAM2023",
      subscriptionSummary: "Family Unlimited ACTIVE",
      hasCriticalIssue: false,
      searchText: "MEMBERSHIP_PAYMENT PAID",
      laneSession: {
        status: "IN_QUEUE",
        issueCode: "NONE",
        issueSeverity: "NONE",
      },
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
  assert.equal(viewModel.summary.overdueCount, 1);
  assert.equal(viewModel.summary.paymentFailureCount, 1);
  assert.equal(viewModel.summary.laneSessionCount, 1);
  assert.equal(viewModel.summary.activeFilterCount, 2);
  assert.deepEqual(
    viewModel.rows.map((row) => ({
      id: row.id,
      initials: row.initials,
      laneBadge: row.laneBadge,
      paymentLabel: row.paymentLabel,
      statusLabel: row.statusLabel,
    })),
    [
      {
        id: "customer_alex",
        initials: "AM",
        laneBadge: null,
        paymentLabel: "Payment failure",
        statusLabel: "Overdue",
      },
      {
        id: "customer_priya",
        initials: "PS",
        laneBadge: {
          label: "In queue",
          tone: "success",
          searchText: "Lane context In queue No issue NONE NONE",
        },
        paymentLabel: "Current",
        statusLabel: "Active",
      },
    ],
  );
});
