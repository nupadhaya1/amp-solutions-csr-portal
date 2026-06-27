import { Badge, Button, Card, CardContent, CardHeader, CardTitle, DialogShell, Textarea } from "./customer-ui.jsx";

export function SupportNotesCard({
  customerId,
  notes,
  addSupportNoteAction,
  noteDialogOpen,
  onNoteDialogChange,
  onViewAll,
}) {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Support notes</CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => onNoteDialogChange(true)} tone="secondary" type="button">
                Add note
              </Button>
              <Button onClick={onViewAll} tone="ghost" type="button">
                View all notes
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {notes.length === 0 ? (
            <p className="text-sm text-muted">No support notes yet.</p>
          ) : (
            notes.map((note) => (
              <article className="rounded-2xl bg-surface p-4" key={note.id}>
                <Badge tone="info">{note.tag}</Badge>
                <p className="mt-3 text-sm text-foreground">{note.text}</p>
                <p className="mt-3 text-xs text-muted">
                  {note.author} · {note.createdAt}
                </p>
              </article>
            ))
          )}
        </CardContent>
      </Card>

      <DialogShell
        description="Document the latest support interaction so the next CSR has context."
        onOpenChange={onNoteDialogChange}
        open={noteDialogOpen}
        title="Add support note"
      >
        <form action={addSupportNoteAction} className="grid gap-4">
          <input name="customerId" type="hidden" value={customerId} />
          <Textarea name="note" placeholder="Summarize the customer issue, action taken, and any promised follow-up." />
          <div className="flex justify-end">
            <Button type="submit">Save note</Button>
          </div>
        </form>
      </DialogShell>
    </>
  );
}
