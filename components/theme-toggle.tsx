"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";

function getInitialTheme() {
  if (typeof window === "undefined") return "light";

  const stored = window.localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;

  return "light"; // Default to light mode
}

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<"dark" | "light">("light");

  React.useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);

    const root = document.documentElement;
    if (initial === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
      window.localStorage.setItem("theme", "light"); // Explicitly set if no value
    }
  }, []);

  function toggle() {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      const root = document.documentElement;
      root.classList.toggle("dark", next === "dark");
      root.classList.toggle("light", next === "light");
      window.localStorage.setItem("theme", next);
      return next;
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary transition-colors hover:bg-primary/15"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

