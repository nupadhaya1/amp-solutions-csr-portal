import Link from "next/link";
import { ArrowRight, MonitorPlay } from "lucide-react";

const destinations = [
  {
    title: "Open Portal",
    description: "CSR dashboard and support workspace.",
    href: "/",
  },
  {
    title: "View Presentation",
    description: "Keyboard-driven take-home walkthrough.",
    href: "/demo/presentation",
  },
  {
    title: "System Design",
    description: "Architecture, data model, docs search, and production path.",
    href: "/demo/systemDesign",
  },
];

export default function DemoHub() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-10">
        <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-muted">
          <MonitorPlay size={16} className="text-primary" aria-hidden="true" />
          Demo hub
        </div>
        <h1 className="max-w-3xl text-5xl font-semibold leading-tight">
          AMP CSR Command Center Demo
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
          Choose the live portal, presentation walkthrough, or system design overview.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {destinations.map((destination) => (
            <Link
              className="group rounded-lg border border-border bg-card p-5 shadow-sm transition hover:border-primary"
              href={destination.href}
              key={destination.title}
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-semibold">{destination.title}</h2>
                <ArrowRight
                  className="text-primary transition group-hover:translate-x-1"
                  size={18}
                  aria-hidden="true"
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">{destination.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
