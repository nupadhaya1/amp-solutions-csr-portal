// @ts-check

import { createPortalDashboardViewModel } from "./dashboard-view-model.js";
import { createDashboardCharts } from "./dashboard-charts.js";

/**
 * Keeps the dashboard API payload aligned with the dashboard page view model.
 *
 * @param {Array<object>} customers
 */
export function createDashboardApiViewModel(customers) {
  const { stats, criticalQueue, criticalCustomers, recentCustomers } =
    createPortalDashboardViewModel(customers);

  return {
    stats,
    criticalQueue,
    criticalCustomers,
    recentCustomers,
    charts: createDashboardCharts(customers),
  };
}
