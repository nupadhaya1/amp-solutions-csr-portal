"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  AlertTriangle,
  ArrowRight,
  CarFront,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  CreditCard,
  FilterX,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  clearRememberedCustomerSearch,
  getRememberedCustomerSearch,
  setRememberedCustomerSearch,
} from "@/lib/customer-search-session";

const pillStyles = {
  critical: "bg-critical-background text-critical",
  success: "bg-success-background text-success",
};

const statAccentMap = {
  total: "bg-accent/10 text-primary ring-accent/15",
  filtered: "bg-primary/10 text-primary ring-primary/15",
  attention: "bg-red-50 text-red-700 ring-red-100",
  overdue: "bg-amber-50 text-amber-700 ring-amber-100",
  payment: "bg-rose-50 text-rose-700 ring-rose-100",
};

function SortIcon({ state }) {
  if (state === "asc") return <ChevronUp size={15} aria-hidden="true" />;
  if (state === "desc") return <ChevronDown size={15} aria-hidden="true" />;
  return <ChevronsUpDown size={15} aria-hidden="true" />;
}

function HeaderButton({ header, children }) {
  const sorted = header.column.getIsSorted();

  if (!header.column.getCanSort()) {
    return <span>{children}</span>;
  }

  return (
    <button
      className="inline-flex items-center gap-1.5 text-left font-semibold transition hover:text-foreground"
      onClick={header.column.getToggleSortingHandler()}
      type="button"
    >
      {children}
      <SortIcon state={sorted} />
    </button>
  );
}

function StatCard({ icon: Icon, label, tone, value }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-3 shadow-sm shadow-slate-200/70">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${statAccentMap[tone]}`}>
          <Icon size={19} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xl font-semibold leading-none">{value}</p>
          <p className="mt-1 truncate text-xs font-semibold text-muted">{label}</p>
        </div>
      </div>
    </article>
  );
}

function CustomerCell({ customer }) {
  return (
    <div className="flex min-w-[140px] items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-semibold text-primary">
        {customer.initials}
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold">{customer.fullName}</p>
      </div>
    </div>
  );
}

