"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function Card({ children, className = "" }) {
  return (
    <section className={joinClasses("rounded-3xl border border-border bg-card shadow-sm shadow-slate-950/5", className)}>
      {children}
    </section>
  );
}

export function CardHeader({ children, className = "" }) {
  return <div className={joinClasses("border-b border-border/80 px-5 py-4", className)}>{children}</div>;
}

export function CardTitle({ children, className = "" }) {
  return <h2 className={joinClasses("text-sm font-semibold tracking-wide text-foreground", className)}>{children}</h2>;
}

export function CardDescription({ children, className = "" }) {
  return <p className={joinClasses("mt-1 text-sm text-muted", className)}>{children}</p>;
}

export function CardContent({ children, className = "" }) {
  return <div className={joinClasses("px-5 py-4", className)}>{children}</div>;
}

export function Badge({ children, tone = "default", className = "" }) {
  const toneClass =
    {
      default: "border-border bg-surface text-foreground",
      success: "border-emerald-200 bg-emerald-50 text-emerald-800",
      warning: "border-amber-200 bg-amber-50 text-amber-800",
      critical: "border-red-200 bg-red-50 text-red-700",
      brand: "border-white/15 bg-white/10 text-white",
      info: "border-blue-200 bg-blue-50 text-blue-700",
    }[tone] || "border-border bg-surface text-foreground";

  return (
    <span className={joinClasses("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", toneClass, className)}>
      {children}
    </span>
  );
}

export function Button({
  children,
  className = "",
  disabled = false,
  tone = "primary",
  type = "button",
  ...props
}) {
  const toneClass =
    {
      primary: "bg-primary text-primary-foreground hover:brightness-95",
      secondary: "border border-border bg-card text-foreground hover:border-primary/40 hover:bg-surface",
      danger: "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
      ghost: "text-foreground hover:bg-surface",
    }[tone] || "bg-primary text-primary-foreground hover:brightness-95";

  return (
    <button
      className={joinClasses(
        "inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        toneClass,
        className,
      )}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={joinClasses(
        "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={joinClasses(
        "min-h-28 w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ children, className = "", ...props }) {
  return (
    <label className={joinClasses("grid gap-2 text-sm font-medium text-foreground", className)} {...props}>
      {children}
    </label>
  );
}

export function Separator({ className = "" }) {
  return <div className={joinClasses("h-px w-full bg-border", className)} aria-hidden="true" />;
}

export function Alert({ children, tone = "warning", className = "" }) {
  const toneClass =
    {
      warning: "border-amber-200 bg-amber-50 text-amber-900",
      critical: "border-red-200 bg-red-50 text-red-800",
      success: "border-emerald-200 bg-emerald-50 text-emerald-800",
      info: "border-blue-200 bg-blue-50 text-blue-800",
    }[tone] || "border-amber-200 bg-amber-50 text-amber-900";

  return <div className={joinClasses("rounded-2xl border px-4 py-3 text-sm", toneClass, className)}>{children}</div>;
}

export function DialogShell({ children, description, onOpenChange, open, title, widthClass = "sm:max-w-xl" }) {
  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/28 backdrop-blur-[2px] transition-all duration-200 data-[state=closed]:opacity-0 data-[state=open]:opacity-100" />
        <Dialog.Content
          className={joinClasses(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-card shadow-2xl transition-all duration-200 ease-out data-[state=closed]:scale-[0.985] data-[state=closed]:opacity-0 data-[state=closed]:translate-y-[-47%] data-[state=open]:scale-100 data-[state=open]:opacity-100 data-[state=open]:translate-y-[-50%]",
            widthClass,
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-foreground">{title}</Dialog.Title>
              {description ? <Dialog.Description className="mt-1 text-sm text-muted">{description}</Dialog.Description> : null}
            </div>
            <Dialog.Close asChild>
              <button className="rounded-xl p-2 text-muted transition hover:bg-surface hover:text-foreground" type="button">
                <X aria-hidden="true" size={18} />
                <span className="sr-only">Close dialog</span>
              </button>
            </Dialog.Close>
          </div>
          <div className="max-h-[80vh] overflow-y-auto px-5 py-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
