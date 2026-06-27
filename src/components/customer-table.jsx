"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  FilterX,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react";

const statusStyles = {
  critical: "bg-critical-background text-critical",
  success: "bg-success-background text-success",
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

function SummaryTile({ label, value }) {
  return (
    <div className="border-r border-border px-4 py-3 last:border-r-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function CustomerCell({ customer }) {
  return (
    <div className="flex min-w-[190px] items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-semibold text-primary">
        {customer.initials}
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold">{customer.fullName}</p>
        <p className="mt-1 truncate text-xs text-muted">{customer.email}</p>
        <p className="mt-0.5 truncate text-xs text-muted">{customer.phone}</p>
      </div>
    </div>
  );
}

function FilterInput({ label, name, defaultValue, placeholder, className = "" }) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-semibold text-muted">{label}</span>
      <input
        className={`h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary ${className}`}
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
      />
    </label>
  );
}

export function CustomerTable({ rows, summary, filters }) {
  const [sorting, setSorting] = useState([{ id: "priorityRank", desc: false }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 8 });

  const columns = useMemo(
    () => [
      {
        accessorKey: "fullName",
        header: "Customer",
        cell: ({ row }) => <CustomerCell customer={row.original} />,
      },
      {
        accessorKey: "vehicleSummary",
        header: "Vehicle",
        cell: ({ row }) => (
          <div className="min-w-[150px]">
            <p className="font-medium">{row.original.primaryVehicle}</p>
            <p className="mt-1 text-xs font-semibold uppercase text-muted">
              {row.original.licensePlate || "No plate"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "subscriptionSummary",
        header: "Subscription",
        cell: ({ row }) => (
          <span className="block max-w-[260px] text-muted">
            {row.original.subscriptionSummary}
          </span>
        ),
      },
      {
        accessorKey: "priorityRank",
        header: "Priority",
        cell: ({ row }) => (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              row.original.hasCriticalIssue
                ? "bg-critical-background text-critical"
                : "bg-surface-muted text-muted"
            }`}
          >
            {row.original.priorityLabel}
          </span>
        ),
      },
      {
        accessorKey: "statusLabel",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              statusStyles[row.original.statusTone]
            }`}
          >
            {row.original.statusLabel}
          </span>
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
            Open
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
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const visibleRows = table.getRowModel().rows;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-slate-200/70">
      <div className="border-b border-border bg-surface p-4">
        <div className="grid gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <UsersRound size={20} aria-hidden="true" />
              </span>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Customers</h1>
                <p className="mt-1 text-sm text-muted">
                  Search caller details, sort by account risk, and open profiles.
                </p>
              </div>
            </div>
            <div className="mt-4 grid overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-4">
              <SummaryTile label="Results" value={summary.resultCount} />
              <SummaryTile label="All customers" value={summary.totalCustomers} />
              <SummaryTile label="Needs attention" value={summary.attentionCount} />
              <SummaryTile label="Active filters" value={summary.activeFilterCount} />
            </div>
          </div>

          <form
            action="/csr/customers"
            className="grid gap-3 lg:grid-cols-[1.3fr_repeat(4,minmax(0,1fr))_auto_auto]"
          >
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-muted">Search</span>
              <div className="flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 focus-within:border-primary">
                <Search className="text-muted" size={16} aria-hidden="true" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
                  defaultValue={filters.q}
                  name="q"
                  placeholder="Name, plate, issue..."
                />
              </div>
            </label>
            <FilterInput defaultValue={filters.name} label="Name" name="name" />
            <FilterInput defaultValue={filters.email} label="Email" name="email" />
            <FilterInput defaultValue={filters.phone} label="Phone" name="phone" />
            <FilterInput
              className="uppercase"
              defaultValue={filters.licensePlate}
              label="Plate"
              name="licensePlate"
            />
            <button
              className="h-10 self-end rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-95"
              type="submit"
            >
              Search
            </button>
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-lg border border-border bg-card px-4 text-sm font-semibold transition hover:border-primary hover:text-primary"
              href="/csr/customers"
            >
              <FilterX size={16} aria-hidden="true" />
              Clear
            </Link>
          </form>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-border bg-card px-4 py-3 md:flex-row md:items-center md:justify-between">
        <label className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-border bg-surface px-3 md:w-96">
          <Search className="shrink-0 text-muted" size={16} aria-hidden="true" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            placeholder="Filter visible results"
            value={globalFilter ?? ""}
          />
        </label>
        <p className="text-sm text-muted">
          Showing {visibleRows.length} of {table.getFilteredRowModel().rows.length} matched rows
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-border bg-card text-xs uppercase tracking-wide text-muted">
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
                  <td className="px-4 py-4 align-middle" key={cell.id}>
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
                    Try a phone number, plate, email, support issue, or clear the table filter.
                  </p>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </p>
        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-lg border border-border bg-card px-2 text-sm outline-none focus:border-primary"
            onChange={(event) => table.setPageSize(Number(event.target.value))}
            value={table.getState().pagination.pageSize}
          >
            {[8, 12, 16].map((pageSize) => (
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
  );
}
