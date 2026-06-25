import assert from "node:assert/strict";
import test from "node:test";

import {
  addVehicleSchema,
  updateCustomerSchema,
} from "./customer-actions.js";

test("validates account update fields", () => {
  const parsed = updateCustomerSchema.safeParse({
    firstName: "Jordan",
    lastName: "Ellis",
    email: "jordan.ellis@example.com",
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
    licensePlate: "new889",
  });

  assert.equal(parsed.year, 2024);
  assert.equal(parsed.licensePlate, "NEW889");
});
