# AMP CSR Command Center — Project Specification

## 0. How to Use This Spec

This file is the single source of truth for building the AMP CSR take-home project.

Before coding, read the entire spec. Build in small vertical slices. Prioritize a working CSR portal with persistence before adding polish.

Recommended implementation instruction:

```txt
Read PROJECT_SPEC.md fully before coding. Build this project in small vertical slices. Prioritize the CSR portal, database schema, seed data, search, customer profile, and subscription management before polish. Use JavaScript only. Do not convert the app to TypeScript.
```

---

## 1. Project Summary

Build a Customer Service Representative portal for AMP, a membership and loyalty platform for car washes.

The portal should help CSRs quickly support customers who call in with account, purchase, vehicle, or subscription issues.

The project should feel like a realistic AMP support command center, not a generic CRUD dashboard.

Primary demo name:

```txt
AMP CSR Command Center
```

Primary value proposition:

```txt
A support portal for resolving customer membership, vehicle, subscription, and payment issues.
```

---

## 2. Source Prompt Requirements

The take-home requires a CSR portal with:

- View a list of registered users.
- Quickly find and view a specific user.
- View detailed customer account information.
- View active vehicle subscriptions.
- View purchase history.
- Edit account information.
- View and edit vehicle subscriptions.
- Add, remove, or transfer subscriptions.
- Build both frontend and backend.
- Persist data on the backend.
- Submit GitHub repo link.
- Submit deployed app link.

The app should directly support these example CSR questions:

- “I want to cancel my account.”
- “I have a question about a recent purchase.”
- “I purchased a new vehicle and I want my subscription transferred.”
- “I am not able to get a wash.”

---

## 3. Product Boundary

This project is a CSR portal.

It is not:

- A full customer mobile app.
- A real payment processor.
- A real authentication system.
- A production LLM chatbot.
- A full analytics platform.
- A 3D marketing website.

Supporting features are allowed only if they make the CSR portal feel more complete or easier to demo.

Good supporting features:

- Critical warning banner for service-blocking issues.
- Support notes.
- Audit timeline.
- Smart Help Search.
- Mock mobile companion.
- Browser-based presentation route.
- AWS scale design slide.

---

## 4. Hero Workflow

The primary demo workflow is:

```txt
“I can’t get a wash.”
```

This is the strongest workflow because it connects:

- Customer search
- Account status
- Vehicle data
- Subscription state
- Failed payment history
- Critical issue diagnosis
- CSR support action
- Audit timeline

### Hero Workflow Story

1. Customer calls and says: “I can’t get a wash.”
2. CSR searches by name, phone, email, or license plate.
3. CSR opens the customer profile.
4. A critical warning banner appears.
5. Banner explains:
   ```txt
   Unable to wash: subscription overdue because the latest membership payment failed.
   ```
6. CSR reviews affected vehicle.
7. CSR reviews affected subscription.
8. CSR reviews failed membership payment in purchase history.
9. CSR adds a support note or reviews the payment issue.
10. Audit timeline records the CSR action.

### Hero Workflow Goal

The CSR should be able to diagnose the issue in less than 60 seconds.

The profile page should immediately answer:

- Who is the customer?
- What vehicle is affected?
- What subscription is affected?
- Why is the customer blocked?
- What recent payment caused the issue?
- What action should the CSR take next?

---

## 5. Supporting Workflows

### 5.1 Cancel Account / Subscription

Customer says:

```txt
“I want to cancel my account.”
```

CSR should be able to:

- Search for the customer.
- Open customer profile.
- View active subscriptions.
- Cancel an active subscription.
- Optionally add a cancellation reason.
- See the subscription show as `CANCELLED`.
- See a `SUBSCRIPTION_CANCELLED` audit event.

For the MVP, cancellation means canceling the customer’s subscription, not deleting the customer account.

### 5.2 Recent Purchase Question

Customer says:

```txt
“I have a question about a recent purchase.”
```

CSR should be able to:

- Search for customer.
- Open customer profile.
- View purchase history.
- See single washes, membership payments, coupon redemptions, refunds, and failed payments.
- Add a support note if needed.

Purchase history is read-only.

### 5.3 New Vehicle / Transfer Subscription

Customer says:

```txt
“I purchased a new vehicle and I want my subscription transferred.”
```

CSR should be able to:

- Search for customer.
- Open customer profile.
- View existing vehicles.
- Add a new vehicle.
- Transfer active subscription coverage from an old vehicle to the new vehicle.
- Keep the old vehicle on the account for historical reasons.
- See a `SUBSCRIPTION_TRANSFERRED` audit event.

### 5.4 Plan Change

CSR should be able to change a customer’s subscription plan.

Examples:

- Essential Wash → Signature Wash
- Essential Wash → Family Unlimited
- Signature Wash → Family Unlimited Signature
- Family Unlimited Signature → Signature Wash

Plan changes should update subscription plan records only.

Do not implement:

- Real billing
- Proration
- Refund calculations
- Tax calculations
- Payment method updates
- Immediate charging

---

## 6. Route Structure

Use this route structure:

```txt
/                     Landing page with CTA to CSR portal
/csr                  CSR dashboard
/csr/search           Full customer search page
/csr/customers/[id]   Customer profile
/mobile               Mock mobile companion
/presentation         Keyboard-controlled presentation
```

