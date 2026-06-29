import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const source = readFileSync(fileURLToPath(new URL("./customer-action-panel.jsx", import.meta.url)), "utf8");

test("customer action panel changes cancelled membership action to start membership", () => {
  assert.match(source, /canStartMembership/);
  assert.match(source, /Start membership/);
  assert.match(source, /start-membership/);
});

test("customer action panel keeps vehicle actions out of the account workflow list", () => {
  assert.doesNotMatch(source, /Add vehicle/);
  assert.doesNotMatch(source, /Assign vehicle/);
  assert.doesNotMatch(source, /Transfer vehicle/);
});
