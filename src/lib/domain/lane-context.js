// @ts-check

export const LANE_STATUS_LABELS = {
  PRE_GATE: "Pre-gate",
  AT_GATE: "At gate",
  IN_QUEUE: "In queue",
  WASH_STARTED: "Wash started",
  WASH_COMPLETED: "Wash completed",
  BLOCKED: "Blocked",
  NO_ACTIVE_SESSION: "No active session",
};

export const LANE_ISSUE_LABELS = {
  NONE: "No issue",
  FAILED_PAYMENT: "Failed payment",
  PLATE_MISMATCH: "Plate mismatch",
  NO_ACTIVE_SUBSCRIPTION: "No active subscription",
  UNKNOWN_VEHICLE: "Unknown vehicle",
};

export const LANE_ISSUE_RESOLUTIONS = {
  NONE: {
    summary: "No blocking issue detected.",
    recommendedAction: "Customer is cleared to continue.",
  },
  FAILED_PAYMENT: {
    summary: "Membership blocked due to failed payment.",
    recommendedAction: "Update the customer's payment method and retry the failed membership charge.",
  },
  PLATE_MISMATCH: {
    summary: "Detected plate does not match the active subscription vehicle.",
    recommendedAction: "Confirm the customer's current vehicle and transfer the subscription if needed.",
  },
  NO_ACTIVE_SUBSCRIPTION: {
    summary: "No active subscription found for this vehicle.",
    recommendedAction: "Review the customer's plan and add or reactivate a subscription.",
  },
  UNKNOWN_VEHICLE: {
    summary: "Vehicle was detected at the lane but could not be matched to a customer.",
    recommendedAction: "Search by plate, phone, or email and add the vehicle after verification.",
  },
};

function titleizeEnum(value) {
  return String(value || "")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function getLaneStatusLabel(status) {
  return LANE_STATUS_LABELS[status] || titleizeEnum(status) || "Unknown";
}

export function getLaneIssueLabel(issueCode) {
  return LANE_ISSUE_LABELS[issueCode] || titleizeEnum(issueCode) || "No issue";
}

export function getLaneIssueResolution(issueCode) {
  return LANE_ISSUE_RESOLUTIONS[issueCode] || LANE_ISSUE_RESOLUTIONS.NONE;
}

export function getLaneSeverityTone(issueSeverity) {
  if (issueSeverity === "BLOCKING") return "critical";
  if (issueSeverity === "WARNING") return "warning";
  if (issueSeverity === "INFO") return "info";
  return "success";
}

export function getLaneSessionBadge(laneSession) {
  if (!laneSession) return null;

  const statusLabel = getLaneStatusLabel(laneSession.status);
  const issueLabel = getLaneIssueLabel(laneSession.issueCode);
  const hasIssue = laneSession.issueCode && laneSession.issueCode !== "NONE";
  const label = laneSession.status === "BLOCKED" ? statusLabel : hasIssue ? issueLabel : statusLabel;
  const tone = getLaneSeverityTone(laneSession.issueSeverity);

  return {
    label,
    tone,
    searchText: [
      "Lane context",
      statusLabel,
      issueLabel,
      laneSession.issueSeverity,
      laneSession.issueCode,
    ]
      .filter(Boolean)
      .join(" "),
  };
}

export function summarizeLaneSessions(laneSessions) {
  return {
    activeSessions: laneSessions.length,
    blockingIssues: laneSessions.filter((session) => session.issueSeverity === "BLOCKING").length,
    atGate: laneSessions.filter((session) => ["AT_GATE", "BLOCKED"].includes(session.status)).length,
    clearedInQueue: laneSessions.filter(
      (session) => session.status === "IN_QUEUE" && session.issueCode === "NONE",
    ).length,
  };
}

export function formatLaneDetectedTime(value, now = new Date()) {
  if (!value) return "Not detected";

  const elapsedMs = now.getTime() - new Date(value).getTime();
  const elapsedMinutes = Math.max(0, Math.round(elapsedMs / 60000));

  if (elapsedMinutes < 1) return "Just now";
  if (elapsedMinutes < 60) return `${elapsedMinutes} min ago`;

  const elapsedHours = Math.round(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours} hr ago`;

  const elapsedDays = Math.round(elapsedHours / 24);
  return `${elapsedDays} day${elapsedDays === 1 ? "" : "s"} ago`;
}

export function getLaneCustomerHref(laneSession) {
  if (laneSession?.customerId) return `/csr/customers/${laneSession.customerId}`;
  return `/csr/customers?q=${encodeURIComponent(laneSession?.detectedPlate || "")}`;
}
