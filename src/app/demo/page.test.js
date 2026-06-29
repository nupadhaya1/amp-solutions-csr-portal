import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const pageSource = readFileSync(fileURLToPath(new URL("./page.js", import.meta.url)), "utf8");
const seedSource = readFileSync(fileURLToPath(new URL("../../../prisma/seed.js", import.meta.url)), "utf8");

test("demo hub does not expose destructive mock data reset", () => {
  assert.match(seedSource, /export async function resetFullDemoData/);
  assert.match(seedSource, /async function seedDashboardTimeSeriesData/);
  assert.match(seedSource, /seedMemberIdCounter = 1/);
  assert.doesNotMatch(seedSource, /execFile/);
  assert.doesNotMatch(seedSource, /python3/);
  assert.doesNotMatch(pageSource, /resetFullDemoData/);
  assert.doesNotMatch(pageSource, /resetMockData/);
  assert.doesNotMatch(pageSource, /ResetMockDataButton/);
  assert.doesNotMatch(pageSource, /Reset mock data/);
});
