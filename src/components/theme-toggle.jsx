"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

function getPreferredTheme() {
  if (typeof window === "undefined") return false;
  const storedTheme = window.localStorage.getItem("amp-theme");
  return storedTheme
    ? storedTheme === "dark"
    : window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(getPreferredTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  function toggleTheme() {
    const nextDark = !isDark;
    document.documentElement.classList.toggle("dark", nextDark);
    window.localStorage.setItem("amp-theme", nextDark ? "dark" : "light");
    setIsDark(nextDark);
  }

  return (
    <button
      aria-label="Toggle color theme"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-primary hover:text-primary"
      onClick={toggleTheme}
      type="button"
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
