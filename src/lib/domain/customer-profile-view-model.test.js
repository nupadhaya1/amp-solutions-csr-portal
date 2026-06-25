import assert from "node:assert/strict";
import test from "node:test";

import { createCustomerProfileViewModel, formatMoney } from "./customer-profile-view-model.js";

test("formats money for purchase and plan values", () => {
  assert.equal(formatMoney("39.99"), "$39.99");
});

test("builds customer profile coverage and critical issue details", () => {
  const profile = createCustomerProfileViewModel({
    id: "customer_1",
    firstName: "Alex",
    lastName: "Morgan",
    email: "alex@example.com",
    phone: "404-555-0181",
    status: "OVERDUE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-06-20T00:00:00.000Z",
    vehicles: [
      {
        id: "vehicle_1",
        year: 2021,
        make: "Honda",
        model: "Civic",
        color: "Blue",
        licensePlate: "CZR4821",
        subscriptionVehicles: [
          {
            removedAt: null,
            subscription: {
              status: "OVERDUE",
              plan: { name: "Signature Wash" },
            },
          },
        ],
      },
    ],
    subscriptions: [
      {
        id: "sub_1",
        status: "OVERDUE",
        startedAt: "2026-01-01T00:00:00.000Z",
        nextBillingDate: "2026-06-20T00:00:00.000Z",
        plan: {
          name: "Signature Wash",
          monthlyPrice: "29.99",
          cleaningTier: "Premium",
          maxVehicles: 1,
        },
        vehicles: [],
      },
    ],
    purchases: [
      {
        id: "purchase_1",
        type: "MEMBERSHIP_PAYMENT",
        status: "FAILED",
        amount: "39.99",
        purchasedAt: "2026-06-20T00:00:00.000Z",
        description: "Monthly membership payment failed.",
      },
    ],
    supportNotes: [],
    auditEvents: [],
  });

  assert.equal(profile.fullName, "Alex Morgan");
  assert.equal(profile.criticalIssue.title, "Unable to wash");
  assert.equal(profile.vehicles[0].coverageStatus, "Signature Wash · OVERDUE");
});
