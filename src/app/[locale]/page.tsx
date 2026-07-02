"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight, Download, Github, MessageCircle, Globe, Code2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Section, SectionHeader, SectionTitle, SectionDescription } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { HeroSvg } from "@/components/svg/HeroSvg";
import { FeatureSvg } from "@/components/svg/FeatureSvg";
import { GallerySvg } from "@/components/svg/GallerySvg";
import { NewsCoverSvg } from "@/components/svg/NewsCoverSvg";
import { useInView } from "@/hooks/useInView";

const features = [
  { type: "performance" as const, key: "performance" },
  { type: "security" as const, key: "security" },
  { type: "developer" as const, key: "developer" },
  { type: "design" as const, key: "design" },
  { type: "open-source" as const, key: "openSource" },
  { type: "community" as const, key: "communityDriven" },
];

const screenshotCategories = ["desktop", "settings", "terminal", "store", "file-manager", "wallpaper"] as const;

const stats = [
  { end: 1000000, suffix: "+", key: "downloads" },
  { end: 500, suffix: "+", key: "contributors" },
  { end: 85000, suffix: "+", key: "packages" },
  { end: 190, suffix: "+", key: "countries" },
];

export default function HomePage() {
  const t = useTranslations();
  const { ref: statsRef, inView: statsInView } = useInView();

  return (
    <>
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="pointer-events-none absolute -right-60 -top-60 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl hero-title">
                Lingmo OS
              </h1>
              <p className="mt-4 text-xl text-muted dark:text-muted-dark sm:text-2xl">
                {t("hero.subtitle")}
              </p>
              <p className="mt-2 text-lg text-muted dark:text-muted-dark">
                {t("hero.description")}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/download">
                  <Button variant="primary" size="lg">
                    <Download className="mr-2 h-5 w-5" />
                    {t("hero.downloadCta")}
                  </Button>
                </Link>
                <Link href="/documentation">
                  <Button variant="glass" size="lg">
                    {t("hero.docsCta")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <HeroSvg />
            </motion.div>
          </div>
        </div>
      </section>

      <Section>
        <SectionHeader>
          <SectionTitle>{t("features.title")}</SectionTitle>
          <SectionDescription>{t("features.description")}</SectionDescription>
        </SectionHeader>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="h-full">
                <FeatureSvg type={feature.type} />
                <h3 className="mt-4 text-lg font-semibold">{t(`features.items.${feature.key}.title`)}</h3>
                <p className="mt-2 text-sm text-muted dark:text-muted-dark">
                  {t(`features.items.${feature.key}.description`)}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section className="bg-black/[0.02] dark:bg-white/[0.02]">
        <SectionHeader>
          <SectionTitle>{t("gallery.pageTitle")}</SectionTitle>
          <SectionDescription>{t("gallery.pageDescription")}</SectionDescription>
        </SectionHeader>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {screenshotCategories.map((cat, i) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card glass={false} hover={false} className="overflow-hidden p-0">
                <GallerySvg category={cat} />
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/gallery">
            <Button variant="glass">
              {t("common.viewAll")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle>{t("download.pageTitle")}</SectionTitle>
          <SectionDescription>{t("download.pageDescription")}</SectionDescription>
        </SectionHeader>
        <div className="grid gap-6 md:grid-cols-3">
          {["stable", "beta", "nightly"].map((type, i) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="text-center">
                <h3 className="text-xl font-bold">{t(`download.${type}`)}</h3>
                <p className="mt-2 text-3xl font-bold text-primary">1.0.0</p>
                <p className="mt-1 text-sm text-muted dark:text-muted-dark">{t("download.releaseDate")}: 2026-06-15</p>
                <div className="mt-6 space-y-2">
                  <Link href={`/download`}>
                    <Button variant="primary" className="w-full">
                      {t("download.downloadButton")}
                    </Button>
                  </Link>
                </div>
                <Link href={`/download`}>
                  <Button variant="ghost" size="sm" className="mt-2">
                    {t("download.releaseNotes")}
                  </Button>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section className="bg-black/[0.02] dark:bg-white/[0.02]">
        <div ref={statsRef} className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.key} className="text-center">
              <div className="text-4xl font-bold text-primary md:text-5xl">
                <AnimatedCounter end={stat.end} suffix={stat.suffix} />
              </div>
              <p className="mt-2 text-sm text-muted dark:text-muted-dark">
                {t(`common.${stat.key}`)}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle>{t("blog.pageTitle")}</SectionTitle>
          <SectionDescription>{t("blog.pageDescription")}</SectionDescription>
        </SectionHeader>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card hover={true} className="overflow-hidden p-0">
                <NewsCoverSvg />
                <div className="p-5">
                  <p className="text-xs text-muted dark:text-muted-dark">June {15 + i}, 2026</p>
                  <h3 className="mt-2 font-semibold">Lingmo OS Update {i}</h3>
                  <p className="mt-1 text-sm text-muted dark:text-muted-dark line-clamp-2">
                    Latest news and updates from the Lingmo OS development team.
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/blog">
            <Button variant="glass">
              {t("common.viewAll")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Section>

      <Section className="bg-black/[0.02] dark:bg-white/[0.02]">
        <SectionHeader>
          <SectionTitle>{t("community.pageTitle")}</SectionTitle>
          <SectionDescription>{t("community.pageDescription")}</SectionDescription>
        </SectionHeader>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            { icon: Github, href: "https://github.com/LingmoOS", key: "github" },
            { icon: MessageCircle, href: "https://discord.gg/lingmo", key: "discord" },
            { icon: Globe, href: "https://t.me/lingmo", key: "telegram" },
            { icon: Code2, href: "https://matrix.to/#/#lingmo:matrix.org", key: "matrix" },
          ].map((item) => (
            <a key={item.key} href={item.href} target="_blank" rel="noopener noreferrer">
              <Button variant="glass" size="lg">
                <item.icon className="mr-2 h-5 w-5" />
                {t(`community.join${item.key.charAt(0).toUpperCase() + item.key.slice(1)}`)}
              </Button>
            </a>
          ))}
        </div>
      </Section>
    </>
  );
}
