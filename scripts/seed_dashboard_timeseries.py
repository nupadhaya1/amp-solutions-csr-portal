#!/usr/bin/env python3

import json
import os
import random
import re
import string
from datetime import datetime, timedelta
from decimal import Decimal

try:
    import psycopg
except ImportError as exc:
    raise SystemExit(
        "Missing dependency: psycopg. Install it with `python3 -m pip install psycopg[binary]`."
    ) from exc


PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ENV_FILE = os.path.join(PROJECT_ROOT, ".env.development.local")

CSR_ACTOR = "Nikhil Upadhaya"
SYSTEM_ACTOR = "AMP System"

DASHBOARD_MEMBER_ID_OFFSET = 2000
HOME_WASH_LOCATIONS = [
    "AMP Buckhead",
    "AMP Roswell Tunnel",
    "AMP Midtown",
    "AMP Sandy Springs",
    "AMP Decatur",
    "AMP Alpharetta",
]

random.seed(42)


def load_env_file(path):
    if not os.path.exists(path):
        return

    with open(path, "r", encoding="utf-8") as env_file:
        for line in env_file:
            value = line.strip()

            if not value or value.startswith("#") or "=" not in value:
                continue

            if value.startswith("export "):
                value = value[len("export ") :].strip()

            key, raw = value.split("=", 1)
            key = key.strip()
            raw = raw.strip().strip('"').strip("'")

            os.environ.setdefault(key, raw)


def make_id(prefix):
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=18))
    return f"{prefix}_{suffix}"


def member_id_for_index(index):
    return f"AMP-{DASHBOARD_MEMBER_ID_OFFSET + index:04d}"


def home_wash_location_for_index(index):
    return HOME_WASH_LOCATIONS[index % len(HOME_WASH_LOCATIONS)]


def email_part(value):
    cleaned = re.sub(r"[^a-z0-9]+", "", value.lower())
    return cleaned or "customer"


def demo_email(first_name, last_name, index):
    first = email_part(first_name)
    last = email_part(last_name)
    return f"{first}.{last}{DASHBOARD_MEMBER_ID_OFFSET + index}@example.com"


def month_start(months_ago):
    today = datetime.utcnow().replace(day=1, hour=12, minute=0, second=0, microsecond=0)
    year = today.year
    month = today.month - months_ago

    while month <= 0:
        month += 12
        year -= 1

    return today.replace(year=year, month=month)


def random_date_in_month(start):
    return start + timedelta(days=random.randint(0, 25), hours=random.randint(0, 8))


def money(value):
    return Decimal(value).quantize(Decimal("0.01"))


def fetch_plans(conn):
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT id, name, "monthlyPrice", "maxVehicles", "cleaningTier"
            FROM "SubscriptionPlan"
            ORDER BY "monthlyPrice" ASC
            """
        )
        plans = cur.fetchall()

    if not plans:
        raise RuntimeError("No subscription plans found. Run `npm run db:seed` first.")

    return plans


def delete_existing_dashboard_demo(conn):
    with conn.cursor() as cur:
        cur.execute(
            """
            DELETE FROM "Customer"
            WHERE id LIKE 'custdash_%'
            """
        )
        deleted_by_id = cur.rowcount

        # Cleanup old generated rows from the previous email-based seed, just in case
        # any were created before the custdash_ id prefix was used consistently.
        cur.execute(
            """
            DELETE FROM "Customer"
            WHERE email LIKE 'dashboard-demo-%@example.com'
            """
        )
        deleted_by_email = cur.rowcount

        return deleted_by_id + deleted_by_email


def insert_customer(cur, customer_id, member_id, first_name, last_name, email, phone, status, created_at, home_wash_location):
    cur.execute(
        """
        INSERT INTO "Customer"
        (id, "memberId", "firstName", "lastName", email, phone, status, "homeWashLocation", "createdAt", "updatedAt")
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            customer_id,
            member_id,
            first_name,
            last_name,
            email,
            phone,
            status,
            home_wash_location,
            created_at,
            created_at,
        ),
    )


