import { useState, useEffect, useCallback } from "react";

// Reads theme synchronously on first render (client-only, no SSR flash)
function getInitialTheme(): boolean {
  if (typeof window === "undefined") return true; // SSR default
  const saved = localStorage.getItem("theme");
  if (saved === "light") return false;
  if (saved === "dark")  return true;
  // System preference fallback
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function useTheme() {
  const [isDark, setIsDark] = useState<boolean>(getInitialTheme);

  // Apply class on mount and whenever isDark changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggle = useCallback(() => setIsDark((v) => !v), []);

  return { isDark, toggle };
}
