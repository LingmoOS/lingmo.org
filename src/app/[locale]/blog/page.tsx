"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, User, Tag } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Link } from "@/i18n/navigation";
import { NewsCoverSvg } from "@/components/svg/NewsCoverSvg";
import type { BlogPost } from "@/types";

export default function BlogPage() {
  const t = useTranslations("blog");
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetch("/content/blog.json")
      .then((r) => r.json() as Promise<BlogPost[]>)
      .then(setPosts)
      .catch(() => {});
  }, []);

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
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="ghost" size="sm">
                        {t("readMore")}
                      </Button>
                    </Link>
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
