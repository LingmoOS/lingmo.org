"use client";

import { createContext, useContext, useMemo } from "react";
import { useTheme } from "@/hooks/useTheme";

type ThemeContextType = ReturnType<typeof useTheme>;

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const value = useMemo(() => theme, [theme]);
  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used within ThemeProvider");
  return ctx;
}
