import assert from "node:assert/strict";
import test from "node:test";

import {
  addCustomerVehicle,
  cancelCustomerSubscription,
  updateCustomerAccount,
} from "./customer-actions.js";

function createPrismaStub() {
  const calls = [];
  const tx = {
    customer: {
      update: async (args) => {
        calls.push(["customer.update", args]);
        return { id: args.where.id, ...args.data };
      },
    },
    vehicle: {
      create: async (args) => {
        calls.push(["vehicle.create", args]);
        return { id: "vehicle_new", ...args.data };
      },
    },
    subscription: {
      update: async (args) => {
        calls.push(["subscription.update", args]);
        return { id: args.where.id, customerId: args.data.customerId, ...args.data };
      },
    },
    auditEvent: {
      create: async (args) => {
        calls.push(["auditEvent.create", args]);
        return { id: "audit_new", ...args.data };
      },
    },
  };

  return {
    calls,
    client: {
      $transaction: async (callback) => callback(tx),
    },
  };
}

test("updates customer account details and writes an audit event", async () => {
  const prisma = createPrismaStub();

  await updateCustomerAccount({
    prismaClient: prisma.client,
    customerId: "customer_1",
    actorName: "Bob Roberts",
    input: {
      firstName: "Alex",
      lastName: "Morgan",
      email: "alex.morgan@example.com",
      phone: "404-555-0101",
    },
  });

  assert.deepEqual(prisma.calls[0], [
    "customer.update",
    {
      where: { id: "customer_1" },
      data: {
        firstName: "Alex",
        lastName: "Morgan",
        email: "alex.morgan@example.com",
        phone: "404-555-0101",
      },
    },
  ]);
  assert.equal(prisma.calls[1][1].data.type, "ACCOUNT_UPDATED");
  assert.equal(prisma.calls[1][1].data.actorName, "Bob Roberts");
});

test("adds a customer vehicle with a normalized realistic plate and audit event", async () => {
  const prisma = createPrismaStub();

  await addCustomerVehicle({
    prismaClient: prisma.client,
    customerId: "customer_1",
    actorName: "Bob Roberts",
    input: {
      year: "2024",
      make: "Toyota",
      model: "Camry",
      color: "Black",
      licensePlate: "czr4821",
    },
  });

  assert.equal(prisma.calls[0][0], "vehicle.create");
  assert.equal(prisma.calls[0][1].data.licensePlate, "CZR4821");
  assert.equal(prisma.calls[1][1].data.type, "VEHICLE_ADDED");
  assert.deepEqual(prisma.calls[1][1].data.metadata, {
    licensePlate: "CZR4821",
    vehicle: "2024 Toyota Camry",
  });
});

test("cancels a subscription and records the CSR reason", async () => {
  const prisma = createPrismaStub();

  await cancelCustomerSubscription({
    prismaClient: prisma.client,
    customerId: "customer_1",
    subscriptionId: "subscription_1",
    actorName: "Bob Roberts",
    input: {
      reason: "Customer sold the vehicle.",
    },
  });

  assert.deepEqual(prisma.calls[0], [
    "subscription.update",
    {
      where: { id: "subscription_1", customerId: "customer_1" },
      data: { status: "CANCELLED" },
    },
  ]);
  assert.equal(prisma.calls[1][1].data.type, "SUBSCRIPTION_CANCELLED");
  assert.deepEqual(prisma.calls[1][1].data.metadata, {
    reason: "Customer sold the vehicle.",
  });
});
