import assert from "node:assert/strict";
import test from "node:test";

import { listCustomerSearchRecords } from "./customers.js";

test("loads lightweight customer records for autocomplete search", async () => {
  const calls = [];
  const prismaClient = {
    customer: {
      findMany: async (args) => {
        calls.push(args);
        return [];
      },
    },
  };

  await listCustomerSearchRecords({ prismaClient });

  assert.equal(calls.length, 1);
  assert.ok(calls[0].select, "autocomplete search should use select");
  assert.equal(calls[0].include, undefined, "autocomplete search should not load full relation history");
  assert.deepEqual(calls[0].orderBy, [{ updatedAt: "desc" }, { lastName: "asc" }]);
  assert.equal(calls[0].select.purchases, undefined);
  assert.equal(calls[0].select.supportNotes, undefined);
  assert.equal(calls[0].select.auditEvents, undefined);
  assert.ok(calls[0].select.vehicles.select);
  assert.ok(calls[0].select.subscriptions.select.plan.select);
});
