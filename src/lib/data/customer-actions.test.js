import assert from "node:assert/strict";
import test from "node:test";

import {
  addCustomerVehicle,
  assignVehicleToSubscription,
  cancelCustomerSubscription,
  changeSubscriptionPlan,
  startCustomerMembership,
  transferSubscriptionVehicle,
  updateCustomerAccount,
} from "./customer-actions.js";

function createPrismaStub(options = {}) {
  const coveredVehicles = options.coveredVehicles || [
    { id: "coverage_existing", vehicleId: "vehicle_existing" },
  ];
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
      findFirst: async (args) => {
        calls.push(["vehicle.findFirst", args]);
        return {
          id: args.where.id,
          year: 2024,
          make: "Toyota",
          model: "Camry",
          licensePlate: "CZR4821",
        };
      },
    },
    subscription: {
      count: async (args) => {
        calls.push(["subscription.count", args]);
        return 0;
      },
      findFirst: async (args) => {
        calls.push(["subscription.findFirst", args]);
        return {
          id: args.where.id,
          customerId: args.where.customerId,
          status: "ACTIVE",
          plan: {
            maxVehicles: 2,
          },
          vehicles: coveredVehicles,
        };
      },
      update: async (args) => {
        calls.push(["subscription.update", args]);
        return { id: args.where.id, customerId: args.data.customerId, ...args.data };
      },
      updateMany: async (args) => {
        calls.push(["subscription.updateMany", args]);
        return { count: 1 };
      },
    },
    subscriptionPlan: {
      findUnique: async (args) => {
        calls.push(["subscriptionPlan.findUnique", args]);
        return {
          id: args.where.id,
          maxVehicles: args.where.id === "plan_single" ? 1 : 2,
        };
      },
    },
    subscriptionVehicle: {
      create: async (args) => {
        calls.push(["subscriptionVehicle.create", args]);
        return { id: "coverage_new", ...args.data };
      },
      findFirst: async (args) => {
        calls.push(["subscriptionVehicle.findFirst", args]);
        return null;
      },
      updateMany: async (args) => {
        calls.push(["subscriptionVehicle.updateMany", args]);
        return { count: 1 };
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

test("cancels a subscription, unassigns active vehicle coverage, and records the CSR reason", async () => {
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
    "subscription.updateMany",
    {
      where: {
        id: "subscription_1",
        customerId: "customer_1",
        status: {
          in: ["ACTIVE", "OVERDUE"],
        },
      },
      data: { status: "CANCELLED" },
    },
  ]);

  assert.equal(prisma.calls[1][0], "subscriptionVehicle.updateMany");
  assert.deepEqual(prisma.calls[1][1], {
    where: {
      subscriptionId: "subscription_1",
      removedAt: null,
    },
    data: {
      removedAt: prisma.calls[1][1].data.removedAt,
    },
  });
  assert.ok(prisma.calls[1][1].data.removedAt instanceof Date);

  assert.deepEqual(prisma.calls[2], [
    "subscription.count",
    {
      where: {
        customerId: "customer_1",
        status: {
          in: ["ACTIVE", "OVERDUE"],
        },
      },
    },
  ]);

  assert.equal(prisma.calls[3][1].data.type, "SUBSCRIPTION_CANCELLED");
  assert.deepEqual(prisma.calls[3][1].data.metadata, {
    reason: "Customer sold the vehicle.",
    removedVehicleCoverageCount: 1,
  });

  assert.deepEqual(prisma.calls[4], [
    "customer.update",
    {
      where: { id: "customer_1" },
      data: { status: "CANCELLED" },
    },
  ]);
});

test("transfers active subscription coverage between vehicles", async () => {
  const prisma = createPrismaStub();

  await transferSubscriptionVehicle({
    prismaClient: prisma.client,
    customerId: "customer_1",
    subscriptionId: "subscription_1",
    actorName: "Bob Roberts",
    input: {
      fromVehicleId: "vehicle_old",
      toVehicleId: "vehicle_new",
    },
  });

  assert.equal(prisma.calls[0][0], "subscriptionVehicle.updateMany");
  assert.deepEqual(prisma.calls[0][1].where, {
    subscriptionId: "subscription_1",
    vehicleId: "vehicle_old",
    removedAt: null,
  });
  assert.equal(prisma.calls[1][0], "subscriptionVehicle.create");
  assert.deepEqual(prisma.calls[1][1].data, {
    subscriptionId: "subscription_1",
    vehicleId: "vehicle_new",
  });
  assert.equal(prisma.calls[2][1].data.type, "SUBSCRIPTION_TRANSFERRED");
  assert.deepEqual(prisma.calls[2][1].data.metadata, {
    fromVehicleId: "vehicle_old",
    toVehicleId: "vehicle_new",
    subscriptionId: "subscription_1",
  });
});

