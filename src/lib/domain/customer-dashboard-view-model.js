// @ts-check

import { getRecommendedNextSteps } from "./recommended-next-steps.js";

const vehicleColorMap = {
  black: "#111827",
  white: "#f8fafc",
  silver: "#cbd5e1",
  gray: "#64748b",
  blue: "#2563eb",
  red: "#dc2626",
  green: "#16a34a",
  gold: "#d97706",
};

function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount || 0));
}

function formatDate(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatRelativeDate(value) {
  if (!value) return "Not available";
  const now = Date.now();
  const then = new Date(value).getTime();
  const minutes = Math.round((then - now) / 60000);
  const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

  if (Math.abs(minutes) < 60) {
    return rtf.format(minutes, "minute");
  }

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) {
    return rtf.format(hours, "hour");
  }

  const days = Math.round(hours / 24);
  if (Math.abs(days) < 8) {
    return rtf.format(days, "day");
  }

  return formatDate(value);
}

function humanizeEnum(value) {
  return String(value || "")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function purchaseStatusTone(status) {
  if (status === "FAILED") return "critical";
  if (status === "REFUNDED") return "warning";
  return "success";
}

function inferNoteTag(note) {
  const text = String(note || "").toLowerCase();
  if (text.includes("bill") || text.includes("card") || text.includes("payment")) return "Billing";
  if (text.includes("cancel")) return "Cancellation";
  if (text.includes("transfer")) return "Vehicle";
  if (text.includes("plan")) return "Plan Change";
  if (text.includes("wash") || text.includes("gate") || text.includes("denied")) return "Unable to Wash";
  if (text.includes("vehicle") || text.includes("plate")) return "Vehicle";
  return "General";
}

function getPaymentMethod(customer) {
  const paymentUpdateEvent = (customer.auditEvents || []).find(
    (event) => event.metadata?.paymentMethod,
  );
  const paymentMethod = paymentUpdateEvent?.metadata?.paymentMethod || {};
  const brand = paymentMethod.brand || "Visa";
  const last4 = paymentMethod.last4 || "4242";
  const expiry = paymentMethod.expiry || "12/29";

  return {
    brand,
    last4,
    expiry,
    label: `${brand} ending ${last4}`,
  };
}

function getBilling(customer) {
  const paymentMethod = getPaymentMethod(customer);
  const membershipPayments = (customer.purchases || []).filter(
    (purchase) => purchase.type === "MEMBERSHIP_PAYMENT",
  );
  const lastSuccessfulCharge = membershipPayments.find((purchase) => purchase.status === "PAID");
  const lastFailedCharge = membershipPayments.find((purchase) => purchase.status === "FAILED");
  const activeOrOverdueSubscription = (customer.subscriptions || []).find((subscription) =>
    ["ACTIVE", "OVERDUE"].includes(subscription.status),
  );
  const paymentStatus =
    customer.status === "OVERDUE" || lastFailedCharge ? "OVERDUE" : "CURRENT";

  return {
    paymentMethod,
    paymentStatus,
    badgeTone: paymentStatus === "OVERDUE" ? "critical" : "success",
    expiresAt: paymentMethod.expiry,
    lastSuccessfulCharge: lastSuccessfulCharge
      ? {
          amount: formatMoney(lastSuccessfulCharge.amount),
          date: formatDate(lastSuccessfulCharge.purchasedAt),
          description: lastSuccessfulCharge.description,
        }
      : null,
    lastFailedCharge: lastFailedCharge
      ? {
          amount: formatMoney(lastFailedCharge.amount),
          date: formatDate(lastFailedCharge.purchasedAt),
          description: lastFailedCharge.description,
          reason: "Card declined",
        }
      : null,
    nextBillingDate: activeOrOverdueSubscription?.nextBillingDate
      ? formatDate(activeOrOverdueSubscription.nextBillingDate)
      : "Not scheduled",
    retryEligible: Boolean(lastFailedCharge),
    retryLabel: lastFailedCharge ? "Retry failed charge" : "No failed charge to retry",
    affectedSubscription:
      activeOrOverdueSubscription?.plan?.name || "Account-level membership payment",
  };
}

function buildVehiclesWithSubscriptions(customer) {
  const subscriptions = customer.subscriptions || [];

  return (customer.vehicles || []).map((vehicle) => {
    const activeCoverage = (vehicle.subscriptionVehicles || []).find(
      (coverage) =>
        coverage.removedAt === null &&
        coverage.subscription &&
        coverage.subscription.status !== "CANCELLED",
    );
    const subscription = activeCoverage?.subscription || null;
    const plan = subscription?.plan || null;
    const coveredCount = subscription
      ? (subscriptions.find((item) => item.id === subscription.id)?.vehicles || []).filter(
          (coverage) => coverage.removedAt === null,
        ).length
      : 0;

    return {
      id: vehicle.id,
      label: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      color: vehicle.color,
      colorLabel: vehicle.color || "Unknown",
      colorHex:
        vehicleColorMap[String(vehicle.color || "").toLowerCase()] || vehicleColorMap.gray,
      licensePlate: vehicle.licensePlate,
      planName: plan?.name || "No active plan",
      status: subscription?.status || "UNASSIGNED",
      coverageLabel:
        plan && plan.maxVehicles > 1
          ? `Covered vehicle ${coveredCount} of ${plan.maxVehicles}`
          : "Single-vehicle coverage",
      canWash: subscription?.status === "ACTIVE",
    };
  });
}

function buildActivity(event) {
  return {
    id: event.id,
    type: event.type,
    title: humanizeEnum(event.type),
    message: event.message,
    detail:
      event.metadata?.notePreview ||
      (event.metadata?.paymentMethod
        ? `${event.metadata.paymentMethod.brand} ending ${event.metadata.paymentMethod.last4}`
        : null),
    actorName: event.actorName,
    actorType: event.actorType,
    createdAt: formatDateTime(event.createdAt),
    relativeTime: formatRelativeDate(event.createdAt),
  };
}

export function createCustomerDashboardViewModel(customer, plans = []) {
  const subscriptions = customer.subscriptions || [];
  const vehiclesWithSubscriptions = buildVehiclesWithSubscriptions(customer);
  const activeOrOverdueSubscriptions = subscriptions.filter((subscription) =>
    ["ACTIVE", "OVERDUE"].includes(subscription.status),
  );
  const activePlanNames = [...new Set(activeOrOverdueSubscriptions.map((subscription) => subscription.plan?.name).filter(Boolean))];
  const canAddVehicle = activeOrOverdueSubscriptions.some((subscription) => {
    const coveredVehicles = (subscription.vehicles || []).filter((coverage) => coverage.removedAt === null);
    return coveredVehicles.length < Number(subscription.plan?.maxVehicles || 0);
  });
  const canTransferVehicle = activeOrOverdueSubscriptions.some((subscription) => {
    const coveredVehicles = (subscription.vehicles || []).filter((coverage) => coverage.removedAt === null);
    return coveredVehicles.length > 0 && (customer.vehicles || []).length > 1;
  });
  const canChangePlan = activeOrOverdueSubscriptions.length > 0 && plans !== null;
  const canCancelMembership = activeOrOverdueSubscriptions.length > 0;
  const billing = getBilling(customer);

  const profile = {
    id: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    fullName: `${customer.firstName} ${customer.lastName}`,
    shortName: customer.firstName,
    memberId: customer.memberId || customer.id,
    email: customer.email,
    phone: customer.phone,
    joinedAt: formatDate(customer.createdAt),
    homeWashLocation: customer.homeWashLocation || customer.homeLocation?.name || "Not assigned",
    status: customer.status,
    planTags: activePlanNames,
    actionAvailability: {
      canEditAccount: true,
      canAddVehicle,
      canChangePlan,
      canTransferVehicle,
      canCancelMembership,
      disabledReasons: {
        addVehicle: canAddVehicle ? "" : "Add vehicle is only available when an active plan has open vehicle capacity.",
        changePlan: canChangePlan ? "" : "Change plan requires an active or overdue subscription.",
        transferVehicle: canTransferVehicle ? "" : "Transfer vehicle requires covered and uncovered vehicles on the account.",
        cancelMembership: canCancelMembership ? "" : "Cancel membership requires an active or overdue membership.",
      },
    },
    vehiclesWithSubscriptions,
    subscriptions: subscriptions.map((subscription) => ({
      id: subscription.id,
      planId: subscription.planId,
      planName: subscription.plan?.name || "Unknown plan",
      monthlyPrice: formatMoney(subscription.plan?.monthlyPrice),
      status: subscription.status,
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
    billing,
    supportNotesPreview: (customer.supportNotes || []).slice(0, 3).map((note) => ({
      id: note.id,
      tag: inferNoteTag(note.note),
      text: note.note,
      author: note.csrName,
      createdAt: formatDateTime(note.createdAt),
    })),
    supportNotesAll: (customer.supportNotes || []).map((note) => ({
      id: note.id,
      tag: inferNoteTag(note.note),
      text: note.note,
      author: note.csrName,
      createdAt: formatDateTime(note.createdAt),
    })),
    recentActivityPreview: (customer.auditEvents || []).slice(0, 5).map(buildActivity),
    activityAll: (customer.auditEvents || []).map(buildActivity),
    purchases: (customer.purchases || []).map((purchase) => ({
      id: purchase.id,
      type: purchase.type,
      typeLabel: humanizeEnum(purchase.type),
      status: purchase.status,
      statusLabel: humanizeEnum(purchase.status),
      statusTone: purchaseStatusTone(purchase.status),
      amount: formatMoney(purchase.amount),
      description: purchase.description,
      purchasedAt: formatDate(purchase.purchasedAt),
      vehicleLabel: purchase.vehicle
        ? `${purchase.vehicle.year} ${purchase.vehicle.make} ${purchase.vehicle.model} · ${purchase.vehicle.licensePlate}`
        : "Account-level",
      subscriptionPlanName: purchase.subscription?.plan?.name || "",
    })),
  };

  profile.recommendedNextStep = getRecommendedNextSteps(profile);

  return profile;
}
