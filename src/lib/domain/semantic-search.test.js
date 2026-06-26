import assert from "node:assert/strict";
import test from "node:test";

import { buildSemanticDocuments, semanticSearch } from "./semantic-search.js";

const customers = [
  {
    id: "customer_overdue",
    firstName: "Maya",
    lastName: "Patel",
    email: "maya@example.com",
    phone: "678-555-0187",
    status: "OVERDUE",
    vehicles: [{ make: "Mazda", model: "CX-5", licensePlate: "JTF6093" }],
    subscriptions: [{ status: "OVERDUE", plan: { name: "Signature Wash" } }],
    purchases: [
      {
        type: "MEMBERSHIP_PAYMENT",
        status: "FAILED",
        description: "Monthly membership payment failed after card decline.",
      },
    ],
    supportNotes: [{ note: "Customer asked why gate denied wash access." }],
    auditEvents: [{ type: "PAYMENT_FAILED", message: "Payment failed." }],
  },
  {
    id: "customer_transfer",
    firstName: "Ben",
    lastName: "Wilson",
    email: "ben@example.com",
    phone: "470-555-0118",
    status: "ACTIVE",
    vehicles: [
      { make: "Ram", model: "1500", licensePlate: "VPL2307" },
      { make: "Ram", model: "1500", licensePlate: "YNF5186" },
    ],
    subscriptions: [{ status: "ACTIVE", plan: { name: "Signature Wash" } }],
    purchases: [],
    supportNotes: [{ note: "Customer asked whether new truck can replace old vehicle on plan." }],
    auditEvents: [{ type: "VEHICLE_ADDED", message: "New truck added." }],
  },
];

const faqs = [
  {
    id: "faq_failed_payment",
    title: "Failed membership payments",
    question: "What happens if my subscription payment fails?",
    answer: "The subscription can become overdue until payment details are updated.",
    category: "Billing",
    keywords: "failed payment membership overdue billing card declined",
  },
  {
    id: "faq_transfer",
    title: "Transfer membership to a new vehicle",
    question: "Can I transfer my membership to a new vehicle?",
    answer: "A CSR can add the new vehicle and transfer active coverage.",
    category: "Vehicles",
    keywords: "new car transfer subscription vehicle membership",
  },
];

test("builds semantic documents from customers and FAQ articles", () => {
  const documents = buildSemanticDocuments({ customers, faqs });

  assert.equal(documents.length, 4);
  assert.ok(documents.some((document) => document.kind === "customer"));
  assert.ok(documents.some((document) => document.kind === "faq"));
});

test("semantic search ranks conceptually related support documents", () => {
  const documents = buildSemanticDocuments({ customers, faqs });

  assert.equal(semanticSearch(documents, "gate denied after card failed")[0].id, "customer_overdue");
  assert.equal(semanticSearch(documents, "new truck needs membership moved")[0].id, "customer_transfer");
});