### 6.1 Landing Page

The landing page should be polished but lightweight.

It should introduce the project:

```txt
AMP CSR Command Center
A support portal for resolving customer membership, vehicle, subscription, and payment issues.
```

Primary CTA:

```txt
Open CSR Portal → /csr
```

Secondary CTA:

```txt
View Presentation → /presentation
```

### 6.2 CSR Dashboard

The CSR dashboard should show:

- Global search
- Recent customers
- Critical accounts needing attention
- Quick stats
- Recently updated accounts

Dashboard stats should be computed from the database, not hardcoded.

Recommended stats:

- Total customers
- Active subscriptions
- Overdue subscriptions
- Failed membership payments
- Open critical issues
- Vehicles covered by active subscriptions

### 6.3 Full Search Page

Route:

```txt
/csr/search
```

Includes:

- Customer search input
- Standard filter mode
- Customer result list
- Empty state
- Loading state
- Clear filters action

### 6.4 Customer Profile

Route:

```txt
/csr/customers/[id]
```

This is the main CSR workspace.

### 6.5 Mock Mobile Companion

Route:

```txt
/mobile
```

This is not a full mobile app. It is a demo companion that shows how customers might self-serve or confirm membership decisions.

### 6.6 Presentation

Route:

```txt
/presentation
```

This is a browser-based presentation with keyboard navigation.

---

## 7. Tech Stack

Use:

```txt
Next.js App Router
JavaScript
React
Tailwind CSS
shadcn/ui
Framer Motion
Prisma
Postgres
Neon Postgres
Fuse.js
Zod
```

Hosting:

```txt
Vercel
```

Database:

```txt
Neon Postgres
```

Backend:

```txt
Next.js Route Handlers
```

Do not use Express unless absolutely necessary.

Do not use TypeScript. This project should be JavaScript-only.

---

## 8. JavaScript-Only Type Safety

Even though the project is JavaScript-only, use practical safety techniques.

Use:

- JSDoc comments
- `// @ts-check` in important JS files
- `jsconfig.json`
- Zod validation
- Prisma schema constraints
- ESLint
- Small reusable helper functions

Example:

```js
// @ts-check

/**
 * @typedef {Object} CustomerSearchResult
 * @property {string} id
 * @property {string} fullName
 * @property {string} email
 * @property {string} phone
 * @property {string} primaryVehicle
 * @property {string} licensePlate
 * @property {boolean} hasCriticalIssue
 */
```

Use Zod for API validation:

```js
import { z } from "zod";

export const updateCustomerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7)
});
```

Use Prisma as the database source of truth.

---

## 9. UI and Theme

### 9.1 Visual Direction

Use an AMP-inspired modern SaaS command-center style.

Default theme should be light mode.

Visual style:

```txt
Light mode:
Clean white cards, soft gray backgrounds, navy text, blue/cyan accents.

Dark mode:
Dark navy shell, elevated dark cards, bright blue/cyan accents, readable contrast.
```

Use:

- Clean cards
- Rounded panels
- Status badges
- Polished forms
- Subtle borders
- Clear section hierarchy
- Dashboard-style layouts
- SaaS command-center feel

### 9.2 Light/Dark Mode

Support light and dark mode.

Rules:

- Light mode is default.
- Theme toggle should appear in the app shell/header.
- Persist selected theme in localStorage.
- Theme should apply across:
  - Landing page
  - CSR portal
  - Mock mobile companion
  - Presentation

### 9.3 shadcn/ui

Use Tailwind and shadcn/ui.

Use shadcn-style components for:

- Button
- Card
- Dialog
- Input
- Label
- Badge
- Tabs
- Dropdown menu
- Toast
- Sheet only if useful

Because this is JavaScript-only, convert generated shadcn components to `.jsx` and remove TypeScript annotations.

### 9.4 Framer Motion

Use Framer Motion throughout the project.

Use it for:

- Page transitions
- Search dropdown entrance/exit
- Customer result cards
- Warning banner entrance
- Dialog/modal transitions
- Subscription plan change flow
- Presentation slide transitions
- Mock mobile screen transitions

Do not include 3D in the MVP.

Animations should support polish and usability, not distract from the CSR workflow.

---

## 10. Authentication

Do not build real authentication.

Use a mocked logged-in CSR.

Mock CSR:

```txt
Bob Roberts
Customer Support Representative
```

All CSR audit events should use:

```txt
actorName: Bob Roberts
actorType: CSR
```

System events should use:

```txt
actorName: AMP System
actorType: SYSTEM
```

---

## 11. Customer Search

Customer search is a primary workflow.

The CSR should be able to quickly find a customer using information likely provided during a support call.

### 11.1 Search Experiences

Support:

1. Global inline search
2. Dedicated search page

### 11.2 Global Inline Search

Global search should be available in the main CSR layout header.

It should behave like a lightweight command palette.

Behavior:

- Typing opens inline result dropdown.
- Show top 3 matching customers.
- Click result opens customer profile.
- Escape closes dropdown.
- Arrow Up/Down navigates results.
- Enter opens selected result.
- If no result selected, Enter routes to full search page with query applied.
- “View all results” routes to `/csr/search?q=[query]`.

