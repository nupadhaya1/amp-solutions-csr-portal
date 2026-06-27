// @ts-check

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

/**
 * @param {Array<object>} rows
 * @param {{ totalCustomers?: number, activeFilters?: Record<string, string> }} options
 */
export function createCustomerTableViewModel(rows, options = {}) {
  const tableRows = rows.map((row) => {
    const hasCriticalIssue = Boolean(row.hasCriticalIssue);

    return {
      ...row,
      initials: initialsFor(String(row.fullName || "")),
      statusLabel: hasCriticalIssue ? "Needs attention" : "Active",
      statusTone: hasCriticalIssue ? "critical" : "success",
      priorityLabel: hasCriticalIssue ? "High" : "Normal",
      priorityRank: hasCriticalIssue ? 0 : 1,
      contactSummary: [row.email, row.phone].filter(Boolean).join(" "),
      vehicleSummary: [row.primaryVehicle, row.licensePlate]
        .filter(Boolean)
        .join(" "),
    };
  });

  return {
    rows: tableRows,
    summary: {
      totalCustomers: options.totalCustomers ?? rows.length,
      resultCount: rows.length,
      attentionCount: tableRows.filter((row) => row.hasCriticalIssue).length,
      activeFilterCount: countActiveFilters(options.activeFilters),
    },
  };
}
