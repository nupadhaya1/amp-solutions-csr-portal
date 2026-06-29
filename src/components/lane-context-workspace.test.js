import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workspaceSource = readFileSync(
  new URL("./lane-context-workspace.jsx", import.meta.url),
  "utf8",
);
const pageSource = readFileSync(
  new URL("../app/csr/lane-context/page.jsx", import.meta.url),
  "utf8",
);

test("lane context search uses debounced local filtering with clear and result-only loading", () => {
  assert.match(workspaceSource, /window\.setTimeout/);
  assert.match(workspaceSource, /LoaderCircle/);
  assert.match(workspaceSource, /aria-label="Clear detected plate search"/);
  assert.match(workspaceSource, /aria-busy=\{isFiltering\}/);
});

test("lane context exposes a lane-only reset action", () => {
  assert.match(pageSource, /resetLaneContextData/);
  assert.match(pageSource, /async function resetLaneContext/);
  assert.match(workspaceSource, /Reset lane data/);
  assert.match(workspaceSource, /resetLaneContextAction/);
  assert.match(workspaceSource, /useFormStatus/);
});

test("lane context resolver guide links to CSR docs", () => {
  assert.match(workspaceSource, /\/csr\/docs\/unable-to-wash-overdue-payment/);
  assert.match(workspaceSource, /\/csr\/docs\/transfer-subscription-new-vehicle/);
  assert.match(workspaceSource, /\/csr\/docs\/add-new-vehicle/);
  assert.match(workspaceSource, /target="_blank"/);
  assert.match(workspaceSource, /rel="noopener noreferrer"/);
});

test("lane context supports customer-scoped links from customer profiles", () => {
  assert.match(workspaceSource, /initialCustomerId/);
  assert.match(workspaceSource, /customerId: initialCustomerId/);
  assert.match(pageSource, /initialCustomerId=\{String\(params\?\.customerId/);
});
