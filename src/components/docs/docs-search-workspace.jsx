"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, LoaderCircle, Search, X } from "lucide-react";

import { DocsResultCard } from "./docs-result-card";
import { DocsSuggestedSearches } from "./docs-suggested-searches";

export function DocsSearchWorkspace({ initialQuery = "", initialResults = [] }) {
  const [query, setQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [results, setResults] = useState(initialResults);
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const didAutoSearchMountRef = useRef(false);
  const searchRequestRef = useRef(0);

  const runSearch = useCallback((nextQuery, { syncInput = true } = {}) => {
    const normalizedQuery = String(nextQuery || "").trim().replace(/\s+/g, " ");
    const requestId = searchRequestRef.current + 1;
    searchRequestRef.current = requestId;

    if (syncInput) {
      setQuery(normalizedQuery);
    }

    setActiveQuery(normalizedQuery);
    setError("");

    const nextUrl = normalizedQuery
      ? `/csr/docs?q=${encodeURIComponent(normalizedQuery)}`
      : "/csr/docs";
    window.history.pushState(null, "", nextUrl);

    if (!normalizedQuery) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    fetch(`/api/docs/search?q=${encodeURIComponent(normalizedQuery)}&limit=8`)
      .then(async (response) => {
        const payload = await response.json();

        if (searchRequestRef.current !== requestId) return;

        if (!response.ok || payload.error) {
          throw new Error(payload.error || "Unable to search CSR docs.");
        }
        setResults(payload.data?.results || []);
      })
      .catch((searchError) => {
        if (searchRequestRef.current !== requestId) return;

        setError(searchError.message || "Unable to search CSR docs.");
        setResults([]);
      })
      .finally(() => {
        if (searchRequestRef.current === requestId) {
          setIsSearching(false);
        }
      });
  }, []);

  useEffect(() => {
    if (!didAutoSearchMountRef.current) {
      didAutoSearchMountRef.current = true;
      return undefined;
    }

    const searchDelay = window.setTimeout(() => {
      runSearch(query, { syncInput: false });
    }, 300);

    return () => window.clearTimeout(searchDelay);
  }, [query, runSearch]);

  function clearSearch() {
    searchRequestRef.current += 1;
    setQuery("");
    setActiveQuery("");
    setResults([]);
    setError("");
    setIsSearching(false);
    window.history.pushState(null, "", "/csr/docs");
  }

  return (
    <div className="grid gap-5">
      <header className="rounded-3xl border border-border bg-card px-6 py-7 shadow-sm shadow-slate-200/70">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-surface text-primary">
            <BookOpen size={22} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">CSR Docs</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Search source-of-truth support playbooks</h1>
          </div>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          Search source-of-truth remediation steps for billing, vehicle, subscription, and access issues.
        </p>

        <div className="mt-5">
          <DocsSuggestedSearches activeQuery={activeQuery} onSelect={runSearch} />
        </div>

        <form
          className="mt-5"
          onSubmit={(event) => {
            event.preventDefault();
            runSearch(query);
          }}
        >
          <label className="grid gap-2">
            <span className="text-sm font-semibold">Support issue</span>
            <div className="flex flex-col gap-3 md:flex-row">
              <div
                className="search-input-shell flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl border border-border bg-surface px-4 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10"
              >
                <Search className="shrink-0 text-muted" size={18} aria-hidden="true" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Example: customer says gate denied but app is active"
                  value={query}
                />
                {isSearching ? (
                  <LoaderCircle className="shrink-0 animate-spin text-muted" size={16} aria-hidden="true" />
                ) : null}
                {query ? (
                  <button
                    aria-label="Clear search"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-card hover:text-foreground"
                    onClick={clearSearch}
                    type="button"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                ) : null}
              </div>
              <button
                className="search-submit-button min-h-12 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSearching}
                type="submit"
              >
                Search
              </button>
            </div>
          </label>
        </form>
      </header>

      <div className="grid gap-5">
        <section aria-busy={isSearching} className="results-panel grid gap-4">
          {isSearching ? (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70">
              <div className="h-5 w-48 rounded bg-surface-muted" />
              <div className="mt-4 h-4 w-full rounded bg-surface-muted" />
              <div className="mt-2 h-4 w-2/3 rounded bg-surface-muted" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-sm shadow-slate-200/70">
              <h2 className="font-semibold">Search failed</h2>
              <p className="mt-2 text-sm text-muted">{error}</p>
            </div>
          ) : !activeQuery ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-sm shadow-slate-200/70">
              <BookOpen className="mx-auto text-muted" size={34} aria-hidden="true" />
              <h2 className="mt-3 font-semibold">Search operational playbooks</h2>
              <p className="mt-2 text-sm text-muted">
                Try a natural support scenario or choose a suggested search above.
              </p>
            </div>
          ) : results.length ? (
            results.map((result) => <DocsResultCard key={`${result.slug}-${result.chunkIndex}`} result={result} />)
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-sm shadow-slate-200/70">
              <h2 className="font-semibold">No docs matched</h2>
              <p className="mt-2 text-sm text-muted">
                Try a broader phrase such as billing issue, vehicle transfer, coupon, or gate denied.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
