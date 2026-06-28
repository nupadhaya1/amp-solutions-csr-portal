const CUSTOMER_SEARCH_SESSION_KEY = "amp-csr-customer-search";

function hasSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function getRememberedCustomerSearch() {
  if (!hasSessionStorage()) return "";
  return window.sessionStorage.getItem(CUSTOMER_SEARCH_SESSION_KEY) || "";
}

export function setRememberedCustomerSearch(value) {
  if (!hasSessionStorage()) return;

  const normalized = String(value || "").trim();

  if (!normalized) {
    window.sessionStorage.removeItem(CUSTOMER_SEARCH_SESSION_KEY);
    return;
  }

  window.sessionStorage.setItem(CUSTOMER_SEARCH_SESSION_KEY, normalized);
}

export function clearRememberedCustomerSearch() {
  if (!hasSessionStorage()) return;
  window.sessionStorage.removeItem(CUSTOMER_SEARCH_SESSION_KEY);
}
