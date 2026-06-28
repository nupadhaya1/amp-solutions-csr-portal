import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const source = readFileSync(fileURLToPath(new URL("./csr-route-loading.jsx", import.meta.url)), "utf8");

test("route loading cards keep skeleton rows inside the card bounds", () => {
  assert.doesNotMatch(source, /className="h-36 /);
  assert.match(source, /min-h-\[10\.75rem\]/);
});
