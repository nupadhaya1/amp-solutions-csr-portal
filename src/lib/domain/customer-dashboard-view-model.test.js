import assert from "node:assert/strict";
import test from "node:test";

import { createCustomerDashboardViewModel } from "./customer-dashboard-view-model.js";

test("builds a dashboard-focused customer view model with action availability and previews", async () => {
  const profile = await createCustomerDashboardViewModel(
    {
      id: "customer_1",
      firstName: "Drew",
      lastName: "Irwin",
      memberId: "AMP-0999",
      email: "drew@example.com",
      phone: "404-555-0101",
      status: "OVERDUE",
      createdAt: "2026-01-12T00:00:00.000Z",
      homeWashLocation: "AMP Roswell Tunnel",
      vehicles: [
        {
          id: "vehicle_1",
          year: 2025,
          make: "Toyota",
          model: "Camry",
          color: "Silver",
          licensePlate: "DFX0396",
          subscriptionVehicles: [
            {
              removedAt: null,
              subscription: {
                id: "sub_1",
                status: "OVERDUE",
                plan: {
                  name: "Essential Wash",
                  maxVehicles: 2,
                },
              },
            },
          ],
        },
        {
          id: "vehicle_2",
          year: 2024,
          make: "Subaru",
          model: "Outback",
          color: "Blue",
          licensePlate: "DAY0389",
          subscriptionVehicles: [],
        },
      ],
      subscriptions: [
        {
          id: "sub_1",
          planId: "plan_1",
          status: "OVERDUE",
          startedAt: "2026-01-12T00:00:00.000Z",
          nextBillingDate: "2026-07-28T00:00:00.000Z",
          plan: {
            name: "Essential Wash",
            monthlyPrice: "29.99",
            cleaningTier: "Core",
            maxVehicles: 2,
          },
          vehicles: [
            {
              id: "coverage_1",
              removedAt: null,
              vehicle: {
                id: "vehicle_1",
                year: 2025,
                make: "Toyota",
                model: "Camry",
                licensePlate: "DFX0396",
              },
            },
          ],
        },
      ],
      purchases: [
        {
          id: "purchase_1",
          type: "MEMBERSHIP_PAYMENT",
          status: "PAID",
          amount: "29.99",
          description: "Membership payment",
          purchasedAt: "2026-05-28T00:00:00.000Z",
        },
        {
          id: "purchase_2",
          type: "MEMBERSHIP_PAYMENT",
          status: "FAILED",
          amount: "29.99",
          description: "Membership payment",
          purchasedAt: "2026-06-28T00:00:00.000Z",
        },
      ],
      supportNotes: [
        {
          id: "note_1",
          note: "Customer called because gate denied wash.",
          csrName: "Bob Roberts",
          createdAt: "2026-06-27T10:30:00.000Z",
        },
        {
          id: "note_2",
          note: "Advised payment update.",
          csrName: "Bob Roberts",
          createdAt: "2026-06-26T10:30:00.000Z",
        },
        {
          id: "note_3",
          note: "Previous note.",
          csrName: "Bob Roberts",
          createdAt: "2026-06-25T10:30:00.000Z",
        },
      ],
      auditEvents: [
        {
          id: "audit_1",
          type: "SUPPORT_NOTE_ADDED",
          message: "Support note added by CSR.",
          metadata: {
            notePreview: "Customer called because gate denied wash.",
          },
          actorName: "Bob Roberts",
          actorType: "CSR",
          createdAt: "2026-06-27T10:31:00.000Z",
        },
      ],
    },
    [],
    { searchDocs: async () => [] },
  );

  assert.equal(profile.fullName, "Drew Irwin");
  assert.equal(profile.memberId, "AMP-0999");
  assert.equal(profile.homeWashLocation, "AMP Roswell Tunnel");
  assert.equal(profile.planTags[0], "Essential Wash");
  assert.equal(profile.actionAvailability.canEditAccount, true);
  assert.equal(profile.actionAvailability.canAddVehicle, true);
  assert.equal(profile.actionAvailability.canAssignVehicleToPlan, true);
  assert.equal(profile.actionAvailability.canChangePlan, true);
  assert.equal(profile.actionAvailability.canTransferVehicle, true);
  assert.equal(profile.actionAvailability.canCancelMembership, true);
  assert.equal(profile.vehiclesWithSubscriptions.length, 2);
  assert.deepEqual(profile.assignableSubscriptions, [
    {
      id: "sub_1",
      planName: "Essential Wash",
      coveredVehicleCount: 1,
      maxVehicles: 2,
      openSlots: 1,
    },
  ]);
  assert.deepEqual(profile.assignableVehicles, [
    {
      id: "vehicle_2",
      label: "2024 Subaru Outback",
      licensePlate: "DAY0389",
    },
  ]);
  assert.equal(profile.billing.paymentMethod.label, "Visa ending 4242");
  assert.equal(profile.billing.lastSuccessfulCharge.amount, "$29.99");
  assert.equal(profile.billing.lastFailedCharge.amount, "$29.99");
  assert.equal(profile.supportNotesPreview.length, 3);
  assert.equal(profile.recentActivityPreview.length, 1);
  assert.equal(profile.purchases.length, 2);
  assert.equal(profile.purchases[0].statusLabel, "Paid");
  assert.equal(profile.purchases[1].statusLabel, "Failed");
  assert.equal(profile.purchases[0].typeLabel, "Membership Payment");
  assert.match(profile.recommendedNextStep.title, /update payment method/i);
});

