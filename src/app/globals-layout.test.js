import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const css = readFileSync(fileURLToPath(new URL("./globals.css", import.meta.url)), "utf8");
const layout = readFileSync(fileURLToPath(new URL("./layout.js", import.meta.url)), "utf8");

test("global layout reserves scrollbar space to avoid tab content shifts", () => {
  assert.match(css, /scrollbar-gutter:\s*stable/);
  assert.match(css, /html\s*\{/);
  assert.match(css, /\.overflow-y-auto/);
});

test("root metadata uses the 150 favicon asset only", () => {
  const iconsSource = layout.slice(layout.indexOf("icons:"), layout.indexOf("manifest:"));

  assert.match(iconsSource, /favicon-150x150\.webp/);
  assert.doesNotMatch(iconsSource, /logo-amp\.svg/);
  assert.doesNotMatch(iconsSource, /favicon-16x16|favicon-32x32|favicon-48x48|favicon-192x192|favicon-512x512/);
});
