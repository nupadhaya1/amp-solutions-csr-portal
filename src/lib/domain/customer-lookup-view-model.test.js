import assert from "node:assert/strict";
import test from "node:test";

import { getCustomerLookupResults } from "./customer-lookup-view-model.js";

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
    subscriptions: [{ status: "OVERDUE", plan: { name: "Signature Wash" } }],
    purchases: [],
    supportNotes: [],
    auditEvents: [],
  },
  {
    id: "customer_priya",
    firstName: "Priya",
    lastName: "Shah",
    email: "priya.shah@example.com",
    phone: "678-555-0124",
    status: "ACTIVE",
    vehicles: [
      {
        year: 2023,
        make: "Toyota",
        model: "Sienna",
        color: "White",
        licensePlate: "FAM2023",
      },
    ],
    subscriptions: [{ status: "ACTIVE", plan: { name: "Family Unlimited" } }],
    purchases: [],
    supportNotes: [],
    auditEvents: [],
  },
];

test("filters customer lookup results by search query and structured fields", () => {
  const results = getCustomerLookupResults(customers, {
    q: "wash",
    name: "alex",
    email: "morgan",
    phone: "404",
    licensePlate: "czr",
  });

  assert.deepEqual(results.map((customer) => customer.id), ["customer_alex"]);
});

test("returns all flattened customers when no filters are provided", () => {
  const results = getCustomerLookupResults(customers, {});

  assert.deepEqual(results.map((customer) => customer.id), [
    "customer_alex",
    "customer_priya",
  ]);
});
