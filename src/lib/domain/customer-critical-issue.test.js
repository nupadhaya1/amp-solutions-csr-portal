import assert from "node:assert/strict";
import test from "node:test";

import { getCustomerCriticalIssue } from "./customer-critical-issue.js";

test("returns a critical unable-to-wash issue for an overdue subscription with a failed membership payment", () => {
  const issue = getCustomerCriticalIssue({
    subscriptions: [{ id: "sub_alex", status: "OVERDUE" }],
    purchases: [
      {
        id: "purchase_failed",
        type: "MEMBERSHIP_PAYMENT",
        status: "FAILED",
      },
    ],
  });

  assert.deepEqual(issue, {
    severity: "critical",
    title: "Unable to wash",
    message:
      "Subscription overdue because the latest membership payment failed.",
    rootCause: "FAILED_MEMBERSHIP_PAYMENT",
    affectedSubscriptionId: "sub_alex",
    relatedPurchaseId: "purchase_failed",
    recommendedAction:
      "Review failed payment and update customer payment details.",
  });
});

test("returns null when no service-blocking payment issue exists", () => {
  const issue = getCustomerCriticalIssue({
    subscriptions: [{ id: "sub_priya", status: "ACTIVE" }],
    purchases: [
      {
        id: "purchase_paid",
        type: "MEMBERSHIP_PAYMENT",
        status: "PAID",
      },
    ],
  });

  assert.equal(issue, null);
});
