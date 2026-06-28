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
});

test("customer grid exposes advanced field filters in a dropdown", () => {
  assert.match(source, /Advanced filters/);
  assert.match(source, /advancedFiltersOpen/);
  assert.match(source, /columnFilters/);
  assert.match(source, /aria-controls="advanced-customer-filters"/);
  assert.match(source, /id="advanced-customer-filters"/);
  assert.match(source, /getColumn\("fullName"\)/);
  assert.match(source, /getColumn\("contactSummary"\)/);
  assert.match(source, /getColumn\("vehicleSummary"\)/);
  assert.match(source, /getColumn\("subscriptionSummary"\)/);
  assert.match(source, /Filter name or member ID/);
  assert.match(source, /Filter email or phone/);
  assert.match(source, /Filter vehicle or plate/);
  assert.match(source, /Filter plan/);
  assert.doesNotMatch(source, /absolute right-0/);
  assert.doesNotMatch(source, /shadow-xl/);
  assert.doesNotMatch(source, /header\.column\.id === "fullName"/);
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

test("customer grid default priority sorting is backed by an existing column", () => {
  assert.match(source, /useState\(\[\{ id: "statusLabel", desc: false \}\]\)/);
  assert.match(source, /sortingFn: \(left, right\) => left\.original\.priorityRank - right\.original\.priorityRank/);
  assert.doesNotMatch(source, /useState\(\[\{ id: "priorityRank"/);
});
