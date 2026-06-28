import assert from "node:assert/strict";
import test from "node:test";

import { getRecommendedNextSteps } from "./recommended-next-steps.js";

test("prioritizes overdue billing issues and uses matching support docs", async () => {
  const nextStep = await getRecommendedNextSteps(
    {
      billing: {
        paymentStatus: "OVERDUE",
        lastFailedCharge: {
          amount: "$29.99",
        },
      },
      status: "OVERDUE",
      actionAvailability: {
        canTransferVehicle: true,
        canAddVehicle: true,
      },
    },
    {
      searchDocs: async () => [
        {
          title: "Unable to wash after failed payment",
          summary: "Use the payment recovery playbook before sending the customer back to the lane.",
          slug: "unable-to-wash-overdue-payment",
        },
      ],
    },
  );

  assert.equal(nextStep.priority, "critical");
  assert.equal(nextStep.actions[0], "update-payment");
  assert.match(nextStep.title, /retry failed charge/i);
  assert.equal(nextStep.reason, "Use the payment recovery playbook before sending the customer back to the lane.");
  assert.equal(nextStep.docsHref, "/csr/docs/unable-to-wash-overdue-payment");
  assert.equal(nextStep.suggestedFlow[0], "Open Unable to wash after failed payment.");
});

test("falls back to a cancellation review for cancelled accounts", async () => {
  const nextStep = await getRecommendedNextSteps({
    status: "CANCELLED",
    actionAvailability: {
      canTransferVehicle: false,
      canAddVehicle: false,
    },
  });

  assert.equal(nextStep.priority, "normal");
  assert.match(nextStep.title, /cancelled membership/i);
  assert.deepEqual(nextStep.actions, ["add-note", "change-plan", "open-billing-docs"]);
});

test("returns a low urgency add-vehicle recommendation before the neutral fallback", async () => {
  const nextStep = await getRecommendedNextSteps({
    status: "ACTIVE",
    billing: {
      paymentStatus: "CURRENT",
    },
    actionAvailability: {
      canTransferVehicle: false,
      canAddVehicle: true,
    },
  });

  assert.equal(nextStep.priority, "low");
  assert.match(nextStep.reason, /allow another vehicle/i);
});

test("shows everything looks good when no issue matches", async () => {
  const nextStep = await getRecommendedNextSteps({
    status: "ACTIVE",
    billing: {
      paymentStatus: "CURRENT",
    },
    actionAvailability: {
      canTransferVehicle: false,
      canAddVehicle: false,
    },
  });

  assert.equal(nextStep.priority, "normal");
  assert.equal(nextStep.title, "Everything looks good");
  assert.equal(nextStep.reason, "No billing, subscription, or vehicle issues are currently flagged for this customer.");
  assert.deepEqual(nextStep.actions, ["add-note"]);
});
