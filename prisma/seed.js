// @ts-check

import { PrismaClient } from "@prisma/client";

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

async function reset() {
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

async function createCustomer({ customer, vehicles, subscription, purchases, notes, events }, plans) {
  const created = await prisma.customer.create({
    data: {
      ...customer,
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

async function seedCustomers(plans) {
  const customers = [
    {
      customer: {
        firstName: "Alex",
        lastName: "Morgan",
        email: "alex.morgan@example.com",
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
        firstName: "Priya",
        lastName: "Shah",
        email: "priya.shah@example.com",
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
        firstName: "Marcus",
        lastName: "Reed",
        email: "marcus.reed@example.com",
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
        firstName: "Alicia",
        lastName: "Brown",
        email: "alicia.brown@example.com",
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
        firstName: "Ethan",
        lastName: "Brooks",
        email: "ethan.brooks@example.com",
        phone: "404-555-0155",
        status: "ACTIVE",
      },
      vehicles: [
        { year: 2019, make: "Jeep", model: "Grand Cherokee", color: "Green", licensePlate: "HNV6631" },
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
        firstName: "Sophia",
        lastName: "Nguyen",
        email: "sophia.nguyen@example.com",
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
  ];

  for (const customer of customers) {
    await createCustomer(customer, plans);
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
      answer:
        "Family Unlimited and Family Unlimited Signature can cover up to four vehicles.",
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

async function main() {
  await reset();
  const plans = await seedPlans();
  await seedCustomers(plans);
  await seedFaqArticles();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
