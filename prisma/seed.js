// @ts-check

import { PrismaClient } from "@prisma/client";
import { pathToFileURL } from "node:url";

const prisma = new PrismaClient();

const CSR_ACTOR = {
  actorName: "Bob Roberts",
  actorType: "CSR",
};

const SYSTEM_ACTOR = {
  actorName: "AMP System",
  actorType: "SYSTEM",
};

const date = (value) => new Date(`${value}T12:00:00.000Z`);
const HOME_WASH_LOCATIONS = [
  "AMP Buckhead",
  "AMP Roswell Tunnel",
  "AMP Midtown",
  "AMP Sandy Springs",
  "AMP Decatur",
  "AMP Alpharetta",
];

let seedMemberIdCounter = 1;

const nextSeedMemberId = () => {
  const id = `AMP-${String(seedMemberIdCounter).padStart(4, "0")}`;
  seedMemberIdCounter += 1;
  return id;
};

async function reset() {
  await prisma.supportDocChunk.deleteMany();
  await prisma.supportDoc.deleteMany();
  await prisma.laneSession.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.supportNote.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.subscriptionVehicle.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.faqArticle.deleteMany();
}

async function seedPlans() {
  const plans = [
    {
      name: "Essential Wash",
      description: "Single-vehicle unlimited standard washes.",
      monthlyPrice: "19.99",
      maxVehicles: 1,
      cleaningTier: "Standard",
    },
    {
      name: "Signature Wash",
      description: "Single-vehicle unlimited premium washes.",
      monthlyPrice: "29.99",
      maxVehicles: 1,
      cleaningTier: "Premium",
    },
    {
      name: "Family Unlimited",
      description: "Up to four vehicles with standard wash coverage.",
      monthlyPrice: "49.99",
      maxVehicles: 4,
      cleaningTier: "Standard",
    },
    {
      name: "Family Unlimited Signature",
      description: "Up to four vehicles with premium wash coverage.",
      monthlyPrice: "69.99",
      maxVehicles: 4,
      cleaningTier: "Premium",
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.create({ data: plan });
  }

  return prisma.subscriptionPlan.findMany();
}

/**
 * @param {string} name
 * @param {Array<object>} plans
 */
function planByName(name, plans) {
  const plan = plans.find((item) => item.name === name);
  if (!plan) {
    throw new Error(`Missing seeded plan: ${name}`);
  }
  return plan;
}

async function createCustomer(
  { customer, vehicles, subscription, purchases, notes, events },
  plans,
) {
  const created = await prisma.customer.create({
    data: {
      ...customer,
      memberId: customer.memberId || nextSeedMemberId(),
      createdAt: date("2026-01-08"),
      updatedAt: date("2026-06-24"),
      vehicles: {
        create: vehicles,
      },
    },
    include: { vehicles: true },
  });

  const plan = planByName(subscription.planName, plans);
  const createdSubscription = await prisma.subscription.create({
    data: {
      customerId: created.id,
      planId: plan.id,
      status: subscription.status,
      startedAt: subscription.startedAt,
      nextBillingDate: subscription.nextBillingDate,
    },
  });

  for (const licensePlate of subscription.coveredPlates) {
    const vehicle = created.vehicles.find((item) => item.licensePlate === licensePlate);
    if (!vehicle) {
      throw new Error(`Missing seeded vehicle ${licensePlate} for ${created.email}`);
    }
    await prisma.subscriptionVehicle.create({
      data: {
        subscriptionId: createdSubscription.id,
        vehicleId: vehicle.id,
        assignedAt: subscription.startedAt,
      },
    });
  }

  for (const purchase of purchases) {
    const vehicle = purchase.licensePlate
      ? created.vehicles.find((item) => item.licensePlate === purchase.licensePlate)
      : null;

    await prisma.purchase.create({
      data: {
        customerId: created.id,
        vehicleId: vehicle?.id,
        subscriptionId: purchase.subscriptionLinked ? createdSubscription.id : null,
        type: purchase.type,
        status: purchase.status,
        amount: purchase.amount,
        description: purchase.description,
        purchasedAt: purchase.purchasedAt,
      },
    });
  }

  for (const note of notes) {
    await prisma.supportNote.create({
      data: {
        customerId: created.id,
        note: note.note,
        csrName: note.csrName,
        createdAt: note.createdAt,
      },
    });
  }

  for (const event of events) {
    await prisma.auditEvent.create({
      data: {
        customerId: created.id,
        type: event.type,
        message: event.message,
        metadata: event.metadata || {},
        ...(event.system ? SYSTEM_ACTOR : CSR_ACTOR),
        createdAt: event.createdAt,
      },
    });
  }
}

export function buildSeedCustomers() {
  const customers = [
    {
      customer: {
        memberId: "AMP-0001",
        firstName: "Alex",
        lastName: "Morgan",
        email: "alex.morgan@cedarbrookmail.test",
        phone: "404-555-0181",
        status: "OVERDUE",
      },
      vehicles: [
        { year: 2021, make: "Honda", model: "Civic", color: "Blue", licensePlate: "CZR4821" },
      ],
      subscription: {
        planName: "Signature Wash",
        status: "OVERDUE",
        startedAt: date("2026-02-01"),
        nextBillingDate: date("2026-06-20"),
        coveredPlates: ["CZR4821"],
      },
      purchases: [
        {
          type: "MEMBERSHIP_PAYMENT",
          status: "FAILED",
          amount: "39.99",
          description: "Monthly membership payment failed.",
          purchasedAt: date("2026-06-20"),
          licensePlate: "CZR4821",
          subscriptionLinked: true,
        },
        {
          type: "SINGLE_WASH",
          status: "PAID",
          amount: "12.00",
          description: "Single express wash before membership issue.",
          purchasedAt: date("2026-05-12"),
          licensePlate: "CZR4821",
          subscriptionLinked: false,
        },
      ],
      notes: [
        {
          note: "Customer called after gate reader denied wash access.",
          csrName: "Bob Roberts",
          createdAt: date("2026-06-21"),
        },
      ],
      events: [
        {
          type: "PAYMENT_FAILED",
          message: "Membership payment failed for Signature Wash.",
          system: true,
          createdAt: date("2026-06-20"),
          metadata: { amount: "39.99", rootCause: "FAILED_MEMBERSHIP_PAYMENT" },
        },
        {
          type: "SUBSCRIPTION_OVERDUE",
          message: "Subscription marked overdue after failed membership payment.",
          system: true,
          createdAt: date("2026-06-20"),
          metadata: { licensePlate: "CZR4821" },
        },
      ],
    },
    {
      customer: {
        memberId: "AMP-0002",
        firstName: "Priya",
        lastName: "Shah",
        email: "priya.shah@cedarbrookmail.test",
        phone: "678-555-0124",
        status: "ACTIVE",
      },
      vehicles: [
        { year: 2022, make: "Toyota", model: "RAV4", color: "White", licensePlate: "RJP5294" },
        { year: 2020, make: "Honda", model: "Accord", color: "Black", licensePlate: "KMD7138" },
      ],
      subscription: {
        planName: "Family Unlimited Signature",
        status: "ACTIVE",
        startedAt: date("2026-03-03"),
        nextBillingDate: date("2026-07-03"),
        coveredPlates: ["RJP5294", "KMD7138"],
      },
      purchases: [
        {
          type: "MEMBERSHIP_PAYMENT",
          status: "PAID",
          amount: "69.99",
          description: "Family Unlimited Signature monthly payment.",
          purchasedAt: date("2026-06-03"),
          licensePlate: "RJP5294",
          subscriptionLinked: true,
        },
        {
          type: "SINGLE_WASH",
          status: "PAID",
          amount: "14.00",
          description: "Interior add-on wash purchase.",
          purchasedAt: date("2026-05-14"),
          licensePlate: "KMD7138",
          subscriptionLinked: false,
        },
      ],
      notes: [],
      events: [],
    },
    {
      customer: {
        memberId: "AMP-0003",
        firstName: "Marcus",
        lastName: "Reed",
        email: "marcus.reed@cedarbrookmail.test",
        phone: "770-555-0139",
        status: "ACTIVE",
      },
      vehicles: [
        { year: 2018, make: "Ford", model: "F-150", color: "Gray", licensePlate: "TGB9042" },
        { year: 2024, make: "Ford", model: "F-150", color: "Red", licensePlate: "MQL6187" },
      ],
      subscription: {
        planName: "Signature Wash",
        status: "ACTIVE",
        startedAt: date("2026-01-18"),
        nextBillingDate: date("2026-07-18"),
        coveredPlates: ["TGB9042"],
      },
      purchases: [
        {
          type: "MEMBERSHIP_PAYMENT",
          status: "PAID",
          amount: "29.99",
          description: "Signature Wash monthly payment.",
          purchasedAt: date("2026-06-18"),
          licensePlate: "TGB9042",
          subscriptionLinked: true,
        },
      ],
      notes: [
        {
          note: "Customer bought a new truck and wants membership transferred.",
          csrName: "Bob Roberts",
          createdAt: date("2026-06-22"),
        },
      ],
      events: [
        {
          type: "VEHICLE_ADDED",
          message: "New 2024 Ford F-150 added to account.",
          createdAt: date("2026-06-22"),
          metadata: { licensePlate: "MQL6187" },
        },
      ],
    },
    {
      customer: {
        memberId: "AMP-0004",
        firstName: "Alicia",
        lastName: "Brown",
        email: "alicia.brown@cedarbrookmail.test",
        phone: "470-555-0198",
        status: "ACTIVE",
      },
      vehicles: [
        { year: 2020, make: "Nissan", model: "Altima", color: "Silver", licensePlate: "LXC2409" },
      ],
      subscription: {
        planName: "Essential Wash",
        status: "ACTIVE",
        startedAt: date("2026-04-01"),
        nextBillingDate: date("2026-07-01"),
        coveredPlates: ["LXC2409"],
      },
      purchases: [
        {
          type: "SINGLE_WASH",
          status: "PAID",
          amount: "11.00",
          description: "Single wash purchase.",
          purchasedAt: date("2026-06-08"),
          licensePlate: "LXC2409",
          subscriptionLinked: false,
        },
        {
          type: "COUPON_REDEMPTION",
          status: "PAID",
          amount: "0.00",
          description: "Summer shine coupon redemption.",
          purchasedAt: date("2026-06-09"),
          licensePlate: "LXC2409",
          subscriptionLinked: false,
        },
        {
          type: "SINGLE_WASH",
          status: "REFUNDED",
          amount: "11.00",
          description: "Refunded duplicate single wash.",
          purchasedAt: date("2026-06-10"),
          licensePlate: "LXC2409",
          subscriptionLinked: false,
        },
      ],
      notes: [],
      events: [],
    },
    {
      customer: {
        memberId: "AMP-0005",
        firstName: "Ethan",
        lastName: "Brooks",
        email: "ethan.brooks@cedarbrookmail.test",
        phone: "404-555-0155",
        status: "ACTIVE",
      },
      vehicles: [
        {
          year: 2019,
          make: "Jeep",
          model: "Grand Cherokee",
          color: "Green",
          licensePlate: "HNV6631",
        },
      ],
      subscription: {
        planName: "Essential Wash",
        status: "ACTIVE",
        startedAt: date("2026-05-01"),
        nextBillingDate: date("2026-07-01"),
        coveredPlates: ["HNV6631"],
      },
      purchases: [
        {
          type: "MEMBERSHIP_PAYMENT",
          status: "PAID",
          amount: "19.99",
          description: "Essential Wash monthly payment.",
          purchasedAt: date("2026-06-01"),
          licensePlate: "HNV6631",
          subscriptionLinked: true,
        },
      ],
      notes: [
        {
          note: "Customer asked about cancellation timing.",
          csrName: "Bob Roberts",
          createdAt: date("2026-06-18"),
        },
      ],
      events: [],
    },
    {
      customer: {
        memberId: "AMP-0006",
        firstName: "Sophia",
        lastName: "Nguyen",
        email: "sophia.nguyen@cedarbrookmail.test",
        phone: "678-555-0108",
        status: "ACTIVE",
      },
      vehicles: [
        { year: 2022, make: "Toyota", model: "RAV4", color: "White", licensePlate: "RYW3815" },
        { year: 2020, make: "Honda", model: "Accord", color: "Black", licensePlate: "QBT5726" },
        { year: 2024, make: "Subaru", model: "Outback", color: "Blue", licensePlate: "PDK8460" },
      ],
      subscription: {
        planName: "Family Unlimited Signature",
        status: "ACTIVE",
        startedAt: date("2026-02-14"),
        nextBillingDate: date("2026-07-14"),
        coveredPlates: ["RYW3815", "QBT5726", "PDK8460"],
      },
      purchases: [
        {
          type: "MEMBERSHIP_PAYMENT",
          status: "PAID",
          amount: "69.99",
          description: "Family plan payment before downgrade discussion.",
          purchasedAt: date("2026-06-14"),
          licensePlate: "PDK8460",
          subscriptionLinked: true,
        },
      ],
      notes: [
        {
          note: "Customer is considering downgrade to single-vehicle coverage.",
          csrName: "Bob Roberts",
          createdAt: date("2026-06-23"),
        },
      ],
      events: [],
    },
    {
      customer: {
        memberId: "AMP-0007",
        firstName: "Noah",
        lastName: "Carter",
        email: "noah.carter@cedarbrookmail.test",
        phone: "470-555-0172",
        status: "ACTIVE",
      },
      vehicles: [
        { year: 2023, make: "Hyundai", model: "Tucson", color: "Gray", licensePlate: "BKR2175" },
      ],
      subscription: {
        planName: "Essential Wash",
        status: "ACTIVE",
        startedAt: date("2026-01-12"),
        nextBillingDate: date("2026-07-12"),
        coveredPlates: ["BKR2175"],
      },
      purchases: [
        {
          type: "MEMBERSHIP_PAYMENT",
          status: "PAID",
          amount: "19.99",
          description: "Essential Wash monthly payment.",
          purchasedAt: date("2026-06-12"),
          licensePlate: "BKR2175",
          subscriptionLinked: true,
        },
      ],
      notes: [],
      events: [],
    },
    {
      customer: {
        memberId: "AMP-0008",
        firstName: "Maya",
        lastName: "Patel",
        email: "maya.patel@cedarbrookmail.test",
        phone: "678-555-0187",
        status: "OVERDUE",
      },
      vehicles: [
        { year: 2020, make: "Mazda", model: "CX-5", color: "Red", licensePlate: "JTF6093" },
      ],
      subscription: {
        planName: "Signature Wash",
        status: "OVERDUE",
        startedAt: date("2026-03-09"),
        nextBillingDate: date("2026-06-09"),
        coveredPlates: ["JTF6093"],
      },
      purchases: [
        {
          type: "MEMBERSHIP_PAYMENT",
          status: "FAILED",
          amount: "29.99",
          description: "Monthly membership payment failed after card decline.",
          purchasedAt: date("2026-06-09"),
          licensePlate: "JTF6093",
          subscriptionLinked: true,
        },
      ],
      notes: [
        {
          note: "Customer asked why mobile app still shows active plan.",
          csrName: "Bob Roberts",
          createdAt: date("2026-06-10"),
        },
      ],
      events: [
        {
          type: "PAYMENT_FAILED",
          message: "Membership payment failed for Signature Wash.",
          system: true,
          createdAt: date("2026-06-09"),
          metadata: { amount: "29.99", rootCause: "CARD_DECLINED" },
        },
        {
          type: "SUBSCRIPTION_OVERDUE",
          message: "Subscription marked overdue after failed payment.",
          system: true,
          createdAt: date("2026-06-09"),
          metadata: { licensePlate: "JTF6093" },
        },
      ],
    },
    {
      customer: {
        memberId: "AMP-0009",
        firstName: "Daniel",
        lastName: "Kim",
        email: "daniel.kim@cedarbrookmail.test",
        phone: "770-555-0164",
        status: "ACTIVE",
      },
      vehicles: [
        { year: 2022, make: "Kia", model: "Telluride", color: "Black", licensePlate: "NVM3408" },
      ],
      subscription: {
        planName: "Essential Wash",
        status: "PAUSED",
        startedAt: date("2026-02-20"),
        nextBillingDate: null,
        coveredPlates: ["NVM3408"],
      },
      purchases: [
        {
          type: "MEMBERSHIP_PAYMENT",
          status: "PAID",
          amount: "19.99",
          description: "Payment before temporary subscription pause.",
          purchasedAt: date("2026-05-20"),
          licensePlate: "NVM3408",
          subscriptionLinked: true,
        },
      ],
      notes: [
        {
          note: "Subscription paused while customer is out of state.",
          csrName: "Bob Roberts",
          createdAt: date("2026-06-04"),
        },
      ],
      events: [],
    },
    {
      customer: {
        memberId: "AMP-0010",
        firstName: "Olivia",
        lastName: "Martinez",
        email: "olivia.martinez@cedarbrookmail.test",
        phone: "404-555-0192",
        status: "CANCELLED",
      },
      vehicles: [
        {
          year: 2017,
          make: "Chevrolet",
          model: "Malibu",
          color: "Silver",
          licensePlate: "LPA7752",
        },
      ],
      subscription: {
        planName: "Essential Wash",
        status: "CANCELLED",
        startedAt: date("2025-12-01"),
        nextBillingDate: null,
        coveredPlates: [],
      },
      purchases: [
        {
          type: "MEMBERSHIP_PAYMENT",
          status: "PAID",
          amount: "19.99",
          description: "Final membership payment before cancellation.",
          purchasedAt: date("2026-05-01"),
          licensePlate: "LPA7752",
          subscriptionLinked: true,
        },
      ],
      notes: [
        {
          note: "Customer cancelled after moving away from AMP locations.",
          csrName: "Bob Roberts",
          createdAt: date("2026-06-02"),
        },
      ],
      events: [
        {
          type: "SUBSCRIPTION_CANCELLED",
          message: "Subscription cancelled by CSR.",
          createdAt: date("2026-06-02"),
          metadata: { reason: "Moved away from service area." },
        },
      ],
    },
    {
      customer: {
        memberId: "AMP-0011",
        firstName: "Grace",
        lastName: "Lee",
        email: "grace.lee@cedarbrookmail.test",
        phone: "678-555-0146",
        status: "ACTIVE",
      },
      vehicles: [
        { year: 2021, make: "Tesla", model: "Model 3", color: "White", licensePlate: "RCN1584" },
        { year: 2019, make: "Toyota", model: "Highlander", color: "Blue", licensePlate: "WQH9026" },
        { year: 2024, make: "Honda", model: "Pilot", color: "Black", licensePlate: "DMS4419" },
        { year: 2018, make: "Subaru", model: "Forester", color: "Green", licensePlate: "KZT6840" },
      ],
      subscription: {
        planName: "Family Unlimited",
        status: "ACTIVE",
        startedAt: date("2026-01-25"),
        nextBillingDate: date("2026-07-25"),
        coveredPlates: ["RCN1584", "WQH9026", "DMS4419", "KZT6840"],
      },
      purchases: [
        {
          type: "MEMBERSHIP_PAYMENT",
          status: "PAID",
          amount: "49.99",
          description: "Family Unlimited monthly payment.",
          purchasedAt: date("2026-06-25"),
          licensePlate: "RCN1584",
          subscriptionLinked: true,
        },
      ],
      notes: [],
      events: [],
    },
    {
      customer: {
        memberId: "AMP-0012",
        firstName: "Ben",
        lastName: "Wilson",
        email: "ben.wilson@cedarbrookmail.test",
        phone: "470-555-0118",
        status: "ACTIVE",
      },
      vehicles: [
        { year: 2016, make: "Ram", model: "1500", color: "Black", licensePlate: "VPL2307" },
        { year: 2024, make: "Ram", model: "1500", color: "White", licensePlate: "YNF5186" },
      ],
      subscription: {
        planName: "Signature Wash",
        status: "ACTIVE",
        startedAt: date("2026-04-11"),
        nextBillingDate: date("2026-07-11"),
        coveredPlates: ["VPL2307"],
      },
      purchases: [
        {
          type: "MEMBERSHIP_PAYMENT",
          status: "PAID",
          amount: "29.99",
          description: "Signature Wash monthly payment.",
          purchasedAt: date("2026-06-11"),
          licensePlate: "VPL2307",
          subscriptionLinked: true,
        },
      ],
      notes: [
        {
          note: "Customer asked whether new truck can replace old vehicle on plan.",
          csrName: "Bob Roberts",
          createdAt: date("2026-06-19"),
        },
      ],
      events: [
        {
          type: "VEHICLE_ADDED",
          message: "New 2024 Ram 1500 added to account.",
          createdAt: date("2026-06-19"),
          metadata: { licensePlate: "YNF5186" },
        },
      ],
    },
    {
      customer: {
        memberId: "AMP-0013",
        firstName: "Harper",
        lastName: "Davis",
        email: "harper.davis@cedarbrookmail.test",
        phone: "404-555-0133",
        status: "ACTIVE",
      },
      vehicles: [
        { year: 2020, make: "Volkswagen", model: "Atlas", color: "White", licensePlate: "GRC7921" },
      ],
      subscription: {
        planName: "Essential Wash",
        status: "ACTIVE",
        startedAt: date("2026-05-05"),
        nextBillingDate: date("2026-07-05"),
        coveredPlates: ["GRC7921"],
      },
      purchases: [
        {
          type: "SINGLE_WASH",
          status: "REFUNDED",
          amount: "13.00",
          description: "Refunded wash after kiosk duplicate charge.",
          purchasedAt: date("2026-06-17"),
          licensePlate: "GRC7921",
          subscriptionLinked: false,
        },
      ],
      notes: [
        {
          note: "Refund processed after duplicate kiosk charge.",
          csrName: "Bob Roberts",
          createdAt: date("2026-06-17"),
        },
      ],
      events: [],
    },
    {
      customer: {
        memberId: "AMP-0014",
        firstName: "Liam",
        lastName: "Johnson",
        email: "liam.johnson@cedarbrookmail.test",
        phone: "770-555-0186",
        status: "ACTIVE",
      },
      vehicles: [{ year: 2023, make: "BMW", model: "X3", color: "Blue", licensePlate: "XDE4159" }],
      subscription: {
        planName: "Signature Wash",
        status: "ACTIVE",
        startedAt: date("2026-02-08"),
        nextBillingDate: date("2026-07-08"),
        coveredPlates: ["XDE4159"],
      },
      purchases: [
        {
          type: "COUPON_REDEMPTION",
          status: "PAID",
          amount: "0.00",
          description: "Loyalty coupon redemption for tire shine add-on.",
          purchasedAt: date("2026-06-13"),
          licensePlate: "XDE4159",
          subscriptionLinked: false,
        },
      ],
      notes: [],
      events: [],
    },
    {
      customer: {
        memberId: "AMP-0015",
        firstName: "Mia",
        lastName: "Thompson",
        email: "mia.thompson@cedarbrookmail.test",
        phone: "678-555-0191",
        status: "ACTIVE",
      },
      vehicles: [
        { year: 2021, make: "Acura", model: "RDX", color: "Gray", licensePlate: "PLM6043" },
        { year: 2024, make: "Lexus", model: "RX", color: "Silver", licensePlate: "FHT2876" },
      ],
      subscription: {
        planName: "Family Unlimited Signature",
        status: "ACTIVE",
        startedAt: date("2026-03-28"),
        nextBillingDate: date("2026-07-28"),
        coveredPlates: ["PLM6043"],
      },
      purchases: [
        {
          type: "MEMBERSHIP_PAYMENT",
          status: "PAID",
          amount: "69.99",
          description: "Family Unlimited Signature monthly payment.",
          purchasedAt: date("2026-06-28"),
          licensePlate: "PLM6043",
          subscriptionLinked: true,
        },
      ],
      notes: [
        {
          note: "Customer added second vehicle but has not assigned plan coverage yet.",
          csrName: "Bob Roberts",
          createdAt: date("2026-06-24"),
        },
      ],
      events: [
        {
          type: "VEHICLE_ADDED",
          message: "New 2024 Lexus RX added to account.",
          createdAt: date("2026-06-24"),
          metadata: { licensePlate: "FHT2876" },
        },
      ],
    },
    {
      customer: {
        memberId: "AMP-0016",
        firstName: "Chris",
        lastName: "Walker",
        email: "chris.walker@cedarbrookmail.test",
        phone: "470-555-0169",
        status: "ACTIVE",
      },
      vehicles: [
        { year: 2018, make: "Audi", model: "Q5", color: "Black", licensePlate: "SRD8310" },
      ],
      subscription: {
        planName: "Essential Wash",
        status: "ACTIVE",
        startedAt: date("2026-06-01"),
        nextBillingDate: date("2026-07-01"),
        coveredPlates: ["SRD8310"],
      },
      purchases: [
        {
          type: "SINGLE_WASH",
          status: "PAID",
          amount: "10.00",
          description: "Single wash before joining Essential Wash.",
          purchasedAt: date("2026-05-29"),
          licensePlate: "SRD8310",
          subscriptionLinked: false,
        },
      ],
      notes: [],
      events: [
        {
          type: "SUBSCRIPTION_ADDED",
          message: "Essential Wash subscription added to account.",
          createdAt: date("2026-06-01"),
          metadata: { licensePlate: "SRD8310" },
        },
      ],
    },
  ];

  return customers.map((entry, index) => ({
    ...entry,
    customer: {
      ...entry.customer,
      homeWashLocation:
        entry.customer.homeWashLocation ||
        HOME_WASH_LOCATIONS[index % HOME_WASH_LOCATIONS.length],
    },
  }));
}

export function buildSeedLaneSessions() {
  return [
    {
      customerEmail: "alex.morgan@cedarbrookmail.test",
      vehiclePlate: "CZR4821",
      locationName: "AMP Buckhead",
      laneName: "Lane 2",
      status: "BLOCKED",
      detectedPlate: "CZR4821",
      detectedMinutesAgo: 2,
      confidence: 0.98,
      issueCode: "FAILED_PAYMENT",
      issueSeverity: "BLOCKING",
    },
    {
      customerEmail: "priya.shah@cedarbrookmail.test",
      vehiclePlate: "RJP5294",
      locationName: "AMP Midtown",
      laneName: "Lane 1",
      status: "IN_QUEUE",
      detectedPlate: "RJP5294",
      detectedMinutesAgo: 5,
      confidence: 0.96,
      issueCode: "NONE",
      issueSeverity: "NONE",
    },
    {
      customerEmail: "marcus.reed@cedarbrookmail.test",
      vehiclePlate: "TGB9042",
      locationName: "AMP Roswell Tunnel",
      laneName: "Lane 3",
      status: "AT_GATE",
      detectedPlate: "MQL6187",
      detectedMinutesAgo: 1,
      confidence: 0.91,
      issueCode: "PLATE_MISMATCH",
      issueSeverity: "WARNING",
    },
  ];
}

async function seedCustomers(plans) {
  const customers = buildSeedCustomers();
  for (const customer of customers) {
    await createCustomer(customer, plans);
  }
}

async function seedLaneSessions() {
  const laneSessions = buildSeedLaneSessions();

  for (const session of laneSessions) {
    const customer = await prisma.customer.findUnique({
      where: { email: session.customerEmail },
      include: { vehicles: true },
    });

    if (!customer) {
      throw new Error(`Missing seeded lane customer: ${session.customerEmail}`);
    }

    const vehicle = customer.vehicles.find((item) => item.licensePlate === session.vehiclePlate);

    if (!vehicle) {
      throw new Error(`Missing seeded lane vehicle: ${session.vehiclePlate}`);
    }

    await prisma.laneSession.create({
      data: {
        customerId: customer.id,
        vehicleId: vehicle.id,
        locationName: session.locationName,
        laneName: session.laneName,
        status: session.status,
        detectedPlate: session.detectedPlate,
        detectedAt: new Date(Date.now() - session.detectedMinutesAgo * 60 * 1000),
        confidence: session.confidence,
        issueCode: session.issueCode,
        issueSeverity: session.issueSeverity,
      },
    });
  }
}

async function seedFaqArticles() {
  const articles = [
    {
      title: "Why can't I get a wash?",
      question: "Why can't I get a wash?",
      answer:
        "A wash can be blocked when a membership is overdue, a payment failed, or a vehicle is not attached to active coverage.",
      category: "Service access",
      keywords: "can't wash cannot wash unable to wash overdue failed payment blocked gate",
    },
    {
      title: "Failed membership payments",
      question: "What happens if my subscription payment fails?",
      answer:
        "The subscription can become overdue until payment details are updated and the membership payment is resolved.",
      category: "Billing",
      keywords: "failed payment membership overdue billing card declined",
    },
    {
      title: "Update payment method",
      question: "How do I update my payment method?",
      answer:
        "A CSR can review the failed payment and direct the customer to update payment details in the mobile account flow.",
      category: "Billing",
      keywords: "payment method update card billing",
    },
    {
      title: "Cancel membership",
      question: "How do I cancel my membership?",
      answer:
        "A CSR can cancel active subscription coverage. Vehicles remain on the account for history.",
      category: "Subscriptions",
      keywords: "cancel cancellation membership subscription account",
    },
    {
      title: "Transfer membership to a new vehicle",
      question: "Can I transfer my membership to a new vehicle?",
      answer:
        "A CSR can add the new vehicle and transfer active coverage from the old vehicle when plan capacity allows.",
      category: "Vehicles",
      keywords: "new car transfer subscription vehicle membership",
    },
    {
      title: "Plan changes",
      question: "Can I change my subscription plan?",
      answer:
        "CSRs can change plans. Downgrades from family coverage require choosing which vehicles remain covered.",
      category: "Subscriptions",
      keywords: "change plan downgrade upgrade subscription",
    },
    {
      title: "Multi-vehicle plans",
      question: "How many vehicles can a family plan cover?",
      answer: "Family Unlimited and Family Unlimited Signature can cover up to four vehicles.",
      category: "Subscriptions",
      keywords: "family plan multi vehicle vehicles covered",
    },
    {
      title: "Purchase and refund questions",
      question: "Where can I see recent purchases?",
      answer:
        "CSRs can review purchase history including single washes, membership payments, coupon redemptions, refunds, and failed payments.",
      category: "Purchases",
      keywords: "purchase refund recent history coupon redemption",
    },
    {
      title: "Coupon redemption",
      question: "How do coupons work?",
      answer:
        "Coupon redemptions appear in purchase history and can help CSRs explain discounted or zero-dollar washes.",
      category: "Purchases",
      keywords: "coupon redemption discount promo purchase",
    },
  ];

  for (const article of articles) {
    await prisma.faqArticle.create({ data: article });
  }
}

export async function resetDemoData() {
  seedMemberIdCounter = 1;
  await reset();
  const plans = await seedPlans();
  await seedCustomers(plans);
  await seedLaneSessions();
  await seedFaqArticles();
}

const isSeedCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isSeedCli) {
  resetDemoData()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (error) => {
      console.error(error);
      await prisma.$disconnect();
      process.exit(1);
    });
}
