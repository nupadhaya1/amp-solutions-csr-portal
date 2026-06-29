import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const addVehicleSource = readFileSync(fileURLToPath(new URL("./add-vehicle-dialog.jsx", import.meta.url)), "utf8");
const editAccountSource = readFileSync(fileURLToPath(new URL("./edit-account-dialog.jsx", import.meta.url)), "utf8");
const updatePaymentSource = readFileSync(fileURLToPath(new URL("./update-payment-dialog.jsx", import.meta.url)), "utf8");
const startMembershipSource = readFileSync(fileURLToPath(new URL("./start-membership-dialog.jsx", import.meta.url)), "utf8");
const planChangeSource = readFileSync(fileURLToPath(new URL("../../plan-change-control.jsx", import.meta.url)), "utf8");

test("customer dialogs include browser validation attributes on required fields", () => {
  assert.match(addVehicleSource, /required/);
  assert.match(addVehicleSource, /min=\{1980\}/);
  assert.match(addVehicleSource, /max=\{2035\}/);
  assert.match(addVehicleSource, /minLength=\{2\}/);
  assert.match(editAccountSource, /required/);
  assert.match(editAccountSource, /type="email"/);
  assert.match(updatePaymentSource, /pattern="\[0-9\]\{4\}"/);
  assert.match(updatePaymentSource, /pattern="\[0-9\]\{5\}"/);
});

test("start membership plan picker always shows the start button", () => {
  assert.match(startMembershipSource, /alwaysShowSubmit/);
  assert.match(planChangeSource, /alwaysShowSubmit/);
  assert.match(planChangeSource, /alwaysShowSubmit \|\| isDirty/);
});
