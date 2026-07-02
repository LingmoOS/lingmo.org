"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { ReleaseNote } from "@/types";

export default function ReleasesPage() {
  const t = useTranslations("releases");

  const [releases, setReleases] = useState<ReleaseNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/content/releases.json")
      .then((res) => res.json() as Promise<ReleaseNote[]>)
      .then((data) => {
        setReleases(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDescription")}
        breadcrumbs={[{ label: t("pageTitle") }]}
      />
      <Section>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
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
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Link href={`/releases/${release.version}`}>
                      <Button variant="primary" size="sm">
                        {t("viewDetails")}
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
