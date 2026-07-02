"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Heart, Github, CreditCard, Wallet, Banknote } from "lucide-react";
import { Section, SectionHeader, SectionTitle, SectionDescription } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";

const donateMethods = [
  { icon: Github, title: "GitHub Sponsors", description: "Sponsor via GitHub", href: "https://github.com/sponsors/LingmoOS" },
  { icon: CreditCard, title: "OpenCollective", description: "Open collective funding", href: "https://opencollective.com/lingmo" },
  { icon: Wallet, title: "PayPal", description: "One-time or monthly via PayPal", href: "https://paypal.me/lingmo" },
  { icon: Banknote, title: "Alipay", description: "支付宝扫码支付" },
  { icon: Banknote, title: "WeChat Pay", description: "微信支付" },
  { icon: CreditCard, title: "Bank Transfer", description: "Direct bank transfer" },
];

export default function DonatePage() {
  const t = useTranslations("donate");

  return (
    <>
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDescription")}
        breadcrumbs={[{ label: t("pageTitle") }]}
      />

      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {donateMethods.map((method, i) => (
            <motion.div
              key={method.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="h-full text-center flex flex-col">
                <method.icon className="mx-auto h-12 w-12 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{method.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted dark:text-muted-dark">{method.description}</p>
                {method.href ? (
                  <a href={method.href} target="_blank" rel="noopener noreferrer" className="mt-4 block">
                    <Button variant="primary" className="w-full">
                      {t("donateButton")}
                    </Button>
                  </a>
                ) : (
                  <div className="mt-4">
                    <div className="mx-auto h-32 w-32 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="text-sm text-muted dark:text-muted-dark">QR Code</span>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Transparency */}
      <Section className="bg-black/[0.02] dark:bg-white/[0.02]">
        <SectionHeader>
          <SectionTitle>{t("transparency")}</SectionTitle>
          <SectionDescription>Every contribution is tracked and reported</SectionDescription>
        </SectionHeader>
        <Card className="mx-auto max-w-2xl text-center">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-primary">$250K+</div>
              <p className="mt-1 text-sm text-muted dark:text-muted-dark">Total Raised</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">1,200+</div>
              <p className="mt-1 text-sm text-muted dark:text-muted-dark">Supporters</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">96%</div>
              <p className="mt-1 text-sm text-muted dark:text-muted-dark">To Development</p>
            </div>
          </div>
        </Card>
      </Section>
    </>
  );
}
