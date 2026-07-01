"use client";

import { useTranslations } from "next-intl";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export default function PrivacyPage() {
  const t = useTranslations("privacy");

  return (
    <>
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDescription")}
        breadcrumbs={[{ label: t("pageTitle") }]}
      />
      <Section>
        <Card glass={false} className="prose prose-sm dark:prose-invert max-w-3xl mx-auto">
          <p className="text-sm text-muted dark:text-muted-dark">{t("lastUpdated")}: July 1, 2026</p>

          <h2>Information We Collect</h2>
          <p>Lingmo OS respects your privacy. We collect minimal information necessary to provide our services. When you download Lingmo OS, we may collect anonymous usage statistics such as download counts and geographic regions (at the country level) to improve our services.</p>

          <h2>How We Use Your Information</h2>
          <p>Any information collected is used solely for the purpose of improving Lingmo OS and understanding our user base. We do not sell, trade, or share your personal information with third parties.</p>

          <h2>Data Storage</h2>
          <p>Lingmo OS does not have telemetry enabled by default. Any data collection is opt-in, and you are in full control of what information, if any, is shared with us.</p>

          <h2>Cookies</h2>
          <p>Our website uses minimal cookies for essential functionality such as theme preferences and language selection. We do not use tracking cookies or third-party analytics.</p>

          <h2>Third-Party Services</h2>
          <p>Our website may link to third-party services such as GitHub, Discord, and PayPal. These services have their own privacy policies, and we encourage you to review them.</p>

          <h2>Contact</h2>
          <p>If you have questions about this privacy policy, please contact us at privacy@lingmo.org.</p>
        </Card>
      </Section>
    </>
  );
}
