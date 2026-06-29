import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const source = readFileSync(fileURLToPath(new URL("./customer-table.jsx", import.meta.url)), "utf8");
const pageSource = readFileSync(
  fileURLToPath(new URL("../app/csr/customers/page.jsx", import.meta.url)),
  "utf8",
);
const shellSource = readFileSync(fileURLToPath(new URL("./portal-shell.js", import.meta.url)), "utf8");

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

test("customer grid relies on the global search instead of advanced filters", () => {
  assert.doesNotMatch(source, /Advanced filters/);
  assert.doesNotMatch(source, /advancedFiltersOpen/);
  assert.doesNotMatch(source, /columnFilters/);
  assert.doesNotMatch(source, /ColumnFilter/);
  assert.doesNotMatch(source, /getColumn\("fullName"\)/);
  assert.doesNotMatch(source, /id="advanced-customer-filters"/);
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

test("customer page uses one scroll region for the data grid", () => {
  assert.match(shellSource, /pathname === "\/csr\/customers" \? "overflow-hidden" : "overflow-y-auto"/);
  assert.match(pageSource, /flex h-full min-h-0 flex-col gap-4/);
  assert.match(source, /flex min-h-0 flex-1 flex-col gap-4/);
  assert.match(source, /grid min-h-0 flex-1 grid-rows-\[minmax\(0,1fr\)_auto\] overflow-hidden/);
  assert.match(source, /min-h-0 overflow-auto/);
});
