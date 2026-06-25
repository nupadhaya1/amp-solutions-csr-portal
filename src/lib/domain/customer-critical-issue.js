// @ts-check

/**
 * @param {object} customer
 * @param {Array<object>} customer.subscriptions
 * @param {Array<object>} customer.purchases
 * @returns {null | {
 *   severity: "critical",
 *   title: string,
 *   message: string,
 *   rootCause: string,
 *   affectedSubscriptionId: string,
 *   relatedPurchaseId: string,
 *   recommendedAction: string
 * }}
 */
export function getCustomerCriticalIssue(customer) {
  const overdueSubscription = customer.subscriptions.find(
    (subscription) => subscription.status === "OVERDUE",
  );

  const failedMembershipPayment = customer.purchases.find(
    (purchase) =>
      purchase.type === "MEMBERSHIP_PAYMENT" && purchase.status === "FAILED",
  );

  if (!overdueSubscription || !failedMembershipPayment) {
    return null;
  }

  return {
    severity: "critical",
    title: "Unable to wash",
    message:
      "Subscription overdue because the latest membership payment failed.",
    rootCause: "FAILED_MEMBERSHIP_PAYMENT",
    affectedSubscriptionId: overdueSubscription.id,
    relatedPurchaseId: failedMembershipPayment.id,
    recommendedAction:
      "Review failed payment and update customer payment details.",
  };
}
