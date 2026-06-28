import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const profileSource = readFileSync(
  fileURLToPath(new URL("../app/csr/customers/[id]/page.jsx", import.meta.url)),
  "utf8",
);
const shellSource = readFileSync(fileURLToPath(new URL("./portal-shell.js", import.meta.url)), "utf8");

test("customer profile removes top workspace tabs in favor of dashboard layout", () => {
  assert.match(profileSource, /CustomerDashboardLayout/);
  assert.match(profileSource, /createCustomerDashboardViewModel/);
  assert.match(profileSource, /returnQuery/);
  assert.match(profileSource, /backHref=\{backHref\}/);
  assert.doesNotMatch(profileSource, /CustomerWorkspaceTabs/);
});

test("sidebar uses AMP branding and nests the active customer under all customers", () => {
  assert.match(shellSource, /logo-amp\.svg/);
  assert.match(shellSource, /Customers/);
  assert.match(shellSource, /pathname\.startsWith\("\/csr\/customers\/"\)/);
  assert.match(shellSource, /currentCustomerName/);
  assert.match(shellSource, /Nikhil Upadhaya/);
  assert.doesNotMatch(shellSource, />CSR</);
  assert.doesNotMatch(shellSource, /<header className=/);
});
