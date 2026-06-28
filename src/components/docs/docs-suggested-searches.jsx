export const suggestedDocsSearches = [
  "customer cannot get a wash",
  "failed membership payment",
  "transfer subscription to new vehicle",
  "cancel membership",
  "charged twice at kiosk",
  "coupon did not apply",
  "downgrade family plan",
  "app says active but gate denied",
  "pause subscription",
  "update customer phone number",
].map((label) => ({
  label,
  query: label,
}));

export function DocsSuggestedSearches({ activeQuery = "", onSelect }) {
  return (
    <section aria-label="Suggested searches" className="grid gap-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Example prompts</p>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {suggestedDocsSearches.map((item) => {
          const selected = activeQuery === item.query;

          return (
            <button
              aria-current={selected ? "page" : undefined}
              className={`min-h-11 rounded-xl border px-3 py-2 text-left text-sm font-semibold leading-snug ${
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-foreground hover:border-primary/50 hover:bg-card"
              }`}
              key={item.query}
              onClick={() => onSelect?.(item.query)}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