Inline result fields:

- Customer name
- Email or phone
- Primary vehicle
- License plate
- Subscription status summary
- Critical issue badge if applicable

### 11.3 Dedicated Search Page

The dedicated search page should include:

- Customer search
- Standard filters
- Customer result cards/list rows
- Empty state
- Loading state
- Clear filters button

Do not display a full spreadsheet grid.

Search result cards should include:

- Customer name
- Email
- Phone
- Primary vehicle
- License plate
- Subscription summary
- Critical issue badge if applicable
- Open customer action

Example:

```txt
Alex Morgan
jordan.ellis@example.com · 404-555-0181

2021 Honda Civic · Plate CZR4821
Subscription: Unlimited Wash Club · OVERDUE

Critical issue: Unable to wash due to failed membership payment

[Open customer]
```

### 11.4 Smart Search

Use Fuse.js.

Search across a flattened customer record.

Flattened fields should include:

- First name
- Last name
- Full name
- Email
- Phone
- Customer status
- Vehicle make
- Vehicle model
- Vehicle year
- Vehicle color
- License plate
- Subscription plan name
- Subscription status
- Purchase type
- Purchase status
- Purchase description
- Support note text
- Audit event action/message

Add a simple synonym map.

Example:

```js
const searchSynonyms = {
  "can't wash": ["unable to wash", "overdue", "failed payment", "subscription blocked"],
  "cannot wash": ["unable to wash", "overdue", "failed payment", "subscription blocked"],
  "payment issue": ["failed payment", "overdue", "membership payment"],
  "new car": ["transfer subscription", "vehicle transfer", "add vehicle"],
  "cancel": ["cancel subscription", "cancel account"]
};
```

### 11.5 Standard Filters

Standard filters should include:

- Name
- Email
- Phone
- License plate

Do not include subscription status as a standard filter.

### 11.6 Required Search Demo Queries

Seed data should make these searches work:

```txt
Alex
CZR4821
failed payment
can't wash
overdue
Marcus
MQL6187
Alicia
refund
Ethan
cancel
```

---

## 12. Customer Profile Page

The customer profile page is the main CSR workspace.

It should contain these sections in order:

1. Critical warning banner
2. Customer account summary
3. Vehicles and subscriptions
4. Purchase/payment history
5. CSR actions
6. Support notes
7. Audit timeline

### 12.1 Critical Warning Banner

Only show a critical warning banner when the customer has a service-blocking issue.

Do not show a green healthy banner.

Hide the banner if there is no critical issue.

Show the banner for:

- Overdue subscription caused by failed membership payment.
- No active subscription for the vehicle.
- Cancelled/inactive subscription with no active replacement.
- Vehicle not correctly attached to active subscription.

Hero workflow banner:

```txt
Unable to wash
Subscription overdue because the latest membership payment failed.

Affected vehicle: 2021 Honda Civic · CZR4821
Subscription: Unlimited Wash Club
Failed payment: $39.99 on June 20, 2026
Recommended action: Review failed payment and update customer payment details.
```

### 12.2 Customer Account Summary

Show:

- Full name
- Email
- Phone
- Account status
- Created date
- Last updated date

Editable fields:

- First name
- Last name
- Email
- Phone

Non-editable fields:

- Customer status
- Created date
- Updated date
- Audit events
- Purchase records

### 12.3 Inline Account Editing

Account editing should happen inline.

Flow:

```txt
View mode → Edit → Fields become inputs → Changed fields highlight → Old vs new review → Save or Cancel
```

Requirements:

- Section background changes in edit mode.
- Changed fields are highlighted.
- Save button disabled until changes exist.
- Show old vs new values for changed fields.
- No optimistic updates.
- Wait for backend success before exiting edit mode.
- On failure, preserve entered values and show error.
- On success, create `ACCOUNT_UPDATED` audit event.

Validation:

- First name required.
- Last name required.
- Email required and valid.
- Phone required and phone-like.

### 12.4 Vehicles and Subscriptions

Show vehicles and subscriptions in readable cards.

Vehicle card fields:

- Year
- Make
- Model
- Color
- License plate
- Subscription coverage status

Vehicle actions:

- Add vehicle
- Edit vehicle

Do not hard-delete vehicles.

Vehicles stay on the profile for historical reasons.

If uncovered, show:

```txt
No active subscription coverage
```

Subscription card fields:

- Plan name
- Status
- Monthly price
- Cleaning tier
- Vehicle capacity
- Covered vehicles
- Start date
- Next billing date

Subscription actions:

- Add subscription
- Change plan
- Transfer coverage
- Cancel subscription
- Attach vehicle to eligible subscription

### 12.5 Purchase History

Purchase history is read-only.

Show:

- Purchase type
- Amount
- Status
- Date
- Related vehicle if applicable
- Description

Purchase types:

```txt
SINGLE_WASH
MEMBERSHIP_PAYMENT
COUPON_REDEMPTION
```

Purchase statuses:

```txt
PAID
FAILED
REFUNDED
```

The failed payment for the hero workflow must be visible here.

### 12.6 Failed Payment Review

Failed payments are read-only demo data.

The “Review failed payment” action can scroll/navigate to the failed payment in purchase history.

