import { LoaderCircle } from "lucide-react";

export function CsrRouteLoading({ label = "Loading" }) {
  return (
    <div aria-live="polite" className="animate-pulse">
      <header className="rounded-3xl border border-border bg-card px-6 py-7 shadow-sm shadow-slate-200/70">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-muted text-primary">
            <LoaderCircle className="animate-spin" size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              {label}
            </p>
            <div className="mt-3 h-8 w-64 max-w-full rounded bg-surface-muted" />
          </div>
        </div>
        <div className="mt-5 h-5 w-full max-w-2xl rounded bg-surface-muted" />
      </header>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            className="min-h-[10.75rem] rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70"
            key={item}
          >
            <div className="h-12 w-12 rounded-2xl bg-surface-muted" />
            <div className="mt-8 h-6 w-28 rounded bg-surface-muted" />
            <div className="mt-3 h-4 w-36 rounded bg-surface-muted" />
          </div>
        ))}
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-slate-200/70">
        {[0, 1, 2].map((item) => (
          <div className="border-b border-border p-5 last:border-b-0" key={item}>
            <div className="h-5 w-48 rounded bg-surface-muted" />
            <div className="mt-3 h-4 w-full max-w-2xl rounded bg-surface-muted" />
          </div>
        ))}
      </section>
    </div>
  );
}
