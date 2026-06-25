import assert from "node:assert/strict";
import test from "node:test";

import {
  addVehicleSchema,
  changeSubscriptionPlanSchema,
  updateCustomerSchema,
  transferSubscriptionSchema,
} from "./customer-actions.js";

test("validates account update fields", () => {
  const parsed = updateCustomerSchema.safeParse({
    firstName: "Alex",
    lastName: "Morgan",
    email: "alex.morgan@example.com",
    phone: "404-555-0181",
  });

  assert.equal(parsed.success, true);
});

test("normalizes vehicle license plates when adding a vehicle", () => {
  const parsed = addVehicleSchema.parse({
    year: "2024",
    make: "Ford",
    model: "F-150",
    color: "Red",
    licensePlate: "mql6187",
  });

  assert.equal(parsed.year, 2024);
  assert.equal(parsed.licensePlate, "MQL6187");
});

test("requires different vehicles for a subscription transfer", () => {
  const result = transferSubscriptionSchema.safeParse({
    fromVehicleId: "vehicle_1",
    toVehicleId: "vehicle_1",
  });

  assert.equal(result.success, false);
});

test("requires a selected plan for plan changes", () => {
  const result = changeSubscriptionPlanSchema.safeParse({
    planId: "",
  });

  assert.equal(result.success, false);
});
