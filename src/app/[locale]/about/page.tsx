"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

const timeline = [
  { year: "2018", desc: "Project conceived by a group of open-source enthusiasts" },
  { year: "2019", desc: "First prototype built on Debian base with custom GTK theme" },
  { year: "2020", desc: "Alpha release with basic desktop environment" },
  { year: "2021", desc: "Wayland integration begins; community grows to 100+ contributors" },
  { year: "2022", desc: "Beta testing phase; redesigned UI and app ecosystem" },
  { year: "2023", desc: "Performance optimization; security audit; 10K+ downloads" },
  { year: "2024", desc: "Release candidate; enterprise partnerships begin" },
  { year: "2025", desc: "Infrastructure scaling; translation into 20+ languages" },
  { year: "2026", desc: "Lingmo OS 1.0 released — a new standard for open-source desktops" },
];

export default function AboutPage() {
  const t = useTranslations("about");

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
              Lingmo OS began as a small project with a big vision: to create an operating system that combines elegance, performance, and freedom. Our journey started in 2018 when a group of open-source enthusiasts came together to build something truly different.
            </p>
            <p className="mt-4 text-muted dark:text-muted-dark leading-relaxed">
              Today, Lingmo OS is developed by a global community of contributors and used by thousands of people worldwide. We remain committed to our founding principles: simplicity, transparency, and user empowerment.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <h3 className="text-lg font-semibold text-primary">{t("mission")}</h3>
              <p className="mt-2 text-sm text-muted dark:text-muted-dark">
                To provide a free, open-source operating system that respects user privacy and delivers an exceptional computing experience.
              </p>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-accent">{t("vision")}</h3>
              <p className="mt-2 text-sm text-muted dark:text-muted-dark">
                A world where everyone has access to powerful, elegant, and secure computing tools, free from corporate control.
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
                key={item.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`flex items-center gap-8 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                <div className="flex-1">
                  <Card className={i % 2 === 0 ? "text-right" : "text-left"}>
                    <h3 className="text-xl font-bold text-primary">{item.year}</h3>
                    <p className="mt-1 text-muted dark:text-muted-dark">{item.desc}</p>
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
          {[
            { title: "Kernel", desc: "Linux kernel with custom patches for optimal performance and hardware support." },
            { title: "Desktop", desc: "Lingmo Desktop Environment built with GTK4, featuring Wayland compositor." },
            { title: "Applications", desc: "Curated suite of applications designed for productivity and creativity." },
          ].map((layer) => (
            <Card key={layer.title} className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <span className="text-2xl font-bold text-primary">{layer.title[0]}</span>
              </div>
              <h3 className="font-semibold">{layer.title}</h3>
              <p className="mt-2 text-sm text-muted dark:text-muted-dark">{layer.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="bg-black/[0.02] dark:bg-white/[0.02]">
        <h2 className="mb-8 text-center text-2xl font-bold">{t("roadmap")}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "Q3 2026", items: ["Wayland performance improvements", "New default applications", "Hardware certification program"] },
            { title: "Q4 2026", items: ["Mobile form factor support", "Cloud sync integration", "Enterprise management tools"] },
            { title: "2027", items: ["ARM64 native support", "AI-powered desktop assistant", "Community package repository"] },
          ].map((quarter) => (
            <Card key={quarter.title}>
              <h3 className="font-semibold text-primary">{quarter.title}</h3>
              <ul className="mt-4 space-y-2">
                {quarter.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted dark:text-muted-dark">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
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
