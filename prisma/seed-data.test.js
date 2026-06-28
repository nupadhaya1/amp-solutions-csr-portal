import assert from "node:assert/strict";
import test from "node:test";

import { buildSeedCustomers } from "./seed.js";

test("seed data includes a realistic support queue", () => {
  const customers = buildSeedCustomers();

  assert.ok(customers.length >= 14);
  assert.ok(customers.some((customer) => customer.customer.status === "OVERDUE"));
  assert.ok(customers.some((customer) => customer.subscription.status === "CANCELLED"));
  assert.ok(customers.some((customer) => customer.subscription.status === "PAUSED"));
});

test("seed data assigns every customer a home base wash location", () => {
  const customers = buildSeedCustomers();
  const homeWashLocations = customers.map((customer) => customer.customer.homeWashLocation);

  assert.equal(homeWashLocations.length, customers.length);
  assert.ok(homeWashLocations.every((location) => String(location || "").startsWith("AMP ")));
  assert.ok(new Set(homeWashLocations).size >= 3);
});

test("seed data keeps customer emails and license plates unique", () => {
  const customers = buildSeedCustomers();
  const emails = customers.map((customer) => customer.customer.email);
  const plates = customers.flatMap((customer) =>
    customer.vehicles.map((vehicle) => vehicle.licensePlate),
  );

  assert.equal(new Set(emails).size, emails.length);
  assert.equal(new Set(plates).size, plates.length);
});
