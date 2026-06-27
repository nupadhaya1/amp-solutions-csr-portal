import assert from "node:assert/strict";
import test from "node:test";

import { getRecommendedNextSteps } from "./recommended-next-steps.js";

test("prioritizes overdue billing issues as the primary next step", () => {
  const nextStep = getRecommendedNextSteps({
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
  });

  assert.equal(nextStep.priority, "critical");
  assert.equal(nextStep.actions[0], "update-payment");
  assert.match(nextStep.title, /retry failed charge/i);
  assert.equal(nextStep.suggestedFlow.length, 4);
});

test("falls back to a cancellation review for cancelled accounts", () => {
  const nextStep = getRecommendedNextSteps({
    status: "CANCELLED",
    actionAvailability: {
      canTransferVehicle: false,
      canAddVehicle: false,
    },
  });

  assert.equal(nextStep.priority, "normal");
  assert.match(nextStep.title, /cancelled membership/i);
  assert.deepEqual(nextStep.actions, ["add-note", "change-plan"]);
});

test("returns a low urgency add-vehicle recommendation before the neutral fallback", () => {
  const nextStep = getRecommendedNextSteps({
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

test("returns a neutral recommendation when no rule matches", () => {
  const nextStep = getRecommendedNextSteps({
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
  assert.match(nextStep.title, /no urgent action/i);
  assert.deepEqual(nextStep.actions, ["add-note"]);
});
