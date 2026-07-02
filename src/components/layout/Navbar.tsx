"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useScrollY } from "@/hooks/useScrollY";

const navLinks = [
  { href: "/about", key: "about" },
  { href: "/download", key: "download" },
  { href: "/documentation", key: "documentation" },
  { href: "/releases", key: "releases" },
  { href: "/blog", key: "blog" },
  { href: "/community", key: "community" },
  { href: "/donate", key: "donate" },
];

interface NavbarProps {
  onSearchOpen: () => void;
}

export function Navbar({ onSearchOpen }: NavbarProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const scrollY = useScrollY();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isScrolled = scrollY > 20;

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-40 transition-all duration-300",
        isScrolled
          ? "glass shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <img src="/logo-dark.svg" alt="Lingmo OS" className="h-8 w-auto block dark:hidden" />
          <img src="/logo-light.svg" alt="Lingmo OS" className="h-8 w-auto hidden dark:block" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-xl px-4 py-2 text-sm transition-colors",
                pathname.startsWith(link.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted dark:text-muted-dark hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground dark:hover:text-foreground-dark"
              )}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onSearchOpen}
            className="rounded-xl p-2 text-muted dark:text-muted-dark hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <ThemeSwitcher className="hidden sm:flex" />
          <LanguageSwitcher className="hidden sm:flex" />
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-xl p-2 text-muted dark:text-muted-dark hover:bg-black/5 dark:hover:bg-white/5 md:hidden"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-80 max-w-[85vw] glass shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-border dark:border-border-dark">
                <span className="font-semibold">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl p-2 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-sm transition-colors",
                      pathname.startsWith(link.href)
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                  >
                    {t(link.key)}
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-border dark:border-border-dark space-y-3">
                <ThemeSwitcher className="w-full justify-center" />
                <LanguageSwitcher className="w-full justify-center" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
