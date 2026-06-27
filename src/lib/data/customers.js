// @ts-check

import { prisma } from "../prisma.js";

export const customerInclude = {
  vehicles: {
    include: {
      subscriptionVehicles: {
        include: {
          subscription: {
            include: {
              plan: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  },
  subscriptions: {
    include: {
      plan: true,
      vehicles: {
        include: {
          vehicle: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  },
  purchases: {
    orderBy: { purchasedAt: "desc" },
  },
  supportNotes: {
    orderBy: { createdAt: "desc" },
  },
  auditEvents: {
    orderBy: { createdAt: "desc" },
  },
};

export function listCustomersForSupport() {
  return prisma.customer.findMany({
    include: customerInclude,
    orderBy: [{ updatedAt: "desc" }, { lastName: "asc" }],
  });
}

export function listCustomerSearchRecords({ prismaClient = prisma } = {}) {
  return prismaClient.customer.findMany({
    orderBy: [{ updatedAt: "desc" }, { lastName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      status: true,
      updatedAt: true,
      vehicles: {
        orderBy: { createdAt: "asc" },
        select: {
          year: true,
          make: true,
          model: true,
          color: true,
          licensePlate: true,
        },
      },
      subscriptions: {
        orderBy: { createdAt: "desc" },
        select: {
          status: true,
          plan: {
            select: {
              name: true,
              cleaningTier: true,
            },
          },
        },
      },
    },
  });
}
