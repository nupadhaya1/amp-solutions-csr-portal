import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  Cloud,
  Database,
  Search,
  ShieldAlert,
  Smartphone,
  UserRound,
} from "lucide-react";

const slides = [
  {
    eyebrow: "Problem",
    title: "CSRs need the full customer context in one support workspace.",
    body: "The portal brings caller details, vehicles, subscriptions, payments, notes, and audit history into one screen so blocked-wash issues can be diagnosed quickly.",
    icon: UserRound,
  },
  {
    eyebrow: "Hero workflow",
    title: "A customer says they cannot get a wash.",
    body: "The CSR searches by caller details or plate, opens the profile, sees the critical banner, confirms the failed membership payment, and records the support action.",
    icon: ShieldAlert,
  },
  {
    eyebrow: "Core implementation",
    title: "Search, profile, mutations, and audit trail are backed by persisted data.",
    body: "Next.js server routes and server actions use Prisma with Postgres models for customers, vehicles, subscriptions, purchase history, support notes, and audit events.",
    icon: Database,
  },
  {
    eyebrow: "Support speed",
    title: "Smart Help Search keeps policy answers close to the CSR workflow.",
    body: "Seeded FAQ articles are searched with Fuse.js for topics like failed payments, cancellations, transfers, plan changes, purchases, refunds, and coupon redemptions.",
    icon: Search,
  },
  {
    eyebrow: "Scale path",
    title: "The MVP can evolve toward a cloud-native AMP support platform.",
    body: "A production AWS version could use Cognito, ECS or Lambda, RDS Postgres, OpenSearch, SQS, EventBridge, CloudWatch, and S3 for reporting exports.",
    icon: Cloud,
  },
  {
    eyebrow: "Demo companion",
    title: "The mobile companion shows the customer-side story without expanding scope.",
    body: "It helps reviewers understand how subscription status, vehicle coverage, and help content could appear to customers while the CSR portal stays the primary product.",
    icon: Smartphone,
  },
];

export default function PresentationPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-primary"
              href="/"
            >
              Portal
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <h1 className="text-3xl font-semibold">AMP CSR Command Center walkthrough</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              A concise take-home presentation covering the product problem,
              architecture, workflows, and MVP tradeoffs.
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ClipboardCheck size={24} aria-hidden="true" />
          </div>
        </header>

        <section className="grid gap-5 py-6 lg:grid-cols-2">
          {slides.map((slide, index) => {
            const Icon = slide.icon;
            return (
              <article
                className="rounded-lg border border-border bg-card p-5 shadow-sm"
                key={slide.title}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-background text-primary">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-primary">
                      {String(index + 1).padStart(2, "0")} · {slide.eyebrow}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold leading-7">
                      {slide.title}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {slide.body}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
