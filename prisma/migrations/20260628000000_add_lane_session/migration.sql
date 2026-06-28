CREATE TABLE "LaneSession" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "vehicleId" TEXT,
    "locationName" TEXT NOT NULL,
    "laneName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "detectedPlate" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL,
    "confidence" DOUBLE PRECISION,
    "issueCode" TEXT NOT NULL DEFAULT 'NONE',
    "issueSeverity" TEXT NOT NULL DEFAULT 'NONE',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaneSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LaneSession_customerId_idx" ON "LaneSession"("customerId");
CREATE INDEX "LaneSession_vehicleId_idx" ON "LaneSession"("vehicleId");
CREATE INDEX "LaneSession_status_idx" ON "LaneSession"("status");
CREATE INDEX "LaneSession_issueCode_idx" ON "LaneSession"("issueCode");
CREATE INDEX "LaneSession_detectedPlate_idx" ON "LaneSession"("detectedPlate");

ALTER TABLE "LaneSession" ADD CONSTRAINT "LaneSession_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LaneSession" ADD CONSTRAINT "LaneSession_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "LaneSession" (
    "id",
    "customerId",
    "vehicleId",
    "locationName",
    "laneName",
    "status",
    "detectedPlate",
    "detectedAt",
    "confidence",
    "issueCode",
    "issueSeverity",
    "createdAt",
    "updatedAt"
)
SELECT
    'lane_session_failed_payment_gate',
    c."id",
    v."id",
    'AMP Buckhead',
    'Lane 2',
    'BLOCKED',
    'CZR4821',
    NOW() - INTERVAL '2 minutes',
    0.98,
    'FAILED_PAYMENT',
    'BLOCKING',
    NOW(),
    NOW()
FROM "Customer" c
JOIN "Vehicle" v ON v."customerId" = c."id" AND v."licensePlate" = 'CZR4821'
WHERE c."email" = 'alex.morgan@cedarbrookmail.test'
ON CONFLICT ("id") DO UPDATE SET
    "customerId" = EXCLUDED."customerId",
    "vehicleId" = EXCLUDED."vehicleId",
    "locationName" = EXCLUDED."locationName",
    "laneName" = EXCLUDED."laneName",
    "status" = EXCLUDED."status",
    "detectedPlate" = EXCLUDED."detectedPlate",
    "detectedAt" = EXCLUDED."detectedAt",
    "confidence" = EXCLUDED."confidence",
    "issueCode" = EXCLUDED."issueCode",
    "issueSeverity" = EXCLUDED."issueSeverity",
    "resolvedAt" = NULL,
    "updatedAt" = NOW();

INSERT INTO "LaneSession" (
    "id",
    "customerId",
    "vehicleId",
    "locationName",
    "laneName",
    "status",
    "detectedPlate",
    "detectedAt",
    "confidence",
    "issueCode",
    "issueSeverity",
    "createdAt",
    "updatedAt"
)
SELECT
    'lane_session_clean_queue',
    c."id",
    v."id",
    'AMP Midtown',
    'Lane 1',
    'IN_QUEUE',
    'RJP5294',
    NOW() - INTERVAL '5 minutes',
    0.96,
    'NONE',
    'NONE',
    NOW(),
    NOW()
FROM "Customer" c
JOIN "Vehicle" v ON v."customerId" = c."id" AND v."licensePlate" = 'RJP5294'
WHERE c."email" = 'priya.shah@cedarbrookmail.test'
ON CONFLICT ("id") DO UPDATE SET
    "customerId" = EXCLUDED."customerId",
    "vehicleId" = EXCLUDED."vehicleId",
    "locationName" = EXCLUDED."locationName",
    "laneName" = EXCLUDED."laneName",
    "status" = EXCLUDED."status",
    "detectedPlate" = EXCLUDED."detectedPlate",
    "detectedAt" = EXCLUDED."detectedAt",
    "confidence" = EXCLUDED."confidence",
    "issueCode" = EXCLUDED."issueCode",
    "issueSeverity" = EXCLUDED."issueSeverity",
    "resolvedAt" = NULL,
    "updatedAt" = NOW();

INSERT INTO "LaneSession" (
    "id",
    "customerId",
    "vehicleId",
    "locationName",
    "laneName",
    "status",
    "detectedPlate",
    "detectedAt",
    "confidence",
    "issueCode",
    "issueSeverity",
    "createdAt",
    "updatedAt"
)
SELECT
    'lane_session_plate_mismatch',
    c."id",
    v."id",
    'AMP Roswell Tunnel',
    'Lane 3',
    'AT_GATE',
    'MQL6187',
    NOW() - INTERVAL '1 minute',
    0.91,
    'PLATE_MISMATCH',
    'WARNING',
    NOW(),
    NOW()
FROM "Customer" c
JOIN "Vehicle" v ON v."customerId" = c."id" AND v."licensePlate" = 'TGB9042'
WHERE c."email" = 'marcus.reed@cedarbrookmail.test'
ON CONFLICT ("id") DO UPDATE SET
    "customerId" = EXCLUDED."customerId",
    "vehicleId" = EXCLUDED."vehicleId",
    "locationName" = EXCLUDED."locationName",
    "laneName" = EXCLUDED."laneName",
    "status" = EXCLUDED."status",
    "detectedPlate" = EXCLUDED."detectedPlate",
    "detectedAt" = EXCLUDED."detectedAt",
    "confidence" = EXCLUDED."confidence",
    "issueCode" = EXCLUDED."issueCode",
    "issueSeverity" = EXCLUDED."issueSeverity",
    "resolvedAt" = NULL,
    "updatedAt" = NOW();
