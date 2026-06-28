// @ts-check

/**
 * @param {{ title?: string, summary?: string, slug?: string } | undefined} doc
 * @param {Array<string>} fallbackFlow
 */
function flowFromDoc(doc, fallbackFlow) {
  if (!doc) return fallbackFlow;

  return [
    `Open ${doc.title}.`,
    "Use the matched CSR playbook to confirm the issue details.",
    "Complete the support flow and document the outcome.",
  ];
}

/**
 * @param {{ title?: string, summary?: string, slug?: string } | undefined} doc
 * @param {string} fallbackReason
 */
function reasonFromDoc(doc, fallbackReason) {
  return doc?.summary || fallbackReason;
}

/**
 * @param {{ title?: string, summary?: string, slug?: string } | undefined} doc
 */
function docsHref(doc) {
  return doc?.slug ? `/csr/docs/${doc.slug}` : "";
}

/**
 * @param {((query: string, options?: { limit?: number }) => Promise<Array<{ title?: string, summary?: string, slug?: string }>>) | undefined} searchDocs
 * @param {string} query
 */
async function findSupportDoc(searchDocs, query) {
  if (!searchDocs) return undefined;
  const docs = await searchDocs(query, { limit: 1 });
  return docs[0];
}

export async function getRecommendedNextSteps(profile, options = {}) {
  if (profile.billing?.paymentStatus === "OVERDUE" || profile.billing?.lastFailedCharge) {
    const supportDoc = await findSupportDoc(
      options.searchDocs,
      "unable to wash overdue payment failed membership payment retry charge",
    );
    const fallbackReason =
      "The customer has a failed membership payment and at least one overdue subscription.";

    return {
      priority: "critical",
      title: "Update payment method and retry failed charge",
      reason: reasonFromDoc(supportDoc, fallbackReason),
      docsHref: docsHref(supportDoc),
      suggestedFlow: flowFromDoc(supportDoc, [
        "Confirm the customer and cardholder details.",
        "Update the payment method.",
        "Retry the failed charge.",
        "Confirm the subscription returns to Active.",
      ]),
      actions: ["update-payment", "add-note", "open-billing-docs"],
    };
  }

  if (profile.status === "CANCELLED") {
    const supportDoc = await findSupportDoc(
      options.searchDocs,
      "reactivate cancelled subscription membership cancellation history",
    );
    const fallbackReason =
      "This customer does not currently have an active membership. Confirm whether they want to reactivate or only need historical support.";

    return {
      priority: "normal",
      title: "Review cancelled membership history",
      reason: reasonFromDoc(supportDoc, fallbackReason),
      docsHref: docsHref(supportDoc),
      suggestedFlow: flowFromDoc(supportDoc, [
        "Confirm the customer’s request.",
        "Review previous cancellation activity.",
        "Offer reactivation or document the support outcome.",
      ]),
      actions: ["add-note", "change-plan", "open-billing-docs"],
    };
  }

  if (profile.actionAvailability?.canTransferVehicle) {
    const supportDoc = await findSupportDoc(
      options.searchDocs,
      "transfer subscription new vehicle wrong vehicle covered plate change",
    );
    const fallbackReason =
      "The customer has vehicle and subscription context that may support a transfer flow.";

    return {
      priority: "medium",
      title: "Confirm whether a vehicle transfer is needed",
      reason: reasonFromDoc(supportDoc, fallbackReason),
      docsHref: docsHref(supportDoc),
      suggestedFlow: flowFromDoc(supportDoc, [
        "Confirm the old vehicle.",
        "Confirm the new vehicle.",
        "Transfer the subscription if the plan supports it.",
        "Add a support note documenting the change.",
      ]),
      actions: ["transfer-vehicle", "add-note", "open-billing-docs"],
    };
  }

  if (profile.actionAvailability?.canAddVehicle) {
    const supportDoc = await findSupportDoc(
      options.searchDocs,
      "add new vehicle multi vehicle plan capacity",
    );
    const fallbackReason =
      "The current plan appears to allow another vehicle or the add-vehicle flow is available.";

    return {
      priority: "low",
      title: "Customer may be eligible to add another vehicle",
      reason: reasonFromDoc(supportDoc, fallbackReason),
      docsHref: docsHref(supportDoc),
      suggestedFlow: flowFromDoc(supportDoc, [
        "Confirm the customer wants to add a vehicle.",
        "Collect vehicle make, model, year, color, and plate.",
        "Add the vehicle or change the plan if needed.",
      ]),
      actions: ["add-vehicle", "change-plan", "add-note", "open-billing-docs"],
    };
  }

  return {
    priority: "normal",
    title: "Everything looks good",
    reason: "No billing, subscription, or vehicle issues are currently flagged for this customer.",
    docsHref: "",
    suggestedFlow: [
      "Confirm the customer’s question.",
      "Review account details.",
      "Add a support note if any action is taken.",
    ],
    actions: ["add-note"],
  };
}