Do not implement real payment retry or payment method updates.

### 12.7 Support Notes

Support notes are add-only.

Each note includes:

- Note text
- Created date
- CSR name

Adding a support note creates a `SUPPORT_NOTE_ADDED` audit event.

Do not edit or delete support notes in the MVP.

### 12.8 Audit Timeline

Show account history in reverse chronological order.

Each audit item shows:

- Event type
- Message
- Actor name
- Actor type
- Date/time
- Metadata summary if useful

Audit events are append-only.

---

## 13. Subscription Plans

### 13.1 Plan Names

Use these plan names:

```txt
Essential Wash
Signature Wash
Family Unlimited
Family Unlimited Signature
```

### 13.2 Plan Rules

```txt
Essential Wash
- Max vehicles: 1
- Cleaning tier: Standard
- Monthly price: $19.99

Signature Wash
- Max vehicles: 1
- Cleaning tier: Premium
- Monthly price: $29.99

Family Unlimited
- Max vehicles: 4
- Cleaning tier: Standard
- Monthly price: $49.99

Family Unlimited Signature
- Max vehicles: 4
- Cleaning tier: Premium
- Monthly price: $69.99
```

Prices are mock data.

### 13.3 Subscription Relationship

A customer can have many vehicles.

A customer can have many subscriptions.

A subscription can cover one or more vehicles depending on plan capacity.

Use a join model:

```txt
SubscriptionVehicle
```

Rules:

- Essential Wash covers 1 vehicle.
- Signature Wash covers 1 vehicle.
- Family Unlimited covers up to 4 vehicles.
- Family Unlimited Signature covers up to 4 vehicles.
- A vehicle should have at most one active subscription coverage at a time.
- Historical coverage can be retained using `removedAt`.

Active coverage means:

```txt
SubscriptionVehicle.removedAt is null
```

### 13.4 Add Vehicle

CSRs can add a vehicle from customer profile.

Fields:

- Year
- Make
- Model
- Color
- License plate

After add:

- Persist vehicle.
- Show vehicle on profile.
- Create `VEHICLE_ADDED` audit event.
- CSR can attach or transfer subscription coverage if eligible.

### 13.5 Edit Vehicle

CSRs can edit:

- Year
- Make
- Model
- Color
- License plate

After edit:

- Persist changes.
- Create `VEHICLE_UPDATED` audit event.

### 13.6 Add Subscription

CSRs can add a new subscription to a customer.

Flow:

1. Choose plan.
2. Choose covered vehicle(s).
3. Validate vehicle count against plan max.
4. Confirm.
5. Create subscription.
6. Create active `SubscriptionVehicle` records.
7. Create `SUBSCRIPTION_ADDED` audit event.

### 13.7 Change Subscription Plan

CSRs can change a subscription from one plan to another.

Plan change flow:

1. CSR clicks “Change plan.”
2. CSR selects new plan.
3. UI shows old plan vs new plan.
4. UI validates vehicle capacity.
5. If downgrade reduces capacity, CSR/customer must choose which vehicle(s) remain covered.
6. CSR confirms.
7. Backend updates subscription plan.
8. Backend updates vehicle coverage if needed.
9. Backend creates `SUBSCRIPTION_PLAN_CHANGED` audit event.

Show review summary before save:

- Old plan
- New plan
- Old price
- New price
- Old max vehicles
- New max vehicles
- Vehicles kept covered
- Vehicles removed from coverage

Do not use optimistic updates.

### 13.8 Downgrade Vehicle Selection

If changing from multi-vehicle to single-vehicle plan, the app should not guess which vehicle remains covered.

The CSR must ask the customer.

The mock mobile companion can visually demonstrate the customer selecting which vehicle remains covered.

Example:

```txt
Current plan:
Family Unlimited Signature
Covers 3 vehicles

New plan:
Signature Wash
Covers 1 vehicle

Required customer decision:
Choose 1 vehicle to keep covered.
```

Vehicles not kept remain on the account but lose active coverage.

### 13.9 Transfer Subscription Coverage

Transfer means replacing one covered vehicle with another vehicle under the same subscription.

Rules:

- Source subscription belongs to selected customer.
- Destination vehicle belongs to same customer.
- Destination vehicle does not already have active coverage.
- Subscription is not cancelled.
- CSR confirms transfer.
- Old vehicle stays on profile.
- Create `SUBSCRIPTION_TRANSFERRED` audit event.

Example:

```txt
Before:
Family Unlimited covers:
- 2018 Ford F-150 · TGB9042
- 2021 Honda Civic · CZR4821

New vehicle:
- 2024 Ford F-150 · MQL6187

Transfer:
Remove TGB9042 from active coverage.
Add MQL6187 to active coverage.

After:
Family Unlimited covers:
- 2021 Honda Civic · CZR4821
- 2024 Ford F-150 · MQL6187

Old vehicle:
- 2018 Ford F-150 · TGB9042 · No active subscription coverage
```

### 13.10 Cancel Subscription

CSR can cancel a subscription.

Cancellation requires confirmation modal.

Optional cancellation reason.

After confirmation:

- Subscription status becomes `CANCELLED`.
- Active vehicle coverage is removed or marked inactive with `removedAt`.
- Vehicles remain on profile.
- Create `SUBSCRIPTION_CANCELLED` audit event.

