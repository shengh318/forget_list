"use client";

import { useEffect, useState } from "react";

function getInitialTheme(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem("theme");
  if (stored === "light") return false;
  if (stored === "dark") return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function ThemeToggle() {
  const [dark, setDark] = useState(getInitialTheme);

  useEffect(() => {
    const theme = dark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [dark]);

  return (
    <button
      onClick={() => setDark((prev) => !prev)}
      aria-label="Toggle theme"
      className="theme-toggle"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