def insert_vehicle(cur, vehicle_id, customer_id, year, make, model, color, plate, created_at):
    cur.execute(
        """
        INSERT INTO "Vehicle"
        (id, "customerId", year, make, model, color, "licensePlate", "createdAt", "updatedAt")
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            vehicle_id,
            customer_id,
            year,
            make,
            model,
            color,
            plate,
            created_at,
            created_at,
        ),
    )


def insert_subscription(cur, subscription_id, customer_id, plan_id, status, started_at, next_billing_date):
    cur.execute(
        """
        INSERT INTO "Subscription"
        (id, "customerId", "planId", status, "startedAt", "nextBillingDate", "createdAt", "updatedAt")
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            subscription_id,
            customer_id,
            plan_id,
            status,
            started_at,
            next_billing_date,
            started_at,
            started_at,
        ),
    )


def insert_subscription_vehicle(cur, coverage_id, subscription_id, vehicle_id, assigned_at):
    cur.execute(
        """
        INSERT INTO "SubscriptionVehicle"
        (id, "subscriptionId", "vehicleId", "assignedAt", "removedAt")
        VALUES (%s, %s, %s, %s, NULL)
        """,
        (coverage_id, subscription_id, vehicle_id, assigned_at),
    )


def insert_purchase(
    cur,
    purchase_id,
    customer_id,
    vehicle_id,
    subscription_id,
    purchase_type,
    status,
    amount,
    description,
    purchased_at,
):
    cur.execute(
        """
        INSERT INTO "Purchase"
        (id, "customerId", "vehicleId", "subscriptionId", type, status, amount, description, "purchasedAt", "createdAt", "updatedAt")
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            purchase_id,
            customer_id,
            vehicle_id,
            subscription_id,
            purchase_type,
            status,
            amount,
            description,
            purchased_at,
            purchased_at,
            purchased_at,
        ),
    )


def insert_audit_event(
    cur,
    event_id,
    customer_id,
    event_type,
    message,
    metadata,
    actor_name,
    actor_type,
    created_at,
):
    cur.execute(
        """
        INSERT INTO "AuditEvent"
        (id, "customerId", type, message, metadata, "actorName", "actorType", "createdAt")
        VALUES (%s, %s, %s, %s, %s::jsonb, %s, %s, %s)
        """,
        (
            event_id,
            customer_id,
            event_type,
            message,
            json.dumps(metadata or {}),
            actor_name,
            actor_type,
            created_at,
        ),
    )


def main():
    load_env_file(ENV_FILE)

    database_url = os.environ.get("DATABASE_URL_UNPOOLED") or os.environ.get("DATABASE_URL")
    if not database_url:
        raise SystemExit("DATABASE_URL is missing. Pull Vercel env vars or create .env.development.local.")

    first_names = [
        "Avery",
        "Jordan",
        "Taylor",
        "Morgan",
        "Riley",
        "Casey",
        "Quinn",
        "Parker",
        "Jamie",
        "Reese",
        "Cameron",
        "Drew",
    ]
    last_names = [
        "Adams",
        "Brooks",
        "Carter",
        "Diaz",
        "Evans",
        "Foster",
        "Garcia",
        "Hayes",
        "Irwin",
        "Jones",
        "Kim",
        "Lewis",
    ]
    vehicles = [
        ("Honda", "Civic"),
        ("Toyota", "Camry"),
        ("Ford", "Escape"),
        ("Nissan", "Altima"),
        ("Jeep", "Cherokee"),
        ("Hyundai", "Tucson"),
        ("Kia", "Telluride"),
        ("Subaru", "Outback"),
    ]
    colors = ["Blue", "Black", "White", "Silver", "Gray", "Red"]

    inserted = {
        "customers": 0,
        "subscriptions": 0,
        "purchases": 0,
        "failed_issue_events": 0,
        "csr_fix_events": 0,
    }

    with psycopg.connect(database_url) as conn:
        plans = fetch_plans(conn)
        deleted = delete_existing_dashboard_demo(conn)

        with conn.cursor() as cur:
            customer_index = 0

            # Oldest month first. The volume generally increases over time so
            # customer count, subscription count, and revenue trend upward.
            months = [month_start(months_ago) for months_ago in reversed(range(12))]

            for month_number, month in enumerate(months, start=1):
                customer_count = 4 + month_number + random.randint(0, 3)
                issue_count = max(2, 6 + random.randint(-3, 4))
                fix_count = max(1, int(issue_count * random.uniform(0.45, 0.85)))

                for _ in range(customer_count):
                    customer_index += 1

                    first_name = random.choice(first_names)
                    last_name = random.choice(last_names)
                    created_at = random_date_in_month(month)
                    customer_id = make_id("custdash")
                    member_id = member_id_for_index(customer_index)
                    vehicle_id = make_id("vehicledash")
                    subscription_id = make_id("subdash")
                    coverage_id = make_id("coverdash")
                    plan = random.choice(plans)
                    plan_id, plan_name, monthly_price, _max_vehicles, _tier = plan
                    make, model = random.choice(vehicles)

                    email = demo_email(first_name, last_name, customer_index)
                    phone = f"404-555-{1000 + customer_index:04d}"
                    plate = f"DSH{customer_index:04d}"[-7:]

                    # Most customers are active. A small fluctuating set remains overdue
                    # so the "needs attention" table and chart have realistic movement.
                    is_unresolved_issue = random.random() < 0.12
                    customer_status = "OVERDUE" if is_unresolved_issue else "ACTIVE"
                    subscription_status = "OVERDUE" if is_unresolved_issue else "ACTIVE"

                    insert_customer(
                        cur,
                        customer_id,
                        member_id,
                        first_name,
                        last_name,
                        email,
                        phone,
                        customer_status,
                        created_at,
                        home_wash_location_for_index(customer_index),
                    )
                    inserted["customers"] += 1

                    insert_vehicle(
                        cur,
                        vehicle_id,
                        customer_id,
                        random.randint(2017, 2026),
                        make,
                        model,
                        random.choice(colors),
                        plate,
                        created_at,
                    )

                    insert_subscription(
                        cur,
                        subscription_id,
                        customer_id,
                        plan_id,
                        subscription_status,
                        created_at,
                        created_at + timedelta(days=30),
                    )
                    inserted["subscriptions"] += 1

                    insert_subscription_vehicle(
                        cur,
                        coverage_id,
                        subscription_id,
                        vehicle_id,
                        created_at,
                    )

                    # Add paid membership payments from signup month through now.
                    # Later months naturally have more customers, so revenue trends up.
                    payment_date = created_at
                    while payment_date < datetime.utcnow():
                        purchase_id = make_id("purchasedash")
                        insert_purchase(
                            cur,
                            purchase_id,
                            customer_id,
                            vehicle_id,
                            subscription_id,
                            "MEMBERSHIP_PAYMENT",
                            "PAID",
                            money(monthly_price),
                            f"{plan_name} monthly membership payment.",
                            payment_date,
                        )
                        inserted["purchases"] += 1
                        payment_date += timedelta(days=30)

                    if is_unresolved_issue:
                        failed_at = random_date_in_month(month)
                        failed_purchase_id = make_id("purchasedash")
                        insert_purchase(
                            cur,
                            failed_purchase_id,
                            customer_id,
                            vehicle_id,
                            subscription_id,
                            "MEMBERSHIP_PAYMENT",
                            "FAILED",
                            money(monthly_price),
                            "Monthly membership payment failed.",
                            failed_at,
                        )
                        inserted["purchases"] += 1

                        insert_audit_event(
                            cur,
                            make_id("eventdash"),
                            customer_id,
                            "PAYMENT_FAILED",
                            "Membership payment failed.",
                            {"amount": str(monthly_price), "rootCause": "FAILED_MEMBERSHIP_PAYMENT"},
                            SYSTEM_ACTOR,
                            "SYSTEM",
                            failed_at,
                        )
                        insert_audit_event(
                            cur,
                            make_id("eventdash"),
                            customer_id,
                            "SUBSCRIPTION_OVERDUE",
                            "Subscription marked overdue after failed membership payment.",
                            {"licensePlate": plate},
                            SYSTEM_ACTOR,
                            "SYSTEM",
                            failed_at + timedelta(hours=1),
                        )
                        inserted["failed_issue_events"] += 2

                # Add month-level issue/fix events from the CSR on separate demo
                # customers so CSR fix impact has a visible time series.
                for issue_number in range(issue_count):
                    issue_customer_id = make_id("custdash")
                    issue_vehicle_id = make_id("vehicledash")
                    issue_subscription_id = make_id("subdash")
                    issue_coverage_id = make_id("coverdash")
                    plan_id, plan_name, monthly_price, _max_vehicles, _tier = random.choice(plans)
                    issue_date = random_date_in_month(month)
                    was_fixed = issue_number < fix_count

                    customer_index += 1
                    issue_first_name = random.choice(first_names)
                    issue_last_name = random.choice(last_names)
                    member_id = member_id_for_index(customer_index)
                    email = demo_email(issue_first_name, issue_last_name, customer_index)
                    plate = f"FIX{customer_index:04d}"[-7:]

                    insert_customer(
                        cur,
                        issue_customer_id,
                        member_id,
                        issue_first_name,
                        issue_last_name,
                        email,
                        f"470-555-{1000 + customer_index:04d}",
                        "ACTIVE" if was_fixed else "OVERDUE",
                        issue_date,
                        home_wash_location_for_index(customer_index),
                    )
                    inserted["customers"] += 1

                    make, model = random.choice(vehicles)
                    insert_vehicle(
                        cur,
                        issue_vehicle_id,
                        issue_customer_id,
                        random.randint(2018, 2026),
                        make,
                        model,
                        random.choice(colors),
                        plate,
                        issue_date,
                    )

                    insert_subscription(
                        cur,
                        issue_subscription_id,
                        issue_customer_id,
                        plan_id,
                        "ACTIVE" if was_fixed else "OVERDUE",
                        issue_date,
                        issue_date + timedelta(days=30),
                    )
                    inserted["subscriptions"] += 1

                    insert_subscription_vehicle(
                        cur,
                        issue_coverage_id,
                        issue_subscription_id,
                        issue_vehicle_id,
                        issue_date,
                    )

                    insert_purchase(
                        cur,
                        make_id("purchasedash"),
                        issue_customer_id,
                        issue_vehicle_id,
                        issue_subscription_id,
                        "MEMBERSHIP_PAYMENT",
                        "FAILED",
                        money(monthly_price),
                        "Monthly membership payment failed.",
                        issue_date,
                    )
                    inserted["purchases"] += 1

                    insert_audit_event(
                        cur,
                        make_id("eventdash"),
                        issue_customer_id,
                        "PAYMENT_FAILED",
                        "Membership payment failed.",
                        {"amount": str(monthly_price), "rootCause": "FAILED_MEMBERSHIP_PAYMENT"},
                        SYSTEM_ACTOR,
                        "SYSTEM",
                        issue_date,
                    )
                    insert_audit_event(
                        cur,
                        make_id("eventdash"),
                        issue_customer_id,
                        "SUBSCRIPTION_OVERDUE",
                        "Subscription marked overdue after failed membership payment.",
                        {"licensePlate": plate},
                        SYSTEM_ACTOR,
                        "SYSTEM",
                        issue_date + timedelta(hours=1),
                    )
                    inserted["failed_issue_events"] += 2

                    if was_fixed:
                        fixed_at = issue_date + timedelta(days=random.randint(1, 5))
                        insert_purchase(
                            cur,
                            make_id("purchasedash"),
                            issue_customer_id,
                            issue_vehicle_id,
                            issue_subscription_id,
                            "MEMBERSHIP_PAYMENT",
                            "PAID",
                            money(monthly_price),
                            "Recovered membership payment after CSR payment update.",
                            fixed_at,
                        )
                        inserted["purchases"] += 1

                        insert_audit_event(
                            cur,
                            make_id("eventdash"),
                            issue_customer_id,
                            "ACCOUNT_UPDATED",
                            "Payment method updated and failed membership payment retried.",
                            {
                                "paymentMethod": {
                                    "brand": random.choice(["Visa", "Mastercard", "Amex"]),
                                    "last4": str(random.randint(1000, 9999)),
                                    "expiry": "12/29",
                                },
                                "resolvedPayments": 1,
                                "recoveredRevenue": str(monthly_price),
                            },
                            CSR_ACTOR,
                            "CSR",
                            fixed_at,
                        )
                        inserted["csr_fix_events"] += 1

        conn.commit()

    print("Dashboard time-series seed complete.")
    print(f"Deleted previous dashboard demo customers: {deleted}")
    for key, value in inserted.items():
        print(f"Inserted {key}: {value}")


if __name__ == "__main__":
    main()
