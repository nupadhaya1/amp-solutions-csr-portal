import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const source = readFileSync(fileURLToPath(new URL("./customer-table.jsx", import.meta.url)), "utf8");

test("customer page uses compact header, stat cards, and a single grid search", () => {
  assert.match(source, /Current search/);
  assert.match(source, /StatCard/);
  assert.match(source, /Total customers/);
  assert.match(source, /Filtered results/);
  assert.match(source, /Needs attention/);
  assert.match(source, /Overdue/);
  assert.match(source, /Payment failures/);
  assert.match(source, /Filter customer grid/);
  assert.match(source, /Clear search/);

  assert.doesNotMatch(source, /function SummaryTile/);
  assert.doesNotMatch(source, /function FilterInput/);
  assert.doesNotMatch(source, /name="name"/);
  assert.doesNotMatch(source, /name="email"/);
  assert.doesNotMatch(source, /name="phone"/);
  assert.doesNotMatch(source, /name="licensePlate"/);
});

test("customer page restores and clears the shared remembered search query", () => {
  assert.match(source, /getRememberedCustomerSearch/);
  assert.match(source, /setRememberedCustomerSearch/);
  assert.match(source, /clearRememberedCustomerSearch/);
  assert.doesNotMatch(source, /returnQuery=/);
});

test("customer grid exposes the requested operational columns", () => {
  assert.match(source, /header: "Customer"/);
  assert.match(source, /header: "Contact"/);
  assert.match(source, /header: "Vehicle \/ plate"/);
  assert.match(source, /header: "Plan"/);
  assert.match(source, /header: "Status"/);
  assert.match(source, /header: "Payment"/);
  assert.match(source, /Open profile/);
  assert.match(source, /pageSize: 10/);
  assert.doesNotMatch(source, /header: "Priority"/);
  assert.doesNotMatch(source, /\{customer\.id\}/);
  assert.doesNotMatch(source, /row\.original\.priorityLabel/);
});