test("marks disabled actions when the account lacks a valid membership context", async () => {
  const profile = await createCustomerDashboardViewModel(
    {
      id: "customer_2",
      firstName: "Casey",
      lastName: "Lane",
      email: "casey@example.com",
      phone: "404-555-0199",
      status: "CANCELLED",
      createdAt: "2026-02-01T00:00:00.000Z",
      vehicles: [],
      subscriptions: [],
      purchases: [],
      supportNotes: [],
      auditEvents: [],
    },
    [],
    { searchDocs: async () => [] },
  );

  assert.equal(profile.actionAvailability.canEditAccount, true);
  assert.equal(profile.actionAvailability.canAddVehicle, false);
  assert.equal(profile.actionAvailability.canAssignVehicleToPlan, false);
  assert.equal(profile.actionAvailability.canChangePlan, false);
  assert.equal(profile.actionAvailability.canTransferVehicle, false);
  assert.equal(profile.actionAvailability.canCancelMembership, false);
  assert.match(profile.actionAvailability.disabledReasons.addVehicle, /active plan/i);
  assert.match(profile.recommendedNextStep.title, /cancelled membership/i);
});

test("enables start membership for cancelled subscriptions", async () => {
  const profile = await createCustomerDashboardViewModel(
    {
      id: "customer_3",
      firstName: "Casey",
      lastName: "Lane",
      email: "casey@example.com",
      phone: "404-555-0199",
      status: "CANCELLED",
      createdAt: "2026-02-01T00:00:00.000Z",
      vehicles: [],
      subscriptions: [
        {
          id: "subscription_1",
          planId: "plan_1",
          status: "CANCELLED",
          startedAt: "2026-02-01T00:00:00.000Z",
          nextBillingDate: null,
          plan: {
            id: "plan_1",
            name: "Signature Wash",
            monthlyPrice: "29.99",
            maxVehicles: 1,
          },
          vehicles: [],
        },
      ],
      purchases: [],
      supportNotes: [],
      auditEvents: [],
    },
    [{ id: "plan_1", name: "Signature Wash", monthlyPrice: "29.99" }],
    { searchDocs: async () => [] },
  );

  assert.equal(profile.actionAvailability.canCancelMembership, false);
  assert.equal(profile.actionAvailability.canStartMembership, true);
  assert.deepEqual(profile.startableSubscription, {
    id: "subscription_1",
    planId: "plan_1",
  });
});

test("derives overdue profile status from failed membership payments", async () => {
  const profile = await createCustomerDashboardViewModel(
    {
      id: "customer_5",
      firstName: "Quinn",
      lastName: "Kim",
      email: "quinn@example.com",
      phone: "404-555-0151",
      status: "ACTIVE",
      createdAt: "2026-02-01T00:00:00.000Z",
      vehicles: [],
      subscriptions: [],
      purchases: [
        {
          id: "purchase_failed",
          type: "MEMBERSHIP_PAYMENT",
          status: "FAILED",
          amount: "39.99",
          description: "Monthly membership payment",
          purchasedAt: "2026-06-28T00:00:00.000Z",
        },
      ],
      supportNotes: [],
      auditEvents: [],
    },
    [],
    { searchDocs: async () => [] },
  );

  assert.equal(profile.status, "OVERDUE");
  assert.equal(profile.billing.paymentStatus, "OVERDUE");
  assert.equal(profile.billing.lastFailedCharge.reason, "Card declined");
});

test("disables transfer vehicle when there is no uncovered destination vehicle", async () => {
  const profile = await createCustomerDashboardViewModel(
    {
      id: "customer_4",
      firstName: "Drew",
      lastName: "Irwin",
      email: "drew@example.com",
      phone: "404-555-0101",
      status: "ACTIVE",
      createdAt: "2026-01-12T00:00:00.000Z",
      vehicles: [
        {
          id: "vehicle_1",
          year: 2025,
          make: "Toyota",
          model: "Camry",
          color: "Silver",
          licensePlate: "DFX0396",
          subscriptionVehicles: [],
        },
      ],
      subscriptions: [
        {
          id: "sub_1",
          planId: "plan_1",
          status: "ACTIVE",
          startedAt: "2026-01-12T00:00:00.000Z",
          nextBillingDate: "2026-07-28T00:00:00.000Z",
          plan: {
            name: "Essential Wash",
            monthlyPrice: "29.99",
            cleaningTier: "Core",
            maxVehicles: 1,
          },
          vehicles: [
            {
              id: "coverage_1",
              removedAt: null,
              vehicle: {
                id: "vehicle_1",
                year: 2025,
                make: "Toyota",
                model: "Camry",
                licensePlate: "DFX0396",
              },
            },
          ],
        },
      ],
      purchases: [],
      supportNotes: [],
      auditEvents: [],
    },
    [],
    { searchDocs: async () => [] },
  );

  assert.equal(profile.actionAvailability.canTransferVehicle, false);
  assert.match(profile.actionAvailability.disabledReasons.transferVehicle, /uncovered vehicles/i);
});
