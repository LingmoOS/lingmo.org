"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export default function AboutPage() {
  const t = useTranslations("about");

  const timeline = [
    { yearKey: "timeline2023Year", descKey: "timeline2023Desc" },
    { yearKey: "timeline2024Year", descKey: "timeline2024Desc" },
    { yearKey: "timeline2025Year", descKey: "timeline2025Desc" },
    { yearKey: "timeline2026Year", descKey: "timeline2026Desc" },
  ];

  const archLayers = [
    { titleKey: "archKernelTitle", descKey: "archKernelDesc", initial: "K" },
    { titleKey: "archDesktopTitle", descKey: "archDesktopDesc", initial: "D" },
    { titleKey: "archAppsTitle", descKey: "archAppsDesc", initial: "A" },
  ];

  const roadmapQuarters = [
    { titleKey: "roadQ32026Title", itemKeys: ["roadQ32026Item1", "roadQ32026Item2", "roadQ32026Item3"] },
    { titleKey: "roadQ42026Title", itemKeys: ["roadQ42026Item1", "roadQ42026Item2", "roadQ42026Item3"] },
    { titleKey: "road2027Title", itemKeys: ["road2027Item1", "road2027Item2", "road2027Item3"] },
  ];

  return (
    <>
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDescription")}
        breadcrumbs={[{ label: t("pageTitle") }]}
      />

      <Section>
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">{t("story")}</h2>
            <p className="mt-4 text-muted dark:text-muted-dark leading-relaxed">
              {t("storyText")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <h3 className="text-lg font-semibold text-primary">{t("mission")}</h3>
              <p className="mt-2 text-sm text-muted dark:text-muted-dark">
                {t("missionText")}
              </p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-accent">{t("vision")}</h3>
              <p className="mt-2 text-sm text-muted dark:text-muted-dark">
                {t("visionText")}
              </p>
            </Card>
          </div>
        </div>
      </Section>

      <Section className="bg-black/[0.02] dark:bg-white/[0.02]">
        <h2 className="mb-12 text-center text-2xl font-bold">{t("timeline")}</h2>
        <div className="relative">
          <div className="absolute left-1/2 top-0 h-full w-px bg-border dark:bg-border-dark hidden md:block" />
          <div className="space-y-8">
            {timeline.map((item, i) => (
              <motion.div
                key={item.yearKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`flex items-center gap-8 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                <div className="flex-1">
                  <Card className={i % 2 === 0 ? "text-right" : "text-left"}>
                    <h3 className="text-xl font-bold text-primary">{t(item.yearKey)}</h3>
                    <p className="mt-1 text-muted dark:text-muted-dark">{t(item.descKey)}</p>
                  </Card>
                </div>
                <div className="hidden md:flex h-4 w-4 rounded-full bg-primary shrink-0 shadow-lg shadow-primary/30" />
                <div className="flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <h2 className="mb-8 text-center text-2xl font-bold">{t("architecture")}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {archLayers.map((layer) => (
            <Card key={layer.titleKey} className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <span className="text-2xl font-bold text-primary">{layer.initial}</span>
              </div>
              <h3 className="font-semibold">{t(layer.titleKey)}</h3>
              <p className="mt-2 text-sm text-muted dark:text-muted-dark">{t(layer.descKey)}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="bg-black/[0.02] dark:bg-white/[0.02]">
        <h2 className="mb-8 text-center text-2xl font-bold">{t("roadmap")}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {roadmapQuarters.map((quarter) => (
            <Card key={quarter.titleKey}>
              <h3 className="font-semibold text-primary">{t(quarter.titleKey)}</h3>
              <ul className="mt-4 space-y-2">
                {quarter.itemKeys.map((itemKey) => (
                  <li key={itemKey} className="flex items-start gap-2 text-sm text-muted dark:text-muted-dark">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {t(itemKey)}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
