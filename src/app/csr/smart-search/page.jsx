import Link from "next/link";
import { Brain } from "lucide-react";

import { MotionPanel } from "@/components/motion-panel";
import { listCustomersForSupport } from "@/lib/data/customers";
import { buildSemanticDocuments, semanticSearch } from "@/lib/domain/semantic-search";
import { prisma } from "@/lib/prisma";

export default async function SmartSearchPage({ searchParams }) {
  const params = await searchParams;
  const q = params?.q || "";
  const customers = await listCustomersForSupport();
  const faqArticles = await prisma.faqArticle.findMany({
    orderBy: [{ category: "asc" }, { title: "asc" }],
  });
  const semanticDocuments = buildSemanticDocuments({
    customers,
    faqs: faqArticles,
  });
  const semanticResults = semanticSearch(semanticDocuments, q, { limit: 8 });

  return (
    <MotionPanel>
      <header className="rounded-3xl border border-border bg-card px-6 py-7 shadow-sm shadow-slate-200/70">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Semantic KNN search</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Search support meaning, not just keywords</h1>
        <p className="mt-2 max-w-3xl text-muted">
          Current MVP uses local TF-IDF vectors with cosine similarity across customer
          cases and FAQ articles. It is private, free, deterministic, and easy to
          upgrade later to `pgvector` plus a small embedding model.
        </p>
      </header>
      <form action="/csr/smart-search" className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70">
        <label className="grid gap-2">
          <span className="text-sm font-semibold">Smart search prompt</span>
          <div className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-surface px-4 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
            <Brain className="text-muted" size={18} aria-hidden="true" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
              defaultValue={q}
              name="q"
              placeholder="Try gate denied after card failed, new truck needs membership moved..."
            />
          </div>
        </label>
      </form>
      <section className="mt-6 grid gap-4">
        {semanticResults.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-sm shadow-slate-200/70">
            <Brain className="mx-auto text-muted" size={34} aria-hidden="true" />
            <h2 className="mt-3 font-semibold">Enter a support scenario</h2>
            <p className="mt-2 text-sm text-muted">
              Results will include related customer cases and help articles.
            </p>
          </div>
        ) : (
          semanticResults.map((result) => (
            <Link
              className="rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
              href={result.href}
              key={`${result.kind}-${result.id}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                    {result.kind}
                  </span>
                  <h2 className="mt-3 text-lg font-semibold">{result.title}</h2>
                  <p className="mt-1 text-sm text-muted">{result.subtitle}</p>
                </div>
                <span className="rounded-full border border-border bg-surface px-3 py-1 text-sm font-semibold text-muted">
                  {(result.score * 100).toFixed(0)}% match
                </span>
              </div>
            </Link>
          ))
        )}
      </section>
    </MotionPanel>
  );
}
