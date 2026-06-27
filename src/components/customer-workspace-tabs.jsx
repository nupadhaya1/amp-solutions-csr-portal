import Link from "next/link";

const baseTabClass =
  "inline-flex min-h-11 items-center border-b-2 px-4 text-sm font-semibold transition";
const activeTabClass = "border-primary text-foreground";
const inactiveTabClass = "border-transparent text-muted hover:border-border hover:text-foreground";

function tabClass(isActive) {
  return `${baseTabClass} ${isActive ? activeTabClass : inactiveTabClass}`;
}

export function CustomerWorkspaceTabs({ activeCustomerName, activeTab = "customers" }) {
  const showingProfile = activeTab === "profile" && activeCustomerName;

  return (
    <nav
      aria-label="Customer workspace"
      className="overflow-x-auto border-b border-border"
    >
      <div className="flex min-w-max items-center gap-1">
        <Link
          aria-current={activeTab === "customers" ? "page" : undefined}
          className={tabClass(activeTab === "customers")}
          href="/csr/customers"
        >
          Customers
        </Link>
        {showingProfile ? (
          <span
            aria-current="page"
            className={tabClass(true)}
          >
            {activeCustomerName}
          </span>
        ) : null}
      </div>
    </nav>
  );
}
