"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Download, ShieldCheck, Monitor, Cpu, HardDrive } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { DownloadDialog } from "@/components/download/DownloadDialog";
import type { DownloadConfig } from "@/types";

const systemRequirements = [
  { icon: Cpu, label: "Processor", value: "Dual-core 2GHz or better" },
  { icon: HardDrive, label: "Memory", value: "4GB RAM (8GB recommended)" },
  { icon: Monitor, label: "Storage", value: "20GB (64GB recommended)" },
  { icon: ShieldCheck, label: "Graphics", value: "OpenGL 3.3+ capable GPU" },
];

const historicalVersions = [
  { version: "2.0.24", date: "2026-05-15", type: "stable" },
  { version: "2.0.23", date: "2026-04-01", type: "stable" },
  { version: "2.0.22", date: "2026-02-15", type: "stable" },
];

const downloadTypes = ["stable", "beta", "nightly"] as const;

export default function DownloadPage() {
  const t = useTranslations("download");
  const [config, setConfig] = useState<DownloadConfig | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetch("/content/downloads.json")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => {});
  }, []);

  const versionByType = (type: string) => config?.versions.find((v) => v.type === type);

  return (
    <>
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDescription")}
        breadcrumbs={[{ label: t("pageTitle") }]}
      />

      {/* All Release Types */}
      <Section>
        <div className="grid gap-8 md:grid-cols-3">
          {downloadTypes.map((type, i) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="relative text-center h-full flex flex-col">
                {type === "stable" && (
                  <span className="absolute -top-2 right-4 rounded-full bg-success px-3 py-0.5 text-xs font-medium text-white">
                    {t("recommended")}
                  </span>
                )}
                <h3 className="text-2xl font-bold">{t(type)}</h3>
                {(() => {
                  const v = versionByType(type);
                  if (!v) return null;
                  return (
                    <>
                      <p className="mt-2 text-4xl font-bold text-primary">{v.version}</p>
                      <p className="mt-1 text-sm text-muted dark:text-muted-dark">
                        {t("releaseDate")}: {v.releaseDate}
                      </p>
                    </>
                  );
                })()}
                <div className="mt-6 space-y-3 flex-1 flex flex-col justify-end">
                  {type === "stable" && (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => setDialogOpen(true)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {t("downloadButton")}
                    </Button>
                  )}
                  {type !== "stable" && (
                    <Button variant="outline" className="w-full" disabled>
                      {t("comingSoon")}
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* System Requirements */}
      <Section className="bg-black/[0.02] dark:bg-white/[0.02]">
        <h2 className="mb-8 text-center text-2xl font-bold">{t("systemRequirements")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {systemRequirements.map((req) => (
            <Card key={req.label} className="text-center">
              <req.icon className="mx-auto h-8 w-8 text-primary" />
              <h3 className="mt-3 font-semibold">{req.label}</h3>
              <p className="mt-1 text-sm text-muted dark:text-muted-dark">{req.value}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Historical Versions */}
      <Section>
        <h2 className="mb-8 text-center text-2xl font-bold">{t("historicalVersions")}</h2>
        <div className="mx-auto max-w-2xl space-y-3">
          {historicalVersions.map((v) => (
            <Card key={v.version} className="flex items-center justify-between">
              <div>
                <span className="font-semibold">{v.version}</span>
                <span className="ml-2 text-xs text-muted dark:text-muted-dark">{v.date}</span>
                <span className={`ml-2 text-xs ${v.type === "stable" ? "text-success" : v.type === "beta" ? "text-warning" : "text-muted"}`}>
                  {v.type}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setDialogOpen(true)}>
                <Download className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      </Section>

      <DownloadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        config={config}
      />
    </>
  );
}
