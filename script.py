#!/usr/bin/env python3

import os
import re
from dataclasses import dataclass
from typing import Optional

try:
    import psycopg
except ImportError as exc:
    raise SystemExit(
        "Missing dependency: psycopg. Install it with: python3 -m pip install 'psycopg[binary]'"
    ) from exc


ENV_FILE = r"/Users/nikhilupadhaya/Documents/amp solutions take home/amp-solutions-csr-portal/.env.development.local"

MEMBER_PREFIX = "AMP"
MEMBER_ID_WIDTH = 4

DASHBOARD_DEMO_EMAIL_RE = re.compile(
    r"^dashboard-demo-(\d+)@example\.com$",
    re.IGNORECASE,
)

MEMBER_ID_RE = re.compile(
    rf"^{MEMBER_PREFIX}-(\d+)$",
    re.IGNORECASE,
)


@dataclass(frozen=True)
class CustomerRow:
    id: str
    first_name: str
    last_name: str
    email: str
    created_at: object
    member_id: Optional[str]


def load_env_file():
    if not os.path.exists(ENV_FILE):
        raise SystemExit(f"Env file not found: {ENV_FILE}")

    with open(ENV_FILE, "r", encoding="utf-8") as env_file:
        for line in env_file:
            value = line.strip()

            if not value or value.startswith("#") or "=" not in value:
                continue

            if value.startswith("export "):
                value = value[len("export ") :].strip()

            key, raw = value.split("=", 1)
            key = key.strip()
            raw = raw.strip().strip('"').strip("'")

            if key and key not in os.environ:
                os.environ[key] = raw


def format_member_id(number):
    if number < 10**MEMBER_ID_WIDTH:
        return f"{MEMBER_PREFIX}-{number:0{MEMBER_ID_WIDTH}d}"

    return f"{MEMBER_PREFIX}-{number}"


def parse_member_id_number(member_id):
    if not member_id:
        return None

    match = MEMBER_ID_RE.match(member_id.strip())

    if not match:
        return None

    return int(match.group(1))


def parse_dashboard_demo_number(email):
    match = DASHBOARD_DEMO_EMAIL_RE.match(email or "")

    if not match:
        return None

    return int(match.group(1))


def add_member_id_column(conn):
    with conn.cursor() as cur:
        cur.execute(
            """
            ALTER TABLE "Customer"
            ADD COLUMN IF NOT EXISTS "memberId" TEXT
            """
        )


def fetch_customers(conn):
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT id, "firstName", "lastName", email, "createdAt", "memberId"
            FROM "Customer"
            ORDER BY "createdAt" ASC, id ASC
            """
        )

        return [CustomerRow(*row) for row in cur.fetchall()]


def next_available_member_id(start_number, used_member_ids):
    number = max(1, start_number)

    while True:
        candidate = format_member_id(number)

        if candidate.upper() not in used_member_ids:
            return candidate, number + 1

        number += 1


def build_assignments(customers):
    used_member_ids = {
        customer.member_id.strip().upper()
        for customer in customers
        if customer.member_id and customer.member_id.strip()
    }

    existing_numbers = [
        parse_member_id_number(customer.member_id)
        for customer in customers
        if customer.member_id and customer.member_id.strip()
    ]

    existing_numbers = [number for number in existing_numbers if number is not None]
    next_number = max(existing_numbers, default=0) + 1

    missing_customers = [
        customer
        for customer in customers
        if not customer.member_id or not customer.member_id.strip()
    ]

    dashboard_demo_customers = []
    regular_customers = []

    for customer in missing_customers:
        dashboard_number = parse_dashboard_demo_number(customer.email)

        if dashboard_number is None:
            regular_customers.append(customer)
        else:
            dashboard_demo_customers.append((dashboard_number, customer))

    dashboard_demo_customers.sort(key=lambda item: (item[0], item[1].id))
    regular_customers.sort(key=lambda customer: (customer.created_at, customer.id))

    assignments = []

    # Preserve the dashboard demo number where possible:
    # dashboard-demo-0396@example.com -> AMP-0396
    for dashboard_number, customer in dashboard_demo_customers:
        preferred_member_id = format_member_id(dashboard_number)

        if preferred_member_id.upper() not in used_member_ids:
            member_id = preferred_member_id
        else:
            member_id, next_number = next_available_member_id(next_number, used_member_ids)

        used_member_ids.add(member_id.upper())
        assignments.append((customer.id, member_id, customer.email))

    # Assign any hand-seeded / non-dashboard customers to the next available AMP ID.
    for customer in regular_customers:
        member_id, next_number = next_available_member_id(next_number, used_member_ids)

        used_member_ids.add(member_id.upper())
        assignments.append((customer.id, member_id, customer.email))

    return assignments


def apply_assignments(conn, assignments):
    with conn.cursor() as cur:
        for customer_id, member_id, _email in assignments:
            cur.execute(
                """
                UPDATE "Customer"
                SET "memberId" = %s,
                    "updatedAt" = NOW()
                WHERE id = %s
                  AND ("memberId" IS NULL OR trim("memberId") = '')
                """,
                (member_id, customer_id),
            )


def create_unique_index(conn):
    with conn.cursor() as cur:
        cur.execute(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS "Customer_memberId_key"
            ON "Customer" ("memberId")
            """
        )


def main():
    load_env_file()

    database_url = os.environ.get("DATABASE_URL_UNPOOLED") or os.environ.get("DATABASE_URL")

    if not database_url:
        raise SystemExit(
            "DATABASE_URL_UNPOOLED or DATABASE_URL is missing in your .env.development.local file."
        )

    with psycopg.connect(database_url) as conn:
        add_member_id_column(conn)

        customers = fetch_customers(conn)

        if not customers:
            print("No customers found. Nothing to backfill.")
            return

        assignments = build_assignments(customers)

        if not assignments:
            create_unique_index(conn)
            conn.commit()
            print("All customers already have memberId values. Unique index confirmed.")
            return

        apply_assignments(conn, assignments)
        create_unique_index(conn)
        conn.commit()

    print(f"Backfilled {len(assignments)} customer member IDs.")
    print("Sample assignments:")

    for _customer_id, member_id, email in assignments[:12]:
        print(f"- {email} -> {member_id}")


if __name__ == "__main__":
    main()