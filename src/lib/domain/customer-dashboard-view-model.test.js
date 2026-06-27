import assert from "node:assert/strict";
import test from "node:test";

import { createCustomerDashboardViewModel } from "./customer-dashboard-view-model.js";

test("builds a dashboard-focused customer view model with action availability and previews", () => {
  const profile = createCustomerDashboardViewModel(
    {
      id: "customer_1",
      firstName: "Drew",
      lastName: "Irwin",
      email: "drew@example.com",
      phone: "404-555-0101",
      status: "OVERDUE",
      createdAt: "2026-01-12T00:00:00.000Z",
      homeLocation: {
        name: "Roswell Tunnel",
      },
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
  );

  assert.equal(profile.fullName, "Drew Irwin");
  assert.equal(profile.memberId, "customer_1");
  assert.equal(profile.homeWashLocation, "Roswell Tunnel");
  assert.equal(profile.planTags[0], "Essential Wash");
  assert.equal(profile.actionAvailability.canEditAccount, true);
  assert.equal(profile.actionAvailability.canAddVehicle, true);
  assert.equal(profile.actionAvailability.canChangePlan, true);
  assert.equal(profile.actionAvailability.canTransferVehicle, true);
  assert.equal(profile.actionAvailability.canCancelMembership, true);
  assert.equal(profile.vehiclesWithSubscriptions.length, 2);
  assert.equal(profile.billing.paymentMethod.label, "Visa ending 4242");
  assert.equal(profile.billing.lastSuccessfulCharge.amount, "$29.99");
  assert.equal(profile.billing.lastFailedCharge.amount, "$29.99");
  assert.equal(profile.supportNotesPreview.length, 3);
  assert.equal(profile.recentActivityPreview.length, 1);
  assert.match(profile.recommendedNextStep.title, /update payment method/i);
});

test("marks disabled actions when the account lacks a valid membership context", () => {
  const profile = createCustomerDashboardViewModel({
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
  });

  assert.equal(profile.actionAvailability.canEditAccount, true);
  assert.equal(profile.actionAvailability.canAddVehicle, false);
  assert.equal(profile.actionAvailability.canChangePlan, false);
  assert.equal(profile.actionAvailability.canTransferVehicle, false);
  assert.equal(profile.actionAvailability.canCancelMembership, false);
  assert.match(profile.actionAvailability.disabledReasons.addVehicle, /active plan/i);
  assert.match(profile.recommendedNextStep.title, /cancelled membership/i);
});
