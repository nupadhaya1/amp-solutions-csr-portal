import assert from "node:assert/strict";
import test from "node:test";

import {
  getLaneIssueResolution,
  getLaneSessionBadge,
  getLaneStatusLabel,
  summarizeLaneSessions,
} from "./lane-context.js";

test("maps lane statuses and issue codes to CSR-facing guidance", () => {
  assert.equal(getLaneStatusLabel("AT_GATE"), "At gate");
  assert.equal(getLaneStatusLabel("IN_QUEUE"), "In queue");

  assert.deepEqual(getLaneIssueResolution("FAILED_PAYMENT"), {
    summary: "Membership blocked due to failed payment.",
    recommendedAction: "Update the customer's payment method and retry the failed membership charge.",
  });

  assert.deepEqual(getLaneIssueResolution("UNKNOWN_VEHICLE"), {
    summary: "Vehicle was detected at the lane but could not be matched to a customer.",
    recommendedAction: "Search by plate, phone, or email and add the vehicle after verification.",
  });
});

test("summarizes active lane sessions for the operational page", () => {
  const summary = summarizeLaneSessions([
    { status: "BLOCKED", issueSeverity: "BLOCKING", issueCode: "FAILED_PAYMENT" },
    { status: "AT_GATE", issueSeverity: "WARNING", issueCode: "PLATE_MISMATCH" },
    { status: "IN_QUEUE", issueSeverity: "NONE", issueCode: "NONE" },
  ]);

  assert.deepEqual(summary, {
    activeSessions: 3,
    blockingIssues: 1,
    atGate: 2,
    clearedInQueue: 1,
  });
});

test("creates compact lane badges for customer list rows", () => {
  assert.deepEqual(
    getLaneSessionBadge({
      status: "AT_GATE",
      issueCode: "PLATE_MISMATCH",
      issueSeverity: "WARNING",
    }),
    {
      label: "Plate mismatch",
      tone: "warning",
      searchText: "Lane context At gate Plate mismatch WARNING PLATE_MISMATCH",
    },
  );

  assert.deepEqual(
    getLaneSessionBadge({
      status: "BLOCKED",
      issueCode: "FAILED_PAYMENT",
      issueSeverity: "BLOCKING",
    }),
    {
      label: "Blocked",
      tone: "critical",
      searchText: "Lane context Blocked Failed payment BLOCKING FAILED_PAYMENT",
    },
  );
});
