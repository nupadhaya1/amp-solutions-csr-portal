"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Brain,
  CarFront,
  ClipboardList,
  CreditCard,
  Grid2X2,
  HelpCircle,
  NotebookText,
  Search,
  Settings,
  Bell,
  UsersRound,
} from "lucide-react";

const navItems = [
  { href: "/csr/dashboard", label: "Dashboard", icon: Grid2X2 },
  { href: "/csr/customers", label: "Customers", icon: UsersRound },
  { href: "/csr/customers", label: "Subscriptions", icon: CarFront },
  { href: "/csr/customers", label: "Payments", icon: CreditCard },
  { href: "/csr/smart-search", label: "Smart search", icon: Brain },
  { href: "/csr/dashboard", label: "Notes", icon: NotebookText, disabled: true },
  { href: "/csr/dashboard", label: "Audit trail", icon: ClipboardList, disabled: true },
  { href: "/csr/dashboard", label: "Settings", icon: Settings },
];

function isActivePath(pathname, href) {
  if (href === "/csr/customers") {
    return pathname === href || pathname.startsWith("/csr/customers/");
  }

  return pathname === href;
}

export function PortalShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <main className="min-h-screen text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-border bg-sidebar/90 p-5 shadow-sm lg:border-b-0 lg:border-r">
          <div className="flex min-h-full flex-col gap-8">
            <div className="rounded-3xl border border-white/80 bg-card/80 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                  <CarFront size={25} aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold">AMP Care</p>
                  <p className="text-sm text-muted">CSR Portal</p>
                </div>
              </div>
            </div>

            <nav className="grid gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const selected = !item.disabled && isActivePath(pathname, item.href);

                return (
                  <Link
                    className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition ${
                      item.disabled
                        ? "pointer-events-none text-muted/45"
                        : ""
                    } ${
                      selected
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted hover:bg-card hover:text-foreground hover:shadow-sm"
                    }`}
                    href={item.href}
                    key={item.href}
                    onFocus={() => router.prefetch(item.href)}
                    onMouseEnter={() => router.prefetch(item.href)}
                    prefetch
                  >
                    <Icon size={20} aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                  BR
                </div>
                <div>
                  <p className="font-semibold">Bob Roberts</p>
                  <p className="text-sm text-muted">Support agent</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="px-5 py-5 sm:px-8 lg:px-10">
          <header className="mb-5 flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-200/70 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">CSR dashboard</h1>
              <p className="mt-1 text-sm text-muted">Monitor memberships, payments, and support outcomes.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex h-11 min-w-0 items-center gap-2 rounded-xl border border-border bg-surface px-3 sm:w-72">
                <Search className="shrink-0 text-muted" size={17} aria-hidden="true" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
                  placeholder="Search customers, plates, notes"
                />
              </label>
              <div className="flex items-center gap-2">
                <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-muted hover:text-primary" type="button">
                  <Bell size={18} aria-hidden="true" />
                </button>
                <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-muted hover:text-primary" type="button">
                  <HelpCircle size={18} aria-hidden="true" />
                </button>
                <div className="flex h-11 items-center gap-3 rounded-xl border border-border bg-card px-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                    BR
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold">Bob Roberts</p>
                    <p className="text-xs text-muted">CSR</p>
                  </div>
                </div>
              </div>
            </div>
          </header>
          {children}
        </section>
      </div>
    </main>
  );
}
