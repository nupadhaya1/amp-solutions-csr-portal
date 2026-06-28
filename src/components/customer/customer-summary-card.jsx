"use client";

import { useRef } from "react";
import { CalendarDays, Copy, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

import { Badge, Card, CardContent, CardHeader, CardTitle } from "./customer-ui.jsx";

function MetaItem({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-2xl bg-surface px-3 py-2.5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
        <Icon aria-hidden="true" className="shrink-0" size={14} />
        <span className="min-w-0 break-words">{label}</span>
      </div>
      <p className="mt-1.5 min-w-0 break-words text-sm font-medium leading-snug text-foreground [overflow-wrap:anywhere]">
        {value}
      </p>
    </div>
  );
}

export function CustomerSummaryCard({ backHref, customer }) {
  const memberIdRef = useRef(null);

  async function handleCopy() {
    await navigator.clipboard.writeText(customer.memberId);
    toast.success("Member ID copied");
  }

  function selectMemberId() {
    const node = memberIdRef.current;
    if (!node) return;

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  return (
    <Card className="h-full">
      <CardHeader className="border-b-0 pb-0">
        {backHref ? (
          <a className="mb-2 inline-flex text-sm font-semibold text-muted transition hover:text-primary" href={backHref}>
            Back to customer search
          </a>
        ) : null}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Customer profile</p>
            <CardTitle className="mt-1.5 break-words text-2xl sm:text-3xl">{customer.fullName}</CardTitle>
            <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5 text-sm text-muted">
              <span>Member ID:</span>
              <span
                className="min-w-0 cursor-text select-all break-all rounded px-0.5 font-semibold text-foreground transition hover:bg-primary/10 hover:underline"
                onMouseEnter={selectMemberId}
                ref={memberIdRef}
              >
                {customer.memberId}
              </span>
              <button
                aria-label="Copy member ID"
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={handleCopy}
                type="button"
              >
                <Copy aria-hidden="true" className="text-primary" size={15} />
                <span className="sr-only">Copy member ID</span>
              </button>
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
      <CardContent className="pt-3">
        <div className="grid min-w-0 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          <MetaItem icon={Mail} label="Email" value={customer.email} />
          <MetaItem icon={Phone} label="Phone" value={customer.phone} />
          <MetaItem icon={MapPin} label="Home wash location" value={customer.homeWashLocation} />
          <MetaItem icon={CalendarDays} label="Join date" value={customer.joinedAt} />
        </div>
      </CardContent>
    </Card>
  );
}