Do not hard-delete subscription.

---

## 14. Status Rules

Customer and subscription statuses are not manually editable from generic edit forms.

CSR cannot directly set:

- Customer status
- Subscription status

The only CSR action that changes subscription status is cancellation.

Subscription status display values:

```txt
ACTIVE
OVERDUE
CANCELLED
PAUSED
```

Customer status display values:

```txt
ACTIVE
OVERDUE
CANCELLED
```

The critical warning banner should be computed from related data, not just `customer.status`.

Example critical issue logic:

```js
function getCustomerCriticalIssue(customer) {
  const overdueSubscription = customer.subscriptions.find(
    (subscription) => subscription.status === "OVERDUE"
  );

  const failedMembershipPayment = customer.purchases.find(
    (purchase) =>
      purchase.type === "MEMBERSHIP_PAYMENT" &&
      purchase.status === "FAILED"
  );

  if (overdueSubscription && failedMembershipPayment) {
    return {
      severity: "critical",
      title: "Unable to wash",
      message: "Subscription overdue because the latest membership payment failed.",
      rootCause: "FAILED_MEMBERSHIP_PAYMENT",
      affectedSubscriptionId: overdueSubscription.id,
      relatedPurchaseId: failedMembershipPayment.id,
      recommendedAction: "Review failed payment and update customer payment details."
    };
  }

  return null;
}
```

---

## 15. Audit Events

Create audit events for important activity.

### 15.1 Event Types

```txt
ACCOUNT_UPDATED
VEHICLE_ADDED
VEHICLE_UPDATED
SUBSCRIPTION_ADDED
SUBSCRIPTION_CANCELLED
SUBSCRIPTION_TRANSFERRED
SUBSCRIPTION_PLAN_CHANGED
SUPPORT_NOTE_ADDED
PAYMENT_FAILED
SUBSCRIPTION_OVERDUE
```

### 15.2 Fields

Each audit event includes:

- id
- customerId
- type
- message
- metadata
- actorName
- actorType
- createdAt

Actor types:

```txt
CSR
SYSTEM
```

CSR actor:

```txt
Bob Roberts
```

System actor:

```txt
AMP System
```

### 15.3 Metadata Examples

Account update:

```js
{
  "changedFields": {
    "email": {
      "old": "jordan.ellis@example.com",
      "new": "jordan.newemail@example.com"
    }
  }
}
```

Plan change:

```js
{
  "subscriptionId": "sub_123",
  "previousPlanName": "Family Unlimited Signature",
  "newPlanName": "Signature Wash",
  "previousMaxVehicles": 4,
  "newMaxVehicles": 1,
  "vehiclesKeptCovered": [
    {
      "vehicleId": "vehicle_123",
      "vehicleLabel": "2022 Toyota RAV4 · RJP5294"
    }
  ],
  "vehiclesRemovedFromCoverage": [
    {
      "vehicleId": "vehicle_456",
      "vehicleLabel": "2020 Honda Accord · KMD7138"
    }
  ]
}
```

Transfer:

```js
{
  "subscriptionId": "sub_123",
  "subscriptionPlan": "Family Unlimited",
  "fromVehicleId": "vehicle_old",
  "fromVehicleLabel": "2018 Ford F-150 · TGB9042",
  "toVehicleId": "vehicle_new",
  "toVehicleLabel": "2024 Ford F-150 · MQL6187"
}
```

---

## 16. Smart Help Search

Use Smart Help Search, not “chatbot,” in the MVP.

The feature should search seeded FAQ articles.

It should be available in:

- CSR portal helper panel
- Mock mobile companion

Use DB-seeded `FaqArticle` records.

Do not use a real LLM.

Use Fuse.js over FAQ title, question, answer, category, and keywords.

Example FAQ topics:

- Why can’t I get a wash?
- How do I update my payment method?
- Can I transfer my membership to a new vehicle?
- How do I cancel my membership?
- Where can I see recent purchases?
- How do coupons work?
- What happens if my subscription payment fails?
- How many vehicles can a family plan cover?

---

## 17. Mock Mobile Companion

Route:

```txt
/mobile
```

This is a demo companion, not a full app.

It should appear inside a phone frame.

Include:

- Smart Help Search
- “I can’t get a wash” FAQ result
- Plan downgrade vehicle selection demo

It does not need to write to the real database.

### 17.1 FAQ Demo

Customer searches:

```txt
Why can’t I get a wash?
```

Result explains:

- Membership may be overdue.
- Payment may have failed.
- Contact support or update payment method.

### 17.2 Downgrade Vehicle Selection Demo

Show a customer-facing selection screen:

```txt
Your new plan covers 1 vehicle.

Choose the vehicle you want to keep covered:
- 2022 Toyota RAV4 · RJP5294
- 2020 Honda Accord · KMD7138
- 2024 Subaru Outback · PDK8460
```

Confirmation:

```txt
You selected:
2022 Toyota RAV4 · RJP5294

The other vehicles will remain on your account but will no longer be covered by this subscription.
```

README should explain that a production version could sync this through a mobile app workflow, push notification, or confirmation link.

---

## 18. Presentation Route

Route:

```txt
/presentation
```

