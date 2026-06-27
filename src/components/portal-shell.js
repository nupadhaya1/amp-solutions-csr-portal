"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Brain,
  CarFront,
  Grid2X2,
  UsersRound,
} from "lucide-react";

const navItems = [
  { href: "/csr/dashboard", label: "Dashboard", icon: Grid2X2 },
  { href: "/csr/customers", label: "Customer lookup", icon: UsersRound },
  { href: "/csr/smart-search", label: "Smart search", icon: Brain },
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
                const selected = isActivePath(pathname, item.href);

                return (
                  <Link
                    className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition ${
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

        <section className="px-5 py-6 sm:px-8 lg:px-10">{children}</section>
      </div>
    </main>
  );
}
