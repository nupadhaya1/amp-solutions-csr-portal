"use client";

import { useFormStatus } from "react-dom";
import { LoaderCircle, RotateCcw } from "lucide-react";

export function ResetMockDataButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-95 disabled:cursor-wait disabled:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <LoaderCircle size={17} aria-hidden="true" className="animate-spin" />
      ) : (
        <RotateCcw size={17} aria-hidden="true" />
      )}
      {pending ? "Resetting..." : "Reset mock data"}
    </button>
  );
}
