import assert from "node:assert/strict";
import test from "node:test";

import { normalizeSearchQuery, toPgVector } from "./vector.js";

test("formats arrays as pgvector literals", () => {
  assert.equal(toPgVector([0.1, -0.2, 1 / 3]), "[0.10000000,-0.20000000,0.33333333]");
});

test("rejects invalid vector values", () => {
  assert.throws(() => toPgVector("0.1"), /Expected embedding array/);
  assert.throws(() => toPgVector([0.1, Number.NaN]), /finite number/);
});

test("normalizes search query whitespace", () => {
  assert.equal(normalizeSearchQuery("  gate\n denied   "), "gate denied");
});
