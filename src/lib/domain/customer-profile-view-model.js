// @ts-check

import { getCustomerCriticalIssue } from "./customer-critical-issue.js";

export function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount));
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatAuditEventDetail(event) {
  if (event.type === "SUPPORT_NOTE_ADDED" && event.metadata?.notePreview) {
    return event.metadata.notePreview;
  }

  if (event.type === "ACCOUNT_UPDATED" && event.metadata?.paymentMethod) {
    return `${event.metadata.paymentMethod.brand} ending ${event.metadata.paymentMethod.last4} · ${event.metadata.resolvedPayments || 0} payment issue(s) resolved`;
  }

  return null;
}

function getPaymentSummary(customer) {
  const failedMembershipPayments = (customer.purchases || []).filter(
    (purchase) => purchase.type === "MEMBERSHIP_PAYMENT" && purchase.status === "FAILED",
  );
  const paymentUpdateEvent = (customer.auditEvents || []).find(
    (event) => event.type === "ACCOUNT_UPDATED" && event.metadata?.paymentMethod,
  );
  const paymentMethod = paymentUpdateEvent?.metadata?.paymentMethod;

  return {
    status:
      failedMembershipPayments.length > 0 || customer.status === "OVERDUE"
        ? "Needs payment update"
        : "Valid payment method",
    hasFailedPayment: failedMembershipPayments.length > 0,
    failedPayments: failedMembershipPayments.length,
    latestFailedPayment: failedMembershipPayments[0]
      ? `${formatMoney(failedMembershipPayments[0].amount)} · ${formatDate(failedMembershipPayments[0].purchasedAt)}`
      : "No failed membership payments",
    cardBrand: paymentMethod?.brand || "Visa",
    cardLast4: paymentMethod?.last4 || "4242",
    cardExpiry: paymentMethod?.expiry || "12/29",
  };
}

/**
 * @param {object} customer
 */
export function createCustomerProfileViewModel(customer) {
  return {
    id: customer.id,
    memberId: customer.memberId || customer.id,
    fullName: `${customer.firstName} ${customer.lastName}`,
    email: customer.email,
    phone: customer.phone,
    status: customer.status,
    createdAt: formatDate(customer.createdAt),
    updatedAt: formatDate(customer.updatedAt),
    paymentSummary: getPaymentSummary(customer),
    criticalIssue: getCustomerCriticalIssue(customer),
    vehicles: (customer.vehicles || []).map((vehicle) => {
      const activeCoverage = (vehicle.subscriptionVehicles || []).find(
        (coverage) =>
          coverage.removedAt === null && coverage.subscription?.status !== "CANCELLED",
      );
      return {
        id: vehicle.id,
        label: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        color: vehicle.color,
        licensePlate: vehicle.licensePlate,
        coverageStatus: activeCoverage
          ? `${activeCoverage.subscription.plan.name} · ${activeCoverage.subscription.status}`
          : "No active subscription coverage",
      };
    }),
    subscriptions: (customer.subscriptions || []).map((subscription) => ({
      id: subscription.id,
      planId: subscription.planId,
      planName: subscription.plan.name,
      status: subscription.status,
      monthlyPrice: formatMoney(subscription.plan.monthlyPrice),
      cleaningTier: subscription.plan.cleaningTier,
      maxVehicles: subscription.plan.maxVehicles,
      startedAt: formatDate(subscription.startedAt),
      nextBillingDate: subscription.nextBillingDate
        ? formatDate(subscription.nextBillingDate)
        : "Not scheduled",
      coveredVehicles: (subscription.vehicles || [])
        .filter((coverage) => coverage.removedAt === null)
        .map((coverage) => ({
          id: coverage.vehicle.id,
          label: `${coverage.vehicle.year} ${coverage.vehicle.make} ${coverage.vehicle.model} · ${coverage.vehicle.licensePlate}`,
        })),
    })),
    purchases: (customer.purchases || []).map((purchase) => ({
      id: purchase.id,
      type: purchase.type,
      status: purchase.status,
      amount: formatMoney(purchase.amount),
      purchasedAt: formatDate(purchase.purchasedAt),
      description: purchase.description,
      vehicleLabel: purchase.vehicle
        ? `${purchase.vehicle.year} ${purchase.vehicle.make} ${purchase.vehicle.model}`
        : "Account-level",
    })),
    supportNotes: (customer.supportNotes || []).map((note) => ({
      id: note.id,
      note: note.note,
      csrName: note.csrName,
      createdAt: formatDate(note.createdAt),
    })),
    auditEvents: (customer.auditEvents || []).map((event) => ({
      id: event.id,
      type: event.type,
      message: event.message,
      detail: formatAuditEventDetail(event),
      actorName: event.actorName,
      actorType: event.actorType,
      createdAt: formatDate(event.createdAt),
    })),
  };
}
