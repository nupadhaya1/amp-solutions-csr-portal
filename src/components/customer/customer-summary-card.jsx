"use client";

import { Copy, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "./customer-ui.jsx";

function MetaItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-surface px-3 py-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
        <Icon aria-hidden="true" size={14} />
        <span>{label}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export function CustomerSummaryCard({ backHref, customer }) {
  async function handleCopy() {
    await navigator.clipboard.writeText(customer.memberId);
    toast.success("Member ID copied");
  }

  return (
    <Card className="h-full">
      <CardHeader className="border-b-0 pb-0">
        {backHref ? (
          <a className="mb-3 inline-flex text-sm font-semibold text-muted transition hover:text-primary" href={backHref}>
            Back to results
          </a>
        ) : null}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Customer profile</p>
            <CardTitle className="mt-2 text-2xl sm:text-3xl">{customer.fullName}</CardTitle>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
              <span>Member ID: {customer.memberId}</span>
              <Button className="h-8 px-3" onClick={handleCopy} tone="secondary" type="button">
                <Copy aria-hidden="true" className="mr-2" size={14} />
                Copy
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={customer.status === "OVERDUE" ? "critical" : customer.status === "ACTIVE" ? "success" : "warning"}>
              {customer.status}
            </Badge>
            {customer.planTags.map((tag) => (
              <Badge key={tag} tone="info">
                {tag}
              </Badge>
            ))}
            <Badge tone={customer.billing.badgeTone}>{customer.billing.paymentStatus === "OVERDUE" ? "Payment overdue" : "Payment current"}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetaItem icon={Mail} label="Email" value={customer.email} />
          <MetaItem icon={Phone} label="Phone" value={customer.phone} />
          <MetaItem icon={MapPin} label="Home wash location" value={customer.homeWashLocation} />
          <MetaItem icon={MapPin} label="Join date" value={customer.joinedAt} />
        </div>
      </CardContent>
    </Card>
  );
}
