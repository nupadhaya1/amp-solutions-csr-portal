// @ts-check

export function getRecommendedNextSteps(profile) {
  if (profile.billing?.paymentStatus === "OVERDUE" || profile.billing?.lastFailedCharge) {
    return {
      priority: "critical",
      title: "Update payment method and retry failed charge",
      reason:
        "The customer has a failed membership payment and at least one overdue subscription.",
      suggestedFlow: [
        "Confirm the customer and cardholder details.",
        "Update the payment method.",
        "Retry the failed charge.",
        "Confirm the subscription returns to Active.",
      ],
      actions: ["update-payment", "add-note", "open-billing-docs"],
    };
  }

  if (profile.status === "CANCELLED") {
    return {
      priority: "normal",
      title: "Review cancelled membership history",
      reason:
        "This customer does not currently have an active membership. Confirm whether they want to reactivate or only need historical support.",
      suggestedFlow: [
        "Confirm the customer’s request.",
        "Review previous cancellation activity.",
        "Offer reactivation or document the support outcome.",
      ],
      actions: ["add-note", "change-plan"],
    };
  }

  if (profile.actionAvailability?.canTransferVehicle) {
    return {
      priority: "medium",
      title: "Confirm whether a vehicle transfer is needed",
      reason:
        "The customer has vehicle and subscription context that may support a transfer flow.",
      suggestedFlow: [
        "Confirm the old vehicle.",
        "Confirm the new vehicle.",
        "Transfer the subscription if the plan supports it.",
        "Add a support note documenting the change.",
      ],
      actions: ["transfer-vehicle", "add-note"],
    };
  }

  if (profile.actionAvailability?.canAddVehicle) {
    return {
      priority: "low",
      title: "Customer may be eligible to add another vehicle",
      reason:
        "The current plan appears to allow another vehicle or the add-vehicle flow is available.",
      suggestedFlow: [
        "Confirm the customer wants to add a vehicle.",
        "Collect vehicle make, model, year, color, and plate.",
        "Add the vehicle or change the plan if needed.",
      ],
      actions: ["add-vehicle", "change-plan", "add-note"],
    };
  }

  return {
    priority: "normal",
    title: "No urgent action required",
    reason:
      "Account, payment, and active subscription information do not show an obvious support blocker.",
    suggestedFlow: [
      "Confirm the customer’s question.",
      "Review account details.",
      "Add a support note if any action is taken.",
    ],
    actions: ["add-note"],
  };
}
