import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const packageJson = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

test("production build regenerates Prisma Client before compiling Next.js", () => {
  assert.match(packageJson.scripts.build, /^prisma generate && next build$/);
});
