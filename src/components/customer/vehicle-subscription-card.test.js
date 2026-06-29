import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const source = readFileSync(fileURLToPath(new URL("./vehicle-subscription-card.jsx", import.meta.url)), "utf8");

test("white vehicle rows use a darker surface instead of a black silhouette chip", () => {
  assert.match(source, /isWhiteVehicle/);
  assert.match(source, /bg-slate-200/);
  assert.doesNotMatch(source, /bg-slate-950/);
});

test("vehicle card owns add assign and transfer actions", () => {
  assert.match(source, /canAddVehicle/);
  assert.match(source, /Add vehicle/);
  assert.match(source, /canAssignVehicleToPlan/);
  assert.match(source, /Assign vehicle/);
  assert.match(source, /canTransferVehicle/);
  assert.match(source, /Transfer vehicle/);
});
