// @ts-check

import Fuse from "fuse.js";

const fuseOptions = {
  threshold: 0.33,
  ignoreLocation: true,
  keys: [
    { name: "fullName", weight: 0.28 },
    { name: "email", weight: 0.18 },
    { name: "phone", weight: 0.14 },
    { name: "licensePlate", weight: 0.2 },
    { name: "searchText", weight: 0.2 },
  ],
};

export const searchSynonyms = {
  "can't wash": [
    "unable to wash",
    "overdue",
    "failed payment",
    "subscription blocked",
  ],
  "cannot wash": [
    "unable to wash",
    "overdue",
    "failed payment",
    "subscription blocked",
  ],
  "payment issue": ["failed payment", "overdue", "membership payment"],
  "new car": ["transfer subscription", "vehicle transfer", "add vehicle"],
  cancel: ["cancel subscription", "cancel account"],
};

/**
 * @param {string} query
 */
export function expandCustomerSearchQuery(query) {
  const normalized = query.trim().toLowerCase();
  const synonyms = searchSynonyms[normalized] || [];
  return [query, ...synonyms].join(" ");
}

/**
 * @param {object} customer
 */
export function flattenCustomerForSearch(customer) {
  const fullName = `${customer.firstName} ${customer.lastName}`;
  const vehicles = customer.vehicles || [];
  const subscriptions = customer.subscriptions || [];
  const purchases = customer.purchases || [];
  const supportNotes = customer.supportNotes || [];
  const auditEvents = customer.auditEvents || [];
  const laneSession = (customer.laneSessions || [])[0] || null;
  const primaryVehicle = vehicles[0];
  const hasFailedMembershipPayment = purchases.some(
    (purchase) => purchase.type === "MEMBERSHIP_PAYMENT" && purchase.status === "FAILED",
  );
  const latestMembershipPayment = purchases.find(
    (purchase) => purchase.type === "MEMBERSHIP_PAYMENT",
  );
  const hasOverdueSubscription = subscriptions.some(
    (subscription) => subscription.status === "OVERDUE",
  );
  const hasCurrentPaymentFailure =
    customer.status === "OVERDUE" ||
    hasOverdueSubscription ||
    latestMembershipPayment?.status === "FAILED";
  const resolvedPaymentHistory = hasFailedMembershipPayment && !hasCurrentPaymentFailure;

  return {
    id: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    fullName,
    memberId: customer.memberId,
    email: customer.email,
    phone: customer.phone,
    customerStatus: customer.status,
    primaryVehicle: primaryVehicle
      ? `${primaryVehicle.year} ${primaryVehicle.make} ${primaryVehicle.model}`
      : "No vehicle",
    licensePlate: primaryVehicle?.licensePlate || "",
    subscriptionSummary:
      subscriptions
        .map((subscription) => `${subscription.plan?.name} ${subscription.status}`)
        .join(" ") || "No subscription",
    hasCriticalIssue: hasCurrentPaymentFailure,
    hasPaymentFailure: hasCurrentPaymentFailure,
    hasPaymentHistory: hasFailedMembershipPayment,
    resolvedPaymentHistory,
    laneSession,
    searchText: [
      customer.firstName,
      customer.lastName,
      fullName,
      customer.memberId,
      customer.email,
      customer.phone,
      customer.status,
      ...vehicles.flatMap((vehicle) => [
        vehicle.make,
        vehicle.model,
        String(vehicle.year),
        vehicle.color,
        vehicle.licensePlate,
      ]),
      ...subscriptions.flatMap((subscription) => [
        subscription.status,
        subscription.plan?.name,
        subscription.plan?.cleaningTier,
      ]),
      ...purchases.flatMap((purchase) => [
        purchase.type,
        purchase.status,
        purchase.description,
      ]),
      ...supportNotes.map((note) => note.note),
      ...auditEvents.flatMap((event) => [event.type, event.message]),
      laneSession?.status,
      laneSession?.issueCode,
      laneSession?.issueSeverity,
      laneSession?.detectedPlate,
    ]
      .filter(Boolean)
      .join(" "),
  };
}

/**
 * @param {Array<object>} customers
 */
export function createCustomerSearchIndex(customers) {
  const records = customers.map(flattenCustomerForSearch);
  const fuse = new Fuse(records, fuseOptions);

  return {
    records,
    /**
     * @param {string} query
     * @param {{ limit?: number }} [options]
     */
    search(query, options = {}) {
      const trimmed = query.trim();

      if (!trimmed) {
        return records.slice(0, options.limit || records.length);
      }

      return fuse
        .search(expandCustomerSearchQuery(trimmed), { limit: options.limit })
        .map((result) => result.item);
    },
  };
}

/**
 * @param {Array<object>} customers
 * @param {string} query
 * @param {{ limit?: number }} [options]
 */
export function searchCustomers(customers, query, options = {}) {
  return createCustomerSearchIndex(customers).search(query, options);
}