Required behavior:

- Full-screen slide layout
- Arrow key navigation
- Slide progress
- Framer Motion transitions
- Light-mode presentation style
- Live iframe of `/csr`
- Live iframe of `/mobile`
- AWS system design slide
- Tradeoffs/future work slide

### 18.1 Slide Outline

Use 10–12 slides:

1. Title: AMP CSR Command Center
2. Problem: CSRs need fast support workflows
3. Prompt requirements and MVP scope
4. Hero workflow: “I can’t get a wash”
5. Customer search experience
6. Customer profile and critical issue banner
7. Subscription and plan management
8. Smart Help Search and mock mobile companion
9. Data model
10. API design
11. AWS scale architecture
12. Tradeoffs and future work

### 18.2 Live Demo Slides

Include one slide with iframe:

```txt
/csr
```

Include one slide with iframe:

```txt
/mobile
```

Same-origin iframe is okay because all routes are in the same Next.js app.

---

## 19. AWS Scale Design

This is for presentation and README, not MVP deployment.

MVP deployment:

```txt
Vercel + Neon Postgres
```

Production AWS architecture:

```txt
CSRs
  ↓
Route 53
  ↓
CloudFront
  ↓
AWS WAF
  ↓
Application Load Balancer
  ↓
ECS Fargate running Next.js app/API
  ↓
RDS Postgres Multi-AZ
```

Supporting services:

```txt
Cognito             → CSR authentication and roles
Secrets Manager     → app secrets and DB credentials
CloudWatch          → logs, metrics, alarms
S3                  → assets, exports, log archives
SQS                 → async audit/event processing
Lambda              → background jobs
OpenSearch/pgvector → production semantic search
```

The presentation should clearly label this as the production-scale version, not what was built for the take-home.

---

## 20. Prisma Schema Direction

Use Prisma + Postgres.

Recommended schema:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum CustomerStatus {
  ACTIVE
  OVERDUE
  CANCELLED
}

enum SubscriptionStatus {
  ACTIVE
  OVERDUE
  CANCELLED
  PAUSED
}

enum PurchaseType {
  SINGLE_WASH
  MEMBERSHIP_PAYMENT
  COUPON_REDEMPTION
}

enum PurchaseStatus {
  PAID
  FAILED
  REFUNDED
}

enum AuditEventType {
  ACCOUNT_UPDATED
  VEHICLE_ADDED
  VEHICLE_UPDATED
  SUBSCRIPTION_ADDED
  SUBSCRIPTION_CANCELLED
  SUBSCRIPTION_TRANSFERRED
  SUBSCRIPTION_PLAN_CHANGED
  SUPPORT_NOTE_ADDED
  PAYMENT_FAILED
  SUBSCRIPTION_OVERDUE
}

enum ActorType {
  CSR
  SYSTEM
}

