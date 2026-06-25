import assert from "node:assert/strict";
import test from "node:test";

import {
  expandCustomerSearchQuery,
  searchCustomers,
} from "./customer-search.js";

const customers = [
  {
    id: "customer_jordan",
    firstName: "Jordan",
    lastName: "Ellis",
    email: "jordan.ellis@example.com",
    phone: "404-555-0181",
    status: "OVERDUE",
    vehicles: [
      {
        year: 2021,
        make: "Honda",
        model: "Civic",
        color: "Blue",
        licensePlate: "AMP1234",
      },
    ],
    subscriptions: [
      {
        status: "OVERDUE",
        plan: { name: "Signature Wash", cleaningTier: "Premium" },
      },
    ],
    purchases: [
      {
        type: "MEMBERSHIP_PAYMENT",
        status: "FAILED",
        description: "Monthly membership payment failed.",
      },
    ],
    supportNotes: [],
    auditEvents: [
      {
        type: "PAYMENT_FAILED",
        message: "Subscription blocked after failed membership payment.",
      },
    ],
  },
  {
    id: "customer_marcus",
    firstName: "Marcus",
    lastName: "Reed",
    email: "marcus.reed@example.com",
    phone: "770-555-0139",
    status: "ACTIVE",
    vehicles: [
      {
        year: 2024,
        make: "Ford",
        model: "F-150",
        color: "Red",
        licensePlate: "NEW889",
      },
    ],
    subscriptions: [
      {
        status: "ACTIVE",
        plan: { name: "Signature Wash", cleaningTier: "Premium" },
      },
    ],
    purchases: [],
    supportNotes: [{ note: "Customer bought a new truck." }],
    auditEvents: [],
  },
];

test("expands required natural-language support phrases with operational synonyms", () => {
  assert.match(expandCustomerSearchQuery("can't wash"), /failed payment/);
  assert.match(expandCustomerSearchQuery("new car"), /vehicle transfer/);
});

test("finds customers by name and license plate", () => {
  assert.equal(searchCustomers(customers, "Jordan")[0].id, "customer_jordan");
  assert.equal(searchCustomers(customers, "AMP1234")[0].id, "customer_jordan");
  assert.equal(searchCustomers(customers, "NEW889")[0].id, "customer_marcus");
});

test("finds the hero customer with support-language queries", () => {
  assert.equal(searchCustomers(customers, "can't wash")[0].id, "customer_jordan");
  assert.equal(searchCustomers(customers, "failed payment")[0].id, "customer_jordan");
  assert.equal(searchCustomers(customers, "overdue")[0].id, "customer_jordan");
});
