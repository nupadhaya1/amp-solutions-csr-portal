// @ts-check

import { createDashboardSummary } from "./dashboard-summary.js";
import { flattenCustomerForSearch } from "./customer-search.js";

/**
 * @param {Array<object>} customers
 */
export function createPortalDashboardViewModel(customers) {
  const summary = createDashboardSummary(customers);
  const criticalCustomers = customers.filter((customer) =>
    (customer.subscriptions || []).some(
      (subscription) => subscription.status === "OVERDUE",
    ),
  );

  return {
    stats: [
      { label: "Total customers", value: String(summary.totalCustomers) },
      {
        label: "Active subscriptions",
        value: String(summary.activeSubscriptions),
      },
      {
        label: "Open critical issues",
        value: String(summary.openCriticalIssues),
      },
      {
        label: "Failed payments",
        value: String(summary.failedMembershipPayments),
      },
    ],
    criticalQueue: {
      count: criticalCustomers.length,
      message:
        criticalCustomers.length === 0
          ? "No service-blocking customer issues are currently open."
          : `${criticalCustomers.length} account needs attention because subscription access is blocked by a payment issue.`,
    },
    recentCustomers: customers.slice(0, 5).map((customer) => {
      const flattened = flattenCustomerForSearch(customer);
      return {
        id: customer.id,
        name: flattened.fullName,
        context: flattened.subscriptionSummary,
        status: flattened.hasCriticalIssue ? "Critical" : customer.status,
      };
    }),
  };
}