model Customer {
  id            String         @id @default(cuid())
  firstName     String
  lastName      String
  email         String         @unique
  phone         String
  status        CustomerStatus @default(ACTIVE)

  vehicles      Vehicle[]
  subscriptions Subscription[]
  purchases     Purchase[]
  supportNotes  SupportNote[]
  auditEvents   AuditEvent[]

  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model Vehicle {
  id                    String                @id @default(cuid())
  customerId            String

  year                  Int
  make                  String
  model                 String
  color                 String
  licensePlate          String                @unique

  customer              Customer              @relation(fields: [customerId], references: [id], onDelete: Cascade)
  subscriptionVehicles  SubscriptionVehicle[]
  purchases             Purchase[]

  createdAt             DateTime              @default(now())
  updatedAt             DateTime              @updatedAt

  @@index([customerId])
  @@index([licensePlate])
}

model SubscriptionPlan {
  id            String         @id @default(cuid())
  name          String         @unique
  description   String
  monthlyPrice  Decimal
  maxVehicles   Int
  cleaningTier  String

  subscriptions Subscription[]

  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model Subscription {
  id              String                @id @default(cuid())
  customerId      String
  planId          String

  status          SubscriptionStatus    @default(ACTIVE)
  startedAt       DateTime
  nextBillingDate DateTime?

  customer        Customer              @relation(fields: [customerId], references: [id], onDelete: Cascade)
  plan            SubscriptionPlan      @relation(fields: [planId], references: [id])
  vehicles        SubscriptionVehicle[]
  purchases       Purchase[]

  createdAt       DateTime              @default(now())
  updatedAt       DateTime              @updatedAt

  @@index([customerId])
  @@index([planId])
  @@index([status])
}

model SubscriptionVehicle {
  id              String        @id @default(cuid())
  subscriptionId  String
  vehicleId       String

  subscription    Subscription  @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  vehicle         Vehicle       @relation(fields: [vehicleId], references: [id], onDelete: Cascade)

  assignedAt      DateTime      @default(now())
  removedAt       DateTime?

  @@index([subscriptionId])
  @@index([vehicleId])
}

model Purchase {
  id              String         @id @default(cuid())
  customerId      String
  vehicleId       String?
  subscriptionId  String?

  type            PurchaseType
  status          PurchaseStatus
  amount          Decimal
  description     String
  purchasedAt     DateTime

  customer        Customer       @relation(fields: [customerId], references: [id], onDelete: Cascade)
  vehicle         Vehicle?       @relation(fields: [vehicleId], references: [id])
  subscription    Subscription?  @relation(fields: [subscriptionId], references: [id])

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  @@index([customerId])
  @@index([vehicleId])
  @@index([subscriptionId])
  @@index([status])
  @@index([type])
}

model SupportNote {
  id          String    @id @default(cuid())
  customerId  String

  note        String
  csrName     String

  customer    Customer  @relation(fields: [customerId], references: [id], onDelete: Cascade)

  createdAt   DateTime  @default(now())

  @@index([customerId])
}

model AuditEvent {
  id          String         @id @default(cuid())
  customerId  String

  type        AuditEventType
  message     String
  metadata    Json?
  actorName   String
  actorType   ActorType

  customer    Customer       @relation(fields: [customerId], references: [id], onDelete: Cascade)

  createdAt   DateTime       @default(now())

  @@index([customerId])
  @@index([type])
}

model FaqArticle {
  id          String   @id @default(cuid())

  title       String
  question    String
  answer      String
  category    String
  keywords    String

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category])
}
```

---

## 21. API Routes

Use Next.js route handlers.

Recommended API routes:

```txt
GET    /api/dashboard
GET    /api/customers
GET    /api/customers/search?q=
GET    /api/customers/[id]
PATCH  /api/customers/[id]
POST   /api/customers/[id]/vehicles
PATCH  /api/customers/[id]/vehicles/[vehicleId]
POST   /api/customers/[id]/subscriptions
PATCH  /api/customers/[id]/subscriptions/[subscriptionId]/plan
POST   /api/customers/[id]/subscriptions/[subscriptionId]/transfer
POST   /api/customers/[id]/subscriptions/[subscriptionId]/cancel
POST   /api/customers/[id]/support-notes
GET    /api/faq/search?q=
```

### 21.1 API Validation

Use Zod for mutation routes.

Validate:

- Account updates
- Vehicle creation/editing
- Subscription creation
- Plan changes
- Transfers
- Cancellation
- Support notes

### 21.2 API Response Style

Return clear JSON:

```js
{
  "data": {},
  "error": null
}
```

or:

```js
{
  "data": null,
  "error": "Human-readable error message"
}
```

---

## 22. Seed Data

Mock data is required for the MVP.

The evaluator should be able to run the app and immediately test all major workflows.

Create seed script:

```txt
npm run db:seed
```

Also include a reset/seed command if possible:

```txt
npm run db:reset
```

### 22.1 Required Plans

Seed:

- Essential Wash
- Signature Wash
- Family Unlimited
- Family Unlimited Signature

### 22.2 Required Customers

Seed at least five customers.

#### Customer 1: Hero Workflow Customer

Purpose:

Demonstrates “I can’t get a wash.”

Example:

```txt
Name: Alex Morgan
Email: jordan.ellis@example.com
Phone: 404-555-0181
Vehicle: 2021 Honda Civic, plate CZR4821
Subscription: Signature Wash or Family Unlimited, status OVERDUE
Failed payment: $39.99 membership payment
Root issue: FAILED_MEMBERSHIP_PAYMENT
```

Requirements:

- Warning banner appears.
- Purchase history includes failed membership payment.
- Audit timeline includes PAYMENT_FAILED and SUBSCRIPTION_OVERDUE.

#### Customer 2: Healthy Active Membership Customer

Purpose:

Normal profile with no warning banner.

Example:

```txt
Name: Priya Shah
Email: priya.shah@example.com
Phone: 678-555-0124
Vehicle 1: 2022 Toyota RAV4, plate RJP5294
Vehicle 2: 2020 Honda Accord, plate KMD7138
Subscription: Family Unlimited Signature, status ACTIVE
Recent purchases: paid membership payment and single wash
```

#### Customer 3: Transfer Subscription Customer

Purpose:

Vehicle transfer workflow.

Example:

```txt
Name: Marcus Reed
Email: marcus.reed@example.com
Phone: 770-555-0139
Old vehicle: 2018 Ford F-150, plate TGB9042
New vehicle: 2024 Ford F-150, plate MQL6187
Subscription: Essential Wash or Signature Wash, status ACTIVE
Demo action: transfer coverage to new vehicle
```

#### Customer 4: Recent Purchase Question Customer

Purpose:

Purchase history review.

Example:

```txt
Name: Alicia Brown
Email: alicia.brown@example.com
Phone: 470-555-0198
Vehicle: 2020 Nissan Altima, plate LXC2409
Purchases:
- Single wash, PAID
- Coupon redemption, PAID
- Single wash, REFUNDED
```

#### Customer 5: Cancellation Customer

Purpose:

Subscription cancellation workflow.

Example:

```txt
Name: Ethan Brooks
Email: ethan.brooks@example.com
Phone: 404-555-0155
Vehicle: 2019 Jeep Grand Cherokee, plate HNV6631
Subscription: Essential Wash, status ACTIVE
Demo action: cancel subscription
```

#### Customer 6: Plan Downgrade Customer

Purpose:

Plan change from multi-vehicle to single-vehicle.

Example:

```txt
Name: Sophia Nguyen
Email: sophia.nguyen@example.com
Phone: 678-555-0108
Vehicles:
- 2022 Toyota RAV4, plate RJP5294
- 2020 Honda Accord, plate KMD7138
- 2024 Subaru Outback, plate PDK8460
Subscription: Family Unlimited Signature, status ACTIVE, covers all 3
Demo action: downgrade to Signature Wash and choose 1 vehicle to keep covered
```

### 22.3 FAQ Seed Articles

Seed FAQ articles for:

- Can’t get a wash
- Failed membership payment
- Updating payment method
- Canceling membership
- Transferring membership to a new vehicle
- Plan changes
- Multi-vehicle plans
- Purchase/refund questions
- Coupon redemption

---

## 23. Build Order

Build in this order.

### Phase 1: Project Setup

- Create Next.js app with JavaScript.
- Install Tailwind.
- Install shadcn/ui dependencies.
- Install Prisma.
- Install Zod.
- Install Fuse.js.
- Install Framer Motion.
- Configure light/dark mode.
- Configure app shell.

### Phase 2: Database

- Create Prisma schema.
- Configure Neon/Postgres.
- Add seed script.
- Seed plans, customers, vehicles, subscriptions, purchases, support notes, audit events, FAQ articles.
- Verify DB works locally.

### Phase 3: API

Implement:

- Dashboard data API
- Customer list/search API
- Customer detail API
- Account update API
- Vehicle add/edit API
- Subscription add API
- Plan change API
- Transfer API
- Cancel API
- Support note API
- FAQ search API

### Phase 4: CSR Shell and Search

- Build CSR layout.
- Add mock CSR identity.
- Add theme toggle.
- Add global inline search.
- Build dedicated search page.
- Use customer result cards.

### Phase 5: Customer Profile

- Build customer profile layout.
- Add critical warning banner.
- Add account summary.
- Add inline account edit mode.
- Add vehicles/subscriptions section.
- Add purchase history.
- Add support notes.
- Add audit timeline.

### Phase 6: Subscription Workflows

- Add vehicle.
- Edit vehicle.
- Add subscription.
- Change plan.
- Handle downgrade vehicle selection.
- Transfer coverage.
- Cancel subscription.

### Phase 7: Smart Help and Mobile

- Build FAQ search.
- Add CSR Smart Help Search panel.
- Build `/mobile` phone-frame demo.
- Add FAQ and downgrade selection demo.

### Phase 8: Presentation

- Build `/presentation`.
- Add keyboard navigation.
- Add Framer Motion slide transitions.
- Add iframe slides for `/csr` and `/mobile`.
- Add AWS scale design slide.
- Add tradeoffs/future work slide.

### Phase 9: Polish

- Loading states.
- Empty states.
- Error states.
- Toasts.
- Form validation messages.
- Confirmation dialogs.
- README.
- Deployment.

---

## 24. Error, Loading, and Empty States

Include basic production-quality states.

Required:

- Loading skeleton for dashboard cards.
- Loading state for customer profile.
- Empty state for no search results.
- Empty state for no support notes.
- Empty state for no purchases.
- Toast after successful edits.
- Error message after failed save.
- Confirmation modal for cancellation.
- Disabled save button when no changes exist.
- Form validation messages.

---

## 25. README Requirements

README should include:

- Project summary
- Hero workflow
- Feature list
- Tech stack
- Data model overview
- API route list
- Local setup
- Seed data instructions
- Deployment link
- Presentation route
- AWS scale design
- Tradeoffs/future work

README should frame the project around the business problem, not just the tech.

---

## 26. Tradeoffs and Future Work

### MVP Tradeoffs

- Mock login instead of real auth.
- Smart Help Search instead of real LLM chatbot.
- No real payment processing.
- No proration/refund/tax calculations.
- No hard deletes.
- Mock mobile companion is visual/demo-only.
- AWS architecture is presented, not deployed.
- No 3D to preserve implementation focus.

### Future Work

- Real CSR authentication with Cognito/Auth.js.
- Role-based access.
- Payment method update and retry.
- Billing/proration engine.
- Operator-specific plan catalog.
- Real mobile app sync.
- Push confirmation for downgrade vehicle selection.
- Production semantic search with pgvector/OpenSearch.
- More robust audit export.
- Multi-site operator management.
- Advanced reporting/analytics.
- Tests for business rules.

---

## 27. Completion Criteria

The project is complete when an evaluator can:

- Open the deployed app.
- Navigate from landing page to CSR portal.
- Search for Alex or CZR4821.
- Open Alex’s profile.
- See the critical “Unable to wash” warning.
- Find the failed membership payment.
- Add a support note.
- See audit event created.
- Search Marcus and transfer subscription coverage.
- Search Ethan and cancel subscription.
- Search Alicia and review purchase history.
- Search Sophia and demo plan downgrade vehicle selection.
- Use Smart Help Search.
- View mock mobile companion.
- Open `/presentation`.
- Understand the AWS scale architecture slide.

---

## 28. Priority Rule

Prioritize feature completion over perfect animations.

Order of importance:

1. Working database and seed data
2. Working CSR search
3. Working customer profile
4. Working account edits
5. Working vehicle/subscription management
6. Working audit events
7. Working Smart Help Search
8. Working mock mobile companion
9. Working presentation
10. Framer Motion polish
