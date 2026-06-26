// @ts-check

import { createDashboardSummary } from "./dashboard-summary.js";
import { flattenCustomerForSearch } from "./customer-search.js";

function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount));
}

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
        label: "Needs attention",
        value: String(summary.openCriticalIssues),
      },
      {
        label: "Active subscriptions",
        value: String(summary.activeSubscriptions),
      },
      {
        label: "Monthly revenue",
        value: formatMoney(summary.monthlyRecurringRevenue),
      },
    ],
    criticalQueue: {
      count: criticalCustomers.length,
      message:
        criticalCustomers.length === 0
          ? "No service-blocking customer issues are currently open."
          : `${criticalCustomers.length} account needs attention because subscription access is blocked by a payment issue.`,
    },
    criticalCustomers: criticalCustomers.slice(0, 4).map((customer) => {
      const flattened = flattenCustomerForSearch(customer);
      return {
        id: customer.id,
        initials: `${customer.firstName?.[0] || ""}${customer.lastName?.[0] || ""}`,
        name: flattened.fullName,
        context: "Payment issue may be blocking wash access. Review failed charges and membership status.",
        status: "Overdue",
      };
    }),
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
