"use client";

import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark" | "auto";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("auto");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("lingmo-theme") as Theme | null;
    if (stored) setThemeState(stored);
  }, []);

  const applyTheme = useCallback((t: Theme) => {
    const isDark =
      t === "dark" || (t === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
    setResolved(isDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    if (theme !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("auto");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, applyTheme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem("lingmo-theme", t);
  }, []);

  return { theme, setTheme, resolved };
}
