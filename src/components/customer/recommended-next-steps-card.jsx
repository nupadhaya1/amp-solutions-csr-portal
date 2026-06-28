import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "./customer-ui.jsx";

const priorityTone = {
  critical: "critical",
  medium: "warning",
  low: "info",
  normal: "default",
};

const actionLabels = {
  "update-payment": "Update payment",
  "add-note": "Add support note",
  "open-billing-docs": "Open CSR docs",
  "transfer-vehicle": "Transfer vehicle",
  "add-vehicle": "Add vehicle",
  "change-plan": "Change plan",
};

export function RecommendedNextStepsCard({ nextStep, onAction }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Recommended next steps</CardTitle>
          <Badge tone={priorityTone[nextStep.priority]}>{nextStep.priority}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-base font-semibold text-foreground">{nextStep.title}</p>
          <p className="mt-2 text-sm text-muted">{nextStep.reason}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Suggested flow</p>
          <ol className="mt-3 grid gap-2 text-sm text-foreground">
            {nextStep.suggestedFlow.map((step, index) => (
              <li className="grid grid-cols-[1.25rem_1fr] gap-2" key={step}>
                <span className="font-semibold text-primary">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-wrap gap-3">
          {nextStep.actions.map((action) => {
            const docsAction = action === "open-billing-docs";
            if (docsAction && nextStep.docsHref) {
              return (
                <Button asChild key={action} tone="secondary">
                  <a href={nextStep.docsHref} rel="noopener noreferrer" target="_blank">
                    {actionLabels[action]}
                  </a>
                </Button>
              );
            }

            const disabled = docsAction;
            return (
              <Button
                disabled={disabled}
                key={action}
                onClick={() => onAction(action)}
                title={disabled ? "No matching CSR doc was found." : actionLabels[action]}
                tone={action === "update-payment" ? "primary" : "secondary"}
                type="button"
              >
                {actionLabels[action]}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
