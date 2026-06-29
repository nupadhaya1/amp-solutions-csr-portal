// @ts-check

import {
  addVehicleSchema,
  assignVehicleToSubscriptionSchema,
  cancelSubscriptionSchema,
  changeSubscriptionPlanSchema,
  startMembershipSchema,
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

    const remainingActiveSubscriptions = await tx.subscription.count({
      where: {
        customerId,
        status: {
          in: ["ACTIVE", "OVERDUE"],
        },
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

    if (remainingActiveSubscriptions === 0) {
      await tx.customer.update({
        where: { id: customerId },
        data: { status: "CANCELLED" },
      });
    }

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

export async function assignVehicleToSubscription({
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

  const data = assignVehicleToSubscriptionSchema.parse(input);

  return prismaClient.$transaction(async (tx) => {
    const subscription = await tx.subscription.findFirst({
      where: {
        id: subscriptionId,
        customerId,
        status: {
          in: ["ACTIVE", "OVERDUE"],
        },
      },
      include: {
        plan: true,
        vehicles: {
          where: {
            removedAt: null,
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new Error("Active subscription was not found for this customer.");
    }

    if (subscription.vehicles.length >= Number(subscription.plan?.maxVehicles || 0)) {
      throw new Error("This plan has no open vehicle slots.");
    }

    const vehicle = await tx.vehicle.findFirst({
      where: {
        id: data.vehicleId,
        customerId,
      },
      select: {
        id: true,
        year: true,
        make: true,
        model: true,
        licensePlate: true,
      },
    });

    if (!vehicle) {
      throw new Error("Vehicle was not found for this customer.");
    }

    const existingCoverage = await tx.subscriptionVehicle.findFirst({
      where: {
        vehicleId: data.vehicleId,
        removedAt: null,
        subscription: {
          status: {
            not: "CANCELLED",
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (existingCoverage) {
      throw new Error("Vehicle already has active membership coverage.");
    }

    const coverage = await tx.subscriptionVehicle.create({
      data: {
        subscriptionId,
        vehicleId: data.vehicleId,
      },
    });

    await tx.auditEvent.create({
      data: {
        customerId,
        type: "SUBSCRIPTION_ADDED",
        message: "Vehicle assigned to membership coverage.",
        metadata: {
          vehicleId: data.vehicleId,
          vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          licensePlate: vehicle.licensePlate,
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
    const [subscription, targetPlan] = await Promise.all([
      tx.subscription.findFirst({
        where: {
          id: subscriptionId,
          customerId,
          status: {
            in: ["ACTIVE", "OVERDUE"],
          },
        },
        include: {
          vehicles: {
            where: {
              removedAt: null,
            },
            select: {
              id: true,
              vehicleId: true,
            },
          },
        },
      }),
      tx.subscriptionPlan.findUnique({
        where: {
          id: data.planId,
        },
      }),
    ]);

    if (!subscription) {
      throw new Error("Active subscription was not found for this customer.");
    }

    if (!targetPlan) {
      throw new Error("Selected plan was not found.");
    }

    const coveredVehicleIds = subscription.vehicles.map((coverage) => coverage.vehicleId);
    const maxVehicles = Number(targetPlan.maxVehicles || 0);
    let removedVehicleIds = [];

    if (coveredVehicleIds.length > maxVehicles) {
      const keepVehicleIds = [...new Set(data.keepVehicleIds)];

      if (keepVehicleIds.length !== maxVehicles) {
        throw new Error("Choose which vehicles should remain on this plan.");
      }

      const keepVehicleIdSet = new Set(keepVehicleIds);
      const allKeptVehiclesAreCovered = keepVehicleIds.every((vehicleId) =>
        coveredVehicleIds.includes(vehicleId),
      );

      if (!allKeptVehiclesAreCovered) {
        throw new Error("Vehicles kept on the plan must already be covered.");
      }

      removedVehicleIds = coveredVehicleIds.filter((vehicleId) => !keepVehicleIdSet.has(vehicleId));

      await tx.subscriptionVehicle.updateMany({
        where: {
          subscriptionId,
          vehicleId: {
            in: removedVehicleIds,
          },
          removedAt: null,
        },
        data: {
          removedAt: new Date(),
        },
      });
    }

    const subscriptionUpdate = await tx.subscription.update({
      where: {
        id: subscriptionId,
      },
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
          removedVehicleIds,
        },
        actorName,
        actorType: "CSR",
      },
    });

    return subscriptionUpdate;
  });
}

export async function startCustomerMembership({
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

  const data = startMembershipSchema.parse(input);
  const nextBillingDate = new Date();
  nextBillingDate.setDate(nextBillingDate.getDate() + 30);

  return prismaClient.$transaction(async (tx) => {
    const result = await tx.subscription.updateMany({
      where: {
        id: subscriptionId,
        customerId,
        status: "CANCELLED",
      },
      data: {
        status: "ACTIVE",
        planId: data.planId,
        nextBillingDate,
      },
    });

    if (result.count === 0) {
      throw new Error("Cancelled subscription was not found for this customer.");
    }

    await tx.customer.update({
      where: { id: customerId },
      data: { status: "ACTIVE" },
    });

    await tx.auditEvent.create({
      data: {
        customerId,
        type: "SUBSCRIPTION_ADDED",
        message: "Membership started by CSR.",
        metadata: {
          planId: data.planId,
          subscriptionId,
        },
        actorName,
        actorType: "CSR",
      },
    });

    return result;
  });
}
