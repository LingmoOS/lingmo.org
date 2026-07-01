"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Calendar, User, Tag } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { NewsCoverSvg } from "@/components/svg/NewsCoverSvg";

const posts = [
  { slug: "announcing-lingmo-os-1-0", title: "Announcing Lingmo OS 1.0 — A New Dawn for Linux", date: "2026-06-15", author: "Lingmo Team", tags: ["release", "announcement"], excerpt: "After years of development, we are thrilled to announce the first stable release of Lingmo OS." },
  { slug: "lingmo-desktop-deep-dive", title: "Lingmo Desktop: A Deep Dive into Our Custom Desktop Environment", date: "2026-06-20", author: "Lingmo Team", tags: ["desktop", "technology"], excerpt: "Explore the architecture and design philosophy behind the Lingmo Desktop Environment." },
  { slug: "security-in-lingmo-os", title: "Security First: How Lingmo OS Protects Your Data", date: "2026-06-28", author: "Lingmo Team", tags: ["security", "privacy"], excerpt: "Learn about the security features built into Lingmo OS." },
  { slug: "wayland-journey", title: "Our Journey to Wayland: Why We Chose the Future of Display Servers", date: "2026-07-05", author: "Lingmo Team", tags: ["wayland", "technology"], excerpt: "Why Lingmo OS uses Wayland as the default display server." },
];

export default function BlogPage() {
  const t = useTranslations("blog");

  return (
    <>
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDescription")}
        breadcrumbs={[{ label: t("pageTitle") }]}
      />
      <Section>
        <div className="grid gap-8 md:grid-cols-2">
          {posts.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card hover={true} className="overflow-hidden p-0 h-full flex flex-col">
                <NewsCoverSvg title={post.title} />
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 text-xs text-muted dark:text-muted-dark">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{post.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted dark:text-muted-dark line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button variant="ghost" size="sm">
                      {t("readMore")}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>
    </>
  );
}
