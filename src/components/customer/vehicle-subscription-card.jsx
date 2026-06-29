import { Alert, Badge, Button, Card, CardContent, CardHeader, CardTitle, Separator } from "./customer-ui.jsx";
import { VehicleSilhouette } from "./vehicle-silhouette.jsx";

function HeaderAction({ disabled, label, onClick, reason }) {
  return (
    <Button
      className="min-h-9 px-3 text-xs"
      disabled={disabled}
      onClick={onClick}
      title={disabled ? reason : label}
      tone="secondary"
      type="button"
    >
      {label}
    </Button>
  );
}

export function VehicleSubscriptionCard({ customer, onAction }) {
  const { actionAvailability } = customer;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle>Active vehicles &amp; subscriptions</CardTitle>
          <div className="flex flex-wrap gap-2">
            <HeaderAction
              disabled={!actionAvailability.canAddVehicle}
              label="Add vehicle"
              onClick={() => onAction("add-vehicle")}
              reason={actionAvailability.disabledReasons.addVehicle}
            />
            <HeaderAction
              disabled={!actionAvailability.canAssignVehicleToPlan}
              label="Assign vehicle"
              onClick={() => onAction("assign-vehicle")}
              reason={actionAvailability.disabledReasons.assignVehicleToPlan}
            />
            <HeaderAction
              disabled={!actionAvailability.canTransferVehicle}
              label="Transfer vehicle"
              onClick={() => onAction("transfer-vehicle")}
              reason={actionAvailability.disabledReasons.transferVehicle}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {customer.vehiclesWithSubscriptions.map((vehicle, index) => {
          const isWhiteVehicle = String(vehicle.colorLabel || "").toLowerCase() === "white";

          return (
            <div key={vehicle.id}>
              <div className={`flex flex-col gap-4 rounded-3xl p-4 md:flex-row md:items-start md:justify-between ${
                isWhiteVehicle ? "bg-slate-200" : "bg-surface"
              }`}>
                <div className="flex gap-4">
                  <span className="p-2">
                    <VehicleSilhouette color={vehicle.colorHex} />
                  </span>
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
          );
        })}
      </CardContent>
    </Card>
  );
}
