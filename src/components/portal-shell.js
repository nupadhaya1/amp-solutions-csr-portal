"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Brain,
  Grid2X2,
  PanelLeftClose,
  PanelLeftOpen,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";

import { supportDocCatalog } from "@/lib/docs/support-doc-catalog";

const navItems = [
  { href: "/csr/dashboard", label: "Dashboard", icon: Grid2X2 },
  { href: "/csr/customers", label: "Customers", icon: UsersRound },
  { href: "/csr/smart-search", label: "Smart search", icon: Brain },
  { href: "/csr/docs", label: "Docs", icon: BookOpen },
];

const categoryTone = {
  Account: "bg-sky-50 text-sky-700 ring-sky-100",
  Billing: "bg-rose-50 text-rose-700 ring-rose-100",
  Coupons: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "Internal CSR": "bg-slate-100 text-slate-700 ring-slate-200",
  "Mobile App": "bg-indigo-50 text-indigo-700 ring-indigo-100",
  Operations: "bg-red-50 text-red-700 ring-red-100",
  Purchases: "bg-amber-50 text-amber-700 ring-amber-100",
  "Service Access": "bg-critical-background text-critical ring-critical/10",
  Subscription: "bg-primary/10 text-primary ring-primary/15",
  "Vehicle Management": "bg-teal-50 text-teal-700 ring-teal-100",
};

function isActivePath(pathname, href) {
  if (href === "/csr/customers") {
    return pathname === href || pathname.startsWith("/csr/customers/");
  }

  if (href === "/csr/docs") {
    return pathname === href || pathname.startsWith("/csr/docs/");
  }

  return pathname === href;
}

function useCurrentCustomer(pathname) {
  const [currentCustomerName, setCurrentCustomerName] = useState("");
  const match = pathname.match(/^\/csr\/customers\/([^/?#]+)/);
  const customerRouteId = match?.[1] || "";

  useEffect(() => {
    if (!customerRouteId) {
      return undefined;
    }

    const controller = new AbortController();

    fetch(`/api/customers/${customerRouteId}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((payload) => {
        if (!payload?.data?.fullName) return;
        setCurrentCustomerName(payload.data.fullName);
      })
      .catch(() => {
        setCurrentCustomerName("");
      });

    return () => controller.abort();
  }, [customerRouteId]);

  return customerRouteId ? currentCustomerName : "";
}

function docsCategoryGroups() {
  return supportDocCatalog.reduce((groups, doc) => {
    if (!groups.has(doc.category)) groups.set(doc.category, []);
    groups.get(doc.category).push(doc);
    return groups;
  }, new Map());
}

export function PortalShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentCustomerName = useCurrentCustomer(pathname);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const showingDocs = pathname.startsWith("/csr/docs");
  const activeDocSlug = pathname.match(/^\/csr\/docs\/([^/?#]+)/)?.[1] || "";
  const groupedDocs = docsCategoryGroups();

  return (
    <main className="h-screen overflow-hidden text-foreground">
      <div
        className={`grid h-screen transition-[grid-template-columns] duration-200 ${
          sidebarCollapsed ? "lg:grid-cols-[76px_1fr]" : "lg:grid-cols-[272px_1fr]"
        }`}
      >
        <aside
          className={`h-screen border-r border-border/80 bg-sidebar py-5 shadow-sm shadow-slate-950/5 transition-[padding] duration-200 ${
            sidebarCollapsed ? "px-3" : "px-4"
          }`}
        >
          <div className="flex h-full flex-col gap-5">
            <div
              className={`rounded-3xl border border-border bg-card shadow-sm shadow-slate-950/5 transition-[padding] duration-200 ${
                sidebarCollapsed ? "px-2 py-3" : "px-4 py-4"
              }`}
            >
              <div className={sidebarCollapsed ? "grid place-items-center" : "flex"}>
                <Image
                  alt="AMP logo"
                  className={sidebarCollapsed ? "h-7 w-7 object-contain" : "h-7 w-auto"}
                  height={72}
                  src="/logo-amp.svg"
                  width={240}
                />
                {!sidebarCollapsed ? <h1 style={{ marginTop: "2px" }}> | CSR-Portal</h1> : null}
              </div>
              {!sidebarCollapsed ? (
                <>
                  <p className="mt-2">Nikhil Upadhaya</p>
                  <p className="text-sm text-muted-foreground">Support agent</p>
                </>
              ) : null}
            </div>

            <nav className="grid gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const selected = isActivePath(pathname, item.href);
                const isDocsItem = item.href === "/csr/docs";

                return (
                  <div className="grid gap-2" key={item.href}>
                    <Link
                      className={`flex min-h-11 items-center rounded-2xl text-sm font-semibold transition ${
                        sidebarCollapsed ? "justify-center px-0" : "gap-3 px-4"
                      } ${
                        selected
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground/80 hover:bg-card hover:text-foreground hover:shadow-sm"
                      }`}
                      href={item.href}
                      onFocus={() => router.prefetch(item.href)}
                      onMouseEnter={() => router.prefetch(item.href)}
                      prefetch
                      title={item.label}
                    >
                      <Icon aria-hidden="true" size={18} />
                      {!sidebarCollapsed ? item.label : <span className="sr-only">{item.label}</span>}
                    </Link>

                    {!sidebarCollapsed && isDocsItem && showingDocs ? (
                      <div className="docs-subtabs ml-5 max-h-[44vh] overflow-y-auto border-l border-border pl-3">
                        <div className="grid gap-3 py-1">
                          {[...groupedDocs.entries()].map(([category, docs]) => (
                            <details
                              className="group grid gap-1"
                              key={category}
                              open={!activeDocSlug || docs.some((doc) => doc.slug === activeDocSlug)}
                            >
                              <summary
                                className={`flex cursor-pointer list-none items-center justify-between rounded-lg px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${
                                  categoryTone[category] || "bg-surface text-muted ring-border"
                                }`}
                              >
                                {category}
                                <span className="text-xs transition group-open:rotate-90" aria-hidden="true">
                                  ›
                                </span>
                              </summary>
                              <div className="mt-1 grid gap-1">
                                {docs.map((doc) => {
                                  const isActiveDoc = activeDocSlug === doc.slug;

                                  return (
                                    <Link
                                      aria-current={isActiveDoc ? "page" : undefined}
                                      className={`rounded-lg px-2 py-1.5 text-xs font-semibold leading-snug transition ${
                                        isActiveDoc
                                          ? "bg-primary/10 text-primary ring-1 ring-primary/15"
                                          : "text-foreground/70 hover:bg-card hover:text-foreground"
                                      }`}
                                      href={`/csr/docs/${doc.slug}`}
                                      key={doc.slug}
                                      onFocus={() => router.prefetch(`/csr/docs/${doc.slug}`)}
                                      onMouseEnter={() => router.prefetch(`/csr/docs/${doc.slug}`)}
                                    >
                                      {doc.title}
                                    </Link>
                                  );
                                })}
                              </div>
                            </details>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </nav>

            <button
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={`mt-auto flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition hover:border-primary/30 hover:text-primary ${
                sidebarCollapsed ? "self-center" : "self-end"
              }`}
              onClick={() => setSidebarCollapsed((value) => !value)}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              type="button"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen aria-hidden="true" className="h-4 w-4" />
              ) : (
                <PanelLeftClose aria-hidden="true" className="h-4 w-4" />
              )}
            </button>
          </div>
        </aside>

        <section className="h-screen overflow-y-auto px-5 py-5 sm:px-8 lg:px-10">
          {children}
        </section>
      </div>
    </main>
  );
}
