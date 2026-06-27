"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Brain, Grid2X2, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/csr/dashboard", label: "Dashboard", icon: Grid2X2 },
  { href: "/csr/customers", label: "Customers", icon: UsersRound },
  { href: "/csr/smart-search", label: "Smart search", icon: Brain },
];

function isActivePath(pathname, href) {
  if (href === "/csr/customers") {
    return pathname === href || pathname.startsWith("/csr/customers/");
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

export function PortalShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentCustomerName = useCurrentCustomer(pathname);

  return (
    <main className="h-screen overflow-hidden text-foreground">
      <div className="grid h-screen lg:grid-cols-[272px_1fr]">
        <aside className="h-screen border-r border-border/80 bg-sidebar px-4 py-5 shadow-sm shadow-slate-950/5">
          <div className="flex h-full flex-col gap-5">
            <div className="rounded-3xl border border-border bg-card px-4 py-4 shadow-sm shadow-slate-950/5">
              <div className="flex">
                <Image
                  alt="AMP logo"
                  className="h-7 w-auto"
                  height={72}
                  src="/logo-amp.svg"
                  width={240}
                />
                <h1 style={{ marginTop: "2px" }}> | CSR-Portal</h1>
              </div>
              <p className="mt-2">Nikhil Upadhaya</p>
              <p className="text-sm text-muted-foreground">Support agent</p>
            </div>

            <nav className="grid gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const selected = isActivePath(pathname, item.href);
                const isCustomersItem = item.href === "/csr/customers";

                return (
                  <div className="grid gap-2" key={item.href}>
                    <Link
                      className={`flex min-h-11 items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition ${
                        selected
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground/80 hover:bg-card hover:text-foreground hover:shadow-sm"
                      }`}
                      href={item.href}
                      onFocus={() => router.prefetch(item.href)}
                      onMouseEnter={() => router.prefetch(item.href)}
                      prefetch
                    >
                      <Icon aria-hidden="true" size={18} />
                      {item.label}
                    </Link>
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        <section className="h-screen overflow-y-auto px-5 py-5 sm:px-8 lg:px-10">
          {children}
        </section>
      </div>
    </main>
  );
}
