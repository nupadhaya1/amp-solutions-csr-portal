import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  CarFront,
  CreditCard,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";

const activity = [
  {
    title: "Membership payment failed",
    detail: "Update payment details to restore unlimited wash access.",
    status: "Action needed",
    icon: ShieldAlert,
  },
  {
    title: "2021 Honda Civic",
    detail: "Covered by Signature Wash after payment is resolved.",
    status: "Primary vehicle",
    icon: CarFront,
  },
  {
    title: "Last successful wash",
    detail: "Single express wash purchased before the membership issue.",
    status: "May 12",
    icon: BadgeCheck,
  },
];

const helpTopics = [
  "Why can't I get a wash?",
  "Update payment method",
  "Transfer membership to a new vehicle",
];

export default function MobileCompanionPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-5 py-8 lg:grid-cols-[380px_1fr]">
        <section className="mx-auto w-full max-w-sm rounded-[32px] border border-border bg-foreground p-3 shadow-sm">
          <div className="rounded-[24px] bg-background p-5">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">AMP Wash</p>
                <h1 className="text-xl font-semibold">My membership</h1>
              </div>
              <button
                aria-label="Notifications"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card"
                type="button"
              >
                <Bell size={18} aria-hidden="true" />
              </button>
            </header>

            <section className="mt-5 rounded-lg border border-critical bg-critical-background p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 text-critical" size={20} />
                <div>
                  <p className="font-semibold text-critical">Wash access paused</p>
                  <p className="mt-2 text-sm leading-6">
                    Your latest membership payment failed. Update payment details
                    to restore access.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-5 grid gap-3">
              {activity.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    className="rounded-lg border border-border bg-card p-4"
                    key={item.title}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background text-primary">
                        <Icon size={19} aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-muted">
                          {item.detail}
                        </p>
                        <p className="mt-2 text-xs font-semibold uppercase text-primary">
                          {item.status}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            <button
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
              type="button"
            >
              Update payment
            </button>
          </div>
        </section>

        <section>
          <Link
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-primary"
            href="/csr/dashboard"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Portal
          </Link>
          <h2 className="max-w-3xl text-3xl font-semibold">
            Customer-side companion for the CSR demo
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            This route shows how the same membership state could be explained to
            customers in a mobile experience while the take-home implementation
            remains focused on the CSR portal.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <CreditCard className="text-primary" size={20} />
                <h3 className="font-semibold">Payment recovery</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">
                Mirrors the CSR critical issue: overdue subscription caused by
                failed membership payment.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <HelpCircle className="text-primary" size={20} />
                <h3 className="font-semibold">Self-service help</h3>
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-muted">
                {helpTopics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
