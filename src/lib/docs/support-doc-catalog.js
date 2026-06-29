export const systemDesignCategory = "System Design";

export const supportDocCatalog = [
  { slug: "project-overview", title: "Project overview and requirement coverage", category: systemDesignCategory },
  { slug: "system-architecture", title: "System architecture", category: systemDesignCategory },
  { slug: "aws-production-deployment", title: "AWS production deployment plan", category: systemDesignCategory },
  { slug: "feature-flows", title: "CSR feature flows", category: systemDesignCategory },
  { slug: "data-model-and-seeding", title: "Data model and seeded demo data", category: systemDesignCategory },
  { slug: "search-and-knowledge-base", title: "Search and knowledge base architecture", category: systemDesignCategory },
  { slug: "reviewer-demo-guide", title: "Reviewer demo guide", category: systemDesignCategory },
  { slug: "account-contact-update", title: "Update account contact information", category: "Account" },
  { slug: "duplicate-account", title: "Duplicate customer account", category: "Account" },
  { slug: "failed-membership-payment", title: "Failed recurring membership payment", category: "Billing" },
  { slug: "refund-or-duplicate-charge", title: "Refund or duplicate charge", category: "Billing" },
  { slug: "retry-payment-after-card-update", title: "Retry payment after card update", category: "Billing" },
  { slug: "update-payment-method", title: "Update payment method", category: "Billing" },
  { slug: "coupon-redemption-issue", title: "Coupon redemption issue", category: "Coupons" },
  { slug: "audit-timeline-review", title: "Review audit timeline", category: "Internal CSR" },
  { slug: "escalation-checklist", title: "Escalation checklist", category: "Internal CSR" },
  { slug: "mobile-app-status-mismatch", title: "Mobile app status does not match CSR portal", category: "Mobile App" },
  { slug: "damage-or-safety-complaint", title: "Damage or safety complaint", category: "Operations" },
  { slug: "gate-kiosk-location-issue", title: "Gate, kiosk, or location issue", category: "Operations" },
  { slug: "purchase-not-visible", title: "Purchase not visible in account", category: "Purchases" },
  { slug: "recent-purchase-question", title: "Question about a recent purchase", category: "Purchases" },
  { slug: "unable-to-wash-overdue-payment", title: "Customer cannot get a wash because membership is overdue", category: "Service Access" },
  { slug: "cancel-membership", title: "Cancel membership", category: "Subscription" },
  { slug: "multi-vehicle-plan-capacity", title: "Multi-vehicle plan capacity issue", category: "Subscription" },
  { slug: "paused-subscription", title: "Paused subscription", category: "Subscription" },
  { slug: "plan-change-upgrade-downgrade", title: "Change subscription plan", category: "Subscription" },
  { slug: "reactivate-cancelled-subscription", title: "Reactivate cancelled subscription", category: "Subscription" },
  { slug: "add-new-vehicle", title: "Add a new vehicle", category: "Vehicle Management" },
  { slug: "change-license-plate", title: "Change license plate", category: "Vehicle Management" },
  { slug: "transfer-subscription-new-vehicle", title: "Transfer subscription to a new vehicle", category: "Vehicle Management" },
  { slug: "wrong-vehicle-covered", title: "Wrong vehicle has subscription coverage", category: "Vehicle Management" },
];

export const systemDesignDocSlugs = new Set(
  supportDocCatalog.filter((doc) => doc.category === systemDesignCategory).map((doc) => doc.slug),
);

export function isSystemDesignDocSlug(slug) {
  return systemDesignDocSlugs.has(slug);
}

export const supportDocNavCatalog = supportDocCatalog.filter((doc) => doc.category !== systemDesignCategory);