function Pill({ children, tone = "success" }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${pillStyles[tone] || pillStyles.success}`}>
      {children}
    </span>
  );
}

export function CustomerTable({ rows, summary, filters }) {
  const [sorting, setSorting] = useState([{ id: "priorityRank", desc: false }]);
  const [globalFilter, setGlobalFilter] = useState(filters.q || "");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const currentSearch = String(globalFilter || "").trim();

  useEffect(() => {
    const routeQuery = String(filters.q || "").trim();

    if (routeQuery) {
      setGlobalFilter(routeQuery);
      return;
    }

    const rememberedQuery = getRememberedCustomerSearch();
    if (rememberedQuery) {
      setGlobalFilter(rememberedQuery);
    }
  }, [filters.q]);

  useEffect(() => {
    if (currentSearch) {
      setRememberedCustomerSearch(currentSearch);
      return;
    }

    clearRememberedCustomerSearch();
  }, [currentSearch]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "fullName",
        header: "Customer",
        cell: ({ row }) => <CustomerCell customer={row.original} />,
      },
      {
        accessorKey: "contactSummary",
        header: "Contact",
        cell: ({ row }) => (
          <div className="min-w-[190px]">
            <p className="truncate font-medium">{row.original.email}</p>
            <p className="mt-1 truncate text-xs text-muted">{row.original.phone}</p>
          </div>
        ),
      },
      {
        accessorKey: "vehicleSummary",
        header: "Vehicle / plate",
        cell: ({ row }) => (
          <div className="min-w-[160px]">
            <p className="font-medium">{row.original.primaryVehicle}</p>
            <p className="mt-1 text-xs font-semibold uppercase text-muted">
              {row.original.licensePlate || "No plate"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "subscriptionSummary",
        header: "Plan",
        cell: ({ row }) => (
          <span className="block max-w-[220px] text-muted">
            {row.original.subscriptionSummary}
          </span>
        ),
      },
      {
        accessorKey: "statusLabel",
        header: "Status",
        cell: ({ row }) => (
          <Pill tone={row.original.statusTone}>
            {row.original.statusLabel}
          </Pill>
        ),
      },
      {
        accessorKey: "paymentLabel",
        header: "Payment",
        cell: ({ row }) => (
          <Pill tone={row.original.paymentTone}>
            {row.original.paymentLabel}
          </Pill>
        ),
      },
      {
        id: "action",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <Link
            className="inline-flex items-center gap-2 whitespace-nowrap font-semibold text-primary hover:underline"
            href={`/csr/customers/${row.original.id}`}
          >
            Open profile
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        ),
      },
    ],
    [],
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table keeps callback APIs on the table instance; this component owns that instance locally.
  const table = useReactTable({
    data: rows,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    globalFilterFn: (row, _columnId, value) => {
      const terms = String(value || "")
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

      if (terms.length === 0) return true;

      const searchable = [
        row.original.fullName,
        row.original.email,
        row.original.phone,
        row.original.primaryVehicle,
        row.original.licensePlate,
        row.original.subscriptionSummary,
        row.original.statusLabel,
        row.original.paymentLabel,
        row.original.searchText,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return terms.every((term) => searchable.includes(term));
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const visibleRows = table.getRowModel().rows;
  const filteredRows = table.getFilteredRowModel().rows;

  return (
    <section className="grid min-h-0 gap-4">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-200/70">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Current search</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Caller details</h1>
            <p className="mt-1 text-sm text-muted">
              {currentSearch ? `Showing customer matches for "${currentSearch}".` : "Search caller details, compare account status, and open profiles."}
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard icon={UsersRound} label="Total customers" tone="total" value={summary.totalCustomers} />
          <StatCard icon={Search} label="Filtered results" tone="filtered" value={filteredRows.length} />
          <StatCard icon={AlertTriangle} label="Needs attention" tone="attention" value={summary.attentionCount} />
          <StatCard icon={CarFront} label="Overdue" tone="overdue" value={summary.overdueCount} />
          <StatCard icon={CreditCard} label="Payment failures" tone="payment" value={summary.paymentFailureCount} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-200/70">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl border border-border bg-surface px-4 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
            <Search className="shrink-0 text-muted" size={18} aria-hidden="true" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
              onChange={(event) => {
                const nextValue = event.target.value;
                setGlobalFilter(nextValue);
                table.setPageIndex(0);
              }}
              placeholder="Filter customer grid by name, phone, email, red Honda, plate, payment issue..."
              value={globalFilter ?? ""}
            />
          </label>
          <button
            aria-label="Clear search"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold transition hover:border-primary hover:text-primary"
            onClick={() => {
              clearRememberedCustomerSearch();
              setGlobalFilter("");
              table.setPageIndex(0);
            }}
            type="button"
          >
            <FilterX size={16} aria-hidden="true" />
            Clear search
          </button>
        </div>
      </div>

      <section className="min-h-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-slate-200/70">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th className="px-4 py-3 font-semibold" key={header.id}>
                      {header.isPlaceholder ? null : (
                        <HeaderButton header={header}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </HeaderButton>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {visibleRows.map((row) => (
                <tr className="hover:bg-surface" key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td className="px-4 py-3 align-middle" key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {visibleRows.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center" colSpan={columns.length}>
                    <UserRound className="mx-auto text-muted" size={34} aria-hidden="true" />
                    <h2 className="mt-3 font-semibold">No matching customers</h2>
                    <p className="mt-2 text-sm text-muted">
                      Try a phone number, plate, email, support issue, or clear the search.
                    </p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            Showing {visibleRows.length} of {filteredRows.length} matched rows · Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </p>
          <div className="flex items-center gap-2">
            <select
              className="h-9 rounded-lg border border-border bg-card px-2 text-sm outline-none focus:border-primary"
              onChange={(event) => table.setPageSize(Number(event.target.value))}
              value={table.getState().pagination.pageSize}
            >
              {[10, 15, 20].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize} rows
                </option>
              ))}
            </select>
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              type="button"
            >
              <ChevronLeft size={17} aria-hidden="true" />
              <span className="sr-only">Previous page</span>
            </button>
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              type="button"
            >
              <ChevronRight size={17} aria-hidden="true" />
              <span className="sr-only">Next page</span>
            </button>
          </div>
        </div>
      </section>
    </section>
  );
}
