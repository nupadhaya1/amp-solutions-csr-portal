import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const pageSource = readFileSync(fileURLToPath(new URL("./page.js", import.meta.url)), "utf8");
const resetButtonSource = readFileSync(
  fileURLToPath(new URL("./reset-mock-data-button.jsx", import.meta.url)),
  "utf8",
);
const seedSource = readFileSync(fileURLToPath(new URL("../../../prisma/seed.js", import.meta.url)), "utf8");

test("demo hub exposes a server action to reset seeded mock data", () => {
  assert.match(seedSource, /export async function resetDemoData/);
  assert.match(seedSource, /seedMemberIdCounter = 1/);
  assert.match(pageSource, /resetDemoData/);
  assert.match(pageSource, /async function resetMockData/);
  assert.match(pageSource, /<form action=\{resetMockData\}/);
  assert.match(pageSource, /<ResetMockDataButton \/>/);
  assert.match(resetButtonSource, /useFormStatus/);
  assert.match(resetButtonSource, /pending/);
  assert.match(resetButtonSource, /LoaderCircle/);
  assert.match(resetButtonSource, /Resetting\.\.\./);
  assert.match(resetButtonSource, /Reset mock data/);
});
