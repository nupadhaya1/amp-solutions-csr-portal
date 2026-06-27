"use client";

import { Badge, DialogShell } from "../customer-ui.jsx";

export function AllNotesDialog({ notes, onOpenChange, open }) {
  return (
    <DialogShell
      description="Full support note history for this customer."
      onOpenChange={onOpenChange}
      open={open}
      title="All support notes"
      widthClass="sm:max-w-2xl"
    >
      <div className="grid gap-3">
        {notes.map((note) => (
          <article className="rounded-2xl bg-surface p-4" key={note.id}>
            <Badge tone="info">{note.tag}</Badge>
            <p className="mt-3 text-sm text-foreground">{note.text}</p>
            <p className="mt-3 text-xs text-muted">
              {note.author} · {note.createdAt}
            </p>
          </article>
        ))}
      </div>
    </DialogShell>
  );
}
