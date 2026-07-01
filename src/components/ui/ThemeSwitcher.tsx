"use client";

import { motion } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";
import { useThemeContext } from "./ThemeProvider";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light" as const, icon: Sun, label: "Light" },
  { value: "dark" as const, icon: Moon, label: "Dark" },
  { value: "auto" as const, icon: Monitor, label: "Auto" },
];

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useThemeContext();

  return (
    <div className={cn("flex items-center gap-1 rounded-xl glass p-1", className)}>
      {themes.map(({ value, icon: Icon, label }) => (
        <motion.button
          key={value}
          onClick={() => setTheme(value)}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "rounded-lg p-2 transition-colors",
            theme === value
              ? "bg-primary text-white"
              : "text-muted dark:text-muted-dark hover:text-foreground dark:hover:text-foreground-dark"
          )}
          aria-label={label}
        >
          <Icon className="h-4 w-4" />
        </motion.button>
      ))}
    </div>
  );
}
