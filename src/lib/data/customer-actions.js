// @ts-check

import {
  addVehicleSchema,
  cancelSubscriptionSchema,
  changeSubscriptionPlanSchema,
  transferSubscriptionSchema,
  updateCustomerSchema,
} from "../validation/customer-actions.js";

function requireCustomerId(customerId) {
  if (!customerId) {
    throw new Error("Customer id is required.");
  }
}

export async function updateCustomerAccount({
  prismaClient,
  customerId,
  actorName,
  input,
}) {
  requireCustomerId(customerId);
  const data = updateCustomerSchema.parse(input);

  return prismaClient.$transaction(async (tx) => {
    const customer = await tx.customer.update({
      where: { id: customerId },
      data,
    });

    await tx.auditEvent.create({
      data: {
        customerId,
        type: "ACCOUNT_UPDATED",
        message: "Customer account details updated.",
        metadata: {
          fields: Object.keys(data),
        },
        actorName,
        actorType: "CSR",
      },
    });

    return customer;
  });
}

export async function addCustomerVehicle({
  prismaClient,
  customerId,
  actorName,
  input,
}) {
  requireCustomerId(customerId);
  const data = addVehicleSchema.parse(input);

  return prismaClient.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.create({
      data: {
        customerId,
        ...data,
      },
    });

    await tx.auditEvent.create({
      data: {
        customerId,
        type: "VEHICLE_ADDED",
        message: `${data.year} ${data.make} ${data.model} added to account.`,
        metadata: {
          licensePlate: data.licensePlate,
          vehicle: `${data.year} ${data.make} ${data.model}`,
        },
        actorName,
        actorType: "CSR",
      },
    });

    return vehicle;
  });
}

export async function cancelCustomerSubscription({
  prismaClient,
  customerId,
  subscriptionId,
  actorName,
  input,
}) {
  requireCustomerId(customerId);
  if (!subscriptionId) {
    throw new Error("Subscription id is required.");
  }

  const data = cancelSubscriptionSchema.parse(input);

  return prismaClient.$transaction(async (tx) => {
    const result = await tx.subscription.updateMany({
      where: {
        id: subscriptionId,
        customerId,
      },
      data: {
        status: "CANCELLED",
      },
    });

    if (result.count === 0) {
      throw new Error("Subscription was not found for this customer.");
    }

    await tx.auditEvent.create({
      data: {
        customerId,
        type: "SUBSCRIPTION_CANCELLED",
        message: "Subscription cancelled by CSR.",
        metadata: {
          reason: data.reason || "",
        },
        actorName,
        actorType: "CSR",
      },
    });

    return result;
  });
}

export async function transferSubscriptionVehicle({
  prismaClient,
  customerId,
  subscriptionId,
  actorName,
  input,
}) {
  requireCustomerId(customerId);
  if (!subscriptionId) {
    throw new Error("Subscription id is required.");
  }

  const data = transferSubscriptionSchema.parse(input);

  return prismaClient.$transaction(async (tx) => {
    await tx.subscriptionVehicle.updateMany({
      where: {
        subscriptionId,
        vehicleId: data.fromVehicleId,
        removedAt: null,
      },
      data: {
        removedAt: new Date(),
      },
    });

    const coverage = await tx.subscriptionVehicle.create({
      data: {
        subscriptionId,
        vehicleId: data.toVehicleId,
      },
    });

    await tx.auditEvent.create({
      data: {
        customerId,
        type: "SUBSCRIPTION_TRANSFERRED",
        message: "Subscription coverage transferred between vehicles.",
        metadata: {
          fromVehicleId: data.fromVehicleId,
          toVehicleId: data.toVehicleId,
          subscriptionId,
        },
        actorName,
        actorType: "CSR",
      },
    });

    return coverage;
  });
}

export async function changeSubscriptionPlan({
  prismaClient,
  customerId,
  subscriptionId,
  actorName,
  input,
}) {
  requireCustomerId(customerId);
  if (!subscriptionId) {
    throw new Error("Subscription id is required.");
  }

  const data = changeSubscriptionPlanSchema.parse(input);

  return prismaClient.$transaction(async (tx) => {
    const subscription = await tx.subscription.update({
      where: { id: subscriptionId },
      data: {
        planId: data.planId,
      },
    });

    await tx.auditEvent.create({
      data: {
        customerId,
        type: "SUBSCRIPTION_PLAN_CHANGED",
        message: "Subscription plan changed by CSR.",
        metadata: {
          planId: data.planId,
          subscriptionId,
        },
        actorName,
        actorType: "CSR",
      },
    });

    return subscription;
  });
}
