function severityClass(severity) {
  if (severity === "Critical") return "border-critical/30 bg-critical-background text-critical";
  if (severity === "High") return "border-warning/30 bg-warning-background text-warning";
  if (severity === "Low") return "border-border bg-surface-muted text-muted";
  return "border-primary/20 bg-surface text-primary";
}

function renderInline(text) {
  return text.split(/(`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-xs text-primary" key={index}>
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
}

export function MarkdownArticleBody({ body }) {
  const lines = body.split("\n");
  const nodes = [];
  let list = [];

  function flushList() {
    if (!list.length) return;
    nodes.push(
      <ul className="my-3 list-disc space-y-2 pl-6 text-sm leading-6 text-muted" key={`list-${nodes.length}`}>
        {list.map((item) => (
          <li key={item}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
    list = [];
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("# ")) {
      flushList();
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushList();
      nodes.push(
        <h2 className="mt-7 text-lg font-semibold tracking-tight" key={index}>
          {trimmed.replace(/^##\s+/, "")}
        </h2>,
      );
      return;
    }

    const bullet = trimmed.match(/^(?:[-*]|\d+\.)\s+(.+)$/);
    if (bullet) {
      list.push(bullet[1]);
      return;
    }

    flushList();
    nodes.push(
      <p className="mt-3 text-sm leading-6 text-muted" key={index}>
        {renderInline(trimmed)}
      </p>,
    );
  });

  flushList();
  return <div>{nodes}</div>;
}

export function DocsArticle({ doc }) {
  return (
    <article className="rounded-3xl border border-border bg-card p-6 shadow-sm shadow-slate-200/70">
      <div className="flex flex-wrap gap-2">
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${severityClass(doc.severity)}`}>
          {doc.severity}
        </span>
        <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-primary">
          {doc.category}
        </span>
      </div>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{doc.title}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{doc.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {doc.tags.map((tag) => (
          <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold text-muted" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <MarkdownArticleBody body={doc.body} />
    </article>
  );
}
