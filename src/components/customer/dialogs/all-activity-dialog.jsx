"use client";

import { DialogShell } from "../customer-ui.jsx";

export function AllActivityDialog({ events, onOpenChange, open }) {
  return (
    <DialogShell
      description="Full audit log for this customer."
      onOpenChange={onOpenChange}
      open={open}
      title="All activity"
      widthClass="sm:max-w-2xl"
    >
      <div className="grid gap-3">
        {events.map((event) => (
          <article className="rounded-2xl bg-surface p-4" key={event.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{event.title}</p>
                <p className="mt-1 text-xs text-muted">
                  {event.actorName} · {event.createdAt}
                </p>
              </div>
              <p className="text-xs text-muted">{event.relativeTime}</p>
            </div>
            <p className="mt-3 text-sm text-foreground">{event.message}</p>
            {event.detail ? <p className="mt-2 text-sm text-muted">{event.detail}</p> : null}
          </article>
        ))}
      </div>
    </DialogShell>
  );
}
