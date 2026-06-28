// @ts-check

import { prisma } from "../prisma.js";

export const activeLaneSessionWhere = {
  status: {
    notIn: ["NO_ACTIVE_SESSION"],
  },
};

const laneSessionInclude = {
  customer: true,
  vehicle: true,
};

function buildLaneSessionWhere(filters = {}) {
  const where = { ...activeLaneSessionWhere };
  const filter = String(filters.filter || "all");
  const plate = String(filters.plate || "").trim();

  if (filter === "at_gate") where.status = "AT_GATE";
  if (filter === "blocked") where.status = "BLOCKED";
  if (filter === "in_queue") where.status = "IN_QUEUE";
  if (filter === "plate_mismatch") where.issueCode = "PLATE_MISMATCH";
  if (filter === "failed_payment") where.issueCode = "FAILED_PAYMENT";

  if (plate) {
    where.detectedPlate = {
      contains: plate.toUpperCase(),
      mode: "insensitive",
    };
  }

  return where;
}

export function listActiveLaneSessions({ prismaClient = prisma, filters = {} } = {}) {
  return prismaClient.laneSession.findMany({
    where: buildLaneSessionWhere(filters),
    include: laneSessionInclude,
    orderBy: [{ issueSeverity: "asc" }, { detectedAt: "desc" }],
  });
}

export function getLatestActiveLaneSessionForCustomer({ prismaClient = prisma, customerId }) {
  if (!customerId) return null;

  return prismaClient.laneSession.findFirst({
    where: {
      ...activeLaneSessionWhere,
      customerId,
    },
    include: laneSessionInclude,
    orderBy: { detectedAt: "desc" },
  });
}

export function clearFailedPaymentLaneSessions({ prismaClient = prisma, customerId }) {
  if (!customerId) return Promise.resolve({ count: 0 });

  return prismaClient.laneSession.updateMany({
    where: {
      customerId,
      issueCode: "FAILED_PAYMENT",
    },
    data: {
      issueCode: "NONE",
      issueSeverity: "NONE",
      status: "IN_QUEUE",
      resolvedAt: new Date(),
    },
  });
}
