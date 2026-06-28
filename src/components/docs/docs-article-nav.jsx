import Link from "next/link";
import { BookOpen } from "lucide-react";

function groupDocs(docs) {
  return docs.reduce((groups, doc) => {
    const category = doc.category || "Other";
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(doc);
    return groups;
  }, new Map());
}

export function DocsArticleNav({ docs, variant = "panel" }) {
  const groups = groupDocs(docs);
  const isSidebar = variant === "sidebar";

  return (
    <aside
      className={
        isSidebar
          ? "min-h-0 overflow-y-auto rounded-2xl border border-border bg-card p-3 shadow-sm shadow-slate-950/5"
          : "rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-200/70"
      }
    >
      <div className="flex items-center gap-2">
        <BookOpen size={17} className="text-primary" aria-hidden="true" />
        <h2 className="text-sm font-semibold">Article index</h2>
      </div>
      <div className="mt-4 grid gap-4">
        {[...groups.entries()].map(([category, items]) => (
          <section className="grid gap-2" key={category}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">{category}</h3>
            <div className="grid gap-1">
              {items.map((doc) => (
                <Link
                  className={`rounded-lg px-2 py-1.5 font-medium leading-snug text-foreground/80 hover:bg-surface hover:text-foreground ${
                    isSidebar ? "text-xs" : "text-sm"
                  }`}
                  href={`/csr/docs/${doc.slug}`}
                  key={doc.slug}
                >
                  {doc.title}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
