import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const css = readFileSync(fileURLToPath(new URL("./globals.css", import.meta.url)), "utf8");

test("global layout reserves scrollbar space to avoid tab content shifts", () => {
  assert.match(css, /scrollbar-gutter:\s*stable/);
  assert.match(css, /html\s*\{/);
  assert.match(css, /\.overflow-y-auto/);
});
