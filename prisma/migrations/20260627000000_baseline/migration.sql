-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'OVERDUE', 'CANCELLED', 'PAUSED');

-- CreateEnum
CREATE TYPE "PurchaseType" AS ENUM ('SINGLE_WASH', 'MEMBERSHIP_PAYMENT', 'COUPON_REDEMPTION');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "AuditEventType" AS ENUM ('ACCOUNT_UPDATED', 'VEHICLE_ADDED', 'VEHICLE_UPDATED', 'SUBSCRIPTION_ADDED', 'SUBSCRIPTION_CANCELLED', 'SUBSCRIPTION_TRANSFERRED', 'SUBSCRIPTION_PLAN_CHANGED', 'SUPPORT_NOTE_ADDED', 'PAYMENT_FAILED', 'SUBSCRIPTION_OVERDUE');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('CSR', 'SYSTEM');

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "homeWashLocation" TEXT NOT NULL DEFAULT 'AMP Buckhead',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "monthlyPrice" DECIMAL(65,30) NOT NULL,
    "maxVehicles" INTEGER NOT NULL,
    "cleaningTier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL,
    "nextBillingDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionVehicle" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),

    CONSTRAINT "SubscriptionVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "subscriptionId" TEXT,
    "type" "PurchaseType" NOT NULL,
    "status" "PurchaseStatus" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "description" TEXT NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportNote" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "csrName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" "AuditEventType" NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "actorName" TEXT NOT NULL,
    "actorType" "ActorType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqArticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaqArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportDoc" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "customerPhrases" TEXT NOT NULL DEFAULT '[]',
    "summary" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'docs/csr',
    "version" INTEGER NOT NULL DEFAULT 1,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportDoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportDocChunk" (
    "id" TEXT NOT NULL,
    "docId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "heading" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tokenCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportDocChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_memberId_key" ON "Customer"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_licensePlate_key" ON "Vehicle"("licensePlate");

-- CreateIndex
CREATE INDEX "Vehicle_customerId_idx" ON "Vehicle"("customerId");

-- CreateIndex
CREATE INDEX "Vehicle_licensePlate_idx" ON "Vehicle"("licensePlate");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_name_key" ON "SubscriptionPlan"("name");

-- CreateIndex
CREATE INDEX "Subscription_customerId_idx" ON "Subscription"("customerId");

-- CreateIndex
CREATE INDEX "Subscription_planId_idx" ON "Subscription"("planId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "SubscriptionVehicle_subscriptionId_idx" ON "SubscriptionVehicle"("subscriptionId");

-- CreateIndex
CREATE INDEX "SubscriptionVehicle_vehicleId_idx" ON "SubscriptionVehicle"("vehicleId");

-- CreateIndex
CREATE INDEX "Purchase_customerId_idx" ON "Purchase"("customerId");

-- CreateIndex
CREATE INDEX "Purchase_vehicleId_idx" ON "Purchase"("vehicleId");

-- CreateIndex
CREATE INDEX "Purchase_subscriptionId_idx" ON "Purchase"("subscriptionId");

-- CreateIndex
CREATE INDEX "Purchase_status_idx" ON "Purchase"("status");

-- CreateIndex
CREATE INDEX "Purchase_type_idx" ON "Purchase"("type");

-- CreateIndex
CREATE INDEX "SupportNote_customerId_idx" ON "SupportNote"("customerId");

-- CreateIndex
CREATE INDEX "AuditEvent_customerId_idx" ON "AuditEvent"("customerId");

-- CreateIndex
CREATE INDEX "AuditEvent_type_idx" ON "AuditEvent"("type");

-- CreateIndex
CREATE INDEX "FaqArticle_category_idx" ON "FaqArticle"("category");

-- CreateIndex
CREATE UNIQUE INDEX "SupportDoc_slug_key" ON "SupportDoc"("slug");

-- CreateIndex
CREATE INDEX "SupportDoc_category_idx" ON "SupportDoc"("category");

-- CreateIndex
CREATE INDEX "SupportDoc_severity_idx" ON "SupportDoc"("severity");

-- CreateIndex
CREATE INDEX "SupportDoc_isPublished_idx" ON "SupportDoc"("isPublished");

-- CreateIndex
CREATE INDEX "SupportDocChunk_docId_idx" ON "SupportDocChunk"("docId");

-- CreateIndex
CREATE UNIQUE INDEX "SupportDocChunk_docId_chunkIndex_key" ON "SupportDocChunk"("docId", "chunkIndex");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionVehicle" ADD CONSTRAINT "SubscriptionVehicle_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionVehicle" ADD CONSTRAINT "SubscriptionVehicle_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportNote" ADD CONSTRAINT "SupportNote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportDocChunk" ADD CONSTRAINT "SupportDocChunk_docId_fkey" FOREIGN KEY ("docId") REFERENCES "SupportDoc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

