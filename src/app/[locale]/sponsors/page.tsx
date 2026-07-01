"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Section, SectionHeader, SectionTitle, SectionDescription } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Link } from "@/i18n/navigation";

const sponsorsByTier = [
  {
    tier: "platinum",
    color: "text-slate-300",
    bg: "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700",
    items: [
      { name: "Linux Foundation", amount: "$100,000" },
    ],
  },
  {
    tier: "gold",
    color: "text-yellow-500",
    bg: "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/20",
    items: [
      { name: "Debian Project", amount: "$50,000" },
      { name: "GNOME Foundation", amount: "$40,000" },
    ],
  },
  {
    tier: "silver",
    color: "text-gray-400",
    bg: "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/20",
    items: [
      { name: "KDE e.V.", amount: "$20,000" },
      { name: "Cloudflare", amount: "$15,000" },
    ],
  },
  {
    tier: "bronze",
    color: "text-amber-700",
    bg: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10",
    items: [
      { name: "GitHub", amount: "$10,000" },
      { name: "Vercel", amount: "$8,000" },
      { name: "JetBrains", amount: "$5,000" },
    ],
  },
];

export default function SponsorsPage() {
  const t = useTranslations("sponsors");

  return (
    <>
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDescription")}
        breadcrumbs={[{ label: t("pageTitle") }]}
      />

      <Section>
        <div className="space-y-12">
          {sponsorsByTier.map((tier) => (
            <div key={tier.tier}>
              <h3 className={`mb-6 text-center text-2xl font-bold capitalize ${tier.color}`}>{tier.tier}</h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {tier.items.map((sponsor, i) => (
                  <motion.div
                    key={sponsor.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <Card className={`text-center ${tier.bg}`}>
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto">
                        <span className="text-2xl font-bold text-primary">{sponsor.name[0]}</span>
                      </div>
                      <h4 className="mt-4 font-semibold">{sponsor.name}</h4>
                      <p className="mt-1 text-sm text-muted dark:text-muted-dark">{sponsor.amount}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-black/[0.02] dark:bg-white/[0.02] text-center">
        <SectionHeader>
          <SectionTitle>{t("becomeSponsor")}</SectionTitle>
          <SectionDescription>Support Lingmo OS development and get your logo here</SectionDescription>
        </SectionHeader>
        <Link href="/donate">
          <Button variant="primary" size="lg">
            {t("becomeSponsor")}
          </Button>
        </Link>
      </Section>
    </>
  );
}
