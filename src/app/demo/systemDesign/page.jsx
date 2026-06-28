import Link from "next/link";
import { ArrowRight } from "lucide-react";

const sections = [
  ["Product goal", "Help CSRs find a member, understand the blocker, fix the issue, and leave an audit trail."],
  ["App architecture", "Next.js App Router, server actions, domain view models, Prisma, and Postgres/Neon."],
  ["Core workflows", "Failed payment recovery, vehicle coverage transfer, purchase review, plan changes, and cancellation."],
  ["Knowledge base", "Markdown support playbooks with local embeddings, pgvector ranking, and keyword fallback."],
  ["Production path", "The same boundaries map cleanly to CloudFront, WAF, ECS Fargate, RDS, Secrets Manager, and CloudWatch."],
];

export const metadata = {
  title: "AMP CSR System Design",
  description: "System design overview for the AMP CSR Command Center take-home project.",
};

export default function DemoSystemDesignPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto grid w-full max-w-6xl gap-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">System design</p>
          <h1 className="mt-3 max-w-4xl text-5xl font-semibold tracking-tight">
            AMP CSR Command Center architecture overview
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
            A practical readout of how the take-home covers the CSR workflow, persistence model,
            support documentation, and production deployment path.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {sections.map(([title, body]) => (
            <article className="rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70" key={title}>
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-muted">{body}</p>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
            href="/csr/docs/project-overview"
          >
            Open full docs
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-muted hover:text-foreground"
            href="/demo/presentation"
          >
            Open presentation
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
