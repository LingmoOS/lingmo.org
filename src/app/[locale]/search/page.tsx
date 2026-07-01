"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Search, FileText, Book, Download, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const searchIndex = [
  { title: "About Lingmo OS", href: "/about", icon: FileText, description: "Learn about our story, mission, and vision" },
  { title: "Download Lingmo OS", href: "/download", icon: Download, description: "Get the latest stable, beta, or nightly build" },
  { title: "Documentation", href: "/documentation", icon: Book, description: "Guides, tutorials, and reference documentation" },
  { title: "Release Notes", href: "/releases", icon: FileText, description: "Version history and changelog" },
  { title: "Blog", href: "/blog", icon: FileText, description: "Latest news, updates, and articles" },
  { title: "Community", href: "/community", icon: FileText, description: "Join our community on Discord, Matrix, and more" },
  { title: "Gallery", href: "/gallery", icon: FileText, description: "Screenshots and media gallery" },
  { title: "Donate", href: "/donate", icon: FileText, description: "Support the project financially" },
  { title: "Sponsors", href: "/sponsors", icon: FileText, description: "Our generous sponsors and partners" },
  { title: "FAQ", href: "/faq", icon: Book, description: "Frequently asked questions" },
  { title: "Privacy Policy", href: "/privacy", icon: FileText, description: "How we handle your data" },
  { title: "License", href: "/license", icon: FileText, description: "GNU General Public License v3.0" },
];

export default function SearchPage() {
  const t = useTranslations("search");
  const [query, setQuery] = useState("");

  const results = useMemo(
    () =>
      query.trim()
        ? searchIndex.filter(
            (item) =>
              item.title.toLowerCase().includes(query.toLowerCase()) ||
              item.description.toLowerCase().includes(query.toLowerCase())
          )
        : searchIndex,
    [query]
  );

  return (
    <>
      <PageHeader
        title={t("pageTitle")}
        breadcrumbs={[{ label: t("pageTitle") }]}
      />
      <Section>
        {/* Search Input */}
        <div className="mx-auto mb-8 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted dark:text-muted-dark" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("inputPlaceholder")}
              className="w-full rounded-2xl glass px-12 py-4 text-lg outline-none placeholder:text-muted dark:placeholder:text-muted-dark"
            />
          </div>
        </div>

        {/* Results */}
        {query && (
          <p className="mb-6 text-center text-sm text-muted dark:text-muted-dark">
            {t("resultsFor")} &ldquo;{query}&rdquo; ({results.length} results)
          </p>
        )}

        <div className="mx-auto max-w-2xl space-y-3">
          {results.map((item, i) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
            >
              <Link href={item.href}>
                <Card className="flex items-center gap-4 p-4 transition-all hover:border-primary/30">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted dark:text-muted-dark truncate">{item.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted dark:text-muted-dark" />
                </Card>
              </Link>
            </motion.div>
          ))}
          {results.length === 0 && (
            <p className="py-12 text-center text-muted dark:text-muted-dark">{t("noResults")}</p>
          )}
        </div>
      </Section>
    </>
  );
}
