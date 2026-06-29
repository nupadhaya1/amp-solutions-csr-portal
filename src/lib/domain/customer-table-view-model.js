// @ts-check

import { getLaneSessionBadge } from "./lane-context.js";

/**
 * @param {string} fullName
 */
function initialsFor(fullName) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * @param {Record<string, string>} filters
 */
function countActiveFilters(filters = {}) {
  return Object.values(filters).filter((value) => String(value || "").trim())
    .length;
}

function hasOverdueIssue(row) {
  return (
    String(row.customerStatus || "").toUpperCase() === "OVERDUE" ||
    String(row.subscriptionSummary || "").toUpperCase().includes("OVERDUE")
  );
}

function hasPaymentFailure(row) {
  if (typeof row.hasPaymentFailure === "boolean") {
    return row.hasPaymentFailure;
  }

  return /FAILED|PAYMENT_FAILED|failed payment/i.test(
    [row.paymentSummary, row.searchText, row.subscriptionSummary].filter(Boolean).join(" "),
  );
}

function statusFor(row) {
  if (hasOverdueIssue(row)) {
    return {
      label: "Overdue",
      tone: "critical",
      rank: 0,
    };
  }

  if (Boolean(row.hasCriticalIssue)) {
    return {
      label: "Needs attention",
      tone: "critical",
      rank: 1,
    };
  }

  return {
    label: "Active",
    tone: "success",
    rank: 2,
  };
}

/**
 * @param {Array<object>} rows
 * @param {{ totalCustomers?: number, activeFilters?: Record<string, string> }} options
 */
export function createCustomerTableViewModel(rows, options = {}) {
  const tableRows = rows.map((row) => {
    const status = statusFor(row);
    const paymentFailed = hasPaymentFailure(row);
    const laneBadge = getLaneSessionBadge(row.laneSession);

    return {
      ...row,
      initials: initialsFor(String(row.fullName || "")),
      memberIdLabel: row.memberId || "No member ID",
      customerIdentity: [row.fullName, row.memberId].filter(Boolean).join(" "),
      statusLabel: status.label,
      statusTone: status.tone,
      priorityRank: status.rank,
      paymentLabel: paymentFailed ? "Payment failure" : "Current",
      paymentTone: paymentFailed ? "critical" : "success",
      laneBadge,
      contactSummary: [row.email, row.phone].filter(Boolean).join(" "),
      vehicleSummary: [row.primaryVehicle, row.licensePlate]
        .filter(Boolean)
        .join(" "),
      searchText: [row.searchText, laneBadge?.searchText].filter(Boolean).join(" "),
    };
  });

  return {
    rows: tableRows,
    summary: {
      totalCustomers: options.totalCustomers ?? rows.length,
      resultCount: rows.length,
      attentionCount: tableRows.filter((row) => row.hasCriticalIssue).length,
      overdueCount: tableRows.filter(hasOverdueIssue).length,
      paymentFailureCount: tableRows.filter(hasPaymentFailure).length,
      laneSessionCount: tableRows.filter((row) => row.laneBadge).length,
      activeFilterCount: countActiveFilters(options.activeFilters),
    },
  };
}
