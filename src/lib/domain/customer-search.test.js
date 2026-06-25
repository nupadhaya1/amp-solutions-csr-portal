import assert from "node:assert/strict";
import test from "node:test";

import {
  expandCustomerSearchQuery,
  searchCustomers,
} from "./customer-search.js";

const customers = [
  {
    id: "customer_alex",
    firstName: "Alex",
    lastName: "Morgan",
    email: "alex.morgan@example.com",
    phone: "404-555-0181",
    status: "OVERDUE",
    vehicles: [
      {
        year: 2021,
        make: "Honda",
        model: "Civic",
        color: "Blue",
        licensePlate: "CZR4821",
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
        licensePlate: "MQL6187",
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
  assert.equal(searchCustomers(customers, "Alex")[0].id, "customer_alex");
  assert.equal(searchCustomers(customers, "CZR4821")[0].id, "customer_alex");
  assert.equal(searchCustomers(customers, "MQL6187")[0].id, "customer_marcus");
});

test("finds the hero customer with support-language queries", () => {
  assert.equal(searchCustomers(customers, "can't wash")[0].id, "customer_alex");
  assert.equal(searchCustomers(customers, "failed payment")[0].id, "customer_alex");
  assert.equal(searchCustomers(customers, "overdue")[0].id, "customer_alex");
});
