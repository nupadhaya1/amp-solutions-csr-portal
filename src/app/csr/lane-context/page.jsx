import { LaneContextWorkspace } from "@/components/lane-context-workspace";
import { MotionPanel } from "@/components/motion-panel";
import { listActiveLaneSessions } from "@/lib/data/lane-sessions";

function serializeLaneSession(session) {
  return {
    id: session.id,
    customerId: session.customerId,
    vehicleId: session.vehicleId,
    locationName: session.locationName,
    laneName: session.laneName,
    status: session.status,
    detectedPlate: session.detectedPlate,
    detectedAt: session.detectedAt?.toISOString?.() || session.detectedAt,
    confidence: session.confidence,
    issueCode: session.issueCode,
    issueSeverity: session.issueSeverity,
    resolvedAt: session.resolvedAt?.toISOString?.() || session.resolvedAt,
    customer: session.customer
      ? {
          id: session.customer.id,
          firstName: session.customer.firstName,
          lastName: session.customer.lastName,
          email: session.customer.email,
        }
      : null,
    vehicle: session.vehicle
      ? {
          id: session.vehicle.id,
          year: session.vehicle.year,
          make: session.vehicle.make,
          model: session.vehicle.model,
          licensePlate: session.vehicle.licensePlate,
        }
      : null,
  };
}

export default async function LaneContextPage({ searchParams }) {
  const params = await searchParams;
  const sessions = await listActiveLaneSessions();

  return (
    <MotionPanel>
      <LaneContextWorkspace
        initialCustomerId={String(params?.customerId || "")}
        initialFilter={String(params?.filter || "all")}
        initialPlate={String(params?.plate || "").trim()}
        sessions={sessions.map(serializeLaneSession)}
      />
    </MotionPanel>
  );
}
