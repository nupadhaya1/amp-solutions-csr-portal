import { Alert, Badge, Card, CardContent, CardHeader, CardTitle, Separator } from "./customer-ui.jsx";
import { VehicleSilhouette } from "./vehicle-silhouette.jsx";

export function VehicleSubscriptionCard({ customer }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active vehicles &amp; subscriptions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {customer.vehiclesWithSubscriptions.map((vehicle, index) => (
          <div key={vehicle.id}>
            <div className="flex flex-col gap-4 rounded-3xl bg-surface p-4 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-4">
                <VehicleSilhouette color={vehicle.colorHex} />
                <div>
                  <p className="text-base font-semibold text-foreground">{vehicle.label}</p>
                  <p className="mt-1 text-sm text-muted">
                    {vehicle.colorLabel} · Plate {vehicle.licensePlate}
                  </p>
                  <p className="mt-3 text-sm font-medium text-foreground">{vehicle.planName}</p>
                  <p className="mt-1 text-sm text-muted">{vehicle.coverageLabel}</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Badge tone={vehicle.status === "ACTIVE" ? "success" : vehicle.status === "OVERDUE" ? "critical" : "warning"}>
                  {vehicle.status}
                </Badge>
              </div>
            </div>
            {!vehicle.canWash && vehicle.status !== "UNASSIGNED" ? (
              <Alert className="mt-3" tone={vehicle.status === "OVERDUE" ? "critical" : "warning"}>
                This vehicle is not currently eligible to wash. Resolve the subscription status before sending the customer back through the gate.
              </Alert>
            ) : null}
            {index < customer.vehiclesWithSubscriptions.length - 1 ? <Separator className="mt-4" /> : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
