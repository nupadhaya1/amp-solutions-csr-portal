"use client";

import { Button, Card, CardContent, CardHeader, CardTitle } from "./customer-ui.jsx";

function TimelineItem({ event }) {
  return (
    <div className="grid grid-cols-[20px_1fr] gap-3">
      <div className="flex flex-col items-center">
        <span className="mt-1 h-3 w-3 rounded-full bg-primary" />
        <span className="mt-2 h-full w-px bg-border" />
      </div>
      <div className="pb-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">{event.title}</p>
          <p className="text-xs text-muted">{event.relativeTime}</p>
        </div>
        <p className="mt-1 text-xs text-muted">
          {event.actorName} · {event.createdAt}
        </p>
        <p className="mt-2 text-sm text-foreground">{event.message}</p>
        {event.detail ? <p className="mt-2 text-sm text-muted">{event.detail}</p> : null}
      </div>
    </div>
  );
}

export function RecentActivityTimeline({ events, onViewAll }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Recent activity</CardTitle>
          <Button onClick={onViewAll} tone="ghost" type="button">
            View all activity
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted">No audit activity yet.</p>
        ) : (
          <div className="space-y-0">
            {events.map((event, index) => (
              <div key={event.id} className={index === events.length - 1 ? "[&_span:last-child]:hidden" : ""}>
                <TimelineItem event={event} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
