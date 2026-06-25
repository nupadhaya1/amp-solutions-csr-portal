// @ts-check

import { prisma } from "@/lib/prisma";

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
