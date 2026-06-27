import assert from "node:assert/strict";
import test from "node:test";

import { createCustomerProfileViewModel, formatMoney } from "./customer-profile-view-model.js";

test("formats money for purchase and plan values", () => {
  assert.equal(formatMoney("39.99"), "$39.99");
});

test("builds customer profile coverage and critical issue details", () => {
  const profile = createCustomerProfileViewModel({
    id: "customer_1",
    memberId: "AMP-0001",
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
        purchasedAt: "2026-06-20T12:00:00.000Z",
        description: "Monthly membership payment failed.",
      },
    ],
    supportNotes: [],
    auditEvents: [],
  });

  assert.equal(profile.fullName, "Alex Morgan");
  assert.equal(profile.memberId, "AMP-0001");
  assert.equal(profile.criticalIssue.title, "Unable to wash");
  assert.equal(profile.vehicles[0].coverageStatus, "Signature Wash · OVERDUE");
  assert.equal(profile.paymentSummary.status, "Needs payment update");
  assert.equal(profile.paymentSummary.failedPayments, 1);
  assert.equal(profile.paymentSummary.latestFailedPayment, "$39.99 · Jun 20, 2026");
});

test("shows support note preview in audit timeline details", () => {
  const profile = createCustomerProfileViewModel({
    id: "customer_1",
    memberId: "AMP-0001",
    firstName: "Alex",
    lastName: "Morgan",
    email: "alex@example.com",
    phone: "404-555-0181",
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-06-20T00:00:00.000Z",
    vehicles: [],
    subscriptions: [],
    purchases: [],
    supportNotes: [],
    auditEvents: [
      {
        id: "audit_1",
        type: "SUPPORT_NOTE_ADDED",
        message: "Support note added by CSR.",
        metadata: {
          notePreview: "Customer said the gate denied access after payment failed.",
        },
        actorName: "Bob Roberts",
        actorType: "CSR",
        createdAt: "2026-06-26T00:00:00.000Z",
      },
    ],
  });

  assert.equal(
    profile.auditEvents[0].detail,
    "Customer said the gate denied access after payment failed.",
  );
});

test("shows payment update audit details without storing full card data", () => {
  const profile = createCustomerProfileViewModel({
    id: "customer_1",
    memberId: "AMP-0001",
    firstName: "Alex",
    lastName: "Morgan",
    email: "alex@example.com",
    phone: "404-555-0181",
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-06-20T00:00:00.000Z",
    vehicles: [],
    subscriptions: [],
    purchases: [],
    supportNotes: [],
    auditEvents: [
      {
        id: "audit_1",
        type: "ACCOUNT_UPDATED",
        message: "Payment method updated and failed membership payment retried.",
        metadata: {
          paymentMethod: {
            brand: "Visa",
            last4: "1111",
            expiry: "10/30",
          },
          resolvedPayments: 1,
        },
        actorName: "Bob Roberts",
        actorType: "CSR",
        createdAt: "2026-06-26T00:00:00.000Z",
      },
    ],
  });

  assert.equal(profile.paymentSummary.status, "Valid payment method");
  assert.equal(profile.paymentSummary.cardLast4, "1111");
  assert.equal(profile.auditEvents[0].detail, "Visa ending 1111 · 1 payment issue(s) resolved");
});
