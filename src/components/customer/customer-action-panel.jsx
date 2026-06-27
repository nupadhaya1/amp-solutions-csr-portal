import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "./customer-ui.jsx";

function ActionButton({ disabled, label, onClick, reason }) {
  return (
    <Button
      className="w-full justify-start"
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

export function CustomerActionPanel({ customer, onAction }) {
  const { actionAvailability } = customer;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Quick actions</CardTitle>
          <Badge tone="brand" className="bg-primary text-primary-foreground">
            CSR workflow
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        <ActionButton label="Edit account" onClick={() => onAction("edit-account")} />
        <ActionButton
          disabled={!actionAvailability.canAddVehicle}
          label="Add vehicle"
          onClick={() => onAction("add-vehicle")}
          reason={actionAvailability.disabledReasons.addVehicle}
        />
        <ActionButton
          disabled={!actionAvailability.canChangePlan}
          label="Change plan"
          onClick={() => onAction("change-plan")}
          reason={actionAvailability.disabledReasons.changePlan}
        />
        <ActionButton
          disabled={!actionAvailability.canTransferVehicle}
          label="Transfer vehicle"
          onClick={() => onAction("transfer-vehicle")}
          reason={actionAvailability.disabledReasons.transferVehicle}
        />
        <ActionButton
          disabled={!actionAvailability.canCancelMembership}
          label="Cancel membership"
          onClick={() => onAction("cancel-membership")}
          reason={actionAvailability.disabledReasons.cancelMembership}
        />
      </CardContent>
    </Card>
  );
}
