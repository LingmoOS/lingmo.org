"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Tag, Calendar, GitBranch } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const releases = [
  { version: "1.0.0", date: "2026-06-15", type: "stable", title: "Inception", content: "Initial stable release. Based on Debian 13 with Lingmo Desktop Environment." },
  { version: "1.1.0-beta", date: "2026-07-01", type: "beta", title: "Refinement", content: "New settings panel, updated kernel 6.9, performance improvements." },
];

export default function ReleasesPage() {
  const t = useTranslations("releases");

  return (
    <>
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDescription")}
        breadcrumbs={[{ label: t("pageTitle") }]}
      />
      <Section>
        <div className="space-y-6">
          {releases.map((release, i) => (
            <motion.div
              key={release.version}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold">{release.version}</h3>
                      <span className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium",
                        release.type === "stable" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                      )}>
                        {release.type}
                      </span>
                    </div>
                    <p className="mt-1 text-lg text-primary font-medium">{release.title}</p>
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted dark:text-muted-dark">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {release.date}
                      </span>
                    </div>
                    <p className="mt-3 text-muted dark:text-muted-dark">{release.content}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <Link href={`/download`}>
                    <Button variant="primary" size="sm">
                      {t("viewDetails")}
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>
    </>
  );
}
