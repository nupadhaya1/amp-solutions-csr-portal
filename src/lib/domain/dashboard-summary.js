// @ts-check

/**
 * @param {Array<object>} customers
 */
export function createDashboardSummary(customers) {
  const subscriptions = customers.flatMap((customer) => customer.subscriptions || []);
  const vehicles = customers.flatMap((customer) => customer.vehicles || []);
  const purchases = customers.flatMap((customer) => customer.purchases || []);

  return {
    totalCustomers: customers.length,
    activeSubscriptions: subscriptions.filter(
      (subscription) => subscription.status === "ACTIVE",
    ).length,
    overdueSubscriptions: subscriptions.filter(
      (subscription) => subscription.status === "OVERDUE",
    ).length,
    failedMembershipPayments: purchases.filter(
      (purchase) =>
        purchase.type === "MEMBERSHIP_PAYMENT" && purchase.status === "FAILED",
    ).length,
    openCriticalIssues: customers.filter((customer) =>
      (customer.subscriptions || []).some(
        (subscription) => subscription.status === "OVERDUE",
      ),
    ).length,
    vehiclesCoveredByActiveSubscriptions: vehicles.filter((vehicle) =>
      (vehicle.subscriptionVehicles || []).some(
        (coverage) =>
          coverage.removedAt === null && coverage.subscription?.status === "ACTIVE",
      ),
    ).length,
  };
}
