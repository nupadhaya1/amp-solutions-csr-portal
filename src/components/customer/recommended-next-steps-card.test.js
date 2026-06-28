import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./recommended-next-steps-card.jsx", import.meta.url), "utf8");

test("recommended CSR docs actions open in a new tab", () => {
  assert.match(source, /target="_blank"/);
  assert.match(source, /rel="noopener noreferrer"/);
  assert.match(source, /Open CSR docs/);
});
