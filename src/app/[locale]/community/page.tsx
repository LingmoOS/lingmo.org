"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Github, MessageCircle, Send, QrCode, Mail, Globe, Users } from "lucide-react";
import { Section, SectionHeader, SectionTitle, SectionDescription } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";

const communities = [
  { icon: Github, title: "GitHub", description: "Contribute code, report issues, and star the project", href: "https://github.com/lingmo-os", key: "github" },
  { icon: MessageCircle, title: "Discord", description: "Chat with the community in real-time", href: "https://discord.gg/lingmo", key: "discord" },
  { icon: Globe, title: "Matrix", description: "Decentralized chat for open discussions", href: "https://matrix.to/#/#lingmo:matrix.org", key: "matrix" },
  { icon: Send, title: "Telegram", description: "Announcements and group discussions", href: "https://t.me/lingmo", key: "telegram" },
  { icon: QrCode, title: "QQ", description: "Chinese community on QQ", href: "#", key: "qq" },
  { icon: Mail, title: "Mailing List", description: "Developer and user mailing lists", href: "#", key: "mailingList" },
];

export default function CommunityPage() {
  const t = useTranslations("community");

  return (
    <>
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDescription")}
        breadcrumbs={[{ label: t("pageTitle") }]}
      />
      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {communities.map((item, i) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="h-full flex flex-col">
                <item.icon className="h-10 w-10 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted dark:text-muted-dark">{item.description}</p>
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="mt-4 block">
                  <Button variant="glass" className="w-full">
                    {item.title === "QQ" ? t("joinQQ") : 
                     item.title === "Mailing List" ? t("mailingList") :
                     `Join ${item.title}`}
                  </Button>
                </a>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Contribution Stats */}
      <Section className="bg-black/[0.02] dark:bg-white/[0.02]">
        <SectionHeader>
          <SectionTitle>Community Impact</SectionTitle>
          <SectionDescription>Together we build something amazing</SectionDescription>
        </SectionHeader>
        <div className="grid gap-8 text-center sm:grid-cols-3">
          {[
            { value: "500+", label: "Contributors" },
            { value: "50K+", label: "Commits" },
            { value: "1M+", label: "Downloads" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-5xl font-bold text-primary">{stat.value}</div>
              <p className="mt-2 text-muted dark:text-muted-dark">{stat.label}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
