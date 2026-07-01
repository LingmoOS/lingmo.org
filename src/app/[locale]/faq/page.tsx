"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/utils";

const faqs = [
  { question: "What is Lingmo OS?", answer: "Lingmo OS is a free and open-source Linux distribution designed for modern computing. It features a custom desktop environment built with GTK4, Wayland support, and a focus on performance, security, and user experience." },
  { question: "Is Lingmo OS free to use?", answer: "Yes, Lingmo OS is completely free and open-source software. You can download, install, share, and modify it without any cost." },
  { question: "What are the system requirements?", answer: "Minimum: 2GB RAM, 20GB storage, dual-core processor. Recommended: 8GB RAM, 64GB storage, quad-core processor." },
  { question: "How do I install Lingmo OS?", answer: "Download the ISO from our website, create a bootable USB drive using tools like Rufus or balenaEtcher, boot from the USB, and follow the installation wizard." },
  { question: "Does Lingmo OS support Windows applications?", answer: "Lingmo OS supports Windows applications through Wine and compatibility layers." },
  { question: "How often are updates released?", answer: "We follow a rolling release model with continuous updates. Stable releases occur every 6 months." },
  { question: "Can I contribute to Lingmo OS?", answer: "Absolutely! You can contribute code, documentation, translations, design, testing, or financial support." },
  { question: "What desktop environments are available?", answer: "Lingmo OS comes with our custom Lingmo Desktop Environment by default, but you can install others." },
  { question: "Does Lingmo OS have good privacy protections?", answer: "Yes, privacy is a core value. No telemetry by default, includes a firewall, supports full disk encryption." },
  { question: "How can I get help or support?", answer: "We offer documentation, community forums, IRC/Matrix chat, Discord server, and mailing lists." },
  { question: "Is Lingmo OS suitable for servers?", answer: "While primarily designed as a desktop OS, it can be used for servers." },
  { question: "What package manager does Lingmo OS use?", answer: "Lingmo OS uses APT as its primary package manager, compatible with Debian repositories." },
];

export default function FaqPage() {
  const t = useTranslations("faq");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDescription")}
        breadcrumbs={[{ label: t("pageTitle") }]}
      />

      <Section>
        {/* Search */}
        <div className="mx-auto mb-8 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted dark:text-muted-dark" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder") || "Search FAQ..."}
              className="w-full rounded-xl glass px-11 py-3 text-sm outline-none placeholder:text-muted dark:placeholder:text-muted-dark"
            />
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="mx-auto max-w-3xl space-y-3">
          {filtered.map((faq, i) => (
            <Card key={i} glass={false} hover={false} className="overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <span className="font-medium">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-muted dark:text-muted-dark transition-transform duration-200",
                    openIndex === i && "rotate-180"
                  )}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 text-sm text-muted dark:text-muted-dark leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="py-12 text-center text-muted dark:text-muted-dark">No results found</p>
          )}
        </div>
      </Section>
    </>
  );
}