test("assigns an uncovered vehicle to an active plan with open capacity", async () => {
  const prisma = createPrismaStub();

  await assignVehicleToSubscription({
    prismaClient: prisma.client,
    customerId: "customer_1",
    subscriptionId: "subscription_1",
    actorName: "Nikhil Upadhaya",
    input: {
      vehicleId: "vehicle_new",
    },
  });

  assert.deepEqual(prisma.calls[0][1].where, {
    id: "subscription_1",
    customerId: "customer_1",
    status: {
      in: ["ACTIVE", "OVERDUE"],
    },
  });
  assert.deepEqual(prisma.calls[1][1].where, {
    id: "vehicle_new",
    customerId: "customer_1",
  });
  assert.deepEqual(prisma.calls[2][1].where, {
    vehicleId: "vehicle_new",
    removedAt: null,
    subscription: {
      status: {
        not: "CANCELLED",
      },
    },
  });
  assert.deepEqual(prisma.calls[3], [
    "subscriptionVehicle.create",
    {
      data: {
        subscriptionId: "subscription_1",
        vehicleId: "vehicle_new",
      },
    },
  ]);
  assert.equal(prisma.calls[4][1].data.type, "SUBSCRIPTION_ADDED");
  assert.deepEqual(prisma.calls[4][1].data.metadata, {
    vehicleId: "vehicle_new",
    vehicle: "2024 Toyota Camry",
    licensePlate: "CZR4821",
    subscriptionId: "subscription_1",
  });
});

test("changes a subscription plan and records the selected plan", async () => {
  const prisma = createPrismaStub();

  await changeSubscriptionPlan({
    prismaClient: prisma.client,
    customerId: "customer_1",
    subscriptionId: "subscription_1",
    actorName: "Bob Roberts",
    input: {
      planId: "plan_signature",
    },
  });

  assert.deepEqual(prisma.calls[0][0], "subscription.findFirst");
  assert.deepEqual(prisma.calls[1], [
    "subscriptionPlan.findUnique",
    {
      where: { id: "plan_signature" },
    },
  ]);
  assert.deepEqual(prisma.calls[2], [
    "subscription.update",
    {
      where: { id: "subscription_1" },
      data: { planId: "plan_signature" },
    },
  ]);
  assert.equal(prisma.calls[3][1].data.type, "SUBSCRIPTION_PLAN_CHANGED");
  assert.deepEqual(prisma.calls[3][1].data.metadata, {
    planId: "plan_signature",
    subscriptionId: "subscription_1",
    removedVehicleIds: [],
  });
});

test("downgrades a multi-vehicle plan by keeping the CSR-selected vehicle", async () => {
  const prisma = createPrismaStub({
    coveredVehicles: [
      { id: "coverage_1", vehicleId: "vehicle_keep" },
      { id: "coverage_2", vehicleId: "vehicle_remove" },
    ],
  });

  await changeSubscriptionPlan({
    prismaClient: prisma.client,
    customerId: "customer_1",
    subscriptionId: "subscription_1",
    actorName: "Nikhil Upadhaya",
    input: {
      planId: "plan_single",
      keepVehicleIds: ["vehicle_keep"],
    },
  });

  assert.deepEqual(prisma.calls[2], [
    "subscriptionVehicle.updateMany",
    {
      where: {
        subscriptionId: "subscription_1",
        vehicleId: {
          in: ["vehicle_remove"],
        },
        removedAt: null,
      },
      data: {
        removedAt: prisma.calls[2][1].data.removedAt,
      },
    },
  ]);
  assert.ok(prisma.calls[2][1].data.removedAt instanceof Date);

  assert.deepEqual(prisma.calls[3], [
    "subscription.update",
    {
      where: { id: "subscription_1" },
      data: { planId: "plan_single" },
    },
  ]);
  assert.deepEqual(prisma.calls[4][1].data.metadata, {
    planId: "plan_single",
    subscriptionId: "subscription_1",
    removedVehicleIds: ["vehicle_remove"],
  });
});

test("starts a cancelled membership and records the selected plan", async () => {
  const prisma = createPrismaStub();

  await startCustomerMembership({
    prismaClient: prisma.client,
    customerId: "customer_1",
    subscriptionId: "subscription_1",
    actorName: "Nikhil Upadhaya",
    input: {
      planId: "plan_signature",
    },
  });

  assert.deepEqual(prisma.calls[0], [
    "subscription.updateMany",
    {
      where: { id: "subscription_1", customerId: "customer_1", status: "CANCELLED" },
      data: {
        status: "ACTIVE",
        planId: "plan_signature",
        nextBillingDate: prisma.calls[0][1].data.nextBillingDate,
      },
    },
  ]);
  assert.ok(prisma.calls[0][1].data.nextBillingDate instanceof Date);

  assert.equal(prisma.calls[1][0], "customer.update");
  assert.deepEqual(prisma.calls[1][1], {
    where: { id: "customer_1" },
    data: { status: "ACTIVE" },
  });
  assert.equal(prisma.calls[2][1].data.type, "SUBSCRIPTION_ADDED");
  assert.deepEqual(prisma.calls[2][1].data.metadata, {
    planId: "plan_signature",
    subscriptionId: "subscription_1",
  });
});
