// @ts-check

import { flattenCustomerForSearch, searchCustomers } from "./customer-search.js";

function filterByField(results, field, value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return results;

  return results.filter((result) =>
    String(result[field] || "")
      .toLowerCase()
      .includes(normalized),
  );
}

/**
 * @param {Array<object>} customers
 * @param {object} params
 * @param {string=} params.q
 * @param {string=} params.name
 * @param {string=} params.email
 * @param {string=} params.phone
 * @param {string=} params.licensePlate
 */
export function getCustomerLookupResults(customers, params = {}) {
  let results = params.q
    ? searchCustomers(customers, params.q)
    : customers.map(flattenCustomerForSearch);

  results = filterByField(results, "fullName", params.name);
  results = filterByField(results, "email", params.email);
  results = filterByField(results, "phone", params.phone);
  results = filterByField(results, "licensePlate", params.licensePlate);

  return results;
}
