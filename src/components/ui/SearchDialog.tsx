"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Search, X, FileText, Book, Download, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SearchResult {
  title: string;
  href: string;
  icon: "file" | "book" | "download";
  description?: string;
}

const allResults: SearchResult[] = [
  { title: "About Lingmo OS", href: "/about", icon: "file", description: "Learn about our story and mission" },
  { title: "Download Lingmo OS", href: "/download", icon: "download", description: "Get the latest version" },
  { title: "Documentation", href: "/documentation", icon: "book", description: "Guides and references" },
  { title: "Release Notes", href: "/releases", icon: "file", description: "Version history" },
  { title: "Blog", href: "/blog", icon: "file", description: "Latest news and updates" },
  { title: "Community", href: "/community", icon: "file", description: "Join the community" },
  { title: "Gallery", href: "/gallery", icon: "file", description: "Screenshots and media" },
  { title: "Donate", href: "/donate", icon: "file", description: "Support the project" },
  { title: "FAQ", href: "/faq", icon: "book", description: "Frequently asked questions" },
  { title: "Privacy Policy", href: "/privacy", icon: "file", description: "How we handle data" },
  { title: "License", href: "/license", icon: "file", description: "Open source license" },
];

const iconMap = {
  file: FileText,
  book: Book,
  download: Download,
};

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const t = useTranslations("search");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const results = allResults.filter(
    (r) =>
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.description?.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = useCallback(
    (href: string) => {
      router.push(href);
      onClose();
    },
    [router, onClose]
  );

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && results[selectedIndex]) {
        handleSelect(results[selectedIndex].href);
      }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, results, selectedIndex, handleSelect, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[15vh] backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg overflow-hidden rounded-2xl glass shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border dark:border-border-dark px-4 py-3">
              <Search className="h-5 w-5 text-muted dark:text-muted-dark" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("inputPlaceholder")}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted dark:placeholder:text-muted-dark"
              />
              <button onClick={onClose} className="rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/5">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted dark:text-muted-dark">{t("noResults")}</p>
              ) : (
                results.map((result, i) => {
                  const Icon = iconMap[result.icon];
                  return (
                    <button
                      key={result.href}
                      onClick={() => handleSelect(result.href)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        i === selectedIndex
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-black/5 dark:hover:bg-white/5"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{result.title}</p>
                        {result.description && (
                          <p className="text-xs text-muted dark:text-muted-dark">{result.description}</p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100" />
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
