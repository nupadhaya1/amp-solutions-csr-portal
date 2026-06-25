// @ts-check

import {
  addVehicleSchema,
  cancelSubscriptionSchema,
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
    const subscription = await tx.subscription.update({
      where: {
        id: subscriptionId,
        customerId,
      },
      data: {
        status: "CANCELLED",
      },
    });

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

    return subscription;
  });
}
