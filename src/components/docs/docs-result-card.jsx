import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";

function severityClass(severity) {
  if (severity === "Critical") return "border-critical/30 bg-critical-background text-critical";
  if (severity === "High") return "border-warning/30 bg-warning-background text-warning";
  if (severity === "Low") return "border-border bg-surface-muted text-muted";
  return "border-primary/20 bg-surface text-primary";
}

export function DocsResultCard({ result }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${severityClass(result.severity)}`}>
              {result.severity}
            </span>
            <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-primary">
              {result.category}
            </span>
            <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted">
              {result.matchType}
            </span>
          </div>
          <h2 className="mt-3 text-lg font-semibold tracking-tight">{result.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{result.snippet || result.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(result.tags || []).slice(0, 4).map((tag) => (
              <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold text-muted" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 flex-row items-center justify-between gap-3 sm:flex-col sm:items-end">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm font-semibold text-muted">
            <BadgeCheck size={15} aria-hidden="true" />
            {(Number(result.score || 0) * 100).toFixed(0)}%
          </span>
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:-translate-y-0.5"
            href={`/csr/docs/${result.slug}`}
          >
            Open article
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
      {result.heading ? (
        <p className="mt-4 border-t border-border pt-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Matched section: {result.heading}
        </p>
      ) : null}
    </article>
  );
}
